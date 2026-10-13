import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiAssignLead } from "@/lib/api/crm";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as { assignee?: unknown; mode?: unknown; notify?: unknown };
    const assignment = await apiAssignLead(auth.organizationId, {
      lead_id: id,
      assignee: typeof body.assignee === "string" ? body.assignee : "",
      mode: typeof body.mode === "string" ? body.mode : undefined,
      notify: body.notify === false ? false : undefined,
    });
    return jsonOk({ assignment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    return jsonError(message, message.includes("introuvable") ? 404 : 400);
  }
}
