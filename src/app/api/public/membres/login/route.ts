import { NextResponse } from "next/server";
import { loginMemberWithPin } from "@/lib/members/session";
import { loadPublicMemberSpace } from "@/lib/members/public";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    orgSlug?: string;
    spaceSlug?: string;
    email?: string;
    pin?: string;
  };
  const orgSlug = String(body.orgSlug ?? "").trim();
  const spaceSlug = String(body.spaceSlug ?? "").trim();
  const space = await loadPublicMemberSpace(orgSlug, spaceSlug);
  if (!space) return NextResponse.json({ error: "Espace introuvable" }, { status: 404 });
  const result = await loginMemberWithPin({
    organizationId: space.organizationId,
    spaceId: space.spaceId,
    email: String(body.email ?? ""),
    pin: String(body.pin ?? ""),
  });
  if (!result.ok) return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
