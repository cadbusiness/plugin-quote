import type { PluginConnection } from "@/lib/integrations/plugin";
import { receivePluginQuote, type PluginQuoteResult } from "@/lib/integrations/plugin-quotes";
import { bindQuoteBody, type WidgetMatrixProduct } from "@/lib/integrations/quote-widget-bind";
import { safeEqual } from "@/lib/integrations/secrets";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { createServiceClient } from "@/lib/supabase/service";

/** Browser callers send this header. It must equal the key in the path. */
export const PUBLIC_SITE_KEY_HEADER = "x-quotebuilder-site-key";

/** Prefix keeps the publishable key distinct from the plugin Bearer secret. */
export const PUBLIC_SITE_KEY_PREFIX = "qb_site_";

const PUBLIC_SITE_KEY_RE = /^qb_site_[A-Za-z0-9_-]{16,128}$/;

export const PUBLIC_SITE_QUOTE_IP_LIMIT = 30;
export const PUBLIC_SITE_QUOTE_SITE_LIMIT = 60;
export const PUBLIC_SITE_QUOTE_WINDOW_MS = 60_000;

const CORS_METHODS = "POST, OPTIONS";
const CORS_REQUEST_HEADERS = "Content-Type, X-QuoteBuilder-Site-Key";

export function isPublicSiteKey(value: string) {
  return PUBLIC_SITE_KEY_RE.test(value);
}

export function publicSiteQuotePath(siteKey: string) {
  return `/api/public/sites/${siteKey}/quotes`;
}

/** Scheme + host + port, lowercased. Paths on a shop URL are ignored. */
export function canonicalOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "null") return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  const host = url.hostname;
  if (host !== "localhost" && !host.endsWith(".localhost") && !host.endsWith(".local") && !host.includes(".")) {
    return null;
  }
  return url.origin.toLowerCase();
}

/** Shop origin, then any extra origins saved on the connection. */
export function siteAllowedOrigins(storeDomain: string, extra: readonly string[] | null | undefined) {
  const origins: string[] = [];
  const push = (value: string) => {
    const origin = canonicalOrigin(value);
    if (origin && !origins.includes(origin)) origins.push(origin);
  };
  push(storeDomain);
  for (const row of extra ?? []) push(row);
  return origins;
}

/** One origin per line or comma. Invalid entries are dropped. Capped at 20. */
export function parseAllowedOriginList(value: unknown) {
  const text = typeof value === "string" ? value : "";
  const origins: string[] = [];
  for (const part of text.split(/[\s,]+/)) {
    const origin = canonicalOrigin(part);
    if (origin && !origins.includes(origin)) origins.push(origin);
    if (origins.length >= 20) break;
  }
  return origins;
}

/**
 * Returns the raw Origin header when it matches the allowlist.
 * Reflect that exact value: browsers reject a rewritten Allow-Origin.
 */
export function matchingAllowedOrigin(requestOrigin: string | null, allowed: readonly string[]) {
  if (!requestOrigin) return null;
  const canonical = canonicalOrigin(requestOrigin);
  if (!canonical || !allowed.includes(canonical)) return null;
  return requestOrigin;
}

export function siteCorsHeaders(origin: string, methods = CORS_METHODS) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", methods);
  headers.set("Access-Control-Allow-Headers", CORS_REQUEST_HEADERS);
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("Vary", "Origin");
  headers.set("Cache-Control", "no-store");
  return headers;
}

type PublicSiteDeps = {
  load?: (publicKey: string) => Promise<PluginConnection | null>;
  receive?: (connection: PluginConnection, body: unknown) => Promise<PluginQuoteResult>;
  /** Présent sur la route publique : résout la matrice, rejette une combinaison inconnue. */
  loadMatrices?: (connection: PluginConnection) => Promise<WidgetMatrixProduct[]>;
};

async function loadConnectionByPublicKey(publicKey: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("catalog_connections")
    .select("*")
    .eq("public_key", publicKey)
    .maybeSingle();
  return data ?? null;
}

function json(body: unknown, status: number, extra?: Headers) {
  const headers = extra ? new Headers(extra) : new Headers();
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("Vary", "Origin");
  return new Response(JSON.stringify(body), { status, headers });
}

function empty(status: number, extra?: Headers) {
  const headers = extra ? new Headers(extra) : new Headers();
  headers.set("Cache-Control", "no-store");
  headers.set("Vary", "Origin");
  return new Response(null, { status, headers });
}

export type PublicSiteAccess = {
  connection: PluginConnection;
  cors: Headers;
};

/**
 * Publishable site key + shop origin. OPTIONS returns 204.
 * The plugin Bearer secret is not accepted.
 */
export async function openPublicSite(
  req: Request,
  siteKey: string,
  options: {
    load?: (publicKey: string) => Promise<PluginConnection | null>;
    methods?: string;
  } = {},
): Promise<{ ok: true; access: PublicSiteAccess } | { ok: false; response: Response }> {
  const methods = options.methods ?? CORS_METHODS;
  const key = siteKey.trim();
  if (!isPublicSiteKey(key)) {
    return { ok: false, response: json({ error: "Clé site invalide" }, 401) };
  }

  const method = req.method.toUpperCase();
  const allowedMethods = methods.split(",").map((part) => part.trim().toUpperCase());
  if (!allowedMethods.includes(method)) {
    return { ok: false, response: json({ error: "Méthode non autorisée" }, 405) };
  }

  const load = options.load ?? loadConnectionByPublicKey;
  const connection = await load(key);
  if (!connection || connection.status === "disabled" || connection.public_key !== key) {
    return { ok: false, response: json({ error: "Clé site invalide" }, 401) };
  }

  const allowed = siteAllowedOrigins(connection.store_domain, connection.allowed_origins);
  const origin = matchingAllowedOrigin(req.headers.get("origin"), allowed);
  if (!origin) return { ok: false, response: json({ error: "Origine non autorisée" }, 403) };

  const cors = siteCorsHeaders(origin, methods);
  if (method === "OPTIONS") return { ok: false, response: empty(204, cors) };

  const headerKey = req.headers.get(PUBLIC_SITE_KEY_HEADER)?.trim() ?? "";
  if (!headerKey) return { ok: false, response: json({ error: "Clé site manquante" }, 401, cors) };
  if (!isPublicSiteKey(headerKey) || !safeEqual(headerKey, key)) {
    return { ok: false, response: json({ error: "Clé site invalide" }, 401, cors) };
  }

  return { ok: true, access: { connection, cors } };
}

/**
 * Browser quote create for one shop connection.
 * Auth is the publishable site key (path + header), not the plugin Bearer secret.
 * Idempotence, catalog match, and sales notify stay in receivePluginQuote.
 */
export async function handlePublicSiteQuote(req: Request, siteKey: string, deps: PublicSiteDeps = {}) {
  const opened = await openPublicSite(req, siteKey, { load: deps.load });
  if (!opened.ok) return opened.response;
  const { connection, cors } = opened.access;

  const ipLimit = rateLimit(`public-site-quote:ip:${clientIp(req)}`, PUBLIC_SITE_QUOTE_IP_LIMIT, PUBLIC_SITE_QUOTE_WINDOW_MS);
  if (!ipLimit.ok) {
    cors.set("Retry-After", String(ipLimit.retryAfterSec));
    return json({ error: "Trop de requêtes, réessayez plus tard." }, 429, cors);
  }
  const siteLimit = rateLimit(
    `public-site-quote:site:${connection.id}`,
    PUBLIC_SITE_QUOTE_SITE_LIMIT,
    PUBLIC_SITE_QUOTE_WINDOW_MS,
  );
  if (!siteLimit.ok) {
    cors.set("Retry-After", String(siteLimit.retryAfterSec));
    return json({ error: "Trop de requêtes, réessayez plus tard." }, 429, cors);
  }

  let body = await req.json().catch(() => null);
  try {
    if (deps.loadMatrices) {
      const catalog = await deps.loadMatrices(connection);
      const bound = bindQuoteBody(body, catalog);
      if (!bound.ok) return json({ error: bound.error }, 422, cors);
      body = bound.body;
    }
    const receive = deps.receive ?? receivePluginQuote;
    const result = await receive(connection, body);
    if (!result.ok) return json({ error: result.error }, result.status, cors);
    return json({ id: result.id, url: result.url }, result.status, cors);
  } catch (error) {
    console.error("public site quote failed", error);
    return json({ error: "La demande n'a pas pu être enregistrée. Réessayez dans un moment." }, 500, cors);
  }
}
