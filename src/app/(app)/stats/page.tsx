import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { saveGaMeasurementId } from "@/app/(app)/crm-actions";
import { loadStatsDashboard, resolveRange } from "@/lib/stats/dashboard";
import { StatsView } from "@/components/stats/stats-view";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const { range: rangeParam } = await searchParams;
  const range = resolveRange(rangeParam);
  const supabase = await createClient();
  const stats = await loadStatsDashboard(supabase, ctx.organization.id, range);
  const admin = isAdminRole(ctx.role);

  return (
    <ListPanel>
      <ListToolbar>
        <form className="mr-auto flex gap-2">
          <select name="range" defaultValue={range} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
            <option value="day">Aujourd’hui</option>
            <option value="week">7 jours</option>
            <option value="month">30 jours</option>
          </select>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">Voir</button>
        </form>
        <a
          href={`/stats/export?range=${range}`}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
        >
          Rapport PDF
        </a>
        {admin ? (
          <form action={saveGaMeasurementId} className="hidden gap-2 lg:flex">
            <input
              name="ga_measurement_id"
              defaultValue={ctx.organization.ga_measurement_id ?? ""}
              placeholder="GA4"
              className="w-28 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            />
            <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">OK</button>
          </form>
        ) : null}
      </ListToolbar>
      <StatsView stats={stats} />
    </ListPanel>
  );
}
