import assert from "node:assert/strict";
import {
  DEFAULT_ABANDON_HOURS,
  isActiveRunStatus,
  isClosedQuoteStatus,
  isOneShotTrigger,
  isSessionAbandonedDue,
  minAbandonHours,
  resolveAbandonHours,
  shouldExitRunOnClosedQuote,
} from "./policy";

assert.equal(isOneShotTrigger("quote.submitted"), true);
assert.equal(isOneShotTrigger("session.abandoned"), true);
assert.equal(isOneShotTrigger("quote.status_changed"), false);

assert.equal(isActiveRunStatus("waiting"), true);
assert.equal(isActiveRunStatus("running"), true);
assert.equal(isActiveRunStatus("completed"), false);
assert.equal(isActiveRunStatus("exited"), false);

assert.equal(resolveAbandonHours({}), DEFAULT_ABANDON_HOURS);
assert.equal(resolveAbandonHours({ abandonHours: 24 }), 24);
assert.equal(resolveAbandonHours({ abandonHours: 0 }), 0);
assert.equal(resolveAbandonHours({ abandonHours: -3 }), 0);

const now = Date.parse("2026-09-10T12:00:00Z");
assert.equal(isSessionAbandonedDue("2026-09-10T11:30:00Z", 1, now), false);
assert.equal(isSessionAbandonedDue("2026-09-10T11:00:00Z", 1, now), true);
assert.equal(isSessionAbandonedDue("2026-09-10T11:59:00Z", 0, now), true);
assert.equal(isSessionAbandonedDue("not-a-date", 1, now), false);

assert.equal(minAbandonHours([]), DEFAULT_ABANDON_HOURS);
assert.equal(minAbandonHours([{}, { abandonHours: 24 }]), 1);
assert.equal(minAbandonHours([{ abandonHours: 48 }, { abandonHours: 6 }]), 6);

assert.equal(shouldExitRunOnClosedQuote("quote.submitted", undefined, "won"), true);
assert.equal(shouldExitRunOnClosedQuote("quote.status_changed", "won", "won"), false);
assert.equal(shouldExitRunOnClosedQuote("quote.status_changed", "contacted", "won"), true);
assert.equal(shouldExitRunOnClosedQuote("quote.status_changed", undefined, "won"), false);
assert.equal(shouldExitRunOnClosedQuote("session.abandoned", undefined, "won"), false);

assert.equal(isClosedQuoteStatus({ is_closed: true }, "won"), true);
assert.equal(isClosedQuoteStatus({ is_closed: false }, "won"), false);
assert.equal(isClosedQuoteStatus(null, "won"), true);
assert.equal(isClosedQuoteStatus(null, "lost"), true);
assert.equal(isClosedQuoteStatus(null, "contacted"), false);

console.log("workflows/policy ok");
