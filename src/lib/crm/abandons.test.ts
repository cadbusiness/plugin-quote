import assert from "node:assert/strict";
import {
  abandonStory,
  filterAbandonRows,
  inactiveAfterLabel,
  inactiveHoursForFunnel,
  isSuccessfulEmailStep,
  leftVisitorCount,
  relancedSessionIds,
  sessionIsInactive,
  staffSessionHref,
  visitStops,
  type AbandonRow,
} from "./abandons";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";

const base = {
  recoverable: true,
  stale: true,
  relanced: false,
} as Pick<AbandonRow, "recoverable" | "stale" | "relanced">;

assert.equal(
  filterAbandonRows(
    [
      { ...base, recoverable: true, stale: true } as AbandonRow,
      { ...base, recoverable: true, stale: false } as AbandonRow,
      { ...base, recoverable: false, stale: true } as AbandonRow,
    ],
    "relance",
  ).length,
  1,
);

const stops = visitStops({
  startedAt: "2026-09-13T10:00:00.000Z",
  landingPath: "/b/demo/vitrine",
  currentStep: 1,
  stepTitles: ["Type de projet", "Dimensionnement", "Coordonnées"],
  events: [
    {
      created_at: "2026-09-13T10:01:00.000Z",
      event_type: ANALYTICS_EVENTS.pageView,
      payload: { path: "/b/demo/vitrine/catalogue", title: "Catalogue" },
    },
    {
      created_at: "2026-09-13T10:03:00.000Z",
      event_type: ANALYTICS_EVENTS.started,
      payload: {},
    },
    {
      created_at: "2026-09-13T10:04:00.000Z",
      event_type: "quotebuilder_step_1",
      payload: {},
    },
  ],
});

assert.equal(stops[0]?.label, "Accueil boutique");
assert.equal(stops.some((stop) => stop.label === "Catalogue"), true);
assert.equal(stops.some((stop) => stop.label === "Dimensionnement"), true);
assert.equal(stops.some((stop) => stop.label === "Parcours commencé"), true);

const synthesized = visitStops({
  startedAt: "2026-09-13T10:00:00.000Z",
  landingPath: "/c/demo/rayonnage",
  currentStep: 0,
  stepTitles: ["Type de projet", "Dimensionnement"],
  events: [],
});
assert.equal(synthesized.some((stop) => stop.label === "Configurateur"), true);
assert.equal(synthesized.some((stop) => stop.label === "Type de projet"), true);

const widget = visitStops({
  startedAt: "2026-09-13T10:00:00.000Z",
  landingPath: "/embed/demo/rayonnage",
  currentStep: 0,
  stepTitles: ["Type de projet"],
  events: [
    {
      created_at: "2026-09-13T10:00:30.000Z",
      event_type: ANALYTICS_EVENTS.pageView,
      payload: { path: "/produit/cantilever", title: "Cantilever lourd" },
    },
    {
      created_at: "2026-09-13T10:01:00.000Z",
      event_type: ANALYTICS_EVENTS.pageView,
      payload: { path: "/demande-de-devis", title: "Demande de devis" },
    },
  ],
});
assert.equal(widget.some((stop) => stop.label === "Widget"), false);
assert.equal(widget.some((stop) => stop.label === "Cantilever lourd"), true);
assert.equal(widget.some((stop) => stop.label === "Demande de devis"), true);

const now = Date.parse("2026-09-13T12:00:00.000Z");
assert.equal(sessionIsInactive("2026-09-13T11:30:00.000Z", 1, now), false);
assert.equal(sessionIsInactive("2026-09-13T10:00:00.000Z", 1, now), true);
assert.equal(sessionIsInactive("2026-09-13T10:00:00.000Z", 24, now), false);
assert.equal(sessionIsInactive("2026-09-12T11:00:00.000Z", 24, now), true);
assert.equal(inactiveAfterLabel(1), "1 h");
assert.equal(inactiveAfterLabel(24), "24 h");
assert.equal(inactiveHoursForFunnel("funnel-a", []), 1);
assert.equal(inactiveHoursForFunnel("funnel-a", [{ hours: 24 }]), 24);
assert.equal(
  inactiveHoursForFunnel("funnel-a", [
    { hours: 24, configuratorIds: ["funnel-a"] },
    { hours: 1, configuratorIds: ["funnel-b"] },
  ]),
  24,
);
assert.equal(
  inactiveHoursForFunnel("funnel-b", [
    { hours: 24, configuratorIds: ["funnel-a"] },
    { hours: 6, configuratorIds: ["funnel-b"] },
  ]),
  6,
);

const noneRelanced = abandonStory(
  {
    started: 24,
    baskets: 0,
    stale: 2,
    anonymous: 24,
    relanced: 0,
    inactiveHours: 1,
    inactiveMixed: false,
    rows: [
      { relanced: false, stale: true, lastActivity: "2026-09-07T10:00:00.000Z" } as AbandonRow,
      { relanced: false, stale: true, lastActivity: "2026-09-12T10:00:00.000Z" } as AbandonRow,
      { relanced: false, stale: false, lastActivity: "2026-09-13T11:40:00.000Z" } as AbandonRow,
    ],
  },
  Date.parse("2026-09-13T12:00:00.000Z"),
);
assert.equal(staffSessionHref("ses_1"), "/sessions/ses_1");
assert.equal(staffSessionHref("ses_1").includes("/reprendre/"), false);
assert.equal(
  leftVisitorCount([
    { stale: true },
    { stale: false },
    { stale: true },
  ]),
  2,
);
assert.match(noneRelanced.lead, /2 visiteurs ont quitté/);
assert.doesNotMatch(noneRelanced.lead, /24/);
assert.doesNotMatch(noneRelanced.lead, /3 visiteur/);
assert.equal(noneRelanced.stress, "Aucun n’a encore été relancé.");
assert.equal(noneRelanced.waiting?.count, 2);
assert.equal(noneRelanced.waiting?.days, 6);

const stillActive = abandonStory(
  {
    started: 3,
    baskets: 1,
    stale: 0,
    anonymous: 2,
    relanced: 0,
    inactiveHours: 24,
    inactiveMixed: false,
    rows: [
      { relanced: false, stale: false, lastActivity: "2026-09-13T11:00:00.000Z" } as AbandonRow,
      { relanced: false, stale: false, lastActivity: "2026-09-13T11:30:00.000Z" } as AbandonRow,
    ],
  },
  now,
);
assert.equal(stillActive.lead, "Aucune visite abandonnée récemment.");
assert.equal(stillActive.waiting, null);

const runs = [
  { id: "r-failed", subject_id: "s-failed" },
  { id: "r-exited", subject_id: "s-exited" },
  { id: "r-waiting", subject_id: "s-waiting" },
  { id: "r-sent", subject_id: "s-sent" },
];
const steps = [
  { run_id: "r-failed", status: "failed", output: { templateKind: "session_resume" } },
  { run_id: "r-exited", status: "ok", output: { exit: true } },
  { run_id: "r-waiting", status: "ok", output: { templateKind: "session_resume", to: "a@b.c" } },
  { run_id: "r-sent", status: "ok", output: { waited: true } },
  { run_id: "r-sent", status: "ok", output: { templateKind: "session_resume_late" } },
];
assert.equal(isSuccessfulEmailStep(steps[0]!), false);
assert.equal(isSuccessfulEmailStep(steps[1]!), false);
assert.equal(isSuccessfulEmailStep(steps[2]!), true);
const relanced = relancedSessionIds(runs, steps);
assert.equal(relanced.has("s-failed"), false);
assert.equal(relanced.has("s-exited"), false);
assert.equal(relanced.has("s-waiting"), true);
assert.equal(relanced.has("s-sent"), true);

console.log("crm/abandons.test.ts: ok");
