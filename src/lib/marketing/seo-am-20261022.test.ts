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
  BLOG_TOOL_PENALITES_RETARD_LIVRAISON,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  ASSIETTES,
  DEFAULTS,
  MODES,
  PALIERS_TABLE,
  buildRecap,
  computeRetard,
  fmtDate,
  fmtEur,
  fmtJours,
  fmtNum,
  fmtPct,
  libelleClause,
  parseDate,
  penaliteDue,
  penaliteParJour,
  type RetardInput,
} from "./calculateur-penalites-retard-livraison";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "delai-livraison-penalites-retard-execution-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_SLUG = "funnel-devis-chapiteau-agence-evenementielle";
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;
const TOOL_PATH = "/outils/calculateur-penalites-retard-livraison";
const LOCATION_PATH = "/secteurs/funnel-devis-location-evenementiel";
const DAY = "2026-10-22";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_PENALITES_RETARD_LIVRAISON, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Délai de livraison et pénalités de retard dans un devis B2B : date, franchise, taux et plafond",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Votre devis promet un délai et la livraison arrive en retard : ce que dit le Code civil (délivrance au temps convenu, articles 1610 et 1611, sanctions de l'article 1217, mise en demeure), pourquoi une pénalité de retard est une clause pénale (article 1231-5), les repères des CCAG publics (1/3000, 1/1000, plafond de 10 %, seuil de 1 000 €), comment écrire une clause qui tient, un exemple chiffré et ce que QuoteBuilder permet, ou pas.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisDetail);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 25);
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
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title,
  "Calculateur de pénalités de retard de livraison",
);
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["catalogue", "relances"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Livraison en retard : jours pénalisés après franchise, pénalité par jour, plafond, montant dû et part de la commande, avec un récapitulatif à copier.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-six outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-six outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(56), outilsHubIntro());
assert.equal(outilsHubIntro(52), "Cinquante-deux outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
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
for (const path of [...DAY_PATHS, LOCATION_PATH]) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "${DAY}"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, DAY);
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(
  llms,
  /Délai de livraison et pénalités de retard dans un devis B2B : date, franchise, taux et plafond : https:\/\/www\.quotebuilder\.co\/blog\/delai-livraison-penalites-retard-execution-devis-b2b/,
);
assert.match(
  llms,
  /Funnel de devis chapiteau et agence événementielle : https:\/\/www\.quotebuilder\.co\/secteurs\/funnel-devis-chapiteau-agence-evenementielle/,
);
assert.match(
  llms,
  /Calculateur de pénalités de retard de livraison : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-penalites-retard-livraison/,
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
assert.match(outilsHub, /calculateur-penalites-retard-livraison/);
assert.match(outilsHub, /Calculateur de pénalités de retard de livraison/);
assert.match(outilsHub, /calculateur de pénalités de retard de livraison/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-penalites-retard-livraison"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 320), /eyebrow: "Pilotage"/);
}

const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(
  secteursHub,
  /href: "\/secteurs\/funnel-devis-chapiteau-agence-evenementielle", label: "Chapiteaux et agence événementielle"/,
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
      "# Délai de livraison et pénalités de retard dans un devis B2B : date, franchise, taux et plafond",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  for (const needle of [
    "1610",
    "1611",
    "1217",
    "1218",
    "1231-1",
    "1231-5",
    "1344",
    "1119",
    "1/3000",
    "hypothèses d'exemple",
    "non contractuel",
    "Gagné",
    "/outils/calculateur-penalites-retard-livraison",
    "/blog/conditions-paiement-penalites-retard-devis-b2b",
  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assertNoDashes(blogRaw, "delai md");
  assertNoDashes(blogBody, "delai body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 6222);
  assert.equal(alphaTokens(blogBody), 5737);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "delai");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"));
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith(
      "# Funnel de devis chapiteau et agence événementielle : structure, jauge, terrain et dates, une demande complète avant le devis",
    ),
  );
  for (const needle of [
    "Chapiteaux & agence",
    "Funnel événementiel",
    "Votre événement",
    "Jauge, lieu et durée",
    "Type d\u2019événement",
    "Chapiteau / structure",
    "Structures et options de votre catalogue",
    "Date ou lieu",
    "1 mois et +",
    "30 points",
    "Plan (PDF ou image)",
    "Demande de photo",
    "82.30Z",
    "F32351",
    "CTS",
    "1709",
  ]) {
    assert.ok(sectorBody.includes(needle), `secteur missing ${needle}`);
  }
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(sectorBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assertNoDashes(sectorRaw, "chapiteau md");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 4538);
  assert.equal(alphaTokens(sectorBody), 4098);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "chapiteau");

  const sectorPage = readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-chapiteau-agence-evenementielle/page.tsx"),
    "utf8",
  );
  assert.deepEqual(faqFromPage(sectorPage), faqFromMarkdown(sectorBody));
  assert.match(sectorPage, /Essayer le template Chapiteaux & agence/);
  assert.match(sectorPage, /Secteur · Chapiteaux et événementiel/);
  assert.match(sectorPage, /Location & événementiel/);
  assert.match(sectorPage, /loadPostBody\("funnel-devis-chapiteau-agence-evenementielle"\)/);
  assert.match(sectorPage, /WebPage/);
  assert.match(sectorPage, /\/blog\/delai-livraison-penalites-retard-execution-devis-b2b/);
  assert.match(sectorPage, /\/outils\/calculateur-penalites-retard-livraison/);
  assert.match(sectorPage, /\/blog\/regles-suggestion-produits-funnel-devis-b2b/);
  assert.match(sectorPage, /\/fonctionnalites\/espace-prospect/);
  assert.match(sectorPage, /signup\?plan=free/);
  assertNoDashes(sectorPage, "secteur page");
}

{
  const locationRaw = readFileSync(join(blogDir, "funnel-devis-location-evenementiel.md"), "utf8");
  const locationBody = stripFrontmatter(locationRaw);
  assert.doesNotMatch(locationBody, /conditionnelles/);
  assert.doesNotMatch(locationBody, /selon urgence date/);
  assert.doesNotMatch(locationBody, /Branchez la sync/);
  assert.doesNotMatch(locationBody, /La sync fine vient après/);
  assert.match(locationBody, /formule fixe, qui ne lit pas la date/);
  assert.match(locationBody, /ne branche pas selon les réponses/);
  assert.match(locationBody, /ne se synchronise pas avec un logiciel de stock/);
  const locationPage = readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-location-evenementiel/page.tsx"),
    "utf8",
  );
  assert.doesNotMatch(locationPage, /Branchez la sync/);
  const locationFaqMd = faqFromMarkdown(locationBody).find((item) => item.q === "Et la dispo temps réel ?");
  const locationFaqPage = faqFromPage(locationPage).find((item) => item.q === "Et la dispo temps réel ?");
  assert.equal(locationFaqPage?.a, locationFaqMd?.a);
  assert.match(
    locationFaqPage?.a ?? "",
    /QuoteBuilder ne connaît pas votre disponibilité : il n'a ni planning, ni stock, ni connexion à un logiciel de location/,
  );
}

const venue = FUNNEL_TEMPLATES.find((template) => template.id === "events_venue");
assert.ok(venue, "events_venue missing");
assert.equal(venue.family, "events");
assert.equal(venue.label, "Chapiteaux & agence");
assert.equal(venue.defaultName, "Funnel événementiel");
assert.equal(venue.defaultKind, "form");
assert.equal(getFunnelFamily(venue.family).label, "Location & événementiel");
const evenement = venue.steps[0];
assert.equal(evenement?.title, "Votre événement");
assert.equal(evenement?.subtitle, "Jauge, lieu et durée");
const questions = evenement?.questions ?? [];
const category = questions.find((question) => question.key === "category");
const duration = questions.find((question) => question.key === "duration");
const when = questions.find((question) => question.key === "when");
assert.equal(category?.type, "visual_choice");
assert.equal(category?.label, "Type d\u2019événement");
assert.deepEqual(
  choicesOf(category!).map((choice) => choice.value),
  ["tent", "corporate", "private", "other"],
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
for (const step of venue.steps) {
  for (const question of step.questions ?? []) {
    const blob = `${question.key} ${question.label}`.toLowerCase();
    assert.doesNotMatch(blob, /jauge|personne/);
  }
}
assert.equal(
  venue.steps.find((step) => step.screen_type === "suggestions")?.subtitle,
  "Structures et options de votre catalogue",
);

assert.deepEqual(scoreQuote({ category: "tent", duration: "week", when: "x".repeat(120) }), {
  score: 30,
  label: "cold",
});
assert.deepEqual(scoreQuote({ category: "corporate" }), { score: 30, label: "cold" });

const addedSources = [
  "src/lib/marketing/calculateur-penalites-retard-livraison.ts",
  "src/lib/marketing/seo-am-20261022.test.ts",
  "src/components/marketing/calculateur-penalites-retard-livraison-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-penalites-retard-livraison/page.tsx",
  "src/app/(marketing)/secteurs/funnel-devis-chapiteau-agence-evenementielle/page.tsx",
  "src/content/blog/delai-livraison-penalites-retard-execution-devis-b2b.md",
  "src/content/blog/funnel-devis-chapiteau-agence-evenementielle.md",
];
assertNoDashes((BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"), "delai faq");
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-penalites-retard-livraison/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-penalites-retard-livraison/);
assert.match(toolPage, /Calculateur de pénalités de retard de livraison \(B2B\)/);
assert.match(toolPage, /1231-5/);
assert.match(toolPage, /ne remplace pas un conseil juridique/);
assert.match(toolPage, /clause pénale/);
assert.match(toolPage, /CCAG publics ne s'appliquent qu'aux marchés qui s'y réfèrent/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /\/blog\/delai-livraison-penalites-retard-execution-devis-b2b/);
assert.match(toolPage, /\/blog\/conditions-paiement-penalites-retard-devis-b2b/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /\/signup\?plan=free/);
assertNoDashes(toolPage, "outil page");

const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-penalites-retard-livraison-calculator.tsx"),
  "utf8",
);
assert.match(toolUi, /hypothèses d'exemple, pas des taux de référence ni des usages d'une profession/);
assert.match(toolUi, /La commande/);
assert.match(toolUi, /Les dates/);
assert.match(toolUi, /Votre clause de pénalités/);
assert.match(toolUi, /Le retard/);
assert.match(toolUi, /La pénalité due/);
assert.match(toolUi, /La pénalité selon la durée du retard/);
assert.match(toolUi, /Jours pénalisés/);
assert.match(toolUi, /Pénalité due/);
assert.match(toolUi, /Part de la commande/);
assert.match(toolUi, /\(plafond\)/);
assert.match(toolUi, /bg-orange-50/);
assert.match(toolUi, /bg-amber-50/);
assert.match(toolUi, /Pour lire vos chiffres/);
assert.match(toolUi, /Récapitulatif/);
assert.match(toolUi, /label="Copier"/);
assert.match(toolUi, /bg-emerald-50/);
assert.doesNotMatch(toolUi, /fetch\(/);
assertNoDashes(toolUi, "outil ui");

const toolLogic = readFileSync(
  join(process.cwd(), "src/lib/marketing/calculateur-penalites-retard-livraison.ts"),
  "utf8",
);
assert.doesNotMatch(toolLogic, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket/);

assert.deepStrictEqual(MODES, ["taux", "fraction", "forfait"]);
assert.deepStrictEqual(ASSIETTES, ["commande", "partie"]);
assert.deepStrictEqual(PALIERS_TABLE, [7, 14, 30, 60, 90]);
assert.deepEqual(DEFAULTS, {
  montantHT: 48000,
  assiette: "commande",
  montantRetard: 18000,
  datePrevue: "2027-03-01",
  dateReelle: "2027-03-29",
  mode: "taux",
  franchise: 5,
  taux: 1,
  fraction: 3000,
  forfait: 150,
  plafond: 5,
  seuil: 0,
  prejudice: 2000,
});

assert.strictEqual(fmtEur(48000), `48${NB}000${NB}€`);
assert.strictEqual(fmtEur(1104), `1${NB}104${NB}€`);
assert.strictEqual(fmtEur(1250000), `1${NB}250${NB}000${NB}€`);
assert.strictEqual(fmtEur(1234.5), `1${NB}234,50${NB}€`);
assert.strictEqual(fmtEur(0), `0${NB}€`);
assert.strictEqual(fmtEur(-0.001), `0${NB}€`);
assert.strictEqual(fmtEur(null), "n/a");
assert.strictEqual(fmtNum(4.033333), "4,03");
assert.strictEqual(fmtNum(2.3), "2,3");
assert.strictEqual(fmtNum(null), "n/a");
assert.strictEqual(fmtPct(55.2), `55,2${NB}%`);
assert.strictEqual(fmtPct(null), "n/a");
assert.strictEqual(fmtJours(28), "28 jours");
assert.strictEqual(fmtJours(1), "1 jour");
assert.strictEqual(fmtJours(0), "0 jour");
assert.strictEqual(fmtJours(null), "n/a");
assert.strictEqual(fmtDate(parseDate("2027-03-01")), "01/03/2027");
assert.strictEqual(fmtDate(null), "n/a");
assert.strictEqual(parseDate("2027-02-29"), null);
assert.strictEqual(parseDate("2028-02-29")! - parseDate("2028-02-28")!, 1);
assert.strictEqual(parseDate(""), null);
assert.strictEqual(parseDate("01/03/2027"), null);

assert.strictEqual(penaliteParJour("taux", 48000, 1, 3000, 150), 48);
assert.strictEqual(penaliteParJour("fraction", 48000, 1, 3000, 150), 16);
assert.strictEqual(penaliteParJour("forfait", 48000, 1, 3000, 150), 150);
assert.deepStrictEqual(penaliteDue(28, 5, 48, 2400, 0), {
  joursPenalises: 23,
  brut: 1104,
  plafonne: false,
  exonere: false,
  due: 1104,
});
assert.deepStrictEqual(penaliteDue(3, 5, 48, 2400, 0), {
  joursPenalises: 0,
  brut: 0,
  plafonne: false,
  exonere: false,
  due: 0,
});
assert.deepStrictEqual(penaliteDue(70, 0, 48, 2400, 0), {
  joursPenalises: 70,
  brut: 3360,
  plafonne: true,
  exonere: false,
  due: 2400,
});
assert.deepStrictEqual(penaliteDue(28, 0, 16, 4800, 1000), {
  joursPenalises: 28,
  brut: 448,
  plafonne: false,
  exonere: true,
  due: 0,
});
assert.strictEqual(libelleClause("taux", 1, 3000, 150, 48000), `1${NB}‰ par jour de 48${NB}000${NB}€`);
assert.strictEqual(libelleClause("fraction", 1, 3000, 150, 48000), `1/3${NB}000 par jour de 48${NB}000${NB}€`);
assert.strictEqual(libelleClause("forfait", 1, 3000, 150, 48000), `150${NB}€ HT par jour`);

const run = (o: RetardInput) => computeRetard({ ...DEFAULTS, ...o });

const d = run({});
assert.strictEqual(d.joursRetard, 28);
assert.strictEqual(d.joursPenalises, 23);
assert.strictEqual(d.parJour, 48);
assert.strictEqual(d.brut, 1104);
assert.strictEqual(d.plafondMontant, 2400);
assert.strictEqual(d.due, 1104);
close(d.pctCommande, 2.3);
assert.strictEqual(d.net, 46896);
assert.strictEqual(d.joursPlafond, 55);
close(d.ratio, 55.2);
assert.strictEqual(d.plafonne, false);
assert.strictEqual(d.exonere, false);
assert.strictEqual(d.etat, "ok");
assert.strictEqual(d.verdict, `Pénalité de 1${NB}104${NB}€ HT pour 23 jours pénalisés, soit 2,3${NB}% de la commande.`);
assert.strictEqual(d.conseils.length, 7);
assert.ok(d.conseils[2]?.includes("55e jour"));
assert.deepStrictEqual(
  d.lignes.map((l) => [l.jours, l.joursPenalises, l.due, l.plafonne, l.courant]),
  [
    [7, 2, 96, false, false],
    [14, 9, 432, false, false],
    [28, 23, 1104, false, true],
    [30, 25, 1200, false, false],
    [60, 55, 2400, true, false],
    [90, 85, 2400, true, false],
  ],
);
close(d.lignes[1]?.pct ?? null, 0.9);
close(d.lignes[4]?.pct ?? null, 5);
const recap = [
  "Pénalités de retard de livraison (B2B)",
  `Commande : 48${NB}000${NB}€ HT, livraison convenue le 01/03/2027`,
  "Livraison réelle : 29/03/2027, soit 28 jours de retard",
  "Franchise : 5 jours, jours pénalisés : 23",
  `Pénalité : 1${NB}‰ par jour de 48${NB}000${NB}€ (48${NB}€ par jour)`,
  `Plafond : 5${NB}% de la commande, soit 2${NB}400${NB}€`,
  `Pénalité due : 1${NB}104${NB}€ HT (2,3${NB}% de la commande)`,
  `Préjudice estimé : 2${NB}000${NB}€`,
  "Calcul : quotebuilder.co/outils/calculateur-penalites-retard-livraison",
].join("\n");
assert.strictEqual(d.recap, recap);
assert.strictEqual(buildRecap(DEFAULTS), recap);
assert.strictEqual(d.recap.split("\n").length, 9);

const long = run({ dateReelle: "2027-05-15" });
assert.strictEqual(long.joursRetard, 75);
assert.strictEqual(long.joursPenalises, 70);
assert.strictEqual(long.brut, 3360);
assert.strictEqual(long.due, 2400);
assert.strictEqual(long.plafonne, true);
assert.strictEqual(long.etat, "warn");
assert.ok(long.verdict.startsWith("Plafond atteint"));
assert.ok(long.verdict.includes("55e jour"));
assert.ok(long.conseils.some((c) => c.includes("article 1226")));
assert.strictEqual(long.lignes.length, 6);
assert.ok(long.lignes.find((l) => l.jours === 75)?.courant);

const ccag = run({ mode: "fraction", franchise: 0, seuil: 1000, plafond: 10 });
assert.strictEqual(ccag.parJour, 16);
assert.strictEqual(ccag.brut, 448);
assert.strictEqual(ccag.exonere, true);
assert.strictEqual(ccag.due, 0);
assert.strictEqual(ccag.etat, "ok");
assert.ok(ccag.verdict.includes("sous le seuil d'exonération"));
assert.strictEqual(ccag.joursPlafond, 300);
const ccag2 = run({ mode: "fraction", franchise: 0, seuil: 1000, plafond: 10, dateReelle: "2027-06-30" });
assert.strictEqual(ccag2.joursRetard, 121);
assert.strictEqual(ccag2.due, 1936);
close(ccag2.pctCommande, 4.033333);
assert.strictEqual(ccag2.etat, "ok");

const partie = run({ assiette: "partie" });
assert.strictEqual(partie.assietteMontant, 18000);
assert.strictEqual(partie.parJour, 18);
assert.strictEqual(partie.due, 414);
close(partie.pctCommande, 0.8625);
assert.strictEqual(partie.joursPlafond, 139);
assert.strictEqual(partie.etat, "warn");
assert.ok(partie.verdict.includes("moins d'un quart"));
assert.strictEqual(partie.conseils.length, 6);
assert.strictEqual(run({ assiette: "partie", montantRetard: 90000 }).assietteMontant, 48000);

const forfait = run({ mode: "forfait" });
assert.strictEqual(forfait.parJour, 150);
assert.strictEqual(forfait.brut, 3450);
assert.strictEqual(forfait.due, 2400);
assert.strictEqual(forfait.joursPlafond, 21);
assert.strictEqual(forfait.etat, "warn");
assert.strictEqual(run({ mode: "forfait", assiette: "partie" }).parJour, 150);

const excess = run({ prejudice: 400 });
assert.strictEqual(excess.etat, "warn");
close(excess.ratio, 276);
assert.ok(excess.verdict.includes("plus du double"));
assert.ok(excess.verdict.includes("1231-5"));
const derisoire = run({ prejudice: 6000 });
assert.strictEqual(derisoire.etat, "warn");
close(derisoire.ratio, 18.4);
const sansPrejudice = run({ prejudice: 0 });
assert.strictEqual(sansPrejudice.ratio, null);
assert.strictEqual(sansPrejudice.etat, "ok");
assert.strictEqual(sansPrejudice.conseils.length, 6);
assert.ok(sansPrejudice.recap.includes("Préjudice estimé : non renseigné"));

const franchise = run({ dateReelle: "2027-03-04" });
assert.strictEqual(franchise.joursRetard, 3);
assert.strictEqual(franchise.due, 0);
assert.strictEqual(franchise.etat, "ok");
assert.ok(franchise.verdict.includes("dans la franchise"));
assert.strictEqual(franchise.conseils.length, 5);
const aTemps = run({ dateReelle: "2027-03-01" });
assert.strictEqual(aTemps.joursRetard, 0);
assert.strictEqual(aTemps.due, 0);
assert.strictEqual(aTemps.verdict, "Livraison à la date convenue : aucune pénalité.");
const avance = run({ dateReelle: "2027-02-20" });
assert.strictEqual(avance.ecart, -9);
assert.strictEqual(avance.joursRetard, 0);
assert.strictEqual(avance.due, 0);
assert.ok(avance.verdict.startsWith("Livraison en avance de 9 jours"));
assert.strictEqual(avance.lignes.length, 5);
const taux0 = run({ taux: 0 });
assert.strictEqual(taux0.etat, "neutral");
assert.strictEqual(taux0.joursPlafond, null);

for (const o of [{ datePrevue: "2027-02-30" }, { dateReelle: "" }, { montantHT: 0 }, { montantHT: "abc" }]) {
  const r = run(o);
  assert.strictEqual(r.etat, "neutral", JSON.stringify(o));
  assert.strictEqual(r.due, null);
  assert.strictEqual(r.lignes.length, 0);
  assert.ok(r.recap.includes("n/a"));
}

const noplaf = run({ plafond: 0, dateReelle: "2027-06-30" });
assert.strictEqual(noplaf.plafondMontant, null);
assert.strictEqual(noplaf.due, 5568);
close(noplaf.pctCommande, 11.6);
assert.strictEqual(noplaf.joursPlafond, null);
assert.ok(noplaf.recap.includes("Plafond : aucun"));

const bis = run({ datePrevue: "2028-02-01", dateReelle: "2028-03-01", franchise: 0 });
assert.strictEqual(bis.joursRetard, 29);
assert.strictEqual(bis.due, 1392);
const big = run({ montantHT: 1250000, dateReelle: "2027-04-15" });
assert.strictEqual(big.joursRetard, 45);
assert.strictEqual(big.parJour, 1250);
assert.strictEqual(big.due, 50000);
assert.strictEqual(big.plafondMontant, 62500);
assert.strictEqual(big.net, 1200000);

assert.strictEqual(run({ franchise: 999 }).franchise, 365);
assert.strictEqual(run({ franchise: -3 }).franchise, 0);
assert.strictEqual(run({ taux: 500 }).taux, 100);
assert.strictEqual(run({ fraction: 0 }).fraction, 1);
assert.strictEqual(run({ plafond: 150 }).plafond, 100);
assert.strictEqual(run({ mode: "autre" }).mode, "taux");
assert.strictEqual(run({ assiette: "autre" }).assiette, "commande");
assert.strictEqual(run({ seuil: -5 }).seuil, 0);

assert.ok(d.conseils.some((c) => c.startsWith("QuoteBuilder ne calcule pas de pénalités")));
assert.doesNotMatch(toolLogic, /QuoteBuilder (calcule|suit) les/);
