import { corsPreflight, jsonWithCors } from "@/lib/mcp/cors";
import { exchangeAuthorizationCode, refreshAccessToken } from "@/lib/mcp/oauth";

export const dynamic = "force-dynamic";

async function readTokenBody(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await req.json()) as Record<string, unknown>;
  }
  const text = await req.text();
  const params = new URLSearchParams(text);
  return Object.fromEntries(params.entries()) as Record<string, unknown>;
}

export async function POST(req: Request) {
  try {
    const body = await readTokenBody(req);
    const grant = String(body.grant_type ?? "");
    const clientId = String(body.client_id ?? "");
    if (grant === "authorization_code") {
      const tokens = await exchangeAuthorizationCode({
        code: String(body.code ?? ""),
        clientId,
        redirectUri: String(body.redirect_uri ?? ""),
        codeVerifier: String(body.code_verifier ?? ""),
      });
      return jsonWithCors(tokens);
    }
    if (grant === "refresh_token") {
      const tokens = await refreshAccessToken({
        refreshToken: String(body.refresh_token ?? ""),
        clientId,
      });
      return jsonWithCors(tokens);
    }
    return jsonWithCors({ error: "unsupported_grant_type" }, { status: 400 });
  } catch (error) {
    return jsonWithCors(
      { error: "invalid_grant", error_description: error instanceof Error ? error.message : "invalid" },
      { status: 400 },
    );
  }
}

export function OPTIONS() {
  return corsPreflight();
}
