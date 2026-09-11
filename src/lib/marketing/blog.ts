import { COMPANY, SITE_URL, absoluteUrl } from "@/lib/marketing/site";

export const BLOG_TAGS = ["Relances", "Funnel", "Intégrations", "Scoring"] as const;

export type BlogTag = (typeof BLOG_TAGS)[number];

export type BlogPost = {
  slug: string;
  path: string;
  title: string;
  description: string;
  publishedAt: string;
  readingMinutes: number;
  eyebrow: string;
  tag: BlogTag;
  cover?: string;
  pinned?: boolean;
};

export const BLOG_UI = {
  tryFree: "Essayer Free",
  byline: "Équipe QuoteBuilder",
  searchPlaceholder: "Rechercher un article",
  featured: "À la une",
  toc: "Sommaire",
  related: "Dans le même sujet",
  tools: "Outils liés",
  midCtaTitle: "Voir un parcours en démo",
  midCtaText: "Le funnel rayonnage, déjà branché catalogue.",
  midCtaLink: "Ouvrir le funnel",
  allTags: "Tous",
  empty: "Aucun article pour ce filtre.",
  reading: "min de lecture",
} as const;

export const BLOG_DEMO_FUNNEL = "/c/demo/rayonnage";

export type BlogTool = {
  href: string;
  title: string;
  text: string;
  tags: readonly BlogTag[];
};

export const BLOG_TOOLS: readonly BlogTool[] = [
  {
    href: "/outils/cout-devis-non-relance",
    title: "Coût d’un devis non relancé",
    text: "Devis par mois, panier, taux actuel et cible. L’écart annuel s’affiche. À coller dans un COMEX.",
    tags: ["Relances"],
  },
  {
    href: "/outils/generateur-sequence-relances",
    title: "Générateur de séquence de relances",
    text: "T+0, T+4 h, T+24 h, T+3 j, T+7 j, T+30 j. Sujets et corps prêts à copier, selon le secteur.",
    tags: ["Relances"],
  },
  {
    href: "/outils/score-brief-devis",
    title: "Score brief devis (0–100)",
    text: "Cinq questions pondérées. Score live et reco Hot / Warm / Cold / Parking avant de chiffrer.",
    tags: ["Scoring", "Funnel"],
  },
];

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
    tag: "Scoring",
    pinned: true,
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
    tag: "Funnel",
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
    tag: "Relances",
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
    tag: "Funnel",
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
    tag: "Intégrations",
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
    tag: "Intégrations",
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function isBlogTag(value: string | undefined): value is BlogTag {
  return !!value && (BLOG_TAGS as readonly string[]).includes(value);
}

export function getFeaturedPost(posts: readonly BlogPost[] = BLOG_POSTS) {
  const pinned = posts.find((post) => post.pinned);
  if (pinned) return pinned;
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title, "fr"))[0];
}

export function getRelatedPosts(post: BlogPost, limit = 3) {
  return BLOG_POSTS.filter((item) => item.slug !== post.slug && item.tag === post.tag).slice(0, limit);
}

export function getRelatedTools(tag: BlogTag) {
  return BLOG_TOOLS.filter((tool) => tool.tags.includes(tag));
}

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function filterBlogPosts(
  posts: readonly BlogPost[],
  { tag, q }: { tag?: string; q?: string } = {},
) {
  const needle = q ? normalizeSearch(q) : "";
  return posts.filter((post) => {
    if (tag && isBlogTag(tag) && post.tag !== tag) return false;
    if (!needle) return true;
    return normalizeSearch(`${post.title} ${post.description}`).includes(needle);
  });
}

export function formatBlogDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function stripMarkdownInline(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

export function slugifyHeading(text: string) {
  return stripMarkdownInline(text)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractMarkdownH2s(source: string) {
  const headings: { id: string; text: string }[] = [];
  for (const line of source.replace(/\r\n/g, "\n").split("\n")) {
    if (line.startsWith("## ") && !line.startsWith("### ")) {
      const text = stripMarkdownInline(line.slice(3));
      if (!text) continue;
      headings.push({ id: slugifyHeading(text), text });
    }
  }
  return headings;
}

export function midArticleHeadingIndex(headingCount: number) {
  if (headingCount < 3) return -1;
  return Math.max(2, Math.floor(headingCount / 2) - 1);
}

export function blogOgImagePath(post: Pick<BlogPost, "path">) {
  return `${post.path}/opengraph-image`;
}

export function blogImageUrl(post: BlogPost) {
  if (post.cover) {
    return post.cover.startsWith("http") ? post.cover : post.cover;
  }
  return blogOgImagePath(post);
}

export function blogArticleJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    inLanguage: "fr-FR",
    mainEntityOfPage: `${SITE_URL}${post.path}`,
    author: { "@type": "Organization", name: COMPANY.product, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: absoluteUrl(blogImageUrl(post)),
  };
}

export function blogBreadcrumbJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: post.tag,
        item: `${SITE_URL}/blog?tag=${encodeURIComponent(post.tag)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}${post.path}`,
      },
    ],
  };
}
