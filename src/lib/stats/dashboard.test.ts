import assert from "node:assert/strict";
import { deltaDisplay, sparkCounts, sparkDayKeys, trendStory } from "./dashboard";

assert.equal(deltaDisplay(187, 228, "percent", true).deltaTone, "good");
assert.equal(deltaDisplay(187, 228, "percent", true).deltaLabel, "▼ 18 %");
assert.equal(deltaDisplay(3, 2, "count").deltaLabel, "▲ 1");
assert.equal(deltaDisplay(10, 12, "points").deltaLabel, "▼ 2 pts");
assert.equal(deltaDisplay(10, 12, "points").deltaTone, "bad");
assert.match(deltaDisplay(31300, 27100, "eur").deltaLabel, /▲ 4\s?200 € vs période préc\./);
assert.equal(deltaDisplay(8, 0, "percent").deltaLabel, "▲ 8");
assert.equal(deltaDisplay(0, 0, "percent").deltaLabel, "—");
assert.match(deltaDisplay(0, 0, "eur").deltaLabel, /0 € vs période préc\./);

const keys = sparkDayKeys(new Date(2026, 8, 13), 4);
assert.deepEqual(keys, ["2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13"]);
assert.deepEqual(
  sparkCounts(["2026-09-11T08:00:00Z", "2026-09-13T10:00:00Z", "2026-09-13T18:00:00Z"], keys),
  [0, 1, 0, 2],
);

assert.match(
  trendStory([
    { key: "2026-04", label: "avr.", quotes: 0, won: 0, abandons: 0 },
    { key: "2026-05", label: "mai", quotes: 0, won: 0, abandons: 0 },
    { key: "2026-06", label: "juin", quotes: 0, won: 0, abandons: 0 },
    { key: "2026-07", label: "juil.", quotes: 0, won: 0, abandons: 0 },
    { key: "2026-08", label: "août", quotes: 0, won: 0, abandons: 0 },
    { key: "2026-09", label: "sept.", quotes: 3, won: 0, abandons: 24 },
  ]),
  /concentrée sur septembre/,
);

console.log("dashboard kpi helpers ok");
