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

const products = [
  { id: "e4bc7d9f-d6e2-4f4c-b6eb-1023ea99d410", name: "Rayonnage palettes lourd", sku: "PAL-1", externalId: "42" },
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
  assert.equal(result.answers.precision, "Ajouté au devis : Rayonnage palettes lourd");
  assert.equal(result.answers.besoin, undefined);
  assert.equal(result.focusStep, null);
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
  assert.equal(bySku.answers.precision, "Hauteur 6 m\nAjouté au devis : Rayonnage palettes lourd");
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
