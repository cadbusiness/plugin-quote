import assert from "node:assert/strict";
import { funnelVisibilityLabel, funnelVisibilityTone } from "./kind";

assert.equal(funnelVisibilityLabel(true), "Actif");
assert.equal(funnelVisibilityLabel(false), "Archivé");
assert.equal(funnelVisibilityTone(true), "emerald");
assert.equal(funnelVisibilityTone(false), "slate");

console.log("funnel visibility labels ok");
