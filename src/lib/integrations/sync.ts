import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, TablesInsert } from "@/lib/db/database.types";
import { getAdapter, loadConnection, resolveConfiguratorId, resolveConnection } from "@/lib/integrations/connections";
import type { NormalizedProduct, ResolvedConnection } from "@/lib/integrations/types";
import { createServiceClient } from "@/lib/supabase/service";

const MAX_PAGES = 400;
const CHUNK = 100;

export type SyncResult = {
  created: number;
  updated: number;
  skipped: number;
  archived: number;
  failed: number;
  error: string | null;
};

type ProductRow = TablesInsert<"products">;

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/** Le produit passe-t-il les filtres de la connexion ? */
function keeps(product: NormalizedProduct, connection: ResolvedConnection) {
  const { settings } = connection;
  if (product.status === "archived") return false;
  if (product.status === "draft" && !settings.importDrafts) return false;
  if (settings.skipOutOfStock && product.stockStatus === "outofstock") return false;
  if (settings.categories.length) {
    const haystack = [product.category, ...product.tags].filter(Boolean).map((v) => v!.toLowerCase());
    if (!settings.categories.some((wanted) => haystack.includes(wanted.toLowerCase()))) return false;
  }
  return true;
}

export function buildProductRow(
  product: NormalizedProduct,
  connection: ResolvedConnection,
  configuratorId: string,
): ProductRow & { content_hash: string } {
  const markup = 1 + connection.settings.markupPercent / 100;
  const price = (value: number | null) => (value === null ? null : round2(value * markup));

  const row: ProductRow = {
    organization_id: connection.organizationId,
    configurator_id: configuratorId,
    connection_id: connection.id,
    source: connection.provider,
    external_id: product.externalId,
    external_url: product.url,
    external_updated_at: product.externalUpdatedAt,
    name: product.name,
    description: product.description,
    sku: product.sku,
    price_min: price(product.priceMin),
    price_max: price(product.priceMax),
    currency: product.currency || "EUR",
    image_url: product.images[0]?.src ?? null,
    images: product.images as unknown as Json,
    variants: product.variants as unknown as Json,
    options: product.options as unknown as Json,
    category: product.category,
    tags: product.tags,
    stock_status: product.stockStatus,
  };

  const content_hash = createHash("sha1").update(JSON.stringify(row)).digest("hex");
  return { ...row, content_hash };
}

async function writeChunks(
  supabase: SupabaseClient<Database>,
  rows: (ProductRow & { content_hash: string })[],
) {
  let failed = 0;
  for (const part of chunk(rows, CHUNK)) {
    const stamped = part.map((row) => ({
      ...row,
      synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from("products")
      .upsert(stamped, { onConflict: "connection_id,external_id" });
    if (error) {
      failed += part.length;
      console.error("[catalog-sync] upsert produits", error.message);
    }
  }
  return failed;
}

export async function runCatalogSync({
  connectionId,
  trigger = "manual",
}: {
  connectionId: string;
  trigger?: "manual" | "cron" | "webhook" | "pairing";
}): Promise<SyncResult> {
  const supabase = createServiceClient();
  const result: SyncResult = { created: 0, updated: 0, skipped: 0, archived: 0, failed: 0, error: null };

  const row = await loadConnection(supabase, connectionId);
  if (!row) return { ...result, error: "Connexion introuvable." };
  if (row.status === "disabled") return { ...result, error: "Connexion désactivée." };

  let connection: ResolvedConnection;
  try {
    connection = resolveConnection(row);
  } catch (error) {
    return { ...result, error: error instanceof Error ? error.message : "Accès illisibles." };
  }

  const configuratorId = await resolveConfiguratorId(supabase, connection);
  if (!configuratorId) {
    return { ...result, error: "Créez d'abord un funnel : le catalogue s'y rattache." };
  }

  const { data: run } = await supabase
    .from("catalog_sync_runs")
    .insert({
      organization_id: connection.organizationId,
      connection_id: connection.id,
      trigger,
      status: "running",
    })
    .select("id")
    .single();

  try {
    const { data: existing } = await supabase
      .from("products")
      .select("id, external_id, content_hash, is_active, archived_by_sync")
      .eq("connection_id", connection.id);
    const known = new Map(
      (existing ?? [])
        .filter((p): p is typeof p & { external_id: string } => Boolean(p.external_id))
        .map((p) => [p.external_id, p]),
    );

    const adapter = getAdapter(connection.provider);
    const seen = new Set<string>();
    const pending: (ProductRow & { content_hash: string })[] = [];
    const toReactivate: string[] = [];

    let cursor: string | null = null;
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const batch = await adapter.fetchPage(connection, cursor);
      for (const product of batch.products) {
        if (!keeps(product, connection)) continue;
        seen.add(product.externalId);
        const built = buildProductRow(product, connection, configuratorId);
        const previous = known.get(product.externalId);
        if (previous?.archived_by_sync) toReactivate.push(product.externalId);
        if (previous && previous.content_hash === built.content_hash) {
          result.skipped += 1;
          continue;
        }
        if (previous) result.updated += 1;
        else result.created += 1;
        pending.push(built);
      }
      cursor = batch.cursor;
      if (!cursor) break;
    }

    result.failed += await writeChunks(supabase, pending);

    // Produits revenus en boutique après avoir disparu.
    for (const part of chunk(toReactivate, CHUNK)) {
      await supabase
        .from("products")
        .update({ is_active: true, archived_by_sync: false })
        .eq("connection_id", connection.id)
        .in("external_id", part);
    }

    // Produits disparus de la boutique.
    if (connection.settings.archiveMissing) {
      const missing = [...known.keys()].filter((id) => !seen.has(id));
      for (const part of chunk(missing, CHUNK)) {
        const { count } = await supabase
          .from("products")
          .update({ is_active: false, archived_by_sync: true }, { count: "exact" })
          .eq("connection_id", connection.id)
          .eq("is_active", true)
          .in("external_id", part);
        result.archived += count ?? 0;
      }
    }

    const { count: productCount } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("connection_id", connection.id)
      .eq("is_active", true);

    await supabase
      .from("catalog_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        last_error: null,
        status: "active",
        product_count: productCount ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", connection.id);

    if (run) {
      await supabase
        .from("catalog_sync_runs")
        .update({
          status: "done",
          created_count: result.created,
          updated_count: result.updated,
          skipped_count: result.skipped,
          archived_count: result.archived,
          failed_count: result.failed,
          finished_at: new Date().toISOString(),
        })
        .eq("id", run.id);
    }

    if (result.created + result.updated > 0) {
      await supabase.from("product_imports").insert({
        organization_id: connection.organizationId,
        source: connection.provider,
        status: "done",
        row_count: result.created + result.updated,
      });
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec de la synchronisation.";
    result.error = message;
    await supabase
      .from("catalog_connections")
      .update({ status: "error", last_error: message, updated_at: new Date().toISOString() })
      .eq("id", connection.id);
    if (run) {
      await supabase
        .from("catalog_sync_runs")
        .update({ status: "error", error: message, finished_at: new Date().toISOString() })
        .eq("id", run.id);
    }
    return result;
  }
}

/** Mise à jour ciblée déclenchée par un webhook boutique. */
export async function syncExternalProduct({
  connectionId,
  externalId,
  deleted,
}: {
  connectionId: string;
  externalId: string;
  deleted: boolean;
}) {
  const supabase = createServiceClient();
  const row = await loadConnection(supabase, connectionId);
  if (!row || row.status === "disabled") return { ok: false as const, error: "Connexion inactive." };

  const connection = resolveConnection(row);

  if (deleted) {
    await supabase
      .from("products")
      .update({ is_active: false, archived_by_sync: true, updated_at: new Date().toISOString() })
      .eq("connection_id", connection.id)
      .eq("external_id", externalId);
    return { ok: true as const, action: "archived" as const };
  }

  const configuratorId = await resolveConfiguratorId(supabase, connection);
  if (!configuratorId) return { ok: false as const, error: "Aucun funnel cible." };

  const adapter = getAdapter(connection.provider);
  const product = await adapter.fetchOne(connection, externalId);

  if (!product || !keeps(product, connection)) {
    await supabase
      .from("products")
      .update({ is_active: false, archived_by_sync: true, updated_at: new Date().toISOString() })
      .eq("connection_id", connection.id)
      .eq("external_id", externalId);
    return { ok: true as const, action: "archived" as const };
  }

  const built = buildProductRow(product, connection, configuratorId);
  await writeChunks(supabase, [built]);
  await supabase
    .from("products")
    .update({ is_active: true, archived_by_sync: false })
    .eq("connection_id", connection.id)
    .eq("external_id", externalId)
    .eq("archived_by_sync", true);
  await supabase
    .from("catalog_connections")
    .update({ last_sync_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", connection.id);

  return { ok: true as const, action: "upserted" as const };
}
