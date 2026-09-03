import type { WorkflowNode, WorkflowNodeType, WorkflowRunStatus, WorkflowStatus, WorkflowTriggerType } from "@/lib/workflows/types";

export const TRIGGER_LABELS: Record<WorkflowTriggerType, string> = {
  "quote.submitted": "Soumission",
  "session.abandoned": "Abandon",
  "quote.status_changed": "Changement de statut",
};

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
