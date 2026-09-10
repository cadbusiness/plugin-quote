import type { Json } from "@/lib/db/database.types";
import { parseBlocks } from "@/lib/shops/blocks";
import type {
  ShopGeo,
  ShopLegal,
  ShopNavDraft,
  ShopNavLocation,
  ShopPageDraft,
  ShopPageKind,
  ShopPageSeo,
  ShopSeo,
  ShopStatus,
  ShopTheme,
} from "@/lib/shops/types";
import { SHOP_NAV_LOCATIONS, SHOP_PAGE_KINDS, SHOP_STATUSES } from "@/lib/shops/types";

function obj(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export const DEFAULT_THEME: ShopTheme = {
  accent: "#E85D04",
  background: "#FFFFFF",
  text: "#1A1510",
};

export const DEFAULT_GEO: ShopGeo = {
  locality: "",
  region: "",
  country: "FR",
  postalCode: "",
};

export function parseTheme(value: unknown): ShopTheme {
  const raw = obj(value);
  return {
    accent: str(raw.accent, DEFAULT_THEME.accent) || DEFAULT_THEME.accent,
    background: str(raw.background, DEFAULT_THEME.background) || DEFAULT_THEME.background,
    text: str(raw.text, DEFAULT_THEME.text) || DEFAULT_THEME.text,
    seedPrompt: str(raw.seedPrompt) || undefined,
  };
}

export function parseGeo(value: unknown): ShopGeo {
  const raw = obj(value);
  return {
    locality: str(raw.locality, DEFAULT_GEO.locality),
    region: str(raw.region, DEFAULT_GEO.region),
    country: str(raw.country, DEFAULT_GEO.country) || "FR",
    postalCode: str(raw.postalCode, DEFAULT_GEO.postalCode),
  };
}

export function parseSeo(value: unknown, fallbackTitle = ""): ShopSeo {
  const raw = obj(value);
  return {
    title: str(raw.title, fallbackTitle) || fallbackTitle,
    description: str(raw.description),
    language: str(raw.language, "fr-FR") || "fr-FR",
    geo: parseGeo(raw.geo),
  };
}

export function parseLegal(value: unknown): ShopLegal {
  const raw = obj(value);
  return {
    company: str(raw.company),
    siret: str(raw.siret),
    address: str(raw.address),
    city: str(raw.city),
    postalCode: str(raw.postalCode),
    email: str(raw.email),
    phone: str(raw.phone),
    director: str(raw.director),
  };
}

export function parsePageSeo(value: unknown, fallbackTitle = ""): ShopPageSeo {
  const raw = obj(value);
  return {
    title: str(raw.title, fallbackTitle) || fallbackTitle,
    description: str(raw.description),
    noindex: raw.noindex === true,
  };
}

export function parseStatus(value: unknown): ShopStatus {
  return SHOP_STATUSES.includes(value as ShopStatus) ? (value as ShopStatus) : "draft";
}

export function parsePageKind(value: unknown): ShopPageKind {
  return SHOP_PAGE_KINDS.includes(value as ShopPageKind) ? (value as ShopPageKind) : "custom";
}

export function parseNavLocation(value: unknown): ShopNavLocation {
  return SHOP_NAV_LOCATIONS.includes(value as ShopNavLocation) ? (value as ShopNavLocation) : "header";
}

export function pageFromRow(row: {
  kind: string;
  slug: string;
  title: string;
  seo: Json;
  blocks: Json;
  is_published: boolean;
  sort_order: number;
}): ShopPageDraft {
  return {
    kind: parsePageKind(row.kind),
    slug: row.slug,
    title: row.title,
    seo: parsePageSeo(row.seo, row.title),
    blocks: parseBlocks(row.blocks),
    isPublished: row.is_published,
    sortOrder: row.sort_order,
  };
}

export function navFromRow(row: {
  location: string;
  label: string;
  href: string;
  sort_order: number;
}): ShopNavDraft {
  return {
    location: parseNavLocation(row.location),
    label: row.label,
    href: row.href,
    sortOrder: row.sort_order,
  };
}
