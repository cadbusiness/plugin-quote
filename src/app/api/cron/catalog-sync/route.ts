import { NextResponse } from "next/server";
import { assertCronAuth } from "@/lib/cron/auth";
import { runCatalogSync } from "@/lib/integrations/sync";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_CONNECTIONS = 25;

export async function GET(req: Request) {
  const denied = assertCronAuth(req);
  if (denied) return denied;

  const supabase = createServiceClient();
  const { data: connections } = await supabase
    .from("catalog_connections")
    .select("id, label")
    .eq("status", "active")
    .order("last_sync_at", { ascending: true, nullsFirst: true })
    .limit(MAX_CONNECTIONS);

  const results = [];
  for (const connection of connections ?? []) {
    const result = await runCatalogSync({ connectionId: connection.id, trigger: "cron" });
    results.push({ connection: connection.label, ...result });
  }

  return NextResponse.json({ connections: results.length, results });
}
