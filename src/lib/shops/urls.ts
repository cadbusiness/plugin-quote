import { slugify } from "@/lib/org/slug";
import type { ShopProduct } from "@/lib/shops/types";

export function shopBasePath(orgSlug: string, shopSlug: string) {
  return `/b/${orgSlug}/${shopSlug}`;
}

export function shopAbsoluteUrl(origin: string, orgSlug: string, shopSlug: string, path = "") {
  const base = `${origin.replace(/\/$/, "")}${shopBasePath(orgSlug, shopSlug)}`;
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function shopPagePath(slug: string) {
  if (!slug || slug === "accueil") return "/";
  if (slug === "catalogue") return "/catalogue";
  return `/${slug}`;
}

export function categorySlug(label: string) {
  return slugify(label);
}

export function categoryPath(label: string) {
  return `/c/${categorySlug(label)}`;
}

export function productSlug(product: Pick<ShopProduct, "id" | "name">) {
  const name = slugify(product.name);
  return `${name}--${product.id.slice(0, 8)}`;
}

export function productPath(product: Pick<ShopProduct, "id" | "name">) {
  return `/p/${productSlug(product)}`;
}

export function findProductBySlug(products: ShopProduct[], slug: string) {
  const shortId = slug.split("--").pop()?.toLowerCase() ?? "";
  if (shortId.length >= 6) {
    const match = products.find((product) => product.id.replace(/-/g, "").startsWith(shortId.replace(/-/g, "")));
    if (match) return match;
    const byPrefix = products.find((product) => product.id.toLowerCase().startsWith(shortId));
    if (byPrefix) return byPrefix;
  }
  return products.find((product) => productSlug(product) === slug) ?? null;
}

export function quoteFunnelPath(orgSlug: string, funnelSlug: string | null | undefined) {
  if (!funnelSlug) return null;
  return `/c/${orgSlug}/${funnelSlug}`;
}
