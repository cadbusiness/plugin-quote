import { randomUUID } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { sha256Hex, safeEqualHex } from "@/lib/mcp/crypto";
import { fetchCimdClient, isAllowedRedirectUri, type ResolvedOAuthClient } from "@/lib/mcp/cimd";
import { newOpaqueToken, verifyPkceS256 } from "@/lib/mcp/pkce";
import { MCP_SCOPE, mcpIssuer, mcpResourceUrl, originFromRequest } from "@/lib/mcp/urls";

const CODE_TTL_MS = 10 * 60 * 1000;
const ACCESS_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const REFRESH_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const ACCESS_PREFIX = "qb_mcp_";
const REFRESH_PREFIX = "qb_mcr_";

export type AuthorizeRequest = {
  clientId: string;
  redirectUri: string;
  state: string | null;
  codeChallenge: string;
  resource: string | null;
};

export function parseAuthorizeRequest(url: URL): AuthorizeRequest | { error: string } {
  const clientId = url.searchParams.get("client_id")?.trim() ?? "";
  const redirectUri = url.searchParams.get("redirect_uri")?.trim() ?? "";
  const responseType = url.searchParams.get("response_type")?.trim() ?? "";
  const challenge = url.searchParams.get("code_challenge")?.trim() ?? "";
  const method = url.searchParams.get("code_challenge_method")?.trim() ?? "S256";
  const state = url.searchParams.get("state");
  const resource = url.searchParams.get("resource");

  if (!clientId) return { error: "client_id manquant" };
  if (!redirectUri || !isAllowedRedirectUri(redirectUri)) return { error: "redirect_uri invalide" };
  if (responseType !== "code") return { error: "response_type doit être code" };
  if (!challenge || method.toUpperCase() !== "S256") return { error: "PKCE S256 requis" };

  return {
    clientId,
    redirectUri,
    state,
    codeChallenge: challenge,
    resource,
  };
}

export async function resolveOAuthClient(clientId: string): Promise<ResolvedOAuthClient | null> {
  if (clientId.startsWith("https://")) {
    return fetchCimdClient(clientId);
  }
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("mcp_oauth_clients")
    .select("client_id, client_name, redirect_uris")
    .eq("client_id", clientId)
    .maybeSingle();
  if (!data) return null;
  return {
    clientId: data.client_id,
    clientName: data.client_name,
    redirectUris: data.redirect_uris,
  };
}

export function clientAllowsRedirect(client: ResolvedOAuthClient, redirectUri: string) {
  return client.redirectUris.includes(redirectUri);
}

export async function registerOAuthClient(input: {
  clientName?: string;
  redirectUris: string[];
}) {
  const redirectUris = input.redirectUris.filter(isAllowedRedirectUri);
  if (!redirectUris.length) throw new Error("redirect_uris HTTPS requis");
  const clientId = randomUUID();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("mcp_oauth_clients")
    .insert({
      client_id: clientId,
      client_name: input.clientName?.trim() || "MCP",
      redirect_uris: redirectUris,
      token_endpoint_auth_method: "none",
    })
    .select("client_id, client_name, redirect_uris, created_at")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Enregistrement client impossible");
  return data;
}

export async function issueAuthorizationCode(input: {
  clientId: string;
  organizationId: string;
  userId: string;
  redirectUri: string;
  codeChallenge: string;
  resource: string | null;
}) {
  const code = newOpaqueToken("qb_code_");
  const supabase = createServiceClient();
  const { error } = await supabase.from("mcp_oauth_codes").insert({
    code_hash: sha256Hex(code),
    client_id: input.clientId,
    organization_id: input.organizationId,
    user_id: input.userId,
    redirect_uri: input.redirectUri,
    code_challenge: input.codeChallenge,
    resource: input.resource,
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  });
  if (error) throw new Error(error.message);
  return code;
}

export function authorizationRedirect(redirectUri: string, params: Record<string, string | null>) {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

async function issueTokenPair(input: {
  clientId: string;
  organizationId: string;
  userId: string | null;
}) {
  const access = newOpaqueToken(ACCESS_PREFIX);
  const refresh = newOpaqueToken(REFRESH_PREFIX);
  const supabase = createServiceClient();
  const { error } = await supabase.from("mcp_oauth_tokens").insert({
    access_hash: sha256Hex(access),
    refresh_hash: sha256Hex(refresh),
    client_id: input.clientId,
    organization_id: input.organizationId,
    user_id: input.userId,
    scopes: [MCP_SCOPE],
    access_expires_at: new Date(Date.now() + ACCESS_TTL_MS).toISOString(),
    refresh_expires_at: new Date(Date.now() + REFRESH_TTL_MS).toISOString(),
  });
  if (error) throw new Error(error.message);
  return {
    token_type: "Bearer" as const,
    access_token: access,
    refresh_token: refresh,
    expires_in: Math.floor(ACCESS_TTL_MS / 1000),
    scope: MCP_SCOPE,
  };
}

export async function exchangeAuthorizationCode(input: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}) {
  const hash = sha256Hex(input.code);
  const supabase = createServiceClient();
  const { data: rows } = await supabase
    .from("mcp_oauth_codes")
    .select("*")
    .eq("code_hash", hash)
    .is("used_at", null)
    .limit(5);
  const row = (rows ?? []).find((item) => safeEqualHex(item.code_hash, hash));
  if (!row) throw new Error("code invalide");
  if (new Date(row.expires_at).getTime() < Date.now()) throw new Error("code expiré");
  if (row.client_id !== input.clientId) throw new Error("client_id ne correspond pas");
  if (row.redirect_uri !== input.redirectUri) throw new Error("redirect_uri ne correspond pas");
  if (!verifyPkceS256(input.codeVerifier, row.code_challenge)) throw new Error("code_verifier invalide");

  await supabase.from("mcp_oauth_codes").update({ used_at: new Date().toISOString() }).eq("id", row.id);

  return issueTokenPair({
    clientId: row.client_id,
    organizationId: row.organization_id,
    userId: row.user_id,
  });
}

export async function refreshAccessToken(input: { refreshToken: string; clientId: string }) {
  if (!input.refreshToken.startsWith(REFRESH_PREFIX)) throw new Error("refresh_token invalide");
  const hash = sha256Hex(input.refreshToken);
  const supabase = createServiceClient();
  const { data: rows } = await supabase
    .from("mcp_oauth_tokens")
    .select("*")
    .eq("refresh_hash", hash)
    .is("revoked_at", null)
    .limit(5);
  const row = (rows ?? []).find((item) => safeEqualHex(item.refresh_hash, hash));
  if (!row) throw new Error("refresh_token invalide");
  if (row.client_id !== input.clientId) throw new Error("client_id ne correspond pas");
  if (new Date(row.refresh_expires_at).getTime() < Date.now()) throw new Error("refresh_token expiré");

  await supabase.from("mcp_oauth_tokens").update({ revoked_at: new Date().toISOString() }).eq("id", row.id);

  return issueTokenPair({
    clientId: row.client_id,
    organizationId: row.organization_id,
    userId: row.user_id,
  });
}

export function authorizationServerMetadata(req: Request) {
  const issuer = mcpIssuer(originFromRequest(req));
  return {
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    registration_endpoint: `${issuer}/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: [MCP_SCOPE],
    client_id_metadata_document_supported: true,
  };
}

export function protectedResourceMetadata(req: Request) {
  const origin = originFromRequest(req);
  return {
    resource: mcpResourceUrl(origin),
    authorization_servers: [mcpIssuer(origin)],
    bearer_methods_supported: ["header"],
    scopes_supported: [MCP_SCOPE],
  };
}
