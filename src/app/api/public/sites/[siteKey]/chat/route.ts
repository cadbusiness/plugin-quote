import { handlePublicSiteChat } from "@/lib/chat-agent/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ siteKey: string }> };

/** Conversational retrieval for the embed. Site key + shop origin, same as /quotes. */
export async function OPTIONS(req: Request, ctx: Ctx) {
  const { siteKey } = await ctx.params;
  return handlePublicSiteChat(req, siteKey);
}

export async function POST(req: Request, ctx: Ctx) {
  const { siteKey } = await ctx.params;
  return handlePublicSiteChat(req, siteKey);
}
