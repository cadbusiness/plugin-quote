import assert from "node:assert/strict";
import {
  DEMO_ACCOUNTS,
  DEMO_FUNNEL_ALIASES,
  DEMO_FUNNEL_SLUG,
  DEMO_ORG,
  DEMO_SEED_VERSION,
  DEMO_SHOP_ALIASES,
  DEMO_SHOP_SLUG,
  requireDemoPassword,
} from "./constants";
import { DEMO_PRODUCTS, DEMO_RULES } from "./modules/catalog";
import { DEMO_QUOTES } from "./modules/quotes";
import { DEMO_SESSIONS } from "./modules/sessions";
import { DEMO_SEGMENTS } from "./modules/segments";
import { SEED_MODULES, seedModuleIds, walkthroughModuleIds } from "./registry";
import { WALKTHROUGH_SCREENS, walkthroughPath } from "./walkthrough";
import { QUOTE_STATUSES } from "../crm/seed";

assert.equal(DEMO_ORG.slug, "demo");
assert.equal(DEMO_SEED_VERSION >= 2, true);
assert.equal(DEMO_FUNNEL_SLUG, "rayonnage");
assert.equal(DEMO_SHOP_SLUG, "vitrine");
assert.ok(DEMO_FUNNEL_ALIASES.includes("principal"));
assert.ok(DEMO_FUNNEL_ALIASES.includes("funnel-rayonnage"));
assert.ok(DEMO_SHOP_ALIASES.includes("espace-demo"));
assert.ok(
  WALKTHROUGH_SCREENS.some((screen) => screen.path === `/c/${DEMO_ORG.slug}/${DEMO_FUNNEL_SLUG}`),
);
assert.ok(WALKTHROUGH_SCREENS.some((screen) => screen.path === `/b/${DEMO_ORG.slug}/${DEMO_SHOP_SLUG}`));
assert.ok(DEMO_ACCOUNTS.every((account) => account.email.endsWith("@quotebuilder.app")));
assert.ok(!JSON.stringify(DEMO_ACCOUNTS).includes("password"));
assert.ok(!JSON.stringify(DEMO_ACCOUNTS).toLowerCase().includes("demo2026"));

const ids = seedModuleIds();
assert.deepEqual(ids, [
  "org",
  "accounts",
  "crm",
  "funnel",
  "catalog",
  "quotes",
  "sessions",
  "shop",
  "segments",
  "analytics",
]);
assert.equal(new Set(ids).size, ids.length);
assert.ok(SEED_MODULES.every((module) => module.title && typeof module.run === "function"));

const walkthroughIds = walkthroughModuleIds();
for (const moduleId of walkthroughIds) {
  assert.ok(ids.includes(moduleId), `écran walkthrough sans module seed: ${moduleId}`);
}

const requiredScreens = ["login", "devis", "dossier", "automations", "catalogue", "builder"];
for (const id of requiredScreens) {
  assert.ok(WALKTHROUGH_SCREENS.some((screen) => screen.id === id), `écran manquant: ${id}`);
}

const dossier = WALKTHROUGH_SCREENS.find((screen) => screen.id === "dossier");
assert.ok(dossier);
assert.equal(walkthroughPath(dossier, { quoteId: "abc" }), "/devis/abc");

const productSkus = DEMO_PRODUCTS.map((product) => product.sku);
assert.equal(new Set(productSkus).size, productSkus.length);
assert.ok(productSkus.every((sku) => sku.startsWith("QB-DEMO-")));
assert.ok(DEMO_PRODUCTS.every((product) => product.price_min > 0 && product.price_max >= product.price_min));

for (const rule of DEMO_RULES) {
  for (const sku of rule.productSkus) {
    assert.ok(productSkus.includes(sku), `règle ${rule.name} référence un SKU inconnu ${sku}`);
  }
}

const quoteEmails = DEMO_QUOTES.map((quote) => quote.contact_email);
assert.equal(new Set(quoteEmails).size, quoteEmails.length);
const pipeline = new Set(DEMO_QUOTES.map((quote) => quote.status_slug));
for (const status of QUOTE_STATUSES) {
  assert.ok(pipeline.has(status.slug), `aucune demande seedée au statut ${status.slug}`);
}
assert.ok(DEMO_QUOTES.some((quote) => quote.score_label === "hot"));
assert.ok(DEMO_QUOTES.some((quote) => quote.score_label === "warm"));
assert.ok(DEMO_QUOTES.some((quote) => quote.score_label === "cold"));
assert.ok(DEMO_QUOTES.every((quote) => quote.contact_company && quote.items.length > 0));

const tokens = DEMO_SESSIONS.map((session) => session.token);
assert.equal(new Set(tokens).size, tokens.length);
assert.ok(tokens.every((token) => token.startsWith("qb-demo-")));
assert.ok(DEMO_SESSIONS.some((session) => session.contact.email));
assert.ok(DEMO_SESSIONS.some((session) => !session.contact.email));
assert.ok(DEMO_SESSIONS.some((session) => session.hoursAgo >= 4));

assert.ok(DEMO_SEGMENTS.some((segment) => segment.rules.all.some((rule) => rule.field === "score_label")));
assert.ok(DEMO_SEGMENTS.some((segment) => segment.rules.all.some((rule) => rule.field === "audience")));

const previous = process.env.DEMO_PASSWORD;
delete process.env.DEMO_PASSWORD;
assert.throws(() => requireDemoPassword(), /DEMO_PASSWORD/);
if (previous == null) delete process.env.DEMO_PASSWORD;
else process.env.DEMO_PASSWORD = previous;

console.log("demo/seed ok");
