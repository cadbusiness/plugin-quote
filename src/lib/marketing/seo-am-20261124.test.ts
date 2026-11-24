import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { articleHtml } from "./article-html";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_REDUCTION_PRIX,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  DEFAULTS,
  LABEL_SETS,
  POINTS,
  SLUG,
  STATUT_LABELS,
  computeReduction,
  dec,
  ent,
  fmtEur,
  fmtNum,
  fmtPct,
  normalize,
  pluriel,
  round2,
} from "./calculateur-reduction-prix-execution-imparfaite";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const FORBIDDEN = /[\u2014\u2013\u2212]/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "reduction-prix-execution-imparfaite-article-1223-devis-b2b";
const BLOG_PATH = "/blog/reduction-prix-execution-imparfaite-article-1223-devis-b2b";
const SECTOR_SLUG = "funnel-devis-elagage-abattage-arbres";
const SECTOR_PATH = "/secteurs/funnel-devis-elagage-abattage-arbres";
const TOOL_PATH = "/outils/calculateur-reduction-prix-execution-imparfaite";
const DAY = "2026-11-24";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];
const TOOL_TITLE = "Calculateur de réduction du prix pour exécution imparfaite";
const TOOL_H1 = "Calculateur de réduction du prix pour exécution imparfaite (article 1223)";
const TOOL_TEXT =
  "Le client baisse la facture pour un défaut : réduction proportionnelle, écart avec sa demande, reste à payer, coût d'une reprise, dix points de l'article 1223, la clause et le courrier.";
const PRIOR_TOOL = "/outils/calculateur-matiere-fournie-rebut-responsabilite";
const PRIOR_SECTOR = "/secteurs/funnel-devis-vitrerie-miroiterie";

type Controle = { id: string; point: string; statut: string; texte: string };
type Reduction = {
  reduction: number;
  reductionLabel: string;
  partLabel: string;
  ecartLabel: string;
  resteLabel: string;
  repriseLabel: string;
  verdict: string;
  etat: string;
  nbOk: number;
  nbWarn: number;
  nbBad: number;
  nbInfo: number;
  incomplet: boolean;
  actions: string[];
  clause: string;
  message: string;
  recap: string;
  controles: Controle[];
  x: { repriseStatut: string; P: number; t: number; q: number; p: number; paid: number };
};
type Norm = {
  P: number;
  paid: number;
  q: number;
  t: number;
  p: number;
  D: number;
  R: number;
  ds: number;
  dr: number;
  clause: string;
};

const run = (overrides: Record<string, string>) => computeReduction({ ...DEFAULTS, ...overrides }) as unknown as Reduction;
const S = (result: Reduction) => result.controles.map((item) => item.statut).join(",");
const T = (result: Reduction, index: number) => result.controles[index].texte;

assert.equal(SLUG, "calculateur-reduction-prix-execution-imparfaite");
assert.equal(BLOG_TOOL_REDUCTION_PRIX, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 38);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.equal(BLOG_POSTS.some((post) => post.slug === SECTOR_SLUG), false);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, TOOL_TITLE);
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, TOOL_TEXT);
assert.ok(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.ok(BLOG_TOOLS.findIndex((item) => item.href === TOOL_PATH) > BLOG_TOOLS.findIndex((item) => item.href === PRIOR_TOOL));

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === SECTOR_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === PRIOR_SECTOR)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.ok(paths.indexOf(BLOG_PATH) > paths.indexOf(PRIOR_TOOL));
assert.ok(paths.indexOf(SECTOR_PATH) > paths.indexOf(BLOG_PATH));
assert.ok(paths.indexOf(TOOL_PATH) > paths.indexOf(SECTOR_PATH));

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "${DAY}"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, DAY);
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
const blogTitle = BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title ?? "";
assert.ok(llms.includes(`${blogTitle} : https://www.quotebuilder.co${BLOG_PATH}`));
assert.ok(llms.includes(`Funnel de devis élagage et abattage d'arbres : https://www.quotebuilder.co${SECTOR_PATH}`));
assert.ok(llms.includes(`${TOOL_H1} : https://www.quotebuilder.co${TOOL_PATH}`));
const priorToolLine = llms.indexOf(`https://www.quotebuilder.co${PRIOR_TOOL}`);
const priorSectorLine = llms.indexOf(`https://www.quotebuilder.co${PRIOR_SECTOR}`);
assert.ok(llms.indexOf(`https://www.quotebuilder.co${BLOG_PATH}`) > priorToolLine);
assert.ok(llms.indexOf(`https://www.quotebuilder.co${TOOL_PATH}`) > llms.indexOf(`https://www.quotebuilder.co${BLOG_PATH}`));
assert.ok(llms.indexOf(`https://www.quotebuilder.co${SECTOR_PATH}`) > priorSectorLine);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.ok(outilsHub.includes("calculateur-reduction-prix-execution-imparfaite"));
assert.ok(outilsHub.includes(TOOL_TITLE));
assert.ok(outilsHub.includes(TOOL_TEXT));
assert.ok(outilsHub.includes("calculateur de réduction du prix pour exécution imparfaite"));
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-reduction-prix-execution-imparfaite"');
  assert.ok(start > outilsHub.indexOf('href: "/outils/calculateur-matiere-fournie-rebut-responsabilite"'));
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
assert.ok(outilsHub.includes("outilsHubIntro()"));

const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes(SECTOR_PATH));
assert.ok(secteursHub.includes("Élagage et abattage"));
assert.ok(secteursHub.indexOf(SECTOR_PATH) > secteursHub.indexOf(PRIOR_SECTOR));

assert.equal(BLOG_TOOLS.length, 100);
assert.equal(BLOG_POSTS.length, 110);
assert.equal(outilsHubIntro(), "Cent outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(100), outilsHubIntro());
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

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
        a: part.slice(nl + 1).trim().replace(/\s+/g, " "),
      };
    });
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
  assert.equal(FORBIDDEN.test(text), false, `${label} has a long dash or typographic minus`);
}

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  const blogBody = stripFrontmatter(blogRaw);
  const title = blogRaw.match(/^title: "([\s\S]*?)"$/m)?.[1];
  const description = blogRaw.match(/^description: "([\s\S]*?)"$/m)?.[1];
  assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title, title);
  assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description, description);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertNoDashes(blogRaw, "blog md");
  assertInternalLinks(blogBody, "blog");
  const norm = blogBody.replace(/[\u00a0\u202f]/g, " ");
  for (const needle of [
    "1223",
    "1217",
    "1344",
    "1170",
    "1171",
    "1644",
    "L442-1",
    "24-14.750",
    "23-10.288",
    "7 400",
    "1 480",
    "266,40",
    "4 913,60",
    "hypothèses d'exemple",
    "non contractuel",
    "Gagné",
    "Plan (PDF ou image)",
    "/outils/calculateur-reduction-prix-execution-imparfaite",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(norm.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.doesNotMatch(blogBody, /24-14\.752/);
  const html = articleHtml(blogBody);
  assert.ok((html.match(/<table/g) ?? []).length >= 4, "markdown tables");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const pageSrc = readFileSync(join(process.cwd(), `src/app/(marketing)/secteurs/${SECTOR_SLUG}/page.tsx`), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  const fromMd = faqFromMarkdown(sectorBody);
  const questions = [...pageSrc.matchAll(/\bq: "([^"]*)"/g)].map((match) => match[1]);
  const answers = [...pageSrc.matchAll(/\ba: "([^"]*)"/g)].map((match) => match[1]);
  assert.equal(questions.length, 10);
  assert.deepEqual(fromMd, questions.map((q, index) => ({ q, a: answers[index] })));
  assertNoDashes(sectorRaw, "sector md");
  assertNoDashes(pageSrc, "sector page");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(pageSrc.includes('about: "Élagage et abattage d\'arbres"'));
  assert.ok(pageSrc.includes("Secteur · Élagage et abattage"));
  assert.ok(pageSrc.includes('title="Essayer gratuitement"'));
  assert.ok(pageSrc.includes("QuoteBuilder n'a pas de template élagage ou arboriculture : partez de Paysagiste."));
  for (const href of [
    "/blog/mention-dechets-devis-travaux-bordereau-depot-b2b",
    "/outils/verificateur-mention-dechets-devis-travaux",
    "/secteurs/funnel-devis-paysagiste-amenagement-jardin",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(pageSrc.includes(href), href);
  }
  const norm = sectorBody.replace(/[\u00a0\u202f]/g, " ");
  for (const needle of [
    "Paysagiste",
    "Funnel jardin",
    "Plan (PDF ou image)",
    "673",
    "R421-23",
    "L411-1",
    "R554-1",
    "R4323-64",
    "15 mars",
    "31 juillet",
    "Warm",
    "Cold",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(norm.includes(needle), `sector missing ${needle}`);
  }
  assert.doesNotMatch(sectorBody, /R4534-108/);
}

const templates = readFileSync(join(process.cwd(), "src/lib/funnels/templates.ts"), "utf8");
assert.ok(templates.includes('id: "garden"'));
assert.ok(templates.includes('label: "Paysagiste"'));
assert.ok(templates.includes('key: "usage"'));
assert.ok(templates.includes('key: "surface"'));
assert.ok(templates.includes('key: "upkeep"'));
assert.ok(readFileSync(join(process.cwd(), "src/lib/quotes/score.ts"), "utf8").includes("surface"));
const builder = readFileSync(join(process.cwd(), "src/lib/funnels/builder.ts"), "utf8");
assert.ok(builder.includes("Texte"));
assert.ok(builder.includes("Liste"));
assert.ok(builder.includes("Mesure"));
assert.ok(builder.includes("Choix multiple"));
assert.ok(builder.includes("Fichier"));
assert.equal(builder.includes("date"), false);
const seed = readFileSync(join(process.cwd(), "src/lib/crm/seed.ts"), "utf8");
assert.ok(seed.includes("Gagné"));
assert.ok(seed.includes("Perdu"));
assert.ok(seed.includes("En attente"));
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);

const added = [
  "src/lib/marketing/calculateur-reduction-prix-execution-imparfaite.ts",
  "src/components/marketing/calculateur-reduction-prix-execution-imparfaite-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-reduction-prix-execution-imparfaite/page.tsx",
  `src/app/(marketing)/secteurs/${SECTOR_SLUG}/page.tsx`,
  "src/lib/marketing/seo-am-20261124.test.ts",
  `src/content/blog/${BLOG_SLUG}.md`,
  `src/content/blog/${SECTOR_SLUG}.md`,
];
for (const rel of added) assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);

const pageSrc = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-reduction-prix-execution-imparfaite/page.tsx"),
  "utf8",
);
const componentSrc = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-reduction-prix-execution-imparfaite-calculator.tsx"),
  "utf8",
);
assert.ok(pageSrc.includes(TOOL_PATH));
assert.ok(pageSrc.includes(TOOL_H1));
assert.ok(pageSrc.includes("pas un conseil juridique"));
assert.ok(pageSrc.includes("Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."));
assert.ok(pageSrc.includes("Calcul local, aucune donnée envoyée."));
assert.ok(pageSrc.includes("ventes aux consommateurs"));
assert.ok(pageSrc.includes("marchés publics"));
assert.ok(pageSrc.includes("droit étranger"));
assert.ok(pageSrc.includes("vices cachés (article 1644)"));
assert.ok(pageSrc.includes("décennale"));
assert.ok(pageSrc.includes("biennale"));
assert.ok(pageSrc.includes("procédure collective du client"));
assert.ok(pageSrc.includes("traitement fiscal de l'avoir"));
assert.equal(pageSrc.includes('type="date"'), false);
assert.equal(componentSrc.includes('type="date"'), false);
assert.ok(componentSrc.includes("lus le 24 novembre 2026"));
assert.ok(componentSrc.includes("24-14.750"));
assert.ok(componentSrc.includes("23-10.288"));
assert.ok(componentSrc.includes("Lectures retenues"));
assert.ok(componentSrc.includes("Cas non traités"));
assert.equal((componentSrc.match(/<CopyButton /g) ?? []).length, 3);
assert.doesNotMatch(pageSrc, /\/blog\/espace-prospect-devis-en-ligne/);
assert.doesNotMatch(componentSrc, /\/blog\/espace-prospect-devis-en-ligne/);
for (const href of [
  "/blog/reduction-prix-execution-imparfaite-article-1223-devis-b2b",
  "/blog/exception-inexecution-devis-b2b",
  "/blog/reception-travaux-proces-verbal-reserves-devis-b2b",
  "/blog/compensation-creances-deduction-facture-devis-b2b",
  "/outils/verificateur-exception-inexecution",
  "/signup?plan=free",
  "/c/demo/rayonnage",
  "/tarifs",
]) {
  assert.ok(pageSrc.includes(href), href);
}
for (const label of [
  "Le contrat et le prix",
  "Date de conclusion du contrat",
  "Ce que dit votre devis sur les défauts",
  "Prix total de la prestation (€ HT)",
  "Déjà payé par le client (€ HT)",
  "Acomptes et règlements reçus.",
  "Coût d'une reprise pour vous (€ HT, 0 si inconnu)",
  "Le défaut",
  "Éléments livrés (pièces, mètres, jours)",
  "Éléments touchés par le défaut",
  "Le nombre constaté, pas celui annoncé.",
  "Perte de valeur des éléments touchés (%)",
  "100 % si l'élément est perdu.",
  "Gravité du défaut",
  "Preuve du défaut",
  "Signalement du défaut",
  "Reprise",
  "Ce que le client a fait, et votre réponse",
  "Mise en demeure de corriger",
  "Notification de la réduction",
  "Réduction annoncée par le client (€ HT, 0 si aucune)",
  "Votre réponse",
  "Pour la clause de vos prochains devis",
  "Délai de signalement des défauts (jours)",
  "Délai de reprise après constat (jours ouvrés)",
  "Le résultat",
  "Réduction proportionnelle",
  "Part des éléments touchés",
  "Écart avec la demande du client",
  "Reste à payer après réduction",
  "Reprise ou réduction",
  "Points bloquants / à revoir",
  "Le contrôle point par point",
  "La clause à écrire dans vos devis",
  "Ce qu'il faut faire",
  "Le courrier au client",
  "Récapitulatif",
]) {
  assert.ok(componentSrc.includes(label), label);
}

assert.equal(Object.keys(DEFAULTS).length, 18);
assert.equal(POINTS.length, 10);
assert.equal(Object.keys(LABEL_SETS).length, 9);
assert.deepEqual(STATUT_LABELS, { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" });
assert.equal(fmtNum(1234.5), "1 234,50");
assert.equal(fmtNum(266.40000000000003), "266,40");
assert.equal(fmtNum(7400), "7 400");
assert.equal(fmtNum(-3.2), "-3,20");
assert.equal(fmtNum(0.999), "1");
assert.equal(fmtNum(1234567.891), "1 234 567,89");
assert.equal(fmtEur(4913.6), "4 913,60 €");
assert.equal(fmtPct(9), "9 %");
assert.equal(fmtPct(12.5), "12,50 %");
assert.equal(pluriel(1, "jour", "jours"), "1 jour");
assert.equal(pluriel(2, "jour", "jours"), "2 jours");
assert.equal(pluriel(0, "bloquant", "bloquants"), "0 bloquant");
assert.equal(pluriel(3, "jour ouvré", "jours ouvrés"), "3 jours ouvrés");
assert.equal(dec("1 480,50"), 1480.5);
assert.ok(Number.isNaN(dec("abc")));
assert.ok(Number.isNaN(dec("")));
assert.ok(Number.isNaN(dec(null)));
assert.equal(ent("36.9"), 36);
assert.equal(round2(266.40000000000003), 266.4);

const n0 = normalize({}) as unknown as Norm;
assert.equal(n0.P, 7400);
assert.equal(n0.paid, 2220);
assert.equal(n0.q, 400);
assert.equal(n0.t, 36);
assert.equal(n0.p, 40);
assert.equal(n0.D, 1480);
assert.equal(n0.R, 620);
assert.equal(n0.ds, 8);
assert.equal(n0.dr, 15);
assert.equal((normalize({ ...DEFAULTS, touches: "900" }) as unknown as Norm).t, 400);
assert.equal((normalize({ ...DEFAULTS, paye: "9000" }) as unknown as Norm).paid, 7400);
assert.equal((normalize({ ...DEFAULTS, perte: "150" }) as unknown as Norm).p, 100);
assert.equal((normalize({ ...DEFAULTS, perte: "-5" }) as unknown as Norm).p, 0);
assert.equal((normalize({ ...DEFAULTS, clause: "bidon" }) as unknown as Norm).clause, "aucune");
assert.equal((normalize({ ...DEFAULTS, delaiSignal: "0" }) as unknown as Norm).ds, 8);
assert.equal((normalize({ ...DEFAULTS, delaiReprise: "abc" }) as unknown as Norm).dr, 15);
assert.equal((normalize({ ...DEFAULTS, quantite: "0" }) as unknown as Norm).q, 0);

const d = run({});
assert.equal(d.reduction, 266.4);
assert.equal(d.reductionLabel, "266,40 € HT");
assert.equal(d.partLabel, "36 sur 400 (9 %)");
assert.equal(d.ecartLabel, "Le client demande 1 213,60 € HT de plus");
assert.equal(d.resteLabel, "4 913,60 € HT");
assert.equal(d.repriseLabel, "La reprise vous coûte 353,60 € HT de plus que la réduction");
assert.equal(S(d), "ok,info,ok,warn,ok,ok,ok,ok,bad,warn");
assert.deepEqual([d.nbOk, d.nbWarn, d.nbBad, d.nbInfo], [6, 2, 1, 1]);
assert.equal(d.etat, "bad");
assert.equal(d.verdict, "Réduction contestable en l'état : 1 point bloquant, 2 points à revoir.");
assert.ok(T(d, 8).startsWith("La demande représente 5,6 fois la réduction proportionnelle"));
assert.ok(T(d, 7).includes("5 180 € HT"));
assert.equal(d.actions.length, 5);
assert.ok(d.actions[0].startsWith("Proposez un constat contradictoire"));
assert.equal(
  d.actions[1],
  "Répondez avec votre calcul : éléments touchés 36 sur 400, perte de valeur de 40 %, soit 266,40 € HT au lieu de 1 480 € HT.",
);
assert.ok(d.actions[d.actions.length - 1].startsWith("Gardez dans le dossier"));
const clauseLines = d.clause.split("\n");
assert.equal(clauseLines.length, 9);
assert.equal(clauseLines[0], "Défauts constatés et réduction du prix");
assert.ok(clauseLines[1].includes("8 jours") && clauseLines[3].includes("15 jours ouvrés"));
assert.ok(d.message.includes("1 480 € HT"));
assert.ok(d.message.includes("36 des 400 éléments livrés (9 %)"));
assert.ok(d.message.includes("1 213,60 € HT"));
assert.ok(d.message.includes("4 913,60 € HT"));
assert.ok(d.message.startsWith("Objet : votre décision de réduction du prix"));
assert.ok(d.message.endsWith("Cordialement,"));
const recapLines = d.recap.split("\n");
assert.equal(recapLines.length, 11);
assert.equal(recapLines[9], "Contrôle : 6 conformes, 2 à revoir, 1 bloquant, 1 information");
assert.equal(recapLines[10], "Calcul : quotebuilder.co/outils/" + SLUG);
assert.equal(recapLines[4], "Réduction proportionnelle : 266,40 € HT");

const ok = run({ preuve: "constat", demande: "266.40", accord: "ecrit", clause: "procedure" });
assert.equal(S(ok), "ok,ok,ok,ok,ok,ok,ok,ok,ok,ok");
assert.equal(ok.verdict, "Dossier en ordre : la réduction peut être réglée sur la base du calcul proportionnel.");
assert.equal(ok.etat, "ok");
assert.equal(ok.ecartLabel, "Aucun écart");
assert.ok(ok.actions.some((item) => item.startsWith("Émettez un avoir")));
assert.equal(ok.actions.some((item) => item.startsWith("Ajoutez à vos prochains devis")), false);
assert.ok(T(ok, 1).includes("8 jours") && T(ok, 1).includes("15 jours ouvrés"));

const slightly = run({ preuve: "constat", demande: "350", accord: "ecrit", clause: "procedure" });
assert.equal(slightly.controles[8].statut, "warn");
assert.equal(slightly.verdict, "Pas de point bloquant, 1 point à revoir.");
assert.ok(T(slightly, 8).includes("83,60 € HT"));

const noNotice = run({ miseEnDemeure: "aucune" });
assert.equal(noNotice.controles[4].statut, "bad");
assert.ok(noNotice.actions.some((item) => item.startsWith("Rappelez au client que l'article 1223 exige une mise en demeure")));
assert.equal(noNotice.verdict, "Réduction contestable en l'état : 2 points bloquants, 2 points à revoir.");

assert.equal(run({ dateContrat: "avant2016" }).controles[0].statut, "bad");
assert.ok(T(run({ dateContrat: "avant2016" }), 0).includes("23-10.288"));
assert.equal(run({ dateContrat: "entre" }).controles[0].statut, "warn");
assert.ok(run({ dateContrat: "entre" }).actions[0].startsWith("Faites vérifier le texte applicable"));

const repaired = run({ repriseStatut: "faite" });
assert.equal(repaired.reduction, 0);
assert.equal(repaired.reductionLabel, "Aucune : le défaut est corrigé");
assert.equal(repaired.repriseLabel, "Reprise faite : pas de réduction pour ce défaut");
assert.equal(repaired.controles[5].statut, "bad");
assert.equal(repaired.controles[8].statut, "bad");
assert.ok(repaired.message.includes("nous ne pouvons pas accepter de réduction du prix pour ce défaut"));
assert.equal(repaired.resteLabel, "5 180 € HT");

const paid = run({ paye: "7400" });
assert.equal(paid.controles[7].statut, "warn");
assert.ok(T(paid, 7).includes("troisième alinéa"));
assert.equal(paid.resteLabel, "Trop payé de 266,40 € HT : remboursement par accord ou décision du juge");
assert.ok(paid.actions.some((item) => item.startsWith("Tout est payé")));
assert.ok(paid.message.includes("à vous rembourser 266,40 € HT"));

const overRest = run({ paye: "7000" });
assert.equal(overRest.controles[7].statut, "warn");
assert.ok(T(overRest, 7).includes("400 € HT") && T(overRest, 7).includes("1 080 € HT"));

assert.equal(run({ preuve: "aucune" }).controles[3].statut, "bad");
assert.equal(run({ preuve: "constat", reception: "sansreserve" }).controles[3].statut, "warn");
assert.ok(T(run({ preuve: "constat", reception: "sansreserve" }), 3).includes("1792-6"));

const noneTouched = run({ touches: "0" });
assert.equal(noneTouched.reductionLabel, "Aucun élément touché");
assert.equal(noneTouched.controles[3].statut, "info");
assert.equal(noneTouched.controles[8].statut, "bad");
assert.ok(noneTouched.message.includes("aucun élément défectueux n'a été constaté"));

const noDemand = run({ demande: "0" });
assert.equal(noDemand.ecartLabel, "Pas de réduction annoncée");
assert.equal(noDemand.controles[8].statut, "info");
assert.ok(T(noDemand, 8).includes("266,40 € HT"));
assert.ok(noDemand.message.startsWith("Objet : votre décision de réduction du prix\n\nNous revenons vers vous"));

const incomplete = run({ quantite: "0" });
assert.equal(incomplete.reductionLabel, "À renseigner");
assert.equal(incomplete.partLabel, "À renseigner");
assert.equal(incomplete.resteLabel, "À renseigner");
assert.equal(run({ prix: "0" }).reductionLabel, "À renseigner");

const totalLoss = run({ perte: "100", gravite: "inutilisable" });
assert.equal(totalLoss.reduction, 666);
assert.equal(totalLoss.controles[2].statut, "warn");
assert.ok(totalLoss.actions.some((item) => item.startsWith("Proposez une reprise ou un remplacement")));

assert.equal(run({ reprise: "100" }).repriseLabel, "La reprise vous coûte 166,40 € HT de moins que la réduction");
assert.equal(run({ reprise: "0" }).repriseLabel, "Coût de reprise non renseigné");
assert.equal(run({ reprise: "266.4" }).repriseLabel, "Même coût que la réduction");

const noRepair = run({ repriseStatut: "aucune" });
assert.equal(noRepair.controles[5].statut, "warn");
assert.ok(noRepair.actions.some((item) => item.startsWith("Comparez la reprise (620 € HT)")));
assert.ok(noRepair.message.includes("sous 15 jours ouvrés"));

assert.equal(run({ clause: "exclusion" }).controles[1].statut, "warn");
assert.ok(T(run({ clause: "exclusion" }), 1).includes("1170") && T(run({ clause: "exclusion" }), 1).includes("1171"));
assert.equal(run({ accord: "refus" }).controles[9].statut, "info");
assert.ok(T(run({ accord: "refus" }), 9).includes("24-14.750"));

assert.equal(run({ notification: "tardive" }).controles[6].statut, "warn");
assert.equal(run({ notification: "orale" }).controles[6].statut, "warn");
assert.equal(run({ notification: "aucune" }).controles[6].statut, "info");
assert.equal(run({ miseEnDemeure: "orale" }).controles[4].statut, "warn");

const oneDay = run({ delaiSignal: "1", delaiReprise: "1", clause: "procedure" });
assert.ok(oneDay.clause.includes("délai de 1 jour après") && oneDay.clause.includes("délai de 1 jour ouvré à compter"));
assert.equal(run({ demande: "200" }).ecartLabel, "Le client demande 66,40 € HT de moins");
assert.equal(run({ demande: "200" }).controles[8].statut, "ok");
assert.ok(run({ quantite: "1", touches: "1" }).message.includes("l'élément livré (100 %)"));

const bads = /NaN|undefined|\bnull\b|Infinity/;
const STAT = new Set(["ok", "warn", "bad", "info"]);
const nums = [
  { prix: "7400", paye: "2220", quantite: "400", touches: "36", perte: "40", demande: "1480", reprise: "620" },
  { prix: "0", paye: "0", quantite: "0", touches: "0", perte: "0", demande: "0", reprise: "0" },
  { prix: "1000", paye: "1000", quantite: "1", touches: "1", perte: "100", demande: "5000", reprise: "10" },
  { prix: "12345.67", paye: "99999", quantite: "7", touches: "3", perte: "33.3", demande: "abc", reprise: "-4" },
  { prix: "500", paye: "0", quantite: "10", touches: "20", perte: "50", demande: "260", reprise: "250" },
  { prix: "1e3", paye: "", quantite: "3.7", touches: "1", perte: "", demande: "333.33", reprise: "333.33" },
];
const keys = Object.keys(LABEL_SETS);
const lists = keys.map((key) => Object.keys(LABEL_SETS[key as keyof typeof LABEL_SETS]));
let combos = 0;
const walk = (index: number, acc: Record<string, string>) => {
  if (index === keys.length) {
    for (const nb of nums) {
      for (const ds of ["8", "1"]) {
        const result = computeReduction({ ...DEFAULTS, ...acc, ...nb, delaiSignal: ds }) as unknown as Reduction;
        combos += 1;
        const all = [
          result.reductionLabel,
          result.partLabel,
          result.ecartLabel,
          result.resteLabel,
          result.repriseLabel,
          result.verdict,
          result.clause,
          result.message,
          result.recap,
          ...result.actions,
          ...result.controles.map((item) => item.texte),
        ];
        for (const value of all) {
          assert.equal(typeof value, "string");
          assert.ok(value.length > 0);
          assert.equal(bads.test(value), false, value);
          assert.equal(FORBIDDEN.test(value), false, value);
        }
        assert.equal(result.controles.length, 10);
        result.controles.forEach((item, itemIndex) => {
          assert.ok(STAT.has(item.statut));
          assert.equal(item.id, POINTS[itemIndex].id);
          assert.equal(item.point, POINTS[itemIndex].label);
        });
        assert.equal(result.nbOk + result.nbWarn + result.nbBad + result.nbInfo, 10);
        assert.equal(result.etat, result.nbBad > 0 ? "bad" : result.nbWarn > 0 ? "warn" : "ok");
        if (result.nbBad > 0) assert.ok(result.verdict.startsWith("Réduction contestable en l'état : "));
        else if (result.nbWarn > 0) assert.ok(result.verdict.startsWith("Pas de point bloquant, "));
        else assert.ok(result.verdict.startsWith("Dossier en ordre"));
        assert.equal(result.recap.split("\n").length, 11);
        assert.equal(result.clause.split("\n").length, 9);
        assert.ok(result.actions.length >= 1);
        assert.ok(result.actions[result.actions.length - 1].startsWith("Gardez dans le dossier"));
        assert.ok(result.message.startsWith("Objet : "));
        assert.ok(result.message.endsWith("Cordialement,"));
        assert.ok(Number.isFinite(result.reduction) && result.reduction >= 0);
        if (!result.incomplet && result.x.repriseStatut !== "faite") {
          assert.ok(Math.abs(result.reduction - round2(result.x.P * (result.x.t / result.x.q) * result.x.p / 100)) < 1e-9);
        }
        assert.ok(result.reduction <= result.x.P + 1e-9);
        assert.ok(result.x.t <= result.x.q && result.x.paid <= result.x.P);
        assert.equal(
          result.recap.split("\n")[9],
          "Contrôle : " +
            pluriel(result.nbOk, "conforme", "conformes") +
            ", " +
            result.nbWarn +
            " à revoir, " +
            pluriel(result.nbBad, "bloquant", "bloquants") +
            ", " +
            pluriel(result.nbInfo, "information", "informations"),
        );
      }
    }
    return;
  }
  for (const value of lists[index]) {
    acc[keys[index]] = value;
    walk(index + 1, acc);
  }
};
walk(0, {});
assert.ok(combos > 100000, `combos ${combos}`);
