import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_ERREUR_PRIX, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-erreur-prix-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "erreur-prix-devis-b2b";
const BLOG_PATH = "/blog/erreur-prix-devis-b2b";
const TOOL_PATH = "/outils/verificateur-erreur-prix-devis";
const DAY = "2026-11-10";
const DAY_PATHS = ["/blog/erreur-prix-devis-b2b", "/outils/verificateur-erreur-prix-devis"];

assert.equal(BLOG_TOOL_ERREUR_PRIX, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 44);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur d'erreur de prix dans un devis");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Total faux, prix unitaire, oubli ou mauvaise estimation : douze points contrôlés, l'écart, le prix de référence et la clause à écrire.");

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
for (const path of DAY_PATHS) assert.ok(llms.includes("https://www.quotebuilder.co" + path), path);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.ok(outilsHub.includes("verificateur-erreur-prix-devis"));
assert.ok(outilsHub.includes("Vérificateur d'erreur de prix dans un devis"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-erreur-prix-devis\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}



function faqQuestionCount(body: string) {
  const marker = "\n## FAQ\n";
  const start = body.indexOf(marker);
  assert.ok(start >= 0, "FAQ heading missing");
  const after = body.slice(start + marker.length);
  const next = after.search(/\n## [^#]/);
  const section = next === -1 ? after : after.slice(0, next);
  return section.split("\n").filter((line: string) => line.startsWith("### ")).length;
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
    .map((part: string) => {
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 9780);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertNoDashes(blogRaw, "blog md");
  assertInternalLinks(blogBody, "blog");
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  for (const needle of [

  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
}

for (const rel of ["src/lib/marketing/verificateur-erreur-prix-devis.ts","src/components/marketing/verificateur-erreur-prix-devis-calculator.tsx","src/app/(marketing)/outils/verificateur-erreur-prix-devis/page.tsx","src/content/blog/erreur-prix-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, POINTS, computeErreurPrix, buildRecap, fmtEur, fmtDate, fmtPct, parseDate, num, addYears, daysBetween } = X;\nconst run = (o) => computeErreurPrix({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point === point);\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\n\n// Statique\nconst numIds = [\"montantDevis\", \"montantCorrect\"];\nconst dateIds = [\"dateAcceptation\", \"dateDecouverte\", \"dateSignalement\"];\nconst selIds = [\"role\", \"stade\", \"typeErreur\", \"elementsCalcul\", \"evidence\", \"confirmation\", \"clientPro\", \"forfait\", \"clauseErreur\", \"tiers\"];\nassert.strictEqual(Object.keys(DEFAULTS).length, 15);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 15);\n\n\nconst labelMap = {\n  role: \"ROLE_LABELS\", stade: \"STADE_LABELS\", typeErreur: \"TYPE_LABELS\", elementsCalcul: \"ELEMENTS_LABELS\",\n  evidence: \"EVIDENCE_LABELS\", confirmation: \"CONFIRMATION_LABELS\", clientPro: \"CLIENTPRO_LABELS\",\n  forfait: \"FORFAIT_LABELS\", clauseErreur: \"CLAUSE_LABELS\", tiers: \"TIERS_LABELS\"\n};\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.strictEqual(X.REPERE_JOURS, 8);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\nassert.deepStrictEqual(POINTS, [\"Stade du devis\", \"Nature de l'erreur\", \"Éléments de calcul\", \"Caractère décelable\", \"Confirmation du prix\", \"Qualité du client\", \"Type de prix\", \"Clause d'erreur matérielle\", \"Tiers vérificateur\", \"Montants et écart\", \"Délai de réaction\", \"Délai pour agir\"]);\n\n// Helpers\nassert.strictEqual(fmtEur(27030), \"27 030 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtEur(1234567), \"1 234 567 €\");\nassert.strictEqual(fmtEur(-6720), \"\\u22126 720 €\");\nassert.strictEqual(fmtPct(24.8612), \"24,9\");\nassert.strictEqual(fmtPct(25), \"25\");\nassert.strictEqual(fmtPct(100), \"100\");\nassert.strictEqual(fmtPct(0.04), \"0\");\nassert.strictEqual(fmtDate({ y: 2026, m: 11, d: 20 }), \"20 novembre 2026\");\nassert.strictEqual(fmtDate({ y: 2027, m: 3, d: 1 }), \"1er mars 2027\");\nassert.deepStrictEqual(parseDate(\"2026-11-25\"), { y: 2026, m: 11, d: 25 });\nassert.strictEqual(parseDate(\"2027-02-29\"), null);\nassert.strictEqual(parseDate(\"25/11/2026\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.strictEqual(parseDate(undefined), null);\nassert.deepStrictEqual(addYears({ y: 2028, m: 2, d: 29 }, 5), { y: 2033, m: 2, d: 28 });\nassert.deepStrictEqual(addYears({ y: 2026, m: 11, d: 25 }, 5), { y: 2031, m: 11, d: 25 });\nassert.strictEqual(daysBetween({ y: 2026, m: 11, d: 25 }, { y: 2026, m: 11, d: 26 }), 1);\nassert.strictEqual(daysBetween({ y: 2026, m: 12, d: 31 }, { y: 2027, m: 1, d: 1 }), 1);\nassert.strictEqual(daysBetween({ y: 2027, m: 3, d: 27 }, { y: 2027, m: 3, d: 29 }), 2);\nassert.strictEqual(num(\"27 030\", 0, 1e9, 0), 27030);\nassert.strictEqual(num(\"27\\u00a0030\", 0, 1e9, 0), 27030);\nassert.strictEqual(num(\"abc\", 0, 1e9, 7), 7);\nassert.strictEqual(num(\"-5\", 0, 1e9, 0), 0);\nassert.strictEqual(num(\"12,9\", 0, 1e9, 0), 12);\n\n// Défauts (hypothèses d'exemple)\nconst d = run({});\nassert.strictEqual(d.controles.length, 12);\nassert.deepStrictEqual(d.controles.map((c) => c.point), POINTS);\nassert.deepStrictEqual(d.controles.map((c) => c.statut), [\"info\", \"ok\", \"ok\", \"ok\", \"ok\", \"info\", \"ok\", \"warn\", \"info\", \"ok\", \"ok\", \"info\"]);\nassert.strictEqual(d.nbOk, 7); assert.strictEqual(d.nbWarn, 1); assert.strictEqual(d.nbBad, 0); assert.strictEqual(d.nbInfo, 4);\nassert.strictEqual(d.etat, \"warn\");\nassert.strictEqual(d.ecart, 6720);\nassert.strictEqual(d.pctLabel, \"24,9 %\");\nassert.strictEqual(d.sens, \"bas\");\nassert.strictEqual(d.demandeur, \"emetteur\");\nassert.strictEqual(d.issue, \"Rectification envisageable\");\nassert.strictEqual(d.retenu, 27030);\nassert.strictEqual(d.ecartLabel, \"6 720 € (24,9 %)\");\nassert.strictEqual(d.delaiReaction, 1);\nassert.strictEqual(d.dateLimite, \"2031-11-25\");\nassert.strictEqual(d.delaiLabel, \"Vers le 25 novembre 2031 (repère)\");\nassert.strictEqual(d.verdict, \"Aucun point bloquant, 1 à compléter. Erreur arithmétique rectifiable : total défendable 27 030 € au lieu de 20 310 € (écart 6 720 €, 24,9 %).\");\nassert(T(d, \"Stade du devis\").includes(\"le 20 novembre 2026 (article 1121)\"));\nassert(T(d, \"Nature de l'erreur\").includes(\"11-13.120\"));\nassert(T(d, \"Clause d'erreur matérielle\").includes(\"article 1190\"));\nassert(T(d, \"Montants et écart\").includes(\"6 720 € (24,9 % du montant correct)\"));\nassert(T(d, \"Délai pour agir\").includes(\"25 novembre 2031\"));\nassert.strictEqual(d.articles, 6);\nassert.strictEqual(d.clause.split(\"\\n\").length, 7);\nassert(d.clause.startsWith(\"Prix et erreurs matérielles\\nArticle 1. Détail du prix.\"));\nassert(d.clause.includes(\"les quantités et prix unitaires font foi\"));\nassert(d.clause.includes(\"dans les [8] jours\"));\nassert(!d.clause.includes(\"1793\"));\nassert(d.message.startsWith(\"Objet : devis n° [référence] accepté le 20 novembre 2026 : erreur de calcul sur le total\"));\nassert(d.message.includes(\"le total indiqué, 20 310 €, ne correspond pas à la somme des lignes, qui donne 27 030 €\"));\nassert.strictEqual(d.actions.length, 2);\nassert(d.actions[0].startsWith(\"Clause d'erreur matérielle : \"));\nassert(d.actions[1].startsWith(\"Écrire à l'autre partie\"));\nassert.strictEqual(d.recap.split(\"\\n\").length, 11);\nassert.deepStrictEqual(d.recap.split(\"\\n\"), [\n  \"Vérificateur d'erreur de prix dans un devis (QuoteBuilder)\",\n  \"Position : émetteur du devis\",\n  \"Stade : accepté, pas encore exécuté\",\n  \"Erreur : total différent de la somme des lignes\",\n  \"Montant du devis : 20 310 € ; montant correct : 27 030 €\",\n  \"Écart : 6 720 € (24,9 %) ; prix trop bas, au détriment de l'émetteur\",\n  \"Issue : Rectification envisageable\",\n  \"Prix de référence : 27 030 €\",\n  \"Contrôles : 7 conformes, 1 à compléter, 0 bloquant, 4 informations\",\n  \"Délai pour agir : Vers le 25 novembre 2031 (repère)\",\n  \"Calcul : quotebuilder.co/outils/verificateur-erreur-prix-devis\"\n]);\nassert.strictEqual(buildRecap(d), d.recap);\nconst vide = computeErreurPrix();\nassert.strictEqual(vide.role, \"emetteur\"); assert.strictEqual(vide.montantDevis, 0); assert.strictEqual(vide.issue, \"Aucun écart\");\nassert(!/NaN|undefined|\\bnull\\b/.test(vide.recap + vide.verdict + vide.message), \"entrée vide sans NaN\");\n\n// Clause acceptée : tout conforme\nconst cl = run({ clauseErreur: \"presente\" });\nassert.strictEqual(cl.etat, \"ok\"); assert.strictEqual(cl.nbOk, 8); assert.strictEqual(cl.nbWarn, 0);\nassert.strictEqual(cl.verdict, \"Aucun point bloquant. Erreur arithmétique rectifiable : total défendable 27 030 € au lieu de 20 310 € (écart 6 720 €, 24,9 %).\");\nassert.strictEqual(cl.actions.length, 1);\nassert.strictEqual(S(run({ clauseErreur: \"transmise\" }), \"Clause d'erreur matérielle\"), \"warn\");\nassert(T(run({ clauseErreur: \"transmise\" }), \"Clause d'erreur matérielle\").includes(\"1119\"));\n\n// Prix confirmé par écrit (09-66.495)\nconst cf = run({ confirmation: \"oui\" });\nassert.strictEqual(S(cf, \"Confirmation du prix\"), \"bad\");\nassert(T(cf, \"Confirmation du prix\").includes(\"09-66.495\"));\nassert.strictEqual(cf.etat, \"bad\"); assert.strictEqual(cf.issue, \"Prix accepté maintenu\"); assert.strictEqual(cf.retenu, 20310);\nassert.strictEqual(cf.verdict, \"1 point bloquant et 1 à compléter. Le prix accepté de 20 310 € reste la référence ; écart en jeu : 6 720 € (24,9 %).\");\nassert(cf.message.startsWith(\"Objet : devis n° [référence] accepté le 20 novembre 2026 : demande de réexamen du prix\"));\nassert(cf.message.includes(\"Nous savons que le prix accepté nous engage.\"));\nassert(cf.actions[cf.actions.length - 1].startsWith(\"Ne pas facturer ni retenir l'écart d'office\"));\n\n// Erreur d'estimation (1136)\nconst es = run({ typeErreur: \"estimation\" });\nassert.strictEqual(S(es, \"Nature de l'erreur\"), \"bad\");\nassert(T(es, \"Nature de l'erreur\").includes(\"article 1136\"));\nassert.strictEqual(S(es, \"Éléments de calcul\"), \"info\");\nassert.strictEqual(S(es, \"Caractère décelable\"), \"info\");\nassert.strictEqual(es.issue, \"Prix accepté maintenu\"); assert.strictEqual(es.retenu, 20310);\nassert(es.message.includes(\"demande de réexamen du prix\"));\n\n// Prix unitaire, quantité, oubli\nconst un = run({ typeErreur: \"unitaire\" });\nassert.strictEqual(S(un, \"Nature de l'erreur\"), \"warn\"); assert(T(un, \"Nature de l'erreur\").includes(\"1188\"));\nassert.strictEqual(un.issue, \"Rectification à négocier\"); assert.strictEqual(un.retenu, 27030);\nassert(un.verdict.startsWith(\"Aucun point bloquant, 2 à compléter. Rectification à négocier : 27 030 € au lieu de 20 310 €\"));\nassert(un.message.includes(\"erreur matérielle sur le prix\"));\nconst unP = run({ typeErreur: \"unitaire\", evidence: \"plausible\" });\nassert.strictEqual(S(unP, \"Caractère décelable\"), \"warn\");\nassert.strictEqual(S(run({ evidence: \"plausible\" }), \"Caractère décelable\"), \"ok\", \"total : discordance visible\");\nassert.strictEqual(S(run({ typeErreur: \"quantite\" }), \"Nature de l'erreur\"), \"warn\");\nassert(T(run({ typeErreur: \"oubli\" }), \"Nature de l'erreur\").includes(\"avenant\"));\n\n// Éléments de calcul\nassert.strictEqual(S(run({ elementsCalcul: \"absents\" }), \"Éléments de calcul\"), \"bad\");\nassert.strictEqual(run({ elementsCalcul: \"absents\" }).issue, \"Prix accepté maintenu\");\nassert.strictEqual(S(run({ elementsCalcul: \"partiels\" }), \"Éléments de calcul\"), \"warn\");\nassert.strictEqual(S(run({ elementsCalcul: \"absents\", typeErreur: \"unitaire\" }), \"Éléments de calcul\"), \"warn\");\n\n// Forfait\nconst fb = run({ forfait: \"batiment\", typeErreur: \"oubli\" });\nassert.strictEqual(S(fb, \"Type de prix\"), \"bad\"); assert(T(fb, \"Type de prix\").includes(\"1793\"));\nassert.strictEqual(fb.retenu, 20310);\nassert(fb.clause.includes(\"l'article 1793 du code civil s'applique\"));\nassert.strictEqual(S(run({ forfait: \"batiment\" }), \"Type de prix\"), \"warn\");\nassert.strictEqual(run({ forfait: \"batiment\" }).issue, \"Rectification envisageable\");\nassert.strictEqual(S(run({ forfait: \"batiment\", typeErreur: \"unitaire\" }), \"Type de prix\"), \"warn\");\nassert.strictEqual(S(run({ forfait: \"global\" }), \"Type de prix\"), \"warn\");\n// Trop-perçu sur forfait, côté client (17-11.226)\nconst tp = run({ role: \"client\", forfait: \"batiment\", typeErreur: \"quantite\", montantDevis: 76623, montantCorrect: 36488 });\nassert.strictEqual(tp.sens, \"haut\"); assert.strictEqual(tp.demandeur, \"client\");\nassert.strictEqual(S(tp, \"Type de prix\"), \"bad\"); assert(T(tp, \"Type de prix\").includes(\"17-11.226\"));\nassert.strictEqual(tp.retenu, 76623);\nassert.strictEqual(tp.ecart, -40135);\nassert(tp.message.includes(\"demande de réexamen du prix\"));\n\n// Tiers vérificateur\nconst ti = run({ tiers: \"oui\" });\nassert.strictEqual(S(ti, \"Tiers vérificateur\"), \"info\");\nassert(T(ti, \"Tiers vérificateur\").includes(\"11-25.978\"));\n\n// Client du même métier\nassert(T(run({ clientPro: \"memeMetier\" }), \"Qualité du client\").includes(\"17-11.226\"));\nassert(T(run({ clientPro: \"memeMetier\" }), \"Qualité du client\").includes(\"1104\"));\n\n// Stades avant acceptation\nconst br = run({ stade: \"brouillon\" });\nassert.strictEqual(br.pre, true); assert.strictEqual(br.nbBad, 0); assert.strictEqual(br.issue, \"Corriger avant l'envoi\"); assert.strictEqual(br.retenu, 27030);\nassert.strictEqual(S(br, \"Stade du devis\"), \"ok\");\nassert(br.message.startsWith(\"Objet : devis n° [référence] : contrôle avant envoi\"));\nassert.strictEqual(br.delaiLabel, \"Sans objet\");\nassert.strictEqual(br.dateLimite, null);\nassert.strictEqual(br.verdict, \"Aucun point bloquant. Corrigez avant l'envoi : 27 030 € au lieu de 20 310 €.\");\nconst brc = run({ stade: \"brouillon\", role: \"client\" });\nassert(brc.message.startsWith(\"Objet : demande de devis : détail attendu\"));\nconst en = run({ stade: \"envoye\" });\nassert(T(en, \"Stade du devis\").includes(\"1115\") && T(en, \"Stade du devis\").includes(\"1116\"));\nassert.strictEqual(en.issue, \"Retirer l'offre et envoyer un devis corrigé\");\nassert(en.message.startsWith(\"Objet : devis n° [référence] : devis retiré et remplacé\"));\nconst enc = run({ stade: \"envoye\", role: \"client\" });\nassert.strictEqual(enc.issue, \"Signaler l'erreur avant d'accepter\");\nassert(enc.message.startsWith(\"Objet : devis n° [référence] : erreur à vérifier avant acceptation\"));\nfor (const o of [{ confirmation: \"oui\" }, { typeErreur: \"estimation\" }, { elementsCalcul: \"absents\" }, { forfait: \"batiment\", typeErreur: \"oubli\" }]) {\n  for (const stade of [\"brouillon\", \"envoye\"]) {\n    const x = run({ ...o, stade });\n    assert.strictEqual(x.nbBad, 0, \"pas de bloquant avant acceptation\");\n    assert.strictEqual(x.retenu, 27030);\n  }\n}\n\n// Exécution commencée\nconst ex = run({ stade: \"execution\" });\nassert.strictEqual(S(ex, \"Stade du devis\"), \"warn\");\nassert.strictEqual(ex.issue, \"Rectification envisageable\");\n\n// Erreur en faveur du client, vue de l'émetteur et du client\nconst fc = run({ montantDevis: 27030, montantCorrect: 20310 });\nassert.strictEqual(fc.sens, \"haut\"); assert.strictEqual(fc.demandeur, \"client\");\nassert.strictEqual(fc.pctLabel, \"33,1 %\");\nassert(fc.message.includes(\"erreur en votre défaveur\"));\nassert(fc.message.includes(\"Nous rectifions le montant à votre avantage\"));\nconst fcc = run({ role: \"client\", montantDevis: 27030, montantCorrect: 20310 });\nassert(fcc.message.includes(\"est supérieur à la somme des lignes, qui donne 20 310 €\"));\nconst fcConf = run({ role: \"client\", montantDevis: 27030, montantCorrect: 20310, confirmation: \"oui\" });\nassert.strictEqual(S(fcConf, \"Confirmation du prix\"), \"warn\");\nconst benef = run({ role: \"client\" });\nassert(benef.message.includes(\"Nous préférons vous le signaler maintenant.\"));\n\n// Aucun écart, montants vides\nconst eq = run({ montantCorrect: 20310 });\nassert.strictEqual(eq.issue, \"Aucun écart\"); assert.strictEqual(S(eq, \"Montants et écart\"), \"warn\");\nassert.strictEqual(eq.ecartLabel, \"0 €\"); assert.strictEqual(eq.sens, \"aucun\");\nassert(eq.message.startsWith(\"Objet : devis n° [référence] : prix confirmé\"));\nassert(eq.verdict.endsWith(\"Aucun écart à rectifier : le prix de 20 310 € reste celui du devis.\"));\nconst z = run({ montantDevis: 0, montantCorrect: 0 });\nassert(T(z, \"Montants et écart\").startsWith(\"Indiquez le montant\"));\nassert.strictEqual(z.pctLabel, \"0 %\");\nconst zc = run({ montantDevis: 5000, montantCorrect: 0 });\nassert.strictEqual(zc.pctLabel, \"100 %\");\n\n// Dates\nconst late = run({ dateSignalement: \"2026-12-10\" });\nassert.strictEqual(S(late, \"Délai de réaction\"), \"warn\"); assert.strictEqual(late.delaiReaction, 15);\nassert(T(late, \"Délai de réaction\").includes(\"15 jours\"));\nconst edge = run({ dateSignalement: \"2026-12-03\" });\nassert.strictEqual(S(edge, \"Délai de réaction\"), \"ok\"); assert.strictEqual(edge.delaiReaction, 8);\nconst inv = run({ dateSignalement: \"2026-11-20\" });\nassert.strictEqual(S(inv, \"Délai de réaction\"), \"warn\"); assert(T(inv, \"Délai de réaction\").includes(\"avant la découverte\"));\nconst bad1 = run({ dateDecouverte: \"2026-02-30\" });\nassert.strictEqual(S(bad1, \"Délai de réaction\"), \"warn\"); assert.strictEqual(bad1.dateLimite, null);\nassert.strictEqual(bad1.delaiLabel, \"Non calculé\");\nconst avant = run({ dateDecouverte: \"2026-11-18\", dateSignalement: \"2026-11-19\" });\nassert.strictEqual(S(avant, \"Délai de réaction\"), \"warn\"); assert(T(avant, \"Délai de réaction\").includes(\"connue avant l'acceptation du 20 novembre 2026\"));\nconst noAcc = run({ dateAcceptation: \"\" });\nassert(T(noAcc, \"Stade du devis\").includes(\"à la date d'acceptation\"));\nassert(noAcc.message.startsWith(\"Objet : devis n° [référence] accepté à la date d'acceptation\"));\nconst leap = run({ dateDecouverte: \"2028-02-29\", dateSignalement: \"2028-03-01\" });\nassert.strictEqual(leap.dateLimite, \"2033-02-28\");\n\n// Entrées invalides\nconst junk = computeErreurPrix({ role: \"x\", stade: \"y\", typeErreur: \"z\", montantDevis: \"abc\", montantCorrect: null, dateAcceptation: 12 });\nassert.strictEqual(junk.role, \"emetteur\"); assert.strictEqual(junk.stade, \"accepte\"); assert.strictEqual(junk.typeErreur, \"total\");\nassert.strictEqual(junk.montantDevis, 0); assert.strictEqual(junk.montantCorrect, 0);\nassert(!/NaN|undefined|\\bnull\\b/.test(junk.recap + junk.verdict + junk.message));\nconst big = run({ montantDevis: \"99999999999\", montantCorrect: \"1 000 000 001\" });\nassert.strictEqual(big.montantDevis, 1000000000); assert.strictEqual(big.montantCorrect, 1000000000);\n\n")(tool, require, console);
console.log("seo-pm-20261110 ok");
