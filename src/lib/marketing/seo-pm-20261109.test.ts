import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_COMPENSATION, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-compensation-creances";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "compensation-creances-deduction-facture-devis-b2b";
const BLOG_PATH = "/blog/compensation-creances-deduction-facture-devis-b2b";
const TOOL_PATH = "/outils/verificateur-compensation-creances";
const DAY = "2026-11-09";
const DAY_PATHS = ["/blog/compensation-creances-deduction-facture-devis-b2b", "/outils/verificateur-compensation-creances"];

assert.equal(BLOG_TOOL_COMPENSATION, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 43);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de compensation de créances");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "facture payée moins une somme : douze points contrôlés (articles 1347 à 1348-2, L441-17), le montant compensé, le reste exigible et la clause à écrire.");

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
assert.ok(outilsHub.includes("verificateur-compensation-creances"));
assert.ok(outilsHub.includes("Vérificateur de compensation de créances"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-compensation-creances\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 9392);
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

for (const rel of ["src/lib/marketing/verificateur-compensation-creances.ts","src/components/marketing/verificateur-compensation-creances-calculator.tsx","src/app/(marketing)/outils/verificateur-compensation-creances/page.tsx","src/content/blog/compensation-creances-deduction-facture-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, POINTS, computeCompensation, buildRecap, fmtEur, fmtDate, parseDate, num } = X;\nconst run = (o) => computeCompensation({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point === point);\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\n\n// Statique\nconst numIds = [\"montantFacture\", \"montantOppose\"];\nconst dateIds = [\"dateFacture\", \"dateOpposee\"];\nconst selIds = [\"role\", \"voie\", \"natureCreance\", \"reciprocite\", \"fongibilite\", \"certitude\", \"liquidite\", \"exigibilite\", \"connexite\", \"clauseCompensation\", \"distributeur\", \"procedure\", \"cession\"];\nassert.strictEqual(Object.keys(DEFAULTS).length, 17);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 17);\n\n\nconst labelMap = {\n  role: \"ROLE_LABELS\", voie: \"VOIE_LABELS\", natureCreance: \"NATURE_LABELS\", reciprocite: \"RECIPROCITE_LABELS\",\n  fongibilite: \"FONGIBILITE_LABELS\", certitude: \"CERTITUDE_LABELS\", liquidite: \"LIQUIDITE_LABELS\",\n  exigibilite: \"EXIGIBILITE_LABELS\", connexite: \"CONNEXITE_LABELS\", clauseCompensation: \"CLAUSE_LABELS\",\n  distributeur: \"DISTRIBUTEUR_LABELS\", procedure: \"PROCEDURE_LABELS\", cession: \"CESSION_LABELS\"\n};\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\nassert.deepStrictEqual(POINTS, [\"Réciprocité\", \"Fongibilité\", \"Certitude\", \"Liquidité\", \"Exigibilité\", \"Clause de compensation\", \"Connexité\", \"Nature de la somme opposée\", \"Procédure collective\", \"Cession ou affacturage\", \"Montants\", \"Voie et date d'effet\"]);\n\n// Helpers\nassert.strictEqual(fmtEur(32200), \"32 200 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtEur(1234567), \"1 234 567 €\");\nassert.strictEqual(fmtEur(-920), \"\\u2212920 €\");\nassert.strictEqual(fmtDate({ y: 2027, m: 2, d: 26 }), \"26 février 2027\");\nassert.strictEqual(fmtDate({ y: 2027, m: 3, d: 1 }), \"1er mars 2027\");\nassert.deepStrictEqual(parseDate(\"2027-02-10\"), { y: 2027, m: 2, d: 10 });\nassert.strictEqual(parseDate(\"2027-02-29\"), null);\nassert.strictEqual(parseDate(\"26/02/2027\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.strictEqual(num(\"32 200\", 0, 999999999, 0), 32200);\nassert.strictEqual(num(\"32\\u00a0200\", 0, 999999999, 0), 32200);\nassert.strictEqual(num(\"2070,9\", 0, 999999999, 0), 2070);\nassert.strictEqual(num(\"abc\", 0, 999999999, 0), 0);\nassert.strictEqual(num(\"-5\", 0, 999999999, 0), 0);\n\n// Défauts (hypothèses d'exemple)\nconst r = computeCompensation({});\nassert.strictEqual(r.controles.length, 12);\nassert.deepStrictEqual(r.controles.map((c) => c.point), POINTS);\nassert.deepStrictEqual(r.controles.map((c) => c.statut), [\"ok\", \"ok\", \"bad\", \"ok\", \"ok\", \"info\", \"ok\", \"bad\", \"ok\", \"ok\", \"ok\", \"info\"]);\nassert.strictEqual(r.nbOk, 8); assert.strictEqual(r.nbWarn, 0); assert.strictEqual(r.nbBad, 2); assert.strictEqual(r.nbInfo, 2);\nassert.strictEqual(r.etat, \"bad\");\nassert.strictEqual(r.regimeLabel, \"Compensation légale\");\nassert.strictEqual(r.compensationLabel, \"Non acquise en l'état\");\nassert.strictEqual(r.compense, 0);\nassert.strictEqual(r.reste, 32200);\nassert.strictEqual(r.effetLabel, \"Aucune en l'état\");\nassert.strictEqual(r.verdict, \"2 points bloquants : la déduction de 2 070 € n'est pas acquise en l'état. Reste exigible : 32 200 €.\");\nassert(T(r, \"Certitude\").includes(\"13-23.791\"));\nassert(T(r, \"Nature de la somme opposée\").includes(\"ni certaines, ni liquides, ni exigibles\"));\nassert.strictEqual(r.articles, 6);\nassert.strictEqual(r.clause.split(\"\\n\").length, 7);\nassert(r.clause.startsWith(\"Clause « Paiement, réclamations et compensation »\"));\nassert(r.clause.includes(\"Article 6. Cession et procédure collective.\"));\nassert(r.clause.includes(\"[15] jours\"));\nassert(!r.clause.includes(\"L441-17\"));\nassert.strictEqual(r.actions.length, r.nbBad + r.nbWarn + 1);\nassert(r.actions[r.actions.length - 1].includes(\"hors de QuoteBuilder\"));\nassert(r.message.startsWith(\"Objet : facture n° [référence], échue le 26 février 2027 : déduction de 2 070 €\"));\nassert(r.message.includes(\"(certitude, nature de la somme opposée)\"));\nassert(r.message.includes(\"régler le solde de 32 200 €\"));\nassert.strictEqual(r.recap.split(\"\\n\").length, 11);\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert(r.recap.includes(\"Montants : facture 32 200 € · opposé 2 070 € · compensé 0 € · reste 32 200 €\"));\nassert(r.recap.includes(\"Contrôles : 8 conformes, 0 à compléter, 2 bloquants, 2 informations\"));\nassert.strictEqual(buildRecap(r), r.recap);\nassert.strictEqual(r.dateFactureFmt, \"26 février 2027\");\nassert.strictEqual(r.dateOpposeeFmt, \"10 février 2027\");\n\n// Variante B : 4 jours reconnus (920 €)\nconst b = run({ certitude: \"reconnue\", montantOppose: 920 });\nassert.strictEqual(b.etat, \"ok\");\nassert.strictEqual(b.nbOk, 10); assert.strictEqual(b.nbInfo, 2);\nassert.strictEqual(b.compense, 920);\nassert.strictEqual(b.reste, 31280);\nassert.strictEqual(b.effetLabel, \"Au plus tôt le 26 février 2027\");\nassert.strictEqual(b.compensationLabel, \"Possible\");\nassert.strictEqual(b.verdict, \"Aucun point bloquant. Compensation légale à hauteur de 920 € ; reste exigible 31 280 €.\");\nassert(T(b, \"Nature de la somme opposée\").includes(\"1231-5\"));\nassert(b.message.includes(\"Nous prenons acte de la compensation de 920 €\"));\nassert(b.message.includes(\"31 280 €\"));\nconst b2 = run({ certitude: \"reconnue\" });\nassert.strictEqual(b2.compense, 2070); assert.strictEqual(b2.reste, 30130);\n\n// Variante distributeur : L441-17\nconst dist = run({ distributeur: \"oui\", certitude: \"reconnue\" });\nassert.strictEqual(S(dist, \"Nature de la somme opposée\"), \"bad\");\nassert(T(dist, \"Nature de la somme opposée\").includes(\"L441-17\"));\nassert(dist.clause.includes(\"jamais déduits d'office de la facture du fournisseur (article L441-17\"));\nassert.strictEqual(S(run({ distributeur: \"oui\", natureCreance: \"remise\", certitude: \"reconnue\" }), \"Nature de la somme opposée\"), \"bad\");\nassert.strictEqual(S(run({ distributeur: \"oui\", natureCreance: \"avoir\", certitude: \"reconnue\" }), \"Nature de la somme opposée\"), \"ok\");\n\n// Réciprocité, fongibilité\nassert.strictEqual(S(run({ reciprocite: \"groupe\" }), \"Réciprocité\"), \"bad\");\nassert(T(run({ reciprocite: \"groupe\" }), \"Réciprocité\").includes(\"93-11.724\"));\nassert.strictEqual(S(run({ reciprocite: \"tiers\" }), \"Réciprocité\"), \"bad\");\nassert.strictEqual(S(run({ fongibilite: \"nature\" }), \"Fongibilité\"), \"bad\");\nassert.strictEqual(S(run({ fongibilite: \"nature\", voie: \"conventionnelle\" }), \"Fongibilité\"), \"warn\");\n\n// Certitude / liquidité / exigibilité selon la voie\nassert.strictEqual(S(run({ certitude: \"eventuelle\" }), \"Certitude\"), \"bad\");\nassert.strictEqual(S(run({ certitude: \"eventuelle\", voie: \"judiciaire\" }), \"Certitude\"), \"bad\");\nassert.strictEqual(S(run({ certitude: \"eventuelle\", voie: \"conventionnelle\", clauseCompensation: \"acceptee\" }), \"Certitude\"), \"warn\");\nassert.strictEqual(S(run({ certitude: \"contestee\", voie: \"judiciaire\" }), \"Certitude\"), \"warn\");\nassert.strictEqual(S(run({ liquidite: \"aChiffrer\" }), \"Liquidité\"), \"bad\");\nassert.strictEqual(S(run({ liquidite: \"aChiffrer\", voie: \"judiciaire\" }), \"Liquidité\"), \"ok\");\nassert.strictEqual(S(run({ liquidite: \"aChiffrer\", voie: \"conventionnelle\" }), \"Liquidité\"), \"warn\");\nassert.strictEqual(S(run({ exigibilite: \"aTerme\" }), \"Exigibilité\"), \"bad\");\nassert.strictEqual(S(run({ exigibilite: \"aTerme\", voie: \"judiciaire\" }), \"Exigibilité\"), \"ok\");\nassert(T(run({}), \"Exigibilité\").includes(\"1347-3\"));\n\n// Clause\nassert.strictEqual(S(run({ voie: \"conventionnelle\" }), \"Clause de compensation\"), \"bad\");\nassert.strictEqual(S(run({ voie: \"conventionnelle\", clauseCompensation: \"acceptee\" }), \"Clause de compensation\"), \"ok\");\nassert.strictEqual(S(run({ clauseCompensation: \"transmise\" }), \"Clause de compensation\"), \"warn\");\nassert.strictEqual(S(run({ clauseCompensation: \"interdiction\" }), \"Clause de compensation\"), \"ok\");\nassert.strictEqual(S(run({ clauseCompensation: \"interdiction\", role: \"client\" }), \"Clause de compensation\"), \"bad\");\nassert.strictEqual(S(run({ clauseCompensation: \"interdiction\", role: \"client\", voie: \"judiciaire\" }), \"Clause de compensation\"), \"warn\");\nconst conv = run({ voie: \"conventionnelle\", clauseCompensation: \"acceptee\", certitude: \"reconnue\" });\nassert.strictEqual(conv.etat, \"ok\");\nassert.strictEqual(conv.effetLabel, \"À la date de l'accord\");\nassert.strictEqual(conv.regimeLabel, \"Compensation convenue\");\n\n// Connexité\nassert.strictEqual(S(run({ connexite: \"cadre\" }), \"Connexité\"), \"ok\");\nassert(T(run({ connexite: \"cadre\" }), \"Connexité\").includes(\"23-23.937\"));\nassert.strictEqual(S(run({ connexite: \"distincts\" }), \"Connexité\"), \"info\");\nassert.strictEqual(S(run({ connexite: \"distincts\", voie: \"judiciaire\" }), \"Connexité\"), \"warn\");\n\n// Judiciaire\nconst j = run({ voie: \"judiciaire\", certitude: \"reconnue\" });\nassert.strictEqual(j.etat, \"ok\");\nassert.strictEqual(j.compense, 0);\nassert.strictEqual(j.potentiel, 2070);\nassert.strictEqual(j.reste, 32200);\nassert.strictEqual(j.compensationLabel, \"À faire juger\");\nassert.strictEqual(j.effetLabel, \"Si le juge l'admet : réputée au 10 février 2027\");\nassert(j.verdict.includes(\"Demande au juge possible pour 2 070 €\"));\nassert.strictEqual(run({ voie: \"judiciaire\", certitude: \"reconnue\", connexite: \"distincts\" }).effetLabel, \"Si le juge l'admet : date de la décision\");\nassert(j.message.includes(\"Tant qu'aucun accord ni décision ne fixe cette somme\"));\n\n// Dommages, remise, avoir, facture\nassert.strictEqual(S(run({ natureCreance: \"dommages\" }), \"Nature de la somme opposée\"), \"bad\");\nassert.strictEqual(S(run({ natureCreance: \"dommages\", certitude: \"reconnue\" }), \"Nature de la somme opposée\"), \"ok\");\nassert.strictEqual(S(run({ natureCreance: \"dommages\", certitude: \"reconnue\", liquidite: \"aChiffrer\", voie: \"judiciaire\" }), \"Nature de la somme opposée\"), \"warn\");\nassert.strictEqual(S(run({ natureCreance: \"remise\" }), \"Nature de la somme opposée\"), \"warn\");\nassert(T(run({ natureCreance: \"facture\" }), \"Nature de la somme opposée\").includes(\"22/04233\"));\nassert.strictEqual(S(run({ natureCreance: \"avoir\", certitude: \"reconnue\" }), \"Nature de la somme opposée\"), \"ok\");\n\n// Procédure collective, cession\nassert.strictEqual(S(run({ procedure: \"oui\" }), \"Procédure collective\"), \"warn\");\nassert.strictEqual(S(run({ procedure: \"oui\", connexite: \"cadre\" }), \"Procédure collective\"), \"warn\");\nassert.strictEqual(S(run({ procedure: \"oui\", connexite: \"distincts\" }), \"Procédure collective\"), \"bad\");\nassert(T(run({ procedure: \"oui\" }), \"Procédure collective\").includes(\"L622-7\"));\nassert.strictEqual(S(run({ cession: \"avant\" }), \"Cession ou affacturage\"), \"warn\");\nassert(T(run({ cession: \"avant\" }), \"Cession ou affacturage\").includes(\"1347-5\"));\nassert.strictEqual(S(run({ cession: \"apres\" }), \"Cession ou affacturage\"), \"warn\");\nassert(T(run({ cession: \"apres\" }), \"Cession ou affacturage\").includes(\"24-17.326\"));\nassert.strictEqual(S(run({ cession: \"apres\", connexite: \"distincts\" }), \"Cession ou affacturage\"), \"bad\");\nconst pc = run({ certitude: \"reconnue\", procedure: \"oui\", montantOppose: 920 });\nassert.strictEqual(pc.etat, \"warn\");\nassert.strictEqual(pc.compense, 920);\nassert.strictEqual(pc.compensationLabel, \"Possible, à sécuriser\");\n\n// Montants\nassert.strictEqual(S(run({ montantOppose: 0 }), \"Montants\"), \"warn\");\nassert.strictEqual(run({ montantOppose: 0, certitude: \"reconnue\" }).compense, 0);\nconst over = run({ certitude: \"reconnue\", montantOppose: 40000 });\nassert.strictEqual(over.compense, 32200); assert.strictEqual(over.reste, 0); assert.strictEqual(over.soldeAutre, 7800);\nassert(T(over, \"Montants\").includes(\"solde dû par le fournisseur : 7 800 €\"));\nassert(over.message.includes(\"La facture est ainsi soldée.\"));\nassert.strictEqual(run({ montantFacture: \"32 200\" }).montantFacture, 32200);\nassert.strictEqual(run({ montantFacture: \"abc\" }).montantFacture, 0);\nconst dinv = run({ dateFacture: \"2027-02-30\", dateOpposee: \"n'importe quoi\" });\nassert.strictEqual(dinv.dateFacture, \"2027-02-26\"); assert.strictEqual(dinv.dateOpposee, \"2027-02-10\");\nassert.strictEqual(run({ certitude: \"reconnue\", dateFacture: \"2027-01-15\", dateOpposee: \"2027-03-05\" }).effetLabel, \"Au plus tôt le 5 mars 2027\");\n\n// Rôle client\nconst cl = run({ role: \"client\" });\nassert(cl.message.startsWith(\"Objet : proposition de compensation sur la facture n° [référence]\"));\nassert(cl.message.includes(\"nous réglerons le solde de 30 130 €\"));\nassert(cl.recap.includes(\"Position : client qui veut déduire une somme\"));\n\n// Entrées invalides\nconst inv = computeCompensation({ role: \"zz\", voie: \"zz\", natureCreance: \"zz\", certitude: \"zz\", connexite: \"zz\", clauseCompensation: \"zz\", cession: \"zz\" });\nassert.strictEqual(inv.role, \"fournisseur\"); assert.strictEqual(inv.voie, \"legale\"); assert.strictEqual(inv.natureCreance, \"penalites\");\nassert.strictEqual(inv.certitude, \"contestee\"); assert.strictEqual(inv.connexite, \"memeContrat\"); assert.strictEqual(inv.clauseCompensation, \"aucune\"); assert.strictEqual(inv.cession, \"non\");\n\n")(tool, require, console);
console.log("seo-pm-20261109 ok");
