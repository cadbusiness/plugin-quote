import assert from "node:assert/strict";
import { restrictProductsToShopCatalog } from "@/lib/shops/catalog-scope";
import {
  isCatalogQuoteMode,
  isQuoteMode,
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
assert.equal(parseQuoteMode("wizard"), "wizard");
assert.equal(parseQuoteMode("catalog"), "catalog");
assert.equal(parseQuoteMode("rfq"), "rfq");
assert.equal(parseQuoteMode("RFQ"), "rfq");
assert.equal(parseQuoteMode("configurator"), "wizard");
assert.equal(parseQuoteMode("light"), "rfq");
assert.equal(parseQuoteMode("simple"), "rfq");
assert.equal(isQuoteMode("wizard"), true);
assert.equal(isQuoteMode("configurator"), false);

assert.equal(quoteModeFromTheme(null), null);
assert.equal(quoteModeFromTheme({}), null);
assert.equal(quoteModeFromTheme({ quoteMode: "rfq" }), "rfq");
assert.equal(quoteModeFromTheme({ quoteMode: "light" }), "rfq");
assert.equal(quoteModeFromTheme({ quoteMode: "configurator" }), "wizard");
assert.equal(quoteModeFromTheme({ quoteMode: "wizard" }), "wizard");
assert.equal(quoteModeFromTheme({ quoteMode: "catalog" }), "catalog");

assert.equal(resolveQuoteMode({}), "wizard");
assert.equal(resolveQuoteMode({ configuratorTheme: { kind: "form" } }), "wizard");
assert.equal(
  resolveQuoteMode({ configuratorTheme: { kind: "catalog" } }),
  "catalog",
  "existing catalog-kind funnel stays catalog when quoteMode is unset",
);
assert.equal(resolveQuoteMode({ configuratorTheme: { quoteMode: "rfq" } }), "rfq");
assert.equal(resolveQuoteMode({ shopTheme: { quoteMode: "simple" } }), "rfq");
assert.equal(
  resolveQuoteMode({
    shopTheme: { quoteMode: "rfq" },
    configuratorTheme: { quoteMode: "wizard", kind: "catalog" },
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
    shopTheme: { quoteMode: "wizard" },
    configuratorTheme: { quoteMode: "rfq" },
  }),
  "wizard",
  "shop can pin wizard even if funnel is RFQ",
);
assert.equal(
  resolveQuoteMode({
    shopTheme: { quoteMode: "catalog" },
    configuratorTheme: { quoteMode: "wizard" },
  }),
  "catalog",
);
assert.equal(
  resolveQuoteMode({
    shopTheme: { quoteMode: "garbage" },
    configuratorTheme: { quoteMode: "light" },
  }),
  "rfq",
);
assert.equal(
  resolveQuoteMode({
    shopTheme: { accent: "#111" },
    configuratorTheme: { kind: "catalog" },
  }),
  "catalog",
);

assert.equal(isRfqQuoteMode("rfq"), true);
assert.equal(isRfqQuoteMode("wizard"), false);
assert.equal(isCatalogQuoteMode("catalog"), true);
assert.equal(isCatalogQuoteMode("wizard"), false);
assert.equal(quoteModeLabel("rfq"), "Demande simple");
assert.equal(quoteModeLabel("wizard"), "Parcours");
assert.equal(quoteModeLabel("catalog"), "Catalogue");

const withKind = themeWithQuoteMode({ kind: "catalog", tracking: { ga: "G-1" } }, "rfq");
assert.equal((withKind as { quoteMode?: string }).quoteMode, "rfq");
assert.equal((withKind as { kind?: string }).kind, "catalog");
const persistedWizard = themeWithQuoteMode(withKind, "wizard");
assert.equal((persistedWizard as { quoteMode?: string }).quoteMode, "wizard");
assert.equal((persistedWizard as { kind?: string }).kind, "catalog");
const persistedCatalog = themeWithQuoteMode({}, "catalog");
assert.equal((persistedCatalog as { quoteMode?: string }).quoteMode, "catalog");

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
