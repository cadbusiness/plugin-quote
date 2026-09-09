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
