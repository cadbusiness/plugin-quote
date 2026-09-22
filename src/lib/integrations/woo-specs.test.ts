import assert from "node:assert/strict";
import { pickLeafCategory, type WooCategoryNode } from "./woo-specs";

const taxonomy: WooCategoryNode[] = [
  { id: 1, name: "Bacs de rangement", parent: 0 },
  { id: 2, name: "Bacs pliable", parent: 1 },
  { id: 3, name: "Divers", parent: 0 },
  { id: 10, name: "Rayonnages", parent: 0 },
  { id: 11, name: "Accessoire Rack à palettes", parent: 10 },
];

const leaf = pickLeafCategory(
  [
    { id: 1, name: "Bacs de rangement" },
    { id: 3, name: "Divers" },
    { id: 2, name: "Bacs pliable" },
  ],
  taxonomy,
);
assert.equal(leaf, "Bacs pliable");

const rack = pickLeafCategory(
  [
    { id: 10, name: "Rayonnages" },
    { id: 11, name: "Accessoire Rack à palettes" },
  ],
  taxonomy,
);
assert.equal(rack, "Accessoire Rack à palettes");

const fallback = pickLeafCategory(
  [
    { name: "Bacs de rangement" },
    { name: "Bacs euronorme" },
  ],
  [],
);
assert.equal(fallback, "Bacs euronorme");

console.log("woo-specs ok");
