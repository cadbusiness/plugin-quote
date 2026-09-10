export const CATALOG_PAGE_SIZE = 25;

export function catalogListHref(filters: {
  q?: string;
  source?: string;
  statut?: string;
  category?: string;
  prix?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.source) params.set("source", filters.source);
  if (filters.statut) params.set("statut", filters.statut);
  if (filters.category) params.set("category", filters.category);
  if (filters.prix) params.set("prix", filters.prix);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const qs = params.toString();
  return qs ? `/produits?${qs}` : "/produits";
}

export function clampPage(value: string | undefined, total: number, pageSize = CATALOG_PAGE_SIZE) {
  const requested = Math.max(1, Number.parseInt(value ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(Math.max(0, total) / pageSize) || 1);
  return Math.min(requested, totalPages);
}

export function paginationItems(current: number, totalPages: number): Array<number | "gap"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const items: Array<number | "gap"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) items.push("gap");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push("gap");
  if (totalPages > 1) items.push(totalPages);
  return items;
}

export function pageWindow(page: number, pageSize: number, total: number) {
  if (total <= 0) return { from: 0, to: 0, totalPages: 1, current: 1 };
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const from = (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);
  return { from, to, totalPages, current };
}
