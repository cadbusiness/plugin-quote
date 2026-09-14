import type { AuthInfo } from "@modelcontextprotocol/server";
import { authenticateApiToken } from "@/lib/api/keys";
import { createServiceClient } from "@/lib/supabase/service";
import { sha256Hex, safeEqualHex } from "@/lib/mcp/crypto";
import { MCP_SCOPE } from "@/lib/mcp/urls";

const ACCESS_PREFIX = "qb_mcp_";
const API_KEY_YEARS = 10 * 365 * 24 * 3600;

export type McpAuthExtra = {
  organizationId: string;
  apiKeyId?: string;
  tokenId?: string;
  userId?: string | null;
};

export function organizationIdFromAuth(auth?: AuthInfo): string {
  const id = auth?.extra?.organizationId;
  if (typeof id !== "string" || !id) {
    throw new Error("Organisation introuvable pour ce jeton MCP");
  }
  return id;
}

function asAuthInfo(input: {
  token: string;
  clientId: string;
  extra: McpAuthExtra;
  expiresAt: number;
}): AuthInfo {
  return {
    token: input.token,
    clientId: input.clientId,
    scopes: [MCP_SCOPE],
    expiresAt: input.expiresAt,
    extra: input.extra,
  };
}

async function authenticateMcpAccessToken(token: string): Promise<AuthInfo | undefined> {
  if (!token.startsWith(ACCESS_PREFIX)) return undefined;
  const hash = sha256Hex(token);
  const supabase = createServiceClient();
  const { data: rows } = await supabase
    .from("mcp_oauth_tokens")
    .select("id, client_id, organization_id, user_id, access_hash, access_expires_at, revoked_at")
    .eq("access_hash", hash)
    .is("revoked_at", null)
    .limit(5);

  const match = (rows ?? []).find((row) => safeEqualHex(row.access_hash, hash));
  if (!match) return undefined;
  const expiresAt = Math.floor(new Date(match.access_expires_at).getTime() / 1000);
  if (expiresAt < Math.floor(Date.now() / 1000)) return undefined;

  void supabase.from("mcp_oauth_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", match.id);

  return asAuthInfo({
    token,
    clientId: match.client_id,
    expiresAt,
    extra: {
      organizationId: match.organization_id,
      tokenId: match.id,
      userId: match.user_id,
    },
  });
}

export async function verifyMcpBearerToken(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  const token = bearerToken?.trim();
  if (!token) return undefined;

  const key = await authenticateApiToken(token);
  if (key) {
    return asAuthInfo({
      token,
      clientId: key.apiKeyId,
      expiresAt: Math.floor(Date.now() / 1000) + API_KEY_YEARS,
      extra: { organizationId: key.organizationId, apiKeyId: key.apiKeyId },
    });
  }

  return authenticateMcpAccessToken(token);
}
