import { Render } from "@puckeditor/core/rsc";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProductHtml } from "@/components/catalog/product-html";
import { formatPrice } from "@/lib/format";
import { resolveShopHref } from "@/lib/shops/href";
import { migrateBlocksToLayout, parseLayout } from "@/lib/shops/layout";
import { shopPuckConfig } from "@/lib/shops/puck-config";
import { footerNav, headerNav, jsonLdScript, themeStyle } from "@/lib/shops/seo";
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
    <div className="min-h-dvh" style={themeStyle(model.theme)}>
      <JsonLd data={model.jsonLd ?? []} />
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4 lg:px-6">
          <Link href={home} className="mr-auto text-base font-semibold tracking-tight">
            {model.shopName}
          </Link>
          <nav aria-label="Navigation principale" className="flex flex-wrap items-center gap-1">
            {header.map((item) => (
              <Link
                key={`${item.location}-${item.sortOrder}-${item.label}`}
                href={hrefFor(model, item.href)}
                className="rounded-md px-3 py-1.5 text-sm hover:bg-black/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-black/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-8 text-sm lg:px-6">
          <p className="mr-auto text-xs opacity-70">
            {model.legal.company || model.shopName}
            {model.legal.city ? ` · ${model.legal.city}` : ""}
          </p>
          <nav aria-label="Mentions" className="flex flex-wrap gap-3 text-xs">
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
    <article className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:px-6">
      {product.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image_url} alt={product.name} className="w-full rounded-lg object-cover" />
      ) : (
        <div className="min-h-72 rounded-lg bg-black/5" />
      )}
      <div>
        {product.category ? (
          <p className="text-xs uppercase tracking-wide opacity-60">{product.category}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{product.name}</h1>
        <p className="mt-3 text-lg">{formatPrice(product.price_min, product.price_max, product.currency)}</p>
        <div className="mt-5">
          <ProductHtml html={product.description} />
        </div>
        {quoteHref ? (
          <Link
            href={quoteHref}
            className="mt-6 inline-flex rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: model.theme.accent }}
          >
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
    <nav aria-label="Fil d’Ariane" className="mx-auto max-w-6xl px-4 pt-6 text-xs opacity-70 lg:px-6">
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
