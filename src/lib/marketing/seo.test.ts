import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { BLOG_POSTS } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { computeBriefScore } from "./brief-score";
import { computeLostQuote } from "./lost-quote";
import { MARKETING_ROUTES } from "./routes";
import { APEX_HOST, SITE_HOST, SITE_URL, absoluteUrl, pageMetadata, rootJsonLd } from "./site";

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
  "/blog/score-demande-devis-b2b",
  "/blog/configurateur-devis-vs-excel-pdf",
  "/legal/cgu",
  "/legal/confidentialite",
  "/fonctionnalites/funnel",
]) {
  assert.ok(paths.includes(required), `missing route ${required}`);
}

assert.equal(BLOG_POSTS.length, 6);

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
  ],
  "formulaire-contact-vs-funnel-devis-b2b.md": [
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/installer-widget-devis-wordpress-javascript",
    "/fonctionnalites/funnel",
  ],
  "installer-widget-devis-wordpress-javascript.md": [
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/blog/sync-catalogue-woocommerce-shopify-parcours-devis",
    "www.quotebuilder.co",
  ],
  "sync-catalogue-woocommerce-shopify-parcours-devis.md": [
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/installer-widget-devis-wordpress-javascript",
    "/fonctionnalites/integrations",
  ],
  "score-demande-devis-b2b.md": [
    "https://www.webyn.ai/blog/taux-conversion-moyen-b2b",
    "https://brixongroup.com/en/benchmark-study-how-top-performers-in-the-dach-industrial-sector-achieve-three-times-higher-conversion-rates",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/outils/score-brief-devis",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
  ],
  "configurateur-devis-vs-excel-pdf.md": [
    "/blog/score-demande-devis-b2b",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/outils/score-brief-devis",
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

console.log("marketing seo tests ok");
