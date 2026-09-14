export const TEAM_TABS = [
  { id: "compte", label: "Compte" },
  { id: "acces", label: "Accès" },
  { id: "demandes", label: "Demandes" },
  { id: "journal", label: "Journal" },
] as const;

export type TeamTab = (typeof TEAM_TABS)[number]["id"];

export function parseTeamTab(value: string | undefined): TeamTab {
  return TEAM_TABS.some((tab) => tab.id === value) ? (value as TeamTab) : "compte";
}

export function teamMemberHref(id: string, tab?: TeamTab) {
  if (!tab || tab === "compte") return `/equipe/${id}`;
  return `/equipe/${id}?tab=${tab}`;
}
