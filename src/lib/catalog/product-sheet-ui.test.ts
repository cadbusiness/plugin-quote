import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { ProductSheetLinks } from "@/components/catalog/product-sheet";
import { QuoteProductMedia } from "@/components/catalog/quote-media";
import { SpecChips, SpecTable } from "@/components/catalog/spec-table";
import type { ProductSpecs } from "@/lib/catalog/specs";

const specs: ProductSpecs = {
  charge: { label: "Charge", value: "1000", unit: "kg/niveau" },
  hauteur: { label: "Hauteur", value: "250", unit: "cm" },
  materiau: { label: "Matériau", value: "Acier galvanisé", unit: "" },
};

const table = renderToStaticMarkup(createElement(SpecTable, { specs }));
assert.match(table, /Charge/);
assert.match(table, /1000 kg\/niveau/);
assert.match(table, /Acier galvanisé/);
assert.equal(renderToStaticMarkup(createElement(SpecTable, { specs: {} })), "");

const chips = renderToStaticMarkup(createElement(SpecChips, { specs, limit: 1 }));
assert.match(chips, /Charge/);
assert.equal(chips.includes("Hauteur"), false);

const media = renderToStaticMarkup(
  createElement(QuoteProductMedia, {
    name: "Unirack",
    imageUrl: "https://cdn.example/plan.jpg",
    images: [
      { src: "https://cdn.example/plan.jpg", alt: "Plan", role: "plan" },
      { src: "https://cdn.example/photo.jpg", alt: "Unirack", role: "product" },
      { src: "https://cdn.example/chantier.jpg", alt: "Chantier", role: "usage" },
      { src: "https://cdn.example/notice.jpg", alt: "Montage", role: "manual" },
    ],
  }),
);
assert.match(media, /https:\/\/cdn\.example\/photo\.jpg/);
assert.match(media, />Plan</);
assert.match(media, />Usage</);
assert.match(media, />Notice</);
assert.equal(media.includes("cdn.example/plan.jpg\" alt=\"Unirack\""), false);

const links = renderToStaticMarkup(
  createElement(ProductSheetLinks, {
    sheet: {
      manualText: "Assembler les échelles avant les lisses.",
      documents: [
        { role: "manual", src: "https://cdn.example/notice.pdf", label: "Notice PDF" },
        { role: "certificate", src: "https://cdn.example/ce.pdf", label: "Conformité" },
      ],
    },
  }),
);
assert.match(links, /Mode d’emploi/);
assert.match(links, /Assembler les échelles/);
assert.match(links, /href="https:\/\/cdn\.example\/notice\.pdf"/);
assert.match(links, /Conformité/);
assert.equal(renderToStaticMarkup(createElement(ProductSheetLinks, { sheet: { manualText: "", documents: [] } })), "");

console.log("product-sheet-ui ok");
