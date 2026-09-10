import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/public/session";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

const schema = z.object({
  orgSlug: z.string().min(1),
  configuratorSlug: z.string().min(1),
  visitorId: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  referrer: z.string().optional(),
  landingPath: z.string().optional(),
});

export async function POST(req: Request) {
  const limited = rateLimit(`sessions:create:${clientIp(req)}`, 30, 60000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
  const session = await createSession(parsed.data.orgSlug, parsed.data.configuratorSlug, {
    visitorId: parsed.data.visitorId,
    utmSource: parsed.data.utmSource,
    utmMedium: parsed.data.utmMedium,
    utmCampaign: parsed.data.utmCampaign,
    utmContent: parsed.data.utmContent,
    utmTerm: parsed.data.utmTerm,
    referrer: parsed.data.referrer,
    landingPath: parsed.data.landingPath,
  });
  if (!session) {
    return NextResponse.json({ error: "Configurateur introuvable" }, { status: 404 });
  }
  return NextResponse.json(session);
}
