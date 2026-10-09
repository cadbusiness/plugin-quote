import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";
import {
  DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS,
  DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS,
  computeDemandesHorsBudgetFourchette,
} from "./demandes-hors-budget-fourchette-devis";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "fourchette-prix-indicative-demande-devis-b2b";
const SECTOR_SLUG = "funnel-devis-traiteur-evenementiel";
const TOOL_PATH = "/outils/estimateur-demandes-hors-budget-fourchette-devis";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;

assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "funnel"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.produits);
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
  ["catalogue", "funnel"],
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
assert.equal(MARKETING_ROUTES.find((route) => route.path === SECTOR_PATH)?.lastModified, "2026-10-06");
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.lastModified, "2026-10-06");
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.lastModified, "2026-10-07");

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of [BLOG_PATH, SECTOR_PATH, TOOL_PATH]) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "${path === BLOG_PATH ? "2026-10-07" : "2026-10-06"}"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, "2026-10-06");
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${BLOG_PATH}`));
assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${SECTOR_PATH}`));
assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${TOOL_PATH}`));
assert.doesNotMatch(llms, EM_DASH);
assert.doesNotMatch(llms, EN_DASH);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(outilsHub, /estimateur-demandes-hors-budget-fourchette-devis/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
assert.match(secteursHub, /funnel-devis-traiteur-evenementiel/);
assert.doesNotMatch(secteursHub, EM_DASH);
assert.doesNotMatch(secteursHub, EN_DASH);

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
    blogBody.startsWith("# Fourchette de prix indicative dans une demande de devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assert.match(blogBody, /\/outils\/estimateur-demandes-hors-budget-fourchette-devis/);
  assert.match(blogBody, /\/secteurs\/funnel-devis-traiteur-evenementiel/);
  assert.match(blogBody, /Prix fixe/);
  assert.match(blogBody, /fourchette de règle|Fourchette de règle/);
  assert.match(blogBody, /ne lit pas les prix|ne lit ni les prix/);
  assertNoDashes(blogRaw, "blog md");
  assertNoDashes(blogBody, "blog body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 2799);
  assert.equal(faqQuestionCount(blogBody), 10);
  assertInternalLinks(blogBody, "blog");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith("# Funnel de devis traiteur événementiel"),
    "frontmatter must be stripped before render",
  );
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /\/blog\/fourchette-prix-indicative-demande-devis-b2b/);
  assert.match(sectorBody, /template Traiteur|« Traiteur »/);
  assert.match(sectorBody, /ne contient pas de question sur le nombre de convives|pas de question convives/);
  assert.match(sectorBody, /ordre fixe/);
  assert.match(sectorBody, /pas de kit|n'existe pas de kit|Il n'existe pas de kit/i);
  assert.match(sectorBody, /ne gère pas la TVA|sans TVA/);
  assertNoDashes(sectorRaw, "secteur md");
  assertNoDashes(sectorBody, "secteur body");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 2794);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "secteur");
}

const sectorPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-traiteur-evenementiel/page.tsx"),
  "utf8",
);
assert.equal(sectorPage.split("\n").filter((line) => line.includes("q:")).length, 10);
assert.match(sectorPage, /signup\?plan=free/);
assert.match(sectorPage, /Location & événementiel/);
assertNoDashes(sectorPage, "secteur page");

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/estimateur-demandes-hors-budget-fourchette-devis/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /fourchette-prix-indicative-demande-devis-b2b/);
assert.match(toolPage, /funnel-devis-traiteur-evenementiel/);
assert.match(toolPage, /qualifier-demande-devis-avant-chiffrage/);
assert.match(toolPage, /estimateur-cout-brief-incomplet/);
assert.match(toolPage, /fonctionnalites\/catalogue/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.doesNotMatch(toolPage, /formatPrice/);
assertNoDashes(toolPage, "outil page");

const toolLib = readFileSync(
  join(process.cwd(), "src/lib/marketing/demandes-hors-budget-fourchette-devis.ts"),
  "utf8",
);
const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/demandes-hors-budget-fourchette-devis-calculator.tsx"),
  "utf8",
);
assert.doesNotMatch(toolLib, /formatPrice/);
assert.doesNotMatch(toolUi, /formatPrice/);
assertNoDashes(toolLib, "outil lib");
assertNoDashes(toolUi, "outil ui");

const defaults = computeDemandesHorsBudgetFourchette({ ...DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS });
assert.equal(defaults.hb, 15);
assert.equal(defaults.hHB, 11.3);
assert.equal(defaults.cHB, 622);
assert.equal(defaults.anHB, 7464);
assert.equal(defaults.evit, 7.5);
assert.equal(defaults.hRec, 5);
assert.equal(defaults.cRec, 275);
assert.equal(defaults.anRec, 3300);
assert.equal(defaults.lineLow, 3360);
assert.equal(defaults.lineHigh, 4560);
assert.equal(defaults.alertTone, "warn");
assert.equal(defaults.coutTone, "warn");
assert.equal(defaults.recTone, "ok");
assert.match(defaults.alert, /Enjeu notable/);
assert.match(defaults.ligneLabel, /à/);
assert.match(defaults.recap, /Checklist fourchette dans QuoteBuilder/);
assert.match(defaults.recap, /Prix fixe, Fourchette ou Sur devis/);
assert.match(defaults.recap, /page Règles/);
assert.match(defaults.recap, /pas un benchmark/);
assert.match(defaults.recap, /pas un devis/);
assert.match(defaults.recap, /Le score ne lit pas les prix/);
assert.match(defaults.tip, /libérerait environ/);
assertNoDashes(defaults.alert, "alerte défaut");
assertNoDashes(defaults.tip, "tip défaut");
assertNoDashes(defaults.recap, "récap défaut");
assertNoDashes(defaults.ligneLabel, "ligne défaut");
assert.equal(DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.demandes, "Demandes de devis / mois");
assert.equal(DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.cout, "Coût indicatif / mois");
assert.equal(DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.an, "Sur 12 mois (indicatif)");

const fixed = computeDemandesHorsBudgetFourchette({
  ...DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS,
  pMax: Number.NaN,
  minutesApres: 90,
});
assert.equal(fixed.minutesApres, 45);
assert.equal(fixed.hRec, 0);
assert.equal(fixed.cRec, 0);
assert.equal(fixed.anRec, 0);
assert.equal(fixed.lineLow, 3360);
assert.equal(fixed.lineHigh, 3360);
assert.equal(fixed.pMax, fixed.pMin);
assert.equal(fixed.ligneLabel.includes("à"), false);
assert.match(fixed.tip, /pas de temps récupéré/);

const fixedNull = computeDemandesHorsBudgetFourchette({
  ...DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS,
  pMax: null,
  minutesApres: 90,
});
assert.equal(fixedNull.lineLow, 3360);
assert.equal(fixedNull.lineHigh, 3360);
assert.equal(fixedNull.minutesApres, 45);

const inverted = computeDemandesHorsBudgetFourchette({
  ...DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS,
  pMin: 40,
  pMax: 30,
  qty: 0,
  demandes: 0,
});
assert.equal(inverted.unitLow, 30);
assert.equal(inverted.unitHigh, 40);
assert.equal(inverted.qty, 1);
assert.equal(inverted.lineLow, 30);
assert.equal(inverted.lineHigh, 40);
assert.equal(inverted.cHB, 0);
assert.equal(inverted.alertTone, "neutral");
assert.match(inverted.alert, /Indiquez un volume/);

const none = computeDemandesHorsBudgetFourchette({
  ...DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS,
  pctHB: 0,
});
assert.equal(none.hb, 0);
assert.equal(none.cHB, 0);
assert.equal(none.alertTone, "neutral");
assert.match(none.alert, /Aucune demande hors budget/);

const important = computeDemandesHorsBudgetFourchette({
  ...DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS,
  demandes: 200,
  pctHB: 30,
  pctEvit: 0,
});
assert.equal(important.hb, 60);
assert.equal(important.hHB, 45);
assert.equal(important.cHB, 2475);
assert.equal(important.anHB, 29700);
assert.equal(important.evit, 0);
assert.equal(important.cRec, 0);
assert.equal(important.hRec, 0);
assert.equal(important.alertTone, "bad");
assert.equal(important.coutTone, "bad");
assert.match(important.alert, /Enjeu important/);
assert.match(important.tip, /pas de temps récupéré/);
