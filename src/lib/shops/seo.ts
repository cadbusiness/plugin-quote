import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { groupProductsByCategory } from "@/lib/catalog/group";
import { legalAddress } from "@/lib/shops/legal";
import type { ShopLegal, ShopNavDraft, ShopPageDraft, ShopProduct, ShopSeo, ShopTheme } from "@/lib/shops/types";
import { categoryPath, productPath, shopAbsoluteUrl, shopPagePath } from "@/lib/shops/urls";

export type ShopSeoContext = {
  origin: string;
  orgSlug: string;
  shopSlug: string;
  shopName: string;
  seo: ShopSeo;
  legal: ShopLegal;
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
  image?: string | null;
};

export function pageTitle(pageTitleValue: string, shopName: string) {
  const trimmed = pageTitleValue.trim();
  if (!trimmed || trimmed === shopName) return shopName;
  if (trimmed.endsWith(shopName)) return trimmed;
  return `${trimmed} · ${shopName}`;
}

export function clipDescription(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function shopMetadata(ctx: ShopSeoContext): Metadata {
  const canonical = shopAbsoluteUrl(ctx.origin, ctx.orgSlug, ctx.shopSlug, ctx.path);
  const title = pageTitle(ctx.title || ctx.seo.title || ctx.shopName, ctx.shopName);
  const description = clipDescription(ctx.description || ctx.seo.description);
  const index = ctx.noindex ? false : true;
  return {
    title,
    description: description || undefined,
    alternates: { canonical },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: ctx.seo.language.replace("-", "_") || "fr_FR",
      url: canonical,
      siteName: ctx.shopName,
      title,
      description: description || undefined,
      images: ctx.image ? [{ url: ctx.image, alt: title }] : undefined,
    },
    twitter: {
      card: ctx.image ? "summary_large_image" : "summary",
      title,
      description: description || undefined,
    },
    other: {
      language: ctx.seo.language || "fr-FR",
      ...(ctx.seo.geo.locality ? { "geo.placename": ctx.seo.geo.locality } : {}),
      ...(ctx.seo.geo.region ? { "geo.region": ctx.seo.geo.region } : {}),
    },
  };
}

function orgNode(shopName: string, legal: ShopLegal, url: string) {
  const address = legalAddress(legal);
  return {
    "@type": legal.address ? "LocalBusiness" : "Organization",
    name: legal.company || shopName,
    url,
    email: legal.email || undefined,
    telephone: legal.phone || undefined,
    address: address
      ? {
          "@type": "PostalAddress",
          streetAddress: legal.address || undefined,
          addressLocality: legal.city || undefined,
          postalCode: legal.postalCode || undefined,
          addressCountry: "FR",
        }
      : undefined,
  };
}

export function websiteJsonLd(ctx: ShopSeoContext) {
  const url = shopAbsoluteUrl(ctx.origin, ctx.orgSlug, ctx.shopSlug);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ctx.shopName,
    url,
    inLanguage: ctx.seo.language || "fr-FR",
    publisher: orgNode(ctx.shopName, ctx.legal, url),
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/catalogue?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(ctx: ShopSeoContext, crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: shopAbsoluteUrl(ctx.origin, ctx.orgSlug, ctx.shopSlug, crumb.path),
    })),
  };
}

export function itemListJsonLd(
  ctx: ShopSeoContext,
  products: ShopProduct[],
  listPath: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 40).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: shopAbsoluteUrl(ctx.origin, ctx.orgSlug, ctx.shopSlug, productPath(product)),
      name: product.name,
    })),
    url: shopAbsoluteUrl(ctx.origin, ctx.orgSlug, ctx.shopSlug, listPath),
  };
}

export function productJsonLd(
  ctx: ShopSeoContext,
  product: ShopProduct,
  quoteUrl: string | null,
) {
  const url = shopAbsoluteUrl(ctx.origin, ctx.orgSlug, ctx.shopSlug, productPath(product));
  const offer =
    product.price_min != null || product.price_max != null
      ? {
          "@type": "Offer",
          url,
          priceCurrency: product.currency || "EUR",
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: product.currency || "EUR",
            minPrice: product.price_min ?? undefined,
            maxPrice: product.price_max ?? product.price_min ?? undefined,
          },
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ? clipDescription(product.description.replace(/<[^>]+>/g, " "), 300) : undefined,
    image: product.image_url || undefined,
    sku: product.sku || undefined,
    category: product.category || undefined,
    brand: { "@type": "Brand", name: ctx.legal.company || ctx.shopName },
    url,
    offers: offer,
    potentialAction: quoteUrl
      ? { "@type": "QuoteAction", target: quoteUrl, name: "Demander un devis" }
      : undefined,
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  const valid = items.filter((item) => item.q.trim() && item.a.trim());
  if (!valid.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: valid.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function sitemapEntries(input: {
  origin: string;
  orgSlug: string;
  shopSlug: string;
  pages: Pick<ShopPageDraft, "slug" | "isPublished" | "seo">[];
  products: ShopProduct[];
  updatedAt: string;
}) {
  const lastmod = input.updatedAt;
  const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [];
  function add(path: string, changefreq: string, priority: string) {
    urls.push({
      loc: shopAbsoluteUrl(input.origin, input.orgSlug, input.shopSlug, path),
      lastmod,
      changefreq,
      priority,
    });
  }
  add("/", "weekly", "1.0");
  add("/catalogue", "weekly", "0.9");
  add("/devis", "weekly", "0.8");
  for (const page of input.pages) {
    if (!page.isPublished || page.seo.noindex) continue;
    const path = shopPagePath(page.slug);
    if (path === "/" || path === "/catalogue") continue;
    add(path, "yearly", "0.4");
  }
  for (const group of groupProductsByCategory(input.products)) {
    add(categoryPath(group.label), "weekly", "0.7");
  }
  for (const product of input.products) {
    add(productPath(product), "weekly", "0.8");
  }
  return urls;
}

export function robotsTxt(origin: string, orgSlug: string, shopSlug: string) {
  const sitemap = shopAbsoluteUrl(origin, orgSlug, shopSlug, "/sitemap.xml");
  return `User-agent: *
Allow: /
Sitemap: ${sitemap}
`;
}

export function llmsTxt(input: {
  shopName: string;
  seo: ShopSeo;
  legal: ShopLegal;
  pages: { title: string; slug: string }[];
  categories: string[];
  quoteUrl: string | null;
  origin: string;
  orgSlug: string;
  shopSlug: string;
}) {
  const url = shopAbsoluteUrl(input.origin, input.orgSlug, input.shopSlug);
  const lines = [
    `# ${input.shopName}`,
    "",
    `> Mini-site B2B sur devis. Catalogue et fiches produits. Pas de paiement en ligne.`,
    "",
    input.seo.description ? input.seo.description : "",
    "",
    `Éditeur : ${input.legal.company || input.shopName}`,
    input.legal.city ? `Zone : ${[input.seo.geo.locality || input.legal.city, input.seo.geo.region].filter(Boolean).join(", ")}` : "",
    "",
    "## Pages",
    `- Accueil : ${url}`,
    `- Catalogue : ${url}/catalogue`,
    ...input.pages
      .filter((page) => page.slug && page.slug !== "accueil" && page.slug !== "catalogue")
      .map((page) => `- ${page.title} : ${url}${shopPagePath(page.slug)}`),
    "",
    "## Catégories",
    ...(input.categories.length ? input.categories.map((label) => `- ${label} : ${url}${categoryPath(label)}`) : ["- (catalogue à peupler)"]),
    "",
    input.quoteUrl ? `## Devis\nDemander un devis : ${input.quoteUrl}` : "",
    "",
    "## Légal",
    "Mentions légales, CGV, confidentialité et cookies sont publiées. Cette vitrine prépare un devis, elle n’est pas un checkout.",
  ];
  return lines.filter((line) => line !== undefined).join("\n").replace(/\n{3,}/g, "\n\n");
}

export function jsonLdScript(data: unknown | unknown[]) {
  const payload = Array.isArray(data) ? data.filter(Boolean) : data;
  return JSON.stringify(payload);
}

export function headerNav(nav: ShopNavDraft[]) {
  return nav.filter((item) => item.location === "header").sort((a, b) => a.sortOrder - b.sortOrder);
}

export function footerNav(nav: ShopNavDraft[]) {
  return nav.filter((item) => item.location === "footer").sort((a, b) => a.sortOrder - b.sortOrder);
}

export function themeStyle(theme: ShopTheme): CSSProperties {
  return {
    ["--shop-accent" as string]: theme.accent,
    ["--shop-bg" as string]: theme.background,
    ["--shop-text" as string]: theme.text,
    background: theme.background,
    color: theme.text,
  };
}
