import { NextResponse } from "next/server";
import { assertCronAuth } from "@/lib/cron/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { syncAdsCampaigns } from "@/lib/ads/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  const denied = assertCronAuth(req);
  if (denied) return denied;
  const supabase = createServiceClient();
  const { data: connections } = await supabase
    .from("ads_connections")
    .select("organization_id, status")
    .eq("provider", "google_ads")
    .in("status", ["active", "error"])
    .not("customer_id", "is", null)
    .order("status", { ascending: true })
    .limit(40);
  const results = [];
  // Errored connections get one retry per run; a successful sync sets them back to active.
  for (const row of connections ?? []) {
    results.push({ status: row.status, ...(await syncAdsCampaigns(supabase, row.organization_id)) });
  }
  return NextResponse.json({ connections: results.length, results });
}
