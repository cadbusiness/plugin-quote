import assert from "node:assert/strict";
import { rankHomeQuotes, rankHomeWorkflows, workflowActivity, type HomeWorkflow } from "./home";

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

assert.equal(workflowActivity(0, null).hot, true);
assert.match(workflowActivity(3, "2026-09-13T08:00:00Z").text, /3 envois/);

const flows: HomeWorkflow[] = [
  {
    id: "pause",
    name: "Nurturing",
    status: "draft",
    trigger_type: "quote.submitted",
    updated_at: "2026-09-02T10:00:00Z",
    running: 0,
    waiting: 0,
    failed: 0,
    sent: 0,
    lastAt: null,
  },
  {
    id: "live",
    name: "Demande",
    status: "active",
    trigger_type: "quote.submitted",
    updated_at: "2026-09-10T10:00:00Z",
    running: 0,
    waiting: 0,
    failed: 0,
    sent: 3,
    lastAt: "2026-09-13T08:00:00Z",
  },
];
assert.deepEqual(
  rankHomeWorkflows(flows).map((flow) => flow.id),
  ["live", "pause"],
);

console.log("home rank ok");
