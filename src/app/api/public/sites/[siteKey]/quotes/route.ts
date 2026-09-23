import { loadWidgetCatalog } from "@/lib/integrations/quote-widget";
import { handlePublicSiteQuote } from "@/lib/integrations/public-site-quote";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ siteKey: string }> };

/**
 * Browser quote create, scoped to one shop connection.
 *
 * Auth: publishable site key in the path and in `X-QuoteBuilder-Site-Key`.
 * Not the plugin Bearer (`webhook_secret`).
 *
 * OPTIONS — CORS preflight. Allow-Origin is the request origin when it matches
 * the shop URL or `catalog_connections.allowed_origins`.
 *
 * POST — same receipt body as `receivePluginQuote` (`source: "wordpress"`).
 * 201 { id, url } created, 200 { id, url } when externalId was already received.
 * Does not email the contact and does not start prospect nurture.
 */
export async function OPTIONS(req: Request, ctx: Ctx) {
  const { siteKey } = await ctx.params;
  return handlePublicSiteQuote(req, siteKey);
}

export async function POST(req: Request, ctx: Ctx) {
  const { siteKey } = await ctx.params;
  return handlePublicSiteQuote(req, siteKey, { loadMatrices: loadWidgetCatalog });
}
