import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_FRANCO,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  ARRONDIS,
  DEFAULTS,
  PARTS_TABLE,
  arrondirSeuil,
  buildRecap,
  computeFranco,
  fmtEur,
  fmtHt,
  fmtPct,
  mentionDevis,
  seuilFranco,
  type FrancoInput,
} from "./calculateur-seuil-franco-port";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "frais-port-franco-incoterms-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const TOOL_PATH = "/outils/calculateur-seuil-franco-port";
const DAY = "2026-10-23";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_FRANCO, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Frais de port et franco dans un devis B2B : fixer le seuil, choisir l'Incoterm, savoir qui porte les risques",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisDetail);
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

assert.equal(BLOG_POSTS.length, 66);
assert.equal(BLOG_TOOLS.length, 56);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Calculateur de seuil franco de port");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["catalogue", "relances"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Seuil franco de port calculé sur la marge : part de marge prise par le transport, participation sous le seuil et mention à reprendre dans le devis.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-six outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-six outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(56), outilsHubIntro());
assert.equal(outilsHubIntro(55), "Cinquante-cinq outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
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
  /Frais de port et franco dans un devis B2B : fixer le seuil, choisir l'Incoterm, savoir qui porte les risques : https:\/\/www\.quotebuilder\.co\/blog\/frais-port-franco-incoterms-devis-b2b/,
);
assert.match(
  llms,
  /Calculateur de seuil franco de port : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-seuil-franco-port/,
);
const llmsLines = llms.split("\n");
const blogLine = llmsLines.findIndex((line) => line.includes(BLOG_PATH));
const toolLine = llmsLines.findIndex((line) => line.includes(TOOL_PATH));
const tarifsLine = llmsLines.findIndex((line) => line.includes("https://www.quotebuilder.co/tarifs"));
const garantieLine = llmsLines.findIndex((line) => line.includes("/blog/garantie-vices-caches-sav-devis-b2b"));
assert.ok(blogLine > tarifsLine, "article llms avec les articles");
assert.ok(blogLine < garantieLine, "article le plus récent en tête des articles");
assert.ok(toolLine > blogLine, "outil llms avec les outils");

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /calculateur-seuil-franco-port/);
assert.match(outilsHub, /Calculateur de seuil franco de port/);
assert.match(outilsHub, /calculateur de seuil franco de port/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-seuil-franco-port"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 320), /eyebrow: "Pilotage"/);
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

function yamlQuoted(raw: string, key: string) {
  const match = raw.match(new RegExp(`^${key}: "([^"]*)"`, "m"));
  assert.ok(match?.[1], key);
  return match[1];
}

function close(actual: number | null, expected: number, eps = 1e-4) {
  assert.ok(actual != null, `expected ${expected}, got null`);
  assert.ok(Math.abs(actual - expected) < eps, `${actual} != ${expected}`);
}

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title, yamlQuoted(blogRaw, "title"));
  assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description, yamlQuoted(blogRaw, "description"));
  assert.ok(
    blogBody.startsWith(
      "# Frais de port et franco dans un devis B2B : fixer le seuil, choisir l'Incoterm, savoir qui porte les risques",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  for (const needle of [
    "1604",
    "1608",
    "1609",
    "1196",
    "L133-1",
    "L133-3",
    "L133-6",
    "L132-8",
    "D3222-1",
    "Incoterms® 2020",
    "DPU",
    "01-15.663",
    "19-18.193",
    "23/00466",
    "exemple à adapter",
    "hypothèses d'exemple",
    "514,29",
    "non contractuel",
    "Gagné",
    "/outils/calculateur-seuil-franco-port",
    "/blog/zone-intervention-frais-deplacement-devis-b2b",
  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assertNoDashes(blogRaw, "franco md");
  assertNoDashes(blogBody, "franco body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 4890);
  assert.equal(alphaTokens(blogBody), 4591);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "franco");
}

const pdf = readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8");
assert.match(pdf, /Document indicatif, non contractuel/);

const addedSources = [
  "src/lib/marketing/calculateur-seuil-franco-port.ts",
  "src/lib/marketing/seo-pm-20261023.test.ts",
  "src/components/marketing/calculateur-seuil-franco-port-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-seuil-franco-port/page.tsx",
  "src/content/blog/frais-port-franco-incoterms-devis-b2b.md",
];
assertNoDashes((BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"), "franco faq");
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-seuil-franco-port/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-seuil-franco-port/);
assert.match(toolPage, /Calculateur de seuil franco de port \(B2B\)/);
assert.match(toolPage, /L133-3/);
assert.match(toolPage, /ne remplace pas un conseil comptable ou juridique/);
assert.match(toolPage, /qui paie le transport, pas qui porte les risques/);
assert.match(toolPage, /expert-comptable/);
assert.doesNotMatch(toolPage, /CGI/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /\/blog\/frais-port-franco-incoterms-devis-b2b/);
assert.match(toolPage, /\/blog\/remise-commerciale-marge-devis-b2b/);
assert.match(toolPage, /\/outils\/calculateur-frais-deplacement-devis/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /\/signup\?plan=free/);
assert.doesNotMatch(toolPage, /\/blog\/espace-prospect-devis-en-ligne/);
assertNoDashes(toolPage, "outil page");

const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-seuil-franco-port-calculator.tsx"),
  "utf8",
);
assert.match(toolUi, /hypothèses d'exemple, pas des tarifs de transporteur ni des usages d'une profession/);
assert.match(toolUi, /Le transport/);
assert.match(toolUi, /Votre marge/);
assert.match(toolUi, /Vos commandes/);
assert.match(toolUi, /id="coutTransport"/);
assert.match(toolUi, /id="tauxMarge"/);
assert.match(toolUi, /id="partMax"/);
assert.match(toolUi, /id="panierMoyen"/);
assert.match(toolUi, /id="arrondi"/);
assert.match(toolUi, /Le seuil franco/);
assert.match(toolUi, /Votre panier moyen/);
assert.match(toolUi, /Le seuil selon la part de marge/);
assert.match(toolUi, /Pour lire vos chiffres/);
assert.match(toolUi, /Mention pour le devis/);
assert.match(toolUi, /Récapitulatif/);
assert.match(toolUi, /label="Copier"/);
assert.match(toolUi, /bg-orange-50/);
assert.match(toolUi, /bg-amber-50/);
assert.match(toolUi, /bg-emerald-50/);
assert.doesNotMatch(toolUi, /fetch\(/);
assertNoDashes(toolUi, "outil ui");

const toolLogic = readFileSync(join(process.cwd(), "src/lib/marketing/calculateur-seuil-franco-port.ts"), "utf8");
assert.doesNotMatch(toolLogic, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket/);
assertNoDashes(toolLogic, "outil logic");

assert.deepStrictEqual(PARTS_TABLE, [10, 15, 20, 25, 30, 40, 50]);
assert.deepStrictEqual(ARRONDIS, [1, 10, 50, 100]);
assert.deepStrictEqual(DEFAULTS, { coutTransport: 45, tauxMarge: 35, partMax: 25, panierMoyen: 380, arrondi: 10 });

assert.strictEqual(fmtEur(1285.71), `1${NB}285,71${NB}€`);
assert.strictEqual(fmtEur(520), `520${NB}€`);
assert.strictEqual(fmtHt(11.75), `11,75${NB}€ HT`);
assert.strictEqual(fmtPct(33.834586), `33,83${NB}%`);
assert.strictEqual(fmtPct(8.75), `8,75${NB}%`);

assert.strictEqual(seuilFranco(45, 35, 25), 514.29);
assert.strictEqual(seuilFranco(0, 35, 25), null);
assert.strictEqual(seuilFranco(45, 0, 25), null);
assert.strictEqual(arrondirSeuil(514.29, 10), 520);
assert.strictEqual(arrondirSeuil(514.29, 1), 515);
assert.strictEqual(arrondirSeuil(514.29, 50), 550);
assert.strictEqual(arrondirSeuil(514.29, 100), 600);
assert.strictEqual(arrondirSeuil(400, 10), 400);
assert.strictEqual(arrondirSeuil(null, 10), null);

const run = (o: FrancoInput) => computeFranco({ ...DEFAULTS, ...o });

const d = run({});
assert.strictEqual(d.valide, true);
close(d.seuilExact, 45 / (0.35 * 0.25), 0.01);
assert.strictEqual(d.seuilExact, 514.29);
assert.strictEqual(d.seuilArrondi, 520);
assert.strictEqual(d.ventesPourUneLivraison, 128.57);
assert.strictEqual(d.margePanier, 133);
close(d.partTransport, (45 / 133) * 100);
close(d.partTransport, 33.834586);
close(d.partPrix, 11.842105);
assert.strictEqual(d.margeApresPort, 88);
close(d.tauxMargeApresPort, 23.157895);
assert.strictEqual(d.participation, 11.75);
close(45 - d.participation, 380 * 0.35 * 0.25);
close(d.prixAuSeuil, 8.653846);
close(d.partAuSeuil, 24.725275);
assert.strictEqual(d.etat, "warn");
assert.ok(d.verdict.includes(`33,83${NB}%`));
assert.ok(d.verdict.includes(`520${NB}€ HT`));
assert.strictEqual(d.lignes.length, 7);
assert.deepStrictEqual(
  d.lignes.map((l) => l.seuil),
  [1285.71, 857.14, 642.86, 514.29, 428.57, 321.43, 257.14],
);
assert.deepStrictEqual(
  d.lignes.map((l) => l.arrondi),
  [1290, 860, 650, 520, 430, 330, 260],
);
assert.deepStrictEqual(
  d.lignes.map((l) => l.partPrix),
  [3.5, 5.25, 7, 8.75, 10.5, 14, 17.5],
);
assert.deepStrictEqual(
  d.lignes.filter((l) => l.courant).map((l) => l.part),
  [25],
);
assert.strictEqual(
  d.mention,
  `Franco de port à partir de 520${NB}€ HT de commande, pour une livraison en [zone à préciser]. En dessous de ce montant : participation aux frais de transport de 11,75${NB}€ HT par livraison.`,
);
assert.strictEqual(mentionDevis(d.seuilArrondi, d.participation, d.coutTransport), d.mention);
assert.strictEqual(d.conseils.length, 6);
assert.ok(d.conseils[0]?.includes(`128,57${NB}€ HT`));
assert.ok(d.conseils[1]?.includes(`8,65${NB}%`) && d.conseils[1]?.includes(`24,73${NB}%`));
assert.ok(d.conseils.some((c) => c.includes("L133-3")));
assert.ok(d.conseils.some((c) => c.includes("Incoterms® 2020")));
const recapLines = d.recap.split("\n");
assert.strictEqual(recapLines.length, 9);
assert.strictEqual(recapLines[3], `Seuil franco : 514,29${NB}€ HT, arrondi à 520${NB}€ HT`);
assert.strictEqual(recapLines[5], `Marge après transport : 88${NB}€ (23,16${NB}% du panier)`);
assert.strictEqual(recapLines[8], "Calcul : quotebuilder.co/outils/calculateur-seuil-franco-port");
assert.strictEqual(buildRecap({ ...DEFAULTS }), d.recap);

const ok = run({ panierMoyen: 600 });
assert.strictEqual(ok.etat, "ok");
assert.strictEqual(ok.participation, 45);
assert.ok(ok.mention.includes(`frais de transport facturés 45${NB}€ HT par livraison`));
const bad = run({ panierMoyen: 200 });
close(bad.partTransport, (45 / 70) * 100);
assert.strictEqual(bad.etat, "bad");
assert.ok(!bad.verdict.includes("plus que toute la marge"));
const pire = run({ panierMoyen: 100 });
assert.strictEqual(pire.etat, "bad");
assert.ok(pire.verdict.includes("plus que toute la marge"));
assert.strictEqual(pire.participation, r2(45 - 100 * 0.35 * 0.25));
const pile = run({ panierMoyen: 514.29 });
assert.strictEqual(pile.etat, "ok");
const hors = run({ partMax: 35 });
assert.strictEqual(hors.lignes.length, 8);
assert.deepStrictEqual(
  hors.lignes.map((l) => l.part),
  [10, 15, 20, 25, 30, 35, 40, 50],
);
assert.deepStrictEqual(
  hors.lignes.filter((l) => l.courant).map((l) => l.part),
  [35],
);
assert.strictEqual(run({ arrondi: 1 }).seuilArrondi, 515);
assert.strictEqual(run({ arrondi: 100 }).seuilArrondi, 600);
assert.strictEqual(run({ arrondi: 7 }).arrondi, 10);

const sans = run({ panierMoyen: 0 });
assert.strictEqual(sans.etat, "neutral");
assert.strictEqual(sans.margePanier, null);
assert.strictEqual(sans.participation, 45);
assert.ok(sans.verdict.includes("Renseignez votre panier moyen"));
assert.ok(sans.recap.includes("Panier moyen : non renseigné"));
assert.strictEqual(sans.recap.split("\n").length, 9);

const z = run({ coutTransport: 0 });
assert.strictEqual(z.valide, false);
assert.strictEqual(z.etat, "neutral");
assert.strictEqual(z.verdict, "Renseignez le coût moyen d'une livraison.");
assert.strictEqual(z.seuilExact, null);
assert.strictEqual(z.lignes.length, 0);
assert.strictEqual(z.mention, "Frais de transport : à préciser dans le devis.");
const zm = run({ tauxMarge: 0 });
assert.strictEqual(zm.etat, "neutral");
assert.ok(zm.verdict.startsWith("Renseignez votre marge brute"));
const zp = run({ partMax: 0 });
assert.strictEqual(zp.etat, "neutral");
assert.ok(zp.verdict.startsWith("Renseignez la part de marge"));
const neg = run({ coutTransport: -10, panierMoyen: "" });
assert.strictEqual(neg.coutTransport, 0);
assert.strictEqual(neg.valide, false);
const borne = run({ tauxMarge: 150, partMax: 200 });
assert.strictEqual(borne.tauxMarge, 100);
assert.strictEqual(borne.partMax, 100);
assert.strictEqual(borne.seuilExact, 45);
const texte = run({ coutTransport: "abc" });
assert.strictEqual(texte.coutTransport, 0);
