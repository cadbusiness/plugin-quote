import { NextResponse } from "next/server";
import { authenticatePlugin, unauthorized } from "@/lib/integrations/plugin";
import { ingestPluginQuote, pluginQuoteErrorBody } from "@/lib/integrations/plugin-quote";
import { receivePluginQuote } from "@/lib/integrations/plugin-quotes";
import { createServiceClient } from "@/lib/supabase/service";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Plugin quotes.
 *
 * GET — latest quotes for the connection’s org (and funnel, when set).
 *
 * POST — two WordPress bodies, same Bearer token as GET. No HMAC.
 *
 * Receipt body (`source: "wordpress"` plus `contact`): creates a quote in the
 * connection’s org, attaches Woo lines to the synced catalog, and notifies sales
 * without emailing the contact. Idempotence is `plugin_quote_receipts`
 * (connection_id, external_id). 201 { id, url } created, 200 { id, url } replay.
 *
 * Flat plugin body: the installed plugin’s one-call submit. 200 { quoteId, alreadySubmitted, reference }.
 */
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
    if (isConnectionReceipt(body)) {
      const result = await receivePluginQuote(row, body);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({ id: result.id, url: result.url }, { status: result.status });
    }

    const result = await ingestPluginQuote(row, body);
    if (!result.ok) {
      return NextResponse.json(
        pluginQuoteErrorBody(result.error, result.code, "expected" in result ? result.expected : undefined),
        { status: result.status },
      );
    }
    return NextResponse.json({
      ok: true,
      quoteId: result.quoteId,
      alreadySubmitted: result.alreadySubmitted,
      reference: result.reference,
    });
  } catch (error) {
    console.error("plugin quote failed", error);
    return NextResponse.json(
      {
        error: "La demande n'a pas pu être enregistrée. Réessayez dans un moment.",
        code: "submit_failed",
      },
      { status: 500 },
    );
  }
}

/** Structured inbound quote. The flat plugin payload has no `source` and no `contact` object. */
function isConnectionReceipt(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const raw = body as Record<string, unknown>;
  const source = typeof raw.source === "string" ? raw.source.trim().toLowerCase() : "";
  return source === "wordpress" && !!raw.contact && typeof raw.contact === "object" && !Array.isArray(raw.contact);
}
