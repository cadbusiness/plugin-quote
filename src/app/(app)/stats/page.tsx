import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { ListPanel } from "@/components/ui/list-panel";
import { loadStatsDashboard, resolveRange } from "@/lib/stats/dashboard";
import { parseOrgGtm } from "@/lib/funnels/tracking";
import { STATS_TABS, resolveVisibleStatsTab } from "@/lib/stats/tabs";
import { StatsScreen } from "@/components/stats/stats-screen";

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
  const tab = resolveVisibleStatsTab(query.tab, admin);
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
      <StatsScreen
        stats={stats}
        initialTab={tab}
        range={range}
        action={action}
        tabs={tabs}
        ga={ctx.organization.ga_measurement_id ?? ""}
        gtm={parseOrgGtm(ctx.organization.branding)}
        error={query.error}
      />
    </ListPanel>
  );
}
