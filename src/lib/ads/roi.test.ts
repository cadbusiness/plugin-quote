import assert from "node:assert/strict";
import { parseAttribution, classifySource, attributionColumns } from "@/lib/stats/attribution";
import { campaignKey, campaignsMatch, closedLoop, costPer, microsToEur } from "@/lib/ads/roi";
import { adsLandingUrl } from "@/lib/ads/utm";
import { keywordPackForSector, keywordsAsPaste } from "@/lib/ads/keywords";

const ads = parseAttribution({ search: "?gclid=abc123&utm_campaign=search-rayonnage" });
assert.equal(ads.gclid, "abc123");
assert.equal(ads.utmSource, "google");
assert.equal(ads.utmMedium, "cpc");
assert.equal(ads.utmCampaign, "search-rayonnage");
assert.equal(classifySource(ads), "Google Ads");
assert.equal(attributionColumns(ads).gclid, "abc123");

const organic = parseAttribution({ search: "?utm_source=google&utm_medium=organic" });
assert.equal(classifySource(organic), "Organique");

assert.equal(campaignKey("Search Rayonnage"), "search-rayonnage");
assert.equal(campaignsMatch("search-rayonnage", "Search Rayonnage", "99"), true);
assert.equal(campaignsMatch("autre", "Search Rayonnage"), false);
assert.equal(microsToEur(28_000_000), 28);
assert.equal(costPer(112, 4), 28);

const loop = closedLoop({
  visitors: 100,
  quotes: 12,
  contacted: 8,
  won: 3,
  pipeline: 4000,
  wonValue: 1500,
  spend: 336,
});
assert.equal(loop.costPerQuote, 28);
assert.equal(loop.costPerWon, 112);
assert.ok((loop.conversion ?? 0) > 10);

const url = adsLandingUrl("https://app.example.com/c/acme/rayonnage", "search-rayonnage");
assert.ok(url.includes("utm_source=google"));
assert.ok(url.includes("utm_medium=cpc"));
assert.ok(url.includes("utm_campaign=search-rayonnage"));

const pack = keywordPackForSector("racking");
assert.ok(pack.matchTypes.exact.includes("rayonnage industriel"));
assert.ok(keywordsAsPaste(pack).includes("[devis rayonnage]"));

const kitchen = keywordPackForSector("kitchen");
assert.equal(kitchen.campaignName, "search-cuisine");

console.log("ads/roi + attribution ok");
