import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { articleHtml } from "./article-html";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_AGENT_COMMERCIAL, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as agentTool from "./calculateur-preavis-commission-agent-commercial";

const {
  DEFAULTS,
  DELAI_RECLAMATION_MOIS,
  LABEL_SETS,
  NON_CONCURRENCE_MAX_MOIS,
  POINTS,
  PREAVIS_MIN_MOIS,
  REPERE_ANNEES_MAX,
  REPERE_ANNEES_MIN,
  SLUG,
  STATUT_LABELS,
  addMonths,
  computeAgent,
  dec,
  ent,
  finDeMois,
  fmtDate,
  fmtEur,
  fmtNum,
  isoDate,
  limitePaiement,
  moisEcoules,
  normalize,
  parseDate,
  pluriel,
  trimestre,
} = agentTool as unknown as {
  DEFAULTS: Record<string, string>;
  DELAI_RECLAMATION_MOIS: number;
  LABEL_SETS: Record<string, Record<string, string>>;
  NON_CONCURRENCE_MAX_MOIS: number;
  POINTS: { id: string; label: string }[];
  PREAVIS_MIN_MOIS: number[];
  REPERE_ANNEES_MAX: number;
  REPERE_ANNEES_MIN: number;
  SLUG: string;
  STATUT_LABELS: Record<string, string>;
  addMonths: (d: Date | null, n: number) => Date;
  computeAgent: (raw: Record<string, string>) => AgentResult;
  dec: (v: unknown) => number;
  ent: (v: unknown) => number;
  finDeMois: (d: Date | null) => Date;
  fmtDate: (d: Date | null) => string;
  fmtEur: (n: number) => string;
  fmtNum: (n: number) => string;
  isoDate: (d: Date | null | undefined) => string;
  limitePaiement: (d: Date | null) => Date;
  moisEcoules: (a: Date | null, b: Date | null) => number;
  normalize: (raw: Record<string, string>) => AgentInput;
  parseDate: (s: string) => Date | null;
  pluriel: (n: number, s: string, p?: string) => string;
  trimestre: (d: Date | null) => number;
};

type AgentInput = {
  mission: string;
  tx: number;
  preavis: number;
  nc: number;
  notif: Date | null;
};

type AgentResult = {
  anneeContrat: number | null;
  preavisMin: number | null;
  preavisRetenu: number | null;
  cessation: Date | null;
  limiteReclamation: Date | null;
  finNC: Date | null;
  commission: number;
  commissionDue: string;
  acquisition: Date | null;
  limite: Date | null;
  repereMin: number | null;
  repereMax: number | null;
  indemniteDue: boolean | null;
  nbBad: number;
  nbWarn: number;
  nbOk: number;
  nbInfo: number;
  etat: string;
  preavisLabel: string;
  finLabel: string;
  indemniteLabel: string;
  commissionLabel: string;
  limiteLabel: string;
  verdict: string;
  actions: string[];
  clause: string;
  message: string;
  recap: string;
  estAgent: boolean;
  input: AgentInput;
  controles: { id: string; point: string; statut: string; texte: string }[];
};
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";
import { formatPrice } from "../format";
import { classifySource } from "../stats/attribution";
import { scoreQuote } from "../quotes/score";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "agent-commercial-apporteur-affaires-commission-devis-b2b";
const SECTOR_SLUG = "funnel-devis-injection-plastique-moules";
const BLOG_PATH = "/blog/agent-commercial-apporteur-affaires-commission-devis-b2b";
const SECTOR_PATH = "/secteurs/funnel-devis-injection-plastique-moules";
const TOOL_PATH = "/outils/calculateur-preavis-commission-agent-commercial";
const DAY = "2026-11-20";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];
const TOOL_TEXT = "Préavis de 1 à 3 mois en fin de mois, commission d'un devis signé pendant ou après le contrat, date de paiement, repère d'indemnité, non-concurrence.";
const TOOL_TITLE = "Calculateur agent commercial : préavis, commission, indemnité";

assert.equal(SLUG, "calculateur-preavis-commission-agent-commercial");
assert.equal(BLOG_TOOL_AGENT_COMMERCIAL, TOOL_PATH);
assert.equal(BLOG_POSTS.some((post) => post.slug === SECTOR_SLUG), false);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 36);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, TOOL_TITLE);
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, TOOL_TEXT);
assert.ok(BLOG_TOOLS.findIndex((item) => item.href === TOOL_PATH) > BLOG_TOOLS.findIndex((item) => item.href === "/outils/verificateur-clause-exclusivite"));

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === SECTOR_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
const exclusivityTool = paths.indexOf("/outils/verificateur-clause-exclusivite");
assert.ok(paths.indexOf(BLOG_PATH) > exclusivityTool);
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
assert.ok(llms.includes("Agent commercial ou apporteur d'affaires : commission sur les devis signés, préavis et indemnité de fin de contrat : https://www.quotebuilder.co" + BLOG_PATH));
assert.ok(llms.includes("Funnel de devis injection plastique et moules : https://www.quotebuilder.co" + SECTOR_PATH));
assert.ok(llms.includes("Calculateur de préavis, de commission et d'indemnité d'agent commercial : https://www.quotebuilder.co" + TOOL_PATH));
const exclusivityLine = llms.indexOf("https://www.quotebuilder.co/outils/verificateur-clause-exclusivite");
const palettesLine = llms.indexOf("https://www.quotebuilder.co/secteurs/funnel-devis-palettes-caisses-bois-export");
assert.ok(llms.indexOf("https://www.quotebuilder.co" + BLOG_PATH) > exclusivityLine);
assert.ok(llms.indexOf("https://www.quotebuilder.co" + TOOL_PATH) > llms.indexOf("https://www.quotebuilder.co" + BLOG_PATH));
assert.ok(llms.indexOf("https://www.quotebuilder.co" + SECTOR_PATH) > palettesLine);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.ok(outilsHub.includes("calculateur-preavis-commission-agent-commercial"));
assert.ok(outilsHub.includes(TOOL_TITLE));
assert.ok(outilsHub.includes(TOOL_TEXT));
assert.ok(outilsHub.includes("calculateur agent commercial : préavis, commission, indemnité"));
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-preavis-commission-agent-commercial"');
  assert.ok(start > outilsHub.indexOf('href: "/outils/verificateur-clause-exclusivite"'));
  assert.match(outilsHub.slice(start, start + 400), /eyebrow: "Pilotage"/);
}
assert.ok(outilsHub.includes("outilsHubIntro()"));

const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes(SECTOR_PATH));
assert.ok(secteursHub.includes("Injection plastique et moules"));
assert.ok(secteursHub.indexOf(SECTOR_PATH) > secteursHub.indexOf("/secteurs/funnel-devis-palettes-caisses-bois-export"));

assert.equal(BLOG_TOOLS.length, 99);
assert.equal(BLOG_POSTS.length, 109);
assert.equal(outilsHubIntro(), "Quatre-vingt-dix-neuf outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(99), outilsHubIntro());
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
  assert.doesNotMatch(text, EM_DASH, `${label} has an em dash`);
  assert.doesNotMatch(text, EN_DASH, `${label} has an en dash`);
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
    "L134-1",
    "L134-6",
    "L134-7",
    "L134-9",
    "L134-10",
    "L134-11",
    "L134-12",
    "L134-13",
    "L134-14",
    "L134-16",
    "R134-3",
    "C-828/18",
    "18-20.231",
    "23-12.643",
    "21-17.423",
    "11-13.527",
    "86 400",
    "129 600",
    "48 000",
    "2 400",
    "28 février 2027",
    "30 avril 2027",
    "28 février 2028",
    "28 février 2029",
    "hypothèses d'exemple",
    "non contractuel",
    "Gagné",
    "/outils/calculateur-preavis-commission-agent-commercial",
    "/secteurs/funnel-devis-injection-plastique-moules",
  ]) {
    assert.ok(norm.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  const html = articleHtml(blogBody);
  assert.ok(html.includes("<table"), "blog tables");
  assert.ok((html.match(/<table/g) ?? []).length >= 3, "three markdown tables");
  assert.ok(html.includes("<code>?utm_source=agent-bretagne&amp;utm_medium=agent</code>") || html.includes("utm_source=agent-bretagne"));
  assert.ok(html.includes("[ ] La mission décrit-elle"));
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), `src/app/(marketing)/secteurs/${SECTOR_SLUG}/page.tsx`), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assertNoDashes(sectorRaw, "sector md");
  assertNoDashes(sectorPage, "sector page");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Injection plastique et moules"));
  assert.ok(sectorPage.includes('about: "Injection plastique et moules"'));
  assert.ok(sectorPage.includes("Pièces & sous-traitance"));
  const norm = sectorBody.replace(/[\u00a0\u202f]/g, " ");
  for (const needle of [
    "Pièces & sous-traitance",
    "Industrie & fabrication",
    "Funnel pièces",
    "Plan (PDF ou image)",
    "10/2011",
    "annexe IV",
    "1,35 €",
    "0,42 €",
    "30 points",
    "Cold",
    "/blog/outillage-specifique-moule-propriete-amortissement-devis-b2b",
    "/outils/calculateur-amortissement-outillage-specifique",
  ]) {
    assert.ok(norm.includes(needle), `sector missing ${needle}`);
  }
}

const added = [
  "src/lib/marketing/calculateur-preavis-commission-agent-commercial.ts",
  "src/components/marketing/calculateur-preavis-commission-agent-commercial-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-preavis-commission-agent-commercial/page.tsx",
  `src/content/blog/${BLOG_SLUG}.md`,
  `src/content/blog/${SECTOR_SLUG}.md`,
  `src/app/(marketing)/secteurs/${SECTOR_SLUG}/page.tsx`,
];
for (const rel of added) assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);

const templates = readFileSync(join(process.cwd(), "src/lib/funnels/templates.ts"), "utf8");
for (const needle of ["industry_parts", "Pièces & sous-traitance", "Funnel pièces", "Capacités et finitions de votre atelier"]) {
  assert.ok(templates.includes(needle), needle);
}
const archetypes = readFileSync(join(process.cwd(), "src/lib/funnels/archetypes.ts"), "utf8");
const makeStart = archetypes.indexOf("export function makeSteps");
assert.ok(makeStart >= 0);
const makeBody = archetypes.slice(makeStart);
assert.ok(makeBody.includes("Ordre de grandeur"));
assert.ok(makeBody.includes("Ex. 2 000 pièces, 1 série proto"));
const scored = scoreQuote({ project_type: "series" });
assert.equal(scored.score, 30);
assert.equal(scored.label, "cold");
const priceOne = formatPrice(1.35, null);
const priceCent = formatPrice(0.42, null);
assert.equal(priceOne.replace(/[\u00a0\u202f]/g, " "), "1 €");
assert.match(priceOne, /[\u00a0\u202f]/);
assert.equal(priceCent.replace(/[\u00a0\u202f]/g, " "), "0,42 €");
assert.equal(classifySource({ utmSource: "agent-bretagne", utmMedium: "agent" }), "Agent Bretagne");
const seed = readFileSync(join(process.cwd(), "src/lib/crm/seed.ts"), "utf8");
assert.ok(seed.includes("Gagné"));
assert.ok(seed.includes("Perdu"));
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);

const pageSrc = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/calculateur-preavis-commission-agent-commercial/page.tsx"), "utf8");
assert.ok(pageSrc.includes(TOOL_PATH));
assert.ok(pageSrc.includes("Calculateur de préavis, de commission et d'indemnité d'agent commercial (ou d'apporteur d'affaires)"));
assert.ok(pageSrc.includes("pas un conseil juridique"));
assert.ok(pageSrc.includes("Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."));
assert.ok(pageSrc.includes("Calcul local, aucune donnée envoyée."));
assert.doesNotMatch(pageSrc, /\/blog\/espace-prospect-devis-en-ligne/);
for (const href of [
  "/blog/agent-commercial-apporteur-affaires-commission-devis-b2b",
  "/blog/rupture-brutale-relations-commerciales-devis-b2b",
  "/blog/clause-exclusivite-devis-contrat-approvisionnement-b2b",
  "/blog/pouvoir-signataire-devis-delegation-mandat-apparent-b2b",
  "/outils/calculateur-preavis-rupture-brutale",
  "/signup?plan=free",
  "/c/demo/rayonnage",
  "/tarifs",
]) {
  assert.ok(pageSrc.includes(href), href);
}

assert.equal(Object.keys(DEFAULTS).length, 17);
assert.equal(POINTS.length, 10);
assert.deepEqual(PREAVIS_MIN_MOIS, [1, 2, 3]);
assert.equal(NON_CONCURRENCE_MAX_MOIS, 24);
assert.equal(DELAI_RECLAMATION_MOIS, 12);
assert.equal(REPERE_ANNEES_MIN, 2);
assert.equal(REPERE_ANNEES_MAX, 3);
assert.equal(Object.keys(LABEL_SETS).length, 8);
assert.equal(dec("86 400"), 86400);
assert.equal(dec("12,5"), 12.5);
assert.equal(dec("1\u00a0000"), 1000);
assert.equal(dec("1\u202f000,25"), 1000.25);
assert.ok(Number.isNaN(dec("abc")));
assert.ok(Number.isNaN(dec("")));
assert.equal(ent("3,9"), 3);
assert.equal(parseDate("2027-02-30"), null);
assert.equal(parseDate("2026-13-01"), null);
assert.equal(isoDate(parseDate("2028-02-29")), "2028-02-29");
assert.equal(isoDate(addMonths(parseDate("2026-11-16"), 3)), "2027-02-16");
assert.equal(isoDate(addMonths(parseDate("2027-01-31"), 1)), "2027-02-28");
assert.equal(isoDate(addMonths(parseDate("2028-02-29"), 12)), "2029-02-28");
assert.equal(isoDate(addMonths(parseDate("2026-12-15"), -1)), "2026-11-15");
assert.equal(isoDate(finDeMois(parseDate("2027-02-16"))), "2027-02-28");
assert.equal(isoDate(finDeMois(parseDate("2028-02-01"))), "2028-02-29");
assert.equal(moisEcoules(parseDate("2021-03-01"), parseDate("2026-11-16")), 68);
assert.equal(moisEcoules(parseDate("2026-03-15"), parseDate("2027-03-14")), 11);
assert.equal(moisEcoules(parseDate("2026-03-15"), parseDate("2027-03-15")), 12);
for (const [a, b] of [
  ["2027-01-01", "2027-04-30"],
  ["2027-02-15", "2027-04-30"],
  ["2027-03-31", "2027-04-30"],
  ["2027-04-01", "2027-07-31"],
  ["2027-06-30", "2027-07-31"],
  ["2027-07-01", "2027-10-31"],
  ["2027-09-30", "2027-10-31"],
  ["2027-10-01", "2028-01-31"],
  ["2027-12-31", "2028-01-31"],
] as const) {
  assert.equal(isoDate(limitePaiement(parseDate(a))), b, a);
}
assert.equal(trimestre(parseDate("2027-02-15")), 1);
assert.equal(trimestre(parseDate("2027-10-01")), 4);
assert.equal(fmtDate(parseDate("2021-03-01")), "1er mars 2021");
assert.equal(fmtDate(parseDate("2027-02-28")), "28 février 2027");
assert.equal(fmtDate(null), "date non renseignée");
assert.equal(fmtNum(86400), "86 400");
assert.equal(fmtNum(1234567.5), "1 234 567,50");
assert.equal(fmtEur(2400), "2 400 €");
assert.equal(pluriel(1, "mois", "mois"), "1 mois");
assert.equal(pluriel(2, "point"), "2 points");
const n0 = normalize({ mission: "bidon", taux: "abc", preavisContrat: "-2", nonConcurrenceMois: "999" });
assert.equal(n0.mission, "permanente_negociation");
assert.equal(n0.tx, 0);
assert.equal(n0.preavis, 0);
assert.equal(n0.nc, 240);

const run = (overrides: Record<string, string>) => computeAgent({ ...DEFAULTS, ...overrides });
const S = (result: { controles: { statut: string }[] }) => result.controles.map((item) => item.statut).join(",");
const T = (result: { controles: { texte: string }[] }, index: number) => result.controles[index].texte;

const defaults = run({});
assert.equal(defaults.anneeContrat, 6);
assert.equal(defaults.preavisMin, 3);
assert.equal(defaults.preavisRetenu, 3);
assert.equal(isoDate(defaults.cessation), "2027-02-28");
assert.equal(isoDate(defaults.limiteReclamation), "2028-02-28");
assert.equal(isoDate(defaults.finNC), "2029-02-28");
assert.equal(defaults.commission, 2400);
assert.equal(defaults.commissionDue, "oui");
assert.equal(isoDate(defaults.acquisition), "2027-02-15");
assert.equal(isoDate(defaults.limite), "2027-04-30");
assert.equal(defaults.repereMin, 86400);
assert.equal(defaults.repereMax, 129600);
assert.equal(defaults.indemniteDue, true);
assert.equal(S(defaults), "ok,ok,bad,info,warn,info,bad,ok,info,info");
assert.equal(defaults.nbBad, 2);
assert.equal(defaults.nbWarn, 1);
assert.equal(defaults.etat, "bad");
assert.equal(defaults.preavisLabel, "3 mois (minimum légal)");
assert.equal(defaults.finLabel, "28 février 2027");
assert.equal(defaults.indemniteLabel, "86 400 € à 129 600 €");
assert.equal(defaults.commissionLabel, "2 400 €");
assert.equal(defaults.limiteLabel, "30 avril 2027");
assert.equal(defaults.verdict, "2 points bloquants et 1 point à revoir : votre contrat ou votre lettre ne tient pas sur ces points.");
assert.ok(T(defaults, 2).includes("6e année"));
assert.ok(T(defaults, 2).includes("réputée non écrite"));
assert.ok(T(defaults, 3).includes("16 février 2027"));
assert.ok(T(defaults, 3).includes("28 février 2027"));
assert.ok(T(defaults, 4).includes("43 200 €"));
assert.ok(T(defaults, 6).includes("28 février 2029"));
assert.ok(T(defaults, 8).includes("trimestre 1 de 2027"));
assert.ok(T(defaults, 9).includes("11-13.527"));
assert.equal(defaults.actions.length, 6);
assert.equal(defaults.clause.split("\n").length, 7);
assert.equal(defaults.recap.split("\n").length, 12);
assert.ok(defaults.recap.includes("Non-concurrence : 36 mois prévus, 24 mois au plus, jusqu'au 28 février 2029 au plus tard"));
assert.ok(defaults.message.includes("le contrat prendra fin le 28 février 2027"));
assert.ok(defaults.message.includes("2 400 €") && defaults.message.includes("30 avril 2027"));
assert.ok(defaults.clause.includes("pendant 24 mois"));

const corrected = run({ preavisContrat: "3", nonConcurrenceMois: "24" });
assert.equal(S(corrected), "ok,ok,ok,info,warn,info,ok,ok,info,info");
assert.equal(corrected.etat, "warn");
assert.equal(corrected.preavisLabel, "3 mois");
assert.equal(corrected.verdict, "Aucun point bloquant, 1 point à revoir avant d'envoyer la lettre.");
assert.equal(isoDate(corrected.finNC), "2029-02-28");

for (const [deb, notif, pm, fin] of [
  ["2026-01-10", "2026-11-16", 1, "2026-12-31"],
  ["2025-11-17", "2026-11-16", 1, "2026-12-31"],
  ["2025-11-16", "2026-11-16", 2, "2027-01-31"],
  ["2024-11-17", "2026-11-16", 2, "2027-01-31"],
  ["2024-11-16", "2026-11-16", 3, "2027-02-28"],
] as const) {
  const result = run({ dateDebut: deb, dateNotif: notif, preavisContrat: "0" });
  assert.equal(result.preavisMin, pm, deb);
  assert.equal(isoDate(result.cessation), fin, deb);
  assert.equal(result.controles[2].statut, "bad");
}
const dateADate = run({ finMois: "date_a_date", preavisContrat: "4" });
assert.equal(isoDate(dateADate.cessation), "2027-03-16");
assert.equal(dateADate.preavisRetenu, 4);
assert.equal(dateADate.controles[2].statut, "ok");
assert.ok(T(run({ typeContrat: "cdd_poursuivi" }), 2).startsWith("Contrat à durée déterminée poursuivi"));
const cddTerme = run({ typeContrat: "cdd_terme" });
assert.equal(isoDate(cddTerme.cessation), "2026-11-16");
assert.equal(cddTerme.indemniteDue, true);
assert.equal(cddTerme.controles[2].statut, "info");

const faute = run({ initiative: "faute_grave" });
assert.equal(faute.indemniteDue, false);
assert.equal(faute.controles[2].statut, "warn");
assert.equal(faute.controles[4].statut, "warn");
assert.ok(T(faute, 4).includes("21-17.423"));
assert.equal(isoDate(faute.cessation), "2026-11-16");
assert.equal(faute.indemniteLabel, "Non, si la faute grave est établie");
const agent = run({ initiative: "agent" });
assert.equal(agent.indemniteDue, false);
assert.equal(agent.controles[4].statut, "info");
assert.equal(agent.indemniteLabel, "Non due");
assert.equal(run({ initiative: "agent_justifie" }).indemniteDue, true);
const cession = run({ initiative: "cession" });
assert.equal(cession.indemniteDue, false);
assert.ok(T(cession, 4).includes("3°"));
const forceMajeure = run({ initiative: "force_majeure" });
assert.equal(forceMajeure.indemniteDue, true);
assert.equal(forceMajeure.controles[2].statut, "info");

const apporteur = run({ mission: "ponctuelle" });
assert.equal(apporteur.estAgent, false);
assert.equal(apporteur.controles[0].statut, "info");
assert.equal(apporteur.indemniteLabel, "Non (apporteur)");
assert.equal(apporteur.preavisLabel, "Selon le contrat");
assert.equal(apporteur.commissionDue, "contrat");
assert.ok(apporteur.verdict.startsWith("Apporteur d'affaires"));
assert.ok(apporteur.message.includes("apport d'affaires"));
const presentation = run({ mission: "permanente_presentation" });
assert.equal(presentation.controles[0].statut, "warn");
assert.ok(T(presentation, 0).includes("23-12.643"));
assert.equal(run({ independance: "encadre" }).controles[0].statut, "warn");
const oral = run({ ecrit: "non" });
assert.equal(oral.controles[1].statut, "warn");
assert.equal(oral.controles[6].statut, "bad");
assert.ok(T(oral, 6).includes("par écrit"));

const secteur = run({ origine: "secteur" });
assert.equal(secteur.commissionDue, "oui");
assert.equal(secteur.controles[7].statut, "warn");
const secteurNon = run({ origine: "secteur", secteurConfie: "non" });
assert.equal(secteurNon.commissionDue, "non");
assert.equal(secteurNon.commissionLabel, "Pas de commission");
assert.equal(secteurNon.limiteLabel, "Sans objet");
const apres = run({ dateSignature: "2027-04-12", dateExecution: "2027-06-01" });
assert.equal(apres.commissionDue, "a_apprecier");
assert.equal(apres.commissionLabel, "2 400 € (à apprécier)");
assert.equal(apres.limiteLabel, "31 juillet 2027");
assert.ok(T(apres, 7).includes("L134-7"));
assert.equal(run({ dateSignature: "2027-04-12", origine: "autre" }).commissionDue, "non");
assert.equal(run({ dateSignature: "2027-02-28" }).commissionDue, "oui");
assert.equal(run({ dateExecution: "2026-12-01" }).controles[8].statut, "warn");
assert.equal(run({ dateExecution: "" }).controles[8].statut, "warn");
const taux = run({ montantDevis: "12 345,67", taux: "7,5" });
assert.equal(Math.round(taux.commission * 100) / 100, 925.93);
assert.equal(taux.commissionLabel, "925,93 €");
const zero = run({ commissions24: "0" });
assert.equal(zero.repereMin, null);
assert.equal(zero.indemniteLabel, "Due, montant à estimer");
const sansDates = run({ dateDebut: "", dateNotif: "" });
assert.equal(sansDates.controles[2].statut, "warn");
assert.equal(sansDates.finLabel, "À calculer");
assert.equal(run({ dateDebut: "2027-01-01", dateNotif: "2026-11-16" }).cessation, null);
assert.equal(run({ nonConcurrenceMois: "0" }).controles[6].statut, "ok");

let combos = 0;
const labels = (key: string) => Object.keys(LABEL_SETS[key]);
const dates = [["2021-03-01", "2026-11-16"], ["2026-01-10", "2026-11-16"], ["2025-11-16", "2026-11-16"], ["", "2026-11-16"], ["2027-01-01", "2026-11-16"], ["2024-02-29", "2026-02-28"]];
const nums = [["1", "36", "86400"], ["0", "0", "0"], ["6", "24", "12 500,50"], ["abc", "12", "-5"]];
const devis = [["2026-12-10", "2027-02-15", "48000", "5"], ["2027-04-12", "2027-10-01", "0", "0"], ["", "", "1 000", "10"], ["2026-12-10", "2026-12-01", "abc", "7,5"]];
for (const mission of labels("mission")) for (const independance of labels("independance")) for (const ecrit of labels("ecrit")) for (const secteurConfie of labels("secteurConfie"))
for (const typeContrat of labels("typeContrat")) for (const initiative of labels("initiative")) for (const finMois of labels("finMois")) for (const origine of labels("origine"))
for (const [dateDebut, dateNotif] of dates) for (const [preavisContrat, nonConcurrenceMois, commissions24] of nums)
for (const [dateSignature, dateExecution, montantDevis, tauxCommission] of devis) {
  const result = computeAgent({ mission, independance, ecrit, secteurConfie, typeContrat, dateDebut, dateNotif, initiative, preavisContrat, finMois, nonConcurrenceMois, commissions24, origine, montantDevis, taux: tauxCommission, dateSignature, dateExecution });
  combos += 1;
  assert.equal(result.controles.length, 10);
  assert.equal(result.nbOk + result.nbWarn + result.nbBad + result.nbInfo, 10);
  for (let i = 0; i < 10; i += 1) {
    const point = result.controles[i];
    assert.equal(point.point, POINTS[i].label);
    assert.ok(STATUT_LABELS[point.statut]);
    assert.ok(point.texte && !/undefined|NaN|null|Invalid/.test(point.texte));
  }
  assert.equal(result.etat, result.nbBad ? "bad" : result.nbWarn ? "warn" : "ok");
  for (const text of [result.verdict, result.clause, result.message, result.recap, result.actions.join(" "), result.preavisLabel, result.finLabel, result.indemniteLabel, result.commissionLabel, result.limiteLabel]) {
    assert.ok(!/undefined|NaN|null|Invalid|\[object/.test(text));
    assert.ok(!/[\u2013\u2014\u2212]/.test(text));
  }
  assert.equal(result.clause.split("\n").length, 7);
  assert.equal(result.recap.split("\n").length, 12);
  assert.ok(result.actions.length >= 1);
  assert.ok(!/\n\n\n/.test(result.message));
  assert.equal(result.controles[9].statut, "info");
  if (result.estAgent && result.preavisMin !== null && result.preavisRetenu !== null) {
    assert.ok(result.preavisRetenu >= result.preavisMin);
    assert.ok(result.preavisMin >= 1 && result.preavisMin <= 3);
    assert.equal(result.controles[2].statut, result.input.preavis < result.preavisMin ? "bad" : "ok");
    if (finMois === "fin_mois" && result.cessation) assert.equal(result.cessation.getUTCDate(), finDeMois(result.cessation).getUTCDate());
    if (result.cessation && result.input.notif) assert.ok(result.cessation.getTime() > result.input.notif.getTime());
  }
  if (result.estAgent && result.indemniteDue !== null) assert.equal(result.indemniteDue, !["faute_grave", "agent", "cession"].includes(initiative));
  if (!result.estAgent) {
    assert.equal(result.indemniteDue, null);
    assert.equal(result.indemniteLabel, "Non (apporteur)");
  }
  if (result.cessation && result.limiteReclamation) assert.equal(isoDate(result.limiteReclamation), isoDate(addMonths(result.cessation, 12)));
  if (result.finNC && result.cessation) assert.ok(result.finNC.getTime() <= addMonths(result.cessation, 24).getTime());
  if (result.estAgent && result.input.nc > 24 && ecrit === "oui") assert.equal(result.controles[6].statut, "bad");
  if (result.limite && result.acquisition) {
    assert.ok(result.limite.getTime() > result.acquisition.getTime());
    assert.equal(result.limite.getUTCDate(), finDeMois(result.limite).getUTCDate());
    assert.ok([0, 3, 6, 9].includes(result.limite.getUTCMonth()));
  }
  if (result.commissionDue === "non") assert.equal(result.commissionLabel, "Pas de commission");
  assert.ok(result.commission >= 0);
  assert.ok(result.verdict.length > 20);
}
assert.equal(combos, 248832);

console.log("seo-am-20261120 ok");
