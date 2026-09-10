import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiGetFunnelPerformance } from "@/lib/api/funnels";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const { id } = await ctx.params;

  try {
    const performance = await apiGetFunnelPerformance(auth.organizationId, id);
    if (!performance) return jsonError("Funnel introuvable", 404);
    return jsonOk({ performance });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Erreur", 500);
  }
}
