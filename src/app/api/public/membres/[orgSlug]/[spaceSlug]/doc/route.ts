import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth/org";
import { MEMBER_DOCS_BUCKET, memberDocBelongsToSpace, memberDocStoragePath } from "@/lib/members/docs";
import { loadMemberSession } from "@/lib/members/session";
import { ensureMemberDocsPrivate } from "@/lib/members/upload";
import { createServiceClient } from "@/lib/supabase/service";

const SIGNED_URL_SECONDS = 60;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgSlug: string; spaceSlug: string }> },
) {
  const { orgSlug, spaceSlug } = await params;
  const storagePath = memberDocStoragePath(new URL(req.url).searchParams.get("path") ?? "");
  if (!storagePath) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const supabase = createServiceClient();
  const { data: org } = await supabase.from("organizations").select("id").eq("slug", orgSlug).maybeSingle();
  if (!org) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const { data: space } = await supabase
    .from("member_spaces")
    .select("id, organization_id")
    .eq("organization_id", org.id)
    .eq("slug", spaceSlug)
    .maybeSingle();
  if (!space || !memberDocBelongsToSpace(storagePath, space.organization_id, space.id)) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const staff = await getOrgContext();
  const staffOk = staff?.organization.id === space.organization_id;
  if (!staffOk) {
    const member = await loadMemberSession(space.id);
    if (!member || member.organizationId !== space.organization_id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
    }
    const { data: resources } = await supabase
      .from("member_space_resources")
      .select("href")
      .eq("space_id", space.id)
      .eq("organization_id", space.organization_id)
      .eq("is_published", true);
    const listed = (resources ?? []).some((row) => memberDocStoragePath(row.href) === storagePath);
    if (!listed) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  try {
    await ensureMemberDocsPrivate(supabase);
  } catch {
    // Migration 0069 still forces public = false if this process cannot update the bucket.
  }
  const { data, error } = await supabase.storage
    .from(MEMBER_DOCS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_SECONDS);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
