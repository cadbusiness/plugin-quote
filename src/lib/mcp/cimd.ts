const PRIVATE_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal"]);

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

export function isAllowedRedirectUri(uri: string) {
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return false;
  }
  if (url.hash) return false;
  if (url.protocol === "https:") return true;
  if (url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
    return true;
  }
  return false;
}

export function isPublicHttpsUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.hash) return false;
  const host = url.hostname.toLowerCase();
  if (PRIVATE_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) return false;
  if (isPrivateIpv4(host)) return false;
  return true;
}

export type ResolvedOAuthClient = {
  clientId: string;
  clientName: string;
  redirectUris: string[];
};

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

export async function fetchCimdClient(clientId: string): Promise<ResolvedOAuthClient | null> {
  if (!isPublicHttpsUrl(clientId)) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(clientId, {
      method: "GET",
      redirect: "error",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const length = Number(res.headers.get("content-length") ?? "0");
    if (length > 64_000) return null;
    const raw = await res.text();
    if (raw.length > 64_000) return null;
    const data = JSON.parse(raw) as Record<string, unknown>;
    const documentedId = typeof data.client_id === "string" ? data.client_id : clientId;
    if (documentedId !== clientId) return null;
    const redirectUris = asStringArray(data.redirect_uris).filter(isAllowedRedirectUri);
    if (!redirectUris.length) return null;
    return {
      clientId,
      clientName: typeof data.client_name === "string" && data.client_name.trim() ? data.client_name.trim() : "MCP",
      redirectUris,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
