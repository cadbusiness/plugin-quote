import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_DEVOIR_CONSEIL,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";
import {
  DEFAULTS,
  LABEL_SETS,
  MAX_MONTANT,
  POINTS,
  SLUG,
  STATUT_LABELS,
  dec,
  fmtEur,
  fmtNum,
  fmtPct,
  montant,
  normalize,
  pluriel,
  round2,
  verifierConseil,
} from "./verificateur-devoir-conseil-client-professionnel";

const FORBIDDEN = /[\u2014\u2013\u2212]/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "devoir-conseil-information-client-professionnel-devis-b2b";
const BLOG_PATH = "/blog/devoir-conseil-information-client-professionnel-devis-b2b";
const TOOL_PATH = "/outils/verificateur-devoir-conseil-client-professionnel";
const DAY = "2026-11-24";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];
const TOOL_TITLE = "Vérificateur de devoir de conseil envers un client professionnel";
const TOOL_TEXT =
  "Matériel inadapté à l'usage du client : le conseil est-il dû, qui doit prouver quoi, dix points, la part discutable d'une remise à niveau, la mention de devis et le courrier.";
const PRIOR_TOOL = "/outils/calculateur-reduction-prix-execution-imparfaite";
const PRIOR_BLOG = "/blog/reduction-prix-execution-imparfaite-article-1223-devis-b2b";
const HUB_101 = "Cent deux outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.";
const HUB_99 = "Quatre-vingt-dix-neuf outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.";

type Controle = { id: string; point: string; statut: string; texte: string };
type Conseil = {
  devoirLabel: string;
  preuveLabel: string;
  adaptLabel: string;
  ecartLabel: string;
  verdict: string;
  etat: string;
  nbOk: number;
  nbWarn: number;
  nbBad: number;
  nbInfo: number;
  plein: boolean;
  reduit: boolean;
  assiste: boolean;
  pct: number | null;
  deTouteFacon: number;
  ecart: number;
  actions: string[];
  clause: string;
  message: string;
  recap: string;
  controles: Controle[];
  x: { coutAdaptation: number; surcoutInitial: number; competence: string };
};
type Norm = { relation: string; competence: string; incident: string; montantDevis: number; coutAdaptation: number };

const run = (overrides: Record<string, string>) => verifierConseil({ ...DEFAULTS, ...overrides }) as unknown as Conseil;
const S = (result: Conseil) => result.controles.map((item) => item.statut).join(",");
const T = (result: Conseil, index: number) => result.controles[index].texte;
const BON = { usage: "oui", limites: "ecrites", clause: "recap", preuve: "dossier" };

assert.equal(SLUG, "verificateur-devoir-conseil-client-professionnel");
assert.equal(BLOG_TOOL_DEVOIR_CONSEIL, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 38);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
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
const blogTitle = BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title ?? "";
assert.ok(llms.includes(`${blogTitle} : https://www.quotebuilder.co${BLOG_PATH}`));
assert.ok(llms.includes(`${TOOL_TITLE} : https://www.quotebuilder.co${TOOL_PATH}`));
assert.ok(llms.indexOf(`https://www.quotebuilder.co${BLOG_PATH}`) > llms.indexOf(`https://www.quotebuilder.co${PRIOR_TOOL}`));
assert.ok(llms.indexOf(`https://www.quotebuilder.co${TOOL_PATH}`) > llms.indexOf(`https://www.quotebuilder.co${BLOG_PATH}`));
assert.ok(llms.indexOf(`https://www.quotebuilder.co${PRIOR_BLOG}`) > 0);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.ok(outilsHub.includes("verificateur-devoir-conseil-client-professionnel"));
assert.ok(outilsHub.includes(TOOL_TITLE));
assert.ok(outilsHub.includes(TOOL_TEXT));
assert.ok(outilsHub.includes("vérificateur de devoir de conseil envers un client professionnel"));
{
  const start = outilsHub.indexOf('href: "/outils/verificateur-devoir-conseil-client-professionnel"');
  assert.ok(start > outilsHub.indexOf('href: "/outils/calculateur-reduction-prix-execution-imparfaite"'));
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
assert.ok(outilsHub.includes("outilsHubIntro()"));

assert.equal(BLOG_TOOLS.length, 102);
assert.equal(BLOG_POSTS.length, 112);
assert.equal(outilsHubIntro(), HUB_101);
assert.equal(outilsHubIntro(102), outilsHubIntro());
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());
assert.equal(outilsHubIntro(99), HUB_99);

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
    "1112-1",
    "1104",
    "1137",
    "1170",
    "1171",
    "1190",
    "1231-1",
    "1231-3",
    "1353",
    "1602",
    "L110-3",
    "09-16.913",
    "12-26.109",
    "15-16.315",
    "19-11.742",
    "24-13.471",
    "25-11.256",
    "publié au Bulletin",
    "18 400 €",
    "6 800 €",
    "3 100 €",
    "3 700 €",
    "1 900 €",
    "36,96 %",
    "1 050 kg",
    "hypothèses d'exemple",
    "non contractuel",
    "Gagné",
    "Plan (PDF ou image)",
    "Configurateur projet",
    "/outils/verificateur-devoir-conseil-client-professionnel",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(norm.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
}

const templates = readFileSync(join(process.cwd(), "src/lib/funnels/templates.ts"), "utf8");
assert.ok(templates.includes('id: "racking"'));
assert.ok(templates.includes('label: "Configurateur projet"'));
assert.ok(templates.includes('key: "project_type"'));
assert.ok(templates.includes('key: "surface"'));
assert.ok(templates.includes('key: "height"'));
assert.ok(templates.includes('key: "load"'));
const builder = readFileSync(join(process.cwd(), "src/lib/funnels/builder.ts"), "utf8");
assert.ok(builder.includes("Texte"));
assert.ok(builder.includes("Liste"));
assert.ok(builder.includes("Mesure"));
assert.ok(builder.includes("Choix multiple"));
assert.ok(builder.includes("Fichier"));
assert.equal(builder.includes('type: "date"'), false);
const seed = readFileSync(join(process.cwd(), "src/lib/crm/seed.ts"), "utf8");
assert.ok(seed.includes("Gagné"));
assert.ok(seed.includes("Perdu"));
assert.ok(seed.includes("En attente"));
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);
const collaborators = readFileSync(join(process.cwd(), "src/lib/prospect/collaborators.ts"), "utf8");
assert.ok(collaborators.includes("Responsable technique"));
assert.ok(collaborators.includes("Directeur financier"));
assert.ok(collaborators.includes("Acheteur"));
const prospectSpace = readFileSync(join(process.cwd(), "src/app/(public)/suivi/[token]/prospect-space.tsx"), "utf8");
assert.ok(prospectSpace.includes("Compléter la demande"));
assert.ok(prospectSpace.includes("Valider le dossier"));
assert.ok(prospectSpace.includes("Demander des modifications"));

const added = [
  "src/lib/marketing/verificateur-devoir-conseil-client-professionnel.ts",
  "src/components/marketing/verificateur-devoir-conseil-client-professionnel-calculator.tsx",
  "src/app/(marketing)/outils/verificateur-devoir-conseil-client-professionnel/page.tsx",
  "src/lib/marketing/seo-pm-20261124.test.ts",
  `src/content/blog/${BLOG_SLUG}.md`,
];
for (const rel of added) assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);

const pageSrc = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/verificateur-devoir-conseil-client-professionnel/page.tsx"),
  "utf8",
);
const componentSrc = readFileSync(
  join(process.cwd(), "src/components/marketing/verificateur-devoir-conseil-client-professionnel-calculator.tsx"),
  "utf8",
);
assert.ok(pageSrc.includes(TOOL_TITLE));
assert.ok(pageSrc.includes("Vous vendez, installez ou fabriquez du matériel pour une entreprise"));
assert.ok(pageSrc.includes("pas un conseil juridique"));
assert.ok(pageSrc.includes("Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."));
assert.ok(pageSrc.includes("Calcul local, aucune donnée envoyée."));
assert.ok(pageSrc.includes("WebApplication"));
assert.ok(pageSrc.includes(BLOG_PATH));
assert.ok(pageSrc.includes("/blog/qualifier-demande-devis-avant-chiffrage"));
assert.ok(pageSrc.includes("/blog/visite-technique-avant-devis-b2b"));
assert.ok(pageSrc.includes("/blog/clause-limitation-responsabilite-devis-b2b"));
assert.ok(pageSrc.includes("/outils/verificateur-clause-limitation-responsabilite"));
assert.ok(pageSrc.includes("/signup?plan=free"));
assert.ok(pageSrc.includes("/c/demo/rayonnage"));
assert.ok(pageSrc.includes("/tarifs"));
assert.equal(pageSrc.includes('type="date"'), false);
assert.equal(componentSrc.includes('type="date"'), false);
assert.equal((componentSrc.match(/<CopyButton /g) ?? []).length, 3);
for (const label of [
  "Le contrat et le client",
  "Ce que vous faites pour ce client",
  "Ce que le client sait faire",
  "C'est la compétence réelle qui compte, pas le métier inscrit au registre (arrêt du 8 juillet 2026).",
  "Le besoin et le devis",
  "Comment le client a exprimé son besoin",
  "Le devis rappelle l'usage prévu (charges, cadence, environnement)",
  "Visite ou relevé sur place",
  "Limites d'emploi écrites dans le devis",
  "Le client impose un choix que vous déconseillez",
  "Préalables à la charge du client (alimentation, sol, accès, autorisation)",
  "Clause du devis sur l'information du client",
  "Ce que vous gardez dans le dossier",
  "La situation et les montants",
  "Où en êtes-vous",
  "Montant du devis (€ HT)",
  "Coût de la remise à niveau (€ HT)",
  "0 si rien n'est demandé.",
  "Surcoût de la bonne solution au départ (€ HT)",
  "Ce que le client aurait payé en plus si elle avait été prévue dans le devis.",
  "Le résultat",
  "Devoir de conseil envers ce client",
  "Ce que vous devez prouver",
  "Remise à niveau rapportée au devis",
  "Part discutable de la remise à niveau (au plus)",
  "Points bloquants / à revoir",
  "Le contrôle point par point",
  "Textes lus le 24 novembre 2026",
  "publié au Bulletin",
  "La mention à écrire dans vos devis",
  "Ce qu'il faut faire",
  "Le courrier au client",
  "Récapitulatif",
]) {
  assert.ok(componentSrc.includes(label), label);
}

assert.equal(Object.keys(DEFAULTS).length, 14);
assert.equal(POINTS.length, 10);
assert.equal(MAX_MONTANT, 100000000);
assert.equal(Object.keys(LABEL_SETS).length, 11);
assert.deepEqual(Object.keys(STATUT_LABELS), ["ok", "warn", "bad", "info"]);
assert.equal(dec("1 000,50"), 1000.5);
assert.equal(dec("18400"), 18400);
assert.ok(Number.isNaN(dec("abc")));
assert.ok(Number.isNaN(dec("")));
assert.ok(Number.isNaN(dec(null)));
assert.ok(Number.isNaN(dec("2e5")));
assert.equal(montant("-5"), 0);
assert.equal(montant("abc"), 0);
assert.equal(montant("200000000"), MAX_MONTANT);
assert.equal(montant("12,345"), 12.35);
assert.equal(round2(36.95652), 36.96);
assert.equal(fmtNum(1234567.891), "1 234 567,89");
assert.equal(fmtNum(2.999), "3");
assert.equal(fmtNum(0), "0");
assert.equal(fmtNum(1000.5), "1 000,50");
assert.equal(fmtEur(6800), "6 800 €");
assert.equal(fmtPct(36.96), "36,96 %");
assert.equal(pluriel(1, "point bloquant", "points bloquants"), "1 point bloquant");
assert.equal(pluriel(2, "point bloquant", "points bloquants"), "2 points bloquants");
const plurielLoose = pluriel as (n: number, singular: string, plural?: string) => string;
assert.equal(plurielLoose(0, "conforme"), "0 conforme");
assert.equal(plurielLoose(3, "conforme"), "3 conformes");
const nz = normalize({ relation: "pirate", competence: " meme ", montantDevis: "x" }) as unknown as Norm;
assert.equal(nz.relation, "vente_pose");
assert.equal(nz.competence, "meme");
assert.equal(nz.montantDevis, 0);
assert.equal(nz.coutAdaptation, 0);
assert.equal((normalize(null) as unknown as Norm).incident, "inadapte");

const d = run({});
assert.equal(S(d), "info,info,ok,warn,ok,warn,info,ok,warn,warn");
assert.deepEqual([d.nbOk, d.nbWarn, d.nbBad, d.nbInfo], [3, 4, 0, 3]);
assert.equal(d.etat, "warn");
assert.equal(d.verdict, "Pas de point bloquant, 4 points à revoir.");
assert.equal(d.devoirLabel, "Dû pleinement");
assert.equal(d.preuveLabel, "Que vous vous êtes renseigné et avez informé");
assert.equal(d.adaptLabel, "6 800 € HT, soit 36,96 % du devis");
assert.equal(d.ecartLabel, "3 700 € HT");
assert.equal(d.deTouteFacon, 3100);
assert.equal(d.ecart, 3700);
assert.equal(d.pct, 36.96);
assert.ok(T(d, 1).includes("28 octobre 2010"));
assert.ok(T(d, 5).includes("charge maximale par niveau : 800 kg"));
assert.equal(d.actions.length, 7);
assert.ok(d.actions[0].startsWith("Ajoutez au devis un paragraphe « Usage prévu »"));
assert.ok(d.actions[5].includes("(3 100 € HT)") && d.actions[5].includes("(3 700 € HT)"));
assert.ok(d.actions[6].startsWith("Gardez dans le dossier les questions posées"));
const clauseLines = d.clause.split("\n");
assert.equal(clauseLines.length, 7);
assert.equal(clauseLines[0], "Besoin exprimé et conditions d'emploi");
assert.equal(clauseLines[1], "Usage prévu, tel que vous nous l'avez décrit dans vos réponses du [date] : [usage, charges, cadence, environnement].");
assert.equal(clauseLines[3], "Aucun préalable n'est nécessaire chez vous, d'après notre visite du [date].");
assert.equal(clauseLines[6], "Ce devis récapitule les informations échangées avant sa signature ; il ne limite pas notre devoir d'information.");
assert.ok(d.message.startsWith("Objet : votre réclamation du [date] sur [matériel]"));
assert.ok(d.message.includes("vous évaluez sa remise à niveau à 6 800 € HT."));
assert.ok(d.message.includes("Une partie de ce coût, 3 100 € HT"));
assert.ok(d.message.includes("c'est la part restante, 3 700 € HT"));
assert.ok(d.message.includes("ne vaut pas reconnaissance de responsabilité"));
const recapLines = d.recap.split("\n");
assert.equal(recapLines.length, 11);
assert.equal(recapLines[7], "Remise à niveau : 6 800 € HT, soit 36,96 % du devis");
assert.equal(recapLines[8], "Part discutable : 3 700 € HT");
assert.equal(recapLines[9], "Contrôle : 3 conformes, 4 à revoir, 0 bloquant, 3 informations");
assert.equal(recapLines[10], "Vérification : quotebuilder.co/outils/" + SLUG);

const ok = run(BON);
assert.equal(S(ok), "info,info,ok,ok,ok,ok,info,ok,ok,ok");
assert.equal(ok.etat, "ok");
assert.equal(ok.verdict, "Dossier solide : le besoin, les limites et les mises en garde sont écrits.");
assert.ok(T(ok, 9).includes("L110-3"));

const nul = run({ besoin: "aucun", usage: "non" });
assert.equal(S(nul), "info,info,bad,bad,ok,warn,info,ok,warn,warn");
assert.equal(nul.verdict, "À reprendre avant de répondre au client : 2 points bloquants, 3 points à revoir.");
assert.ok(nul.message.includes("sans indication particulière sur l'usage prévu"));
assert.equal(nul.message.includes("[valeurs écrites dans le devis]"), false);

const nulAvant = run({ besoin: "aucun", usage: "non", incident: "aucun" });
assert.ok(nulAvant.verdict.startsWith("À reprendre avant d'envoyer le devis : 2 points bloquants"));
assert.ok(nulAvant.message.startsWith("Objet : votre devis n° [référence] : usage prévu et limites d'emploi"));
assert.equal(nulAvant.message.includes("reconnaissance de responsabilité"), false);

const util = run({ competence: "utilisateur", preuve: "aucune" });
assert.equal(util.controles[1].statut, "warn");
assert.ok(T(util, 1).includes("8 juillet 2026"));
assert.equal(util.controles[9].statut, "warn");
assert.equal(util.devoirLabel, "Pas dû si sa compétence est établie");
assert.equal(util.preuveLabel, "La compétence réelle du client");
assert.ok(util.actions[0].startsWith("Notez dans le dossier ce qui montre la compétence du client"));

const meme = run({ competence: "meme", besoin: "aucun" });
assert.equal(meme.controles[1].statut, "ok");
assert.ok(T(meme, 1).includes("14 janvier 2014") && T(meme, 1).includes("22 mars 2017"));
assert.equal(meme.controles[2].statut, "warn");
assert.ok(T(meme, 2).includes("14 janvier 2014"));

const ass = run({ competence: "conseil" });
assert.equal(ass.controles[1].statut, "info");
assert.ok(T(ass, 1).includes("21 janvier 2026"));
assert.equal(ass.devoirLabel, "Limité : au client d'expliciter son besoin");

const excl = run({ ...BON, clause: "exclusion" });
assert.equal(excl.controles[8].statut, "bad");
assert.ok(T(excl, 8).includes("article 1112-1"));
assert.equal(excl.verdict, "À reprendre avant de répondre au client : 1 point bloquant.");
assert.ok(excl.actions.some((item) => item.startsWith("Retirez la clause de renonciation")));

const site = run({ visite: "non", travaux: "non" });
assert.equal(site.controles[4].statut, "bad");
assert.equal(site.controles[7].statut, "bad");
assert.ok(site.clause.split("\n")[3].startsWith("À votre charge avant l'installation"));

const vente = run({ relation: "vente", travaux: "ecrits" });
assert.ok(vente.clause.split("\n")[3].startsWith("À votre charge avant la livraison"));
assert.ok(T(vente, 0).includes("article 1602"));

const vagues = run({ travaux: "vagues" });
assert.equal(vagues.controles[7].statut, "warn");
assert.ok(T(vagues, 7).includes("11 mars 2020"));

const garde = run({ miseEnGarde: "aucune" });
assert.equal(garde.controles[6].statut, "bad");
assert.ok(garde.clause.split("\n")[4].startsWith("Vous avez retenu [choix du client]"));
assert.equal(run({ miseEnGarde: "aucune", competence: "meme" }).controles[6].statut, "warn");
assert.equal(run({ miseEnGarde: "orale" }).controles[6].statut, "warn");
assert.equal(run({ miseEnGarde: "ecrite" }).controles[6].statut, "ok");

const trop = run({ surcoutInitial: "9000" });
assert.equal(trop.ecartLabel, "0 € : le client aurait payé autant pour la bonne solution");
assert.equal(trop.deTouteFacon, 6800);
assert.ok(trop.message.includes("il ne reste donc pas de surcoût"));

const zero = run({ coutAdaptation: "0" });
assert.equal(zero.adaptLabel, "Aucune remise à niveau");
assert.equal(zero.ecartLabel, "Sans objet");
assert.equal(zero.message.includes("Une partie de ce coût"), false);
assert.equal(zero.actions.some((item) => item.startsWith("Séparez")), false);

const sansDevis = run({ montantDevis: "0" });
assert.equal(sansDevis.adaptLabel, "6 800 € HT (montant du devis à renseigner)");
assert.equal(sansDevis.pct, null);

const cache = run({ incident: "cout_cache", travaux: "vagues" });
assert.ok(cache.message.startsWith("Objet : le coût d'adaptation de votre installation"));
assert.ok(cache.message.includes("pour un montant de 6 800 € HT."));
assert.ok(cache.message.includes("indiquait que [préalable] restait à votre charge"));

const cache0 = run({ incident: "cout_cache", coutAdaptation: "" });
assert.ok(cache0.message.includes("pour un montant de [montant]."));

const cdc = run({ besoin: "cdc" });
assert.ok(cdc.clause.split("\n")[1].startsWith("Usage prévu : celui décrit dans votre cahier des charges"));

const oral = run({ besoin: "oral" });
assert.equal(oral.controles[2].statut, "warn");
assert.ok(oral.actions.some((item) => item.startsWith("Faites confirmer le besoin par écrit")));
assert.equal(run({ visite: "non_necessaire" }).controles[4].statut, "info");
assert.ok(run({ visite: "non_necessaire" }).clause.split("\n")[3].includes("les informations que vous nous avez données"));
assert.equal(run({ limites: "aucune" }).controles[5].statut, "bad");
assert.equal(run({ limites: "aucune", competence: "utilisateur" }).controles[5].statut, "warn");
assert.equal(run({ preuve: "aucune" }).controles[9].statut, "bad");

const BAD = /undefined|NaN|\bnull\b|Infinity|Invalid|\[object/;
const lists = {
  relation: Object.keys(LABEL_SETS.relation),
  competence: Object.keys(LABEL_SETS.competence),
  besoin: Object.keys(LABEL_SETS.besoin),
  usage: Object.keys(LABEL_SETS.usage),
  visite: Object.keys(LABEL_SETS.visite),
  limites: Object.keys(LABEL_SETS.limites),
  miseEnGarde: Object.keys(LABEL_SETS.miseEnGarde),
  travaux: Object.keys(LABEL_SETS.travaux),
  clause: Object.keys(LABEL_SETS.clause),
  preuve: Object.keys(LABEL_SETS.preuve),
  incident: Object.keys(LABEL_SETS.incident),
};
const NUMS = [
  ["18400", "6800", "3100"],
  ["0", "0", "0"],
  ["", "abc", "-5"],
  ["10000", "2000", "5000"],
  ["1 000,50", "250,25", "0"],
  ["200000000", "1", "1"],
  ["5000", "4000", "4000"],
];
let combos = 0;
let checked = 0;
for (const relation of lists.relation)
for (const competence of lists.competence)
for (const besoin of lists.besoin)
for (const usage of lists.usage)
for (const visite of lists.visite)
for (const limites of lists.limites)
for (const miseEnGarde of lists.miseEnGarde)
for (const travaux of lists.travaux)
for (const clause of lists.clause)
for (const preuve of lists.preuve)
for (const incident of lists.incident) {
  const [montantDevis, coutAdaptation, surcoutInitial] = NUMS[combos % NUMS.length];
  const result = verifierConseil({
    relation,
    competence,
    besoin,
    usage,
    visite,
    limites,
    miseEnGarde,
    travaux,
    clause,
    preuve,
    incident,
    montantDevis,
    coutAdaptation,
    surcoutInitial,
  }) as unknown as Conseil;
  combos += 1;
  const blob = [
    result.verdict,
    result.clause,
    result.message,
    result.recap,
    result.actions.join(" "),
    result.devoirLabel,
    result.preuveLabel,
    result.adaptLabel,
    result.ecartLabel,
    ...result.controles.map((item) => item.texte),
  ].join("\n");
  assert.equal(BAD.test(blob), false, blob.slice(0, 180));
  assert.equal(FORBIDDEN.test(blob), false);
  if (combos % 20 !== 0) continue;
  checked += 1;
  assert.equal(result.controles.length, 10);
  assert.equal(result.nbOk + result.nbWarn + result.nbBad + result.nbInfo, 10);
  result.controles.forEach((item, index) => {
    assert.equal(item.point, POINTS[index].label);
    assert.ok(STATUT_LABELS[item.statut as keyof typeof STATUT_LABELS]);
  });
  assert.equal(result.etat, result.nbBad ? "bad" : result.nbWarn ? "warn" : "ok");
  assert.equal(result.clause.split("\n").length, 7);
  assert.equal(result.recap.split("\n").length, 11);
  assert.ok(result.actions.length >= 1);
  assert.ok(result.actions[result.actions.length - 1].startsWith("Gardez dans le dossier"));
  assert.equal(/\n\n\n/.test(result.message), false);
  assert.ok(result.message.includes("Madame, Monsieur,"));
  assert.equal(result.message.includes("reconnaissance de responsabilité"), incident !== "aucun");
  assert.equal(result.controles[0].statut, "info");
  assert.equal(result.plein, competence === "autre_pro");
  if (result.plein || result.assiste) assert.equal(result.controles[1].statut, "info");
  if (result.reduit) assert.equal(result.controles[1].statut, preuve === "aucune" ? "warn" : "ok");
  if (result.reduit) for (const index of [2, 5, 6, 7, 9]) assert.notEqual(result.controles[index].statut, "bad");
  if (clause === "exclusion") assert.equal(result.controles[8].statut, "bad");
  if (besoin === "aucun" && result.plein) assert.equal(result.controles[2].statut, "bad");
  if (visite === "non" && travaux === "non") assert.equal(result.controles[4].statut, "bad");
  if (usage === "oui") assert.equal(result.controles[3].statut, "ok");
  const cout = result.x.coutAdaptation;
  const sur = result.x.surcoutInitial;
  assert.ok(result.ecart >= 0 && result.ecart <= cout);
  assert.equal(round2(result.ecart + result.deTouteFacon), cout);
  assert.equal(result.deTouteFacon, Math.min(sur, cout));
  if (cout === 0) {
    assert.equal(result.adaptLabel, "Aucune remise à niveau");
    assert.equal(result.ecartLabel, "Sans objet");
  }
  if (incident !== "aucun" && cout > 0) assert.ok(result.actions.some((item) => item.startsWith("Séparez")));
  assert.equal(result.recap.split("\n")[7], "Remise à niveau : " + result.adaptLabel);
  assert.equal(/0 point à revoir|0 point bloquant/.test(result.verdict), false);
  assert.ok(result.verdict.length > 20);
}
assert.equal(combos, 559872);
assert.ok(checked >= 20000, `checked ${checked}`);
