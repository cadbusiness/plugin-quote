import { notFound, redirect } from "next/navigation";
import { MemberSpaceEditor } from "@/components/members/member-space-editor";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { loadMemberSpaceDocument } from "@/lib/members/document";
import { pageFromRow, parseTheme, resourceFromRow } from "@/lib/members/parse";
import { memberSpaceAbsoluteUrl } from "@/lib/members/urls";
import { getAppUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function MemberSpaceEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const { id } = await params;
  const supabase = await createClient();
  const doc = await loadMemberSpaceDocument(supabase, ctx.organization.id, id);
  if (!doc) notFound();
  const publicUrl = memberSpaceAbsoluteUrl(getAppUrl(), ctx.organization.slug, doc.space.slug);

  return (
    <MemberSpaceEditor
      space={{
        id: doc.space.id,
        name: doc.space.name,
        slug: doc.space.slug,
        status: doc.space.status,
        theme: parseTheme(doc.space.theme),
      }}
      pages={doc.pages.map(pageFromRow)}
      resources={doc.resources.map(resourceFromRow)}
      publicUrl={publicUrl}
      orgSlug={ctx.organization.slug}
    />
  );
}
