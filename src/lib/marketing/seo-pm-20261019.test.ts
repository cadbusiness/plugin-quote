import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { inspectProductCsv } from "@/lib/catalog/csv";
import { formatPrice } from "@/lib/format";
import { quoteHeadlineRange } from "@/lib/quotes/price-range";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_REVISION_PRIX,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  REVISION_PRIX_DEFAULTS,
  buildRecap,
  computeRevisionPrix,
  fmtCoef,
  fmtEur,
  fmtEurSigne,
  fmtIdx,
  fmtNum,
  fmtVar,
} from "./calculateur-revision-prix-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "revision-prix-indexation-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const TOOL_PATH = "/outils/calculateur-revision-prix-devis";
const DAY = "2026-10-19";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_REVISION_PRIX, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "funnel"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Révision de prix dans un devis B2B : choisir l'indice, écrire la formule et l'annoncer dès la demande",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Prix ferme, actualisable ou révisable : quand une clause de révision vaut la peine, comment choisir un indice (BT, TP, prix de production, matières), écrire la formule avec ou sans partie fixe, fixer les mois de référence, un seuil et un plafond, et ce qu'on annonce au client dès la demande de devis. Avec un exemple chiffré et ce que QuoteBuilder permet pour des prix qui bougent.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.produits);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 21);
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

assert.equal(BLOG_POSTS.length, 67);
assert.equal(BLOG_TOOLS.length, 57);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Calculateur de révision de prix");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["catalogue", "funnel"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Partie fixe, indices pondérés, seuil et plafond : le coefficient de révision, le prix révisé et l'effet de chaque indice sur votre devis.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-sept outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-sept outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(57), outilsHubIntro());
assert.equal(outilsHubIntro(48), "Quarante-huit outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
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
  /Révision de prix dans un devis B2B : choisir l'indice, écrire la formule et l'annoncer dès la demande : https:\/\/www\.quotebuilder\.co\/blog\/revision-prix-indexation-devis-b2b/,
);
assert.match(
  llms,
  /Calculateur de révision de prix : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-revision-prix-devis/,
);
const llmsLines = llms.split("\n");
const blogLine = llmsLines.findIndex((line) => line.includes(BLOG_PATH));
const toolLine = llmsLines.findIndex((line) => line.includes(TOOL_PATH));
const tarifsLine = llmsLines.findIndex((line) => line.includes("https://www.quotebuilder.co/tarifs"));
assert.ok(blogLine > tarifsLine, "article llms avec les articles");
assert.ok(toolLine > tarifsLine, "outil llms avec les outils");

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /calculateur-revision-prix-devis/);
assert.match(outilsHub, /Calculateur de révision de prix/);
assert.match(outilsHub, /calculateur de révision de prix/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-revision-prix-devis"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 280), /eyebrow: "Catalogue"/);
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
      "# Révision de prix dans un devis B2B : choisir l'indice, écrire la formule et l'annoncer dès la demande",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  for (const needle of [
    "Prix fixe",
    "Fourchette",
    "Sur devis",
    "Prix min",
    "Prix max",
    "Ne pas écraser à la synchro",
    "Un SKU déjà présent met à jour la fiche, les autres sont créés.",
    "Récapitulatif de configuration",
    "Fourchette indicative",
    "Document indicatif, non contractuel.",
    "{{price_range}}",
    "Écrire",
    "L112-2",
    "1167",
    "1195",
    "BT42",
    "13 novembre 2026",
    "/outils/calculateur-revision-prix-devis",
  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assertNoDashes(blogRaw, "revision md");
  assertNoDashes(blogBody, "revision body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 5318);
  assert.equal(alphaTokens(blogBody), 4958);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "revision");
}

assert.equal(formatPrice(null, null), "Sur devis");
assert.deepEqual(
  quoteHeadlineRange({ lines: [{ priceMin: 100, priceMax: 100, quantity: 2 }], ruleMin: 500, ruleMax: 900 }),
  { min: 500, max: 900 },
);
assert.deepEqual(quoteHeadlineRange({ lines: [{ priceMin: 100, priceMax: 100, quantity: 2 }] }), {
  min: 200,
  max: 200,
});
{
  const csv = inspectProductCsv("nom,sku,prix_min,prix_max,devise\nEscalier,ESC-1,100,200,CHF\n");
  assert.equal(csv.rows[0]?.price_min, 100);
  assert.equal(csv.rows[0]?.price_max, 200);
  assert.equal(csv.mapped.price_min, "prix_min");
  assert.equal(csv.mapped.price_max, "prix_max");
  assert.ok(csv.unknownHeaders.includes("devise"));
  const keys = Object.keys(csv.rows[0] ?? {});
  assert.equal(keys.includes("currency"), false);
  assert.equal(keys.includes("devise"), false);
}
assert.match(
  readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"),
  /Document indicatif, non contractuel\./,
);

const addedSources = [
  "src/lib/marketing/calculateur-revision-prix-devis.ts",
  "src/lib/marketing/seo-pm-20261019.test.ts",
  "src/components/marketing/calculateur-revision-prix-devis-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-revision-prix-devis/page.tsx",
  "src/content/blog/revision-prix-indexation-devis-b2b.md",
];
assertNoDashes((BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"), "revision faq");
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-revision-prix-devis/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-revision-prix-devis/);
assert.match(toolPage, /Calculateur de révision de prix/);
assert.match(toolPage, /P = P0 × \(partie fixe \+ partie variable × Σ poids × I1\/I0\)/);
assert.match(toolPage, /valeurs définitives des indices/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /\/blog\/revision-prix-indexation-devis-b2b/);
assert.match(toolPage, /\/fonctionnalites\/catalogue/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /\/signup\?plan=free/);
assertNoDashes(toolPage, "outil page");

const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-revision-prix-devis-calculator.tsx"),
  "utf8",
);
assert.match(toolUi, /hypothèses d'exemple, pas des moyennes de marché ni des valeurs réelles d'indices/);
assert.match(toolUi, /Le prix du devis/);
assert.match(toolUi, /Les indices de la formule/);
assert.match(toolUi, /Les garde-fous de la clause/);
assert.match(toolUi, /Le coefficient/);
assert.match(toolUi, /Le prix révisé/);
assert.match(toolUi, /Détail par indice/);
assert.match(toolUi, /Poids hors 100/);
assert.match(toolUi, /Votre marge, si vos coûts suivent les indices/);
assert.match(toolUi, /Pour lire vos chiffres/);
assert.match(toolUi, /Récapitulatif/);
assert.match(toolUi, /label="Copier"/);
assert.doesNotMatch(toolUi, /fetch\(/);
assertNoDashes(toolUi, "outil ui");

assert.strictEqual(fmtEur(24448.8), `24${NB}448,80${NB}€`);
assert.strictEqual(fmtEur(24000), `24${NB}000${NB}€`);
assert.strictEqual(fmtEur(-163.2), `-163,20${NB}€`);
assert.strictEqual(fmtEur(0), `0${NB}€`);
assert.strictEqual(fmtEur(-0.001), `0${NB}€`);
assert.strictEqual(fmtEur(null), "n/a");
assert.strictEqual(fmtEurSigne(612), `+612${NB}€`);
assert.strictEqual(fmtEurSigne(-163.2), `-163,20${NB}€`);
assert.strictEqual(fmtEurSigne(0), `0${NB}€`);
assert.strictEqual(fmtNum(23.35), "23,4");
assert.strictEqual(fmtNum(24.757043), "24,8");
assert.strictEqual(fmtNum(1500), `1${NB}500`);
assert.strictEqual(fmtIdx(136.5), "136,5");
assert.strictEqual(fmtIdx(1.4286), "1,4286");
assert.strictEqual(fmtIdx(130), "130");
assert.strictEqual(fmtCoef(1.0187), "1,0187");
assert.strictEqual(fmtCoef(1), "1,0000");
assert.strictEqual(fmtCoef(0.915), "0,9150");
assert.strictEqual(fmtVar(1.87), `+1,87${NB}%`);
assert.strictEqual(fmtVar(-2), `-2${NB}%`);
assert.strictEqual(fmtVar(0), `0${NB}%`);
assert.strictEqual(fmtVar(null), "n/a");

const base = {
  prix: 24000,
  fixe: 15,
  marge: 25,
  w1: 60,
  i01: 130,
  i11: 136.5,
  w2: 40,
  i02: 110,
  i12: 107.8,
  w3: 0,
  i03: 100,
  i13: 100,
  seuil: 1,
  plafond: 0,
};
assert.deepEqual(REVISION_PRIX_DEFAULTS, base);

const r = computeRevisionPrix(base);
assert.strictEqual(r.etat, "ok");
assert.strictEqual(r.variable, 85);
assert.strictEqual(r.wSum, 100);
assert.strictEqual(r.poidsOk, true);
close(r.indices[0]?.ratio ?? null, 1.05);
close(r.indices[1]?.ratio ?? null, 0.98);
close(r.indices[0]?.variation ?? null, 5);
close(r.indices[1]?.variation ?? null, -2);
close(r.indices[0]?.poidsPrix ?? null, 51);
close(r.indices[1]?.poidsPrix ?? null, 34);
assert.strictEqual(r.indices[2]?.used, false);
assert.strictEqual(r.indices[2]?.effet, null);
close(r.S, 1.022);
close(r.indVar, 2.2);
close(r.coefBrut, 1.0187);
close(r.varBrute, 1.87);
close(r.coefApplique, 1.0187);
assert.strictEqual(r.dansSeuil, false);
assert.strictEqual(r.plafonne, false);
close(r.prixRevise, 24448.8);
close(r.ecart, 448.8);
close(r.nonRepercute, 0);
close(r.prixSansFixe, 24528);
close(r.ecartPoids, 0);
close(r.indices[0]?.effet ?? null, 612);
close(r.indices[1]?.effet ?? null, -163.2);
close((r.indices[0]?.effet ?? 0) + (r.indices[1]?.effet ?? 0), r.ecart ?? 0);
close(r.cout0, 18000);
close(r.cout1, 18396);
close(r.margeFerme, 23.35);
close(r.margeClause, 24.757043);
assert.strictEqual(r.top, 1);
assert.strictEqual(r.verdict.tone, "ok");
assert.strictEqual(
  r.verdict.text,
  `Prix révisé : 24${NB}448,80${NB}€ HT (+1,87${NB}%). Les poids font bien 100${NB}% de la partie variable.`,
);
assert.strictEqual(r.conseils.length, 6);
assert.ok(r.conseils[0]?.startsWith("L'indice 1 pèse le plus dans la variation : +612"));
assert.ok(r.conseils[1]?.includes(`24${NB}528${NB}€ HT`));
assert.ok(r.conseils[2]?.includes("l'indice 2 recule de 2"));
assert.ok(r.conseils[2]?.includes(`163,20${NB}€`));
assert.ok(r.conseils[3]?.includes(`23,4${NB}% en prix ferme, et à 24,8${NB}% avec la clause`));
assert.ok(r.conseils[4]?.includes("15 octobre 2026"));
assert.ok(r.conseils[5]?.startsWith("Dans QuoteBuilder"));

const recapAttendu = [
  `Prix initial : 24${NB}000${NB}€ HT, partie fixe 15${NB}%, partie variable 85${NB}%.`,
  `Indice 1 : poids 60${NB}%, de 130 à 136,5 (+5${NB}%).`,
  `Indice 2 : poids 40${NB}%, de 110 à 107,8 (-2${NB}%).`,
  `Indice 3 : non utilisé.`,
  `Coefficient : 1,0187 (+1,87${NB}%), seuil de déclenchement 1${NB}%, plafond aucun.`,
  `Prix révisé : 24${NB}448,80${NB}€ HT (+448,80${NB}€).`,
  `Marge si les coûts suivent les indices : 25${NB}% au départ, 23,4${NB}% en prix ferme, 24,8${NB}% avec la clause.`,
  `Calcul : quotebuilder.co/outils/calculateur-revision-prix-devis`,
].join("\n");
assert.strictEqual(r.recap, recapAttendu);
assert.strictEqual(buildRecap(base), recapAttendu);
assert.strictEqual(r.recap.split("\n").length, 8);

const p = computeRevisionPrix({ ...base, plafond: 1.5 });
assert.strictEqual(p.plafonne, true);
close(p.coefApplique, 1.015);
close(p.prixRevise, 24360);
close(p.ecart, 360);
close(p.nonRepercute, 88.8);
assert.strictEqual(p.verdict.tone, "warn");
assert.ok(p.verdict.text.includes(`limité à 24${NB}360${NB}€ HT et 88,80${NB}€ ne sont pas répercutés`));
assert.ok(
  p.recap.includes(`Prix révisé : 24${NB}360${NB}€ HT (+360${NB}€), limité par le plafond ; 88,80${NB}€ non répercutés.`),
);
assert.ok(p.recap.includes(`plafond 1,5${NB}%`));
assert.equal(
  p.conseils.some((c) => c.startsWith("La partie fixe")),
  false,
);

const pe = computeRevisionPrix({ ...base, plafond: 1.87 });
assert.strictEqual(pe.plafonne, false);
close(pe.prixRevise, 24448.8);

const pb = computeRevisionPrix({ ...base, i11: 130, i12: 99, plafond: 2 });
close(pb.varBrute, -3.4);
assert.strictEqual(pb.plafonne, true);
close(pb.coefApplique, 0.98);
close(pb.prixRevise, 23520);
close(pb.nonRepercute, -336);
assert.ok(pb.verdict.text.includes(`336${NB}€ ne sont pas répercutés`));

const s = computeRevisionPrix({ ...base, seuil: 2 });
assert.strictEqual(s.dansSeuil, true);
close(s.coefApplique, 1);
close(s.prixRevise, 24000);
close(s.ecart, 0);
close(s.nonRepercute, 448.8);
assert.strictEqual(s.verdict.tone, "ok");
assert.strictEqual(
  s.verdict.text,
  `Variation de +1,87${NB}%, sous le seuil de déclenchement de 2${NB}% : le prix reste à 24${NB}000${NB}€ HT.`,
);
assert.ok(s.recap.includes("inchangé (variation sous le seuil)"));
const se = computeRevisionPrix({ ...base, seuil: 1.87 });
assert.strictEqual(se.dansSeuil, false);
close(se.prixRevise, 24448.8);
const s0 = computeRevisionPrix({ ...base, seuil: 0, i11: 130.13, i12: 110 });
assert.strictEqual(s0.dansSeuil, false);
assert.ok(s0.recap.includes("seuil de déclenchement aucun"));

const w = computeRevisionPrix({ ...base, w2: 30 });
assert.strictEqual(w.wSum, 90);
assert.strictEqual(w.poidsOk, false);
assert.strictEqual(w.verdict.tone, "bad");
assert.ok(w.verdict.text.includes(`font 90${NB}% de la partie variable au lieu de 100${NB}%`));
assert.ok(w.verdict.text.includes(`-8,5${NB}%`));
close(w.ecartPoids, -2040);
close((w.indices[0]?.effet ?? 0) + (w.indices[1]?.effet ?? 0) + (w.ecartPoids ?? 0), (w.prixRevise ?? 0) - w.prix);
const wf = computeRevisionPrix({ ...base, w2: 30, i11: 130, i12: 110, seuil: 0 });
close(wf.varBrute, -8.5);
close(wf.prixRevise, 21960);

const f0 = computeRevisionPrix({ ...base, fixe: 0 });
close(f0.coefBrut, 1.022);
close(f0.prixRevise, 24528);
assert.equal(
  f0.conseils.some((c) => c.startsWith("La partie fixe")),
  false,
);

const f100 = computeRevisionPrix({ ...base, fixe: 100 });
assert.strictEqual(f100.etat, "ferme");
assert.strictEqual(f100.verdict.tone, "neutral");
assert.ok(f100.verdict.text.startsWith("Avec une partie fixe de 100"));
close(f100.prixRevise, 24000);
assert.strictEqual(f100.conseils.length, 2);

const z = computeRevisionPrix({ ...base, prix: 0 });
assert.strictEqual(z.etat, "sansPrix");
assert.strictEqual(z.verdict.tone, "neutral");
assert.strictEqual(z.prixRevise, null);
assert.ok(z.recap.includes("Coefficient : n/a"));
assert.ok(z.recap.includes("Prix révisé : n/a."));
assert.ok(z.recap.includes("Marge si les coûts suivent les indices : n/a."));
const np = computeRevisionPrix({ ...base, w1: 0, w2: 0 });
assert.strictEqual(np.etat, "sansPoids");
assert.strictEqual(np.verdict.tone, "neutral");
const nv = computeRevisionPrix({ ...base, i02: 0 });
assert.strictEqual(nv.etat, "valeurs");
assert.strictEqual(nv.verdict.tone, "neutral");
assert.ok(nv.recap.includes("Indice 2 : poids 40" + NB + "%, valeurs à compléter."));
const i3 = computeRevisionPrix({ ...base, i03: "", i13: "" });
assert.strictEqual(i3.etat, "ok");

const t3 = computeRevisionPrix({ ...base, w1: 50, w2: 30, w3: 20, i03: 200, i13: 210 });
close(t3.S, 0.5 * 1.05 + 0.3 * 0.98 + 0.2 * 1.05);
close(t3.coefBrut, 0.15 + 0.85 * (0.5 * 1.05 + 0.3 * 0.98 + 0.2 * 1.05));
close(t3.indices[2]?.effet ?? null, 24000 * 0.85 * 0.2 * 0.05);
assert.ok(t3.recap.includes(`Indice 3 : poids 20${NB}%, de 200 à 210 (+5${NB}%).`));

const eg = computeRevisionPrix({ ...base, w1: 50, w2: 50, i11: 136.5, i12: 115.5 });
close(eg.indices[0]?.effet ?? null, eg.indices[1]?.effet ?? 0);
assert.strictEqual(eg.top, 1);
const mv = computeRevisionPrix({ ...base, i11: 130, i12: 110 });
assert.strictEqual(mv.top, null);
close(mv.varBrute, 0);
assert.strictEqual(mv.dansSeuil, true);

const n = computeRevisionPrix({ ...base, fixe: 150, marge: -5, seuil: "abc", plafond: -1, w1: 120, w2: "" });
assert.strictEqual(n.fixe, 100);
assert.strictEqual(n.marge, 0);
assert.strictEqual(n.seuil, 0);
assert.strictEqual(n.plafond, 0);
assert.strictEqual(n.indices[0]?.w, 100);
assert.strictEqual(n.indices[1]?.w, 0);
const n2 = computeRevisionPrix({ ...base, w2: "", w1: 100, marge: 0 });
assert.strictEqual(n2.etat, "ok");
close(n2.prixRevise, 24000 * (0.15 + 0.85 * 1.05));
assert.equal(
  n2.conseils.some((c) => c.startsWith("Si vos coûts")),
  false,
);
assert.equal(
  n2.conseils.some((c) => c.startsWith("La clause joue aussi")),
  false,
);
const n3 = computeRevisionPrix({ ...base, prix: "", i01: -3 });
assert.strictEqual(n3.prix, 0);
assert.strictEqual(n3.indices[0]?.i0, 0);
