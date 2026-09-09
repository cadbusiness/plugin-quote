import { NextResponse } from "next/server";
import { loadConnection } from "@/lib/integrations/connections";
import { parseSettings } from "@/lib/integrations/types";
import { safeEqual } from "@/lib/integrations/secrets";
import { createServiceClient } from "@/lib/supabase/service";
import type { Tables } from "@/lib/db/database.types";

export type PluginConnection = Tables<"catalog_connections">;

export async function authenticatePlugin(req: Request): Promise<PluginConnection | null> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  const connectionId =
    req.headers.get("x-quotebuilder-connection")?.trim() ||
    new URL(req.url).searchParams.get("connection")?.trim() ||
    "";
  if (!token || !connectionId) return null;

  const supabase = createServiceClient();
  const row = await loadConnection(supabase, connectionId);
  if (!row?.webhook_secret || row.status === "disabled") return null;
  if (!safeEqual(token, row.webhook_secret)) return null;
  return row;
}

export function unauthorized() {
  return NextResponse.json({ error: "Plugin non authentifié" }, { status: 401 });
}

export async function pluginPayload(row: PluginConnection) {
  const supabase = createServiceClient();
  const [{ data: org }, { data: funnel }] = await Promise.all([
    supabase.from("organizations").select("id, name, slug").eq("id", row.organization_id).maybeSingle(),
    row.configurator_id
      ? supabase
          .from("configurators")
          .select("id, name, slug")
          .eq("id", row.configurator_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const settings = parseSettings(row.settings);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  return {
    ok: true as const,
    connection_id: row.id,
    plugin_token: row.webhook_secret,
    webhook_url: appUrl ? `${appUrl}/api/integrations/${row.id}/webhook` : "",
    webhook_secret: row.webhook_secret,
    org_slug: org?.slug ?? "",
    org_name: org?.name ?? "",
    funnel_id: funnel?.id ?? row.configurator_id,
    funnel_slug: funnel?.slug ?? "",
    funnel_name: funnel?.name ?? "",
    store_domain: row.store_domain,
    label: row.label,
    status: row.status,
    product_count: row.product_count,
    last_sync_at: row.last_sync_at,
    storefront: settings.storefront,
  };
}

