import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiGetStats, type StatsPeriod } from "@/lib/api/stats";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;

  const url = new URL(req.url);
  const period = (url.searchParams.get("period") ?? "month") as StatsPeriod;
  if (!["today", "week", "month", "custom"].includes(period)) {
    return jsonError("period invalide");
  }

  try {
    const stats = await apiGetStats(auth.organizationId, {
      period,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      funnel_id: url.searchParams.get("funnel_id") ?? undefined,
    });
    return jsonOk({ stats });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Erreur", 500);
  }
}
