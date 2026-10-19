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
  BLOG_TOOL_MOTIFS_PERDUS,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  DEVIS_PERDUS_DEFAULTS,
  MOTIFS,
  buildRecap,
  computeDevisPerdus,
  fmtEur,
  fmtNum,
  fmtPct,
} from "./analyseur-motifs-devis-perdus";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "analyser-devis-perdus-motifs-perte-b2b";
const SECTOR_SLUG = "funnel-devis-equipement-medical";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;
const TOOL_PATH = "/outils/analyseur-motifs-devis-perdus";
const DAY = "2026-10-19";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_MOTIFS_PERDUS, TOOL_PATH);
assert.equal(BLOG_POSTS.some((post) => post.slug === SECTOR_SLUG), false);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["relances", "scoring"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Devis perdus : noter le motif, compter les pertes et corriger ce qui peut l'être",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Devis perdus en B2B : une liste courte de motifs de perte, quand les noter et que demander au client, comment calculer le taux de gain sans se tromper, quoi faire pour chaque motif (prix, délai, concurrent, silence, projet reporté, hors cible) et comment tenir une revue trimestrielle des pertes.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 20);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
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

assert.equal(BLOG_POSTS.length, 58);
assert.equal(BLOG_TOOLS.length, 48);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Analyseur des motifs de devis perdus");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["relances", "scoring"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Prix, délai, concurrent, pas de réponse : comment se répartissent vos devis perdus, ce qu'ils représentent, et ce que rapporterait d'en récupérer une partie ?",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Quarante-huit outils publics."));
assert.equal(outilsHubIntro(), "Quarante-huit outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(48), outilsHubIntro());
assert.equal(outilsHubIntro(47), "Quarante-sept outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
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
  /Devis perdus : noter le motif, compter les pertes et corriger ce qui peut l'être : https:\/\/www\.quotebuilder\.co\/blog\/analyser-devis-perdus-motifs-perte-b2b/,
);
assert.match(
  llms,
  /Funnel de devis équipement médical : https:\/\/www\.quotebuilder\.co\/secteurs\/funnel-devis-equipement-medical/,
);
assert.match(
  llms,
  /Analyseur des motifs de devis perdus : https:\/\/www\.quotebuilder\.co\/outils\/analyseur-motifs-devis-perdus/,
);
const llmsLines = llms.split("\n");
const sectorLine = llmsLines.findIndex((line) => line.includes(SECTOR_PATH));
const blogLine = llmsLines.findIndex((line) => line.includes(BLOG_PATH));
const toolLine = llmsLines.findIndex((line) => line.includes(TOOL_PATH));
const tarifsLine = llmsLines.findIndex((line) => line.includes("https://www.quotebuilder.co/tarifs"));
assert.ok(sectorLine >= 0 && sectorLine < tarifsLine, "secteur llms avec les secteurs");
assert.ok(blogLine > tarifsLine, "article llms avec les articles");
assert.ok(toolLine > tarifsLine, "outil llms avec les outils");

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /analyseur-motifs-devis-perdus/);
assert.match(outilsHub, /Analyseur des motifs de devis perdus/);
assert.match(outilsHub, /analyseur des motifs de devis perdus/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/analyseur-motifs-devis-perdus"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 280), /eyebrow: "Relances"/);
}

const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(secteursHub, /funnel-devis-equipement-medical/);
assert.match(secteursHub, /label: "Équipement médical"/);

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

function close(actual: number | null, expected: number, eps = 1e-4) {
  assert.ok(actual != null, `expected ${expected}, got null`);
  assert.ok(Math.abs(actual - expected) < eps, `${actual} != ${expected}`);
}

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(blogBody.startsWith("# Devis perdus : noter le motif, compter les pertes et corriger ce qui peut l'être"));
  assert.doesNotMatch(blogBody, /^title:/m);
  for (const needle of [
    "Perdu",
    "Motif :",
    "Notes internes",
    "Export CSV",
    "Écrire",
    "« Reçu »",
    "Clôturé",
    "30 jours",
    "consentement marketing",
    "CNIL",
    "/outils/analyseur-motifs-devis-perdus",
  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assertNoDashes(blogRaw, "pertes md");
  assertNoDashes(blogBody, "pertes body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 4994);
  assert.equal(alphaTokens(blogBody), 4597);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "pertes");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"));
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith(
      "# Funnel de devis équipement médical : cabinet, clinique, EHPAD, une demande cadrée avant le premier rendez-vous",
    ),
  );
  for (const needle of [
    "health_equipment",
    "Funnel équipement médical",
    "Votre équipement",
    "Espace et contraintes",
    "Équipements adaptés",
    "Ex. 80 m², 12 box",
    "Mesure",
    "30 points",
    "ANSM",
    "données de santé",
    "inclut",
    "Plan (PDF ou image)",
    "Demande de photo",
  ]) {
    assert.ok(sectorBody.includes(needle), `secteur missing ${needle}`);
  }
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(sectorBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assertNoDashes(sectorRaw, "equipement md");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 4650);
  assert.equal(alphaTokens(sectorBody), 4233);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "equipement");

  const sectorPage = readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-equipement-medical/page.tsx"),
    "utf8",
  );
  assert.deepEqual(faqFromPage(sectorPage), faqFromMarkdown(sectorBody));
  assert.match(sectorPage, /Essayer le template Équipement médical/);
  assert.match(sectorPage, /Secteur · Équipement médical/);
  assert.match(sectorPage, /signup\?plan=free/);
  assert.match(sectorPage, /loadPostBody\("funnel-devis-equipement-medical"\)/);
  assert.match(sectorPage, /WebPage/);
  assert.match(sectorPage, /\/blog\/analyser-devis-perdus-motifs-perte-b2b/);
  assert.match(sectorPage, /\/outils\/analyseur-motifs-devis-perdus/);
  assert.match(sectorPage, /\/blog\/regles-suggestion-produits-funnel-devis-b2b/);
  assert.match(sectorPage, /\/fonctionnalites\/espace-prospect/);
  assertNoDashes(sectorPage, "equipement page");
}

const health = FUNNEL_TEMPLATES.find((template) => template.id === "health_equipment");
assert.ok(health, "template health_equipment missing");
if (!health) throw new Error("template health_equipment missing");
assert.equal(health.defaultName, "Funnel équipement médical");
assert.equal(health.steps[0]?.title, "Votre équipement");
assert.equal(health.steps[0]?.subtitle, "Espace et contraintes");
assert.equal(health.steps[1]?.title, "Solutions recommandées");
assert.equal(health.steps[1]?.subtitle, "Équipements adaptés");
const healthQuestions = health.steps[0]?.questions ?? [];
const projectType = healthQuestions.find((item) => item.key === "project_type");
const projectChoices =
  (projectType?.options as { choices?: { value: string }[] } | null)?.choices?.map((choice) => choice.value) ?? [];
assert.deepEqual(projectChoices, ["cabinet", "clinic", "home", "other"]);
const surface = healthQuestions.find((item) => item.key === "surface");
assert.equal(surface?.type, "text");
assert.equal((surface?.options as { placeholder?: string } | null)?.placeholder, "Ex. 80 m², 12 box");
const constraints = healthQuestions.find((item) => item.key === "constraints");
assert.equal(constraints?.type, "multi_select");
const constraintChoices =
  (constraints?.options as { choices?: { value: string }[] } | null)?.choices?.map((choice) => choice.value) ?? [];
assert.deepEqual(constraintChoices, ["access", "norm", "height", "none"]);

assert.deepEqual(scoreQuote({ project_type: "clinic", surface: "80 m²", constraints: ["norm"] }), {
  score: 35,
  label: "cold",
});
assert.deepEqual(scoreQuote({ project_type: "cabinet", surface: "120", constraints: ["none"] }), {
  score: 45,
  label: "warm",
});
assert.deepEqual(scoreQuote({ project_type: "clinic", surface: 450, constraints: ["access"] }), {
  score: 60,
  label: "warm",
});
assert.deepEqual(scoreQuote({ project_type: "cabinet" }), { score: 30, label: "cold" });

const rgpd = readFileSync(join(blogDir, "rgpd-demande-devis-b2b-consentement-conservation.md"), "utf8");
assert.equal(rgpd.includes("contacts, réponses"), false);
assert.ok(rgpd.includes("| Exports CSV | contacts, statut, score | personne qui exporte | à supprimer après usage |"));
assert.equal(readFileSync(join(process.cwd(), "src/lib/marketing/blog-faq.ts"), "utf8").includes("contacts, réponses"), false);

const addedSources = [
  "src/lib/marketing/analyseur-motifs-devis-perdus.ts",
  "src/lib/marketing/seo-am-20261019.test.ts",
  "src/components/marketing/analyseur-motifs-devis-perdus-calculator.tsx",
  "src/app/(marketing)/outils/analyseur-motifs-devis-perdus/page.tsx",
  "src/app/(marketing)/secteurs/funnel-devis-equipement-medical/page.tsx",
  "src/content/blog/analyser-devis-perdus-motifs-perte-b2b.md",
  "src/content/blog/funnel-devis-equipement-medical.md",
];
assertNoDashes((BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"), "pertes faq");
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/analyseur-motifs-devis-perdus/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /analyseur-motifs-devis-perdus/);
assert.match(toolPage, /Analyseur des motifs de devis perdus/);
assert.match(toolPage, /Tous les devis perdus n'étaient pas gagnables/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /\/blog\/analyser-devis-perdus-motifs-perte-b2b/);
assert.match(toolPage, /\/fonctionnalites\/demandes/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /\/signup\?plan=free/);
assertNoDashes(toolPage, "outil page");

const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/analyseur-motifs-devis-perdus-calculator.tsx"),
  "utf8",
);
assert.match(toolUi, /hypothèses d'exemple, pas des moyennes de marché/);
assert.match(toolUi, /Vos devis tranchés sur la période/);
assert.match(toolUi, /Devis perdus, par motif principal/);
assert.match(toolUi, /Ce que représente un devis/);
assert.match(toolUi, /Répartition des pertes/);
assert.match(toolUi, /Pour lire vos chiffres/);
assert.match(toolUi, /Récapitulatif/);
assert.match(toolUi, /label="Copier"/);
assert.doesNotMatch(toolUi, /fetch\(/);

assert.strictEqual(fmtEur(496000), "496" + NB + "000" + NB + "€");
assert.strictEqual(fmtEur(825), "825" + NB + "€");
assert.strictEqual(fmtEur(12.5), "12,50" + NB + "€");
assert.strictEqual(fmtEur(-0.001), "0" + NB + "€");
assert.strictEqual(fmtNum(7.2), "7,2");
assert.strictEqual(fmtNum(1234.56), "1" + NB + "234,6");
assert.strictEqual(fmtPct(22.580645), "22,6" + NB + "%");
assert.strictEqual(fmtPct(null), "n/a");
assert.strictEqual(MOTIFS.length, 7);
assert.equal(DEVIS_PERDUS_DEFAULTS.gagnes, 18);
assert.equal(DEVIS_PERDUS_DEFAULTS.silence, 16);
assert.equal(DEVIS_PERDUS_DEFAULTS.panier, 8000);
assert.equal(DEVIS_PERDUS_DEFAULTS.recup, 20);

const base = {
  gagnes: 18,
  prix: 14,
  delai: 6,
  concurrent: 9,
  silence: 16,
  annule: 7,
  horsCible: 5,
  inconnu: 5,
  panier: 8000,
  marge: 30,
  heures: 3,
  coutHoraire: 55,
  recup: 20,
};
const result = computeDevisPerdus(base);
assert.strictEqual(result.perdus, 62);
assert.strictEqual(result.decides, 80);
close(result.tauxGain, 22.5);
const parts = Object.fromEntries(result.lignes.map((ligne) => [ligne.key, ligne.part]));
close(parts.prix ?? null, 22.580645);
close(parts.delai ?? null, 9.677419);
close(parts.concurrent ?? null, 14.516129);
close(parts.silence ?? null, 25.806452);
close(parts.annule ?? null, 11.290323);
close(parts.horsCible ?? null, 8.064516);
close(parts.inconnu ?? null, 8.064516);
close(
  result.lignes.reduce((sum, ligne) => sum + (ligne.part ?? 0), 0),
  100,
  1e-3,
);
assert.ok(result.top);
assert.strictEqual(result.top?.key, "silence");
assert.strictEqual(result.top?.label, "Pas de réponse");
assert.strictEqual(result.groupes.leviers.count, 36);
close(result.groupes.leviers.part, 58.064516);
assert.strictEqual(result.groupes.choix.count, 16);
close(result.groupes.choix.part, 25.806452);
assert.strictEqual(result.groupes.qualification.count, 5);
assert.strictEqual(result.groupes.inconnu.count, 5);
close(result.caPerdu, 496000);
close(result.margePerdue, 148800);
close(result.heuresPerdues, 186);
close(result.coutChiffragePerdus, 10230);
close(result.heuresHorsCible, 15);
close(result.coutHorsCible, 825);
close(result.recupClients, 7.2);
close(result.recupCa, 57600);
close(result.recupMarge, 17280);
close(result.tauxApres, 31.5);
assert.strictEqual(result.verdict.tone, "ok");
assert.strictEqual(result.conseils.length, 4);
assert.ok(result.conseils[0]?.startsWith("Prix : 22,6" + NB + "%"));
assert.ok(result.conseils[1]?.startsWith("Pas de réponse : 25,8" + NB + "%"));
assert.ok(result.conseils[2]?.startsWith("Hors cible : 5 devis, 15" + NB + "h"));
assert.ok(result.conseils[3]?.includes("le statut Perdu n'a pas de champ motif"));

const lines = result.recap.split("\n");
assert.strictEqual(lines.length, 7);
assert.strictEqual(lines[0], "Devis tranchés : 80 (18 gagnés, 62 perdus), taux de gain 22,5" + NB + "%.");
assert.ok(lines[1]?.startsWith("Motifs : prix 14 (22,6" + NB + "%)"));
assert.ok(lines[2]?.startsWith("Groupes : vos leviers 36 (58,1" + NB + "%)"));
assert.ok(
  lines[3]?.includes("496" + NB + "000" + NB + "€ HT") &&
    lines[3]?.includes("186" + NB + "h") &&
    lines[3]?.includes("10" + NB + "230" + NB + "€") &&
    lines[3]?.includes("825" + NB + "€"),
);
assert.ok(
  lines[4]?.includes("7,2 affaires") &&
    lines[4]?.includes("57" + NB + "600" + NB + "€ HT") &&
    lines[4]?.includes("17" + NB + "280" + NB + "€") &&
    lines[4]?.includes("31,5" + NB + "%"),
);
assert.ok(lines[5]?.startsWith("Lecture : Analyse exploitable"));
assert.strictEqual(lines[6], "Calcul : quotebuilder.co/outils/analyseur-motifs-devis-perdus");
assert.strictEqual(buildRecap(base), result.recap);

const zero = computeDevisPerdus({
  ...base,
  prix: 0,
  delai: 0,
  concurrent: 0,
  silence: 0,
  annule: 0,
  horsCible: 0,
  inconnu: 0,
});
assert.strictEqual(zero.perdus, 0);
assert.strictEqual(zero.verdict.tone, "neutral");
assert.strictEqual(zero.top, null);
assert.strictEqual(zero.lignes[0]?.part, null);
close(zero.tauxGain, 100);
assert.strictEqual(zero.conseils.length, 1);

const vide = computeDevisPerdus({});
assert.strictEqual(vide.decides, 0);
assert.strictEqual(vide.tauxGain, null);
assert.strictEqual(vide.tauxApres, null);
assert.ok(vide.recap.includes("taux de gain n/a"));

const flou = computeDevisPerdus({ ...base, inconnu: 30 });
assert.strictEqual(flou.perdus, 87);
assert.strictEqual(flou.verdict.tone, "bad");
assert.ok(flou.conseils.some((item) => item.startsWith("Sans motif : ")));

const moyen = computeDevisPerdus({ ...base, inconnu: 12 });
close(moyen.groupes.inconnu.part, (12 / 69) * 100);
assert.strictEqual(moyen.verdict.tone, "warn");

const petit = computeDevisPerdus({
  gagnes: 3,
  prix: 5,
  delai: 1,
  concurrent: 2,
  silence: 3,
  annule: 1,
  horsCible: 1,
  inconnu: 1,
  panier: 5000,
  marge: 25,
  heures: 2,
  coutHoraire: 50,
  recup: 10,
});
assert.strictEqual(petit.decides, 17);
assert.strictEqual(petit.verdict.tone, "warn");
assert.ok(petit.verdict.text.includes("seulement 17 devis tranchés"));

const borne = computeDevisPerdus({ ...base, marge: 150, recup: -5, heures: "abc", prix: "2.7" });
assert.strictEqual(borne.marge, 100);
assert.strictEqual(borne.recup, 0);
assert.strictEqual(borne.heures, 0);
assert.strictEqual(borne.counts.prix, 2);
close(borne.recupClients, 0);
close(borne.heuresPerdues, 0);

const egal = computeDevisPerdus({ ...base, prix: 16 });
assert.strictEqual(egal.top?.key, "prix");

const tout = computeDevisPerdus({ gagnes: 10, inconnu: 10 });
assert.strictEqual(tout.top, null);
assert.strictEqual(tout.verdict.tone, "bad");
