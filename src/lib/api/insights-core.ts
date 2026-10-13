import { campaignKey, campaignsMatch, costPer, microsToEur, rate } from "@/lib/ads/roi";
import { classifySource } from "@/lib/stats/attribution";

/** Pure aggregations behind the MCP / REST insight tools (Google Ads, attribution, uploads). */

export const MAX_PERIOD_DAYS = 366;

export type PeriodInput = { days?: number; from?: string; to?: string };

export type ResolvedPeriod = {
  start: Date;
  end: Date;
  fromDate: string;
  toDate: string;
  days: number;
};

const DAY_MS = 86_400_000;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function parseDay(value: string | undefined, endOfDay: boolean) {
  if (!value) return null;
  if (!ISO_DAY.test(value)) throw new Error(`Date invalide « ${value} » : format YYYY-MM-DD attendu`);
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Date invalide « ${value} »`);
  return date;
}

/** `from`/`to` (YYYY-MM-DD, UTC) win over `days`; default = 30 last days. */
export function resolvePeriod(input: PeriodInput, now = new Date()): ResolvedPeriod {
  const explicitEnd = parseDay(input.to, true);
  const explicitStart = parseDay(input.from, false);
  const end = explicitEnd ?? now;
  let start: Date;
  if (explicitStart) {
    start = explicitStart;
  } else {
    const days = Math.min(Math.max(Math.floor(input.days ?? 30), 1), MAX_PERIOD_DAYS);
    start = new Date(end.getTime() - days * DAY_MS);
  }
  if (start.getTime() > end.getTime()) throw new Error("La date de début est après la date de fin");
  if (end.getTime() - start.getTime() > MAX_PERIOD_DAYS * DAY_MS) {
    throw new Error(`Période limitée à ${MAX_PERIOD_DAYS} jours`);
  }
  return {
    start,
    end,
    fromDate: start.toISOString().slice(0, 10),
    toDate: end.toISOString().slice(0, 10),
    days: Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS)),
  };
}

export function round2(value: number | null) {
  return value == null ? null : Math.round(value * 100) / 100;
}

function itemValue(priceMin: number | null, priceMax: number | null, quantity: number | null) {
  const unit = priceMin != null && priceMax != null ? (priceMin + priceMax) / 2 : (priceMin ?? priceMax);
  if (unit == null) return 0;
  return unit * (quantity || 1);
}

export type QuoteItemPrice = {
  quote_id: string;
  price_min: number | null;
  price_max: number | null;
  quantity: number | null;
};

/**
 * Value of a quote from its lines. Unpriced quotes get the average of priced quotes
 * of the same set, so `estimated` stays honest about it.
 */
export function quoteValueResolver(items: QuoteItemPrice[]) {
  const exact = new Map<string, number>();
  for (const item of items) {
    exact.set(item.quote_id, (exact.get(item.quote_id) ?? 0) + itemValue(item.price_min, item.price_max, item.quantity));
  }
  const priced = [...exact.values()].filter((v) => v > 0);
  const average = priced.length ? priced.reduce((a, b) => a + b, 0) / priced.length : 0;
  return {
    average,
    isPriced: (quoteId: string) => (exact.get(quoteId) ?? 0) > 0,
    valueOf: (quoteId: string) => {
      const value = exact.get(quoteId) ?? 0;
      return value > 0 ? value : average;
    },
  };
}

export type InsightQuote = {
  id: string;
  created_at: string;
  slug: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
};

export function hasClickId(quote: Pick<InsightQuote, "gclid" | "gbraid" | "wbraid">) {
  return Boolean(quote.gclid || quote.gbraid || quote.wbraid);
}

export function sourceOf(quote: InsightQuote) {
  return classifySource({
    utmSource: quote.utm_source,
    utmMedium: quote.utm_medium,
    referrer: quote.referrer,
    gclid: quote.gclid,
    gbraid: quote.gbraid,
    wbraid: quote.wbraid,
  });
}

export type AdsDayRow = {
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  cost_micros: number;
};

export type AdsCampaignPerformance = {
  campaign: string;
  campaign_id: string | null;
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number | null;
  cpc: number | null;
  quotes: number;
  won: number;
  lost: number;
  click_to_quote_rate: number | null;
  win_rate: number | null;
  cost_per_quote: number | null;
  cost_per_won: number | null;
  pipeline_estimate: number;
  won_value_estimate: number;
  roas_estimate: number | null;
};

function performanceRow(input: {
  campaign: string;
  campaignId: string | null;
  spend: number;
  clicks: number;
  impressions: number;
  quotes: InsightQuote[];
  valueOf: (id: string) => number;
}): AdsCampaignPerformance {
  const won = input.quotes.filter((q) => q.slug === "won");
  const lost = input.quotes.filter((q) => q.slug === "lost").length;
  const pipeline = input.quotes.reduce((sum, q) => sum + input.valueOf(q.id), 0);
  const wonValue = won.reduce((sum, q) => sum + input.valueOf(q.id), 0);
  return {
    campaign: input.campaign,
    campaign_id: input.campaignId,
    spend: round2(input.spend) ?? 0,
    clicks: input.clicks,
    impressions: input.impressions,
    ctr: round2(rate(input.clicks, input.impressions)),
    cpc: round2(costPer(input.spend, input.clicks)),
    quotes: input.quotes.length,
    won: won.length,
    lost,
    click_to_quote_rate: round2(rate(input.quotes.length, input.clicks)),
    win_rate: round2(rate(won.length, input.quotes.length)),
    cost_per_quote: round2(costPer(input.spend, input.quotes.length)),
    cost_per_won: round2(costPer(input.spend, won.length)),
    pipeline_estimate: round2(pipeline) ?? 0,
    won_value_estimate: round2(wonValue) ?? 0,
    roas_estimate: input.spend > 0 ? round2(wonValue / input.spend) : null,
  };
}

/**
 * Spend (Google Ads daily snapshots) joined to quotes by utm_campaign ↔ campaign name / id,
 * same matching as the acquisition dashboard. Ads quotes matching no campaign are reported apart.
 */
export function aggregateAdsPerformance(input: {
  adsRows: AdsDayRow[];
  quotes: InsightQuote[];
  valueOf: (id: string) => number;
}) {
  const byCampaign = new Map<string, { id: string; name: string; spend: number; clicks: number; impressions: number }>();
  for (const row of input.adsRows) {
    const key = campaignKey(row.campaign_name) || campaignKey(row.campaign_id);
    const current = byCampaign.get(key) ?? { id: row.campaign_id, name: row.campaign_name, spend: 0, clicks: 0, impressions: 0 };
    current.spend += microsToEur(row.cost_micros);
    current.clicks += row.clicks;
    current.impressions += row.impressions;
    byCampaign.set(key, current);
  }
  const campaigns = [...byCampaign.values()];
  const adsQuotes = input.quotes.filter((q) => sourceOf(q) === "Google Ads");
  const matched = new Map<string, InsightQuote[]>();
  const unmatched: InsightQuote[] = [];
  for (const quote of adsQuotes) {
    const hit = campaigns.find((row) => campaignsMatch(quote.utm_campaign, row.name, row.id));
    if (!hit) {
      unmatched.push(quote);
      continue;
    }
    const list = matched.get(hit.id) ?? [];
    list.push(quote);
    matched.set(hit.id, list);
  }

  const rows = campaigns
    .map((row) =>
      performanceRow({
        campaign: row.name,
        campaignId: row.id,
        spend: row.spend,
        clicks: row.clicks,
        impressions: row.impressions,
        quotes: matched.get(row.id) ?? [],
        valueOf: input.valueOf,
      }),
    )
    .sort((a, b) => b.spend - a.spend || b.quotes - a.quotes);

  const totalSpend = campaigns.reduce((sum, row) => sum + row.spend, 0);
  const totals = performanceRow({
    campaign: "Total Google Ads",
    campaignId: null,
    spend: totalSpend,
    clicks: campaigns.reduce((sum, row) => sum + row.clicks, 0),
    impressions: campaigns.reduce((sum, row) => sum + row.impressions, 0),
    quotes: adsQuotes,
    valueOf: input.valueOf,
  });

  const unmatchedByUtm = new Map<string, number>();
  for (const quote of unmatched) {
    const label = quote.utm_campaign?.trim() || "(sans utm_campaign)";
    unmatchedByUtm.set(label, (unmatchedByUtm.get(label) ?? 0) + 1);
  }

  return {
    campaigns: rows,
    totals,
    unmatched_ads_quotes: {
      count: unmatched.length,
      won: unmatched.filter((q) => q.slug === "won").length,
      by_utm_campaign: [...unmatchedByUtm.entries()]
        .map(([utm_campaign, quotes]) => ({ utm_campaign, quotes }))
        .sort((a, b) => b.quotes - a.quotes)
        .slice(0, 20),
    },
  };
}

export const ATTRIBUTION_GROUPS = ["source", "source_medium", "campaign", "full"] as const;
export type AttributionGroupBy = (typeof ATTRIBUTION_GROUPS)[number];

export function attributionBreakdown(input: {
  quotes: InsightQuote[];
  groupBy: AttributionGroupBy;
  valueOf: (id: string) => number;
  limit?: number;
}) {
  type Bucket = {
    channel: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    quotes: InsightQuote[];
  };
  const buckets = new Map<string, Bucket>();
  const clean = (value: string | null) => value?.trim() || null;
  for (const quote of input.quotes) {
    const channel = sourceOf(quote);
    const src = clean(quote.utm_source);
    const medium = clean(quote.utm_medium);
    const campaign = clean(quote.utm_campaign);
    const parts =
      input.groupBy === "source"
        ? [channel]
        : input.groupBy === "source_medium"
          ? [channel, src, medium]
          : input.groupBy === "campaign"
            ? [channel, campaign]
            : [channel, src, medium, campaign];
    const key = parts.map((p) => (p ?? "").toLowerCase()).join("|");
    const bucket = buckets.get(key) ?? {
      channel,
      utm_source: input.groupBy === "source_medium" || input.groupBy === "full" ? src : null,
      utm_medium: input.groupBy === "source_medium" || input.groupBy === "full" ? medium : null,
      utm_campaign: input.groupBy === "campaign" || input.groupBy === "full" ? campaign : null,
      quotes: [],
    };
    bucket.quotes.push(quote);
    buckets.set(key, bucket);
  }

  const total = input.quotes.length;
  const rows = [...buckets.values()]
    .map((bucket) => {
      const won = bucket.quotes.filter((q) => q.slug === "won");
      const withClickId = bucket.quotes.filter(hasClickId).length;
      return {
        channel: bucket.channel,
        utm_source: bucket.utm_source,
        utm_medium: bucket.utm_medium,
        utm_campaign: bucket.utm_campaign,
        quotes: bucket.quotes.length,
        share_of_quotes: round2(rate(bucket.quotes.length, total)),
        won: won.length,
        lost: bucket.quotes.filter((q) => q.slug === "lost").length,
        win_rate: round2(rate(won.length, bucket.quotes.length)),
        revenue_estimate: round2(bucket.quotes.reduce((sum, q) => sum + input.valueOf(q.id), 0)) ?? 0,
        won_value_estimate: round2(won.reduce((sum, q) => sum + input.valueOf(q.id), 0)) ?? 0,
        with_gclid: withClickId,
        gclid_share: round2(rate(withClickId, bucket.quotes.length)),
      };
    })
    .sort((a, b) => b.quotes - a.quotes || b.won - a.won);

  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);
  const withClickId = input.quotes.filter(hasClickId).length;
  const noUtm = input.quotes.filter((q) => !clean(q.utm_source) && !clean(q.utm_campaign) && !hasClickId(q)).length;
  return {
    group_by: input.groupBy,
    totals: {
      quotes: total,
      won: input.quotes.filter((q) => q.slug === "won").length,
      revenue_estimate: round2(input.quotes.reduce((sum, q) => sum + input.valueOf(q.id), 0)) ?? 0,
      with_gclid: withClickId,
      gclid_share: round2(rate(withClickId, total)),
      without_tracking: noUtm,
      without_tracking_share: round2(rate(noUtm, total)),
    },
    rows: rows.slice(0, limit),
    truncated: rows.length > limit,
  };
}

export type ConversionUploadRow = {
  quote_id: string;
  kind: string;
  status: string;
  error: string | null;
  gclid: string | null;
  created_at: string;
  uploaded_at: string | null;
};

const UPLOAD_STATUSES = ["uploaded", "skipped", "error", "pending"] as const;

export function summarizeConversionUploads(rows: ConversionUploadRow[], recentLimit = 15) {
  const byStatus: Record<string, number> = Object.fromEntries(UPLOAD_STATUSES.map((s) => [s, 0]));
  const byKind: Record<string, Record<string, number>> = {};
  const reasons = new Map<string, { status: string; reason: string; count: number }>();
  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    const kind = (byKind[row.kind] ??= Object.fromEntries(UPLOAD_STATUSES.map((s) => [s, 0])));
    kind[row.status] = (kind[row.status] ?? 0) + 1;
    if (row.status === "skipped" || row.status === "error") {
      const reason = (row.error ?? "").trim().slice(0, 200) || "(sans motif)";
      const key = `${row.status}|${reason}`;
      const current = reasons.get(key) ?? { status: row.status, reason, count: 0 };
      current.count += 1;
      reasons.set(key, current);
    }
  }
  const attempted = (byStatus.uploaded ?? 0) + (byStatus.error ?? 0);
  return {
    total: rows.length,
    by_status: byStatus,
    by_kind: byKind,
    upload_success_rate: round2(rate(byStatus.uploaded ?? 0, attempted)),
    reasons: [...reasons.values()].sort((a, b) => b.count - a.count).slice(0, 20),
    recent_errors: rows
      .filter((row) => row.status === "error")
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, recentLimit)
      .map((row) => ({
        quote_id: row.quote_id,
        kind: row.kind,
        error: row.error,
        has_gclid: Boolean(row.gclid),
        created_at: row.created_at,
      })),
  };
}

/** One actionable line per known failure mode, for the assistant to relay. */
export function conversionUploadHints(input: {
  connected: boolean;
  connectionStatus: string | null;
  summary: ReturnType<typeof summarizeConversionUploads>;
  adsQuotes: number;
  adsQuotesWithClickId: number;
}) {
  const hints: string[] = [];
  if (!input.connected) {
    hints.push("Google Ads n’est pas connecté : aucune conversion ne peut être envoyée (Acquisition → Connecter Google Ads).");
  } else if (input.connectionStatus === "error") {
    hints.push("La connexion Google Ads est en erreur : reconnecter le compte depuis Acquisition.");
  }
  const skippedNoClick = input.summary.reasons
    .filter((r) => r.status === "skipped" && /gclid/i.test(r.reason))
    .reduce((sum, r) => sum + r.count, 0);
  if (skippedNoClick > 0) {
    hints.push(
      `${skippedNoClick} conversion(s) ignorée(s) faute de gclid : vérifier l’auto-tagging Google Ads et que le gclid traverse jusqu’au formulaire de devis.`,
    );
  }
  if ((input.summary.by_status.error ?? 0) > 0) {
    hints.push("Des envois sont en erreur : voir recent_errors (action de conversion, compte client, délai de 90 jours après le clic).");
  }
  if (input.adsQuotes > 0 && input.adsQuotesWithClickId < input.adsQuotes) {
    hints.push(
      `${input.adsQuotes - input.adsQuotesWithClickId} devis Google Ads (détectés par utm) sans gclid / gbraid / wbraid : ils ne remonteront pas dans Google Ads.`,
    );
  }
  return hints;
}

/** `?days=&from=&to=` of a REST call. */
export function periodFromSearchParams(params: URLSearchParams): PeriodInput {
  const days = params.get("days");
  const parsed = days != null && days !== "" ? Number(days) : undefined;
  if (parsed !== undefined && (!Number.isInteger(parsed) || parsed < 1)) throw new Error("days invalide");
  return {
    days: parsed,
    from: params.get("from") || undefined,
    to: params.get("to") || undefined,
  };
}
