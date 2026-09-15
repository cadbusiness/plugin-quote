import { NextResponse } from "next/server";
import { loadPublicMemberSpace } from "@/lib/members/public";
import { loginMemberWithProspectToken } from "@/lib/members/session";
import { memberSpaceBasePath } from "@/lib/members/urls";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orgSlug = url.searchParams.get("org")?.trim() ?? "";
  const spaceSlug = url.searchParams.get("space")?.trim() ?? "";
  const token = url.searchParams.get("token")?.trim() ?? "";
  const dest = new URL(memberSpaceBasePath(orgSlug, spaceSlug), url.origin);
  const space = await loadPublicMemberSpace(orgSlug, spaceSlug);
  if (!space || !token) return NextResponse.redirect(dest);
  const result = await loginMemberWithProspectToken({
    organizationId: space.organizationId,
    spaceId: space.spaceId,
    token,
  });
  if (!result.ok) return NextResponse.redirect(dest);
  return NextResponse.redirect(dest);
}
