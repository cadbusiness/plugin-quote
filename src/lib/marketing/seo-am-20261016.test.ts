import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { FUNNEL_TEMPLATES } from "@/lib/funnels/templates";
import { scoreQuote } from "@/lib/quotes/score";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_ROI_SALON,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  ROI_SALON_DEFAULTS,
  buildRecap,
  computeRoiSalon,
  fmtEur,
  fmtNum,
} from "./calculateur-roi-salon-professionnel-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "salon-professionnel-demandes-devis-b2b";
const SECTOR_SLUG = "funnel-devis-agence-web-esn";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;
const TOOL_PATH = "/outils/calculateur-roi-salon-professionnel-devis";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_ROI_SALON, TOOL_PATH);
assert.equal(BLOG_POSTS.some((post) => post.slug === SECTOR_SLUG), false);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["funnel", "relances"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Salon professionnel : transformer les contacts du stand en demandes de devis, avec un QR code, un funnel et une relance qui part le jour même",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Salon professionnel B2B : pourquoi les badges et les cartes de visite donnent si peu de devis, comment prendre une vraie demande sur le stand (QR code vers un funnel, lien tagué utm, tablette en navigation privée), relancer le soir même et calculer le coût par demande et par client.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.funnelPublic);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 19);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, "2026-10-16");
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

assert.equal(BLOG_POSTS.length, 68);
assert.equal(BLOG_TOOLS.length, 58);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Calculateur ROI salon professionnel");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["funnel", "relances"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Stand, déplacements, journées d'équipe : combien vous coûte chaque demande de devis venue d'un salon, et à partir de combien de clients il est remboursé ?",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-huit outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-huit outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(58), outilsHubIntro());
assert.equal(outilsHubIntro(45), "Quarante-cinq outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, "2026-10-16");
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === SECTOR_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "2026-10-16"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, "2026-10-16");
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(
  llms,
  /Salon professionnel : transformer les contacts du stand en demandes de devis : https:\/\/www\.quotebuilder\.co\/blog\/salon-professionnel-demandes-devis-b2b/,
);
assert.match(
  llms,
  /Funnel de devis agence web et ESN : https:\/\/www\.quotebuilder\.co\/secteurs\/funnel-devis-agence-web-esn/,
);
assert.match(
  llms,
  /Calculateur ROI salon professionnel : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-roi-salon-professionnel-devis/,
);
const sectorLine = llms.split("\n").findIndex((line) => line.includes("/secteurs/funnel-devis-agence-web-esn"));
const blogLine = llms.split("\n").findIndex((line) => line.includes("/blog/salon-professionnel-demandes-devis-b2b"));
const tarifsLine = llms.split("\n").findIndex((line) => line.includes("https://www.quotebuilder.co/tarifs"));
assert.ok(sectorLine > 0 && sectorLine < tarifsLine, "secteur llms avant les tarifs");
assert.ok(blogLine > tarifsLine, "article llms avec les articles");

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /calculateur-roi-salon-professionnel-devis/);
assert.match(outilsHub, /calculateur ROI salon professionnel/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-roi-salon-professionnel-devis"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 280), /eyebrow: "Funnel"/);
}

const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(secteursHub, /funnel-devis-agence-web-esn/);
assert.match(secteursHub, /label: "Agence web et ESN"/);

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
  assert.ok(
    blogBody.startsWith(
      "# Salon professionnel : transformer les contacts du stand en demandes de devis, avec un QR code, un funnel et une relance qui part le jour même",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /utm_source/);
  assert.match(blogBody, /Attribution/);
  assert.match(blogBody, /Direct/);
  assert.match(blogBody, /navigation privée/);
  assert.match(blogBody, /Identité commerciale/);
  assert.match(blogBody, /Campagnes/);
  assert.match(blogBody, /30 jours/);
  assert.match(blogBody, /CNIL/);
  assert.match(blogBody, /intérêt légitime/);
  assert.match(blogBody, /\/outils\/calculateur-roi-salon-professionnel-devis/);
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assertNoDashes(blogRaw, "salon md");
  assertNoDashes(blogBody, "salon body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 4731);
  assert.equal(alphaTokens(blogBody), 4489);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "salon");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"));
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith(
      "# Funnel de devis agence web et ESN : site, renfort, data, une demande cadrée avant le premier rendez-vous",
    ),
  );
  assert.match(sectorBody, /tech_agency/);
  assert.match(sectorBody, /Funnel agence/);
  assert.match(sectorBody, /Votre projet/);
  assert.match(sectorBody, /Besoin, volume et échéance/);
  assert.match(sectorBody, /Offres adaptées/);
  assert.match(sectorBody, /notes/);
  assert.match(sectorBody, /30 points/);
  assert.match(sectorBody, /L8241-1/);
  assert.match(sectorBody, /L131-3/);
  assert.match(sectorBody, /régie/);
  assert.match(sectorBody, /forfait/);
  assert.match(sectorBody, /Demande de photo/);
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(sectorBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assertNoDashes(sectorRaw, "agence md");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 4159);
  assert.equal(alphaTokens(sectorBody), 3823);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "agence");

  const sectorPage = readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-agence-web-esn/page.tsx"),
    "utf8",
  );
  assert.deepEqual(faqFromPage(sectorPage), faqFromMarkdown(sectorBody));
  assert.match(sectorPage, /Essayer le template Agence \/ ESN/);
  assert.match(sectorPage, /Secteur · Agence web et ESN/);
  assert.match(sectorPage, /signup\?plan=free/);
  assert.match(sectorPage, /loadPostBody\("funnel-devis-agence-web-esn"\)/);
  assert.match(sectorPage, /WebPage/);
  assert.match(sectorPage, /\/blog\/salon-professionnel-demandes-devis-b2b/);
  assert.match(sectorPage, /\/outils\/calculateur-roi-salon-professionnel-devis/);
  assert.match(sectorPage, /\/blog\/regles-suggestion-produits-funnel-devis-b2b/);
  assert.match(sectorPage, /\/fonctionnalites\/espace-prospect/);
  assertNoDashes(sectorPage, "agence page");
}

const agency = FUNNEL_TEMPLATES.find((template) => template.id === "tech_agency");
assert.ok(agency, "template tech_agency missing");
if (!agency) throw new Error("template tech_agency missing");
assert.equal(agency.steps[0]?.title, "Votre projet");
assert.equal(agency.steps[0]?.subtitle, "Besoin, volume et échéance");
assert.equal(agency.steps[1]?.title, "Solutions recommandées");
assert.equal(agency.steps[1]?.subtitle, "Offres adaptées");
const agencyQuestions = agency.steps[0]?.questions ?? [];
const projectType = agencyQuestions.find((item) => item.key === "project_type");
const choices = (projectType?.options as { choices?: { value: string; label: string }[] } | null)?.choices ?? [];
assert.deepEqual(
  choices.map((choice) => choice.value),
  ["web", "staff", "data", "other"],
);
const scored = scoreQuote({
  project_type: "web",
  notes: "x".repeat(120),
  timeline: "month",
});
assert.equal(scored.score, 30);
assert.equal(scored.label, "cold");

const forbidden = [
  "surface_terrain",
  "surface_plancher",
  "Si vous lui donnez la clé",
  "affiché sous le libellé",
  "tout type de fichier",
];
for (const file of readdirSync(blogDir)) {
  if (!file.endsWith(".md")) continue;
  const text = readFileSync(join(blogDir, file), "utf8");
  for (const phrase of forbidden) {
    assert.equal(text.includes(phrase), false, `${file} contains ${phrase}`);
  }
}
const faqSrc = readFileSync(join(process.cwd(), "src/lib/marketing/blog-faq.ts"), "utf8");
for (const phrase of forbidden) {
  assert.equal(faqSrc.includes(phrase), false, `blog-faq.ts contains ${phrase}`);
}
assert.match(
  readFileSync(join(blogDir, "funnel-devis-geometre-expert-bornage.md"), "utf8"),
  /Ajoutée dans le constructeur, elle reçoit une clé automatique \(par exemple `number_x7k2p9`\)/,
);
assert.match(
  readFileSync(join(blogDir, "funnel-devis-geometre-expert-bornage.md"), "utf8"),
  /Seule une question de clé exactement `surface`, créée par l'API ou les outils MCP/,
);
assert.match(
  readFileSync(join(blogDir, "funnel-devis-architecte-bet.md"), "utf8"),
  /Si vous ajoutez une question de surface \(type Mesure\), une règle/,
);
assert.match(
  readFileSync(join(blogDir, "funnel-devis-architecte-bet.md"), "utf8"),
  /à 30 points, sauf si une question de clé `surface` a été créée par l'API\./,
);
const accord =
  "dans le texte d'aide de la question d'accord (posée en choix visuel, seul type dont l'aide s'affiche),";
assert.ok(readFileSync(join(blogDir, "devis-payant-etude-prealable-b2b.md"), "utf8").includes(accord));
assert.ok(faqSrc.includes(accord));
assert.match(
  readFileSync(join(blogDir, "funnel-devis-usinage-sous-traitance-pieces.md"), "utf8"),
  /la page prospect \(« Compléter la demande »\) accepte les mêmes formats, PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo/,
);
assert.match(
  readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-usinage-sous-traitance-pieces/page.tsx"),
    "utf8",
  ),
  /accepte les mêmes formats, jusqu'à 10 Mo/,
);

const addedSources = [
  "src/lib/marketing/calculateur-roi-salon-professionnel-devis.ts",
  "src/lib/marketing/seo-am-20261016.test.ts",
  "src/components/marketing/calculateur-roi-salon-professionnel-devis-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-roi-salon-professionnel-devis/page.tsx",
  "src/app/(marketing)/secteurs/funnel-devis-agence-web-esn/page.tsx",
  "src/content/blog/salon-professionnel-demandes-devis-b2b.md",
  "src/content/blog/funnel-devis-agence-web-esn.md",
];
assertNoDashes(
  (BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"),
  "salon faq",
);
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-roi-salon-professionnel-devis/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-roi-salon-professionnel-devis/);
assert.match(toolPage, /Calculateur ROI salon professionnel/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /salon-professionnel-demandes-devis-b2b/);
assert.match(toolPage, /\/fonctionnalites\/stats/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /marge brute des commandes signées moins les coûts du salon/);
assert.match(toolPage, /hypothèses d&apos;exemple, pas des moyennes de marché/);
assert.doesNotMatch(toolPage, /\/blog\/espace-prospect-devis-en-ligne/);
assertNoDashes(toolPage, "tool page");

const calculator = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-roi-salon-professionnel-devis-calculator.tsx"),
  "utf8",
);
for (const id of [
  "stand",
  "deplacements",
  "supports",
  "coutJour",
  "personnes",
  "jours",
  "contacts",
  "partAvant",
  "partApres",
  "tauxSignature",
  "panier",
  "marge",
]) {
  assert.match(calculator, new RegExp(`id="${id}"`));
}
assert.match(calculator, /Coûts du salon/);
assert.match(calculator, /Contacts et demandes/);
assert.match(calculator, /Ce que rapporte une demande/);
assert.match(calculator, /Ce que coûte le salon/);
assert.match(calculator, /Aujourd&apos;hui/);
assert.match(calculator, /Avec une demande prise sur le stand/);
assert.match(calculator, /Pour lire vos chiffres/);
assert.match(calculator, /Récapitulatif/);
assert.match(calculator, /label="Copier"/);
assert.match(calculator, /text-emerald-700/);
assert.match(calculator, /text-amber-800/);
assert.match(calculator, /text-rose-700/);
assert.match(calculator, /text-mk-accent/);
assert.match(calculator, /bg-emerald-50 text-emerald-800/);
assert.match(calculator, /hypothèses d&apos;exemple, pas des moyennes de marché/);
assert.match(calculator, /verdictTone === "neutral"/);
assert.doesNotMatch(calculator, /fetch\(|navigator\.sendBeacon/);
assertNoDashes(calculator, "calculator");

const base = { ...ROI_SALON_DEFAULTS };
assert.deepEqual(base, {
  stand: 8000,
  deplacements: 2500,
  supports: 1000,
  coutJour: 400,
  personnes: 3,
  jours: 3,
  contacts: 120,
  partAvant: 15,
  partApres: 30,
  tauxSignature: 20,
  panier: 12000,
  marge: 30,
});

let result = computeRoiSalon(base);
close(result.coutEquipe, 3600);
close(result.coutTotal, 15100);
close(result.coutParContact, 125.833333);
close(result.avant.demandes, 18);
close(result.avant.clients, 3.6);
close(result.avant.ca, 43200);
close(result.avant.margeBrute, 12960);
close(result.avant.resultat, -2140);
close(result.avant.coutParDemande, 838.888889);
close(result.avant.coutParClient, 4194.444444);
close(result.avant.roi, -14.172185);
close(result.apres.demandes, 36);
close(result.apres.clients, 7.2);
close(result.apres.ca, 86400);
close(result.apres.margeBrute, 25920);
close(result.apres.resultat, 10820);
close(result.apres.coutParDemande, 419.444444);
close(result.apres.coutParClient, 2097.222222);
close(result.apres.roi, 71.655629);
close(result.ecartDemandes, 18);
close(result.ecartClients, 3.6);
close(result.ecartMarge, 12960);
close(result.clientsEquilibre, 4.194444);
close(result.demandesEquilibre, 20.97222);
close(result.partEquilibre, 17.47685);
assert.strictEqual(result.verdict.tone, "ok");
assert.strictEqual(
  result.verdict.text,
  `Sur ces hypothèses, le salon rapporte 10${NB}820${NB}€ de marge au-delà de ses coûts (ROI 71,7${NB}%), à condition que 30${NB}% des contacts deviennent une demande de devis.`,
);
assert.strictEqual(result.conseils.length, 3);
assert.strictEqual(
  result.conseils[0],
  `Chaque contact vous coûte 125,83${NB}€ avant toute relance. Un contact jamais rappelé, c'est cette somme perdue.`,
);
assert.strictEqual(
  result.conseils[1],
  `Seuil de rentabilité : 4,2 clients, soit 21 demandes de devis, soit 17,5${NB}% des contacts transformés en demande.`,
);
assert.ok(result.conseils[2]?.startsWith("Dans QuoteBuilder, taguez le lien du QR code avec utm_source=salon"));
const recap = result.recap.split("\n");
assert.strictEqual(recap.length, 7);
assert.strictEqual(
  recap[0],
  `Coûts : stand 8${NB}000${NB}€, déplacements 2${NB}500${NB}€, supports 1${NB}000${NB}€, équipe 3 personnes × 3 jours à 400${NB}€ (3${NB}600${NB}€), total 15${NB}100${NB}€.`,
);
assert.strictEqual(
  recap[1],
  `Hypothèses : 120 contacts (125,83${NB}€ par contact), 20${NB}% des demandes signées, commande moyenne 12${NB}000${NB}€, marge 30${NB}%.`,
);
assert.strictEqual(
  recap[2],
  `Aujourd'hui : 15${NB}% des contacts en demande, 18 demandes, 3,6 clients, marge 12${NB}960${NB}€, résultat -2${NB}140${NB}€ (ROI -14,2${NB}%).`,
);
assert.strictEqual(
  recap[3],
  `Demande prise sur le stand : 30${NB}% des contacts en demande, 36 demandes, 7,2 clients, marge 25${NB}920${NB}€, résultat 10${NB}820${NB}€ (ROI 71,7${NB}%).`,
);
assert.strictEqual(
  recap[4],
  `Coût par demande : 838,89${NB}€ puis 419,44${NB}€ ; par client : 4${NB}194${NB}€ puis 2${NB}097${NB}€.`,
);
assert.strictEqual(recap[5], `Seuil de rentabilité : 4,2 clients, soit 21 demandes ou 17,5${NB}% des contacts.`);
assert.strictEqual(recap[6], "Calcul : quotebuilder.co/outils/calculateur-roi-salon-professionnel-devis");
assert.strictEqual(buildRecap(base), result.recap);

const simple = {
  stand: 1000,
  deplacements: 0,
  supports: 0,
  coutJour: 0,
  personnes: 0,
  jours: 0,
  contacts: 100,
  partAvant: 5,
  partApres: 10,
  tauxSignature: 10,
  marge: 100,
};
const atPanier = (panier: number) => computeRoiSalon({ ...simple, panier });
close(atPanier(1200).apres.roi, 20);
assert.strictEqual(atPanier(1200).verdict.tone, "ok");
close(atPanier(1199.9).apres.roi, 19.99);
assert.strictEqual(atPanier(1199.9).verdict.tone, "warn");
close(atPanier(1000).apres.roi, 0);
assert.strictEqual(atPanier(1000).verdict.tone, "warn");
assert.ok(atPanier(1000).verdict.text.startsWith("Le salon couvre ses coûts de justesse (ROI 0"));
close(atPanier(999.9).apres.roi, -0.01);
assert.strictEqual(atPanier(999.9).verdict.tone, "bad");
assert.ok(atPanier(999.9).verdict.text.startsWith("Sur ces hypothèses, le salon coûte plus qu'il ne rapporte"));
close(atPanier(1000).clientsEquilibre, 1);
close(atPanier(1000).demandesEquilibre, 10);
close(atPanier(1000).partEquilibre, 10);

result = computeRoiSalon({ ...base, stand: 0, deplacements: 0, supports: 0, coutJour: 0 });
assert.strictEqual(result.coutTotal, 0);
assert.strictEqual(result.verdict.tone, "neutral");
assert.strictEqual(result.verdict.text, "Saisissez les coûts du salon pour lancer le calcul.");
assert.strictEqual(result.apres.roi, null);
result = computeRoiSalon({ ...base, contacts: 0 });
assert.strictEqual(result.verdict.tone, "neutral");
assert.strictEqual(result.verdict.text, "Saisissez le nombre de contacts recueillis sur le salon.");
assert.strictEqual(result.coutParContact, null);
assert.strictEqual(result.apres.coutParDemande, null);
assert.strictEqual(result.apres.coutParClient, null);
assert.ok(!result.conseils.some((item) => item.startsWith("Seuil de rentabilité")));
assert.ok(result.recap.includes("0 contact (n/a par contact)"));

result = computeRoiSalon({ ...base, panier: 500 });
close(result.clientsEquilibre, 100.666667);
assert.strictEqual(result.partEquilibre, null);
assert.ok(result.conseils.some((item) => item.includes("Même si tous les contacts devenaient une demande")));
assert.ok(result.recap.includes("hors de portée avec ce nombre de contacts."));
result = computeRoiSalon({ ...base, marge: 0 });
assert.strictEqual(result.clientsEquilibre, null);
assert.strictEqual(result.demandesEquilibre, null);
assert.ok(result.conseils.includes("Sans panier ni marge, aucun nombre de clients ne rembourse le salon."));
assert.ok(result.recap.includes("aucun nombre de clients ne rembourse le salon sur ces hypothèses."));
result = computeRoiSalon({ ...base, tauxSignature: 0 });
assert.strictEqual(result.demandesEquilibre, null);
assert.strictEqual(result.apres.coutParClient, null);

result = computeRoiSalon({ ...base, partAvant: 40, partApres: 70, stand: 1000, deplacements: 0, supports: 0 });
close(result.coutTotal, 4600);
assert.ok(result.conseils.some((item) => item.startsWith("Plus de 60 % des contacts transformés en demande")));
assert.ok(
  result.conseils.some(
    (item) =>
      item ===
      `Le temps de l'équipe représente 78,3${NB}% du coût du salon. Chaque journée sur le stand doit produire des demandes, pas seulement des badges.`,
  ),
);
result = computeRoiSalon({ ...base, partAvant: 30, partApres: 20 });
assert.ok(result.conseils[0]?.startsWith("Vous visez une part de demandes plus basse qu'aujourd'hui."));
result = computeRoiSalon(base);
assert.ok(!result.conseils.some((item) => item.startsWith("Le temps de l'équipe")));

result = computeRoiSalon({ ...base, personnes: 1, jours: 1, contacts: 1 });
assert.ok(result.recap.includes("équipe 1 personne × 1 jour à"));
assert.ok(result.recap.includes("1 contact ("));

result = computeRoiSalon({
  stand: "abc",
  deplacements: -5,
  supports: "",
  coutJour: null,
  personnes: 80,
  jours: 20.9,
  contacts: 12.7,
  partAvant: -10,
  partApres: 150,
  tauxSignature: "x",
  panier: -1,
  marge: 101,
});
assert.strictEqual(result.stand, 0);
assert.strictEqual(result.deplacements, 0);
assert.strictEqual(result.supports, 0);
assert.strictEqual(result.coutJour, 0);
assert.strictEqual(result.personnes, 50);
assert.strictEqual(result.jours, 15);
assert.strictEqual(result.contacts, 12);
assert.strictEqual(result.partAvant, 0);
assert.strictEqual(result.partApres, 100);
assert.strictEqual(result.tauxSignature, 0);
assert.strictEqual(result.panier, 0);
assert.strictEqual(result.marge, 100);
assert.strictEqual(computeRoiSalon({ ...base, personnes: 2.9 }).personnes, 2);

assert.strictEqual(fmtEur(15100), `15${NB}100${NB}€`);
assert.strictEqual(fmtEur(-2140), `-2${NB}140${NB}€`);
assert.strictEqual(fmtEur(125.833333), `125,83${NB}€`);
assert.strictEqual(fmtEur(4194.444), `4${NB}194${NB}€`);
assert.strictEqual(fmtEur(-0.001), `0${NB}€`);
assert.strictEqual(fmtEur(null), "n/a");
assert.strictEqual(fmtNum(17.47685), "17,5");
assert.strictEqual(fmtNum(-14.172185), "-14,2");
assert.strictEqual(fmtNum(null), "n/a");

console.log("seo-am-20261016.test.ts ok");
