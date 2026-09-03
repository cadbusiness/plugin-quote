import type { Json } from "@/lib/db/database.types";

export const WORKFLOW_TRIGGERS = [
  "quote.submitted",
  "session.abandoned",
  "quote.status_changed",
] as const;

export type WorkflowTriggerType = (typeof WORKFLOW_TRIGGERS)[number];

export const WORKFLOW_NODE_TYPES = [
  "trigger",
  "send_email",
  "wait",
  "branch",
  "assign",
  "set_status",
  "exit",
] as const;

export type WorkflowNodeType = (typeof WORKFLOW_NODE_TYPES)[number];

export const WORKFLOW_STATUSES = ["draft", "active", "archived"] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export const RUN_STATUSES = ["running", "waiting", "completed", "failed", "exited"] as const;
export type WorkflowRunStatus = (typeof RUN_STATUSES)[number];

export type WorkflowSubjectType = "quote" | "session";

export type EmailRecipient = "prospect" | "assignee" | "sales_email";

export type BranchField =
  | "score_label"
  | "score_gte"
  | "status"
  | "answer"
  | "has_product"
  | "assigned"
  | "has_company"
  | "is_closed";

export type BranchCondition = {
  id: string;
  field: BranchField;
  op?: "eq" | "neq" | "gte" | "contains";
  value?: string | number | boolean;
  answerKey?: string;
};

export type WorkflowNodeData = {
  label?: string;
  templateKind?: string;
  recipient?: EmailRecipient;
  attachPdf?: boolean;
  waitHours?: number;
  waitFrom?: "now" | "last_activity";
  conditions?: BranchCondition[];
  userId?: string | null;
  statusSlug?: string;
};

export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
};

export type WorkflowDefinition = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type WorkflowTriggerConfig = {
  configuratorIds?: string[];
  abandonHours?: number;
  statusSlug?: string;
};

export type PendingWait = {
  nodeId: string;
  wakeupAt: string;
  waitHours: number;
  waitFrom: "now" | "last_activity";
};

export type RunContext = {
  pending: PendingWait[];
  finishedNodeIds: string[];
  suiviUrl?: string;
  pin?: string;
  resumeUrl?: string;
  suggestionName?: string;
  priceMin?: number | null;
  priceMax?: number | null;
};

export type SubjectContext = {
  subjectType: WorkflowSubjectType;
  subjectId: string;
  organizationId: string;
  configuratorId: string | null;
  contactName: string;
  contactEmail: string | null;
  contactCompany: string;
  score: number | null;
  scoreLabel: string | null;
  statusSlug: string | null;
  isClosed: boolean;
  assigned: boolean;
  assigneeUserId: string | null;
  answers: Record<string, unknown>;
  productIds: string[];
  productNames: string[];
  priceMin: number | null;
  priceMax: number | null;
  lastActivityAt: string;
  resumeUrl: string;
  suiviUrl: string;
  pin: string;
  salesEmail: string | null;
  salesName: string;
  submitted: boolean;
};

export function parseDefinition(value: Json | null | undefined): WorkflowDefinition {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { nodes: [], edges: [] };
  }
  const raw = value as { nodes?: unknown; edges?: unknown };
  const nodes = Array.isArray(raw.nodes)
    ? raw.nodes.flatMap((node) => {
        if (!node || typeof node !== "object") return [];
        const item = node as Partial<WorkflowNode>;
        if (!item.id || !isNodeType(item.type)) return [];
        return [
          {
            id: String(item.id),
            type: item.type,
            position: {
              x: Number(item.position?.x ?? 0),
              y: Number(item.position?.y ?? 0),
            },
            data: item.data && typeof item.data === "object" ? item.data : {},
          } satisfies WorkflowNode,
        ];
      })
    : [];
  const edges = Array.isArray(raw.edges)
    ? raw.edges.flatMap((edge) => {
        if (!edge || typeof edge !== "object") return [];
        const item = edge as Partial<WorkflowEdge>;
        if (!item.id || !item.source || !item.target) return [];
        return [
          {
            id: String(item.id),
            source: String(item.source),
            target: String(item.target),
            sourceHandle: item.sourceHandle ?? null,
          } satisfies WorkflowEdge,
        ];
      })
    : [];
  return { nodes, edges };
}

export function parseTriggerConfig(value: Json | null | undefined): WorkflowTriggerConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const raw = value as WorkflowTriggerConfig;
  return {
    configuratorIds: Array.isArray(raw.configuratorIds)
      ? raw.configuratorIds.filter((id): id is string => typeof id === "string")
      : [],
    abandonHours: typeof raw.abandonHours === "number" ? raw.abandonHours : undefined,
    statusSlug: typeof raw.statusSlug === "string" ? raw.statusSlug : undefined,
  };
}

export function parseRunContext(value: Json | null | undefined): RunContext {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { pending: [], finishedNodeIds: [] };
  }
  const raw = value as Partial<RunContext>;
  return {
    pending: Array.isArray(raw.pending)
      ? raw.pending.filter((item): item is PendingWait => Boolean(item?.nodeId && item.wakeupAt))
      : [],
    finishedNodeIds: Array.isArray(raw.finishedNodeIds)
      ? raw.finishedNodeIds.filter((id): id is string => typeof id === "string")
      : [],
    suiviUrl: typeof raw.suiviUrl === "string" ? raw.suiviUrl : undefined,
    pin: typeof raw.pin === "string" ? raw.pin : undefined,
    resumeUrl: typeof raw.resumeUrl === "string" ? raw.resumeUrl : undefined,
    suggestionName: typeof raw.suggestionName === "string" ? raw.suggestionName : undefined,
    priceMin: typeof raw.priceMin === "number" ? raw.priceMin : raw.priceMin === null ? null : undefined,
    priceMax: typeof raw.priceMax === "number" ? raw.priceMax : raw.priceMax === null ? null : undefined,
  };
}

export function emptyStarter(triggerType: WorkflowTriggerType): WorkflowDefinition {
  return {
    nodes: [
      {
        id: "trigger",
        type: "trigger",
        position: { x: 280, y: 24 },
        data: { label: triggerLabel(triggerType) },
      },
      {
        id: "exit",
        type: "exit",
        position: { x: 292, y: 220 },
        data: { label: "Fin" },
      },
    ],
    edges: [{ id: "e-trigger-exit", source: "trigger", target: "exit" }],
  };
}

export function triggerLabel(type: WorkflowTriggerType): string {
  if (type === "quote.submitted") return "Demande soumise";
  if (type === "session.abandoned") return "Session abandonnée";
  return "Statut modifié";
}

export function triggerSubject(type: WorkflowTriggerType): WorkflowSubjectType {
  return type === "session.abandoned" ? "session" : "quote";
}

function isNodeType(value: unknown): value is WorkflowNodeType {
  return WORKFLOW_NODE_TYPES.includes(value as WorkflowNodeType);
}
