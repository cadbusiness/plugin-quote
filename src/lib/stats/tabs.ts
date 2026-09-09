import type { StatsRange } from "@/lib/stats/dashboard";

export const STATS_TABS = [
  { id: "vue", label: "Vue", admin: false },
  { id: "funnels", label: "Funnels", admin: false },
  { id: "campagnes", label: "Campagnes", admin: false },
  { id: "pipeline", label: "Pipeline", admin: false },
  { id: "sources", label: "Sources", admin: false },
  { id: "suivi", label: "Suivi Google", admin: true },
] as const;

export type StatsTab = (typeof STATS_TABS)[number]["id"];

export function parseStatsTab(value: string | undefined): StatsTab {
  return STATS_TABS.some((tab) => tab.id === value) ? (value as StatsTab) : "vue";
}

export function statsHref(tab: StatsTab, range: StatsRange, funnelId?: string | null) {
  const query = new URLSearchParams();
  if (tab !== "vue") query.set("tab", tab);
  if (range !== "month") query.set("range", range);
  if (funnelId) query.set("funnel", funnelId);
  const suffix = query.toString();
  return suffix ? `/stats?${suffix}` : "/stats";
}
