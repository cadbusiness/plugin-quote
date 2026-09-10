import type { Metadata } from "next";
import { StorefrontCrumbs } from "@/components/storefront/storefront-view";
import { breadcrumbJsonLd, itemListJsonLd, shopMetadata, websiteJsonLd } from "@/lib/shops/seo";
import { loadOr404, seoCtx, StorefrontBlocks, StorefrontShell, toModel } from "@/lib/shops/public-page";

type Props = { params: Promise<{ orgSlug: string; shopSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, shopSlug } = await params;
  const shop = await loadOr404(orgSlug, shopSlug);
  const page = shop.pages.find((item) => item.kind === "catalog");
  return shopMetadata(
    seoCtx(shop, "/catalogue", page?.seo.title || `Catalogue · ${shop.doc.shop.name}`, page?.seo.description || shop.seo.description),
  );
}

export default async function ShopCatalogPage({ params }: Props) {
  const { orgSlug, shopSlug } = await params;
  const shop = await loadOr404(orgSlug, shopSlug);
  const page = shop.pages.find((item) => item.kind === "catalog");
  const ctx = seoCtx(shop, "/catalogue", page?.title || "Catalogue", page?.seo.description || "");
  const jsonLd = [
    websiteJsonLd(ctx),
    breadcrumbJsonLd(ctx, [
      { name: shop.doc.shop.name, path: "/" },
      { name: "Catalogue", path: "/catalogue" },
    ]),
    itemListJsonLd(ctx, shop.products, "/catalogue"),
  ];
  const model = toModel(shop, jsonLd);
  return (
    <StorefrontShell model={model}>
      <StorefrontCrumbs
        model={model}
        items={[
          { name: shop.doc.shop.name, path: "/" },
          { name: "Catalogue", path: "/catalogue" },
        ]}
      />
      <StorefrontBlocks model={model} layout={page?.blocks} />
    </StorefrontShell>
  );
}
