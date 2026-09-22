import assert from "node:assert/strict";
import { applyFunnelPrefill, matchChoice, readPrefillParams } from "@/lib/configurator/prefill";
import type { WizardStep } from "@/lib/wizard/types";

const choices = [
  { value: "rayonnages", label: "Rayonnages" },
  { value: "rack_palettes", label: "Rack à palettes" },
  { value: "plateformes", label: "Plateformes" },
  { value: "cantilever", label: "Cantilever" },
  { value: "mezzanine", label: "Mezzanine" },
  { value: "leger", label: "Rayonnage léger" },
  { value: "autre", label: "Autre / à préciser" },
];

const steps = [
  {
    id: "s1",
    title: "Votre besoin",
    subtitle: null,
    screenType: "questions",
    sortOrder: 0,
    questions: [
      {
        id: "q1",
        key: "besoin",
        label: "Que souhaitez-vous équiper ?",
        helpText: null,
        type: "multi_select",
        required: true,
        sortOrder: 0,
        options: { choices },
      },
    ],
  },
  {
    id: "s2",
    title: "Dimensions & contraintes",
    subtitle: null,
    screenType: "questions",
    sortOrder: 1,
    questions: [
      {
        id: "q2",
        key: "precision",
        label: "Précisions libres",
        helpText: null,
        type: "text",
        required: false,
        sortOrder: 0,
        options: {},
      },
    ],
  },
] satisfies WizardStep[];

const paletteSpecs = [
  { key: "charge", label: "Charge", value: "1000", unit: "kg/niveau" },
  { key: "hauteur", label: "Hauteur max", value: "12", unit: "m" },
  { key: "profondeur", label: "Profondeur", value: "1100", unit: "mm" },
  { key: "materiau", label: "Matériau", value: "Acier peint / galva" },
  { key: "delai", label: "Délai indicatif", value: "2–4", unit: "semaines" },
];

const products = [
  {
    id: "e4bc7d9f-d6e2-4f4c-b6eb-1023ea99d410",
    name: "Rayonnage palettes lourd",
    sku: "PAL-1",
    externalId: "42",
    tags: ["palettes"],
    specs: paletteSpecs,
  },
  {
    id: "cant-1",
    name: "Cantilever",
    sku: null,
    externalId: null,
    specs: [
      { key: "charge", label: "Charge bras", value: "500", unit: "kg", valueAlt: "par bras" },
      { key: "hauteur", label: "Hauteur colonne", value: "6", unit: "m" },
      { key: "profondeur", label: "Portée bras", value: "1200", unit: "mm" },
      { key: "materiau", label: "Matériau", value: "Acier / galva" },
      { key: "delai", label: "Délai indicatif", value: "3–5", unit: "semaines" },
    ],
  },
];

assert.equal(matchChoice("Rayonnages", choices), "rayonnages");
assert.equal(matchChoice("rack à palettes", choices), "rack_palettes");
assert.equal(matchChoice("rayonnage-leger", choices), "leger");
assert.equal(matchChoice("inconnu", choices), null);

assert.deepEqual(readPrefillParams("?besoin=rayonnages,cantilever&add=42&product=PAL-1"), {
  besoin: ["rayonnages", "cantilever"],
  add: ["42", "PAL-1"],
});

const empty = { quantities: {}, options: {} };

{
  const result = applyFunnelPrefill({
    search: "?besoin=rayonnages",
    steps,
    products,
    answers: {},
    customization: empty,
  });
  assert.equal(result.changed, true);
  assert.equal(result.focusStep, 0);
  assert.deepEqual(result.answers.besoin, ["rayonnages"]);
  assert.deepEqual(result.productIds, []);
}

{
  const result = applyFunnelPrefill({
    search: "?besoin=Rayonnages,Rack à palettes&add=cantilever",
    steps,
    products,
    answers: { besoin: ["mezzanine"] },
    customization: empty,
  });
  assert.deepEqual(result.answers.besoin, ["mezzanine", "rayonnages", "rack_palettes", "cantilever"]);
}

{
  const result = applyFunnelPrefill({
    search: `?add=${products[0].id}`,
    steps,
    products,
    answers: {},
    customization: empty,
  });
  assert.deepEqual(result.productIds, [products[0].id]);
  assert.equal(result.customization.quantities[products[0].id], 1);
  assert.deepEqual(result.answers.besoin, ["rack_palettes"]);
  assert.equal(result.focusStep, 0);
  assert.equal(result.answers.precision, undefined);
  assert.equal(result.customization.options[products[0].id]?.charge, "1000 kg/niveau");
  assert.equal(result.customization.options[products[0].id]?.delai, "2–4 semaines");
  const snapshot = result.answers.specs;
  assert.ok(Array.isArray(snapshot));
  assert.equal((snapshot as { name: string }[])[0]?.name, "Rayonnage palettes lourd");
}

{
  const bySku = applyFunnelPrefill({
    search: "?add=42,PAL-1",
    steps,
    products,
    answers: { precision: "Hauteur 6 m" },
    customization: empty,
  });
  assert.equal(bySku.customization.quantities[products[0].id], 1);
  assert.equal(bySku.answers.precision, "Hauteur 6 m");
  assert.equal(bySku.customization.options[products[0].id]?.hauteur, "12 m");
}

{
  const named = applyFunnelPrefill({
    search: "?add=Cantilever",
    steps,
    products,
    answers: {},
    customization: empty,
  });
  assert.deepEqual(named.answers.besoin, ["cantilever"]);
  assert.equal(named.customization.options["cant-1"]?.charge, "500 kg (par bras)");
}

{
  const again = applyFunnelPrefill({
    search: "?besoin=rayonnages",
    steps,
    products,
    answers: { besoin: ["rayonnages"] },
    customization: empty,
  });
  assert.equal(again.changed, false);
}

{
  const unknown = applyFunnelPrefill({
    search: "?besoin=nope&add=missing",
    steps,
    products,
    answers: {},
    customization: empty,
  });
  assert.equal(unknown.changed, false);
}

console.log("prefill.test.ts ok");
