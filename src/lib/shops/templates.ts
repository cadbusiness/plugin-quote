import { buildCatalogLayout, buildHomeLayout, shopCopyForFamily } from "@/lib/shops/composition";
import { emptyNode } from "@/lib/shops/layout";
import { cgvBody, cookiesBody, LEGAL_SLUGS, mentionsLegalesBody, privacyBody } from "@/lib/shops/legal";
import { DEFAULT_THEME } from "@/lib/shops/parse";
import type { ShopBlueprint, ShopLayout, ShopLegal, ShopNavDraft, ShopPageDraft, ShopSeo } from "@/lib/shops/types";
import { getFunnelFamily } from "@/lib/funnels/families";
import { defaultTemplateForFamily } from "@/lib/funnels/templates";

const LEGAL_TITLES: Record<string, string> = {
  [LEGAL_SLUGS.mentions]: "Mentions légales",
  [LEGAL_SLUGS.cgv]: "Conditions générales",
  [LEGAL_SLUGS.privacy]: "Politique de confidentialité",
  [LEGAL_SLUGS.cookies]: "Cookies",
};

function asLayout(content: ShopLayout["content"]): ShopLayout {
  return { root: { props: {} }, content };
}

function legalPage(slug: string, title: string, body: string, sortOrder: number): ShopPageDraft {
  return {
    kind: "legal",
    slug,
    title,
    seo: {
      title,
      description: `${title} de la boutique. Informations obligatoires.`,
      noindex: false,
    },
    blocks: asLayout([emptyNode("Legal", { heading: title, text: body })]),
    isPublished: true,
    sortOrder,
  };
}

function defaultLegal(): ShopLegal {
  return {
    company: "",
    siret: "",
    address: "",
    city: "",
    postalCode: "",
    email: "",
    phone: "",
    director: "",
  };
}

function defaultSeo(shopName: string, description: string, city: string): ShopSeo {
  return {
    title: shopName,
    description,
    language: "fr-FR",
    geo: { locality: city, region: "", country: "FR", postalCode: "" },
  };
}

export function buildShopBlueprint(input: {
  name: string;
  sector: string;
  orgName: string;
  legal?: Partial<ShopLegal>;
}): ShopBlueprint {
  const family = getFunnelFamily(input.sector);
  const template = defaultTemplateForFamily(family.id);
  const legal: ShopLegal = { ...defaultLegal(), ...input.legal, company: input.legal?.company || input.orgName };
  const copy = shopCopyForFamily({ name: input.name, sector: family.id, city: legal.city });
  const seo = defaultSeo(input.name, copy.seoDescription, legal.city);
  const homeInput = { name: input.name, sector: family.id, city: legal.city };

  const home: ShopPageDraft = {
    kind: "home",
    slug: "accueil",
    title: "Accueil",
    seo: {
      title: input.name,
      description: seo.description,
      noindex: false,
    },
    blocks: buildHomeLayout(homeInput),
    isPublished: true,
    sortOrder: 0,
  };

  const catalog: ShopPageDraft = {
    kind: "catalog",
    slug: "catalogue",
    title: "Catalogue",
    seo: {
      title: `Catalogue ${input.name}`,
      description: `Catalogue ${family.label.toLowerCase()} — ${input.name}. Fiches produits et demande de devis.`,
      noindex: false,
    },
    blocks: buildCatalogLayout(homeInput),
    isPublished: true,
    sortOrder: 1,
  };

  const pages: ShopPageDraft[] = [
    home,
    catalog,
    legalPage(LEGAL_SLUGS.mentions, LEGAL_TITLES[LEGAL_SLUGS.mentions]!, mentionsLegalesBody(legal, input.name), 10),
    legalPage(LEGAL_SLUGS.cgv, LEGAL_TITLES[LEGAL_SLUGS.cgv]!, cgvBody(legal, input.name), 11),
    legalPage(LEGAL_SLUGS.privacy, LEGAL_TITLES[LEGAL_SLUGS.privacy]!, privacyBody(legal, input.name), 12),
    legalPage(LEGAL_SLUGS.cookies, LEGAL_TITLES[LEGAL_SLUGS.cookies]!, cookiesBody(legal, input.name), 13),
  ];

  const nav: ShopNavDraft[] = [
    { location: "header", label: "Accueil", href: "/", sortOrder: 0 },
    { location: "header", label: "Catalogue", href: "/catalogue", sortOrder: 1 },
    { location: "header", label: "Devis", href: "/devis", sortOrder: 2 },
    { location: "footer", label: "Mentions légales", href: `/${LEGAL_SLUGS.mentions}`, sortOrder: 0 },
    { location: "footer", label: "CGV", href: `/${LEGAL_SLUGS.cgv}`, sortOrder: 1 },
    { location: "footer", label: "Confidentialité", href: `/${LEGAL_SLUGS.privacy}`, sortOrder: 2 },
    { location: "footer", label: "Cookies", href: `/${LEGAL_SLUGS.cookies}`, sortOrder: 3 },
  ];

  return {
    name: input.name,
    sector: family.id,
    theme: { ...DEFAULT_THEME, accent: template.accent || DEFAULT_THEME.accent },
    seo,
    legal,
    pages,
    nav,
  };
}

export function requiredShopSlugs() {
  return ["accueil", "catalogue", LEGAL_SLUGS.mentions, LEGAL_SLUGS.cgv, LEGAL_SLUGS.privacy, LEGAL_SLUGS.cookies];
}
