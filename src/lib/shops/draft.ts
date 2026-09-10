import { layoutJson, parseLayout } from "@/lib/shops/layout";
import { parseLegal, parseNavLocation, parsePageKind, parsePageSeo, parseSeo, parseStatus, parseTheme } from "@/lib/shops/parse";
import { asJson, type ShopDocument, type ShopLayout, type ShopLegal, type ShopNavDraft, type ShopPageSeo, type ShopSeo, type ShopTheme } from "@/lib/shops/types";

export type ShopEditorPage = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  seo: ShopPageSeo;
  blocks: ShopLayout;
  isPublished: boolean;
  sortOrder: number;
};

export type ShopEditorDraft = {
  name: string;
  status: string;
  theme: ShopTheme;
  seo: ShopSeo;
  legal: ShopLegal;
  pages: ShopEditorPage[];
  nav: ShopNavDraft[];
};

export function applyEditorDraft(doc: ShopDocument, draft: ShopEditorDraft) {
  if (draft.name.trim()) doc.shop.name = draft.name.trim();
  doc.shop.status = parseStatus(draft.status);
  doc.shop.theme = asJson(parseTheme(draft.theme));
  doc.shop.seo = asJson(parseSeo(draft.seo, doc.shop.name));
  doc.shop.legal = asJson(parseLegal(draft.legal));
  if (draft.pages.length) {
    const byId = new Map(doc.pages.map((page) => [page.id, page]));
    doc.pages = draft.pages.map((item, index) => {
      const existing = byId.get(item.id) ?? doc.pages[index] ?? doc.pages[0]!;
      return {
        ...existing,
        id: item.id || existing.id,
        slug: item.slug || existing.slug,
        title: item.title || existing.title,
        kind: parsePageKind(item.kind || existing.kind),
        seo: asJson(parsePageSeo(item.seo, item.title)),
        blocks: layoutJson(parseLayout(item.blocks)),
        is_published: item.isPublished !== false,
        sort_order: item.sortOrder,
        updated_at: new Date().toISOString(),
      };
    });
  }
  doc.nav = draft.nav.map((item, index) => ({
    id: `nav-${index}`,
    organization_id: doc.shop.organization_id,
    shop_id: doc.shop.id,
    location: parseNavLocation(item.location),
    label: item.label,
    href: item.href,
    sort_order: item.sortOrder ?? index,
    created_at: new Date().toISOString(),
  }));
}

export function serializeEditorDraft(doc: ShopDocument): ShopEditorDraft {
  return {
    name: doc.shop.name,
    status: doc.shop.status,
    theme: parseTheme(doc.shop.theme),
    seo: parseSeo(doc.shop.seo, doc.shop.name),
    legal: parseLegal(doc.shop.legal),
    pages: doc.pages.map((page) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      kind: page.kind,
      seo: parsePageSeo(page.seo, page.title),
      blocks: parseLayout(page.blocks),
      isPublished: page.is_published,
      sortOrder: page.sort_order,
    })),
    nav: doc.nav.map((item) => ({
      location: parseNavLocation(item.location),
      label: item.label,
      href: item.href,
      sortOrder: item.sort_order,
    })),
  };
}
