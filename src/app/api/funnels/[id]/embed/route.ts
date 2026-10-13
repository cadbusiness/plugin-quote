import { isApiAuth, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiGetEmbedCode } from "@/lib/api/funnel-config";
import { funnelErrorResponse } from "@/lib/api/funnel-http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const { id } = await ctx.params;
  try {
    return jsonOk({ embed: await apiGetEmbedCode(auth.organizationId, id) });
  } catch (error) {
    return funnelErrorResponse(error);
  }
}
