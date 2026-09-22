import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/db/database.types";
import { resolveConnection } from "@/lib/integrations/connections";
import { domainsMatch } from "@/lib/integrations/pairing-plan";
import { normalizeSiteUrl, wooAdapter } from "@/lib/integrations/woocommerce";

export type WooConnectionRow = Tables<"catalog_connections">;

/**
 * Pointe la connexion Woo vers une autre URL si les clés REST déjà stockées
 * répondent. Ne change rien quand le test échoue : le catalogue actuel reste en place.
 */
export async function retargetWooConnection(
  supabase: SupabaseClient<Database>,
  row: WooConnectionRow,
  siteUrl: string,
): Promise<{ row: WooConnectionRow; error: string | null; changed: boolean }> {
  if (row.provider !== "woocommerce") {
    return { row, error: "Seule une connexion WooCommerce peut changer d'URL.", changed: false };
  }

  let next: string;
  try {
    next = normalizeSiteUrl(siteUrl);
  } catch (error) {
    return {
      row,
      error: error instanceof Error ? error.message : "URL invalide",
      changed: false,
    };
  }

  if (domainsMatch(row.store_domain, next)) {
    return { row, error: null, changed: false };
  }

  const connection = resolveConnection(row);
  const test = await wooAdapter.test({ ...connection, storeDomain: next });
  if (!test.ok) {
    const message = `Impossible d'utiliser ${next} : ${test.error} Les clés restent sur ${row.store_domain}. Dans WordPress, ouvrez QuoteBuilder et reconnectez la boutique pour créer des clés sur ce site.`;
    await supabase
      .from("catalog_connections")
      .update({ last_error: message, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    return { row, error: message, changed: false };
  }

  const { data, error } = await supabase
    .from("catalog_connections")
    .update({
      store_domain: next,
      currency: test.currency || row.currency,
      last_error: null,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .select("*")
    .single();

  if (error || !data) {
    return { row, error: "Impossible d'enregistrer l'URL de la boutique.", changed: false };
  }
  return { row: data, error: null, changed: true };
}
