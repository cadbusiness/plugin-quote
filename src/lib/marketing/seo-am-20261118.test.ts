import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_MENTION_DECHETS, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-mention-dechets-devis-travaux";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "mention-dechets-devis-travaux-bordereau-depot-b2b";
const BLOG_PATH = "/blog/mention-dechets-devis-travaux-bordereau-depot-b2b";
const TOOL_PATH = "/outils/verificateur-mention-dechets-devis-travaux";
const DAY = "2026-11-18";
const DAY_PATHS = ["/blog/mention-dechets-devis-travaux-bordereau-depot-b2b", "/secteurs/funnel-devis-decoupe-laser-tolerie-pliage", "/outils/verificateur-mention-dechets-devis-travaux"];

assert.equal(BLOG_TOOL_MENTION_DECHETS, TOOL_PATH);
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
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de mention déchets");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Construction, rénovation, démolition ou jardinage : quantité, tri, point de collecte, coût de la ligne déchets, la ligne à coller et le message.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-decoupe-laser-tolerie-pliage")?.priority, 0.8);

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
assert.ok(outilsHub.includes("verificateur-mention-dechets-devis-travaux"));
assert.ok(outilsHub.includes("Vérificateur de mention déchets"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-mention-dechets-devis-travaux\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-decoupe-laser-tolerie-pliage"));
assert.ok(secteursHub.includes("Découpe laser, tôlerie et pliage"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 8716);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-decoupe-laser-tolerie-pliage.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-decoupe-laser-tolerie-pliage/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 5927);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Découpe laser, tôlerie et pliage"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/verificateur-mention-dechets-devis-travaux.ts","src/components/marketing/verificateur-mention-dechets-devis-travaux-calculator.tsx","src/app/(marketing)/outils/verificateur-mention-dechets-devis-travaux/page.tsx","src/content/blog/mention-dechets-devis-travaux-bordereau-depot-b2b.md","src/content/blog/funnel-devis-decoupe-laser-tolerie-pliage.md","src/app/(marketing)/secteurs/funnel-devis-decoupe-laser-tolerie-pliage/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, POINTS, LABEL_SETS, STATUT_LABELS, FLUX, TYPES_CONCERNES, AMENDE_MAX, computeMention, normalize, buildRecap, fmtEur, fmtT, fmtDate, parseDate, isoDate, dec, kg, joinFr } = X;\nconst run = (o) => computeMention({ ...DEFAULTS, ...o });\nconst S = (r) => r.controles.map((c) => c.statut).join(\",\");\nconst T = (r, i) => r.controles[i].texte;\n\n// Statique\nassert.strictEqual(X.SLUG, SLUG);\nassert.strictEqual(Object.keys(DEFAULTS).length, 18);\nassert.strictEqual(POINTS.length, 10);\nassert.strictEqual(FLUX.length, 4);\nassert.deepStrictEqual(TYPES_CONCERNES, [\"construction\", \"renovation\", \"demolition\", \"jardinage\"]);\nassert.deepStrictEqual(AMENDE_MAX, { physique: 300000, morale: 1500000 });\nconst numIds = [\"qPlatre\", \"qInertes\", \"qBois\", \"qMetal\", \"qMelange\", \"qDangereux\", \"prixTrie\", \"prixMelange\", \"prixDangereux\", \"forfaitTransport\", \"heuresTri\", \"tauxHoraire\"];\nconst dateIds = [\"dateDevis\"];\nconst selIds = Object.keys(LABEL_SETS);\nassert.deepStrictEqual(selIds, [\"typeTravaux\", \"pemd\", \"statut\", \"pointCollecte\", \"affichageCout\"]);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 18);\n\n\n\n\n\n\n\n// Utilitaires\nassert.strictEqual(fmtEur(127500), \"1 275 €\");\nassert.strictEqual(fmtEur(4100), \"41 €\");\nassert.strictEqual(fmtEur(4505), \"45,05 €\");\nassert.strictEqual(fmtEur(123456789), \"1 234 567,89 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtEur(1500000), \"15 000 €\");\nassert.strictEqual(fmtT(5500), \"5,5 t\");\nassert.strictEqual(fmtT(500), \"0,5 t\");\nassert.strictEqual(fmtT(0), \"0 t\");\nassert.strictEqual(fmtT(1050), \"1,05 t\");\nassert.strictEqual(fmtT(1234567), \"1 234,567 t\");\nassert.strictEqual(fmtT(3000), \"3 t\");\nassert.strictEqual(kg(\"3,2\", 100000), 3200);\nassert.strictEqual(kg(\" 0,8 \", 100000), 800);\nassert.strictEqual(kg(\"1\\u00a0000\", 100000), 1000000);\nassert.strictEqual(kg(\"-4\", 100000), 0);\nassert.strictEqual(kg(\"abc\", 100000), 0);\nassert.strictEqual(kg(\"999999\", 100000), 100000000);\nassert.strictEqual(kg(\"0.0004\", 100000), 0);\nassert.strictEqual(dec(\"110\", 100000), 11000);\nassert.strictEqual(dec(\"12,5\", 100000), 1250);\nassert.strictEqual(dec(\"\", 100000), 0);\nassert.strictEqual(joinFr([\"a\"]), \"a\");\nassert.strictEqual(joinFr([\"a\", \"b\"]), \"a et b\");\nassert.strictEqual(joinFr([\"a\", \"b\", \"c\"]), \"a, b et c\");\nassert.strictEqual(joinFr([]), \"\");\nassert.strictEqual(fmtDate(parseDate(\"2026-11-18\")), \"mercredi 18 novembre 2026\");\nassert.strictEqual(fmtDate(parseDate(\"2021-07-01\")), \"jeudi 1er juillet 2021\");\nassert.strictEqual(fmtDate(null), \"[date]\");\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\nassert.strictEqual(parseDate(\"18/11/2026\"), null);\nassert.strictEqual(isoDate(parseDate(\"2027-01-22\")), \"2027-01-22\");\n\n// Valeurs par défaut (exemple de l'article)\nconst d = run({});\nassert.strictEqual(d.inScope, true);\nassert.strictEqual(d.champLabel, \"Devis concerné (L541-21-2-3)\");\nassert.strictEqual(d.quantiteLabel, \"5,5 t\");\nassert.strictEqual(d.totalKg, 5500);\nassert.strictEqual(d.triKg, 5000);\nassert.strictEqual(d.coutTrieC, 55000);\nassert.strictEqual(d.coutMelangeC, 9500);\nassert.strictEqual(d.coutDangereuxC, 0);\nassert.strictEqual(d.traitementLabel, \"645 € HT\");\nassert.strictEqual(d.transportLabel, \"360 € HT\");\nassert.strictEqual(d.triLabel, \"270 € HT\");\nassert.strictEqual(d.coutLabel, \"1 275 € HT\");\nassert.strictEqual(d.totalC, 127500);\nassert.strictEqual(S(d), \"ok,ok,ok,info,ok,ok,info,info,ok,info\");\nassert.deepStrictEqual([d.nbOk, d.nbWarn, d.nbBad, d.nbInfo], [6, 0, 0, 4]);\nassert.strictEqual(d.etat, \"ok\");\nassert.strictEqual(d.compteursLabel, \"0 / 0\");\nassert.strictEqual(d.verdict, \"Mention déchets complète : les quatre informations du décret sont présentes. Coût estimé : 1 275 € HT pour 5,5 t.\");\nconst clauseLines = d.clause.split(\"\\n\");\nassert.strictEqual(clauseLines.length, 8);\nassert.strictEqual(clauseLines[0], \"Gestion des déchets de chantier (article L541-21-2-3 du code de l'environnement)\");\nassert.strictEqual(clauseLines[1], \"Quantité totale estimée : 5,5 t (plâtre 3,2 t, fraction minérale 0,8 t, bois 0,6 t, métal 0,4 t, mélange 0,5 t).\");\nassert.strictEqual(clauseLines[2], \"Tri sur le chantier : collecte séparée du plâtre, de la fraction minérale, du bois et du métal ; le reste en benne de mélange.\");\nassert(clauseLines[3].startsWith(\"Déchets dangereux : aucun prévu.\"));\nassert.strictEqual(clauseLines[4], \"Point de collecte : [raison sociale], [adresse], [type d'installation].\");\nassert.strictEqual(clauseLines[5], \"Coût estimé de l'enlèvement et de la gestion : 1 275 € HT (traitement 645 €, transport et contenants 360 €, tri et chargement 270 €).\");\nassert.strictEqual(clauseLines[7], \"Les bordereaux de dépôt sont conservés et transmis au client sur simple demande.\");\nassert.strictEqual(d.actions.length, 3);\nassert(d.message.startsWith(\"Objet : Gestion des déchets de votre chantier\"));\nassert(d.message.includes(\"1 275 € HT\") && d.message.includes(\"(5,5 t)\") && d.message.includes(\"article L541-21-2-3\"));\nconst rec = d.recap.split(\"\\n\");\nassert.strictEqual(rec.length, 11);\nassert.strictEqual(rec[10], \"Calcul : quotebuilder.co/outils/\" + SLUG);\nassert.strictEqual(rec[8], \"Date du devis : mercredi 18 novembre 2026\");\nassert.strictEqual(buildRecap(DEFAULTS), d.recap);\nassert(T(d, 9).includes(\"15 000 €\") && T(d, 9).includes(\"3 000 €\"));\nassert(T(d, 2).includes(\"mélange 0,5 t (9 %)\"));\n\n// Cas\nlet r = run({ pointCollecte: \"aucun\" });\nassert.strictEqual(r.controles[4].statut, \"bad\");\nassert.strictEqual(r.etat, \"bad\");\nassert.strictEqual(r.compteursLabel, \"1 / 0\");\nassert(r.verdict.startsWith(\"1 point bloquant : la mention déchets est incomplète.\"));\nassert(r.actions.some((a) => a.includes(\"raison sociale, l'adresse et le type\")));\nr = run({ pointCollecte: \"partiel\" });\nassert.strictEqual(r.controles[4].statut, \"warn\");\nassert.strictEqual(r.verdict, \"Aucun point bloquant, 1 à compléter. Coût estimé : 1 275 € HT pour 5,5 t.\");\nr = run({ affichageCout: \"inclus\" });\nassert.strictEqual(r.controles[5].statut, \"warn\");\nassert(r.clause.split(\"\\n\")[5].includes(\", compris dans le prix des travaux : 1 275 € HT\"));\nassert(r.actions.some((a) => a.startsWith(\"Écrivez le montant estimé de 1 275 € HT\")));\nr = run({ affichageCout: \"inclus_montant\" });\nassert.strictEqual(r.controles[5].statut, \"ok\");\nassert(T(r, 5).startsWith(\"Coût estimé écrit dans une ligne du devis : 1 275 € HT\"));\nr = run({ affichageCout: \"absent\", pointCollecte: \"aucun\" });\nassert.strictEqual(r.compteursLabel, \"2 / 0\");\nassert(r.verdict.startsWith(\"2 points bloquants\"));\nr = run({ typeTravaux: \"fabrication\" });\nassert.strictEqual(r.inScope, false);\nassert.strictEqual(r.champLabel, \"Hors champ (mention facultative)\");\nassert.strictEqual(S(r), \"info,info,info,info,info,info,info,info,ok,info\");\nassert.strictEqual(r.etat, \"ok\");\nassert(r.verdict.startsWith(\"Mention non exigée par l'article L541-21-2-3 pour ce devis.\"));\nassert.strictEqual(r.clause.split(\"\\n\")[0], \"Gestion des déchets (mention facultative pour ce devis)\");\nassert(r.message.includes(\"même si la loi ne l'exige pas\"));\nassert(T(r, 9).startsWith(\"Aucune amende\"));\nr = run({ typeTravaux: \"fabrication\", pointCollecte: \"aucun\", affichageCout: \"absent\" });\nassert.strictEqual(r.etat, \"ok\");\nr = run({ typeTravaux: \"travaux_publics\" });\nassert.strictEqual(r.inScope, false);\nassert(T(r, 0).includes(\"travaux publics hors bâtiment\"));\nr = run({ pemd: \"oui\" });\nassert.strictEqual(r.exempt, true);\nassert.strictEqual(r.champLabel, \"Exempté (diagnostic PEMD)\");\nassert(r.actions[0].startsWith(\"Demandez au client la référence du diagnostic PEMD\"));\nr = run({ typeTravaux: \"demolition\", pemd: \"oui\", pointCollecte: \"aucun\" });\nassert.strictEqual(r.exempt, true);\nassert.strictEqual(r.controles[4].statut, \"info\");\nr = run({ pemd: \"inconnu\" });\nassert.strictEqual(r.controles[0].statut, \"warn\");\nassert.strictEqual(r.inScope, true);\nassert(r.actions.some((a) => a === \"Demandez au client si l'opération est soumise au diagnostic PEMD.\"));\nr = run({ typeTravaux: \"construction\", pemd: \"oui\" });\nassert.strictEqual(r.controles[0].statut, \"warn\");\nassert.strictEqual(r.inScope, true);\nassert(T(r, 0).includes(\"n'exempte pas\"));\nr = run({ typeTravaux: \"jardinage\", pemd: \"inconnu\" });\nassert.strictEqual(r.controles[0].statut, \"ok\");\nassert(r.clause.split(\"\\n\")[2].includes(\"Déchets verts : broyage sur place ou évacuation, à préciser.\"));\nassert(T(r, 2).includes(\"broyage sur place\"));\nr = run({ dateDevis: \"2021-06-30\" });\nassert.strictEqual(r.avant, true);\nassert.strictEqual(r.inScope, false);\nassert.strictEqual(r.champLabel, \"Devis antérieur au 1er juillet 2021\");\nassert.strictEqual(r.controles[8].statut, \"info\");\nr = run({ dateDevis: \"2021-07-01\" });\nassert.strictEqual(r.inScope, true);\nr = run({ dateDevis: \"\" });\nassert.strictEqual(r.controles[8].statut, \"warn\");\nassert.strictEqual(r.inScope, true);\nassert(r.recap.includes(\"Date du devis : non saisie\"));\nr = run({ qPlatre: \"0\", qInertes: \"0\", qBois: \"0\", qMetal: \"0\", qMelange: \"0\", qDangereux: \"0\" });\nassert.strictEqual(r.controles[1].statut, \"bad\");\nassert.strictEqual(r.controles[2].statut, \"warn\");\nassert.strictEqual(r.coutLabel, \"630 € HT\");\nassert.strictEqual(r.clause.split(\"\\n\")[1], \"Quantité totale estimée : [à compléter].\");\nassert(r.actions.some((a) => a.startsWith(\"Estimez les quantités\")));\nr = run({ qMelange: \"6\" });\nassert.strictEqual(r.controles[2].statut, \"warn\");\nassert(T(r, 2).includes(\"(55 %)\"));\nassert(r.actions.some((a) => a.startsWith(\"Prévoyez des contenants séparés\")));\nr = run({ qPlatre: \"0\", qInertes: \"0\", qBois: \"0\", qMetal: \"0\", qMelange: \"2\" });\nassert.strictEqual(r.controles[2].statut, \"warn\");\nassert(T(r, 2).startsWith(\"Aucun flux en collecte séparée\"));\nassert.strictEqual(r.clause.split(\"\\n\")[2], \"Tri sur le chantier : [flux en collecte séparée à préciser].\");\nr = run({ qPlatre: \"0\", qInertes: \"0\", qBois: \"0\", qMetal: \"0\", qMelange: \"0\", qDangereux: \"0,3\", prixDangereux: \"900\" });\nassert.strictEqual(r.controles[2].statut, \"ok\");\nassert(T(r, 2).startsWith(\"Seuls des déchets dangereux\"));\nr = run({ qDangereux: \"0,2\", prixDangereux: \"900\" });\nassert.strictEqual(r.coutDangereuxC, 18000);\nassert.strictEqual(r.coutLabel, \"1 455 € HT\");\nassert.strictEqual(r.controles[3].statut, \"warn\");\nassert(!T(r, 3).includes(\"à vérifier\"));\nassert(r.clause.split(\"\\n\")[3].startsWith(\"Déchets dangereux : 0,2 t prévues\"));\nassert(r.actions.some((a) => a.includes(\"Trackdéchets\")));\nassert.strictEqual(r.quantiteLabel, \"5,7 t\");\nr = run({ qDangereux: \"0,2\" });\nassert(T(r, 3).includes(\"Prix de traitement à 0 € : à vérifier.\"));\nr = run({ statut: \"physique\" });\nassert(T(r, 9).startsWith(\"Un devis sans la mention expose à une amende administrative jusqu'à 3 000 € pour une personne physique\"));\nr = run({ prixTrie: \"0\", prixMelange: \"0\", forfaitTransport: \"0\", heuresTri: \"0\" });\nassert.strictEqual(r.totalC, 0);\nassert.strictEqual(r.controles[5].statut, \"warn\");\nr = run({ qPlatre: \"3,4\", qMelange: \"0,6\" });\nassert.strictEqual(r.totalKg, 5800);\nassert.strictEqual(r.totalC - d.totalC, 4100);\nr = run({ heuresTri: \"6,5\", tauxHoraire: \"45,50\" });\nassert.strictEqual(r.triC, 29575);\nr = run({ qPlatre: \"3 200\", prixTrie: \"110\" });\nassert.strictEqual(r.triKg, 3200000 + 1800);\n\n// Valeurs invalides ramenées aux défauts\nconst inv = normalize({ typeTravaux: \"x\", pemd: \"y\", statut: \"z\", pointCollecte: \"w\", affichageCout: \"v\" });\nassert.deepStrictEqual([inv.typeTravaux, inv.pemd, inv.statut, inv.pointCollecte, inv.affichageCout], [\"renovation\", \"non\", \"morale\", \"complet\", \"ligne\"]);\nconst empty = computeMention({});\nassert.strictEqual(empty.controles.length, 10);\nassert.strictEqual(empty.totalKg, 0);\n\n")(tool, require, console);
console.log("seo-am-20261118 ok");
