export const UNCATEGORIZED = "Autres";

export type ProductCategoryGroup<T extends { category?: string | null }> = {
  key: string;
  label: string;
  products: T[];
};

export function categoryLabel(category: string | null | undefined) {
  const trimmed = category?.trim();
  return trimmed ? trimmed : UNCATEGORIZED;
}

export type CategoryStat = {
  key: string;
  label: string;
  count: number;
  sources: string[];
  allActive: boolean;
  priceMin: number | null;
  priceMax: number | null;
  productIds: string[];
};

const SOURCE_LABEL: Record<string, string> = {
  manual: "manuel",
  csv: "CSV",
  woocommerce: "WooCommerce",
  shopify: "Shopify",
};

export function sourceSummary(sources: string[]) {
  const labels = [...new Set(sources.map((source) => SOURCE_LABEL[source] ?? SOURCE_LABEL.manual))];
  if (labels.length === 1) return `Tous ${labels[0]}`;
  if (!labels.length) return null;
  return labels.join(" · ");
}

export function collectCategoryStats<
  T extends {
    id?: string;
    category?: string | null;
    source?: string | null;
    is_active?: boolean | null;
    price_min?: number | null;
    price_max?: number | null;
  },
>(products: T[]): CategoryStat[] {
  const map = new Map<string, CategoryStat>();
  for (const product of products) {
    const key = categoryLabel(product.category);
    const current = map.get(key) ?? {
      key,
      label: key,
      count: 0,
      sources: [],
      allActive: true,
      priceMin: null,
      priceMax: null,
      productIds: [],
    };
    current.count += 1;
    if (product.source && !current.sources.includes(product.source)) current.sources.push(product.source);
    if (!product.is_active) current.allActive = false;
    if (product.price_min != null) {
      current.priceMin = current.priceMin == null ? product.price_min : Math.min(current.priceMin, product.price_min);
    }
    const high = product.price_max ?? product.price_min;
    if (high != null) {
      current.priceMax = current.priceMax == null ? high : Math.max(current.priceMax, high);
    }
    if (product.id) current.productIds.push(product.id);
    map.set(key, current);
  }
  return [...map.values()].sort((a, b) => {
    if (a.key === UNCATEGORIZED) return 1;
    if (b.key === UNCATEGORIZED) return -1;
    return a.label.localeCompare(b.label, "fr");
  });
}

export function groupProductsByCategory<T extends { category?: string | null }>(
  products: T[],
): ProductCategoryGroup<T>[] {
  const map = new Map<string, T[]>();
  for (const product of products) {
    const key = categoryLabel(product.category);
    const list = map.get(key) ?? [];
    list.push(product);
    map.set(key, list);
  }
  return [...map.entries()]
    .sort((a, b) => {
      if (a[0] === UNCATEGORIZED) return 1;
      if (b[0] === UNCATEGORIZED) return -1;
      return a[0].localeCompare(b[0], "fr");
    })
    .map(([key, items]) => ({ key, label: key, products: items }));
}
