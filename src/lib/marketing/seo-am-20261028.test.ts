import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_ECHEANCE_FE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./calculateur-echeance-facturation-electronique";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "facturation-electronique-2026-devis-b2b-tpe-pme";
const BLOG_PATH = "/blog/facturation-electronique-2026-devis-b2b-tpe-pme";
const TOOL_PATH = "/outils/calculateur-echeance-facturation-electronique";
const DAY = "2026-10-28";
const DAY_PATHS = ["/blog/facturation-electronique-2026-devis-b2b-tpe-pme", "/secteurs/funnel-devis-expert-comptable-lettre-de-mission", "/outils/calculateur-echeance-facturation-electronique"];

assert.equal(BLOG_TOOL_ECHEANCE_FE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 20);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Calculateur d'échéance de facturation électronique");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "votre catégorie, vos dates de réception et d'émission, les nouvelles mentions et l'amende théorique, à partir de votre effectif, de votre chiffre d'affaires et de votre bilan.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-expert-comptable-lettre-de-mission")?.priority, 0.8);

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
assert.ok(outilsHub.includes("calculateur-echeance-facturation-electronique"));
assert.ok(outilsHub.includes("Calculateur d'échéance de facturation électronique"));
{
  const start = outilsHub.indexOf("href: \"/outils/calculateur-echeance-facturation-electronique\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-expert-comptable-lettre-de-mission"));
assert.ok(secteursHub.includes("Expert-comptable"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 4029);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-expert-comptable-lettre-de-mission.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-expert-comptable-lettre-de-mission/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 4602);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Expert-comptable"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/calculateur-echeance-facturation-electronique.ts","src/components/marketing/calculateur-echeance-facturation-electronique-calculator.tsx","src/app/(marketing)/outils/calculateur-echeance-facturation-electronique/page.tsx","src/content/blog/facturation-electronique-2026-devis-b2b-tpe-pme.md","src/content/blog/funnel-devis-expert-comptable-lettre-de-mission.md","src/app/(marketing)/secteurs/funnel-devis-expert-comptable-lettre-de-mission/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst X = __mod;\nconst { DEFAULTS, categorie, amendeEmission, computeEcheance, buildRecap, parseDate, iso, diffDays, fmtDate, fmtEur, fmtJours } = X;\nconst NB = \"\\u00a0\";\nconst run = (o) => computeEcheance({ ...DEFAULTS, ...o });\nlet n = 0;\nconst ok = (c, msg) => { assert(c, msg); n++; };\nconst eq = (a, b, msg) => { assert.deepStrictEqual(a, b, msg); n++; };\n\n// Fichier\n\n\n\n\n// Constantes\neq(X.DATE_2026, \"2026-09-01\");\neq(X.DATE_2027, \"2027-09-01\");\neq(X.AMENDE_FACTURE, 50);\neq(X.PLAFOND_AMENDE, 15000);\neq(X.AMENDE_EREPORTING, 500);\neq(X.AMENDE_RECEPTION_1, 500);\neq(X.AMENDE_RECEPTION_2, 1000);\neq(X.SEUILS.micro, { effectif: 10, ca: 2000000, bilan: 2000000 });\neq(X.SEUILS.pme, { effectif: 250, ca: 50000000, bilan: 43000000 });\neq(X.SEUILS.eti, { effectif: 5000, ca: 1500000000, bilan: 2000000000 });\n\n// Catégories\neq(categorie(3, 150000, 80000), \"micro\");\neq(categorie(9, 2000000, 2000000), \"micro\");\neq(categorie(9, 2500000, 1500000), \"micro\", \"un seul seuil financier dépassé\");\neq(categorie(9, 2500000, 2500000), \"pme\", \"deux seuils dépassés\");\neq(categorie(10, 100000, 100000), \"pme\", \"effectif 10\");\neq(categorie(14, 1900000, 1100000), \"pme\");\neq(categorie(249, 50000000, 60000000), \"pme\");\neq(categorie(249, 60000000, 43000000), \"pme\");\neq(categorie(249, 60000000, 50000000), \"eti\");\neq(categorie(250, 1000000, 1000000), \"eti\");\neq(categorie(4999, 2000000000, 2000000000), \"eti\");\neq(categorie(4999, 2000000000, 2100000000), \"ge\");\neq(categorie(5000, 1000000, 1000000), \"ge\");\n\n// Amendes\neq(amendeEmission(35), { brut: 21000, plafonnee: 15000, plafondAtteint: true });\neq(amendeEmission(20), { brut: 12000, plafonnee: 12000, plafondAtteint: false });\neq(amendeEmission(25), { brut: 15000, plafonnee: 15000, plafondAtteint: false });\neq(amendeEmission(0), { brut: 0, plafonnee: 0, plafondAtteint: false });\n\n// Dates utilitaires\neq(iso(parseDate(\"2027-09-01\")), \"2027-09-01\");\neq(parseDate(\"2027-13-01\"), null);\neq(parseDate(\"2027-02-30\"), null);\neq(diffDays(parseDate(\"2026-10-28\"), parseDate(\"2027-09-01\")), 308);\neq(fmtDate(parseDate(\"2026-09-01\")), \"1er septembre 2026\");\neq(fmtDate(parseDate(\"2027-03-15\")), \"15 mars 2027\");\neq(fmtEur(15000), `15${NB}000${NB}€`);\neq(fmtJours(1), \"1 jour\");\neq(fmtJours(308), \"308 jours\");\n\n// Cas par défaut : PME de services, 28 octobre 2026\nconst d = run({});\neq(d.categorie, \"pme\");\neq(iso(d.reception), \"2026-09-01\");\neq(iso(d.emission), \"2027-09-01\");\neq(d.joursEmission, 308);\neq(d.receptionEnVigueur, true);\neq(d.receptionRetard, true);\neq(d.etat, \"warn\");\nok(/démarche n'est pas finie/.test(d.verdict));\neq(d.ereportingPaiement, true);\neq(d.ereportingTransactions, false);\neq(d.ereportingAchats, false);\neq(d.amende.plafonnee, 15000);\neq(d.calendrier.length, 3);\neq(d.calendrier.map((l) => iso(l.date)), [\"2026-09-01\", \"2027-09-01\", \"2027-09-01\"]);\nok(/En vigueur depuis 57 jours/.test(d.calendrier[0].etat), d.calendrier[0].etat);\nok(/À venir dans 308 jours/.test(d.calendrier[1].etat));\neq(d.mentions.length, 5);\nok(d.mentions[0].includes(\"SIREN\"));\nok(d.conseils.some((c) => c.includes(\"21\" + NB + \"000\")));\nok(d.conseils.some((c) => c.includes(\"première infraction\")));\nok(d.conseils.some((c) => c.includes(\"imposer\")));\nok(d.recap.includes(\"Catégorie : PME\"));\nok(d.recap.includes(\"Émission : 1er septembre 2027\"));\neq(buildRecap({}), d.recap);\n\n// Plateforme en place\nconst p = run({ plateforme: \"oui\" });\neq(p.receptionRetard, false);\neq(p.etat, \"ok\");\nok(p.calendrier[0].etat.includes(\"en place\"));\n\n// Rien de fait\nconst r = run({ plateforme: \"non\" });\neq(r.etat, \"bad\");\nok(r.verdict.includes(\"1 000 €\"));\n\n// Avant le 1er septembre 2026\nconst avant = run({ dateCalcul: \"2026-05-01\", plateforme: \"non\" });\neq(avant.receptionEnVigueur, false);\neq(avant.receptionRetard, false);\neq(avant.etat, \"ok\");\nok(/À venir dans 123 jours/.test(avant.calendrier[0].etat));\n\n// Alerte à moins de 300 jours\nconst proche = run({ dateCalcul: \"2027-01-15\", plateforme: \"oui\" });\neq(proche.joursEmission, 229);\neq(proche.etat, \"warn\");\nok(proche.verdict.includes(\"229 jours\"));\n\n// Après l'échéance PME\nconst apres = run({ dateCalcul: \"2027-10-01\", plateforme: \"oui\" });\neq(apres.emissionEnVigueur, true);\neq(apres.etat, \"warn\");\nok(apres.verdict.includes(\"15 000 €\"));\nok(!apres.conseils.some((c) => c.includes(\"imposer\")));\n\n// ETI et grande entreprise\nconst eti = run({ effectif: 600, ca: 120000000, bilan: 90000000, plateforme: \"oui\" });\neq(eti.categorie, \"eti\");\neq(iso(eti.emission), \"2026-09-01\");\neq(eti.emissionEnVigueur, true);\nconst ge = run({ effectif: 8000, plateforme: \"oui\" });\neq(ge.categorie, \"ge\");\neq(iso(ge.emission), \"2026-09-01\");\n\n// Assujetti unique\nconst au = run({ assujettiUnique: \"oui\", effectif: 5, ca: 300000, bilan: 200000, plateforme: \"oui\" });\neq(au.categorie, \"micro\");\neq(iso(au.emission), \"2026-09-01\");\nok(au.conseils.some((c) => c.includes(\"assujetti unique\")));\nok(au.recap.includes(\"membre d'un assujetti unique\"));\n\n// Micro sous 10 personnes mais au-dessus des deux seuils\nconst mp = run({ effectif: 8, ca: 3000000, bilan: 2500000 });\neq(mp.categorie, \"pme\");\nok(mp.conseils.some((c) => c.includes(\"Moins de 10 personnes\")));\n\n// Franchise en base\nconst f = run({ regime: \"franchise\", effectif: 1, ca: 60000, bilan: 20000, facturesMois: 6 });\neq(f.categorie, \"micro\");\neq(iso(f.emission), \"2027-09-01\");\neq(f.ereportingPaiement, false, \"pas de TVA sur encaissements en franchise\");\nok(f.conseils.some((c) => c.includes(\"franchise en base\")));\neq(f.amende.plafonnee, 3600);\n\n// Opérations exonérées\nconst e = run({ regime: \"exonere\", plateforme: \"oui\", achatsEtranger: \"oui\", b2c: \"oui\" });\neq(e.emission, null);\neq(e.joursEmission, null);\neq(e.calendrier.length, 1);\neq(e.amende.plafonnee, 0);\neq(e.etat, \"ok\");\nok(e.verdict.includes(\"exonérées\"));\nok(e.recap.includes(\"pas d'émission électronique\"));\nok(e.mentions[0].includes(\"Pas de nouvelle mention\"));\nconst e2 = run({ regime: \"exonere\", plateforme: \"non\" });\neq(e2.etat, \"bad\");\n\n// E-reporting\nconst b2c = run({ b2c: \"oui\", international: \"oui\", encaissements: \"non\", achatsEtranger: \"oui\" });\neq(b2c.ereportingTransactions, true);\neq(b2c.ereportingPaiement, false);\neq(b2c.ereportingAchats, true);\nok(b2c.calendrier.some((l) => l.obligation.includes(\"particuliers et clients hors de France\")));\nok(b2c.calendrier.some((l) => l.obligation.includes(\"autoliquidés\") && iso(l.date) === \"2027-09-01\"));\nconst b2cOnly = run({ b2c: \"oui\" });\nok(b2cOnly.calendrier.some((l) => l.obligation.includes(\"cumulées par jour\")));\nconst achatsEti = run({ effectif: 600, ca: 120000000, bilan: 90000000, achatsEtranger: \"oui\", plateforme: \"oui\" });\nok(achatsEti.calendrier.some((l) => l.obligation.includes(\"autoliquidés\") && iso(l.date) === \"2027-09-01\"), \"achats 2027 toutes tailles\");\n\n// Entrées invalides\nconst bad = run({ effectif: \"\", ca: \"-5\", bilan: \"abc\", facturesMois: \"\", dateCalcul: \"nope\" });\neq(bad.categorie, \"micro\");\neq(bad.amende.plafonnee, 0);\neq(bad.joursEmission, 308, \"date invalide => date par défaut\");\n\n\n\n")(tool, require, console);
console.log("seo-am-20261028 ok");
