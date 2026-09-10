import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { runShopAgentTurn } from "@/lib/shops/agent/loop";
import { applyEditorDraft, serializeEditorDraft, type ShopEditorDraft } from "@/lib/shops/draft";
import { loadShopDocument, persistShopDocument } from "@/lib/shops/document";
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
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx || !isAdminRole(ctx.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message invalide" }, { status: 400 });

  const supabase = await createClient();
  const doc = await loadShopDocument(supabase, ctx.organization.id, id);
  if (!doc) return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });

  if (parsed.data.draft && typeof parsed.data.draft === "object") {
    applyEditorDraft(doc, parsed.data.draft as ShopEditorDraft);
  }

  try {
    const turn = await runShopAgentTurn({
      doc,
      orgName: ctx.organization.name,
      history: parsed.data.history ?? [],
      userMessage: parsed.data.message,
    });
    await persistShopDocument(supabase, ctx.organization.id, doc);
    return NextResponse.json({ text: turn.assistantText, trace: turn.toolTrace, ...serializeEditorDraft(doc) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur agent";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
