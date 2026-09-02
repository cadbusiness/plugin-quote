import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { loadProspectByToken } from "@/lib/prospect/access";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const bundle = await loadProspectByToken(token);
  if (!bundle) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const content = String(body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "Message vide" }, { status: 400 });
  const supabase = createServiceClient();
  await supabase.from("prospect_messages").insert({
    organization_id: bundle.quote.organization_id,
    quote_id: bundle.quote.id,
    sender: "prospect",
    content,
  });
  return NextResponse.json({ ok: true });
}
