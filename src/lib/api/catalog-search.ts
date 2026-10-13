/** Pure catalog search for the MCP / REST `search_catalog` tool (accent-insensitive, variant SKUs). */

export type CatalogProductRow = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  tags: string[] | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  stock_status: string | null;
  external_url: string | null;
  configurator_id: string;
  is_active: boolean;
  variants: unknown;
};

export type CatalogVariantView = {
  title: string;
  sku: string | null;
  price: number | null;
  available: boolean | null;
  stock_status: string | null;
  stock_quantity: number | null;
  options: Record<string, string>;
};

type Obj = Record<string, unknown>;

function obj(value: unknown): Obj | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Obj) : null;
}

function str(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function num(value: unknown) {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

export function normalizeSearch(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function parseVariants(value: unknown): CatalogVariantView[] {
  if (!Array.isArray(value)) return [];
  const out: CatalogVariantView[] = [];
  for (const raw of value) {
    const row = obj(raw);
    if (!row) continue;
    const selected = obj(row.selected) ?? {};
    const options: Record<string, string> = {};
    for (const [key, val] of Object.entries(selected)) {
      if (typeof val === "string") options[key] = val;
    }
    out.push({
      title: str(row.title) ?? (Object.values(options).join(" / ") || "Variation"),
      sku: str(row.sku),
      price: num(row.price),
      available: typeof row.available === "boolean" ? row.available : null,
      stock_status: str(row.stockStatus) ?? str(row.stock_status),
      stock_quantity: num(row.stockQuantity) ?? num(row.stock_quantity),
      options,
    });
  }
  return out;
}

export function isInStock(product: Pick<CatalogProductRow, "stock_status">, variants: CatalogVariantView[]) {
  if (variants.length) {
    return variants.some((v) => v.available !== false && v.stock_status !== "outofstock");
  }
  return product.stock_status !== "outofstock";
}

/**
 * Score of a product for a query; 0 = no match. Every token must appear somewhere
 * (name, SKU, category, tags, variant title or SKU). Exact SKU beats name prefix beats the rest.
 */
export function catalogMatchScore(product: CatalogProductRow, variants: CatalogVariantView[], query: string) {
  const q = normalizeSearch(query);
  if (!q) return 1;
  const tokens = q.split(" ").filter(Boolean);
  const name = normalizeSearch(product.name);
  const sku = normalizeSearch(product.sku);
  const category = normalizeSearch(product.category);
  const tags = normalizeSearch((product.tags ?? []).join(" "));
  const variantText = normalizeSearch(variants.map((v) => `${v.title} ${v.sku ?? ""}`).join(" "));
  const variantSkus = variants.map((v) => normalizeSearch(v.sku)).filter(Boolean);
  const haystack = `${name} ${sku} ${category} ${tags} ${variantText}`;
  if (!tokens.every((token) => haystack.includes(token))) return 0;

  let score = 10;
  if (sku && sku === q) score += 100;
  if (variantSkus.includes(q)) score += 90;
  if (name === q) score += 60;
  else if (name.startsWith(q)) score += 40;
  else if (name.includes(q)) score += 25;
  score += tokens.filter((token) => name.includes(token)).length * 5;
  if (category.includes(q)) score += 8;
  return score;
}

export function searchCatalogRows(
  rows: CatalogProductRow[],
  input: { query?: string; category?: string; in_stock_only?: boolean; limit?: number; max_variants?: number },
) {
  const limit = Math.min(Math.max(Math.floor(input.limit ?? 20), 1), 50);
  const maxVariants = Math.min(Math.max(Math.floor(input.max_variants ?? 25), 0), 100);
  const category = normalizeSearch(input.category);
  const hits = rows
    .map((row) => {
      const variants = parseVariants(row.variants);
      return { row, variants, score: catalogMatchScore(row, variants, input.query ?? "") };
    })
    .filter((hit) => hit.score > 0)
    .filter((hit) => !category || normalizeSearch(hit.row.category).includes(category))
    .filter((hit) => !input.in_stock_only || isInStock(hit.row, hit.variants))
    .sort((a, b) => b.score - a.score || a.row.name.localeCompare(b.row.name, "fr"));

  return {
    total_matches: hits.length,
    products: hits.slice(0, limit).map(({ row, variants }) => {
      const prices = variants.map((v) => v.price).filter((p): p is number => p != null);
      return {
        id: row.id,
        name: row.name,
        sku: row.sku,
        category: row.category,
        tags: row.tags ?? [],
        price_min: row.price_min ?? (prices.length ? Math.min(...prices) : null),
        price_max: row.price_max ?? (prices.length ? Math.max(...prices) : null),
        currency: row.currency || "EUR",
        stock_status: row.stock_status,
        in_stock: isInStock(row, variants),
        is_active: row.is_active,
        url: row.external_url,
        funnel_id: row.configurator_id,
        variant_count: variants.length,
        variants: variants.slice(0, maxVariants),
        variants_truncated: variants.length > maxVariants,
      };
    }),
  };
}
