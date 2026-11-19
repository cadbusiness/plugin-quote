import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_FORFAIT_REGIE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./comparateur-forfait-regie-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "forfait-regie-temps-passe-devis-b2b";
const BLOG_PATH = "/blog/forfait-regie-temps-passe-devis-b2b";
const TOOL_PATH = "/outils/comparateur-forfait-regie-devis";
const DAY = "2026-11-16";
const DAY_PATHS = ["/blog/forfait-regie-temps-passe-devis-b2b", "/secteurs/funnel-devis-maintenance-industrielle-contrat", "/outils/comparateur-forfait-regie-devis"];

assert.equal(BLOG_TOOL_FORFAIT_REGIE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 41);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Comparateur forfait ou régie");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "forfait, régie, régie plafonnée ou forfait par phase : prix, marge, point mort, dix points contrôlés, la clause et le message.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-maintenance-industrielle-contrat")?.priority, 0.8);

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
assert.ok(outilsHub.includes("comparateur-forfait-regie-devis"));
assert.ok(outilsHub.includes("Comparateur forfait ou régie"));
{
  const start = outilsHub.indexOf("href: \"/outils/comparateur-forfait-regie-devis\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-maintenance-industrielle-contrat"));
assert.ok(secteursHub.includes("Maintenance industrielle et contrats"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 8263);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-maintenance-industrielle-contrat.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-maintenance-industrielle-contrat/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 7034);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Maintenance industrielle et contrats"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/comparateur-forfait-regie-devis.ts","src/components/marketing/comparateur-forfait-regie-devis-calculator.tsx","src/app/(marketing)/outils/comparateur-forfait-regie-devis/page.tsx","src/content/blog/forfait-regie-temps-passe-devis-b2b.md","src/content/blog/funnel-devis-maintenance-industrielle-contrat.md","src/app/(marketing)/secteurs/funnel-devis-maintenance-industrielle-contrat/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, POINTS, computeForfaitRegie, buildRecap, fmtEur, fmtInt, fmtH, fmtTaux, fmtPct, num, dec } = X;\nconst run = (o) => computeForfaitRegie({ ...DEFAULTS, ...o });\nconst S = (r, point) => r.controles.find((c) => c.point === point).statut;\n\n// Statique\nconst numIds = [\"hBasse\", \"hProbable\", \"hHaute\", \"taux\", \"coutRevient\", \"changements\", \"hParChangement\", \"reserve\", \"plafondPct\"];\nconst selIds = [\"role\", \"modele\", \"perimetre\", \"inconnues\", \"avenant\", \"suivi\"];\nconst labelMap = { role: \"ROLE_LABELS\", modele: \"MODELE_LABELS\", perimetre: \"PERIMETRE_LABELS\", inconnues: \"INCONNUES_LABELS\", avenant: \"AVENANT_LABELS\", suivi: \"SUIVI_LABELS\" };\nassert.strictEqual(Object.keys(DEFAULTS).length, 15);\nassert.strictEqual(numIds.length + selIds.length, 15);\nassert.strictEqual(POINTS.length, 10);\n\n\n\n\n\n\n// Formats\nassert.strictEqual(fmtInt(1234567), \"1 234 567\");\nassert.strictEqual(fmtInt(-1040), \"\\u22121 040\");\nassert.strictEqual(fmtInt(0), \"0\");\nassert.strictEqual(fmtEur(7820), \"7 820 €\");\nassert.strictEqual(fmtH(80), \"80 h\");\nassert.strictEqual(fmtTaux(85), \"85 €\");\nassert.strictEqual(fmtTaux(85.5), \"85,50 €\");\nassert.strictEqual(fmtTaux(85.25), \"85,25 €\");\nassert.strictEqual(fmtPct(0.5), \"50 %\");\nassert.strictEqual(num(\"1 200\", 0, 5000, 7), 1200);\nassert.strictEqual(num(\"1\\u00a0200\", 0, 5000, 7), 1200);\nassert.strictEqual(num(\"abc\", 0, 5000, 7), 7);\nassert.strictEqual(num(\"-5\", 0, 5000, 7), 0);\nassert.strictEqual(num(\"99999\", 0, 5000, 7), 5000);\nassert.strictEqual(dec(\"85,5\", 0, 1000, 1), 85.5);\nassert.strictEqual(dec(\"\", 0, 1000, 1), 1);\n\n// Valeurs de référence (défauts)\nconst d = run({});\nassert.strictEqual(d.regieProbable, 6800);\nassert.strictEqual(d.regieBasse, 5100);\nassert.strictEqual(d.regieHaute, 8500);\nassert.strictEqual(d.forfait, 7820);\nassert.strictEqual(d.plafond, 8160);\nassert.strictEqual(d.margeProbable, 3660);\nassert.strictEqual(d.margeHaute, 2620);\nassert.strictEqual(d.pointMort, 150);\nassert.strictEqual(d.heuresChg, 20);\nassert.strictEqual(d.perteChg, 1040);\nassert.strictEqual(d.factureChg, 1700);\nassert.strictEqual(d.score, 3);\nassert.strictEqual(d.conseil, \"phases\");\nassert.deepStrictEqual(d.controles.map((c) => c.statut), [\"ok\", \"warn\", \"warn\", \"info\", \"warn\", \"warn\", \"ok\", \"warn\", \"info\", \"info\"]);\nassert.strictEqual([d.nbOk, d.nbWarn, d.nbBad, d.nbInfo].join(\",\"), \"2,5,0,3\");\nassert.strictEqual(d.etat, \"warn\");\nassert.strictEqual(d.verdict, \"Aucun point bloquant, 5 à compléter. Mode choisi : forfait. Mode suggéré par vos réponses : forfait par phase, puis régie.\");\nassert.strictEqual(d.fourchetteLabel, \"5 100 € à 8 500 €\");\nassert.strictEqual(d.margeLabel, \"3 660 € puis 2 620 €\");\nassert.strictEqual(d.changementLabel, \"1 040 € (20 h)\");\nassert.strictEqual(d.recap.split(\"\\n\").length, 11);\nassert.strictEqual(buildRecap(d), d.recap);\n\n// Cas ciblés\nassert.strictEqual(S(run({ perimetre: \"flou\", modele: \"forfait\" }), \"Périmètre\"), \"bad\");\nassert.strictEqual(S(run({ perimetre: \"flou\", modele: \"regie\" }), \"Périmètre\"), \"warn\");\nassert.strictEqual(S(run({ perimetre: \"ferme\" }), \"Périmètre\"), \"ok\");\nassert.strictEqual(S(run({ inconnues: \"nombreuses\", modele: \"forfait\" }), \"Inconnues\"), \"bad\");\nassert.strictEqual(S(run({ inconnues: \"nombreuses\", modele: \"plafond\" }), \"Inconnues\"), \"warn\");\nassert.strictEqual(S(run({ perimetre: \"ferme\", inconnues: \"aucune\", hBasse: 78, hHaute: 84, modele: \"forfait\" }), \"Mode choisi\"), \"ok\");\nassert.strictEqual(run({ perimetre: \"ferme\", inconnues: \"aucune\", hBasse: 78, hHaute: 84 }).conseil, \"forfait\");\nassert.strictEqual(S(run({ perimetre: \"flou\", inconnues: \"nombreuses\", modele: \"forfait\" }), \"Mode choisi\"), \"bad\");\nassert.strictEqual(run({ perimetre: \"flou\", inconnues: \"nombreuses\" }).conseil, \"plafond\");\nassert.strictEqual(S(run({ perimetre: \"flou\", inconnues: \"nombreuses\", modele: \"plafond\" }), \"Mode choisi\"), \"ok\");\nassert.strictEqual(S(run({ perimetre: \"ferme\", inconnues: \"aucune\", hBasse: 78, hHaute: 84, modele: \"regie\" }), \"Mode choisi\"), \"warn\");\nassert.strictEqual(S(run({ hBasse: 100, hProbable: 80, hHaute: 60 }), \"Cohérence des estimations\"), \"warn\");\nassert.strictEqual(run({ hBasse: 100, hProbable: 80, hHaute: 60 }).hBasse, 60);\nassert.strictEqual(S(run({ hProbable: 0, hBasse: 0, hHaute: 0 }), \"Cohérence des estimations\"), \"warn\");\nassert.strictEqual(S(run({ coutRevient: 120 }), \"Marge du forfait\"), \"bad\");\nassert.strictEqual(S(run({ coutRevient: 120, modele: \"regie\" }), \"Marge du forfait\"), \"info\");\nassert.strictEqual(S(run({ coutRevient: 0 }), \"Marge du forfait\"), \"info\");\nassert.strictEqual(run({ coutRevient: 0 }).pointMort, null);\nassert.strictEqual(run({ coutRevient: 0 }).pointMortLabel, \"Non calculable\");\nassert.strictEqual(S(run({ avenant: \"aucun\", modele: \"forfait\" }), \"Changements de périmètre\"), \"bad\");\nassert.strictEqual(S(run({ avenant: \"oral\", modele: \"forfait\" }), \"Changements de périmètre\"), \"warn\");\nassert.strictEqual(S(run({ avenant: \"ecrit\" }), \"Changements de périmètre\"), \"ok\");\nassert.strictEqual(S(run({ changements: 0 }), \"Changements de périmètre\"), \"info\");\nassert.strictEqual(S(run({ modele: \"regie\", suivi: \"aucun\" }), \"Suivi des heures\"), \"bad\");\nassert.strictEqual(S(run({ modele: \"regie\", suivi: \"releve\" }), \"Suivi des heures\"), \"ok\");\nassert.strictEqual(S(run({ modele: \"forfait\", suivi: \"aucun\" }), \"Suivi des heures\"), \"warn\");\nassert.strictEqual(S(run({ modele: \"plafond\", plafondPct: 5 }), \"Plafond de la régie\"), \"warn\");\nassert.strictEqual(S(run({ modele: \"plafond\", plafondPct: 30 }), \"Plafond de la régie\"), \"ok\");\nassert.strictEqual(S(run({ modele: \"phases\" }), \"Plafond de la régie\"), \"info\");\nassert.strictEqual(S(run({ modele: \"forfait\", reserve: 30 }), \"Réserve de risque\"), \"ok\");\nassert.strictEqual(S(run({ modele: \"regie\", reserve: 0 }), \"Réserve de risque\"), \"info\");\nassert(run({ modele: \"regie\" }).clause.startsWith(\"Article [X] : Prestation en régie\"));\nassert(run({ modele: \"plafond\" }).clause.includes(\"8 160 €\"));\nassert(run({ modele: \"phases\" }).clause.startsWith(\"Article [X] : Forfait par phase\"));\nassert(run({ role: \"client\" }).message.includes(\"relevé d'heures ou un plafond\"));\nassert(run({ role: \"prestataire\" }).message.includes(\"7 820 €\"));\nassert(run({ role: \"client\" }).actions.slice(-1)[0].startsWith(\"Comparez les offres\"));\n\n// Entrées étranges\nfor (const bad of [undefined, null, {}, { hProbable: \"abc\" }, { taux: -5 }, { role: \"x\", modele: \"y\", perimetre: \"z\" }, { hProbable: \"1 000 000 000\" }, { reserve: \"500\" }, { changements: \"99\" }]) {\n  const r = computeForfaitRegie(bad);\n  const t = [r.clause, r.message, r.recap, r.verdict].concat(r.controles.map((c) => c.texte), r.actions).join(\"\\n\");\n  assert(!/NaN|undefined|\\bnull\\b|\\[object|Infinity/.test(t), \"entrée étrange \" + JSON.stringify(bad));\n  assert.strictEqual(r.controles.length, 10);\n}\n\n")(tool, require, console);
console.log("seo-am-20261116 ok");
