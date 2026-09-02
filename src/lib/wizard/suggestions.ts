import type {
  Answers,
  Condition,
  Product,
  RuleConditions,
  Suggestion,
} from "@/lib/wizard/types";
import type { Json } from "@/lib/db/database.types";
import type { Tables } from "@/lib/db/database.types";

function asNumber(value: Json | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function matchesCondition(answers: Answers, condition: Condition): boolean {
  const raw = answers[condition.key];
  switch (condition.op) {
    case "eq":
      return raw === condition.value || String(raw) === String(condition.value);
    case "neq":
      return raw !== condition.value && String(raw) !== String(condition.value);
    case "gte": {
      const n = asNumber(raw);
      const t = asNumber(condition.value);
      return n !== null && t !== null && n >= t;
    }
    case "lte": {
      const n = asNumber(raw);
      const t = asNumber(condition.value);
      return n !== null && t !== null && n <= t;
    }
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(raw as never);
    case "contains":
      return Array.isArray(raw) && raw.includes(condition.value as never);
    default:
      return false;
  }
}

export function ruleMatches(answers: Answers, conditions: RuleConditions): boolean {
  const all = conditions.all ?? [];
  if (all.length === 0) return true;
  return all.every((c) => matchesCondition(answers, c));
}

export function evaluateSuggestions(
  answers: Answers,
  rules: Tables<"suggestion_rules">[],
  products: Product[],
  limit = 3,
): Suggestion[] {
  const productById = new Map(products.map((p) => [p.id, p]));
  const matched = rules
    .filter((rule) => rule.is_active)
    .filter((rule) => ruleMatches(answers, (rule.conditions ?? {}) as RuleConditions))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map((rule) => ({
      id: rule.id,
      name: rule.name,
      headline: rule.headline,
      description: rule.description,
      imageUrl: rule.image_url,
      priceMin: rule.price_min,
      priceMax: rule.price_max,
      products: (rule.product_ids ?? [])
        .map((id) => productById.get(id))
        .filter((p): p is Product => Boolean(p)),
    }));

  return matched;
}

export function mergeAnswers(sessionAnswers: Answers, extracted: Answers): Answers {
  return { ...extracted, ...sessionAnswers };
}
