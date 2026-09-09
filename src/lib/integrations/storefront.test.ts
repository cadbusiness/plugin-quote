import assert from "node:assert/strict";
import { DEFAULT_STOREFRONT, parseStorefront } from "@/lib/integrations/storefront";

const empty = parseStorefront({});
assert.equal(empty.buttonLabel, DEFAULT_STOREFRONT.buttonLabel);
assert.equal(empty.stockMode, "all");
assert.equal(empty.outOfStockOnly, false);
assert.equal(empty.audience, "all");
assert.deepEqual(empty.tagIds, []);

const legacy = parseStorefront({
  audience: "logged_in",
  outOfStockOnly: true,
  buttonBg: "#111111",
  afterAdd: "list",
  productIds: ["12", "13"],
});
assert.equal(legacy.stockMode, "oos_only");
assert.equal(legacy.outOfStockOnly, true);
assert.equal(legacy.buttonBorder, "#111111");
assert.equal(legacy.afterAdd, "list");
assert.deepEqual(legacy.productIds, ["12", "13"]);
assert.equal(legacy.showOnBlocks, true);

const merged = parseStorefront({
  ...legacy,
  audience: "roles",
  roles: ["wholesale", "shop_manager"],
  stockMode: "hide_oos",
  scope: "exclude",
  tagIds: "4, 8",
  afterAdd: "notice",
  pageLayout: "stack",
  formTitle: "",
});
assert.equal(merged.audience, "roles");
assert.deepEqual(merged.roles, ["wholesale", "shop_manager"]);
assert.equal(merged.stockMode, "hide_oos");
assert.equal(merged.outOfStockOnly, false);
assert.equal(merged.scope, "exclude");
assert.deepEqual(merged.tagIds, ["4", "8"]);
assert.equal(merged.afterAdd, "notice");
assert.equal(merged.pageLayout, "stack");
assert.equal(merged.formTitle, "");
assert.equal(merged.listTitle, DEFAULT_STOREFRONT.listTitle);

console.log("integrations/storefront ok");
