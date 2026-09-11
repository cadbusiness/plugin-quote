import { getFunnelFamily, type FunnelFamilyId } from "@/lib/funnels/families";
import type { ShopTheme } from "@/lib/shops/types";

export const SHOP_TEMPLATE_IDS = ["menuiserie", "skincare", "stock-b2b"] as const;
export type ShopTemplateId = (typeof SHOP_TEMPLATE_IDS)[number];

export type HomeBlockId =
  | "hero"
  | "features"
  | "proof"
  | "about"
  | "categories"
  | "catalog"
  | "process"
  | "faq"
  | "quote";

export const HOME_BLOCK_TYPE: Record<HomeBlockId, string> = {
  hero: "Hero",
  features: "Features",
  proof: "Section",
  about: "Section",
  categories: "Categories",
  catalog: "Catalog",
  process: "Section",
  faq: "Faq",
  quote: "QuoteCta",
};

export const DEFAULT_HOME_RHYTHM: readonly HomeBlockId[] = [
  "hero",
  "features",
  "proof",
  "about",
  "categories",
  "catalog",
  "process",
  "faq",
  "quote",
];

export type ShopSectorTemplate = {
  id: ShopTemplateId;
  family: FunnelFamilyId;
  label: string;
  blurb: string;
  tint: string;
  theme: ShopTheme;
  wash: string;
  heroPadding: string;
  rhythm: readonly HomeBlockId[];
  funnelTemplateId: string;
  catalogNavLabel: string;
};

export const SHOP_SECTOR_TEMPLATES: ShopSectorTemplate[] = [
  {
    id: "menuiserie",
    family: "habitat",
    label: "Menuiserie / habitat",
    blurb: "Atelier, essences, ouvrages sur devis — relevé, fabrication, pose.",
    tint: "bg-amber-50 text-amber-900 ring-amber-200",
    theme: { accent: "#B45309", background: "#FBF6F0", text: "#2A1B12" },
    wash: "#F3E6D4",
    heroPadding: "88px 0",
    rhythm: ["hero", "about", "features", "process", "categories", "catalog", "proof", "faq", "quote"],
    funnelTemplateId: "wood",
    catalogNavLabel: "Ouvrages",
  },
  {
    id: "skincare",
    family: "health",
    label: "Skincare / santé-bien-être",
    blurb: "Protocoles et rituels sur devis — bilan, actifs, rendez-vous.",
    tint: "bg-teal-50 text-teal-900 ring-teal-200",
    theme: { accent: "#0F766E", background: "#F6F3EF", text: "#1C1917" },
    wash: "#E8F0EE",
    heroPadding: "72px 0",
    rhythm: ["hero", "features", "categories", "catalog", "about", "process", "proof", "faq", "quote"],
    funnelTemplateId: "health_clinic",
    catalogNavLabel: "Rituels",
  },
  {
    id: "stock-b2b",
    family: "racking",
    label: "Stock B2B / rayonnage",
    blurb: "Travées, charge et allées — brief technique, calepinage, devis.",
    tint: "bg-orange-50 text-orange-900 ring-orange-200",
    theme: { accent: "#C2410C", background: "#F4F1EA", text: "#1A1510" },
    wash: "#EDE6D9",
    heroPadding: "80px 0",
    rhythm: ["hero", "proof", "features", "categories", "catalog", "process", "about", "faq", "quote"],
    funnelTemplateId: "racking_catalog",
    catalogNavLabel: "Gammes",
  },
];

const BY_ID = new Map(SHOP_SECTOR_TEMPLATES.map((item) => [item.id, item]));
const BY_FAMILY = new Map(SHOP_SECTOR_TEMPLATES.map((item) => [item.family, item]));

export function isShopTemplateId(value: string | null | undefined): value is ShopTemplateId {
  return Boolean(value && (SHOP_TEMPLATE_IDS as readonly string[]).includes(value));
}

export function getShopSectorTemplate(id: string | null | undefined): ShopSectorTemplate | null {
  if (!id) return null;
  return BY_ID.get(id as ShopTemplateId) ?? null;
}

export function featuredTemplateForFamily(family: string | null | undefined): ShopSectorTemplate | null {
  const resolved = getFunnelFamily(family).id;
  return BY_FAMILY.get(resolved) ?? null;
}

export function resolveShopSectorTemplate(
  templateId?: string | null,
  sector?: string | null,
): ShopSectorTemplate | null {
  return getShopSectorTemplate(templateId) ?? featuredTemplateForFamily(sector);
}

export function homeRhythmFor(sector: string, templateId?: string | null): readonly HomeBlockId[] {
  return resolveShopSectorTemplate(templateId, sector)?.rhythm ?? DEFAULT_HOME_RHYTHM;
}

export function homeTypeSequence(rhythm: readonly HomeBlockId[]): string[] {
  return rhythm.map((id) => HOME_BLOCK_TYPE[id]);
}

