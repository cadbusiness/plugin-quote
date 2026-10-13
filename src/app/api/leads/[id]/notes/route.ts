import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiAddLeadNote } from "@/lib/api/crm";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as { content?: unknown };
    const note = await apiAddLeadNote(auth.organizationId, {
      lead_id: id,
      content: typeof body.content === "string" ? body.content : "",
      source: "api",
    });
    return jsonOk({ note }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    return jsonError(message, message.includes("introuvable") ? 404 : 400);
  }
}
