import assert from "node:assert/strict";
import {
  shopDevisRedirectFromFunnel,
  shopHintFromSearch,
  type FromShopLookup,
} from "./from-shop";

const published: FromShopLookup = {
  slug: "vitrine",
  status: "published",
  funnelSlug: "rayonnage",
};

function dest(partial: {
  shopHint?: string | null;
  shop?: FromShopLookup | null;
  search?: string | Record<string, string | string[] | undefined>;
  orgSlug?: string;
  configuratorSlug?: string;
}) {
  return shopDevisRedirectFromFunnel({
    orgSlug: partial.orgSlug ?? "demo",
    configuratorSlug: partial.configuratorSlug ?? "rayonnage",
    shopHint: partial.shopHint === undefined ? "vitrine" : partial.shopHint,
    shop: partial.shop === undefined ? published : partial.shop,
    search: partial.search,
  });
}

assert.equal(shopHintFromSearch({}), null);
assert.equal(shopHintFromSearch("?utm_source=google"), null);
assert.equal(shopHintFromSearch({ fromShop: "vitrine" }), "vitrine");
assert.equal(shopHintFromSearch("?fromShop=vitrine&product=sku-1"), "vitrine");
assert.equal(shopHintFromSearch({ shopSlug: "espace-demo" }), "espace-demo");
assert.equal(shopHintFromSearch({ shop: "vitrine" }), "vitrine");
assert.equal(shopHintFromSearch({ fromShop: "vitrine", shop: "other" }), "vitrine");
assert.equal(shopHintFromSearch({ fromShop: "../evil" }), null);
assert.equal(shopHintFromSearch({ fromShop: "//evil.test" }), null);
assert.equal(shopHintFromSearch({ fromShop: "" }), null);

{
  // valid fromShop → shop-local devis
  assert.equal(dest({}), "/b/demo/vitrine/devis");
}

{
  // without fromShop → no redirect (bare /c/demo/rayonnage)
  assert.equal(dest({ shopHint: null }), null);
  assert.equal(shopHintFromSearch(undefined), null);
}

{
  // unknown shop → no redirect
  assert.equal(dest({ shop: null }), null);
}

{
  // unpublished / archived / missing catalog / other funnel → stay on /c/
  assert.equal(dest({ shop: { ...published, status: "draft" } }), null);
  assert.equal(dest({ shop: { ...published, status: "archived" } }), null);
  assert.equal(dest({ shop: { ...published, funnelSlug: null } }), null);
  assert.equal(dest({ shop: { ...published, funnelSlug: "autre-catalogue" } }), null);
  assert.equal(dest({ orgSlug: "acme", configuratorSlug: "rayonnage", shop: { ...published, funnelSlug: "principal" } }), null);
}

{
  // demo aliases: /c/demo/principal?fromShop=vitrine still owns rayonnage
  assert.equal(
    dest({ configuratorSlug: "principal", shop: { ...published, funnelSlug: "rayonnage" } }),
    "/b/demo/vitrine/devis",
  );
}

{
  // canonical shop slug (after alias resolve) + safe query preserved, hint stripped
  assert.equal(
    dest({
      shopHint: "espace-demo",
      shop: published,
      search: { fromShop: "espace-demo", product: "sku-1", utm_campaign: "search-rayonnage", next: "/evil" },
    }),
    "/b/demo/vitrine/devis?product=sku-1&utm_campaign=search-rayonnage",
  );
}

{
  assert.equal(
    dest({ search: "?fromShop=vitrine&gclid=abc&qb_vid=vid-1" }),
    "/b/demo/vitrine/devis?gclid=abc&qb_vid=vid-1",
  );
}

console.log("shops/from-shop ok");
