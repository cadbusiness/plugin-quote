import assert from "node:assert/strict";
import { collectCategoryStats, groupProductsByCategory, sourceSummary, UNCATEGORIZED } from "./group";
import { catalogDefaultName, parseFunnelKind, quoteLineCount } from "../funnels/kind";

const groups = groupProductsByCategory([
  { name: "Palette", category: "Rayonnage" },
  { name: "Crochet", category: "Accessoires" },
  { name: "Échelle", category: "Rayonnage" },
  { name: "Divers", category: "  " },
]);

assert.equal(groups.length, 3);
assert.equal(groups[0].label, "Accessoires");
assert.equal(groups[0].products.length, 1);
assert.equal(groups[1].label, "Rayonnage");
assert.equal(groups[1].products.length, 2);
assert.equal(groups[2].label, UNCATEGORIZED);

const stats = collectCategoryStats([
  { id: "1", category: "Bacs de rangement", source: "woocommerce", is_active: true, price_min: 8, price_max: 8 },
  { id: "2", category: "Bacs de rangement", source: "woocommerce", is_active: true, price_min: 25, price_max: 25 },
]);
assert.equal(stats[0].count, 2);
assert.equal(sourceSummary(stats[0].sources), "Tous WooCommerce");
assert.equal(stats[0].priceMin, 8);
assert.equal(stats[0].priceMax, 25);

assert.equal(parseFunnelKind({ kind: "catalog" }, true, false), "catalog");
assert.equal(parseFunnelKind({}, false, true), "chat");
assert.equal(parseFunnelKind({}, true, false), "form");
assert.equal(catalogDefaultName("Funnel rayonnage"), "Catalogue rayonnage");
assert.equal(quoteLineCount({ quantities: { a: 2, b: 0 }, storefrontLines: [{ quantity: 1 }] }), 3);

console.log("catalog/group + funnel kind ok");
