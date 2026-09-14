import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { Chip } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { formatPercent, formatRelative } from "@/lib/format";
import {
  conversionRate,
  filterTeamMembers,
  memberListLabel,
  memberStatusLabel,
  memberStatusTone,
  roleLabel,
  roleTone,
  teamKpis,
} from "@/lib/crm/team";
import { loadTeamDirectory } from "@/lib/crm/team-load";

const FLASH: Record<string, string> = {
  revoked: "Invitation révoquée.",
};

export default async function EquipePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string; sent?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const filters = await searchParams;
  const supabase = await createClient();
  const directory = await loadTeamDirectory(supabase, ctx.organization.id, ctx.userId);
  const members = filterTeamMembers(directory.members, filters);
  const kpis = teamKpis(directory.members, directory.unassigned);

  return (
    <ListPanel>
      <div className="grid grid-cols-2 gap-px bg-slate-200 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="bg-white px-4 py-3.5 lg:px-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{kpi.value}</p>
            <p className="mt-1 text-xs text-slate-400">{kpi.hint}</p>
          </div>
        ))}
      </div>
      <ListToolbar>
        <form className="mr-auto flex flex-wrap items-center gap-2">
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Rechercher un email…"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          />
          <select name="role" defaultValue={filters.role ?? ""} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
            <option value="">Tous rôles</option>
            <option value="owner">Propriétaire</option>
            <option value="admin">Admin</option>
            <option value="sales">Commercial</option>
          </select>
          <select name="status" defaultValue={filters.status ?? ""} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
            <option value="">Tous statuts</option>
            <option value="active">Actif</option>
            <option value="pending">Invitation</option>
            <option value="disabled">Suspendu</option>
          </select>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">Filtrer</button>
        </form>
        <InviteMemberDialog />
      </ListToolbar>
      {filters.sent && FLASH[filters.sent] ? (
        <p className="border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 lg:px-6">
          {FLASH[filters.sent]}
        </p>
      ) : null}
      <DataTable headers={["Membre", "Demandes", "Gagnés", "Dernière activité"]}>
        {members.map((member) => {
          const last = member.lastActivityAt || member.lastSignInAt;
          return (
            <ClickableRow key={member.id} href={`/equipe/${member.id}`}>
              <td className="px-4 py-3.5 lg:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold tracking-tight text-slate-900">
                    {memberListLabel(member.email, member.role)}
                  </span>
                  <Chip tone={roleTone(member.role)}>{roleLabel(member.role)}</Chip>
                  <Chip tone={memberStatusTone(member.status)}>{memberStatusLabel(member.status)}</Chip>
                  {member.isYou ? <Chip tone="orange">Vous</Chip> : null}
                </div>
                {member.email && memberListLabel(member.email, member.role) !== member.email ? (
                  <p className="mt-0.5 text-sm text-slate-500">{member.email}</p>
                ) : null}
              </td>
              <td className="px-4 py-3.5 tabular-nums lg:px-6">
                {member.stats.assigned}
                {member.stats.open ? (
                  <span className="ml-1 text-xs text-slate-400">{member.stats.open} ouvertes</span>
                ) : null}
              </td>
              <td className="px-4 py-3.5 tabular-nums lg:px-6">
                {member.stats.won}
                <span className="ml-1 text-xs text-slate-400">{formatPercent(conversionRate(member.stats))}</span>
              </td>
              <td className="px-4 py-3.5 text-slate-500 lg:px-6">{last ? formatRelative(last) : "—"}</td>
            </ClickableRow>
          );
        })}
      </DataTable>
      {members.length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">Aucun membre pour ces filtres.</p>
      ) : null}
    </ListPanel>
  );
}
