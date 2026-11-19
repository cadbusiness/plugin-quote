import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_REMISE_VOLUME, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./calculateur-remise-volume-contrat-cadre";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "contrat-cadre-bordereau-prix-unitaires-devis-b2b";
const BLOG_PATH = "/blog/contrat-cadre-bordereau-prix-unitaires-devis-b2b";
const TOOL_PATH = "/outils/calculateur-remise-volume-contrat-cadre";
const DAY = "2026-10-29";
const DAY_PATHS = ["/blog/contrat-cadre-bordereau-prix-unitaires-devis-b2b", "/secteurs/funnel-devis-transport-routier-marchandises", "/outils/calculateur-remise-volume-contrat-cadre"];

assert.equal(BLOG_TOOL_REMISE_VOLUME, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 26);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Calculateur de remise sur volume d'un contrat-cadre");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Paliers globaux ou par tranche, volume réalisé contre volume engagé : le montant dû, le rappel de prix ou la ristourne à facturer en fin de période.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-transport-routier-marchandises")?.priority, 0.8);

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
assert.ok(outilsHub.includes("calculateur-remise-volume-contrat-cadre"));
assert.ok(outilsHub.includes("Calculateur de remise sur volume d'un contrat-cadre"));
{
  const start = outilsHub.indexOf("href: \"/outils/calculateur-remise-volume-contrat-cadre\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-transport-routier-marchandises"));
assert.ok(secteursHub.includes("Transport routier de marchandises"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 5278);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-transport-routier-marchandises.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-transport-routier-marchandises/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 5540);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Transport routier de marchandises"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/calculateur-remise-volume-contrat-cadre.ts","src/components/marketing/calculateur-remise-volume-contrat-cadre-calculator.tsx","src/app/(marketing)/outils/calculateur-remise-volume-contrat-cadre/page.tsx","src/content/blog/contrat-cadre-bordereau-prix-unitaires-devis-b2b.md","src/content/blog/funnel-devis-transport-routier-marchandises.md","src/app/(marketing)/secteurs/funnel-devis-transport-routier-marchandises/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst { MAX_PALIERS, MODE_LABELS, DEFAULTS, computeRemise, buildRecap, normaliserPaliers, indexPalier, remiseAuVolume, montantGlobal, montantTranche, montant, parseDate, diffDays, fmtDate, fmtEur, fmtNb, fmtTaux, num } = __mod;\nconst NB = \"\\u00a0\";\nconst run = (o) => computeRemise({ ...DEFAULTS, ...o });\nconst PAL = normaliserPaliers(DEFAULTS);\n\n// Fichier\n\n\n\nassert.strictEqual(MAX_PALIERS, 4);\nassert.deepStrictEqual(Object.keys(MODE_LABELS), [\"global\", \"tranche\"]);\nassert.deepStrictEqual(DEFAULTS, {\n  prixBase: 48, mode: \"global\",\n  s1: 1000, r1: 3, s2: 2500, r2: 5, s3: 5000, r3: 8, s4: 0, r4: 0,\n  volEngage: 5000, volRealise: 3800, remiseAppliquee: 8, rappel: \"oui\", penalite: 0,\n  dateDebut: \"2026-01-01\", dateFin: \"2026-12-31\", dateCalcul: \"2026-10-29\",\n});\n\n// Formats\nassert.strictEqual(fmtEur(173280), `173${NB}280${NB}€`);\nassert.strictEqual(fmtEur(45.6), `45,60${NB}€`);\nassert.strictEqual(fmtEur(0), `0${NB}€`);\nassert.strictEqual(fmtEur(-5472), `-5${NB}472${NB}€`);\nassert.strictEqual(fmtEur(null), \"n/a\");\nassert.strictEqual(fmtNb(3800), `3${NB}800`);\nassert.strictEqual(fmtNb(-1200), `-1${NB}200`);\nassert.strictEqual(fmtTaux(5), `5${NB}%`);\nassert.strictEqual(fmtTaux(2.5), `2,5${NB}%`);\nassert.strictEqual(fmtTaux(76), `76${NB}%`);\nassert.strictEqual(fmtDate(parseDate(\"2026-10-29\")), \"29/10/2026\");\nassert.strictEqual(fmtDate(null), \"n/a\");\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\nassert.strictEqual(diffDays(parseDate(\"2026-01-01\"), parseDate(\"2026-12-31\")), 364);\nassert.strictEqual(num(\"\", 0, 100, 7), 7);\nassert.strictEqual(num(\"150\", 0, 100, 0), 100);\nassert.strictEqual(num(\"-3\", 0, null, 0), 0);\n\n// Paliers\nassert.deepStrictEqual(PAL, [{ seuil: 1000, remise: 3 }, { seuil: 2500, remise: 5 }, { seuil: 5000, remise: 8 }]);\nassert.deepStrictEqual(normaliserPaliers({ s1: 5000, r1: 8, s2: 1000, r2: 3, s3: 0, r3: 50, s4: 1000, r4: 4 }), [{ seuil: 1000, remise: 4 }, { seuil: 5000, remise: 8 }], \"tri, palier vide ignoré, doublon remplacé\");\nassert.deepStrictEqual(normaliserPaliers({ s1: 100, r1: 150 }), [{ seuil: 100, remise: 100 }], \"remise plafonnée à 100\");\nassert.strictEqual(indexPalier(PAL, 999), -1);\nassert.strictEqual(indexPalier(PAL, 1000), 0);\nassert.strictEqual(indexPalier(PAL, 2499), 0);\nassert.strictEqual(indexPalier(PAL, 2500), 1);\nassert.strictEqual(indexPalier(PAL, 5000), 2);\nassert.strictEqual(indexPalier(PAL, 99999), 2);\nassert.strictEqual(remiseAuVolume(PAL, 0), 0);\nassert.strictEqual(remiseAuVolume(PAL, 3800), 5);\nassert.strictEqual(remiseAuVolume([], 3800), 0);\n\n// Montants\nassert.strictEqual(montantGlobal(48, PAL, 3800), 173280, \"3800 × 48 × 0,95\");\nassert.strictEqual(montantGlobal(48, PAL, 999), 47952);\nassert.strictEqual(montantGlobal(48, PAL, 1000), 46560, \"effet de seuil : 1000 unités coûtent moins que 999\");\nassert.strictEqual(montantGlobal(48, PAL, 5000), 220800);\nassert.strictEqual(montantTranche(48, PAL, 3800), 177120, \"48000 + 69840 + 59280\");\nassert.strictEqual(montantTranche(48, PAL, 1000), 48000);\nassert.strictEqual(montantTranche(48, PAL, 999), 47952);\nassert.strictEqual(montantTranche(48, PAL, 6000), 48000 + 69840 + 114000 + 44160);\nassert.strictEqual(montantTranche(48, [], 100), 4800);\nassert.strictEqual(montant(\"tranche\", 48, PAL, 3800), 177120);\nassert.strictEqual(montant(\"global\", 48, PAL, 3800), 173280);\nfor (let v = 1; v <= 6000; v += 37) assert(montantTranche(48, PAL, v) > montantTranche(48, PAL, v - 1), \"tranche strictement croissant \" + v);\n\n// Cas par défaut : rappel de prix\nconst r = run({});\nassert.strictEqual(r.du, 173280);\nassert.strictEqual(r.brut, 182400);\nassert.strictEqual(r.facture, 167808);\nassert.strictEqual(r.ecart, 5472);\nassert.strictEqual(r.typeEcart, \"rappel\");\nassert.strictEqual(r.montantRappel, 5472);\nassert.strictEqual(r.montantAvoir, 0);\nassert.strictEqual(r.perte, 0);\nassert.strictEqual(r.idx, 1);\nassert.strictEqual(r.idxEngage, 2);\nassert.strictEqual(r.palierLabel, `Palier 2 : 5${NB}% dès 2${NB}500 unités`);\nassert.strictEqual(r.remiseEffective, 5);\nassert.strictEqual(r.prixMoyen, 45.6);\nassert.strictEqual(r.atteinte, 76);\nassert.strictEqual(r.manque, 1200);\nassert.strictEqual(r.penalite, 0);\nassert.strictEqual(r.duAutreMode, 177120);\nassert.strictEqual(r.etat, \"warn\");\nassert.deepStrictEqual(r.prochain, { seuil: 5000, remise: 8, unitesManquantes: 1200, montantAuSeuil: 220800, coutUnitesSupplementaires: 47520, debutZoneSeuil: 4843, dansZoneSeuil: false });\nassert(montantGlobal(48, PAL, 4843) > 220800 && montantGlobal(48, PAL, 4842) < 220800, \"début de zone de seuil exact\");\nassert.strictEqual(r.joursTotal, 365);\nassert.strictEqual(r.joursEcoules, 302);\nassert.strictEqual(r.projection, 4593);\nassert.strictEqual(r.idxProjection, 1);\nassert.strictEqual(r.periodeTerminee, false);\nassert(r.verdict.includes(`5${NB}472${NB}€ HT`));\nassert(r.verdict.includes(\"bilan provisoire au 29/10/2026\"));\nassert.strictEqual(r.conseils.length, 6);\nassert(r.conseils[0].includes(`76${NB}%`));\nassert(r.conseils[3].includes(`à partir de 4${NB}843 unités`));\nassert(r.conseils[4].includes(`177${NB}120${NB}€`));\nassert(r.conseils[5].startsWith(\"QuoteBuilder ne suit ni les volumes cumulés\"));\nassert(r.conseils[5].includes(\"prix unitaire multiplié par la quantité\"));\nassert.strictEqual(r.grille.length, 4);\nassert.deepStrictEqual(r.grille.map((g) => g.montant), [182400, 176928, 173280, 220800]);\nassert.deepStrictEqual(r.grille.map((g) => g.atteint), [false, false, true, false]);\nconst lignes = r.recap.split(\"\\n\");\nassert.strictEqual(lignes.length, 12);\nassert.strictEqual(lignes[0], \"Remise sur volume d'un contrat-cadre, bilan provisoire au 29/10/2026\");\nassert.strictEqual(lignes[8], `Rappel de prix à facturer : 5${NB}472${NB}€ HT`);\nassert.strictEqual(lignes[lignes.length - 1], \"Calcul : quotebuilder.co/outils/calculateur-remise-volume-contrat-cadre\");\nassert.strictEqual(buildRecap(DEFAULTS), r.recap);\n\n// Sans clause de rappel : perte\nconst p = run({ rappel: \"non\" });\nassert.strictEqual(p.typeEcart, \"perte\");\nassert.strictEqual(p.perte, 5472);\nassert.strictEqual(p.montantRappel, 0);\nassert.strictEqual(p.etat, \"bad\");\nassert(p.recap.includes(\"Remise accordée sans clause de rappel\"));\n\n// Volume supérieur : avoir\nconst a = run({ volRealise: 5200, remiseAppliquee: 5 });\nassert.strictEqual(a.du, 229632, \"5200 × 48 × 0,92\");\nassert.strictEqual(a.facture, 237120);\nassert.strictEqual(a.typeEcart, \"avoir\");\nassert.strictEqual(a.montantAvoir, 7488);\nassert.strictEqual(a.etat, \"neutral\");\nassert.strictEqual(a.prochain, null);\nassert.strictEqual(a.manque, 0);\nassert(a.conseils[1].includes(\"article 267 du CGI\"));\nassert(a.conseils[3].includes(\"dernier palier\"));\n\n// Concordance\nconst c = run({ remiseAppliquee: 5 });\nassert.strictEqual(c.typeEcart, \"aucun\");\nassert.strictEqual(c.ecart, 0);\nassert.strictEqual(c.etat, \"ok\");\nassert(c.recap.includes(\"Ni rappel ni avoir\"));\n\n// Pénalité\nconst pe = run({ penalite: 10 });\nassert.strictEqual(pe.penalite, 5760, \"1200 × 48 × 10 %\");\nassert(pe.conseils[2].includes(\"1231-5\"));\n\n// Mode par tranche\nconst t = run({ mode: \"tranche\" });\nassert.strictEqual(t.du, 177120);\nassert.strictEqual(t.duAutreMode, 173280);\nassert.strictEqual(t.ecart, 9312);\nassert.strictEqual(t.prochain.debutZoneSeuil, undefined, \"pas d'effet de seuil en tranche\");\nassert.strictEqual(t.prochain.montantAuSeuil, 48000 + 69840 + 114000);\nassert.strictEqual(t.prixMoyen, 46.61);\n\n// Zone de seuil franchie en global\nconst z = run({ volRealise: 4900 });\nassert.strictEqual(z.prochain.dansZoneSeuil, true);\nassert(z.conseils[3].includes(\"paierait moins cher\"));\n\n// Sans engagement, sans paliers, période terminée, entrées invalides\nconst s = run({ volEngage: 0 });\nassert.strictEqual(s.atteinte, null);\nassert.strictEqual(s.manque, 0);\nassert(s.conseils[0].startsWith(\"Aucun volume engagé\"));\nconst np = run({ s1: 0, s2: 0, s3: 0, s4: 0, remiseAppliquee: 0 });\nassert.strictEqual(np.du, 182400);\nassert.strictEqual(np.typeEcart, \"aucun\");\nassert.strictEqual(np.palierLabel, \"Aucun palier (prix de base)\");\nassert(np.conseils[3].startsWith(\"Aucun palier saisi\"));\nconst fin = run({ dateCalcul: \"2027-01-15\" });\nassert.strictEqual(fin.periodeTerminee, true);\nassert.strictEqual(fin.projection, 3800);\nassert(fin.recap.startsWith(\"Remise sur volume d'un contrat-cadre, bilan de fin de période\"));\nassert(!fin.verdict.includes(\"provisoire\"));\nconst bad = run({ dateDebut: \"n/a\", mode: \"autre\", rappel: \"peut-être\", prixBase: \"abc\" });\nassert.strictEqual(bad.projection, null);\nassert.strictEqual(bad.mode, \"global\");\nassert.strictEqual(bad.prix, 48);\nassert.strictEqual(bad.du, 173280);\nconst zero = run({ volRealise: 0 });\nassert.strictEqual(zero.prixMoyen, null);\nassert.strictEqual(zero.du, 0);\nassert.strictEqual(zero.remiseEffective, 0);\nfor (const o of [r, p, a, c, pe, t, z, s, np, fin, bad, zero]) {\n  assert(!/[\\u2013\\u2014]/.test(o.recap + o.verdict + o.conseils.join(\"\")), \"pas de tiret long en sortie\");\n  assert(!/NaN|undefined/.test(o.recap + o.verdict + o.conseils.join(\"\")), \"pas de NaN en sortie\");\n}\n\n\n\n")(tool, require, console);
console.log("seo-am-20261029 ok");
