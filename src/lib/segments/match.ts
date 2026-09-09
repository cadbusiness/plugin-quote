import type { Answers } from "@/lib/wizard/types";
import type { SegmentContact, SegmentRule, SegmentRules } from "@/lib/segments/types";

function asRecord(value: unknown): Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Answers;
}

function scalar(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => String(item)).join(",");
  if (value == null) return "";
  return String(value);
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return null;
  return (Date.now() - then) / 86_400_000;
}

export function matchRule(rule: SegmentRule, contact: SegmentContact): boolean {
  const op = rule.op;
  const expected = rule.value;

  const compare = (actual: unknown) => {
    if (op === "gte") return Number(actual) >= Number(expected);
    if (op === "lte") return Number(actual) <= Number(expected);
    if (op === "contains") return scalar(actual).toLowerCase().includes(scalar(expected).toLowerCase());
    if (op === "neq") return scalar(actual).toLowerCase() !== scalar(expected).toLowerCase();
    return scalar(actual).toLowerCase() === scalar(expected).toLowerCase();
  };

  switch (rule.field) {
    case "funnel":
      return compare(contact.configuratorId);
    case "score_label":
      return compare(contact.scoreLabel);
    case "status":
      return compare(contact.statusSlug);
    case "audience": {
      const isB2b = Boolean(contact.contactCompany?.trim());
      if (expected === "b2b") return isB2b;
      if (expected === "b2c") return !isB2b;
      return compare(isB2b ? "b2b" : "b2c");
    }
    case "answer":
      return compare(asRecord(contact.answers)[rule.answerKey ?? ""]);
    case "recently_contacted": {
      const days = daysSince(contact.lastCampaignAt);
      if (op === "never") return days === null;
      if (op === "older_than") {
        const min = Number(expected);
        if (!Number.isFinite(min)) return true;
        return days === null || days >= min;
      }
      return compare(days);
    }
    default:
      return false;
  }
}

export function matchSegment(rules: SegmentRules, contact: SegmentContact): boolean {
  const all = rules.all ?? [];
  if (!all.length) return true;
  return all.every((rule) => matchRule(rule, contact));
}

export function parseSegmentRules(value: unknown): SegmentRules {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { all: [] };
  const raw = (value as { all?: unknown }).all;
  if (!Array.isArray(raw)) return { all: [] };
  const all: SegmentRule[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const field = String(row.field ?? "");
    const op = String(row.op ?? "eq");
    if (!field) continue;
    all.push({
      field: field as SegmentRule["field"],
      op: (op || "eq") as SegmentRule["op"],
      value: String(row.value ?? ""),
      answerKey: typeof row.answerKey === "string" ? row.answerKey : undefined,
    });
  }
  return { all };
}

export function recentlyContacted(lastCampaignAt: string | null, skipRecentDays: number): boolean {
  if (skipRecentDays <= 0) return false;
  const days = daysSince(lastCampaignAt);
  if (days === null) return false;
  return days < skipRecentDays;
}
