import assert from "node:assert/strict";
import { attributesToSpecs, mergeProductSpecs, parseProductSpecs } from "@/lib/catalog/specs";

const specs = parseProductSpecs({
  charge: { label: "Charge", value: "400", unit: "kg/niveau" },
  materiau: { label: "Matériau", value: "Acier époxy" },
  skip: { label: "", value: "x" },
  bad: "nope",
});

assert.deepEqual(specs.charge, { label: "Charge", value: "400", unit: "kg/niveau" });
assert.deepEqual(specs.materiau, { label: "Matériau", value: "Acier époxy" });
assert.equal(specs.skip, undefined);
assert.equal(specs.bad, undefined);
assert.deepEqual(parseProductSpecs(null), {});
assert.deepEqual(parseProductSpecs([]), {});

const fromWoo = attributesToSpecs([
  { key: "hauteur", label: "Hauteur", kind: "number", value: "215", unit: "cm" },
  { key: "coloris", label: "Coloris", kind: "choices", values: [{ value: "rouge", label: "Rouge" }] },
]);
assert.deepEqual(fromWoo.hauteur, { label: "Hauteur", value: "215", unit: "cm" });
assert.equal(fromWoo.coloris, undefined);

const merged = mergeProductSpecs(
  [{ key: "hauteur", label: "Hauteur", kind: "number", value: "215", unit: "cm" }],
  { charge: { label: "Charge", value: "400", unit: "kg" } },
);
assert.equal(merged.hauteur?.value, "215");
assert.equal(merged.charge?.value, "400");

console.log("specs.test.ts ok");
