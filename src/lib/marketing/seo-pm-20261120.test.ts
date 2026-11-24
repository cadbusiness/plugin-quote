import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { activityLabel } from "../crm/quote-detail";
import { articleHtml } from "./article-html";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_STOCKAGE, BLOG_TOOLS, filterBlogPosts, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as stockageTool from "./calculateur-frais-stockage-commande-non-retiree";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const {
  DEFAULTS,
  JOURS_PERIODE,
  LABEL_SETS,
  LOI_1903_MOIS,
  POINTS,
  SEQUESTRE_MOIS,
  SLUG,
  STATUT_LABELS,
  addDays,
  addMonths,
  computeStockage,
  dec,
  ent,
  fmtDate,
  fmtEur,
  fmtNum,
  isoDate,
  joursEntre,
  nbPeriodes,
  normalize,
  parseDate,
  pluriel,
} = stockageTool as unknown as {
  DEFAULTS: Record<string, string>;
  JOURS_PERIODE: Record<string, number>;
  LABEL_SETS: Record<string, Record<string, string>>;
  LOI_1903_MOIS: number;
  POINTS: { id: string; label: string }[];
  SEQUESTRE_MOIS: number;
  SLUG: string;
  STATUT_LABELS: Record<string, string>;
  addDays: (d: Date, n: number) => Date;
  addMonths: (d: Date, n: number) => Date;
  computeStockage: (raw: Record<string, string>) => StockageResult;
  dec: (v: unknown) => number;
  ent: (v: unknown) => number;
  fmtDate: (d: Date | null) => string;
  fmtEur: (n: number) => string;
  fmtNum: (n: number) => string;
  isoDate: (d: Date | null | undefined) => string;
  joursEntre: (a: Date, b: Date) => number;
  nbPeriodes: (jours: number, periode: string) => number;
  normalize: (raw: Record<string, string>) => { nature: string; terme: number; delai: number; prix: number; med: Date | null; dispo: Date | null };
  parseDate: (s: string) => Date | null;
  pluriel: (n: number, s: string, p?: string) => string;
};

type Controle = { id: string; point: string; statut: string; texte: string };
type StockageResult = {
  x: {
    prix: number;
    nbUnites: number;
    med: Date | null;
    dispo: Date | null;
    risquesClause: string;
    solde: number;
  };
  finTerme: Date | null;
  debutFrais: Date | null;
  joursFactures: number;
  periodes: number;
  frais: number;
  medValide: boolean;
  finDelaiMED: Date | null;
  sequestreDes: Date | null;
  res1657: Date | null;
  vente1903: Date | null;
  echeance: Date | null;
  termeLabel: string;
  fraisLabel: string;
  risquesLabel: string;
  sequestreLabel: string;
  controles: Controle[];
  nbOk: number;
  nbWarn: number;
  nbBad: number;
  nbInfo: number;
  etat: string;
  verdict: string;
  actions: string[];
  clause: string;
  message: string;
  recap: string;
};

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "commande-non-retiree-frais-stockage-mise-en-demeure-client-b2b";
const BLOG_PATH = "/blog/commande-non-retiree-frais-stockage-mise-en-demeure-client-b2b";
const TOOL_PATH = "/outils/calculateur-frais-stockage-commande-non-retiree";
const DAY = "2026-11-20";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];
const TOOL_TITLE = "Calculateur de frais de stockage d'une commande non retirée";
const TOOL_TEXT = "Commande prête que le client ne vient pas chercher : frais courus, risques, mise en demeure, séquestre au bout de deux mois, la clause et le courrier.";
const PRIOR_TOOL = "/outils/calculateur-preavis-commission-agent-commercial";

assert.equal(SLUG, "calculateur-frais-stockage-commande-non-retiree");
assert.equal(BLOG_TOOL_STOCKAGE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 45);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, TOOL_TITLE);
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, TOOL_TEXT);
assert.ok(BLOG_TOOLS.findIndex((item) => item.href === TOOL_PATH) > BLOG_TOOLS.findIndex((item) => item.href === PRIOR_TOOL));

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.ok(paths.indexOf(BLOG_PATH) > paths.indexOf(PRIOR_TOOL));
assert.ok(paths.indexOf(TOOL_PATH) > paths.indexOf(BLOG_PATH));

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "${DAY}"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, DAY);
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.ok(llms.includes("Commande non retirée par le client : frais de stockage, mise en demeure et risques dans un devis B2B : https://www.quotebuilder.co" + BLOG_PATH));
assert.ok(llms.includes("Calculateur de frais de stockage et de délais pour une commande non retirée : https://www.quotebuilder.co" + TOOL_PATH));
const priorLine = llms.indexOf("https://www.quotebuilder.co" + PRIOR_TOOL);
assert.ok(llms.indexOf("https://www.quotebuilder.co" + BLOG_PATH) > priorLine);
assert.ok(llms.indexOf("https://www.quotebuilder.co" + TOOL_PATH) > llms.indexOf("https://www.quotebuilder.co" + BLOG_PATH));

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.ok(outilsHub.includes("calculateur-frais-stockage-commande-non-retiree"));
assert.ok(outilsHub.includes(TOOL_TITLE));
assert.ok(outilsHub.includes(TOOL_TEXT));
assert.ok(outilsHub.includes("calculateur de frais de stockage d'une commande non retirée"));
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-frais-stockage-commande-non-retiree"');
  assert.ok(start > outilsHub.indexOf('href: "/outils/calculateur-preavis-commission-agent-commercial"'));
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
assert.ok(outilsHub.includes("outilsHubIntro()"));

assert.equal(BLOG_TOOLS.length, 99);
assert.equal(BLOG_POSTS.length, 109);
assert.equal(outilsHubIntro(), "Quatre-vingt-dix-neuf outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(99), outilsHubIntro());
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "catalogue" }).length, 61);
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "relances" }).length, 62);

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
    "1196",
    "1219",
    "1221",
    "1225",
    "1226",
    "1229",
    "1231-1",
    "1231-2",
    "1231-5",
    "1345",
    "1345-1",
    "1345-2",
    "1345-3",
    "1612",
    "1651",
    "1657",
    "1787",
    "1788",
    "1789",
    "1790",
    "1928",
    "2286",
    "31 décembre 1903",
    "98-17.663",
    "18 400",
    "9 200",
    "210 €",
    "315 €",
    "1 260 €",
    "14 décembre 2026",
    "29 décembre 2026",
    "18 janvier",
    "19 mars",
    "hypothèses d'exemple",
    "non contractuel",
    "Gagné",
    "En attente",
    "Escalier / garde-corps",
    "/outils/calculateur-frais-stockage-commande-non-retiree",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(norm.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  const html = articleHtml(blogBody);
  assert.ok(html.includes("<table"), "blog tables");
  assert.ok((html.match(/<table/g) ?? []).length >= 5, "five markdown tables");
}

const added = [
  "src/lib/marketing/calculateur-frais-stockage-commande-non-retiree.ts",
  "src/components/marketing/calculateur-frais-stockage-commande-non-retiree-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-frais-stockage-commande-non-retiree/page.tsx",
  `src/content/blog/${BLOG_SLUG}.md`,
];
for (const rel of added) assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);

const builder = readFileSync(join(process.cwd(), "src/lib/funnels/builder.ts"), "utf8");
assert.ok(builder.includes("Texte"));
assert.ok(builder.includes("Liste"));
assert.equal(builder.includes("date"), false);
const templates = readFileSync(join(process.cwd(), "src/lib/funnels/templates.ts"), "utf8");
assert.ok(templates.includes("Menuisier"));
assert.ok(templates.includes("Escalier / garde-corps"));
const seed = readFileSync(join(process.cwd(), "src/lib/crm/seed.ts"), "utf8");
assert.ok(seed.includes("Gagné"));
assert.ok(seed.includes("Perdu"));
assert.ok(seed.includes("En attente"));
assert.equal(activityLabel("call_logged"), "Appel");
assert.equal(activityLabel("message_sent"), "Email au prospect");
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);

const pageSrc = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/calculateur-frais-stockage-commande-non-retiree/page.tsx"), "utf8");
const componentSrc = readFileSync(join(process.cwd(), "src/components/marketing/calculateur-frais-stockage-commande-non-retiree-calculator.tsx"), "utf8");
assert.ok(pageSrc.includes(TOOL_PATH));
assert.ok(pageSrc.includes("Calculateur de frais de stockage et de délais pour une commande non retirée"));
assert.ok(pageSrc.includes("pas un conseil juridique"));
assert.ok(pageSrc.includes("Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."));
assert.ok(pageSrc.includes("Calcul local, aucune donnée envoyée."));
assert.ok(componentSrc.includes("lus le 20 novembre 2026"));
assert.ok(componentSrc.includes("98-17.663"));
assert.equal((componentSrc.match(/<CopyButton /g) ?? []).length, 3);
assert.doesNotMatch(pageSrc, /\/blog\/espace-prospect-devis-en-ligne/);
for (const href of [
  "/blog/commande-non-retiree-frais-stockage-mise-en-demeure-client-b2b",
  "/blog/exception-inexecution-devis-b2b",
  "/blog/clause-reserve-propriete-devis-b2b",
  "/blog/acomptes-echeances-devis-b2b",
  "/outils/verificateur-clause-resolutoire",
  "/signup?plan=free",
  "/c/demo/rayonnage",
  "/tarifs",
]) {
  assert.ok(pageSrc.includes(href), href);
}
for (const label of [
  "Ce que vous avez fait",
  "Montant de la commande (€ HT)",
  "Reste dû par le client (€ HT)",
  "Date de mise à disposition",
  "Le client a été prévenu par écrit",
  "Délai de retrait écrit dans le devis (jours)",
  "Frais de stockage écrits dans le devis accepté",
  "Tarif de stockage (€ HT par période et par emplacement)",
  "Période de facturation",
  "Emplacements occupés",
  "Jours gratuits",
  "Solde exigible à la mise à disposition",
  "Risques transférés au client à la mise à disposition",
  "Clause de réserve de propriété",
  "Clause résolutoire en cas de non-retrait",
  "Réception de la mise en demeure",
  "Délai donné (jours)",
  "Date du calcul",
  "La commande",
  "Le devis et le stockage",
  "La relance",
  "Le résultat",
  "Le contrôle point par point",
  "La clause à écrire dans vos devis",
  "Ce qu'il faut faire",
  "La mise en demeure à envoyer au client",
  "Récapitulatif",
]) {
  assert.ok(componentSrc.includes(label), label);
}

assert.equal(Object.keys(DEFAULTS).length, 18);
assert.equal(POINTS.length, 10);
assert.equal(SEQUESTRE_MOIS, 2);
assert.equal(LOI_1903_MOIS, 12);
assert.deepEqual(JOURS_PERIODE, { jour: 1, semaine: 7, mois: 30 });
assert.equal(Object.keys(LABEL_SETS).length, 8);
assert.equal(dec("18 400"), 18400);
assert.equal(dec("2,5"), 2.5);
assert.equal(dec("1\u00a0000"), 1000);
assert.equal(dec("1\u202f000,25"), 1000.25);
assert.ok(Number.isNaN(dec("abc")));
assert.ok(Number.isNaN(dec("")));
assert.equal(ent("3,9"), 3);
assert.equal(parseDate("2027-02-30"), null);
assert.equal(parseDate("2026-13-01"), null);
assert.equal(parseDate(""), null);
assert.equal(isoDate(parseDate("2028-02-29")), "2028-02-29");
assert.equal(isoDate(addDays(parseDate("2026-12-14") as Date, 15)), "2026-12-29");
assert.equal(isoDate(addDays(parseDate("2027-02-28") as Date, 1)), "2027-03-01");
assert.equal(isoDate(addMonths(parseDate("2027-01-18") as Date, 2)), "2027-03-18");
assert.equal(isoDate(addMonths(parseDate("2026-12-31") as Date, 2)), "2027-02-28");
assert.equal(isoDate(addMonths(parseDate("2028-02-29") as Date, 12)), "2029-02-28");
assert.equal(joursEntre(parseDate("2026-12-30") as Date, parseDate("2027-03-22") as Date), 82);
assert.equal(nbPeriodes(0, "semaine"), 0);
assert.equal(nbPeriodes(7, "semaine"), 1);
assert.equal(nbPeriodes(8, "semaine"), 2);
assert.equal(nbPeriodes(83, "semaine"), 12);
assert.equal(nbPeriodes(83, "mois"), 3);
assert.equal(nbPeriodes(30, "mois"), 1);
assert.equal(nbPeriodes(13, "jour"), 13);
assert.equal(fmtDate(parseDate("2026-12-14")), "lundi 14 décembre 2026");
assert.equal(fmtDate(parseDate("2027-03-01")), "lundi 1er mars 2027");
assert.equal(fmtDate(null), "date non renseignée");
assert.equal(fmtNum(1260), "1 260");
assert.equal(fmtNum(925.5), "925,50");
assert.equal(fmtEur(18400), "18 400 €");
assert.equal(pluriel(1, "jour"), "1 jour");
assert.equal(pluriel(0, "jour"), "0 jour");
assert.equal(pluriel(2, "point bloquant", "points bloquants"), "2 points bloquants");
const nz = normalize({ nature: "autre", termeJours: "-3", delaiMED: "0", tarif: "abc" });
assert.equal(nz.nature, "entreprise");
assert.equal(nz.terme, 0);
assert.equal(nz.delai, 15);
assert.equal(nz.prix, 0);

const run = (overrides: Record<string, string>) => computeStockage({ ...DEFAULTS, ...overrides });
const S = (result: StockageResult) => result.controles.map((item) => item.statut).join(",");
const T = (result: StockageResult, index: number) => result.controles[index]?.texte ?? "";
const SUITE = { dateMED: "2027-01-18", dateCalcul: "2027-03-22" };
const REFAIT = { exigibilite: "oui", risquesClause: "oui", clauseResolutoire: "oui" };

const d = run({});
assert.equal(d.termeLabel, "mardi 29 décembre 2026");
assert.equal(d.fraisLabel, "210 € HT");
assert.equal(d.risquesLabel, "Chez vous");
assert.equal(d.sequestreLabel, "Après une mise en demeure");
assert.equal(isoDate(d.debutFrais), "2026-12-30");
assert.equal(d.joursFactures, 13);
assert.equal(d.periodes, 2);
assert.equal(d.frais, 210);
assert.equal(S(d), "info,ok,ok,ok,info,warn,warn,warn,info,warn");
assert.equal([d.nbOk, d.nbWarn, d.nbBad, d.nbInfo].join(), "3,4,0,3");
assert.equal(d.etat, "warn");
assert.equal(d.verdict, "Pas de point bloquant, 4 points à revoir.");
assert.equal(isoDate(d.echeance), "2027-01-26");
assert.ok(T(d, 2).includes("dépassé de 13 jours au lundi 11 janvier 2027"));
assert.ok(T(d, 4).startsWith("13 jours du mercredi 30 décembre 2026 au lundi 11 janvier 2027, soit 2 périodes × 35 € × 3 emplacements = 210 € HT."));
assert.ok(T(d, 5).includes("avec un délai au mardi 26 janvier 2027"));
assert.ok(T(d, 6).includes("article 1788"));
assert.ok(T(d, 8).includes("article 1226") && T(d, 8).includes("article 1221"));
assert.ok(T(d, 9).includes("9 200 € HT"));
assert.equal(d.actions.length, 5);
assert.ok(d.actions[0]?.startsWith("Envoyez la mise en demeure ci-dessous en recommandé"));
assert.ok(d.actions[1]?.includes("210 € HT au lundi 11 janvier 2027"));
assert.ok(d.actions[4]?.startsWith("Gardez dans le dossier"));
const cl = d.clause.split("\n");
assert.equal(cl.length, 8);
assert.equal(cl[0], "Mise à disposition, retrait et stockage");
assert.equal(cl[4], "4. Stockage : au-delà de 15 jours après l'avis, la commande est stockée à vos frais, au tarif de 35 € HT par semaine commencée et par emplacement occupé, facturé chaque mois.");
assert.ok(cl[5]?.endsWith("la propriété restant réservée jusqu'au paiement complet."));
assert.ok(cl[7]?.startsWith("7. Clause résolutoire"));
const msg = d.message.split("\n");
assert.equal(msg[0], "Objet : mise en demeure de prendre livraison de votre commande");
assert.ok(d.message.includes("au plus tard le mardi 26 janvier 2027"));
assert.ok(d.message.includes("article 1345 du code civil"));
assert.ok(d.message.includes("Le solde de 9 200 € HT reste dû à la livraison."));
assert.equal(d.message.includes("1657"), false);
const rc = d.recap.split("\n");
assert.equal(rc.length, 11);
assert.equal(rc[5], "Frais de stockage au lundi 11 janvier 2027 : 210 € HT");
assert.equal(rc[9], "Contrôle : 3 conformes, 4 à revoir, 0 bloquant, 3 informations");
assert.equal(rc[10], "Calcul : quotebuilder.co/outils/" + SLUG);

const s2 = run(SUITE);
assert.equal(s2.fraisLabel, "1 260 € HT");
assert.equal(s2.joursFactures, 83);
assert.equal(s2.periodes, 12);
assert.equal(s2.risquesLabel, "Au client depuis le lundi 18 janvier 2027");
assert.equal(s2.sequestreLabel, "Possible depuis le vendredi 19 mars 2027");
assert.equal(isoDate(s2.finDelaiMED), "2027-02-02");
assert.equal(S(s2), "info,ok,ok,ok,info,ok,ok,ok,info,warn");
assert.equal(s2.verdict, "Pas de point bloquant, 1 point à revoir.");
assert.ok(T(s2, 5).includes("(expiré)"));
assert.equal(s2.actions.length, 4);
assert.ok(s2.actions[1]?.startsWith("Demandez un prix à un garde-meubles"));
assert.equal(s2.recap.split("\n")[6], "Mise en demeure : reçue le lundi 18 janvier 2027, délai au mardi 2 février 2027");
assert.equal(run({ dateMED: "2027-01-18", dateCalcul: "2027-03-18" }).sequestreLabel, "À partir du vendredi 19 mars 2027");
assert.equal(run({ dateMED: "2027-01-18", dateCalcul: "2027-03-18" }).controles[7]?.statut, "info");
assert.equal(run({ dateMED: "2027-01-18", dateCalcul: "2027-01-25" }).controles[5]?.texte.includes("(en cours)"), true);
assert.equal(run({ dateMED: "2026-12-31", dateCalcul: "2027-03-22" }).sequestreLabel, "Possible depuis le lundi 1er mars 2027");

const r3 = run(REFAIT);
assert.equal(S(r3), "info,ok,ok,ok,info,warn,ok,warn,ok,ok");
assert.equal(r3.risquesLabel, "Au client depuis le lundi 14 décembre 2026");
assert.equal(r3.verdict, "Pas de point bloquant, 2 points à revoir.");
const r3b = run({ ...REFAIT, ...SUITE });
assert.equal(S(r3b), "info,ok,ok,ok,info,ok,ok,ok,ok,ok");
assert.equal(r3b.etat, "ok");
assert.equal(r3b.verdict, "Dossier en ordre : vous pouvez facturer les frais et relancer sur cette base.");
assert.ok(r3b.message.includes("est exigible depuis le lundi 14 décembre 2026."));
assert.ok(r3b.actions.some((item) => item.startsWith("Facturez le solde de 9 200 € HT")));
assert.equal(r3b.actions.some((item) => item.startsWith("Dans vos prochains devis")), false);

const av = run({ avisEcrit: "non" });
assert.equal(av.controles[1]?.statut, "bad");
assert.equal(av.verdict, "À régulariser avant toute relance : 1 point bloquant, 4 points à revoir.");
assert.ok(av.actions[0]?.startsWith("Envoyez aujourd'hui un avis écrit"));
assert.ok(av.message.includes("Nous vous le confirmons par la présente."));
const only1bad = run({ ...REFAIT, ...SUITE, avisEcrit: "non" });
assert.equal(only1bad.verdict, "À régulariser avant toute relance : 1 point bloquant.");
assert.equal(only1bad.verdict.includes("0 point à revoir"), false);

const vs = run({ nature: "vente", reserve: "non" });
assert.equal(vs.risquesLabel, "Au client depuis la vente");
assert.equal(vs.controles[6]?.statut, "info");
assert.equal(vs.controles[8]?.statut, "ok");
assert.equal(isoDate(vs.res1657), "2026-12-30");
assert.ok(T(vs, 8).includes("article 1657") && T(vs, 8).includes("article 1229"));
assert.ok(vs.message.includes("article 1657"));
assert.ok(vs.clause.split("\n")[7]?.startsWith("7. Résolution"));
const vr = run({ nature: "vente" });
assert.equal(vr.risquesLabel, "Chez vous");
assert.ok(T(vr, 6).includes("article 1196"));
const vav = run({ nature: "vente", dateCalcul: "2026-12-20" });
assert.equal(vav.controles[8]?.statut, "info");
assert.ok(T(vav, 8).includes("à partir du mercredi 30 décembre 2026"));
assert.equal(vav.fraisLabel, "0 € HT");
assert.equal(vav.controles[5]?.statut, "info");
assert.ok(vav.message.includes("courront à partir du mercredi 30 décembre 2026"));
const v0 = run({ nature: "vente", termeJours: "0" });
assert.equal(v0.termeLabel, "Aucun délai écrit");
assert.equal(v0.controles[2]?.statut, "warn");
assert.equal(v0.controles[8]?.statut, "warn");
assert.ok(T(v0, 8).includes("98-17.663") && T(v0, 8).includes("Il manque le terme"));
assert.ok(T(run({ nature: "vente", termeJours: "0", avisEcrit: "non" }), 8).includes("Il manque les deux"));
assert.ok(T(run({ nature: "vente", avisEcrit: "non" }), 8).includes("Il manque la preuve de la mise à disposition"));
const cf = run({ nature: "confie", dateCalcul: "2027-12-15" });
assert.equal(cf.controles[8]?.statut, "ok");
assert.equal(isoDate(cf.vente1903), "2027-12-15");
assert.ok(T(cf, 8).includes("loi du 31 décembre 1903"));
assert.ok(cf.actions.some((item) => item.startsWith("Préparez la requête au juge")));
assert.ok(cf.clause.split("\n")[7]?.startsWith("7. Objets confiés"));
assert.ok(cf.message.includes("loi du 31 décembre 1903"));
assert.ok(T(cf, 6).includes("article 1790"));
const cf2 = run({ nature: "confie", dateCalcul: "2027-12-14" });
assert.equal(cf2.controles[8]?.statut, "info");
assert.ok(T(cf2, 8).includes("à partir du mercredi 15 décembre 2027"));
const ns = run({ clauseStockage: "non" });
assert.equal(ns.fraisLabel, "210 € HT (estimation à justifier)");
assert.equal(ns.controles[3]?.statut, "warn");
assert.ok(T(ns, 3).includes("1231-1") && T(ns, 3).includes("article 1231)") && T(ns, 3).includes("prouver ce coût"));
assert.ok(ns.message.includes("Votre commande occupe 3 emplacements"));
assert.ok(ns.actions.some((item) => item.startsWith("Notez le coût réel")));
const inc = run({ dateMED: "2026-12-01" });
assert.equal(inc.medValide, false);
assert.equal(inc.controles[5]?.statut, "warn");
assert.ok(T(inc, 5).includes("vérifiez-la"));
assert.equal(run({ dateMED: "2027-02-01" }).medValide, false);
assert.equal(run({ periode: "mois", dateCalcul: "2027-03-22" }).fraisLabel, "315 € HT");
assert.equal(run({ periode: "jour", tarif: "2,5", unites: "4" }).fraisLabel, "130 € HT");
assert.equal(run({ periode: "jour", tarif: "1,15", unites: "1" }).fraisLabel, "14,95 € HT");
const nd = run({ dateDispo: "" });
assert.equal(nd.termeLabel, "Date à renseigner");
assert.equal(nd.controles[1]?.statut, "bad");
const pay = run({ soldeDu: "0", termeJours: "0", franchiseJours: "30" });
assert.equal(pay.controles[9]?.statut, "info");
assert.equal(pay.controles[5]?.statut, "info");
assert.equal(pay.fraisLabel, "0 € HT");
assert.equal(run({ soldeDu: "0", termeJours: "0", franchiseJours: "20" }).controles[5]?.statut, "warn");
const avant = run({ dateCalcul: "2026-12-01" });
assert.equal(avant.frais, 0);
assert.equal(/undefined|NaN|null/.test(avant.recap), false);

let combos = 0;
const keys = (name: string) => Object.keys(LABEL_SETS[name] ?? {});
const dates = [
  ["2026-12-14", "", "2027-01-11"],
  ["2026-12-14", "2027-01-18", "2027-03-22"],
  ["2026-12-14", "2027-01-18", "2027-03-18"],
  ["2026-12-14", "2026-12-01", "2027-12-15"],
  ["", "", "2027-01-11"],
  ["2028-02-29", "2028-03-31", "2029-03-01"],
  ["2026-12-14", "", "2026-12-01"],
];
const nums = [
  ["18400", "9200", "15", "35", "3", "15", "15"],
  ["0", "0", "0", "0", "0", "0", "1"],
  ["12 345,67", "1 000,50", "365", "2,5", "10000", "365", "120"],
  ["abc", "-5", "-1", "x", "", "abc", "0"],
];
for (const nature of keys("nature")) for (const avisEcrit of keys("avisEcrit")) for (const clauseStockage of keys("clauseStockage")) for (const periode of keys("periode"))
for (const exigibilite of keys("exigibilite")) for (const risquesClause of keys("risquesClause")) for (const reserve of keys("reserve")) for (const clauseResolutoire of keys("clauseResolutoire"))
for (const [dateDispo, dateMED, dateCalcul] of dates) for (const [montantHT, soldeDu, termeJours, tarif, unites, franchiseJours, delaiMED] of nums) {
  const x = computeStockage({
    nature, montantHT: montantHT ?? "", soldeDu: soldeDu ?? "", dateDispo: dateDispo ?? "", avisEcrit, termeJours: termeJours ?? "",
    clauseStockage, tarif: tarif ?? "", periode, unites: unites ?? "", franchiseJours: franchiseJours ?? "", exigibilite, risquesClause, reserve, clauseResolutoire,
    dateMED: dateMED ?? "", delaiMED: delaiMED ?? "", dateCalcul: dateCalcul ?? "",
  });
  combos += 1;
  assert.equal(x.controles.length, 10);
  assert.equal(x.nbOk + x.nbWarn + x.nbBad + x.nbInfo, 10);
  for (let i = 0; i < 10; i += 1) {
    const point = x.controles[i];
    assert.equal(point?.point, POINTS[i]?.label);
    assert.ok(point && STATUT_LABELS[point.statut], "statut");
    assert.ok(point?.texte && !/undefined|NaN|null|Invalid/.test(point.texte), "texte");
  }
  assert.equal(x.etat, x.nbBad ? "bad" : x.nbWarn ? "warn" : "ok");
  for (const text of [x.verdict, x.clause, x.message, x.recap, x.actions.join(" "), x.termeLabel, x.fraisLabel, x.risquesLabel, x.sequestreLabel]) {
    assert.equal(/undefined|NaN|null|Invalid|\[object/.test(text), false, "sortie propre");
    assert.equal(/[\u2013\u2014\u2212]/.test(text), false, "tiret");
  }
  assert.equal(x.clause.split("\n").length, 8);
  assert.equal(x.recap.split("\n").length, 11);
  assert.ok(x.actions.length >= 1 && x.actions[x.actions.length - 1]?.startsWith("Gardez dans le dossier"));
  assert.equal(/\n\n\n/.test(x.message), false);
  assert.equal(x.controles[0]?.statut, "info");
  assert.equal(x.controles[4]?.statut, "info");
  assert.ok(x.frais >= 0 && Number.isFinite(x.frais));
  assert.equal(x.frais, Math.round(x.periodes * x.x.prix * x.x.nbUnites * 100) / 100);
  if (x.periodes > 0) assert.equal(x.periodes, Math.ceil(x.joursFactures / ((JOURS_PERIODE as Record<string, number>)[periode] ?? 1)));
  if (x.medValide && x.x.med && x.sequestreDes) {
    assert.equal(isoDate(x.sequestreDes), isoDate(addDays(addMonths(x.x.med, 2), 1)));
    assert.ok(x.risquesLabel.startsWith("Au client depuis"));
  }
  if (x.x.risquesClause === "oui" && x.x.dispo) assert.equal(x.controles[6]?.statut, "ok");
  if (!x.x.dispo || avisEcrit === "non") assert.equal(x.controles[1]?.statut, "bad");
  else assert.equal(x.controles[1]?.statut, "ok");
  if (nature !== "vente") assert.equal(x.res1657, null);
  if (nature !== "confie") assert.equal(x.vente1903, null);
  if (x.res1657 && x.finTerme) assert.equal(isoDate(x.res1657), isoDate(addDays(x.finTerme, 1)));
  if (x.vente1903 && x.x.dispo) assert.equal(isoDate(x.vente1903), isoDate(addDays(addMonths(x.x.dispo, 12), 1)));
  if (x.x.solde <= 0) assert.equal(x.controles[9]?.statut, "info");
  if (clauseStockage === "non") assert.ok(x.fraisLabel.endsWith("(estimation à justifier)"));
  assert.equal(/0 point à revoir/.test(x.verdict), false);
  assert.ok(x.verdict.length > 20);
}
assert.equal(combos, 16128);
