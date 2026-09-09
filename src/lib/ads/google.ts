import { createHmac, timingSafeEqual } from "node:crypto";
import { getAppUrl } from "@/lib/supabase/env";
import { encryptSecret, decryptSecret } from "@/lib/integrations/secrets";

export const GOOGLE_ADS_SCOPE = "https://www.googleapis.com/auth/adwords";
export const GOOGLE_ADS_API = process.env.GOOGLE_ADS_API_VERSION?.trim() || "v19";

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
};

export function parseAdsSettings(raw: unknown): AdsConnectionSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const row = raw as Record<string, unknown>;
  return {
    quoteActionResource: typeof row.quoteActionResource === "string" ? row.quoteActionResource : undefined,
    wonActionResource: typeof row.wonActionResource === "string" ? row.wonActionResource : undefined,
  };
}

type AdsJson = Record<string, unknown>;

async function adsFetch(path: string, accessToken: string, init?: RequestInit) {
  const env = googleAdsEnv();
  if (!env) throw new Error("Google Ads n’est pas configuré sur l’instance.");
  const res = await fetch(`https://googleads.googleapis.com/${GOOGLE_ADS_API}/${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "developer-token": env.developerToken,
      "content-type": "application/json",
      ...(init?.headers ?? {}),
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

export type AdsCustomer = { id: string; name: string };

function digits(resource: string) {
  return resource.replace(/[^0-9]/g, "");
}

export async function listAccessibleCustomers(accessToken: string): Promise<AdsCustomer[]> {
  const data = await adsFetch("customers:listAccessibleCustomers", accessToken);
  const names = Array.isArray(data.resourceNames) ? data.resourceNames.filter((n): n is string => typeof n === "string") : [];
  const customers: AdsCustomer[] = [];
  for (const resource of names) {
    const id = digits(resource);
    if (!id) continue;
    try {
      const search = await searchAds(accessToken, id, "SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1");
      const row = search[0]?.customer as AdsJson | undefined;
      customers.push({
        id,
        name: typeof row?.descriptiveName === "string" && row.descriptiveName ? row.descriptiveName : `Compte ${id}`,
      });
    } catch {
      customers.push({ id, name: `Compte ${id}` });
    }
  }
  return customers;
}

export async function searchAds(accessToken: string, customerId: string, query: string) {
  const data = await adsFetch(`customers/${customerId}/googleAds:search`, accessToken, {
    method: "POST",
    body: JSON.stringify({ query }),
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
): Promise<AdsCampaignDay[]> {
  const results = await searchAds(
    accessToken,
    customerId,
    `SELECT campaign.id, campaign.name, segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros
     FROM campaign
     WHERE segments.date BETWEEN '${from}' AND '${to}'
       AND campaign.status != 'REMOVED'`,
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

async function mutateConversionAction(
  accessToken: string,
  customerId: string,
  name: string,
  category: string,
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
  });
  const results = Array.isArray(data.results) ? (data.results as AdsJson[]) : [];
  const resource = results[0]?.resourceName;
  return typeof resource === "string" ? resource : null;
}

export async function ensureConversionActions(accessToken: string, customerId: string, existing: AdsConnectionSettings) {
  const next = { ...existing };
  if (!next.quoteActionResource) {
    try {
      next.quoteActionResource =
        (await mutateConversionAction(accessToken, customerId, "QuoteBuilder — Devis soumis", "SUBMIT_LEAD_FORM")) ??
        undefined;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!/already exists|DUPLICATE/i.test(message)) throw error;
    }
  }
  if (!next.wonActionResource) {
    try {
      next.wonActionResource =
        (await mutateConversionAction(accessToken, customerId, "QuoteBuilder — Affaire gagnée", "CONVERTED_LEAD")) ??
        undefined;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!/already exists|DUPLICATE/i.test(message)) throw error;
    }
  }
  return next;
}

export async function uploadClickConversion(input: {
  accessToken: string;
  customerId: string;
  conversionAction: string;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  conversionDateTime: string;
  value?: number | null;
}) {
  const conversion: AdsJson = {
    conversionAction: input.conversionAction,
    conversionDateTime: input.conversionDateTime,
    currencyCode: "EUR",
  };
  if (input.value && input.value > 0) conversion.conversionValue = input.value;
  if (input.gclid) conversion.gclid = input.gclid;
  else if (input.gbraid) conversion.gbraid = input.gbraid;
  else if (input.wbraid) conversion.wbraid = input.wbraid;
  else throw new Error("Pas de gclid à envoyer.");

  await adsFetch(`customers/${input.customerId}:uploadClickConversions`, input.accessToken, {
    method: "POST",
    body: JSON.stringify({
      conversions: [conversion],
      partialFailure: true,
    }),
  });
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
