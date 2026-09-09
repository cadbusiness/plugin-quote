import { NextResponse } from "next/server";
import { authenticatePlugin, pluginPayload, unauthorized } from "@/lib/integrations/plugin";
import { parseSettings } from "@/lib/integrations/types";
import { parseStorefront } from "@/lib/integrations/storefront";
import { runCatalogSync } from "@/lib/integrations/sync";
import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/lib/db/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  const row = await authenticatePlugin(req);
  if (!row) return unauthorized();
  return NextResponse.json(await pluginPayload(row));
}

export async function PATCH(req: Request) {
  const row = await authenticatePlugin(req);
  if (!row) return unauthorized();

  const body = (await req.json().catch(() => null)) as
    | { storefront?: unknown; sync?: boolean }
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
