import { getAppUrl } from "@/lib/supabase/env";
import { SITE_URL } from "@/lib/marketing/site";

export const MCP_PATH = "/api/mcp";
export const MCP_SCOPE = "mcp";
export const MCP_RESOURCE_METADATA_PATH = "/.well-known/oauth-protected-resource";
export const MCP_AUTHORIZATION_SERVER_METADATA_PATH = "/.well-known/oauth-authorization-server";

export function mcpPublicOrigin() {
  return getAppUrl().replace(/\/$/, "") || SITE_URL;
}

export function mcpResourceUrl(origin = mcpPublicOrigin()) {
  return `${origin.replace(/\/$/, "")}${MCP_PATH}`;
}

export function mcpIssuer(origin = mcpPublicOrigin()) {
  return origin.replace(/\/$/, "");
}

export function originFromRequest(req: Request) {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedHost) {
    const proto = forwardedProto === "http" ? "http" : "https";
    return `${proto}://${forwardedHost}`;
  }
  return new URL(req.url).origin;
}
