import assert from "node:assert/strict";
import { catalogListHref, clampPage, pageWindow, paginationItems } from "./pagination";
import { catalogChromeSummary, displayProductName, formatCatalogPrice } from "./display";
import { parseCatalogFilters, rowMatchesCatalog } from "./filters";
import { convertAmount } from "./fx";
import { sanitizeProductHtml, looksLikeHtml, htmlToPlainPreview } from "./html";
import { DEFAULT_SETTINGS } from "../integrations/types";
import { shouldSkipOverwrite, shouldPushLocal } from "./sync-policy";
import { parseGallery, withCover } from "./media";

assert.equal(catalogListHref({ page: 1 }), "/produits");
assert.equal(catalogListHref({ q: "bac", page: 2 }), "/produits?q=bac&page=2");
assert.equal(catalogListHref({ category: "Bacs de rangement", prix: "manquant" }), "/produits?category=Bacs+de+rangement&prix=manquant");
assert.equal(displayProductName("BAC EURO 400X300X120"), "Bac euro 400 × 300 × 120");
assert.equal(displayProductName("Bac de congélation"), "Bac de congélation");
assert.equal(formatCatalogPrice(18, 18), "18 €");
assert.equal(formatCatalogPrice(null, null), null);
assert.equal(catalogChromeSummary(97, 96, "Quickly International"), "97 produits · 96 synchronisés depuis Quickly International");
assert.equal(
  rowMatchesCatalog(
    { name: "Bac", sku: null, category: "Bacs de rangement", source: "woocommerce", is_active: true, price_min: null, price_max: null },
    parseCatalogFilters({ prix: "manquant" }),
  ),
  true,
);
assert.equal(clampPage("99", 40, 25), 2);
assert.deepEqual(paginationItems(1, 4), [1, 2, 3, 4]);
assert.deepEqual(paginationItems(5, 12), [1, "gap", 4, 5, 6, "gap", 12]);
assert.deepEqual(pageWindow(2, 25, 97), { from: 26, to: 50, totalPages: 4, current: 2 });

assert.equal(convertAmount(10, "EUR", "USD", { EUR: 1, USD: 2 }), 20);
assert.equal(convertAmount(20, "USD", "EUR", { EUR: 1, USD: 2 }), 10);

assert.equal(looksLikeHtml("<p>Bonjour</p>"), true);
assert.equal(
  sanitizeProductHtml('<p onclick="alert(1)">Hello <script>x()</script><a href="https://ex.com">lien</a></p>'),
  '<p>Hello <a href="https://ex.com" target="_blank" rel="noopener noreferrer">lien</a></p>',
);
assert.equal(htmlToPlainPreview("<p>Bac <strong>blanc</strong></p>"), "Bac blanc");

const gallery = parseGallery([{ src: "a.jpg", alt: "A" }, { src: "b.jpg", alt: null }]);
assert.equal(withCover(gallery, "b.jpg")[0].src, "b.jpg");

assert.equal(
  shouldSkipOverwrite(
    { updated_at: "2026-01-02T00:00:00Z", synced_at: "2026-01-01T00:00:00Z" },
    { ...DEFAULT_SETTINGS, pullFromStore: true, pushToStore: false, protectLocalEdits: true },
  ),
  true,
);
assert.equal(
  shouldPushLocal(
    { updated_at: "2026-01-02T00:00:00Z", synced_at: "2026-01-01T00:00:00Z" },
    { ...DEFAULT_SETTINGS, pullFromStore: true, pushToStore: true, protectLocalEdits: true },
  ),
  true,
);

console.log("catalog/pagination+fx+html+sync ok");
