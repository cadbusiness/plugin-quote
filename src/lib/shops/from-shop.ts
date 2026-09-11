import { publicConfiguratorSlugs } from "@/lib/demo/public-slugs";
import { parseStatus } from "@/lib/shops/parse";
import { shopQuotePath } from "@/lib/shops/urls";

/** Query keys that identify a shop on a public `/c/{org}/{slug}` landing. */
export const FROM_SHOP_PARAM_KEYS = ["fromShop", "shopSlug", "shop"] as const;

const PRESERVE_QUERY_KEYS = [
  "product",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "qb_vid",
] as const;

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/i;

export type ShopSearchParams = Record<string, string | string[] | undefined>;

export type FromShopLookup = {
  slug: string;
  status: string;
  funnelSlug: string | null;
};

export function isShopSlug(value: string) {
  return SLUG_RE.test(value);
}

export function toSearchParams(
  search: URLSearchParams | ShopSearchParams | string | null | undefined,
): URLSearchParams {
  if (!search) return new URLSearchParams();
  if (search instanceof URLSearchParams) return new URLSearchParams(search);
  if (typeof search === "string") {
    return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) params.append(key, item);
      }
    } else if (value) {
      params.set(key, value);
    }
  }
  return params;
}

/** First safe shop slug from `fromShop` / `shopSlug` / `shop`. */
export function shopHintFromSearch(
  search: URLSearchParams | ShopSearchParams | string | null | undefined,
): string | null {
  const params = toSearchParams(search);
  for (const key of FROM_SHOP_PARAM_KEYS) {
    const value = params.get(key)?.trim() ?? "";
    if (isShopSlug(value)) return value;
  }
  return null;
}

function funnelsMatch(orgSlug: string, requested: string, owned: string) {
  if (requested === owned) return true;
  const requestedSlugs = publicConfiguratorSlugs(orgSlug, requested);
  const ownedSlugs = publicConfiguratorSlugs(orgSlug, owned);
  return requestedSlugs.some((slug) => ownedSlugs.includes(slug));
}

function preservedQuery(search: URLSearchParams | ShopSearchParams | string | null | undefined) {
  const source = toSearchParams(search);
  const next = new URLSearchParams();
  for (const key of PRESERVE_QUERY_KEYS) {
    const value = source.get(key)?.trim();
    if (value) next.set(key, value);
  }
  const qs = next.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Soft-redirect target for a public funnel that carries a shop hint.
 * Returns null when there is no hint, or the shop is unknown / unpublished / not linked to this funnel.
 */
export function shopDevisRedirectFromFunnel(input: {
  orgSlug: string;
  configuratorSlug: string;
  shopHint: string | null;
  shop: FromShopLookup | null;
  search?: URLSearchParams | ShopSearchParams | string | null;
}): string | null {
  if (!input.shopHint || !isShopSlug(input.shopHint)) return null;
  if (!input.shop) return null;
  if (parseStatus(input.shop.status) !== "published") return null;
  if (!input.shop.funnelSlug) return null;
  if (!funnelsMatch(input.orgSlug, input.configuratorSlug, input.shop.funnelSlug)) return null;
  if (!isShopSlug(input.shop.slug)) return null;
  return `${shopQuotePath(input.orgSlug, input.shop.slug)}${preservedQuery(input.search)}`;
}
