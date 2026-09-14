import assert from "node:assert/strict";
import { filterAbandonRows, visitStops, type AbandonRow } from "./abandons";
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

console.log("crm/abandons.test.ts: ok");
