export const FUNNEL_TABS = [
  { id: "parcours", label: "Parcours" },
  { id: "automations", label: "Automatisations" },
  { id: "lien", label: "Lien & embed" },
  { id: "suivi", label: "Suivi" },
] as const;

export type FunnelTab = (typeof FUNNEL_TABS)[number]["id"];

export function parseFunnelTab(value: string | undefined): FunnelTab {
  return FUNNEL_TABS.some((tab) => tab.id === value) ? (value as FunnelTab) : "parcours";
}
