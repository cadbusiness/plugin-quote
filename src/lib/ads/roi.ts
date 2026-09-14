export function microsToEur(micros: number) {
  return micros / 1_000_000;
}

export function costPer(spend: number, count: number) {
  if (!count || spend <= 0) return null;
  return spend / count;
}

export function rate(part: number, total: number) {
  if (!total) return null;
  return (part / total) * 100;
}

/** Clé de matching UTM ↔ nom de campagne Google Ads. */
export function campaignKey(value: string | null | undefined) {
  const raw = (value ?? "").trim().toLowerCase();
  if (!raw) return "";
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function campaignsMatch(utmCampaign: string | null | undefined, adsName: string, adsId?: string | null) {
  const utm = campaignKey(utmCampaign);
  if (!utm) return false;
  if (adsId && utm === campaignKey(adsId)) return true;
  const ads = campaignKey(adsName);
  if (!ads) return false;
  return utm === ads || utm.includes(ads) || ads.includes(utm);
}

export function pickAdsSpend(
  utmCampaign: string | null | undefined,
  rows: { campaignId: string; campaignName: string; spend: number }[],
) {
  const exact = rows.find((row) => campaignsMatch(utmCampaign, row.campaignName, row.campaignId));
  return exact?.spend ?? 0;
}

export type ClosedLoop = {
  visitors: number;
  quotes: number;
  contacted: number;
  won: number;
  pipeline: number;
  wonValue: number;
  spend: number;
  conversion: number | null;
  winRate: number | null;
  costPerQuote: number | null;
  costPerWon: number | null;
};

export function closedLoop(input: {
  visitors: number;
  quotes: number;
  contacted: number;
  won: number;
  pipeline: number;
  wonValue: number;
  spend: number;
}): ClosedLoop {
  return {
    ...input,
    conversion: rate(input.quotes, input.visitors),
    winRate: rate(input.won, input.quotes),
    costPerQuote: costPer(input.spend, input.quotes),
    costPerWon: costPer(input.spend, input.won),
  };
}

export function adsDisconnectedCopy(campaignCount: number) {
  const detail =
    campaignCount === 0
      ? "Sans Ads, il manque la dépense : sans elle, aucun chiffre peut être calculé."
      : campaignCount === 1
        ? "Votre campagne est déjà là. Sans Ads, il manque la dépense : sans elle, aucun chiffre peut être calculé."
        : `Vos ${campaignCount} campagnes sont déjà là. Sans Ads, il manque la dépense : sans elle, aucun chiffre peut être calculé.`;
  return {
    title: "Branchez le compte pour voir ce que coûte un devis, et ce que coûte un client",
    detail,
  };
}

export function adsConversionCaption(quotes: number, visitors: number) {
  if (!quotes || !visitors) return "à mesurer pour l’instant";
  return `${quotes} devis pour ${visitors} visité${visitors > 1 ? "s" : ""}`;
}

export function adsCampaignStatus(quotes: number, visitors: number) {
  if (quotes > 0 || visitors > 0) return { label: "Diffusion en cours", tone: "emerald" as const };
  return { label: "En attente de clics", tone: "slate" as const };
}

export type AdsBudgetInsight = {
  extra: number;
  high: string;
  low: string;
  weakerBudget: boolean;
};

export function adsBudgetInsight(
  rows: { campaign: string; spend: number; costPerWon: number | null }[],
): AdsBudgetInsight | null {
  const ranked = rows
    .filter((row) => row.costPerWon != null)
    .sort((a, b) => (b.costPerWon ?? 0) - (a.costPerWon ?? 0));
  if (ranked.length < 2) return null;
  const high = ranked[0];
  const low = ranked[ranked.length - 1];
  if (!high?.costPerWon || !low?.costPerWon || high.campaign === low.campaign) return null;
  const extra = Math.round(high.costPerWon - low.costPerWon);
  if (extra <= 0) return null;
  return {
    extra,
    high: high.campaign,
    low: low.campaign,
    weakerBudget: high.spend > 0 && low.spend > 0 && high.spend < low.spend,
  };
}

export function adsInsightCopy(insight: AdsBudgetInsight) {
  const weaker = insight.weakerBudget ? " — pour un budget plus faible" : "";
  return `« ${insight.high} » coûte ${insight.extra} € de plus par client que « ${insight.low} »${weaker}.`;
}

export function rankAdsCampaigns<
  T extends { costPerWon: number | null; spend: number; quotes: number; visitors: number },
>(rows: T[], connected: boolean): T[] {
  return [...rows].sort((a, b) => {
    if (connected) {
      if (a.costPerWon != null && b.costPerWon != null) return a.costPerWon - b.costPerWon;
      if (a.costPerWon != null) return -1;
      if (b.costPerWon != null) return 1;
      return b.spend - a.spend || b.quotes - a.quotes;
    }
    return b.quotes - a.quotes || b.visitors - a.visitors;
  });
}
