import Link from "next/link";
import { redirect } from "next/navigation";
import { FileDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { loadStatsDashboard, resolveRange, type StatsRange } from "@/lib/stats/dashboard";
import { parseOrgGtm } from "@/lib/funnels/tracking";
import { parseStatsTab, statsHref, STATS_TABS } from "@/lib/stats/tabs";
import { StatsView } from "@/components/stats/stats-view";
import { StatsTrackingPanel } from "@/components/stats/tracking-panel";

const RANGES: { id: StatsRange; label: string }[] = [
  { id: "day", label: "Aujourd’hui" },
  { id: "week", label: "7 jours" },
  { id: "month", label: "30 jours" },
];

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; tab?: string; error?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const query = await searchParams;
  const range = resolveRange(query.range);
  const admin = isAdminRole(ctx.role);
  let tab = parseStatsTab(query.tab);
  if (tab === "suivi" && !admin) tab = "vue";
  const supabase = await createClient();
  const stats = await loadStatsDashboard(supabase, ctx.organization.id, range);
  const action =
    stats.pulse.waiting > 0
      ? { href: "/devis", label: `À rappeler ${stats.pulse.waiting}` }
      : stats.abandons.withEmail > 0
        ? { href: "/sessions", label: `Relancer ${stats.abandons.withEmail}` }
        : null;
  const tabs = STATS_TABS.filter((item) => !item.admin || admin);

  return (
    <ListPanel>
      <ListToolbar>
        <div className="mr-auto flex items-center gap-1">
          {RANGES.map((item) => {
            const active = item.id === range;
            return (
              <Link
                key={item.id}
                href={statsHref(tab, item.id)}
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
          className="inline-flex items-center gap-1.5 rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D45203]"
        >
          <FileDown className="h-4 w-4" strokeWidth={2} />
          Rapport PDF
        </a>
      </ListToolbar>

      <nav className="flex items-end gap-6 overflow-x-auto border-b border-slate-200 px-4 lg:px-6">
        {tabs.map((item) => {
          const on = item.id === tab;
          return (
            <Link
              key={item.id}
              href={statsHref(item.id, range)}
              aria-current={on ? "page" : undefined}
              className={`relative shrink-0 py-2.5 text-sm ${
                on ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {item.label}
              <span
                aria-hidden
                className={`absolute inset-x-0 -bottom-px h-0.5 ${on ? "bg-[#E85D04]" : "bg-transparent"}`}
              />
            </Link>
          );
        })}
      </nav>

      {tab === "suivi" ? (
        <StatsTrackingPanel
          ga={ctx.organization.ga_measurement_id ?? ""}
          gtm={parseOrgGtm(ctx.organization.branding)}
          error={query.error}
        />
      ) : (
        <StatsView stats={stats} tab={tab} />
      )}
    </ListPanel>
  );
}
