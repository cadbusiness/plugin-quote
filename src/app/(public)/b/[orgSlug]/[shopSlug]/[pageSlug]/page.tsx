import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { breadcrumbJsonLd, shopMetadata, websiteJsonLd } from "@/lib/shops/seo";
import { loadOr404, seoCtx, StorefrontBlocks, StorefrontShell, toModel } from "@/lib/shops/public-page";
import { shopPagePath } from "@/lib/shops/urls";

type Props = { params: Promise<{ orgSlug: string; shopSlug: string; pageSlug: string }> };

const RESERVED = new Set(["catalogue", "c", "p", "sitemap.xml", "robots.txt", "llms.txt"]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, shopSlug, pageSlug } = await params;
  if (RESERVED.has(pageSlug)) notFound();
  const shop = await loadOr404(orgSlug, shopSlug);
  const page = shop.pages.find((item) => item.slug === pageSlug);
  if (!page || !page.isPublished) notFound();
  return shopMetadata(seoCtx(shop, shopPagePath(page.slug), page.seo.title || page.title, page.seo.description, { noindex: page.seo.noindex }));
}

export default async function ShopCustomPage({ params }: Props) {
  const { orgSlug, shopSlug, pageSlug } = await params;
  if (RESERVED.has(pageSlug)) notFound();
  const shop = await loadOr404(orgSlug, shopSlug);
  const page = shop.pages.find((item) => item.slug === pageSlug);
  if (!page || !page.isPublished) notFound();
  const path = shopPagePath(page.slug);
  const ctx = seoCtx(shop, path, page.title, page.seo.description);
  const jsonLd = [
    websiteJsonLd(ctx),
    breadcrumbJsonLd(ctx, [
      { name: shop.doc.shop.name, path: "/" },
      { name: page.title, path },
    ]),
  ];
  const model = toModel(shop, jsonLd);
  return (
    <StorefrontShell model={model}>
      <StorefrontBlocks model={model} layout={page.blocks} />
    </StorefrontShell>
  );
}
