import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiGetConversionUploads } from "@/lib/api/insights";
import { periodFromSearchParams } from "@/lib/api/insights-core";

const STATUSES = new Set(["uploaded", "skipped", "error", "pending"]);

export async function GET(req: Request) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  if (status && !STATUSES.has(status)) return jsonError("status invalide");
  try {
    const diagnostics = await apiGetConversionUploads(auth.organizationId, {
      ...periodFromSearchParams(url.searchParams),
      status,
    });
    return jsonOk({ diagnostics });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Erreur", 400);
  }
}
