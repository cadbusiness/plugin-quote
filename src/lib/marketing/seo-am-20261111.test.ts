import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_CESSION_CREANCE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-cession-creance-affacturage";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "cession-creance-affacturage-dailly-devis-b2b";
const BLOG_PATH = "/blog/cession-creance-affacturage-dailly-devis-b2b";
const TOOL_PATH = "/outils/verificateur-cession-creance-affacturage";
const DAY = "2026-11-11";
const DAY_PATHS = ["/blog/cession-creance-affacturage-dailly-devis-b2b", "/secteurs/funnel-devis-chambre-froide-froid-commercial", "/outils/verificateur-cession-creance-affacturage"];

assert.equal(BLOG_TOOL_CESSION_CREANCE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 35);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de cession de créance et d'affacturage");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Cession, Dailly ou affacturage : douze points contrôlés, le net versé, le coût ramené à l'année, la clause et la notification au client.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-chambre-froide-froid-commercial")?.priority, 0.8);

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
assert.ok(outilsHub.includes("verificateur-cession-creance-affacturage"));
assert.ok(outilsHub.includes("Vérificateur de cession de créance et d'affacturage"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-cession-creance-affacturage\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-chambre-froide-froid-commercial"));
assert.ok(secteursHub.includes("Chambre froide et froid commercial"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 7105);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-chambre-froide-froid-commercial.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-chambre-froide-froid-commercial/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 5468);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Chambre froide et froid commercial"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/verificateur-cession-creance-affacturage.ts","src/components/marketing/verificateur-cession-creance-affacturage-calculator.tsx","src/app/(marketing)/outils/verificateur-cession-creance-affacturage/page.tsx","src/content/blog/cession-creance-affacturage-dailly-devis-b2b.md","src/content/blog/funnel-devis-chambre-froide-froid-commercial.md","src/app/(marketing)/secteurs/funnel-devis-chambre-froide-froid-commercial/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, POINTS, computeCession, computeFinancement, buildRecap, fmtEur, fmtDate, fmtPct, parseDate, num, dec, daysBetween } = X;\nconst run = (o) => computeCession({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point === point);\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\n\n// Statique\nconst numIds = [\"montant\", \"commission\", \"tauxFinancement\", \"retenueGarantie\", \"fraisFixes\"];\nconst dateIds = [\"dateFacture\", \"dateEcheance\", \"dateCession\"];\nconst selIds = [\"role\", \"mode\", \"recours\", \"execution\", \"clauseIncessibilite\", \"debiteurPro\", \"ecrit\", \"notification\", \"litige\"];\nassert.strictEqual(Object.keys(DEFAULTS).length, 17);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 17);\n\n\nconst labelMap = {\n  role: \"ROLE_LABELS\", mode: \"MODE_LABELS\", recours: \"RECOURS_LABELS\", execution: \"EXECUTION_LABELS\",\n  clauseIncessibilite: \"CLAUSE_LABELS\", debiteurPro: \"DEBITEUR_LABELS\", ecrit: \"ECRIT_LABELS\",\n  notification: \"NOTIF_LABELS\", litige: \"LITIGE_LABELS\"\n};\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.strictEqual(X.REPERE_TAUX, 20);\nassert.strictEqual(X.DELAI_MAX, 60);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\nassert.deepStrictEqual(POINTS, [\"Nature de l'opération\", \"Créance cédée\", \"Écrit\", \"Clause d'incessibilité\", \"Information du client\", \"Exceptions du client\", \"Délai de paiement\", \"Durée financée\", \"Coût du financement\", \"Retenue de garantie\", \"Risque d'impayé\", \"Paiement libératoire\"]);\n\n// Helpers\nassert.strictEqual(fmtEur(15904), \"15 904 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtEur(1234567), \"1 234 567 €\");\nassert.strictEqual(fmtEur(-296), \"\\u2212296 €\");\nassert.strictEqual(fmtPct(1.6444), \"1,6\");\nassert.strictEqual(fmtPct(11.909), \"11,9\");\nassert.strictEqual(fmtPct(20), \"20\");\nassert.strictEqual(fmtPct(0.04), \"0\");\nassert.strictEqual(fmtDate({ y: 2026, m: 11, d: 12 }), \"12 novembre 2026\");\nassert.strictEqual(fmtDate({ y: 2027, m: 1, d: 1 }), \"1er janvier 2027\");\nassert.deepStrictEqual(parseDate(\"2027-01-11\"), { y: 2027, m: 1, d: 11 });\nassert.strictEqual(parseDate(\"2027-02-29\"), null);\nassert.strictEqual(parseDate(\"11/01/2027\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.strictEqual(parseDate(undefined), null);\nassert.strictEqual(daysBetween({ y: 2026, m: 11, d: 12 }, { y: 2027, m: 1, d: 11 }), 60);\nassert.strictEqual(daysBetween({ y: 2026, m: 11, d: 16 }, { y: 2027, m: 1, d: 11 }), 56);\nassert.strictEqual(daysBetween({ y: 2027, m: 3, d: 27 }, { y: 2027, m: 3, d: 29 }), 2);\nassert.strictEqual(num(\"18 000\", 0, 1e9, 0), 18000);\nassert.strictEqual(num(\"18\\u00a0000\", 0, 1e9, 0), 18000);\nassert.strictEqual(num(\"abc\", 0, 1e9, 7), 7);\nassert.strictEqual(num(\"-5\", 0, 1e9, 0), 0);\nassert.strictEqual(dec(\"0,8\", 0, 20, 0), 0.8);\nassert.strictEqual(dec(\"5.555\", 0, 50, 0), 5.56);\nassert.strictEqual(dec(\"99\", 0, 50, 0), 50);\nassert.strictEqual(dec(\"x\", 0, 50, 3), 3);\n\n// Financement\nconst f0 = computeFinancement(18000, 0.8, 5.5, 10, 15, 56);\nassert.deepStrictEqual(f0, { finance: 16200, commissionEur: 144, agios: 137, frais: 15, cout: 296, net: 15904, retenueEur: 1800, coutPct: 296 / 18000 * 100, tauxAnnuel: 296 / 16200 * 365 / 56 * 100 });\nconst f1 = computeFinancement(0, 0.8, 5.5, 10, 15, 56);\nassert.strictEqual(f1.cout, 0); assert.strictEqual(f1.net, 0); assert.strictEqual(f1.tauxAnnuel, null);\nconst f2 = computeFinancement(10000, 0, 12, 0, 0, 365);\nassert.strictEqual(f2.agios, 1200); assert.strictEqual(f2.net, 8800); assert.strictEqual(Math.round(f2.tauxAnnuel * 10) / 10, 12);\nconst f3 = computeFinancement(1000, 20, 50, 100, 500, 30);\nassert.strictEqual(f3.finance, 0); assert.strictEqual(f3.net, 0); assert.strictEqual(f3.tauxAnnuel, null); assert.strictEqual(f3.retenueEur, 1000);\nconst f4 = computeFinancement(5000, 1, 6, 10, 0, 0);\nassert.strictEqual(f4.agios, 0); assert.strictEqual(f4.tauxAnnuel, null);\n\n// Défauts (hypothèses d'exemple)\nconst d = run({});\nassert.strictEqual(d.controles.length, 12);\nassert.deepStrictEqual(d.controles.map((c) => c.point), POINTS);\nassert.deepStrictEqual(d.controles.map((c) => c.statut), [\"info\", \"ok\", \"ok\", \"info\", \"warn\", \"warn\", \"ok\", \"info\", \"info\", \"info\", \"info\", \"info\"]);\nassert.strictEqual(d.nbOk, 3); assert.strictEqual(d.nbWarn, 2); assert.strictEqual(d.nbBad, 0); assert.strictEqual(d.nbInfo, 7);\nassert.strictEqual(d.etat, \"warn\");\nassert.strictEqual(d.delaiPaiement, 60);\nassert.strictEqual(d.jours, 56);\nassert.strictEqual(d.finance, 16200);\nassert.strictEqual(d.commissionEur, 144);\nassert.strictEqual(d.agios, 137);\nassert.strictEqual(d.cout, 296);\nassert.strictEqual(d.net, 15904);\nassert.strictEqual(d.retenueEur, 1800);\nassert.strictEqual(d.coutLabel, \"296 € (1,6 %)\");\nassert.strictEqual(d.tauxLabel, \"11,9 % par an\");\nassert.strictEqual(d.joursLabel, \"56 jours\");\nassert.strictEqual(d.verdict, \"Aucun point bloquant, 2 à compléter. Net versé à la cession environ 15 904 € sur une facture de 18 000 €, coût 296 € (1,6 %).\");\nassert(T(d, \"Nature de l'opération\").includes(\"1346-1\"));\nassert(T(d, \"Clause d'incessibilité\").includes(\"L442-3 c)\"));\nassert(T(d, \"Information du client\").includes(\"1346-5\"));\nassert(T(d, \"Exceptions du client\").includes(\"compensation des dettes connexes\"));\nassert(T(d, \"Délai de paiement\").includes(\"60 jours\") && T(d, \"Délai de paiement\").includes(\"L441-10\"));\nassert(T(d, \"Durée financée\").includes(\"16 novembre 2026\") && T(d, \"Durée financée\").includes(\"11 janvier 2027\"));\nassert(T(d, \"Coût du financement\").includes(\"commission 144 €, intérêts 137 €, frais 15 €\") && T(d, \"Coût du financement\").includes(\"11,9 % par an\"));\nassert(T(d, \"Retenue de garantie\").startsWith(\"1 800 € retenus (10 %)\"));\nassert(T(d, \"Risque d'impayé\").includes(\"factor se retourne contre vous\"));\nassert.strictEqual(d.actions.length, 3);\nassert(d.actions[0].includes(\"notification\"));\nassert(d.actions[1].includes(\"avoir\"));\nassert(d.message.startsWith(\"Objet : facture n° [référence] du 12 novembre 2026 : paiement à [nom du factor]\"));\nassert(d.message.includes(\"18 000 €\") && d.message.includes(\"11 janvier 2027\") && d.message.includes(\"subrogé\"));\nassert(d.message.includes(\"L'avoir n° [référence] reste à déduire\"));\nassert.strictEqual(d.clause.split(\"\\n\").length, 7);\nassert(d.clause.includes(\"L442-3 c)\") && d.clause.includes(\"L441-10\"));\nassert.strictEqual(d.recap.split(\"\\n\").length, 11);\nassert.strictEqual(buildRecap(d), d.recap);\nassert(d.recap.includes(\"Net versé à la cession : 15 904 € ; retenue versée plus tard : 1 800 €\"));\nassert(d.recap.includes(\"Contrôles : 3 conformes, 2 à compléter, 0 bloquant, 7 informations\"));\n\n// Scénarios ciblés\nconst s1 = run({ clauseIncessibilite: \"presente\", debiteurPro: \"autre\" });\nassert.strictEqual(S(s1, \"Clause d'incessibilité\"), \"bad\"); assert.strictEqual(s1.etat, \"bad\");\nassert(s1.verdict.startsWith(\"1 point bloquant : clause d'incessibilité.\"));\nassert(s1.actions[0].includes(\"accord écrit\"));\nconst s2 = run({ clauseIncessibilite: \"aucune\" });\nassert.strictEqual(S(s2, \"Clause d'incessibilité\"), \"ok\");\nconst s3 = run({ mode: \"dailly\", ecrit: \"incomplet\" });\nassert.strictEqual(S(s3, \"Écrit\"), \"bad\"); assert(T(s3, \"Écrit\").includes(\"L313-23\"));\nconst s4 = run({ mode: \"civile\", ecrit: \"incomplet\" });\nassert.strictEqual(S(s4, \"Écrit\"), \"warn\"); assert(T(s4, \"Écrit\").includes(\"1322\"));\nconst s5 = run({ mode: \"civile\", ecrit: \"non\" });\nassert.strictEqual(S(s5, \"Écrit\"), \"bad\"); assert(T(s5, \"Écrit\").includes(\"nulle\"));\nconst s6 = run({ mode: \"affacturage\", execution: \"future\" });\nassert.strictEqual(S(s6, \"Créance cédée\"), \"bad\");\nconst s7 = run({ mode: \"dailly\", execution: \"future\" });\nassert.strictEqual(S(s7, \"Créance cédée\"), \"warn\"); assert(T(s7, \"Créance cédée\").includes(\"L313-23\"));\nconst s8 = run({ mode: \"civile\", execution: \"future\" });\nassert.strictEqual(S(s8, \"Créance cédée\"), \"warn\"); assert(!T(s8, \"Créance cédée\").includes(\"L313-23\"));\nconst s9 = run({ litige: \"reserves\" });\nassert.strictEqual(S(s9, \"Exceptions du client\"), \"bad\"); assert(T(s9, \"Exceptions du client\").includes(\"exception d'inexécution\"));\nconst s10 = run({ mode: \"dailly\", notification: \"acceptee\", litige: \"reserves\" });\nassert.strictEqual(S(s10, \"Exceptions du client\"), \"info\"); assert(T(s10, \"Exceptions du client\").includes(\"L313-29\"));\nassert.strictEqual(S(s10, \"Information du client\"), \"ok\"); assert(T(s10, \"Information du client\").includes(\"Acte d'acceptation\"));\nconst s11 = run({ mode: \"dailly\", notification: \"notifiee\" });\nassert(T(s11, \"Information du client\").includes(\"L313-28\"));\nconst s12 = run({ mode: \"civile\", notification: \"aucune\" });\nassert(T(s12, \"Information du client\").includes(\"1324\"));\nconst s13 = run({ dateEcheance: \"2027-01-31\" });\nassert.strictEqual(s13.delaiPaiement, 80); assert.strictEqual(S(s13, \"Délai de paiement\"), \"warn\"); assert(T(s13, \"Délai de paiement\").includes(\"quarante-cinq jours fin de mois\"));\nconst s14 = run({ dateCession: \"2027-02-01\" });\nassert.strictEqual(S(s14, \"Durée financée\"), \"warn\"); assert.strictEqual(s14.agios, 0); assert.strictEqual(s14.tauxLabel, \"Non calculé\"); assert.strictEqual(s14.joursLabel, \"Non calculé\");\nconst s15 = run({ dateCession: \"\" });\nassert.strictEqual(s15.jours, null); assert.strictEqual(S(s15, \"Durée financée\"), \"warn\");\nconst s16 = run({ dateFacture: \"2026-13-01\" });\nassert.strictEqual(S(s16, \"Délai de paiement\"), \"warn\"); assert(s16.message.includes(\"du [date]\"));\nconst s17 = run({ commission: 3, fraisFixes: 150 });\nassert.strictEqual(S(s17, \"Coût du financement\"), \"warn\"); assert(T(s17, \"Coût du financement\").includes(\"repère de 20 %\"));\nconst s18 = run({ montant: 0 });\nassert.strictEqual(S(s18, \"Coût du financement\"), \"warn\"); assert.strictEqual(s18.cout, 0); assert.strictEqual(s18.net, 0);\nconst s19 = run({ retenueGarantie: 0 });\nassert.strictEqual(s19.retenueEur, 0); assert(T(s19, \"Retenue de garantie\").startsWith(\"Aucune retenue\"));\nconst s20 = run({ mode: \"civile\", recours: \"sans\" });\nassert(T(s20, \"Risque d'impayé\").includes(\"1326\")); assert(T(s20, \"Risque d'impayé\").includes(\"pas la solvabilité\"));\nconst s21 = run({ role: \"debiteur\" });\nassert(s21.message.startsWith(\"Objet : facture n° [référence] : demande de paiement à un autre bénéficiaire\"));\nassert(s21.message.includes(\"notification écrite\"));\nassert(T(s21, \"Paiement libératoire\").includes(\"numéro habituel\"));\nassert(s21.actions[0].includes(\"notification écrite\"));\nconst s22 = run({ role: \"debiteur\", notification: \"notifiee\", litige: \"reserves\" });\nassert(s22.message.includes(\"Nous prenons acte\") && s22.message.includes(\"Nos réserves\"));\nassert(s22.verdict.endsWith(\"À vérifier avant de payer qui que ce soit.\"));\nconst s23 = run({ clauseIncessibilite: \"aucune\", notification: \"notifiee\", litige: \"aucun\" });\nassert.strictEqual(s23.etat, \"ok\"); assert.strictEqual(s23.actions.length, 1);\nassert(s23.verdict.startsWith(\"Aucun point bloquant, rien à compléter.\"));\nconst s24 = run({ mode: \"dailly\" });\nassert(s24.message.includes(\"[nom de la banque]\") && s24.message.includes(\"L313-23\"));\nassert(T(s24, \"Risque d'impayé\").includes(\"banquier\"));\nconst s25 = run({ mode: \"civile\" });\nassert(s25.message.includes(\"par acte du 16 novembre 2026\"));\nconst junk = run({ montant: \"abc\", commission: \"x\", tauxFinancement: \"\", retenueGarantie: \"-4\", fraisFixes: \"y\", role: \"zzz\", mode: \"?\", litige: null });\nassert.strictEqual(junk.montant, 0); assert.strictEqual(junk.role, \"cedant\"); assert.strictEqual(junk.mode, \"affacturage\"); assert.strictEqual(junk.litige, \"avoir\");\nassert(!/NaN|undefined|\\bnull\\b/.test(junk.recap + junk.verdict + junk.message));\nconst big = run({ montant: \"99999999999\" });\nassert.strictEqual(big.montant, 1000000000);\n\n")(tool, require, console);
console.log("seo-am-20261111 ok");
