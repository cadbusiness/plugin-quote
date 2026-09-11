import { getFunnelFamily } from "@/lib/funnels/families";
import { slugify } from "@/lib/org/slug";
import { newBlockId } from "@/lib/shops/blocks";
import {
  emptyNode,
  insertNode,
  layoutJson,
  moveNode,
  parseLayout,
  replaceLegalText,
  summarizeLayout,
  updateNode,
  deleteNode,
} from "@/lib/shops/layout";
import { cgvBody, cookiesBody, LEGAL_SLUGS, mentionsLegalesBody, privacyBody } from "@/lib/shops/legal";
import { parseLegal, parseNavLocation, parsePageKind, parseSeo, parseTheme } from "@/lib/shops/parse";
import { shopPlaceholders } from "@/lib/shops/placeholders";
import { asJson, type ShopDocument, type ShopLayout } from "@/lib/shops/types";

export type ShopOpResult = { ok: true; summary: string } | { ok: false; error: string };

function pageBySlug(doc: ShopDocument, slug: string) {
  return doc.pages.find((page) => page.slug === slug) ?? null;
}

function pageLayout(doc: ShopDocument, slug: string): ShopLayout | null {
  const page = pageBySlug(doc, slug);
  if (!page) return null;
  return parseLayout(page.blocks);
}

function setPageLayout(doc: ShopDocument, slug: string, layout: ShopLayout) {
  const page = pageBySlug(doc, slug);
  if (!page) return false;
  page.blocks = layoutJson(layout);
  page.updated_at = new Date().toISOString();
  return true;
}

function nodeProps(input: Record<string, unknown>) {
  const props: Record<string, unknown> = {};
  for (const key of [
    "heading",
    "sub",
    "text",
    "label",
    "href",
    "image",
    "imageAlt",
    "ctaLabel",
    "category",
    "level",
    "count",
    "padding",
    "background",
    "color",
  ]) {
    if (typeof input[key] === "string") props[key] = input[key];
  }
  if (typeof input.limit === "number") props.limit = input.limit;
  if (Array.isArray(input.faq)) props.faq = input.faq;
  if (Array.isArray(input.features)) props.features = input.features;
  return props;
}

function refreshLegalPages(doc: ShopDocument) {
  const legal = parseLegal(doc.shop.legal);
  const name = doc.shop.name;
  const bodies: Record<string, string> = {
    [LEGAL_SLUGS.mentions]: mentionsLegalesBody(legal, name),
    [LEGAL_SLUGS.cgv]: cgvBody(legal, name),
    [LEGAL_SLUGS.privacy]: privacyBody(legal, name),
    [LEGAL_SLUGS.cookies]: cookiesBody(legal, name),
  };
  for (const page of doc.pages) {
    const body = bodies[page.slug];
    if (!body) continue;
    setPageLayout(doc, page.slug, replaceLegalText(parseLayout(page.blocks), page.title, body));
  }
}

export function shopSnapshot(doc: ShopDocument) {
  const theme = parseTheme(doc.shop.theme);
  const seo = parseSeo(doc.shop.seo, doc.shop.name);
  const legal = parseLegal(doc.shop.legal);
  const family = getFunnelFamily(doc.shop.sector);
  return {
    name: doc.shop.name,
    slug: doc.shop.slug,
    status: doc.shop.status,
    sector: doc.shop.sector,
    family: { id: family.id, label: family.label, blurb: family.blurb },
    placeholders: shopPlaceholders(family.id),
    theme,
    seo,
    legal,
    pages: doc.pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      kind: page.kind,
      seo: page.seo,
      tree: summarizeLayout(parseLayout(page.blocks)),
    })),
    nav: doc.nav.map((item) => ({
      location: item.location,
      label: item.label,
      href: item.href,
      sortOrder: item.sort_order,
    })),
  };
}

const LEGACY_TYPE: Record<string, string> = {
  hero: "Hero",
  text: "Text",
  image: "Image",
  categories: "Categories",
  catalog: "Catalog",
  quote_cta: "QuoteCta",
  faq: "Faq",
  features: "Features",
  legal: "Legal",
};

export function executeShopTool(doc: ShopDocument, name: string, input: Record<string, unknown>): ShopOpResult {
  if (name === "get_tree" || name === "get_shop") {
    const slug = typeof input.slug === "string" ? input.slug : "";
    if (slug) {
      const layout = pageLayout(doc, slug);
      if (!layout) return { ok: false, error: `Page ${slug} introuvable` };
      return { ok: true, summary: summarizeLayout(layout) };
    }
    return { ok: true, summary: JSON.stringify(shopSnapshot(doc)) };
  }

  if (name === "insert_node" || name === "add_block") {
    const slug = String(input.slug ?? "");
    const type = String(input.type ?? "");
    const layout = pageLayout(doc, slug);
    if (!layout) return { ok: false, error: `Page ${slug} introuvable` };
    const mappedType = LEGACY_TYPE[type] ?? type;
    const result = insertNode(layout, {
      type: mappedType,
      parentId: typeof input.parentId === "string" ? input.parentId : undefined,
      slot: typeof input.slot === "string" ? input.slot : undefined,
      index: typeof input.index === "number" ? input.index : undefined,
      afterId: typeof input.afterId === "string" ? input.afterId : undefined,
      props: nodeProps(input),
    });
    if (!result.ok) return result;
    setPageLayout(doc, slug, result.layout);
    return { ok: true, summary: `Nœud ${mappedType} ajouté sur ${slug} (${result.id})` };
  }

  if (name === "update_node" || name === "update_block") {
    const slug = String(input.slug ?? "");
    const id = String(input.id ?? "");
    const layout = pageLayout(doc, slug);
    if (!layout) return { ok: false, error: `Page ${slug} introuvable` };
    const result = updateNode(layout, id, nodeProps(input));
    if (!result.ok) return result;
    setPageLayout(doc, slug, result.layout);
    return { ok: true, summary: `Nœud ${id} mis à jour sur ${slug}` };
  }

  if (name === "delete_node" || name === "remove_block") {
    const slug = String(input.slug ?? "");
    const id = String(input.id ?? "");
    const layout = pageLayout(doc, slug);
    if (!layout) return { ok: false, error: `Page ${slug} introuvable` };
    const result = deleteNode(layout, id);
    if (!result.ok) return result;
    setPageLayout(doc, slug, result.layout);
    return { ok: true, summary: `Nœud ${id} retiré de ${slug}` };
  }

  if (name === "move_node" || name === "reorder_blocks") {
    const slug = String(input.slug ?? "");
    const id = String(input.id ?? "");
    const layout = pageLayout(doc, slug);
    if (!layout) return { ok: false, error: `Page ${slug} introuvable` };
    const result = moveNode(layout, {
      id,
      parentId: typeof input.parentId === "string" ? input.parentId : undefined,
      slot: typeof input.slot === "string" ? input.slot : undefined,
      index: typeof input.index === "number" ? input.index : undefined,
    });
    if (!result.ok) return result;
    setPageLayout(doc, slug, result.layout);
    return { ok: true, summary: `Nœud ${id} déplacé sur ${slug}` };
  }

  if (name === "set_page_seo") {
    const slug = String(input.slug ?? "");
    const page = pageBySlug(doc, slug);
    if (!page) return { ok: false, error: `Page ${slug} introuvable` };
    const seo = { ...(typeof page.seo === "object" && page.seo && !Array.isArray(page.seo) ? page.seo : {}) } as Record<
      string,
      unknown
    >;
    if (typeof input.title === "string") seo.title = input.title;
    if (typeof input.description === "string") seo.description = input.description;
    page.seo = asJson(seo);
    if (typeof input.title === "string" && input.title.trim()) page.title = input.title.trim();
    return { ok: true, summary: `SEO de ${slug} mis à jour` };
  }

  if (name === "set_theme") {
    const theme = parseTheme(doc.shop.theme);
    if (typeof input.accent === "string") theme.accent = input.accent;
    if (typeof input.background === "string") theme.background = input.background;
    if (typeof input.text === "string") theme.text = input.text;
    doc.shop.theme = asJson(theme);
    return { ok: true, summary: "Thème mis à jour" };
  }

  if (name === "set_seo") {
    const seo = parseSeo(doc.shop.seo, doc.shop.name);
    if (typeof input.title === "string") seo.title = input.title;
    if (typeof input.description === "string") seo.description = input.description;
    if (typeof input.locality === "string") seo.geo.locality = input.locality;
    if (typeof input.region === "string") seo.geo.region = input.region;
    doc.shop.seo = asJson(seo);
    return { ok: true, summary: "SEO global mis à jour" };
  }

  if (name === "set_legal") {
    const legal = parseLegal(doc.shop.legal);
    for (const key of ["company", "siret", "address", "city", "postalCode", "email", "phone", "director"] as const) {
      if (typeof input[key] === "string") legal[key] = input[key] as string;
    }
    doc.shop.legal = asJson(legal);
    if (input.refreshPages !== false) refreshLegalPages(doc);
    return { ok: true, summary: "Identité légale mise à jour" };
  }

  if (name === "add_page") {
    const title = String(input.title ?? "").trim();
    const rawSlug = slugify(String(input.slug ?? title));
    if (!title || !rawSlug) return { ok: false, error: "Titre et slug requis" };
    if (pageBySlug(doc, rawSlug)) return { ok: false, error: `La page ${rawSlug} existe déjà` };
    const kind = parsePageKind(input.kind ?? "custom");
    const text = typeof input.text === "string" ? input.text : "";
    const node = emptyNode(kind === "legal" ? "Legal" : "Text", { heading: title, text });
    doc.pages.push({
      id: newBlockId(),
      organization_id: doc.shop.organization_id,
      shop_id: doc.shop.id,
      kind,
      slug: rawSlug,
      title,
      seo: asJson({ title, description: "", noindex: false }),
      blocks: layoutJson({ root: { props: {} }, content: [node] }),
      is_published: true,
      sort_order: doc.pages.length + 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return { ok: true, summary: `Page ${rawSlug} créée` };
  }

  if (name === "set_nav") {
    const location = parseNavLocation(input.location);
    const items = Array.isArray(input.items) ? input.items : [];
    doc.nav = [
      ...doc.nav.filter((item) => item.location !== location),
      ...items
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
        .map((item, index) => ({
          id: newBlockId(),
          organization_id: doc.shop.organization_id,
          shop_id: doc.shop.id,
          location,
          label: String(item.label ?? ""),
          href: String(item.href ?? "/"),
          sort_order: index,
          created_at: new Date().toISOString(),
        })),
    ];
    return { ok: true, summary: `Menu ${location} mis à jour` };
  }

  if (name === "set_status") {
    const status = input.status === "published" ? "published" : "draft";
    doc.shop.status = status;
    doc.shop.published_at = status === "published" ? new Date().toISOString() : doc.shop.published_at;
    return { ok: true, summary: status === "published" ? "Boutique publiée" : "Boutique en brouillon" };
  }

  return { ok: false, error: `Outil inconnu: ${name}` };
}

/** First Chat IA turn (empty history) always leaves a public /b/… URL. */
export function ensureSeedTurnPublished(doc: ShopDocument, isSeedTurn: boolean) {
  if (!isSeedTurn) return false;
  if (doc.shop.status === "published") return false;
  executeShopTool(doc, "set_status", { status: "published" });
  return true;
}
