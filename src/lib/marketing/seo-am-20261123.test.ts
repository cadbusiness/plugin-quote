import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { PRODUCT_SPEC_LABELS } from "../catalog/specs";
import { formatPrice } from "../format";
import { scoreQuote } from "../quotes/score";
import { articleHtml } from "./article-html";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_MARQUAGE_CE,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";
import {
  CONSERVATION_ANS,
  DEFAULTS,
  LABEL_SETS,
  PIECE_ORGANISME,
  POINTS,
  PRODUIT_COURT,
  SLUG,
  STATUT_LABELS,
  SYSTEMES_ORGANISME,
  SYSTEME_NOM,
  addYears,
  fmtDate,
  isoDate,
  normalize,
  parseDate,
  pluriel,
  verifierMarquage,
  type MarquageResult,
} from "./verificateur-marquage-ce-declaration-performances";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "marquage-ce-declaration-performances-produits-construction-devis-b2b";
const BLOG_PATH = "/blog/marquage-ce-declaration-performances-produits-construction-devis-b2b";
const SECTOR_SLUG = "funnel-devis-vitrerie-miroiterie";
const SECTOR_PATH = "/secteurs/funnel-devis-vitrerie-miroiterie";
const TOOL_PATH = "/outils/verificateur-marquage-ce-declaration-performances";
const DAY = "2026-11-23";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];
const TOOL_TITLE = "Vérificateur de marquage CE et de déclaration des performances";
const TOOL_TEXT = "Fenêtre, porte, vitrage ou structure : déclaration des performances, marquage CE, dérogation du sur-mesure, organisme notifié, la mention de devis et le courrier.";
const PRIOR_TOOL = "/outils/calculateur-frais-stockage-commande-non-retiree";
const PRIOR_SECTOR = "/secteurs/funnel-devis-injection-plastique-moules";

const run = (overrides: Record<string, string>) => verifierMarquage({ ...DEFAULTS, ...overrides });
const S = (result: MarquageResult) => result.controles.map((item) => item.statut).join(",");
const CORRIGE = { remise: "email", perfDevis: "dop" };

assert.equal(SLUG, "verificateur-marquage-ce-declaration-performances");
assert.equal(BLOG_TOOL_MARQUAGE_CE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "funnel"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 29);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.equal(BLOG_POSTS.some((post) => post.slug === SECTOR_SLUG), false);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, TOOL_TITLE);
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue", "funnel"]);
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
assert.equal(MARKETING_ROUTES.find((route) => route.path === SECTOR_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === PRIOR_SECTOR)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.ok(paths.indexOf(BLOG_PATH) > paths.indexOf(PRIOR_TOOL));
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
const blogTitle = BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title ?? "";
assert.ok(llms.includes(`${blogTitle} : https://www.quotebuilder.co${BLOG_PATH}`));
assert.ok(llms.includes(`Funnel de devis vitrerie et miroiterie : https://www.quotebuilder.co${SECTOR_PATH}`));
assert.ok(llms.includes(`Vérificateur de marquage CE et de déclaration des performances : https://www.quotebuilder.co${TOOL_PATH}`));
const priorToolLine = llms.indexOf(`https://www.quotebuilder.co${PRIOR_TOOL}`);
const priorSectorLine = llms.indexOf(`https://www.quotebuilder.co${PRIOR_SECTOR}`);
assert.ok(llms.indexOf(`https://www.quotebuilder.co${BLOG_PATH}`) > priorToolLine);
assert.ok(llms.indexOf(`https://www.quotebuilder.co${TOOL_PATH}`) > llms.indexOf(`https://www.quotebuilder.co${BLOG_PATH}`));
assert.ok(llms.indexOf(`https://www.quotebuilder.co${SECTOR_PATH}`) > priorSectorLine);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.ok(outilsHub.includes("verificateur-marquage-ce-declaration-performances"));
assert.ok(outilsHub.includes(TOOL_TITLE));
assert.ok(outilsHub.includes(TOOL_TEXT));
assert.ok(outilsHub.includes("vérificateur de marquage CE et de déclaration des performances"));
{
  const start = outilsHub.indexOf('href: "/outils/verificateur-marquage-ce-declaration-performances"');
  assert.ok(start > outilsHub.indexOf('href: "/outils/calculateur-frais-stockage-commande-non-retiree"'));
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
assert.ok(outilsHub.includes("outilsHubIntro()"));
assert.equal(outilsHub.includes('eyebrow: "Conformité"'), false);

const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes(SECTOR_PATH));
assert.ok(secteursHub.includes("Vitrerie et miroiterie"));
assert.ok(secteursHub.indexOf(SECTOR_PATH) > secteursHub.indexOf(PRIOR_SECTOR));

assert.equal(BLOG_TOOLS.length, 98);
assert.equal(BLOG_POSTS.length, 108);
assert.equal(outilsHubIntro(), "Quatre-vingt-dix-huit outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(98), outilsHubIntro());
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
    "305/2011",
    "2024/3110",
    "157/2014",
    "article 5",
    "article 37",
    "article 38",
    "8 janvier 2026",
    "8 janvier 2027",
    "9 janvier 2031",
    "8 janvier 2040",
    "1er février 2010",
    "NF EN 14351-1",
    "NF EN 1090-1",
    "NF EN 1279-5",
    "NPD",
    "15 mars 2027",
    "15 mars 2037",
    "dix ans",
    "non contractuel",
    "Conformité",
    "Mode d'emploi",
    "Menuisier",
    "/outils/verificateur-marquage-ce-declaration-performances",
    "/secteurs/funnel-devis-vitrerie-miroiterie",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(norm.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  const html = articleHtml(blogBody);
  assert.ok(html.includes("<table"), "blog tables");
  assert.ok((html.match(/<table/g) ?? []).length >= 4, "markdown tables");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const pageSrc = readFileSync(join(process.cwd(), `src/app/(marketing)/secteurs/${SECTOR_SLUG}/page.tsx`), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  const fromMd = faqFromMarkdown(sectorBody);
  const questions = [...pageSrc.matchAll(/\bq: "([^"]*)"/g)].map((match) => match[1]);
  const answers = [...pageSrc.matchAll(/\ba: "([^"]*)"/g)].map((match) => match[1]);
  assert.equal(questions.length, 10);
  assert.deepEqual(fromMd, questions.map((q, index) => ({ q, a: answers[index] })));
  assertNoDashes(sectorRaw, "sector md");
  assertNoDashes(pageSrc, "sector page");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(pageSrc.includes('about: "Vitrerie et miroiterie"'));
  assert.ok(pageSrc.includes("Secteur · Vitrerie et miroiterie"));
  assert.ok(pageSrc.includes('title="Essayer gratuitement"'));
  assert.ok(pageSrc.includes("QuoteBuilder n'a pas de template vitrerie ou miroiterie : partez de Menuisier."));
  for (const href of [
    "/blog/marquage-ce-declaration-performances-produits-construction-devis-b2b",
    "/outils/verificateur-marquage-ce-declaration-performances",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(pageSrc.includes(href), href);
  }
  const norm = sectorBody.replace(/[\u00a0\u202f]/g, " ");
  for (const needle of [
    "Menuisier",
    "Habitat & aménagement",
    "Funnel menuiserie",
    "Plan (PDF ou image)",
    "30 points",
    "Cold",
    "FD DTU 39 P5",
    "NF EN 1279-5",
    "185,50 €",
    "186 €",
    "Conformité",
    "/blog/marquage-ce-declaration-performances-produits-construction-devis-b2b",
    "/outils/verificateur-marquage-ce-declaration-performances",
  ]) {
    assert.ok(norm.includes(needle), `sector missing ${needle}`);
  }
}

const added = [
  "src/lib/marketing/verificateur-marquage-ce-declaration-performances.ts",
  "src/components/marketing/verificateur-marquage-ce-declaration-performances-calculator.tsx",
  "src/app/(marketing)/outils/verificateur-marquage-ce-declaration-performances/page.tsx",
  `src/content/blog/${BLOG_SLUG}.md`,
  `src/content/blog/${SECTOR_SLUG}.md`,
  `src/app/(marketing)/secteurs/${SECTOR_SLUG}/page.tsx`,
];
for (const rel of added) assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);

const templates = readFileSync(join(process.cwd(), "src/lib/funnels/templates.ts"), "utf8");
for (const needle of [
  'id: "wood"',
  "Menuisier",
  "Funnel menuiserie",
  "Escalier / garde-corps",
  "Fenêtre, porte, store",
  "Dimensions ou contraintes",
  "Pièces et finitions de votre catalogue",
]) {
  assert.ok(templates.includes(needle), needle);
}
const scored = scoreQuote({ usage: "opening", essence: "walnut", notes: "Ex. 2 vitrages 120 x 180 cm" });
assert.deepEqual(scored, { score: 30, label: "cold" });
const sheet = readFileSync(join(process.cwd(), "src/lib/catalog/sheet.ts"), "utf8");
for (const needle of ["Mode d'emploi", "Conformité", "Garantie"]) assert.ok(sheet.includes(needle), needle);
assert.ok(readFileSync(join(process.cwd(), "src/components/catalog/sheet-fields.tsx"), "utf8").includes("Notice (PDF ou lien)"));
assert.deepEqual(Object.values(PRODUCT_SPEC_LABELS), ["Charge", "Hauteur", "Profondeur", "Matériau", "Délai"]);
assert.equal(Object.keys(PRODUCT_SPEC_LABELS).length, 5);
const builder = readFileSync(join(process.cwd(), "src/lib/funnels/builder.ts"), "utf8");
assert.equal(builder.includes("date"), false);
const seed = readFileSync(join(process.cwd(), "src/lib/crm/seed.ts"), "utf8");
for (const needle of ["Nouveau", "Contacté", "En cours", "Gagné", "Perdu", "En attente"]) assert.ok(seed.includes(needle), needle);
assert.equal(formatPrice(185.5, null).replace(/[\u00a0\u202f]/g, " "), "186 €");
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);

const pageSrc = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/verificateur-marquage-ce-declaration-performances/page.tsx"), "utf8");
const componentSrc = readFileSync(join(process.cwd(), "src/components/marketing/verificateur-marquage-ce-declaration-performances-calculator.tsx"), "utf8");
assert.ok(pageSrc.includes(TOOL_PATH));
assert.ok(pageSrc.includes("Vérificateur de marquage CE et de déclaration des performances d'un produit de construction"));
assert.ok(pageSrc.includes("pas un conseil juridique"));
assert.ok(pageSrc.includes("Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."));
assert.ok(pageSrc.includes("Calcul local, aucune donnée envoyée."));
assert.ok(componentSrc.includes("Textes lus le 23 novembre 2026"));
assert.ok(componentSrc.includes("Lectures retenues"));
assert.ok(componentSrc.includes("Non traités"));
assert.equal((componentSrc.match(/<CopyButton /g) ?? []).length, 3);
assert.doesNotMatch(pageSrc, /\/blog\/espace-prospect-devis-en-ligne/);
for (const href of [
  "/blog/marquage-ce-declaration-performances-produits-construction-devis-b2b",
  "/secteurs/funnel-devis-vitrerie-miroiterie",
  "/blog/garantie-vices-caches-sav-devis-b2b",
  "/blog/attestation-assurance-decennale-devis-b2b",
  "/outils/verificateur-attestation-assurance-decennale",
  "/signup?plan=free",
  "/c/demo/rayonnage",
  "/tarifs",
]) {
  assert.ok(pageSrc.includes(href), href);
}
for (const label of [
  "Votre rôle pour ce produit",
  "Type de produit",
  "Le produit est couvert par",
  "Texte applicable à cette famille de produits",
  "Comment le produit est fabriqué",
  "Vous posez vous-même le produit dans un ouvrage identifié",
  "Système d'évaluation de la norme (annexe ZA)",
  "Un organisme notifié est intervenu",
  "Microentreprise (moins de 10 personnes, chiffre d'affaires ou bilan jusqu'à 2 M€)",
  "Date de livraison du produit",
  "Une déclaration des performances existe pour ce produit",
  "Le produit porte le marquage CE",
  "La déclaration est remise au client",
  "Langue de la déclaration",
  "Performances écrites sur le devis (thermique, acoustique, charge, résistance au vent...)",
  "Votre rôle et le produit",
  "La fabrication et la pose",
  "Les documents et le devis",
  "Le résultat",
  "Le contrôle point par point",
  "La mention à écrire dans le devis",
  "Ce qu'il faut faire",
  "Le courrier qui accompagne la déclaration",
  "Récapitulatif",
]) {
  assert.ok(componentSrc.includes(label), label);
}

assert.equal(Object.keys(DEFAULTS).length, 15);
assert.equal(POINTS.length, 10);
assert.equal(CONSERVATION_ANS, 10);
assert.deepEqual(SYSTEMES_ORGANISME, ["s1plus", "s1", "s2plus", "s3"]);
assert.deepEqual(SYSTEME_NOM, { s1plus: "1+", s1: "1", s2plus: "2+", s3: "3", s4: "4" });
assert.equal(Object.keys(PIECE_ORGANISME).length, 4);
assert.deepEqual(Object.keys(PRODUIT_COURT).sort(), Object.keys(LABEL_SETS.produit).sort());
assert.deepEqual(Object.keys(STATUT_LABELS), ["ok", "warn", "bad", "info"]);
assert.equal(Object.keys(LABEL_SETS).length, 14);
assert.equal(parseDate("2027-02-30"), null);
assert.equal(parseDate("2026-13-01"), null);
assert.equal(parseDate(""), null);
assert.equal(parseDate("15/03/2027"), null);
assert.equal(isoDate(parseDate("2028-02-29")), "2028-02-29");
assert.equal(isoDate(addYears(parseDate("2027-03-15") as Date, 10)), "2037-03-15");
assert.equal(isoDate(addYears(parseDate("2028-02-29") as Date, 10)), "2038-02-28");
assert.equal(isoDate(addYears(parseDate("2028-02-29") as Date, 4)), "2032-02-29");
assert.equal(fmtDate(parseDate("2037-03-15")), "15 mars 2037");
assert.equal(fmtDate(parseDate("2027-01-01")), "1er janvier 2027");
assert.equal(fmtDate(null), "date non renseignée");
assert.equal(pluriel(1, "point bloquant", "points bloquants"), "1 point bloquant");
assert.equal(pluriel(2, "point bloquant", "points bloquants"), "2 points bloquants");
assert.equal(pluriel(0, "conforme"), "0 conforme");
assert.equal(pluriel(3, "conforme"), "3 conformes");
const nz = normalize({ role: "pirate", produit: " vitrage ", dateMiseMarche: "x" });
assert.equal(nz.role, "fabricant");
assert.equal(nz.produit, "vitrage");
assert.equal(nz.date, null);
assert.equal(normalize(null).perfDevis, "horsdop");
assert.equal(normalize({ __proto__: null, role: "toString" } as Record<string, unknown>).role, "fabricant");

const d = run({});
assert.equal(S(d), "info,ok,info,info,ok,ok,ok,bad,bad,info");
assert.equal(d.nbOk, 4);
assert.equal(d.nbWarn, 0);
assert.equal(d.nbBad, 2);
assert.equal(d.nbInfo, 4);
assert.equal(d.etat, "bad");
assert.equal(d.verdict, "À régulariser avant de livrer : 2 points bloquants.");
assert.equal(d.dopLabel, "Obligatoire");
assert.equal(d.ceLabel, "Obligatoire");
assert.equal(d.organismeLabel, "Intervenu (système 3)");
assert.equal(d.conservationLabel, "15 mars 2037");
assert.equal(isoDate(d.finConservation), "2037-03-15");
assert.equal(d.derogCond, false);
assert.equal(d.relevant, true);
assert.equal(d.microS3, true);
assert.equal(d.actions.length, 3);
assert.ok(d.actions[0].startsWith("Envoyez la déclaration au client"));
assert.ok(d.actions[1].startsWith("Retirez du devis les performances"));
assert.equal(d.actions[2], "Gardez dans le dossier la déclaration, la pièce de l'organisme notifié s'il y en a une et la preuve de remise au client, jusqu'au 15 mars 2037.");
assert.equal(d.clause.split("\n").length, 6);
assert.equal(d.clause.split("\n")[0], "Marquage CE et déclaration des performances");
assert.equal(d.clause.split("\n")[1], "Produit : fenêtre ou porte extérieure pour piétons, NF EN 14351-1.");
assert.equal(d.recap.split("\n").length, 11);
assert.equal(d.recap.split("\n")[9], "Contrôle : 4 conformes, 0 à revoir, 2 bloquants, 4 informations");

const ok = run(CORRIGE);
assert.equal(S(ok), "info,ok,info,info,ok,ok,ok,ok,ok,info");
assert.equal(ok.etat, "ok");
assert.equal(ok.verdict, "Dossier en ordre sur ces points : vous pouvez livrer avec ces documents.");
assert.equal(ok.actions.length, 1);

const noOn = run({ ...CORRIGE, organisme: "non" });
assert.equal(noOn.controles[4].statut, "warn");
assert.equal(noOn.organismeLabel, "Système 3, ou 4 pour une microentreprise (article 37)");
assert.equal(noOn.verdict, "Pas de point bloquant, 1 point à revoir.");
const noOnPme = run({ ...CORRIGE, organisme: "non", micro: "non" });
assert.equal(noOnPme.controles[4].statut, "bad");
assert.equal(noOnPme.organismeLabel, "Requis (système 3), manquant");

const der = run({ ...CORRIGE, procede: "unique", dop: "non", ce: "non", perfDevis: "horsdop" });
assert.equal(S(der), "info,ok,info,ok,info,ok,ok,info,warn,info");
assert.equal(der.dopLabel, "Pas obligatoire (dérogation de l'article 5)");
assert.equal(der.ceLabel, "À ne pas apposer sans déclaration");
assert.equal(der.organismeLabel, "Sans objet");

const hc = run({ couverture: "aucune", ce: "oui", perfDevis: "horsdop" });
assert.equal(S(hc), "info,info,info,info,info,info,bad,info,warn,info");

const dist = run({ role: "distributeur", dop: "non", ce: "non" });
assert.equal(S(dist), "info,ok,info,info,info,bad,bad,bad,bad,info");
assert.equal(dist.conservationLabel, "15 mars 2037 (conseillé)");

const pos = run({ role: "poseur", dop: "non", ce: "non", perfDevis: "aucune" });
assert.equal(S(pos), "info,ok,info,info,info,warn,warn,warn,info,info");
assert.equal(pos.verdict, "Pas de point bloquant, 3 points à revoir.");

assert.equal(run({ dateMiseMarche: "2028-02-29" }).conservationLabel, "28 février 2038");
assert.equal(run({ dateMiseMarche: "2027-02-30" }).conservationLabel, "Date à renseigner");

let combos = 0;
let checked = 0;
const keys = (name: string) => Object.keys(LABEL_SETS[name]);
const produits = keys("produit");
const dates = ["2027-03-15", "", "2028-02-29"];
for (const role of keys("role")) for (const couverture of keys("couverture")) for (const regime of keys("regime")) for (const procede of keys("procede"))
for (const pose of keys("pose")) for (const systeme of keys("systeme")) for (const organisme of keys("organisme")) for (const micro of keys("micro"))
for (const dop of keys("dop")) for (const ce of keys("ce")) for (const remise of keys("remise")) for (const langue of keys("langue")) for (const perfDevis of keys("perfDevis")) {
  if (combos % 20 === 0) {
    const produit = produits[combos % produits.length];
    const dateMiseMarche = dates[combos % dates.length];
    const x = verifierMarquage({ role, produit, couverture, regime, procede, pose, systeme, organisme, micro, dateMiseMarche, dop, ce, remise, langue, perfDevis });
    checked += 1;
    assert.equal(x.controles.length, 10);
    assert.equal(x.nbOk + x.nbWarn + x.nbBad + x.nbInfo, 10);
    for (const point of x.controles) {
      assert.ok(STATUT_LABELS[point.statut]);
      assert.ok(point.texte && !/undefined|NaN|null|Invalid/.test(point.texte));
    }
    assert.equal(x.etat, x.nbBad ? "bad" : x.nbWarn ? "warn" : "ok");
    for (const text of [x.verdict, x.clause, x.message, x.recap, x.actions.join(" "), x.dopLabel, x.ceLabel, x.organismeLabel, x.conservationLabel]) {
      assert.equal(/undefined|NaN|null|Invalid|\[object/.test(text), false);
      assert.equal(/[\u2013\u2014\u2212]/.test(text), false);
    }
    assert.equal(x.clause.split("\n").length, 6);
    assert.equal(x.recap.split("\n").length, 11);
    assert.ok(x.actions.length >= 1 && x.actions[x.actions.length - 1].startsWith("Gardez dans le dossier"));
    assert.equal(x.clause.split("\n")[1], `Produit : ${PRODUIT_COURT[produit]}.`);
  }
  combos += 1;
}
assert.equal(combos, 1327104);
assert.ok(checked >= 50000, `sweep ${checked}`);

console.log("seo-am-20261123 ok");
