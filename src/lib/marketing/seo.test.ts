import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  BLOG_DEMO_SHOTS,
  BLOG_IMAGE_DIR,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_UI,
  blogArticleJsonLd,
  blogBreadcrumbJsonLd,
  blogOgImagePath,
  extractMarkdownH2s,
  filterBlogPosts,
  getFeaturedPost,
  getRelatedPosts,
  midArticleHeadingIndex,
  normalizeCoverPath,
  primaryTagLabel,
  trimMetaDescription,
} from "./blog";
import { coverCandidatesForSlug, resolveCoverForPost } from "./blog-assets";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import { computeBriefScore } from "./brief-score";
import { computeLostQuote } from "./lost-quote";
import { MARKETING_ROUTES } from "./routes";
import { APEX_HOST, SITE_HOST, SITE_URL, absoluteUrl, pageMetadata, rootJsonLd } from "./site";
import { CREAM_HEX, TAG_COVER } from "./theme";
import { calloutKind, calloutLabel, paragraphCalloutKind, parseImageLine, stripCalloutPrefix } from "./markdown-parse";

const EM_DASH = /\u2014/;

assert.equal(SITE_HOST, "www.quotebuilder.co");
assert.equal(APEX_HOST, "quotebuilder.co");
assert.equal(SITE_URL, "https://www.quotebuilder.co");
assert.equal(absoluteUrl("/blog"), "https://www.quotebuilder.co/blog");
assert.doesNotMatch(SITE_URL, /vercel\.app/);
assert.doesNotMatch(SITE_URL, /https:\/\/quotebuilder\.co$/);

const apexHost = /https:\/\/quotebuilder\.co(?![\w.-])/;
const llms = readFileSync(new URL("../../../public/llms.txt", import.meta.url), "utf8");
assert.match(llms, /https:\/\/www\.quotebuilder\.co\/sitemap\.xml/);
assert.match(llms, /https:\/\/www\.quotebuilder\.co\/robots\.txt/);
assert.match(llms, /https:\/\/www\.quotebuilder\.co/);
assert.doesNotMatch(llms, apexHost);

const json = JSON.stringify(rootJsonLd());
assert.match(json, /https:\/\/www\.quotebuilder\.co/);
assert.doesNotMatch(json, apexHost);

const vercel = JSON.parse(
  readFileSync(new URL("../../../vercel.json", import.meta.url), "utf8"),
) as { redirects: { has?: { value: string }[]; destination: string; statusCode: number }[] };
assert.ok(
  vercel.redirects.some(
    (rule) =>
      rule.statusCode === 308 &&
      rule.destination.startsWith("https://www.quotebuilder.co") &&
      rule.has?.some((item) => item.value === "quotebuilder.co"),
  ),
);

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const required of [
  "/",
  "/tarifs",
  "/blog",
  "/blog/pourquoi-les-devis-meurent-sans-relance",
  "/outils/cout-devis-non-relance",
  "/outils/generateur-sequence-relances",
  "/outils/score-brief-devis",
  "/a-propos",
  "/secteurs/funnel-devis-rayonnage-stockage",
  "/secteurs/funnel-devis-menuiserie-sur-mesure",
  "/blog/visite-guidee-parcours-devis-b2b",
  "/blog/relancer-devis-hot-depuis-dossier",
  "/blog/score-demande-devis-b2b",
  "/blog/configurateur-devis-vs-excel-pdf",
  "/legal/cgu",
  "/legal/confidentialite",
  "/fonctionnalites/funnel",
]) {
  assert.ok(paths.includes(required), `missing route ${required}`);
}

assert.equal(BLOG_POSTS.length, 8);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "visite-guidee-parcours-devis-b2b")?.tags, [
  "funnel",
  "scoring",
]);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "relancer-devis-hot-depuis-dossier")?.tags, [
  "relances",
  "scoring",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "relancer-devis-hot-depuis-dossier")?.ctaHref,
  "/outils/generateur-sequence-relances",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "relancer-devis-hot-depuis-dossier")?.cover,
  "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "relancer-devis-hot-depuis-dossier")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "visite-guidee-parcours-devis-b2b")?.ctaHref,
  "/c/demo/rayonnage",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "visite-guidee-parcours-devis-b2b")?.cover,
  "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "visite-guidee-parcours-devis-b2b")?.pinned, false);
assert.deepEqual(BLOG_TAG_DEFS.map((tag) => tag.slug), [
  "scoring",
  "relances",
  "funnel",
  "integrations",
  "catalogue",
]);
assert.ok(
  BLOG_POSTS.every((post) => post.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag))),
  "every post needs known tags",
);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "score-demande-devis-b2b")?.tags, ["scoring", "funnel"]);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "sync-catalogue-woocommerce-shopify-parcours-devis")?.tags, [
  "catalogue",
  "integrations",
]);
assert.equal(getFeaturedPost()?.slug, "score-demande-devis-b2b");
const funnelRelated = getRelatedPosts(BLOG_POSTS.find((post) => post.slug === "formulaire-contact-vs-funnel-devis-b2b")!);
assert.ok(funnelRelated.length > 0, "funnel posts should have same-tag siblings");
assert.ok(funnelRelated.every((post) => post.tags.includes("funnel") || post.tags.includes("scoring")));
assert.ok(!funnelRelated.some((post) => post.slug === "pourquoi-les-devis-meurent-sans-relance"));
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "scoring" }).length, 4);
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "Scoring" }).length, 4);
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "catalogue" }).length, 1);
assert.equal(filterBlogPosts(BLOG_POSTS, { q: "woocommerce" }).length, 1);
assert.equal(midArticleHeadingIndex(12), 5);
assert.ok(trimMetaDescription(BLOG_POSTS[0]!.description).length <= 155);
assert.equal(BLOG_UI.tryFree, "Essayer gratuitement");
assert.equal(BLOG_UI.toc, "Sur cette page");
assert.equal(BLOG_UI.midCtaLink, "Ouvrir la démo");
assert.equal(BLOG_POSTS.find((post) => post.slug === "score-demande-devis-b2b")?.ctaHref, "/c/demo/rayonnage");
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "installer-widget-devis-wordpress-javascript")?.ctaHref,
  "/b/demo/vitrine",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "pourquoi-les-devis-meurent-sans-relance")?.ctaHref,
  "/outils/generateur-sequence-relances",
);

const articleLd = blogArticleJsonLd(BLOG_POSTS[0]!);
assert.equal(articleLd["@type"], "Article");
assert.match(String(articleLd.image), /images\/blog\/devis-detail\.png/);
assert.match(String(articleLd.mainEntityOfPage), /www\.quotebuilder\.co\/blog\//);

const crumbs = blogBreadcrumbJsonLd(BLOG_POSTS[0]!);
assert.equal(crumbs["@type"], "BreadcrumbList");
assert.equal(crumbs.itemListElement.length, 3);
assert.equal(crumbs.itemListElement[0]?.name, "Blog");
assert.equal(crumbs.itemListElement[1]?.name, primaryTagLabel(BLOG_POSTS[0]!));

for (const value of Object.values(BLOG_UI)) {
  assert.doesNotMatch(value, EM_DASH, `BLOG_UI still contains an em dash: ${value}`);
}

const blogDir = join(process.cwd(), "src/content/blog");
const blogFiles = readdirSync(blogDir).filter((name) => name.endsWith(".md"));
assert.ok(blogFiles.length >= 6, "expected blog markdown files");

const requiredSources = {
  "pourquoi-les-devis-meurent-sans-relance.md": [
    "https://www.invespcro.com/blog/follow-up-sales-emails/",
    "https://belkins.io/blog/b2b-sales-follow-up-statistics",
    "https://pipeline.zoominfo.com/sales/sales-follow-up-statistics",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/outils/cout-devis-non-relance",
    "/images/blog/automations.png",
  ],
  "formulaire-contact-vs-funnel-devis-b2b.md": [
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/installer-widget-devis-wordpress-javascript",
    "/fonctionnalites/funnel",
    "/images/blog/funnel-public.png",
  ],
  "installer-widget-devis-wordpress-javascript.md": [
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/blog/sync-catalogue-woocommerce-shopify-parcours-devis",
    "www.quotebuilder.co",
    "/images/blog/integrations.png",
  ],
  "sync-catalogue-woocommerce-shopify-parcours-devis.md": [
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/installer-widget-devis-wordpress-javascript",
    "/fonctionnalites/integrations",
    "/images/blog/produits.png",
  ],
  "score-demande-devis-b2b.md": [
    "https://www.webyn.ai/blog/taux-conversion-moyen-b2b",
    "https://brixongroup.com/en/benchmark-study-how-top-performers-in-the-dach-industrial-sector-achieve-three-times-higher-conversion-rates",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/outils/score-brief-devis",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/images/blog/devis-detail.png",
  ],
  "configurateur-devis-vs-excel-pdf.md": [
    "/blog/score-demande-devis-b2b",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/outils/score-brief-devis",
    "/images/blog/funnel-public.png",
  ],
  "visite-guidee-parcours-devis-b2b.md": [
    "/images/blog/visite-guidee-parcours-devis-b2b/09-public-funnel.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/10-public-boutique.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/02-accueil.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/03-devis.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/06-produits.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/07-funnels.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/08-integrations.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/05-automations.png",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/blog/score-demande-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/c/demo/rayonnage",
    "/b/demo/vitrine",
    "/signup?plan=free",
  ],
  "relancer-devis-hot-depuis-dossier.md": [
    "/images/blog/relancer-devis-hot-depuis-dossier/09-public-funnel.png",
    "/images/blog/relancer-devis-hot-depuis-dossier/02-accueil.png",
    "/images/blog/relancer-devis-hot-depuis-dossier/03-devis.png",
    "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
    "/images/blog/relancer-devis-hot-depuis-dossier/05-automations.png",
    "/blog/score-demande-devis-b2b",
    "/blog/visite-guidee-parcours-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/outils/generateur-sequence-relances",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
} as const;

for (const file of blogFiles) {
  const body = readFileSync(join(blogDir, file), "utf8");
  assert.doesNotMatch(body, EM_DASH, `${file} still contains an em dash`);
  const words = body.split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 1800, `${file} is too short for SEO (${words} words)`);
  const extras = requiredSources[file as keyof typeof requiredSources];
  if (extras) {
    for (const needle of extras) {
      assert.match(body, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${file} missing ${needle}`);
    }
  }
}

{
  const walkthroughRaw = readFileSync(join(blogDir, "visite-guidee-parcours-devis-b2b.md"), "utf8");
  assert.ok(walkthroughRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const walkthroughBody = stripFrontmatter(walkthroughRaw);
  assert.ok(
    walkthroughBody.startsWith("# De la demande au dossier devis"),
    "frontmatter must be stripped before render",
  );
  assert.match(walkthroughBody, /signup\?plan=free/);
}

{
  const relanceRaw = readFileSync(join(blogDir, "relancer-devis-hot-depuis-dossier.md"), "utf8");
  assert.ok(relanceRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const relanceBody = stripFrontmatter(relanceRaw);
  assert.ok(
    relanceBody.startsWith("# Relancer un devis Hot depuis le dossier"),
    "frontmatter must be stripped before render",
  );
  assert.match(relanceBody, /signup\?plan=free/);
}

for (const post of BLOG_POSTS) {
  assert.doesNotMatch(post.title, EM_DASH, `${post.slug} title has an em dash`);
  assert.doesNotMatch(post.description, EM_DASH, `${post.slug} description has an em dash`);
  assert.ok(BLOG_FAQ[post.slug]?.length, `${post.slug} missing FAQ`);
  for (const item of BLOG_FAQ[post.slug] ?? []) {
    assert.doesNotMatch(item.q, EM_DASH, `${post.slug} FAQ question has an em dash`);
    assert.doesNotMatch(item.a, EM_DASH, `${post.slug} FAQ answer has an em dash`);
  }
}

const meta = pageMetadata({
  title: "Connexion",
  description: "Accès",
  path: "/login",
  index: false,
});
assert.equal(meta.alternates?.canonical, "https://www.quotebuilder.co/login");
assert.deepEqual(meta.robots, { index: false, follow: false });

const articleMeta = pageMetadata({
  title: "Scorer une demande",
  description: "Grille",
  path: "/blog/score-demande-devis-b2b",
  type: "article",
  publishedTime: "2026-09-11",
  image: blogOgImagePath(BLOG_POSTS[0]!),
});
assert.equal(articleMeta.alternates?.canonical, "https://www.quotebuilder.co/blog/score-demande-devis-b2b");
const ogImages = articleMeta.openGraph?.images;
assert.ok(Array.isArray(ogImages));
assert.match(JSON.stringify(ogImages), /blog\/score-demande-devis-b2b\/opengraph-image/);
assert.equal(articleMeta.openGraph?.title, "Scorer une demande · QuoteBuilder");

const lost = computeLostQuote({
  quotesPerMonth: 40,
  basket: 3500,
  currentRate: 12,
  targetRate: 22,
});
assert.equal(lost.monthlyCurrent, 40 * 3500 * 0.12);
assert.equal(lost.monthlyGap, 40 * 3500 * 0.1);
assert.equal(lost.annualGap, lost.monthlyGap * 12);

const emptyBrief = computeBriefScore({
  products: null,
  constraints: null,
  budget: null,
  urgency: null,
  fit: null,
});
assert.equal(emptyBrief.total, 0);
assert.equal(emptyBrief.band, "pending");

const hotBrief = computeBriefScore({
  products: 25,
  constraints: 20,
  budget: 20,
  urgency: 20,
  fit: 15,
});
assert.equal(hotBrief.total, 100);
assert.equal(hotBrief.band, "hot");

const warmBrief = computeBriefScore({
  products: 18,
  constraints: 14,
  budget: 14,
  urgency: 8,
  fit: 6,
});
assert.equal(warmBrief.total, 60);
assert.equal(warmBrief.band, "warm");

const parkingBrief = computeBriefScore({
  products: 0,
  constraints: 0,
  budget: 0,
  urgency: 0,
  fit: 0,
});
assert.equal(parkingBrief.total, 0);
assert.equal(parkingBrief.band, "parking");

const llmsPaths = [
  "/blog/visite-guidee-parcours-devis-b2b",
  "/blog/relancer-devis-hot-depuis-dossier",
  "/blog/score-demande-devis-b2b",
  "/blog/configurateur-devis-vs-excel-pdf",
  "/outils/score-brief-devis",
  "/secteurs/funnel-devis-menuiserie-sur-mesure",
];
for (const path of llmsPaths) {
  assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${path.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}`));
}

function isTableLine(line: string) {
  return /^\s*\|.+\|\s*$/.test(line);
}
function splitTableRow(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}
function isTableSeparator(line: string) {
  if (!isTableLine(line)) return false;
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}
assert.ok(isTableSeparator("|--------|--------------------|"), "two-column separator should parse");
assert.ok(isTableSeparator("|-------|-------|-------------|"), "three-column separator should parse");
const scoreMd = readFileSync(join(blogDir, "score-demande-devis-b2b.md"), "utf8");
const scoreLines = scoreMd.split("\n");
let tableBlocks = 0;
let i = 0;
let steps = 0;
while (i < scoreLines.length) {
  steps += 1;
  assert.ok(steps < scoreLines.length + 5, "markdown walk must terminate");
  const line = scoreLines[i] ?? "";
  if (isTableLine(line) && isTableSeparator(scoreLines[i + 1] ?? "")) {
    tableBlocks += 1;
    i += 2;
    while (i < scoreLines.length && isTableLine(scoreLines[i] ?? "") && !isTableSeparator(scoreLines[i] ?? "")) {
      i += 1;
    }
    continue;
  }
  i += 1;
}
assert.ok(tableBlocks >= 5, `expected scoring tables, got ${tableBlocks}`);

const scoreHeadings = extractMarkdownH2s(scoreMd);
assert.ok(scoreHeadings.length >= 8, "score article should expose H2s for the TOC");
assert.ok(scoreHeadings.every((heading) => heading.id && !heading.id.includes(" ")));
assert.ok(scoreHeadings.some((heading) => heading.text === "FAQ"));
assert.equal(
  scoreHeadings.filter((heading) => heading.id === "pourquoi-le-scoring-devis-n-est-pas-du-lead-scoring-marketing").length,
  0,
);
assert.ok(
  scoreHeadings.some((heading) => heading.id === "pourquoi-le-scoring-devis-nest-pas-du-lead-scoring-marketing"),
);

assert.equal(calloutKind("Note QuoteBuilder. On évite les slogans."), "tip");
assert.equal(calloutKind("Astuce : une fourchette indicative."), "tip");
assert.equal(calloutKind("Attention au wizard trop long."), "warning");
assert.equal(calloutKind("Le formulaire livre un message."), "quote");
assert.equal(calloutKind("[!TIP] Une fourchette indicative dans le parcours."), "tip");
assert.equal(calloutKind("[!WARNING] Le wizard trop long fatigue."), "warning");
assert.equal(calloutKind("[!NOTE] On reste factuel."), "tip");
assert.equal(paragraphCalloutKind("Astuce : une fourchette indicative dans le parcours."), "tip");
assert.equal(paragraphCalloutKind("Le comportement post-envoi compte."), null);
assert.equal(calloutLabel("tip"), "Astuce");
assert.equal(calloutLabel("warning"), "Attention");
assert.equal(stripCalloutPrefix("Astuce : une fourchette indicative."), "une fourchette indicative.");
assert.equal(stripCalloutPrefix("[!WARNING] Le wizard trop long fatigue."), "Le wizard trop long fatigue.");
assert.equal(
  stripCalloutPrefix("Note QuoteBuilder. On évite les slogans."),
  "Note QuoteBuilder. On évite les slogans.",
);

const walkthroughImages = [
  "02-accueil.png",
  "03-devis.png",
  "04-devis-detail.png",
  "05-automations.png",
  "06-produits.png",
  "07-funnels.png",
  "08-integrations.png",
  "09-public-funnel.png",
  "10-public-boutique.png",
];
const walkthroughDir = join(process.cwd(), "public/images/blog/visite-guidee-parcours-devis-b2b");
for (const name of walkthroughImages) {
  const file = join(walkthroughDir, name);
  assert.ok(existsSync(file), `missing blog image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

const relanceImages = [
  "02-accueil.png",
  "03-devis.png",
  "04-devis-detail.png",
  "05-automations.png",
  "09-public-funnel.png",
];
const relanceDir = join(process.cwd(), "public/images/blog/relancer-devis-hot-depuis-dossier");
for (const name of relanceImages) {
  const file = join(relanceDir, name);
  assert.ok(existsSync(file), `missing blog image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

assert.equal(BLOG_IMAGE_DIR, "/images/blog");
assert.equal(normalizeCoverPath("visite-guidee-parcours-devis-b2b.jpg"), "/images/blog/visite-guidee-parcours-devis-b2b.jpg");
assert.equal(normalizeCoverPath("/images/blog/score-demande-devis-b2b.webp"), "/images/blog/score-demande-devis-b2b.webp");
const upcomingCovers = coverCandidatesForSlug("visite-guidee-parcours-devis-b2b");
assert.ok(upcomingCovers.includes("/images/blog/visite-guidee-parcours-devis-b2b.webp"));
assert.ok(upcomingCovers.includes("/images/blog/visite-guidee-parcours-devis-b2b.jpg"));
assert.equal(resolveCoverForPost({ slug: "visite-guidee-parcours-devis-b2b" }), undefined);
assert.equal(BLOG_DEMO_SHOTS.devisDetail, "/images/blog/devis-detail.png");
assert.equal(BLOG_POSTS.find((post) => post.slug === "score-demande-devis-b2b")?.cover, BLOG_DEMO_SHOTS.devisDetail);
assert.equal(BLOG_POSTS.find((post) => post.slug === "configurateur-devis-vs-excel-pdf")?.cover, BLOG_DEMO_SHOTS.funnelPublic);
assert.equal(BLOG_POSTS.find((post) => post.slug === "pourquoi-les-devis-meurent-sans-relance")?.cover, BLOG_DEMO_SHOTS.automations);
assert.equal(BLOG_POSTS.find((post) => post.slug === "formulaire-contact-vs-funnel-devis-b2b")?.cover, BLOG_DEMO_SHOTS.funnelPublic);
assert.equal(BLOG_POSTS.find((post) => post.slug === "installer-widget-devis-wordpress-javascript")?.cover, BLOG_DEMO_SHOTS.integrations);
assert.equal(BLOG_POSTS.find((post) => post.slug === "sync-catalogue-woocommerce-shopify-parcours-devis")?.cover, BLOG_DEMO_SHOTS.produits);
for (const post of BLOG_POSTS) {
  assert.ok(post.cover, `${post.slug} missing cover`);
  assert.equal(resolveCoverForPost(post), normalizeCoverPath(post.cover!), `${post.slug} cover file missing`);
}
{
  const fixture = join(process.cwd(), "public/images/blog/visite-guidee-parcours-devis-b2b.webp");
  writeFileSync(fixture, "cover");
  try {
    assert.equal(
      resolveCoverForPost({ slug: "visite-guidee-parcours-devis-b2b" }),
      "/images/blog/visite-guidee-parcours-devis-b2b.webp",
    );
  } finally {
    unlinkSync(fixture);
  }
}

const articleSource = readFileSync(new URL("../../../src/components/marketing/marketing-article.tsx", import.meta.url), "utf8");
assert.match(articleSource, /bg-mk-surface/);
assert.match(articleSource, /BlogCover/);
assert.match(articleSource, /max-w-7xl/);
assert.match(articleSource, /max-w-5xl/);
assert.match(articleSource, /max-w-\[45rem\]/);
assert.doesNotMatch(articleSource, /#F6F0E8/);
assert.doesNotMatch(
  readFileSync(new URL("../../../src/components/marketing/blog-cover.tsx", import.meta.url), "utf8"),
  /SCORING/,
);
assert.match(readFileSync(new URL("../../../src/lib/marketing/markdown.tsx", import.meta.url), "utf8"), /bg-mk-accent-soft/);

const figure = parseImageLine("![Grille scorecard 0-100](figure:score-grid)");
assert.equal(figure?.src, "figure:score-grid");
assert.match(scoreMd, /figure:score-grid/);
const funnelMd = readFileSync(join(blogDir, "formulaire-contact-vs-funnel-devis-b2b.md"), "utf8");
assert.match(funnelMd, /figure:funnel-vs-form/);

const globals = readFileSync(new URL("../../../src/app/globals.css", import.meta.url), "utf8");
assert.match(globals, /--color-mk-bg:\s*#f7f8fa/);
assert.match(globals, /--color-mk-accent:\s*#e85d04/);
assert.doesNotMatch(globals, /#F6F0E8/);
assert.ok(TAG_COVER.scoring.accent === "#E85D04");

const marketingRoots = [
  join(process.cwd(), "src/components/marketing"),
  join(process.cwd(), "src/app/(marketing)"),
  join(process.cwd(), "src/app/blog"),
];
function walkTsx(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walkTsx(full);
    return entry.name.endsWith(".tsx") || entry.name.endsWith(".ts") ? [full] : [];
  });
}
for (const root of marketingRoots) {
  for (const file of walkTsx(root)) {
    const body = readFileSync(file, "utf8");
    assert.doesNotMatch(body, /#F6F0E8/, `${file} still uses the cream wash`);
    assert.doesNotMatch(body, EM_DASH, `${file} still contains an em dash`);
  }
}
assert.equal(CREAM_HEX, "#F6F0E8");

console.log("marketing seo tests ok");
