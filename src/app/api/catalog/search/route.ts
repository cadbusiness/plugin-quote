import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiSearchCatalog } from "@/lib/api/catalog";

function flag(value: string | null) {
  return value === "1" || value === "true";
}

function int(value: string | null) {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isInteger(n) ? n : undefined;
}

export async function GET(req: Request) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const url = new URL(req.url);
  const params = url.searchParams;
  try {
    const catalog = await apiSearchCatalog(auth.organizationId, {
      query: params.get("q") ?? params.get("query") ?? undefined,
      category: params.get("category") ?? undefined,
      funnel_id: params.get("funnel_id") ?? undefined,
      in_stock_only: flag(params.get("in_stock_only")),
      include_inactive: flag(params.get("include_inactive")),
      limit: int(params.get("limit")),
      max_variants: int(params.get("max_variants")),
    });
    return jsonOk({ catalog });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Erreur", 500);
  }
}
