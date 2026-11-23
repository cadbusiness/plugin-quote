import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_EXCLUSIVITE, BLOG_TOOLS, filterBlogPosts, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";
import { scoreQuote } from "../quotes/score";
import {
  DEFAULTS,
  LABEL_SETS,
  PLAFOND_L330_1_MOIS,
  POINTS,
  POST_MAX_MOIS,
  SEUIL_ACHATS_PCT,
  SEUIL_EXEMPTION_PCT,
  SEUIL_MINIMIS_CONCURRENTS,
  SEUIL_MINIMIS_NON_CONCURRENTS,
  SEUIL_NON_CONCURRENCE_MOIS,
  SLUG,
  STATUT_LABELS,
  addDays,
  addMonths,
  computeExclusivite,
  dec,
  ent,
  finApres,
  fmtDate,
  fmtDuree,
  fmtNum,
  fmtPct,
  isoDate,
  normalize,
  parseDate,
  pluriel,
  renderView,
} from "./verificateur-clause-exclusivite";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "clause-exclusivite-devis-contrat-approvisionnement-b2b";
const BLOG_PATH = "/blog/clause-exclusivite-devis-contrat-approvisionnement-b2b";
const TOOL_PATH = "/outils/verificateur-clause-exclusivite";
const DAY = "2026-11-19";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];
const TOOL_TEXT = "Achat ou fourniture exclusive : plafond de dix ans, seuil de cinq ans, contrats successifs, périmètre, sortie, la clause corrigée et le message.";

assert.equal(SLUG, "verificateur-clause-exclusivite");
assert.equal(BLOG_TOOL_EXCLUSIVITE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 34);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de clause d'exclusivité");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, TOOL_TEXT);

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
const routePaths = paths;
const morningTool = routePaths.indexOf("/outils/verificateur-pret-main-oeuvre-devis");
assert.ok(routePaths.indexOf(BLOG_PATH) > morningTool);
assert.ok(routePaths.indexOf(TOOL_PATH) > routePaths.indexOf(BLOG_PATH));

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "${DAY}"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, DAY);
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.ok(llms.includes("https://www.quotebuilder.co" + BLOG_PATH));
assert.ok(llms.includes("Clause d'exclusivité dans un devis B2B : durée, périmètre et contreparties d'un achat ou d'une fourniture exclusive : https://www.quotebuilder.co" + BLOG_PATH));
assert.ok(llms.includes("Vérificateur de clause d'exclusivité dans un devis ou un contrat d'approvisionnement : https://www.quotebuilder.co" + TOOL_PATH));
const pretToolLine = llms.indexOf("https://www.quotebuilder.co/outils/verificateur-pret-main-oeuvre-devis");
assert.ok(llms.indexOf("https://www.quotebuilder.co" + TOOL_PATH) > pretToolLine);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.ok(outilsHub.includes("verificateur-clause-exclusivite"));
assert.ok(outilsHub.includes("Vérificateur de clause d'exclusivité"));
assert.ok(outilsHub.includes(TOOL_TEXT));
{
  const start = outilsHub.indexOf('href: "/outils/verificateur-clause-exclusivite"');
  assert.ok(start > outilsHub.indexOf('href: "/outils/verificateur-pret-main-oeuvre-devis"'));
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
assert.match(outilsHub, /vérificateur de clause d'exclusivité/);

assert.equal(BLOG_TOOLS.length, 98);
assert.equal(BLOG_POSTS.length, 108);
assert.equal(outilsHubIntro(), "Quatre-vingt-dix-huit outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(98), outilsHubIntro());
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "catalogue" }).length, 60);
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "relances" }).length, 61);

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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 6813);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertNoDashes(blogRaw, "blog md");
  assertInternalLinks(blogBody, "blog");
  const norm = blogBody.replace(/[\u00a0\u202f]/g, " ");
  for (const needle of [
    "L330-1",
    "L330-2",
    "L330-3",
    "L442-1",
    "L420-2",
    "L464-6-1",
    "1210",
    "1211",
    "1171",
    "1231-5",
    "2022/720",
    "25-14.358",
    "11-17.797",
    "24-17.137",
    "09-10.980",
    "02-15.950",
    "80 %",
    "30 %",
    "15 %",
    "10 %",
    "18 000",
    "42 000",
    "378 000",
    "7 200",
    "4 janvier 2027",
    "3 janvier 2032",
    "3 janvier 2037",
    "3 janvier 2039",
    "hypothèses d'exemple",
    "non contractuel",
    "Gagné",
    "Perdu",
    "/outils/verificateur-clause-exclusivite",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(norm.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
}

const builderSrc = readFileSync(join(process.cwd(), "src/lib/funnels/builder.ts"), "utf8");
assert.match(builderSrc, /"Texte"/);
assert.match(builderSrc, /"Liste"/);
const seedSrc = readFileSync(join(process.cwd(), "src/lib/crm/seed.ts"), "utf8");
assert.match(seedSrc, /Gagné/);
assert.match(seedSrc, /Perdu/);
assert.match(seedSrc, /is_closed: true/);
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);
assert.deepEqual(scoreQuote({}), { score: 30, label: "cold" });
assert.deepEqual(scoreQuote({ exclusivite: "oui", contrat: "en cours", fournisseur: "concurrent" }), { score: 30, label: "cold" });

for (const rel of [
  "src/lib/marketing/verificateur-clause-exclusivite.ts",
  "src/components/marketing/verificateur-clause-exclusivite-calculator.tsx",
  "src/app/(marketing)/outils/verificateur-clause-exclusivite/page.tsx",
  "src/content/blog/clause-exclusivite-devis-contrat-approvisionnement-b2b.md",
  "src/lib/marketing/seo-pm-20261119.test.ts",
]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}

const pageSrc = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/verificateur-clause-exclusivite/page.tsx"), "utf8");
assert.ok(pageSrc.includes("Vérificateur de clause d'exclusivité dans un devis ou un contrat d'approvisionnement"));
assert.ok(pageSrc.includes("Calcul local, aucune donnée envoyée"));
assert.ok(pageSrc.includes("Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."));
assert.ok(pageSrc.includes("pas un conseil juridique") || pageSrc.includes("ne constitue pas un conseil juridique"));
for (const href of [
  "/blog/clause-exclusivite-devis-contrat-approvisionnement-b2b",
  "/blog/rupture-brutale-relations-commerciales-devis-b2b",
  "/blog/cgv-conditions-achat-client-devis-b2b",
  "/blog/contrat-cadre-bordereau-prix-unitaires-devis-b2b",
  "/blog/outillage-specifique-moule-propriete-amortissement-devis-b2b",
  "/signup?plan=free",
  "/c/demo/rayonnage",
  "/tarifs",
]) {
  assert.ok(pageSrc.includes(href), href);
}
assert.doesNotMatch(pageSrc, / · QuoteBuilder/);

assert.equal(Object.keys(DEFAULTS).length, 18);
assert.equal(POINTS.length, 10);
assert.equal(PLAFOND_L330_1_MOIS, 120);
assert.equal(SEUIL_NON_CONCURRENCE_MOIS, 60);
assert.equal(SEUIL_ACHATS_PCT, 80);
assert.equal(POST_MAX_MOIS, 12);
assert.equal(SEUIL_EXEMPTION_PCT, 30);
assert.equal(SEUIL_MINIMIS_NON_CONCURRENTS, 15);
assert.equal(SEUIL_MINIMIS_CONCURRENTS, 10);
assert.equal(Object.keys(LABEL_SETS).length, 11);

assert.equal(isoDate(parseDate("2027-01-04")), "2027-01-04");
assert.equal(parseDate("2027-02-30"), null);
assert.equal(parseDate("04/01/2027"), null);
assert.equal(parseDate(""), null);
assert.equal(isoDate(addMonths(parseDate("2027-01-31"), 1)), "2027-02-28");
assert.equal(isoDate(addMonths(parseDate("2028-01-31"), 1)), "2028-02-29");
assert.equal(isoDate(finApres(parseDate("2027-01-04"), 120)), "2037-01-03");
assert.equal(isoDate(finApres(parseDate("2027-01-04"), 60)), "2032-01-03");
assert.equal(isoDate(finApres(parseDate("2027-01-04"), 144)), "2039-01-03");
assert.equal(isoDate(addDays(parseDate("2026-12-31"), 1)), "2027-01-01");
assert.equal(fmtDate(parseDate("2027-01-04")), "lundi 4 janvier 2027");
assert.equal(fmtDate(parseDate("2037-01-03")), "samedi 3 janvier 2037");
assert.equal(fmtDate(parseDate("2032-01-03")), "samedi 3 janvier 2032");
assert.equal(fmtDate(parseDate("2039-01-03")), "lundi 3 janvier 2039");
assert.equal(fmtDate(null), "");
assert.equal(fmtNum(12345), "12\u202f345");
assert.equal(fmtPct(30), "30 %");
assert.equal(fmtDuree(144), "144 mois (12 ans)");
assert.equal(fmtDuree(60), "60 mois (5 ans)");
assert.equal(fmtDuree(18), "18 mois (1 an et 6 mois)");
assert.equal(fmtDuree(0), "non renseignée");
assert.equal(dec("2,5", 100), 2.5);
assert.equal(dec("abc", 10), 0);
assert.equal(dec("1\u00a0200", 5000), 1200);
assert.equal(ent("6,9", 120), 6);
assert.equal(ent("", 50), 0);
assert.equal(pluriel(1, "mois", "mois"), "1 mois");
const n0 = normalize({ sens: "x", objet: "y", dureeMois: "999", partAchats: "120" }) as {
  sens: string;
  objet: string;
  dureeMois: number;
  partAchats: number;
  dateDebut: Date | null;
};
assert.equal(n0.sens, "achat_exclusif");
assert.equal(n0.objet, "biens");
assert.equal(n0.dureeMois, 600);
assert.equal(n0.partAchats, 100);
assert.equal(n0.dateDebut, null);

const run = (o: Record<string, string>) => computeExclusivite({ ...DEFAULTS, ...o });
const S = (r: { controles: { statut: string }[] }) => r.controles.map((c) => c.statut).join(",");
const T = (r: { controles: { texte: string }[] }, i: number) => r.controles[i].texte;
const CORRIGE = { typeDuree: "determinee", dureeMois: "60", postMois: "0", sortie: "preavis", penalite: "chiffree" };

const d = computeExclusivite(DEFAULTS);
assert.equal(d.finLabel, "lundi 3 janvier 2039");
assert.equal(d.dureeLabel, "144 mois (12 ans)");
assert.equal(d.limiteLabel, "samedi 3 janvier 2037");
assert.equal(d.cinqLabel, "samedi 3 janvier 2032");
assert.equal(S(d), "info,bad,info,ok,ok,warn,warn,ok,warn,info");
assert.deepEqual([d.nbOk, d.nbWarn, d.nbBad, d.nbInfo], [3, 3, 1, 3]);
assert.equal(d.etat, "bad");
assert.equal(d.verdict, "À corriger avant de signer : 1 point bloquant, 3 points à revoir. L'exclusivité ne vaudrait que jusqu'au samedi 3 janvier 2037.");
assert.ok(T(d, 1).includes("au-delà de dix ans, la clause n'est plus valable (article L330-1), soit après le samedi 3 janvier 2037"));
assert.equal(d.actions.length, 6);
assert.ok(d.actions[0].startsWith("Ramenez la durée de l'exclusivité à 60 mois au plus"));
assert.ok(d.actions[d.actions.length - 1].startsWith("Faites relire la clause par votre conseil"));
assert.equal(d.recMois, 60);
assert.equal(isoDate(d.recFin), "2032-01-03");
const clauseLines = d.clause.split("\n");
assert.equal(clauseLines.length, 8);
assert.equal(clauseLines[0], "Exclusivité");
assert.equal(clauseLines[3], "Durée : 60 mois à compter du lundi 4 janvier 2027, soit jusqu'au samedi 3 janvier 2032, sans reconduction tacite de l'exclusivité ; toute prolongation fera l'objet d'un accord écrit.");
const recapLines = d.recap.split("\n");
assert.equal(recapLines.length, 11);
assert.equal(recapLines[10], "Calcul : quotebuilder.co/outils/verificateur-clause-exclusivite");

const view = renderView(DEFAULTS) as {
  finOut: { text: string };
  dureeOut: { text: string };
  limiteOut: { text: string };
  cinqOut: { text: string };
  compteurs: { text: string };
  verdict: { className: string; text: string };
  controles: { rows: unknown[] };
  actions: { items: unknown[] };
  clause: { text: string };
  recapOut: { text: string };
};
assert.equal(view.finOut.text, "lundi 3 janvier 2039");
assert.equal(view.dureeOut.text, "144 mois (12 ans)");
assert.equal(view.limiteOut.text, "samedi 3 janvier 2037");
assert.equal(view.cinqOut.text, "samedi 3 janvier 2032");
assert.equal(view.compteurs.text, "1 / 3");
assert.equal(view.verdict.className, "alert bad");
assert.equal(view.controles.rows.length, 10);
assert.equal(view.actions.items.length, 6);
assert.equal(view.clause.text.split("\n").length, 8);
assert.equal(view.recapOut.text.split("\n").length, 11);

const p = run(CORRIGE);
assert.equal(S(p), "info,ok,info,ok,ok,ok,ok,ok,ok,info");
assert.equal(p.etat, "ok");
assert.equal(p.finLabel, "samedi 3 janvier 2032");
assert.equal(p.verdict, "Clause cohérente avec les textes vérifiés. Gardez la trace de la négociation dans le dossier.");

assert.equal(run({ ...CORRIGE, dureeMois: "120" }).controles[1].statut, "ok");
assert.equal(run({ ...CORRIGE, dureeMois: "120" }).controles[5].statut, "warn");
assert.equal(run({ ...CORRIGE, dureeMois: "120", partAchats: "80" }).controles[5].statut, "ok");
assert.equal(run({ ...CORRIGE, dureeMois: "120", partAchats: "80" }).cinqLabel, "Sans objet");

const m121 = run({ ...CORRIGE, dureeMois: "121" });
assert.equal(m121.controles[1].statut, "bad");
assert.equal(m121.verdict, "À corriger avant de signer : 1 point bloquant, 1 point à revoir. L'exclusivité ne vaudrait que jusqu'au samedi 3 janvier 2037.");

const ind = run({ ...CORRIGE, typeDuree: "indeterminee" });
assert.equal(ind.controles[1].statut, "bad");
assert.equal(ind.finLabel, "Sans terme");
assert.ok(ind.verdict.includes("ne vaudrait que jusqu'au samedi 3 janvier 2037"));

const sv = run({ ...CORRIGE, objet: "services", typeDuree: "indeterminee" });
assert.equal(sv.controles[1].statut, "warn");
assert.ok(T(sv, 1).includes("article 1211"));
assert.equal(sv.limiteLabel, "Sans objet");
assert.equal(sv.finLabel, "Sans terme");

const s2 = run({ ...CORRIGE, finPremier: "2027-06-30" });
assert.equal(s2.controles[2].statut, "bad");
assert.equal(s2.verdict, "À corriger avant de signer : 1 point bloquant.");
assert.doesNotMatch(s2.verdict, /0 point à revoir/);
assert.ok(s2.clause.split("\n")[3].includes("jusqu'au mercredi 30 juin 2027, date de fin de l'exclusivité du premier contrat (article L330-2)"));

assert.equal(run({ ...CORRIGE, concurrents: "oui", pdmFournisseur: "6", pdmAcheteur: "4" }).controles[4].statut, "ok");
assert.equal(run({ ...CORRIGE, concurrents: "oui", pdmFournisseur: "6", pdmAcheteur: "4.5" }).controles[4].statut, "warn");
assert.equal(run({ ...CORRIGE, pdmFournisseur: "31" }).controles[4].statut, "warn");
assert.equal(run({ ...CORRIGE, postMois: "12", postCadre: "locaux_savoirfaire" }).controles[6].statut, "ok");
assert.equal(run({ ...CORRIGE, postMois: "13", postCadre: "locaux_savoirfaire" }).controles[6].statut, "warn");
assert.equal(run({ ...CORRIGE, marque: "oui" }).controles[9].statut, "bad");
assert.equal(run({ ...CORRIGE, marque: "oui", dip: "tardif" }).controles[9].statut, "warn");
assert.equal(run({ ...CORRIGE, marque: "oui", dip: "remis_20j" }).controles[9].statut, "ok");

const f = run({ sens: "fourniture_exclusive", perimetre: "similaires", contrepartie: "aucune", dureeMois: "84", postMois: "36" });
assert.equal(S(f), "info,info,info,warn,ok,info,warn,warn,warn,info");
assert.equal(f.etat, "warn");
assert.equal(f.verdict, "Pas de point bloquant, 4 points à revoir avant de signer.");
assert.equal(f.finLabel, "mardi 3 janvier 2034");
assert.equal(f.limiteLabel, "Sans objet");
assert.equal(f.cinqLabel, "Sans objet");
const fFixe = run({ sens: "fourniture_exclusive", perimetre: "similaires", contrepartie: "aucune", typeDuree: "determinee", dureeMois: "84", postMois: "36" });
assert.equal(S(fFixe), "info,ok,info,warn,ok,info,warn,warn,warn,info");
assert.equal(fFixe.verdict, "Pas de point bloquant, 4 points à revoir avant de signer.");
assert.equal(fFixe.finLabel, "mardi 3 janvier 2034");

const dirty = /undefined|NaN|null|Invalid|\[\[/;
const longDash = /[\u2013\u2014\u2212]/;
let combos = 0;
const keys = (k: string) => Object.keys(LABEL_SETS[k as keyof typeof LABEL_SETS]);
const durees = [["144", "2027-01-04", ""], ["60", "2027-01-04", "2027-06-30"], ["0", "", ""], ["120", "2028-02-29", "2026-03-31"], ["abc", "2027-13-01", "2040-01-01"]];
const nums = [["100", "24", "3", "2"], ["50", "0", "31", "12,5"], ["80,5", "12", "6", "4"]];
for (const sens of keys("sens")) for (const objet of keys("objet")) for (const typeDuree of keys("typeDuree")) for (const perimetre of keys("perimetre"))
for (const postCadre of keys("postCadre")) for (const concurrents of keys("concurrents")) for (const marque of keys("marque")) for (const dip of keys("dip"))
for (const contrepartie of keys("contrepartie")) for (const sortie of keys("sortie")) for (const penalite of keys("penalite"))
for (const [dureeMois, dateDebut, finPremier] of durees) for (const [partAchats, postMois, pdmFournisseur, pdmAcheteur] of nums) {
  combos += 1;
  if (combos % 16 !== 1) continue;
  const x = computeExclusivite({ sens, objet, typeDuree, dureeMois, dateDebut, finPremier, perimetre, partAchats, postMois, postCadre, pdmFournisseur, pdmAcheteur, concurrents, marque, dip, contrepartie, sortie, penalite });
  assert.equal(x.controles.length, 10);
  assert.equal(x.nbOk + x.nbWarn + x.nbBad + x.nbInfo, 10);
  for (let i = 0; i < 10; i += 1) {
    const c = x.controles[i];
    assert.equal(c.point, POINTS[i]);
    assert.ok(STATUT_LABELS[c.statut as keyof typeof STATUT_LABELS]);
    assert.ok(c.texte && !dirty.test(c.texte));
  }
  assert.equal(x.etat, x.nbBad ? "bad" : x.nbWarn ? "warn" : "ok");
  for (const s of [x.verdict, x.clause, x.message, x.recap, x.actions.join(" "), x.finLabel, x.limiteLabel, x.cinqLabel, x.dureeLabel]) {
    assert.ok(!dirty.test(s));
    assert.ok(!longDash.test(s));
  }
  assert.equal(x.clause.split("\n").length, 8);
  assert.equal(x.recap.split("\n").length, 11);
}

assert.ok(combos === 1399680, `combos ${combos}`);

console.log("seo-pm-20261119 ok");
