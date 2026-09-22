import assert from "node:assert/strict";
import { formatQuoteSpecs, orderedSpecRows, parseProductSpecs, WOO_SPEC_ATTRIBUTES } from "@/lib/catalog/specs";

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
assert.deepEqual(
  orderedSpecRows(specs).map((row) => row.display),
  ["400 kg/niveau", "Acier époxy"],
);
assert.equal(
  formatQuoteSpecs([{ productId: "p1", name: "Cantilever", specs }]),
  "Cantilever — Charge 400 kg/niveau, Matériau Acier époxy",
);
assert.equal(WOO_SPEC_ATTRIBUTES.charge, "pa_charge");
assert.equal(WOO_SPEC_ATTRIBUTES.delai, "pa_delai");

console.log("specs.test.ts ok");
