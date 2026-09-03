import { createHmac } from "node:crypto";
import { htmlToText, parsePrice } from "@/lib/integrations/html";
import { safeEqual } from "@/lib/integrations/secrets";
import {
  IntegrationError,
  type CatalogAdapter,
  type NormalizedProduct,
  type ProductImage,
  type ProductVariant,
  type ResolvedConnection,
} from "@/lib/integrations/types";
import type { ProductOption } from "@/lib/wizard/types";

const PER_PAGE = 50;
const TIMEOUT_MS = 25_000;

type WooImage = { id?: number; src?: string; alt?: string; name?: string };
type WooTerm = { id?: number; name?: string; slug?: string };
type WooAttribute = { id?: number; name?: string; options?: string[]; variation?: boolean };

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
  variations?: number[];
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
): Promise<{ data: T; headers: Headers }> {
  const key = connection.credentials.consumer_key;
  const secret = connection.credentials.consumer_secret;
  if (!key || !secret) throw new IntegrationError("Clés WooCommerce manquantes.", 400);

  const base = normalizeSiteUrl(connection.storeDomain);
  const url = new URL(`${base}/wp-json/wc/v3${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    // Certains hébergeurs mutualisés suppriment l'en-tête Authorization :
    // au deuxième essai on repasse par les paramètres de requête.
    const target = new URL(url);
    const headers: Record<string, string> = { Accept: "application/json" };
    if (attempt === 0) {
      headers.Authorization = `Basic ${auth}`;
    } else {
      target.searchParams.set("consumer_key", key);
      target.searchParams.set("consumer_secret", secret);
    }

    let response: Response;
    try {
      response = await fetch(target, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
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

function mapOptions(product: WooProduct): ProductOption[] {
  return (product.attributes ?? [])
    .filter((attr) => attr.variation && attr.name && (attr.options ?? []).length)
    .map((attr) => ({
      key: slugify(attr.name!),
      label: attr.name!,
      values: (attr.options ?? []).map((value) => ({ value: slugify(value), label: value })),
    }));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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

function normalizeProduct(
  product: WooProduct,
  variations: WooVariation[],
  currency: string,
): NormalizedProduct {
  const variants = mapVariants(variations);
  const variantPrices = variants.map((v) => v.price).filter((p): p is number => p !== null);
  const base = parsePrice(product.price ?? product.regular_price);

  const priceMin = variantPrices.length ? Math.min(...variantPrices) : base;
  const priceMax = variantPrices.length ? Math.max(...variantPrices) : base;

  const description =
    htmlToText(product.description) ?? htmlToText(product.short_description) ?? null;

  return {
    externalId: String(product.id),
    name: product.name,
    description,
    sku: product.sku || null,
    priceMin,
    priceMax,
    currency,
    images: mapImages(product),
    category: product.categories?.[0]?.name ?? null,
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
    options: mapOptions(product),
    variants,
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
    const currency = connection.currency || (await fetchCurrency(connection));
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
      products.push(normalizeProduct(product, variations, currency));
    }

    const totalPages = Number(headers.get("x-wp-totalpages") ?? "1") || 1;
    return { products, cursor: page < totalPages ? String(page + 1) : null };
  },

  async fetchOne(connection, externalId) {
    try {
      const currency = connection.currency || (await fetchCurrency(connection));
      const { data } = await wooFetch<WooProduct>(connection, `/products/${externalId}`);
      const variations = await loadVariations(connection, data);
      return normalizeProduct(data, variations, currency);
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
};
