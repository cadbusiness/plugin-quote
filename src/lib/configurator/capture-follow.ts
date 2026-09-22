import { recommendComplements, parseRelated } from "@/lib/catalog/affinity";
import { searchCatalog } from "@/lib/commerce-agent/catalog";
import type { Product } from "@/lib/wizard/types";

export type CaptureQuestion = {
  key: "load" | "height" | "profondeur" | "quantity";
  label: string;
};

export type CaptureComplement = {
  id: string;
  name: string;
  reason: string;
  imageUrl: string | null;
};

export type CaptureFollow = {
  anchorId: string | null;
  question: CaptureQuestion | null;
  complement: CaptureComplement | null;
};

const SPEC_GAPS: { spec: RegExp; key: CaptureQuestion["key"]; label: string; mentioned: RegExp }[] = [
  { spec: /charge|load/i, key: "load", label: "Quelle charge par niveau ?", mentioned: /charge|\d+\s*kg/i },
  {
    spec: /hauteur|height/i,
    key: "height",
    label: "Quelle hauteur disponible ?",
    mentioned: /hauteur|\d+([.,]\d+)?\s*(m|mm|cm)\b/i,
  },
  { spec: /profondeur|depth/i, key: "profondeur", label: "Quelle profondeur ?", mentioned: /profondeur/i },
];

function linkedIds(product: Product) {
  const related = parseRelated(product.related);
  return new Set([...related.upsellIds, ...related.crossSellIds]);
}

/** One missing fact, then one catalog complement linked by upsell or cross-sell. */
export function planCaptureFollow(need: string, products: Product[]): CaptureFollow {
  const text = need.trim();
  const found = searchCatalog(products, { query: text, limit: 1 }).products[0];
  const anchor = found ? products.find((product) => product.id === found.id) ?? null : null;

  let question: CaptureQuestion | null = null;
  if (anchor) {
    const specs = anchor.specs ?? [];
    const gap = SPEC_GAPS.find(
      (row) => specs.some((spec) => row.spec.test(`${spec.key} ${spec.label}`)) && !row.mentioned.test(text),
    );
    if (gap) question = { key: gap.key, label: gap.label };
  }
  if (!question && !/\d/.test(text)) {
    question = { key: "quantity", label: "Combien d'exemplaires ?" };
  }

  let complement: CaptureComplement | null = null;
  if (anchor) {
    const linked = linkedIds(anchor);
    const picks = recommendComplements([anchor.id], products, { limit: 8 });
    const pick = picks.find(
      (product) => linked.has(product.id) || (product.externalId ? linked.has(product.externalId) : false),
    );
    if (pick) {
      const full = products.find((product) => product.id === pick.id);
      complement = {
        id: pick.id,
        name: pick.name,
        reason: `Souvent demandé avec ${anchor.name}.`,
        imageUrl: full?.imageUrl ?? null,
      };
    }
  }

  return { anchorId: anchor?.id ?? null, question, complement };
}

export function captureAnswerPatch(question: CaptureQuestion, value: string): Record<string, string> {
  const trimmed = value.trim();
  if (question.key === "quantity") return { notes: `Quantité : ${trimmed}` };
  return { [question.key]: trimmed };
}
