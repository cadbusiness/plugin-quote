import { createServiceClient } from "@/lib/supabase/service";
import {
  aggregateAdsPerformance,
  attributionBreakdown,
  conversionUploadHints,
  hasClickId,
  quoteValueResolver,
  resolvePeriod,
  sourceOf,
  summarizeConversionUploads,
  type AttributionGroupBy,
  type InsightQuote,
  type PeriodInput,
  type QuoteItemPrice,
} from "@/lib/api/insights-core";

type Service = ReturnType<typeof createServiceClient>;

const PAGE = 1000;
const MAX_ROWS = 20_000;
const IN_CHUNK = 200;

/** Every row of a paged select (PostgREST caps a page at 1000). */
async function selectAll<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const rows: T[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

function chunks<T>(list: T[], size = IN_CHUNK) {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/** Quotes of the period with utm / click ids, falling back on the session when the quote lacks them. */
async function loadInsightQuotes(supabase: Service, organizationId: string, start: Date, end: Date) {
  const [quotes, { data: statuses }] = await Promise.all([
    selectAll((from, to) =>
      supabase
        .from("quotes")
        .select("id, created_at, status, status_id, session_id, utm_source, utm_medium, utm_campaign, referrer, gclid, gbraid, wbraid")
        .eq("organization_id", organizationId)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true })
        .range(from, to),
    ),
    supabase.from("quote_statuses").select("id, slug").eq("organization_id", organizationId),
  ]);

  const slugById = new Map((statuses ?? []).map((s) => [s.id, s.slug]));
  const sessionIds = [...new Set(quotes.map((q) => q.session_id).filter((id): id is string => Boolean(id)))];
  const sessions = new Map<
    string,
    { utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; referrer: string | null; gclid: string | null; gbraid: string | null; wbraid: string | null }
  >();
  for (const ids of chunks(sessionIds)) {
    const { data } = await supabase
      .from("quote_sessions")
      .select("id, utm_source, utm_medium, utm_campaign, referrer, gclid, gbraid, wbraid")
      .eq("organization_id", organizationId)
      .in("id", ids);
    for (const row of data ?? []) sessions.set(row.id, row);
  }

  return quotes.map((quote): InsightQuote => {
    const session = quote.session_id ? sessions.get(quote.session_id) : undefined;
    return {
      id: quote.id,
      created_at: quote.created_at,
      slug: (quote.status_id && slugById.get(quote.status_id)) || quote.status,
      utm_source: quote.utm_source ?? session?.utm_source ?? null,
      utm_medium: quote.utm_medium ?? session?.utm_medium ?? null,
      utm_campaign: quote.utm_campaign ?? session?.utm_campaign ?? null,
      referrer: quote.referrer ?? session?.referrer ?? null,
      gclid: quote.gclid ?? session?.gclid ?? null,
      gbraid: quote.gbraid ?? session?.gbraid ?? null,
      wbraid: quote.wbraid ?? session?.wbraid ?? null,
    };
  });
}

async function loadQuoteValues(supabase: Service, organizationId: string, quoteIds: string[]) {
  const items: QuoteItemPrice[] = [];
  for (const ids of chunks(quoteIds)) {
    const { data } = await supabase
      .from("quote_items")
      .select("quote_id, price_min, price_max, quantity")
      .eq("organization_id", organizationId)
      .in("quote_id", ids);
    items.push(...(data ?? []));
  }
  return quoteValueResolver(items);
}

async function loadAdsConnection(supabase: Service, organizationId: string) {
  const { data } = await supabase
    .from("ads_connections")
    .select("status, customer_id, customer_name, last_sync_at, last_error")
    .eq("organization_id", organizationId)
    .eq("provider", "google_ads")
    .maybeSingle();
  return data;
}

function connectionView(connection: Awaited<ReturnType<typeof loadAdsConnection>>) {
  return {
    connected: Boolean(connection && (connection.status === "active" || connection.customer_name)),
    status: connection?.status ?? null,
    customer_name: connection?.customer_name ?? null,
    last_sync_at: connection?.last_sync_at ?? null,
    last_error: connection?.last_error ?? null,
  };
}

export async function apiGetAdsPerformance(organizationId: string, input: PeriodInput & { campaign?: string }) {
  const period = resolvePeriod(input);
  const supabase = createServiceClient();
  const [connection, adsRows, quotes] = await Promise.all([
    loadAdsConnection(supabase, organizationId),
    selectAll((from, to) =>
      supabase
        .from("ads_campaign_stats")
        .select("campaign_id, campaign_name, impressions, clicks, cost_micros")
        .eq("organization_id", organizationId)
        .gte("date", period.fromDate)
        .lte("date", period.toDate)
        .order("date", { ascending: true })
        .range(from, to),
    ),
    loadInsightQuotes(supabase, organizationId, period.start, period.end),
  ]);
  const values = await loadQuoteValues(supabase, organizationId, quotes.map((q) => q.id));
  const result = aggregateAdsPerformance({ adsRows, quotes, valueOf: values.valueOf });
  const filter = input.campaign?.trim().toLowerCase();
  const campaigns = filter
    ? result.campaigns.filter((row) => row.campaign.toLowerCase().includes(filter) || row.campaign_id === input.campaign?.trim())
    : result.campaigns;

  return {
    period: { from: period.fromDate, to: period.toDate, days: period.days },
    google_ads: connectionView(connection),
    currency: "EUR",
    campaigns,
    totals: result.totals,
    unmatched_ads_quotes: result.unmatched_ads_quotes,
    notes: [
      "Dépense, clics et impressions : synchronisation quotidienne Google Ads (veille au plus tard).",
      "Devis rattachés à une campagne via utm_campaign (nom ou ID de campagne) ; gagnés = statut CRM « won ».",
      "pipeline / won_value / roas = estimations à partir des lignes de devis, pas un CA facturé.",
      ...(connection ? [] : ["Google Ads non connecté : aucune dépense, seuls les devis attribués sont comptés."]),
    ],
  };
}

export async function apiGetAttributionBreakdown(
  organizationId: string,
  input: PeriodInput & { group_by?: AttributionGroupBy; limit?: number },
) {
  const period = resolvePeriod(input);
  const supabase = createServiceClient();
  const quotes = await loadInsightQuotes(supabase, organizationId, period.start, period.end);
  const values = await loadQuoteValues(supabase, organizationId, quotes.map((q) => q.id));
  return {
    period: { from: period.fromDate, to: period.toDate, days: period.days },
    currency: "EUR",
    ...attributionBreakdown({
      quotes,
      groupBy: input.group_by ?? "full",
      valueOf: values.valueOf,
      limit: input.limit,
    }),
    notes: [
      "channel = canal déduit (gclid/gbraid/wbraid ⇒ Google Ads, sinon utm_source/utm_medium puis referrer).",
      "with_gclid = devis portant un identifiant de clic Google Ads (nécessaire pour l’import de conversions).",
      "revenue_estimate = somme des lignes de devis (moyenne des devis chiffrés si une demande n’a pas de ligne).",
    ],
  };
}

export async function apiGetConversionUploads(organizationId: string, input: PeriodInput & { status?: string }) {
  const period = resolvePeriod(input);
  const supabase = createServiceClient();
  const [connection, uploads, quotes] = await Promise.all([
    loadAdsConnection(supabase, organizationId),
    selectAll((from, to) => {
      let query = supabase
        .from("ads_conversion_uploads")
        .select("quote_id, kind, status, error, gclid, created_at, uploaded_at")
        .eq("organization_id", organizationId)
        .gte("created_at", period.start.toISOString())
        .lte("created_at", period.end.toISOString());
      if (input.status) query = query.eq("status", input.status);
      return query.order("created_at", { ascending: false }).range(from, to);
    }),
    loadInsightQuotes(supabase, organizationId, period.start, period.end),
  ]);

  const summary = summarizeConversionUploads(uploads);
  const adsQuotes = quotes.filter((q) => sourceOf(q) === "Google Ads");
  const adsQuotesWithClickId = adsQuotes.filter(hasClickId).length;
  const view = connectionView(connection);
  return {
    period: { from: period.fromDate, to: period.toDate, days: period.days },
    google_ads: view,
    uploads: summary,
    quotes_in_period: {
      total: quotes.length,
      google_ads: adsQuotes.length,
      google_ads_with_click_id: adsQuotesWithClickId,
      won_google_ads: adsQuotes.filter((q) => q.slug === "won").length,
    },
    hints: conversionUploadHints({
      connected: view.connected,
      connectionStatus: view.status,
      summary,
      adsQuotes: adsQuotes.length,
      adsQuotesWithClickId,
    }),
  };
}
