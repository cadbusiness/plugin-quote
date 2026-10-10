import assert from "node:assert/strict";
import { hasRealConstraint, scoreQuote, scoreReasons } from "./score";

const bare = scoreQuote({});
assert.equal(scoreQuote({ constraints: ["none"] }).score, bare.score);
assert.equal(scoreQuote({ constraints: ["aucune"] }).score, bare.score);
assert.equal(scoreQuote({ constraints: ["none", "aucune"] }).score, bare.score);
assert.equal(scoreQuote({ constraints: [] }).score, bare.score);
assert.equal(scoreQuote({ constraints: ["access"] }).score, bare.score + 5);
assert.equal(scoreQuote({ constraints: ["none", "height"] }).score, bare.score + 5);

assert.equal(hasRealConstraint(["none"]), false);
assert.equal(hasRealConstraint(["aucune"]), false);
assert.equal(hasRealConstraint(["Aucune"]), false);
assert.equal(scoreReasons({ constraints: ["none"] }).includes("Contraintes techniques"), false);
assert.equal(scoreReasons({ constraints: ["aucune"] }).includes("Contraintes techniques"), false);
assert.equal(scoreReasons({ constraints: ["height"] }).includes("Contraintes techniques"), true);

console.log("quotes/score.test.ts: ok");

// Template funnels store the load as a band: it must score like the kg values.
{
  const heavy = scoreQuote({ surface: 0, load: "heavy" });
  const kg = scoreQuote({ surface: 0, load: 900 });
  assert.equal(heavy.score, kg.score);
  assert.ok(scoreQuote({ load: "medium" }).score > scoreQuote({ load: "light" }).score);
  assert.ok(scoreReasons({ load: "heavy" }).includes("Charge lourde"));
  assert.ok(!scoreReasons({ access: "haute" }).includes("Accès difficile"));
}
