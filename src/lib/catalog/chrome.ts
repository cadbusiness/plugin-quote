import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { catalogChromeSummary } from "@/lib/catalog/display";

export async function loadCatalogChrome(supabase: SupabaseClient<Database>, orgId: string) {
  const [{ count: total }, { count: synced }, { count: rules }, { data: connections }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .in("source", ["woocommerce", "shopify"]),
    supabase.from("suggestion_rules").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("catalog_connections").select("label").eq("organization_id", orgId),
  ]);
  const shopLabel = connections?.length === 1 ? connections[0].label : null;
  return {
    rules: rules ?? 0,
    summary: catalogChromeSummary(total ?? 0, synced ?? 0, shopLabel),
  };
}
