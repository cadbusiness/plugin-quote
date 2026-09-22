import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QuoteSpecSheets, SpecTable } from "@/components/catalog/spec-table";

const html = renderToStaticMarkup(
  createElement(QuoteSpecSheets, {
    products: [
      {
        id: "p1",
        name: "Rayonnage palettes lourd",
        specs: [
          { key: "delai", label: "Délai indicatif", value: "2–4", unit: "semaines" },
          { key: "charge", label: "Charge", value: "1000", unit: "kg/niveau" },
          { key: "materiau", label: "Matériau", value: "Acier peint / galva" },
        ],
      },
      { id: "empty", name: "Sans fiche", specs: [] },
      {
        id: "notice",
        name: "Notice seule",
        specs: [],
        sheet: {
          manualText: "Assembler les échelles avant les lisses.",
          documents: [{ role: "manual", src: "https://cdn.example/notice.pdf", label: "Notice PDF" }],
        },
      },
    ],
  }),
);

assert.match(html, /Rayonnage palettes lourd/);
assert.match(html, /1000 kg\/niveau/);
assert.match(html, /font-family:inherit[^>]*>Charge</);
assert.match(html, /IBM Plex Mono[^>]*>1000 kg\/niveau</);
assert.doesNotMatch(html, /Sans fiche/);
assert.match(html, /Notice seule/);
assert.match(html, /Notice PDF/);
assert.match(html, /Assembler les échelles/);
assert.ok(html.indexOf("Charge") < html.indexOf("Délai indicatif"));

const alt = renderToStaticMarkup(
  createElement(SpecTable, {
    specs: [{ key: "charge", label: "Charge bras", value: "500", unit: "kg", valueAlt: "par bras" }],
  }),
);
assert.match(alt, /500 kg \(par bras\)/);
assert.equal(renderToStaticMarkup(createElement(SpecTable, { specs: [] })), "");

console.log("spec-table.test.ts ok");
