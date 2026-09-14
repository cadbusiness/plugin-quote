import assert from "node:assert/strict";
import { deltaDisplay, sparkCounts, sparkDayKeys } from "./dashboard";

assert.equal(deltaDisplay(30, 27, "percent").deltaLabel, "▲ 11 %");
assert.equal(deltaDisplay(30, 27, "percent").deltaTone, "good");
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

console.log("dashboard kpi helpers ok");
