import assert from "node:assert/strict";
import { applyStorefrontCart } from "./storefront-cart";
import type { Customization, Product } from "./types";

function product(partial: Partial<Product> & Pick<Product, "id" | "name">): Product {
  return {
    description: null,
    imageUrl: null,
    images: [],
    priceMin: null,
    priceMax: null,
    currency: "EUR",
    tags: [],
    category: null,
    options: [],
    stockStatus: null,
    externalId: null,
    sku: null,
    ...partial,
  };
}

const empty: Customization = { quantities: {}, options: {} };

{
  const catalog = [product({ id: "native-1", name: "Bardage", sku: "BB-1" })];
  const applied = applyStorefrontCart(catalog, [{ id: "native-1", qty: 2 }], empty);
  assert.equal(applied.matched[0]?.id, "native-1");
  assert.equal(applied.customization.quantities["native-1"], 2);
}

{
  const catalog = [product({ id: "p1", name: "Lisse", sku: "QB-A" })];
  const applied = applyStorefrontCart(catalog, [{ id: "QB-A", qty: 3, name: "Lisse" }], empty);
  assert.equal(applied.matched[0]?.id, "p1");
  assert.equal(applied.customization.quantities.p1, 3);
}

{
  const catalog = [product({ id: "p2", name: "Woo", externalId: "woo-88" })];
  const applied = applyStorefrontCart(catalog, [{ id: "woo-88", qty: 1 }], empty);
  assert.equal(applied.matched[0]?.id, "p2");
}

{
  const applied = applyStorefrontCart([], [{ id: "missing", qty: 1, name: "Inconnu" }], empty);
  assert.equal(applied.matched.length, 0);
  assert.equal(applied.customization.storefrontLines?.[0]?.externalId, "missing");
}

console.log("wizard/storefront-cart ok");
