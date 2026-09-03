import Link from "next/link";
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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-100 px-4 py-2.5 text-sm text-slate-600 lg:px-6">
        <span className="text-slate-900">{stats.story.headline}</span>
        {stats.story.detail ? <span className="text-slate-500">{stats.story.detail}</span> : null}
        {stats.story.actionHref ? (
          <Link href={stats.story.actionHref} className="font-medium text-[#E85D04] hover:underline">
            {stats.story.actionLabel ?? "Voir"}
          </Link>
        ) : null}
      </div>
      <StatsView stats={stats} />
    </ListPanel>
  );
}
