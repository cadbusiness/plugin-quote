import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_PLAN_PREVENTION, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-plan-prevention-entreprise-exterieure";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "plan-prevention-entreprise-exterieure-devis-b2b";
const BLOG_PATH = "/blog/plan-prevention-entreprise-exterieure-devis-b2b";
const TOOL_PATH = "/outils/verificateur-plan-prevention-entreprise-exterieure";
const DAY = "2026-11-13";
const DAY_PATHS = ["/blog/plan-prevention-entreprise-exterieure-devis-b2b", "/secteurs/funnel-devis-porte-industrielle-quai-chargement", "/outils/verificateur-plan-prevention-entreprise-exterieure"];

assert.equal(BLOG_TOOL_PLAN_PREVENTION, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 42);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de plan de prévention pour entreprise extérieure");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Inspection commune, seuil des 400 heures, travaux dangereux, sous-traitants et amiante : douze points contrôlés, la clause et le message.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-porte-industrielle-quai-chargement")?.priority, 0.8);

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
assert.ok(outilsHub.includes("verificateur-plan-prevention-entreprise-exterieure"));
assert.ok(outilsHub.includes("Vérificateur de plan de prévention pour entreprise extérieure"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-plan-prevention-entreprise-exterieure\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-porte-industrielle-quai-chargement"));
assert.ok(secteursHub.includes("Portes industrielles et quais de chargement"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 8366);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-porte-industrielle-quai-chargement.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-porte-industrielle-quai-chargement/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 6187);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Portes industrielles et quais de chargement"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/verificateur-plan-prevention-entreprise-exterieure.ts","src/components/marketing/verificateur-plan-prevention-entreprise-exterieure-calculator.tsx","src/app/(marketing)/outils/verificateur-plan-prevention-entreprise-exterieure/page.tsx","src/content/blog/plan-prevention-entreprise-exterieure-devis-b2b.md","src/content/blog/funnel-devis-porte-industrielle-quai-chargement.md","src/app/(marketing)/secteurs/funnel-devis-porte-industrielle-quai-chargement/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, POINTS, SEUIL_HEURES, computePrevention, computeHeures, buildRecap, fmtEur, fmtInt, fmtH, fmtTaux, fmtDate, parseDate, num, dec, daysBetween } = X;\nconst run = (o) => computePrevention({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point === point);\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\n\n// Statique\nconst numIds = [\"heuresEE\", \"heuresST\", \"dureeMois\", \"heuresPrevention\", \"tauxHoraire\"];\nconst dateIds = [\"dateInspection\", \"dateDebut\", \"dateSignature\"];\nconst selIds = [\"role\", \"nature\", \"dangereux\", \"inspection\", \"plan\", \"sousTraitants\", \"amiante\", \"information\", \"isolement\"];\nconst labelMap = {\n  role: \"ROLE_LABELS\", nature: \"NATURE_LABELS\", dangereux: \"DANGEREUX_LABELS\", inspection: \"INSPECTION_LABELS\", plan: \"PLAN_LABELS\",\n  sousTraitants: \"ST_LABELS\", amiante: \"AMIANTE_LABELS\", information: \"INFO_LABELS\", isolement: \"ISOLEMENT_LABELS\"\n};\nassert.strictEqual(Object.keys(DEFAULTS).length, 17);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 17);\nassert.strictEqual(SEUIL_HEURES, 400);\nassert.strictEqual(POINTS.length, 12);\n\n\n\n\n\n\n\n// Utilitaires\nassert.strictEqual(fmtEur(770), \"770 €\");\nassert.strictEqual(fmtEur(58400), \"58 400 €\");\nassert.strictEqual(fmtEur(-1200), \"\\u22121 200 €\");\nassert.strictEqual(fmtInt(1234567), \"1 234 567\");\nassert.strictEqual(fmtH(440), \"440 h\");\nassert.strictEqual(fmtTaux(55), \"55 €\");\nassert.strictEqual(fmtTaux(52.5), \"52,50 €\");\nassert.strictEqual(fmtDate(parseDate(\"2026-12-01\")), \"1er décembre 2026\");\nassert.strictEqual(fmtDate(parseDate(\"2026-11-30\")), \"30 novembre 2026\");\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\nassert.strictEqual(parseDate(\"abc\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.strictEqual(daysBetween(parseDate(\"2026-11-30\"), parseDate(\"2026-12-07\")), 7);\nassert.strictEqual(num(\"1 200\", 0, 10000, 0), 1200);\nassert.strictEqual(num(\"1\\u00a0200\", 0, 10000, 0), 1200);\nassert.strictEqual(num(\"x\", 0, 10, 3), 3);\nassert.strictEqual(num(\"-5\", 0, 10, 3), 0);\nassert.strictEqual(dec(\"52,5\", 0, 1000, 0), 52.5);\nassert.deepStrictEqual(computeHeures(320, 120, 2), { total: 440, douze: 440, estime: false, atteint: true, proche: false });\nassert.deepStrictEqual(computeHeures(320, 0, 2), { total: 320, douze: 320, estime: false, atteint: false, proche: false });\nassert.deepStrictEqual(computeHeures(360, 0, 12), { total: 360, douze: 360, estime: false, atteint: false, proche: true });\nassert.deepStrictEqual(computeHeures(440, 0, 18), { total: 440, douze: 294, estime: true, atteint: false, proche: false });\nassert.deepStrictEqual(computeHeures(600, 0, 18), { total: 600, douze: 400, estime: true, atteint: true, proche: false });\nassert.strictEqual(computeHeures(400, 0, 12).atteint, true);\nassert.strictEqual(computeHeures(399, 0, 12).atteint, false);\n\n// Défauts (hypothèses d'exemple)\nconst d = computePrevention(DEFAULTS);\nassert.deepStrictEqual(d.controles.map((c) => c.point), POINTS);\nassert.deepStrictEqual(d.controles.map((c) => c.statut), [\"info\", \"ok\", \"info\", \"ok\", \"ok\", \"ok\", \"ok\", \"warn\", \"ok\", \"info\", \"info\", \"ok\"]);\nassert.strictEqual(d.nbOk, 7); assert.strictEqual(d.nbWarn, 1); assert.strictEqual(d.nbBad, 0); assert.strictEqual(d.nbInfo, 4);\nassert.strictEqual(d.etat, \"warn\");\nassert.strictEqual(d.total, 440); assert.strictEqual(d.douze, 440); assert.strictEqual(d.cout, 770);\nassert.strictEqual(d.ecritObligatoire, true); assert.strictEqual(d.ecritHeures, true); assert.strictEqual(d.ecritDangereux, false);\nassert.strictEqual(d.verdict, \"Aucun point bloquant, 1 à compléter. Plan de prévention écrit obligatoire : 440 heures prévisibles sur 2 mois, sous-traitants compris (seuil de 400 heures).\");\nassert.strictEqual(d.totalLabel, \"440 h (dont 120 h de sous-traitance)\");\nassert.strictEqual(d.douzeLabel, \"440 h\");\nassert.strictEqual(d.coutLabel, \"14 h, soit 770 €\");\nassert.strictEqual(d.planLabel, \"Écrit obligatoire\");\nassert.strictEqual(d.motif, \"400 heures atteintes\");\nassert(T(d, \"Seuil des 400 heures\").includes(\"C'est la sous-traitance qui fait franchir le seuil.\"));\nassert(T(d, \"Seuil des 400 heures\").includes(\"R4512-7, 1°\"));\nassert(T(d, \"Inspection commune\").includes(\"30 novembre 2026\"));\nassert(T(d, \"Calendrier\").includes(\"2 décembre 2026\"));\nassert(T(d, \"Ouverture des travaux\").includes(\"R4512-12\"));\nassert(T(d, \"Information des salariés\").includes(\"R4512-16\"));\nassert(T(d, \"Amiante\").includes(\"R4511-8\"));\nconst cl = d.clause.split(\"\\n\");\nassert.strictEqual(cl.length, 7);\nassert.strictEqual(cl[0], \"Article [X] : Prévention des risques sur le site du client\");\nassert(cl[2].includes(\"[30 novembre 2026]\"));\nassert(cl[3].includes(\"[7 décembre 2026]\") && cl[3].includes(\"440 heures prévisibles, sous-traitants compris\"));\nassert(cl[4].includes(\"[14] heures\") && cl[4].includes(\"[770 €]\") && cl[4].includes(\"[55 €]\"));\nassert(cl[6].includes(\"120 heures prévues\"));\nassert(d.message.startsWith(\"Objet : intervention du 7 décembre 2026 sur votre site : informations préalables\"));\nassert(d.message.includes(\"article R4511-10\") && d.message.includes(\"440 h, sous-traitants compris\") && d.message.includes(\"À la suite de l'inspection commune du 30 novembre 2026\"));\nassert(d.message.endsWith(\"Cordialement\"));\nconst rc = d.recap.split(\"\\n\");\nassert.strictEqual(rc.length, 11);\nassert.strictEqual(rc[3], \"Heures prévisibles : 440 h dont 120 h de sous-traitance, sur 2 mois\");\nassert.strictEqual(rc[6], \"Plan : Écrit obligatoire (400 heures atteintes)\");\nassert.strictEqual(rc[9], \"Contrôle : 7 conformes, 1 à compléter, 0 bloquant, 4 informations\");\nassert.strictEqual(rc[10], \"Calcul : quotebuilder.co/outils/\" + SLUG);\nassert.strictEqual(buildRecap(d), d.recap);\nassert.strictEqual(d.actions.length, 2);\nassert(d.actions[0].includes(\"amiante\"));\n\n// Variantes de l'article\nconst sansST = run({ heuresST: 0 });\nassert.strictEqual(sansST.total, 320); assert.strictEqual(sansST.ecritObligatoire, false);\nassert.strictEqual(S(sansST, \"Seuil des 400 heures\"), \"ok\");\nassert.strictEqual(S(sansST, \"Sous-traitants\"), \"info\");\nassert.strictEqual(S(sansST, \"Forme du plan\"), \"ok\");\nassert.strictEqual(sansST.planLabel, \"Écrit non obligatoire\");\nassert(sansST.verdict.includes(\"Plan de prévention écrit non obligatoire : 320 heures prévisibles sur 2 mois\"));\nassert(sansST.clause.includes(\"à la demande des parties\"));\nassert(sansST.clause.includes(\"L'entreprise n'a pas prévu de sous-traitant\"));\nassert(!sansST.message.includes(\"sous-traitants compris\"));\nconst sansSTOral = run({ heuresST: 0, plan: \"oral\" });\nassert.strictEqual(S(sansSTOral, \"Forme du plan\"), \"info\");\nassert.strictEqual(S(sansSTOral, \"Calendrier\"), \"info\");\nconst sansSTRien = run({ heuresST: 0, plan: \"aucun\" });\nassert.strictEqual(S(sansSTRien, \"Forme du plan\"), \"warn\");\nconst soudure = run({ heuresST: 0, dangereux: \"soudage\" });\nassert.strictEqual(soudure.ecritObligatoire, true); assert.strictEqual(soudure.ecritDangereux, true);\nassert.strictEqual(S(soudure, \"Travaux dangereux\"), \"info\");\nassert(T(soudure, \"Travaux dangereux\").includes(\"soudage oxyacétylénique\"));\nassert.strictEqual(soudure.motif, \"Travail de la liste\");\nassert(soudure.verdict.includes(\"quelle que soit la durée\"));\nconst soudOral = run({ heuresST: 0, dangereux: \"soudage\", plan: \"oral\" });\nassert.strictEqual(S(soudOral, \"Forme du plan\"), \"bad\");\nassert.strictEqual(soudOral.etat, \"bad\");\nassert(soudOral.verdict.startsWith(\"1 point bloquant (forme du plan)\"));\nconst both = run({ dangereux: \"levage\" });\nassert.strictEqual(both.motif, \"400 heures et travail de la liste\");\nassert(both.clause.includes(\"et comporte un travail de la liste\"));\nconst weekend = run({ isolement: \"ouiNonPrevu\" });\nassert.strictEqual(S(weekend, \"Travail isolé\"), \"bad\");\nassert(T(weekend, \"Travail isolé\").includes(\"R4512-13\"));\nassert.strictEqual(S(run({ isolement: \"ouiPrevu\" }), \"Travail isolé\"), \"ok\");\nconst reprise = run({ heuresEE: 280, heuresST: 80 });\nassert.strictEqual(S(reprise, \"Seuil des 400 heures\"), \"warn\");\nassert(T(reprise, \"Seuil des 400 heures\").includes(\"tout près\"));\nconst long = run({ heuresEE: 440, heuresST: 0, dureeMois: 18 });\nassert.strictEqual(long.douze, 294); assert.strictEqual(long.estime, true);\nassert.strictEqual(S(long, \"Seuil des 400 heures\"), \"warn\");\nassert.strictEqual(long.douzeLabel, \"environ 294 h (au prorata)\");\nassert(long.actions.some((a) => a.includes(\"période de douze mois la plus chargée\")));\nconst long2 = run({ heuresEE: 900, heuresST: 0, dureeMois: 24 });\nassert.strictEqual(long2.douze, 450); assert.strictEqual(S(long2, \"Seuil des 400 heures\"), \"warn\"); assert.strictEqual(long2.ecritObligatoire, true);\n\n// Inspection et calendrier\nassert.strictEqual(S(run({ inspection: \"non\" }), \"Inspection commune\"), \"bad\");\nassert.strictEqual(S(run({ inspection: \"prevue\" }), \"Inspection commune\"), \"warn\");\nassert.strictEqual(S(run({ inspection: \"prevue\", dateInspection: \"2026-12-07\" }), \"Inspection commune\"), \"bad\");\nassert.strictEqual(S(run({ inspection: \"prevue\", dateInspection: \"\" }), \"Inspection commune\"), \"warn\");\nassert.strictEqual(S(run({ inspection: \"faite\", dateInspection: \"2026-12-09\" }), \"Inspection commune\"), \"bad\");\nassert.strictEqual(S(run({ inspection: \"faite\", dateInspection: \"2026-12-07\" }), \"Inspection commune\"), \"ok\");\nassert.strictEqual(S(run({ inspection: \"faite\", dateInspection: \"\" }), \"Inspection commune\"), \"warn\");\nassert.strictEqual(S(run({ dateSignature: \"2026-12-08\" }), \"Calendrier\"), \"bad\");\nassert.strictEqual(S(run({ heuresST: 0, dateSignature: \"2026-12-08\" }), \"Calendrier\"), \"warn\");\nassert.strictEqual(S(run({ dateSignature: \"2026-12-07\" }), \"Calendrier\"), \"ok\");\nassert.strictEqual(S(run({ dateSignature: \"\" }), \"Calendrier\"), \"warn\");\nassert.strictEqual(S(run({ dateDebut: \"\" }), \"Calendrier\"), \"warn\");\nassert(run({ dateDebut: \"\", dateInspection: \"\" }).clause.includes(\"[[date]]\") === false);\nassert(run({ dateDebut: \"\", dateInspection: \"\" }).clause.includes(\"[[date]\") === false);\nassert(run({ dateDebut: \"\" }).message.includes(\"[date]\"));\n\n// Sous-traitants, amiante, information, devis\nassert.strictEqual(S(run({ sousTraitants: \"nonDeclares\" }), \"Sous-traitants\"), \"warn\");\nassert.strictEqual(S(run({ amiante: \"fourni\" }), \"Amiante\"), \"ok\");\nassert.strictEqual(S(run({ amiante: \"nonDemande\" }), \"Amiante\"), \"warn\");\nassert(T(run({ amiante: \"nonDemande\", role: \"utilisatrice\" }), \"Amiante\").includes(\"demande au propriétaire\"));\nassert.strictEqual(run({ amiante: \"fourni\" }).etat, \"ok\");\nassert.strictEqual(run({ amiante: \"fourni\" }).verdict.startsWith(\"Aucun point bloquant, rien à compléter.\"), true);\nassert(!run({ amiante: \"fourni\" }).message.includes(\"documents amiante\"));\nassert.strictEqual(S(run({ information: \"non\" }), \"Information des salariés\"), \"warn\");\nconst zero = run({ heuresPrevention: 0 });\nassert.strictEqual(S(zero, \"Temps de prévention au devis\"), \"warn\"); assert.strictEqual(zero.coutLabel, \"Non chiffré\"); assert.strictEqual(zero.cout, 0);\nassert.strictEqual(S(run({ tauxHoraire: 0 }), \"Temps de prévention au devis\"), \"warn\");\nconst taux = run({ tauxHoraire: \"52,5\" });\nassert.strictEqual(taux.cout, 735); assert(taux.clause.includes(\"[52,50 €]\"));\nassert.strictEqual(run({ heuresPrevention: \"1 000\", tauxHoraire: \"60\" }).cout, 60000);\n\n// Rôle client\nconst cli = run({ role: \"utilisatrice\" });\nassert(cli.message.startsWith(\"Objet : préparation de votre intervention du 7 décembre 2026\"));\nassert(cli.message.includes(\"L'inspection commune est proposée le 30 novembre 2026\"));\nassert(cli.message.includes(\"établi par écrit et signé avant le démarrage\"));\nassert(T(cli, \"Ouverture des travaux\").includes(\"Cette information est à votre charge.\"));\nassert(cli.actions[cli.actions.length - 1].includes(\"déclaration d'ouverture\"));\n\n// Chargement\nconst ch = run({ nature: \"chargement\" });\nassert.strictEqual(ch.planLabel, \"Protocole de sécurité écrit\"); assert.strictEqual(ch.motif, \"Chargement ou déchargement\");\nassert.strictEqual(ch.ecritObligatoire, true);\nassert.deepStrictEqual(ch.controles.map((c) => c.statut), [\"info\", \"info\", \"info\", \"info\", \"ok\", \"ok\", \"info\", \"info\", \"ok\", \"info\", \"info\", \"ok\"]);\nassert.strictEqual(ch.etat, \"ok\");\nassert(ch.clause.startsWith(\"Article [X] : Protocole de sécurité pour le chargement et le déchargement\"));\nassert(ch.verdict.endsWith(\"Chargement ou déchargement : protocole de sécurité écrit, établi avant l'opération.\"));\nassert(ch.message.startsWith(\"Objet : protocole de sécurité avant l'opération du 7 décembre 2026\"));\nassert.strictEqual(S(run({ nature: \"chargement\", plan: \"oral\" }), \"Forme du plan\"), \"bad\");\nassert.strictEqual(S(run({ nature: \"chargement\", plan: \"aucun\" }), \"Forme du plan\"), \"bad\");\nassert.strictEqual(S(run({ nature: \"chargement\", dateSignature: \"2026-12-09\" }), \"Calendrier\"), \"bad\");\nassert.strictEqual(S(run({ nature: \"chargement\", inspection: \"non\" }), \"Inspection commune\"), \"info\");\nassert(T(ch, \"Champ d'application\").includes(\"R4515-1\"));\nassert(T(run({ nature: \"chargement\", role: \"utilisatrice\" }), \"Forme du plan\").includes(\"R4515-4\"));\nassert(run({ nature: \"chargement\", role: \"utilisatrice\" }).message.includes(\"R4515-1\"));\n\n// Chantier\nconst cc = run({ nature: \"chantier\" });\nassert.strictEqual(cc.planLabel, \"Sans objet\"); assert.strictEqual(cc.ecritObligatoire, false);\nassert.strictEqual(cc.nbInfo, 11); assert.strictEqual(S(cc, \"Temps de prévention au devis\"), \"ok\"); assert.strictEqual(cc.etat, \"ok\");\nassert(T(cc, \"Champ d'application\").includes(\"R4511-3\"));\nassert(cc.clause.includes(\"article R4511-3\"));\nassert.strictEqual(run({ nature: \"chantier\", heuresPrevention: 0 }).etat, \"warn\");\nassert.strictEqual(run({ nature: \"chantier\", inspection: \"non\", plan: \"aucun\", isolement: \"ouiNonPrevu\" }).nbBad, 0);\n\n// Saisies invalides\nconst junk = run({ heuresEE: \"abc\", heuresST: \"\", dureeMois: \"0\", heuresPrevention: \"-3\", tauxHoraire: \"x\", role: \"zzz\", nature: \"?\", dangereux: null, plan: 7, dateDebut: \"nope\" });\nassert.strictEqual(junk.total, 0); assert.strictEqual(junk.dureeMois, 1); assert.strictEqual(junk.heuresPrevention, 0); assert.strictEqual(junk.tauxHoraire, 0);\nassert.strictEqual(junk.role, \"exterieure\"); assert.strictEqual(junk.nature, \"site\"); assert.strictEqual(junk.dangereux, \"aucun\"); assert.strictEqual(junk.plan, \"ecrit\");\nconst big = run({ heuresEE: \"99999999999\", dureeMois: \"999\" });\nassert.strictEqual(big.heuresEE, 1000000); assert.strictEqual(big.dureeMois, 60);\nassert.strictEqual(computePrevention(undefined).total, 0);\n\n")(tool, require, console);
console.log("seo-am-20261113 ok");
