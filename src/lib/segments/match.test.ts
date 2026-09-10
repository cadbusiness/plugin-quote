import assert from "node:assert/strict";
import { matchSegment, recentlyContacted } from "@/lib/segments/match";
import type { SegmentContact } from "@/lib/segments/types";

const contact: SegmentContact = {
  id: "1",
  contactName: "Marie",
  contactEmail: "marie@atelier.fr",
  contactCompany: "Atelier Nord",
  scoreLabel: "hot",
  statusSlug: "new",
  configuratorId: "funnel-1",
  answers: { usage: "pro", surface: 40 },
  lastCampaignAt: null,
  consentMarketing: false,
};

assert.equal(matchSegment({ all: [{ field: "audience", op: "eq", value: "b2b" }] }, contact), true);
assert.equal(matchSegment({ all: [{ field: "audience", op: "eq", value: "b2c" }] }, contact), false);
assert.equal(matchSegment({ all: [{ field: "score_label", op: "eq", value: "hot" }] }, contact), true);
assert.equal(
  matchSegment({ all: [{ field: "answer", op: "eq", value: "pro", answerKey: "usage" }] }, contact),
  true,
);
assert.equal(matchSegment({ all: [{ field: "recently_contacted", op: "never", value: "" }] }, contact), true);
assert.equal(recentlyContacted(null, 30), false);
assert.equal(recentlyContacted(new Date().toISOString(), 30), true);

const b2c = { ...contact, contactCompany: null };
assert.equal(matchSegment({ all: [{ field: "audience", op: "eq", value: "b2c" }] }, b2c), true);

console.log("segments/match ok");
