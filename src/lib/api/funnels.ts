import { createServiceClient } from "@/lib/supabase/service";
import { loadStatsDashboard } from "@/lib/stats/dashboard";

export async function apiListFunnels(organizationId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("configurators")
    .select("id, name, slug, sector, is_active, wizard_enabled, chat_enabled, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((funnel) => ({
    id: funnel.id,
    name: funnel.name,
    slug: funnel.slug,
    sector: funnel.sector,
    is_active: funnel.is_active,
    modes: {
      wizard: funnel.wizard_enabled,
      chat: funnel.chat_enabled,
    },
    created_at: funnel.created_at,
  }));
}

export async function apiGetFunnelPerformance(organizationId: string, funnelId: string) {
  const supabase = createServiceClient();
  const { data: funnel } = await supabase
    .from("configurators")
    .select("id, name, slug, sector, is_active")
    .eq("id", funnelId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!funnel) return null;

  const dashboard = await loadStatsDashboard(supabase, organizationId, "month", funnelId);
  const row = dashboard.funnels.find((item) => item.id === funnelId);

  return {
    funnel: {
      id: funnel.id,
      name: funnel.name,
      slug: funnel.slug,
      sector: funnel.sector,
      is_active: funnel.is_active,
    },
    period: "month",
    visitors: row?.visitors ?? dashboard.pulse.visitors,
    quotes: row?.quotes ?? dashboard.pulse.submitted,
    conversion: row?.conversion ?? dashboard.pulse.conversion,
    contacted: row?.contacted ?? dashboard.pulse.contacted,
    won: row?.won ?? dashboard.pulse.won,
    pipeline: row?.pipeline ?? dashboard.pipelineTotal,
    won_value: row?.wonValue ?? dashboard.wonValue,
    cost_per_quote: row?.costPerQuote ?? null,
    cost_per_won: row?.costPerWon ?? null,
    spend: row?.spend ?? 0,
    funnel_steps: dashboard.funnel,
  };
}
