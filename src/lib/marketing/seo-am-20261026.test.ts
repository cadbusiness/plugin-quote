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
  BLOG_TOOL_PREAVIS,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  DEFAULTS,
  MODES,
  UNITES,
  addDays,
  addMonths,
  buildRecap,
  computePreavis,
  dateLimite,
  ecart,
  finApresPreavis,
  fmtDate,
  fmtDuree,
  fmtEur,
  fmtHt,
  fmtPreavis,
  parseDate,
  type PreavisInput,
} from "./calculateur-preavis-reconduction-tacite";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "reconduction-tacite-preavis-resiliation-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_SLUG = "funnel-devis-nettoyage-proprete-entreprise";
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;
const TOOL_PATH = "/outils/calculateur-preavis-reconduction-tacite";
const DAY = "2026-10-26";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_PREAVIS, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Reconduction tacite et préavis dans un devis B2B : durée, renouvellement, résiliation et rupture brutale",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Contrat d'entretien, de maintenance ou de nettoyage signé pour un an puis « reconduit tacitement » : ce qu'il faut écrire dans le devis pour que la durée, la reconduction et le préavis soient clairs. Ce que disent les articles 1210 à 1215 du Code civil, la jurisprudence sur le contenu du contrat reconduit, la rupture brutale de l'article L442-1 II du Code de commerce, pourquoi la loi Chatel ne protège pas un client professionnel, un exemple chiffré de préavis manqué et ce que QuoteBuilder fait, ou pas.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisDetail);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 19);
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

assert.equal(BLOG_POSTS.length, 68);
assert.equal(BLOG_TOOLS.length, 58);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Calculateur de préavis et de reconduction tacite");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["catalogue", "relances"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Date limite pour dénoncer, fin effective du contrat et montant encore engagé si le courrier arrive trop tard.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-huit outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-huit outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(58), outilsHubIntro());
assert.equal(outilsHubIntro(56), "Cinquante-six outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
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
  /Reconduction tacite et préavis dans un devis B2B : durée, renouvellement, résiliation et rupture brutale : https:\/\/www\.quotebuilder\.co\/blog\/reconduction-tacite-preavis-resiliation-devis-b2b/,
);
assert.match(
  llms,
  /Funnel de devis nettoyage et propreté en entreprise : https:\/\/www\.quotebuilder\.co\/secteurs\/funnel-devis-nettoyage-proprete-entreprise/,
);
assert.match(
  llms,
  /Calculateur de préavis et de reconduction tacite : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-preavis-reconduction-tacite/,
);
const llmsLines = llms.split("\n");
const blogLine = llmsLines.findIndex((line) => line.includes(BLOG_PATH));
const sectorLine = llmsLines.findIndex((line) => line.includes(SECTOR_PATH));
const toolLine = llmsLines.findIndex((line) => line.includes(TOOL_PATH));
const tarifsLine = llmsLines.findIndex((line) => line.includes("https://www.quotebuilder.co/tarifs"));
const logicielLine = llmsLines.findIndex((line) => line.includes("/secteurs/funnel-devis-logiciel-sur-mesure"));
const francoLine = llmsLines.findIndex((line) => line.includes("/blog/frais-port-franco-incoterms-devis-b2b"));
assert.ok(sectorLine > logicielLine && sectorLine < tarifsLine, "secteur llms avec les secteurs");
assert.ok(blogLine > tarifsLine, "article llms avec les articles");
assert.ok(blogLine < francoLine, "article le plus récent en tête des articles");
assert.ok(toolLine > blogLine, "outil llms avec les outils");

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /calculateur-preavis-reconduction-tacite/);
assert.match(outilsHub, /Calculateur de préavis et de reconduction tacite/);
assert.match(outilsHub, /calculateur de préavis et de reconduction tacite/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-preavis-reconduction-tacite"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 320), /eyebrow: "Pilotage"/);
}

const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(
  secteursHub,
  /href: "\/secteurs\/funnel-devis-nettoyage-proprete-entreprise", label: "Nettoyage et propreté"/,
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
      "# Reconduction tacite et préavis dans un devis B2B : durée, renouvellement, résiliation et rupture brutale",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  for (const needle of [
    "1210",
    "1211",
    "1212",
    "1213",
    "1214",
    "1215",
    "1231-5",
    "L442-1",
    "L215-1",
    "L215-3",
    "02-21.366",
    "11-18.779",
    "16-26.568",
    "2026-796",
    "dix-huit mois",
    "26 215,89",
    "7 219,73",
    "443",
    "à adapter",
    "non contractuel",
    "Gagné",
    "/outils/calculateur-preavis-reconduction-tacite",
    "/blog/revision-prix-indexation-devis-b2b",
  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assertNoDashes(blogRaw, "reconduction md");
  assertNoDashes(blogBody, "reconduction body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 4171);
  assert.equal(alphaTokens(blogBody), 4005);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "reconduction");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"));
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(sectorBody.startsWith("# Funnel de devis nettoyage et propreté en entreprise"));
  for (const needle of [
    "Questionnaire générique",
    "Sur mesure",
    "Nouveau funnel",
    "Quel est votre projet ?",
    "Décrivez en une phrase",
    "Produits de votre catalogue",
    "pas de template nettoyage",
    "30 points",
    "Plan (PDF ou image)",
    "Demande de photo",
    "81.21Z",
    "IDCC 3043",
    "7.2",
    "19-20.066",
    "5 000 € HT",
    "R4512-7",
    "F31422",
    "/blog/reconduction-tacite-preavis-resiliation-devis-b2b",
  ]) {
    assert.ok(sectorBody.includes(needle), `secteur missing ${needle}`);
  }
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(sectorBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assertNoDashes(sectorRaw, "nettoyage md");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 4666);
  assert.equal(alphaTokens(sectorBody), 4295);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "nettoyage");

  const sectorPage = readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-nettoyage-proprete-entreprise/page.tsx"),
    "utf8",
  );
  assert.deepEqual(faqFromPage(sectorPage), faqFromMarkdown(sectorBody));
  assert.match(sectorPage, /Essayer gratuitement/);
  assert.match(sectorPage, /Il n’y a pas de template nettoyage\./);
  assert.match(sectorPage, /Secteur · Nettoyage et propreté/);
  assert.match(sectorPage, /loadPostBody\("funnel-devis-nettoyage-proprete-entreprise"\)/);
  assert.match(sectorPage, /WebPage/);
  assert.match(sectorPage, /\/blog\/reconduction-tacite-preavis-resiliation-devis-b2b/);
  assert.match(sectorPage, /\/outils\/calculateur-preavis-reconduction-tacite/);
  assert.match(sectorPage, /\/blog\/visite-technique-avant-devis-b2b/);
  assert.match(sectorPage, /\/fonctionnalites\/espace-prospect/);
  assertNoDashes(sectorPage, "secteur page");
}

const general = FUNNEL_TEMPLATES.find((template) => template.id === "general");
assert.ok(general, "general missing");
assert.equal(general.family, "custom");
assert.equal(general.label, "Questionnaire générique");
assert.equal(general.defaultName, "Nouveau funnel");
assert.equal(general.defaultKind, "form");
assert.equal(getFunnelFamily(general.family).label, "Sur mesure");
const projet = general.steps[0];
assert.equal(projet?.title, "Votre projet");
assert.equal(projet?.subtitle, "Quelques questions pour cadrer le besoin");
const questions = projet?.questions ?? [];
const projectType = questions.find((question) => question.key === "project_type");
const timeline = questions.find((question) => question.key === "timeline");
assert.equal(projectType?.type, "text");
assert.equal(projectType?.required, true);
assert.equal(projectType?.label, "Quel est votre projet ?");
assert.equal(
  projectType?.options && typeof projectType.options === "object" && !Array.isArray(projectType.options)
    ? (projectType.options as { placeholder?: string }).placeholder
    : undefined,
  "Décrivez en une phrase",
);
assert.equal(timeline?.type, "select");
assert.equal(timeline?.required, false);
assert.deepEqual(
  choicesOf(timeline!).map((choice) => choice.value),
  ["asap", "month", "quarter", "explore"],
);
assert.equal(
  general.steps.find((step) => step.screen_type === "suggestions")?.subtitle,
  "Produits de votre catalogue",
);
for (const template of FUNNEL_TEMPLATES) {
  const blob = `${template.id} ${template.label}`.toLowerCase();
  assert.doesNotMatch(blob, /nettoyage|propret/);
}

assert.deepEqual(scoreQuote({ project_type: "Nettoyage de bureaux 900 m2", timeline: "quarter" }), {
  score: 30,
  label: "cold",
});

const pdf = readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8");
assert.match(pdf, /Document indicatif, non contractuel/);

const addedSources = [
  "src/lib/marketing/calculateur-preavis-reconduction-tacite.ts",
  "src/lib/marketing/seo-am-20261026.test.ts",
  "src/components/marketing/calculateur-preavis-reconduction-tacite-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-preavis-reconduction-tacite/page.tsx",
  "src/app/(marketing)/secteurs/funnel-devis-nettoyage-proprete-entreprise/page.tsx",
  "src/content/blog/reconduction-tacite-preavis-resiliation-devis-b2b.md",
  "src/content/blog/funnel-devis-nettoyage-proprete-entreprise.md",
];
assertNoDashes((BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"), "reconduction faq");
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-preavis-reconduction-tacite/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-preavis-reconduction-tacite/);
assert.match(toolPage, /Calculateur de préavis et de reconduction tacite \(contrat B2B\)/);
assert.match(toolPage, /ne remplace pas un conseil juridique/);
assert.match(toolPage, /L442-1 II/);
assert.match(toolPage, /loi Chatel/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /\/blog\/reconduction-tacite-preavis-resiliation-devis-b2b/);
assert.match(toolPage, /\/blog\/revision-prix-indexation-devis-b2b/);
assert.match(toolPage, /\/outils\/calculateur-revision-prix-devis/);
assert.match(toolPage, /\/secteurs\/funnel-devis-nettoyage-proprete-entreprise/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /\/signup\?plan=free/);
assert.doesNotMatch(toolPage, /\/blog\/espace-prospect-devis-en-ligne/);
assertNoDashes(toolPage, "outil page");

const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-preavis-reconduction-tacite-calculator.tsx"),
  "utf8",
);
assert.match(toolUi, /hypothèses d'exemple, pas des usages d'une profession ni des durées imposées par la loi/);
assert.match(toolUi, /Le contrat/);
assert.match(toolUi, /Le préavis/);
assert.match(toolUi, /Votre situation/);
assert.match(toolUi, /Les dates/);
assert.match(toolUi, /Le calendrier des périodes/);
assert.match(toolUi, /Pour lire vos chiffres/);
assert.match(toolUi, /Clause de durée pour le devis \(à adapter\)/);
assert.match(toolUi, /Récapitulatif/);
assert.match(toolUi, /label="Copier"/);
assert.match(toolUi, /bg-orange-50/);
assert.match(toolUi, /bg-amber-50/);
assert.match(toolUi, /bg-emerald-50/);
assert.doesNotMatch(toolUi, /fetch\(/);
assertNoDashes(toolUi, "outil ui");

const toolLogic = readFileSync(
  join(process.cwd(), "src/lib/marketing/calculateur-preavis-reconduction-tacite.ts"),
  "utf8",
);
assert.doesNotMatch(toolLogic, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket/);

assert.deepStrictEqual(MODES, ["periode", "indeterminee", "aucune"]);
assert.deepStrictEqual(UNITES, ["mois", "jours"]);
assert.deepEqual(DEFAULTS, {
  dateDebut: "2025-01-01",
  dureeInitiale: 12,
  mode: "periode",
  dureeReconduction: 12,
  preavis: 3,
  unite: "mois",
  dateCourrier: "2026-10-15",
  mensuel: 1800,
});

assert.strictEqual(fmtEur(26215.89), `26${NB}215,89${NB}€`);
assert.strictEqual(fmtHt(1800), `1${NB}800${NB}€ HT`);
assert.strictEqual(fmtDate("2026-09-30"), "30/09/2026");
assert.strictEqual(fmtDate("n'importe quoi"), "n/a");
assert.strictEqual(parseDate("2026-02-30"), null);
assert.strictEqual(addMonths("2025-01-31", 1), "2025-02-28");
assert.strictEqual(addMonths("2024-01-31", 1), "2024-02-29");
assert.strictEqual(addMonths("2027-01-01", -3), "2026-10-01");
assert.strictEqual(addMonths("2025-11-15", 3), "2026-02-15");
assert.strictEqual(addDays("2026-12-31", 1), "2027-01-01");
assert.strictEqual(addDays("2026-03-29", 1), "2026-03-30");
assert.strictEqual(dateLimite("2027-01-01", 3, "mois"), "2026-09-30");
assert.strictEqual(dateLimite("2027-01-01", 30, "jours"), "2026-12-01");
assert.strictEqual(dateLimite("2027-01-01", 0, "mois"), "2026-12-31");
assert.strictEqual(finApresPreavis("2026-10-15", 3, "mois"), "2027-01-15");
assert.strictEqual(finApresPreavis("2026-10-15", 30, "jours"), "2026-11-14");
assert.strictEqual(finApresPreavis("2026-10-15", 0, "mois"), "2026-10-15");
assert.strictEqual(fmtPreavis(3, "mois"), "3 mois");
assert.strictEqual(fmtPreavis(1, "jours"), "1 jour");
assert.strictEqual(fmtDuree(36, 0), "3 ans");
assert.strictEqual(fmtDuree(13, 15), "1 an, 1 mois et 15 jours");
assert.strictEqual(fmtDuree(24, 15), "2 ans et 15 jours");
assert.strictEqual(fmtDuree(0, 1), "1 jour");
assert.deepStrictEqual(ecart("2025-01-01", "2028-01-01"), { mois: 36, jours: 0 });

const run = (o: PreavisInput) => computePreavis({ ...DEFAULTS, ...o });

const d = run({});
assert.strictEqual(d.valide, true);
assert.strictEqual(d.periodeLibelle, "Reconduction 1");
assert.strictEqual(d.periodeDebut, "2026-01-01");
assert.strictEqual(d.periodeFin, "2026-12-31");
assert.strictEqual(d.limite, "2026-09-30");
assert.strictEqual(d.retardJours, 15);
assert.strictEqual(d.finEffective, "2027-12-31");
assert.strictEqual(d.prochaineLimite, "2027-09-30");
assert.strictEqual(d.joursEngages, 443);
assert.strictEqual(d.montantEngage, 26215.89);
assert.strictEqual(d.montantEngage, Math.round(((1800 * 12) / 365) * 443 * 100) / 100);
assert.strictEqual(d.dureeRelation, "3 ans");
assert.strictEqual(d.etat, "warn");
assert.strictEqual(
  d.verdict,
  "Le courrier arrive 15 jours après la date limite du 30/09/2026. Le contrat repart pour 12 mois : il prendra fin le 31/12/2027, et non le 31/12/2026.",
);
assert.strictEqual(d.lignes.length, 6);
assert.deepStrictEqual(
  d.lignes.map((l) => l.limite),
  ["2025-09-30", "2026-09-30", "2027-09-30", "2028-09-30", "2029-09-30", "2030-09-30"],
);
assert.deepStrictEqual(
  d.lignes.map((l) => l.etatPeriode),
  ["terminée", "en cours", "à venir", "à venir", "à venir", "à venir"],
);
assert.deepStrictEqual(
  d.lignes.filter((l) => l.courant).map((l) => l.periode),
  ["Reconduction 1"],
);
assert.deepStrictEqual(
  d.lignes.filter((l) => l.fin).map((l) => l.periode),
  ["Reconduction 2"],
);
assert.strictEqual(
  d.clause,
  "Durée : le contrat prend effet le 01/01/2025 pour une durée de 12 mois. Il est ensuite reconduit tacitement par périodes de 12 mois, sauf dénonciation par l'une des parties par lettre recommandée avec avis de réception reçue au moins 3 mois avant la fin de la période en cours.",
);
assert.strictEqual(d.conseils.length, 6);
assert.ok(d.conseils[0]?.includes("30/09/2027"));
assert.ok(d.conseils.some((c) => c.includes("L442-1 II") && c.includes("18 mois")));
assert.ok(d.conseils.some((c) => c.includes("L215-1") && c.includes("L215-3")));
assert.ok(d.conseils.some((c) => c.startsWith("QuoteBuilder ne gère ni durée de contrat")));
const recap = d.recap.split("\n");
assert.strictEqual(recap.length, 9);
assert.strictEqual(recap[5], "Période en cours : Reconduction 1, du 01/01/2026 au 31/12/2026, date limite : 30/09/2026");
assert.strictEqual(recap[7], `Montant encore engagé : 26${NB}215,89${NB}€ HT (1${NB}800${NB}€ HT par mois, 443 jours)`);
assert.strictEqual(recap[8], "Calcul : quotebuilder.co/outils/calculateur-preavis-reconduction-tacite");
assert.strictEqual(buildRecap({ ...DEFAULTS }), d.recap);

const a = run({ dateCourrier: "2026-09-01" });
assert.strictEqual(a.etat, "ok");
assert.strictEqual(a.finEffective, "2026-12-31");
assert.strictEqual(a.joursEngages, 122);
assert.strictEqual(a.montantEngage, 7219.73);
assert.strictEqual(a.dureeRelation, "2 ans");
const b = run({ dateCourrier: "2026-09-30" });
assert.strictEqual(b.etat, "ok");
assert.strictEqual(b.finEffective, "2026-12-31");
const b1 = run({ dateCourrier: "2026-10-01" });
assert.strictEqual(b1.etat, "warn");
assert.strictEqual(b1.retardJours, 1);
assert.ok(b1.verdict.startsWith("Le courrier arrive 1 jour après"));
assert.strictEqual(b1.finEffective, "2027-12-31");

const j = run({ unite: "jours", preavis: 30 });
assert.strictEqual(j.limite, "2026-12-01");
assert.strictEqual(j.etat, "ok");
assert.strictEqual(j.finEffective, "2026-12-31");
assert.strictEqual(j.joursEngages, 78);

const l = run({ preavis: 18 });
assert.strictEqual(l.finEffective, "2028-12-31");
assert.ok(l.verdict.includes("2 périodes de 12 mois"));

const fm = run({ dateDebut: "2025-01-31", dureeInitiale: 1, dureeReconduction: 1, preavis: 0, dateCourrier: "2025-03-15" });
assert.strictEqual(fm.periodeDebut, "2025-02-28");
assert.strictEqual(fm.finEffective, "2025-03-30");

const i1 = run({ mode: "indeterminee" });
assert.strictEqual(i1.etat, "ok");
assert.strictEqual(i1.periodeLibelle, "Durée indéterminée");
assert.strictEqual(i1.limite, null);
assert.strictEqual(i1.limiteTexte, "à tout moment, préavis de 3 mois");
assert.strictEqual(i1.finEffective, "2027-01-15");
assert.strictEqual(i1.joursEngages, 93);
assert.strictEqual(i1.montantEngage, 5503.56);
assert.strictEqual(i1.lignes.length, 2);
assert.strictEqual(i1.dureeRelation, "2 ans et 15 jours");
assert.ok(i1.clause.includes("se poursuit pour une durée indéterminée"));
const i2 = run({ mode: "indeterminee", dateCourrier: "2025-09-01" });
assert.strictEqual(i2.etat, "ok");
assert.strictEqual(i2.finEffective, "2025-12-31");
const i3 = run({ mode: "indeterminee", dateCourrier: "2025-11-15" });
assert.strictEqual(i3.etat, "warn");
assert.strictEqual(i3.retardJours, 46);
assert.strictEqual(i3.finEffective, "2026-02-15");
const i4 = run({ mode: "indeterminee", preavis: 0 });
assert.strictEqual(i4.etat, "warn");
assert.ok(i4.verdict.includes("délai raisonnable"));
assert.ok(i4.conseils.some((c) => c.includes("article 1211")));

const n1 = run({ mode: "aucune", dateCourrier: "2025-06-01" });
assert.strictEqual(n1.etat, "ok");
assert.strictEqual(n1.finEffective, "2025-12-31");
assert.strictEqual(n1.lignes.length, 1);
assert.ok(n1.clause.includes("sans reconduction tacite"));
const n2 = run({ mode: "aucune" });
assert.strictEqual(n2.etat, "warn");
assert.ok(n2.verdict.includes("article 1215"));
assert.strictEqual(n2.finEffective, "2027-01-15");
assert.strictEqual(n2.joursEngages, 93);
assert.strictEqual(n2.montantEngage, 5503.56);

const zeroPreavis = run({ preavis: 0 });
assert.strictEqual(zeroPreavis.etat, "ok");
assert.strictEqual(zeroPreavis.finEffective, "2026-12-31");
assert.strictEqual(zeroPreavis.joursEngages, 78);
assert.strictEqual(zeroPreavis.montantEngage, 4615.89);

const z = run({ mensuel: 0 });
assert.strictEqual(z.montantEngage, null);
assert.ok(z.recap.includes("Montant encore engagé : non renseigné"));

for (const [o, txt] of [
  [{ dateDebut: "" }, "date de début"],
  [{ dureeInitiale: 0 }, "durée initiale"],
  [{ dureeReconduction: 0 }, "durée de chaque reconduction"],
  [{ dateCourrier: "2026-13-01" }, "date de réception"],
] as const) {
  const r = run(o);
  assert.strictEqual(r.valide, false);
  assert.strictEqual(r.etat, "neutral");
  assert.strictEqual(r.lignes.length, 0);
  assert.ok(r.verdict.includes(txt), txt);
}
assert.strictEqual(run({ mode: "indeterminee", dureeReconduction: 0 }).valide, true);

console.log("seo-am-20261026 ok");
