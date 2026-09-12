import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { parseChatLog } from "@/lib/shops/chat-store";
import { loadShopDocument, persistShopDocument } from "@/lib/shops/document";
import { parseTheme } from "@/lib/shops/parse";
import { asJson } from "@/lib/shops/types";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  messages: z.array(z.unknown()).max(40),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx || !isAdminRole(ctx.role)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Fil invalide" }, { status: 400 });

  const supabase = await createClient();
  const doc = await loadShopDocument(supabase, ctx.organization.id, id);
  if (!doc) return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
  const theme = parseTheme(doc.shop.theme);
  theme.chatLog = parseChatLog(parsed.data.messages);
  doc.shop.theme = asJson(theme);
  await persistShopDocument(supabase, ctx.organization.id, doc);
  return NextResponse.json({ ok: true });
}
