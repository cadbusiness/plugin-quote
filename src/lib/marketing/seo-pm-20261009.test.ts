import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { ADS_COST_DEFAULTS, computeAdsCost, fmtEur, fmtNum } from "./cout-par-client-google-ads-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "google-ads-demande-devis-b2b-cout-par-client";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const TOOL_PATH = "/outils/calculateur-cout-par-client-google-ads-devis";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];

assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["integrations", "funnel"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.integrations);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 13);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, "2026-10-09");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)),
);
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
for (const item of BLOG_FAQ[BLOG_SLUG] ?? []) {
  assert.doesNotMatch(item.q, EM_DASH);
  assert.doesNotMatch(item.q, EN_DASH);
  assert.doesNotMatch(item.a, EM_DASH);
  assert.doesNotMatch(item.a, EN_DASH);
}

assert.equal(BLOG_TOOLS.length, 38);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["integrations", "funnel"]);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Trente-huit outils publics."));
assert.equal(outilsHubIntro(), "Trente-huit outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(38), outilsHubIntro());
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, "2026-10-09");
}

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "2026-10-09"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, "2026-10-09");
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(
  llms,
  /Google Ads et demande de devis B2B : mesurer le coût par devis et le coût par client : https:\/\/www\.quotebuilder\.co\/blog\/google-ads-demande-devis-b2b-cout-par-client/,
);
assert.match(
  llms,
  /Calculateur de coût par devis et par client Google Ads : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-cout-par-client-google-ads-devis/,
);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /calculateur-cout-par-client-google-ads-devis/);
assert.match(outilsHub, /outilsHubIntro\(\)/);

function faqQuestionCount(body: string) {
  const marker = "\n## FAQ\n";
  const start = body.indexOf(marker);
  assert.ok(start >= 0, "FAQ heading missing");
  const after = body.slice(start + marker.length);
  const next = after.search(/\n## [^#]/);
  const section = next === -1 ? after : after.slice(0, next);
  return section.split("\n").filter((line) => line.startsWith("### ")).length;
}

function faqFromMarkdown(body: string) {
  const marker = "\n## FAQ\n";
  const start = body.indexOf(marker);
  assert.ok(start >= 0, "FAQ heading missing");
  const after = body.slice(start + marker.length);
  const next = after.search(/\n## [^#]/);
  const section = next === -1 ? after : after.slice(0, next);
  return section
    .split("\n### ")
    .slice(1)
    .map((part) => {
      const nl = part.indexOf("\n");
      return {
        q: part.slice(0, nl).trim(),
        a: part
          .slice(nl + 1)
          .trim()
          .replace(/\s+/g, " "),
      };
    });
}

function assertInternalLinks(body: string, label: string) {
  const hrefs = body.match(/https:\/\/www\.quotebuilder\.co[^)\s]*/g) ?? [];
  for (const href of hrefs) {
    const path = href.replace("https://www.quotebuilder.co", "").split("?")[0] ?? "";
    if (path.startsWith("/c/") || path.startsWith("/signup") || path.startsWith("/b/")) continue;
    assert.ok(paths.includes(path), `${label} link not in routes.ts: ${path}`);
  }
}

function assertNoDashes(text: string, label: string) {
  assert.doesNotMatch(text, EM_DASH, `${label} has an em dash`);
  assert.doesNotMatch(text, EN_DASH, `${label} has an en dash`);
}

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(
    blogBody.startsWith("# Google Ads et demande de devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assert.match(blogBody, /Un devis coûte/);
  assert.match(blogBody, /Un client coûte/);
  assert.match(blogBody, /Devis soumis/);
  assert.match(blogBody, /Affaire gagnée/);
  assert.match(blogBody, /90 jours/);
  assert.match(blogBody, /gclid/);
  assert.match(blogBody, /utm_campaign/);
  assert.match(blogBody, /Préparer une campagne/);
  assert.match(blogBody, /15 juin 2026/);
  assert.match(blogBody, /\/outils\/calculateur-cout-par-client-google-ads-devis/);
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assertNoDashes(blogRaw, "google ads md");
  assertNoDashes(blogBody, "google ads body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 2986);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "google ads");
}

const addedSources = [
  "src/lib/marketing/cout-par-client-google-ads-devis.ts",
  "src/lib/marketing/seo-pm-20261009.test.ts",
  "src/components/marketing/cout-par-client-google-ads-devis-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-cout-par-client-google-ads-devis/page.tsx",
];
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-cout-par-client-google-ads-devis/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /google-ads-demande-devis-b2b-cout-par-client/);
assert.match(toolPage, /\/fonctionnalites\/ads/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /Pour lire vos chiffres/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /calculateur-cout-par-client-google-ads-devis/);

const base = { ...ADS_COST_DEFAULTS };

let r = computeAdsCost(base);
assert.strictEqual(r.clics, 600);
assert.strictEqual(r.demandes, 24);
assert.strictEqual(r.coutDevis, 62.5);
assert.strictEqual(r.clients, 4.8);
assert.strictEqual(r.coutClient, 312.5);
assert.strictEqual(r.ca, 28800);
assert.strictEqual(r.margeBrute, 8640);
assert.strictEqual(r.resultat, 7140);
assert.strictEqual(r.ratio, 5.76);
assert.strictEqual(r.maxClient, 1800);
assert.strictEqual(r.maxDevis, 360);
assert.strictEqual(r.maxCpc, 14.4);
assert.strictEqual(r.lectureJours, 60);
assert.strictEqual(r.verdict.tone, "ok");
assert.ok(r.verdict.text.includes("5,76\u00a0€ de marge brute par euro"));
assert.ok(!r.conseils.some((item) => item.includes("90 jours")));
assert.ok(!r.conseils.some((item) => item.includes("Moins de 3 clients")));
assert.ok(r.conseils.some((item) => item.includes("au moins 60 jours")));
assert.ok(r.conseils.some((item) => item.includes("statut Gagné")));

assert.strictEqual(fmtEur(62.5), "62,50\u00a0€");
assert.strictEqual(fmtEur(312.5), "312,50\u00a0€");
assert.strictEqual(fmtEur(1234.5), "1\u00a0235\u00a0€");
assert.strictEqual(fmtEur(14.4), "14,40\u00a0€");
assert.strictEqual(fmtEur(28800), "28\u00a0800\u00a0€");
assert.strictEqual(fmtEur(-200), "-200\u00a0€");
assert.strictEqual(fmtEur(null), "n/a");
assert.strictEqual(fmtNum(4.8), "4,8");
assert.strictEqual(fmtNum(600), "600");
assert.ok(r.recap.includes("Un devis coûte 62,50\u00a0€, un client coûte 312,50\u00a0€."));
assert.ok(r.recap.includes("1\u00a0800\u00a0€ par client, 360\u00a0€ par devis, 14,40\u00a0€ par clic"));

r = computeAdsCost({ ...base, budget: 0 });
assert.strictEqual(r.verdict.tone, "neutral");
assert.strictEqual(r.coutDevis, null);
assert.strictEqual(r.ratio, null);
r = computeAdsCost({ ...base, cpc: 0 });
assert.strictEqual(r.clics, 0);
assert.strictEqual(r.verdict.tone, "neutral");

r = computeAdsCost({ ...base, tauxDemande: 150, tauxGagne: -5, marge: "abc", delai: 5000, budget: -10 });
assert.strictEqual(r.budget, 0);
assert.strictEqual(r.delai, 730);
assert.strictEqual(r.maxClient, 0);
assert.strictEqual(r.clients, 0);

r = computeAdsCost({ ...base, tauxGagne: 0 });
assert.strictEqual(r.verdict.tone, "bad");
assert.ok(r.verdict.text.startsWith("Aucun client"));
assert.strictEqual(r.coutClient, null);

r = computeAdsCost({ ...base, panier: 1000, marge: 20 });
assert.strictEqual(r.margeBrute, 960);
assert.strictEqual(r.resultat, -540);
assert.strictEqual(r.verdict.tone, "bad");
assert.strictEqual(r.maxCpc, 1.6);
assert.ok(r.conseils.some((item) => item.includes("dépasse le maximum")));

r = computeAdsCost({ ...base, panier: 1800, marge: 25 });
assert.strictEqual(r.margeBrute, 2160);
assert.strictEqual(r.ratio, 1.44);
assert.strictEqual(r.verdict.tone, "warn");

r = computeAdsCost({ ...base, budget: 600, cpc: 3, tauxDemande: 5, delai: 120 });
assert.strictEqual(r.clics, 200);
assert.strictEqual(r.demandes, 10);
assert.strictEqual(r.clients, 2);
assert.strictEqual(r.coutClient, 300);
assert.strictEqual(r.lectureJours, 120);
assert.ok(r.conseils.some((item) => item.includes("au-delà de 90 jours")));
assert.ok(r.conseils.some((item) => item.includes("Moins de 3 clients")));

r = computeAdsCost({ ...base, delai: 20 });
assert.strictEqual(r.lectureJours, 30);
assert.ok(r.conseils.some((item) => item === "Lisez le coût par client sur au moins 30 jours."));

r = computeAdsCost({ ...base, delai: 90 });
assert.ok(!r.conseils.some((item) => item.includes("au-delà de 90 jours")));
assert.strictEqual(r.lectureJours, 90);

assert.ok(
  !/[\u2013\u2014]/.test(
    computeAdsCost(base).recap + computeAdsCost({ ...base, delai: 200, budget: 300 }).conseils.join(" "),
  ),
);
