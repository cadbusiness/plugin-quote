import type { Product } from "@/lib/wizard/types";
import { COMMERCE_AGENT_CONFIG } from "./config";
import { compactProduct, type CompactProduct } from "./types";
import { clampSearchLimit } from "./gates";

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function scoreProduct(product: Product, tokens: string[]): number {
  if (tokens.length === 0) return 1;
  const hay = normalize(
    [product.name, product.description ?? "", product.category ?? "", ...(product.tags ?? [])].join(
      " ",
    ),
  );
  let score = 0;
  for (const token of tokens) {
    if (!token) continue;
    if (hay.includes(token)) score += token.length > 3 ? 3 : 1;
  }
  return score;
}

/** Ranked catalog search — logic stays in code; the model only picks among results. */
export function searchCatalog(
  products: Product[],
  input: {
    query?: string;
    category?: string;
    tags?: string[];
    limit?: number;
  },
): { products: CompactProduct[]; total: number } {
  const limit = clampSearchLimit(input.limit ?? COMMERCE_AGENT_CONFIG.maxSearchResults);
  const tokens = normalize(input.query ?? "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const category = input.category ? normalize(input.category) : null;
  const tags = (input.tags ?? []).map(normalize).filter(Boolean);

  const ranked = products
    .map((product) => {
      if (category && normalize(product.category ?? "") !== category) {
        return { product, score: 0 };
      }
      if (tags.length > 0) {
        const productTags = (product.tags ?? []).map(normalize);
        if (!tags.every((t) => productTags.some((pt) => pt.includes(t) || t.includes(pt)))) {
          return { product, score: 0 };
        }
      }
      return { product, score: scoreProduct(product, tokens) };
    })
    .filter((row) => row.score > 0 || (tokens.length === 0 && !category && tags.length === 0))
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));

  const slice =
    tokens.length === 0 && !category && tags.length === 0
      ? ranked.slice(0, limit)
      : ranked.filter((r) => r.score > 0).slice(0, limit);

  return {
    products: slice.map((r) => compactProduct(r.product)),
    total: slice.length,
  };
}
