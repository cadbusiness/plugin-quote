import assert from "node:assert/strict";
import {
  confirmationRouting,
  normalizeSalesEmail,
  outboundReplyTo,
  resolveSalesEmail,
  resolveSalesName,
} from "./sales-identity";

assert.equal(normalizeSalesEmail("  Sales@Atelier.fr "), "sales@atelier.fr");
assert.equal(normalizeSalesEmail(""), null);
assert.equal(normalizeSalesEmail("pas-un-email"), null);
assert.equal(normalizeSalesEmail("a@b"), null);
assert.equal(normalizeSalesEmail(null), null);

assert.equal(resolveSalesEmail("sales@atelier.fr", "owner@atelier.fr"), "sales@atelier.fr");
assert.equal(resolveSalesEmail(null, "owner@atelier.fr"), "owner@atelier.fr");
assert.equal(resolveSalesEmail("   ", "Owner@Atelier.fr"), "owner@atelier.fr");
assert.equal(resolveSalesEmail("invalide", "owner@atelier.fr"), "owner@atelier.fr");
assert.equal(resolveSalesEmail(null, null), null);
assert.equal(resolveSalesEmail(null, "pas-un-email"), null);

assert.equal(resolveSalesName("Atelier Dupont", "Dupont SAS"), "Atelier Dupont");
assert.equal(resolveSalesName(null, "Dupont SAS"), "Dupont SAS");
assert.equal(resolveSalesName("   ", "Dupont SAS"), "Dupont SAS");
assert.equal(resolveSalesName(null, "  "), "");

const missing = confirmationRouting({
  salesEmail: null,
  ownerEmail: "owner@atelier.fr",
  salesName: null,
  orgName: "Dupont SAS",
});
assert.equal(missing.replyTo, "owner@atelier.fr");
assert.equal(missing.briefTo, "owner@atelier.fr");
assert.equal(missing.signature, "Dupont SAS");

const set = confirmationRouting({
  salesEmail: "sales@atelier.fr",
  ownerEmail: "owner@atelier.fr",
  salesName: "Camille",
  orgName: "Dupont SAS",
});
assert.equal(set.replyTo, "sales@atelier.fr");
assert.equal(set.briefTo, "sales@atelier.fr");
assert.equal(set.signature, "Camille");

assert.equal(
  outboundReplyTo({
    toProspect: true,
    contactEmail: "lea@client.fr",
    salesEmail: "owner@atelier.fr",
  }),
  "owner@atelier.fr",
);
assert.equal(
  outboundReplyTo({
    toProspect: true,
    contactEmail: "lea@client.fr",
    salesEmail: null,
  }),
  undefined,
);
assert.equal(
  outboundReplyTo({
    toProspect: false,
    contactEmail: "lea@client.fr",
    salesEmail: "owner@atelier.fr",
  }),
  "lea@client.fr",
);

console.log("org/sales-identity.test.ts: ok");
