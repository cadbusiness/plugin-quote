/**
 * Handshake plugin → QuoteBuilder → plugin.
 * Le site WordPress ouvre cette page ; après login on renvoie un code à usage unique.
 */

export type PluginConnectRequest = {
  siteUrl: string;
  siteName: string;
  returnUrl: string;
  state: string;
};

export function parsePluginConnectRequest(searchParams: URLSearchParams): PluginConnectRequest | null {
  const siteUrl = searchParams.get("site_url")?.trim() ?? "";
  const returnUrl = searchParams.get("return")?.trim() ?? "";
  const state = searchParams.get("state")?.trim() ?? "";
  if (!siteUrl || !returnUrl || !state) return null;
  if (!/^[A-Za-z0-9_-]{12,64}$/.test(state)) return null;
  try {
    pluginConnectReturnUrl(siteUrl, returnUrl);
  } catch {
    return null;
  }
  const siteName = searchParams.get("site_name")?.trim() || hostnameOf(siteUrl) || "WordPress";
  return { siteUrl, siteName, returnUrl, state };
}

export function pluginConnectReturnUrl(siteUrl: string, returnUrl: string) {
  const site = parseHttpUrl(siteUrl);
  const ret = parseHttpUrl(returnUrl);
  if (!site || !ret) {
    throw new Error("URL de retour invalide.");
  }
  if (ret.username || ret.password) {
    throw new Error("URL de retour invalide.");
  }
  if (ret.hostname !== site.hostname) {
    throw new Error("L’adresse de retour ne correspond pas au site WordPress.");
  }
  return ret;
}

export function pluginConnectCallback(siteUrl: string, returnUrl: string, code: string, state: string) {
  const ret = pluginConnectReturnUrl(siteUrl, returnUrl);
  ret.searchParams.set("qb_connect", "done");
  ret.searchParams.set("code", code);
  ret.searchParams.set("state", state);
  return ret.toString();
}

export function hostnameOf(value: string) {
  try {
    return parseHttpUrl(value)?.hostname ?? "";
  } catch {
    return "";
  }
}

function parseHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("\\") || trimmed.includes("@")) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  return url;
}
