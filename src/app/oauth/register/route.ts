import { corsPreflight, jsonWithCors } from "@/lib/mcp/cors";
import { registerOAuthClient } from "@/lib/mcp/oauth";

export const dynamic = "force-dynamic";

function asStringArray(value: unknown) {
  if (typeof value === "string") return [value];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const data = await registerOAuthClient({
      clientName: typeof body.client_name === "string" ? body.client_name : undefined,
      redirectUris: asStringArray(body.redirect_uris),
    });
    const issuedAt = Math.floor(new Date(data.created_at).getTime() / 1000);
    return jsonWithCors(
      {
        client_id: data.client_id,
        client_name: data.client_name,
        redirect_uris: data.redirect_uris,
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
        client_id_issued_at: issuedAt,
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonWithCors(
      { error: "invalid_client_metadata", error_description: error instanceof Error ? error.message : "invalid" },
      { status: 400 },
    );
  }
}

export function OPTIONS() {
  return corsPreflight();
}
