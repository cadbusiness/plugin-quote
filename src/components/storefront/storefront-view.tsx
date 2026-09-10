import Link from "next/link";
import type { ReactNode } from "react";
import { ProductHtml } from "@/components/catalog/product-html";
import { formatPrice } from "@/lib/format";
import { groupProductsByCategory } from "@/lib/catalog/group";
import { resolveShopHref } from "@/lib/shops/href";
import { footerNav, headerNav, jsonLdScript, themeStyle } from "@/lib/shops/seo";
import type { ShopBlock, ShopLegal, ShopNavDraft, ShopProduct, ShopTheme } from "@/lib/shops/types";
import { categoryPath, productPath, quoteFunnelPath } from "@/lib/shops/urls";

export type StorefrontModel = {
  orgSlug: string;
  shopSlug: string;
  shopName: string;
  funnelSlug: string | null;
  theme: ShopTheme;
  legal: ShopLegal;
  nav: ShopNavDraft[];
  products: ShopProduct[];
  jsonLd?: unknown[];
};

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
  blocks,
  categoryFilter,
}: {
  model: StorefrontModel;
  blocks: ShopBlock[];
  categoryFilter?: string;
}) {
  return (
    <div>
      {blocks.map((block) => (
        <StorefrontBlock key={block.id} model={model} block={block} categoryFilter={categoryFilter} />
      ))}
    </div>
  );
}

function StorefrontBlock({
  model,
  block,
  categoryFilter,
}: {
  model: StorefrontModel;
  block: ShopBlock;
  categoryFilter?: string;
}) {
  const quoteHref = quoteFunnelPath(model.orgSlug, model.funnelSlug);
  const groups = groupProductsByCategory(model.products);
  const accent = model.theme.accent;

  if (block.type === "hero") {
    return (
      <section className="border-b border-black/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-2 lg:items-center lg:px-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">{block.heading || model.shopName}</h1>
            {block.sub ? <p className="mt-4 max-w-xl text-base leading-7 opacity-80">{block.sub}</p> : null}
            {quoteHref ? (
              <Link
                href={quoteHref}
                className="mt-6 inline-flex rounded-md px-4 py-2 text-sm font-medium text-white"
                style={{ background: accent }}
              >
                {block.ctaLabel || "Demander un devis"}
              </Link>
            ) : null}
          </div>
          {block.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.image} alt={block.imageAlt || block.heading || ""} className="w-full rounded-lg object-cover" />
          ) : null}
        </div>
      </section>
    );
  }

  if (block.type === "text") {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        {block.heading ? <h2 className="text-xl font-semibold">{block.heading}</h2> : null}
        {block.text ? (
          <div className="mt-3 max-w-3xl text-sm leading-7 opacity-80 whitespace-pre-wrap">{block.text}</div>
        ) : null}
      </section>
    );
  }

  if (block.type === "image" && block.image) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={block.image} alt={block.imageAlt || ""} className="w-full rounded-lg object-cover" />
      </section>
    );
  }

  if (block.type === "categories") {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        {block.heading ? <h2 className="text-xl font-semibold">{block.heading}</h2> : null}
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <li key={group.key}>
              <Link
                href={`/b/${model.orgSlug}/${model.shopSlug}${categoryPath(group.label)}`}
                className="block rounded-lg px-4 py-4 ring-1 ring-black/10 hover:bg-black/5"
              >
                <span className="font-medium">{group.label}</span>
                <span className="mt-1 block text-xs opacity-60">{group.products.length} produit{group.products.length > 1 ? "s" : ""}</span>
              </Link>
            </li>
          ))}
        </ul>
        {!groups.length ? <p className="mt-3 text-sm opacity-60">Le catalogue se remplira depuis QuoteBuilder.</p> : null}
      </section>
    );
  }

  if (block.type === "catalog") {
    const wanted = categoryFilter || block.category || "";
    const listed = wanted
      ? model.products.filter((product) => (product.category || "Autres") === wanted)
      : model.products;
    const sliced = listed.slice(0, block.limit || 12);
    return (
      <section className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        {block.heading ? <h2 className="text-xl font-semibold">{block.heading}</h2> : null}
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sliced.map((product) => (
            <li key={product.id}>
              <ProductCard model={model} product={product} />
            </li>
          ))}
        </ul>
        {!sliced.length ? <p className="mt-3 text-sm opacity-60">Aucun produit dans ce rayon pour l’instant.</p> : null}
      </section>
    );
  }

  if (block.type === "quote_cta") {
    return (
      <section className="border-y border-black/10" style={{ background: `${accent}12` }}>
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <h2 className="text-xl font-semibold">{block.heading || "Demander un devis"}</h2>
          {block.text ? <p className="mt-2 max-w-2xl text-sm leading-6 opacity-80">{block.text}</p> : null}
          {quoteHref ? (
            <Link
              href={quoteHref}
              className="mt-5 inline-flex rounded-md px-4 py-2 text-sm font-medium text-white"
              style={{ background: accent }}
            >
              {block.ctaLabel || "Ouvrir le devis"}
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  if (block.type === "faq") {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        {block.heading ? <h2 className="text-xl font-semibold">{block.heading}</h2> : null}
        <dl className="mt-4 max-w-3xl divide-y divide-black/10">
          {(block.faq ?? []).map((item) => (
            <div key={item.q} className="py-4">
              <dt className="font-medium">{item.q}</dt>
              <dd className="mt-1 text-sm leading-6 opacity-80">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  if (block.type === "features") {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        {block.heading ? <h2 className="text-xl font-semibold">{block.heading}</h2> : null}
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {(block.features ?? []).map((item) => (
            <li key={item.title} className="rounded-lg px-4 py-4 ring-1 ring-black/10">
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-sm leading-6 opacity-75">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (block.type === "legal") {
    return (
      <article className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">{block.heading}</h1>
        <div className="mt-6 whitespace-pre-wrap text-sm leading-7 opacity-85">{block.text}</div>
      </article>
    );
  }

  return null;
}

export function ProductCard({ model, product }: { model: StorefrontModel; product: ShopProduct }) {
  return (
    <Link
      href={`/b/${model.orgSlug}/${model.shopSlug}${productPath(product)}`}
      className="block overflow-hidden rounded-lg ring-1 ring-black/10 hover:bg-black/5"
    >
      {product.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image_url} alt={product.name} className="h-44 w-full object-cover" />
      ) : (
        <div className="h-44 bg-black/5" />
      )}
      <div className="px-4 py-3">
        <p className="font-medium">{product.name}</p>
        <p className="mt-1 text-sm opacity-70">{formatPrice(product.price_min, product.price_max, product.currency)}</p>
      </div>
    </Link>
  );
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
