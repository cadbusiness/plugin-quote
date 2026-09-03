import { NextResponse } from "next/server";
import { runCatalogSync } from "@/lib/integrations/sync";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_CONNECTIONS = 25;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization");
  if (secret && header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
