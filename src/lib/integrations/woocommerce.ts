import { createHmac } from "node:crypto";
import { parseRelated } from "@/lib/catalog/affinity";
import { toProspectOptions } from "@/lib/catalog/attributes";
import { sanitizeProductHtml } from "@/lib/catalog/html";
import { mapWooCatalogAttributes, mapWooProductSpecs, wooSpecsWrite, type WooSpecUnits } from "@/lib/catalog/specs";
import { htmlToText, parsePrice } from "@/lib/integrations/html";
import { safeEqual } from "@/lib/integrations/secrets";
import {
  IntegrationError,
  type CatalogAdapter,
  type NormalizedProduct,
  type ProductImage,
  type ProductVariant,
  type PushableProduct,
  type ResolvedConnection,
} from "@/lib/integrations/types";
import { pickLeafCategory, type WooCategoryNode } from "@/lib/integrations/woo-specs";

const PER_PAGE = 50;
const TIMEOUT_MS = 25_000;

type WooImage = { id?: number; src?: string; alt?: string; name?: string };
type WooTerm = { id?: number; name?: string; slug?: string };
type WooAttribute = {
  id?: number;
  name?: string;
  slug?: string;
  visible?: boolean;
  variation?: boolean;
  options?: string[];
};
type WooMeta = { id?: number; key?: string; value?: unknown };

type WooProduct = {
  id: number;
  name: string;
  slug?: string;
  permalink?: string;
  type?: string;
  status?: string;
  catalog_visibility?: string;
  description?: string;
  short_description?: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_status?: string;
  date_modified_gmt?: string;
  categories?: WooTerm[];
  tags?: WooTerm[];
  images?: WooImage[];
  attributes?: WooAttribute[];
  dimensions?: { length?: string; width?: string; height?: string };
  weight?: string;
  meta_data?: WooMeta[];
  variations?: number[];
  upsell_ids?: number[];
  cross_sell_ids?: number[];
};

type WooVariation = {
  id: number;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_status?: string;
  image?: WooImage;
  attributes?: { name?: string; option?: string }[];
};

export function normalizeSiteUrl(input: string) {
  const trimmed = input.trim().replace(/\/+$/, "");
  if (!trimmed) throw new IntegrationError("URL du site manquante.", 400);
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new IntegrationError(`URL invalide : ${input}`, 400);
  }
  if (url.protocol !== "https:" && url.hostname !== "localhost" && !url.hostname.endsWith(".local")) {
    throw new IntegrationError(
      "WooCommerce exige HTTPS : les clés API transitent en clair sur une URL en http://.",
      400,
    );
  }
  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

async function wooFetch<T>(
  connection: ResolvedConnection,
  path: string,
  params: Record<string, string | number> = {},
  init: { method?: string; body?: unknown } = {},
): Promise<{ data: T; headers: Headers }> {
  const key = connection.credentials.consumer_key;
  const secret = connection.credentials.consumer_secret;
  if (!key || !secret) throw new IntegrationError("Clés WooCommerce manquantes.", 400);

  const base = normalizeSiteUrl(connection.storeDomain);
  const url = new URL(`${base}/wp-json/wc/v3${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const method = init.method ?? "GET";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    // Certains hébergeurs mutualisés suppriment l'en-tête Authorization :
    // au deuxième essai on repasse par les paramètres de requête.
    const target = new URL(url);
    const headers: Record<string, string> = { Accept: "application/json" };
    if (init.body != null) headers["Content-Type"] = "application/json";
    if (attempt === 0) {
      headers.Authorization = `Basic ${auth}`;
    } else {
      target.searchParams.set("consumer_key", key);
      target.searchParams.set("consumer_secret", secret);
    }

    let response: Response;
    try {
      response = await fetch(target, {
        method,
        headers,
        body: init.body != null ? JSON.stringify(init.body) : undefined,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      if (attempt === 2) {
        const reason = error instanceof Error ? error.message : "inconnue";
        throw new IntegrationError(`Site WooCommerce injoignable (${reason}).`, 504);
      }
      await sleep(500 * (attempt + 1));
      continue;
    }

    if (response.ok) {
      return { data: (await response.json()) as T, headers: response.headers };
    }

    const body = await response.text().catch(() => "");
    if (response.status === 401 || response.status === 403) {
      if (attempt === 0) continue; // on retente via query params
      throw new IntegrationError(
        "WooCommerce refuse les clés API (droits insuffisants ou clés révoquées).",
        401,
      );
    }
    if (response.status === 404) {
      throw new IntegrationError(
        "API WooCommerce introuvable : vérifiez que WooCommerce est actif et que les permaliens ne sont pas en « simple ».",
        404,
      );
    }
    if (response.status === 429 || response.status >= 500) {
      if (attempt < 2) {
        await sleep(1000 * (attempt + 1));
        continue;
      }
    }
    throw new IntegrationError(
      `WooCommerce a répondu ${response.status} : ${shorten(body)}`,
      response.status,
    );
  }
  throw new IntegrationError("WooCommerce injoignable.", 504);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shorten(text: string, max = 180) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

async function fetchCurrency(connection: ResolvedConnection) {
  try {
    const { data } = await wooFetch<{ id: string; value?: string }[]>(
      connection,
      "/settings/general",
    );
    const row = data.find((s) => s.id === "woocommerce_currency");
    return typeof row?.value === "string" && row.value ? row.value : "EUR";
  } catch {
    return "EUR";
  }
}

function mapImages(product: WooProduct): ProductImage[] {
  return (product.images ?? [])
    .map((img) => ({ src: img.src ?? "", alt: img.alt || img.name || null }))
    .filter((img) => Boolean(img.src));
}

function mapVariants(variations: WooVariation[]): ProductVariant[] {
  return variations.map((variation) => ({
    externalId: String(variation.id),
    title:
      (variation.attributes ?? [])
        .map((attr) => attr.option)
        .filter(Boolean)
        .join(" / ") || `Variante ${variation.id}`,
    sku: variation.sku || null,
    price: parsePrice(variation.price ?? variation.regular_price),
    compareAtPrice:
      variation.sale_price && variation.regular_price
        ? parsePrice(variation.regular_price)
        : null,
    available: variation.stock_status !== "outofstock",
    imageSrc: variation.image?.src ?? null,
    selected: Object.fromEntries(
      (variation.attributes ?? [])
        .filter((attr) => attr.name && attr.option)
        .map((attr) => [attr.name!, attr.option!]),
    ),
  }));
}

type WooSetting = { id?: string; value?: string };
type WooCatalogContext = { currency: string; units: WooSpecUnits; categories: WooCategoryNode[] };

const contextCache = new Map<string, Promise<WooCatalogContext>>();

async function catalogContext(connection: ResolvedConnection): Promise<WooCatalogContext> {
  const cached = contextCache.get(connection.id);
  if (cached) return cached;
  const pending = loadCatalogContext(connection);
  contextCache.set(connection.id, pending);
  return pending;
}

async function fetchCategoryTaxonomy(connection: ResolvedConnection): Promise<WooCategoryNode[]> {
  const categories: WooCategoryNode[] = [];
  try {
    for (let page = 1; page <= 20; page += 1) {
      const { data, headers } = await wooFetch<{ id?: number; name?: string; parent?: number }[]>(
        connection,
        "/products/categories",
        { per_page: 100, page },
      );
      for (const row of data) {
        if (!row.id || !row.name) continue;
        categories.push({ id: row.id, name: row.name, parent: row.parent ?? 0 });
      }
      const total = Number(headers.get("x-wp-totalpages") ?? "1") || 1;
      if (page >= total || !data.length) break;
    }
  } catch {
    // Sans taxonomie, la catégorie retombe sur le dernier libellé assigné.
  }
  return categories;
}

function settingValue(rows: WooSetting[], id: string) {
  const value = rows.find((row) => row.id === id)?.value;
  return typeof value === "string" && value ? value : undefined;
}

async function loadCatalogContext(connection: ResolvedConnection): Promise<WooCatalogContext> {
  const categories = await fetchCategoryTaxonomy(connection);
  try {
    const { data } = await wooFetch<WooSetting[]>(connection, "/settings/general");
    let dimension = settingValue(data, "woocommerce_dimension_unit") ?? "cm";
    let weight = settingValue(data, "woocommerce_weight_unit") ?? "kg";
    try {
      const { data: productSettings } = await wooFetch<WooSetting[]>(connection, "/settings/products");
      dimension = settingValue(productSettings, "woocommerce_dimension_unit") ?? dimension;
      weight = settingValue(productSettings, "woocommerce_weight_unit") ?? weight;
    } catch {
      // Les unités restent celles de /settings/general, sinon cm / kg.
    }
    return {
      currency: settingValue(data, "woocommerce_currency") ?? "EUR",
      units: { dimension, weight },
      categories,
    };
  } catch {
    return { currency: "EUR", units: { dimension: "cm", weight: "kg" }, categories };
  }
}

function normalizeProduct(
  product: WooProduct,
  variations: WooVariation[],
  currency: string,
  units: WooSpecUnits = {},
  categories: WooCategoryNode[] = [],
): NormalizedProduct {
  const variants = mapVariants(variations);
  const variantPrices = variants.map((v) => v.price).filter((p): p is number => p !== null);
  const base = parsePrice(product.price ?? product.regular_price);

  const priceMin = variantPrices.length ? Math.min(...variantPrices) : base;
  const priceMax = variantPrices.length ? Math.max(...variantPrices) : base;

  const description =
    sanitizeProductHtml(product.description || "") ||
    sanitizeProductHtml(product.short_description || "") ||
    htmlToText(product.description) ||
    htmlToText(product.short_description) ||
    null;

  const attributes = mapWooCatalogAttributes(
    {
      attributes: product.attributes,
      dimensions: product.dimensions,
      weight: product.weight,
      meta_data: product.meta_data,
      description: product.description,
      short_description: product.short_description,
    },
    units,
  );

  return {
    externalId: String(product.id),
    name: product.name,
    description,
    sku: product.sku || null,
    priceMin,
    priceMax,
    currency,
    images: mapImages(product),
    category: pickLeafCategory(product.categories ?? [], categories),
    tags: [
      ...(product.categories ?? []).map((c) => c.name).filter((n): n is string => Boolean(n)),
      ...(product.tags ?? []).map((t) => t.name).filter((n): n is string => Boolean(n)),
    ].slice(0, 12),
    url: product.permalink ?? null,
    status: product.status === "publish" ? "active" : product.status === "trash" ? "archived" : "draft",
    stockStatus:
      product.stock_status === "instock" ||
      product.stock_status === "outofstock" ||
      product.stock_status === "onbackorder"
        ? product.stock_status
        : null,
    attributes,
    options: toProspectOptions(attributes),
    variants,
    related: parseRelated({
      upsellIds: product.upsell_ids ?? [],
      crossSellIds: product.cross_sell_ids ?? [],
    }),
    specs: mapWooProductSpecs(product),
    externalUpdatedAt: product.date_modified_gmt ? `${product.date_modified_gmt}Z` : null,
  };
}

async function loadVariations(connection: ResolvedConnection, product: WooProduct) {
  if (product.type !== "variable" || !(product.variations ?? []).length) return [];
  const { data } = await wooFetch<WooVariation[]>(connection, `/products/${product.id}/variations`, {
    per_page: 100,
  });
  return data;
}

export const wooAdapter: CatalogAdapter = {
  id: "woocommerce",
  label: "WooCommerce",

  async test(connection) {
    try {
      const { data, headers } = await wooFetch<WooProduct[]>(connection, "/products", {
        per_page: 1,
      });
      const currency = await fetchCurrency(connection);
      const total = Number(headers.get("x-wp-total") ?? "");
      return {
        ok: true,
        shopName: new URL(normalizeSiteUrl(connection.storeDomain)).hostname,
        currency,
        productCount: Number.isFinite(total) ? total : data.length,
      };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Échec de connexion." };
    }
  },

  async fetchPage(connection, cursor) {
    const page = Number(cursor ?? "1") || 1;
    const ctx = await catalogContext(connection);
    const currency = connection.currency || ctx.currency;
    const { data, headers } = await wooFetch<WooProduct[]>(connection, "/products", {
      per_page: PER_PAGE,
      page,
      orderby: "id",
      order: "asc",
      status: connection.settings.importDrafts ? "any" : "publish",
    });

    const products: NormalizedProduct[] = [];
    for (const product of data) {
      const variations = await loadVariations(connection, product);
      products.push(normalizeProduct(product, variations, currency, ctx.units, ctx.categories));
    }

    const totalPages = Number(headers.get("x-wp-totalpages") ?? "1") || 1;
    return { products, cursor: page < totalPages ? String(page + 1) : null };
  },

  async fetchOne(connection, externalId) {
    try {
      const ctx = await catalogContext(connection);
      const currency = connection.currency || ctx.currency;
      const { data } = await wooFetch<WooProduct>(connection, `/products/${externalId}`);
      const variations = await loadVariations(connection, data);
      return normalizeProduct(data, variations, currency, ctx.units, ctx.categories);
    } catch (error) {
      if (error instanceof IntegrationError && error.status === 404) return null;
      throw error;
    }
  },

  verifyWebhook(connection, rawBody, headers) {
    const signature = headers.get("x-wc-webhook-signature");
    if (!signature || !connection.webhookSecret) return false;
    const expected = createHmac("sha256", connection.webhookSecret).update(rawBody, "utf8").digest("base64");
    return safeEqual(signature, expected);
  },

  readWebhook(rawBody, headers) {
    const topic = headers.get("x-wc-webhook-topic") ?? "";
    if (!topic.startsWith("product.")) return null;
    try {
      const payload = JSON.parse(rawBody) as { id?: number | string };
      if (payload.id === undefined) return null;
      return { externalId: String(payload.id), deleted: topic === "product.deleted" };
    } catch {
      return null;
    }
  },

  async pushProduct(connection, product) {
    await pushWooProduct(connection, product);
  },
};

async function pushWooProduct(connection: ResolvedConnection, product: PushableProduct) {
  const markup = 1 + connection.settings.markupPercent / 100;
  const price =
    product.priceMin == null ? undefined : String(Math.round((product.priceMin / markup) * 100) / 100);
  let current: WooProduct | null = null;
  try {
    const { data } = await wooFetch<WooProduct>(connection, `/products/${product.externalId}`);
    current = data;
  } catch {
    current = null;
  }
  const specsWrite = product.specs ? wooSpecsWrite(product.specs, current ?? undefined) : null;
  await wooFetch(connection, `/products/${product.externalId}`, {}, {
    method: "PUT",
    body: {
      name: product.name,
      sku: product.sku ?? "",
      description: product.description ?? "",
      ...(price != null ? { regular_price: price } : {}),
      images: product.images.map((image) => ({ src: image.src, alt: image.alt ?? "" })),
      ...(specsWrite?.meta_data.length ? { meta_data: specsWrite.meta_data } : {}),
      ...(specsWrite?.attributes ? { attributes: specsWrite.attributes } : {}),
    },
  });
}
