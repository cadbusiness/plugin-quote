import assert from "node:assert/strict";
import {
  anonymousEvent,
  hashEmailForAds,
  parsePluginStart,
  resumeUrl,
  startedExpired,
  startedReminderDue,
  STARTED_REMINDER_MS,
  STARTED_RETENTION_MS,
} from "./started-quote";

const hash = hashEmailForAds("  Marie.Dupont+devis@gmail.com ");
assert.equal(hash, hashEmailForAds("mariedupont@gmail.com"));
assert.equal(hash.length, 64);
assert.notEqual(hashEmailForAds("marie@exemple.com"), hashEmailForAds("paul@exemple.com"));

const event = anonymousEvent("quotebuilder_email", {
  email: "marie@exemple.com",
  step: 3,
  note: "écrire à marie@exemple.com",
  sha256_email: "abc",
});
assert.equal(event.event, "quotebuilder_email");
assert.equal(event.step, 3);
assert.equal("email" in event, false);
assert.equal("sha256_email" in event, false);
assert.equal("note" in event, false);

const ads = anonymousEvent("quotebuilder_submit", { reference: "Q-2026-0142" });
assert.deepEqual(ads, { event: "quotebuilder_submit", reference: "Q-2026-0142" });

assert.equal(
  resumeUrl("https://exemple.test/demande-de-devis/?x=1", "abc"),
  "https://exemple.test/demande-de-devis/?x=1&qb_resume=abc",
);
assert.equal(resumeUrl("javascript:alert(1)", "abc"), "");

const now = Date.parse("2026-09-22T12:00:00.000Z");
assert.equal(startedReminderDue("2026-09-22T11:00:00.000Z", null, now), false);
assert.equal(startedReminderDue(new Date(now - STARTED_REMINDER_MS).toISOString(), null, now), true);
assert.equal(startedReminderDue(new Date(now - STARTED_REMINDER_MS).toISOString(), "2026-09-22T12:00:00.000Z", now), false);
assert.equal(startedExpired(new Date(now - STARTED_RETENTION_MS + 1000).toISOString(), now), false);
assert.equal(startedExpired(new Date(now - STARTED_RETENTION_MS).toISOString(), now), true);

const started = parsePluginStart({ email: "marie@exemple.com", externalId: "wp-1", page: "https://exemple.test/devis" });
assert.equal(started.ok, true);
if (started.ok) {
  assert.equal(started.quote.email, "marie@exemple.com");
  assert.equal(started.quote.consentAds, false);
  assert.equal(started.quote.externalId, "wp-1");
}
assert.equal(parsePluginStart({ email: "pas-un-email" }).ok, false);
assert.equal(parsePluginStart({ need: "Rack", name: "Marie" }).ok, false);
const described = parsePluginStart({
  email: "marie@exemple.com",
  description: "Palettes de 800 kg",
  consentAds: true,
});
assert.equal(described.ok, true);
if (described.ok) {
  assert.equal(described.quote.need, "Palettes de 800 kg");
  assert.equal(described.quote.consentAds, false);
}

console.log("integrations/started-quote ok");
