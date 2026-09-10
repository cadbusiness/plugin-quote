import type { Answers } from "@/lib/wizard/types";

export type SegmentField =
  | "funnel"
  | "score_label"
  | "status"
  | "audience"
  | "answer"
  | "recently_contacted";

export type SegmentOp = "eq" | "neq" | "contains" | "gte" | "lte" | "never" | "older_than";

export type SegmentRule = {
  field: SegmentField;
  op: SegmentOp;
  value: string;
  answerKey?: string;
};

export type SegmentRules = {
  all: SegmentRule[];
};

export type SegmentContact = {
  id: string;
  contactName: string;
  contactEmail: string;
  contactCompany: string | null;
  scoreLabel: string | null;
  statusSlug: string | null;
  configuratorId: string;
  answers: Answers;
  lastCampaignAt: string | null;
  consentMarketing: boolean;
};

export const FIELD_LABELS: Record<SegmentField, string> = {
  funnel: "Funnel",
  score_label: "Score",
  status: "Statut",
  audience: "Audience",
  answer: "Réponse funnel",
  recently_contacted: "Dernier email marketing",
};

export const OP_LABELS: Record<SegmentOp, string> = {
  eq: "est",
  neq: "n’est pas",
  contains: "contient",
  gte: "≥",
  lte: "≤",
  never: "jamais relancé",
  older_than: "il y a plus de (jours)",
};
