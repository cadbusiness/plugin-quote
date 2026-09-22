import { NextResponse } from "next/server";
import { authenticatePlugin, pluginPayload, unauthorized } from "@/lib/integrations/plugin";
import { parseSettings } from "@/lib/integrations/types";
import { parseStorefront } from "@/lib/integrations/storefront";
import { retargetWooConnection } from "@/lib/integrations/retarget-woo";
import { runCatalogSync } from "@/lib/integrations/sync";
import { createServiceClient } from "@/lib/supabase/service";
import type { Json, Tables } from "@/lib/db/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  const row = await authenticatePlugin(req);
  if (!row) return unauthorized();
  const siteUrl = new URL(req.url).searchParams.get("site_url");
  const current = await alignStore(row, siteUrl);
  if (current.error) {
    return NextResponse.json({ error: current.error }, { status: 409 });
  }
  return NextResponse.json(await pluginPayload(current.row));
}

export async function PATCH(req: Request) {
  const row = await authenticatePlugin(req);
  if (!row) return unauthorized();

  const body = (await req.json().catch(() => null)) as
    | { storefront?: unknown; sync?: boolean; site_url?: unknown }
    | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const supabase = createServiceClient();
  let currentRow = row;

  if (body.storefront) {
    const current = parseSettings(row.settings);
    const storefront = parseStorefront({ ...current.storefront, ...body.storefront });
    const { data, error } = await supabase
      .from("catalog_connections")
      .update({
        settings: { ...current, storefront } as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .select("*")
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 });
    }
    currentRow = data;
  }

  let imported: number | undefined;
  let syncError: string | null = null;
  if (typeof body.site_url === "string" && body.site_url.trim()) {
    const aligned = await alignStore(currentRow, body.site_url);
    if (aligned.error) {
      return NextResponse.json({ error: aligned.error }, { status: 409 });
    }
    currentRow = aligned.row;
  }
  if (body.sync) {
    const result = await runCatalogSync({ connectionId: currentRow.id, trigger: "pairing" });
    imported = result.created + result.updated;
    syncError = result.error;
    const refreshed = await authenticatePlugin(req);
    if (refreshed) currentRow = refreshed;
  }

  const payload = await pluginPayload(currentRow);
  return NextResponse.json({ ...payload, imported, error: syncError });
}

async function alignStore(row: Tables<"catalog_connections">, siteUrl: string | null) {
  if (!siteUrl?.trim() || row.provider !== "woocommerce") {
    return { row, error: null as string | null };
  }
  const aligned = await retargetWooConnection(createServiceClient(), row, siteUrl);
  return { row: aligned.row, error: aligned.error };
}
