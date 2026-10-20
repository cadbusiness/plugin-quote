import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { FUNNEL_TEMPLATES } from "@/lib/funnels/templates";
import { scoreQuote } from "@/lib/quotes/score";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_PENALITES_RETARD,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  DEFAULTS,
  INDEMNITE,
  SEMESTRES,
  buildRecap,
  computePenalites,
  fmtDate,
  fmtEur,
  fmtJours,
  fmtPct,
  finDeMois,
  parseDate,
  semestreDe,
  type PenalitesInput,
} from "./calculateur-penalites-retard-paiement";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "conditions-paiement-penalites-retard-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_SLUG = "funnel-devis-cabinet-conseil";
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;
const TOOL_PATH = "/outils/calculateur-penalites-retard-paiement";
const DAY = "2026-10-20";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_PENALITES_RETARD, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Conditions de paiement dans un devis B2B : délai, pénalités de retard et indemnité de 40 €",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Conditions de paiement entre professionnels : délai de 30 jours par défaut, 60 jours maximum ou 45 jours fin de mois, pénalités de retard au taux BCE majoré de 10 points (12,40 % au second semestre 2026), plancher de trois fois l'intérêt légal, indemnité forfaitaire de 40 €, escompte, et pourquoi tout cela s'écrit dès le devis. Avec un exemple chiffré, un calculateur et ce que QuoteBuilder permet, ou pas.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisDetail);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 21);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)),
);
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.equal(BLOG_POSTS.some((post) => post.slug === SECTOR_SLUG), false);
for (const item of BLOG_FAQ[BLOG_SLUG] ?? []) {
  assert.doesNotMatch(item.q, EM_DASH);
  assert.doesNotMatch(item.q, EN_DASH);
  assert.doesNotMatch(item.a, EM_DASH);
  assert.doesNotMatch(item.a, EN_DASH);
}

assert.equal(BLOG_POSTS.length, 61);
assert.equal(BLOG_TOOLS.length, 51);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Calculateur de pénalités de retard de paiement");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["relances", "catalogue"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Facture payée en retard : échéance, jours de retard, pénalités au taux BCE + 10 points par semestre et indemnité de 40 €, avec un récapitulatif à copier.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-et-un outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-et-un outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(51), outilsHubIntro());
assert.equal(outilsHubIntro(49), "Quarante-neuf outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === SECTOR_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "${DAY}"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, DAY);
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(
  llms,
  /Conditions de paiement dans un devis B2B : délai, pénalités de retard et indemnité de 40 € : https:\/\/www\.quotebuilder\.co\/blog\/conditions-paiement-penalites-retard-devis-b2b/,
);
assert.match(
  llms,
  /Funnel de devis cabinet de conseil : https:\/\/www\.quotebuilder\.co\/secteurs\/funnel-devis-cabinet-conseil/,
);
assert.match(
  llms,
  /Calculateur de pénalités de retard de paiement : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-penalites-retard-paiement/,
);
const llmsLines = llms.split("\n");
const blogLine = llmsLines.findIndex((line) => line.includes(BLOG_PATH));
const sectorLine = llmsLines.findIndex((line) => line.includes(SECTOR_PATH));
const toolLine = llmsLines.findIndex((line) => line.includes(TOOL_PATH));
const tarifsLine = llmsLines.findIndex((line) => line.includes("https://www.quotebuilder.co/tarifs"));
assert.ok(sectorLine >= 0 && sectorLine < tarifsLine, "secteur llms avec les secteurs");
assert.ok(blogLine > tarifsLine, "article llms avec les articles");
assert.ok(toolLine > blogLine, "outil llms avec les outils");

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /calculateur-penalites-retard-paiement/);
assert.match(outilsHub, /Calculateur de pénalités de retard de paiement/);
assert.match(outilsHub, /calculateur de pénalités de retard de paiement/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-penalites-retard-paiement"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 320), /eyebrow: "Pilotage"/);
}

const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(
  secteursHub,
  /href: "\/secteurs\/funnel-devis-cabinet-conseil", label: "Cabinet de conseil"/,
);

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

function faqFromPage(source: string) {
  const start = source.indexOf("const FAQ = [");
  assert.ok(start >= 0, "page FAQ missing");
  const end = source.indexOf("];", start);
  const block = source.slice(start, end);
  const qs = [...block.matchAll(/q: "((?:\\.|[^"\\])*)"/g)].map((match) => match[1] ?? "");
  const answers = [...block.matchAll(/a: "((?:\\.|[^"\\])*)"/g)].map((match) => (match[1] ?? "").replace(/\\"/g, '"'));
  return qs.map((q, index) => ({ q, a: answers[index] }));
}

function assertInternalLinks(body: string, label: string) {
  const hrefs = body.match(/https:\/\/www\.quotebuilder\.co[^)\s]*/g) ?? [];
  for (const href of hrefs) {
    const path = href.replace("https://www.quotebuilder.co", "").split("?")[0] ?? "";
    if (path.startsWith("/c/") || path.startsWith("/signup") || path.startsWith("/b/")) continue;
    assert.ok(paths.includes(path), `${label} link not in routes.ts: ${path}`);
  }
  assert.doesNotMatch(body, /\/blog\/espace-prospect-devis-en-ligne/);
}

function assertNoDashes(text: string, label: string) {
  assert.doesNotMatch(text, EM_DASH, `${label} has an em dash`);
  assert.doesNotMatch(text, EN_DASH, `${label} has an en dash`);
}

function alphaTokens(body: string) {
  return body.split(/\s+/).filter((word) => /[A-Za-zÀ-ÿ0-9]/.test(word)).length;
}

function close(actual: number | null, expected: number, eps = 1e-5) {
  assert.ok(actual != null, `expected ${expected}, got null`);
  assert.ok(Math.abs(actual - expected) < eps, `${actual} != ${expected}`);
}

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(
    blogBody.startsWith(
      "# Conditions de paiement dans un devis B2B : délai, pénalités de retard et indemnité de 40 €",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  for (const needle of [
    "L441-10",
    "D441-5",
    "12,40",
    "45 jours fin de mois",
    "580,42",
    "620,42",
    "hypothèses d'exemple",
    "Conditions générales",
    "non contractuel",
    "Écrire",
    "/outils/calculateur-penalites-retard-paiement",
  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assertNoDashes(blogRaw, "paiement md");
  assertNoDashes(blogBody, "paiement body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 5219);
  assert.equal(alphaTokens(blogBody), 4796);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "paiement");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"));
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith(
      "# Funnel de devis cabinet de conseil : audit, accompagnement, management de transition, une demande cadrée avant le premier rendez-vous",
    ),
  );
  for (const needle of [
    "tech_consulting",
    "Funnel conseil",
    "Votre mission",
    "Sujet et échéance",
    "Type de mission",
    "Missions types",
    "Management de transition",
    "Objectif, contraintes, déjà en place",
    "30 points",
    "Plan (PDF ou image)",
    "Demande de photo",
    "70.22Z",
    "L8241-1",
    "Tech & services",
  ]) {
    assert.ok(sectorBody.includes(needle), `secteur missing ${needle}`);
  }
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(sectorBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assertNoDashes(sectorRaw, "conseil md");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 4812);
  assert.equal(alphaTokens(sectorBody), 4438);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "conseil");

  const sectorPage = readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-cabinet-conseil/page.tsx"),
    "utf8",
  );
  assert.deepEqual(faqFromPage(sectorPage), faqFromMarkdown(sectorBody));
  assert.match(sectorPage, /Essayer le template Conseil/);
  assert.match(sectorPage, /Secteur · Cabinet de conseil/);
  assert.match(sectorPage, /Tech & services/);
  assert.match(sectorPage, /signup\?plan=free/);
  assert.match(sectorPage, /loadPostBody\("funnel-devis-cabinet-conseil"\)/);
  assert.match(sectorPage, /WebPage/);
  assert.match(sectorPage, /\/blog\/conditions-paiement-penalites-retard-devis-b2b/);
  assert.match(sectorPage, /\/outils\/calculateur-penalites-retard-paiement/);
  assert.match(sectorPage, /\/blog\/regles-suggestion-produits-funnel-devis-b2b/);
  assert.match(sectorPage, /\/fonctionnalites\/espace-prospect/);
  assertNoDashes(sectorPage, "conseil page");
}

const consulting = FUNNEL_TEMPLATES.find((template) => template.id === "tech_consulting");
assert.ok(consulting, "template tech_consulting missing");
if (!consulting) throw new Error("template tech_consulting missing");
assert.equal(consulting.steps[1]?.subtitle, "Missions types");
const consultingQuestions = consulting.steps[0]?.questions ?? [];
const projectType = consultingQuestions.find((item) => item.key === "project_type");
const notes = consultingQuestions.find((item) => item.key === "notes");
const timeline = consultingQuestions.find((item) => item.key === "timeline");
assert.equal(notes?.type, "text");
assert.equal(timeline?.type, "select");
const choices = (projectType?.options as { choices?: { value: string }[] } | null)?.choices ?? [];
assert.deepEqual(
  choices.map((choice) => choice.value),
  ["audit", "transform", "interim", "other"],
);
const timelineChoices = (timeline?.options as { choices?: { value: string }[] } | null)?.choices ?? [];
assert.deepEqual(
  timelineChoices.map((choice) => choice.value),
  ["asap", "month", "quarter", "explore"],
);
const scoredAudit = scoreQuote({
  project_type: "audit",
  notes: "x".repeat(120),
  timeline: "asap",
});
assert.equal(scoredAudit.score, 30);
assert.equal(scoredAudit.label, "cold");
const scoredInterim = scoreQuote({ project_type: "interim" });
assert.equal(scoredInterim.score, 30);
assert.equal(scoredInterim.label, "cold");

{
  const mentionsRaw = readFileSync(join(blogDir, "mentions-obligatoires-devis-france.md"), "utf8");
  const mentionsFaq = readFileSync(join(process.cwd(), "src/lib/marketing/blog-faq.ts"), "utf8");
  assert.equal(mentionsRaw.includes("page dans l’espace prospect"), false);
  assert.equal(mentionsRaw.includes("annexe, espace prospect"), false);
  assert.equal(mentionsFaq.includes("page dans l’espace prospect"), false);
  assert.equal(mentionsFaq.includes("annexe, espace prospect"), false);
  const mentionsBody = stripFrontmatter(mentionsRaw);
  const faq3 = faqFromMarkdown(mentionsBody)[2];
  const stored = BLOG_FAQ["mentions-obligatoires-devis-france"]?.[2];
  assert.ok(faq3);
  assert.ok(stored);
  assert.equal(faq3.q.replace(/^\d+\.\s+/, ""), stored.q);
  assert.equal(faq3.a, stored.a);
  assert.match(faq3.a, /lien versionné, annexe jointe au devis/);
  assert.match(mentionsBody, /lien vers vos CGV, annexe PDF jointe au devis/);
}

const addedSources = [
  "src/lib/marketing/calculateur-penalites-retard-paiement.ts",
  "src/lib/marketing/seo-am-20261020.test.ts",
  "src/components/marketing/calculateur-penalites-retard-paiement-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-penalites-retard-paiement/page.tsx",
  "src/app/(marketing)/secteurs/funnel-devis-cabinet-conseil/page.tsx",
  "src/content/blog/conditions-paiement-penalites-retard-devis-b2b.md",
  "src/content/blog/funnel-devis-cabinet-conseil.md",
];
assertNoDashes((BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"), "paiement faq");
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-penalites-retard-paiement/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-penalites-retard-paiement/);
assert.match(toolPage, /Calculateur de pénalités de retard de paiement \(B2B\)/);
assert.match(toolPage, /L441-10/);
assert.match(toolPage, /1er janvier 2027/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /\/blog\/conditions-paiement-penalites-retard-devis-b2b/);
assert.match(toolPage, /\/blog\/mentions-obligatoires-devis-france/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /\/signup\?plan=free/);
assertNoDashes(toolPage, "outil page");

const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-penalites-retard-paiement-calculator.tsx"),
  "utf8",
);
assert.match(toolUi, /hypothèses d'exemple, pas des moyennes de marché/);
assert.match(toolUi, /La facture/);
assert.match(toolUi, /Le paiement/);
assert.match(toolUi, /Le taux des pénalités/);
assert.match(toolUi, /L'échéance et le retard/);
assert.match(toolUi, /Ce que vous pouvez réclamer/);
assert.match(toolUi, /Détail par semestre/);
assert.match(toolUi, /Semestre/);
assert.match(toolUi, /Taux BCE/);
assert.match(toolUi, /Taux appliqué/);
assert.match(toolUi, /Plancher légal/);
assert.match(toolUi, /Pénalités/);
assert.match(toolUi, /taux à vérifier/);
assert.match(toolUi, /Pour lire vos chiffres/);
assert.match(toolUi, /Récapitulatif/);
assert.match(toolUi, /label="Copier"/);
assert.doesNotMatch(toolUi, /fetch\(/);
assertNoDashes(toolUi, "outil ui");

assert.deepStrictEqual(
  SEMESTRES.map((item) => [item.id, item.bce, item.legal]),
  [
    ["2024-1", 4.5, 5.07],
    ["2024-2", 4.25, 4.92],
    ["2025-1", 3.15, 3.71],
    ["2025-2", 2.15, 2.76],
    ["2026-1", 2.15, 2.62],
    ["2026-2", 2.4, 2.75],
  ],
);
assert.strictEqual(INDEMNITE, 40);
assert.deepEqual(DEFAULTS, {
  montant: 12000,
  nbFactures: 1,
  dateFacture: "2026-04-30",
  delaiType: "nets",
  delaiJours: 30,
  dateEcheance: "2026-05-30",
  datePaiement: "2026-10-20",
  tauxMode: "legal",
  tauxContrat: 10,
  bceAutre: 2.65,
});

assert.strictEqual(fmtEur(580.421918), `580,42${NB}€`);
assert.strictEqual(fmtEur(12000), `12${NB}000${NB}€`);
assert.strictEqual(fmtEur(1105.254795), `1${NB}105,25${NB}€`);
assert.strictEqual(fmtEur(40), `40${NB}€`);
assert.strictEqual(fmtEur(0), `0${NB}€`);
assert.strictEqual(fmtEur(-0.001), `0${NB}€`);
assert.strictEqual(fmtEur(null), "n/a");
assert.strictEqual(fmtPct(12.4), `12,40${NB}%`);
assert.strictEqual(fmtPct(12.15), `12,15${NB}%`);
assert.strictEqual(fmtPct(10), `10${NB}%`);
assert.strictEqual(fmtPct(4.5), `4,50${NB}%`);
assert.strictEqual(fmtPct(null), "n/a");
assert.strictEqual(fmtJours(143), "143 jours");
assert.strictEqual(fmtJours(1), "1 jour");
assert.strictEqual(fmtJours(0), "0 jour");
assert.strictEqual(fmtJours(null), "n/a");
assert.strictEqual(fmtDate(parseDate("2026-05-30")), "30/05/2026");
assert.strictEqual(fmtDate(null), "n/a");
assert.strictEqual(parseDate("2026-02-30"), null);
assert.strictEqual(parseDate("30/05/2026"), null);
assert.strictEqual(parseDate(""), null);
assert.strictEqual(fmtDate(finDeMois(parseDate("2024-02-10") ?? 0)), "29/02/2024");
assert.strictEqual(semestreDe(parseDate("2026-06-30") ?? 0).id, "2026-1");
assert.strictEqual(semestreDe(parseDate("2026-07-01") ?? 0).id, "2026-2");
assert.strictEqual(semestreDe(parseDate("2027-01-01") ?? 0).provisoire, true);
assert.strictEqual(semestreDe(parseDate("2027-01-01") ?? 0).label, "1er semestre 2027");

const run = (overrides: PenalitesInput) => computePenalites({ ...DEFAULTS, ...overrides });

const r = computePenalites(DEFAULTS);
assert.strictEqual(fmtDate(r.echeance), "30/05/2026");
assert.strictEqual(r.delaiTotal, 30);
assert.strictEqual(r.delaiEtat, "ok");
assert.strictEqual(r.joursRetard, 143);
assert.strictEqual(r.segments.length, 2);
assert.deepStrictEqual(
  r.segments.map((segment) => [segment.id, segment.jours, segment.bce, segment.taux, segment.plancher]),
  [
    ["2026-1", 31, 2.15, 12.15, 7.86],
    ["2026-2", 112, 2.4, 12.4, 8.25],
  ],
);
close(r.segments[0]?.penalite ?? null, 123.830137);
close(r.segments[1]?.penalite ?? null, 456.591781);
close(r.penalites, 580.421918);
assert.strictEqual(r.indemnite, 40);
close(r.total, 620.421918);
close(r.parJour, 4.076712);
assert.strictEqual(r.tauxCourant, 12.4);
assert.strictEqual(r.etat, "ok");
assert.strictEqual(
  r.verdict,
  `143 jours de retard : 580,42${NB}€ de pénalités et 40${NB}€ d'indemnité forfaitaire, soit 620,42${NB}€ à réclamer en plus des 12${NB}000${NB}€ dus.`,
);
assert.strictEqual(r.conseils.length, 5);
assert.ok(r.conseils[2]?.startsWith("Le retard couvre 2 semestres"));
assert.strictEqual(
  r.recap,
  [
    "Pénalités de retard de paiement (B2B)",
    `Montant dû : 12${NB}000${NB}€ TTC, 1 facture`,
    "Facture du 30/04/2026, échéance le 30/05/2026 (30 jours nets)",
    "Paiement le 20/10/2026 : 143 jours de retard",
    `Taux : BCE + 10 points (12,15${NB}% puis 12,40${NB}%)`,
    `Pénalités : 580,42${NB}€`,
    `Indemnité forfaitaire : 40${NB}€ (1 × 40${NB}€)`,
    `Total à réclamer : 620,42${NB}€`,
    "Calcul : quotebuilder.co/outils/calculateur-penalites-retard-paiement",
  ].join("\n"),
);
assert.strictEqual(buildRecap(DEFAULTS), r.recap);

const f1 = run({ delaiType: "fdm1", dateFacture: "2026-08-01" });
assert.strictEqual(fmtDate(f1.echeance), "15/10/2026");
assert.strictEqual(f1.delaiTotal, 75);
assert.strictEqual(f1.delaiEtat, "warn");
assert.strictEqual(f1.joursRetard, 5);
close(f1.penalites, 20.383562);
assert.strictEqual(f1.etat, "warn");
assert.ok(f1.conseils.some((item) => item.includes("le 15/10/2026") && item.includes("le 30/09/2026")));
const f2 = run({ delaiType: "fdm2", dateFacture: "2026-08-01" });
assert.strictEqual(fmtDate(f2.echeance), "30/09/2026");
assert.strictEqual(f2.joursRetard, 20);
close(f2.penalites, 81.534247);
assert.ok(f2.recap.includes("(45 jours fin de mois, 45 jours puis fin du mois)"));

const d75 = run({ delaiJours: 75 });
assert.strictEqual(d75.delaiEtat, "bad");
assert.strictEqual(d75.etat, "bad");
assert.ok(d75.verdict.includes("dépasse le maximum de 60 jours"));
const d60 = run({ delaiJours: 60 });
assert.strictEqual(d60.delaiEtat, "ok");
assert.strictEqual(fmtDate(d60.echeance), "29/06/2026");
assert.strictEqual(d60.joursRetard, 113);
const man = run({ delaiType: "date", dateEcheance: "2026-07-15" });
assert.strictEqual(man.delaiTotal, 76);
assert.strictEqual(man.delaiEtat, "warn");
assert.strictEqual(man.joursRetard, 97);
const avant = run({ delaiType: "date", dateEcheance: "2026-04-01" });
assert.strictEqual(avant.delaiEtat, "bad");
assert.ok(avant.verdict.includes("avant la date de la facture"));

const c10 = run({ tauxMode: "contrat", tauxContrat: 10 });
close(c10.penalites, 470.136986);
assert.strictEqual(c10.etat, "ok");
assert.ok(c10.recap.includes(`Taux : contractuel, 10${NB}%`));
assert.ok(c10.conseils.some((item) => item.startsWith("Votre taux contractuel ne s'applique")));
const c8 = run({ tauxMode: "contrat", tauxContrat: 8 });
assert.strictEqual(c8.sousPlancher, true);
assert.strictEqual(c8.plancherMax, 8.25);
assert.strictEqual(c8.etat, "bad");
assert.strictEqual(
  c8.verdict,
  `Votre taux contractuel de 8${NB}% est sous le plancher légal de 8,25${NB}% (trois fois le taux de l'intérêt légal). Corrigez vos CGV avant de réclamer ce montant.`,
);
const c825 = run({ tauxMode: "contrat", tauxContrat: 8.25 });
assert.strictEqual(c825.sousPlancher, false);
assert.strictEqual(c825.etat, "ok");

const p27 = run({ datePaiement: "2027-02-15" });
assert.strictEqual(p27.joursRetard, 261);
assert.deepStrictEqual(
  p27.segments.map((segment) => [segment.id, segment.jours, segment.taux, segment.provisoire]),
  [
    ["2026-1", 31, 12.15, false],
    ["2026-2", 184, 12.4, false],
    ["2027-1", 46, 12.65, true],
  ],
);
close(p27.segments[2]?.penalite ?? null, 191.309589);
assert.strictEqual(p27.segments[2]?.plancher, null);
assert.strictEqual(p27.etat, "warn");
assert.ok(p27.verdict.includes("vérifiez le taux BCE retenu"));
const p27b = run({ datePaiement: "2027-02-15", bceAutre: 3 });
assert.strictEqual(p27b.segments[2]?.taux, 13);

const bis = run({
  delaiType: "date",
  dateFacture: "2024-01-29",
  dateEcheance: "2024-02-28",
  datePaiement: "2024-03-01",
});
assert.strictEqual(bis.joursRetard, 2);
close(bis.penalites, 9.534247);
const bord = run({
  delaiType: "date",
  dateFacture: "2026-06-01",
  dateEcheance: "2026-06-30",
  datePaiement: "2026-07-01",
});
assert.strictEqual(bord.segments.length, 1);
assert.strictEqual(bord.segments[0]?.id, "2026-2");
assert.strictEqual(bord.joursRetard, 1);
const vieux = run({
  delaiType: "date",
  dateFacture: "2023-11-01",
  dateEcheance: "2023-12-01",
  datePaiement: "2024-01-10",
});
assert.deepStrictEqual(
  vieux.segments.map((segment) => [segment.id, segment.jours, segment.provisoire]),
  [
    ["2023-2", 30, true],
    ["2024-1", 10, false],
  ],
);

const aTemps = run({ datePaiement: "2026-05-20" });
assert.strictEqual(aTemps.joursRetard, 0);
assert.strictEqual(aTemps.penalites, 0);
assert.strictEqual(aTemps.indemnite, 0);
assert.strictEqual(aTemps.etat, "neutral");
assert.strictEqual(aTemps.verdict, "Facture payée à l'échéance ou avant : aucune pénalité ni indemnité.");
assert.strictEqual(aTemps.conseils.length, 1);
const jourJ = run({ datePaiement: "2026-05-30" });
assert.strictEqual(jourJ.joursRetard, 0);
const zero = run({ montant: 0 });
assert.strictEqual(zero.etat, "neutral");
assert.strictEqual(zero.indemnite, 0);
assert.strictEqual(zero.total, 0);
const sansDate = run({ dateFacture: "" });
assert.strictEqual(sansDate.echeance, null);
assert.strictEqual(sansDate.etat, "neutral");
assert.ok(sansDate.verdict.startsWith("Renseignez la date de la facture"));
const sansPaiement = run({ datePaiement: "" });
assert.strictEqual(sansPaiement.etat, "neutral");
assert.strictEqual(sansPaiement.parJour, null);
const vide = computePenalites({});
assert.strictEqual(vide.etat, "neutral");
assert.strictEqual(vide.total, 0);

const trois = run({ nbFactures: 3 });
assert.strictEqual(trois.indemnite, 120);
close(trois.penalites, 580.421918);
assert.ok(trois.recap.includes("TTC, 3 factures"));
assert.ok(trois.recap.includes(`(3 × 40${NB}€)`));
assert.strictEqual(run({ nbFactures: 0 }).nbFactures, 1);
assert.strictEqual(run({ nbFactures: 2.7 }).nbFactures, 2);
assert.strictEqual(run({ montant: -5 }).montant, 0);
assert.strictEqual(run({ tauxContrat: 150 }).tauxContrat, 100);
assert.strictEqual(run({ delaiJours: "abc" }).delaiJours, 0);
assert.strictEqual(run({ delaiType: "autre" }).delaiType, "nets");
assert.strictEqual(run({ tauxMode: "x" }).tauxMode, "legal");
assert.strictEqual(run({ bceAutre: -1 }).bceAutre, 0);
