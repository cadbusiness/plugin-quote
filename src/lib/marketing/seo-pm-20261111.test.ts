import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_GROUPEMENT_COTRAITANCE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./calculateur-repartition-groupement-cotraitance";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "cotraitance-groupement-entreprises-devis-b2b";
const BLOG_PATH = "/blog/cotraitance-groupement-entreprises-devis-b2b";
const TOOL_PATH = "/outils/calculateur-repartition-groupement-cotraitance";
const DAY = "2026-11-11";
const DAY_PATHS = ["/blog/cotraitance-groupement-entreprises-devis-b2b", "/outils/calculateur-repartition-groupement-cotraitance"];

assert.equal(BLOG_TOOL_GROUPEMENT_COTRAITANCE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 40);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Calculateur de répartition d'un groupement de cotraitants");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "plusieurs entreprises, un seul devis : douze points contrôlés, la part et le net de chaque membre, l'exposition si l'un fait défaut, la clause et le message.");

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
assert.ok(outilsHub.includes("calculateur-repartition-groupement-cotraitance"));
assert.ok(outilsHub.includes("Calculateur de répartition d'un groupement de cotraitants"));
{
  const start = outilsHub.indexOf("href: \"/outils/calculateur-repartition-groupement-cotraitance\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 8864);
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

for (const rel of ["src/lib/marketing/calculateur-repartition-groupement-cotraitance.ts","src/components/marketing/calculateur-repartition-groupement-cotraitance-calculator.tsx","src/app/(marketing)/outils/calculateur-repartition-groupement-cotraitance/page.tsx","src/content/blog/cotraitance-groupement-entreprises-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, POINTS, MEMBRES, computeGroupement, computeRepartition, computeExposition, formeFaceClient, splitInt, buildRecap, fmtEur, fmtPct, num, dec } = X;\nconst run = (o) => computeGroupement({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point === point);\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\n\n// Statique\nconst numIds = [\"montantTotal\", \"partA\", \"partB\", \"partC\", \"partD\", \"fraisCommuns\", \"remunMandataire\", \"montantNonExecute\"];\nconst selIds = [\"role\", \"forme\", \"formeEcrite\", \"membresCommercants\", \"pouvoir\", \"relation\", \"repartitionDevis\", \"cleFrais\", \"paiement\", \"convention\", \"defaillant\"];\nconst labelMap = {\n  role: \"ROLE_LABELS\", forme: \"FORME_LABELS\", formeEcrite: \"ECRITE_LABELS\", membresCommercants: \"COMMERCANTS_LABELS\", pouvoir: \"POUVOIR_LABELS\",\n  relation: \"RELATION_LABELS\", repartitionDevis: \"REPARTITION_LABELS\", cleFrais: \"CLE_LABELS\", paiement: \"PAIEMENT_LABELS\",\n  convention: \"CONVENTION_LABELS\", defaillant: \"DEFAILLANT_LABELS\"\n};\nassert.strictEqual(Object.keys(DEFAULTS).length, 19);\nassert.strictEqual(numIds.length + selIds.length, 19);\n\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.deepStrictEqual(MEMBRES, [\"A\", \"B\", \"C\", \"D\"]);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\nassert.deepStrictEqual(POINTS, [\"Forme du groupement\", \"Écrit opposable au client\", \"Présomption de solidarité\", \"Mandataire et pouvoirs\", \"Répartition dans le devis\", \"Cohérence des montants\", \"Frais communs\", \"Rémunération du mandataire\", \"Circuit de paiement\", \"Convention de groupement\", \"Cotraitant ou sous-traitant\", \"Défaillance d'un membre\"]);\n\n// Helpers\nassert.strictEqual(fmtEur(47491), \"47 491 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtEur(1234567), \"1 234 567 €\");\nassert.strictEqual(fmtEur(-440), \"\\u2212440 €\");\nassert.strictEqual(fmtPct(54.5454), \"54,5\");\nassert.strictEqual(fmtPct(25), \"25\");\nassert.strictEqual(fmtPct(20.4545), \"20,5\");\nassert.strictEqual(num(\"88 000\", 0, 1e9, 0), 88000);\nassert.strictEqual(num(\"88\\u00a0000\", 0, 1e9, 0), 88000);\nassert.strictEqual(num(\"88\\u202f000\", 0, 1e9, 0), 88000);\nassert.strictEqual(num(\"abc\", 0, 1e9, 7), 7);\nassert.strictEqual(num(\"-5\", 0, 1e9, 0), 0);\nassert.strictEqual(dec(\"2,5\", 0, 20, 0), 2.5);\nassert.strictEqual(dec(\"99\", 0, 20, 0), 20);\nassert.strictEqual(dec(\"x\", 0, 20, 3), 3);\nassert.deepStrictEqual(splitInt(2400, [48000, 22000, 18000, 0]), [1309, 600, 491, 0]);\nassert.deepStrictEqual(splitInt(9000, [48000, 0, 18000, 0]), [6545, 0, 2455, 0]);\nassert.deepStrictEqual(splitInt(100, [1, 1, 1, 0]), [34, 33, 33, 0]);\nassert.deepStrictEqual(splitInt(0, [1, 2]), [0, 0]);\nassert.deepStrictEqual(splitInt(10, [0, 0]), [0, 0]);\nfor (let t = 0; t < 300; t += 7) for (const w of [[3, 5, 7, 0], [1, 1, 1, 1], [10, 0, 0, 0], [999, 1, 0, 2]]) assert.strictEqual(splitInt(t, w).reduce((a, b) => a + b, 0), t, \"somme exacte\");\nassert.strictEqual(formeFaceClient(\"conjoint\", \"devis\", \"oui\"), \"conjoint\");\nassert.strictEqual(formeFaceClient(\"conjoint\", \"convention\", \"oui\"), \"solidaire\");\nassert.strictEqual(formeFaceClient(\"conjoint\", \"convention\", \"non\"), \"conjoint\");\nassert.strictEqual(formeFaceClient(\"nonPrecise\", \"devis\", \"mixte\"), \"solidaire\");\nassert.strictEqual(formeFaceClient(\"solidaire\", \"non\", \"non\"), \"conjoint\");\n\n// Répartition\nconst r0 = computeRepartition([48000, 22000, 18000, 0], 2400, \"prorata\", 2);\nassert.deepStrictEqual(r0.fraisPart, [1309, 600, 491, 0]);\nassert.deepStrictEqual(r0.remun, [0, 440, 360, 0]);\nassert.strictEqual(r0.remunTotal, 800);\nassert.deepStrictEqual(r0.net, [47491, 20960, 17149, 0]);\nassert.strictEqual(r0.somme, 88000); assert.strictEqual(r0.n, 3);\nconst r1 = computeRepartition([48000, 22000, 18000, 0], 2400, \"egale\", 0);\nassert.deepStrictEqual(r1.fraisPart, [800, 800, 800, 0]);\nconst r2 = computeRepartition([0, 0, 0, 0], 500, \"prorata\", 5);\nassert.deepStrictEqual(r2.fraisPart, [0, 0, 0, 0]); assert.deepStrictEqual(r2.pct, [0, 0, 0, 0]); assert.strictEqual(r2.n, 1);\nconst r3 = computeRepartition([0, 0, 0, 0], 500, \"egale\", 5);\nassert.deepStrictEqual(r3.fraisPart, [500, 0, 0, 0]);\nconst e0 = computeExposition([48000, 22000, 18000, 0], [true, true, true, false], \"solidaire\", \"B\", 9000);\nassert.deepStrictEqual(e0.expo, [9000, 0, 9000, 0]); assert.deepStrictEqual(e0.perte, [6545, 0, 2455, 0]);\nconst e1 = computeExposition([48000, 22000, 18000, 0], [true, true, true, false], \"conjoint\", \"B\", 9000);\nassert.deepStrictEqual(e1.expo, [0, 0, 0, 0]); assert.deepStrictEqual(e1.perte, [0, 0, 0, 0]);\nconst e2 = computeExposition([48000, 22000, 18000, 0], [true, true, true, false], \"mandataireSolidaire\", \"A\", 9000);\nassert.deepStrictEqual(e2.expo, [0, 0, 0, 0]);\nconst e3 = computeExposition([48000, 22000, 18000, 0], [true, true, true, false], \"solidaire\", \"D\", 9000);\nassert.strictEqual(e3.k, -1);\nconst e4 = computeExposition([48000, 22000, 18000, 0], [true, true, true, false], \"mandataireSolidaire\", \"C\", 50000);\nassert.strictEqual(e4.m, 18000); assert.strictEqual(e4.plafonne, true); assert.deepStrictEqual(e4.expo, [18000, 0, 0, 0]);\n\n// Défauts (hypothèses d'exemple)\nconst d = run({});\nassert.strictEqual(d.controles.length, 12);\nassert.deepStrictEqual(d.controles.map((c) => c.point), POINTS);\nassert.deepStrictEqual(d.controles.map((c) => c.statut), [\"ok\", \"ok\", \"ok\", \"ok\", \"ok\", \"ok\", \"ok\", \"info\", \"warn\", \"warn\", \"ok\", \"info\"]);\nassert.strictEqual(d.nbOk, 8); assert.strictEqual(d.nbWarn, 2); assert.strictEqual(d.nbBad, 0); assert.strictEqual(d.nbInfo, 2);\nassert.strictEqual(d.etat, \"warn\");\nassert.strictEqual(d.somme, 88000); assert.strictEqual(d.ecart, 0); assert.strictEqual(d.ecartLabel, \"Aucun\");\nassert.strictEqual(d.formeClient, \"mandataireSolidaire\");\nassert.strictEqual(d.formeLabel, \"Groupement conjoint, mandataire solidaire\");\nassert.deepStrictEqual(d.fraisPart, [1309, 600, 491, 0]);\nassert.strictEqual(d.remunTotal, 800);\nassert.deepStrictEqual(d.net, [47491, 20960, 17149, 0]);\nassert.deepStrictEqual(d.expo, [9000, 0, 0, 0]); assert.deepStrictEqual(d.perte, [9000, 0, 0, 0]);\nassert.strictEqual(d.expoMax, 9000); assert.strictEqual(d.expoLabel, \"9 000 €\");\nassert.strictEqual(d.partEgale, 29333);\nassert.strictEqual(d.verdict, \"Aucun point bloquant, 2 à compléter. Face au client : groupement conjoint, mandataire solidaire, 3 membres, 88 000 €. Si le membre B fait défaut sur 9 000 €, un autre membre peut devoir jusqu'à 9 000 € au client.\");\nassert(T(d, \"Forme du groupement\").includes(\"R2142-24\"));\nassert(T(d, \"Présomption de solidarité\").includes(\"1310\"));\nassert(T(d, \"Mandataire et pouvoirs\").includes(\"1984\") && T(d, \"Mandataire et pouvoirs\").includes(\"1989\"));\nassert(T(d, \"Frais communs\").includes(\"A 1 309 €, B 600 €, C 491 €\"));\nassert(T(d, \"Rémunération du mandataire\").includes(\"800 €\") && T(d, \"Rémunération du mandataire\").includes(\"1992\"));\nassert(T(d, \"Circuit de paiement\").includes(\"1993\"));\nassert(T(d, \"Défaillance d'un membre\").includes(\"membre A (mandataire) 9 000 €\") && T(d, \"Défaillance d'un membre\").includes(\"1317 à 1319\"));\nassert.strictEqual(d.repartitionRows.length, 3);\nassert.deepStrictEqual(d.repartitionRows.map((r) => r.remun), [800, -440, -360]);\nassert.strictEqual(d.repartitionRows[1].defaillant, true);\nassert.strictEqual(d.actions.length, 3);\nassert(d.actions[0].includes(\"reversement\")); assert(d.actions[1].includes(\"convention\"));\nassert(d.message.startsWith(\"Objet : groupement pour le devis [référence] : forme, parts et convention\"));\nassert(d.message.includes(\"- membre A (mandataire) : 48 000 € (54,5 %)\") && d.message.includes(\"- membre C : 18 000 € (20,5 %)\"));\nassert.strictEqual(d.clause.split(\"\\n\").length, 7);\nassert(d.clause.includes(\"conjoint avec mandataire solidaire\") && d.clause.includes(\"1310\") && d.clause.includes(\"[10] jours\"));\nassert.strictEqual(d.recap.split(\"\\n\").length, 11);\nassert.strictEqual(buildRecap(d), d.recap);\nassert(d.recap.includes(\"Devis : 88 000 € ; somme des parts 88 000 € ; écart aucun\"));\nassert(d.recap.includes(\"Contrôles : 8 conformes, 2 à compléter, 0 bloquant, 2 informations\"));\n\n// Scénarios ciblés\nconst s1 = run({ forme: \"solidaire\" });\nassert.deepStrictEqual(s1.expo, [9000, 0, 9000, 0]); assert.deepStrictEqual(s1.perte, [6545, 0, 2455, 0]);\nassert.strictEqual(S(s1, \"Circuit de paiement\"), \"info\"); assert(s1.clause.includes(\"1313\"));\nconst s2 = run({ forme: \"conjoint\" });\nassert.deepStrictEqual(s2.expo, [0, 0, 0, 0]); assert(T(s2, \"Défaillance d'un membre\").includes(\"c'est le client qui porte ce risque\"));\nassert(s2.verdict.endsWith(\"aucun autre membre n'en répond envers le client.\"));\nconst s3 = run({ forme: \"conjoint\", formeEcrite: \"convention\" });\nassert.strictEqual(S(s3, \"Écrit opposable au client\"), \"warn\"); assert(T(s3, \"Écrit opposable au client\").includes(\"1199\"));\nassert.strictEqual(s3.formeClient, \"solidaire\"); assert.deepStrictEqual(s3.expo, [9000, 0, 9000, 0]);\nassert.strictEqual(S(s3, \"Présomption de solidarité\"), \"warn\"); assert(T(s3, \"Présomption de solidarité\").includes(\"16-28.133\"));\nconst s4 = run({ forme: \"nonPrecise\" });\nassert.strictEqual(S(s4, \"Forme du groupement\"), \"bad\"); assert.strictEqual(s4.etat, \"bad\");\nassert(s4.verdict.startsWith(\"1 point bloquant : forme du groupement.\"));\nassert(s4.clause.includes(\"[conjoint / conjoint avec mandataire solidaire / solidaire]\"));\nconst s5 = run({ forme: \"nonPrecise\", membresCommercants: \"non\" });\nassert.strictEqual(S(s5, \"Forme du groupement\"), \"warn\"); assert.strictEqual(s5.formeClient, \"conjoint\");\nassert.strictEqual(S(s5, \"Présomption de solidarité\"), \"info\"); assert(T(s5, \"Présomption de solidarité\").includes(\"1309\"));\nconst s6 = run({ formeEcrite: \"non\" });\nassert.strictEqual(S(s6, \"Écrit opposable au client\"), \"bad\");\nconst s7 = run({ membresCommercants: \"mixte\", formeEcrite: \"convention\" });\nassert.strictEqual(S(s7, \"Présomption de solidarité\"), \"warn\"); assert(T(s7, \"Présomption de solidarité\").includes(\"mixte\"));\nconst s8 = run({ pouvoir: \"oral\" });\nassert.strictEqual(S(s8, \"Mandataire et pouvoirs\"), \"warn\"); assert(T(s8, \"Mandataire et pouvoirs\").includes(\"1985\"));\nconst s9 = run({ pouvoir: \"aucun\" });\nassert.strictEqual(S(s9, \"Mandataire et pouvoirs\"), \"bad\");\nconst s10 = run({ repartitionDevis: \"totalSeul\" });\nassert.strictEqual(S(s10, \"Répartition dans le devis\"), \"bad\"); assert(T(s10, \"Répartition dans le devis\").includes(\"29 333 €\") && T(s10, \"Répartition dans le devis\").includes(\"1309\"));\nconst s11 = run({ repartitionDevis: \"totalSeul\", forme: \"solidaire\" });\nassert.strictEqual(S(s11, \"Répartition dans le devis\"), \"warn\"); assert(T(s11, \"Répartition dans le devis\").includes(\"1317\"));\nconst s12 = run({ montantTotal: 90000 });\nassert.strictEqual(S(s12, \"Cohérence des montants\"), \"bad\"); assert(T(s12, \"Cohérence des montants\").includes(\"écart de 2 000 €\")); assert.strictEqual(s12.ecartLabel, \"2 000 €\");\nconst s13 = run({ montantTotal: 87000 });\nassert.strictEqual(s13.ecart, -1000); assert.strictEqual(s13.ecartLabel, \"\\u22121 000 €\");\nconst s14 = run({ montantTotal: 0 });\nassert.strictEqual(S(s14, \"Cohérence des montants\"), \"warn\");\nconst s15 = run({ cleFrais: \"nonPrevue\" });\nassert.strictEqual(S(s15, \"Frais communs\"), \"warn\"); assert(T(s15, \"Frais communs\").includes(\"repère\"));\nconst s16 = run({ fraisCommuns: 0 });\nassert.strictEqual(S(s16, \"Frais communs\"), \"info\"); assert.deepStrictEqual(s16.fraisPart, [0, 0, 0, 0]);\nconst s17 = run({ remunMandataire: 0 });\nassert.strictEqual(S(s17, \"Rémunération du mandataire\"), \"warn\"); assert.strictEqual(s17.remunTotal, 0);\nconst s18 = run({ remunMandataire: 0, forme: \"conjoint\" });\nassert.strictEqual(S(s18, \"Rémunération du mandataire\"), \"info\");\nconst s19 = run({ paiement: \"separes\", convention: \"signee\" });\nassert.strictEqual(s19.etat, \"ok\"); assert.strictEqual(s19.actions.length, 1); assert(s19.verdict.startsWith(\"Aucun point bloquant, rien à compléter.\"));\nassert(s19.clause.includes(\"sur facture de ses propres prestations\"));\nconst s20 = run({ convention: \"aucune\" });\nassert.strictEqual(S(s20, \"Convention de groupement\"), \"bad\");\nconst s21 = run({ relation: \"soustraitance\" });\nassert.strictEqual(S(s21, \"Cotraitant ou sous-traitant\"), \"bad\"); assert(T(s21, \"Cotraitant ou sous-traitant\").includes(\"75-1334\"));\nconst s22 = run({ defaillant: \"aucun\" });\nassert.strictEqual(s22.k, -1); assert.strictEqual(s22.expoLabel, \"Aucun scénario\"); assert(s22.verdict.endsWith(\"Aucun scénario de défaillance.\"));\nconst s23 = run({ defaillant: \"D\" });\nassert(T(s23, \"Défaillance d'un membre\").includes(\"n'a pas de part\"));\nconst s24 = run({ defaillant: \"C\", montantNonExecute: 50000 });\nassert.strictEqual(s24.m, 18000); assert(T(s24, \"Défaillance d'un membre\").includes(\"plafonné\"));\nconst s25 = run({ partD: 12000, montantTotal: 100000, forme: \"solidaire\", defaillant: \"A\" });\nassert.strictEqual(s25.n, 4); assert.deepStrictEqual(s25.expo, [0, 9000, 9000, 9000]);\nassert.strictEqual(s25.perte.reduce((a, b) => a + b, 0), 9000);\nassert(s25.clause.includes(\"[membre D]\"));\nconst s26 = run({ role: \"client\" });\nassert(s26.message.startsWith(\"Objet : devis [référence] présenté par un groupement : précisions avant acceptation\"));\nassert(s26.actions[0].includes(\"Demandez\")); assert(s26.actions[s26.actions.length - 1].includes(\"devis accepté\"));\nconst s26b = run({ role: \"client\", pouvoir: \"aucun\" });\nassert(s26b.verdict.endsWith(\"À faire préciser avant d'accepter le devis.\"));\nconst s27 = run({ role: \"cotraitant\" });\nassert(s27.message.startsWith(\"Objet : groupement pour le devis [référence] : points à confirmer avant l'envoi\"));\nconst junk = run({ montantTotal: \"abc\", partA: \"x\", partB: \"\", partC: \"-4\", partD: null, fraisCommuns: \"y\", remunMandataire: \"z\", montantNonExecute: \"?\", role: \"zzz\", forme: \"?\", defaillant: null });\nassert.strictEqual(junk.montantTotal, 0); assert.strictEqual(junk.role, \"mandataire\"); assert.strictEqual(junk.forme, \"mandataireSolidaire\"); assert.strictEqual(junk.defaillant, \"B\");\nassert(!/NaN|undefined|\\bnull\\b|Infinity/.test(junk.recap + junk.verdict + junk.message + junk.clause));\nconst big = run({ montantTotal: \"99999999999\" });\nassert.strictEqual(big.montantTotal, 1000000000);\n\n")(tool, require, console);
console.log("seo-pm-20261111 ok");
