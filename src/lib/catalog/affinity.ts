/** Upsell / cross-sell / même gamme. IDs Woo (external_id) ou UUID catalogue. */

export const AFFINITY_SCORES = {
  upsell: 3,
  crossSell: 2,
  related: 1,
} as const;

export const DEFAULT_COMPLEMENTS_LIMIT = 4;
export const MIN_COMPLEMENTS_LIMIT = 1;
export const MAX_COMPLEMENTS_LIMIT = 8;

export type ProductRelated = {
  upsellIds: string[];
  crossSellIds: string[];
};

export type AffinityProduct = {
  id: string;
  name: string;
  externalId?: string | null;
  category?: string | null;
  related?: ProductRelated | null;
};

export const EMPTY_RELATED: ProductRelated = { upsellIds: [], crossSellIds: [] };

function asIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    const id = String(item ?? "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function parseRelated(value: unknown): ProductRelated {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { upsellIds: [], crossSellIds: [] };
  }
  const raw = value as Record<string, unknown>;
  return {
    upsellIds: asIdList(raw.upsellIds ?? raw.upsell_ids),
    crossSellIds: asIdList(raw.crossSellIds ?? raw.cross_sell_ids),
  };
}

export function clampComplementsLimit(value: unknown, fallback = DEFAULT_COMPLEMENTS_LIMIT) {
  if (value == null || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_COMPLEMENTS_LIMIT, Math.max(MIN_COMPLEMENTS_LIMIT, Math.round(n)));
}

function resolve(catalog: Map<string, AffinityProduct>, id: string) {
  return catalog.get(id) ?? null;
}

export function recommendComplements(
  sourceIds: string[],
  catalog: AffinityProduct[],
  options?: { limit?: number },
): AffinityProduct[] {
  const limit = clampComplementsLimit(options?.limit);
  const index = new Map<string, AffinityProduct>();
  for (const product of catalog) {
    index.set(product.id, product);
    if (product.externalId) index.set(product.externalId, product);
  }

  const excluded = new Set<string>();
  const sources: AffinityProduct[] = [];
  for (const raw of sourceIds) {
    const id = String(raw ?? "").trim();
    if (!id) continue;
    excluded.add(id);
    const product = resolve(index, id);
    if (!product) continue;
    excluded.add(product.id);
    if (product.externalId) excluded.add(product.externalId);
    sources.push(product);
  }

  const scores = new Map<string, { product: AffinityProduct; score: number }>();

  const bump = (targetId: string, amount: number) => {
    const product = resolve(index, String(targetId).trim());
    if (!product) return;
    if (excluded.has(product.id) || (product.externalId && excluded.has(product.externalId))) {
      return;
    }
    const current = scores.get(product.id);
    if (current) {
      current.score += amount;
      return;
    }
    scores.set(product.id, { product, score: amount });
  };

  for (const source of sources) {
    const related = parseRelated(source.related);
    for (const id of related.upsellIds) bump(id, AFFINITY_SCORES.upsell);
    for (const id of related.crossSellIds) bump(id, AFFINITY_SCORES.crossSell);
    const category = source.category?.trim();
    if (!category) continue;
    for (const product of catalog) {
      if (product.category?.trim() !== category) continue;
      bump(product.externalId ?? product.id, AFFINITY_SCORES.related);
    }
  }

  return [...scores.values()]
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name, "fr"))
    .slice(0, limit)
    .map((row) => row.product);
}
