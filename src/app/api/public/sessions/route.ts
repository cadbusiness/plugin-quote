import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, createShopScopedSession } from "@/lib/public/session";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

const schema = z
  .object({
    orgSlug: z.string().min(1),
    configuratorSlug: z.string().min(1).optional(),
    configuratorId: z.string().min(1).optional(),
    shopSlug: z.string().min(1).optional(),
    visitorId: z.string().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmContent: z.string().optional(),
    utmTerm: z.string().optional(),
    referrer: z.string().optional(),
    landingPath: z.string().optional(),
  })
  .refine((value) => Boolean(value.shopSlug || value.configuratorSlug), {
    message: "configuratorSlug or shopSlug required",
  });

export async function POST(req: Request) {
  const limited = rateLimit(`sessions:create:${clientIp(req)}`, 30, 60000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const attribution = {
    visitorId: parsed.data.visitorId,
    utmSource: parsed.data.utmSource,
    utmMedium: parsed.data.utmMedium,
    utmCampaign: parsed.data.utmCampaign,
    utmContent: parsed.data.utmContent,
    utmTerm: parsed.data.utmTerm,
    referrer: parsed.data.referrer,
    landingPath: parsed.data.landingPath,
  };

  if (parsed.data.shopSlug) {
    const result = await createShopScopedSession({
      orgSlug: parsed.data.orgSlug,
      shopSlug: parsed.data.shopSlug,
      configuratorSlug: parsed.data.configuratorSlug,
      configuratorId: parsed.data.configuratorId,
      attribution,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.session);
  }

  const session = await createSession(parsed.data.orgSlug, parsed.data.configuratorSlug!, attribution);
  if (!session) {
    return NextResponse.json({ error: "Configurateur introuvable" }, { status: 404 });
  }
  return NextResponse.json(session);
}
