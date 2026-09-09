import { createServiceClient } from "@/lib/supabase/service";
import { loadStatsDashboard, type StatsRange } from "@/lib/stats/dashboard";

export type StatsPeriod = "today" | "week" | "month" | "custom";

export type GetStatsInput = {
  period: StatsPeriod;
  from?: string;
  to?: string;
  funnel_id?: string;
};

function mapPeriod(period: StatsPeriod): StatsRange {
  if (period === "today") return "day";
  if (period === "week") return "week";
  return "month";
}

export async function apiGetStats(organizationId: string, input: GetStatsInput) {
  const supabase = createServiceClient();
  const range = mapPeriod(input.period);
  const dashboard = await loadStatsDashboard(supabase, organizationId, range, input.funnel_id);

  // custom from/to : on filtre les devis de la fenêtre demandée pour les compteurs score
  let scoreFilterStart: Date | null = null;
  let scoreFilterEnd: Date | null = null;
  if (input.period === "custom") {
    if (input.from) scoreFilterStart = new Date(`${input.from}T00:00:00`);
    if (input.to) scoreFilterEnd = new Date(`${input.to}T23:59:59`);
  }

  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, score_label, created_at, status")
    .eq("organization_id", organizationId)
    .gte("created_at", scoreFilterStart?.toISOString() ?? new Date(Date.now() - 30 * 86400000).toISOString());

  const inWindow = (createdAt: string) => {
    const t = new Date(createdAt).getTime();
    if (scoreFilterStart && t < scoreFilterStart.getTime()) return false;
    if (scoreFilterEnd && t > scoreFilterEnd.getTime()) return false;
    if (!scoreFilterStart && !scoreFilterEnd) {
      const days = range === "day" ? 1 : range === "week" ? 7 : 30;
      return t >= Date.now() - days * 86400000;
    }
    return true;
  };

  const windowQuotes = (quotes ?? []).filter((q) => inWindow(q.created_at));
  const hot = windowQuotes.filter((q) => q.score_label === "hot").length;
  const warm = windowQuotes.filter((q) => q.score_label === "warm").length;
  const cold = windowQuotes.filter((q) => q.score_label === "cold").length;

  return {
    period: input.period,
    from: input.from ?? null,
    to: input.to ?? null,
    total_leads: dashboard.pulse.submitted,
    conversion_rate: dashboard.pulse.conversion,
    contact_rate: dashboard.pulse.contactRate,
    win_rate: dashboard.pulse.winRate,
    hot,
    warm,
    cold,
    abandons: dashboard.abandons.total,
    abandons_recoverable: dashboard.abandons.recoverable,
    ca_potentiel: dashboard.pipelineTotal,
    won_value: dashboard.wonValue,
    won_count: dashboard.wonCount,
    visitors: dashboard.pulse.visitors,
    contacted: dashboard.pulse.contacted,
    delay_hours: dashboard.pulse.delayHours,
    delay_label: dashboard.pulse.delayLabel,
    funnels: dashboard.funnels.map((funnel) => ({
      id: funnel.id,
      name: funnel.name,
      quotes: funnel.quotes,
      conversion: funnel.conversion,
      pipeline: funnel.pipeline,
      won: funnel.won,
    })),
  };
}
