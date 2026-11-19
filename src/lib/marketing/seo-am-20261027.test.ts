import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_RETRACTATION, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./calculateur-delai-retractation-hors-etablissement";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";
import { scoreQuote } from "../quotes/score";

const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "retractation-hors-etablissement-tpe-devis-b2b";
const BLOG_PATH = "/blog/retractation-hors-etablissement-tpe-devis-b2b";
const TOOL_PATH = "/outils/calculateur-delai-retractation-hors-etablissement";
const DAY = "2026-10-27";
const DAY_PATHS = ["/blog/retractation-hors-etablissement-tpe-devis-b2b", "/secteurs/funnel-devis-alarme-videosurveillance-entreprise", "/outils/calculateur-delai-retractation-hors-etablissement"];

assert.equal(BLOG_TOOL_RETRACTATION, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisDetail);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 23);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Calculateur de délai de rétractation hors établissement");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Les trois conditions de L221-3, la fin du délai de quatorze jours, reportée si besoin, et les sept jours sans paiement.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-alarme-videosurveillance-entreprise")?.priority, 0.8);

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
assert.ok(outilsHub.includes("calculateur-delai-retractation-hors-etablissement"));
assert.ok(outilsHub.includes("Calculateur de délai de rétractation hors établissement"));
{
  const start = outilsHub.indexOf("href: \"/outils/calculateur-delai-retractation-hors-etablissement\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-alarme-videosurveillance-entreprise"));
assert.ok(secteursHub.includes("Alarme et vidéosurveillance"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 5192);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-alarme-videosurveillance-entreprise.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-alarme-videosurveillance-entreprise/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 4942);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Alarme et vidéosurveillance"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/calculateur-delai-retractation-hors-etablissement.ts","src/components/marketing/calculateur-delai-retractation-hors-etablissement-calculator.tsx","src/app/(marketing)/outils/calculateur-delai-retractation-hors-etablissement/page.tsx","src/content/blog/retractation-hors-etablissement-tpe-devis-b2b.md","src/content/blog/funnel-devis-alarme-videosurveillance-entreprise.md","src/app/(marketing)/secteurs/funnel-devis-alarme-videosurveillance-entreprise/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


const fitout = readFileSync(join(process.cwd(), "src/lib/funnels/templates.ts"), "utf8");
assert.match(fitout, /id: "fitout"/);
assert.match(fitout, /Aménagement industriel/);
assert.deepEqual(scoreQuote({ site: "office", constraints: ["access"] }), { score: 35, label: "cold" });

new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst { LIEUX, EFFECTIFS, OBJETS, TYPES, INFOS, EXCEPTIONS, DEFAULTS, computeRetractation, buildRecap, parseDate, addDays, addMonths, paques, joursFeries, proroger, fmtDate, fmtJour, fmtEur, fmtHt, iso } = __mod;\nconst NB = \"\\u00a0\";\nconst run = (o) => computeRetractation({ ...DEFAULTS, ...o });\n\n// Fichier\n\n\n\n\nassert.deepStrictEqual(LIEUX, [\"hors\", \"apres_sollicitation\", \"distance\", \"locaux\"]);\nassert.deepStrictEqual(EFFECTIFS, [\"0_5\", \"plus_5\", \"inconnu\"]);\nassert.deepStrictEqual(OBJETS, [\"hors_activite\", \"activite\", \"doute\"]);\nassert.deepStrictEqual(TYPES, [\"service\", \"vente\"]);\nassert.deepStrictEqual(INFOS, [\"oui\", \"non\", \"tard\"]);\nassert.deepStrictEqual(EXCEPTIONS, [\"aucune\", \"sur_mesure\"]);\nassert.deepStrictEqual(DEFAULTS, { lieu: \"hors\", effectif: \"0_5\", objet: \"hors_activite\", type: \"service\", exception: \"aucune\", conclusion: \"2026-10-28\", reception: \"\", info: \"oui\", dateInfo: \"\", montant: 1200, paiementMontant: 0, paiementDate: \"\", execution: \"non\", pct: 0 });\n\n// Formats et dates\nassert.strictEqual(fmtEur(1200), `1${NB}200${NB}€`);\nassert.strictEqual(fmtEur(360.5), `360,50${NB}€`);\nassert.strictEqual(fmtHt(4800), `4${NB}800${NB}€ HT`);\nassert.strictEqual(fmtDate(parseDate(\"2026-11-05\")), \"05/11/2026\");\nassert.strictEqual(fmtJour(parseDate(\"2026-11-12\")), \"jeudi 12/11/2026\");\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.strictEqual(iso(addDays(parseDate(\"2026-12-25\"), 14)), \"2027-01-08\");\nassert.strictEqual(iso(addMonths(parseDate(\"2027-01-31\"), 1)), \"2027-02-28\");\nassert.strictEqual(iso(addMonths(parseDate(\"2026-12-04\"), 12)), \"2027-12-04\");\nassert.strictEqual(iso(paques(2026)), \"2026-04-05\");\nassert.strictEqual(iso(paques(2027)), \"2027-03-28\");\nassert.strictEqual(iso(paques(2024)), \"2024-03-31\");\nconst f27 = joursFeries(2027);\nassert.strictEqual(Object.keys(f27).length, 11);\nassert.strictEqual(f27[\"2027-03-29\"], \"Lundi de Pâques\");\nassert.strictEqual(f27[\"2027-05-06\"], \"Ascension\");\nassert.strictEqual(f27[\"2027-05-17\"], \"Lundi de Pentecôte\");\nassert.strictEqual(joursFeries(2026)[\"2026-05-14\"], \"Ascension\");\nassert.strictEqual(joursFeries(2026)[\"2026-11-11\"], \"Armistice 1918\");\nlet p = proroger(parseDate(\"2026-11-11\"));\nassert(p.prorogee); assert.strictEqual(iso(p.date), \"2026-11-12\"); assert.strictEqual(p.raison, \"un jour férié, Armistice 1918\");\np = proroger(parseDate(\"2027-12-04\"));\nassert.strictEqual(iso(p.date), \"2027-12-06\"); assert.strictEqual(p.raison, \"un samedi\");\np = proroger(parseDate(\"2026-12-27\"));\nassert.strictEqual(iso(p.date), \"2026-12-28\"); assert.strictEqual(p.raison, \"un dimanche\");\np = proroger(parseDate(\"2027-05-01\"));\nassert.strictEqual(iso(p.date), \"2027-05-03\"); assert.strictEqual(p.raison, \"un jour férié, Fête du travail\");\np = proroger(parseDate(\"2026-12-04\"));\nassert(!p.prorogee); assert.strictEqual(iso(p.date), \"2026-12-04\");\n\n// Défaut : service signé le 28/10/2026, fin le 11/11 férié, report au 12/11\nlet r = run({});\nassert.strictEqual(r.statut, \"oui\");\nassert.strictEqual(r.applicable, true);\nassert.strictEqual(r.debut, \"2026-10-28\");\nassert.strictEqual(r.finBrute, \"2026-11-11\");\nassert.strictEqual(r.finInitiale, \"2026-11-12\");\nassert.strictEqual(r.prorogee, true);\nassert.strictEqual(r.fin, \"2026-11-12\");\nassert.strictEqual(r.finProlongee, \"2027-11-12\");\nassert.strictEqual(r.mode, \"initial\");\nassert.strictEqual(r.dureeJours, 15);\nassert.strictEqual(r.finSept, \"2026-11-04\");\nassert.strictEqual(r.paiementDes, \"2026-11-05\");\nassert.strictEqual(r.du, 0);\nassert.strictEqual(r.solde, 0);\nassert.strictEqual(r.etat, \"ok\");\nassert(r.verdict.includes(\"jusqu'au jeudi 12/11/2026 inclus\"));\nassert(r.verdict.includes(\"le 11/11/2026 tombe un jour férié, Armistice 1918\"));\nassert.strictEqual(r.calendrier.length, 4);\nassert.deepStrictEqual(r.calendrier.map((l) => l.date), [\"2026-10-28\", \"2026-11-04\", \"2026-11-05\", \"2026-11-12\"]);\nassert.strictEqual(r.conseils.length, 6);\nassert(r.conseils[5].includes(\"document indicatif, non contractuel\"));\nconst recap = buildRecap(DEFAULTS).split(\"\\n\");\nassert.strictEqual(recap.length, 9);\nassert.strictEqual(recap[1], \"Conditions de l'article L221-3 : Réunies\");\nassert.strictEqual(recap[3], \"Début du délai : 28/10/2026 (jour non compté)\");\nassert.strictEqual(recap[6], \"Aucun paiement jusqu'au 04/11/2026, premier encaissement possible le 05/11/2026\");\nassert.strictEqual(recap[8], \"Calcul : quotebuilder.co/outils/calculateur-delai-retractation-hors-etablissement\");\n\n// Acompte encaissé à la signature\nr = run({ paiementMontant: 360, paiementDate: \"2026-10-28\" });\nassert.strictEqual(r.paiementTrop, true); assert.strictEqual(r.etat, \"bad\"); assert.strictEqual(r.solde, 360);\nassert(r.verdict.includes(\"Encaissement trop tôt\"));\nr = run({ paiementMontant: 360, paiementDate: \"2026-11-04\" });\nassert.strictEqual(r.etat, \"bad\");\nr = run({ paiementMontant: 360, paiementDate: \"2026-11-05\" });\nassert.strictEqual(r.paiementTrop, false); assert.strictEqual(r.etat, \"ok\");\n\n// Service commencé à la demande écrite du client\nr = run({ execution: \"oui\", pct: 25, paiementMontant: 600, paiementDate: \"2026-11-05\" });\nassert.strictEqual(r.du, 300); assert.strictEqual(r.solde, 300);\nr = run({ execution: \"non\", pct: 25, paiementMontant: 600, paiementDate: \"2026-11-05\" });\nassert.strictEqual(r.du, 0); assert.strictEqual(r.solde, 600);\nr = run({ execution: \"oui\", pct: 150 });\nassert.strictEqual(r.pct, 100); assert.strictEqual(r.du, 1200);\n\n// Vente : le délai part de la réception\nr = run({ type: \"vente\", montant: 4800, reception: \"2026-11-20\" });\nassert.strictEqual(r.debut, \"2026-11-20\"); assert.strictEqual(r.finInitiale, \"2026-12-04\"); assert.strictEqual(r.prorogee, false);\nassert.strictEqual(r.dureeJours, 37); assert.strictEqual(r.du, null); assert.strictEqual(r.etat, \"ok\");\nassert.strictEqual(r.calendrier.length, 5);\nr = run({ type: \"vente\", montant: 4800, reception: \"2026-11-20\", info: \"non\" });\nassert.strictEqual(r.mode, \"prolonge\"); assert.strictEqual(r.fin, \"2027-12-06\"); assert.strictEqual(r.etat, \"warn\");\nassert(r.verdict.includes(\"le 04/12/2027 tombe un samedi\"));\nr = run({ type: \"vente\", montant: 4800, reception: \"2026-11-20\", info: \"tard\", dateInfo: \"2027-01-15\" });\nassert.strictEqual(r.mode, \"info_tardive\"); assert.strictEqual(r.fin, \"2027-01-29\"); assert.strictEqual(r.dureeJours, 93); assert.strictEqual(r.etat, \"warn\");\nr = run({ type: \"vente\", montant: 4800, reception: \"2026-11-20\", info: \"tard\", dateInfo: \"2028-01-10\" });\nassert.strictEqual(r.mode, \"prolonge\"); assert.strictEqual(r.fin, \"2027-12-06\");\nr = run({ type: \"vente\", montant: 4800, reception: \"2026-11-20\", info: \"tard\", dateInfo: \"\" });\nassert.strictEqual(r.mode, \"prolonge\");\nr = run({ type: \"vente\", montant: 4800 });\nassert.strictEqual(r.debut, null); assert.strictEqual(r.fin, null); assert.strictEqual(r.etat, \"warn\");\nassert(r.verdict.includes(\"réception du bien\"));\nr = run({ type: \"vente\", reception: \"2026-10-20\" });\nassert.strictEqual(r.debut, \"2026-10-28\");\n\n// Information donnée deux jours après la signature\nr = run({ info: \"tard\", dateInfo: \"2026-10-30\" });\nassert.strictEqual(r.fin, \"2026-11-13\"); assert.strictEqual(r.mode, \"info_tardive\");\nr = run({ info: \"tard\", dateInfo: \"2026-10-28\" });\nassert.strictEqual(r.mode, \"initial\"); assert.strictEqual(r.fin, \"2026-11-12\");\n\n// Exception et conditions\nr = run({ type: \"vente\", reception: \"2026-11-20\", exception: \"sur_mesure\" });\nassert.strictEqual(r.etat, \"warn\"); assert(r.verdict.includes(\"L221-28, 3°\"));\nr = run({ objet: \"doute\" });\nassert.strictEqual(r.statut, \"a_verifier\"); assert.strictEqual(r.etat, \"warn\"); assert.strictEqual(r.fin, \"2026-11-12\");\nr = run({ effectif: \"inconnu\" });\nassert.strictEqual(r.statut, \"a_verifier\");\nr = run({ lieu: \"apres_sollicitation\" });\nassert.strictEqual(r.statut, \"oui\");\nfor (const o of [{ effectif: \"plus_5\" }, { objet: \"activite\" }, { lieu: \"distance\" }, { lieu: \"locaux\" }]) {\n  r = run(o);\n  assert.strictEqual(r.statut, \"non\"); assert.strictEqual(r.applicable, false); assert.strictEqual(r.fin, null); assert.strictEqual(r.etat, \"neutral\");\n  assert.strictEqual(r.motifs.length, 1);\n  assert(r.recap.includes(\"Délai de sept jours sans paiement : sans objet\"));\n}\nr = run({ lieu: \"distance\", effectif: \"plus_5\", paiementMontant: 360, paiementDate: \"2026-10-28\" });\nassert.strictEqual(r.motifs.length, 2); assert.strictEqual(r.paiementTrop, false); assert.strictEqual(r.etat, \"neutral\");\n\n// Saisies invalides\nr = run({ conclusion: \"\" });\nassert.strictEqual(r.valide, false); assert.strictEqual(r.etat, \"neutral\"); assert.strictEqual(r.calendrier.length, 0);\nr = run({ lieu: \"x\", type: \"y\", info: \"z\", montant: -5 });\nassert.strictEqual(r.lieu, \"hors\"); assert.strictEqual(r.type, \"service\"); assert.strictEqual(r.info, \"oui\"); assert.strictEqual(r.montant, 0);\n\n\n\n")(tool, require, console);
console.log("seo-am-20261027 ok");
