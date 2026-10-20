import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { getFunnelFamily } from "@/lib/funnels/families";
import { FUNNEL_TEMPLATES } from "@/lib/funnels/templates";
import { scoreQuote } from "@/lib/quotes/score";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_DEVIS_PAYANT, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  DEVIS_PAYANT_DEFAULTS,
  buildRecap,
  computeDevisPayant,
  fmtEur,
  fmtNum,
  type DevisPayantInput,
} from "./calculateur-devis-payant-etude-prealable";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "devis-payant-etude-prealable-b2b";
const SECTOR_SLUG = "funnel-devis-geometre-expert-bornage";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;
const TOOL_PATH = "/outils/calculateur-devis-payant-etude-prealable";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_DEVIS_PAYANT, TOOL_PATH);
assert.equal(BLOG_POSTS.some((post) => post.slug === SECTOR_SLUG), false);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["funnel", "catalogue"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Devis payant en B2B : quand faire payer l'étude, comment l'annoncer et ce que ça change sur vos demandes",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Faire payer un devis ou une étude préalable entre professionnels : ce que dit la règle, les cas où ça se justifie, comment l'annoncer avant le chiffrage, combien demander, la déduction de la commande, et comment le poser dans un funnel QuoteBuilder.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.funnelPublic);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 16);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, "2026-10-15");
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

assert.equal(BLOG_POSTS.length, 61);
assert.equal(BLOG_TOOLS.length, 51);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title,
  "Calculateur devis payant et étude préalable",
);
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["funnel", "catalogue"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Études facturées, temps récupéré, contrats perdus : faire payer l'étude vous rapporte-t-il plus qu'il ne vous coûte ?",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-et-un outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-et-un outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(51), outilsHubIntro());
assert.equal(outilsHubIntro(43), "Quarante-trois outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, "2026-10-15");
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === SECTOR_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "2026-10-15"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, "2026-10-15");
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(
  llms,
  /Devis payant en B2B : quand faire payer l'étude, comment l'annoncer et ce que ça change sur vos demandes : https:\/\/www\.quotebuilder\.co\/blog\/devis-payant-etude-prealable-b2b/,
);
assert.match(
  llms,
  /Funnel de devis géomètre-expert : https:\/\/www\.quotebuilder\.co\/secteurs\/funnel-devis-geometre-expert-bornage/,
);
assert.match(
  llms,
  /Calculateur devis payant et étude préalable : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-devis-payant-etude-prealable/,
);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(outilsHub, /calculateur-devis-payant-etude-prealable/);
assert.match(outilsHub, /eyebrow: "Funnel"/);
assert.match(outilsHub, /calculateur devis payant et étude préalable/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
assert.match(secteursHub, /funnel-devis-geometre-expert-bornage/);
assert.match(secteursHub, /Géomètre-expert et topographie/);

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

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(
    blogBody.startsWith(
      "# Devis payant en B2B : quand faire payer l'étude, comment l'annoncer et ce que ça change sur vos demandes",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /DGCCRF/);
  assert.match(blogBody, /24 janvier 2017/);
  assert.match(blogBody, /prix fixe|Prix fixe/);
  assert.match(blogBody, /Sur devis/);
  assert.match(blogBody, /déduits de la commande/);
  assert.match(blogBody, /vaut au moins 400/);
  assert.match(blogBody, /Document indicatif, non contractuel/);
  assert.match(blogBody, /\/outils\/calculateur-devis-payant-etude-prealable/);
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assertNoDashes(blogRaw, "devis payant md");
  assertNoDashes(blogBody, "devis payant body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 3856);
  assert.equal(alphaTokens(blogBody), 3637);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "devis payant");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"));
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith(
      "# Funnel de devis géomètre-expert : bornage, division, topographie, une demande avec la parcelle avant le premier appel",
    ),
  );
  assert.match(sectorBody, /property_surveyor/);
  assert.match(sectorBody, /Funnel géomètre/);
  assert.match(sectorBody, /Bornage \/ division/);
  assert.match(sectorBody, /Topographie/);
  assert.match(sectorBody, /Copropriété/);
  assert.match(sectorBody, /Prestations adaptées/);
  assert.match(sectorBody, /Plan \(PDF ou image\)/);
  assert.match(sectorBody, /notes/);
  assert.match(sectorBody, /30 points/);
  assert.match(sectorBody, /46-942/);
  assert.match(sectorBody, /394065/);
  assert.match(sectorBody, /646/);
  assert.match(sectorBody, /30 jours/);
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /\/c\/demo\/rayonnage/);
  assert.match(sectorBody, /Essayer le template Géomètre/);
  assert.doesNotMatch(sectorBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assertNoDashes(sectorRaw, "geometre md");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 3697);
  assert.equal(alphaTokens(sectorBody), 3409);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "geometre");

  const sectorPage = readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-geometre-expert-bornage/page.tsx"),
    "utf8",
  );
  assert.deepEqual(faqFromPage(sectorPage), faqFromMarkdown(sectorBody));
  assert.match(sectorPage, /Essayer le template Géomètre/);
  assert.match(sectorPage, /Secteur · Géomètre-expert/);
  assert.match(sectorPage, /signup\?plan=free/);
  assert.match(sectorPage, /loadPostBody\("funnel-devis-geometre-expert-bornage"\)/);
  assert.match(sectorPage, /WebPage/);
  assert.match(sectorPage, /\/blog\/devis-payant-etude-prealable-b2b/);
  assert.match(sectorPage, /\/outils\/calculateur-devis-payant-etude-prealable/);
  assert.match(sectorPage, /\/blog\/regles-suggestion-produits-funnel-devis-b2b/);
  assert.match(sectorPage, /\/fonctionnalites\/espace-prospect/);
  assertNoDashes(sectorPage, "geometre page");
}

const surveyor = FUNNEL_TEMPLATES.find((template) => template.id === "property_surveyor");
assert.ok(surveyor, "template property_surveyor missing");
if (!surveyor) throw new Error("template property_surveyor missing");
assert.equal(surveyor.label, "Géomètre");
assert.equal(surveyor.defaultName, "Funnel géomètre");
assert.equal(surveyor.defaultKind, "form");
assert.equal(getFunnelFamily(surveyor.family).label, "Immobilier & construction");
assert.equal(surveyor.steps[0]?.title, "Votre levé");
assert.equal(surveyor.steps[0]?.subtitle, "Type de mission et échéance");
assert.equal(surveyor.steps[1]?.title, "Solutions recommandées");
assert.equal(surveyor.steps[1]?.subtitle, "Prestations adaptées");
const surveyorQuestions = surveyor.steps[0]?.questions ?? [];
function choiceLabels(key: string) {
  const question = surveyorQuestions.find((item) => item.key === key);
  const options = question?.options as { choices?: { value: string; label: string }[] } | null;
  return (options?.choices ?? []).map((choice) => choice.label);
}
assert.deepEqual(choiceLabels("project_type"), ["Bornage / division", "Topographie", "Copropriété", "Autre"]);
assert.equal(surveyorQuestions.find((item) => item.key === "notes")?.required, false);
assert.equal(surveyorQuestions.find((item) => item.key === "timeline")?.label, "Échéance");

const scored = scoreQuote({
  project_type: "boundary",
  notes: "x".repeat(120),
  timeline: "month",
});
assert.equal(scored.score, 30);
assert.equal(scored.label, "cold");

for (const file of readdirSync(blogDir)) {
  if (!file.endsWith(".md")) continue;
  assert.doesNotMatch(readFileSync(join(blogDir, file), "utf8"), /pied de page libre/, file);
}
assert.doesNotMatch(readFileSync(join(process.cwd(), "src/lib/marketing/blog-faq.ts"), "utf8"), /pied de page libre/);
assert.doesNotMatch(llms, /pied de page libre/);
assert.match(
  llms,
  /Le pied de page du PDF est fixe \(« Document indicatif, non contractuel » \+ nom de l’entreprise\) et n’est pas personnalisable\./,
);

const addedSources = [
  "src/lib/marketing/calculateur-devis-payant-etude-prealable.ts",
  "src/lib/marketing/seo-am-20261015.test.ts",
  "src/components/marketing/calculateur-devis-payant-etude-prealable-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-devis-payant-etude-prealable/page.tsx",
  "src/app/(marketing)/secteurs/funnel-devis-geometre-expert-bornage/page.tsx",
  "src/content/blog/devis-payant-etude-prealable-b2b.md",
  "src/content/blog/funnel-devis-geometre-expert-bornage.md",
];
assertNoDashes(
  (BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"),
  "devis payant faq",
);
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-devis-payant-etude-prealable/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-devis-payant-etude-prealable/);
assert.match(toolPage, /Calculateur devis payant et étude préalable/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /devis-payant-etude-prealable-b2b/);
assert.match(toolPage, /\/fonctionnalites\/catalogue/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /Pour lire vos chiffres/);
assert.match(toolPage, /Calcul local · aucune donnée envoyée/);
assert.match(toolPage, /sans le temps récupéré/);
assert.match(toolPage, /hypothèses d&apos;exemple, pas des moyennes de marché/);
assert.doesNotMatch(toolPage, /\/blog\/espace-prospect-devis-en-ligne/);

const calculator = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-devis-payant-etude-prealable-calculator.tsx"),
  "utf8",
);
assert.match(calculator, /tone === "bad" \? "text-rose-700"/);
assert.match(calculator, /tone === "ok" \? "text-emerald-700"/);
assert.match(calculator, /tone === "warn" \? "text-amber-800"/);
assert.match(calculator, /: "text-mk-accent"/);
assert.match(calculator, /label="Bilan mensuel sans le temps récupéré"/);
assert.match(calculator, /tone=\{result\.verdict\.tone\}/);
assert.match(calculator, /if \(tone === "ok"\) return "bg-emerald-50 text-emerald-800"/);
assert.match(calculator, /if \(tone === "warn"\) return "bg-amber-50 text-amber-900"/);
assert.match(calculator, /if \(tone === "bad"\) return "bg-rose-50 text-rose-800"/);
assert.match(calculator, /id="deduite"/);
assert.match(calculator, /Étude déduite de la commande si le client signe/);
assert.match(calculator, /useState<boolean>\(DEVIS_PAYANT_DEFAULTS\.deduite\)/);
assert.equal(DEVIS_PAYANT_DEFAULTS.deduite, true);
assert.match(calculator, /hypothèses d&apos;exemple, pas des moyennes de marché/);

const close = (a: number | null, b: number, eps = 1e-6) => {
  assert.ok(a != null, "expected a number");
  assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
};
const base = { ...DEVIS_PAYANT_DEFAULTS };

let r = computeDevisPayant(base);
close(r.heuresActuelles, 240);
close(r.coutActuel, 12000);
close(r.coutEtudesPerdues, 9600);
close(r.contratsActuels, 8);
close(r.etudesPayees, 18);
close(r.heuresApres, 108);
close(r.heuresRecuperees, 132);
close(r.valeurTempsRecupere, 6600);
close(r.contratsApres, 7.2);
close(r.ecartContrats, -0.8);
close(r.ecartMarge, -1200);
close(r.etudesFacturees, 10.8);
close(r.recettesEtudes, 2700);
close(r.bilanPrudent, 1500);
close(r.bilanComplet, 8100);
close(r.bilanPrudentAnnuel, 18000);
close(r.bilanCompletAnnuel, 97200);
close(r.acceptationEquilibre, 40);
assert.strictEqual(r.verdict.tone, "ok");
assert.strictEqual(
  r.verdict.text,
  `Sur ces hypothèses, faire payer l'étude rapporte environ 1${NB}500${NB}€ par mois sans compter le temps récupéré, et 8${NB}100${NB}€ en le comptant.`,
);
assert.strictEqual(r.conseils.length, 3);
assert.ok(r.conseils[0]?.startsWith("Avec la déduction, les études des clients qui signent ne rapportent rien"));
assert.strictEqual(
  r.conseils[1],
  `Point d'équilibre sans le temps récupéré : il faut qu'au moins 40${NB}% des clients acceptent l'étude payante.`,
);
assert.ok(r.conseils[2]?.startsWith("QuoteBuilder n'encaisse pas l'étude"));
const recap = r.recap.split("\n");
assert.strictEqual(recap.length, 7);
assert.strictEqual(
  recap[0],
  `Hypothèses : 40 demandes avec étude par mois, 6 h par étude, coût horaire 50${NB}€, 20${NB}% signées aujourd'hui, étude à 250${NB}€ HT déduite de la commande, 45${NB}% d'acceptation, 40${NB}% de signature après étude payée, marge 1${NB}500${NB}€ par contrat.`,
);
assert.strictEqual(
  recap[1],
  `Aujourd'hui : 240 h d'étude par mois (12${NB}000${NB}€), 8 contrats, dont 9${NB}600${NB}€ de temps sur des études non signées.`,
);
assert.strictEqual(
  recap[2],
  `Étude payante : 18 études payées, 132 h récupérées (6${NB}600${NB}€), 7,2 contrats (écart -0,8, soit -1${NB}200${NB}€ de marge).`,
);
assert.strictEqual(recap[3], `Études facturées : 10,8 pour 2${NB}700${NB}€.`);
assert.strictEqual(
  recap[4],
  `Bilan mensuel : 1${NB}500${NB}€ sans le temps récupéré, 8${NB}100${NB}€ en le comptant (18${NB}000${NB}€ et 97${NB}200${NB}€ sur 12 mois).`,
);
assert.strictEqual(recap[5], `Équilibre sans le temps récupéré : 40${NB}% d'acceptation au minimum.`);
assert.strictEqual(recap[6], "Calcul : quotebuilder.co/outils/calculateur-devis-payant-etude-prealable");
assert.strictEqual(buildRecap(base), r.recap);
assert.ok(!/ €/.test(r.recap), "espace normale avant €");
assert.ok(!/ %/.test(r.recap), "espace normale avant %");

r = computeDevisPayant({ ...base, deduite: false });
close(r.etudesFacturees, 18);
close(r.recettesEtudes, 4500);
close(r.bilanPrudent, 3300);
close(r.acceptationEquilibre, 35.294118);
assert.ok(r.recap.includes("étude à 250\u00a0€ HT non déduite"));
assert.ok(r.conseils.some((item) => item.startsWith("Sans déduction, le client paie l'étude même s'il signe.")));
assert.ok(r.conseils.some((item) => item.includes("35,3\u00a0%")));
assert.strictEqual(computeDevisPayant({ ...base, deduite: "false" }).deduite, false);
assert.strictEqual(computeDevisPayant({ ...base, deduite: "on" }).deduite, true);
const sansCle: DevisPayantInput = { ...base };
delete sansCle.deduite;
assert.strictEqual(computeDevisPayant(sansCle).deduite, true);

const atMarge = (marge: number) => computeDevisPayant({ ...base, margeContrat: marge });
close(atMarge(3000).bilanPrudent, 300);
assert.strictEqual(atMarge(3000).verdict.tone, "ok");
close(atMarge(3001.25).bilanPrudent, 299);
assert.strictEqual(atMarge(3001.25).verdict.tone, "warn");
close(atMarge(3750).bilanPrudent, -300);
assert.strictEqual(atMarge(3750).verdict.tone, "warn");
close(atMarge(3751.25).bilanPrudent, -301);
assert.strictEqual(atMarge(3751.25).verdict.tone, "bad");
assert.ok(atMarge(3751.25).verdict.text.startsWith("Sur ces hypothèses, les contrats perdus coûtent plus"));

r = computeDevisPayant({ ...base, partAcceptent: 20 });
close(r.etudesPayees, 8);
close(r.contratsApres, 3.2);
close(r.ecartMarge, -7200);
close(r.recettesEtudes, 1200);
close(r.bilanPrudent, -6000);
close(r.bilanComplet, 3600);
assert.strictEqual(r.verdict.tone, "bad");
assert.ok(r.recap.includes("8 études payées, 192 h récupérées"));

r = computeDevisPayant({ ...base, demandes: 0 });
assert.strictEqual(r.verdict.tone, "neutral");
assert.strictEqual(r.verdict.text, "Saisissez le nombre de demandes qui demandent une étude pour lancer le calcul.");
assert.ok(!r.conseils.some((item) => item.startsWith("Point d'équilibre")));
assert.ok(r.recap.includes("0 demande avec étude par mois"));
assert.ok(r.recap.includes("0 étude payée"));

r = computeDevisPayant({ ...base, signatureActuelle: 60, signatureApres: 30, partAcceptent: 90, prixEtude: 20 });
assert.ok(r.conseils[0]?.startsWith("Vous supposez que les clients qui paient l'étude signent moins souvent"));
assert.ok(r.conseils.some((item) => item.startsWith("Plus de 80 % d'acceptation")));
assert.ok(r.conseils.some((item) => item.startsWith("Prix inférieur à 20 % du temps passé")));
assert.strictEqual(r.acceptationEquilibre, null);
assert.ok(r.conseils.includes("Avec ces hypothèses, aucun taux d'acceptation n'équilibre le bilan sans le temps récupéré."));
assert.ok(r.recap.includes("aucun taux d'acceptation ne suffit."));
r = computeDevisPayant({ ...base, prixEtude: 400 });
assert.strictEqual(
  r.conseils[0],
  `Le prix de l'étude dépasse le coût du temps passé (300${NB}€). Le client risque d'y voir une marge sur le devis lui-même.`,
);
r = computeDevisPayant({ ...base, prixEtude: 300 });
assert.ok(!r.conseils.some((item) => item.startsWith("Le prix de l'étude dépasse")));

r = computeDevisPayant({ ...base, demandes: 1, partAcceptent: 100, signatureActuelle: 100, signatureApres: 100 });
assert.ok(r.recap.includes("1 demande avec étude par mois"));
assert.ok(r.recap.includes("1 contrat,"));
assert.ok(r.recap.includes("1 étude payée"));

r = computeDevisPayant({
  demandes: "abc",
  heuresEtude: 200,
  tauxHoraire: -5,
  signatureActuelle: 150,
  margeContrat: "",
  prixEtude: -1,
  partAcceptent: -10,
  signatureApres: 101,
  deduite: true,
});
assert.strictEqual(r.demandes, 0);
assert.strictEqual(r.heuresEtude, 80);
assert.strictEqual(r.tauxHoraire, 0);
assert.strictEqual(r.signatureActuelle, 100);
assert.strictEqual(r.margeContrat, 0);
assert.strictEqual(r.prixEtude, 0);
assert.strictEqual(r.partAcceptent, 0);
assert.strictEqual(r.signatureApres, 100);
assert.strictEqual(computeDevisPayant({ ...base, demandes: 12.7 }).demandes, 12);

assert.strictEqual(fmtEur(1500), `1${NB}500${NB}€`);
assert.strictEqual(fmtEur(-1200), `-1${NB}200${NB}€`);
assert.strictEqual(fmtEur(12.5), `12,50${NB}€`);
assert.strictEqual(fmtEur(-0.001), `0${NB}€`);
assert.strictEqual(fmtNum(35.294118), "35,3");
assert.strictEqual(fmtNum(-0.8), "-0,8");
assert.strictEqual(fmtNum(null), "n/a");

assert.ok(!/[\u2013\u2014]/.test(computeDevisPayant(base).recap + computeDevisPayant(base).conseils.join(" ")));
