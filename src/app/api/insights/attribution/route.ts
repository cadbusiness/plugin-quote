import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiGetAttributionBreakdown } from "@/lib/api/insights";
import { ATTRIBUTION_GROUPS, periodFromSearchParams, type AttributionGroupBy } from "@/lib/api/insights-core";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const url = new URL(req.url);
  const groupBy = url.searchParams.get("group_by") ?? undefined;
  if (groupBy && !(ATTRIBUTION_GROUPS as readonly string[]).includes(groupBy)) {
    return jsonError("group_by invalide : source, source_medium, campaign ou full");
  }
  const limit = url.searchParams.get("limit");
  try {
    const attribution = await apiGetAttributionBreakdown(auth.organizationId, {
      ...periodFromSearchParams(url.searchParams),
      group_by: groupBy as AttributionGroupBy | undefined,
      limit: limit ? Number(limit) || undefined : undefined,
    });
    return jsonOk({ attribution });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Erreur", 400);
  }
}
