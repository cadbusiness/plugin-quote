import { redirect } from "next/navigation";
import { ConfiguratorApp } from "@/components/configurator/configurator-app";
import { shopDevisRedirectFromFunnel, shopHintFromSearch, type ShopSearchParams } from "@/lib/shops/from-shop";
import { loadPublicShop } from "@/lib/shops/public";

type Props = {
  params: Promise<{ orgSlug: string; configuratorSlug: string }>;
  searchParams: Promise<ShopSearchParams>;
};

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
  return <ConfiguratorApp orgSlug={orgSlug} configuratorSlug={configuratorSlug} />;
}
