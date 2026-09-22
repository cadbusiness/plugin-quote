import assert from "node:assert/strict";
import { domainsMatch, isStaleRunning, planWooPairing } from "@/lib/integrations/pairing-plan";

const hostinger = "https://mintcream-mosquito-831101.hostingersite.com";
const production = "https://quickly-int.com";

assert.equal(domainsMatch(`${production}/`, production), true);
assert.equal(domainsMatch(hostinger, production), false);

const only = [{ id: "conn-1", store_domain: production }];
assert.deepEqual(planWooPairing(only, hostinger), { action: "update", connectionId: "conn-1" });
assert.deepEqual(planWooPairing(only, `${production}/`), { action: "update", connectionId: "conn-1" });

assert.deepEqual(planWooPairing([], hostinger), { action: "insert" });

const two = [
  { id: "conn-1", store_domain: production },
  { id: "conn-2", store_domain: "https://autre.example" },
];
assert.deepEqual(planWooPairing(two, hostinger), { action: "insert" });
assert.deepEqual(planWooPairing(two, production), { action: "update", connectionId: "conn-1" });

const now = Date.parse("2026-09-22T04:49:00.000Z");
assert.equal(isStaleRunning("2026-09-22T04:48:00.000Z", now), false);
assert.equal(isStaleRunning("2026-09-22T04:40:00.000Z", now), true);
assert.equal(isStaleRunning("not-a-date", now), false);
