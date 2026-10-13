import assert from "node:assert/strict";
import {
  aggregateAdsPerformance,
  attributionBreakdown,
  conversionUploadHints,
  quoteValueResolver,
  resolvePeriod,
  summarizeConversionUploads,
  type InsightQuote,
} from "./insights-core";
import { catalogMatchScore, normalizeSearch, parseVariants, searchCatalogRows, type CatalogProductRow } from "./catalog-search";
import { buildTimeline, cleanNote, isUuid, nextAssignees, parseAssignMode, resolveTeamMember } from "./crm-core";

// --- period
const now = new Date("2026-10-12T12:00:00Z");
const p30 = resolvePeriod({}, now);
assert.equal(p30.days, 30);
assert.equal(p30.toDate, "2026-10-12");
assert.equal(p30.fromDate, "2026-09-12");
const custom = resolvePeriod({ from: "2026-10-01", to: "2026-10-07" }, now);
assert.equal(custom.fromDate, "2026-10-01");
assert.equal(custom.toDate, "2026-10-07");
assert.equal(custom.days, 7);
assert.equal(resolvePeriod({ days: 9999 }, now).days, 366);
assert.throws(() => resolvePeriod({ from: "01/10/2026" }, now), /YYYY-MM-DD/);
assert.throws(() => resolvePeriod({ from: "2026-10-08", to: "2026-10-01" }, now), /après/);
assert.throws(() => resolvePeriod({ from: "2024-01-01", to: "2026-10-01" }, now), /366/);

// --- values
const values = quoteValueResolver([
  { quote_id: "q1", price_min: 100, price_max: 300, quantity: 2 },
  { quote_id: "q2", price_min: 1000, price_max: null, quantity: 1 },
]);
assert.equal(values.valueOf("q1"), 400);
assert.equal(values.valueOf("q2"), 1000);
assert.equal(values.valueOf("unpriced"), 700);
assert.equal(values.isPriced("unpriced"), false);

// --- ads performance
function quote(id: string, patch: Partial<InsightQuote>): InsightQuote {
  return {
    id,
    created_at: "2026-10-05T10:00:00Z",
    slug: "new",
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    referrer: null,
    gclid: null,
    gbraid: null,
    wbraid: null,
    ...patch,
  };
}
const quotes = [
  quote("q1", { utm_source: "google", utm_medium: "cpc", utm_campaign: "Rayonnage Pro", gclid: "g1", slug: "won" }),
  quote("q2", { utm_source: "google", utm_medium: "cpc", utm_campaign: "rayonnage-pro" }),
  quote("q3", { utm_campaign: "Mezzanine", gclid: "g3", slug: "lost" }),
  quote("q4", { gclid: "g4", utm_campaign: "Inconnue" }),
  quote("q5", { utm_source: "newsletter", utm_medium: "email", utm_campaign: "octobre" }),
  quote("q6", {}),
];
const ads = aggregateAdsPerformance({
  adsRows: [
    { campaign_id: "111", campaign_name: "Rayonnage Pro", impressions: 1000, clicks: 50, cost_micros: 200_000_000 },
    { campaign_id: "111", campaign_name: "Rayonnage Pro", impressions: 1000, clicks: 50, cost_micros: 100_000_000 },
    { campaign_id: "222", campaign_name: "Mezzanine", impressions: 500, clicks: 10, cost_micros: 50_000_000 },
  ],
  quotes,
  valueOf: values.valueOf,
});
const rayonnage = ads.campaigns.find((row) => row.campaign_id === "111")!;
assert.equal(rayonnage.spend, 300);
assert.equal(rayonnage.clicks, 100);
assert.equal(rayonnage.quotes, 2);
assert.equal(rayonnage.won, 1);
assert.equal(rayonnage.cost_per_quote, 150);
assert.equal(rayonnage.cost_per_won, 300);
assert.equal(rayonnage.ctr, 5);
assert.equal(rayonnage.click_to_quote_rate, 2);
assert.equal(rayonnage.won_value_estimate, 400);
const mezz = ads.campaigns.find((row) => row.campaign_id === "222")!;
assert.equal(mezz.quotes, 1);
assert.equal(mezz.lost, 1);
assert.equal(mezz.cost_per_won, null);
assert.equal(ads.totals.spend, 350);
assert.equal(ads.totals.quotes, 4);
assert.equal(ads.unmatched_ads_quotes.count, 1);
assert.equal(ads.unmatched_ads_quotes.by_utm_campaign[0]?.utm_campaign, "Inconnue");
assert.equal(ads.campaigns[0]?.campaign_id, "111");

// --- attribution
const byChannel = attributionBreakdown({ quotes, groupBy: "source", valueOf: values.valueOf });
assert.equal(byChannel.totals.quotes, 6);
assert.equal(byChannel.totals.with_gclid, 3);
assert.equal(byChannel.totals.gclid_share, 50);
assert.equal(byChannel.totals.without_tracking, 1);
const googleRow = byChannel.rows.find((row) => row.channel === "Google Ads")!;
assert.equal(googleRow.quotes, 4);
assert.equal(googleRow.with_gclid, 3);
assert.equal(googleRow.gclid_share, 75);
assert.equal(googleRow.won, 1);
const full = attributionBreakdown({ quotes, groupBy: "full", valueOf: values.valueOf, limit: 2 });
assert.equal(full.rows.length, 2);
assert.equal(full.truncated, true);
const byCampaign = attributionBreakdown({ quotes, groupBy: "campaign", valueOf: values.valueOf });
assert.ok(byCampaign.rows.some((row) => row.utm_campaign === "octobre" && row.utm_source === null));

// --- conversion uploads
const summary = summarizeConversionUploads([
  { quote_id: "q1", kind: "quote", status: "uploaded", error: null, gclid: "g1", created_at: "2026-10-05T10:00:00Z", uploaded_at: "2026-10-05T10:01:00Z" },
  { quote_id: "q1", kind: "won", status: "error", error: "CONVERSION_ACTION_NOT_FOUND", gclid: "g1", created_at: "2026-10-06T10:00:00Z", uploaded_at: null },
  { quote_id: "q2", kind: "quote", status: "skipped", error: "Pas de gclid", gclid: null, created_at: "2026-10-05T11:00:00Z", uploaded_at: null },
  { quote_id: "q5", kind: "quote", status: "skipped", error: "Pas de gclid", gclid: null, created_at: "2026-10-05T12:00:00Z", uploaded_at: null },
]);
assert.equal(summary.total, 4);
assert.equal(summary.by_status.uploaded, 1);
assert.equal(summary.by_status.skipped, 2);
assert.equal(summary.by_kind.won?.error, 1);
assert.equal(summary.upload_success_rate, 50);
assert.equal(summary.reasons[0]?.reason, "Pas de gclid");
assert.equal(summary.reasons[0]?.count, 2);
assert.equal(summary.recent_errors[0]?.error, "CONVERSION_ACTION_NOT_FOUND");
const hints = conversionUploadHints({ connected: true, connectionStatus: "active", summary, adsQuotes: 4, adsQuotesWithClickId: 3 });
assert.ok(hints.some((h) => h.includes("2 conversion(s) ignorée(s)")));
assert.ok(hints.some((h) => h.includes("1 devis Google Ads")));
assert.ok(conversionUploadHints({ connected: false, connectionStatus: null, summary, adsQuotes: 0, adsQuotesWithClickId: 0 })[0]?.includes("pas connecté"));

// --- catalog
assert.equal(normalizeSearch("Étagère  Mi-Lourde"), "etagere mi lourde");
function product(patch: Partial<CatalogProductRow>): CatalogProductRow {
  return {
    id: "p",
    name: "Produit",
    sku: null,
    category: null,
    tags: [],
    price_min: null,
    price_max: null,
    currency: "EUR",
    stock_status: "instock",
    external_url: null,
    configurator_id: "f1",
    is_active: true,
    variants: [],
    ...patch,
  };
}
const rows = [
  product({
    id: "p1",
    name: "Rayonnage mi-lourd",
    sku: "RML",
    category: "Rayonnage",
    variants: [
      { title: "2000 x 1000", sku: "RML-2010", price: 189, available: true, selected: { hauteur: "2000" }, stockStatus: "instock", stockQuantity: 4 },
      { title: "2500 x 1000", sku: "RML-2510", price: 229, available: false, selected: { hauteur: "2500" }, stockStatus: "outofstock" },
    ],
  }),
  product({ id: "p2", name: "Étagère murale", sku: "ETM-1", category: "Étagères", price_min: 49, price_max: 49, stock_status: "outofstock" }),
  product({ id: "p3", name: "Rayonnage léger", sku: "RL", category: "Rayonnage", price_min: 79, price_max: 99 }),
];
const variants = parseVariants(rows[0]!.variants);
assert.equal(variants.length, 2);
assert.equal(variants[0]?.stock_quantity, 4);
assert.equal(parseVariants("nope").length, 0);
assert.ok(catalogMatchScore(rows[0]!, variants, "rml-2510") > catalogMatchScore(rows[2]!, [], "rayonnage"));
const found = searchCatalogRows(rows, { query: "rayonnage" });
assert.equal(found.total_matches, 2);
const midHeavy = found.products.find((row) => row.id === "p1")!;
assert.equal(midHeavy.price_min, 189);
assert.equal(midHeavy.price_max, 229);
assert.equal(midHeavy.in_stock, true);
assert.equal(searchCatalogRows(rows, { query: "RML-2510" }).products[0]?.id, "p1");
assert.equal(searchCatalogRows(rows, { query: "etagere" }).products[0]?.id, "p2");
assert.equal(searchCatalogRows(rows, { query: "etagere", in_stock_only: true }).total_matches, 0);
assert.equal(searchCatalogRows(rows, { category: "étagères" }).total_matches, 1);
assert.equal(searchCatalogRows(rows, { query: "", limit: 1 }).products.length, 1);
assert.equal(
  searchCatalogRows(rows, { query: "rayonnage mi lourd", max_variants: 1 }).products[0]?.variants_truncated,
  true,
);

// --- crm
assert.equal(isUuid("2f1c7a9e-8a3b-4b1c-9d2e-1f2a3b4c5d6e"), true);
assert.equal(isUuid("abc"), false);
assert.equal(cleanNote("  Rappeler jeudi \r\n"), "Rappeler jeudi");
assert.throws(() => cleanNote("   "), /vide/);
assert.throws(() => cleanNote("x".repeat(5001)), /trop longue/);
assert.equal(parseAssignMode(undefined), "add");
assert.equal(parseAssignMode("replace"), "replace");
assert.throws(() => parseAssignMode("drop"), /mode invalide/);
const team = [
  { user_id: "u1", email: "lea@quickly.fr", role: "sales" },
  { user_id: "u2", email: "Marc@Quickly.fr", role: "admin" },
];
assert.equal(resolveTeamMember(team, "marc@quickly.fr").user_id, "u2");
assert.equal(resolveTeamMember(team, "u1").user_id, "u1");
assert.throws(() => resolveTeamMember(team, "inconnu@x.fr"), /membre actif/);
assert.deepEqual(nextAssignees(["u1"], "u2", "add"), ["u1", "u2"]);
assert.deepEqual(nextAssignees(["u1", "u2"], "u2", "add"), ["u1", "u2"]);
assert.deepEqual(nextAssignees(["u1", "u2"], "u2", "replace"), ["u2"]);
assert.deepEqual(nextAssignees(["u1", "u2"], "u1", "remove"), ["u2"]);
const timeline = buildTimeline(
  [
    { at: "2026-10-01T10:00:00Z", kind: "activity", type: "submitted", label: "Reçue", detail: null },
    { at: "2026-10-03T10:00:00Z", kind: "note", type: "note", label: "Note", detail: "x" },
    { at: "2026-10-02T10:00:00Z", kind: "message", type: "prospect", label: "Msg", detail: "y" },
  ],
  2,
);
assert.equal(timeline.events[0]?.kind, "note");
assert.equal(timeline.events.length, 2);
assert.equal(timeline.truncated, true);

console.log("mcp insights ok");
