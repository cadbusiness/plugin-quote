import assert from "node:assert/strict";
import { railSummary, screenRailKind } from "./builder";

assert.equal(screenRailKind("questions", "form"), "Question");
assert.equal(screenRailKind("suggestions", "form"), "Résultat");
assert.equal(screenRailKind("suggestions", "catalog"), "Rayons");
assert.equal(screenRailKind("customize", "catalog"), "Devis");
assert.equal(screenRailKind("questions", "chat"), "Bloc");
assert.equal(railSummary("contact", []), "Email obligatoire");
assert.equal(railSummary("questions", []), "Aucun champ");
assert.equal(
  railSummary("questions", [{ options: { choices: [{ value: "a" }, { value: "b" }] } }]),
  "2 options",
);
assert.equal(railSummary("questions", [{}, {}]), "2 champs");

console.log("funnels/builder ok");
