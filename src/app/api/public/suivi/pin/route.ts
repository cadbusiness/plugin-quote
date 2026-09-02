import { NextResponse } from "next/server";
import { loadProspectByPin } from "@/lib/prospect/access";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const pin = String(body.pin ?? "").trim();
  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "PIN invalide" }, { status: 400 });
  }
  const bundle = await loadProspectByPin(pin);
  if (!bundle) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ token: bundle.token });
}
