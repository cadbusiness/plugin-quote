import type { WorkflowDefinition, WorkflowTriggerType } from "@/lib/workflows/types";
import { emptyStarter } from "@/lib/workflows/types";

function node(
  id: string,
  type: WorkflowDefinition["nodes"][number]["type"],
  x: number,
  y: number,
  data: WorkflowDefinition["nodes"][number]["data"],
): WorkflowDefinition["nodes"][number] {
  return { id, type, position: { x, y }, data };
}

function edge(source: string, target: string, sourceHandle?: string): WorkflowDefinition["edges"][number] {
  return {
    id: `e-${source}-${sourceHandle ?? "out"}-${target}`,
    source,
    target,
    sourceHandle: sourceHandle ?? null,
  };
}

export function quoteSubmittedDefinition(): WorkflowDefinition {
  return {
    nodes: [
      node("trigger", "trigger", 640, 0, { label: "Demande soumise" }),
      node("mail-confirm", "send_email", 40, 160, {
        label: "Confirmation prospect",
        templateKind: "prospect_confirm",
        recipient: "prospect",
        attachPdf: true,
      }),
      node("mail-sales", "send_email", 360, 160, {
        label: "Brief commercial",
        templateKind: "sales_brief",
        recipient: "sales_email",
      }),
      node("wait-4h", "wait", 680, 160, { label: "Attendre 4 h", waitHours: 4, waitFrom: "now" }),
      node("branch-new", "branch", 680, 320, {
        label: "Encore Nouveau ?",
        conditions: [{ id: "yes", field: "status", op: "eq", value: "new" }],
      }),
      node("mail-unprocessed", "send_email", 560, 480, {
        label: "Rappel interne",
        templateKind: "sales_unprocessed",
        recipient: "assignee",
      }),
      node("exit-new", "exit", 840, 480, { label: "Déjà pris en charge" }),
      node("wait-24h", "wait", 1040, 160, { label: "Attendre 24 h", waitHours: 24, waitFrom: "now" }),
      node("branch-24", "branch", 1040, 320, {
        label: "Dossier ouvert ?",
        conditions: [{ id: "open", field: "is_closed", op: "eq", value: false }],
      }),
      node("mail-reassure", "send_email", 920, 480, {
        label: "Email rassurant",
        templateKind: "prospect_reassure",
        recipient: "prospect",
      }),
      node("exit-24", "exit", 1200, 480, { label: "Dossier clos" }),
      node("wait-photo", "wait", 1400, 160, { label: "Attendre 24 h", waitHours: 24, waitFrom: "now" }),
      node("branch-photo", "branch", 1400, 320, {
        label: "Dossier ouvert ?",
        conditions: [{ id: "open", field: "is_closed", op: "eq", value: false }],
      }),
      node("mail-photo", "send_email", 1280, 480, {
        label: "Demande de photo",
        templateKind: "prospect_photo",
        recipient: "prospect",
      }),
      node("exit-photo", "exit", 1560, 480, { label: "Dossier clos" }),
      node("wait-72h", "wait", 1760, 160, { label: "Attendre 3 j", waitHours: 72, waitFrom: "now" }),
      node("branch-72", "branch", 1760, 320, {
        label: "Dossier ouvert ?",
        conditions: [{ id: "open", field: "is_closed", op: "eq", value: false }],
      }),
      node("mail-followup", "send_email", 1640, 480, {
        label: "Relance douce",
        templateKind: "prospect_followup",
        recipient: "prospect",
      }),
      node("exit-72", "exit", 1920, 480, { label: "Dossier clos" }),
    ],
    edges: [
      edge("trigger", "mail-confirm"),
      edge("trigger", "mail-sales"),
      edge("trigger", "wait-4h"),
      edge("trigger", "wait-24h"),
      edge("trigger", "wait-photo"),
      edge("trigger", "wait-72h"),
      edge("wait-4h", "branch-new"),
      edge("branch-new", "mail-unprocessed", "yes"),
      edge("branch-new", "exit-new", "else"),
      edge("wait-24h", "branch-24"),
      edge("branch-24", "mail-reassure", "open"),
      edge("branch-24", "exit-24", "else"),
      edge("wait-photo", "branch-photo"),
      edge("branch-photo", "mail-photo", "open"),
      edge("branch-photo", "exit-photo", "else"),
      edge("wait-72h", "branch-72"),
      edge("branch-72", "mail-followup", "open"),
      edge("branch-72", "exit-72", "else"),
    ],
  };
}

export function sessionAbandonedDefinition(): WorkflowDefinition {
  return {
    nodes: [
      node("trigger", "trigger", 360, 0, { label: "Session abandonnée" }),
      node("wait-1h", "wait", 80, 160, { label: "Inactif 1 h", waitHours: 1, waitFrom: "last_activity" }),
      node("mail-resume", "send_email", 80, 320, {
        label: "Reprise de session",
        templateKind: "session_resume",
        recipient: "prospect",
      }),
      node("wait-24h", "wait", 560, 160, { label: "Inactif 24 h", waitHours: 24, waitFrom: "last_activity" }),
      node("mail-late", "send_email", 560, 320, {
        label: "Seconde relance",
        templateKind: "session_resume_late",
        recipient: "prospect",
      }),
    ],
    edges: [
      edge("trigger", "wait-1h"),
      edge("wait-1h", "mail-resume"),
      edge("trigger", "wait-24h"),
      edge("wait-24h", "mail-late"),
    ],
  };
}

export function defaultDefinition(triggerType: WorkflowTriggerType): WorkflowDefinition {
  if (triggerType === "quote.submitted") return quoteSubmittedDefinition();
  if (triggerType === "session.abandoned") return sessionAbandonedDefinition();
  return emptyStarter(triggerType);
}

export function defaultWorkflowName(triggerType: WorkflowTriggerType): string {
  if (triggerType === "quote.submitted") return "Parcours demande";
  if (triggerType === "session.abandoned") return "Parcours abandon";
  return "Après changement de statut";
}
