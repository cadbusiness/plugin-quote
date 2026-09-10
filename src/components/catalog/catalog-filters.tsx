"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { displayProductName } from "@/lib/catalog/display";
import type { CatalogFilters } from "@/lib/catalog/filters";
import { catalogListHref } from "@/lib/catalog/pagination";

const SOURCES = [
  { value: "", label: "Tout le catalogue" },
  { value: "manual", label: "Ajoutés à la main" },
  { value: "woocommerce", label: "WooCommerce" },
  { value: "shopify", label: "Shopify" },
];

export function CatalogFilters({
  filters,
  categories,
}: {
  filters: CatalogFilters;
  categories: string[];
}) {
  const router = useRouter();

  return (
    <form
      className="mr-auto flex flex-wrap items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        router.push(
          catalogListHref({
            q: String(data.get("q") ?? ""),
            source: String(data.get("source") ?? ""),
            statut: String(data.get("statut") ?? ""),
            category: String(data.get("category") ?? ""),
            prix: String(data.get("prix") ?? ""),
            page: 1,
          }),
        );
      }}
    >
      {filters.prix ? <input type="hidden" name="prix" value={filters.prix} /> : null}
      <label className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Nom, SKU, catégorie…"
          className="w-56 rounded-full border border-slate-200 py-1.5 pl-8 pr-3 text-sm"
        />
      </label>
      <select
        name="source"
        defaultValue={filters.source}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-sm"
      >
        {SOURCES.map((filter) => (
          <option key={filter.value || "all"} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>
      <select
        name="statut"
        defaultValue={filters.statut}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-sm"
      >
        <option value="">Actifs et inactifs</option>
        <option value="actifs">Actifs</option>
        <option value="inactifs">Inactifs</option>
      </select>
      {categories.length ? (
        <select
          name="category"
          defaultValue={filters.category}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-sm"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {displayProductName(category)}
            </option>
          ))}
        </select>
      ) : null}
    </form>
  );
}
