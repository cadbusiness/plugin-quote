import { emptyBlock, newBlockId } from "@/lib/shops/blocks";
import { cgvBody, cookiesBody, LEGAL_SLUGS, mentionsLegalesBody, privacyBody } from "@/lib/shops/legal";
import { DEFAULT_THEME } from "@/lib/shops/parse";
import type { ShopBlueprint, ShopLegal, ShopNavDraft, ShopPageDraft, ShopSeo } from "@/lib/shops/types";
import { getFunnelFamily } from "@/lib/funnels/families";
import { defaultTemplateForFamily } from "@/lib/funnels/templates";

const LEGAL_TITLES: Record<string, string> = {
  [LEGAL_SLUGS.mentions]: "Mentions légales",
  [LEGAL_SLUGS.cgv]: "Conditions générales",
  [LEGAL_SLUGS.privacy]: "Politique de confidentialité",
  [LEGAL_SLUGS.cookies]: "Cookies",
};

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
    blocks: [{ id: newBlockId(), type: "legal", heading: title, text: body }],
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

function defaultSeo(shopName: string, family: ReturnType<typeof getFunnelFamily>, city: string): ShopSeo {
  return {
    title: shopName,
    description: `${shopName} — ${family.blurb} Catalogue, catégories et demande de devis B2B. Pas de paiement en ligne.`,
    language: "fr-FR",
    geo: { locality: city, region: "", country: "FR", postalCode: "" },
  };
}

function homeFaq(familyLabel: string): { q: string; a: string }[] {
  return [
    {
      q: "Puis-je commander en ligne ?",
      a: "Non. Cette boutique prépare un devis. Vous ajoutez des produits ou décrivez le projet, puis l’équipe commerciale chiffre.",
    },
    {
      q: `Quels projets ${familyLabel.toLowerCase()} acceptez-vous ?`,
      a: "Les fiches du catalogue et le funnel de devis cadrent le besoin (usage, dimensionnement, options).",
    },
    {
      q: "Les prix affichés sont-ils fermes ?",
      a: "Ce sont des fourchettes catalogue. Le tarif contractuel figure sur le devis écrit.",
    },
  ];
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
  const seo = defaultSeo(input.name, family, legal.city);
  const faq = homeFaq(family.label);

  const home: ShopPageDraft = {
    kind: "home",
    slug: "accueil",
    title: "Accueil",
    seo: {
      title: input.name,
      description: seo.description,
      noindex: false,
    },
    blocks: [
      {
        ...emptyBlock("hero"),
        heading: input.name,
        sub: `${family.pitch} Catalogue, catégories, demande de devis.`,
        ctaLabel: "Demander un devis",
      },
      {
        ...emptyBlock("features"),
        heading: "Une vitrine de devis, pas une caisse",
        features: [
          { title: "Catalogue", text: "Fiches, photos, fourchettes de prix, catégories." },
          { title: "Devis", text: "Le prospect ajoute des produits et envoie une demande globale." },
          { title: "Référencement", text: "Pages indexables, données structurées, mentions légales." },
        ],
      },
      { ...emptyBlock("categories"), heading: "Rayons" },
      { ...emptyBlock("catalog"), heading: "Produits", limit: 8 },
      { ...emptyBlock("text"), heading: family.label, text: `${template.blurb} ${family.pitch}` },
      { ...emptyBlock("faq"), heading: "Questions fréquentes", faq },
      {
        ...emptyBlock("quote_cta"),
        heading: "Chiffrer un projet",
        text: "Décrivez le besoin ou partez du catalogue. Nous revenons avec un devis.",
        ctaLabel: "Ouvrir le devis",
      },
    ],
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
    blocks: [
      {
        ...emptyBlock("hero"),
        heading: "Catalogue",
        sub: "Parcourez les rayons, ouvrez une fiche, ajoutez au devis.",
        ctaLabel: "Demander un devis",
      },
      { ...emptyBlock("categories"), heading: "Catégories" },
      { ...emptyBlock("catalog"), heading: "Tous les produits", limit: 24 },
    ],
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
