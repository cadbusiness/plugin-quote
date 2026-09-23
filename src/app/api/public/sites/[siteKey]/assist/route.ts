import { handlePublicSiteAssist } from "@/lib/integrations/quote-widget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ siteKey: string }> };

/**
 * Optional structuring of a free-text need.
 * Does not create a quote. The widget still POSTs /quotes with the visitor text.
 */
export async function OPTIONS(req: Request, ctx: Ctx) {
  const { siteKey } = await ctx.params;
  return handlePublicSiteAssist(req, siteKey);
}

export async function POST(req: Request, ctx: Ctx) {
  const { siteKey } = await ctx.params;
  return handlePublicSiteAssist(req, siteKey);
}
