import { NextResponse } from "next/server";
import { authenticatePlugin, unauthorized } from "@/lib/integrations/plugin";
import { ingestPluginQuote, pluginQuoteErrorBody } from "@/lib/integrations/plugin-quote";
import { createServiceClient } from "@/lib/supabase/service";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

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

/** WordPress pushes a stored request. Same Bearer token as GET. No HMAC. */
export async function POST(req: Request) {
  const limited = rateLimit(`plugin:quotes:${clientIp(req)}`, 30, 60000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const row = await authenticatePlugin(req);
  if (!row) return unauthorized();

  const body = await req.json().catch(() => null);
  try {
    const result = await ingestPluginQuote(row, body);
    if (!result.ok) {
      return NextResponse.json(pluginQuoteErrorBody(result.error, "expected" in result ? result.expected : undefined), {
        status: result.status,
      });
    }
    return NextResponse.json({ ok: true, quoteId: result.quoteId, alreadySubmitted: result.alreadySubmitted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Demande impossible";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
