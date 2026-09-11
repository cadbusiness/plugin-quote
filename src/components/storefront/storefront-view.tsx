import { Render } from "@puckeditor/core/rsc";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProductHtml } from "@/components/catalog/product-html";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { formatPrice } from "@/lib/format";
import { resolveShopHref } from "@/lib/shops/href";
import { migrateBlocksToLayout, parseLayout } from "@/lib/shops/layout";
import { shopPuckConfig } from "@/lib/shops/puck-config";
import { footerNav, headerNav, jsonLdScript, themeStyle } from "@/lib/shops/seo";
import { cx, SHOP_BODY, SHOP_CONTAINER, SHOP_CTA, SHOP_HEADING } from "@/lib/shops/storefront-style";
import type { ShopBlock, ShopLayout, ShopProduct, StorefrontModel } from "@/lib/shops/types";
import { quoteFunnelPath } from "@/lib/shops/urls";

export type { StorefrontModel };

function hrefFor(model: StorefrontModel, href: string) {
  return resolveShopHref(href, {
    orgSlug: model.orgSlug,
    shopSlug: model.shopSlug,
    funnelSlug: model.funnelSlug,
  });
}

export function JsonLd({ data }: { data: unknown[] }) {
  if (!data.length) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }} />;
}

export function StorefrontShell({
  model,
  children,
}: {
  model: StorefrontModel;
  children: ReactNode;
}) {
  const header = headerNav(model.nav);
  const footer = footerNav(model.nav);
  const home = `/b/${model.orgSlug}/${model.shopSlug}`;
  return (
    <div className="min-h-dvh overflow-x-clip" style={themeStyle(model.theme)}>
      <JsonLd data={model.jsonLd ?? []} />
      <StorefrontHeader
        shopName={model.shopName}
        home={home}
        accent={model.theme.accent}
        items={header.map((item) => ({
          label: item.label,
          href: hrefFor(model, item.href),
        }))}
      />
      <main>{children}</main>
      <footer className="border-t border-black/10">
        <div className={cx(SHOP_CONTAINER, "flex flex-col gap-6 py-12 text-sm md:flex-row md:items-center")}>
          <p className="mr-auto text-sm text-[color-mix(in_srgb,var(--shop-text)_70%,var(--shop-bg))]">
            {model.legal.company || model.shopName}
            {model.legal.city ? ` · ${model.legal.city}` : ""}
          </p>
          <nav aria-label="Mentions" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {footer.map((item) => (
              <Link key={`${item.href}-${item.label}`} href={hrefFor(model, item.href)} className="underline-offset-2 hover:underline">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function StorefrontBlocks({
  model,
  layout,
  blocks,
  categoryFilter,
}: {
  model: StorefrontModel;
  layout?: ShopLayout;
  blocks?: ShopBlock[];
  categoryFilter?: string;
}) {
  const data = layout ?? migrateBlocksToLayout(blocks ?? []);
  return <Render config={shopPuckConfig} data={parseLayout(data)} metadata={{ model, categoryFilter }} />;
}

export function ProductDetail({
  model,
  product,
}: {
  model: StorefrontModel;
  product: ShopProduct;
}) {
  const quoteHref = quoteFunnelPath(model.orgSlug, model.funnelSlug);
  return (
    <article className={cx(SHOP_CONTAINER, "grid gap-10 py-12 lg:grid-cols-2 lg:items-start lg:gap-14 lg:py-16")}>
      {product.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image_url} alt={product.name} className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm" />
      ) : (
        <div className="aspect-[4/3] rounded-2xl bg-[color-mix(in_srgb,var(--shop-accent)_10%,transparent)]" />
      )}
      <div>
        {product.category ? (
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--shop-text)_55%,var(--shop-bg))]">
            {product.category}
          </p>
        ) : null}
        <h1 className={cx(SHOP_HEADING.h1, "mt-2 text-3xl sm:text-4xl lg:text-5xl")}>{product.name}</h1>
        <p className="mt-4 text-xl font-semibold" style={{ color: "var(--shop-accent)" }}>
          {formatPrice(product.price_min, product.price_max, product.currency)}
        </p>
        <div className={cx("mt-6", SHOP_BODY)}>
          <ProductHtml html={product.description} />
        </div>
        {quoteHref ? (
          <Link href={quoteHref} className={cx(SHOP_CTA, "mt-8")} style={{ background: model.theme.accent }}>
            Ajouter au devis
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function StorefrontCrumbs({
  model,
  items,
}: {
  model: StorefrontModel;
  items: { name: string; path: string }[];
}) {
  return (
    <nav aria-label="Fil d’Ariane" className={cx(SHOP_CONTAINER, "pt-8 text-sm text-[color-mix(in_srgb,var(--shop-text)_62%,var(--shop-bg))]")}>
      <ol className="flex flex-wrap gap-1">
        {items.map((item, index) => {
          const href = `/b/${model.orgSlug}/${model.shopSlug}${item.path === "/" ? "" : item.path}`;
          const last = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1">
              {index > 0 ? <span>/</span> : null}
              {last ? (
                <span className="text-[inherit]">{item.name}</span>
              ) : (
                <Link href={href} className="hover:underline">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
