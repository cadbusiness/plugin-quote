import assert from "node:assert/strict";
import {
  gateShopCatalogRequest,
  productsWithinShopCatalog,
  restrictProductsToShopCatalog,
  shopCatalogError,
  shopConfiguratorApiPath,
  shopSuggestionsApiPath,
  type ShopCatalogResolve,
  type ShopCatalogScope,
} from "./catalog-scope";

const shopA: ShopCatalogScope = {
  organizationId: "org-1",
  orgSlug: "atelier",
  shopId: "shop-a",
  shopSlug: "vitrine-a",
  configuratorId: "catalog-a",
  configuratorSlug: "catalogue-a",
};

const resolvedA: ShopCatalogResolve = { ok: true, scope: shopA };

const catalog = [
  { id: "p1", name: "Travée A", configuratorId: "catalog-a" },
  { id: "p2", name: "Travée B (autre boutique)", configuratorId: "catalog-b" },
  { id: "p3", name: "Lisse A", configuratorId: "catalog-a" },
  { id: "p4", name: "Org-wide leftover", configuratorId: "org-default" },
];

{
  const scoped = restrictProductsToShopCatalog(catalog, shopA.configuratorId);
  assert.deepEqual(
    scoped.map((row) => row.id),
    ["p1", "p3"],
  );
  assert.equal(productsWithinShopCatalog(scoped, shopA.configuratorId), true);
  assert.equal(productsWithinShopCatalog(catalog, shopA.configuratorId), false);
  assert.equal(
    scoped.every((row) => row.configuratorId === shopA.configuratorId),
    true,
  );
}

{
  const empty = restrictProductsToShopCatalog(catalog, "");
  assert.deepEqual(empty, []);
}

{
  const allowed = gateShopCatalogRequest(resolvedA);
  assert.equal(allowed.ok, true);
  if (allowed.ok) assert.equal(allowed.scope.configuratorId, "catalog-a");
}

{
  const sameSlug = gateShopCatalogRequest(resolvedA, { configuratorSlug: "catalogue-a" });
  assert.equal(sameSlug.ok, true);
}

{
  const sameId = gateShopCatalogRequest(resolvedA, { configuratorId: "catalog-a" });
  assert.equal(sameId.ok, true);
}

{
  const otherId = gateShopCatalogRequest(resolvedA, { configuratorId: "catalog-b" });
  assert.equal(otherId.ok, false);
  if (!otherId.ok) {
    assert.equal(otherId.reason, "catalog_mismatch");
    assert.equal(otherId.status, 403);
    assert.equal(otherId.error, shopCatalogError("catalog_mismatch").error);
  }
}

{
  const otherSlug = gateShopCatalogRequest(resolvedA, { configuratorSlug: "catalogue-b" });
  assert.equal(otherSlug.ok, false);
  if (!otherSlug.ok) {
    assert.equal(otherSlug.reason, "catalog_mismatch");
    assert.equal(otherSlug.status, 403);
  }
}

{
  const orgWide = gateShopCatalogRequest(resolvedA, { configuratorId: "org-default", configuratorSlug: "principal" });
  assert.equal(orgWide.ok, false);
  if (!orgWide.ok) assert.equal(orgWide.reason, "catalog_mismatch");
}

{
  const missingShop = gateShopCatalogRequest({ ok: false, reason: "shop_unavailable" }, { configuratorId: "catalog-b" });
  assert.equal(missingShop.ok, false);
  if (!missingShop.ok) {
    assert.equal(missingShop.reason, "shop_unavailable");
    assert.equal(missingShop.status, 404);
  }
}

{
  const noCatalog = gateShopCatalogRequest({ ok: false, reason: "no_catalog" });
  assert.equal(noCatalog.ok, false);
  if (!noCatalog.ok) {
    assert.equal(noCatalog.reason, "no_catalog");
    assert.equal(noCatalog.status, 404);
    assert.equal(noCatalog.error, shopCatalogError("no_catalog").error);
  }
}

{
  // Public /c/ funnels do not go through this gate — only shop-scoped devis.
  const publicFunnelProducts = restrictProductsToShopCatalog(
    [
      { id: "c1", configuratorId: "funnel-public" },
      { id: "c2", configuratorId: "funnel-public" },
    ],
    "funnel-public",
  );
  assert.equal(productsWithinShopCatalog(publicFunnelProducts, "funnel-public"), true);
}

assert.equal(shopConfiguratorApiPath("demo", "vitrine"), "/api/public/shop/demo/vitrine/configurator");
assert.equal(
  shopSuggestionsApiPath("sess-1", "demo", "vitrine"),
  "/api/public/sessions/sess-1/suggestions?org=demo&shop=vitrine",
);
assert.ok(!shopConfiguratorApiPath("demo", "vitrine").includes("/api/public/configurator/"));

console.log("shops/catalog-scope ok");
