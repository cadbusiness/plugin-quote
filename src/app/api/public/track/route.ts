import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { resolvePublicConfigurator } from "@/lib/public/session";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";
import { attributionPayload, parseAttribution } from "@/lib/stats/attribution";

const ALLOWED = new Set<string>(Object.values(ANALYTICS_EVENTS));

const schema = z.object({
  orgSlug: z.string().min(1),
  configuratorSlug: z.string().min(1),
  eventType: z.string().min(1),
  visitorId: z.string().optional(),
  sessionId: z.string().optional(),
  step: z.number().optional(),
  search: z.string().optional(),
  referrer: z.string().optional(),
  landingPath: z.string().optional(),
});

function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "content-type");
  return res;
}

export function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return cors(NextResponse.json({ error: "Payload invalide" }, { status: 400 }));
  }
  if (!ALLOWED.has(parsed.data.eventType)) {
    return cors(NextResponse.json({ error: "Événement inconnu" }, { status: 400 }));
  }
  const resolved = await resolvePublicConfigurator(parsed.data.orgSlug, parsed.data.configuratorSlug);
  if (!resolved) {
    return cors(NextResponse.json({ error: "Configurateur introuvable" }, { status: 404 }));
  }
  const attribution = parseAttribution({
    search: parsed.data.search,
    referrer: parsed.data.referrer,
    landingPath: parsed.data.landingPath,
    visitorId: parsed.data.visitorId,
  });
  const supabase = createServiceClient();
  await supabase.from("analytics_events").insert({
    organization_id: resolved.organizationId,
    configurator_id: resolved.configuratorId,
    session_id: parsed.data.sessionId ?? null,
    visitor_id: attribution.visitorId,
    event_type: parsed.data.eventType,
    step: parsed.data.step ?? null,
    payload: attributionPayload(attribution),
  });
  return cors(NextResponse.json({ ok: true }));
}
