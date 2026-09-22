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
        specs: {
          charge: { label: "Charge", value: "1000", unit: "kg/niveau" },
          hauteur: { label: "Hauteur max", value: "12", unit: "m" },
          profondeur: { label: "Profondeur", value: "1100", unit: "mm" },
          materiau: { label: "Matériau", value: "Acier peint / galva" },
          delai: { label: "Délai indicatif", value: "2–4", unit: "semaines" },
        },
      },
      { id: "empty", name: "Sans fiche", specs: {} },
    ],
  }),
);

assert.match(html, /Rayonnage palettes lourd/);
assert.match(html, /1000 kg\/niveau/);
assert.match(html, /1100 mm/);
assert.match(html, /Plus Jakarta Sans[^>]*>Charge</);
assert.match(html, /IBM Plex Mono[^>]*>1000 kg\/niveau</);
assert.match(html, /Space Grotesk/);
assert.doesNotMatch(html, /font-family:[^"]*IBM Plex Mono[^"]*Plus Jakarta/);
assert.match(html, /<table/);
assert.doesNotMatch(html, /Sans fiche/);
assert.doesNotMatch(html, /#c2440f/);

console.log("spec-table.test.ts ok");
