import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_PRET_MAIN_OEUVRE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-pret-main-oeuvre-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "pret-main-oeuvre-illicite-marchandage-devis-regie-b2b";
const BLOG_PATH = "/blog/pret-main-oeuvre-illicite-marchandage-devis-regie-b2b";
const TOOL_PATH = "/outils/verificateur-pret-main-oeuvre-devis";
const DAY = "2026-11-19";
const DAY_PATHS = ["/blog/pret-main-oeuvre-illicite-marchandage-devis-regie-b2b", "/secteurs/funnel-devis-palettes-caisses-bois-export", "/outils/verificateur-pret-main-oeuvre-devis"];

assert.equal(BLOG_TOOL_PRET_MAIN_OEUVRE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 34);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de prêt de main-d'œuvre");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Régie, assistance technique ou mise à disposition : indices de fourniture de personnel, coût réel, but lucratif, la clause à coller et le message.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-palettes-caisses-bois-export")?.priority, 0.8);

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
assert.ok(outilsHub.includes("verificateur-pret-main-oeuvre-devis"));
assert.ok(outilsHub.includes("Vérificateur de prêt de main-d'œuvre"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-pret-main-oeuvre-devis\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-palettes-caisses-bois-export"));
assert.ok(secteursHub.includes("Palettes et caisses bois"));

assert.equal(BLOG_TOOLS.length, 94);
assert.equal(BLOG_POSTS.length, 104);
assert.equal(outilsHubIntro(), "Quatre-vingt-quatorze outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(94), outilsHubIntro());
assert.equal(outilsHubIntro(71), "Soixante-et-onze outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(80), "Quatre-vingts outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(61), "Soixante-et-un outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 6721);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-palettes-caisses-bois-export.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-palettes-caisses-bois-export/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 5251);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Palettes et caisses bois"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/verificateur-pret-main-oeuvre-devis.ts","src/components/marketing/verificateur-pret-main-oeuvre-devis-calculator.tsx","src/app/(marketing)/outils/verificateur-pret-main-oeuvre-devis/page.tsx","src/content/blog/pret-main-oeuvre-illicite-marchandage-devis-regie-b2b.md","src/content/blog/funnel-devis-palettes-caisses-bois-export.md","src/app/(marketing)/secteurs/funnel-devis-palettes-caisses-bois-export/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, POINTS, LABEL_SETS, STATUT_LABELS, POIDS, SCORE_MAX, SEUIL_ELEVE, SEUIL_SURVEILLER, DUREE_MAX_L8241_3, computePret, normalize, fmtEur, fmtPct, dec, ent, joinFr, pluriel } = X;\nconst run = (o) => computePret({ ...DEFAULTS, ...o });\nconst S = (r) => r.controles.map((c) => c.statut).join(\",\");\nconst T = (r, i) => r.controles[i].texte;\nconst PROPRE = { objet: \"prestation\", livrable: \"defini\", prix: \"forfait\", encadrement: \"prestataire\", ordres: \"prestataire\", horaires: \"prestataire\", integration: \"non\", materiel: \"prestataire\", savoirFaire: \"proche\", choixPersonnes: \"prestataire\" };\n\n// Statique\nassert.strictEqual(X.SLUG, SLUG);\nassert.strictEqual(Object.keys(DEFAULTS).length, 18);\nassert.strictEqual(POINTS.length, 10);\nassert.strictEqual(SCORE_MAX, 18);\nconst maxPoids = Object.values(POIDS).reduce((s, o) => s + Math.max(...Object.values(o)), 0) + 1;\nassert.strictEqual(maxPoids, SCORE_MAX, \"score max = somme des poids max + durée\");\nconst selIds = Object.keys(LABEL_SETS);\nassert.strictEqual(selIds.length, 12);\n\n\n\n\n\n\n// Utilitaires\nassert.strictEqual(fmtEur(384200), \"3 842 €\");\nassert.strictEqual(fmtEur(191800), \"1 918 €\");\nassert.strictEqual(fmtEur(2301600), \"23 016 €\");\nassert.strictEqual(fmtEur(-4505), \"-45,05 €\");\nassert.strictEqual(fmtEur(123456789), \"1 234 567,89 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtEur(1), \"0,01 €\");\nassert.strictEqual(fmtPct(4200), \"42 %\");\nassert.strictEqual(fmtPct(4250), \"42,5 %\");\nassert.strictEqual(fmtPct(4205), \"42,05 %\");\nassert.strictEqual(dec(\"2 600,50\", 100000), 260050);\nassert.strictEqual(dec(\"abc\", 10), 0);\nassert.strictEqual(dec(\"-3\", 10), 0);\nassert.strictEqual(dec(\"999\", 100), 10000);\nassert.strictEqual(dec(\"1\\u00a0200\", 100000), 120000);\nassert.strictEqual(ent(\"6,9\", 120), 6);\nassert.strictEqual(ent(\"500\", 120), 120);\nassert.strictEqual(ent(\"\", 50), 0);\nassert.strictEqual(joinFr([\"a\"]), \"a\");\nassert.strictEqual(joinFr([\"a\", \"b\", \"c\"]), \"a, b et c\");\nassert.strictEqual(pluriel(1, \"mois\", \"mois\"), \"1 mois\");\nassert.strictEqual(pluriel(2, \"personne\", \"personnes\"), \"2 personnes\");\nconst n0 = normalize({ cadre: \"x\", objet: \"y\" });\nassert.strictEqual(n0.cadre, \"classique\");\nassert.strictEqual(n0.objet, \"assistance\");\n\n// Défauts : la demande initiale de l'exemple\nconst d = computePret(DEFAULTS);\nassert.strictEqual(d.score, 17);\nassert.strictEqual(d.niveau, \"eleve\");\nassert.strictEqual(d.niveauLabel, \"Élevé (17 sur 18)\");\nassert.strictEqual(d.coutC, 384200);\nassert.strictEqual(d.chargesC, 109200);\nassert.strictEqual(d.ecartC, 191800);\nassert.strictEqual(d.ecartTotalC, 2301600);\nassert.strictEqual(S(d), \"info,bad,bad,bad,bad,warn,bad,warn,info,info\");\nassert.deepStrictEqual([d.nbOk, d.nbWarn, d.nbBad, d.nbInfo], [0, 2, 5, 3]);\nassert.strictEqual(d.etat, \"bad\");\nassert(d.verdict.startsWith(\"Indices élevés (17 sur 18)\"));\nassert.strictEqual(d.actions.length, 10);\nassert(T(d, 8).includes(\"1 918 € par personne et par mois (23 016 € sur 6 mois et 2 personnes)\"));\nassert(d.message.includes(\"agences d'intérim\"));\nassert.strictEqual(d.clause.split(\"\\n\")[0], \"Organisation de la prestation\");\n\n// Le devis refait de l'exemple\nconst p = run(PROPRE);\nassert.strictEqual(p.score, 1);\nassert.strictEqual(p.niveau, \"faible\");\nassert.strictEqual(S(p), \"info,ok,ok,ok,ok,ok,warn,ok,info,info\");\nassert.strictEqual(p.etat, \"warn\");\nassert(p.verdict.startsWith(\"Indices faibles (1 sur 18)\"));\nconst pp = run({ ...PROPRE, savoirFaire: \"specifique\" });\nassert.strictEqual(pp.score, 0);\nassert.strictEqual(pp.etat, \"ok\");\nassert(pp.verdict.includes(\"Vérifiez que le terrain suit.\"));\n\n// Seuils\nconst s4 = run({ ...PROPRE, savoirFaire: \"specifique\", prix: \"heure_personne\", livrable: \"aucun\" });\nassert.strictEqual(s4.score, 4);\nassert.strictEqual(s4.niveau, \"surveiller\");\nassert.strictEqual(s4.nbBad, 0);\nconst s8 = run({ ...PROPRE, savoirFaire: \"identique\", prix: \"heure_personne\", livrable: \"partiel\", choixPersonnes: \"client\", materiel: \"client\" });\nassert.strictEqual(s8.score, 8);\nassert.strictEqual(s8.niveau, \"surveiller\");\nassert.strictEqual(s8.nbBad, 0);\nconst s9 = run({ ...PROPRE, savoirFaire: \"identique\", prix: \"heure_personne\", livrable: \"aucun\", choixPersonnes: \"client\", materiel: \"client\" });\nassert.strictEqual(s9.score, 9);\nassert.strictEqual(s9.niveau, \"eleve\");\nassert.strictEqual(s9.etat, \"bad\");\nassert.strictEqual(run({ ...PROPRE, dureeMois: \"13\" }).poids[4], 1);\nassert.strictEqual(run({ ...PROPRE, dureeMois: \"12\" }).poids[4], 0);\n\n// Mise à disposition\nconst m1 = run({ objet: \"mad\" });\nassert.strictEqual(m1.niveau, \"mad\");\nassert.strictEqual(m1.controles[8].statut, \"bad\");\nassert.strictEqual(m1.controles[9].statut, \"bad\");\nassert(m1.verdict.startsWith(\"Mise à disposition à but lucratif\"));\nconst m2 = run({ objet: \"mad\", prixMensuel: \"3842\", formalites: \"complet\" });\nassert.strictEqual(m2.ecartC, 0);\nassert.strictEqual(m2.etat, \"ok\");\nassert(m2.verdict.startsWith(\"Mise à disposition sans but lucratif\"));\nassert(m2.message.includes(\"3 842 € par personne et par mois\"));\nassert(m2.clause.includes(\"charges 1 092 € soit 42 %\"));\nconst m3 = run({ objet: \"mad\", prixMensuel: \"3000\", formalites: \"partiel\" });\nassert.strictEqual(m3.controles[8].statut, \"warn\");\nassert.strictEqual(m3.controles[9].statut, \"warn\");\nassert.strictEqual(m3.etat, \"warn\");\nconst m4 = run({ objet: \"mad\", cadre: \"l8241_3\", prixMensuel: \"0\" });\nassert.strictEqual(m4.controles[8].statut, \"ok\");\nassert.strictEqual(m4.controles[9].statut, \"info\");\nassert.strictEqual(m4.etat, \"ok\");\nconst m5 = run({ objet: \"mad\", cadre: \"l8241_3\", prixMensuel: \"0\", dureeMois: \"37\" });\nassert.strictEqual(m5.controles[0].statut, \"bad\");\nassert.strictEqual(m5.etat, \"bad\");\nconst m6 = run({ objet: \"mad\", salaireBrut: \"0\", tauxCharges: \"0\", fraisMensuels: \"0\", formalites: \"complet\" });\nassert.strictEqual(m6.controles[8].statut, \"warn\");\n\n// Hors champ\nconst h = run({ cadre: \"ett\" });\nassert.strictEqual(h.niveau, \"hors_champ\");\nassert.strictEqual(h.nbBad + h.nbWarn, 0);\nassert.strictEqual(h.etat, \"ok\");\nassert(h.verdict.startsWith(\"Hors champ\"));\n\n// Prestation dans le cadre L8241-3\nconst l3 = run({ ...PROPRE, cadre: \"l8241_3\" });\nassert(T(l3, 0).includes(\"ne joue pas\"));\nassert.strictEqual(l3.score, 1);\n\n")(tool, require, console);
console.log("seo-am-20261119 ok");
