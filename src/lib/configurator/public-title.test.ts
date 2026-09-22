import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { funnelDocumentTitle, funnelPageMetadata } from "./public-title";

const SLOGAN = "Arrêtez de perdre vos devis";

const quickly = funnelDocumentTitle({
  orgName: "Quickly International",
  configuratorName: "QuoteAssistant — Quickly",
  subject: "rayonnage",
});
assert.equal(quickly, "Devis rayonnage — Quickly International");
assert.ok(quickly && !quickly.includes(SLOGAN));
assert.ok(quickly && !/quote\s*assistant/i.test(quickly));

assert.equal(
  funnelDocumentTitle({
    orgName: "Atelier Martin",
    configuratorName: "Cuisine sur mesure",
    subject: "cuisine",
  }),
  "Cuisine sur mesure — Atelier Martin",
);

assert.equal(
  funnelDocumentTitle({
    orgName: "Atelier Martin",
    configuratorName: "Devis cuisine — Atelier Martin",
    subject: "cuisine",
  }),
  "Devis cuisine — Atelier Martin",
);

assert.equal(
  funnelDocumentTitle({
    orgName: "",
    configuratorName: "Cuisine",
    subject: "cuisine",
  }),
  null,
);

const embed = funnelPageMetadata({
  orgName: "Quickly International",
  configuratorName: "QuoteAssistant — Quickly",
  subject: "rayonnage",
  canonicalPath: "/c/quickly/rayonnage",
  index: false,
});
assert.ok(embed);
assert.deepEqual(embed?.title, { absolute: "Devis rayonnage — Quickly International" });
assert.equal(embed?.openGraph && "title" in embed.openGraph ? embed.openGraph.title : null, quickly);
assert.equal(embed?.robots && "index" in embed.robots ? embed.robots.index : null, false);
assert.equal(embed?.alternates && "canonical" in embed.alternates ? embed.alternates.canonical : null, "https://www.quotebuilder.co/c/quickly/rayonnage");
assert.equal(embed?.applicationName, "Quickly International");
const serialized = JSON.stringify(embed);
assert.equal(serialized.includes(SLOGAN), false);
assert.equal(/QuoteBuilder/.test(serialized), false);

const missing = funnelPageMetadata(null);
assert.equal(missing, null);

const rootLayout = readFileSync(new URL("../../app/layout.tsx", import.meta.url), "utf8");
assert.equal(rootLayout.includes("rootJsonLd"), false);
assert.equal(rootLayout.includes("application/ld+json"), false);

const marketing = readFileSync(new URL("../../app/(marketing)/layout.tsx", import.meta.url), "utf8");
const marketingLite = readFileSync(new URL("../../app/(marketing-lite)/layout.tsx", import.meta.url), "utf8");
assert.match(marketing, /MarketingJsonLd/);
assert.match(marketingLite, /MarketingJsonLd/);

const widget = readFileSync(new URL("../../app/widget.js/route.ts", import.meta.url), "utf8");
assert.equal(widget.includes('setAttribute("title", "QuoteBuilder")'), false);
assert.match(widget, /Devis/);
