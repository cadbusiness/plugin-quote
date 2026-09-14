import assert from "node:assert/strict";
import { rankHomeQuotes } from "./home";

const quotes = [
  { id: "a", score: 64, created_at: "2026-09-12T10:00:00Z" },
  { id: "b", score: 91, created_at: "2026-09-10T10:00:00Z" },
  { id: "c", score: 86, created_at: "2026-09-11T10:00:00Z" },
  { id: "d", score: 86, created_at: "2026-09-13T10:00:00Z" },
  { id: "e", score: 40, created_at: "2026-09-14T10:00:00Z" },
];

const ranked = rankHomeQuotes(quotes, new Map([["c", false]]), 4);
assert.deepEqual(
  ranked.map((quote) => quote.id),
  ["b", "c", "d", "a"],
);

console.log("home rank ok");
