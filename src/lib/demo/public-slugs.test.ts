import assert from "node:assert/strict";
import { DEMO_FUNNEL_ALIASES, DEMO_FUNNEL_SLUG, DEMO_ORG, DEMO_SHOP_ALIASES, DEMO_SHOP_SLUG } from "./constants";
import {
  pickDemoFunnel,
  pickPreferredBySlug,
  publicConfiguratorSlugs,
  publicShopSlugs,
} from "./public-slugs";

assert.equal(DEMO_FUNNEL_SLUG, "rayonnage");
assert.equal(DEMO_SHOP_SLUG, "vitrine");
assert.ok(DEMO_FUNNEL_ALIASES.includes("rayonnage"));
assert.ok(DEMO_FUNNEL_ALIASES.includes("principal"));
assert.ok(DEMO_FUNNEL_ALIASES.includes("funnel-rayonnage"));
assert.ok(DEMO_SHOP_ALIASES.includes("vitrine"));
assert.ok(DEMO_SHOP_ALIASES.includes("espace-demo"));

assert.deepEqual(publicConfiguratorSlugs("quickly", "rayonnage"), ["rayonnage"]);
assert.deepEqual(publicConfiguratorSlugs(DEMO_ORG.slug, "autre"), ["autre"]);
assert.deepEqual(publicConfiguratorSlugs(DEMO_ORG.slug, "rayonnage"), [
  "rayonnage",
  "principal",
  "funnel-rayonnage",
]);
assert.deepEqual(publicConfiguratorSlugs(DEMO_ORG.slug, "principal"), [
  "principal",
  "rayonnage",
  "funnel-rayonnage",
]);

assert.deepEqual(publicShopSlugs("quickly", "vitrine"), ["vitrine"]);
assert.deepEqual(publicShopSlugs(DEMO_ORG.slug, "autre"), ["autre"]);
assert.deepEqual(publicShopSlugs(DEMO_ORG.slug, "vitrine"), ["vitrine", "espace-demo", "vitrine-rayonnage"]);
assert.deepEqual(publicShopSlugs(DEMO_ORG.slug, "espace-demo"), [
  "espace-demo",
  "vitrine",
  "vitrine-rayonnage",
]);

assert.equal(pickPreferredBySlug([{ slug: "principal" }, { slug: "rayonnage" }], ["rayonnage", "principal"])?.slug, "rayonnage");
assert.equal(pickPreferredBySlug([{ slug: "principal" }], ["rayonnage", "principal"])?.slug, "principal");
assert.equal(pickPreferredBySlug([], ["rayonnage"]), null);

assert.equal(
  pickDemoFunnel([
    { slug: "catalogue-rayonnage", wizard_enabled: true, chat_enabled: false, theme: { kind: "catalog" } },
    { slug: "principal", wizard_enabled: true, chat_enabled: true, theme: {} },
  ])?.slug,
  "principal",
);
assert.equal(
  pickDemoFunnel([
    { slug: "funnel-rayonnage", wizard_enabled: true, chat_enabled: true, theme: {} },
    { slug: "catalogue-espace-demo", wizard_enabled: true, chat_enabled: false, theme: { kind: "catalog" } },
  ])?.slug,
  "funnel-rayonnage",
);
assert.equal(pickDemoFunnel([{ slug: "catalogue-rayonnage", theme: { kind: "catalog" } }]), null);

console.log("demo/public-slugs ok");
