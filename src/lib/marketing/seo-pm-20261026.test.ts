import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_COEFFICIENT,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  ARRONDIS,
  BENEF_TABLE,
  DEFAULTS,
  MARQUE_TABLE,
  arrondirPrix,
  buildRecap,
  coefficientVente,
  computeCoefficient,
  fmtCoef,
  fmtEur,
  fmtHt,
  fmtNum,
  fmtPct,
  margeVersMarque,
  marqueVersMarge,
  prixDeVente,
  type CoefficientInput,
} from "./calculateur-coefficient-vente-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "prix-vente-coefficient-debourse-sec-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const TOOL_PATH = "/outils/calculateur-coefficient-vente-devis";
const DAY = "2026-10-26";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_COEFFICIENT, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Calculer le prix de vente d'un devis B2B : déboursé sec, frais généraux, coefficient, taux de marge et taux de marque",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Partir du déboursé sec, ajouter la juste part des frais généraux et un bénéfice, en tirer un coefficient de vente : la méthode pas à pas pour chiffrer un devis B2B sans se tromper de base. La différence entre taux de marge et taux de marque selon l'Insee, l'erreur du pourcentage ajouté au coût, le prix plancher, ce que disent la liberté des prix (L410-2), la revente à perte (L442-5), l'article 1165 du Code civil et le marché à forfait (1793), un exemple chiffré et ce que QuoteBuilder fait, ou pas.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.produits);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 22);
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

assert.equal(BLOG_POSTS.length, 68);
assert.equal(BLOG_TOOLS.length, 58);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Calculateur de coefficient de vente");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["catalogue"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Du déboursé sec au prix de vente HT : coefficient, taux de marque et taux de marge, prix plancher et bénéfice réel au prix que vous envisagez.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-huit outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-huit outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(58), outilsHubIntro());
assert.equal(outilsHubIntro(57), "Cinquante-sept outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
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
  /Calculer le prix de vente d'un devis B2B : déboursé sec, frais généraux, coefficient, taux de marge et taux de marque : https:\/\/www\.quotebuilder\.co\/blog\/prix-vente-coefficient-debourse-sec-devis-b2b/,
);
assert.match(
  llms,
  /Calculateur de coefficient de vente : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-coefficient-vente-devis/,
);
const llmsLines = llms.split("\n");
const blogLine = llmsLines.findIndex((line) => line.includes(BLOG_PATH));
const toolLine = llmsLines.findIndex((line) => line.includes(TOOL_PATH));
const previousBlog = llmsLines.findIndex((line) => line.includes("/blog/reconduction-tacite-preavis-resiliation-devis-b2b"));
const previousTool = llmsLines.findIndex((line) => line.includes("/outils/calculateur-preavis-reconduction-tacite"));
const tarifsLine = llmsLines.findIndex((line) => line.includes("https://www.quotebuilder.co/tarifs"));
const cguLine = llmsLines.findIndex((line) => line.includes("/legal/cgu"));
assert.ok(blogLine > tarifsLine, "article llms avec les articles");
assert.ok(blogLine < previousBlog, "article le plus récent en tête des articles");
assert.ok(toolLine > blogLine, "outil llms avec les outils");
assert.ok(toolLine > previousTool && toolLine < cguLine, "outil en fin de liste");

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /calculateur-coefficient-vente-devis/);
assert.match(outilsHub, /Calculateur de coefficient de vente/);
assert.match(outilsHub, /calculateur de coefficient de vente/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-coefficient-vente-devis"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 420), /eyebrow: "Pilotage"/);
}

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

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(
    blogBody.startsWith(
      "# Calculer le prix de vente d'un devis B2B : déboursé sec, frais généraux, coefficient, taux de marge et taux de marque",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  for (const needle of [
    "L410-2",
    "L442-5",
    "2025-337",
    "0,4 %",
    "L420-5",
    "1165",
    "1169",
    "1793",
    "21-25.386",
    "96-20.671",
    "98-12.607",
    "c1774",
    "c2224",
    "c1574",
    "hypothèses d'exemple",
    "à adapter",
    "5 716",
    "7 621,33",
    "6 970,73",
    "7 145",
    "non contractuel",
    "Sur devis",
    "Prix fixe",
    "Fourchette",
    "/outils/calculateur-coefficient-vente-devis",
    "/blog/remise-commerciale-marge-devis-b2b",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.equal(blogBody.includes("75 000"), false);
  assert.match(blogBody, /signup\?plan=free/);
  assertNoDashes(blogRaw, "coefficient md");
  assertNoDashes(blogBody, "coefficient body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 5177);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "coefficient");
  const title = blogRaw.match(/^title: "(.+)"$/m)?.[1];
  const description = blogRaw.match(/^description: "(.+)"$/m)?.[1];
  assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title, title);
  assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description, description);
}

const pdf = readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8");
assert.match(pdf, /Document indicatif, non contractuel/);
const productDialog = readFileSync(join(process.cwd(), "src/components/catalog/create-product-dialog.tsx"), "utf8");
assert.match(productDialog, /Sur devis/);

const addedSources = [
  "src/lib/marketing/calculateur-coefficient-vente-devis.ts",
  "src/lib/marketing/seo-pm-20261026.test.ts",
  "src/components/marketing/calculateur-coefficient-vente-devis-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-coefficient-vente-devis/page.tsx",
  "src/content/blog/prix-vente-coefficient-debourse-sec-devis-b2b.md",
];
assertNoDashes((BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"), "coefficient faq");
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-coefficient-vente-devis/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-coefficient-vente-devis/);
assert.match(toolPage, /Calculateur de coefficient de vente et de prix de vente HT \(devis B2B\)/);
assert.match(toolPage, /ne remplace pas un conseil comptable ou juridique/);
assert.match(toolPage, /L442-5/);
assert.match(toolPage, /prix de vente HT/);
assert.match(toolPage, /taux de marque/);
assert.match(toolPage, /taux de marge/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /\/blog\/prix-vente-coefficient-debourse-sec-devis-b2b/);
assert.match(toolPage, /\/blog\/remise-commerciale-marge-devis-b2b/);
assert.match(toolPage, /\/outils\/calculateur-seuil-remise-marge/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /\/signup\?plan=free/);
assert.doesNotMatch(toolPage, /\/blog\/espace-prospect-devis-en-ligne/);
assertNoDashes(toolPage, "outil page");

const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-coefficient-vente-devis-calculator.tsx"),
  "utf8",
);
assert.match(
  toolUi,
  /hypothèses d'exemple, pas des taux de frais généraux, des marges ou des coûts horaires d'une profession/,
);
assert.match(toolUi, /Le déboursé sec/);
assert.match(toolUi, /Frais généraux et bénéfice/);
assert.match(toolUi, /Votre devis/);
assert.match(toolUi, /Le prix de vente/);
assert.match(toolUi, /Le prix que vous envisagez/);
assert.match(toolUi, /Le coefficient selon le bénéfice visé/);
assert.match(toolUi, /Taux de marque, taux de marge : la correspondance/);
assert.match(toolUi, /Pour lire vos chiffres/);
assert.match(toolUi, /Récapitulatif/);
assert.match(toolUi, /label="Copier"/);
assert.match(toolUi, /bg-orange-50/);
assert.match(toolUi, /bg-amber-50/);
assert.match(toolUi, /bg-emerald-50/);
assert.match(toolUi, /value=\{arrondi\}/);
assert.doesNotMatch(toolUi, /fetch\(/);
assertNoDashes(toolUi, "outil ui");

const toolLogic = readFileSync(join(process.cwd(), "src/lib/marketing/calculateur-coefficient-vente-devis.ts"), "utf8");
assert.doesNotMatch(toolLogic, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket/);
assertNoDashes(toolLogic, "outil logic");

assert.deepStrictEqual(BENEF_TABLE, [0, 3, 5, 7, 10, 12, 15]);
assert.deepStrictEqual(MARQUE_TABLE, [10, 15, 20, 25, 30, 35, 40, 50]);
assert.deepStrictEqual(ARRONDIS, [1, 10, 50, 100]);
assert.deepStrictEqual(DEFAULTS, {
  achats: 4200,
  autresFrais: 300,
  heures: 32,
  tauxHoraire: 38,
  fraisGeneraux: 18,
  benefice: 7,
  prixEnvisage: 7500,
  arrondi: 10,
});

assert.strictEqual(fmtEur(7621.33), `7${NB}621,33${NB}€`);
assert.strictEqual(fmtEur(434), `434${NB}€`);
assert.strictEqual(fmtEur(-386), `-386${NB}€`);
assert.strictEqual(fmtHt(7630), `7${NB}630${NB}€ HT`);
assert.strictEqual(fmtPct(33.333333), `33,33${NB}%`);
assert.strictEqual(fmtPct(25), `25${NB}%`);
assert.strictEqual(fmtPct(8.640498), `8,64${NB}%`);
assert.strictEqual(fmtNum(1234567.5), `1${NB}234${NB}567,5`);
assert.strictEqual(fmtCoef(1.333333), "1,333");
assert.strictEqual(fmtCoef(2), "2,000");
assert.strictEqual(fmtCoef(1.219512), "1,220");
assert.strictEqual(fmtCoef(null), "n/a");

assert.strictEqual(coefficientVente(18, 7), 1.333333);
assert.strictEqual(coefficientVente(0, 0), 1);
assert.strictEqual(coefficientVente(60, 40), null);
assert.strictEqual(coefficientVente(70, 40), null);
assert.strictEqual(prixDeVente(5716, 18, 7), 7621.33);
assert.strictEqual(prixDeVente(5716, 18, 0), 6970.73);
assert.strictEqual(prixDeVente(0, 18, 7), null);
assert.strictEqual(prixDeVente(100, 50, 50), null);
assert.strictEqual(marqueVersMarge(25), 33.333333);
assert.strictEqual(marqueVersMarge(20), 25);
assert.strictEqual(marqueVersMarge(50), 100);
assert.strictEqual(marqueVersMarge(100), null);
assert.strictEqual(margeVersMarque(25), 20);
assert.strictEqual(margeVersMarque(100), 50);
assert.strictEqual(margeVersMarque(33.333333), 25);
const close = (a: number, b: number, eps = 1e-4) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
for (const t of [10, 15, 20, 25, 30, 35, 40, 50]) {
  const marge = marqueVersMarge(t);
  assert.ok(marge != null);
  const back = margeVersMarque(marge);
  assert.ok(back != null);
  close(back, t, 1e-5);
}
assert.strictEqual(arrondirPrix(7621.33, 10), 7630);
assert.strictEqual(arrondirPrix(7621.33, 1), 7622);
assert.strictEqual(arrondirPrix(7621.33, 50), 7650);
assert.strictEqual(arrondirPrix(7621.33, 100), 7700);
assert.strictEqual(arrondirPrix(7600, 100), 7600);
assert.strictEqual(arrondirPrix(null, 10), null);

const run = (o: CoefficientInput = {}) => computeCoefficient({ ...DEFAULTS, ...o });

const d = run({});
assert.strictEqual(d.valide, true);
assert.strictEqual(d.mainOeuvre, 1216);
assert.strictEqual(d.deboursSec, 5716);
assert.strictEqual(d.coefficient, 1.333333);
close(d.prixExact ?? Number.NaN, 5716 / 0.75, 0.01);
assert.strictEqual(d.prixExact, 7621.33);
assert.strictEqual(d.prixArrondi, 7630);
assert.strictEqual(d.fraisGenerauxEur, 1371.84);
assert.strictEqual(d.beneficeEur, 533.49);
close((d.deboursSec ?? 0) + (d.fraisGenerauxEur ?? 0) + (d.beneficeEur ?? 0), d.prixExact ?? 0, 1e-6);
assert.strictEqual(d.tauxMarque, 25);
assert.strictEqual(d.tauxMarge, 33.333333);
assert.strictEqual(d.margeBrute, 1905.33);
close(((d.margeBrute ?? 0) / (d.prixExact ?? 1)) * 100, 25, 1e-3);
close(((d.margeBrute ?? 0) / d.deboursSec) * 100, 33.333333, 1e-3);
assert.strictEqual(d.plancher, 6970.73);
assert.strictEqual(d.remiseMax, 8.640498);
close(d.remiseMax ?? 0, (1 - 6970.73 / 7630) * 100);
assert.strictEqual(d.beneficeArrondi, 540.6);
assert.strictEqual(d.coefEnvisage, 1.312106);
assert.strictEqual(d.marqueEnvisage, 23.786667);
assert.strictEqual(d.margeEnvisage, 31.210637);
assert.strictEqual(d.fgEnvisage, 1350);
assert.strictEqual(d.beneficeEnvisage, 434);
assert.strictEqual(d.tauxBeneficeEnvisage, 5.786667);
assert.strictEqual(d.ecartPrix, -121.33);
assert.strictEqual(d.etat, "warn");
assert.strictEqual(
  d.verdict,
  `À 7${NB}500${NB}€ HT, le bénéfice tombe à 434${NB}€, soit 5,79${NB}% du prix, sous votre objectif de 7${NB}%. Il manque 121,33${NB}€ HT de prix pour l'atteindre.`,
);
assert.strictEqual(d.lignes.length, 7);
assert.deepStrictEqual(
  d.lignes.map((l) => l.benefice),
  [0, 3, 5, 7, 10, 12, 15],
);
assert.deepStrictEqual(
  d.lignes.map((l) => l.coefficient),
  [1.219512, 1.265823, 1.298701, 1.333333, 1.388889, 1.428571, 1.492537],
);
assert.deepStrictEqual(
  d.lignes.map((l) => l.prix),
  [6970.73, 7235.44, 7423.38, 7621.33, 7938.89, 8165.71, 8531.34],
);
assert.deepStrictEqual(
  d.lignes.map((l) => l.tauxMarque),
  [18, 21, 23, 25, 28, 30, 33],
);
assert.deepStrictEqual(
  d.lignes.map((l) => l.tauxMarge),
  [21.95122, 26.582278, 29.87013, 33.333333, 38.888889, 42.857143, 49.253731],
);
assert.deepStrictEqual(
  d.lignes.filter((l) => l.courant).map((l) => l.benefice),
  [7],
);
assert.strictEqual(d.lignes[0]?.prix, d.plancher);
assert.deepStrictEqual(
  d.conversion.map((l) => l.tauxMarge),
  [11.111111, 17.647059, 25, 33.333333, 42.857143, 53.846154, 66.666667, 100],
);
assert.deepStrictEqual(
  d.conversion.map((l) => l.coefficient),
  [1.111111, 1.176471, 1.25, 1.333333, 1.428571, 1.538462, 1.666667, 2],
);
assert.strictEqual(d.conseils.length, 6);
assert.ok(
  d.conseils[0]?.includes("1,333") &&
    d.conseils[0].includes(`25${NB}%`) &&
    d.conseils[0].includes(`33,33${NB}%`) &&
    d.conseils[0].includes(`1${NB}905,33${NB}€`),
);
assert.ok(d.conseils[1]?.includes(`7${NB}145${NB}€ HT`) && d.conseils[1].includes(`476,33${NB}€`));
assert.ok(d.conseils[2]?.includes(`6${NB}970,73${NB}€ HT`) && d.conseils[2].includes(`8,64${NB}%`));
assert.ok(d.conseils[5]?.includes("« Sur devis »"));

const recap = buildRecap(DEFAULTS).split("\n");
assert.strictEqual(recap.length, 9);
assert.strictEqual(recap[0], "Coefficient de vente et prix de vente HT (devis B2B)");
assert.strictEqual(
  recap[1],
  `Déboursé sec : 5${NB}716${NB}€ HT (achats 4${NB}200${NB}€, main-d'œuvre 1${NB}216${NB}€, autres coûts 300${NB}€)`,
);
assert.strictEqual(recap[2], `Frais généraux : 18${NB}% du prix de vente, bénéfice visé : 7${NB}%`);
assert.strictEqual(recap[3], "Coefficient de vente : 1,333");
assert.strictEqual(recap[4], `Prix de vente : 7${NB}621,33${NB}€ HT, arrondi à 7${NB}630${NB}€ HT`);
assert.strictEqual(recap[5], `Taux de marque : 25${NB}%, taux de marge : 33,33${NB}%`);
assert.strictEqual(recap[6], `Prix plancher : 6${NB}970,73${NB}€ HT, remise possible depuis le prix arrondi : 8,64${NB}%`);
assert.strictEqual(recap[7], `Prix envisagé : 7${NB}500${NB}€ HT, coefficient 1,312, bénéfice 434${NB}€ (5,79${NB}%)`);
assert.strictEqual(recap[8], "Calcul : quotebuilder.co/outils/calculateur-coefficient-vente-devis");

const sans = run({ prixEnvisage: 0 });
assert.strictEqual(sans.etat, "neutral");
assert.strictEqual(sans.coefEnvisage, null);
assert.ok(sans.recap.split("\n")[7]?.endsWith("non renseigné"));
const haut = run({ prixEnvisage: 8000 });
assert.strictEqual(haut.etat, "ok");
assert.strictEqual(haut.beneficeEnvisage, 844);
assert.strictEqual(haut.tauxBeneficeEnvisage, 10.55);
const pile = run({ prixEnvisage: 7621.33 });
assert.strictEqual(pile.etat, "ok");
const sousPlancher = run({ prixEnvisage: 6500 });
assert.strictEqual(sousPlancher.etat, "bad");
assert.strictEqual(sousPlancher.beneficeEnvisage, -386);
assert.ok(sousPlancher.verdict.includes(`il manque 386${NB}€`) && sousPlancher.verdict.includes(`6${NB}970,73${NB}€ HT`));
const sousDebourse = run({ prixEnvisage: 5000 });
assert.strictEqual(sousDebourse.etat, "bad");
assert.ok(sousDebourse.verdict.includes("ne couvre même pas le déboursé sec") && sousDebourse.verdict.includes(`716${NB}€`));
const auPlancher = run({ prixEnvisage: 6970.73 });
assert.strictEqual(auPlancher.etat, "warn");
assert.strictEqual(auPlancher.beneficeEnvisage, 0);

const b8 = run({ benefice: 8 });
assert.strictEqual(b8.coefficient, 1.351351);
assert.strictEqual(b8.prixExact, 7724.32);
assert.strictEqual(b8.lignes.length, 8);
assert.deepStrictEqual(
  b8.lignes.filter((l) => l.courant).map((l) => l.benefice),
  [8],
);
assert.strictEqual(run({ arrondi: 1 }).prixArrondi, 7622);
assert.strictEqual(run({ arrondi: 50 }).prixArrondi, 7650);
assert.strictEqual(run({ arrondi: 100 }).prixArrondi, 7700);
assert.strictEqual(run({ arrondi: 7 }).arrondi, 10);
const trop = run({ fraisGeneraux: 60, benefice: 40 });
assert.strictEqual(trop.valide, false);
assert.strictEqual(trop.etat, "neutral");
assert.strictEqual(trop.coefficient, null);
assert.strictEqual(trop.lignes.length, 0);
assert.ok(trop.verdict.includes("100"));
const vide = run({ achats: 0, heures: 0, autresFrais: 0 });
assert.strictEqual(vide.valide, false);
assert.strictEqual(vide.deboursSec, 0);
assert.ok(vide.verdict.startsWith("Renseignez au moins un coût direct"));
assert.strictEqual(vide.conseils.length, 6);
const fgHaut = run({ fraisGeneraux: 90, benefice: 7 });
assert.strictEqual(fgHaut.valide, true);
assert.deepStrictEqual(
  fgHaut.lignes.map((l) => l.benefice),
  [0, 3, 5, 7],
);
const bornes = computeCoefficient({
  achats: "-5",
  autresFrais: "",
  heures: "abc",
  tauxHoraire: 38,
  fraisGeneraux: 120,
  benefice: -3,
  prixEnvisage: -1,
  arrondi: "50",
});
assert.strictEqual(bornes.achats, 0);
assert.strictEqual(bornes.heures, 0);
assert.strictEqual(bornes.fraisGeneraux, 95);
assert.strictEqual(bornes.benefice, 0);
assert.strictEqual(bornes.prixEnvisage, 0);
assert.strictEqual(bornes.arrondi, 50);
const mo = run({ achats: 0, autresFrais: 0, heures: 10, tauxHoraire: 45, fraisGeneraux: 20, benefice: 5, prixEnvisage: 0 });
assert.strictEqual(mo.deboursSec, 450);
assert.strictEqual(mo.prixExact, 600);
assert.strictEqual(mo.prixArrondi, 600);
assert.strictEqual(mo.remiseMax, 6.25);
const sansFrais = run({ fraisGeneraux: 0, benefice: 0 });
assert.strictEqual(sansFrais.coefficient, 1);
assert.strictEqual(sansFrais.prixExact, 5716);
assert.strictEqual(sansFrais.tauxMarge, 0);

console.log("seo-pm-20261026 ok");
