import assert from "node:assert/strict";
import { normalizeAttributes, toProspectOptions } from "./attributes";
import { mapWooCatalogAttributes, missingRackingSpecs, parseProductSpecs, publicProductSpecs, toProductSpecs } from "./specs";

const stored = parseProductSpecs({
  charge: { label: "Charge", value: "400", unit: "kg/niveau" },
  materiau: { label: "Matériau", value: "Acier époxy" },
  skip: { label: "", value: "x" },
  bad: "nope",
});

assert.deepEqual(stored.charge, { label: "Charge", value: "400", unit: "kg/niveau" });
assert.deepEqual(stored.materiau, { label: "Matériau", value: "Acier époxy" });
assert.equal(stored.skip, undefined);
assert.equal(stored.bad, undefined);
assert.deepEqual(parseProductSpecs(null), {});
assert.deepEqual(parseProductSpecs([]), {});

const mapped = mapWooCatalogAttributes(
  {
    attributes: [
      { name: "Couleur", variation: true, options: ["Bleu RAL 5010", "Galvanisé"] },
      { name: "Hauteur", variation: true, options: ["1570 mm", "2500 mm"] },
      { name: "Profondeur", variation: false, options: ["300 mm", "800 mm"] },
      { name: "Matériau", variation: false, options: ["Acier galvanisé"] },
    ],
    dimensions: { length: "120", width: "80", height: "0" },
    weight: "12",
    meta_data: [
      { key: "_price", value: "10" },
      { key: "yoast_wpseo_title", value: "SEO" },
      { key: "delai", value: "Stock entrepôt 2500 m²" },
    ],
    description: "<p>Jusqu'à 280 kg par niveau de tablette. Charge : 100 kg</p>",
  },
  { dimension: "cm", weight: "kg" },
);

const specs = toProductSpecs(mapped);
const byKey = Object.fromEntries(specs.map((spec) => [spec.key, spec]));

assert.equal(toProspectOptions(normalizeAttributes(mapped)).some((option) => option.label === "Couleur"), true);
assert.equal(byKey.couleur, undefined);
assert.equal(byKey.hauteur?.value, "2500");
assert.equal(byKey.hauteur?.unit, "mm");
assert.equal(byKey.profondeur?.value, "300–800");
assert.equal(byKey.profondeur?.unit, "mm");
assert.equal(byKey.materiau?.value, "Acier galvanisé");
assert.equal(byKey.delai?.value, "Stock entrepôt 2500 m²");
assert.equal(byKey.charge?.value, "280");
assert.equal(byKey.charge?.unit, "kg");
assert.equal(byKey.longueur?.value, "120");
assert.equal(byKey.longueur?.unit, "cm");
assert.equal(byKey.poids?.value, "12");
assert.equal(byKey.poids?.unit, "kg");
assert.notEqual(specs.some((spec) => spec.value === "0"), true);

const fromDescriptionOnly = toProductSpecs(
  mapWooCatalogAttributes({
    description: "Hauteur max : 2500 mm. Profondeur lisse : 300–800 mm. Matériau : Acier galvanisé. Délai de livraison : Stock entrepôt.",
    short_description: "Jusqu'à 800 kg par niveau",
  }),
);
assert.deepEqual(missingRackingSpecs(fromDescriptionOnly), []);

const kept = mapWooCatalogAttributes({
  attributes: [{ name: "Charge", variation: false, options: ["1000 kg"] }],
  description: "Jusqu'à 280 kg par niveau",
});
assert.equal(toProductSpecs(kept).find((spec) => spec.key === "charge")?.value, "1000");

const merged = publicProductSpecs(mapped, {
  charge: { label: "Charge", value: "400", unit: "kg" },
  finition: { label: "Finition", value: "Époxy", valueAlt: "Epoxy" },
});
assert.equal(merged.find((spec) => spec.key === "charge")?.value, "280");
assert.deepEqual(merged.find((spec) => spec.key === "finition"), {
  key: "finition",
  label: "Finition",
  value: "Époxy",
  valueAlt: "Epoxy",
});
assert.deepEqual(publicProductSpecs([{ key: "couleur", label: "Couleur", kind: "choices", values: [] }], stored).find((spec) => spec.key === "charge")?.value, "400");

console.log("specs.test.ts ok");
