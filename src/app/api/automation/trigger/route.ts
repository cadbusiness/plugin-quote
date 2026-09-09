import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiTriggerFollowup, type FollowupTemplate } from "@/lib/api/automation";

export async function POST(req: Request) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;

  try {
    const body = (await req.json()) as { lead_id?: string; template?: FollowupTemplate };
    if (!body.lead_id || !body.template) return jsonError("lead_id et template requis");
    if (!["reminder_24h", "nudge_3d", "reactivation_30d"].includes(body.template)) {
      return jsonError("template invalide");
    }
    const result = await apiTriggerFollowup(auth.organizationId, {
      lead_id: body.lead_id,
      template: body.template,
    });
    return jsonOk({ followup: result });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Erreur";
    const status = message.includes("introuvable") ? 404 : 400;
    return jsonError(message, status);
  }
}
