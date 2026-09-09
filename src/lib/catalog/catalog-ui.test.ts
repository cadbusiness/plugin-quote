import assert from "node:assert/strict";
import { catalogListHref, clampPage, pageWindow, paginationItems } from "./pagination";
import { convertAmount } from "./fx";
import { sanitizeProductHtml, looksLikeHtml, htmlToPlainPreview } from "./html";
import { DEFAULT_SETTINGS } from "../integrations/types";
import { shouldSkipOverwrite, shouldPushLocal } from "./sync-policy";
import { parseGallery, withCover } from "./media";

assert.equal(catalogListHref({ page: 1 }), "/produits");
assert.equal(catalogListHref({ q: "bac", page: 2 }), "/produits?q=bac&page=2");
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
