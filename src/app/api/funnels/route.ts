import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiListFunnels } from "@/lib/api/funnels";
import { apiCreateFunnel } from "@/lib/api/funnel-config";
import { createFunnelBody } from "@/lib/api/funnel-config-core";
import { funnelErrorResponse, readFunnelBody } from "@/lib/api/funnel-http";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;

  try {
    const funnels = await apiListFunnels(auth.organizationId);
    return jsonOk({ funnels });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Erreur", 500);
  }
}

/** Always created unpublished; see POST /api/funnels/:id/publish. */
export async function POST(req: Request) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const body = await readFunnelBody(req, createFunnelBody);
  if (!body.ok) return body.response;
  try {
    const funnel = await apiCreateFunnel(auth.organizationId, { userId: null }, body.data);
    return jsonOk({ funnel }, { status: 201 });
  } catch (error) {
    return funnelErrorResponse(error);
  }
}
