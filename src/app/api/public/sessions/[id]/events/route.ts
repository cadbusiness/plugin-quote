import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.headers.get("x-session-token")?.trim() ?? "";
  const supabase = createServiceClient();
  const { data: session } = await supabase
    .from("quote_sessions")
    .select("*")
    .eq("id", id)
    .eq("token", token)
    .maybeSingle();
  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const eventType = String(body.eventType ?? "");
  if (!eventType) return NextResponse.json({ error: "eventType requis" }, { status: 400 });
  await supabase.from("analytics_events").insert({
    organization_id: session.organization_id,
    configurator_id: session.configurator_id,
    session_id: session.id,
    event_type: eventType,
    step: typeof body.step === "number" ? body.step : null,
  });
  return NextResponse.json({ ok: true });
}
