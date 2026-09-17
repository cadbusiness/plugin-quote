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
import { computeConversionRate } from "./conversion-rate";
import { applyTeamCapacityMix, computeTeamCapacity } from "./team-capacity";
import { computeQuotingTime, quotingTimeVolumes } from "./quoting-time";
import { computeDiscountImpact } from "./discount-impact";
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
  "/outils/simulateur-taux-conversion-devis",
  "/outils/calculateur-capacite-equipe-devis",
  "/outils/estimateur-temps-chiffrage-devis",
  "/outils/simulateur-impact-remise-devis",
  "/a-propos",
  "/secteurs/funnel-devis-rayonnage-stockage",
  "/secteurs/funnel-devis-menuiserie-sur-mesure",
  "/secteurs/funnel-devis-location-evenementiel",
  "/secteurs/funnel-devis-agencement-bureau",
  "/secteurs/funnel-devis-stores-fermetures",
  "/blog/centraliser-demandes-devis-multi-canaux",
  "/blog/versions-historique-devis-b2b",
  "/blog/assignation-sla-demande-devis-equipe",
  "/blog/qualifier-demande-devis-avant-chiffrage",
  "/blog/creer-devis-avec-claude-mcp",
  "/blog/visite-guidee-parcours-devis-b2b",
  "/blog/relancer-devis-hot-depuis-dossier",
  "/blog/delai-reponse-demande-devis-b2b",
  "/blog/template-boutique-en-ligne-menuiserie-devis",
  "/blog/devis-en-ligne-integre-boutique",
  "/blog/score-demande-devis-b2b",
  "/blog/configurateur-devis-vs-excel-pdf",
  "/legal/cgu",
  "/legal/confidentialite",
  "/fonctionnalites/funnel",
]) {
  assert.ok(paths.includes(required), `missing route ${required}`);
}

assert.equal(BLOG_POSTS.length, 16);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "centraliser-demandes-devis-multi-canaux")?.tags, [
  "funnel",
  "scoring",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "centraliser-demandes-devis-multi-canaux")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "centraliser-demandes-devis-multi-canaux")?.cover,
  "/images/blog/relancer-devis-hot-depuis-dossier/03-devis.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "centraliser-demandes-devis-multi-canaux")?.readingMinutes, 11);
assert.equal(BLOG_POSTS.find((post) => post.slug === "centraliser-demandes-devis-multi-canaux")?.publishedAt, "2026-09-17");
assert.equal(BLOG_POSTS.find((post) => post.slug === "centraliser-demandes-devis-multi-canaux")?.pinned, false);
assert.equal(BLOG_FAQ["centraliser-demandes-devis-multi-canaux"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "versions-historique-devis-b2b")?.tags, [
  "funnel",
  "relances",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "versions-historique-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "versions-historique-devis-b2b")?.cover,
  "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "versions-historique-devis-b2b")?.readingMinutes, 11);
assert.equal(BLOG_POSTS.find((post) => post.slug === "versions-historique-devis-b2b")?.publishedAt, "2026-09-16");
assert.equal(BLOG_POSTS.find((post) => post.slug === "versions-historique-devis-b2b")?.pinned, false);
assert.equal(BLOG_FAQ["versions-historique-devis-b2b"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "assignation-sla-demande-devis-equipe")?.tags, [
  "scoring",
  "relances",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "assignation-sla-demande-devis-equipe")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "assignation-sla-demande-devis-equipe")?.cover,
  "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "assignation-sla-demande-devis-equipe")?.readingMinutes, 11);
assert.equal(BLOG_POSTS.find((post) => post.slug === "assignation-sla-demande-devis-equipe")?.publishedAt, "2026-09-15");
assert.equal(BLOG_POSTS.find((post) => post.slug === "assignation-sla-demande-devis-equipe")?.pinned, false);
assert.equal(BLOG_FAQ["assignation-sla-demande-devis-equipe"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "qualifier-demande-devis-avant-chiffrage")?.tags, [
  "funnel",
  "scoring",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "qualifier-demande-devis-avant-chiffrage")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "qualifier-demande-devis-avant-chiffrage")?.cover,
  "/images/blog/score-demande-devis-b2b/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "qualifier-demande-devis-avant-chiffrage")?.readingMinutes, 11);
assert.equal(BLOG_POSTS.find((post) => post.slug === "qualifier-demande-devis-avant-chiffrage")?.publishedAt, "2026-09-15");
assert.equal(BLOG_POSTS.find((post) => post.slug === "qualifier-demande-devis-avant-chiffrage")?.pinned, false);
assert.equal(BLOG_FAQ["qualifier-demande-devis-avant-chiffrage"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "creer-devis-avec-claude-mcp")?.tags, [
  "integrations",
  "scoring",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "creer-devis-avec-claude-mcp")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "creer-devis-avec-claude-mcp")?.cover,
  "/images/blog/creer-devis-avec-claude-mcp/03-devis.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "creer-devis-avec-claude-mcp")?.readingMinutes, 12);
assert.equal(BLOG_POSTS.find((post) => post.slug === "creer-devis-avec-claude-mcp")?.publishedAt, "2026-09-12");
assert.equal(BLOG_POSTS.find((post) => post.slug === "creer-devis-avec-claude-mcp")?.pinned, false);
assert.equal(BLOG_FAQ["creer-devis-avec-claude-mcp"]?.length, 8);
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
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "delai-reponse-demande-devis-b2b")?.tags, [
  "scoring",
  "relances",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "delai-reponse-demande-devis-b2b")?.ctaHref,
  "/c/demo/rayonnage",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "delai-reponse-demande-devis-b2b")?.cover,
  "/images/blog/delai-reponse-demande-devis-b2b/03-devis.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "delai-reponse-demande-devis-b2b")?.pinned, false);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "template-boutique-en-ligne-menuiserie-devis")?.tags, [
  "integrations",
  "catalogue",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "template-boutique-en-ligne-menuiserie-devis")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "template-boutique-en-ligne-menuiserie-devis")?.cover,
  "/images/blog/template-boutique-secteur-devis/menuiserie-home.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "template-boutique-en-ligne-menuiserie-devis")?.readingMinutes, 12);
assert.equal(BLOG_POSTS.find((post) => post.slug === "template-boutique-en-ligne-menuiserie-devis")?.publishedAt, "2026-09-11");
assert.equal(BLOG_POSTS.find((post) => post.slug === "template-boutique-en-ligne-menuiserie-devis")?.pinned, false);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "devis-en-ligne-integre-boutique")?.tags, [
  "funnel",
  "catalogue",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "devis-en-ligne-integre-boutique")?.ctaHref,
  "https://www.quotebuilder.co/b/demo/atelier-peau-claire/devis",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "devis-en-ligne-integre-boutique")?.cover,
  "/images/blog/devis-en-ligne-integre-boutique/unify-shop-home.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "devis-en-ligne-integre-boutique")?.readingMinutes, 11);
assert.equal(BLOG_POSTS.find((post) => post.slug === "devis-en-ligne-integre-boutique")?.publishedAt, "2026-09-11");
assert.equal(BLOG_POSTS.find((post) => post.slug === "devis-en-ligne-integre-boutique")?.pinned, false);
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
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "scoring" }).length, 9);
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "Scoring" }).length, 9);
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "integrations" }).length, 4);
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "catalogue" }).length, 3);
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

const featuredScore = BLOG_POSTS.find((post) => post.slug === "score-demande-devis-b2b")!;
const articleLd = blogArticleJsonLd(featuredScore);
assert.equal(articleLd["@type"], "Article");
assert.match(String(articleLd.image), /images\/blog\/score-demande-devis-b2b\/04-devis-detail\.png/);
assert.match(String(articleLd.mainEntityOfPage), /www\.quotebuilder\.co\/blog\//);

const crumbs = blogBreadcrumbJsonLd(featuredScore);
assert.equal(crumbs["@type"], "BreadcrumbList");
assert.equal(crumbs.itemListElement.length, 3);
assert.equal(crumbs.itemListElement[0]?.name, "Blog");
assert.equal(crumbs.itemListElement[1]?.name, primaryTagLabel(featuredScore));

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
    "/images/blog/pourquoi-les-devis-meurent-sans-relance/05-automations.png",
  ],
  "formulaire-contact-vs-funnel-devis-b2b.md": [
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/installer-widget-devis-wordpress-javascript",
    "/fonctionnalites/funnel",
    "/images/blog/formulaire-contact-vs-funnel-devis-b2b/09-public-funnel.png",
  ],
  "installer-widget-devis-wordpress-javascript.md": [
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/blog/sync-catalogue-woocommerce-shopify-parcours-devis",
    "www.quotebuilder.co",
    "/images/blog/installer-widget-devis-wordpress-javascript/08-integrations.png",
  ],
  "sync-catalogue-woocommerce-shopify-parcours-devis.md": [
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/installer-widget-devis-wordpress-javascript",
    "/fonctionnalites/integrations",
    "/images/blog/sync-catalogue-woocommerce-shopify-parcours-devis/06-produits.png",
  ],
  "score-demande-devis-b2b.md": [
    "https://www.webyn.ai/blog/taux-conversion-moyen-b2b",
    "https://brixongroup.com/en/benchmark-study-how-top-performers-in-the-dach-industrial-sector-achieve-three-times-higher-conversion-rates",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/outils/score-brief-devis",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/images/blog/score-demande-devis-b2b/04-devis-detail.png",
  ],
  "configurateur-devis-vs-excel-pdf.md": [
    "/blog/score-demande-devis-b2b",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/outils/score-brief-devis",
    "/images/blog/configurateur-devis-vs-excel-pdf/09-public-funnel.png",
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
  "delai-reponse-demande-devis-b2b.md": [
    "/images/blog/delai-reponse-demande-devis-b2b/02-accueil.png",
    "/images/blog/delai-reponse-demande-devis-b2b/03-devis.png",
    "/images/blog/delai-reponse-demande-devis-b2b/04-devis-detail.png",
    "/images/blog/delai-reponse-demande-devis-b2b/05-automations.png",
    "/blog/score-demande-devis-b2b",
    "/blog/relancer-devis-hot-depuis-dossier",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/secteurs/funnel-devis-location-evenementiel",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "template-boutique-en-ligne-menuiserie-devis.md": [
    "/images/blog/template-boutique-secteur-devis/menuiserie-home.png",
    "/images/blog/template-boutique-secteur-devis/menuiserie-catalog.png",
    "/images/blog/template-boutique-secteur-devis/skin-home.png",
    "/images/blog/template-boutique-secteur-devis/skin-cta.png",
    "/images/blog/template-boutique-secteur-devis/skin-catalog.png",
    "/images/blog/template-boutique-secteur-devis/stock-home.png",
    "/images/blog/template-boutique-secteur-devis/stock-catalog.png",
    "/images/blog/template-boutique-secteur-devis/catalogue-vendeur.png",
    "/images/blog/template-boutique-secteur-devis/integrations.png",
    "/b/demo/atelier-bois-nord",
    "/b/demo/atelier-peau-claire",
    "/b/demo/stock-pro-b2b",
    "/blog/visite-guidee-parcours-devis-b2b",
    "/blog/sync-catalogue-woocommerce-shopify-parcours-devis",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/signup?plan=free",
  ],
  "devis-en-ligne-integre-boutique.md": [
    "/images/blog/devis-en-ligne-integre-boutique/unify-shop-home.png",
    "/images/blog/devis-en-ligne-integre-boutique/unify-add-or-catalog.png",
    "/images/blog/devis-en-ligne-integre-boutique/unify-devis-skincare.png",
    "/images/blog/devis-en-ligne-integre-boutique/unify-devis-menuiserie.png",
    "/images/blog/devis-en-ligne-integre-boutique/unify-devis-stock.png",
    "/b/demo/atelier-peau-claire/devis",
    "/b/demo/atelier-bois-nord/devis",
    "/b/demo/stock-pro-b2b/devis",
    "/signup?plan=free",
  ],
  "centraliser-demandes-devis-multi-canaux.md": [
    "figure:multi-channel-pipeline",
    "/blog/delai-reponse-demande-devis-b2b",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/score-demande-devis-b2b",
    "/blog/assignation-sla-demande-devis-equipe",
    "/blog/versions-historique-devis-b2b",
    "/secteurs/funnel-devis-stores-fermetures",
    "/outils/calculateur-capacite-equipe-devis",
    "/outils/simulateur-impact-remise-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-stores-fermetures.md": [
    "/blog/centraliser-demandes-devis-multi-canaux",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/score-demande-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/secteurs/funnel-devis-rayonnage-stockage",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/outils/simulateur-impact-remise-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "versions-historique-devis-b2b.md": [
    "figure:versions-flow",
    "figure:versions-timeline",
    "figure:versions-checklist",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/relancer-devis-hot-depuis-dossier",
    "/blog/score-demande-devis-b2b",
    "/blog/assignation-sla-demande-devis-equipe",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/outils/estimateur-temps-chiffrage-devis",
    "/outils/calculateur-capacite-equipe-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "assignation-sla-demande-devis-equipe.md": [
    "figure:assign-flow",
    "figure:assign-playbook",
    "figure:assign-dashboard",
    "/blog/score-demande-devis-b2b",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/delai-reponse-demande-devis-b2b",
    "/blog/relancer-devis-hot-depuis-dossier",
    "/outils/calculateur-capacite-equipe-devis",
    "/outils/simulateur-taux-conversion-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "qualifier-demande-devis-avant-chiffrage.md": [
    "figure:qualify-before",
    "figure:qualify-axes",
    "figure:funnel-vs-form",
    "figure:qualify-stack",
    "figure:qualify-day",
    "/blog/score-demande-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/blog/delai-reponse-demande-devis-b2b",
    "/outils/score-brief-devis",
    "/outils/simulateur-taux-conversion-devis",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-agencement-bureau.md": [
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/score-demande-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/secteurs/funnel-devis-rayonnage-stockage",
    "/outils/score-brief-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "creer-devis-avec-claude-mcp.md": [
    "/images/blog/creer-devis-avec-claude-mcp/02-accueil.png",
    "/images/blog/creer-devis-avec-claude-mcp/03-devis.png",
    "/images/blog/creer-devis-avec-claude-mcp/04-devis-detail.png",
    "/images/blog/creer-devis-avec-claude-mcp/05-automations.png",
    "/images/blog/creer-devis-avec-claude-mcp/08-integrations.png",
    "/signup?plan=free",
    "MCP_DEVIS_V0",
    "create_quote",
  ],
  "funnel-devis-location-evenementiel.md": [
    "/images/secteurs/funnel-devis-location-evenementiel/09-public-funnel.png",
    "/images/secteurs/funnel-devis-location-evenementiel/03-devis.png",
    "/images/secteurs/funnel-devis-location-evenementiel/07-funnels.png",
    "/blog/delai-reponse-demande-devis-b2b",
    "/blog/score-demande-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
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

{
  const delaiRaw = readFileSync(join(blogDir, "delai-reponse-demande-devis-b2b.md"), "utf8");
  assert.ok(delaiRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const delaiBody = stripFrontmatter(delaiRaw);
  assert.ok(
    delaiBody.startsWith("# Délai de réponse à une demande de devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.match(delaiBody, /signup\?plan=free/);
}

{
  const templateRaw = readFileSync(join(blogDir, "template-boutique-en-ligne-menuiserie-devis.md"), "utf8");
  assert.ok(templateRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const templateBody = stripFrontmatter(templateRaw);
  assert.ok(
    templateBody.startsWith("# Template boutique en ligne menuiserie devis"),
    "frontmatter must be stripped before render",
  );
  assert.match(templateBody, /signup\?plan=free/);
}

{
  const unifyRaw = readFileSync(join(blogDir, "devis-en-ligne-integre-boutique.md"), "utf8");
  assert.ok(unifyRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const unifyBody = stripFrontmatter(unifyRaw);
  assert.ok(
    unifyBody.startsWith("# Devis en ligne intégré boutique"),
    "frontmatter must be stripped before render",
  );
  assert.match(unifyBody, /signup\?plan=free/);
}

{
  const mcpRaw = readFileSync(join(blogDir, "creer-devis-avec-claude-mcp.md"), "utf8");
  assert.ok(mcpRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const mcpBody = stripFrontmatter(mcpRaw);
  assert.ok(
    mcpBody.startsWith("# Créer un devis avec Claude"),
    "frontmatter must be stripped before render",
  );
  assert.match(mcpBody, /signup\?plan=free/);
}

{
  const eventRaw = readFileSync(join(blogDir, "funnel-devis-location-evenementiel.md"), "utf8");
  assert.ok(eventRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const eventBody = stripFrontmatter(eventRaw);
  assert.ok(
    eventBody.startsWith("# Funnel de devis location événementielle"),
    "frontmatter must be stripped before render",
  );
  assert.match(eventBody, /signup\?plan=free/);
}

{
  const centralRaw = readFileSync(join(blogDir, "centraliser-demandes-devis-multi-canaux.md"), "utf8");
  assert.ok(centralRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const centralBody = stripFrontmatter(centralRaw);
  assert.ok(
    centralBody.startsWith("# Centraliser les demandes de devis multi-canaux"),
    "frontmatter must be stripped before render",
  );
  assert.match(centralBody, /signup\?plan=free/);
}

{
  const storesRaw = readFileSync(join(blogDir, "funnel-devis-stores-fermetures.md"), "utf8");
  assert.ok(storesRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const storesBody = stripFrontmatter(storesRaw);
  assert.ok(
    storesBody.startsWith("# Funnel de devis stores et fermetures"),
    "frontmatter must be stripped before render",
  );
  assert.match(storesBody, /signup\?plan=free/);
}

{
  const versionsRaw = readFileSync(join(blogDir, "versions-historique-devis-b2b.md"), "utf8");
  assert.ok(versionsRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const versionsBody = stripFrontmatter(versionsRaw);
  assert.ok(
    versionsBody.startsWith("# Versions et historique des devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.match(versionsBody, /signup\?plan=free/);
}

{
  const assignRaw = readFileSync(join(blogDir, "assignation-sla-demande-devis-equipe.md"), "utf8");
  assert.ok(assignRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const assignBody = stripFrontmatter(assignRaw);
  assert.ok(
    assignBody.startsWith("# Assignation et SLA des demandes de devis en équipe"),
    "frontmatter must be stripped before render",
  );
  assert.match(assignBody, /signup\?plan=free/);
}

{
  const qualifyRaw = readFileSync(join(blogDir, "qualifier-demande-devis-avant-chiffrage.md"), "utf8");
  assert.ok(qualifyRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const qualifyBody = stripFrontmatter(qualifyRaw);
  assert.ok(
    qualifyBody.startsWith("# Qualifier une demande de devis avant de chiffrer"),
    "frontmatter must be stripped before render",
  );
  assert.match(qualifyBody, /signup\?plan=free/);
}

{
  const agencementRaw = readFileSync(join(blogDir, "funnel-devis-agencement-bureau.md"), "utf8");
  assert.ok(agencementRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const agencementBody = stripFrontmatter(agencementRaw);
  assert.ok(
    agencementBody.startsWith("# Funnel de devis agencement de bureau"),
    "frontmatter must be stripped before render",
  );
  assert.match(agencementBody, /signup\?plan=free/);
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
  image: blogOgImagePath(featuredScore),
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

const conversion = computeConversionRate({
  quotesSent: 40,
  basket: 5500,
  currentRate: 18,
  targetRate: 25,
});
assert.equal(conversion.monthlyCurrent, 40 * 5500 * 0.18);
assert.equal(conversion.monthlyTarget, 40 * 5500 * 0.25);
assert.equal(conversion.monthlyGain, conversion.monthlyTarget - conversion.monthlyCurrent);
assert.equal(conversion.annualGain, conversion.monthlyGain * 12);
assert.equal(conversion.weighted, null);
assert.match(conversion.tip, /petit gain de conversion/);

const conversionMix = computeConversionRate({
  quotesSent: 40,
  basket: 5500,
  currentRate: 18,
  targetRate: 25,
  mix: {
    hot: { mix: 20, win: 45 },
    warm: { mix: 45, win: 20 },
    cold: { mix: 35, win: 6 },
  },
});
assert.equal(
  conversionMix.weighted,
  40 * 0.2 * 5500 * 0.45 + 40 * 0.45 * 5500 * 0.2 + 40 * 0.35 * 5500 * 0.06,
);
assert.equal(conversionMix.mixTotal, 100);
assert.equal(conversionMix.mixOk, true);
assert.match(conversionMix.tip, /Mix correct/);

const capacity = computeTeamCapacity({
  reps: 3,
  hoursPerWeek: 12,
  weeksPerMonth: 4.3,
  minHot: 45,
  minWarm: 25,
  minCold: 12,
  volHot: 20,
  volWarm: 45,
  volCold: 35,
});
assert.equal(capacity.capacityHours, 3 * 12 * 4.3);
assert.equal(capacity.chargeHours, (20 * 45 + 45 * 25 + 35 * 12) / 60);
assert.equal(capacity.deltaHours, capacity.capacityHours - capacity.chargeHours);
assert.ok(capacity.utilization < 55);
assert.match(capacity.tip, /Surplus de capacité/);

const capacityMix = applyTeamCapacityMix(100, 20, 45, 35);
assert.deepEqual(capacityMix, { volHot: 20, volWarm: 45, volCold: 35 });
assert.equal(applyTeamCapacityMix(100, 20, 45, 30), null);

const capacityOver = computeTeamCapacity({
  reps: 1,
  hoursPerWeek: 8,
  weeksPerMonth: 4,
  minHot: 60,
  minWarm: 40,
  minCold: 20,
  volHot: 30,
  volWarm: 40,
  volCold: 20,
});
assert.ok(capacityOver.deltaHours < -8);
assert.match(capacityOver.tip, /Surcharge nette/);

const capacityEmpty = computeTeamCapacity({
  reps: 0,
  hoursPerWeek: 12,
  weeksPerMonth: 4.3,
  minHot: 45,
  minWarm: 25,
  minCold: 12,
  volHot: 20,
  volWarm: 45,
  volCold: 35,
});
assert.match(capacityEmpty.tip, /nombre de commerciaux/);

const quotingDefault = computeQuotingTime({
  volTotal: 80,
  pctHot: 20,
  pctWarm: 45,
  pctCold: 35,
  volHot: 16,
  volWarm: 36,
  volCold: 28,
  useDirect: false,
  minHot: 50,
  minWarm: 30,
  minCold: 15,
  minQual: 8,
  minRev: 12,
  people: 2,
  hoursPerMonth: 40,
});
assert.deepEqual(quotingDefault.volumes, { hot: 16, warm: 36, cold: 28 });
assert.equal(quotingDefault.totalDemands, 80);
assert.equal(quotingDefault.chiffrageHours, (16 * 50 + 36 * 30 + 28 * 15) / 60);
assert.equal(quotingDefault.qualHours, (80 * 8) / 60);
assert.equal(quotingDefault.revHours, (80 * 12) / 60);
assert.equal(
  quotingDefault.chargeHours,
  quotingDefault.chiffrageHours + quotingDefault.qualHours + quotingDefault.revHours,
);
assert.equal(quotingDefault.capacityHours, 80);
assert.equal(quotingDefault.deltaHours, quotingDefault.capacityHours - quotingDefault.chargeHours);
assert.equal(quotingDefault.mixOk, true);
assert.match(quotingDefault.mixWarn, /Mix à 100/);

const quotingDirect = quotingTimeVolumes({
  volTotal: 80,
  pctHot: 20,
  pctWarm: 45,
  pctCold: 35,
  volHot: 10,
  volWarm: 10,
  volCold: 5,
  useDirect: true,
});
assert.deepEqual(quotingDirect, { hot: 10, warm: 10, cold: 5 });

const quotingOver = computeQuotingTime({
  volTotal: 200,
  pctHot: 40,
  pctWarm: 40,
  pctCold: 20,
  volHot: 0,
  volWarm: 0,
  volCold: 0,
  useDirect: false,
  minHot: 60,
  minWarm: 40,
  minCold: 20,
  minQual: 10,
  minRev: 20,
  people: 1,
  hoursPerMonth: 20,
});
assert.ok(quotingOver.deltaHours < -10);
assert.match(quotingOver.tip, /Surcharge nette/);

const quotingEmpty = computeQuotingTime({
  volTotal: 80,
  pctHot: 20,
  pctWarm: 45,
  pctCold: 35,
  volHot: 16,
  volWarm: 36,
  volCold: 28,
  useDirect: false,
  minHot: 50,
  minWarm: 30,
  minCold: 15,
  minQual: 8,
  minRev: 12,
  people: 0,
  hoursPerMonth: 40,
});
assert.match(quotingEmpty.tip, /nombre de personnes qui chiffrent/);

const discountDefault = computeDiscountImpact({
  ca: 8500,
  cout: 5200,
  remise: 8,
  volume: 40,
  txAvant: 28,
  txApres: 34,
});
assert.equal(discountDefault.margeAvantE, 3300);
assert.equal(discountDefault.caApres, 8500 * 0.92);
assert.equal(discountDefault.margeApresE, 8500 * 0.92 - 5200);
assert.equal(discountDefault.perteUnite, 3300 - (8500 * 0.92 - 5200));
assert.ok(discountDefault.acceptUseful);
assert.equal(discountDefault.wonSans, 40 * (28 / 34));
assert.equal(discountDefault.impactNet, 40 * discountDefault.margeApresE - discountDefault.wonSans! * 3300);
assert.match(discountDefault.tip, /Remise tenable/);

const discountEmpty = computeDiscountImpact({
  ca: 0,
  cout: 5200,
  remise: 8,
  volume: 40,
  txAvant: 28,
  txApres: 34,
});
assert.match(discountEmpty.tip, /CA devis HT/);

const discountCost = computeDiscountImpact({
  ca: 4000,
  cout: 5200,
  remise: 8,
  volume: 40,
  txAvant: 28,
  txApres: 34,
});
assert.match(discountCost.tip, /structure de coût/);

const discountLoss = computeDiscountImpact({
  ca: 8500,
  cout: 8000,
  remise: 12,
  volume: 10,
  txAvant: 20,
  txApres: 22,
});
assert.ok(discountLoss.margeApresE < 0);
assert.match(discountLoss.tip, /marge est négative/);

const conversionFloor = computeConversionRate({
  quotesSent: 10,
  basket: 1000,
  currentRate: 20,
  targetRate: 10,
});
assert.equal(conversionFloor.targetRate, 20);
assert.equal(conversionFloor.monthlyGain, 0);

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
  "/blog/versions-historique-devis-b2b",
  "/blog/assignation-sla-demande-devis-equipe",
  "/blog/qualifier-demande-devis-avant-chiffrage",
  "/blog/creer-devis-avec-claude-mcp",
  "/blog/visite-guidee-parcours-devis-b2b",
  "/blog/relancer-devis-hot-depuis-dossier",
  "/blog/delai-reponse-demande-devis-b2b",
  "/blog/template-boutique-en-ligne-menuiserie-devis",
  "/blog/devis-en-ligne-integre-boutique",
  "/blog/score-demande-devis-b2b",
  "/blog/configurateur-devis-vs-excel-pdf",
  "/outils/score-brief-devis",
  "/outils/simulateur-taux-conversion-devis",
  "/outils/calculateur-capacite-equipe-devis",
  "/outils/estimateur-temps-chiffrage-devis",
  "/outils/simulateur-impact-remise-devis",
  "/secteurs/funnel-devis-menuiserie-sur-mesure",
  "/secteurs/funnel-devis-location-evenementiel",
  "/secteurs/funnel-devis-agencement-bureau",
  "/secteurs/funnel-devis-stores-fermetures",
  "/blog/centraliser-demandes-devis-multi-canaux",
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
{
  const uniqueNames = [
    "03-devis.png",
    "04-devis-detail.png",
    "05-automations.png",
    "06-produits.png",
    "08-integrations.png",
    "09-public-funnel.png",
    "10-public-boutique.png",
  ];
  const hashes = uniqueNames.map((name) => readFileSync(join(walkthroughDir, name)));
  const keys = hashes.map((buf) => buf.toString("binary"));
  assert.equal(new Set(keys).size, uniqueNames.length, "demo walkthrough screenshots must be unique files");
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

const delaiImages = ["02-accueil.png", "03-devis.png", "04-devis-detail.png", "05-automations.png"];
const delaiDir = join(process.cwd(), "public/images/blog/delai-reponse-demande-devis-b2b");
for (const name of delaiImages) {
  const file = join(delaiDir, name);
  assert.ok(existsSync(file), `missing blog image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

const templateShopImages = [
  "menuiserie-home.png",
  "menuiserie-catalog.png",
  "skin-home.png",
  "skin-cta.png",
  "skin-catalog.png",
  "stock-home.png",
  "stock-catalog.png",
  "catalogue-vendeur.png",
  "integrations.png",
];
const templateShopDir = join(process.cwd(), "public/images/blog/template-boutique-secteur-devis");
for (const name of templateShopImages) {
  const file = join(templateShopDir, name);
  assert.ok(existsSync(file), `missing blog image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

const unifyShopImages = [
  "unify-shop-home.png",
  "unify-add-or-catalog.png",
  "unify-devis-skincare.png",
  "unify-devis-menuiserie.png",
  "unify-devis-stock.png",
];
const unifyShopDir = join(process.cwd(), "public/images/blog/devis-en-ligne-integre-boutique");
for (const name of unifyShopImages) {
  const file = join(unifyShopDir, name);
  assert.ok(existsSync(file), `missing blog image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

const mcpImages = [
  "02-accueil.png",
  "03-devis.png",
  "04-devis-detail.png",
  "05-automations.png",
  "08-integrations.png",
];
const mcpDir = join(process.cwd(), "public/images/blog/creer-devis-avec-claude-mcp");
for (const name of mcpImages) {
  const file = join(mcpDir, name);
  assert.ok(existsSync(file), `missing blog image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

const eventImages = ["03-devis.png", "07-funnels.png", "09-public-funnel.png"];
const eventDir = join(process.cwd(), "public/images/secteurs/funnel-devis-location-evenementiel");
for (const name of eventImages) {
  const file = join(eventDir, name);
  assert.ok(existsSync(file), `missing secteur image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

assert.equal(BLOG_IMAGE_DIR, "/images/blog");
assert.equal(normalizeCoverPath("visite-guidee-parcours-devis-b2b.jpg"), "/images/blog/visite-guidee-parcours-devis-b2b.jpg");
assert.equal(normalizeCoverPath("/images/blog/score-demande-devis-b2b.webp"), "/images/blog/score-demande-devis-b2b.webp");
const upcomingCovers = coverCandidatesForSlug("visite-guidee-parcours-devis-b2b");
assert.ok(upcomingCovers.includes("/images/blog/visite-guidee-parcours-devis-b2b.webp"));
assert.ok(upcomingCovers.includes("/images/blog/visite-guidee-parcours-devis-b2b.jpg"));
assert.equal(resolveCoverForPost({ slug: "visite-guidee-parcours-devis-b2b" }), undefined);
assert.equal(BLOG_DEMO_SHOTS.devisDetail, "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png");
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "score-demande-devis-b2b")?.cover,
  "/images/blog/score-demande-devis-b2b/04-devis-detail.png",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "configurateur-devis-vs-excel-pdf")?.cover,
  "/images/blog/configurateur-devis-vs-excel-pdf/09-public-funnel.png",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "pourquoi-les-devis-meurent-sans-relance")?.cover,
  "/images/blog/pourquoi-les-devis-meurent-sans-relance/05-automations.png",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "formulaire-contact-vs-funnel-devis-b2b")?.cover,
  "/images/blog/formulaire-contact-vs-funnel-devis-b2b/09-public-funnel.png",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "installer-widget-devis-wordpress-javascript")?.cover,
  "/images/blog/installer-widget-devis-wordpress-javascript/08-integrations.png",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "sync-catalogue-woocommerce-shopify-parcours-devis")?.cover,
  "/images/blog/sync-catalogue-woocommerce-shopify-parcours-devis/06-produits.png",
);
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
assert.doesNotMatch(articleSource, /<header className="max-w-/);
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
const qualifyMd = readFileSync(join(blogDir, "qualifier-demande-devis-avant-chiffrage.md"), "utf8");
assert.match(qualifyMd, /figure:qualify-axes/);
assert.match(qualifyMd, /figure:qualify-before/);
const assignMd = readFileSync(join(blogDir, "assignation-sla-demande-devis-equipe.md"), "utf8");
assert.match(assignMd, /figure:assign-flow/);
assert.match(assignMd, /figure:assign-playbook/);
assert.match(assignMd, /figure:assign-dashboard/);
assert.equal(parseImageLine("![Schéma : file d’entrée, score, owner, SLA](figure:assign-flow)")?.src, "figure:assign-flow");
const versionsMd = readFileSync(join(blogDir, "versions-historique-devis-b2b.md"), "utf8");
assert.match(versionsMd, /figure:versions-flow/);
assert.match(versionsMd, /figure:versions-timeline/);
assert.match(versionsMd, /figure:versions-checklist/);
assert.equal(
  parseImageLine("![Schéma : dossier, versions v1 v2 v3, envoi, historique](figure:versions-flow)")?.src,
  "figure:versions-flow",
);
const centralMd = readFileSync(join(blogDir, "centraliser-demandes-devis-multi-canaux.md"), "utf8");
assert.match(centralMd, /figure:multi-channel-pipeline/);
assert.doesNotMatch(centralMd, /img-1\.png/);
assert.equal(
  parseImageLine("![Schéma : canaux multiples vers un pipeline dossier unique](figure:multi-channel-pipeline)")?.src,
  "figure:multi-channel-pipeline",
);

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
