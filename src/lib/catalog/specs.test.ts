import assert from "node:assert/strict";
import { parseProductSpecs } from "@/lib/catalog/specs";

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

console.log("specs.test.ts ok");
