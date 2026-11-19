import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_RUPTURE_BRUTALE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./calculateur-preavis-rupture-brutale";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "rupture-brutale-relations-commerciales-devis-b2b";
const BLOG_PATH = "/blog/rupture-brutale-relations-commerciales-devis-b2b";
const TOOL_PATH = "/outils/calculateur-preavis-rupture-brutale";
const DAY = "2026-11-10";
const DAY_PATHS = ["/blog/rupture-brutale-relations-commerciales-devis-b2b", "/secteurs/funnel-devis-demenagement-entreprise", "/outils/calculateur-preavis-rupture-brutale"];

assert.equal(BLOG_TOOL_RUPTURE_BRUTALE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 36);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Calculateur de préavis de rupture brutale");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "ancienneté, préavis écrit, dépendance, usages : douze points contrôlés, un repère de préavis, le préavis manquant et la perte de marge estimée.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-demenagement-entreprise")?.priority, 0.8);

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
assert.ok(outilsHub.includes("calculateur-preavis-rupture-brutale"));
assert.ok(outilsHub.includes("Calculateur de préavis de rupture brutale"));
{
  const start = outilsHub.indexOf("href: \"/outils/calculateur-preavis-rupture-brutale\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-demenagement-entreprise"));
assert.ok(secteursHub.includes("Déménagement d'entreprise"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 7155);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-demenagement-entreprise.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-demenagement-entreprise/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 5277);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Déménagement d'entreprise"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/calculateur-preavis-rupture-brutale.ts","src/components/marketing/calculateur-preavis-rupture-brutale-calculator.tsx","src/app/(marketing)/outils/calculateur-preavis-rupture-brutale/page.tsx","src/content/blog/rupture-brutale-relations-commerciales-devis-b2b.md","src/content/blog/funnel-devis-demenagement-entreprise.md","src/app/(marketing)/secteurs/funnel-devis-demenagement-entreprise/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, POINTS, computePreavis, buildRecap, fmtEur, fmtDate, fmtMois, parseDate, num, addMonths, monthsBetween } = X;\nconst run = (o) => computePreavis({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point === point);\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\n\n// Statique\nconst numIds = [\"baisseVolume\", \"preavisContractuel\", \"usages\", \"partCA\", \"caMensuel\", \"tauxMarge\"];\nconst dateIds = [\"dateDebut\", \"dateNotification\", \"dateFin\"];\nconst selIds = [\"role\", \"typeRupture\", \"preavisEcrit\", \"exclusivite\", \"investissements\", \"appelsOffres\", \"conditionsPreavis\", \"motif\"];\nassert.strictEqual(Object.keys(DEFAULTS).length, 17);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 17);\n\n\nconst labelMap = {\n  role: \"ROLE_LABELS\", typeRupture: \"TYPE_LABELS\", preavisEcrit: \"ECRIT_LABELS\", exclusivite: \"EXCLUSIVITE_LABELS\",\n  investissements: \"INVEST_LABELS\", appelsOffres: \"AO_LABELS\", conditionsPreavis: \"CONDITIONS_LABELS\", motif: \"MOTIF_LABELS\"\n};\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\nassert.deepStrictEqual(POINTS, [\"Ancienneté de la relation\", \"Stabilité de la relation\", \"Préavis écrit\", \"Durée du préavis accordé\", \"Plafond de dix-huit mois\", \"Préavis du contrat\", \"Usages et accords interprofessionnels\", \"Dépendance et investissements\", \"Conditions pendant le préavis\", \"Motif de la rupture\", \"Préjudice estimé\", \"Juridiction compétente\"]);\n\n\n// Helpers\nassert.strictEqual(fmtEur(28080), \"28 080 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtEur(1234567), \"1 234 567 €\");\nassert.strictEqual(fmtEur(-920), \"\\u2212920 €\");\nassert.strictEqual(fmtDate({ y: 2027, m: 7, d: 16 }), \"16 juillet 2027\");\nassert.strictEqual(fmtDate({ y: 2018, m: 3, d: 1 }), \"1er mars 2018\");\nassert.strictEqual(fmtMois(6.5), \"6,5 mois\");\nassert.strictEqual(fmtMois(8), \"8 mois\");\nassert.strictEqual(fmtMois(0), \"0 mois\");\nassert.strictEqual(fmtMois(2.96), \"3 mois\");\nassert.deepStrictEqual(parseDate(\"2026-11-16\"), { y: 2026, m: 11, d: 16 });\nassert.strictEqual(parseDate(\"2027-02-29\"), null);\nassert.strictEqual(parseDate(\"16/11/2026\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.strictEqual(parseDate(\"0001-01-01\"), null);\nassert.strictEqual(num(\"9 600\", 0, 1e8, 0), 9600);\nassert.strictEqual(num(\"9\\u00a0600\", 0, 1e8, 0), 9600);\nassert.strictEqual(num(\"45,9\", 0, 100, 0), 45);\nassert.strictEqual(num(\"abc\", 0, 100, 7), 7);\nassert.strictEqual(num(\"-5\", 0, 100, 0), 0);\nassert.strictEqual(num(\"250\", 0, 100, 0), 100);\nassert.deepStrictEqual(addMonths({ y: 2026, m: 11, d: 16 }, 8), { y: 2027, m: 7, d: 16 });\nassert.deepStrictEqual(addMonths({ y: 2027, m: 1, d: 31 }, 1), { y: 2027, m: 2, d: 28 });\nassert.deepStrictEqual(addMonths({ y: 2026, m: 12, d: 31 }, 14), { y: 2028, m: 2, d: 29 });\nconst mb = monthsBetween({ y: 2026, m: 11, d: 16 }, { y: 2026, m: 12, d: 31 });\nassert.strictEqual(mb.m, 1); assert.strictEqual(mb.d, 15); assert.strictEqual(mb.dec, 1.5);\nassert.strictEqual(monthsBetween({ y: 2026, m: 11, d: 16 }, { y: 2026, m: 11, d: 16 }).dec, 0);\nassert.strictEqual(monthsBetween({ y: 2026, m: 11, d: 16 }, { y: 2026, m: 10, d: 1 }).dec, 0);\nconst anc = monthsBetween({ y: 2018, m: 3, d: 1 }, { y: 2026, m: 11, d: 16 });\nassert.strictEqual(anc.m, 104); assert.strictEqual(anc.d, 15);\nassert.strictEqual(monthsBetween({ y: 2027, m: 1, d: 31 }, { y: 2027, m: 3, d: 1 }).m, 1);\n\n// Défauts (hypothèses d'exemple)\nconst r = computePreavis({});\nassert.strictEqual(r.controles.length, 12);\nassert.deepStrictEqual(r.controles.map((c) => c.point), POINTS);\nassert.deepStrictEqual(r.controles.map((c) => c.statut), [\"info\", \"ok\", \"ok\", \"bad\", \"info\", \"bad\", \"info\", \"warn\", \"ok\", \"info\", \"info\", \"info\"]);\nassert.strictEqual(r.nbOk, 3); assert.strictEqual(r.nbWarn, 1); assert.strictEqual(r.nbBad, 2); assert.strictEqual(r.nbInfo, 6);\nassert.strictEqual(r.etat, \"bad\");\nassert.strictEqual(r.ancienneteLabel, \"8 ans et 8 mois\");\nassert.strictEqual(r.majoration, 1);\nassert.strictEqual(r.central, 8); assert.strictEqual(r.basse, 5); assert.strictEqual(r.haute, 12); assert.strictEqual(r.repere, 8);\nassert.strictEqual(r.finRepere, \"2027-07-16\"); assert.strictEqual(r.finRepereFmt, \"16 juillet 2027\");\nassert.strictEqual(r.accordeLabel, \"1 mois et 15 jours\"); assert.strictEqual(r.accordeDec, 1.5);\nassert.strictEqual(r.manquant, 6.5); assert.strictEqual(r.margeMensuelle, 4320); assert.strictEqual(r.perte, 28080);\nassert.strictEqual(r.verdict, \"2 points bloquants et 1 à compléter. Préavis accordé : 1 mois et 15 jours ; repère de l'outil : 8 mois ; préavis manquant : 6,5 mois ; perte de marge estimée : 28 080 €.\");\nassert(T(r, \"Ancienneté de la relation\").includes(\"16-26.568\"));\nassert(T(r, \"Préjudice estimé\").includes(\"28 080 €\"));\nassert(T(r, \"Préjudice estimé\").includes(\"21-16.940\"));\nassert(T(r, \"Dépendance et investissements\").includes(\"investissements moyens (+1 mois)\"));\nassert.strictEqual(r.articles, 6);\nassert(r.clause.startsWith(\"Clause « Durée, préavis et fin de la relation »\"));\nassert(r.clause.includes(\"préavis de [3] mois\"));\nassert(r.clause.includes(\"porté à [6] mois\"));\nassert(r.clause.includes(\"conditions économiques du marché\"));\nassert.strictEqual(r.clause.split(\"\\n\\n\").length, 7);\nassert.strictEqual(r.actions.length, r.nbBad + r.nbWarn + 1);\nassert(r.actions[0].includes(\"16 juillet 2027\"));\nassert(r.actions[r.actions.length - 1].includes(\"hors de QuoteBuilder\"));\nassert(r.message.startsWith(\"Objet : rupture de notre relation commerciale, demande de préavis\"));\nassert(r.message.includes(\"votre courrier du 16 novembre 2026\"));\nassert(r.message.includes(\"jusqu'au 16 juillet 2027, soit un préavis de 8 mois\"));\nassert(r.message.includes(\"28 080 €\"));\nassert.strictEqual(r.recap.split(\"\\n\").length, 11);\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert(r.recap.includes(\"Repère de l'outil : 8 mois (fourchette 5 à 12 mois) · fin au repère : 16 juillet 2027\"));\nassert(r.recap.includes(\"Contrôles : 3 conformes, 1 à compléter, 2 bloquants, 6 informations\"));\nassert.strictEqual(buildRecap(r), r.recap);\n\n// Calibrage comparé aux décisions citées\nconst c1 = run({ dateDebut: \"2016-01-01\", dateNotification: \"2018-07-01\", dateFin: \"2018-11-01\", partCA: 10, investissements: \"aucun\", preavisContractuel: 0 });\nassert.strictEqual(c1.repere, 4, \"deux ans et demi : repère 4 mois\");\nassert.strictEqual(S(c1, \"Durée du préavis accordé\"), \"ok\");\nconst c2 = run({ dateDebut: \"2000-01-01\", dateNotification: \"2014-01-01\", partCA: 18, investissements: \"aucun\", preavisContractuel: 0 });\nassert(c2.basse <= 6 && 6 <= c2.haute, \"quatorze ans : six mois dans la fourchette\");\nconst c3 = run({ dateDebut: \"1994-01-01\", dateNotification: \"2017-01-01\", dateFin: \"2019-12-01\", partCA: 24, investissements: \"aucun\", usages: 10, preavisContractuel: 0, conditionsPreavis: \"baisseLegere\" });\nassert(c3.repere >= 10); assert.strictEqual(S(c3, \"Durée du préavis accordé\"), \"ok\"); assert.strictEqual(S(c3, \"Usages et accords interprofessionnels\"), \"ok\");\nassert.strictEqual(S(c3, \"Conditions pendant le préavis\"), \"info\");\n\n// Repère, plafond, majorations\nconst lourd = run({ dateDebut: \"1990-01-01\", partCA: 60, exclusivite: \"oui\", investissements: \"lourds\" });\nassert.strictEqual(lourd.repere, 18); assert.strictEqual(lourd.haute, 18); assert.strictEqual(lourd.majoration, 9);\nconst long = run({ dateFin: \"2028-06-01\" });\nassert.strictEqual(S(long, \"Plafond de dix-huit mois\"), \"ok\");\nassert.strictEqual(S(long, \"Durée du préavis accordé\"), \"ok\");\nassert.strictEqual(long.manquant, 0); assert.strictEqual(long.perte, 0);\nassert.strictEqual(S(long, \"Préjudice estimé\"), \"ok\");\nconst contr = run({ preavisContractuel: 24 });\nassert.strictEqual(contr.repere, 18);\nconst us = run({ usages: 12 });\nassert.strictEqual(us.repere, 12); assert.strictEqual(S(us, \"Usages et accords interprofessionnels\"), \"bad\");\nassert.strictEqual(run({ partCA: 30, investissements: \"aucun\" }).majoration, 2);\nassert.strictEqual(run({ partCA: 29, investissements: \"aucun\" }).majoration, 0);\nassert.strictEqual(S(run({ partCA: 10, investissements: \"aucun\" }), \"Dépendance et investissements\"), \"ok\");\nconst mid = run({ dateFin: \"2027-05-01\" });\nassert.strictEqual(S(mid, \"Durée du préavis accordé\"), \"warn\");\nassert.strictEqual(S(mid, \"Préavis du contrat\"), \"ok\");\nassert(T(mid, \"Préavis du contrat\").includes(\"le contrat ne fixe qu'un minimum\"));\n\n// Écrit, rupture immédiate, dates\nconst oral = run({ preavisEcrit: \"non\" });\nassert.strictEqual(S(oral, \"Préavis écrit\"), \"bad\"); assert.strictEqual(oral.accordeDec, 0); assert.strictEqual(oral.accordeLabel, \"aucun\");\nassert.strictEqual(oral.manquant, 8); assert.strictEqual(oral.perte, 34560);\nassert(oral.message.includes(\"sans courrier\"));\nconst imm = run({ dateFin: \"2026-11-16\" });\nassert.strictEqual(imm.accordeDec, 0); assert(T(imm, \"Durée du préavis accordé\").includes(\"rupture immédiate\"));\nconst avant = run({ dateDebut: \"2027-01-01\" });\nassert.strictEqual(S(avant, \"Ancienneté de la relation\"), \"warn\"); assert.strictEqual(avant.ancienneteLabel, \"moins d'un mois\");\nconst court = run({ dateDebut: \"2026-03-01\" });\nassert.strictEqual(S(court, \"Ancienneté de la relation\"), \"warn\");\nconst dinv = run({ dateDebut: \"2018-02-30\", dateNotification: \"xx\", dateFin: \"\" });\nassert.strictEqual(dinv.dateDebut, \"2018-03-01\"); assert.strictEqual(dinv.dateNotification, \"2026-11-16\"); assert.strictEqual(dinv.dateFin, \"2026-12-31\");\n\n// Appels d'offres\nassert.strictEqual(S(run({ appelsOffres: \"annuel\" }), \"Stabilité de la relation\"), \"warn\");\nassert(T(run({ appelsOffres: \"annuel\" }), \"Stabilité de la relation\").includes(\"21-18.299\"));\nassert.strictEqual(S(run({ appelsOffres: \"ponctuel\" }), \"Stabilité de la relation\"), \"info\");\n\n// Conditions pendant le préavis\nassert.strictEqual(S(run({ conditionsPreavis: \"baisseForte\" }), \"Conditions pendant le préavis\"), \"bad\");\nassert.strictEqual(S(run({ conditionsPreavis: \"baisseForte\", dateFin: \"2029-01-01\" }), \"Conditions pendant le préavis\"), \"warn\");\nassert(T(run({ conditionsPreavis: \"baisseLegere\" }), \"Conditions pendant le préavis\").includes(\"15 %\"));\n\n// Motifs\nconst grave = run({ motif: \"inexecutionGrave\" });\nassert.strictEqual(grave.justifie, true); assert.strictEqual(grave.manquant, 0); assert.strictEqual(grave.perte, 0);\nassert.strictEqual(grave.manquantBrut, 6.5); assert.strictEqual(grave.perteBrute, 28080);\nassert.strictEqual(S(grave, \"Motif de la rupture\"), \"warn\"); assert.strictEqual(S(grave, \"Durée du préavis accordé\"), \"info\");\nassert(grave.verdict.includes(\"Si le motif invoqué est établi, aucun préavis n'est dû ; sinon il manquerait 6,5 mois, soit une perte estimée de 28 080 €.\"));\nassert(grave.message.includes(\"Nous contestons ce motif\"));\nconst fm = run({ motif: \"forceMajeure\", role: \"auteur\" });\nassert(T(fm, \"Motif de la rupture\").includes(\"1218\"));\nassert(fm.message.startsWith(\"Objet : fin de notre relation commerciale pour force majeure\"));\nassert.strictEqual(S(run({ motif: \"inexecutionMineure\" }), \"Motif de la rupture\"), \"bad\");\nassert.strictEqual(S(run({ motif: \"inexecutionMineure\", dateFin: \"2028-01-01\" }), \"Motif de la rupture\"), \"info\");\nassert(run({ motif: \"inexecutionGrave\", role: \"auteur\" }).message.includes(\"Malgré notre mise en demeure\"));\n\n// Rupture partielle\nconst part = run({ typeRupture: \"partielle\", baisseVolume: 40 });\nassert.strictEqual(part.perte, Math.round(6.5 * 4320 * 0.4));\nassert(part.message.includes(\"la baisse de 40 % de vos commandes\"));\nassert(part.recap.includes(\"rupture partielle (baisse de 40 %)\"));\nassert(T(part, \"Préjudice estimé\").includes(\"× 40 % de baisse\"));\n\n// Préjudice sans chiffres\nassert.strictEqual(S(run({ caMensuel: 0 }), \"Préjudice estimé\"), \"warn\");\nassert.strictEqual(run({ caMensuel: 0 }).perte, 0);\nassert.strictEqual(run({ caMensuel: \"9 600\" }).caMensuel, 9600);\n\n// Rôle auteur\nconst au = run({ role: \"auteur\" });\nassert(au.message.startsWith(\"Objet : fin de notre relation commerciale, préavis de 8 mois\"));\nassert(au.message.includes(\"jusqu'au 16 juillet 2027\"));\nassert(au.actions[0].startsWith(\"Allongez le préavis jusqu'au repère de 8 mois\"));\nassert(au.recap.includes(\"Position : partenaire qui rompt · rupture totale\"));\nconst auLong = run({ role: \"auteur\", dateFin: \"2028-06-01\" });\nassert(auLong.propose >= 19 && auLong.message.includes(\"préavis de \" + auLong.propose + \" mois\"));\nconst vOk = run({ dateFin: \"2028-06-01\" });\nassert(vOk.message.includes(\"Nous en prenons acte\"));\n\n// Entrées invalides\nconst inv = computePreavis({ role: \"zz\", typeRupture: \"zz\", preavisEcrit: \"zz\", exclusivite: \"zz\", investissements: \"zz\", appelsOffres: \"zz\", conditionsPreavis: \"zz\", motif: \"zz\", partCA: \"abc\", tauxMarge: \"x\" });\nassert.strictEqual(inv.role, \"victime\"); assert.strictEqual(inv.typeRupture, \"totale\"); assert.strictEqual(inv.preavisEcrit, \"oui\");\nassert.strictEqual(inv.exclusivite, \"non\"); assert.strictEqual(inv.investissements, \"moyens\"); assert.strictEqual(inv.appelsOffres, \"aucun\");\nassert.strictEqual(inv.conditionsPreavis, \"maintenues\"); assert.strictEqual(inv.motif, \"aucun\"); assert.strictEqual(inv.partCA, 22); assert.strictEqual(inv.tauxMarge, 45);\n\n")(tool, require, console);
console.log("seo-am-20261110 ok");
