import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConfiguratorApp } from "@/components/configurator/configurator-app";
import { publicFunnelDocumentTitle, publicFunnelRouteMetadata } from "@/lib/configurator/public-funnel-meta";
import { shopDevisRedirectFromFunnel, shopHintFromSearch, type ShopSearchParams } from "@/lib/shops/from-shop";
import { loadPublicShop } from "@/lib/shops/public";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orgSlug: string; configuratorSlug: string }>;
  searchParams: Promise<ShopSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, configuratorSlug } = await params;
  return publicFunnelRouteMetadata(orgSlug, configuratorSlug, "public");
}

export default async function PublicConfiguratorPage({ params, searchParams }: Props) {
  const { orgSlug, configuratorSlug } = await params;
  const search = await searchParams;
  const shopHint = shopHintFromSearch(search);
  if (shopHint) {
    const shop = await loadPublicShop(orgSlug, shopHint);
    const dest = shopDevisRedirectFromFunnel({
      orgSlug,
      configuratorSlug,
      shopHint,
      shop: shop
        ? { slug: shop.doc.shop.slug, status: shop.doc.shop.status, funnelSlug: shop.funnelSlug }
        : null,
      search,
    });
    if (dest) redirect(dest);
  }
  const title = await publicFunnelDocumentTitle(orgSlug, configuratorSlug);
  return (
    <>
      {title ? <p className="sr-only">{title}</p> : null}
      <ConfiguratorApp orgSlug={orgSlug} configuratorSlug={configuratorSlug} />
    </>
  );
}
