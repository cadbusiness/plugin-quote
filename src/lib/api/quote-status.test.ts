import assert from "node:assert/strict";
import { shouldRunQuoteAutopilot, sliceQuoteStatus } from "./quote-status";

assert.equal(shouldRunQuoteAutopilot(undefined), false);
assert.equal(shouldRunQuoteAutopilot(false), false);
assert.equal(shouldRunQuoteAutopilot("false"), false);
assert.equal(shouldRunQuoteAutopilot(0), false);
assert.equal(shouldRunQuoteAutopilot(true), true);
assert.equal(shouldRunQuoteAutopilot("true"), true);
assert.equal(shouldRunQuoteAutopilot(1), true);
assert.equal(shouldRunQuoteAutopilot("1"), true);

const sliced = sliceQuoteStatus({
  id: "q1",
  status: "waiting",
  status_label: "En attente",
  score: 82,
  score_label: "hot",
  assigned_to: "user-1",
  assignees: [{ userId: "user-1", label: "Léa" }],
  created_at: "2026-09-11T10:00:00.000Z",
  funnel: { id: "f1", name: "Rayonnage", slug: "rayonnage" },
  answers: [{ key: "secret", value: "ne pas exposer" }],
  notes: [{ id: "n1", content: "interne" }],
  suivi_url: "https://example.test/suivi",
  phone: "0600000000",
  email: "hidden@example.test",
  name: "Claire",
});

assert.deepEqual(Object.keys(sliced).sort(), [
  "assigned_to",
  "created_at",
  "funnel",
  "id",
  "score",
  "score_label",
  "status",
  "status_label",
]);
assert.equal(sliced.id, "q1");
assert.equal(sliced.status, "waiting");
assert.equal(sliced.status_label, "En attente");
assert.deepEqual(sliced.assigned_to, [{ id: "user-1", label: "Léa" }]);
assert.deepEqual(sliced.funnel, { id: "f1", name: "Rayonnage", slug: "rayonnage" });
assert.equal("answers" in sliced, false);
assert.equal("notes" in sliced, false);
assert.equal("suivi_url" in sliced, false);
assert.equal("phone" in sliced, false);

assert.throws(() => sliceQuoteStatus(null), /Devis introuvable/);

console.log("quote-status ok");
