export type BlogPost = {
  slug: string;
  path: string;
  title: string;
  description: string;
  publishedAt: string;
  readingMinutes: number;
  eyebrow: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "score-demande-devis-b2b",
    path: "/blog/score-demande-devis-b2b",
    title: "Comment scorer et prioriser une demande de devis B2B (grille 0–100)",
    description:
      "Guide pratique : scorer les demandes de devis B2B (fit, urgence, complétude, budget, comportement). Grille 0–100, playbooks Hot/Warm/Cold, métriques et FAQ.",
    publishedAt: "2026-09-11",
    readingMinutes: 12,
    eyebrow: "Pilotage",
  },
  {
    slug: "configurateur-devis-vs-excel-pdf",
    path: "/blog/configurateur-devis-vs-excel-pdf",
    title: "Configurateur de devis vs Excel + PDF + email : ce qui change vraiment",
    description:
      "Comparatif pragmatique : parcours / configurateur de devis contre Excel, PDF et emails. Erreurs, marge, cycle time, multi-décideurs, migration et FAQ pour PME B2B.",
    publishedAt: "2026-09-11",
    readingMinutes: 11,
    eyebrow: "Acquisition",
  },
  {
    slug: "pourquoi-les-devis-meurent-sans-relance",
    path: "/blog/pourquoi-les-devis-meurent-sans-relance",
    title: "Pourquoi les devis meurent sans relance",
    description:
      "80 % des ventes demandent 5 relances. 44 % des équipes s’arrêtent à la première. Sources Invesp, Belkins, ZoomInfo, et ce qu’un calendrier de relances change vraiment.",
    publishedAt: "2026-09-11",
    readingMinutes: 12,
    eyebrow: "Pilotage",
  },
  {
    slug: "formulaire-contact-vs-funnel-devis-b2b",
    path: "/blog/formulaire-contact-vs-funnel-devis-b2b",
    title: "Formulaire de contact vs funnel de devis B2B",
    description:
      "Un formulaire recueille un message vague. Un funnel livre un dossier : produits, contraintes, budget, score. La différence qui change le pipeline.",
    publishedAt: "2026-09-11",
    readingMinutes: 11,
    eyebrow: "Acquisition",
  },
  {
    slug: "installer-widget-devis-wordpress-javascript",
    path: "/blog/installer-widget-devis-wordpress-javascript",
    title: "Installer un widget de devis (WordPress ou JavaScript)",
    description:
      "Deux lignes de JS ou le plugin WordPress + bloc Gutenberg. Le funnel s’affiche sur votre site, sans refonte ni nouveau thème.",
    publishedAt: "2026-09-11",
    readingMinutes: 10,
    eyebrow: "Intégration",
  },
  {
    slug: "sync-catalogue-woocommerce-shopify-parcours-devis",
    path: "/blog/sync-catalogue-woocommerce-shopify-parcours-devis",
    title: "Sync catalogue WooCommerce / Shopify dans un parcours de devis",
    description:
      "Importer prix, photos et déclinaisons, puis les poser dans un funnel Si/Alors. La boutique reste la source ; le devis devient le dossier.",
    publishedAt: "2026-09-11",
    readingMinutes: 11,
    eyebrow: "Catalogue",
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
