import assert from "node:assert/strict";
import { mapWooCatalogAttributes, toProductSpecs } from "@/lib/catalog/specs";
import { bindWidgetLines } from "@/lib/integrations/quote-widget-bind";
import {
  catalogAxes,
  collectPaged,
  mapWooVariantMatrix,
  quoteSelectionForProduct,
  resolveCatalogLine,
  shouldLoadWooVariations,
  storedOptionsForSync,
  storedVariantsForSync,
  toWidgetMatrixProduct,
  wooAxisKey,
} from "@/lib/catalog/variant-matrix";

const attributes = [
  { name: "Couleur", slug: "pa_couleur", variation: true, options: ["Bleu", "Rouge"] },
  { name: "Hauteur", slug: "pa_hauteur", variation: true, options: ["1570 mm", "2500 mm"] },
  { name: "Matériau", slug: "pa_materiau", variation: false, options: ["Acier"] },
];

const variations = [
  {
    id: 11,
    sku: "REAL-11",
    price: "180",
    stock_status: "instock" as const,
    stock_quantity: 4,
    attributes: [
      { name: "Couleur", option: "Bleu" },
      { name: "Hauteur", option: "1570 mm" },
    ],
  },
  {
    id: 12,
    sku: "REAL-12",
    price: "210",
    stock_status: "outofstock" as const,
    attributes: [
      { name: "pa_couleur", option: "Rouge" },
      { name: "attribute_pa_hauteur", option: "1570 mm" },
    ],
  },
];

assert.equal(wooAxisKey("Couleur", "pa_couleur"), "couleur");
assert.equal(wooAxisKey("attribute_pa_hauteur"), "hauteur");
assert.equal(shouldLoadWooVariations({ type: "simple", variations: [1, 2] }), false);
assert.equal(shouldLoadWooVariations({ type: "variable", variations: [] }), true);
assert.equal(shouldLoadWooVariations({ type: "grouped" }), false);

const mapped = mapWooVariantMatrix(attributes, variations);
assert.equal(mapped.length, 2);
assert.equal(mapped[0]?.externalId, "11");
assert.deepEqual(mapped[0]?.selected, { couleur: "bleu", hauteur: "1570-mm" });
assert.equal(mapped[0]?.sku, "REAL-11");
assert.equal(mapped[0]?.stockQuantity, 4);
assert.equal(mapped[1]?.available, false);
assert.deepEqual(mapped[1]?.selected, { couleur: "rouge", hauteur: "1570-mm" });
assert.equal(mapped.some((variant) => variant.sku === "INVENTED"), false);

const choices = mapWooCatalogAttributes({ attributes });
const choiceKeys = choices.filter((row) => row.kind === "choices").map((row) => row.key);
assert.deepEqual(choiceKeys, ["couleur", "hauteur"]);
assert.equal(toProductSpecs(choices).some((spec) => spec.key === "couleur"), false);

const widget = toWidgetMatrixProduct({
  externalId: "42",
  name: "Rayonnage variable",
  sku: "PARENT",
  options: choices,
  variants: mapped,
});
assert.ok(widget);
if (!widget) throw new Error("widget");
assert.deepEqual(
  widget.axes.map((axis) => axis.key),
  ["couleur", "hauteur"],
);
assert.equal(widget.variations.length, 2);
assert.equal(widget.variations[0]?.selected.couleur, "bleu");

const resolved = bindWidgetLines(
  [
    {
      productId: "42",
      variationId: "",
      name: "",
      qty: 1,
      sku: "INVENTED-SKU",
      variation: "",
      url: "",
      selected: { couleur: "bleu", hauteur: "1570-mm" },
    },
  ],
  [widget],
);
assert.equal(resolved.ok, true);
if (!resolved.ok) throw new Error("resolved");
assert.equal(resolved.lines[0]?.variationId, "11");
assert.equal(resolved.lines[0]?.sku, "REAL-11");
assert.equal(resolved.lines[0]?.sku.includes("INVENTED"), false);

const stolen = bindWidgetLines(
  [
    {
      productId: "42",
      variationId: "11",
      name: "Rayonnage variable",
      qty: 1,
      sku: "INVENTED-SKU",
      variation: "",
      url: "",
    },
  ],
  [widget],
);
assert.equal(stolen.ok, true);
if (!stolen.ok) throw new Error("stolen");
assert.equal(stolen.lines[0]?.sku, "REAL-11");
assert.equal(JSON.stringify(stolen).includes("INVENTED"), false);

const invented = bindWidgetLines(
  [
    {
      productId: "42",
      variationId: "999",
      name: "Rayonnage variable",
      qty: 1,
      sku: "INVENTED-SKU",
      variation: "Rouge / 2500 mm",
      url: "",
      selected: { couleur: "rouge", hauteur: "2500-mm" },
    },
  ],
  [widget],
);
assert.equal(invented.ok, false);
if (invented.ok) throw new Error("invented");
assert.equal(invented.error, "Cette combinaison n'existe pas.");
assert.equal(JSON.stringify(invented).includes("INVENTED"), false);
assert.equal("sku" in invented, false);

const axes = catalogAxes({ options: widget.axes.map((axis) => ({ key: axis.key, label: axis.name, values: axis.options })), variants: mapped });
const quoteLine = quoteSelectionForProduct(
  {
    name: "Rayonnage variable",
    sku: "PARENT",
    priceMin: 180,
    priceMax: 210,
    options: axes.map((axis) => ({ key: axis.key, label: axis.name, values: axis.options })),
    variants: mapped,
  },
  { couleur: "rouge", hauteur: "2500-mm", sku: "INVENTED-SKU", woo_variation_id: "999" },
);
assert.equal(quoteLine.options.sku, undefined);
assert.equal(quoteLine.options.woo_variation_id, undefined);
assert.equal(JSON.stringify(quoteLine).includes("INVENTED"), false);

const simpleWidget = toWidgetMatrixProduct({
  externalId: "7",
  name: "Table simple",
  sku: "SIMPLE-1",
  options: [{ key: "finition", label: "Finition", kind: "text", value: "Brut" }],
  variants: [],
});
assert.ok(simpleWidget);
if (!simpleWidget) throw new Error("simple");
assert.deepEqual(simpleWidget.axes, []);
assert.deepEqual(simpleWidget.variations, []);

const simpleLine = bindWidgetLines(
  [
    {
      productId: "7",
      variationId: "",
      name: "Table simple",
      qty: 2,
      sku: "INVENTED-SKU",
      variation: "inventée",
      url: "",
    },
  ],
  [simpleWidget],
);
assert.equal(simpleLine.ok, true);
if (!simpleLine.ok) throw new Error("simple line");
assert.equal(simpleLine.lines[0]?.variationId, "");
assert.equal(simpleLine.lines[0]?.sku, "SIMPLE-1");
assert.equal(simpleLine.lines[0]?.variation, "");
assert.equal(JSON.stringify(simpleLine).includes("INVENTED"), false);

const simpleRejected = bindWidgetLines(
  [
    {
      productId: "7",
      variationId: "55",
      name: "Table simple",
      qty: 1,
      sku: "INVENTED-SKU",
      variation: "",
      url: "",
    },
  ],
  [simpleWidget],
);
assert.equal(simpleRejected.ok, false);
if (simpleRejected.ok) throw new Error("simple rejected");
assert.equal(JSON.stringify(simpleRejected).includes("INVENTED"), false);

const untouched = resolveCatalogLine({
  variants: [],
  axes: [],
  selection: { finition: "brut", sku: "INVENTED-SKU", woo_variation_id: "55" },
  parentSku: "SIMPLE-1",
});
assert.equal(untouched.ok, true);
if (!untouched.ok) throw new Error("untouched");
assert.equal(untouched.line.variationId, "");
assert.equal(untouched.line.sku, "SIMPLE-1");
assert.equal(untouched.line.options.finition, "brut");
assert.equal(untouched.line.options.sku, undefined);

const kept = storedVariantsForSync(
  [],
  [{ externalId: "11", title: "Bleu", sku: "REAL-11", price: 180, available: true, selected: { couleur: "bleu" } }],
  false,
);
assert.equal(kept[0]?.externalId, "11");
assert.equal(kept[0]?.sku, "REAL-11");

const merged = storedVariantsForSync(
  [{ externalId: "12", title: "Rouge", sku: "REAL-12", price: 210, available: false, selected: { couleur: "rouge" } }],
  [{ externalId: "11", title: "Bleu", sku: "REAL-11", price: 180, available: true, selected: { couleur: "bleu" } }],
  false,
);
assert.deepEqual(
  merged.map((variant) => variant.externalId),
  ["12", "11"],
);

const replaced = storedVariantsForSync([], [{ externalId: "11", title: "Bleu", sku: "REAL-11", price: 1, available: true, selected: {} }], true);
assert.deepEqual(replaced, []);

const options = storedOptionsForSync(choices, [
  { key: "finition", label: "Finition atelier", kind: "text", value: "Laqué" },
]);
assert.equal(options.some((row) => row.key === "finition"), true);
assert.equal(options.some((row) => row.key === "couleur"), true);

async function main() {
  let calls = 0;
  const paged = await collectPaged(async (page) => {
    calls += 1;
    if (page === 1) return { items: Array.from({ length: 100 }, (_, index) => index + 1), totalPages: 2 };
    return { items: Array.from({ length: 20 }, (_, index) => 101 + index), totalPages: 2 };
  });
  assert.equal(paged.complete, true);
  assert.equal(paged.items.length, 120);
  assert.equal(paged.items[0], 1);
  assert.equal(paged.items[119], 120);
  assert.equal(calls, 2);

  const cut = await collectPaged(async () => ({ items: Array.from({ length: 100 }, () => 1), totalPages: 3 }), 100, 1);
  assert.equal(cut.complete, false);
  assert.equal(cut.items.length, 100);

  console.log("variant-matrix.test.ts ok");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
