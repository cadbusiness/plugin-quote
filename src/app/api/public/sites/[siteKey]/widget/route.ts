import { handlePublicSiteWidget } from "@/lib/integrations/quote-widget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ siteKey: string }> };

/** Embed config: mode + optional AI. Same site key and CORS as the quote route. */
export async function OPTIONS(req: Request, ctx: Ctx) {
  const { siteKey } = await ctx.params;
  return handlePublicSiteWidget(req, siteKey);
}

export async function GET(req: Request, ctx: Ctx) {
  const { siteKey } = await ctx.params;
  return handlePublicSiteWidget(req, siteKey);
}
