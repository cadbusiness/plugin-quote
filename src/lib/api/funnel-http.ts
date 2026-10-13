import type { z } from "zod";
import { jsonError } from "@/lib/api/http";

/** JSON body parsed with the same zod schema as the MCP tool. */
export async function readFunnelBody<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; response: Response }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: jsonError("Corps JSON invalide", 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join(".") || "body"} : ${issue.message}`);
    return { ok: false, response: jsonError(`Paramètres invalides :\n- ${issues.join("\n- ")}`, 400) };
  }
  return { ok: true, data: parsed.data };
}

export function funnelErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Erreur";
  if (message.includes("introuvable")) return jsonError(message, 404);
  if (message.startsWith("Droits insuffisants")) return jsonError(message, 403);
  if (message.startsWith("Le funnel « ") && message.includes("est publié")) return jsonError(message, 409);
  if (message.startsWith("Écriture interrompue")) {
    console.error(error);
    return jsonError(message, 500);
  }
  return jsonError(message, 400);
}
