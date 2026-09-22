import assert from "node:assert/strict";
import {
  QUICKLY_ABANDON_NAME,
  QUICKLY_SUBMITTED_NAME,
  quicklyDraftRows,
  shouldSendQuoteFallback,
} from "./quickly-drafts";

const rows = quicklyDraftRows("org-quickly");
assert.equal(rows.length, 2);
assert.ok(rows.every((row) => row.status === "draft"));
assert.equal(rows.find((row) => row.trigger_type === "session.abandoned")?.name, QUICKLY_ABANDON_NAME);
assert.equal(rows.find((row) => row.trigger_type === "quote.submitted")?.name, QUICKLY_SUBMITTED_NAME);
assert.equal(
  rows.every((row) => {
    const definition = row.definition as { nodes?: { type?: string }[] };
    return (definition.nodes ?? []).some((node) => node.type === "send_email");
  }),
  true,
);

assert.equal(shouldSendQuoteFallback({ orgSlug: "quickly", workflowsStarted: 0 }), false);
assert.equal(shouldSendQuoteFallback({ orgSlug: "quickly", workflowsStarted: 1 }), false);
assert.equal(shouldSendQuoteFallback({ orgSlug: "demo", workflowsStarted: 0 }), true);
assert.equal(shouldSendQuoteFallback({ orgSlug: "demo", workflowsStarted: 2 }), false);

console.log("quickly-drafts.test.ts ok");
