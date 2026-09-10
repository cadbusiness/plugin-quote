import type { WorkflowNode, WorkflowNodeType, WorkflowRunStatus, WorkflowStatus, WorkflowTriggerType } from "@/lib/workflows/types";

export const TRIGGER_LABELS: Record<WorkflowTriggerType, string> = {
  "quote.submitted": "Demande",
  "session.abandoned": "Abandon",
  "quote.status_changed": "Statut",
};

export const TRIGGER_WHEN: Record<WorkflowTriggerType, string> = {
  "quote.submitted": "Demande envoyée",
  "session.abandoned": "Prospect parti",
  "quote.status_changed": "Statut changé",
};

export const TRIGGER_HELP: Record<WorkflowTriggerType, string> = {
  "quote.submitted": "Les emails partent dès qu’un prospect envoie son devis.",
  "session.abandoned": "Relance si le prospect quitte le funnel en cours de route.",
  "quote.status_changed": "Se lance quand vous changez le statut d’une demande.",
};

export const TRIGGER_ORDER: WorkflowTriggerType[] = [
  "quote.submitted",
  "session.abandoned",
  "quote.status_changed",
];

export const NODE_TYPE_LABELS: Record<WorkflowNodeType, string> = {
  trigger: "Déclencheur",
  send_email: "Envoyer un email",
  wait: "Attendre",
  branch: "Condition",
  assign: "Assigner",
  set_status: "Changer le statut",
  exit: "Fin",
};

export const TEMPLATE_LABELS: Record<string, string> = {
  prospect_confirm: "Confirmation prospect",
  sales_brief: "Brief commercial",
  sales_unprocessed: "Rappel interne si non traité",
  prospect_reassure: "Email rassurant",
  prospect_followup: "Relance douce",
  prospect_photo: "Demande de photo",
  session_resume: "Reprise de session",
  session_resume_late: "Seconde relance reprise",
};

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  draft: "Brouillon",
  active: "Actif",
  archived: "Archivé",
};

export const RUN_STATUS_LABELS: Record<WorkflowRunStatus, string> = {
  running: "En cours",
  waiting: "En attente",
  completed: "Terminé",
  failed: "Échec",
  exited: "Interrompu",
};

export function nodeTitle(node: WorkflowNode): string {
  if (node.data.label?.trim()) return node.data.label.trim();
  if (node.type === "send_email") {
    return TEMPLATE_LABELS[node.data.templateKind ?? ""] ?? NODE_TYPE_LABELS.send_email;
  }
  if (node.type === "wait") {
    const hours = node.data.waitHours ?? 1;
    return hours >= 24 && hours % 24 === 0 ? `Attendre ${hours / 24} j` : `Attendre ${hours} h`;
  }
  if (node.type === "set_status") return `Statut → ${node.data.statusSlug ?? "…"}`;
  return NODE_TYPE_LABELS[node.type];
}

export function templateLabel(kind: string): string {
  return TEMPLATE_LABELS[kind] ?? kind;
}

export function workflowActionSteps(nodes: WorkflowNode[]): { type: WorkflowNodeType; label: string }[] {
  return nodes
    .filter((node) => node.type !== "trigger" && node.type !== "exit")
    .map((node) => ({ type: node.type, label: nodeTitle(node) }));
}
