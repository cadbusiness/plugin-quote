import { categoryLabel } from "@/lib/catalog/group";

export type CatalogFilters = {
  q: string;
  source: string;
  statut: string;
  category: string;
  prix: string;
};

export function parseCatalogFilters(input: {
  q?: string;
  source?: string;
  statut?: string;
  category?: string;
  prix?: string;
}): CatalogFilters {
  return {
    q: (input.q ?? "").trim(),
    source: input.source ?? "",
    statut: input.statut ?? "",
    category: input.category ?? "",
    prix: input.prix ?? "",
  };
}

export type CatalogFilterRow = {
  name?: string | null;
  sku?: string | null;
  category?: string | null;
  source?: string | null;
  is_active?: boolean | null;
  price_min?: number | null;
  price_max?: number | null;
};

export function rowMatchesCatalog(row: CatalogFilterRow, filters: CatalogFilters) {
  if (filters.q) {
    const needle = filters.q.toLowerCase();
    const hay = [row.name, row.sku, row.category].filter(Boolean).join(" ").toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  if (filters.source === "manual") {
    if (row.source !== "manual" && row.source !== "csv") return false;
  } else if (filters.source && row.source !== filters.source) return false;
  if (filters.statut === "actifs" && !row.is_active) return false;
  if (filters.statut === "inactifs" && row.is_active) return false;
  if (filters.category) {
    if (categoryLabel(row.category) !== filters.category) return false;
  }
  if (filters.prix === "manquant" && (row.price_min != null || row.price_max != null)) return false;
  return true;
}
