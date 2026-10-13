import { isApiAuth, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiSetFunnelTracking } from "@/lib/api/funnel-config";
import { trackingBody } from "@/lib/api/funnel-config-core";
import { funnelErrorResponse, readFunnelBody } from "@/lib/api/funnel-http";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const { id } = await ctx.params;
  const body = await readFunnelBody(req, trackingBody);
  if (!body.ok) return body.response;
  try {
    return jsonOk({ funnel: await apiSetFunnelTracking(auth.organizationId, { userId: null }, { ...body.data, funnel_id: id }) });
  } catch (error) {
    return funnelErrorResponse(error);
  }
}
