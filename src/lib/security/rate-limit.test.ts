import assert from "node:assert/strict";
import { rateLimit, resetRateLimitState } from "./rate-limit";

resetRateLimitState();

{
  const a = rateLimit("t1", 2, 60_000, 1_000);
  const b = rateLimit("t1", 2, 60_000, 1_001);
  const c = rateLimit("t1", 2, 60_000, 1_002);
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(c.ok, false);
  assert.ok(c.retryAfterSec >= 1);
}

{
  resetRateLimitState();
  const a = rateLimit("t2", 1, 100, 1_000);
  const b = rateLimit("t2", 1, 100, 1_050);
  const c = rateLimit("t2", 1, 100, 1_101);
  assert.equal(a.ok, true);
  assert.equal(b.ok, false);
  assert.equal(c.ok, true);
}

console.log("rate-limit.test.ts: ok");
