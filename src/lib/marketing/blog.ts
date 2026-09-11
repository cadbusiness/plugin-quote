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

/** Écrans démo (données fictives uniquement). */
const WALKTHROUGH = `${BLOG_IMAGE_DIR}/visite-guidee-parcours-devis-b2b`;
export const BLOG_DEMO_SHOTS = {
  accueil: `${WALKTHROUGH}/02-accueil.png`,
  devisListe: `${WALKTHROUGH}/03-devis.png`,
  devisDetail: `${WALKTHROUGH}/04-devis-detail.png`,
  automations: `${WALKTHROUGH}/05-automations.png`,
  produits: `${WALKTHROUGH}/06-produits.png`,
  funnels: `${WALKTHROUGH}/07-funnels.png`,
  integrations: `${WALKTHROUGH}/08-integrations.png`,
  funnelPublic: `${WALKTHROUGH}/09-public-funnel.png`,
  boutiquePublic: `${WALKTHROUGH}/10-public-boutique.png`,
} as const;

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
    cover: `${BLOG_IMAGE_DIR}/score-demande-devis-b2b/04-devis-detail.png`,
    pinned: true,
  },
  {
    slug: "visite-guidee-parcours-devis-b2b",
    path: "/blog/visite-guidee-parcours-devis-b2b",
    title: "De la demande au dossier devis : visite guidée d’un parcours B2B",
    description:
      "Visite guidée d’un parcours devis B2B : funnel public, boutique, pipeline, dossier devis, catalogue, automations et relances. Captures démo et checklist de mise en place.",
    publishedAt: "2026-09-11",
    readingMinutes: 14,
    tags: ["funnel", "scoring"],
    ctaHref: BLOG_DEMO_FUNNEL,
    cover: "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
    pinned: false,
  },
  {
    slug: "relancer-devis-hot-depuis-dossier",
    path: "/blog/relancer-devis-hot-depuis-dossier",
    title: "Relancer un devis Hot depuis le dossier : SLA, owner et automations",
    description:
      "Process métier : relancer un devis Hot depuis le dossier QuoteBuilder. Score, owner, SLA, actions Écrire/Appeler/Relancer, automations vs jugement commercial, checklist équipe.",
    publishedAt: "2026-09-11",
    readingMinutes: 12,
    tags: ["relances", "scoring"],
    ctaHref: BLOG_TOOL_SEQUENCE,
    cover: "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
    pinned: false,
  },
  {
    slug: "delai-reponse-demande-devis-b2b",
    path: "/blog/delai-reponse-demande-devis-b2b",
    title: "Délai de réponse à une demande de devis B2B : SLA, chiffres et process",
    description:
      "Guide long : délai de réponse devis B2B (speed to lead). Benchmarks sourcés, SLA Hot/Warm/Cold, notifications, brief chiffrable, métriques et FAQ pour PME.",
    publishedAt: "2026-09-11",
    readingMinutes: 11,
    tags: ["scoring", "relances"],
    ctaHref: BLOG_DEMO_FUNNEL,
    cover: "/images/blog/delai-reponse-demande-devis-b2b/03-devis.png",
    pinned: false,
  },
  {
    slug: "template-boutique-en-ligne-menuiserie-devis",
    path: "/blog/template-boutique-en-ligne-menuiserie-devis",
    title: "Template boutique en ligne menuiserie devis : base métier vs thème générique",
    description:
      "Pourquoi un template boutique métier (menuiserie, skincare B2B, stock rayonnage) convertit mieux en demande de devis qu’un thème e-commerce générique. Process Puck + Chat IA, captures et checklist.",
    publishedAt: "2026-09-11",
    readingMinutes: 12,
    tags: ["integrations", "catalogue"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/template-boutique-secteur-devis/menuiserie-home.png",
    pinned: false,
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
    cover: `${BLOG_IMAGE_DIR}/configurateur-devis-vs-excel-pdf/09-public-funnel.png`,
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
    cover: `${BLOG_IMAGE_DIR}/pourquoi-les-devis-meurent-sans-relance/05-automations.png`,
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
    cover: `${BLOG_IMAGE_DIR}/formulaire-contact-vs-funnel-devis-b2b/09-public-funnel.png`,
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
    cover: `${BLOG_IMAGE_DIR}/installer-widget-devis-wordpress-javascript/08-integrations.png`,
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
    cover: `${BLOG_IMAGE_DIR}/sync-catalogue-woocommerce-shopify-parcours-devis/06-produits.png`,
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
