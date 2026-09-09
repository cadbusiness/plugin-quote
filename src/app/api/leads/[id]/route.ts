import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiGetLeadDetail, apiUpdateLeadStatus } from "@/lib/api/leads";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const { id } = await ctx.params;

  try {
    const lead = await apiGetLeadDetail(auth.organizationId, id);
    if (!lead) return jsonError("Lead introuvable", 404);
    return jsonOk({ lead });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Erreur", 500);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const { id } = await ctx.params;

  try {
    const body = (await req.json()) as { status?: string; note?: string };
    if (!body.status) return jsonError("status requis");
    const lead = await apiUpdateLeadStatus(auth.organizationId, {
      lead_id: id,
      status: body.status,
      note: body.note,
    });
    return jsonOk({ lead });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Erreur";
    const status = message.includes("introuvable") ? 404 : 400;
    return jsonError(message, status);
  }
}
