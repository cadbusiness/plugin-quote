import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail, StorefrontCrumbs } from "@/components/storefront/storefront-view";
import { htmlToPlainPreview } from "@/lib/catalog/html";
import { breadcrumbJsonLd, productJsonLd, shopMetadata, websiteJsonLd } from "@/lib/shops/seo";
import { loadOr404, seoCtx, StorefrontShell, toModel } from "@/lib/shops/public-page";
import { categoryPath, findProductBySlug, productPath, shopQuotePath } from "@/lib/shops/urls";
import { getAppUrl } from "@/lib/supabase/env";

type Props = { params: Promise<{ orgSlug: string; shopSlug: string; productSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, shopSlug, productSlug } = await params;
  const shop = await loadOr404(orgSlug, shopSlug);
  const product = findProductBySlug(shop.products, productSlug);
  if (!product) notFound();
  return shopMetadata(
    seoCtx(
      shop,
      productPath(product),
      product.name,
      htmlToPlainPreview(product.description) || `${product.name} — devis ${shop.doc.shop.name}`,
      { image: product.image_url },
    ),
  );
}

export default async function ShopProductPage({ params }: Props) {
  const { orgSlug, shopSlug, productSlug } = await params;
  const shop = await loadOr404(orgSlug, shopSlug);
  const product = findProductBySlug(shop.products, productSlug);
  if (!product) notFound();
  const path = productPath(product);
  const ctx = seoCtx(shop, path, product.name, htmlToPlainPreview(product.description) || "");
  const quoteUrl = `${getAppUrl()}${shopQuotePath(shop.orgSlug, shop.doc.shop.slug)}`;
  const crumbs = [
    { name: shop.doc.shop.name, path: "/" },
    { name: "Catalogue", path: "/catalogue" },
    ...(product.category
      ? [{ name: product.category, path: categoryPath(product.category) }]
      : []),
    { name: product.name, path },
  ];
  const jsonLd = [websiteJsonLd(ctx), breadcrumbJsonLd(ctx, crumbs), productJsonLd(ctx, product, quoteUrl)];
  const model = toModel(shop, jsonLd);
  return (
    <StorefrontShell model={model}>
      <StorefrontCrumbs model={model} items={crumbs} />
      <ProductDetail model={model} product={product} />
    </StorefrontShell>
  );
}


