import assert from "node:assert/strict";
import {
  buildAdsLandings,
  campaignLanding,
  hostnameOf,
  wordpressQuotePageUrl,
} from "@/lib/ads/landings";

assert.equal(wordpressQuotePageUrl("atelier.example"), "https://atelier.example/demande-de-devis");
assert.equal(
  wordpressQuotePageUrl("https://atelier.example/boutique", "https://atelier.example/boutique/devis"),
  "https://atelier.example/boutique/devis",
);
assert.equal(hostnameOf("https://atelier.example/boutique"), "atelier.example");

const landings = buildAdsLandings({
  origin: "https://app.example.com",
  orgSlug: "acme",
  funnels: [{ id: "f1", name: "Rayonnage", slug: "rayonnage", sector: "racking" }],
  shops: [
    { id: "s1", name: "Vitrine", slug: "vitrine", sector: "racking", status: "published" },
    { id: "s2", name: "Brouillon", slug: "draft", sector: "racking", status: "draft" },
  ],
  wordpress: [
    {
      id: "w1",
      label: "Atelier",
      storeDomain: "https://atelier.example",
      quotePageUrl: "https://atelier.example/demande-de-devis/",
      sector: "racking",
    },
  ],
});

assert.deepEqual(
  landings.map((row) => row.kind),
  ["funnel", "shop", "wordpress"],
);
assert.ok(landings[0]?.url.includes("/c/acme/rayonnage"));
assert.ok(landings[1]?.url.includes("/b/acme/vitrine/devis"));
assert.ok(landings[2]?.url.includes("atelier.example"));
assert.ok(landings.every((row) => row.url.includes("utm_source=google")));
assert.equal(campaignLanding({ funnelId: "f1", campaign: "autre" }, landings)?.kind, "funnel");

console.log("ads/landings ok");
