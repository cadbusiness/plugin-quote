import { NextResponse } from "next/server";
import { loadProspectByPin } from "@/lib/prospect/access";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  const limited = rateLimit(`suivi:pin:${clientIp(req)}`, 10, 60000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const body = await req.json().catch(() => ({}));
  const pin = String(body.pin ?? "").trim();
  const email = String(body.email ?? "").trim();
  if (!/^\d{6}$/.test(pin) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email ou code invalide" }, { status: 400 });
  }
  const perEmail = rateLimit(`suivi:pin:email:${email.toLowerCase()}`, 10, 60000);
  if (!perEmail.ok) return rateLimitResponse(perEmail.retryAfterSec);
  const bundle = await loadProspectByPin(email, pin);
  if (!bundle) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ token: bundle.token });
}
