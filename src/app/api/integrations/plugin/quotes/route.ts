import { NextResponse } from "next/server";
import { authenticatePlugin, unauthorized } from "@/lib/integrations/plugin";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const row = await authenticatePlugin(req);
  if (!row) return unauthorized();

  const supabase = createServiceClient();
  let query = supabase
    .from("quotes")
    .select("id, contact_name, contact_email, contact_company, status, score_label, created_at")
    .eq("organization_id", row.organization_id)
    .order("created_at", { ascending: false })
    .limit(30);
  if (row.configurator_id) query = query.eq("configurator_id", row.configurator_id);

  const { data } = await query;
  return NextResponse.json({
    quotes: (data ?? []).map((quote) => ({
      id: quote.id,
      name: quote.contact_name,
      email: quote.contact_email,
      company: quote.contact_company,
      status: quote.status,
      score: quote.score_label,
      createdAt: quote.created_at,
    })),
  });
}
