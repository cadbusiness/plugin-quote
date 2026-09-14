import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { MemberDetailView } from "@/components/team/member-detail";
import { loadTeamMember } from "@/lib/crm/team-load";
import { parseTeamTab } from "@/lib/crm/team-tabs";

export default async function EquipeMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; sent?: string; error?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const member = await loadTeamMember(supabase, ctx.organization.id, id, ctx.userId);
  if (!member) notFound();
  return (
    <MemberDetailView
      member={member}
      actorRole={ctx.role}
      actorUserId={ctx.userId}
      tab={parseTeamTab(query.tab)}
      flash={query.sent ?? null}
      error={query.error ?? null}
    />
  );
}
