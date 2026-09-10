import { notFound } from "next/navigation";
import { StorefrontBlocks, StorefrontShell, type StorefrontModel } from "@/components/storefront/storefront-view";
import { loadPublicShop, type PublicShop } from "@/lib/shops/public";
import { faqJsonLd, shopMetadata, websiteJsonLd } from "@/lib/shops/seo";
import { getAppUrl } from "@/lib/supabase/env";

export function toModel(shop: PublicShop, jsonLd: unknown[] = []): StorefrontModel {
  return {
    orgSlug: shop.orgSlug,
    shopSlug: shop.doc.shop.slug,
    shopName: shop.doc.shop.name,
    funnelSlug: shop.funnelSlug,
    theme: shop.theme,
    legal: shop.legal,
    nav: shop.nav,
    products: shop.products,
    jsonLd,
  };
}

export function seoCtx(
  shop: PublicShop,
  path: string,
  title: string,
  description: string,
  extra?: { noindex?: boolean; image?: string | null },
) {
  return {
    origin: getAppUrl(),
    orgSlug: shop.orgSlug,
    shopSlug: shop.doc.shop.slug,
    shopName: shop.doc.shop.name,
    seo: shop.seo,
    legal: shop.legal,
    path,
    title,
    description,
    noindex: extra?.noindex,
    image: extra?.image,
  };
}

export async function loadOr404(orgSlug: string, shopSlug: string) {
  const shop = await loadPublicShop(orgSlug, shopSlug);
  if (!shop) notFound();
  return shop;
}

export function homeFaq(shop: PublicShop) {
  const home = shop.pages.find((page) => page.kind === "home") ?? shop.pages[0];
  const block = home?.blocks.find((item) => item.type === "faq");
  return block?.faq ?? [];
}

export { shopMetadata, websiteJsonLd, faqJsonLd, StorefrontBlocks, StorefrontShell };
