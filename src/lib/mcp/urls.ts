import { getAppUrl } from "@/lib/supabase/env";
import { SITE_URL } from "@/lib/marketing/site";

export const MCP_PATH = "/api/mcp";
export const MCP_SCOPE = "mcp";
export const MCP_RESOURCE_METADATA_PATH = "/.well-known/oauth-protected-resource";
/** RFC 9728 §3.1 : metadata du resource `/api/mcp` = well-known + chemin du resource. */
export const MCP_RESOURCE_METADATA_PATH_FOR_RESOURCE = `${MCP_RESOURCE_METADATA_PATH}${MCP_PATH}`;
export const MCP_AUTHORIZATION_SERVER_METADATA_PATH = "/.well-known/oauth-authorization-server";

/**
 * Hôtes qui servent /api/mcp, /oauth/* et /.well-known/*. Claude et ChatGPT comparent le
 * `resource` annoncé à l’URL saisie : on renvoie l’hôte appelé, jamais un Host arbitraire.
 */
export const MCP_PUBLIC_HOSTS = new Set([
  "www.quotebuilder.co",
  "quotebuilder.co",
  "quotebuilder-weld.vercel.app",
]);

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

export function mcpPublicOrigin() {
  return getAppUrl().replace(/\/$/, "") || SITE_URL;
}

export function mcpResourceUrl(origin = mcpPublicOrigin()) {
  return `${origin.replace(/\/$/, "")}${MCP_PATH}`;
}

export function mcpIssuer(origin = mcpPublicOrigin()) {
  return origin.replace(/\/$/, "");
}

/** `https://host` si l’hôte est dans la liste blanche (http autorisé en local), sinon null. */
export function allowedPublicOrigin(host: string | null | undefined, proto: string | null | undefined) {
  const raw = host?.split(",")[0]?.trim().toLowerCase();
  if (!raw || /[/\\@?#\s]/.test(raw)) return null;
  let url: URL;
  try {
    url = new URL(`http://${raw}`);
  } catch {
    return null;
  }
  if (LOCAL_HOSTNAMES.has(url.hostname)) {
    const scheme = proto?.split(",")[0]?.trim() === "https" ? "https" : "http";
    return `${scheme}://${url.host}`;
  }
  if (url.port || !MCP_PUBLIC_HOSTS.has(url.hostname)) return null;
  return `https://${url.hostname}`;
}

export function originFromRequest(req: Request) {
  const forwarded = allowedPublicOrigin(
    req.headers.get("x-forwarded-host"),
    req.headers.get("x-forwarded-proto"),
  );
  if (forwarded) return forwarded;
  try {
    const url = new URL(req.url);
    const direct = allowedPublicOrigin(url.host, url.protocol.replace(/:$/, ""));
    if (direct) return direct;
  } catch {
    // URL relative : origine publique configurée.
  }
  return mcpIssuer(mcpPublicOrigin());
}
