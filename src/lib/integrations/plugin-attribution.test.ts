import assert from "node:assert/strict";
import {
  parsePluginAttribution,
  pluginQuoteAttributionColumns,
  resolvePluginAttribution,
} from "./plugin-attribution";
import { parsePluginQuote } from "./plugin-quote-body";

const page = "https://boutique.exemple.com/devis/";

const none = resolvePluginAttribution({ email: "a@b.co" }, page);
assert.equal(none.present, false);
assert.equal(none.attribution.utmSource, "wordpress");
assert.equal(none.attribution.utmMedium, "plugin");
assert.equal(none.attribution.referrer, page);
assert.equal(none.attribution.gclid, undefined);

const internal = resolvePluginAttribution({ attribution: { referrer: "https://www.boutique.exemple.com/rayonnage" } }, page);
assert.equal(internal.present, false, "same-site referrer is not attribution");

const ads = resolvePluginAttribution(
  { attribution: { gclid: "Cj0KCQ-abc", landing: "https://boutique.exemple.com/?gclid=Cj0KCQ-abc", first_seen: 1760000000 } },
  page,
);
assert.equal(ads.present, true);
assert.equal(ads.attribution.gclid, "Cj0KCQ-abc");
assert.equal(ads.attribution.utmSource, "google");
assert.equal(ads.attribution.utmMedium, "cpc");
assert.equal(ads.attribution.landingPath, "https://boutique.exemple.com/?gclid=Cj0KCQ-abc");
assert.equal(ads.extras.first_seen, new Date(1760000000 * 1000).toISOString());
const columns = pluginQuoteAttributionColumns(ads.attribution);
assert.equal(columns.gclid, "Cj0KCQ-abc");
assert.equal("landing_path" in columns, false);
assert.equal("visitor_id" in columns, false);

const tagged = resolvePluginAttribution(
  { attribution: JSON.stringify({ gbraid: "0AAAA", utm_source: "newsletter", utm_medium: "email", utm_campaign: "printemps" }) },
  page,
);
assert.equal(tagged.attribution.utmSource, "newsletter", "explicit utm_source wins over click ID default");
assert.equal(tagged.attribution.utmMedium, "email");
assert.equal(tagged.attribution.utmCampaign, "printemps");
assert.equal(tagged.attribution.gbraid, "0AAAA");

const bing = resolvePluginAttribution({ attribution: { msclkid: "ms-1" } }, page);
assert.equal(bing.attribution.utmSource, "bing");
assert.equal(bing.attribution.utmMedium, "cpc");
assert.equal(bing.extras.msclkid, "ms-1");

const organic = resolvePluginAttribution({ attribution: { referrer: "https://www.google.com/" } }, page);
assert.equal(organic.present, true);
assert.equal(organic.attribution.utmSource, null, "classifySource reads the referrer");
assert.equal(organic.attribution.referrer, "https://www.google.com/");

const dirty = parsePluginAttribution({
  gclid: "<script>x</script>abc",
  utm_term: "a".repeat(400),
  evil: "nope",
  referrer: "javascript:alert(1)",
  landing: ["x"],
});
assert.equal(dirty.gclid, "xabc");
assert.equal(dirty.utm_term?.length, 255);
assert.equal("evil" in dirty, false);
assert.equal(dirty.referrer, undefined);
assert.equal(dirty.landing, undefined);
assert.deepEqual(parsePluginAttribution("not json"), {});
assert.deepEqual(parsePluginAttribution(["gclid"]), {});

const base = { need: "Rack 4 niveaux", name: "Marie Dupont", email: "marie@exemple.com" };
const consent = (extra: Record<string, unknown>) => {
  const parsed = parsePluginQuote({ ...base, ...extra });
  assert.equal(parsed.ok, true);
  return parsed.ok ? parsed.quote.consentAds : "invalid";
};
assert.equal(consent({}), undefined, "no CMP: unknown, not denied");
assert.equal(consent({ consentAds: true }), true);
assert.equal(consent({ consent_ads: "1" }), true);
assert.equal(consent({ consentAds: false }), false);
assert.equal(consent({ consent_ads: "0" }), false);
assert.equal(consent({ consentAds: "maybe" }), undefined);

console.log("plugin-attribution ok");
