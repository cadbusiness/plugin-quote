import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { encodeShopAgentSse } from "@/lib/shops/agent/events";
import { ensureSeedTurnPublished } from "@/lib/shops/agent/executor";
import { runShopAgentTurn } from "@/lib/shops/agent/loop";
import { parseShopAgentSelection } from "@/lib/shops/agent/selection";
import { applyEditorDraft, serializeEditorDraft, type ShopEditorDraft } from "@/lib/shops/draft";
import { loadShopDocument, persistShopDocument } from "@/lib/shops/document";
import { shopBasePath } from "@/lib/shops/urls";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 120;

const schema = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(24)
    .optional(),
  draft: z.unknown().optional(),
  selection: z.unknown().optional(),
  seed: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx || !isAdminRole(ctx.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Message invalide" }, { status: 400 });
  }

  const supabase = await createClient();
  const doc = await loadShopDocument(supabase, ctx.organization.id, id);
  if (!doc) {
    return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
  }

  if (parsed.data.draft && typeof parsed.data.draft === "object") {
    applyEditorDraft(doc, parsed.data.draft as ShopEditorDraft);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: Parameters<typeof encodeShopAgentSse>[0]) => {
        controller.enqueue(encoder.encode(encodeShopAgentSse(event)));
      };
      try {
        const history = parsed.data.history ?? [];
        const turn = await runShopAgentTurn({
          doc,
          orgName: ctx.organization.name,
          history,
          userMessage: parsed.data.message,
          selection: parseShopAgentSelection(parsed.data.selection),
          seed: parsed.data.seed,
          imageUrl: parsed.data.imageUrl,
          signal: req.signal,
          onEvent: emit,
        });
        ensureSeedTurnPublished(doc, Boolean(parsed.data.seed));
        await persistShopDocument(supabase, ctx.organization.id, doc);
        const publicPath = shopBasePath(ctx.organization.slug, doc.shop.slug);
        revalidatePath("/integrations");
        revalidatePath(`/integrations/shop/${id}`);
        revalidatePath(publicPath);
        revalidatePath(publicPath, "layout");
        emit({
          type: "done",
          text: turn.assistantText,
          draft: serializeEditorDraft(doc),
          nodeId: turn.nodeId,
          pageSlug: turn.pageSlug,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          emit({ type: "error", error: "Arrêté." });
        } else {
          const message = error instanceof Error ? error.message : "Erreur agent";
          emit({ type: "error", error: message });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}
