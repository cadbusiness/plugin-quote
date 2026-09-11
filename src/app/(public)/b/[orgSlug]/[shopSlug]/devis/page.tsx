import type { Metadata } from "next";
import Link from "next/link";
import { ConfiguratorApp } from "@/components/configurator/configurator-app";
import type { ConfiguratorThemeOverride } from "@/lib/configurator/theme";
import { breadcrumbJsonLd, shopMetadata, websiteJsonLd } from "@/lib/shops/seo";
import { loadOr404, seoCtx, StorefrontShell, toModel } from "@/lib/shops/public-page";
import { cx, SHOP_BODY, SHOP_CONTAINER, SHOP_CTA, SHOP_HEADING } from "@/lib/shops/storefront-style";
import { shopPagePath } from "@/lib/shops/urls";

type Props = {
  params: Promise<{ orgSlug: string; shopSlug: string }>;
  searchParams: Promise<{ product?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, shopSlug } = await params;
  const shop = await loadOr404(orgSlug, shopSlug);
  return shopMetadata(seoCtx(shop, "/devis", "Devis", `Demander un devis — ${shop.doc.shop.name}`));
}

export default async function ShopDevisPage({ params, searchParams }: Props) {
  const { orgSlug, shopSlug } = await params;
  const shop = await loadOr404(orgSlug, shopSlug);
  const { product: productPrefill } = await searchParams;
  const ctx = seoCtx(shop, "/devis", "Devis", `Demander un devis — ${shop.doc.shop.name}`);
  const jsonLd = [
    websiteJsonLd(ctx),
    breadcrumbJsonLd(ctx, [
      { name: shop.doc.shop.name, path: "/" },
      { name: "Devis", path: "/devis" },
    ]),
  ];
  const model = toModel(shop, jsonLd);
  const catalogueHref = `/b/${shop.orgSlug}/${shop.doc.shop.slug}${shopPagePath("catalogue")}`;

  return (
    <StorefrontShell model={model}>
      {shop.funnelSlug ? (
        <ShopEmbeddedQuote
          orgSlug={shop.orgSlug}
          shopSlug={shop.doc.shop.slug}
          shopConfiguratorId={shop.doc.shop.configurator_id}
          configuratorSlug={shop.funnelSlug}
          productPrefill={productPrefill}
          themeOverride={{
            accent: shop.theme.accent,
            background: shop.theme.background,
            text: shop.theme.text,
          }}
        />
      ) : (
        <ShopQuoteUnavailable shopName={shop.doc.shop.name} catalogueHref={catalogueHref} />
      )}
    </StorefrontShell>
  );
}

function ShopEmbeddedQuote({
  orgSlug,
  shopSlug,
  shopConfiguratorId,
  configuratorSlug,
  productPrefill,
  themeOverride,
}: {
  orgSlug: string;
  shopSlug: string;
  shopConfiguratorId: string | null;
  configuratorSlug: string;
  productPrefill?: string;
  themeOverride: ConfiguratorThemeOverride;
}) {
  return (
    <div className="min-h-[60vh]">
      <ConfiguratorApp
        orgSlug={orgSlug}
        shopSlug={shopSlug}
        shopConfiguratorId={shopConfiguratorId ?? undefined}
        configuratorSlug={configuratorSlug}
        productPrefill={productPrefill}
        embedded
        themeOverride={themeOverride}
      />
    </div>
  );
}

function ShopQuoteUnavailable({ shopName, catalogueHref }: { shopName: string; catalogueHref: string }) {
  return (
    <section className={cx(SHOP_CONTAINER, "py-16 md:py-20")}>
      <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-black/15 px-6 py-12 text-center">
        <h1 className={SHOP_HEADING.h1}>Devis</h1>
        <p className={cx(SHOP_BODY, "mx-auto mt-4")}>
          {shopName} n’a pas encore relié de configurateur à cette vitrine. Parcourez le catalogue en attendant.
        </p>
        <Link href={catalogueHref} className={cx(SHOP_CTA, "mt-8")} style={{ background: "var(--shop-accent)" }}>
          Voir le catalogue
        </Link>
      </div>
    </section>
  );
}
