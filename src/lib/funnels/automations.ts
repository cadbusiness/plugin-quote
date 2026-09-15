import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import type { FunnelKind } from "@/lib/funnels/builder";
import { nodeTitle } from "@/lib/workflows/labels";
import { resolveAbandonHours } from "@/lib/workflows/policy";
import {
  parseDefinition,
  parseRunContext,
  parseTriggerConfig,
  type WorkflowDefinition,
  type WorkflowNode,
  type WorkflowNodeType,
  type WorkflowStatus,
  type WorkflowTriggerType,
} from "@/lib/workflows/types";

export const AUTOMATION_WINDOW_DAYS = 30;
export const CHAT_SESSION_MINUTES = 30;
export const SUGGESTED_ABANDON_MINUTES = 20;

export type FunnelWorkflowScope = "all" | "this" | "other";
export type AutomationRunState = "running" | "stalled" | "paused";

export type AutomationSlotId = "quote.submitted" | "session.abandoned" | "quote.won";

export type TimelineKind = "wait" | "email" | "branch" | "assign" | "status";

export type AutomationTimelineStep = {
  id: string;
  offsetHours: number;
  kind: TimelineKind;
  kindLabel: string;
  label: string;
};

export type AutomationDiagnostic = {
  message: string;
  actionLabel: string;
  actionMinutes: number;
};

export type FunnelAutomationRow = {
  id: string;
  name: string;
  status: WorkflowStatus;
  triggerType: WorkflowTriggerType;
  statusSlug: string | undefined;
  abandonHours: number;
  scope: FunnelWorkflowScope;
  slotId: AutomationSlotId | null;
  triggerLabel: string;
  state: AutomationRunState;
  stateLabel: string;
  entries: number;
  sends: number;
  expected: number;
  volume: string;
  volumeHot: boolean;
  timeline: AutomationTimelineStep[];
  durationHours: number;
  diagnostic: AutomationDiagnostic | null;
};

export type FunnelAutomationGap = {
  slotId: AutomationSlotId;
  triggerType: WorkflowTriggerType;
  statusSlug: string | undefined;
  triggerLabel: string;
};

export type FunnelAutomationAvailable = {
  id: string;
  name: string;
  triggerType: WorkflowTriggerType;
  statusSlug: string | undefined;
  slotId: AutomationSlotId | null;
};

export type FunnelAutomationBoard = {
  rows: FunnelAutomationRow[];
  gaps: FunnelAutomationGap[];
  available: FunnelAutomationAvailable[];
  attachedCount: number;
  stalledCount: number;
  summary: string;
};

export type FunnelAutomationSource = {
  id: string;
  name: string;
  status: WorkflowStatus;
  triggerType: WorkflowTriggerType;
  triggerConfig: unknown;
  definition: unknown;
};

export type FunnelAutomationPeriod = {
  quotes: number;
  won: number;
  abandons: number;
};

export type FunnelAutomationTally = {
  entries: number;
  sends: number;
};

const SLOTS: {
  id: AutomationSlotId;
  triggerType: WorkflowTriggerType;
  statusSlug?: string;
}[] = [
  { id: "quote.submitted", triggerType: "quote.submitted" },
  { id: "session.abandoned", triggerType: "session.abandoned" },
  { id: "quote.won", triggerType: "quote.status_changed", statusSlug: "won" },
];

const KIND_LABEL: Record<TimelineKind, string> = {
  wait: "Attente",
  email: "Email",
  branch: "Condition",
  assign: "Assignation",
  status: "Statut",
};

export function hoursFromMinutes(minutes: number) {
  return Math.max(0, minutes) / 60;
}

export function formatHours(hours: number) {
  const minutes = Math.round(hours * 60);
  if (minutes <= 0) return "0 min";
  if (minutes < 60) return `${minutes} min`;
  if (minutes % 60 === 0) return `${minutes / 60} h`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60}`;
}

export function triggerCopy(
  triggerType: WorkflowTriggerType,
  kind: FunnelKind,
  statusSlug?: string,
) {
  if (triggerType === "quote.submitted") {
    return kind === "chat" ? "Chat terminé avec coordonnées" : "Demande envoyée";
  }
  if (triggerType === "session.abandoned") {
    return kind === "chat" ? "Chat quitté sans finir" : "Parcours quitté sans finir";
  }
  if (statusSlug === "won") return "Devis accepté";
  return "Changement de statut";
}

export function slotForWorkflow(triggerType: WorkflowTriggerType, statusSlug?: string): AutomationSlotId | null {
  if (triggerType === "quote.submitted") return "quote.submitted";
  if (triggerType === "session.abandoned") return "session.abandoned";
  if (triggerType === "quote.status_changed" && (!statusSlug || statusSlug === "won")) return "quote.won";
  return null;
}

export function workflowTimeline(
  definition: WorkflowDefinition,
  triggerType: WorkflowTriggerType,
): { steps: AutomationTimelineStep[]; durationHours: number } {
  const nodes = new Map(definition.nodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, string[]>();
  for (const edge of definition.edges) {
    const list = outgoing.get(edge.source) ?? [];
    list.push(edge.target);
    outgoing.set(edge.source, list);
  }

  const trigger = definition.nodes.find((node) => node.type === "trigger");
  const seen = new Map<string, number>();
  const steps: AutomationTimelineStep[] = [];

  function walk(nodeId: string, elapsed: number) {
    const node = nodes.get(nodeId);
    if (!node) return;
    const previous = seen.get(nodeId);
    if (previous !== undefined && previous <= elapsed) return;
    seen.set(nodeId, elapsed);

    if (node.type === "exit" || node.type === "trigger") {
      for (const next of outgoing.get(nodeId) ?? []) walk(next, elapsed);
      return;
    }

    const kind = timelineKind(node.type);
    if (kind) {
      let offset = elapsed;
      if (kind === "wait") offset = elapsed + Math.max(0, node.data.waitHours ?? 1);
      steps.push({
        id: node.id,
        offsetHours: offset,
        kind,
        kindLabel: KIND_LABEL[kind],
        label: timelineLabel(node, triggerType, steps.length === 0),
      });
      for (const next of outgoing.get(nodeId) ?? []) walk(next, offset);
      return;
    }

    for (const next of outgoing.get(nodeId) ?? []) walk(next, elapsed);
  }

  if (trigger) walk(trigger.id, 0);
  else {
    for (const node of definition.nodes) walk(node.id, 0);
  }

  const unique = [...new Map(steps.map((step) => [step.id, step])).values()].sort(
    (a, b) => a.offsetHours - b.offsetHours || a.label.localeCompare(b.label, "fr"),
  );
  const durationHours = unique.reduce((max, step) => Math.max(max, step.offsetHours), 0);
  return { steps: unique, durationHours };
}

export function withAbandonWait(definition: WorkflowDefinition, hours: number): WorkflowDefinition {
  const wait = firstWaitNode(definition);
  if (!wait) return definition;
  return {
    ...definition,
    nodes: definition.nodes.map((node) =>
      node.id === wait.id ? { ...node, data: { ...node.data, waitHours: hours } } : node,
    ),
  };
}

export function firstWaitNode(definition: WorkflowDefinition): WorkflowNode | null {
  const trigger = definition.nodes.find((node) => node.type === "trigger");
  if (trigger) {
    const next = definition.edges
      .filter((edge) => edge.source === trigger.id)
      .map((edge) => definition.nodes.find((node) => node.id === edge.target))
      .find((node) => node?.type === "wait");
    if (next) return next;
  }
  return definition.nodes.find((node) => node.type === "wait") ?? null;
}

export function chatAbandonDiagnostic(
  kind: FunnelKind,
  triggerType: WorkflowTriggerType,
  waitHours: number,
): AutomationDiagnostic | null {
  if (kind !== "chat" || triggerType !== "session.abandoned") return null;
  if (waitHours * 60 <= CHAT_SESSION_MINUTES) return null;
  return {
    message: `L’attente est de ${formatHours(waitHours)} mais une session de chat expire à ${CHAT_SESSION_MINUTES} min : aucun abandon n’atteint l’étape 1.`,
    actionLabel: `Passer à ${SUGGESTED_ABANDON_MINUTES} min`,
    actionMinutes: SUGGESTED_ABANDON_MINUTES,
  };
}

export function automationState(input: {
  status: WorkflowStatus;
  entries: number;
  expected: number;
  diagnostic: AutomationDiagnostic | null;
}): { state: AutomationRunState; label: string } {
  if (input.status !== "active") return { state: "paused", label: "En pause" };
  if (input.entries === 0 && (input.expected > 0 || input.diagnostic)) {
    return { state: "stalled", label: "Ne part pas" };
  }
  return { state: "running", label: "Tourne" };
}

export function volumeLabel(input: {
  triggerType: WorkflowTriggerType;
  entries: number;
  sends: number;
  expected: number;
}) {
  if (input.triggerType === "session.abandoned") {
    return `${input.entries} / ${input.expected} abandon${input.expected > 1 ? "s" : ""}`;
  }
  return `${input.sends} envoi${input.sends > 1 ? "s" : ""} · ${input.entries} entrée${input.entries > 1 ? "s" : ""}`;
}

export function sendCountForRun(definition: WorkflowDefinition, context: unknown) {
  const finished = new Set(parseRunContext(context as never).finishedNodeIds);
  return definition.nodes.filter((node) => node.type === "send_email" && finished.has(node.id)).length;
}

export function buildFunnelAutomationBoard(input: {
  kind: FunnelKind;
  workflows: FunnelAutomationSource[];
  funnelId: string;
  period: FunnelAutomationPeriod;
  tallies: Record<string, FunnelAutomationTally>;
}): FunnelAutomationBoard {
  const mapped = input.workflows.map((workflow) => {
    const config = parseTriggerConfig(workflow.triggerConfig as never);
    const ids = config.configuratorIds ?? [];
    const scope: FunnelWorkflowScope = !ids.length ? "all" : ids.includes(input.funnelId) ? "this" : "other";
    const definition = parseDefinition(workflow.definition as never);
    const { steps, durationHours } = workflowTimeline(definition, workflow.triggerType);
    const waitNode = firstWaitNode(definition);
    const abandonHours = resolveAbandonHours(config);
    const waitHours =
      workflow.triggerType === "session.abandoned"
        ? Math.max(abandonHours, waitNode?.data.waitHours ?? 0)
        : abandonHours;
    const slotId = slotForWorkflow(workflow.triggerType, config.statusSlug);
    const expected =
      workflow.triggerType === "session.abandoned"
        ? input.period.abandons
        : workflow.triggerType === "quote.status_changed"
          ? input.period.won
          : input.period.quotes;
    const tally = input.tallies[workflow.id] ?? { entries: 0, sends: 0 };
    const diagnostic = chatAbandonDiagnostic(input.kind, workflow.triggerType, waitHours);
    const mark = automationState({
      status: workflow.status,
      entries: tally.entries,
      expected,
      diagnostic: scope === "other" ? null : diagnostic,
    });
    const volumeHot = mark.state === "stalled";
    return {
      id: workflow.id,
      name: workflow.name,
      status: workflow.status,
      triggerType: workflow.triggerType,
      statusSlug: config.statusSlug,
      abandonHours,
      scope,
      slotId,
      triggerLabel: triggerCopy(workflow.triggerType, input.kind, config.statusSlug),
      state: mark.state,
      stateLabel: mark.label,
      entries: tally.entries,
      sends: tally.sends,
      expected,
      volume: volumeLabel({
        triggerType: workflow.triggerType,
        entries: tally.entries,
        sends: tally.sends,
        expected,
      }),
      volumeHot,
      timeline: steps,
      durationHours,
      diagnostic: scope === "other" ? null : diagnostic,
    } satisfies FunnelAutomationRow;
  });

  const rows = mapped.filter((row) => row.scope !== "other");
  const covered = new Set(rows.map((row) => row.slotId).filter(Boolean));
  const gaps = SLOTS.filter((slot) => !covered.has(slot.id)).map((slot) => ({
    slotId: slot.id,
    triggerType: slot.triggerType,
    statusSlug: slot.statusSlug,
    triggerLabel: triggerCopy(slot.triggerType, input.kind, slot.statusSlug),
  }));
  const available = mapped
    .filter((row) => row.scope === "other")
    .map((row) => ({
      id: row.id,
      name: row.name,
      triggerType: row.triggerType,
      statusSlug: row.statusSlug,
      slotId: row.slotId,
    }));
  const stalledCount = rows.filter((row) => row.state === "stalled").length;
  const attachedCount = rows.length;
  const summary = [
    `${attachedCount} parcours attaché${attachedCount > 1 ? "s" : ""}`,
    stalledCount ? `${stalledCount} ne part pas` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return { rows, gaps, available, attachedCount, stalledCount, summary };
}

function timelineKind(type: WorkflowNodeType): TimelineKind | null {
  if (type === "wait") return "wait";
  if (type === "send_email") return "email";
  if (type === "branch") return "branch";
  if (type === "assign") return "assign";
  if (type === "set_status") return "status";
  return null;
}

function timelineLabel(node: WorkflowNode, triggerType: WorkflowTriggerType, first: boolean) {
  if (
    first &&
    node.type === "wait" &&
    triggerType === "session.abandoned" &&
    (node.data.waitFrom ?? "now") === "last_activity"
  ) {
    return "Inactivité détectée";
  }
  return nodeTitle(node);
}

export async function loadFunnelAutomationBoard(
  supabase: SupabaseClient<Database>,
  input: {
    orgId: string;
    funnelId: string;
    kind: FunnelKind;
    workflows: FunnelAutomationSource[];
  },
): Promise<FunnelAutomationBoard> {
  const since = new Date(Date.now() - AUTOMATION_WINDOW_DAYS * 86400000).toISOString();
  const [{ data: quotes }, { data: sessions }, { data: runs }] = await Promise.all([
    supabase
      .from("quotes")
      .select("id, status")
      .eq("organization_id", input.orgId)
      .eq("configurator_id", input.funnelId)
      .gte("created_at", since),
    supabase
      .from("quote_sessions")
      .select("id, submitted_quote_id")
      .eq("organization_id", input.orgId)
      .eq("configurator_id", input.funnelId)
      .gte("created_at", since),
    input.workflows.length
      ? supabase
          .from("workflow_runs")
          .select("id, workflow_id, subject_id, context")
          .eq("organization_id", input.orgId)
          .gte("started_at", since)
          .in(
            "workflow_id",
            input.workflows.map((workflow) => workflow.id),
          )
      : Promise.resolve({ data: [] as { id: string; workflow_id: string; subject_id: string; context: unknown }[] }),
  ]);

  const subjects = new Set([
    ...(quotes ?? []).map((quote) => quote.id),
    ...(sessions ?? []).map((session) => session.id),
  ]);
  const definitions = new Map(
    input.workflows.map((workflow) => [workflow.id, parseDefinition(workflow.definition as never)]),
  );
  const tallies: Record<string, FunnelAutomationTally> = {};
  for (const run of runs ?? []) {
    if (!subjects.has(run.subject_id)) continue;
    const current = tallies[run.workflow_id] ?? { entries: 0, sends: 0 };
    current.entries += 1;
    const definition = definitions.get(run.workflow_id);
    if (definition) current.sends += sendCountForRun(definition, run.context);
    tallies[run.workflow_id] = current;
  }

  return buildFunnelAutomationBoard({
    kind: input.kind,
    funnelId: input.funnelId,
    workflows: input.workflows,
    period: {
      quotes: (quotes ?? []).length,
      won: (quotes ?? []).filter((quote) => quote.status === "won").length,
      abandons: (sessions ?? []).filter((session) => !session.submitted_quote_id).length,
    },
    tallies,
  });
}
