import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_TVA_CLIENT_ETRANGER, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-tva-client-etranger-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "tva-client-etranger-ue-export-devis-b2b";
const BLOG_PATH = "/blog/tva-client-etranger-ue-export-devis-b2b";
const TOOL_PATH = "/outils/verificateur-tva-client-etranger-devis";
const DAY = "2026-11-16";
const DAY_PATHS = ["/blog/tva-client-etranger-ue-export-devis-b2b", "/outils/verificateur-tva-client-etranger-devis"];

assert.equal(BLOG_TOOL_TVA_CLIENT_ETRANGER, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 39);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur TVA client étranger");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "client dans l'UE ou hors UE : régime de TVA, numéro à vérifier, preuves de transport, mentions de facture, la clause et le message.");

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
assert.ok(outilsHub.includes("verificateur-tva-client-etranger-devis"));
assert.ok(outilsHub.includes("Vérificateur TVA client étranger"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-tva-client-etranger-devis\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 7848);
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

for (const rel of ["src/lib/marketing/verificateur-tva-client-etranger-devis.ts","src/components/marketing/verificateur-tva-client-etranger-devis-calculator.tsx","src/app/(marketing)/outils/verificateur-tva-client-etranger-devis/page.tsx","src/content/blog/tva-client-etranger-ue-export-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, POINTS, LABEL_SETS, STATUT_LABELS, REGIME_LABELS, MENTION_LABELS, computeTva, computeRegime, normalize, fmtEur, fmtTaux, fmtDate, parseDate, isoDate, dec } = X;\nconst run = (o) => computeTva({ ...DEFAULTS, ...o });\nconst S = (r, i) => r.controles[i].statut;\nconst T = (r, i) => r.controles[i].texte;\n\n// Statique\nassert.strictEqual(X.SLUG, SLUG);\nassert.strictEqual(Object.keys(DEFAULTS).length, 12);\nassert.strictEqual(POINTS.length, 10);\nassert.strictEqual(Object.keys(REGIME_LABELS).length, 8);\nassert.deepStrictEqual(Object.keys(MENTION_LABELS).sort(), Object.keys(REGIME_LABELS).sort());\nconst numIds = [\"montant\", \"taux\"];\nconst dateIds = [\"dateFacture\"];\nconst selIds = Object.keys(LABEL_SETS);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 12);\n\n\n\n\n\n\n\n// Utilitaires\nassert.strictEqual(fmtEur(288000), \"2 880 €\");\nassert.strictEqual(fmtEur(1440000), \"14 400 €\");\nassert.strictEqual(fmtEur(4550), \"45,50 €\");\nassert.strictEqual(fmtEur(4505), \"45,05 €\");\nassert.strictEqual(fmtEur(123456789), \"1 234 567,89 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtTaux(2000), \"20 %\");\nassert.strictEqual(fmtTaux(550), \"5,5 %\");\nassert.strictEqual(fmtTaux(210), \"2,1 %\");\nassert.strictEqual(fmtTaux(1005), \"10,05 %\");\nassert.strictEqual(dec(\"14 400\", 1e8), 1440000); assert.strictEqual(dec(\"5,5\", 100), 550); assert.strictEqual(dec(\"1\\u00a0000\", 1e8), 100000);\nassert.strictEqual(dec(\"-1\", 100), 0); assert.strictEqual(dec(\"x\", 100), 0); assert.strictEqual(dec(\"250\", 100), 10000);\nassert.strictEqual(parseDate(\"2027-02-30\"), null); assert.strictEqual(parseDate(\"\"), null); assert.strictEqual(parseDate(\"08/01/2027\"), null);\nassert.strictEqual(isoDate(parseDate(\"2028-02-29\")), \"2028-02-29\");\nassert.strictEqual(fmtDate(parseDate(\"2026-11-16\")), \"lundi 16 novembre 2026\");\nassert.strictEqual(fmtDate(parseDate(\"2027-01-08\")), \"vendredi 8 janvier 2027\");\nassert.strictEqual(fmtDate(null), \"[date]\");\nassert.strictEqual(normalize({}).operation, \"biens\");\nassert.strictEqual(normalize({ operation: \"pirate\" }).operation, \"biens\");\n\n// Défauts : atelier, carters inox, client belge\nconst d = computeTva(DEFAULTS);\nassert.strictEqual(d.regime, \"exo_intracom\");\nassert.strictEqual(d.regimeLabel, \"Livraison intracommunautaire exonérée\");\nassert.strictEqual(d.tvaLabel, \"0 €\");\nassert.strictEqual(d.enJeuLabel, \"2 880 €\");\nassert.strictEqual(d.tvaPleineCents, 288000);\nassert.strictEqual(d.mentionLabel, \"Exonération, article 262 ter I du CGI\");\nassert.deepStrictEqual(d.controles.map((c) => c.statut), [\"info\", \"ok\", \"ok\", \"warn\", \"warn\", \"warn\", \"ok\", \"info\", \"info\", \"info\"]);\nassert.deepStrictEqual([d.nbOk, d.nbWarn, d.nbBad, d.nbInfo], [3, 3, 0, 4]);\nassert.strictEqual(d.etat, \"warn\");\nassert.strictEqual(d.verdict, \"Aucun point bloquant, 3 à compléter. Régime : livraison intracommunautaire exonérée.\");\nassert.strictEqual(d.clause.split(\"\\n\").length, 8);\nassert.strictEqual(d.clause.split(\"\\n\")[0], \"Article [X] : TVA et client établi hors de France\");\nassert.strictEqual(d.actions.length, 5);\nassert.strictEqual(d.recap.split(\"\\n\").length, 11);\nassert.strictEqual(d.recap.split(\"\\n\")[10], \"Calcul : quotebuilder.co/outils/\" + SLUG);\nassert(d.recap.includes(\"TVA française à facturer : 0 € ; TVA en jeu : 2 880 €\"));\nassert(d.recap.includes(\"Facture prévue : vendredi 8 janvier 2027\"));\nassert(T(d, 9).includes(\"30 juin 2028\"));\nassert(T(d, 9).includes(\"BOI-RES-TVA-000253-20261007\"));\nassert(T(d, 3).includes(\"§ 100\"));\nassert(d.message.startsWith(\"Objet : TVA de notre devis du [date]\"));\n\n// Cas\nlet r = run({ numero: \"absent\" });\nassert.strictEqual(r.regime, \"tva_fr\"); assert.strictEqual(S(r, 1), \"bad\"); assert.strictEqual(S(r, 3), \"bad\");\nassert.strictEqual(r.tvaLabel, \"2 880 €\"); assert.strictEqual(r.etat, \"bad\");\nassert.strictEqual(r.verdict, \"2 points bloquants : en l'état, facturez la TVA française (2 880 €) ou réunissez les conditions avant la facture.\");\nassert(T(r, 8).includes(\"17 280 €\"));\nr = run({ numero: \"francais\" }); assert.strictEqual(r.regime, \"tva_fr\"); assert.strictEqual(S(r, 3), \"bad\");\nr = run({ numero: \"verifie\", preuves: \"completes\", recap: \"oui\" });\nassert.strictEqual(r.etat, \"ok\"); assert.strictEqual(r.nbWarn, 0); assert.strictEqual(r.tvaLabel, \"0 €\");\nassert.strictEqual(r.verdict, \"Aucun point bloquant ni à compléter. Régime : livraison intracommunautaire exonérée.\");\nr = run({ recap: \"non\" }); assert.strictEqual(S(r, 5), \"bad\"); assert.strictEqual(r.tvaLabel, \"2 880 €\");\nr = run({ preuves: \"aucune\" }); assert.strictEqual(S(r, 4), \"bad\"); assert.strictEqual(r.tvaCents, 288000);\nr = run({ transport: \"client\" }); assert(T(r, 4).includes(\"§ 60 à 80\")); assert(r.clause.includes(\"confirmation écrite de réception\"));\nr = run({ destination: \"hors_ue\", clientEtab: \"hors_ue\", transport: \"client\", montant: \"6200\", numero: \"absent\" });\nassert.strictEqual(r.regime, \"export\"); assert.strictEqual(r.enJeuLabel, \"1 240 €\"); assert.strictEqual(r.tvaLabel, \"0 €\");\nassert(T(r, 4).includes(\"BOI-TVA-CHAMP-30-30-10-20\")); assert.strictEqual(S(r, 3), \"info\");\nassert(r.message.includes(\"déclaration de votre transporteur ou transitaire\"));\nr = run({ destination: \"hors_ue\", clientEtab: \"hors_ue\", preuves: \"aucune\" }); assert.strictEqual(r.regime, \"export\"); assert.strictEqual(S(r, 4), \"bad\"); assert.strictEqual(r.tvaCents, 288000);\nr = run({ destination: \"hors_ue\", clientEtab: \"france\", transport: \"client\" }); assert.strictEqual(r.regime, \"a_valider\"); assert.strictEqual(S(r, 1), \"warn\");\nr = run({ operation: \"services\", clientEtab: \"ue\", montant: \"1800\", numero: \"verifie\", recap: \"oui\" });\nassert.strictEqual(r.regime, \"autoliq_ue\"); assert.strictEqual(r.mentionLabel, \"Autoliquidation\"); assert.strictEqual(r.enJeuLabel, \"360 €\"); assert.strictEqual(r.etat, \"ok\");\nassert(T(r, 7).includes(\"« Autoliquidation » (13°)\"));\nr = run({ operation: \"services\", clientEtab: \"ue\", numero: \"absent\" }); assert.strictEqual(S(r, 3), \"warn\"); assert(T(r, 3).includes(\"4°\"));\nr = run({ operation: \"services\", clientEtab: \"ue\", recap: \"non\" }); assert.strictEqual(S(r, 5), \"warn\");\nr = run({ operation: \"services\", clientEtab: \"hors_ue\" }); assert.strictEqual(r.regime, \"hors_fr_services\"); assert.strictEqual(r.tvaCents, 0);\nr = run({ operation: \"services\", clientEtab: \"ue\", statut: \"non_assujetti\" }); assert.strictEqual(r.regime, \"tva_fr\"); assert.strictEqual(r.tvaLabel, \"2 880 €\");\nr = run({ operation: \"services\", clientEtab: \"ue\", statut: \"pm_identifiee\", numero: \"verifie\", recap: \"oui\" }); assert.strictEqual(r.regime, \"autoliq_ue\"); assert(T(r, 2).includes(\"259-0\"));\nr = run({ operation: \"immeuble\", destination: \"france\", clientEtab: \"ue\" }); assert.strictEqual(r.regime, \"tva_fr\"); assert(T(r, 0).includes(\"259 A, 2°\"));\nr = run({ operation: \"immeuble\", destination: \"ue\" }); assert.strictEqual(r.regime, \"hors_fr_local\"); assert.strictEqual(r.tvaCents, 0);\nr = run({ operation: \"installation\", destination: \"ue\" }); assert.strictEqual(r.regime, \"hors_fr_local\"); assert(T(r, 0).includes(\"258 I b\"));\nr = run({ operation: \"installation\", destination: \"france\" }); assert.strictEqual(r.regime, \"tva_fr\");\nr = run({ franchise: \"oui\" }); assert.strictEqual(r.regime, \"franchise\"); assert.strictEqual(S(r, 6), \"warn\"); assert.strictEqual(r.tvaCents, 0);\nr = run({ statut: \"non_assujetti\" }); assert.strictEqual(r.regime, \"a_valider\"); assert.strictEqual(S(r, 2), \"warn\");\nr = run({ destination: \"france\" }); assert.strictEqual(r.regime, \"tva_fr\"); assert.strictEqual(S(r, 1), \"ok\");\nr = run({ transport: \"aucun\" }); assert.strictEqual(r.regime, \"tva_fr\"); assert.strictEqual(S(r, 4), \"info\");\nr = run({ taux: \"5,5\" }); assert.strictEqual(r.enJeuLabel, \"792 €\");\nr = run({ montant: \"0\" }); assert.strictEqual(S(r, 8), \"warn\"); assert(r.actions.some((a) => a.includes(\"montant\")));\nr = run({ dateFacture: \"2026-12-15\" }); assert.strictEqual(S(r, 9), \"ok\");\nr = run({ dateFacture: \"2028-06-30\" }); assert.strictEqual(S(r, 9), \"info\");\nr = run({ dateFacture: \"2028-07-01\" }); assert.strictEqual(S(r, 9), \"warn\");\nr = run({ dateFacture: \"\" }); assert.strictEqual(S(r, 9), \"warn\"); assert(r.recap.includes(\"Facture prévue : [date]\"));\nassert.strictEqual(computeRegime(normalize({ ...DEFAULTS, operation: \"services\", clientEtab: \"france\" })), \"tva_fr\");\n\n")(tool, require, console);
console.log("seo-pm-20261116 ok");
