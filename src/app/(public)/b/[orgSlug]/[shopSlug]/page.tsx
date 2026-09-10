import type { Metadata } from "next";
import { breadcrumbJsonLd, faqJsonLd, shopMetadata, websiteJsonLd } from "@/lib/shops/seo";
import { homeFaq, loadOr404, seoCtx, StorefrontBlocks, StorefrontShell, toModel } from "@/lib/shops/public-page";

type Props = { params: Promise<{ orgSlug: string; shopSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, shopSlug } = await params;
  const shop = await loadOr404(orgSlug, shopSlug);
  const home = shop.pages.find((page) => page.kind === "home");
  return shopMetadata(seoCtx(shop, "/", home?.seo.title || shop.doc.shop.name, home?.seo.description || shop.seo.description));
}

export default async function ShopHomePage({ params }: Props) {
  const { orgSlug, shopSlug } = await params;
  const shop = await loadOr404(orgSlug, shopSlug);
  const home = shop.pages.find((page) => page.kind === "home") ?? shop.pages[0];
  if (!home) return null;
  const ctx = seoCtx(shop, "/", home.seo.title, home.seo.description);
  const jsonLd = [websiteJsonLd(ctx), breadcrumbJsonLd(ctx, [{ name: shop.doc.shop.name, path: "/" }]), faqJsonLd(homeFaq(shop))].filter(
    Boolean,
  );
  return (
    <StorefrontShell model={toModel(shop, jsonLd)}>
      <StorefrontBlocks model={toModel(shop)} blocks={home.blocks} />
    </StorefrontShell>
  );
}
