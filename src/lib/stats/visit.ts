export type VisitDevice = "mobile" | "tablet" | "desktop";

export type VisitContext = {
  country: string | null;
  city: string | null;
  region: string | null;
  userAgent: string | null;
  device: VisitDevice | null;
};

const COUNTRY_NAMES: Record<string, string> = {
  FR: "France",
  BE: "Belgique",
  CH: "Suisse",
  LU: "Luxembourg",
  DE: "Allemagne",
  ES: "Espagne",
  IT: "Italie",
  PT: "Portugal",
  NL: "Pays-Bas",
  GB: "Royaume-Uni",
  IE: "Irlande",
  US: "États-Unis",
  CA: "Canada",
  MA: "Maroc",
  TN: "Tunisie",
  DZ: "Algérie",
  SN: "Sénégal",
  CI: "Côte d’Ivoire",
  AE: "Émirats",
  RE: "La Réunion",
  GP: "Guadeloupe",
  MQ: "Martinique",
  GF: "Guyane",
  YT: "Mayotte",
  PL: "Pologne",
  RO: "Roumanie",
  AT: "Autriche",
  SE: "Suède",
  NO: "Norvège",
  DK: "Danemark",
  FI: "Finlande",
  GR: "Grèce",
  CZ: "Tchéquie",
  HU: "Hongrie",
  BG: "Bulgarie",
  HR: "Croatie",
  SK: "Slovaquie",
  SI: "Slovénie",
  LT: "Lituanie",
  LV: "Lettonie",
  EE: "Estonie",
  BR: "Brésil",
  MX: "Mexique",
  AU: "Australie",
  JP: "Japon",
  CN: "Chine",
  IN: "Inde",
};

function headerText(value: string | null | undefined, max = 80) {
  const raw = value?.trim();
  if (!raw || raw === "XX" || raw === "T1" || raw === "A1") return null;
  try {
    return decodeURIComponent(raw).slice(0, max);
  } catch {
    return raw.slice(0, max);
  }
}

export function parseDevice(userAgent: string | null | undefined): VisitDevice | null {
  if (!userAgent) return null;
  if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent)) return "tablet";
  if (/Mobi|Android.+Mobile|iPhone|iPod|webOS|BlackBerry|IEMobile/i.test(userAgent)) return "mobile";
  return "desktop";
}

export function requestGeo(headers: Headers): Pick<VisitContext, "country" | "city" | "region"> {
  const country = headerText(
    headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || headers.get("x-country-code"),
    2,
  );
  return {
    country: country ? country.toUpperCase() : null,
    city: headerText(headers.get("x-vercel-ip-city") || headers.get("x-city")),
    region: headerText(headers.get("x-vercel-ip-country-region") || headers.get("x-region"), 12),
  };
}

export function visitFromRequest(req: Request): VisitContext {
  const geo = requestGeo(req.headers);
  const userAgent = headerText(req.headers.get("user-agent"), 300);
  return {
    country: geo.country,
    city: geo.city,
    region: geo.region,
    userAgent,
    device: parseDevice(userAgent),
  };
}

export function visitColumns(visit: VisitContext) {
  return {
    country: visit.country,
    city: visit.city,
    region: visit.region,
    user_agent: visit.userAgent,
    device: visit.device,
  };
}

export function visitPayload(visit: VisitContext) {
  return {
    country: visit.country,
    city: visit.city,
    device: visit.device,
  };
}

export function countryName(code: string | null | undefined) {
  if (!code) return null;
  const key = code.trim().toUpperCase();
  if (!key) return null;
  return COUNTRY_NAMES[key] ?? key;
}

export function deviceLabel(device: string | null | undefined) {
  if (device === "mobile") return "Mobile";
  if (device === "tablet") return "Tablette";
  if (device === "desktop") return "Ordinateur";
  return null;
}

export function formatVisitDuration(ms: number) {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  if (ms < 15_000) return "< 15 s";
  if (ms < 60_000) return `${Math.max(15, Math.round(ms / 1000))} s`;
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

export function formatVisitPlace(city: string | null | undefined, country: string | null | undefined) {
  const name = countryName(country);
  if (city && name) return `${city} · ${name}`;
  return city || name || null;
}

export function referrerHost(referrer: string | null | undefined) {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "") || null;
  } catch {
    return referrer.slice(0, 80);
  }
}

function humanizeSlug(slug: string) {
  const spaced = slug.replace(/[-_]+/g, " ").trim();
  if (!spaced) return "Page";
  return spaced.replace(/^(\p{L})/u, (char) => char.toUpperCase());
}

export function visitPageLabel(path: string | null | undefined) {
  if (!path) return "Page";
  const clean = path.split("?")[0] ?? path;
  if (/\/embed\//.test(clean)) return "Widget";
  if (/\/devis\/?$/.test(clean)) return "Demande de devis";
  if (/\/catalogue\/?$/.test(clean)) return "Catalogue";
  if (/\/p\//.test(clean)) return "Fiche produit";
  if (/\/c\/[^/]+\/[^/]+/.test(clean) && !clean.includes("/b/")) return "Configurateur";
  const parts = clean.split("/").filter(Boolean);
  if (parts[0] === "b") {
    const leaf = parts[3];
    if (!leaf) return "Accueil boutique";
    if (leaf === "catalogue") return "Catalogue";
    if (leaf === "devis") return "Demande de devis";
    if (leaf === "c") return "Catégorie";
    if (leaf === "p") return "Fiche produit";
    return humanizeSlug(leaf);
  }
  return "Page";
}
