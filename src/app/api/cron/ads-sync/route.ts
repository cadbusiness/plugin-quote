import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { syncAdsCampaigns } from "@/lib/ads/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization");
  if (secret && header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServiceClient();
  const { data: connections } = await supabase
    .from("ads_connections")
    .select("organization_id")
    .eq("provider", "google_ads")
    .eq("status", "active")
    .limit(40);
  const results = [];
  for (const row of connections ?? []) {
    results.push(await syncAdsCampaigns(supabase, row.organization_id));
  }
  return NextResponse.json({ connections: results.length, results });
}
