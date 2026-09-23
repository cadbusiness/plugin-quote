import assert from "node:assert/strict";
import { labelAnswers } from "@/lib/crm/answers";
import {
  normalizeVariationId,
  parsePluginQuoteBody,
  pluginQuoteAnswers,
  pluginQuoteLines,
  pluginQuoteUrl,
  pluginReceiptKey,
  type PluginCatalogProduct,
} from "@/lib/integrations/plugin-quotes";
import { scoreQuote } from "@/lib/quotes/score";
import { classifySource } from "@/lib/stats/attribution";

const example = {
  source: "wordpress",
  externalId: "9645",
  org: "demo",
  funnel: "principal",
  createdAt: "2026-09-22T07:04:26+00:00",
  pageUrl: "https://shop.example/categorie-produit/rack-a-palettes/",
  context: "Gamme : Rack à palettes",
  contact: {
    name: "Jean Dupont",
    email: "Jean@Exemple.be",
    phone: "+32 470 00 00 00",
    company: "Dupont SRL",
    city: "Herstal",
  },
  needs: ["Rack à palettes"],
  requestText: "Palettes 250 x 110 cm, hauteur 450 cm, 3 niveaux de lisses, 4 travées accolées",
  space: { length: "10 à 30 m", height: "3 à 6 m" },
  items: [
    {
      productId: "3292",
      variationId: "4580",
      sku: "",
      name: "RAYONNAGE UNIRACK",
      variation: "1200 mm, 400 mm, 1972 mm, 5",
      qty: 3,
      note: "",
      url: "https://shop.example/produit/unirack/",
    },
    {
      productId: "8855",
      variationId: "",
      sku: "",
      name: "SUPERBUILD (STANDARD)",
      variation: "",
      qty: 4,
      note: "4x ce modèle, à fixer les uns avec les autres",
      url: "https://shop.example/produit/superbuild-standard/",
    },
  ],
};

const catalog: PluginCatalogProduct[] = [
  {
    id: "uuid-unirack",
    name: "Rayonnage Unirack",
    externalId: "3292",
    sku: "UNI",
    priceMin: 100,
    priceMax: 400,
    variants: [{ externalId: "4580", title: "Variante 4580", price: 180, sku: "UNI-4580" }],
  },
];

const parsed = parsePluginQuoteBody(example);
assert.equal(parsed.ok, true);
if (!parsed.ok) throw new Error("parse");

assert.equal(parsed.quote.externalId, "9645");
assert.equal(parsed.quote.contact.email, "jean@exemple.be");
assert.equal(parsed.quote.contact.company, "Dupont SRL");
assert.equal(parsed.quote.org, "demo");
assert.equal(parsed.quote.createdAt, "2026-09-22T07:04:26.000Z");

const answers = pluginQuoteAnswers(parsed.quote);
assert.equal(answers.need, example.requestText);
assert.deepEqual(answers.besoin, ["Rack à palettes"]);
assert.equal(answers.longueur, "10 à 30 m");
assert.equal(answers.hauteur, "3 à 6 m");
assert.equal(answers.ville, "Herstal");
assert.equal(answers.page_url, example.pageUrl);
assert.equal(answers.contexte, example.context);
assert.equal(answers.org, undefined);

const labeled = labelAnswers(answers);
assert.equal(labeled.find((row) => row.key === "page_url")?.label, "Page");
assert.equal(labeled.find((row) => row.key === "contexte")?.label, "Contexte");
assert.equal(labeled.find((row) => row.key === "ville")?.value, "Herstal");

assert.equal(
  classifySource({ utmSource: "site web", utmMedium: "website", referrer: example.pageUrl }),
  "Site Web",
);
assert.ok(scoreQuote(answers).score > scoreQuote({}).score);
assert.equal(scoreQuote(answers).score, scoreQuote({ need: example.requestText }).score);

const lines = pluginQuoteLines(parsed.quote.items, catalog);
assert.equal(lines[0]?.productId, "uuid-unirack");
assert.equal(lines[0]?.name, "RAYONNAGE UNIRACK (1200 mm, 400 mm, 1972 mm, 5)");
assert.equal(lines[0]?.quantity, 3);
assert.equal(lines[0]?.priceMin, 180);
assert.equal(lines[0]?.priceMax, 180);
assert.equal(lines[0]?.options.woo_variation_id, "4580");
assert.equal(lines[1]?.productId, null);
assert.equal(lines[1]?.name, "SUPERBUILD (STANDARD)");
assert.equal(lines[1]?.quantity, 4);
assert.equal(lines[1]?.options.note, "4x ce modèle, à fixer les uns avec les autres");
assert.equal(lines[1]?.priceMin, null);

const simple = pluginQuoteLines(
  [
    {
      productId: "8855",
      variationId: normalizeVariationId(0),
      sku: "",
      name: "SUPERBUILD (STANDARD)",
      variation: "",
      qty: 1,
      note: "",
      url: "",
    },
    {
      productId: "8855",
      variationId: normalizeVariationId("0"),
      sku: "",
      name: "SUPERBUILD (STANDARD)",
      variation: "",
      qty: 2,
      note: "",
      url: "",
    },
  ],
  [
    {
      id: "uuid-super",
      name: "Superbuild",
      externalId: "8855",
      sku: null,
      priceMin: 40,
      priceMax: 90,
      variants: [],
    },
  ],
);
assert.equal(normalizeVariationId(0), "");
assert.equal(normalizeVariationId("0"), "");
assert.equal(normalizeVariationId(""), "");
assert.equal(normalizeVariationId("4580"), "4580");
assert.equal(simple[0]?.productId, "uuid-super");
assert.equal(simple[0]?.priceMin, 40);
assert.equal(simple[1]?.productId, "uuid-super");
assert.equal(simple[0]?.options.woo_variation_id, undefined);
assert.equal(simple[1]?.options.woo_variation_id, undefined);

assert.deepEqual(pluginReceiptKey("conn-1", "9645"), {
  connection_id: "conn-1",
  external_id: "9645",
});
assert.deepEqual(pluginReceiptKey("conn-1", "9645"), pluginReceiptKey("conn-1", " 9645 "));
assert.notDeepEqual(pluginReceiptKey("conn-2", "9645"), pluginReceiptKey("conn-1", "9645"));

assert.equal(pluginQuoteUrl("quote-1").endsWith("/devis/quote-1"), true);

const missingPhone = parsePluginQuoteBody({
  ...example,
  contact: { name: "Jean", email: "jean@exemple.be" },
});
assert.equal(missingPhone.ok, false);
if (!missingPhone.ok) assert.match(missingPhone.error, /phone/);

const badSource = parsePluginQuoteBody({ ...example, source: "shopify" });
assert.equal(badSource.ok, false);

const emptyItems = parsePluginQuoteBody({ ...example, items: [], requestText: "" });
assert.equal(emptyItems.ok, true);
if (emptyItems.ok) assert.deepEqual(pluginQuoteLines(emptyItems.quote.items, catalog), []);

const zeroQty = parsePluginQuoteBody({
  ...example,
  items: [{ ...example.items[0], qty: 0 }],
});
assert.equal(zeroQty.ok, false);

console.log("plugin-quotes.test.ts ok");
