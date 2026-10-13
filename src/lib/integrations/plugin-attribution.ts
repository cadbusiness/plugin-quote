import { attributionColumns, parseAttribution, type Attribution } from "@/lib/stats/attribution";

/** Same params as the hosted widget (widget.js), plus msclkid. */
export const PLUGIN_ATTRIBUTION_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
] as const;

export const PLUGIN_DEFAULT_SOURCE = "wordpress";
export const PLUGIN_DEFAULT_MEDIUM = "plugin";

type Param = (typeof PLUGIN_ATTRIBUTION_PARAMS)[number];

export type PluginAttributionInput = Partial<Record<Param, string>> & {
  landing?: string;
  referrer?: string;
  first_seen?: string;
};

/** Not stored in quote columns. Kept under extracted_params.attribution. */
export type PluginAttributionExtras = {
  fbclid?: string;
  msclkid?: string;
  landing?: string;
  first_seen?: string;
};

export type ResolvedPluginAttribution = {
  /** False when the plugin sent nothing usable: the quote is tagged wordpress / plugin. */
  present: boolean;
  attribution: Attribution;
  extras: PluginAttributionExtras;
};

function clean(value: unknown, max: number): string {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
}

function cleanUrl(value: unknown): string {
  const text = clean(value, 500);
  return /^https?:\/\//i.test(text) ? text : "";
}

function cleanTime(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value < 1e12 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }
  const text = clean(value, 40);
  if (!text) return "";
  if (/^\d+$/.test(text)) return cleanTime(Number(text));
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

/** Allow-listed keys only. Accepts an object or its JSON string (form posts). */
export function parsePluginAttribution(raw: unknown): PluginAttributionInput {
  let source = raw;
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return {};
    }
  }
  if (!source || typeof source !== "object" || Array.isArray(source)) return {};
  const record = source as Record<string, unknown>;
  const out: PluginAttributionInput = {};
  for (const key of PLUGIN_ATTRIBUTION_PARAMS) {
    const value = clean(record[key], 255);
    if (value) out[key] = value;
  }
  const landing = cleanUrl(record.landing ?? record.landing_page ?? record.landingPath);
  if (landing) out.landing = landing;
  const referrer = cleanUrl(record.referrer);
  if (referrer) out.referrer = referrer;
  const firstSeen = cleanTime(record.first_seen ?? record.firstSeen);
  if (firstSeen) out.first_seen = firstSeen;
  return out;
}

function sameHost(a: string, b: string) {
  try {
    return new URL(a).hostname.replace(/^www\./, "") === new URL(b).hostname.replace(/^www\./, "");
  } catch {
    return false;
  }
}

/**
 * Plugin body → session / quote attribution.
 * Nothing usable keeps the historical wordpress / plugin tag. A click ID without
 * utm_source becomes google / cpc (gclid, gbraid, wbraid), facebook / paid, bing / cpc.
 */
export function resolvePluginAttribution(body: unknown, page = ""): ResolvedPluginAttribution {
  const record = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  const input = parsePluginAttribution(record.attribution);
  const referrer = input.referrer && !(page && sameHost(input.referrer, page)) ? input.referrer : "";
  const hasParam = PLUGIN_ATTRIBUTION_PARAMS.some((key) => Boolean(input[key]));

  const extras: PluginAttributionExtras = {};
  if (input.fbclid) extras.fbclid = input.fbclid;
  if (input.msclkid) extras.msclkid = input.msclkid;
  if (input.landing) extras.landing = input.landing;
  if (input.first_seen) extras.first_seen = input.first_seen;

  if (!hasParam && !referrer) {
    return {
      present: false,
      attribution: {
        utmSource: PLUGIN_DEFAULT_SOURCE,
        utmMedium: PLUGIN_DEFAULT_MEDIUM,
        referrer: page || null,
        landingPath: input.landing || page || null,
      },
      extras,
    };
  }

  const params = new URLSearchParams();
  for (const key of PLUGIN_ATTRIBUTION_PARAMS) {
    const value = input[key];
    if (value) params.set(key, value);
  }
  const attribution = parseAttribution({
    search: params,
    referrer: referrer || null,
    landingPath: input.landing || page || null,
  });
  if (input.msclkid && !attribution.utmSource) {
    attribution.utmSource = "bing";
    attribution.utmMedium = attribution.utmMedium ?? "cpc";
  }
  delete attribution.visitorId;
  return { present: true, attribution, extras };
}

/** quotes has no landing_path column. */
export function pluginQuoteAttributionColumns(attr: Attribution) {
  const { visitor_id: _visitor, landing_path: _landing, ...columns } = attributionColumns(attr);
  return columns;
}

export function hasPluginAttributionExtras(extras: PluginAttributionExtras) {
  return Object.keys(extras).length > 0;
}
