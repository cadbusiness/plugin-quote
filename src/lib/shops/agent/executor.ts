import { slugify } from "@/lib/org/slug";
import { emptyBlock, isShopBlockType, newBlockId, parseBlock } from "@/lib/shops/blocks";
import { cgvBody, cookiesBody, LEGAL_SLUGS, mentionsLegalesBody, privacyBody } from "@/lib/shops/legal";
import { parseLegal, parseNavLocation, parsePageKind, parseSeo, parseTheme } from "@/lib/shops/parse";
import { asJson, type ShopBlock, type ShopDocument, type ShopFaqItem, type ShopFeatureItem } from "@/lib/shops/types";
import { blocksJson } from "@/lib/shops/blocks";

export type ShopOpResult = { ok: true; summary: string } | { ok: false; error: string };

function pageBySlug(doc: ShopDocument, slug: string) {
  return doc.pages.find((page) => page.slug === slug) ?? null;
}

function parseFaq(value: unknown): ShopFaqItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({ q: String(item.q ?? ""), a: String(item.a ?? "") }));
}

function parseFeatures(value: unknown): ShopFeatureItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({ title: String(item.title ?? ""), text: String(item.text ?? "") }));
}

function patchBlock(block: ShopBlock, fields: Record<string, unknown>): ShopBlock {
  const next = { ...block };
  for (const key of ["heading", "sub", "text", "image", "imageAlt", "ctaLabel", "category"] as const) {
    if (typeof fields[key] === "string") next[key] = fields[key] as string;
  }
  if (typeof fields.limit === "number") next.limit = fields.limit;
  const faq = parseFaq(fields.faq);
  if (faq) next.faq = faq;
  const features = parseFeatures(fields.features);
  if (features) next.features = features;
  return next;
}

function setPageBlocks(doc: ShopDocument, slug: string, blocks: ShopBlock[]) {
  const page = pageBySlug(doc, slug);
  if (!page) return false;
  page.blocks = blocksJson(blocks);
  page.updated_at = new Date().toISOString();
  return true;
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
    const current = Array.isArray(page.blocks) ? page.blocks : [];
    const parsed = current
      .map((item) => parseBlock(item))
      .filter((item): item is ShopBlock => Boolean(item));
    const legalBlock = parsed.find((block) => block.type === "legal") ?? emptyBlock("legal");
    legalBlock.heading = page.title;
    legalBlock.text = body;
    const others = parsed.filter((block) => block.type !== "legal");
    setPageBlocks(doc, page.slug, [...others, legalBlock]);
  }
}

export function shopSnapshot(doc: ShopDocument) {
  const theme = parseTheme(doc.shop.theme);
  const seo = parseSeo(doc.shop.seo, doc.shop.name);
  const legal = parseLegal(doc.shop.legal);
  return {
    name: doc.shop.name,
    slug: doc.shop.slug,
    status: doc.shop.status,
    sector: doc.shop.sector,
    theme,
    seo,
    legal,
    pages: doc.pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      kind: page.kind,
      seo: page.seo,
      blocks: Array.isArray(page.blocks) ? page.blocks : [],
    })),
    nav: doc.nav.map((item) => ({
      location: item.location,
      label: item.label,
      href: item.href,
      sortOrder: item.sort_order,
    })),
  };
}

export function executeShopTool(doc: ShopDocument, name: string, input: Record<string, unknown>): ShopOpResult {
  if (name === "get_shop") {
    return { ok: true, summary: JSON.stringify(shopSnapshot(doc)) };
  }

  if (name === "update_block") {
    const slug = String(input.slug ?? "");
    const id = String(input.id ?? "");
    const page = pageBySlug(doc, slug);
    if (!page) return { ok: false, error: `Page ${slug} introuvable` };
    const blocks = (Array.isArray(page.blocks) ? page.blocks : [])
      .map((item) => parseBlock(item))
      .filter((item): item is ShopBlock => Boolean(item));
    const index = blocks.findIndex((block) => block.id === id);
    if (index < 0) return { ok: false, error: `Bloc ${id} introuvable` };
    blocks[index] = patchBlock(blocks[index]!, input);
    setPageBlocks(doc, slug, blocks);
    return { ok: true, summary: `Bloc ${id} mis à jour sur ${slug}` };
  }

  if (name === "add_block") {
    const slug = String(input.slug ?? "");
    const type = String(input.type ?? "");
    if (!isShopBlockType(type)) return { ok: false, error: `Type de bloc inconnu: ${type}` };
    const page = pageBySlug(doc, slug);
    if (!page) return { ok: false, error: `Page ${slug} introuvable` };
    const block = patchBlock(emptyBlock(type), input);
    const blocks = (Array.isArray(page.blocks) ? page.blocks : [])
      .map((item) => parseBlock(item))
      .filter((item): item is ShopBlock => Boolean(item));
    const afterId = typeof input.afterId === "string" ? input.afterId : "";
    const at = afterId ? blocks.findIndex((item) => item.id === afterId) : -1;
    if (at >= 0) blocks.splice(at + 1, 0, block);
    else blocks.push(block);
    setPageBlocks(doc, slug, blocks);
    return { ok: true, summary: `Bloc ${type} ajouté sur ${slug} (${block.id})` };
  }

  if (name === "remove_block") {
    const slug = String(input.slug ?? "");
    const id = String(input.id ?? "");
    const page = pageBySlug(doc, slug);
    if (!page) return { ok: false, error: `Page ${slug} introuvable` };
    const blocks = (Array.isArray(page.blocks) ? page.blocks : [])
      .map((item) => parseBlock(item))
      .filter((item): item is ShopBlock => item != null && item.id !== id);
    setPageBlocks(doc, slug, blocks);
    return { ok: true, summary: `Bloc ${id} retiré de ${slug}` };
  }

  if (name === "reorder_blocks") {
    const slug = String(input.slug ?? "");
    const ids = Array.isArray(input.ids) ? input.ids.map(String) : [];
    const page = pageBySlug(doc, slug);
    if (!page) return { ok: false, error: `Page ${slug} introuvable` };
    const current = (Array.isArray(page.blocks) ? page.blocks : [])
      .map((item) => parseBlock(item))
      .filter((item): item is ShopBlock => Boolean(item));
    const map = new Map(current.map((block) => [block.id, block]));
    const next = ids.map((id) => map.get(id)).filter((block): block is ShopBlock => Boolean(block));
    for (const block of current) {
      if (!next.some((item) => item.id === block.id)) next.push(block);
    }
    setPageBlocks(doc, slug, next);
    return { ok: true, summary: `Blocs réordonnés sur ${slug}` };
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
    const block = emptyBlock(kind === "legal" ? "legal" : "text");
    block.heading = title;
    block.text = text;
    doc.pages.push({
      id: newBlockId(),
      organization_id: doc.shop.organization_id,
      shop_id: doc.shop.id,
      kind,
      slug: rawSlug,
      title,
      seo: asJson({ title, description: "", noindex: false }),
      blocks: blocksJson([block]),
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
