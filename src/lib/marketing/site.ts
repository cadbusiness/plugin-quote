import type { Metadata } from "next";

/** Canonical marketing origin. Never use the Vercel preview host for SEO. */
export const SITE_URL = "https://quotebuilder.co";

export const COMPANY = {
  product: "QuoteBuilder",
  legalName: "Vinci Liberta LTD",
  city: "Dublin",
  country: "Irlande",
  countryCode: "IE",
  email: "hello@quotebuilder.app",
  tagline: "La plateforme de devis B2B qui ne s’arrête pas au formulaire.",
} as const;

export const DEFAULT_TITLE = "Arrêtez de perdre vos devis";
export const DEFAULT_DESCRIPTION =
  "Parcours de devis pour le prospect, autopilote de relances pour vous. Dossiers complets, score, suivi. Plus de devis morts dans la boîte mail.";

export const OG_IMAGE = "/marketing/landing-hero.jpg";

export function absoluteUrl(path = "/") {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  index = true,
  type = "website",
  publishedTime,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = `${title} · ${COMPANY.product}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: fullTitle,
      description,
      url,
      type,
      locale: "fr_FR",
      siteName: COMPANY.product,
      images: [{ url: absoluteUrl(OG_IMAGE), alt: COMPANY.product }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl(OG_IMAGE)],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: COMPANY.product,
    legalName: COMPANY.legalName,
    url: SITE_URL,
    logo: absoluteUrl("/brand/quotebuilder-mark.png"),
    email: COMPANY.email,
    description: COMPANY.tagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: COMPANY.city,
      addressCountry: COMPANY.countryCode,
    },
    areaServed: ["FR", "BE", "CH", "LU", "IE", "EU"],
    sameAs: [SITE_URL],
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: COMPANY.product,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Quote management / B2B funnel",
    operatingSystem: "Web",
    inLanguage: "fr-FR",
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    creator: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: "0",
      highPrice: "159",
      offerCount: 4,
      description:
        "Free 0 €. Annuel : Starter 39 €/mois, Pro 79 €/mois, Agency 159 €/mois. Mensuel : 49 / 99 / 199 €.",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: COMPANY.product,
    url: SITE_URL,
    inLanguage: "fr-FR",
    publisher: { "@id": `${SITE_URL}/#organization` },
    description: DEFAULT_DESCRIPTION,
  };
}

export function rootJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationJsonLd(), softwareApplicationJsonLd(), websiteJsonLd()],
  };
}
