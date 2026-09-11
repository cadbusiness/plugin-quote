import { COMPANY, SITE_URL, absoluteUrl } from "@/lib/marketing/site";

export const BLOG_TAG_DEFS = [
  { slug: "scoring", label: "Scoring" },
  { slug: "relances", label: "Relances" },
  { slug: "funnel", label: "Funnel" },
  { slug: "integrations", label: "Intégrations" },
  { slug: "catalogue", label: "Catalogue" },
] as const;

export type BlogTagSlug = (typeof BLOG_TAG_DEFS)[number]["slug"];
export type BlogTagLabel = (typeof BLOG_TAG_DEFS)[number]["label"];

/** Captures d’articles : `public/images/blog/{slug}.jpg|jpeg|png|webp`. */
export const BLOG_IMAGE_DIR = "/images/blog";

export function normalizeCoverPath(cover: string): string {
  const trimmed = cover.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `${BLOG_IMAGE_DIR}/${trimmed.replace(/^\/+/, "")}`;
}

export type BlogPost = {
  slug: string;
  path: string;
  title: string;
  description: string;
  publishedAt: string;
  readingMinutes: number;
  tags: readonly BlogTagSlug[];
  ctaHref: string;
  /**
   * Visuel optionnel (`/images/blog/…`, nom de fichier, ou URL).
   * Si absent, on cherche `public/images/blog/{slug}.{webp,jpg,jpeg,png}`.
   * Placeholder géométrique uniquement si aucun fichier n’existe.
   */
  cover?: string;
  pinned?: boolean;
};

export const BLOG_UI = {
  eyebrow: "Blog",
  heroTitle: "Ce qui fait aboutir un devis",
  heroSubtitle:
    "Relances, parcours, catalogue, intégration. Des guides concrets, pas des fiches produit.",
  tryFree: "Essayer gratuitement",
  featured: "À la une",
  grid: "Tous les articles",
  empty: "Aucun article sur ce thème pour l’instant",
  searchPlaceholder: "Chercher un article",
  byline: "Équipe QuoteBuilder",
  toc: "Sur cette page",
  midCtaTitle: "Voir un parcours en vrai",
  midCtaText: "Un funnel public démo, sans créer de compte.",
  midCtaLink: "Ouvrir la démo",
  related: "Continuer sur le même thème",
  tools: "Mini-outils liés",
  reading: "min de lecture",
} as const;

export const BLOG_DEMO_FUNNEL = "/c/demo/rayonnage";
export const BLOG_DEMO_SHOP = "/b/demo/vitrine";
export const BLOG_TOOL_SEQUENCE = "/outils/generateur-sequence-relances";
export const BLOG_TOOL_SCORE = "/outils/score-brief-devis";

export type BlogTool = {
  href: string;
  title: string;
  text: string;
  tags: readonly BlogTagSlug[];
};

export const BLOG_TOOLS: readonly BlogTool[] = [
  {
    href: "/outils/cout-devis-non-relance",
    title: "Coût d’un devis non relancé",
    text: "Devis par mois, panier, taux actuel et cible. L’écart annuel s’affiche. À coller dans un COMEX.",
    tags: ["relances"],
  },
  {
    href: BLOG_TOOL_SEQUENCE,
    title: "Générateur de séquence de relances",
    text: "T+0, T+4 h, T+24 h, T+3 j, T+7 j, T+30 j. Sujets et corps prêts à copier, selon le secteur.",
    tags: ["relances"],
  },
  {
    href: BLOG_TOOL_SCORE,
    title: "Score brief devis (0–100)",
    text: "Cinq questions pondérées. Score live et reco Hot / Warm / Cold / Parking avant de chiffrer.",
    tags: ["scoring", "funnel"],
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
    tags: ["scoring", "funnel"],
    ctaHref: BLOG_DEMO_FUNNEL,
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
    tags: ["funnel", "scoring"],
    ctaHref: BLOG_DEMO_FUNNEL,
  },
  {
    slug: "pourquoi-les-devis-meurent-sans-relance",
    path: "/blog/pourquoi-les-devis-meurent-sans-relance",
    title: "Pourquoi les devis meurent sans relance",
    description:
      "80 % des ventes demandent 5 relances. 44 % des équipes s’arrêtent à la première. Sources Invesp, Belkins, ZoomInfo, et ce qu’un calendrier de relances change vraiment.",
    publishedAt: "2026-09-11",
    readingMinutes: 12,
    tags: ["relances"],
    ctaHref: BLOG_TOOL_SEQUENCE,
  },
  {
    slug: "formulaire-contact-vs-funnel-devis-b2b",
    path: "/blog/formulaire-contact-vs-funnel-devis-b2b",
    title: "Formulaire de contact vs funnel de devis B2B",
    description:
      "Un formulaire recueille un message vague. Un funnel livre un dossier : produits, contraintes, budget, score. La différence qui change le pipeline.",
    publishedAt: "2026-09-11",
    readingMinutes: 11,
    tags: ["funnel"],
    ctaHref: BLOG_DEMO_FUNNEL,
  },
  {
    slug: "installer-widget-devis-wordpress-javascript",
    path: "/blog/installer-widget-devis-wordpress-javascript",
    title: "Installer un widget de devis (WordPress ou JavaScript)",
    description:
      "Deux lignes de JS ou le plugin WordPress + bloc Gutenberg. Le funnel s’affiche sur votre site, sans refonte ni nouveau thème.",
    publishedAt: "2026-09-11",
    readingMinutes: 10,
    tags: ["integrations"],
    ctaHref: BLOG_DEMO_SHOP,
  },
  {
    slug: "sync-catalogue-woocommerce-shopify-parcours-devis",
    path: "/blog/sync-catalogue-woocommerce-shopify-parcours-devis",
    title: "Sync catalogue WooCommerce / Shopify dans un parcours de devis",
    description:
      "Importer prix, photos et déclinaisons, puis les poser dans un funnel Si/Alors. La boutique reste la source ; le devis devient le dossier.",
    publishedAt: "2026-09-11",
    readingMinutes: 11,
    tags: ["catalogue", "integrations"],
    ctaHref: BLOG_DEMO_SHOP,
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function resolveBlogTag(value: string | undefined): BlogTagSlug | undefined {
  if (!value) return undefined;
  return BLOG_TAG_DEFS.find((tag) => tag.slug === value || tag.label === value)?.slug;
}

export function isBlogTag(value: string | undefined): value is BlogTagSlug {
  return !!resolveBlogTag(value);
}

export function blogTagLabel(slug: BlogTagSlug): BlogTagLabel {
  return BLOG_TAG_DEFS.find((tag) => tag.slug === slug)?.label ?? "Funnel";
}

export function primaryTag(post: Pick<BlogPost, "tags">): BlogTagSlug {
  return post.tags[0] ?? "funnel";
}

export function primaryTagLabel(post: Pick<BlogPost, "tags">): BlogTagLabel {
  return blogTagLabel(primaryTag(post));
}

export function getFeaturedPost(posts: readonly BlogPost[] = BLOG_POSTS) {
  const pinned = posts.find((post) => post.pinned);
  if (pinned) return pinned;
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title, "fr"))[0];
}

export function getRelatedPosts(post: BlogPost, limit = 3) {
  return BLOG_POSTS.filter(
    (item) => item.slug !== post.slug && item.tags.some((tag) => post.tags.includes(tag)),
  ).slice(0, limit);
}

export function getRelatedTools(post: BlogPost) {
  return BLOG_TOOLS.filter((tool) => tool.tags.some((tag) => post.tags.includes(tag)));
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
  const slug = resolveBlogTag(tag);
  const needle = q ? normalizeSearch(q) : "";
  return posts.filter((post) => {
    if (slug && !post.tags.includes(slug)) return false;
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

export function trimMetaDescription(text: string, max = 155) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  const slice = compact.slice(0, max);
  const cut = slice.lastIndexOf(" ");
  return (cut > 40 ? slice.slice(0, cut) : slice).replace(/[.,;:]$/, "");
}

export function blogArticleJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: trimMetaDescription(post.description),
    datePublished: post.publishedAt,
    inLanguage: "fr-FR",
    mainEntityOfPage: `${SITE_URL}${post.path}`,
    author: { "@type": "Organization", name: COMPANY.product, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: absoluteUrl(blogImageUrl(post)),
  };
}

export function blogBreadcrumbJsonLd(post: BlogPost) {
  const tag = primaryTag(post);
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
        name: blogTagLabel(tag),
        item: `${SITE_URL}/blog?tag=${encodeURIComponent(tag)}`,
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
