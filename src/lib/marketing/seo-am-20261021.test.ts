import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { getFunnelFamily } from "@/lib/funnels/families";
import { FUNNEL_TEMPLATES, type TemplateQuestion } from "@/lib/funnels/templates";
import { scoreQuote } from "@/lib/quotes/score";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_FRAIS_ANNULATION,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  DEFAULTS,
  REGIMES,
  buildRecap,
  computeAnnulation,
  fmtDate,
  fmtEur,
  fmtJours,
  fmtNum,
  fmtPct,
  palierDe,
  palierLabels,
  parseDate,
  type AnnulationInput,
} from "./calculateur-frais-annulation-commande";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "annulation-commande-devis-b2b-arrhes-dedit-clause-penale";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_SLUG = "funnel-devis-location-espaces";
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;
const TOOL_PATH = "/outils/calculateur-frais-annulation-commande";
const FORMATION_PATH = "/secteurs/funnel-devis-formation-professionnelle";
const DAY = "2026-10-21";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_FRAIS_ANNULATION, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "funnel"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Annulation d'une commande B2B après un devis signé : arrhes, acompte, dédit et clause pénale",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Un client professionnel annule une commande signée : ce que vous pouvez garder selon que la somme versée est un acompte ou des arrhes (article 1590 du Code civil), la différence entre clause de dédit et clause pénale (article 1231-5), le cas du marché de travaux à forfait (article 1794), la force majeure, un barème d'annulation qui tient, un exemple chiffré et ce que QuoteBuilder permet, ou pas.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisDetail);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 22);
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

assert.equal(BLOG_POSTS.length, 66);
assert.equal(BLOG_TOOLS.length, 56);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Calculateur de frais d'annulation");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["catalogue", "relances"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Commande annulée avant le début : palier du barème, indemnité, acompte ou arrhes à garder ou à rendre, solde et perte réelle, avec un récapitulatif à copier.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-six outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-six outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(56), outilsHubIntro());
assert.equal(outilsHubIntro(51), "Cinquante-et-un outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
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
for (const path of [...DAY_PATHS, FORMATION_PATH]) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "${DAY}"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, DAY);
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(
  llms,
  /Annulation d'une commande B2B après un devis signé : arrhes, acompte, dédit et clause pénale : https:\/\/www\.quotebuilder\.co\/blog\/annulation-commande-devis-b2b-arrhes-dedit-clause-penale/,
);
assert.match(
  llms,
  /Funnel de devis location d'espaces : https:\/\/www\.quotebuilder\.co\/secteurs\/funnel-devis-location-espaces/,
);
assert.match(
  llms,
  /Calculateur de frais d'annulation : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-frais-annulation-commande/,
);
const llmsLines = llms.split("\n");
const blogLine = llmsLines.findIndex((line) => line.includes(BLOG_PATH));
const sectorLine = llmsLines.findIndex((line) => line.includes(SECTOR_PATH));
const toolLine = llmsLines.findIndex((line) => line.includes(TOOL_PATH));
const tarifsLine = llmsLines.findIndex((line) => line.includes("https://www.quotebuilder.co/tarifs"));
const cabinetLine = llmsLines.findIndex((line) => line.includes("/secteurs/funnel-devis-cabinet-conseil"));
assert.ok(sectorLine > cabinetLine && sectorLine < tarifsLine, "secteur llms avec les secteurs");
assert.ok(blogLine > tarifsLine, "article llms avec les articles");
assert.ok(toolLine > blogLine, "outil llms avec les outils");

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /calculateur-frais-annulation-commande/);
assert.match(outilsHub, /Calculateur de frais d'annulation/);
assert.match(outilsHub, /calculateur de frais d'annulation/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-frais-annulation-commande"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 280), /eyebrow: "Pilotage"/);
}

const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(
  secteursHub,
  /href: "\/secteurs\/funnel-devis-location-espaces", label: "Location de salles et d'espaces"/,
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

function choicesOf(question: TemplateQuestion) {
  const options = question.options;
  if (!options || typeof options !== "object" || Array.isArray(options)) return [];
  const choices = (options as { choices?: unknown }).choices;
  if (!Array.isArray(choices)) return [];
  return choices.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const value = (item as { value?: unknown }).value;
    const label = (item as { label?: unknown }).label;
    if (typeof value !== "string" || typeof label !== "string") return [];
    return [{ value, label }];
  });
}

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(
    blogBody.startsWith(
      "# Annulation d'une commande B2B après un devis signé : arrhes, acompte, dédit et clause pénale",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  for (const needle of [
    "1103",
    "1590",
    "1231-5",
    "1794",
    "1218",
    "L214-1",
    "L442-1",
    "23-23.942",
    "hypothèses d'exemple",
    "non contractuel",
    "Gagné",
    "/outils/calculateur-frais-annulation-commande",
  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assertNoDashes(blogRaw, "annulation md");
  assertNoDashes(blogBody, "annulation body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 5393);
  assert.equal(alphaTokens(blogBody), 4919);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "annulation");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"));
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith(
      "# Funnel de devis location d'espaces : salle de réunion, coworking, salle événementielle, une demande de réservation complète avant le devis",
    ),
  );
  for (const needle of [
    "services_spaces",
    "Funnel espaces",
    "Votre réservation",
    "Usage, jauge et durée",
    "Type d’espace",
    "Espaces disponibles",
    "Date ou lieu",
    "1 mois et +",
    "30 points",
    "Plan (PDF ou image)",
    "Demande de photo",
    "68.20B",
    "F32351",
    "1709",
  ]) {
    assert.ok(sectorBody.includes(needle), `secteur missing ${needle}`);
  }
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(sectorBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assertNoDashes(sectorRaw, "espaces md");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 4805);
  assert.equal(alphaTokens(sectorBody), 4390);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "espaces");

  const sectorPage = readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-location-espaces/page.tsx"),
    "utf8",
  );
  assert.deepEqual(faqFromPage(sectorPage), faqFromMarkdown(sectorBody));
  assert.match(sectorPage, /Essayer le template Location d’espaces/);
  assert.match(sectorPage, /Secteur · Location d'espaces/);
  assert.match(sectorPage, /Services professionnels/);
  assert.match(sectorPage, /loadPostBody\("funnel-devis-location-espaces"\)/);
  assert.match(sectorPage, /WebPage/);
  assert.match(sectorPage, /\/blog\/annulation-commande-devis-b2b-arrhes-dedit-clause-penale/);
  assert.match(sectorPage, /\/outils\/calculateur-frais-annulation-commande/);
  assert.match(sectorPage, /\/blog\/regles-suggestion-produits-funnel-devis-b2b/);
  assert.match(sectorPage, /\/fonctionnalites\/espace-prospect/);
  assert.match(sectorPage, /signup\?plan=free/);
  assertNoDashes(sectorPage, "secteur page");
}

{
  const formationRaw = readFileSync(join(blogDir, "funnel-devis-formation-professionnelle.md"), "utf8");
  const formationBody = stripFrontmatter(formationRaw);
  assert.doesNotMatch(formationBody, /pose les questions de jauge/);
  assert.doesNotMatch(formationBody, /partagent la même logique de questions/);
  assert.match(formationBody, /ne posent pas tous les mêmes questions/);
  assert.match(formationBody, /\/secteurs\/funnel-devis-location-espaces/);
  assertNoDashes(formationRaw, "formation md");
}

const spaces = FUNNEL_TEMPLATES.find((template) => template.id === "services_spaces");
assert.ok(spaces, "services_spaces missing");
assert.equal(spaces.family, "services");
assert.equal(spaces.label, "Location d’espaces");
assert.equal(spaces.defaultName, "Funnel espaces");
assert.equal(spaces.defaultKind, "form");
assert.equal(getFunnelFamily(spaces.family).label, "Services professionnels");
const reservation = spaces.steps[0];
assert.equal(reservation?.title, "Votre réservation");
assert.equal(reservation?.subtitle, "Usage, jauge et durée");
const questions = reservation?.questions ?? [];
const category = questions.find((question) => question.key === "category");
const duration = questions.find((question) => question.key === "duration");
const when = questions.find((question) => question.key === "when");
assert.equal(category?.type, "visual_choice");
assert.equal(category?.label, "Type d’espace");
assert.deepEqual(
  choicesOf(category!).map((choice) => choice.value),
  ["cowork", "meeting", "event", "other"],
);
assert.equal(duration?.type, "select");
assert.equal(duration?.label, "Durée");
assert.deepEqual(
  choicesOf(duration!).map((choice) => [choice.value, choice.label]),
  [
    ["day", "1 jour"],
    ["week", "Quelques jours"],
    ["month", "1 mois et +"],
  ],
);
assert.equal(when?.type, "text");
assert.equal(when?.label, "Date ou lieu");
for (const step of spaces.steps) {
  for (const question of step.questions ?? []) {
    const blob = `${question.key} ${question.label}`.toLowerCase();
    assert.doesNotMatch(blob, /jauge|personne/);
  }
}
assert.equal(spaces.steps.find((step) => step.screen_type === "suggestions")?.subtitle, "Espaces disponibles");

assert.deepEqual(scoreQuote({ category: "event", duration: "month", when: "x".repeat(120) }), {
  score: 30,
  label: "cold",
});
assert.deepEqual(scoreQuote({ category: "meeting" }), { score: 30, label: "cold" });

const addedSources = [
  "src/lib/marketing/calculateur-frais-annulation-commande.ts",
  "src/lib/marketing/seo-am-20261021.test.ts",
  "src/components/marketing/calculateur-frais-annulation-commande-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-frais-annulation-commande/page.tsx",
  "src/app/(marketing)/secteurs/funnel-devis-location-espaces/page.tsx",
  "src/content/blog/annulation-commande-devis-b2b-arrhes-dedit-clause-penale.md",
  "src/content/blog/funnel-devis-location-espaces.md",
];
assertNoDashes((BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"), "annulation faq");
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-frais-annulation-commande/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-frais-annulation-commande/);
assert.match(toolPage, /Calculateur de frais d'annulation \(commande B2B\)/);
assert.match(toolPage, /1231-5/);
assert.match(toolPage, /L214-1/);
assert.match(toolPage, /ne remplace pas un conseil juridique/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /\/blog\/annulation-commande-devis-b2b-arrhes-dedit-clause-penale/);
assert.match(toolPage, /\/blog\/acomptes-echeances-devis-b2b/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /\/signup\?plan=free/);
assertNoDashes(toolPage, "outil page");

const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-frais-annulation-commande-calculator.tsx"),
  "utf8",
);
assert.match(toolUi, /hypothèses d'exemple, pas des barèmes de référence ni des usages d'une profession/);
assert.match(toolUi, /La commande/);
assert.match(toolUi, /L'annulation/);
assert.match(toolUi, /Votre barème d'annulation/);
assert.match(toolUi, /Ce que l'annulation vous coûte/);
assert.match(toolUi, /Le délai et le palier/);
assert.match(toolUi, /Ce que vous pouvez garder ou réclamer/);
assert.match(toolUi, /Le barème appliqué à cette commande/);
assert.match(toolUi, /Palier/);
assert.match(toolUi, /Annulation/);
assert.match(toolUi, /Indemnité/);
assert.match(toolUi, /Montant/);
assert.match(toolUi, /Après le versement/);
assert.match(toolUi, /Pour lire vos chiffres/);
assert.match(toolUi, /Récapitulatif/);
assert.match(toolUi, /label="Copier"/);
assert.match(toolUi, /bg-emerald-50/);
assert.match(toolUi, /bg-amber-50/);
assert.match(toolUi, /bg-rose-50/);
assert.match(toolUi, /bg-orange-50/);
assert.doesNotMatch(toolUi, /fetch\(/);
assertNoDashes(toolUi, "outil ui");

const toolLogic = readFileSync(join(process.cwd(), "src/lib/marketing/calculateur-frais-annulation-commande.ts"), "utf8");
assert.doesNotMatch(toolLogic, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket/);

assert.deepStrictEqual(REGIMES, ["acompte", "arrhes", "aucun"]);
assert.deepEqual(DEFAULTS, {
  montantHT: 8000,
  dateDebut: "2027-03-15",
  regime: "acompte",
  verse: 2400,
  dateAnnulation: "2027-02-20",
  auteur: "client",
  s1: 60,
  s2: 30,
  s3: 15,
  p1: 10,
  p2: 30,
  p3: 50,
  p4: 80,
  fraisEngages: 900,
  marge: 60,
});

assert.strictEqual(fmtEur(8000), `8${NB}000${NB}€`);
assert.strictEqual(fmtEur(1600), `1${NB}600${NB}€`);
assert.strictEqual(fmtEur(1250000), `1${NB}250${NB}000${NB}€`);
assert.strictEqual(fmtEur(1234.5), `1${NB}234,50${NB}€`);
assert.strictEqual(fmtEur(0), `0${NB}€`);
assert.strictEqual(fmtEur(-1600), `-1${NB}600${NB}€`);
assert.strictEqual(fmtEur(-0.001), `0${NB}€`);
assert.strictEqual(fmtEur(null), "n/a");
assert.strictEqual(fmtNum(70.175439), "70,18");
assert.strictEqual(fmtNum(12.5), "12,5");
assert.strictEqual(fmtNum(null), "n/a");
assert.strictEqual(fmtPct(50), `50${NB}%`);
assert.strictEqual(fmtPct(70.175439), `70,18${NB}%`);
assert.strictEqual(fmtPct(null), "n/a");
assert.strictEqual(fmtJours(23), "23 jours");
assert.strictEqual(fmtJours(1), "1 jour");
assert.strictEqual(fmtJours(0), "0 jour");
assert.strictEqual(fmtJours(null), "n/a");
assert.strictEqual(fmtDate(parseDate("2027-03-15")), "15/03/2027");
assert.strictEqual(fmtDate(null), "n/a");
assert.strictEqual(parseDate("2027-02-29"), null);
assert.strictEqual(parseDate("2028-02-29")! - parseDate("2028-02-28")!, 1);
assert.strictEqual(parseDate(""), null);
assert.strictEqual(parseDate("15/03/2027"), null);

assert.deepStrictEqual(palierLabels(60, 30, 15), [
  "60 jours et plus",
  "30 à 59 jours",
  "15 à 29 jours",
  "moins de 15 jours",
]);
assert.strictEqual(palierLabels(60, 30, 0)[3], "n/a");
assert.strictEqual(palierDe(60, 60, 30, 15), 1);
assert.strictEqual(palierDe(59, 60, 30, 15), 2);
assert.strictEqual(palierDe(30, 60, 30, 15), 2);
assert.strictEqual(palierDe(29, 60, 30, 15), 3);
assert.strictEqual(palierDe(15, 60, 30, 15), 3);
assert.strictEqual(palierDe(14, 60, 30, 15), 4);
assert.strictEqual(palierDe(0, 60, 30, 15), 4);

const run = (o: AnnulationInput) => computeAnnulation({ ...DEFAULTS, ...o });

const d = computeAnnulation(DEFAULTS);
assert.strictEqual(d.montantHT, 8000);
assert.strictEqual(d.regime, "acompte");
assert.strictEqual(d.auteur, "client");
assert.strictEqual(d.verse, 2400);
assert.strictEqual(d.coherent, true);
assert.strictEqual(d.joursAvant, 23);
assert.strictEqual(d.palier, 3);
assert.strictEqual(d.palierLabel, "15 à 29 jours");
assert.strictEqual(d.pct, 50);
assert.strictEqual(d.indemnite, 4000);
assert.strictEqual(d.garde, 4000);
assert.strictEqual(d.soldeLabel, "Reste à facturer");
assert.strictEqual(d.solde, 1600);
assert.strictEqual(d.perte, 5700);
close(d.couverture, 70.175439);
assert.deepStrictEqual(
  d.lignes.map((l) => [l.rang, l.pct, l.indemnite, l.apres, l.courant]),
  [
    [1, 10, 800, -1600, false],
    [2, 30, 2400, 0, false],
    [3, 50, 4000, 1600, true],
    [4, 80, 6400, 4000, false],
  ],
);
assert.strictEqual(d.etat, "ok");
assert.strictEqual(
  d.verdict,
  `Annulation à 23 jours du début : palier 3 (15 à 29 jours), 50${NB}%, soit 4${NB}000${NB}€ HT. L'acompte de 2${NB}400${NB}€ s'impute : reste à facturer 1${NB}600${NB}€ HT.`,
);
assert.strictEqual(d.conseils.length, 6);
assert.ok(d.conseils[0]?.includes("L214-1"));
assert.ok(d.conseils[2]?.includes(`70,18${NB}%`));
assert.ok(d.conseils[5]?.startsWith("QuoteBuilder ne calcule pas de frais d'annulation"));
const expectedRecap = [
  "Frais d'annulation (commande B2B)",
  `Commande : 8${NB}000${NB}€ HT, début le 15/03/2027`,
  "Annulation le 20/02/2027 par le client : 23 jours avant le début",
  `Barème : palier 3 (15 à 29 jours), 50${NB}%`,
  `Indemnité selon le barème : 4${NB}000${NB}€ HT`,
  `Versé à la commande : 2${NB}400${NB}€ (acompte)`,
  `Reste à facturer : 1${NB}600${NB}€ HT`,
  `Perte estimée : 5${NB}700${NB}€ (frais engagés 900${NB}€, marge 60${NB}%)`,
  "Calcul : quotebuilder.co/outils/calculateur-frais-annulation-commande",
].join("\n");
assert.strictEqual(d.recap, expectedRecap);
assert.strictEqual(buildRecap(DEFAULTS), expectedRecap);
assert.strictEqual(d.recap.split("\n").length, 9);

const p1 = run({ dateAnnulation: "2027-01-10" });
assert.strictEqual(p1.joursAvant, 64);
assert.strictEqual(p1.palier, 1);
assert.strictEqual(p1.indemnite, 800);
assert.strictEqual(p1.soldeLabel, "À rembourser au client");
assert.strictEqual(p1.solde, 1600);
assert.strictEqual(p1.etat, "bad");
assert.ok(p1.verdict.includes(`frais déjà engagés (900${NB}€)`));
assert.ok(p1.conseils[2]?.startsWith("À ce stade, ce que vous gardez ne couvre pas vos frais engagés"));
assert.ok(p1.recap.includes(`À rembourser au client : 1${NB}600${NB}€ HT`));

const p2 = run({ dateAnnulation: "2027-02-13" });
assert.strictEqual(p2.joursAvant, 30);
assert.strictEqual(p2.palier, 2);
assert.strictEqual(p2.indemnite, 2400);
assert.strictEqual(p2.soldeLabel, "Reste à facturer");
assert.strictEqual(p2.solde, 0);
assert.strictEqual(p2.etat, "ok");
close(p2.couverture, 42.105263);

const p4 = run({ dateAnnulation: "2027-03-10" });
assert.strictEqual(p4.joursAvant, 5);
assert.strictEqual(p4.palier, 4);
assert.strictEqual(p4.indemnite, 6400);
assert.strictEqual(p4.solde, 4000);
assert.strictEqual(p4.etat, "warn");
assert.ok(p4.verdict.includes("1231-5"));
assert.ok(p4.conseils[2]?.includes("clause de dédit"));

const ar = run({ regime: "arrhes" });
assert.strictEqual(ar.garde, 2400);
assert.strictEqual(ar.soldeLabel, "Arrhes conservées");
assert.strictEqual(ar.solde, 2400);
assert.strictEqual(ar.indemnite, 4000);
assert.strictEqual(ar.etat, "ok");
assert.ok(ar.verdict.includes(`vous gardez 2${NB}400${NB}€`));
assert.ok(ar.verdict.includes(`votre barème (4${NB}000${NB}€) ne s'applique pas`));
assert.ok(ar.conseils[0]?.includes("1590"));
assert.deepStrictEqual(
  ar.lignes.map((l) => l.apres),
  [null, null, null, null],
);
assert.ok(ar.recap.includes(`Versé à la commande : 2${NB}400${NB}€ (arrhes)`));
assert.ok(ar.recap.includes(`Arrhes conservées : 2${NB}400${NB}€ HT`));
close(ar.couverture, 42.105263);
const arFaibles = run({ regime: "arrhes", verse: 500 });
assert.strictEqual(arFaibles.etat, "bad");
assert.strictEqual(arFaibles.garde, 500);

const arP = run({ regime: "arrhes", auteur: "prestataire" });
assert.strictEqual(arP.soldeLabel, "À restituer au client (le double des arrhes)");
assert.strictEqual(arP.solde, 4800);
assert.strictEqual(arP.garde, -2400);
assert.strictEqual(arP.etat, "warn");
assert.ok(arP.verdict.includes(`soit 4${NB}800${NB}€, dont 2${NB}400${NB}€ de plus`));
assert.ok(arP.recap.includes("par vous : 23 jours avant le début"));
assert.strictEqual(arP.conseils.length, 5);

const acP = run({ auteur: "prestataire" });
assert.strictEqual(acP.soldeLabel, "À rembourser au client");
assert.strictEqual(acP.solde, 2400);
assert.strictEqual(acP.garde, 0);
assert.strictEqual(acP.etat, "warn");
assert.ok(acP.verdict.includes("dommages et intérêts"));
const noP = run({ auteur: "prestataire", regime: "aucun" });
assert.strictEqual(noP.solde, 0);
assert.strictEqual(noP.etat, "warn");

const rien = run({ regime: "aucun" });
assert.strictEqual(rien.verse, 0);
assert.strictEqual(rien.soldeLabel, "Reste à facturer");
assert.strictEqual(rien.solde, 4000);
assert.strictEqual(rien.etat, "ok");
assert.ok(rien.verdict.endsWith("Rien n'a été versé : l'indemnité est à facturer, puis à recouvrer."));
assert.ok(rien.conseils[0]?.startsWith("Sans versement"));
assert.ok(rien.recap.includes("Versé à la commande : rien"));

assert.strictEqual(run({ s2: 70 }).etat, "bad");
assert.strictEqual(run({ s3: 30 }).etat, "bad");
assert.strictEqual(run({ p2: 5 }).etat, "bad");
assert.strictEqual(run({ p4: 40 }).etat, "bad");
assert.ok(run({ s2: 70 }).verdict.startsWith("Barème incohérent"));
assert.strictEqual(run({ s3: 0 }).coherent, true);
assert.strictEqual(run({ s3: 0, dateAnnulation: "2027-03-15" }).palier, 3);

assert.strictEqual(run({ montantHT: 0 }).etat, "neutral");
assert.strictEqual(run({ dateDebut: "" }).etat, "neutral");
assert.strictEqual(run({ dateAnnulation: "2027-02-30" }).etat, "neutral");
const apres = run({ dateAnnulation: "2027-03-20" });
assert.strictEqual(apres.joursAvant, -5);
assert.strictEqual(apres.palier, null);
assert.strictEqual(apres.etat, "neutral");
assert.ok(apres.recap.includes("Barème : n/a"));
assert.ok(apres.recap.includes("Reste à facturer : n/a"));
const jourMeme = run({ dateAnnulation: "2027-03-15" });
assert.strictEqual(jourMeme.joursAvant, 0);
assert.strictEqual(jourMeme.palier, 4);

const bis = run({ dateDebut: "2028-03-01", dateAnnulation: "2028-02-01" });
assert.strictEqual(bis.joursAvant, 29);
assert.strictEqual(bis.palier, 3);

const gros = run({ montantHT: 125000, verse: 37500, fraisEngages: 15000 });
assert.strictEqual(gros.indemnite, 62500);
assert.strictEqual(gros.solde, 25000);
assert.strictEqual(gros.perte, 90000);
assert.strictEqual(run({ marge: 0, fraisEngages: 0 }).couverture, null);

assert.strictEqual(run({ verse: 10000 }).verse, 8000);
assert.strictEqual(run({ verse: -5 }).verse, 0);
assert.strictEqual(run({ regime: "x" }).regime, "acompte");
assert.strictEqual(run({ auteur: "x" }).auteur, "client");
assert.strictEqual(run({ montantHT: -1 }).montantHT, 0);
assert.strictEqual(run({ montantHT: "abc" }).montantHT, 0);
assert.strictEqual(run({ p1: 150 }).p[0], 100);
assert.strictEqual(run({ marge: 120 }).marge, 100);
assert.strictEqual(run({ s1: 60.9 }).s1, 60);
assert.strictEqual(run({ s1: 99999 }).s1, 3650);
assert.strictEqual(run({ montantHT: "8000" }).indemnite, 4000);
const vide = computeAnnulation({});
assert.strictEqual(vide.etat, "neutral");
assert.strictEqual(vide.regime, "acompte");
assert.strictEqual(vide.auteur, "client");
assert.strictEqual(vide.verse, 0);
