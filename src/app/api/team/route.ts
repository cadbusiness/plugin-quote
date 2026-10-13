import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiListTeam } from "@/lib/api/crm";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  try {
    return jsonOk({ members: await apiListTeam(auth.organizationId) });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Erreur", 500);
  }
}
