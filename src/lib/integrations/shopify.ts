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

const API_VERSION = process.env.SHOPIFY_API_VERSION?.trim() || "2026-07";
const PAGE_SIZE = 25;
const TIMEOUT_MS = 25_000;

export function normalizeShopDomain(input: string) {
  const raw = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!raw) throw new IntegrationError("Domaine de la boutique manquant.", 400);
  const domain = raw.includes(".") ? raw : `${raw}.myshopify.com`;
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain)) {
    throw new IntegrationError(
      "Utilisez le domaine technique de la boutique, du type ma-boutique.myshopify.com.",
      400,
    );
  }
  return domain;
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string; extensions?: { code?: string } }[];
  extensions?: {
    cost?: { throttleStatus?: { currentlyAvailable: number; restoreRate: number } };
  };
};

async function shopifyGraphQL<T>(
  connection: ResolvedConnection,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const token = connection.credentials.access_token;
  if (!token) throw new IntegrationError("Jeton d'accès Shopify manquant.", 400);
  const domain = normalizeShopDomain(connection.storeDomain);
  const endpoint = `https://${domain}/admin/api/${API_VERSION}/graphql.json`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      if (attempt === 2) {
        const reason = error instanceof Error ? error.message : "inconnue";
        throw new IntegrationError(`Shopify injoignable (${reason}).`, 504);
      }
      await sleep(600 * (attempt + 1));
      continue;
    }

    if (response.status === 401 || response.status === 403) {
      throw new IntegrationError(
        "Shopify refuse le jeton d'accès. Vérifiez que l'app personnalisée a bien la portée read_products et que le jeton est à jour.",
        401,
      );
    }
    if (response.status === 404) {
      throw new IntegrationError(
        `Boutique ${domain} introuvable sur l'API Admin ${API_VERSION}.`,
        404,
      );
    }
    if (response.status === 429 || response.status >= 500) {
      if (attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "1");
        await sleep(Math.max(1000, retryAfter * 1000));
        continue;
      }
      throw new IntegrationError(`Shopify a répondu ${response.status}.`, response.status);
    }

    const payload = (await response.json()) as GraphQLResponse<T>;
    if (payload.errors?.length) {
      const throttled = payload.errors.some((e) => e.extensions?.code === "THROTTLED");
      if (throttled && attempt < 2) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      throw new IntegrationError(`Shopify : ${payload.errors.map((e) => e.message).join(" · ")}`);
    }
    if (!payload.data) throw new IntegrationError("Réponse Shopify vide.");

    // On laisse le seau de points se remplir avant la page suivante.
    const throttle = payload.extensions?.cost?.throttleStatus;
    if (throttle && throttle.currentlyAvailable < 200) {
      await sleep(Math.min(4000, ((200 - throttle.currentlyAvailable) / (throttle.restoreRate || 50)) * 1000));
    }
    return payload.data;
  }
  throw new IntegrationError("Shopify injoignable.", 504);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PRODUCT_FIELDS = `
  id
  legacyResourceId
  title
  handle
  description
  descriptionHtml
  productType
  vendor
  tags
  status
  updatedAt
  onlineStoreUrl
  totalInventory
  featuredMedia { preview { image { url altText } } }
  media(first: 10) {
    nodes { ... on MediaImage { image { url altText } } }
  }
  options { name optionValues { name } }
  priceRangeV2 {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  variants(first: 100) {
    nodes {
      id
      legacyResourceId
      title
      sku
      price
      compareAtPrice
      availableForSale
      selectedOptions { name value }
      image { url }
    }
  }
`;

const PRODUCTS_QUERY = `
  query QuoteBuilderProducts($cursor: String, $query: String) {
    products(first: ${PAGE_SIZE}, after: $cursor, query: $query, sortKey: ID) {
      pageInfo { hasNextPage endCursor }
      nodes { ${PRODUCT_FIELDS} }
    }
  }
`;

const PRODUCT_QUERY = `
  query QuoteBuilderProduct($id: ID!) {
    product(id: $id) { ${PRODUCT_FIELDS} }
  }
`;

type ShopifyMoney = { amount: string; currencyCode: string };

type ShopifyProduct = {
  id: string;
  legacyResourceId: string;
  title: string;
  handle: string;
  description: string | null;
  descriptionHtml: string | null;
  productType: string | null;
  vendor: string | null;
  tags: string[];
  status: "ACTIVE" | "ARCHIVED" | "DRAFT" | string;
  updatedAt: string | null;
  onlineStoreUrl: string | null;
  totalInventory: number | null;
  featuredMedia: { preview: { image: { url: string; altText: string | null } | null } | null } | null;
  media: { nodes: { image?: { url: string; altText: string | null } | null }[] };
  options: { name: string; optionValues: { name: string }[] }[];
  priceRangeV2: { minVariantPrice: ShopifyMoney; maxVariantPrice: ShopifyMoney } | null;
  variants: {
    nodes: {
      id: string;
      legacyResourceId: string;
      title: string;
      sku: string | null;
      price: string | null;
      compareAtPrice: string | null;
      availableForSale: boolean;
      selectedOptions: { name: string; value: string }[];
      image: { url: string } | null;
    }[];
  };
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapImages(product: ShopifyProduct): ProductImage[] {
  const images: ProductImage[] = [];
  const featured = product.featuredMedia?.preview?.image;
  if (featured?.url) images.push({ src: featured.url, alt: featured.altText });
  for (const node of product.media?.nodes ?? []) {
    const image = node.image;
    if (!image?.url) continue;
    if (images.some((i) => i.src === image.url)) continue;
    images.push({ src: image.url, alt: image.altText });
  }
  return images;
}

function mapOptions(product: ShopifyProduct): ProductOption[] {
  return (product.options ?? [])
    .filter((option) => option.name && option.name !== "Title" && option.optionValues?.length)
    .map((option) => ({
      key: slugify(option.name),
      label: option.name,
      values: option.optionValues.map((value) => ({ value: slugify(value.name), label: value.name })),
    }));
}

function mapVariants(product: ShopifyProduct): ProductVariant[] {
  const nodes = product.variants?.nodes ?? [];
  // Une boutique sans déclinaison expose une variante technique « Default Title ».
  if (nodes.length === 1 && nodes[0].title === "Default Title") return [];
  return nodes.map((variant) => ({
    externalId: variant.legacyResourceId,
    title: variant.title,
    sku: variant.sku || null,
    price: parsePrice(variant.price),
    compareAtPrice: parsePrice(variant.compareAtPrice),
    available: variant.availableForSale,
    imageSrc: variant.image?.url ?? null,
    selected: Object.fromEntries(
      (variant.selectedOptions ?? []).map((option) => [option.name, option.value]),
    ),
  }));
}

function normalizeProduct(product: ShopifyProduct, fallbackCurrency: string): NormalizedProduct {
  const range = product.priceRangeV2;
  const variants = mapVariants(product);
  const variantPrices = variants.map((v) => v.price).filter((p): p is number => p !== null);
  const firstVariantPrice = parsePrice(product.variants?.nodes?.[0]?.price);

  const priceMin =
    parsePrice(range?.minVariantPrice.amount) ??
    (variantPrices.length ? Math.min(...variantPrices) : firstVariantPrice);
  const priceMax =
    parsePrice(range?.maxVariantPrice.amount) ??
    (variantPrices.length ? Math.max(...variantPrices) : firstVariantPrice);

  const description =
    product.description?.trim() || htmlToText(product.descriptionHtml) || null;

  const status =
    product.status === "ACTIVE" ? "active" : product.status === "ARCHIVED" ? "archived" : "draft";

  return {
    externalId: product.legacyResourceId,
    name: product.title,
    description: description ? description.slice(0, 4000) : null,
    sku: product.variants?.nodes?.[0]?.sku || null,
    priceMin,
    priceMax,
    currency: range?.minVariantPrice.currencyCode || fallbackCurrency,
    images: mapImages(product),
    category: product.productType || null,
    tags: [product.vendor, product.productType, ...(product.tags ?? [])]
      .filter((t): t is string => Boolean(t))
      .slice(0, 12),
    url: product.onlineStoreUrl,
    status,
    stockStatus:
      product.totalInventory === null || product.totalInventory === undefined
        ? null
        : product.totalInventory > 0
          ? "instock"
          : "outofstock",
    options: mapOptions(product),
    variants,
    externalUpdatedAt: product.updatedAt,
  };
}

function productFilter(connection: ResolvedConnection) {
  return connection.settings.importDrafts ? "status:ACTIVE,DRAFT" : "status:ACTIVE";
}

export const shopifyAdapter: CatalogAdapter = {
  id: "shopify",
  label: "Shopify",

  async test(connection) {
    try {
      const data = await shopifyGraphQL<{
        shop: { name: string; currencyCode: string };
        productsCount: { count: number } | null;
      }>(connection, `query { shop { name currencyCode } productsCount { count } }`);
      return {
        ok: true,
        shopName: data.shop.name,
        currency: data.shop.currencyCode,
        productCount: data.productsCount?.count ?? null,
      };
    } catch (error) {
      // `productsCount` peut manquer selon la version d'API : on retente au minimum.
      try {
        const data = await shopifyGraphQL<{ shop: { name: string; currencyCode: string } }>(
          connection,
          `query { shop { name currencyCode } }`,
        );
        return { ok: true, shopName: data.shop.name, currency: data.shop.currencyCode, productCount: null };
      } catch {
        return { ok: false, error: error instanceof Error ? error.message : "Échec de connexion." };
      }
    }
  },

  async fetchPage(connection, cursor) {
    const data = await shopifyGraphQL<{
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: ShopifyProduct[];
      };
    }>(connection, PRODUCTS_QUERY, { cursor, query: productFilter(connection) });

    return {
      products: data.products.nodes.map((node) => normalizeProduct(node, connection.currency)),
      cursor: data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null,
    };
  },

  async fetchOne(connection, externalId) {
    const gid = externalId.startsWith("gid://")
      ? externalId
      : `gid://shopify/Product/${externalId}`;
    const data = await shopifyGraphQL<{ product: ShopifyProduct | null }>(connection, PRODUCT_QUERY, {
      id: gid,
    });
    return data.product ? normalizeProduct(data.product, connection.currency) : null;
  },

  verifyWebhook(connection, rawBody, headers) {
    const signature = headers.get("x-shopify-hmac-sha256");
    if (!signature || !connection.webhookSecret) return false;
    const expected = createHmac("sha256", connection.webhookSecret)
      .update(Buffer.from(rawBody, "utf8"))
      .digest("base64");
    return safeEqual(signature, expected);
  },

  readWebhook(rawBody, headers) {
    const topic = headers.get("x-shopify-topic") ?? "";
    if (!topic.startsWith("products/")) return null;
    try {
      const payload = JSON.parse(rawBody) as { id?: number | string; admin_graphql_api_id?: string };
      const id =
        payload.id !== undefined
          ? String(payload.id)
          : payload.admin_graphql_api_id?.split("/").pop();
      if (!id) return null;
      return { externalId: id, deleted: topic === "products/delete" };
    } catch {
      return null;
    }
  },
};
