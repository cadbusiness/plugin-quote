import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SpecTable } from "@/components/configurator/spec-table";

const html = renderToStaticMarkup(
  createElement(SpecTable, {
    products: [
      {
        id: "p1",
        name: "Rayonnage palettes lourd",
        specs: [
          { key: "charge", label: "Charge", value: "1000", unit: "kg/niveau" },
          { key: "hauteur", label: "Hauteur max", value: "12", unit: "m" },
          { key: "profondeur", label: "Profondeur", value: "1100", unit: "mm" },
          { key: "materiau", label: "Matériau", value: "Acier peint / galva" },
          { key: "delai", label: "Délai indicatif", value: "2–4", unit: "semaines" },
        ],
      },
      {
        id: "cant",
        name: "Cantilever",
        specs: [{ key: "charge", label: "Charge bras", value: "500", unit: "kg", valueAlt: "par bras" }],
      },
      { id: "empty", name: "Sans fiche", specs: [] },
      {
        id: "prose",
        name: "Description only",
        specs: [],
      },
    ],
  }),
);

assert.match(html, /Rayonnage palettes lourd/);
assert.match(html, /1000 kg\/niveau/);
assert.match(html, /1100 mm/);
assert.match(html, /500 kg \(par bras\)/);
assert.match(html, /font-family:inherit[^>]*>Charge</);
assert.match(html, /IBM Plex Mono[^>]*>1000 kg\/niveau</);
assert.match(html, /<table/);
assert.doesNotMatch(html, /Sans fiche/);
assert.doesNotMatch(html, /Description only/);
assert.doesNotMatch(html, /font-family:[^"]*IBM Plex Mono[^"]*inherit/);

const hidden = renderToStaticMarkup(
  createElement(SpecTable, {
    products: [{ id: "x", name: "Vide", specs: [] }],
  }),
);
assert.equal(hidden, "");

console.log("spec-table.test.ts ok");
