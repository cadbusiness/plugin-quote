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
