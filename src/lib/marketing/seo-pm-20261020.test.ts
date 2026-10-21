import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { articleHtml } from "./article-html";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_RETENUE_GARANTIE,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  DEFAULTS,
  PLAFONDS,
  addMois,
  buildRecap,
  computeRetenue,
  fmtDate,
  fmtEur,
  fmtMois,
  fmtNum,
  fmtPct,
  parseDate,
  type RetenueInput,
} from "./calculateur-retenue-garantie";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "retenue-garantie-caution-devis-travaux-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const TOOL_PATH = "/outils/calculateur-retenue-garantie";
const DAY = "2026-10-20";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_RETENUE_GARANTIE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "funnel"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Retenue de garantie dans un devis de travaux B2B : 5 %, caution bancaire et libération à un an",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Retenue de garantie sur un marché de travaux : plafond de 5 % (loi du 16 juillet 1971), consignation obligatoire, caution bancaire à la place, libération un an après la réception, règles des marchés publics (5 %, ou 3 % pour une PME dans certains cas, remboursement sous 30 jours), calcul sur le HT ou le TTC, et ce qu'on écrit dans le devis. Avec un exemple chiffré, un calculateur et ce que QuoteBuilder permet, ou pas.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.funnelPublic);
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

assert.equal(BLOG_POSTS.length, 62);
assert.equal(BLOG_TOOLS.length, 52);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Calculateur de retenue de garantie");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["catalogue", "funnel"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Montant, taux, base HT ou TTC et versements : la retenue, sa date de libération et ce qu'elle vous coûte face à une caution bancaire.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-deux outils publics."));
assert.equal(
  outilsHubIntro(),
  "Cinquante-deux outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.",
);
assert.equal(outilsHubIntro(52), outilsHubIntro());
assert.equal(outilsHubIntro(50), "Cinquante outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
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
  /Retenue de garantie dans un devis de travaux B2B : 5 %, caution bancaire et libération à un an : https:\/\/www\.quotebuilder\.co\/blog\/retenue-garantie-caution-devis-travaux-b2b/,
);
assert.match(
  llms,
  /Calculateur de retenue de garantie : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-retenue-garantie/,
);
const llmsLines = llms.split("\n");
const blogLine = llmsLines.findIndex((line) => line.includes(BLOG_PATH));
const toolLine = llmsLines.findIndex((line) => line.includes(TOOL_PATH));
const tarifsLine = llmsLines.findIndex((line) => line.includes("https://www.quotebuilder.co/tarifs"));
assert.ok(blogLine > tarifsLine, "article llms avec les articles");
assert.ok(toolLine > blogLine, "outil llms avec les outils");

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /calculateur-retenue-garantie/);
assert.match(outilsHub, /Calculateur de retenue de garantie/);
assert.match(outilsHub, /calculateur de retenue de garantie/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-retenue-garantie"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 280), /eyebrow: "Pilotage"/);
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

function close(actual: number | null, expected: number, eps = 1e-5) {
  assert.ok(actual != null, `expected ${expected}, got null`);
  assert.ok(Math.abs(actual - expected) < eps, `${actual} != ${expected}`);
}

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(
    blogBody.startsWith(
      "# Retenue de garantie dans un devis de travaux B2B : 5 %, caution bancaire et libération à un an",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  for (const needle of [
    "71-584",
    "71-1058",
    "1779",
    "1792-6",
    "R2191-33",
    "R2191-35",
    "R2192-33",
    "n'est pas pratiquée",
    "opposition motivée",
    "4 800",
    "342",
    "72",
    "30 mai 2028",
    "hypothèses d'exemple",
    "Requis",
    "Liste",
    "récapitulatif de configuration",
    "Document indicatif, non contractuel.",
    "Écrire",
    "/fonctionnalites/espace-prospect",
    "/outils/calculateur-retenue-garantie",
  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assertNoDashes(blogRaw, "retenue md");
  assertNoDashes(blogBody, "retenue body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 5376);
  assert.equal(alphaTokens(blogBody), 4965);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "retenue");
  const html = articleHtml(blogBody);
  assert.equal(html.split("<table").length - 1, 3);
  assert.equal(html.split("<blockquote").length - 1, 1);
}

const builderSrc = readFileSync(join(process.cwd(), "src/lib/funnels/builder.ts"), "utf8");
assert.match(builderSrc, /select: "Liste"/);
assert.match(builderSrc, /text: "Texte"/);
assert.doesNotMatch(builderSrc, /label: "Date"/);
assert.doesNotMatch(builderSrc, /type: "date"/);
assert.match(builderSrc, /required: true/);
const pdfSrc = readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8");
assert.match(pdfSrc, /Récapitulatif de configuration/);
assert.match(pdfSrc, /Document indicatif, non contractuel\./);
const accessSrc = readFileSync(join(process.cwd(), "src/lib/prospect/access.ts"), "utf8");
assert.match(accessSrc, /30 \* 24 \* 60 \* 60 \* 1000/);

const addedSources = [
  "src/lib/marketing/calculateur-retenue-garantie.ts",
  "src/lib/marketing/seo-pm-20261020.test.ts",
  "src/components/marketing/calculateur-retenue-garantie-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-retenue-garantie/page.tsx",
  "src/content/blog/retenue-garantie-caution-devis-travaux-b2b.md",
];
assertNoDashes((BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"), "retenue faq");
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-retenue-garantie/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-retenue-garantie/);
assert.match(toolPage, /Calculateur de retenue de garantie \(marché de travaux\)/);
assert.match(toolPage, /71-584/);
assert.match(toolPage, /R2191-33/);
assert.match(toolPage, /R2191-35/);
assert.match(toolPage, /ne remplace pas un conseil juridique/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /\/blog\/retenue-garantie-caution-devis-travaux-b2b/);
assert.match(toolPage, /\/blog\/acomptes-echeances-devis-b2b/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /\/signup\?plan=free/);
assertNoDashes(toolPage, "outil page");

const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-retenue-garantie-calculator.tsx"),
  "utf8",
);
assert.match(toolUi, /hypothèses d'exemple, pas des moyennes de marché ni des taux bancaires réels/);
assert.match(toolUi, /Le marché/);
assert.match(toolUi, /La retenue et les versements/);
assert.match(toolUi, /Ce que coûte l'argent retenu/);
assert.match(toolUi, /La retenue/);
assert.match(toolUi, /La libération/);
assert.match(toolUi, /Retenue ou caution bancaire/);
assert.match(toolUi, /Calendrier des versements/);
assert.match(toolUi, /Versement/);
assert.match(toolUi, /Immobilisé/);
assert.match(toolUi, /Pour lire vos chiffres/);
assert.match(toolUi, /Récapitulatif/);
assert.match(toolUi, /label="Copier"/);
assert.match(toolUi, /Libération \(un an après la réception\)/);
assert.match(toolUi, /Remboursement au plus tard/);
assert.match(toolUi, /bg-emerald-50/);
assert.match(toolUi, /bg-amber-50/);
assert.match(toolUi, /bg-rose-50/);
assert.doesNotMatch(toolUi, /fetch\(/);
assertNoDashes(toolUi, "outil ui");

const toolLogic = readFileSync(join(process.cwd(), "src/lib/marketing/calculateur-retenue-garantie.ts"), "utf8");
assert.doesNotMatch(toolLogic, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket/);

assert.deepStrictEqual(PLAFONDS, { prive: 5, public: 5, public_pme: 3 });
assert.deepEqual(DEFAULTS, {
  montantHT: 80000,
  tva: 20,
  cadre: "prive",
  base: "ttc",
  taux: 5,
  nbVersements: 4,
  dureeMois: 6,
  dateReception: "2027-04-30",
  delaiGarantie: 12,
  tauxTreso: 6,
  commission: 1,
  fraisCaution: 0,
});

assert.strictEqual(fmtEur(4800), `4${NB}800${NB}€`);
assert.strictEqual(fmtEur(96000), `96${NB}000${NB}€`);
assert.strictEqual(fmtEur(1250000), `1${NB}250${NB}000${NB}€`);
assert.strictEqual(fmtEur(24448.8), `24${NB}448,80${NB}€`);
assert.strictEqual(fmtEur(72), `72${NB}€`);
assert.strictEqual(fmtEur(0), `0${NB}€`);
assert.strictEqual(fmtEur(-30), `-30${NB}€`);
assert.strictEqual(fmtEur(-0.001), `0${NB}€`);
assert.strictEqual(fmtEur(null), "n/a");
assert.strictEqual(fmtNum(1.5), "1,5");
assert.strictEqual(fmtNum(14.25), "14,25");
assert.strictEqual(fmtNum(12), "12");
assert.strictEqual(fmtNum(-2.5), "-2,5");
assert.strictEqual(fmtNum(null), "n/a");
assert.strictEqual(fmtPct(6), `6${NB}%`);
assert.strictEqual(fmtPct(4.75), `4,75${NB}%`);
assert.strictEqual(fmtPct(5.5), `5,5${NB}%`);
assert.strictEqual(fmtMois(18), "18 mois");
assert.strictEqual(fmtMois(16.5), "16,5 mois");
assert.strictEqual(fmtDate(parseDate("2027-04-30")), "30/04/2027");
assert.strictEqual(fmtDate(null), "n/a");
assert.strictEqual(parseDate("2027-02-30"), null);
assert.strictEqual(parseDate("30/04/2027"), null);
assert.strictEqual(parseDate(""), null);
assert.strictEqual(fmtDate(addMois(parseDate("2027-04-30"), 12)), "30/04/2028");
assert.strictEqual(fmtDate(addMois(parseDate("2028-02-29"), 12)), "28/02/2029");
assert.strictEqual(fmtDate(addMois(parseDate("2027-08-31"), 6)), "29/02/2028");
assert.strictEqual(fmtDate(addMois(parseDate("2027-01-31"), 1)), "28/02/2027");
assert.strictEqual(addMois(null, 12), null);

const run = (o: RetenueInput) => computeRetenue({ ...DEFAULTS, ...o });

const r = computeRetenue(DEFAULTS);
assert.strictEqual(r.montantTTC, 96000);
assert.strictEqual(r.baseMontant, 96000);
assert.strictEqual(r.plafond, 5);
assert.strictEqual(r.retenue, 4800);
assert.strictEqual(r.pctHT, 6);
assert.strictEqual(r.parVersement, 1200);
assert.strictEqual(r.versement, 24000);
assert.strictEqual(r.netTotal, 91200);
assert.strictEqual(r.moisGarantie, 12);
assert.strictEqual(fmtDate(r.finGarantie), "30/04/2028");
assert.strictEqual(fmtDate(r.liberation), "30/04/2028");
assert.deepStrictEqual(
  r.lignes.map((l) => [l.rang, l.mois, l.montant, l.retenue, l.encaisse, l.immo, l.cout]),
  [
    [1, 1.5, 24000, 1200, 22800, 16.5, 99],
    [2, 3, 24000, 1200, 22800, 15, 90],
    [3, 4.5, 24000, 1200, 22800, 13.5, 81],
    [4, 6, 24000, 1200, 22800, 12, 72],
  ],
);
assert.strictEqual(r.coutTreso, 342);
assert.strictEqual(r.immoMoyenne, 14.25);
assert.strictEqual(r.dureeCaution, 18);
assert.strictEqual(r.coutCaution, 72);
assert.strictEqual(r.ecart, 270);
assert.strictEqual(r.etat, "ok");
assert.strictEqual(
  r.verdict,
  `Retenue de 4${NB}800${NB}€ (5${NB}% de 96${NB}000${NB}€ TTC), soit 1${NB}200${NB}€ sur chacun des 4 versements. Libération le 30/04/2028, un an après la réception, si le maître de l'ouvrage n'a pas fait opposition. Une caution coûterait environ 72${NB}€, contre 342${NB}€ de trésorerie immobilisée.`,
);
assert.ok(r.liberationMsg.startsWith("Marché privé : un an après la réception"));
assert.strictEqual(r.conseils.length, 6);
assert.ok(r.conseils[0]?.startsWith("Le maître de l'ouvrage doit consigner"));
assert.strictEqual(
  r.conseils[1],
  `Calculée sur le TTC, la retenue de 5${NB}% représente 6${NB}% du montant HT de votre marché. Regardez-la en face de votre marge, pas seulement du prix.`,
);
assert.ok(r.conseils[2]?.includes("« n'est pas pratiquée »") && r.conseils[2]?.includes(`72${NB}€ sur 18 mois`));
assert.ok(r.conseils[4]?.includes("(30/04/2028)"));
assert.ok(r.conseils[5]?.startsWith("QuoteBuilder ne calcule pas de retenue de garantie"));
assert.strictEqual(
  r.recap,
  [
    "Retenue de garantie (marché de travaux)",
    `Marché : 80${NB}000${NB}€ HT, 96${NB}000${NB}€ TTC (TVA 20${NB}%)`,
    `Cadre : marché privé, loi du 16 juillet 1971 (plafond 5${NB}%)`,
    `Retenue : 5${NB}% du TTC = 4${NB}800${NB}€ (1${NB}200${NB}€ \u00d7 4 versements)`,
    `Encaissé avant libération : 91${NB}200${NB}€`,
    "Réception prévue le 30/04/2027, libération le 30/04/2028",
    `Trésorerie immobilisée : 342${NB}€ (6${NB}% par an)`,
    `Caution bancaire : 72${NB}€ (1${NB}% par an sur 18 mois)`,
    "Calcul : quotebuilder.co/outils/calculateur-retenue-garantie",
  ].join("\n"),
);
assert.strictEqual(buildRecap(DEFAULTS), r.recap);
assert.strictEqual(r.recap.split("\n").length, 9);

const pub = run({ cadre: "public" });
assert.strictEqual(pub.plafond, 5);
assert.strictEqual(pub.retenue, 4800);
assert.strictEqual(fmtDate(pub.finGarantie), "30/04/2028");
assert.strictEqual(fmtDate(pub.liberation), "30/05/2028");
assert.deepStrictEqual(
  pub.lignes.map((l) => l.immo),
  [17.5, 16, 14.5, 13],
);
assert.strictEqual(pub.coutTreso, 366);
assert.strictEqual(pub.immoMoyenne, 15.25);
assert.strictEqual(pub.dureeCaution, 19);
assert.strictEqual(pub.coutCaution, 76);
assert.strictEqual(pub.etat, "ok");
assert.ok(
  pub.verdict.includes(
    "Remboursement au plus tard le 30/05/2028, 30 jours après la fin du délai de garantie, si les réserves sont levées.",
  ),
);
assert.ok(pub.liberationMsg.startsWith("Marché public : la retenue est remboursée dans les 30 jours"));
assert.ok(
  pub.conseils[0]?.startsWith("Sur un marché public, vous pouvez remplacer la retenue par une garantie à première demande"),
);
assert.ok(pub.recap.includes("Cadre : marché public (plafond 5\u00a0%)"));
assert.ok(pub.recap.includes("Réception prévue le 30/04/2027, remboursement au plus tard le 30/05/2028"));
const pub6 = run({ cadre: "public", delaiGarantie: 6, dateReception: "2027-08-31" });
assert.strictEqual(fmtDate(pub6.finGarantie), "29/02/2028");
assert.strictEqual(fmtDate(pub6.liberation), "30/03/2028");
assert.strictEqual(pub6.dureeCaution, 13);

const pme5 = run({ cadre: "public_pme" });
assert.strictEqual(pme5.plafond, 3);
assert.strictEqual(pme5.etat, "bad");
assert.strictEqual(
  pme5.verdict,
  `Une retenue de 5${NB}% dépasse le plafond de 3${NB}% de l'article R2191-33 du Code de la commande publique. Signalez-le à l'acheteur avant de remettre votre offre.`,
);
const pme3 = run({ cadre: "public_pme", taux: 3 });
assert.strictEqual(pme3.retenue, 2880);
assert.strictEqual(pme3.etat, "ok");
assert.ok(pme3.recap.includes("Cadre : marché public, PME (plafond 3\u00a0%)"));
const p10 = run({ taux: 10 });
assert.strictEqual(p10.retenue, 9600);
assert.strictEqual(p10.etat, "bad");
assert.strictEqual(
  p10.verdict,
  `Une retenue de 10${NB}% dépasse le plafond de 5${NB}% de la loi du 16 juillet 1971 pour un marché de travaux privé. Son article 3 rend nulles les clauses qui font échec à la loi : demandez que le taux soit ramené à 5${NB}% au plus.`,
);
assert.strictEqual(run({ taux: 5.5 }).etat, "bad");
assert.strictEqual(run({ taux: 5 }).etat, "ok");
const p3 = run({ taux: 3 });
assert.strictEqual(p3.retenue, 2880);
close(p3.coutTreso, 205.2);
close(p3.coutCaution, 43.2);

const ht = run({ base: "ht" });
assert.strictEqual(ht.baseMontant, 80000);
assert.strictEqual(ht.retenue, 4000);
assert.strictEqual(ht.pctHT, 5);
assert.strictEqual(ht.netTotal, 76000);
assert.strictEqual(ht.conseils.length, 5);
assert.ok(ht.recap.includes(`Retenue : 5${NB}% du HT = 4${NB}000${NB}€ (1${NB}000${NB}€ \u00d7 4 versements)`));
const t0 = run({ tva: 0 });
assert.strictEqual(t0.montantTTC, 80000);
assert.strictEqual(t0.retenue, 4000);
assert.strictEqual(t0.conseils.length, 5);

const cher = run({ commission: 6, tauxTreso: 1 });
assert.strictEqual(cher.coutTreso, 57);
assert.strictEqual(cher.coutCaution, 432);
assert.strictEqual(cher.ecart, -375);
assert.strictEqual(cher.etat, "warn");
assert.ok(
  cher.verdict.endsWith(
    `Ici, la caution coûterait plus cher (432${NB}€) que la trésorerie immobilisée (57${NB}€) : vérifiez les taux saisis.`,
  ),
);
assert.ok(cher.conseils[2]?.startsWith("Avec ces taux, garder la retenue coûte moins cher qu'une caution."));
const frais = run({ fraisCaution: 300 });
assert.strictEqual(frais.coutCaution, 372);
assert.strictEqual(frais.ecart, -30);
assert.strictEqual(frais.etat, "warn");
const egal = run({ commission: 4.75 });
assert.strictEqual(egal.coutCaution, 342);
assert.strictEqual(egal.ecart, 0);
assert.strictEqual(egal.etat, "ok");
assert.ok(egal.conseils[2]?.startsWith("Une caution du même montant"));

const un = run({ nbVersements: 1 });
assert.strictEqual(un.parVersement, 4800);
assert.deepStrictEqual(
  un.lignes.map((l) => [l.mois, l.immo, l.cout]),
  [[6, 12, 288]],
);
assert.strictEqual(un.coutTreso, 288);
assert.ok(un.verdict.includes("sur votre versement unique"));
assert.ok(un.recap.includes(`(4${NB}800${NB}€ \u00d7 1 versement)`));
const d0 = run({ dureeMois: 0 });
assert.deepStrictEqual(
  d0.lignes.map((l) => [l.mois, l.immo]),
  [
    [0, 12],
    [0, 12],
    [0, 12],
    [0, 12],
  ],
);
assert.strictEqual(d0.coutTreso, 288);
assert.strictEqual(d0.dureeCaution, 12);
assert.strictEqual(d0.coutCaution, 48);
const trois = run({ nbVersements: 3, montantHT: 100000 });
assert.strictEqual(trois.retenue, 6000);
assert.strictEqual(trois.parVersement, 2000);
assert.deepStrictEqual(
  trois.lignes.map((l) => [l.mois, l.immo, l.cout]),
  [
    [2, 16, 160],
    [4, 14, 140],
    [6, 12, 120],
  ],
);
assert.strictEqual(trois.coutTreso, 420);
assert.strictEqual(trois.coutCaution, 90);
const grand = run({ montantHT: 1250000 });
assert.strictEqual(grand.retenue, 75000);
assert.ok(grand.recap.includes(`Marché : 1${NB}250${NB}000${NB}€ HT, 1${NB}500${NB}000${NB}€ TTC`));

const sansDate = run({ dateReception: "" });
assert.strictEqual(sansDate.reception, null);
assert.strictEqual(sansDate.liberation, null);
assert.strictEqual(sansDate.etat, "neutral");
assert.strictEqual(
  sansDate.verdict,
  `Retenue de 4${NB}800${NB}€. Saisissez la date de réception prévue pour obtenir la date de libération.`,
);
assert.strictEqual(sansDate.liberationMsg, "Saisissez la date de réception prévue.");
assert.strictEqual(sansDate.conseils.length, 5);
assert.ok(sansDate.recap.includes("Réception prévue le n/a, libération le n/a"));
const bis = run({ dateReception: "2028-02-29" });
assert.strictEqual(fmtDate(bis.liberation), "28/02/2029");

const zero = run({ montantHT: 0 });
assert.strictEqual(zero.etat, "neutral");
assert.strictEqual(zero.verdict, "Saisissez le montant du marché pour calculer la retenue.");
assert.strictEqual(zero.retenue, 0);
assert.strictEqual(zero.pctHT, 0);
assert.strictEqual(zero.coutCaution, 0);
assert.strictEqual(zero.conseils.length, 1);
const sans = run({ taux: 0 });
assert.strictEqual(sans.etat, "neutral");
assert.ok(sans.verdict.startsWith("Pas de retenue"));
assert.strictEqual(sans.retenue, 0);
assert.strictEqual(sans.coutTreso, 0);
assert.strictEqual(sans.coutCaution, 0);
assert.strictEqual(sans.conseils.length, 1);
const vide = computeRetenue({});
assert.strictEqual(vide.etat, "neutral");
assert.strictEqual(vide.retenue, 0);
assert.strictEqual(vide.cadre, "prive");
assert.strictEqual(vide.base, "ttc");
assert.strictEqual(vide.delaiGarantie, 12);
assert.strictEqual(vide.nbVersements, 1);

assert.strictEqual(run({ nbVersements: 0 }).nbVersements, 1);
assert.strictEqual(run({ nbVersements: 2.7 }).nbVersements, 2);
assert.strictEqual(run({ nbVersements: 500 }).nbVersements, 60);
assert.strictEqual(run({ taux: 150 }).taux, 100);
assert.strictEqual(run({ tva: -5 }).tva, 0);
assert.strictEqual(run({ montantHT: -1 }).montantHT, 0);
assert.strictEqual(run({ montantHT: "abc" }).montantHT, 0);
assert.strictEqual(run({ cadre: "x" }).cadre, "prive");
assert.strictEqual(run({ base: "x" }).base, "ttc");
assert.strictEqual(run({ delaiGarantie: "" }).delaiGarantie, 12);
assert.strictEqual(run({ dureeMois: "abc" }).dureeMois, 0);
assert.strictEqual(run({ dureeMois: 6.9 }).dureeMois, 6);
assert.strictEqual(run({ fraisCaution: -10 }).fraisCaution, 0);
assert.strictEqual(run({ montantHT: "80000" }).retenue, 4800);
