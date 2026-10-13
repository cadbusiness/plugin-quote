import { createServiceClient } from "@/lib/supabase/service";
import { searchCatalogRows, type CatalogProductRow } from "@/lib/api/catalog-search";

const PAGE = 1000;
const MAX_PRODUCTS = 5000;

export type SearchCatalogInput = {
  query?: string;
  category?: string;
  funnel_id?: string;
  in_stock_only?: boolean;
  include_inactive?: boolean;
  limit?: number;
  max_variants?: number;
};

/** Synced catalog (WooCommerce / Shopify / manual) of one organization, searched in memory. */
export async function apiSearchCatalog(organizationId: string, input: SearchCatalogInput) {
  const supabase = createServiceClient();
  const rows: CatalogProductRow[] = [];
  for (let from = 0; from < MAX_PRODUCTS; from += PAGE) {
    let query = supabase
      .from("products")
      .select("id, name, sku, category, tags, price_min, price_max, currency, stock_status, external_url, configurator_id, is_active, variants")
      .eq("organization_id", organizationId);
    if (!input.include_inactive) query = query.eq("is_active", true);
    if (input.funnel_id) query = query.eq("configurator_id", input.funnel_id);
    const { data, error } = await query.order("name", { ascending: true }).range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as CatalogProductRow[]));
    if (!data || data.length < PAGE) break;
  }

  const result = searchCatalogRows(rows, input);
  return {
    query: input.query ?? null,
    catalog_size: rows.length,
    ...result,
    notes: [
      "Prix HT du catalogue synchronisé (fourchette min–max si variations) ; stock = dernier état synchronisé.",
      ...(rows.length >= MAX_PRODUCTS ? [`Recherche limitée aux ${MAX_PRODUCTS} premiers produits.`] : []),
    ],
  };
}
