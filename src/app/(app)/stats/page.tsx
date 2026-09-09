import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { saveGaMeasurementId } from "@/app/(app)/crm-actions";
import { loadStatsDashboard, resolveRange, type StatsRange } from "@/lib/stats/dashboard";
import { StatsView } from "@/components/stats/stats-view";

const RANGES: { id: StatsRange; label: string }[] = [
  { id: "day", label: "Aujourd’hui" },
  { id: "week", label: "7 jours" },
  { id: "month", label: "30 jours" },
];

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
  const action =
    stats.pulse.waiting > 0
      ? { href: "/devis", label: `À rappeler ${stats.pulse.waiting}` }
      : stats.abandons.withEmail > 0
        ? { href: "/sessions", label: `Relancer ${stats.abandons.withEmail}` }
        : null;

  return (
    <ListPanel>
      <ListToolbar>
        <div className="mr-auto flex items-center gap-1">
          {RANGES.map((item) => {
            const active = item.id === range;
            return (
              <Link
                key={item.id}
                href={item.id === "month" ? "/stats" : `/stats?range=${item.id}`}
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm ${
                  active
                    ? "bg-orange-50 font-medium text-[#C2410C]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        {action ? (
          <Link href={action.href} className="text-sm font-medium text-[#E85D04] hover:underline">
            {action.label}
          </Link>
        ) : null}
        <a
          href={`/stats/export?range=${range}`}
          className="rounded-md border border-slate-200 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50"
        >
          PDF
        </a>
        {admin ? (
          <form action={saveGaMeasurementId} className="hidden items-center gap-1.5 lg:flex">
            <input
              name="ga_measurement_id"
              defaultValue={ctx.organization.ga_measurement_id ?? ""}
              placeholder="GA4"
              className="w-24 rounded-md border border-slate-200 px-2 py-1 text-sm"
            />
            <button className="text-sm text-slate-500">OK</button>
          </form>
        ) : null}
      </ListToolbar>
      <StatsView stats={stats} />
    </ListPanel>
  );
}
