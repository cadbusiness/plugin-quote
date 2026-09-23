import { sanitizeForModel } from "@/lib/commerce-agent/fencing";
import type { Product } from "@/lib/wizard/types";

/** Merchant-validated Q&A. No store exists yet; callers pass rows when one does. */
export type ValidatedAnswer = {
  id: string;
  question: string;
  answer: string;
  productName?: string | null;
};

export type ChatSourceKind = "catalog" | "spec" | "sheet" | "qa";

export type ChatSource = {
  id: string;
  productName: string;
  kind: ChatSourceKind;
  label: string;
  text: string;
  specKey?: string;
  priceMin: number | null;
  priceMax: number | null;
};

const STOP = new Set([
  "les",
  "des",
  "une",
  "pour",
  "avec",
  "dans",
  "sur",
  "que",
  "qui",
  "quoi",
  "quel",
  "quelle",
  "quels",
  "quelles",
  "comment",
  "est",
  "pas",
  "plus",
  "mon",
  "votre",
  "vos",
  "aux",
  "son",
  "ses",
]);

export function foldText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function contentTokens(value: string) {
  return foldText(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOP.has(token));
}

function clean(value: string, max = 500) {
  return sanitizeForModel(value).replace(/\s+/g, " ").trim().slice(0, max);
}

/** Passages the model and the reply may cite. Prices stay on every passage of the product. */
export function sourcesFromCatalog(products: Product[], answers: ValidatedAnswer[] = []): ChatSource[] {
  const sources: ChatSource[] = [];
  for (const product of products) {
    const priceMin = product.priceMin;
    const priceMax = product.priceMax;
    const description = product.description?.trim() ?? "";
    sources.push({
      id: product.id,
      productName: product.name,
      kind: "catalog",
      label: description ? "Description" : "Catalogue",
      text: clean(description || product.name),
      priceMin,
      priceMax,
    });
    for (const spec of product.specs ?? []) {
      const text = clean([spec.label, spec.value, spec.unit].filter(Boolean).join(" "));
      if (!text) continue;
      sources.push({
        id: product.id,
        productName: product.name,
        kind: "spec",
        label: spec.label,
        specKey: spec.key,
        text,
        priceMin,
        priceMax,
      });
    }
    const manual = product.sheet?.manualText?.trim() ?? "";
    if (manual) {
      sources.push({
        id: product.id,
        productName: product.name,
        kind: "sheet",
        label: "Mode d'emploi",
        text: clean(manual, 800),
        priceMin,
        priceMax,
      });
    }
    for (const doc of product.sheet?.documents ?? []) {
      const label = doc.label?.trim() || "Document";
      sources.push({
        id: product.id,
        productName: product.name,
        kind: "sheet",
        label,
        text: clean(label),
        priceMin,
        priceMax,
      });
    }
  }
  for (const row of answers) {
    const answer = row.answer?.trim() ?? "";
    const question = row.question?.trim() ?? "";
    if (!answer || !question) continue;
    sources.push({
      id: row.id,
      productName: row.productName?.trim() || "Catalogue",
      kind: "qa",
      label: question,
      text: clean(`${question} ${answer}`, 800),
      priceMin: null,
      priceMax: null,
    });
  }
  return sources;
}

function scoreSource(source: ChatSource, tokens: string[]) {
  if (!tokens.length) return 0;
  const hay = foldText(`${source.productName} ${source.label} ${source.text} ${source.specKey ?? ""}`);
  let score = 0;
  for (const token of tokens) {
    if (!hay.includes(token)) continue;
    score += token.length > 3 ? 3 : 1;
    if (foldText(source.productName).includes(token)) score += 2;
  }
  return score;
}

/** Rank passages in code. The model only phrases what this returns. */
export function retrieveSources(sources: ChatSource[], query: string, limit = 4): ChatSource[] {
  const tokens = contentTokens(query);
  return sources
    .map((source) => ({ source, score: scoreSource(source, tokens) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.source.productName.localeCompare(b.source.productName))
    .slice(0, limit)
    .map((row) => row.source);
}
