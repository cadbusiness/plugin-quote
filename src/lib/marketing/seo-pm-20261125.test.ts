import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { articleHtml } from "./article-html";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_CONDITION_SUSPENSIVE,
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
  categorie,
  dec,
  fmtEur,
  fmtNum,
  fmtPct,
  montant,
  normalize,
  pluriel,
  round2,
  verifierCondition,
} from "./verificateur-condition-suspensive-devis";

const FORBIDDEN = /[\u2014\u2013\u2212]/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "condition-suspensive-commande-financement-devis-b2b";
const BLOG_PATH = "/blog/condition-suspensive-commande-financement-devis-b2b";
const TOOL_PATH = "/outils/verificateur-condition-suspensive-devis";
const DAY = "2026-11-25";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];
const TOOL_TITLE = "Vérificateur de condition suspensive dans un devis B2B";
const TOOL_TEXT =
  "Commande sous réserve de financement, de marché ou d'autorisation : dix points, où en est la commande, le sort de l'acompte et du matériel engagé, la clause et le courrier.";
const PRIOR_TOOL = "/outils/verificateur-cession-contrat-changement-client";
const HUB_102 = "Cent deux outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.";
const HUB_101 = "Cent un outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.";

type Controle = { point: string; statut: string; texte: string };
type Resultat = {
  x: {
    montantDevis: number;
    acompte: number;
    fraisEngages: number;
    evenement: string;
    redaction: string;
    delai: string;
    situation: string;
  };
  categorie: string;
  pct: number | null;
  etatLabel: string;
  acompteLabel: string;
  fraisLabel: string;
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

const run = (overrides: Record<string, string> = {}) =>
  verifierCondition({ ...DEFAULTS, ...overrides }) as Resultat;
const S = (result: Resultat) => result.controles.map((item) => item.statut).join(",");
const T = (result: Resultat, index: number) => result.controles[index]?.texte ?? "";
const BON = {
  redaction: "precise",
  delai: "date",
  demarches: "ecrites",
  beneficiaire: "client",
  acompteClause: "restitution",
  engagements: "aucun",
  suivi: "statut_date",
  preuve: "dossier",
  situation: "attente",
};

assert.equal(SLUG, "verificateur-condition-suspensive-devis");
assert.equal(BLOG_TOOL_CONDITION_SUSPENSIVE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_POSTS[0]?.slug, BLOG_SLUG);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 42);
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

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.ok(outilsHub.includes("verificateur-condition-suspensive-devis"));
assert.ok(outilsHub.includes(TOOL_TITLE));
assert.ok(outilsHub.includes(TOOL_TEXT));
assert.ok(outilsHub.includes("vérificateur de condition suspensive dans un devis B2B"));
{
  const start = outilsHub.indexOf('href: "/outils/verificateur-condition-suspensive-devis"');
  assert.ok(start > outilsHub.indexOf('href: "/outils/verificateur-cession-contrat-changement-client"'));
  assert.match(outilsHub.slice(start, start + 700), /eyebrow: "Pilotage"/);
}
assert.ok(outilsHub.includes("outilsHubIntro()"));

assert.equal(BLOG_TOOLS.length, 102);
assert.equal(BLOG_POSTS.length, 112);
assert.equal(outilsHubIntro(), HUB_102);
assert.equal(outilsHubIntro(102), outilsHubIntro());
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());
assert.equal(outilsHubIntro(101), HUB_101);

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
    "1304-2",
    "1304-3",
    "1304-4",
    "1304-5",
    "1304-6",
    "1118",
    "1120",
    "1186",
    "1190",
    "1353",
    "L110-3",
    "24-16.732",
    "24-16.361",
    "24-18.443",
    "22-17.090",
    "23-14.050",
    "19-23.958",
    "publié au Bulletin",
    "46 800 €",
    "56 160 €",
    "16 848 €",
    "17 900 €",
    "39 312 €",
    "38,25 %",
    "hypothèses d'exemple",
    "non contractuel",
    "En attente",
    "Gagné",
    "Compléter la demande",
    "/outils/verificateur-condition-suspensive-devis",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(norm.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  const html = articleHtml(blogBody);
  assert.ok((html.match(/<table/g) ?? []).length >= 2, "markdown tables");
  assert.ok(html.includes("Lundi 7 septembre 2026"), "chronology row");
  assert.ok(html.includes("Réputée n'avoir jamais existé"), "decision table");
  assert.ok((blogBody.match(/^\d+\. /gm) ?? []).length >= 4, "numbered lists");
  assert.ok((html.match(/<ul/g) ?? []).length >= 1, "lists rendered");
  assert.ok((html.match(/<blockquote/g) ?? []).length >= 1, "citations");
  assert.ok(html.includes("Condition suspensive."), "clause quote");
}

const builder = readFileSync(join(process.cwd(), "src/lib/funnels/builder.ts"), "utf8");
for (const label of ["Texte", "Liste", "Mesure", "Choix multiple", "Fichier"]) {
  assert.ok(builder.includes(label), label);
}
assert.equal(builder.includes('type: "date"'), false);
const seed = readFileSync(join(process.cwd(), "src/lib/crm/seed.ts"), "utf8");
assert.ok(seed.includes("Gagné"));
assert.ok(seed.includes("Perdu"));
assert.match(seed, /slug: "waiting"[^}]*is_closed: false/);
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);
const workflows = readFileSync(join(process.cwd(), "src/lib/workflows/types.ts"), "utf8");
assert.ok(workflows.includes("quote.status_changed"));
assert.ok(workflows.includes('"wait"'));
assert.ok(workflows.includes('"branch"'));
assert.ok(workflows.includes('"send_email"'));
assert.ok(workflows.includes('"set_status"'));
assert.ok(workflows.includes("waitHours"));
assert.equal(workflows.includes("waitUntil"), false);
const collaborators = readFileSync(join(process.cwd(), "src/lib/prospect/collaborators.ts"), "utf8");
for (const role of ["Responsable technique", "Directeur financier", "Acheteur", "Décideur"]) {
  assert.ok(collaborators.includes(role), role);
}
const prospect = readFileSync(join(process.cwd(), "src/app/(public)/suivi/[token]/prospect-space.tsx"), "utf8");
for (const label of ["Compléter la demande", "Partager pour validation", "Valider le dossier", "Demander des modifications"]) {
  assert.ok(prospect.includes(label), label);
}

const added = [
  "src/lib/marketing/verificateur-condition-suspensive-devis.ts",
  "src/components/marketing/verificateur-condition-suspensive-devis-calculator.tsx",
  "src/app/(marketing)/outils/verificateur-condition-suspensive-devis/page.tsx",
  "src/lib/marketing/seo-pm-20261125.test.ts",
  `src/content/blog/${BLOG_SLUG}.md`,
];
for (const rel of added) assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);

const pageSrc = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/verificateur-condition-suspensive-devis/page.tsx"),
  "utf8",
);
const componentSrc = readFileSync(
  join(process.cwd(), "src/components/marketing/verificateur-condition-suspensive-devis-calculator.tsx"),
  "utf8",
);
assert.ok(pageSrc.includes(TOOL_TITLE));
assert.ok(pageSrc.includes("Votre client signe « bon pour accord sous réserve de financement »"));
assert.ok(pageSrc.includes("pas un conseil juridique"));
assert.ok(pageSrc.includes("Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."));
assert.ok(pageSrc.includes("Calcul local, aucune donnée envoyée."));
assert.ok(pageSrc.includes("crédit affecté"));
assert.ok(pageSrc.includes("promesses de vente immobilière"));
assert.ok(pageSrc.includes("marchés publics"));
assert.ok(pageSrc.includes("procédure collective du client"));
assert.ok(pageSrc.includes("droit étranger"));
assert.ok(pageSrc.includes("WebApplication"));
assert.ok(pageSrc.includes(BLOG_PATH));
assert.ok(pageSrc.includes("/blog/annulation-commande-devis-b2b-arrhes-dedit-clause-penale"));
assert.ok(pageSrc.includes("/blog/acomptes-echeances-devis-b2b"));
assert.ok(pageSrc.includes("/blog/validite-expiration-devis-b2b"));
assert.ok(pageSrc.includes("/outils/calculateur-acompte-devis"));
assert.ok(pageSrc.includes("/signup?plan=free"));
assert.ok(pageSrc.includes("/c/demo/rayonnage"));
assert.ok(pageSrc.includes("/tarifs"));
assert.equal(pageSrc.includes('type="date"'), false);
assert.equal(componentSrc.includes('type="date"'), false);
assert.ok(componentSrc.includes("Textes lus le 25 novembre 2026"));
assert.ok(componentSrc.includes("24-16.732"));
assert.ok(componentSrc.includes("Lectures retenues"));
assert.equal((componentSrc.match(/<CopyButton /g) ?? []).length, 3);
for (const label of [
  "La condition",
  "Le suivi et vos engagements",
  "Les montants",
  "De quoi dépend la commande",
  "Comment la condition a été écrite",
  "Une réserve ajoutée par le client n'est pas une acceptation de votre devis (article 1118).",
  "Date limite de réalisation",
  "Démarches que le client doit faire",
  "Dans l'intérêt de qui la condition est stipulée",
  "Seule la partie dans l'intérêt exclusif de laquelle la condition est stipulée peut y renoncer seule (article 1304-4).",
  "Ce que dit le devis sur l'acompte",
  "Ce que vous avez engagé avant la réalisation",
  "Comment le dossier est suivi",
  "Ce que vous gardez dans le dossier",
  "Où en êtes-vous",
  "Montant du devis (€ HT)",
  "Acompte encaissé (€)",
  "0 si rien n'a été versé.",
  "Frais déjà engagés (€ HT)",
  "Matériel commandé, fabrication ou travaux lancés avant la réalisation.",
  "Le résultat",
  "Où en est la commande",
  "L'acompte",
  "Frais engagés à votre risque",
  "Points bloquants / à revoir",
  "Le contrôle point par point",
  "La clause à écrire dans vos devis",
  "Ce qu'il faut faire",
  "Le courrier au client",
  "Récapitulatif",
]) {
  assert.ok(componentSrc.includes(label), label);
}

assert.equal(Object.keys(DEFAULTS).length, 13);
assert.equal(POINTS.length, 10);
assert.equal(MAX_MONTANT, 100000000);
assert.equal(Object.keys(LABEL_SETS).length, 10);
assert.deepEqual(STATUT_LABELS, { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" });
assert.equal(dec("1 000,50"), 1000.5);
assert.equal(dec("46800"), 46800);
assert.ok(Number.isNaN(dec("abc")));
assert.ok(Number.isNaN(dec("")));
assert.ok(Number.isNaN(dec(null)));
assert.ok(Number.isNaN(dec("2e5")));
assert.equal(montant("-5"), 0);
assert.equal(montant("abc"), 0);
assert.equal(montant("200000000"), MAX_MONTANT);
assert.equal(montant("12,345"), 12.35);
assert.equal(round2(38.247863), 38.25);
assert.equal(fmtNum(1234567.891), "1 234 567,89");
assert.equal(fmtNum(2.999), "3");
assert.equal(fmtNum(0), "0");
assert.equal(fmtEur(16848), "16 848 €");
assert.equal(fmtPct(38.25), "38,25 %");
const plural = pluriel as (n: number, singular: string, pluralForm?: string) => string;
assert.equal(plural(1, "point bloquant", "points bloquants"), "1 point bloquant");
assert.equal(plural(2, "point à revoir", "points à revoir"), "2 points à revoir");
assert.equal(plural(0, "conforme"), "0 conforme");
const nz = normalize({ evenement: "pirate", redaction: " precise ", acompte: "x" }) as Resultat["x"];
assert.equal(nz.evenement, "financement");
assert.equal(nz.redaction, "precise");
assert.equal(nz.acompte, 0);
assert.equal(nz.montantDevis, 0);
assert.equal((normalize(null) as Resultat["x"]).situation, "refus_non_justifie");

const d = run();
assert.equal(S(d), "warn,warn,bad,bad,warn,warn,warn,warn,warn,warn");
assert.equal(d.nbOk, 0);
assert.equal(d.nbWarn, 8);
assert.equal(d.nbBad, 2);
assert.equal(d.nbInfo, 0);
assert.equal(d.etat, "bad");
assert.equal(d.categorie, "verifier");
assert.equal(d.verdict, "À reprendre avant de répondre au client : 2 points bloquants, 8 points à revoir.");
assert.equal(d.etatLabel, "À vérifier : demandez le justificatif du refus");
assert.equal(d.acompteLabel, "16 848 € : réclamable par le client tant que la condition n'est pas réalisée");
assert.equal(d.fraisLabel, "17 900 € HT, soit 38,25 % du devis, à votre risque");
assert.equal(d.pct, 38.25);
assert.ok(T(d, 1).includes("article 1118"));
assert.ok(T(d, 3).includes("article 1353") && T(d, 3).includes("C'est précisément la question"));
assert.ok(T(d, 9).includes("article 1304-5"));
assert.equal(d.actions.length, 9);
assert.ok(d.actions[0]?.startsWith("Faites signer au client une clause complète"));
assert.ok(d.actions[7]?.startsWith("Demandez par écrit la réponse de l'établissement"));
assert.ok(d.actions[8]?.startsWith("Gardez dans le dossier"));
const dc = d.clause.split("\n");
assert.equal(dc.length, 7);
assert.equal(dc[0], "Condition suspensive");
assert.ok(dc[1]?.startsWith("La présente commande est conclue sous la condition suspensive de l'obtention par le client d'un [prêt"));
assert.ok(dc[2]?.includes("facture pro forma"));
assert.ok(dc[4]?.startsWith("La condition est stipulée dans l'intérêt exclusif du client"));
assert.ok(dc[5]?.includes("l'acompte versé est restitué dans les quinze jours"));
assert.ok(d.message.startsWith("Objet : votre courrier du [date] sur la condition de financement du devis n° [référence]"));
assert.ok(d.message.includes("la restitution de l'acompte de 16 848 €"));
assert.ok(d.message.includes("Veuillez agréer"));
const dr = d.recap.split("\n");
assert.equal(dr.length, 11);
assert.equal(dr[5], "Commande : À vérifier : demandez le justificatif du refus");
assert.equal(dr[7], "Frais engagés : 17 900 € HT, soit 38,25 % du devis, à votre risque");
assert.equal(dr[8], "Contrôle : 0 conforme, 8 à revoir, 2 bloquants, 0 information");
assert.equal(dr[10], "Vérification : quotebuilder.co/outils/" + SLUG);

const ok = run(BON);
assert.equal(S(ok), "ok,ok,ok,ok,ok,ok,ok,ok,ok,info");
assert.equal(ok.etat, "ok");
assert.equal(ok.verdict, "Condition bien cadrée : l'événement, la date, les démarches et l'acompte sont écrits.");
assert.equal(ok.etatLabel, "Formée sous condition, pas encore ferme");
assert.equal(ok.actions.length, 2);
assert.ok(ok.message.startsWith("Objet : condition de financement du devis n° [référence], échéance du [date]"));
const avant = run({ ...BON, situation: "avant" });
assert.ok(avant.etatLabel.startsWith("Pas encore proposée"));
assert.ok(avant.message.startsWith("Objet : notre devis n° [référence] sous condition suspensive"));
const avantBad = run({ situation: "avant", redaction: "vague", evenement: "nous" });
assert.equal(avantBad.controles[0]?.statut, "bad");
assert.ok(avantBad.verdict.startsWith("À corriger avant d'envoyer le devis : "));
assert.ok(avantBad.actions.some((item) => item.startsWith("Remplacez « sous réserve de validation par nos services »")));
assert.equal(avantBad.controles[3]?.statut, "info");
assert.ok(avantBad.clause.split("\n")[1]?.includes("visite technique"));
assert.equal(run({ evenement: "nous", redaction: "precise" }).controles[0]?.statut, "ok");
assert.ok(T(run({ evenement: "nous", redaction: "precise" }), 0).includes("19-23.958"));
assert.equal(run({ evenement: "interne", redaction: "vague" }).controles[0]?.statut, "bad");
assert.ok(T(run({ evenement: "interne", redaction: "vague" }), 0).includes("22-17.090"));
assert.equal(run({ evenement: "interne", redaction: "precise" }).controles[0]?.statut, "warn");
const sansRep = run({ redaction: "ajout_sans_reponse" });
assert.equal(sansRep.categorie, "pas_de_contrat");
assert.equal(sansRep.controles[1]?.statut, "bad");
assert.ok(sansRep.etatLabel.startsWith("Pas de commande"));
assert.equal(sansRep.acompteLabel, "16 848 € à restituer");
assert.equal(sansRep.fraisLabel, "17 900 € HT, soit 38,25 % du devis, à votre charge");
assert.ok(sansRep.message.startsWith("Objet : votre acceptation du devis n° [référence] sous réserve"));
assert.equal(run({ redaction: "orale" }).controles[1]?.statut, "bad");
const real = run({ ...BON, situation: "realisee", engagements: "commande", acompteClause: "exigible_apres" });
assert.equal(real.categorie, "ferme");
assert.equal(real.etatLabel, "Ferme depuis la réalisation de la condition");
assert.equal(real.acompteLabel, "16 848 € : acompte sur une commande ferme");
assert.equal(real.fraisLabel, "Plus à votre risque : la commande est ferme");
assert.equal(real.controles[6]?.statut, "ok");
assert.ok(real.message.includes("L'acompte prévu au devis est désormais exigible."));
const rj = run({ ...BON, situation: "refus_justifie", engagements: "commande" });
assert.equal(rj.categorie, "jamais");
assert.equal(rj.etatLabel, "Réputée n'avoir jamais existé");
assert.equal(rj.acompteLabel, "16 848 € à restituer");
assert.equal(rj.fraisLabel, "17 900 € HT, soit 38,25 % du devis, à votre charge");
assert.equal(rj.controles[6]?.statut, "bad");
assert.ok(T(rj, 9).includes("23-14.050"));
assert.ok(rj.message.startsWith("Objet : défaillance de la condition de financement du devis n° [référence]"));
assert.ok(rj.message.includes("Nous vous restituons l'acompte de 16 848 €"));
assert.ok(rj.actions.some((item) => item.startsWith("Restituez l'acompte et proposez un nouveau devis")));
const ce = run({ ...BON, situation: "client_empeche" });
assert.equal(ce.etatLabel, "Réputée ferme si vous prouvez que le client a empêché la condition");
assert.equal(ce.acompteLabel, "16 848 € : conservé comme acompte si la condition est réputée accomplie");
assert.ok(T(ce, 9).includes("24-16.732"));
assert.ok(ce.message.includes("article 1304-3"));
assert.equal(run({ situation: "client_empeche" }).controles[3]?.statut, "bad");
assert.equal(run({ situation: "client_empeche", demarches: "partielles" }).controles[3]?.statut, "warn");
const ne = run({ ...BON, situation: "nous_empeche" });
assert.equal(ne.controles[9]?.statut, "bad");
assert.equal(ne.etatLabel, "Réputée n'avoir jamais existé, et le client peut demander réparation");
assert.ok(ne.message.startsWith("Objet : report de la date limite"));
const dp = run({ ...BON, situation: "date_passee" });
assert.equal(dp.categorie, "jamais");
assert.equal(dp.controles[9]?.statut, "info");
const dpSans = run({ ...BON, situation: "date_passee", delai: "aucun" });
assert.equal(dpSans.categorie, "attente");
assert.equal(dpSans.etatLabel, "Toujours en attente : aucune date limite n'est écrite");
assert.ok(dpSans.message.includes("convenons d'une date"));
const ra = run({ ...BON, situation: "renonciation_avant" });
assert.equal(ra.categorie, "ferme");
assert.ok(ra.etatLabel.startsWith("Ferme : le client renonce"));
assert.ok(T(ra, 9).includes("24-16.361"));
assert.ok(ra.message.includes("« Nous renonçons à la condition prévue"));
const raNous = run({ ...BON, situation: "renonciation_avant", beneficiaire: "deux" });
assert.equal(raNous.controles[4]?.statut, "bad");
assert.equal(raNous.controles[9]?.statut, "bad");
assert.equal(raNous.etatLabel, "Toujours sous condition : le client ne peut pas renoncer seul");
assert.ok(raNous.message.includes("d'un commun accord"));
const raNd = run({ ...BON, situation: "renonciation_avant", beneficiaire: "non_dit" });
assert.equal(raNd.categorie, "renonciation_douteuse");
assert.ok(raNd.message.includes("nous la contresignerons"));
const rt = run({ ...BON, situation: "renonciation_tardive" });
assert.equal(rt.etatLabel, "Défaillie : il faut un nouvel accord écrit");
assert.ok(rt.actions.some((item) => item.startsWith("Faites signer un nouveau devis")));
assert.equal(run({ acompteClause: "acquis" }).controles[5]?.statut, "bad");
assert.equal(run({ acompteClause: "restitution" }).controles[5]?.statut, "ok");
assert.equal(run({ acompteClause: "exigible_apres" }).controles[5]?.statut, "warn");
assert.equal(run({ acompte: "0" }).controles[5]?.statut, "ok");
assert.equal(run({ acompte: "0" }).acompteLabel, "Aucun acompte encaissé");
assert.ok(T(run({ acompte: "0", acompteClause: "acquis" }), 5).includes("Retirez quand même"));
assert.equal(run({ fraisEngages: "0" }).fraisLabel, "Aucun frais engagé");
assert.equal(run({ montantDevis: "0" }).fraisLabel, "17 900 € HT (montant du devis à renseigner), à votre risque");
assert.equal(run({ montantDevis: "0" }).pct, null);
assert.equal(run({ engagements: "etude" }).controles[6]?.statut, "ok");
assert.ok(run({ engagements: "etude" }).clause.includes("facturée à part"));
assert.equal(run({ preuve: "aucune" }).controles[8]?.statut, "bad");
assert.equal(run({ suivi: "statut_date" }).controles[7]?.statut, "ok");
assert.ok(run({ beneficiaire: "nous" }).clause.includes("dans notre intérêt exclusif"));
assert.ok(run({ beneficiaire: "deux" }).clause.includes("accord écrit des deux"));
assert.ok(run({ acompteClause: "exigible_apres" }).clause.includes("l'acompte n'est exigible qu'à la réalisation"));
for (const ev of Object.keys(LABEL_SETS.evenement)) assert.ok(run({ evenement: ev }).message.length > 0);

const keys = (name: string) => Object.keys(LABEL_SETS[name as keyof typeof LABEL_SETS]);
const NUMS = [
  ["46800", "16848", "17900"],
  ["0", "0", "0"],
  ["", "abc", "-5"],
  ["10000", "2000", "5000"],
  ["1 000,50", "250,25", "0"],
  ["200000000", "1", "1"],
  ["5000", "0", "4000"],
];
const BADVAL = /NaN|undefined|null|Infinity|\[object/;
let combos = 0;
for (const evenement of keys("evenement"))
  for (const redaction of keys("redaction"))
    for (const delai of keys("delai"))
      for (const demarches of keys("demarches"))
        for (const beneficiaire of keys("beneficiaire"))
          for (const acompteClause of keys("acompteClause"))
            for (const engagements of keys("engagements"))
              for (const suivi of keys("suivi"))
                for (const preuve of keys("preuve"))
                  for (const situation of keys("situation")) {
                    const nums = NUMS[combos % NUMS.length] ?? NUMS[0];
                    const montantDevis = nums[0] ?? "0";
                    const acompte = nums[1] ?? "0";
                    const fraisEngages = nums[2] ?? "0";
                    const x = verifierCondition({
                      evenement,
                      redaction,
                      delai,
                      demarches,
                      beneficiaire,
                      acompteClause,
                      engagements,
                      suivi,
                      preuve,
                      situation,
                      montantDevis,
                      acompte,
                      fraisEngages,
                    }) as Resultat;
                    combos += 1;
                    assert.equal(x.controles.length, 10);
                    assert.equal(x.nbOk + x.nbWarn + x.nbBad + x.nbInfo, 10);
                    assert.equal(x.etat, x.nbBad > 0 ? "bad" : x.nbWarn > 0 ? "warn" : "ok");
                    assert.equal(x.categorie, categorie(x.x));
                    for (let i = 0; i < 10; i += 1) {
                      const row = x.controles[i];
                      assert.ok(row && STATUT_LABELS[row.statut as keyof typeof STATUT_LABELS]);
                      assert.equal(row?.point, POINTS[i]?.label);
                      assert.ok((row?.texte.length ?? 0) > 20);
                    }
                    for (const text of [x.etatLabel, x.acompteLabel, x.fraisLabel, x.verdict, x.clause, x.message, x.recap, ...x.actions]) {
                      assert.equal(typeof text, "string");
                      assert.ok(text.length > 0);
                      assert.equal(BADVAL.test(text), false);
                      assert.equal(FORBIDDEN.test(text), false);
                    }
                    assert.equal(x.clause.split("\n").length, 7);
                    assert.equal(x.recap.split("\n").length, 11);
                    assert.ok(x.message.startsWith("Objet : "));
                    assert.ok(x.actions.length >= 2 && x.actions.length <= 12);
                    assert.ok(x.actions[x.actions.length - 1]?.startsWith("Gardez dans le dossier"));
                    if (x.nbBad > 0) {
                      assert.ok(x.verdict.startsWith(situation === "avant" ? "À corriger avant d'envoyer le devis" : "À reprendre avant de répondre au client"));
                    }
                    if (redaction === "ajout_sans_reponse" && situation !== "avant") assert.equal(x.categorie, "pas_de_contrat");
                    if (delai === "aucun") assert.equal(x.controles[2]?.statut, "bad");
                    if (x.x.acompte <= 0) assert.equal(x.acompteLabel, "Aucun acompte encaissé");
                    if (x.x.fraisEngages <= 0) assert.equal(x.fraisLabel, "Aucun frais engagé");
                    if (x.categorie === "ferme" && x.x.fraisEngages > 0) assert.equal(x.fraisLabel, "Plus à votre risque : la commande est ferme");
                    if ((x.categorie === "jamais" || x.categorie === "pas_de_contrat") && x.x.acompte > 0) {
                      assert.ok(x.acompteLabel.endsWith(" à restituer"));
                    }
                  }
assert.equal(combos, 648000);
