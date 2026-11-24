import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { articleHtml } from "./article-html";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_MATIERE_FOURNIE,
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
  UNITES,
  arrondiSup,
  computeMatiere,
  dec,
  ent,
  fmtEur,
  fmtNum,
  normalize,
  pluriel,
  qte,
} from "./calculateur-matiere-fournie-rebut-responsabilite";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const FORBIDDEN = /[\u2014\u2013\u2212]/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "matiere-fournie-par-le-client-rebut-perte-responsabilite-devis-b2b";
const BLOG_PATH = "/blog/matiere-fournie-par-le-client-rebut-perte-responsabilite-devis-b2b";
const TOOL_PATH = "/outils/calculateur-matiere-fournie-rebut-responsabilite";
const DAY = "2026-11-23";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];
const TOOL_TITLE = "Calculateur de matière fournie par le client";
const TOOL_H1 = "Calculateur de matière fournie par le client : besoin, rebut toléré et responsabilité";
const TOOL_TEXT =
  "Le client fournit la matière : quantité à demander avec chute et rebut toléré, qui supporte le rebut, plafond et assurance, la clause et le courrier.";
const PRIOR_TOOL = "/outils/verificateur-marquage-ce-declaration-performances";

const run = (overrides: Record<string, string>) => computeMatiere({ ...DEFAULTS, ...overrides });
const S = (result: { controles: { statut: string }[] }) => result.controles.map((item) => item.statut).join(",");
const T = (result: { controles: { texte: string }[] }, index: number) => result.controles[index].texte;

assert.equal(SLUG, "calculateur-matiere-fournie-rebut-responsabilite");
assert.equal(BLOG_TOOL_MATIERE_FOURNIE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 37);
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
assert.ok(llms.includes(`${TOOL_H1} : https://www.quotebuilder.co${TOOL_PATH}`));
const priorToolLine = llms.indexOf(`https://www.quotebuilder.co${PRIOR_TOOL}`);
assert.ok(llms.indexOf(`https://www.quotebuilder.co${BLOG_PATH}`) > priorToolLine);
assert.ok(llms.indexOf(`https://www.quotebuilder.co${TOOL_PATH}`) > llms.indexOf(`https://www.quotebuilder.co${BLOG_PATH}`));

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.ok(outilsHub.includes("calculateur-matiere-fournie-rebut-responsabilite"));
assert.ok(outilsHub.includes(TOOL_TITLE));
assert.ok(outilsHub.includes(TOOL_TEXT));
assert.ok(outilsHub.includes("calculateur de matière fournie par le client"));
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-matiere-fournie-rebut-responsabilite"');
  assert.ok(start > outilsHub.indexOf('href: "/outils/verificateur-marquage-ce-declaration-performances"'));
  assert.match(outilsHub.slice(start, start + 400), /eyebrow: "Pilotage"/);
}
assert.ok(outilsHub.includes("outilsHubIntro()"));

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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 8203);
  const norm = blogBody.replace(/[\u00a0\u202f]/g, " ");
  for (const needle of [
    "1787",
    "1788",
    "1789",
    "1790",
    "1797",
    "1927",
    "1933",
    "570",
    "1112-1",
    "1170",
    "1171",
    "91-16.019",
    "92-11.385",
    "986 kg",
    "985,08",
    "25,08",
    "9 120 €",
    "4 800 €",
    "110,90 €",
    "72,50 €",
    "hypothèses d'exemple",
    "non contractuel",
    "Gagné",
    "Plan (PDF ou image)",
    "/outils/calculateur-matiere-fournie-rebut-responsabilite",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(norm.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.doesNotMatch(blogBody, /24-17\.226/);
  const html = articleHtml(blogBody);
  assert.ok((html.match(/<table/g) ?? []).length >= 5, "five markdown tables");
}

const added = [
  "src/lib/marketing/calculateur-matiere-fournie-rebut-responsabilite.ts",
  "src/components/marketing/calculateur-matiere-fournie-rebut-responsabilite-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-matiere-fournie-rebut-responsabilite/page.tsx",
  "src/lib/marketing/seo-pm-20261123.test.ts",
  `src/content/blog/${BLOG_SLUG}.md`,
];
for (const rel of added) assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);

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

const pageSrc = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-matiere-fournie-rebut-responsabilite/page.tsx"),
  "utf8",
);
const componentSrc = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-matiere-fournie-rebut-responsabilite-calculator.tsx"),
  "utf8",
);
assert.ok(pageSrc.includes(TOOL_PATH));
assert.ok(pageSrc.includes(TOOL_H1));
assert.ok(pageSrc.includes("pas un conseil juridique"));
assert.ok(pageSrc.includes("Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."));
assert.ok(pageSrc.includes("Calcul local, aucune donnée envoyée."));
assert.ok(pageSrc.includes("ventes aux consommateurs"));
assert.ok(pageSrc.includes("matières dangereuses ou réglementées"));
assert.ok(pageSrc.includes("métaux précieux"));
assert.ok(pageSrc.includes("marchés publics"));
assert.ok(pageSrc.includes("droit étranger"));
assert.ok(pageSrc.includes("TVA du travail à façon"));
assert.ok(pageSrc.includes("procédure collective du client"));
assert.equal(pageSrc.includes('type="date"'), false);
assert.equal(componentSrc.includes('type="date"'), false);
assert.ok(componentSrc.includes("lus le 23 novembre 2026"));
assert.ok(componentSrc.includes("91-16.019"));
assert.ok(componentSrc.includes("92-11.385"));
assert.ok(componentSrc.includes("Lectures retenues"));
assert.ok(componentSrc.includes("Cas non traités"));
assert.equal((componentSrc.match(/<CopyButton /g) ?? []).length, 3);
assert.doesNotMatch(pageSrc, /\/blog\/espace-prospect-devis-en-ligne/);
assert.doesNotMatch(componentSrc, /\/blog\/espace-prospect-devis-en-ligne/);
for (const href of [
  "/blog/matiere-fournie-par-le-client-rebut-perte-responsabilite-devis-b2b",
  "/blog/clause-limitation-responsabilite-devis-b2b",
  "/blog/commande-non-retiree-frais-stockage-mise-en-demeure-client-b2b",
  "/blog/outillage-specifique-moule-propriete-amortissement-devis-b2b",
  "/outils/verificateur-clause-limitation-responsabilite",
  "/signup?plan=free",
  "/c/demo/rayonnage",
  "/tarifs",
]) {
  assert.ok(pageSrc.includes(href), href);
}
for (const label of [
  "Qui fournit la matière",
  "Unité de la matière",
  "Pièces bonnes commandées",
  "Matière par pièce (dans l'unité choisie)",
  "Prix de la façon (€ HT par pièce)",
  "Chute de fin de barre et de réglage (%)",
  "Rebut toléré (% des pièces)",
  "Matière de mise en route",
  "Le taux de chute est écrit dans le devis accepté",
  "La tolérance de rebut est écrite dans le devis accepté",
  "Chutes et reliquat en fin de commande",
  "Plafond de responsabilité écrit (€ HT, 0 si aucun)",
  "Matière fournie par le client",
  "Valeur de la matière (€ HT par unité)",
  "Garantie biens confiés de votre assurance (€, 0 si aucune)",
  "Réception de la matière contrôlée et datée",
  "Lots et certificats matière conservés",
  "Pièces rebutées constatées",
  "Cause du rebut au-dessus de la tolérance",
  "Copeaux compris, chute de fin de barre exclue.",
  "Réglage, premières pièces d'essai.",
  "Le contrat et la série",
  "Ce que dit le devis",
  "La matière reçue et le rebut",
  "Le résultat",
  "Matière à demander au client",
  "Écart avec la matière fournie",
  "Rebut au-dessus de la tolérance",
  "Qui le supporte",
  "Valeur de la matière confiée",
  "Points bloquants / à revoir",
  "Le contrôle point par point",
  "La clause à écrire dans vos devis",
  "Ce qu'il faut faire",
  "Le courrier au client",
  "Récapitulatif",
]) {
  assert.ok(componentSrc.includes(label), label);
}

assert.equal(Object.keys(DEFAULTS).length, 19);
assert.equal(POINTS.length, 10);
assert.deepEqual(UNITES, { kg: "kg", m: "m", u: "unité" });
assert.equal(Object.keys(LABEL_SETS).length, 8);
assert.deepEqual(STATUT_LABELS, { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" });
assert.equal(fmtNum(1234.5), "1 234,50");
assert.equal(fmtNum(72.504), "72,50");
assert.equal(fmtNum(960), "960");
assert.equal(fmtNum(-3.2), "-3,20");
assert.equal(fmtEur(9120), "9 120 €");
assert.equal(qte(1, "u"), "1 unité");
assert.equal(qte(2, "u"), "2 unités");
assert.equal(qte(1.5, "m"), "1,50 m");
assert.equal(pluriel(1, "pièce", "pièces"), "1 pièce");
assert.equal(pluriel(3, "pièce", "pièces"), "3 pièces");
assert.equal(arrondiSup(985.08), 986);
assert.equal(arrondiSup(986), 986);
assert.equal(arrondiSup(985.0000001), 985);
assert.equal(dec("1 234,5"), 1234.5);
assert.ok(Number.isNaN(dec("abc")));
assert.ok(Number.isNaN(dec("")));
assert.equal(ent("12,9"), 12);
type MatiereNorm = {
  q: number;
  mp: number;
  pChute: number;
  pRebut: number;
  mer: number;
  four: number;
  rebutN: number;
  nature: string;
  cause: string;
};
const asNorm = (raw: Record<string, string | null | undefined>) => normalize(raw) as MatiereNorm;

assert.equal(asNorm({}).q, 500);
assert.equal(asNorm({ quantite: "0" }).q, 0);
assert.equal(asNorm({ quantite: "abc" }).q, 0);
assert.equal(asNorm({ chute: "250" }).pChute, 100);
assert.equal(asNorm({ chute: "-5" }).pChute, 0);
assert.equal(asNorm({ nature: "zzz" }).nature, "facon");
assert.equal(asNorm({ cause: "zzz" }).cause, "inconnue");
assert.equal(asNorm({ rebutObs: "7,9" }).rebutN, 7);

const d = run({});
assert.equal(d.besoinNet, 900);
assert.ok(Math.abs(d.conso - 954) < 1e-9);
assert.equal(d.tolPieces, 10);
assert.ok(Math.abs(d.matRebutTol - 19.08) < 1e-9);
assert.ok(Math.abs(d.recommandee - 985.08) < 1e-9);
assert.equal(d.recoArrondie, 986);
assert.ok(Math.abs(d.manque - 25.08) < 1e-9);
assert.equal(d.complement, 26);
assert.equal(d.excess, 4);
assert.ok(Math.abs(d.matExcess - 7.632) < 1e-9);
assert.ok(Math.abs(d.valExcess - 72.504) < 1e-9);
assert.ok(Math.abs(d.refacon - 38.4) < 1e-9);
assert.ok(Math.abs(d.expo - 9120) < 1e-9);
assert.equal(d.besoinLabel, "986 kg");
assert.equal(d.ecartLabel, "Il manque 25,08 kg");
assert.equal(d.rebutLabel, "4 pièces (7,63 kg, 72,50 € HT)");
assert.equal(d.chargeLabel, "Vous, tant que vous n'avez pas prouvé l'absence de faute (article 1789)");
assert.equal(d.expoLabel, "9 120 € HT");
assert.equal(S(d), "info,warn,warn,ok,ok,warn,warn,warn,warn,warn");
assert.equal(d.nbOk, 2);
assert.equal(d.nbWarn, 7);
assert.equal(d.nbBad, 0);
assert.equal(d.nbInfo, 1);
assert.equal(d.etat, "warn");
assert.equal(d.verdict, "Pas de point bloquant, 7 points à revoir.");
assert.equal(d.actions.length, 7);
assert.ok(d.actions[0].startsWith("Demandez au client un complément de 26 kg au moins"));
assert.ok(d.actions[6].startsWith("Gardez dans le dossier"));
assert.equal(d.clause.split("\n").length, 8);
assert.equal(d.clause.split("\n")[0], "Matière fournie par le client");
assert.ok(d.clause.includes("986 kg") && d.clause.includes("10 pièces") && d.clause.includes("4 800 € HT") && d.clause.includes("5 000 €"));
assert.ok(d.message.startsWith("Objet : matière fournie pour votre commande, complément nécessaire"));
assert.ok(d.message.includes("il manque 25,08 kg") && d.message.includes("au moins 26 kg"));
assert.equal(d.recap.split("\n").length, 11);
assert.equal(d.recap.split("\n")[9], "Contrôle : 2 conformes, 7 à revoir, 0 bloquant, 1 information");
assert.equal(d.recap.split("\n")[10], "Calcul : quotebuilder.co/outils/" + SLUG);
assert.ok(T(d, 0).includes("article 1787") && T(d, 0).includes("92-11.385"));
assert.ok(T(d, 6).includes("article 1789") || T(d, 6).includes("absence de faute"));

const ok = run({ fournie: "1000", reception: "oui", tracabilite: "oui", reliquats: "rendus", plafond: "10000", assurance: "10000", rebutObs: "8" });
assert.equal(S(ok), "info,ok,ok,ok,ok,ok,ok,ok,ok,ok");
assert.equal(ok.verdict, "Dossier en ordre : la matière fournie est cadrée par écrit.");
assert.equal(ok.etat, "ok");
assert.equal(ok.ecartLabel, "Marge de 14,92 kg");
assert.equal(ok.chargeLabel, "Rien à rembourser");
assert.equal(ok.actions.length, 1);
assert.ok(ok.message.startsWith("Objet : bilan de matière de votre commande"));
assert.ok(ok.message.includes("8 pièces ont été rebutées, dans la tolérance de 10 pièces"));
const exact = run({ fournie: "985.08" });
assert.equal(exact.ecartLabel, "Aucun écart");
assert.equal(exact.controles[2].statut, "ok");
const court = run({ fournie: "900" });
assert.equal(court.controles[2].statut, "bad");
assert.ok(T(court, 2).includes("ne couvre même pas les pièces bonnes"));
assert.equal(court.etat, "bad");
assert.equal(court.verdict, "À régulariser avant de lancer : 1 point bloquant, 6 points à revoir.");
assert.equal(run({ fournie: "0" }).controles[2].statut, "bad");
assert.equal(run({ fournie: "0" }).expoLabel, "À renseigner");
assert.equal(run({ fournie: "0" }).controles[8].statut, "info");
assert.equal(run({ fournie: "0" }).controles[9].statut, "info");
const incomplet = run({ quantite: "0" });
assert.equal(incomplet.besoinLabel, "À renseigner");
assert.equal(incomplet.ecartLabel, "À renseigner");
assert.equal(incomplet.controles[2].statut, "bad");
assert.ok(incomplet.clause.includes("[quantité à calculer]"));
assert.equal(run({ matPiece: "0" }).controles[2].statut, "bad");
const atelier = run({ cause: "atelier" });
assert.equal(atelier.controles[6].statut, "bad");
assert.equal(atelier.chargeLabel, "Vous : matière à remplacer et pièces à refaire (110,90 € HT)");
assert.ok(atelier.message.includes("Objet : matière fournie"));
const atelierOk = run({ cause: "atelier", fournie: "1000" });
assert.ok(atelierOk.message.startsWith("Objet : bilan de matière et rebut de votre commande"));
assert.ok(atelierOk.message.includes("sans facturation"));
assert.ok(atelierOk.message.includes("4 pièces dépassent donc la tolérance, soit 7,63 kg de matière (72,50 € HT à votre valeur de 9,50 € HT par kg)"));
assert.ok(atelierOk.actions.some((action: string) => action.startsWith("Remplacez 7,63 kg de matière et refaites 4 pièces")));
const mat = run({ cause: "matiere", fournie: "1000" });
assert.equal(mat.controles[6].statut, "ok");
assert.ok(T(mat, 6).includes("article 1790"));
assert.equal(mat.chargeLabel, "Le client, si vous prouvez le défaut de la matière (article 1790)");
assert.ok(mat.message.includes("défaut dans la matière fournie"));
const plan = run({ cause: "plan", fournie: "1000" });
assert.equal(plan.controles[6].statut, "ok");
assert.ok(T(plan, 6).includes("1112-1"));
assert.ok(plan.message.includes("respectent le plan"));
const inconnue = run({ cause: "inconnue", fournie: "1000" });
assert.ok(inconnue.message.includes("Nous recherchons la cause"));
assert.ok(inconnue.actions.some((action: string) => action.startsWith("Établissez la cause du rebut")));
const tol = run({ rebutObs: "10" });
assert.equal(tol.excess, 0);
assert.equal(tol.rebutLabel, "Dans la tolérance (10 sur 10)");
assert.equal(tol.controles[6].statut, "ok");
assert.equal(run({ rebutObs: "0" }).rebutLabel, "Aucun rebut constaté");
assert.equal(run({ rebutObs: "0" }).message.includes("Aucune pièce n'a été rebutée"), false);
assert.equal(run({ rebutObs: "0", fournie: "1000" }).message.includes("Aucune pièce n'a été rebutée."), true);
const nw = run({ chuteEcrite: "non", rebutEcrit: "non" });
assert.equal(nw.controles[3].statut, "warn");
assert.equal(nw.controles[4].statut, "warn");
assert.ok(T(nw, 3).includes("6 %"));
assert.ok(nw.actions.some((action: string) => action.startsWith("Ajoutez au devis le taux de chute (6 %)")));
const zero = run({ rebutTol: "0" });
assert.equal(zero.tolPieces, 0);
assert.equal(zero.controles[4].statut, "warn");
assert.ok(T(zero, 4).includes("0 %"));
assert.equal(zero.excess, 14);
assert.equal(run({ rebutTol: "0.3" }).tolPieces, 2);
assert.equal(run({ rebutTol: "0.2" }).tolPieces, 1);
assert.equal(run({ rebutTol: "0.1" }).tolPieces, 1);
assert.equal(run({ quantite: "1000", rebutTol: "2" }).tolPieces, 20);
assert.equal(run({ plafond: "0" }).controles[8].statut, "warn");
assert.ok(T(run({ plafond: "0" }), 8).includes("Aucun plafond écrit"));
assert.ok(T(d, 8).includes("53 %"));
assert.ok(T(d, 8).includes("article 1170") && T(d, 8).includes("faute lourde"));
assert.equal(run({ plafond: "9120" }).controles[8].statut, "ok");
assert.equal(run({ assurance: "0" }).controles[9].statut, "bad");
assert.ok(T(run({ assurance: "0" }), 9).includes("9 120 € HT"));
assert.ok(T(d, 9).includes("4 120 €"));
assert.equal(run({ assurance: "9120" }).controles[9].statut, "ok");
assert.ok(run({ plafond: "0", assurance: "0" }).clause.includes("[plafond à fixer]"));
assert.ok(run({ plafond: "0", assurance: "0" }).clause.includes("[montant à fixer]"));
assert.equal(run({ reliquats: "rendus" }).controles[7].statut, "ok");
assert.equal(run({ reliquats: "gardes" }).controles[7].statut, "ok");
assert.ok(run({ reliquats: "gardes" }).clause.includes("conservés par l'atelier avec l'accord du client"));
assert.ok(run({ reliquats: "rendus" }).clause.includes("rendus au client sous trente jours"));
const mixte = run({ nature: "mixte" });
assert.ok(T(mixte, 0).includes("article 1788") && T(mixte, 0).includes("article 1789"));
assert.equal(S(mixte), S(d));
const fourniture = run({ nature: "fourniture" });
assert.equal(fourniture.besoinLabel, "Sans objet : la matière est la vôtre");
assert.equal(fourniture.ecartLabel, "Sans objet : la matière est la vôtre");
assert.equal(fourniture.expoLabel, "Sans objet : la matière est la vôtre");
assert.equal(fourniture.chargeLabel, "Vous : la matière est la vôtre, le rebut est dans votre prix");
assert.ok(T(fourniture, 0).includes("article 1788"));
assert.ok(fourniture.message.startsWith("Sans objet"));
assert.equal(fourniture.clause.split("\n").length, 8);
assert.ok(fourniture.clause.includes("article 1788"));
assert.equal(fourniture.actions.length, 1);
assert.equal(run({ nature: "fourniture", cause: "plan" }).chargeLabel, "Le client, si vous avez suivi son plan à la lettre");
assert.equal(run({ nature: "fourniture", cause: "plan" }).controles[6].statut, "ok");
assert.equal(run({ nature: "fourniture", cause: "atelier" }).controles[6].statut, "info");
const um = run({ unite: "m", matPiece: "2.5", fournie: "1400" });
assert.ok(um.besoinLabel.endsWith(" m"));
assert.equal(um.recoArrondie, arrondiSup(500 * 2.5 * 1.06 + 10 * 2.5 * 1.06 + 12));
const uu = run({ unite: "u", matPiece: "1", chute: "0", rebutTol: "1", miseEnRoute: "5", fournie: "510" });
assert.equal(uu.recommandee, 510);
assert.equal(uu.besoinLabel, "510 unités");
assert.equal(uu.ecartLabel, "Aucun écart");
assert.ok(run({ unite: "u", matPiece: "1", chute: "0", rebutTol: "1", miseEnRoute: "1", fournie: "500" }).ecartLabel.startsWith("Il manque 6 unités"));
assert.equal(run({ unite: "u", matPiece: "1", chute: "0", rebutTol: "0", miseEnRoute: "0", fournie: "501" }).ecartLabel, "Marge de 1 unité");
const avant = run({ rebutObs: "abc", fournie: "abc", valeur: "abc" });
assert.equal(/undefined|NaN|null/.test(avant.recap + avant.clause + avant.message), false);

let combos = 0;
const lists = (key: keyof typeof LABEL_SETS) => Object.keys(LABEL_SETS[key]);
const nums: Record<string, string[]> = {
  quantite: ["1", "37", "500", "12000"],
  matPiece: ["0", "0.05", "1.8", "250"],
  prixFacon: ["0", "9.6", "1500"],
  chute: ["0", "6", "33.3", "100"],
  rebutTol: ["0", "0.3", "2", "100"],
  miseEnRoute: ["0", "12", "400"],
  fournie: ["0", "1", "954", "985.08", "986", "5000", "1000000"],
  valeur: ["0", "9.5", "480"],
  plafond: ["0", "4800", "9120", "100000"],
  assurance: ["0", "5000", "9120", "200000"],
  rebutObs: ["0", "1", "10", "14", "999999"],
};
const statutsOk = new Set(["ok", "warn", "bad", "info"]);

function oracle(input: Record<string, string | null | undefined>) {
  const x = asNorm(input);
  const per = x.mp * (1 + x.pChute / 100);
  const conso = x.q * x.mp * (1 + x.pChute / 100);
  const tol = Math.ceil(Math.round((x.q * x.pRebut) / 100 * 1e6) / 1e6);
  const reco = conso + tol * per + x.mer;
  const exc = Math.max(0, x.rebutN - tol);
  return { conso, tol, reco, exc, matExc: exc * per };
}

function check(input: Record<string, string | null | undefined>) {
  const result = computeMatiere(input);
  combos++;
  const all =
    result.recap +
    "\n" +
    result.clause +
    "\n" +
    result.message +
    "\n" +
    result.verdict +
    "\n" +
    result.besoinLabel +
    result.ecartLabel +
    result.rebutLabel +
    result.chargeLabel +
    result.expoLabel +
    result.controles.map((item: { texte: string }) => item.texte).join("\n") +
    result.actions.join("\n");
  assert.equal(/undefined|NaN|null|Infinity/.test(all), false);
  assert.equal(FORBIDDEN.test(all), false);
  assert.equal(result.controles.length, 10);
  result.controles.forEach((item: { statut: string; id: string; texte: string }, index: number) => {
    assert.ok(statutsOk.has(item.statut));
    assert.equal(item.id, POINTS[index].id);
    assert.ok(item.texte.length > 10);
  });
  assert.equal(result.nbOk + result.nbWarn + result.nbBad + result.nbInfo, 10);
  assert.equal(result.etat, result.nbBad > 0 ? "bad" : result.nbWarn > 0 ? "warn" : "ok");
  assert.equal(result.recap.split("\n").length, 11);
  assert.equal(result.clause.split("\n").length, 8);
  assert.ok(result.actions.length >= 1 && result.actions[result.actions.length - 1].startsWith("Gardez dans le dossier"));
  assert.equal(result.verdict.length > 10, true);
  const x = asNorm(input);
  if (x.q > 0 && x.mp > 0) {
    const expected = oracle(input);
    assert.ok(Math.abs(result.conso - expected.conso) < 1e-6 * Math.max(1, expected.conso));
    assert.equal(result.tolPieces, expected.tol);
    assert.ok(Math.abs(result.recommandee - expected.reco) < 1e-6 * Math.max(1, expected.reco));
    assert.equal(result.excess, expected.exc);
    assert.ok(Math.abs(result.matExcess - expected.matExc) < 1e-6 * Math.max(1, expected.matExc));
    assert.equal(result.ecart < 0, x.four - expected.reco < 0);
    if (input.nature !== "fourniture") {
      const quantiteStatut = result.controles[2].statut;
      if (x.four > 0 && result.ecart >= 0) assert.equal(quantiteStatut, "ok");
      if (x.four < expected.conso || x.four <= 0) assert.equal(quantiteStatut, "bad");
      if (x.four >= expected.conso && x.four > 0 && result.ecart < 0) assert.equal(quantiteStatut, "warn");
    }
  } else {
    assert.equal(result.besoinLabel, input.nature === "fourniture" ? "Sans objet : la matière est la vôtre" : "À renseigner");
  }
  if (input.nature === "fourniture") {
    assert.deepEqual(
      [1, 2, 3, 5, 7, 8, 9].map((index) => result.controles[index].statut).filter((statut: string) => statut !== "info"),
      [],
    );
  }
  if (result.excess === 0) assert.equal(result.chargeLabel, "Rien à rembourser");
  assert.ok(result.recoArrondie >= result.recommandee - 1e-9 && result.recoArrondie < result.recommandee + 1);
}

const base = { ...DEFAULTS };
const keysNum = Object.keys(nums);
const selKeys: (keyof typeof LABEL_SETS)[] = ["nature", "unite", "chuteEcrite", "rebutEcrit", "reliquats", "reception", "tracabilite", "cause"];
for (const key of keysNum) {
  for (const value of nums[key]) {
    for (const nature of lists("nature")) {
      for (const cause of lists("cause")) {
        for (const unite of lists("unite")) check({ ...base, [key]: value, nature, cause, unite });
      }
    }
  }
}
const cart = (keys: (keyof typeof LABEL_SETS)[]) =>
  keys.reduce<Record<string, string>[]>((acc, key) => acc.flatMap((row) => lists(key).map((value) => ({ ...row, [key]: value }))), [{}]);
for (const row of cart(selKeys)) check({ ...base, ...row });
for (const quantite of nums.quantite) {
  for (const matPiece of nums.matPiece) {
    for (const chute of nums.chute) {
      for (const rebutTol of nums.rebutTol) {
        for (const fournie of nums.fournie) {
          for (const rebutObs of nums.rebutObs) {
            for (const nature of lists("nature")) {
              for (const cause of lists("cause")) {
                check({ ...base, quantite, matPiece, chute, rebutTol, fournie, rebutObs, nature, cause });
              }
            }
          }
        }
      }
    }
  }
}
for (const valeur of nums.valeur) {
  for (const plafond of nums.plafond) {
    for (const assurance of nums.assurance) {
      for (const miseEnRoute of nums.miseEnRoute) {
        for (const prixFacon of nums.prixFacon) {
          for (const fournie of nums.fournie) {
            for (const nature of lists("nature")) {
              check({ ...base, valeur, plafond, assurance, miseEnRoute, prixFacon, fournie, nature });
            }
          }
        }
      }
    }
  }
}
for (const junk of ["", "abc", "-1", "1e9999", "  ", "NaN", null, undefined, "1,5", "1 000"]) {
  for (const key of keysNum) check({ ...base, [key]: junk });
}
assert.ok(combos >= 20000, `assez de combinaisons (${combos})`);
assert.deepEqual(run({}), run({}));
