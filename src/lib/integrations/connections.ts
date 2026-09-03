import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/db/database.types";
import { decryptCredentials } from "@/lib/integrations/secrets";
import { shopifyAdapter } from "@/lib/integrations/shopify";
import {
  parseSettings,
  type CatalogAdapter,
  type CatalogProvider,
  type ResolvedConnection,
} from "@/lib/integrations/types";
import { wooAdapter } from "@/lib/integrations/woocommerce";

const ADAPTERS: Record<CatalogProvider, CatalogAdapter> = {
  woocommerce: wooAdapter,
  shopify: shopifyAdapter,
};

export function getAdapter(provider: string): CatalogAdapter {
  const adapter = ADAPTERS[provider as CatalogProvider];
  if (!adapter) throw new Error(`Connecteur inconnu : ${provider}`);
  return adapter;
}

export function resolveConnection(row: Tables<"catalog_connections">): ResolvedConnection {
  return {
    id: row.id,
    organizationId: row.organization_id,
    configuratorId: row.configurator_id,
    provider: row.provider as CatalogProvider,
    label: row.label,
    storeDomain: row.store_domain,
    credentials: decryptCredentials(row.credentials),
    settings: parseSettings(row.settings),
    webhookSecret: row.webhook_secret,
    currency: row.currency,
  };
}

export async function loadConnection(
  supabase: SupabaseClient<Database>,
  connectionId: string,
  organizationId?: string,
) {
  let query = supabase.from("catalog_connections").select("*").eq("id", connectionId);
  if (organizationId) query = query.eq("organization_id", organizationId);
  const { data } = await query.maybeSingle();
  return data ?? null;
}

/** Le catalogue est rattaché à un funnel : on prend celui de la connexion, sinon le premier. */
export async function resolveConfiguratorId(
  supabase: SupabaseClient<Database>,
  connection: ResolvedConnection,
) {
  if (connection.configuratorId) return connection.configuratorId;
  const { data } = await supabase
    .from("configurators")
    .select("id")
    .eq("organization_id", connection.organizationId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}
