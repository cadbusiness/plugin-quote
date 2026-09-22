import assert from "node:assert/strict";
import { normalizeAttributes, toProspectOptions } from "./attributes";
import {
  mapWooCatalogAttributes,
  mapWooProductSpecs,
  mergeProductSpecs,
  missingRackingSpecs,
  parseColumnSpecs,
  parseProductSpecs,
  publicProductSpecs,
  readSpecsField,
  storedSpecsForSync,
  toProductSpecs,
  wooSpecsWrite,
  type ProductSpecs,
} from "./specs";

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

const quickly: ProductSpecs = {
  charge: { label: "Charge", value: "1000", unit: "kg/niveau" },
  hauteur: { label: "Hauteur", value: "250", unit: "cm" },
  profondeur: { label: "Profondeur", value: "60", unit: "cm" },
  materiau: { label: "Matériau", value: "Acier galvanisé", unit: "" },
  delai: { label: "Délai", value: "5", unit: "jours" },
};

{
  const parsed = parseColumnSpecs(JSON.stringify(quickly));
  assert.deepEqual(parsed, quickly);
  assert.deepEqual(Object.keys(parsed), ["charge", "hauteur", "profondeur", "materiau", "delai"]);
}

{
  const parsed = parseColumnSpecs({
    pa_charge: "1000 kg/niveau",
    Hauteur: { label: "Hauteur utile", value: "2,5", unit: "m" },
    couleur: "bleu",
    description: "ne doit pas être lu comme une spec",
  });
  assert.deepEqual(parsed.charge, { label: "Charge", value: "1000", unit: "kg/niveau" });
  assert.deepEqual(parsed.hauteur, { label: "Hauteur utile", value: "2,5", unit: "m" });
  assert.equal(parsed.materiau, undefined);
  assert.equal("couleur" in parsed, false);
}

{
  const fromAttributes = mapWooProductSpecs({
    attributes: [
      { name: "Charge", slug: "pa_charge", visible: true, variation: false, options: ["1000 kg/niveau"] },
      { name: "Hauteur", slug: "pa_hauteur", options: ["250cm"] },
      { name: "Profondeur", slug: "pa_profondeur", options: ["60 cm"] },
      { name: "Matériau", slug: "pa_materiau", options: ["Acier galvanisé"] },
      { name: "Délai", slug: "pa_delai", options: ["5 jours"] },
      { name: "Couleur", slug: "pa_couleur", variation: true, options: ["Bleu", "Galvanisé"] },
    ],
    meta_data: [
      { key: "charge", value: "1 kg" },
      { key: "_qb_specs", value: { charge: { label: "Charge", value: "1", unit: "kg" } } },
    ],
  });
  assert.deepEqual(fromAttributes.charge, { label: "Charge", value: "1000", unit: "kg/niveau" });
  assert.deepEqual(fromAttributes.hauteur, { label: "Hauteur", value: "250", unit: "cm" });
  assert.deepEqual(fromAttributes.profondeur, { label: "Profondeur", value: "60", unit: "cm" });
  assert.deepEqual(fromAttributes.materiau, { label: "Matériau", value: "Acier galvanisé", unit: "" });
  assert.deepEqual(fromAttributes.delai, { label: "Délai", value: "5", unit: "jours" });
  assert.equal("couleur" in fromAttributes, false);
}

{
  const ignored = mapWooProductSpecs({
    attributes: [{ name: "Charge", slug: "pa_charge", options: [""] }],
    meta_data: [],
    description: "Charge : 9999 kg/niveau. Hauteur 9 m. Profondeur 9 cm. Matériau bois. Délai 1 jour.",
  });
  assert.deepEqual(ignored, {});
}

{
  const fromMeta = mapWooProductSpecs({
    attributes: [{ name: "Couleur", slug: "pa_couleur", variation: true, options: ["Bleu", "Rouge"] }],
    meta_data: [
      { key: "attribute_pa_charge", value: "800 kg/niveau" },
      {
        key: "_qb_specs",
        value: JSON.stringify({
          charge: { label: "Charge", value: "1000", unit: "kg/niveau" },
          materiau: { value: "Inox" },
          delai: "3 semaines",
          inconnu: { value: "x" },
        }),
      },
      { key: "pa_hauteur", value: "200 cm" },
    ],
  });
  assert.deepEqual(fromMeta.charge, { label: "Charge", value: "1000", unit: "kg/niveau" });
  assert.deepEqual(fromMeta.hauteur, { label: "Hauteur", value: "200", unit: "cm" });
  assert.deepEqual(fromMeta.materiau, { label: "Matériau", value: "Inox", unit: "" });
  assert.deepEqual(fromMeta.delai, { label: "Délai", value: "3", unit: "semaines" });
}

{
  const variationOnly = mapWooProductSpecs({
    attributes: [{ name: "Charge", slug: "pa_charge", variation: true, options: ["500 kg", "1000 kg"] }],
  });
  assert.deepEqual(variationOnly, {});
}

{
  const columnMerged = mergeProductSpecs(
    { charge: { label: "Charge", value: "1200", unit: "kg/niveau" } },
    quickly,
  );
  assert.equal(columnMerged.charge?.value, "1200");
  assert.equal(columnMerged.hauteur?.value, "250");
  assert.deepEqual(mergeProductSpecs({}, quickly), quickly);
  assert.deepEqual(parseColumnSpecs("{"), {});
}

{
  const write = wooSpecsWrite(quickly, {
    attributes: [
      { id: 4, name: "Couleur", slug: "pa_couleur", variation: true, options: ["Bleu"] },
      { id: 9, name: "Charge", slug: "pa_charge", visible: true, variation: false, options: ["500 kg"] },
    ],
    meta_data: [{ id: 3, key: "_qb_specs", value: {} }],
  });
  assert.equal(write.attributes?.length, 6);
  assert.deepEqual(write.attributes?.[0]?.options, ["Bleu"]);
  assert.deepEqual(write.attributes?.[1]?.options, ["1000 kg/niveau"]);
  assert.equal(write.attributes?.find((attr) => attr.name === "Hauteur")?.variation, false);
  const qb = write.meta_data.find((meta) => meta.key === "_qb_specs");
  assert.equal(qb?.id, 3);
  assert.equal((qb?.value as ProductSpecs).charge?.unit, "kg/niveau");
  assert.equal(write.meta_data.find((meta) => meta.key === "materiau")?.value, "Acier galvanisé");
}

{
  const blind = wooSpecsWrite(quickly);
  assert.equal(blind.attributes, undefined);
  assert.ok(blind.meta_data.some((meta) => meta.key === "charge" && meta.value === "1000 kg/niveau"));
}

{
  assert.deepEqual(parseColumnSpecs(JSON.stringify(parseColumnSpecs(quickly))), quickly);
  const form = new FormData();
  form.set("specs", JSON.stringify(quickly));
  assert.deepEqual(readSpecsField(form), quickly);
  const broken = new FormData();
  broken.set("specs", "{");
  assert.equal(readSpecsField(broken), null);
  const explicitEmptyUnit = parseColumnSpecs({
    charge: { label: "Charge", value: "1000 kg/niveau", unit: "" },
  });
  assert.equal(explicitEmptyUnit.charge?.value, "1000 kg/niveau");
  assert.equal(explicitEmptyUnit.charge?.unit, "");
}

{
  const kept = mergeProductSpecs(
    { charge: { label: "Charge", value: "1000 kg/niveau", unit: "" } },
    quickly,
  );
  assert.deepEqual(kept.charge, quickly.charge);
  assert.deepEqual(kept.materiau, quickly.materiau);
}

{
  const written = wooSpecsWrite(quickly, { attributes: [], meta_data: [] });
  const readBack = mapWooProductSpecs({
    attributes: written.attributes,
    meta_data: written.meta_data,
  });
  assert.deepEqual(readBack, quickly);

  const customLabel = {
    charge: { label: "Charge utile", value: "1000", unit: "kg/niveau" },
  } satisfies ProductSpecs;
  const customWrite = wooSpecsWrite(customLabel, { attributes: [], meta_data: [] });
  assert.equal(
    mapWooProductSpecs({ attributes: customWrite.attributes, meta_data: customWrite.meta_data }).charge?.label,
    "Charge utile",
  );
}

{
  const keptExtras = storedSpecsForSync(
    { charge: { label: "Charge", value: "1200", unit: "kg/niveau" } },
    {
      charge: { label: "Charge", value: "1000", unit: "kg/niveau", valueAlt: "1 t" },
      finition: { label: "Finition", value: "Époxy", valueAlt: "Epoxy" },
    },
  );
  assert.equal((keptExtras?.charge as ProductSpecs["charge"])?.value, "1200");
  assert.equal((keptExtras?.charge as { valueAlt?: string }).valueAlt, undefined);
  assert.deepEqual(keptExtras?.finition, { label: "Finition", value: "Époxy", valueAlt: "Epoxy" });
  assert.equal(storedSpecsForSync({}, { finition: { label: "Finition", value: "Époxy" } }), null);
}

console.log("specs.test.ts ok");
