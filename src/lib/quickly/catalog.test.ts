import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { missingRackingSpecs, toProductSpecs } from "@/lib/catalog/specs";
import { QUICKLY_PRODUCTS, QUICKLY_STOCK_LEAD } from "@/lib/quickly/catalog";

const seedSource = readFileSync(new URL("./seed.ts", import.meta.url), "utf8");
const cliSource = readFileSync(new URL("./cli.ts", import.meta.url), "utf8");
assert.equal(/resend|sendTemplateEmail|inviteMember|generateLink|auth\.admin/i.test(seedSource + cliSource), false);

assert.ok(QUICKLY_PRODUCTS.length >= 3);

for (const product of QUICKLY_PRODUCTS) {
  const specs = toProductSpecs(product.options);
  assert.deepEqual(missingRackingSpecs(product.options), [], product.sku);
  const charge = specs.find((spec) => spec.key === "charge");
  const hauteur = specs.find((spec) => spec.key === "hauteur");
  const profondeur = specs.find((spec) => spec.key === "profondeur");
  assert.equal(charge?.unit, "kg", product.sku);
  assert.equal(hauteur?.unit, "mm", product.sku);
  assert.equal(profondeur?.label, "Profondeur lisse", product.sku);
  assert.equal(specs.find((spec) => spec.key === "delai")?.value, QUICKLY_STOCK_LEAD);
  assert.equal(/kg|mm|galvanis/i.test(product.description), false, product.sku);
}
