import assert from "node:assert/strict";
import { parsePluginQuote } from "./plugin-quote-body";

const empty = parsePluginQuote(null);
assert.equal(empty.ok, false);
if (!empty.ok) {
  assert.equal(empty.expected.email, "marie@exemple.com");
  assert.equal(typeof empty.expected.need, "string");
}

const nested = parsePluginQuote({
  message: "Rack 4 niveaux",
  contact: { name: "Marie Dupont", email: "marie@exemple.com", phone: "0470000000" },
  external_id: "wp-9",
  answers: { load: "800 kg" },
});
assert.equal(nested.ok, true);
if (nested.ok) {
  assert.equal(nested.quote.need, "Rack 4 niveaux");
  assert.equal(nested.quote.name, "Marie Dupont");
  assert.equal(nested.quote.externalId, "wp-9");
  assert.equal(nested.quote.answers.load, "800 kg");
}

const structured = parsePluginQuote({
  description: "Palettes de 800 kg",
  name: "Paul Martin",
  email: "paul@exemple.com",
  needs: ["rack", "rayonnage"],
  space: { length: "12 m", height: "4,5 m" },
  city: "Grâce-Hollogne",
  products: [{ id: "42", name: "Rayonnage super", qty: 2, variation: "Largeur 100 cm" }],
});
assert.equal(structured.ok, true);
if (structured.ok) {
  assert.equal(structured.quote.need, "Palettes de 800 kg");
  assert.deepEqual(structured.quote.needs, ["rack", "rayonnage"]);
  assert.equal(structured.quote.space.length, "12 m");
  assert.equal(structured.quote.space.city, "Grâce-Hollogne");
  assert.equal(structured.quote.products[0].name, "Rayonnage super");
  assert.equal(structured.quote.products[0].qty, 2);
}

const missingEmail = parsePluginQuote({ need: "Un rack", name: "Marie" });
assert.equal(missingEmail.ok, false);

console.log("integrations/plugin-quote ok");
