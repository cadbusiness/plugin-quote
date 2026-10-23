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
  BLOG_TOOL_COUT_GARANTIE,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  DEFAULTS,
  DUREES_TABLE,
  SEUILS_MARGE,
  buildRecap,
  computeGarantie,
  couvertureTexte,
  fmtEur,
  fmtMois,
  fmtNum,
  fmtPct,
  ligneGarantie,
  provisionPour,
  type GarantieInput,
} from "./calculateur-cout-garantie-sav-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "garantie-vices-caches-sav-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_SLUG = "funnel-devis-logiciel-sur-mesure";
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;
const TOOL_PATH = "/outils/calculateur-cout-garantie-sav-devis";
const DAY = "2026-10-23";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_COUT_GARANTIE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Garantie et SAV dans un devis B2B : vices cachés, garantie contractuelle, clauses limitatives et coût à prévoir",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Entre professionnels, la garantie ne se résume pas à « 1 an pièces ». Ce que disent les articles 1603, 1604 et 1641 à 1649 du Code civil, le délai de deux ans et le butoir de vingt ans (chambre mixte, 21 juillet 2023), la présomption de connaissance du vendeur professionnel, ce qu'une clause limitative peut faire ou pas, comment écrire la garantie dans le devis, comment chiffrer le SAV, et ce que QuoteBuilder fait, ou pas.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisDetail);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 15);
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

assert.equal(BLOG_POSTS.length, 65);
assert.equal(BLOG_TOOLS.length, 55);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Calculateur de coût de garantie et de SAV");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["catalogue", "relances"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Garantie pièces et main-d'œuvre : coût par intervention, provision par vente, part du prix et de la marge, prix d'une année de plus et ligne de garantie à copier.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-cinq outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-cinq outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(55), outilsHubIntro());
assert.equal(outilsHubIntro(54), "Cinquante-quatre outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
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
  /Garantie et SAV dans un devis B2B : vices cachés, garantie contractuelle, clauses limitatives et coût : https:\/\/www\.quotebuilder\.co\/blog\/garantie-vices-caches-sav-devis-b2b/,
);
assert.match(
  llms,
  /Funnel de devis logiciel sur mesure : https:\/\/www\.quotebuilder\.co\/secteurs\/funnel-devis-logiciel-sur-mesure/,
);
assert.match(
  llms,
  /Calculateur de coût de garantie et de SAV : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-cout-garantie-sav-devis/,
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
assert.match(outilsHub, /calculateur-cout-garantie-sav-devis/);
assert.match(outilsHub, /Calculateur de coût de garantie et de SAV/);
assert.match(outilsHub, /calculateur de coût de garantie et de SAV/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-cout-garantie-sav-devis"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 320), /eyebrow: "Pilotage"/);
}

const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(
  secteursHub,
  /href: "\/secteurs\/funnel-devis-logiciel-sur-mesure", label: "Logiciel sur mesure"/,
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

function close(actual: number | null, expected: number, eps = 1e-6) {
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
      "# Garantie et SAV dans un devis B2B : vices cachés, garantie contractuelle, clauses limitatives et coût à prévoir",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  for (const needle of [
    "1603",
    "1641",
    "1642",
    "1643",
    "1644",
    "1645",
    "1648",
    "1170",
    "1231-3",
    "L217-1",
    "22-11.621",
    "21-15.809",
    "21-17.789",
    "95-18.602",
    "à adapter",
    "non contractuel",
    "Gagné",
    "Mode d'emploi",
    "/outils/calculateur-cout-garantie-sav-devis",
    "/blog/retenue-garantie-caution-devis-travaux-b2b",
  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assertNoDashes(blogRaw, "garantie md");
  assertNoDashes(blogBody, "garantie body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 3451);
  assert.equal(alphaTokens(blogBody), 3229);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "garantie");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"));
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith(
      "# Funnel de devis logiciel sur mesure : besoin, existant, intégrations et budget, une demande chiffrable avant le premier rendez-vous",
    ),
  );
  for (const needle of [
    "Logiciel sur mesure",
    "Tech & services",
    "Funnel logiciel",
    "Votre logiciel",
    "Besoin et échéance",
    "Type de besoin",
    "Nouveau produit",
    "Refonte",
    "Intégration",
    "Approches adaptées",
    "Décrivez en une phrase",
    "30 points",
    "Plan (PDF ou image)",
    "Demande de photo",
    "62.01Z",
    "L113-9",
    "L131-3",
    "article 28",
    "/secteurs/funnel-devis-agence-web-esn",
  ]) {
    assert.ok(sectorBody.includes(needle), `secteur missing ${needle}`);
  }
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(sectorBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assertNoDashes(sectorRaw, "logiciel md");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 4485);
  assert.equal(alphaTokens(sectorBody), 4127);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "logiciel");

  const sectorPage = readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-logiciel-sur-mesure/page.tsx"),
    "utf8",
  );
  assert.deepEqual(faqFromPage(sectorPage), faqFromMarkdown(sectorBody));
  assert.match(sectorPage, /Essayer le template Logiciel sur mesure/);
  assert.match(sectorPage, /Secteur · Logiciel sur mesure/);
  assert.match(sectorPage, /Tech & services/);
  assert.match(sectorPage, /loadPostBody\("funnel-devis-logiciel-sur-mesure"\)/);
  assert.match(sectorPage, /WebPage/);
  assert.match(sectorPage, /\/blog\/garantie-vices-caches-sav-devis-b2b/);
  assert.match(sectorPage, /\/outils\/calculateur-cout-garantie-sav-devis/);
  assert.match(sectorPage, /\/secteurs\/funnel-devis-agence-web-esn/);
  assert.match(sectorPage, /\/fonctionnalites\/espace-prospect/);
  assert.match(sectorPage, /signup\?plan=free/);
  assertNoDashes(sectorPage, "secteur page");
}

const software = FUNNEL_TEMPLATES.find((template) => template.id === "tech_software");
assert.ok(software, "tech_software missing");
assert.equal(software.family, "tech");
assert.equal(software.label, "Logiciel sur mesure");
assert.equal(software.defaultName, "Funnel logiciel");
assert.equal(software.defaultKind, "form");
assert.equal(getFunnelFamily(software.family).label, "Tech & services");
const logiciel = software.steps[0];
assert.equal(logiciel?.title, "Votre logiciel");
assert.equal(logiciel?.subtitle, "Besoin et échéance");
const questions = logiciel?.questions ?? [];
const projectType = questions.find((question) => question.key === "project_type");
const notes = questions.find((question) => question.key === "notes");
const timeline = questions.find((question) => question.key === "timeline");
assert.equal(projectType?.type, "visual_choice");
assert.equal(projectType?.label, "Type de besoin");
assert.deepEqual(
  choicesOf(projectType!).map((choice) => choice.value),
  ["new", "rebuild", "integrate", "other"],
);
assert.deepEqual(
  choicesOf(projectType!).map((choice) => choice.label),
  ["Nouveau produit", "Refonte", "Intégration", "Autre"],
);
assert.equal(notes?.type, "text");
assert.equal(notes?.label, "Contexte");
assert.equal(timeline?.type, "select");
assert.equal(timeline?.label, "Échéance");
assert.deepEqual(
  choicesOf(timeline!).map((choice) => choice.value),
  ["asap", "month", "quarter", "explore"],
);
for (const step of software.steps) {
  for (const question of step.questions ?? []) {
    const blob = `${question.key} ${question.label}`.toLowerCase();
    assert.doesNotMatch(blob, /volume|utilisateur/);
  }
}
assert.equal(
  software.steps.find((step) => step.screen_type === "suggestions")?.subtitle,
  "Approches adaptées",
);

assert.deepEqual(scoreQuote({ project_type: "rebuild", notes: "x".repeat(200), timeline: "asap" }), {
  score: 30,
  label: "cold",
});
assert.deepEqual(scoreQuote({ project_type: "new" }), { score: 30, label: "cold" });

const pdf = readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8");
assert.match(pdf, /Document indicatif, non contractuel/);
const sheet = readFileSync(join(process.cwd(), "src/lib/catalog/sheet.ts"), "utf8");
assert.match(sheet, /warranty: "Garantie"/);

const addedSources = [
  "src/lib/marketing/calculateur-cout-garantie-sav-devis.ts",
  "src/lib/marketing/seo-am-20261023.test.ts",
  "src/components/marketing/calculateur-cout-garantie-sav-devis-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-cout-garantie-sav-devis/page.tsx",
  "src/app/(marketing)/secteurs/funnel-devis-logiciel-sur-mesure/page.tsx",
  "src/content/blog/garantie-vices-caches-sav-devis-b2b.md",
  "src/content/blog/funnel-devis-logiciel-sur-mesure.md",
];
assertNoDashes((BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"), "garantie faq");
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-cout-garantie-sav-devis/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-cout-garantie-sav-devis/);
assert.match(toolPage, /Calculateur de coût de garantie et de SAV \(devis B2B\)/);
assert.match(toolPage, /1641/);
assert.match(toolPage, /Ce n'est pas un conseil comptable ni juridique/);
assert.match(toolPage, /garantie des vices cachés/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /\/blog\/garantie-vices-caches-sav-devis-b2b/);
assert.match(toolPage, /\/blog\/retenue-garantie-caution-devis-travaux-b2b/);
assert.match(toolPage, /\/outils\/calculateur-seuil-remise-marge/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /\/signup\?plan=free/);
assertNoDashes(toolPage, "outil page");

const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-cout-garantie-sav-devis-calculator.tsx"),
  "utf8",
);
assert.match(toolUi, /hypothèses d'exemple, pas des taux de référence ni des usages d'une profession/);
assert.match(toolUi, /La vente/);
assert.match(toolUi, /La garantie/);
assert.match(toolUi, /Pièces couvertes/);
assert.match(toolUi, /Main-d'œuvre couverte/);
assert.match(toolUi, /Déplacement couvert/);
assert.match(toolUi, /Une intervention/);
assert.match(toolUi, /Le coût de la garantie/);
assert.match(toolUi, /Selon la durée/);
assert.match(toolUi, /Une année de plus/);
assert.match(toolUi, />Durée</);
assert.match(toolUi, />Provision</);
assert.match(toolUi, /Part du prix/);
assert.match(toolUi, /Part de la marge/);
assert.match(toolUi, /bg-orange-50/);
assert.match(toolUi, /bg-amber-50/);
assert.match(toolUi, /bg-emerald-50/);
assert.match(toolUi, /Pour lire vos chiffres/);
assert.match(toolUi, /Ligne de garantie pour le devis/);
assert.match(toolUi, /Récapitulatif/);
assert.match(toolUi, /label="Copier"/);
assert.doesNotMatch(toolUi, /fetch\(/);
assertNoDashes(toolUi, "outil ui");

const toolLogic = readFileSync(join(process.cwd(), "src/lib/marketing/calculateur-cout-garantie-sav-devis.ts"), "utf8");
assert.doesNotMatch(toolLogic, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket/);

assert.deepStrictEqual(DUREES_TABLE, [6, 12, 24, 36, 60]);
assert.deepStrictEqual(SEUILS_MARGE, { ok: 5, warn: 15 });
assert.deepEqual(DEFAULTS, {
  prix: 12000,
  marge: 30,
  duree: 24,
  taux: 8,
  parDossier: 1.5,
  heures: 3,
  tauxHoraire: 55,
  deplacement: 60,
  pieces: 150,
  couvrePieces: true,
  couvreMO: true,
  couvreDeplacement: true,
});

assert.strictEqual(fmtEur(12000), `12${NB}000${NB}€`);
assert.strictEqual(fmtEur(64.29), `64,29${NB}€`);
assert.strictEqual(fmtEur(22.5), `22,50${NB}€`);
assert.strictEqual(fmtNum(0.24), "0,24");
assert.strictEqual(fmtNum(1.5), "1,5");
assert.strictEqual(fmtPct(0.75), `0,75${NB}%`);
assert.strictEqual(fmtMois(24), "24 mois");
assert.strictEqual(
  couvertureTexte({ couvrePieces: true, couvreMO: true, couvreDeplacement: true }),
  "pièces, main-d'œuvre et déplacement",
);
assert.strictEqual(couvertureTexte({ couvrePieces: true, couvreMO: false, couvreDeplacement: false }), "pièces");
assert.strictEqual(couvertureTexte({ couvrePieces: false, couvreMO: false, couvreDeplacement: false }), "");

const run = (o: GarantieInput) => computeGarantie({ ...DEFAULTS, ...o });

const d = run({});
assert.strictEqual(d.coutIntervention, 375);
close(d.attendues, 0.24);
assert.strictEqual(d.provision, 90);
assert.strictEqual(d.margeEur, 3600);
close(d.partPrix, 0.75);
close(d.partMarge, 2.5);
assert.strictEqual(d.coutAnnee, 45);
assert.strictEqual(d.prixAnnee, 64.29);
assert.strictEqual(provisionPour(12, 375, 8, 1.5), 45);
assert.strictEqual(d.etat, "ok");
assert.ok(d.verdict.includes(`90${NB}€`) && d.verdict.includes(`2,5${NB}%`));
assert.strictEqual(d.lignes.length, 5);
assert.deepStrictEqual(
  d.lignes.map((l) => l.provision),
  [22.5, 45, 90, 135, 225],
);
assert.deepStrictEqual(
  d.lignes.filter((l) => l.courant).map((l) => l.mois),
  [24],
);
close(d.lignes[4]?.partMarge ?? null, 6.25);
assert.ok(
  d.ligne.startsWith(
    "Garantie contractuelle : 24 mois à compter de la mise en service, pièces, main-d'œuvre et déplacement.",
  ),
);
assert.ok(d.ligne.includes("articles 1641 et suivants du Code civil"));
assert.strictEqual(d.recap.split("\n").length, 9);
assert.ok(d.recap.endsWith("Calcul : quotebuilder.co/outils/calculateur-cout-garantie-sav-devis"));
assert.ok(d.recap.includes(`Provision par vente : 90${NB}€, soit 0,75${NB}% du prix`));
assert.ok(d.conseils[0]?.includes("24 interventions") && d.conseils[0]?.includes(`9${NB}000${NB}€`));
assert.strictEqual(buildRecap({ ...DEFAULTS }), d.recap);
const recap = [
  "Coût de garantie et de SAV (devis B2B)",
  `Prix de vente : 12${NB}000${NB}€ HT, marge brute 30${NB}% (3${NB}600${NB}€)`,
  "Garantie : 24 mois, pièces, main-d'œuvre et déplacement",
  `Coût couvert par intervention : 375${NB}€`,
  `Interventions attendues par vente : 0,24 (8${NB}% par an, 1,5 par dossier)`,
  `Provision par vente : 90${NB}€, soit 0,75${NB}% du prix`,
  `Part de la marge : 2,5${NB}%`,
  `Année supplémentaire : coût 45${NB}€, prix à 30${NB}% de marge 64,29${NB}€`,
  "Calcul : quotebuilder.co/outils/calculateur-cout-garantie-sav-devis",
].join("\n");
assert.strictEqual(d.recap, recap);

const piecesSeules = run({ couvreMO: false, couvreDeplacement: false });
assert.strictEqual(piecesSeules.coutIntervention, 150);
assert.strictEqual(piecesSeules.provision, 36);
assert.ok(piecesSeules.conseils.some((c) => c.includes("déplacement n'est pas couvert")));

const warn = run({ duree: 60, marge: 20 });
close(warn.partMarge, 9.375);
assert.strictEqual(warn.etat, "warn");
const bad = run({ taux: 20, duree: 36, marge: 15 });
assert.strictEqual(bad.provision, 337.5);
close(bad.partMarge, 18.75);
assert.strictEqual(bad.etat, "bad");

const hors = run({ duree: 18 });
assert.deepStrictEqual(
  hors.lignes.map((l) => l.mois),
  [6, 12, 18, 24, 36, 60],
);
assert.deepStrictEqual(
  hors.lignes.filter((l) => l.courant).map((l) => l.mois),
  [18],
);
assert.strictEqual(hors.provision, 67.5);

const zeroDuree = run({ duree: 0 });
assert.strictEqual(zeroDuree.etat, "neutral");
assert.strictEqual(zeroDuree.provision, 0);
assert.ok(zeroDuree.ligne.startsWith("Garantie contractuelle : néant."));
const rien = run({ couvrePieces: false, couvreMO: false, couvreDeplacement: false });
assert.strictEqual(rien.etat, "neutral");
assert.strictEqual(rien.coutIntervention, 0);
const taux0 = run({ taux: 0 });
assert.strictEqual(taux0.etat, "neutral");
const sansPrix = run({ prix: 0 });
assert.strictEqual(sansPrix.valide, false);
assert.strictEqual(sansPrix.partPrix, null);
assert.strictEqual(sansPrix.etat, "neutral");
assert.strictEqual(sansPrix.lignes.length, 0);
const marge0 = run({ marge: 0 });
assert.strictEqual(marge0.partMarge, null);
assert.strictEqual(marge0.etat, "warn");
assert.strictEqual(marge0.prixAnnee, 45);

const born = computeGarantie({
  prix: "-5",
  marge: "200",
  duree: "500",
  taux: "abc",
  parDossier: "",
  heures: "-1",
  tauxHoraire: "x",
  deplacement: null,
  pieces: undefined,
});
assert.strictEqual(born.prix, 0);
assert.strictEqual(born.marge, 95);
assert.strictEqual(born.duree, 120);
assert.strictEqual(born.taux, 0);
assert.strictEqual(born.parDossier, 0);
assert.strictEqual(born.heures, 0);
assert.strictEqual(computeGarantie({ ...DEFAULTS, duree: "24.4" }).duree, 24);
assert.strictEqual(
  ligneGarantie(12, { couvrePieces: true, couvreMO: true, couvreDeplacement: false }).includes(
    "12 mois à compter de la mise en service, pièces et main-d'œuvre.",
  ),
  true,
);
assert.strictEqual(computeGarantie({ ...DEFAULTS, couvrePieces: "false" }).coutIntervention, 225);

assert.ok(d.conseils.some((c) => c.startsWith("QuoteBuilder ne gère pas le SAV")));
assert.doesNotMatch(toolLogic, /QuoteBuilder (calcule|suit) les/);
