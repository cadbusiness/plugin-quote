export type Attribution = {
  visitorId?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  landingPath?: string | null;
};

const SOCIAL = new Set([
  "facebook",
  "fb",
  "instagram",
  "ig",
  "linkedin",
  "tiktok",
  "twitter",
  "x",
  "pinterest",
  "youtube",
  "snapchat",
]);

const PAID = new Set(["cpc", "ppc", "paid", "ads", "display", "cpm", "paidsearch", "paidsocial"]);

function clean(value: string | null | undefined) {
  const v = value?.trim();
  return v ? v.slice(0, 200) : null;
}

export function parseAttribution(input: {
  search?: string | URLSearchParams | null;
  referrer?: string | null;
  landingPath?: string | null;
  visitorId?: string | null;
}): Attribution {
  const params =
    typeof input.search === "string"
      ? new URLSearchParams(input.search.startsWith("?") ? input.search : `?${input.search}`)
      : (input.search ?? new URLSearchParams());

  let utmSource = clean(params.get("utm_source"));
  let utmMedium = clean(params.get("utm_medium"));
  const gclid = clean(params.get("gclid") ?? params.get("wbraid") ?? params.get("gbraid"));
  if (gclid && !utmSource) {
    utmSource = "google";
    utmMedium = utmMedium ?? "cpc";
  }
  if (clean(params.get("fbclid")) && !utmSource) {
    utmSource = "facebook";
    utmMedium = utmMedium ?? "paid";
  }

  return {
    visitorId: clean(input.visitorId),
    utmSource,
    utmMedium,
    utmCampaign: clean(params.get("utm_campaign")),
    utmContent: clean(params.get("utm_content")),
    utmTerm: clean(params.get("utm_term")),
    referrer: clean(input.referrer),
    landingPath: clean(input.landingPath),
  };
}

export function attributionColumns(attr: Attribution) {
  return {
    visitor_id: attr.visitorId ?? null,
    utm_source: attr.utmSource ?? null,
    utm_medium: attr.utmMedium ?? null,
    utm_campaign: attr.utmCampaign ?? null,
    utm_content: attr.utmContent ?? null,
    utm_term: attr.utmTerm ?? null,
    referrer: attr.referrer ?? null,
    landing_path: attr.landingPath ?? null,
  };
}

export function attributionPayload(attr: Attribution) {
  return {
    utm_source: attr.utmSource ?? null,
    utm_medium: attr.utmMedium ?? null,
    utm_campaign: attr.utmCampaign ?? null,
    referrer: attr.referrer ?? null,
  };
}

function hostFromReferrer(referrer: string | null | undefined) {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function classifySource(input: {
  utmSource?: string | null;
  utmMedium?: string | null;
  referrer?: string | null;
}) {
  const source = (input.utmSource ?? "").trim().toLowerCase();
  const medium = (input.utmMedium ?? "").trim().toLowerCase();
  const host = hostFromReferrer(input.referrer);

  if (source.includes("google") && (PAID.has(medium) || source.includes("ads") || medium.includes("ad"))) {
    return "Google Ads";
  }
  if ((source === "google" || source === "adwords") && PAID.has(medium)) return "Google Ads";
  if (source === "google ads" || source === "googleads") return "Google Ads";

  if (SOCIAL.has(source) || (host && SOCIAL.has(host.split(".")[0] ?? ""))) {
    return "Réseaux sociaux";
  }

  if (source === "google" || source === "bing" || source === "organic" || medium === "organic") {
    return "Organique";
  }
  if (host && /google\.|bing\.|yahoo\.|duckduckgo\./.test(host) && !source) {
    return "Organique";
  }

  if (source && source !== "(direct)" && source !== "direct") {
    return source.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (host) {
    return host;
  }

  return "Direct";
}
