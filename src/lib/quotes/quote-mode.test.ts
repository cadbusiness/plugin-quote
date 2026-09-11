import assert from "node:assert/strict";
import { restrictProductsToShopCatalog } from "@/lib/shops/catalog-scope";
import {
  isRfqQuoteMode,
  parseQuoteMode,
  quoteModeFromTheme,
  quoteModeLabel,
  resolveQuoteMode,
  matchCatalogPrefill,
  scopeQuoteCatalog,
  themeWithQuoteMode,
} from "./quote-mode";

assert.equal(parseQuoteMode(undefined), null);
assert.equal(parseQuoteMode(""), null);
assert.equal(parseQuoteMode("nope"), null);
assert.equal(parseQuoteMode("configurator"), "configurator");
assert.equal(parseQuoteMode("rfq"), "rfq");
assert.equal(parseQuoteMode("RFQ"), "rfq");
assert.equal(parseQuoteMode("light"), "rfq");
assert.equal(parseQuoteMode("simple"), "rfq");

assert.equal(quoteModeFromTheme(null), null);
assert.equal(quoteModeFromTheme({}), null);
assert.equal(quoteModeFromTheme({ quoteMode: "rfq" }), "rfq");
assert.equal(quoteModeFromTheme({ quoteMode: "light" }), "rfq");
assert.equal(quoteModeFromTheme({ quoteMode: "configurator" }), "configurator");

assert.equal(resolveQuoteMode({}), "configurator");
assert.equal(resolveQuoteMode({ configuratorTheme: { kind: "catalog" } }), "configurator");
assert.equal(resolveQuoteMode({ configuratorTheme: { quoteMode: "rfq" } }), "rfq");
assert.equal(resolveQuoteMode({ shopTheme: { quoteMode: "simple" } }), "rfq");
assert.equal(
  resolveQuoteMode({
    shopTheme: { quoteMode: "rfq" },
    configuratorTheme: { quoteMode: "configurator" },
  }),
  "rfq",
  "shop override wins over linked funnel",
);
assert.equal(
  resolveQuoteMode({
    shopTheme: { accent: "#E85D04" },
    configuratorTheme: { quoteMode: "rfq" },
  }),
  "rfq",
  "shop without mode falls back to configurator theme",
);
assert.equal(
  resolveQuoteMode({
    shopTheme: { quoteMode: "configurator" },
    configuratorTheme: { quoteMode: "rfq" },
  }),
  "configurator",
  "shop can pin configurator even if funnel is RFQ",
);
assert.equal(
  resolveQuoteMode({
    shopTheme: { quoteMode: "garbage" },
    configuratorTheme: { quoteMode: "light" },
  }),
  "rfq",
);

assert.equal(isRfqQuoteMode("rfq"), true);
assert.equal(isRfqQuoteMode("configurator"), false);
assert.equal(quoteModeLabel("rfq"), "Demande simple");
assert.equal(quoteModeLabel("configurator"), "Configurateur");

const withKind = themeWithQuoteMode({ kind: "catalog", tracking: { ga: "G-1" } }, "rfq");
assert.equal((withKind as { quoteMode?: string }).quoteMode, "rfq");
assert.equal((withKind as { kind?: string }).kind, "catalog");
const cleared = themeWithQuoteMode(withKind, "configurator");
assert.equal((cleared as { quoteMode?: string }).quoteMode, undefined);
assert.equal((cleared as { kind?: string }).kind, "catalog");

const catalog = [
  { id: "p1", name: "Travée A", configuratorId: "catalog-a" },
  { id: "p2", name: "Travée B (autre boutique)", configuratorId: "catalog-b" },
  { id: "p3", name: "Lisse A", configuratorId: "catalog-a" },
];

{
  const publicFunnel = scopeQuoteCatalog(catalog, { shopSlug: null, shopConfiguratorId: "catalog-a" });
  assert.deepEqual(
    publicFunnel.map((row) => row.id),
    ["p1", "p2", "p3"],
    "public /c/ without shopSlug keeps the funnel catalog",
  );
}

{
  const shopRfq = scopeQuoteCatalog(catalog, { shopSlug: "peau-claire", shopConfiguratorId: "catalog-a" });
  assert.deepEqual(
    shopRfq.map((row) => row.id),
    ["p1", "p3"],
  );
  assert.equal(
    shopRfq.every((row) => row.configuratorId === "catalog-a"),
    true,
  );
  assert.deepEqual(shopRfq, restrictProductsToShopCatalog(catalog, "catalog-a"));
}

{
  const missingShopCatalog = scopeQuoteCatalog(catalog, { shopSlug: "bois-nord", shopConfiguratorId: "" });
  assert.deepEqual(missingShopCatalog, []);
}

{
  const siblingShop = scopeQuoteCatalog(catalog, { shopSlug: "stock-pro", shopConfiguratorId: "catalog-b" });
  assert.deepEqual(
    siblingShop.map((row) => row.id),
    ["p2"],
  );
}

{
  const rfqOnShop = resolveQuoteMode({
    shopTheme: { quoteMode: "rfq", accent: "#0F766E" },
    configuratorTheme: { kind: "catalog" },
  });
  assert.equal(isRfqQuoteMode(rfqOnShop), true);
  const lines = scopeQuoteCatalog(catalog, { shopSlug: "vitrine", shopConfiguratorId: "catalog-a" });
  assert.equal(lines.some((row) => row.configuratorId !== "catalog-a"), false);
  const prefill = matchCatalogPrefill(
    lines.map((row) => ({ ...row, sku: row.id === "p1" ? "QB-A" : null, externalId: null })),
    "QB-A",
  );
  assert.equal(prefill?.id, "p1");
  assert.equal(matchCatalogPrefill(lines, "catalog-b"), undefined);
}

console.log("quotes/quote-mode ok");
