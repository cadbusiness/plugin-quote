import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontCrumbs } from "@/components/storefront/storefront-view";
import { groupProductsByCategory } from "@/lib/catalog/group";
import { breadcrumbJsonLd, itemListJsonLd, shopMetadata, websiteJsonLd } from "@/lib/shops/seo";
import { loadOr404, seoCtx, StorefrontBlocks, StorefrontShell, toModel } from "@/lib/shops/public-page";
import { categoryPath, categorySlug } from "@/lib/shops/urls";
import { emptyBlock } from "@/lib/shops/blocks";

type Props = { params: Promise<{ orgSlug: string; shopSlug: string; category: string }> };

function findCategory(shop: Awaited<ReturnType<typeof loadOr404>>, slug: string) {
  return groupProductsByCategory(shop.products).find((group) => categorySlug(group.label) === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, shopSlug, category } = await params;
  const shop = await loadOr404(orgSlug, shopSlug);
  const group = findCategory(shop, category);
  if (!group) notFound();
  return shopMetadata(
    seoCtx(shop, categoryPath(group.label), group.label, `Rayon ${group.label} — ${shop.doc.shop.name}. Demander un devis.`),
  );
}

export default async function ShopCategoryPage({ params }: Props) {
  const { orgSlug, shopSlug, category } = await params;
  const shop = await loadOr404(orgSlug, shopSlug);
  const group = findCategory(shop, category);
  if (!group) notFound();
  const path = categoryPath(group.label);
  const ctx = seoCtx(shop, path, group.label, `Rayon ${group.label}`);
  const jsonLd = [
    websiteJsonLd(ctx),
    breadcrumbJsonLd(ctx, [
      { name: shop.doc.shop.name, path: "/" },
      { name: "Catalogue", path: "/catalogue" },
      { name: group.label, path },
    ]),
    itemListJsonLd(ctx, group.products, path),
  ];
  const model = toModel(shop, jsonLd);
  const blocks = [
    { ...emptyBlock("hero"), heading: group.label, sub: `${group.products.length} produit${group.products.length > 1 ? "s" : ""} · sur devis`, ctaLabel: "Demander un devis" },
    { ...emptyBlock("catalog"), heading: group.label, category: group.label, limit: 48 },
  ];
  return (
    <StorefrontShell model={model}>
      <StorefrontCrumbs
        model={model}
        items={[
          { name: shop.doc.shop.name, path: "/" },
          { name: "Catalogue", path: "/catalogue" },
          { name: group.label, path },
        ]}
      />
      <StorefrontBlocks model={model} blocks={blocks} categoryFilter={group.label} />
    </StorefrontShell>
  );
}
