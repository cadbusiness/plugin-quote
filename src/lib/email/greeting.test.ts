import assert from "node:assert/strict";
import { fillProspectTemplate, prospectDisplayName, sessionContactName } from "./greeting";

const resume = "Bonjour {{contact_name}}, vous avez commencé à configurer votre projet. Reprenez ici : {{resume_url}}";

assert.equal(sessionContactName(undefined), "");
assert.equal(sessionContactName(null), "");
assert.equal(sessionContactName(""), "");
assert.equal(sessionContactName("   "), "");
assert.equal(sessionContactName("bonjour"), "");
assert.equal(sessionContactName("  Bonjour "), "");
assert.equal(sessionContactName("Demande commencée"), "");
assert.equal(prospectDisplayName("Léa"), "Léa");
assert.equal(sessionContactName("Claire Martin"), "Claire Martin");

const nameless = fillProspectTemplate(resume, {
  contact_name: sessionContactName(undefined),
  resume_url: "https://example.test/reprendre/tok",
});
assert.equal(
  nameless,
  "Bonjour, vous avez commencé à configurer votre projet. Reprenez ici : https://example.test/reprendre/tok",
);
assert.doesNotMatch(nameless, /Bonjour bonjour/i);
assert.doesNotMatch(nameless, /Bonjour ,/);

const placeholder = fillProspectTemplate(resume, {
  contact_name: "bonjour",
  resume_url: "https://example.test/reprendre/tok",
});
assert.match(placeholder, /^Bonjour, /);
assert.doesNotMatch(placeholder, /Bonjour bonjour/i);

const named = fillProspectTemplate(resume, {
  contact_name: "Léa",
  resume_url: "https://example.test/reprendre/tok",
});
assert.match(named, /^Bonjour Léa, /);

console.log("email/greeting.test.ts: ok");
