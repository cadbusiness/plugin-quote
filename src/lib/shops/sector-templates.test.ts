import assert from "node:assert/strict";
import { parseCreateShopForm } from "@/lib/shops/create";
import {
  collectFilledImages,
  collectNodeTypes,
  hasCheckoutCtaLanguage,
  layoutTypeSequence,
  shopCopyForFamily,
} from "@/lib/shops/composition";
import { parseTheme } from "@/lib/shops/parse";
import { shopPlaceholders } from "@/lib/shops/placeholders";
import {
  SHOP_SECTOR_TEMPLATES,
  SHOP_TEMPLATE_IDS,
  featuredTemplateForFamily,
  getShopSectorTemplate,
  homeRhythmFor,
  homeTypeSequence,
  isShopTemplateId,
  resolveShopSectorTemplate,
} from "@/lib/shops/sector-templates";
import { buildShopBlueprint } from "@/lib/shops/templates";

const CASES = [
  {
    id: "menuiserie" as const,
    family: "habitat",
    name: "Atelier Chêne",
    heading: /menuiserie|ouvrage/i,
    proof: /atelier|essence/i,
    process: /relevé/i,
    accent: "#B45309",
    nav: "Ouvrages",
    funnel: "wood",
    hint: /menuiserie|bois|établi|essence/i,
  },
  {
    id: "skincare" as const,
    family: "health",
    name: "Studio Peau",
    heading: /soin|protocole|rituel/i,
    proof: /cabinet|protocole/i,
    process: /bilan/i,
    accent: "#0F766E",
    nav: "Rituels",
    funnel: "health_clinic",
    hint: /skincare|soin|actif|rituel/i,
  },
  {
    id: "stock-b2b" as const,
    family: "racking",
    name: "Atelier Nord",
    heading: /rayonnage|stock B2B/i,
    proof: /technique|charge/i,
    process: /brief technique|calepinage/i,
    accent: "#C2410C",
    nav: "Gammes",
    funnel: "racking_catalog",
    hint: /entrepôt|travée|palettier|rayonnage/i,
  },
];

assert.deepEqual(
  SHOP_SECTOR_TEMPLATES.map((item) => item.id),
  [...SHOP_TEMPLATE_IDS],
);
assert.equal(isShopTemplateId("menuiserie"), true);
assert.equal(isShopTemplateId("kitchen"), false);
assert.equal(featuredTemplateForFamily("habitat")?.id, "menuiserie");
assert.equal(featuredTemplateForFamily("health")?.id, "skincare");
assert.equal(featuredTemplateForFamily("racking")?.id, "stock-b2b");
assert.equal(featuredTemplateForFamily("events"), null);
assert.equal(resolveShopSectorTemplate("menuiserie", "health")?.family, "habitat");
assert.equal(getShopSectorTemplate("skincare")?.funnelTemplateId, "health_clinic");

const rhythms = CASES.map((item) => homeTypeSequence(homeRhythmFor(item.family, item.id)).join(">"));
assert.equal(new Set(rhythms).size, 3, "each sector template has a distinct home rhythm");

for (const item of CASES) {
  const blueprint = buildShopBlueprint({
    name: item.name,
    sector: item.family,
    orgName: item.name,
    legal: { city: "Lyon", company: item.name },
    templateId: item.id,
  });

  assert.equal(blueprint.sector, item.family);
  assert.equal(blueprint.theme.templateId, item.id);
  assert.equal(blueprint.theme.accent, item.accent);
  assert.notEqual(blueprint.theme.background, "#FFFFFF");
  assert.equal(blueprint.nav.find((nav) => nav.href === "/catalogue")?.label, item.nav);
  assert.deepEqual(layoutTypeSequence(blueprint.pages[0]!.blocks), homeTypeSequence(homeRhythmFor(item.family, item.id)));

  const home = blueprint.pages[0]!.blocks;
  const types = collectNodeTypes(home.content);
  assert.ok(types.includes("Hero"));
  assert.ok(types.includes("Features"));
  assert.ok(types.includes("Categories"));
  assert.ok(types.includes("Catalog"));
  assert.ok(types.includes("Faq"));
  assert.ok(types.includes("QuoteCta"));
  assert.ok(types.includes("Columns"));
  assert.ok(types.includes("Image"));
  assert.equal(home.content.at(-1)?.type, "QuoteCta");
  assert.equal(blueprint.pages[1]!.blocks.content.at(-1)?.type, "QuoteCta");

  const hero = home.content.find((node) => node.type === "Hero");
  assert.match(String(hero?.props.heading), item.heading);
  assert.match(String(hero?.props.sub), /devis|chiffrage|atelier|protocole/i);
  assert.equal(hasCheckoutCtaLanguage(String(hero?.props.ctaLabel)), false);
  assert.ok(String(hero?.props.image).startsWith("https://images.unsplash.com/"));

  const copy = shopCopyForFamily({ name: item.name, sector: item.family, city: "Lyon", templateId: item.id });
  const blob = [copy.heroCta, copy.quoteCta, copy.heroHeading, copy.quoteHeading, copy.aboutText, copy.proofHeading, copy.processHeading]
    .join(" ");
  assert.equal(hasCheckoutCtaLanguage(blob), false, item.id);
  assert.match(copy.proofHeading, item.proof);
  assert.match(copy.processHeading, item.process);
  assert.match(copy.seoDescription, /Lyon/);
  assert.match(copy.seoDescription, /devis/i);
  assert.ok(copy.faq.every((row) => !hasCheckoutCtaLanguage(row.a)));

  const images = collectFilledImages(home.content);
  assert.ok(images.length >= 2, item.id);
  assert.ok(images.every((photo) => photo.imageAlt.length > 4));

  const photos = shopPlaceholders(item.family, item.id);
  assert.match(photos.hero.hint, item.hint);
  assert.match(photos.split.hint, item.hint);
}

const menuiserie = shopPlaceholders("habitat", "menuiserie");
const skincare = shopPlaceholders("health", "skincare");
const stock = shopPlaceholders("racking", "stock-b2b");
assert.notEqual(menuiserie.hero.image, skincare.hero.image);
assert.notEqual(skincare.hero.image, stock.hero.image);
assert.notEqual(menuiserie.split.image, stock.split.image);

const parsed = parseTheme({
  accent: "#B45309",
  background: "#FBF6F0",
  text: "#2A1B12",
  templateId: "menuiserie",
});
assert.equal(parsed.templateId, "menuiserie");
assert.equal(parsed.quoteMode, undefined);
assert.equal(parseTheme({ templateId: "nope" }).templateId, undefined);
assert.equal(parseTheme({ quoteMode: "rfq" }).quoteMode, "rfq");
assert.equal(parseTheme({ quoteMode: "simple" }).quoteMode, "rfq");
assert.equal(parseTheme({ quoteMode: "configurator" }).quoteMode, "wizard");
assert.equal(parseTheme({ quoteMode: "wizard" }).quoteMode, "wizard");
assert.equal(parseTheme({ quoteMode: "catalog" }).quoteMode, "catalog");

const form = new FormData();
form.set("name", "Atelier Chêne");
form.set("sector", "custom");
form.set("shop_template", "menuiserie");
form.set("company", "Atelier Chêne");
form.set("city", "Lyon");
const created = parseCreateShopForm(form);
assert.ok(created);
assert.equal(created?.sector, "habitat");
assert.equal(created?.templateId, "menuiserie");
assert.equal(created?.legal.city, "Lyon");

console.log("sector template tests ok");
