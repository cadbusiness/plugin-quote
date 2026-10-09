import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";
import { FUITES_ENTONNOIR_DEFAULTS, computeFuitesEntonnoir } from "./fuites-entonnoir-funnel-devis";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "mesurer-funnel-devis-b2b-entonnoir-statistiques";
const SECTOR_SLUG = "funnel-devis-imprimerie-signaletique";
const TOOL_PATH = "/outils/estimateur-fuites-entonnoir-funnel-devis";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;

assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["funnel", "integrations"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.accueil);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 13);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, "2026-10-07");
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

assert.equal(BLOG_TOOLS.length, 38);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.deepEqual(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags,
  ["funnel", "integrations"],
);
assert.equal(
  outilsHubIntro(),
  "Trente-huit outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.",
);
assert.equal(outilsHubIntro(38), outilsHubIntro());
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
  assert.equal(entry?.lastModified, "2026-10-07");
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${BLOG_PATH}`));
assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${SECTOR_PATH}`));
assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${TOOL_PATH}`));

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(outilsHub, /estimateur-fuites-entonnoir-funnel-devis/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
assert.match(secteursHub, /funnel-devis-imprimerie-signaletique/);

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
    blogBody.startsWith("# Mesurer un funnel de devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assert.match(blogBody, /\/outils\/estimateur-fuites-entonnoir-funnel-devis/);
  assert.match(blogBody, /\/secteurs\/funnel-devis-imprimerie-signaletique/);
  assert.match(blogBody, /Tunnel de conversion/);
  assert.match(blogBody, /Rapport PDF/);
  assert.match(blogBody, /Contacté, En cours, En attente ou Gagné/);
  assert.match(blogBody, /pas de test A\/B intégré/);
  assertNoDashes(blogRaw, "blog md");
  assertNoDashes(blogBody, "blog body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 3124);
  assert.equal(faqQuestionCount(blogBody), 10);
  assertInternalLinks(blogBody, "blog");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith("# Funnel de devis imprimerie et signalétique"),
    "frontmatter must be stripped before render",
  );
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /« Studio & imprimerie »/);
  assert.match(sectorBody, /Services professionnels/);
  assert.match(sectorBody, /Funnel studio/);
  assert.match(sectorBody, /ordre fixe/);
  assert.match(sectorBody, /Il n'existe pas de lot/);
  assert.match(sectorBody, /ne gère pas la TVA/);
  assert.match(sectorBody, /30 points/);
  assert.match(sectorBody, /10 Mo/);
  assert.match(sectorBody, /cerfa n°16308/);
  assertNoDashes(sectorRaw, "secteur md");
  assertNoDashes(sectorBody, "secteur body");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 3303);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "secteur");
}

const sectorPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-imprimerie-signaletique/page.tsx"),
  "utf8",
);
assert.equal(sectorPage.split("\n").filter((line) => line.includes("q:")).length, 10);
assert.match(sectorPage, /signup\?plan=free/);
assert.match(sectorPage, /Services professionnels/);
assertNoDashes(sectorPage, "secteur page");

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/estimateur-fuites-entonnoir-funnel-devis/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /mesurer-funnel-devis-b2b-entonnoir-statistiques/);
assert.match(toolPage, /funnel-devis-imprimerie-signaletique/);
assert.match(toolPage, /estimateur-demandes-devis-abandonnees-funnel/);
assert.match(toolPage, /simulateur-taux-conversion-devis/);
assert.match(toolPage, /fonctionnalites\/stats/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assertNoDashes(toolPage, "outil page");

const toolLib = readFileSync(join(process.cwd(), "src/lib/marketing/fuites-entonnoir-funnel-devis.ts"), "utf8");
const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/fuites-entonnoir-funnel-devis-calculator.tsx"),
  "utf8",
);
assertNoDashes(toolLib, "outil lib");
assertNoDashes(toolUi, "outil ui");

const defaults = computeFuitesEntonnoir({ ...FUITES_ENTONNOIR_DEFAULTS });
assert.deepEqual(defaults.rates, [40, 62.5, 75, 93.3, 85.7, 25]);
assert.deepEqual(defaults.lost, [480, 120, 50, 10, 20, 90]);
assert.equal(defaults.weakest, 5);
assert.equal(defaults.biggestLoss, 0);
assert.equal(defaults.conversion, 17.5);
assert.equal(defaults.globalRate, 3.75);
assert.equal(defaults.ca, 90000);
assert.equal(defaults.rateTest, 45);
assert.equal(defaults.simulable, true);
assert.equal(defaults.gagnesPlus, 3.75);
assert.equal(defaults.gain, 11250);
assert.equal(defaults.gainAn, 135000);
assert.equal(defaults.alertTone, "neutral");
assert.equal(
  defaults.alert,
  "Marche la plus faible : Rappelé vers Gagné (25 %). Plus gros volume perdu : Visiteurs vers Commencé (480).",
);
assert.match(defaults.recap, /Checklist mesure dans QuoteBuilder/);
assert.match(defaults.recap, /Tunnel de conversion/);
assert.match(defaults.recap, /pas un benchmark/);
assertNoDashes(defaults.alert, "alerte défaut");
assertNoDashes(defaults.tip, "tip défaut");
assertNoDashes(defaults.recap, "récap défaut");

const etapeRappel = computeFuitesEntonnoir({ ...FUITES_ENTONNOIR_DEFAULTS, etape: 5, gainPoints: 5 });
assert.equal(etapeRappel.rateTest, 30);
assert.equal(etapeRappel.gagnesPlus, 6);
assert.equal(etapeRappel.gain, 18000);

const etapeEmail = computeFuitesEntonnoir({ ...FUITES_ENTONNOIR_DEFAULTS, etape: 1, gainPoints: 10 });
assert.equal(etapeEmail.rateTest, 72.5);
assert.equal(etapeEmail.gagnesPlus, 4.8);
assert.equal(etapeEmail.gain, 14400);

const etapeDevis = computeFuitesEntonnoir({ ...FUITES_ENTONNOIR_DEFAULTS, etape: 3, gainPoints: 20 });
assert.equal(etapeDevis.rateTest, 100);
assert.equal(etapeDevis.gagnesPlus, 2.14);
assert.equal(etapeDevis.gain, 6429);

const noGain = computeFuitesEntonnoir({ ...FUITES_ENTONNOIR_DEFAULTS, gainPoints: 0 });
assert.equal(noGain.gain, 0);
assert.equal(noGain.gagnesPlus, 0);

const empty = computeFuitesEntonnoir({ ...FUITES_ENTONNOIR_DEFAULTS, visiteurs: 0 });
assert.deepEqual(empty.counts, [0, 0, 0, 0, 0, 0, 0]);
assert.equal(empty.ca, 0);
assert.equal(empty.simulable, false);
assert.equal(empty.gain, 0);
assert.equal(empty.alertTone, "neutral");
assert.equal(empty.alert, "Indiquez au moins un nombre de visiteurs pour calculer les taux de passage.");

const bounded = computeFuitesEntonnoir({
  visiteurs: 100,
  commences: 150,
  emails: Number.NaN,
  completes: -5,
  devis: 10,
  rappeles: 5,
  gagnes: 2,
  panier: -10,
  etape: 9,
  gainPoints: 200,
});
assert.deepEqual(bounded.counts, [100, 100, 0, 0, 0, 0, 0]);
assert.deepEqual(bounded.capped, ["Commencé", "Devis", "Rappelé", "Gagné"]);
assert.equal(bounded.panier, 0);
assert.equal(bounded.etape, 5);
assert.equal(bounded.gainPoints, 100);
assert.equal(bounded.simulable, false);

const capped = computeFuitesEntonnoir({ ...FUITES_ENTONNOIR_DEFAULTS, commences: 900 });
assert.equal(capped.alertTone, "warn");
assert.equal(
  capped.alert,
  "Marches corrigées · Commencé dépassait la marche précédente et a été ramenée à sa valeur.",
);

const zeroClose = computeFuitesEntonnoir({
  ...FUITES_ENTONNOIR_DEFAULTS,
  rappeles: 0,
  gagnes: 0,
  etape: 5,
});
assert.equal(zeroClose.alertTone, "warn");
assert.equal(
  zeroClose.alert,
  "Hypothèse non calculable · une marche en amont ou en aval de « Rappelé vers Gagné » est à zéro.",
);
