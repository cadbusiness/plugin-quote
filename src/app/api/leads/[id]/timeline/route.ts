import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiGetLeadTimeline } from "@/lib/api/crm";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const { id } = await ctx.params;
  const limit = Number(new URL(req.url).searchParams.get("limit") ?? "") || undefined;
  try {
    const timeline = await apiGetLeadTimeline(auth.organizationId, id, limit);
    if (!timeline) return jsonError("Lead introuvable", 404);
    return jsonOk({ timeline });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Erreur", 500);
  }
}
