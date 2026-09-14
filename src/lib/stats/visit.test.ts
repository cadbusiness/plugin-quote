import assert from "node:assert/strict";
import {
  countryName,
  deviceLabel,
  formatVisitDuration,
  formatVisitPlace,
  parseDevice,
  requestGeo,
  visitPageLabel,
} from "./visit";

assert.equal(countryName("FR"), "France");
assert.equal(countryName("be"), "Belgique");
assert.equal(countryName(null), null);

assert.equal(deviceLabel("mobile"), "Mobile");
assert.equal(parseDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"), "mobile");
assert.equal(parseDevice("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)"), "tablet");
assert.equal(parseDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"), "desktop");

assert.equal(formatVisitDuration(8_000), "< 15 s");
assert.equal(formatVisitDuration(12 * 60_000), "12 min");
assert.equal(formatVisitDuration(75 * 60_000), "1 h 15 min");

assert.equal(formatVisitPlace("Lyon", "FR"), "Lyon · France");
assert.equal(formatVisitPlace(null, "BE"), "Belgique");

assert.equal(visitPageLabel("/b/demo/vitrine"), "Accueil boutique");
assert.equal(visitPageLabel("/b/demo/vitrine/catalogue"), "Catalogue");
assert.equal(visitPageLabel("/b/demo/vitrine/devis"), "Demande de devis");
assert.equal(visitPageLabel("/c/demo/rayonnage"), "Configurateur");
assert.equal(visitPageLabel("/b/demo/vitrine/mentions-legales"), "Mentions legales");
assert.equal(visitPageLabel("/demande-de-devis"), "Demande de devis");
assert.equal(visitPageLabel("/produit/rayonnage-mi-lourd"), "Fiche produit");
assert.equal(visitPageLabel("/product-category/rayonnage"), "Catégorie");
assert.equal(visitPageLabel("/shop"), "Boutique");

const geo = requestGeo(
  new Headers({
    "x-vercel-ip-country": "fr",
    "x-vercel-ip-city": "Lyon",
  }),
);
assert.equal(geo.country, "FR");
assert.equal(geo.city, "Lyon");

console.log("stats/visit.test.ts: ok");
