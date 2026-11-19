import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_SOUS_TRAITANCE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-sous-traitance-loi-1975";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "sous-traitance-loi-1975-paiement-direct-devis-b2b";
const BLOG_PATH = "/blog/sous-traitance-loi-1975-paiement-direct-devis-b2b";
const TOOL_PATH = "/outils/verificateur-sous-traitance-loi-1975";
const DAY = "2026-11-09";
const DAY_PATHS = ["/blog/sous-traitance-loi-1975-paiement-direct-devis-b2b", "/secteurs/funnel-devis-thermolaquage-traitement-surface", "/outils/verificateur-sous-traitance-loi-1975"];

assert.equal(BLOG_TOOL_SOUS_TRAITANCE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 37);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de sous-traitance (loi de 1975)");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Acceptation, agrément, caution, mise en demeure : douze points contrôlés, l'action directe ou le paiement direct, et les clauses à écrire.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-thermolaquage-traitement-surface")?.priority, 0.8);

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
assert.ok(outilsHub.includes("verificateur-sous-traitance-loi-1975"));
assert.ok(outilsHub.includes("Vérificateur de sous-traitance (loi de 1975)"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-sous-traitance-loi-1975\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-thermolaquage-traitement-surface"));
assert.ok(secteursHub.includes("Thermolaquage et traitement de surface"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 7936);
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

{
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-thermolaquage-traitement-surface.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-thermolaquage-traitement-surface/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 5472);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Thermolaquage et traitement de surface"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/verificateur-sous-traitance-loi-1975.ts","src/components/marketing/verificateur-sous-traitance-loi-1975-calculator.tsx","src/app/(marketing)/outils/verificateur-sous-traitance-loi-1975/page.tsx","src/content/blog/sous-traitance-loi-1975-paiement-direct-devis-b2b.md","src/content/blog/funnel-devis-thermolaquage-traitement-surface.md","src/app/(marketing)/secteurs/funnel-devis-thermolaquage-traitement-surface/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, POINTS, REGIME_LABELS, computeSousTraitance, buildRecap, fmtEur, fmtDate, addMonths, parseDate, num } = X;\nconst run = (o) => computeSousTraitance({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point.startsWith(point));\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\n\n// HTML statique\nconst numIds = [\"montantSousTraite\", \"dejaPaye\", \"resteDuMO\"];\nconst selIds = [\"role\", \"natureSousTraite\", \"contratPrincipal\", \"secteur\", \"rang\", \"moType\", \"contratEtranger\", \"acceptation\", \"agrement\", \"garantie\", \"moConnaissance\", \"moMiseEnDemeure\", \"clauseRenonciation\", \"miseEnDemeure\"];\nassert.strictEqual(Object.keys(DEFAULTS).length, 18);\nassert.strictEqual(numIds.length + selIds.length + 1, 18);\n\nconst labelMap = {\n  role: \"ROLE_LABELS\", natureSousTraite: \"NATURE_LABELS\", contratPrincipal: \"PRINCIPAL_LABELS\", secteur: \"SECTEUR_LABELS\",\n  rang: \"RANG_LABELS\", moType: \"MO_TYPE_LABELS\", contratEtranger: \"ETRANGER_LABELS\", acceptation: \"ACCEPTATION_LABELS\",\n  agrement: \"AGREMENT_LABELS\", garantie: \"GARANTIE_LABELS\", moConnaissance: \"CONNAISSANCE_LABELS\",\n  moMiseEnDemeure: \"MO_MED_LABELS\", clauseRenonciation: \"RENONCIATION_LABELS\", miseEnDemeure: \"MED_LABELS\"\n};\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\nassert.deepStrictEqual(Object.keys(REGIME_LABELS), [\"actionDirecte\", \"paiementDirect\", \"rang2Public\", \"hors\"]);\nassert.strictEqual(POINTS.length, 12);\n\n\n// Utilitaires\nassert.strictEqual(fmtDate({ y: 2027, m: 4, d: 1 }), \"1er avril 2027\");\nassert.strictEqual(fmtDate({ y: 2027, m: 2, d: 28 }), \"28 février 2027\");\nassert.deepStrictEqual(parseDate(\"2027-03-01\"), { y: 2027, m: 3, d: 1 });\nassert.strictEqual(parseDate(\"2027-02-29\"), null);\nassert.deepStrictEqual(parseDate(\"2028-02-29\"), { y: 2028, m: 2, d: 29 });\nassert.strictEqual(parseDate(\"01/03/2027\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.strictEqual(parseDate(\"2027-13-01\"), null);\nassert.deepStrictEqual(addMonths({ y: 2027, m: 3, d: 1 }, 1), { y: 2027, m: 4, d: 1 });\nassert.deepStrictEqual(addMonths({ y: 2027, m: 1, d: 31 }, 1), { y: 2027, m: 2, d: 28 });\nassert.deepStrictEqual(addMonths({ y: 2028, m: 1, d: 31 }, 1), { y: 2028, m: 2, d: 29 });\nassert.deepStrictEqual(addMonths({ y: 2027, m: 12, d: 15 }, 1), { y: 2028, m: 1, d: 15 });\nassert.deepStrictEqual(addMonths({ y: 2027, m: 3, d: 31 }, 1), { y: 2027, m: 4, d: 30 });\nassert.strictEqual(fmtEur(10220), \"10 220 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtEur(1234567), \"1 234 567 €\");\nassert.strictEqual(fmtEur(600), \"600 €\");\nassert.strictEqual(num(\"14 600\", 0, 1e9, 0), 14600);\nassert.strictEqual(num(\"14\\u00a0600\", 0, 1e9, 0), 14600);\nassert.strictEqual(num(\"abc\", 0, 1e9, 0), 0);\nassert.strictEqual(num(\"-5\", 0, 1e9, 0), 0);\nassert.strictEqual(num(\"12,9\", 0, 1e9, 0), 12);\n\n// Défauts (hypothèses d'exemple)\nconst r = computeSousTraitance({});\nassert.strictEqual(r.controles.length, 12);\nassert.deepStrictEqual(r.controles.map((c) => c.point), POINTS);\nassert.strictEqual(r.etat, \"warn\");\nassert.strictEqual(r.statutLabel, \"À compléter\");\nassert.strictEqual(r.nbOk, 10);\nassert.strictEqual(r.nbWarn, 2);\nassert.strictEqual(r.nbBad, 0);\nassert.strictEqual(r.nbInfo, 0);\nassert.strictEqual(r.regime, \"actionDirecte\");\nassert.strictEqual(r.regimeLabel, \"Action directe (articles 12 et 13)\");\nassert.strictEqual(r.creance, 10220);\nassert.strictEqual(r.assiette, 10220);\nassert.strictEqual(r.montantLabel, \"10 220 €\");\nassert.strictEqual(r.ouvertureLabel, \"À partir du 1er avril 2027\");\nassert.strictEqual(r.dateMiseEnDemeureFmt, \"1er mars 2027\");\nassert.strictEqual(r.verdict, \"Aucun point bloquant, mais 2 points à compléter. Action directe à partir du 1er avril 2027, jusqu'à 10 220 €.\");\nassert.strictEqual(S(r, \"Acceptation\"), \"warn\");\nassert.strictEqual(S(r, \"Agrément\"), \"warn\");\nfor (const p of [\"Qualification\", \"Contrat principal\", \"Rang\", \"Garantie\", \"Montant\", \"Mise en demeure\", \"Assiette\", \"Maître\", \"Clauses\", \"Loi\"]) assert.strictEqual(S(r, p), \"ok\", \"ok \" + p);\nassert(T(r, \"Acceptation\").includes(\"83-11.401\"));\nassert(T(r, \"Acceptation\").includes(\"80-12.125\"));\nassert(T(r, \"Qualification\").includes(\"95-17.997\"));\nassert(T(r, \"Garantie\").includes(\"19-22.219\"));\nassert(T(r, \"Mise en demeure\").includes(\"1er avril 2027\"));\nassert(T(r, \"Assiette\").includes(\"17-20.677\"));\nassert(T(r, \"Montant\").includes(\"14 600 €\") && T(r, \"Montant\").includes(\"4 380 €\"));\nassert.strictEqual(r.clause.split(\"\\n\").length, 7);\nassert.strictEqual(r.articles, 6);\nassert(r.clause.includes(\"Article 6. Pièces\"));\nassert(r.clause.includes(\"75-1334\"));\nassert(r.clause.includes(\"14 600 €\"));\nassert.strictEqual(r.actions.length, 3);\nassert.strictEqual(r.actions.length, r.nbBad + r.nbWarn + 1);\nassert(r.message.startsWith(\"Objet : action directe du sous-traitant\"));\nassert(r.message.includes(\"10 220 €\"));\nassert.strictEqual(r.recap.split(\"\\n\").length, 11);\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert.strictEqual(buildRecap(r), r.recap);\nassert(r.recap.includes(\"Contrôles : 10 conformes, 2 à compléter, 0 bloquants, 0 informations\"));\n\n// Tout corrigé\nconst ok = run({ acceptation: \"expresse\", agrement: \"oui\" });\nassert.strictEqual(ok.etat, \"ok\");\nassert.strictEqual(ok.nbOk, 12);\nassert.strictEqual(ok.verdict, \"Dossier cohérent avec la loi de 1975. Action directe à partir du 1er avril 2027, jusqu'à 10 220 €.\");\nassert.strictEqual(ok.actions.length, 1);\n\n// Qualification et contrat principal\nconst serie = run({ natureSousTraite: \"fournitureSerie\" });\nassert.strictEqual(serie.regime, \"hors\");\nassert.strictEqual(serie.regimeLabel, \"Hors loi de 1975\");\nassert.strictEqual(S(serie, \"Qualification\"), \"bad\");\nassert.strictEqual(serie.montantLabel, \"Sans objet\");\nassert.strictEqual(serie.ouvertureLabel, \"Sans objet\");\nassert(serie.clause.startsWith(\"La loi de 1975 ne s'appliquant pas\"));\nassert(serie.clause.includes(\"Réserve de propriété\"));\nassert.strictEqual(serie.clause.split(\"\\n\").length, 7);\nassert.strictEqual(S(run({ natureSousTraite: \"fournitureSerie\", role: \"maitreOuvrage\" }), \"Qualification\"), \"info\");\nassert.strictEqual(S(run({ natureSousTraite: \"incertain\" }), \"Qualification\"), \"warn\");\nconst vente = run({ contratPrincipal: \"ventePrincipale\" });\nassert.strictEqual(vente.regime, \"hors\");\nassert.strictEqual(S(vente, \"Contrat principal\"), \"bad\");\nassert(T(vente, \"Contrat principal\").includes(\"17-30.970\"));\nassert.strictEqual(S(run({ contratPrincipal: \"ventePrincipale\", role: \"entreprisePrincipale\" }), \"Contrat principal\"), \"info\");\nfor (const p of [\"Acceptation\", \"Agrément\", \"Garantie\", \"Maître\"]) assert.strictEqual(S(vente, p), \"info\", \"hors \" + p);\n\n// Marché public\nconst pub = run({ contratPrincipal: \"marchePublic\", moType: \"acheteurPublic\" });\nassert.strictEqual(pub.regime, \"paiementDirect\");\nassert.strictEqual(pub.regimeLabel, \"Paiement direct (marché public)\");\nassert.strictEqual(S(pub, \"Contrat principal\"), \"info\");\nassert(T(pub, \"Contrat principal\").includes(\"DC4\"));\nassert.strictEqual(S(pub, \"Garantie\"), \"info\");\nassert.strictEqual(S(pub, \"Mise en demeure\"), \"info\");\nassert.strictEqual(S(pub, \"Assiette\"), \"info\");\nassert.strictEqual(pub.assiette, 10220);\nassert.strictEqual(pub.ouvertureLabel, \"Paiement par l'acheteur\");\nassert(pub.clause.includes(\"Article 3. Paiement direct\"));\nassert(pub.clause.includes(\"DC4\"));\nassert(pub.verdict.includes(\"Paiement direct par l'acheteur pour 10 220 €\"));\nconst seuil = run({ contratPrincipal: \"marchePublic\", montantSousTraite: 500, dejaPaye: 0 });\nassert.strictEqual(seuil.regime, \"actionDirecte\");\nassert.strictEqual(seuil.sousSeuil, true);\nassert(seuil.regimeLabel.endsWith(\"sous le seuil de 600 €\"));\nassert.strictEqual(S(seuil, \"Montant\"), \"info\");\nassert(T(seuil, \"Montant\").includes(\"R2193-10\"));\nassert.strictEqual(seuil.assiette, 500);\nconst seuil600 = run({ contratPrincipal: \"marchePublic\", montantSousTraite: 600, dejaPaye: 0 });\nassert.strictEqual(seuil600.regime, \"paiementDirect\");\nconst r2 = run({ contratPrincipal: \"marchePublic\", rang: \"second\" });\nassert.strictEqual(r2.regime, \"rang2Public\");\nassert.strictEqual(S(r2, \"Rang\"), \"warn\");\nassert.strictEqual(r2.montantLabel, \"Sans objet\");\nassert(r2.verdict.includes(\"caution ou la délégation\"));\nconst r2priv = run({ rang: \"second\" });\nassert.strictEqual(S(r2priv, \"Rang\"), \"info\");\nassert(T(r2priv, \"Rang\").includes(\"Article 2\"));\nconst r2gar = run({ contratPrincipal: \"marchePublic\", rang: \"second\", garantie: \"aucune\" });\nassert.strictEqual(S(r2gar, \"Garantie\"), \"bad\");\nassert.strictEqual(S(r2gar, \"Maître\"), \"warn\");\n\n// Acceptation\nconst inf = run({ acceptation: \"informe\" });\nassert.strictEqual(S(inf, \"Acceptation\"), \"bad\");\nassert(T(inf, \"Acceptation\").includes(\"Savoir n'est pas accepter\"));\nassert(T(inf, \"Acceptation\").includes(\"20-19.372\"));\nassert.strictEqual(S(inf, \"Maître\"), \"warn\");\nassert(T(inf, \"Maître\").includes(\"12-21.077\"));\nconst epNo = run({ role: \"entreprisePrincipale\", acceptation: \"aucune\" });\nassert.strictEqual(S(epNo, \"Acceptation\"), \"bad\");\nassert(T(epNo, \"Acceptation\").includes(\"7 500 €\"));\nassert(T(epNo, \"Acceptation\").includes(\"L8271-1-1\"));\nassert(epNo.message.startsWith(\"Objet : présentation d'un sous-traitant\"));\nconst moNo = run({ role: \"maitreOuvrage\", acceptation: \"aucune\" });\nassert.strictEqual(S(moNo, \"Acceptation\"), \"bad\");\nassert.strictEqual(S(moNo, \"Maître\"), \"bad\");\nassert(moNo.message.includes(\"article 14-1\"));\nconst moOk = run({ role: \"maitreOuvrage\", acceptation: \"aucune\", moMiseEnDemeure: \"oui\" });\nassert.strictEqual(S(moOk, \"Maître\"), \"ok\");\nconst moIgn = run({ role: \"maitreOuvrage\", acceptation: \"aucune\", moConnaissance: \"non\" });\nassert.strictEqual(S(moIgn, \"Maître\"), \"info\");\nassert(T(moIgn, \"Maître\").includes(\"19-20.424\"));\nassert.strictEqual(S(run({ moConnaissance: \"non\" }), \"Maître\"), \"warn\");\nassert.strictEqual(S(run({ acceptation: \"aucune\", moType: \"particulierLogement\" }), \"Maître\"), \"info\");\nassert.strictEqual(S(run({ acceptation: \"aucune\", secteur: \"services\" }), \"Maître\"), \"info\");\nassert(T(run({ secteur: \"industriel\" }), \"Maître\").includes(\"hors chantier\"));\n\n// Agrément\nassert.strictEqual(S(run({ agrement: \"non\" }), \"Agrément\"), \"bad\");\nassert.strictEqual(S(run({ agrement: \"oui\" }), \"Agrément\"), \"ok\");\nassert.strictEqual(S(run({ agrement: \"non\" }), \"Maître\"), \"warn\");\n\n// Garantie\nconst tard = run({ garantie: \"cautionTardive\" });\nassert.strictEqual(S(tard, \"Garantie\"), \"bad\");\nassert(T(tard, \"Garantie\").includes(\"22-21.463\"));\nassert(T(tard, \"Garantie\").includes(\"20-19.372\"));\nconst dEP = run({ garantie: \"delegationEP\" });\nassert.strictEqual(S(dEP, \"Garantie\"), \"bad\");\nassert(T(dEP, \"Garantie\").includes(\"22-17.027\"));\nconst none = run({ garantie: \"aucune\" });\nassert.strictEqual(S(none, \"Garantie\"), \"bad\");\nassert(T(none, \"Garantie\").includes(\"22-13.330\"));\nassert.strictEqual(none.etat, \"bad\");\nassert(none.verdict.startsWith(\"1 point bloquant et 3 points à compléter : en l'état, le paiement du sous-traitant n'est pas sécurisé.\"));\nassert.strictEqual(S(none, \"Maître\"), \"warn\");\nassert.strictEqual(S(run({ garantie: \"delegation\" }), \"Garantie\"), \"ok\");\nassert(T(run({ garantie: \"delegation\" }), \"Garantie\").includes(\"1336\"));\nassert.strictEqual(S(run({ garantie: \"aucune\", role: \"maitreOuvrage\" }), \"Garantie\"), \"warn\");\nassert.strictEqual(S(run({ garantie: \"aucune\", role: \"maitreOuvrage\" }), \"Maître\"), \"bad\");\nassert.strictEqual(S(run({ garantie: \"aucune\", role: \"maitreOuvrage\", moMiseEnDemeure: \"oui\" }), \"Maître\"), \"ok\");\n\n// Mise en demeure\nconst sc = run({ miseEnDemeure: \"sansCopie\" });\nassert.strictEqual(S(sc, \"Mise en demeure\"), \"warn\");\nassert(sc.message.startsWith(\"Objet : mise en demeure de payer\"));\nconst nm = run({ miseEnDemeure: \"non\" });\nassert.strictEqual(S(nm, \"Mise en demeure\"), \"bad\");\nassert.strictEqual(nm.ouvertureLabel, \"Pas encore ouverte\");\nassert(nm.verdict.includes(\"pas encore ouverte\"));\nassert.strictEqual(S(run({ miseEnDemeure: \"non\", role: \"entreprisePrincipale\" }), \"Mise en demeure\"), \"warn\");\nconst dc = run({ miseEnDemeure: \"declarationCreance\" });\nassert.strictEqual(S(dc, \"Mise en demeure\"), \"ok\");\nassert(T(dc, \"Mise en demeure\").includes(\"21-23.747\"));\nassert.strictEqual(dc.ouvertureLabel, \"Dès la déclaration de créance\");\nassert(dc.message.includes(\"déclaration de ma créance\"));\nassert.strictEqual(run({ dateMiseEnDemeure: \"2027-01-31\" }).ouvertureLabel, \"À partir du 28 février 2027\");\nassert.strictEqual(run({ dateMiseEnDemeure: \"2028-01-31\" }).ouvertureLabel, \"À partir du 29 février 2028\");\nassert.strictEqual(run({ dateMiseEnDemeure: \"2027-12-10\" }).ouvertureLabel, \"À partir du 10 janvier 2028\");\nassert.strictEqual(run({ dateMiseEnDemeure: \"n'importe quoi\" }).dateMiseEnDemeureFmt, \"1er mars 2027\");\n\n// Assiette\nconst lim = run({ resteDuMO: 6000 });\nassert.strictEqual(lim.assiette, 6000);\nassert.strictEqual(S(lim, \"Assiette\"), \"warn\");\nassert(T(lim, \"Assiette\").includes(\"4 220 €\"));\nconst zero = run({ resteDuMO: 0 });\nassert.strictEqual(zero.assiette, 0);\nassert.strictEqual(S(zero, \"Assiette\"), \"bad\");\nassert.strictEqual(S(run({ resteDuMO: 0, role: \"maitreOuvrage\" }), \"Assiette\"), \"warn\");\nconst paid = run({ dejaPaye: 14600 });\nassert.strictEqual(paid.creance, 0);\nassert.strictEqual(S(paid, \"Montant\"), \"info\");\nassert.strictEqual(S(paid, \"Mise en demeure\"), \"info\");\nassert.strictEqual(S(paid, \"Assiette\"), \"info\");\nconst over = run({ dejaPaye: 20000 });\nassert.strictEqual(over.creance, 0);\nassert.strictEqual(S(run({ montantSousTraite: 0, dejaPaye: 0 }), \"Montant\"), \"warn\");\n\n// Clauses contraires et loi\nconst ren = run({ clauseRenonciation: \"oui\" });\nassert.strictEqual(S(ren, \"Clauses\"), \"warn\");\nassert(T(ren, \"Clauses\").includes(\"16-18.146\"));\nconst etr = run({ contratEtranger: \"oui\" });\nassert.strictEqual(S(etr, \"Loi\"), \"info\");\nassert(T(etr, \"Loi\").includes(\"06-14.006\"));\n\n// Messages par rôle\nassert(run({ role: \"sousTraitant\", natureSousTraite: \"fournitureSerie\" }).message.startsWith(\"Objet : présentation au maître de l'ouvrage\"));\nassert(run({ role: \"sousTraitant\", contratPrincipal: \"marchePublic\" }).message.includes(\"déclaration de sous-traitance\"));\nassert(run({ role: \"entreprisePrincipale\", contratPrincipal: \"marchePublic\" }).message.includes(\"déclaration de sous-traitance jointe\"));\nassert(run({ role: \"maitreOuvrage\" }).message.startsWith(\"Objet : sous-traitant présent sur le chantier\"));\n\n// Valeurs invalides\nconst rinv = computeSousTraitance({ role: \"zz\", natureSousTraite: \"zz\", contratPrincipal: \"zz\", secteur: \"zz\", rang: \"zz\", moType: \"zz\", acceptation: \"zz\", agrement: \"zz\", garantie: \"zz\", miseEnDemeure: \"zz\", montantSousTraite: \"abc\", dejaPaye: \"-3\", resteDuMO: \"\" });\nassert.strictEqual(rinv.role, \"sousTraitant\");\nassert.strictEqual(rinv.natureSousTraite, \"travailSpecifique\");\nassert.strictEqual(rinv.contratPrincipal, \"entreprisePrive\");\nassert.strictEqual(rinv.secteur, \"btp\");\nassert.strictEqual(rinv.rang, \"premier\");\nassert.strictEqual(rinv.moType, \"entreprise\");\nassert.strictEqual(rinv.acceptation, \"tacite\");\nassert.strictEqual(rinv.agrement, \"tacite\");\nassert.strictEqual(rinv.garantie, \"caution\");\nassert.strictEqual(rinv.miseEnDemeure, \"avecCopie\");\nassert.strictEqual(rinv.montantSousTraite, 0);\nassert.strictEqual(rinv.dejaPaye, 0);\nassert.strictEqual(rinv.resteDuMO, 0);\nassert.strictEqual(run({ montantSousTraite: \"14 600,75\" }).montantSousTraite, 14600);\n\n")(tool, require, console);
console.log("seo-am-20261109 ok");
