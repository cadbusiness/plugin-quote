import type { Json, Tables } from "@/lib/db/database.types";
import type { FunnelFamilyId } from "@/lib/funnels/families";

export const SHOP_STATUSES = ["draft", "published", "archived"] as const;
export type ShopStatus = (typeof SHOP_STATUSES)[number];

export const SHOP_PAGE_KINDS = ["home", "catalog", "legal", "custom"] as const;
export type ShopPageKind = (typeof SHOP_PAGE_KINDS)[number];

export const SHOP_NAV_LOCATIONS = ["header", "footer"] as const;
export type ShopNavLocation = (typeof SHOP_NAV_LOCATIONS)[number];

export type ShopTheme = {
  accent: string;
  background: string;
  text: string;
  seedPrompt?: string;
  templateId?: string;
};

export type ShopGeo = {
  locality: string;
  region: string;
  country: string;
  postalCode: string;
};

export type ShopSeo = {
  title: string;
  description: string;
  language: string;
  geo: ShopGeo;
};

export type ShopLegal = {
  company: string;
  siret: string;
  address: string;
  city: string;
  postalCode: string;
  email: string;
  phone: string;
  director: string;
};

export type ShopFaqItem = { q: string; a: string };
export type ShopFeatureItem = { title: string; text: string };

export type ShopBlockType =
  | "hero"
  | "text"
  | "image"
  | "categories"
  | "catalog"
  | "quote_cta"
  | "faq"
  | "features"
  | "legal";

export type ShopBlock = {
  id: string;
  type: ShopBlockType;
  heading?: string;
  sub?: string;
  text?: string;
  image?: string;
  imageAlt?: string;
  ctaLabel?: string;
  category?: string;
  limit?: number;
  faq?: ShopFaqItem[];
  features?: ShopFeatureItem[];
};

export type ShopPageSeo = {
  title: string;
  description: string;
  noindex: boolean;
};

export type ShopNodeTypeName =
  | "Section"
  | "Columns"
  | "Heading"
  | "Text"
  | "Image"
  | "Button"
  | "Hero"
  | "Catalog"
  | "Categories"
  | "QuoteCta"
  | "Faq"
  | "Features"
  | "Legal";

export type ShopNode = {
  type: ShopNodeTypeName;
  props: Record<string, unknown> & { id: string };
};

export type ShopLayout = {
  root: { props: Record<string, unknown> };
  content: ShopNode[];
};

export type ShopPageDraft = {
  kind: ShopPageKind;
  slug: string;
  title: string;
  seo: ShopPageSeo;
  blocks: ShopLayout;
  isPublished: boolean;
  sortOrder: number;
};

export type ShopNavDraft = {
  location: ShopNavLocation;
  label: string;
  href: string;
  sortOrder: number;
};

export type ShopBlueprint = {
  name: string;
  sector: FunnelFamilyId;
  theme: ShopTheme;
  seo: ShopSeo;
  legal: ShopLegal;
  pages: ShopPageDraft[];
  nav: ShopNavDraft[];
};

export type ShopRecord = Tables<"shops">;
export type ShopPageRecord = Tables<"shop_pages">;
export type ShopNavRecord = Tables<"shop_nav_items">;

export type ShopDocument = {
  shop: ShopRecord;
  pages: ShopPageRecord[];
  nav: ShopNavRecord[];
};

export type ShopProduct = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  category: string | null;
  sku: string | null;
};

export type StorefrontModel = {
  orgSlug: string;
  shopSlug: string;
  shopName: string;
  funnelSlug: string | null;
  theme: ShopTheme;
  legal: ShopLegal;
  nav: ShopNavDraft[];
  products: ShopProduct[];
  jsonLd?: unknown[];
};

export function asJson<T>(value: T): Json {
  return value as unknown as Json;
}
