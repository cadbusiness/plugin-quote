import { NextResponse } from "next/server";
import { isMemberLoginEmail } from "@/lib/members/email";
import { loginMemberWithPin } from "@/lib/members/session";
import { loadPublicMemberSpace } from "@/lib/members/public";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  const limited = rateLimit(`membres:login:${clientIp(req)}`, 10, 60000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const body = (await req.json().catch(() => ({}))) as {
    orgSlug?: string;
    spaceSlug?: string;
    email?: string;
    pin?: string;
  };
  const email = String(body.email ?? "").trim();
  const pin = String(body.pin ?? "").trim();
  if (!/^\d{6}$/.test(pin) || !isMemberLoginEmail(email)) {
    return NextResponse.json({ error: "Email ou code invalide" }, { status: 400 });
  }
  const perEmail = rateLimit(`membres:login:email:${email.toLowerCase()}`, 10, 60000);
  if (!perEmail.ok) return rateLimitResponse(perEmail.retryAfterSec);

  const orgSlug = String(body.orgSlug ?? "").trim();
  const spaceSlug = String(body.spaceSlug ?? "").trim();
  const space = await loadPublicMemberSpace(orgSlug, spaceSlug);
  if (!space) return NextResponse.json({ error: "Espace introuvable" }, { status: 404 });
  const result = await loginMemberWithPin({
    organizationId: space.organizationId,
    spaceId: space.spaceId,
    email,
    pin,
  });
  if (!result.ok) return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
