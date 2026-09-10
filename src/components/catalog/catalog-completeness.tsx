import Link from "next/link";
import { catalogListHref } from "@/lib/catalog/pagination";
import type { CatalogFilters } from "@/lib/catalog/filters";

export function CatalogCompleteness({
  missingPrice,
  missingSku,
  archived,
  filters,
}: {
  missingPrice: number;
  missingSku: number;
  archived: number;
  filters: CatalogFilters;
}) {
  if (!missingPrice && !missingSku && !archived) return null;
  const viewingGaps = filters.prix === "manquant";
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-orange-100 bg-[#FBF7F2] px-4 py-3 lg:px-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#C2410C]">À compléter</p>
      {missingPrice ? (
        <p className="text-sm text-slate-800">
          <span className="text-lg font-semibold tabular-nums tracking-tight">{missingPrice}</span>
          {" "}
          produit{missingPrice > 1 ? "s" : ""} sans prix, non chiffrable{missingPrice > 1 ? "s" : ""}
        </p>
      ) : null}
      {missingSku ? (
        <p className="text-sm text-slate-800">
          <span className="text-lg font-semibold tabular-nums tracking-tight">{missingSku}</span>
          {" "}
          sans SKU, la sync les identifie par nom
        </p>
      ) : null}
      {archived ? (
        <p className="text-sm text-slate-800">
          <span className="text-lg font-semibold tabular-nums tracking-tight">{archived}</span>
          {" "}
          retiré{archived > 1 ? "s" : ""} de la boutique
        </p>
      ) : null}
      {missingPrice ? (
        <Link
          href={viewingGaps ? catalogListHref({ ...filters, prix: undefined, page: 1 }) : catalogListHref({ ...filters, prix: "manquant", page: 1 })}
          className="ml-auto rounded-full border border-orange-200 bg-white px-3 py-1 text-sm font-medium text-[#C2410C] hover:bg-orange-50"
        >
          {viewingGaps ? "Voir tout le catalogue" : `Voir les ${missingPrice} à chiffrer`}
        </Link>
      ) : null}
    </div>
  );
}
