import Link from "next/link";
import { Fragment } from "react";
import { MoreHorizontal } from "lucide-react";
import { redirect } from "next/navigation";
import { CatalogCompleteness } from "@/components/catalog/catalog-completeness";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogTabs } from "@/components/catalog/catalog-tabs";
import { CreateProductDialog } from "@/components/catalog/create-product-dialog";
import { ImportProductsDialog } from "@/components/catalog/import-products-dialog";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import {
  DataTable,
  ListPagination,
  ListPanel,
  ListPanelFooter,
  ListToolbar,
} from "@/components/ui/list-panel";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { catalogChromeSummary, displayProductName, formatCatalogPrice } from "@/lib/catalog/display";
import { parseCatalogFilters, rowMatchesCatalog } from "@/lib/catalog/filters";
import { categoryLabel, collectCategoryStats, groupProductsByCategory, sourceSummary } from "@/lib/catalog/group";
import { CATALOG_PAGE_SIZE, catalogListHref, pageWindow } from "@/lib/catalog/pagination";
import { createClient } from "@/lib/supabase/server";

const SOURCES: Record<string, { label: string; tone: ChipTone }> = {
  manual: { label: "Manuel", tone: "slate" },
  csv: { label: "CSV", tone: "slate" },
  woocommerce: { label: "WooCommerce", tone: "violet" },
  shopify: { label: "Shopify", tone: "emerald" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string; statut?: string; category?: string; prix?: string; page?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const query = await searchParams;
  const filters = parseCatalogFilters(query);
  const supabase = await createClient();

  const [{ data: allRows }, { data: funnels }, { data: connections }, { count: ruleCount }, { data: rules }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, name, sku, category, source, price_min, price_max, is_active, archived_by_sync")
        .eq("organization_id", ctx.organization.id),
      supabase
        .from("configurators")
        .select("id, name")
        .eq("organization_id", ctx.organization.id)
        .order("created_at", { ascending: true }),
      supabase.from("catalog_connections").select("id, label, provider").eq("organization_id", ctx.organization.id),
      supabase
        .from("suggestion_rules")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", ctx.organization.id),
      supabase.from("suggestion_rules").select("product_ids").eq("organization_id", ctx.organization.id),
    ]);

  const catalog = allRows ?? [];
  const missingPrice = catalog.filter((row) => row.price_min == null && row.price_max == null).length;
  const missingSku = catalog.filter((row) => !row.sku?.trim()).length;
  const archived = catalog.filter((row) => row.archived_by_sync).length;
  const syncedCount = catalog.filter((row) => row.source === "woocommerce" || row.source === "shopify").length;
  const globalMin = catalog.reduce<number | null>((min, row) => {
    if (row.price_min == null) return min;
    return min == null ? row.price_min : Math.min(min, row.price_min);
  }, null);
  const globalMax = catalog.reduce<number | null>((max, row) => {
    const high = row.price_max ?? row.price_min;
    if (high == null) return max;
    return max == null ? high : Math.max(max, high);
  }, null);
  const categories = collectCategoryStats(catalog).map((row) => row.label);
  const groupedStats = collectCategoryStats(catalog.filter((row) => rowMatchesCatalog(row, filters)));
  const ruledIds = new Set((rules ?? []).flatMap((rule) => rule.product_ids ?? []));
  const filtered = catalog
    .filter((row) => rowMatchesCatalog(row, filters))
    .sort((a, b) => {
      const byCat = categoryLabel(a.category).localeCompare(categoryLabel(b.category), "fr");
      if (byCat) return byCat;
      return a.name.localeCompare(b.name, "fr");
    });

  const total = filtered.length;
  const window = pageWindow(Number.parseInt(query.page ?? "1", 10) || 1, CATALOG_PAGE_SIZE, total);
  const from = Math.max(0, window.from - 1);
  const pageIds = filtered.slice(from, window.to).map((row) => row.id);
  const { data: products } = pageIds.length
    ? await supabase
        .from("products")
        .select("id, name, sku, category, source, price_min, price_max, currency, is_active, archived_by_sync, image_url")
        .in("id", pageIds)
    : { data: [] };
  const byId = new Map((products ?? []).map((row) => [row.id, row]));
  const rows = pageIds.map((id) => byId.get(id)).filter((row): row is NonNullable<typeof row> => Boolean(row));
  const groups = groupProductsByCategory(rows);
  const statsByKey = new Map(groupedStats.map((row) => [row.key, row]));
  const hrefForPage = (page: number) => catalogListHref({ ...filters, page });
  const shopLabel = connections?.length === 1 ? connections[0].label : null;
  const totalCount = catalog.length;

  return (
    <ListPanel>
      <CatalogTabs
        active="produits"
        counts={{ regles: ruleCount ?? 0 }}
        summary={catalogChromeSummary(totalCount, syncedCount, shopLabel)}
      />
      <ListToolbar>
        <CatalogFilters filters={filters} categories={categories} />
        <ImportProductsDialog funnels={funnels ?? []} />
        <CreateProductDialog funnels={funnels ?? []} />
      </ListToolbar>

      <CatalogCompleteness
        missingPrice={missingPrice}
        missingSku={missingSku}
        archived={archived}
        filters={filters}
      />

      {rows.length ? (
        <DataTable
          headers={["Produit", "Origine", "Prix", "Statut"]}
          headClassName="bg-[#FBF6F1] text-slate-400"
          tableClassName="table-fixed"
          columnClassNames={["", "w-36 text-right", "w-24 text-right", "w-28 text-right"]}
        >
          {groups.map((group) => {
            const stats = statsByKey.get(group.key);
            const originHint = sourceSummary(stats?.sources ?? []);
            const uniformOrigin = (stats?.sources.length ?? 0) <= 1;
            const range = formatCatalogPrice(stats?.priceMin, stats?.priceMax);
            const ruled = stats?.productIds.some((id) => ruledIds.has(id));
            return (
              <Fragment key={group.key}>
                <tr className="border-b border-orange-100 bg-[#FBF7F2]">
                  <td colSpan={2} className="px-4 py-2.5 lg:px-6">
                    <span className="font-semibold text-slate-900">{displayProductName(group.label)}</span>
                    <span className="ml-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {stats?.count ?? group.products.length} produit{(stats?.count ?? group.products.length) > 1 ? "s" : ""}
                      {originHint ? ` · ${originHint}` : ""}
                      {stats?.allActive ? " · Tous actifs" : ""}
                    </span>
                  </td>
                  <td className="w-24 px-3 py-2.5 text-right text-sm tabular-nums text-slate-500">
                    {range ?? ""}
                  </td>
                  <td className="w-28 px-4 py-2.5 text-right lg:px-6">
                    {ruled ? (
                      <Link href="/produits/regles" className="text-sm font-medium text-[#E85D04] hover:underline">
                        Règle de gamme
                      </Link>
                    ) : null}
                  </td>
                </tr>
                {group.products.map((product) => {
                  const origin = SOURCES[product.source ?? "manual"] ?? SOURCES.manual;
                  const price = formatCatalogPrice(product.price_min, product.price_max, product.currency);
                  const missing = price == null;
                  return (
                    <ClickableRow
                      key={product.id}
                      href={`/produits/${product.id}`}
                      className={missing ? "bg-orange-50/80" : ""}
                    >
                      <td className="px-4 py-3 lg:px-6">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image_url}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-md object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 rounded-md bg-[#F3EBE3]" />
                          )}
                          <span className="truncate font-medium text-slate-900">{displayProductName(product.name)}</span>
                        </div>
                      </td>
                      <td className="w-36 px-4 py-3 text-right text-slate-400 lg:px-6">
                        {uniformOrigin ? "—" : <Chip tone={origin.tone}>{origin.label}</Chip>}
                      </td>
                      <td className="w-24 px-3 py-3 text-right tabular-nums">
                        {missing ? (
                          <span className="font-medium text-[#C2410C]">À chiffrer</span>
                        ) : (
                          <span className="font-medium text-slate-900">{price}</span>
                        )}
                      </td>
                      <td className="w-28 px-4 py-3 text-right lg:px-6">
                        {product.archived_by_sync ? (
                          <Chip tone="amber">Retiré</Chip>
                        ) : product.is_active ? (
                          <MoreHorizontal className="ml-auto h-4 w-4 text-slate-400" aria-hidden />
                        ) : (
                          <Chip tone="slate">Inactif</Chip>
                        )}
                      </td>
                    </ClickableRow>
                  );
                })}
              </Fragment>
            );
          })}
        </DataTable>
      ) : (
        <div className="px-4 py-16 text-center lg:px-6">
          <p className="text-sm font-medium text-slate-900">
            {totalCount ? "Aucun produit avec ces filtres" : "Votre catalogue est vide"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {totalCount
              ? "Changez la recherche, l’origine ou la catégorie pour retrouver vos produits."
              : "Ajoutez vos produits à la main, importez un CSV, ou branchez WooCommerce / Shopify pour récupérer descriptions, photos et prix automatiquement."}
          </p>
          {!totalCount ? (
            <p className="mt-4 flex items-center justify-center gap-4">
              <a href="#nouveau" className="text-sm font-medium text-[#C2410C] underline">
                Ajouter un produit
              </a>
              <Link href="/integrations" className="text-sm text-slate-600 underline">
                Connecter une boutique
              </Link>
            </p>
          ) : null}
        </div>
      )}

      <ListPanelFooter>
        <span>
          {total
            ? `${window.from}–${window.to} sur ${total} produit${total > 1 ? "s" : ""}`
            : `0 produit · ${totalCount} au catalogue`}
          {globalMin != null ? ` · fourchette globale ${formatCatalogPrice(globalMin, globalMax)}` : ""}
        </span>
        <ListPagination page={window.current} totalPages={window.totalPages} hrefForPage={hrefForPage} />
      </ListPanelFooter>
    </ListPanel>
  );
}
