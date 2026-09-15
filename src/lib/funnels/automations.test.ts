import assert from "node:assert/strict";
import {
  automationState,
  buildFunnelAutomationBoard,
  chatAbandonDiagnostic,
  firstWaitNode,
  formatHours,
  hoursFromMinutes,
  slotForWorkflow,
  triggerCopy,
  volumeLabel,
  workflowTimeline,
} from "./automations";
import { sessionAbandonedDefinition, quoteSubmittedDefinition } from "@/lib/workflows/defaults";

assert.equal(formatHours(1), "1 h");
assert.equal(formatHours(24), "24 h");
assert.equal(formatHours(hoursFromMinutes(20)), "20 min");
assert.equal(formatHours(25), "25 h");

assert.equal(triggerCopy("quote.submitted", "chat"), "Chat terminé avec coordonnées");
assert.equal(triggerCopy("session.abandoned", "chat"), "Chat quitté sans finir");
assert.equal(triggerCopy("quote.status_changed", "form", "won"), "Devis accepté");
assert.equal(slotForWorkflow("quote.status_changed", "won"), "quote.won");

const abandon = workflowTimeline(sessionAbandonedDefinition(), "session.abandoned");
assert.equal(abandon.steps.length, 4);
assert.equal(abandon.steps[0]?.label, "Inactivité détectée");
assert.equal(abandon.steps[0]?.kind, "wait");
assert.ok(abandon.steps.some((step) => step.label === "Reprise de session"));
assert.ok(abandon.steps.some((step) => step.label === "Seconde relance"));
assert.equal(abandon.durationHours, 24);

const demande = workflowTimeline(quoteSubmittedDefinition(), "quote.submitted");
assert.ok(demande.steps.length > 4);
assert.ok(demande.durationHours >= 72);

const wait = firstWaitNode(sessionAbandonedDefinition());
assert.equal(wait?.data.waitHours, 1);

const blocked = chatAbandonDiagnostic("chat", "session.abandoned", 1);
assert.ok(blocked);
assert.match(blocked.message, /1 h/);
assert.match(blocked.message, /30 min/);
assert.equal(chatAbandonDiagnostic("chat", "session.abandoned", hoursFromMinutes(20)), null);
assert.equal(chatAbandonDiagnostic("form", "session.abandoned", 1), null);

assert.equal(automationState({ status: "active", entries: 3, expected: 3, diagnostic: null }).label, "Tourne");
assert.equal(
  automationState({ status: "active", entries: 0, expected: 24, diagnostic: null }).label,
  "Ne part pas",
);
assert.equal(automationState({ status: "draft", entries: 0, expected: 24, diagnostic: null }).label, "En pause");
assert.equal(
  automationState({ status: "active", entries: 0, expected: 0, diagnostic: blocked }).label,
  "Ne part pas",
);

assert.equal(volumeLabel({ triggerType: "quote.submitted", entries: 3, sends: 7, expected: 3 }), "7 envois · 3 entrées");
assert.equal(
  volumeLabel({ triggerType: "session.abandoned", entries: 0, sends: 0, expected: 24 }),
  "0 / 24 abandons",
);

const board = buildFunnelAutomationBoard({
  kind: "chat",
  funnelId: "funnel-1",
  period: { quotes: 3, won: 0, abandons: 24 },
  tallies: {
    demande: { entries: 3, sends: 7 },
    abandon: { entries: 0, sends: 0 },
  },
  workflows: [
    {
      id: "demande",
      name: "Parcours demande",
      status: "active",
      triggerType: "quote.submitted",
      triggerConfig: {},
      definition: quoteSubmittedDefinition(),
    },
    {
      id: "abandon",
      name: "Parcours abandon",
      status: "active",
      triggerType: "session.abandoned",
      triggerConfig: {},
      definition: sessionAbandonedDefinition(),
    },
    {
      id: "other",
      name: "Autre funnel",
      status: "active",
      triggerType: "quote.status_changed",
      triggerConfig: { configuratorIds: ["funnel-2"], statusSlug: "won" },
      definition: { nodes: [], edges: [] },
    },
  ],
});

assert.equal(board.attachedCount, 2);
assert.equal(board.stalledCount, 1);
assert.equal(board.summary, "2 parcours attachés · 1 ne part pas");
assert.equal(board.rows[0]?.volume, "7 envois · 3 entrées");
assert.equal(board.rows[1]?.stateLabel, "Ne part pas");
assert.equal(board.rows[1]?.volume, "0 / 24 abandons");
assert.equal(board.gaps.length, 1);
assert.equal(board.gaps[0]?.triggerLabel, "Devis accepté");
assert.equal(board.available.length, 1);
assert.equal(board.available[0]?.name, "Autre funnel");

console.log("funnels/automations ok");
