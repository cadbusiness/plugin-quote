import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiGetAdsPerformance } from "@/lib/api/insights";
import { periodFromSearchParams } from "@/lib/api/insights-core";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const url = new URL(req.url);
  try {
    const performance = await apiGetAdsPerformance(auth.organizationId, {
      ...periodFromSearchParams(url.searchParams),
      campaign: url.searchParams.get("campaign") ?? undefined,
    });
    return jsonOk({ performance });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Erreur", 400);
  }
}
