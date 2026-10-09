import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";
import {
  DEMANDES_DEVIS_ABANDONNEES_DEFAULTS,
  computeDemandesDevisAbandonnees,
} from "./demandes-devis-abandonnees-funnel";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "demande-devis-abandonnee-funnel-reprise";
const SECTOR_SLUG = "funnel-devis-emballage-conditionnement";
const TOOL_PATH = "/outils/estimateur-demandes-devis-abandonnees-funnel";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;

assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["relances", "funnel"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.funnelPublic);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 13);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, "2026-10-06");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) =>
    BLOG_TAG_DEFS.some((def) => def.slug === tag),
  ),
);
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
for (const item of BLOG_FAQ[BLOG_SLUG] ?? []) {
  assert.doesNotMatch(item.q, EM_DASH);
  assert.doesNotMatch(item.q, EN_DASH);
  assert.doesNotMatch(item.a, EM_DASH);
  assert.doesNotMatch(item.a, EN_DASH);
}

assert.equal(BLOG_TOOLS.length, 37);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.deepEqual(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags,
  ["relances", "funnel"],
);
assert.equal(
  outilsHubIntro(),
  "Trente-sept outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.",
);
assert.equal(outilsHubIntro(37), outilsHubIntro());
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
assert.ok(paths.includes(BLOG_PATH));
assert.ok(paths.includes(SECTOR_PATH));
assert.ok(paths.includes(TOOL_PATH));
assert.equal(MARKETING_ROUTES.find((route) => route.path === SECTOR_PATH)?.lastModified, "2026-10-07");
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.lastModified, "2026-10-07");
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.lastModified, "2026-10-07");

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of [BLOG_PATH, SECTOR_PATH, TOOL_PATH]) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "2026-10-07"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, path === BLOG_PATH ? "2026-10-06" : "2026-10-07");
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${BLOG_PATH}`));
assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${SECTOR_PATH}`));
assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${TOOL_PATH}`));

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(outilsHub, /estimateur-demandes-devis-abandonnees-funnel/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
assert.match(secteursHub, /funnel-devis-emballage-conditionnement/);

function faqQuestionCount(body: string) {
  const marker = "\n## FAQ\n";
  const start = body.indexOf(marker);
  assert.ok(start >= 0, "FAQ heading missing");
  const after = body.slice(start + marker.length);
  const next = after.search(/\n## [^#]/);
  const section = next === -1 ? after : after.slice(0, next);
  return section.split("\n").filter((line) => line.startsWith("### ")).length;
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
    blogBody.startsWith("# Demande de devis abandonnée en cours de funnel"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assert.match(blogBody, /\/outils\/estimateur-demandes-devis-abandonnees-funnel/);
  assert.match(blogBody, /\/secteurs\/funnel-devis-emballage-conditionnement/);
  assert.match(blogBody, /Session abandonnée/);
  assert.match(blogBody, /Email pour recevoir le récap/);
  assert.match(blogBody, /Commencée/);
  assertNoDashes(blogRaw, "blog md");
  assertNoDashes(blogBody, "blog body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 2832);
  assert.equal(faqQuestionCount(blogBody), 10);
  assertInternalLinks(blogBody, "blog");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith("# Funnel de devis emballage et conditionnement"),
    "frontmatter must be stripped before render",
  );
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /« Emballages »/);
  assert.match(sectorBody, /Industrie & fabrication/);
  assert.match(sectorBody, /ordre fixe/);
  assert.match(sectorBody, /Il n'existe pas de kit/);
  assert.match(sectorBody, /ne gère pas la TVA/);
  assert.match(sectorBody, /30 points/);
  assertNoDashes(sectorRaw, "secteur md");
  assertNoDashes(sectorBody, "secteur body");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 2628);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "secteur");
}

const sectorPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-emballage-conditionnement/page.tsx"),
  "utf8",
);
assert.equal(sectorPage.split("\n").filter((line) => line.includes("q:")).length, 10);
assert.match(sectorPage, /signup\?plan=free/);
assert.match(sectorPage, /Industrie & fabrication/);
assertNoDashes(sectorPage, "secteur page");

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/estimateur-demandes-devis-abandonnees-funnel/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /demande-devis-abandonnee-funnel-reprise/);
assert.match(toolPage, /funnel-devis-emballage-conditionnement/);
assert.match(toolPage, /pourquoi-les-devis-meurent-sans-relance/);
assert.match(toolPage, /generateur-sequence-relances/);
assert.match(toolPage, /fonctionnalites\/autopilote/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assertNoDashes(toolPage, "outil page");

const toolLib = readFileSync(
  join(process.cwd(), "src/lib/marketing/demandes-devis-abandonnees-funnel.ts"),
  "utf8",
);
const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/demandes-devis-abandonnees-funnel-calculator.tsx"),
  "utf8",
);
assertNoDashes(toolLib, "outil lib");
assertNoDashes(toolUi, "outil ui");

const defaults = computeDemandesDevisAbandonnees({ ...DEMANDES_DEVIS_ABANDONNEES_DEFAULTS });
assert.equal(defaults.abandons, 72);
assert.equal(defaults.relancables, 18);
assert.equal(defaults.anonymes, 54);
assert.equal(defaults.reprises, 2.7);
assert.equal(defaults.gagnes, 0.54);
assert.equal(defaults.ca, 2160);
assert.equal(defaults.an, 25920);
assert.equal(defaults.plafond, 72000);
assert.equal(defaults.pctEmailTest, 35);
assert.equal(defaults.gain, 864);
assert.equal(defaults.gainAn, 10368);
assert.equal(defaults.alertTone, "warn");
assert.match(defaults.alert, /Enjeu notable/);
assert.match(defaults.tip, /Passer de 25 % à 35 %/);
assert.match(defaults.tip, /864\s€ \/ mois/);
assert.match(defaults.recap, /Checklist demandes abandonnées dans QuoteBuilder/);
assert.match(defaults.recap, /Session abandonnée/);
assert.match(defaults.recap, /Email pour recevoir le récap/);
assert.match(defaults.recap, /Commencée/);
assert.match(defaults.recap, /pas un benchmark/);
assertNoDashes(defaults.alert, "alerte défaut");
assertNoDashes(defaults.tip, "tip défaut");
assertNoDashes(defaults.recap, "récap défaut");

const empty = computeDemandesDevisAbandonnees({ ...DEMANDES_DEVIS_ABANDONNEES_DEFAULTS, sessions: 0 });
assert.equal(empty.abandons, 0);
assert.equal(empty.ca, 0);
assert.equal(empty.alertTone, "neutral");
assert.match(empty.alert, /Indiquez un nombre de parcours commencés/);

const bounded = computeDemandesDevisAbandonnees({
  sessions: 100,
  pctAbandon: 150,
  pctEmail: 95,
  pctReprise: Number.NaN,
  pctGagne: 20,
  panier: -5,
  gainEmail: 20,
});
assert.equal(bounded.pctAbandon, 100);
assert.equal(bounded.pctReprise, 0);
assert.equal(bounded.panier, 0);
assert.equal(bounded.pctEmailTest, 100);
assert.equal(bounded.abandons, 100);
assert.equal(bounded.relancables, 95);
assert.equal(bounded.ca, 0);
assert.equal(bounded.gain, 0);

const noEmail = computeDemandesDevisAbandonnees({
  sessions: 200,
  pctAbandon: 50,
  pctEmail: 0,
  pctReprise: 20,
  pctGagne: 25,
  panier: 10000,
  gainEmail: 10,
});
assert.equal(noEmail.relancables, 0);
assert.equal(noEmail.ca, 0);
assert.equal(noEmail.gain, 5000);
assert.equal(noEmail.alertTone, "warn");
assert.match(noEmail.alert, /Abandons sans email/);

const noAbandon = computeDemandesDevisAbandonnees({
  ...DEMANDES_DEVIS_ABANDONNEES_DEFAULTS,
  pctAbandon: 0,
});
assert.equal(noAbandon.alertTone, "neutral");
assert.match(noAbandon.alert, /Aucun abandon sur ces hypothèses/);

const important = computeDemandesDevisAbandonnees({
  sessions: 400,
  pctAbandon: 60,
  pctEmail: 40,
  pctReprise: 20,
  pctGagne: 25,
  panier: 8000,
  gainEmail: 0,
});
assert.equal(important.abandons, 240);
assert.equal(important.relancables, 96);
assert.equal(important.reprises, 19.2);
assert.equal(important.gagnes, 4.8);
assert.equal(important.ca, 38400);
assert.equal(important.an, 460800);
assert.equal(important.plafond, 768000);
assert.equal(important.gain, 0);
assert.equal(important.alertTone, "bad");
assert.match(important.alert, /Enjeu important/);
