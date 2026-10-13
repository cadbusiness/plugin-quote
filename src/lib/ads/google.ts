import { createHmac, timingSafeEqual } from "node:crypto";
import { getAppUrl } from "@/lib/supabase/env";
import { encryptSecret, decryptSecret } from "@/lib/integrations/secrets";
import {
  adsConsent,
  mergeCustomers,
  parseCustomerClients,
  parseUploadResults,
  resourceBelongsTo,
  type AdsConversionValue,
  type AdsCustomer,
} from "@/lib/ads/conversions";

export const GOOGLE_ADS_SCOPE = "https://www.googleapis.com/auth/adwords";
// v24 (Apr 2026) is supported until ~May 2027; override with GOOGLE_ADS_API_VERSION.
export const GOOGLE_ADS_API = process.env.GOOGLE_ADS_API_VERSION?.trim() || "v24";

export type GoogleAdsEnv = {
  clientId: string;
  clientSecret: string;
  developerToken: string;
};

export function googleAdsEnv(): GoogleAdsEnv | null {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET?.trim();
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim();
  if (!clientId || !clientSecret || !developerToken) return null;
  return { clientId, clientSecret, developerToken };
}

export function googleAdsConfigured() {
  return Boolean(googleAdsEnv());
}

export function googleAdsRedirectUri() {
  return `${getAppUrl()}/api/ads/google/callback`;
}

function stateSecret() {
  return (
    process.env.INTEGRATIONS_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "quotebuilder-ads"
  );
}

export function signOAuthState(payload: { orgId: string; userId: string; ts: number }) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function readOAuthState(state: string) {
  const [body, mac] = state.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      orgId?: string;
      userId?: string;
      ts?: number;
    };
    if (!parsed.orgId || !parsed.userId || !parsed.ts) return null;
    if (Date.now() - parsed.ts > 30 * 60 * 1000) return null;
    return { orgId: parsed.orgId, userId: parsed.userId, ts: parsed.ts };
  } catch {
    return null;
  }
}

export function oauthAuthorizeUrl(state: string) {
  const env = googleAdsEnv();
  if (!env) throw new Error("Google Ads n’est pas configuré sur l’instance.");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.clientId);
  url.searchParams.set("redirect_uri", googleAdsRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_ADS_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", state);
  return url.toString();
}

export type GoogleTokenSet = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

export async function exchangeCode(code: string): Promise<GoogleTokenSet> {
  const env = googleAdsEnv();
  if (!env) throw new Error("Google Ads n’est pas configuré sur l’instance.");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.clientId,
      client_secret: env.clientSecret,
      redirect_uri: googleAdsRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  const data = (await res.json()) as GoogleTokenSet & { error?: string; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Échange OAuth Google impossible.");
  }
  return data;
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenSet> {
  const env = googleAdsEnv();
  if (!env) throw new Error("Google Ads n’est pas configuré sur l’instance.");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: env.clientId,
      client_secret: env.clientSecret,
      grant_type: "refresh_token",
    }),
  });
  const data = (await res.json()) as GoogleTokenSet & { error?: string; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Refresh token Google Ads invalide.");
  }
  return data;
}

export function encryptRefreshToken(token: string) {
  return encryptSecret(token);
}

export function decryptRefreshToken(stored: string) {
  return decryptSecret(stored);
}

export type AdsConnectionSettings = {
  quoteActionResource?: string;
  wonActionResource?: string;
  /** Manager account id sent as login-customer-id when the client is reached through an MCC. */
  loginCustomerId?: string;
};

export function parseAdsSettings(raw: unknown): AdsConnectionSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const row = raw as Record<string, unknown>;
  return {
    quoteActionResource: typeof row.quoteActionResource === "string" ? row.quoteActionResource : undefined,
    wonActionResource: typeof row.wonActionResource === "string" ? row.wonActionResource : undefined,
    loginCustomerId:
      typeof row.loginCustomerId === "string" && row.loginCustomerId ? digits(row.loginCustomerId) : undefined,
  };
}

type AdsJson = Record<string, unknown>;

async function adsFetch(path: string, accessToken: string, init?: RequestInit & { loginCustomerId?: string | null }) {
  const env = googleAdsEnv();
  if (!env) throw new Error("Google Ads n’est pas configuré sur l’instance.");
  const { loginCustomerId, ...rest } = init ?? {};
  const res = await fetch(`https://googleads.googleapis.com/${GOOGLE_ADS_API}/${path}`, {
    ...rest,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "developer-token": env.developerToken,
      "content-type": "application/json",
      ...(loginCustomerId ? { "login-customer-id": digits(loginCustomerId) } : {}),
      ...(rest.headers ?? {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as AdsJson;
  if (!res.ok) {
    const err = data.error;
    const message =
      err && typeof err === "object" && "message" in err && typeof err.message === "string"
        ? err.message
        : `Google Ads API ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export type { AdsCustomer };

function digits(resource: string) {
  return resource.replace(/[^0-9]/g, "");
}

/** Accessible accounts; managers are replaced by their client accounts (with loginCustomerId). */
export async function listAccessibleCustomers(accessToken: string): Promise<AdsCustomer[]> {
  const data = await adsFetch("customers:listAccessibleCustomers", accessToken);
  const names = Array.isArray(data.resourceNames) ? data.resourceNames.filter((n): n is string => typeof n === "string") : [];
  const direct: AdsCustomer[] = [];
  const viaManagers: AdsCustomer[][] = [];
  for (const resource of names) {
    const id = digits(resource);
    if (!id) continue;
    let name = `Compte ${id}`;
    let manager = false;
    try {
      const search = await searchAds(
        accessToken,
        id,
        "SELECT customer.id, customer.descriptive_name, customer.manager FROM customer LIMIT 1",
      );
      const row = search[0]?.customer as AdsJson | undefined;
      if (typeof row?.descriptiveName === "string" && row.descriptiveName) name = row.descriptiveName;
      manager = row?.manager === true;
    } catch {
      // Not readable directly (cancelled, no access): still listed.
    }
    if (!manager) {
      direct.push({ id, name });
      continue;
    }
    try {
      const rows = await searchAds(
        accessToken,
        id,
        `SELECT customer_client.id, customer_client.descriptive_name, customer_client.manager, customer_client.level, customer_client.status
         FROM customer_client
         WHERE customer_client.manager = false
           AND customer_client.status = 'ENABLED'`,
        id,
      );
      viaManagers.push(parseCustomerClients(rows, id));
    } catch {
      // Manager without readable children: nothing to upload to.
    }
  }
  return mergeCustomers([direct, ...viaManagers]);
}

export async function searchAds(accessToken: string, customerId: string, query: string, loginCustomerId?: string | null) {
  const data = await adsFetch(`customers/${customerId}/googleAds:search`, accessToken, {
    method: "POST",
    body: JSON.stringify({ query }),
    loginCustomerId,
  });
  return Array.isArray(data.results) ? (data.results as AdsJson[]) : [];
}

export type AdsCampaignDay = {
  campaignId: string;
  campaignName: string;
  date: string;
  impressions: number;
  clicks: number;
  costMicros: number;
};

export async function fetchCampaignPerformance(
  accessToken: string,
  customerId: string,
  from: string,
  to: string,
  loginCustomerId?: string | null,
): Promise<AdsCampaignDay[]> {
  const results = await searchAds(
    accessToken,
    customerId,
    `SELECT campaign.id, campaign.name, segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros
     FROM campaign
     WHERE segments.date BETWEEN '${from}' AND '${to}'
       AND campaign.status != 'REMOVED'`,
    loginCustomerId,
  );
  return results.map((row) => {
    const campaign = (row.campaign ?? {}) as AdsJson;
    const metrics = (row.metrics ?? {}) as AdsJson;
    const segments = (row.segments ?? {}) as AdsJson;
    return {
      campaignId: String(campaign.id ?? ""),
      campaignName: typeof campaign.name === "string" ? campaign.name : "Campagne",
      date: typeof segments.date === "string" ? segments.date : from,
      impressions: Number(metrics.impressions ?? 0),
      clicks: Number(metrics.clicks ?? 0),
      costMicros: Number(metrics.costMicros ?? 0),
    };
  });
}

export const QUOTE_ACTION_NAME = "QuoteBuilder — Devis soumis";
export const WON_ACTION_NAME = "QuoteBuilder — Affaire gagnée";

async function mutateConversionAction(
  accessToken: string,
  customerId: string,
  name: string,
  category: string,
  loginCustomerId?: string | null,
) {
  const data = await adsFetch(`customers/${customerId}/conversionActions:mutate`, accessToken, {
    method: "POST",
    body: JSON.stringify({
      operations: [
        {
          create: {
            name,
            type: "UPLOAD_CLICKS",
            category,
            status: "ENABLED",
            viewThroughLookbackWindowDays: "1",
            clickThroughLookbackWindowDays: "90",
          },
        },
      ],
    }),
    loginCustomerId,
  });
  const results = Array.isArray(data.results) ? (data.results as AdsJson[]) : [];
  const resource = results[0]?.resourceName;
  return typeof resource === "string" ? resource : null;
}

/** Existing QuoteBuilder upload actions, by name (suffixed copies included). */
async function findConversionActions(accessToken: string, customerId: string, loginCustomerId?: string | null) {
  const rows = await searchAds(
    accessToken,
    customerId,
    `SELECT conversion_action.resource_name, conversion_action.name, conversion_action.status
     FROM conversion_action
     WHERE conversion_action.name LIKE 'QuoteBuilder — %'
       AND conversion_action.status != 'REMOVED'`,
    loginCustomerId,
  );
  const byName = new Map<string, string>();
  for (const row of rows) {
    const action = (row.conversionAction ?? {}) as AdsJson;
    if (typeof action.name === "string" && typeof action.resourceName === "string") {
      byName.set(action.name, action.resourceName);
    }
  }
  const pick = (base: string) => {
    if (byName.has(base)) return byName.get(base);
    for (const [name, resource] of byName) if (name.startsWith(`${base} (`)) return resource;
    return undefined;
  };
  return { quote: pick(QUOTE_ACTION_NAME), won: pick(WON_ACTION_NAME) };
}

async function createConversionAction(
  accessToken: string,
  customerId: string,
  name: string,
  category: string,
  loginCustomerId?: string | null,
) {
  try {
    const created = await mutateConversionAction(accessToken, customerId, name, category, loginCustomerId);
    if (created) return created;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/already exists|DUPLICATE/i.test(message)) throw error;
    // Name held by a removed action: create a dated copy instead.
    const dated = `${name} (${new Date().toISOString().slice(0, 10)})`;
    const created = await mutateConversionAction(accessToken, customerId, dated, category, loginCustomerId);
    if (created) return created;
  }
  throw new Error(`Action de conversion Google Ads « ${name} » introuvable et impossible à créer.`);
}

/**
 * Resolves both upload actions for the customer: stored resource if it belongs to this
 * customer, else an existing action found by name, else a new one. Throws rather than
 * returning empty resources.
 */
export async function ensureConversionActions(
  accessToken: string,
  customerId: string,
  existing: AdsConnectionSettings,
  loginCustomerId: string | null | undefined = existing.loginCustomerId,
): Promise<AdsConnectionSettings> {
  const next: AdsConnectionSettings = { ...existing, loginCustomerId: loginCustomerId || undefined };
  if (!resourceBelongsTo(next.quoteActionResource, customerId)) next.quoteActionResource = undefined;
  if (!resourceBelongsTo(next.wonActionResource, customerId)) next.wonActionResource = undefined;
  if (next.quoteActionResource && next.wonActionResource) return next;

  const found = await findConversionActions(accessToken, customerId, loginCustomerId);
  next.quoteActionResource ??= found.quote;
  next.wonActionResource ??= found.won;
  next.quoteActionResource ??= await createConversionAction(
    accessToken,
    customerId,
    QUOTE_ACTION_NAME,
    "SUBMIT_LEAD_FORM",
    loginCustomerId,
  );
  next.wonActionResource ??= await createConversionAction(
    accessToken,
    customerId,
    WON_ACTION_NAME,
    "CONVERTED_LEAD",
    loginCustomerId,
  );
  return next;
}

export async function uploadClickConversion(input: {
  accessToken: string;
  customerId: string;
  loginCustomerId?: string | null;
  conversionAction: string;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  conversionDateTime: string;
  value?: AdsConversionValue | null;
  consentAds?: boolean | null;
  hashedEmail?: string | null;
}) {
  const conversion: AdsJson = {
    conversionAction: input.conversionAction,
    conversionDateTime: input.conversionDateTime,
  };
  if (input.value && input.value.value > 0) {
    conversion.conversionValue = input.value.value;
    conversion.currencyCode = input.value.currency;
  }
  if (input.gclid) conversion.gclid = input.gclid;
  else if (input.gbraid) conversion.gbraid = input.gbraid;
  else if (input.wbraid) conversion.wbraid = input.wbraid;
  else throw new Error("Pas de gclid à envoyer.");
  if (input.hashedEmail && /^[a-f0-9]{64}$/.test(input.hashedEmail)) {
    conversion.userIdentifiers = [{ hashedEmail: input.hashedEmail }];
  }
  const consent = adsConsent(input.consentAds);
  if (consent) conversion.consent = consent;

  const data = await adsFetch(`customers/${input.customerId}:uploadClickConversions`, input.accessToken, {
    method: "POST",
    body: JSON.stringify({
      conversions: [conversion],
      partialFailure: true,
    }),
    loginCustomerId: input.loginCustomerId,
  });
  const [outcome] = parseUploadResults(data, 1);
  if (outcome && !outcome.ok) throw new Error(outcome.error);
}

export function adsDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const hh = pad(Math.floor(abs / 60));
  const mm = pad(abs % 60);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${hh}:${mm}`;
}
