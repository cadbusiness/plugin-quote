import { NextResponse } from "next/server";
import { authenticatePlugin, pluginPayload, unauthorized } from "@/lib/integrations/plugin";
import { parseSettings } from "@/lib/integrations/types";
import { parseStorefront } from "@/lib/integrations/storefront";
import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/lib/db/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const row = await authenticatePlugin(req);
  if (!row) return unauthorized();
  return NextResponse.json(await pluginPayload(row));
}

export async function PATCH(req: Request) {
  const row = await authenticatePlugin(req);
  if (!row) return unauthorized();

  const body = (await req.json().catch(() => null)) as { storefront?: unknown } | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const current = parseSettings(row.settings);
  const storefront = parseStorefront({ ...current.storefront, ...(body.storefront ?? {}) });
  const supabase = createServiceClient();
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
  return NextResponse.json(await pluginPayload(data));
}
