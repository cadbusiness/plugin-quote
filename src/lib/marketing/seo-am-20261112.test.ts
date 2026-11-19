import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_RECEPTION_TRAVAUX, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-reception-travaux-reserves";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "reception-travaux-proces-verbal-reserves-devis-b2b";
const BLOG_PATH = "/blog/reception-travaux-proces-verbal-reserves-devis-b2b";
const TOOL_PATH = "/outils/verificateur-reception-travaux-reserves";
const DAY = "2026-11-12";
const DAY_PATHS = ["/blog/reception-travaux-proces-verbal-reserves-devis-b2b", "/secteurs/funnel-devis-mezzanine-plateforme-industrielle", "/outils/verificateur-reception-travaux-reserves"];

assert.equal(BLOG_TOOL_RECEPTION_TRAVAUX, TOOL_PATH);
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
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de réception des travaux et des réserves");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Procès-verbal, réserves, levée, garanties et retenue : douze points contrôlés, les dates calculées, la clause et le message.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-mezzanine-plateforme-industrielle")?.priority, 0.8);

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
assert.ok(outilsHub.includes("verificateur-reception-travaux-reserves"));
assert.ok(outilsHub.includes("Vérificateur de réception des travaux et des réserves"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-reception-travaux-reserves\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-mezzanine-plateforme-industrielle"));
assert.ok(secteursHub.includes("Mezzanine et plateforme industrielle"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 8039);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-mezzanine-plateforme-industrielle.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-mezzanine-plateforme-industrielle/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 6056);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Mezzanine et plateforme industrielle"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/verificateur-reception-travaux-reserves.ts","src/components/marketing/verificateur-reception-travaux-reserves-calculator.tsx","src/app/(marketing)/outils/verificateur-reception-travaux-reserves/page.tsx","src/content/blog/reception-travaux-proces-verbal-reserves-devis-b2b.md","src/content/blog/funnel-devis-mezzanine-plateforme-industrielle.md","src/app/(marketing)/secteurs/funnel-devis-mezzanine-plateforme-industrielle/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, POINTS, computeReception, computeDelais, buildRecap, fmtEur, fmtDate, fmtPct, parseDate, num, dec, daysBetween, addDays, addYears } = X;\nconst run = (o) => computeReception({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point === point);\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\n\n// Statique\nconst numIds = [\"montant\", \"nbReserves\", \"delaiLevee\", \"retenue\"];\nconst dateIds = [\"dateFin\", \"dateControle\", \"dateReception\"];\nconst selIds = [\"role\", \"nature\", \"forme\", \"convocation\", \"reserves\", \"levee\", \"garantieRetenue\", \"clauseGaranties\"];\nconst labelMap = {\n  role: \"ROLE_LABELS\", nature: \"NATURE_LABELS\", forme: \"FORME_LABELS\", convocation: \"CONVOC_LABELS\",\n  reserves: \"RESERVES_LABELS\", levee: \"LEVEE_LABELS\", garantieRetenue: \"GARANTIE_LABELS\", clauseGaranties: \"CLAUSE_LABELS\"\n};\nassert.strictEqual(Object.keys(DEFAULTS).length, 15);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 15);\n\n\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.strictEqual(X.PLAFOND_RETENUE, 5);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\nassert.deepStrictEqual(POINTS, [\"Forme de la réception\", \"Caractère contradictoire\", \"Date de réception\", \"Réserves\", \"Levée des réserves\", \"Garantie de parfait achèvement\", \"Garantie de bon fonctionnement\", \"Responsabilité décennale\", \"Retenue de garantie\", \"Libération de la retenue\", \"Transfert des risques\", \"Clause du devis\"]);\n\n// Helpers\nassert.strictEqual(fmtEur(3200), \"3 200 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtEur(1234567), \"1 234 567 €\");\nassert.strictEqual(fmtEur(-50), \"\\u2212\" + \"50 €\");\nassert.strictEqual(fmtPct(5), \"5\");\nassert.strictEqual(fmtPct(2.55), \"2,6\");\nassert.strictEqual(fmtPct(7.5), \"7,5\");\nassert.deepStrictEqual(parseDate(\"2026-12-11\"), { y: 2026, m: 12, d: 11 });\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\nassert.strictEqual(parseDate(\"2026-13-01\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.strictEqual(parseDate(null), null);\nassert.strictEqual(parseDate(\"11/12/2026\"), null);\nassert.strictEqual(fmtDate({ y: 2027, m: 1, d: 1 }), \"1er janvier 2027\");\nassert.strictEqual(fmtDate({ y: 2026, m: 12, d: 11 }), \"11 décembre 2026\");\nassert.strictEqual(fmtDate(null), \"\");\nassert.strictEqual(daysBetween({ y: 2026, m: 12, d: 4 }, { y: 2026, m: 12, d: 11 }), 7);\nassert.strictEqual(daysBetween({ y: 2026, m: 12, d: 18 }, { y: 2027, m: 1, d: 10 }), 23);\nassert.deepStrictEqual(addDays({ y: 2026, m: 12, d: 11 }, 30), { y: 2027, m: 1, d: 10 });\nassert.deepStrictEqual(addDays({ y: 2028, m: 2, d: 28 }, 1), { y: 2028, m: 2, d: 29 });\nassert.deepStrictEqual(addYears({ y: 2026, m: 12, d: 11 }, 10), { y: 2036, m: 12, d: 11 });\nassert.deepStrictEqual(addYears({ y: 2028, m: 2, d: 29 }, 1), { y: 2029, m: 2, d: 28 });\nassert.deepStrictEqual(addYears({ y: 2028, m: 2, d: 29 }, 4), { y: 2032, m: 2, d: 29 });\nassert.strictEqual(num(\"64 000\", 0, 1e9, 0), 64000);\nassert.strictEqual(num(\"64\\u00a0000\", 0, 1e9, 0), 64000);\nassert.strictEqual(num(\"abc\", 0, 10, 7), 7);\nassert.strictEqual(num(\"-3\", 0, 10, 7), 0);\nassert.strictEqual(num(\"999\", 0, 365, 0), 365);\nassert.strictEqual(dec(\"2,5\", 0, 100, 0), 2.5);\nassert.strictEqual(dec(\"\", 0, 100, 4), 4);\n\n// Délais\nconst dl = computeDelais({ y: 2026, m: 12, d: 11 }, 30);\nassert.deepStrictEqual(dl.levee, { y: 2027, m: 1, d: 10 });\nassert.deepStrictEqual(dl.gpa, { y: 2027, m: 12, d: 11 });\nassert.deepStrictEqual(dl.biennale, { y: 2028, m: 12, d: 11 });\nassert.deepStrictEqual(dl.decennale, { y: 2036, m: 12, d: 11 });\nassert.deepStrictEqual(dl.liberation, { y: 2027, m: 12, d: 11 });\nassert.strictEqual(computeDelais({ y: 2026, m: 12, d: 11 }, 0).levee, null);\nassert.strictEqual(computeDelais(null, 30).gpa, null);\n\n// Défauts (hypothèses d'exemple)\nconst d = run({});\nassert.deepStrictEqual(d.controles.map((c) => c.statut), [\"ok\", \"ok\", \"ok\", \"info\", \"warn\", \"info\", \"info\", \"info\", \"ok\", \"info\", \"ok\", \"ok\"]);\nassert.strictEqual(d.nbOk, 6); assert.strictEqual(d.nbWarn, 1); assert.strictEqual(d.nbBad, 0); assert.strictEqual(d.nbInfo, 5);\nassert.strictEqual(d.etat, \"warn\");\nassert.strictEqual(d.retenueEur, 3200);\nassert.strictEqual(d.recLabel, \"11 décembre 2026\");\nassert.strictEqual(d.leveeLabel, \"10 janvier 2027\");\nassert.strictEqual(d.gpaLabel, \"11 décembre 2027\");\nassert.strictEqual(d.decLabel, \"11 décembre 2036\");\nassert.strictEqual(d.retenueLabel, \"3 200 € (5 %)\");\nassert.strictEqual(d.libLabel, \"11 décembre 2027\");\nassert.strictEqual(d.verdict, \"Aucun point bloquant, 1 à compléter. Réception du 11 décembre 2026 : 3 réserves à lever avant le 10 janvier 2027, garantie de parfait achèvement jusqu'au 11 décembre 2027.\");\nassert(T(d, \"Date de réception\").includes(\"7 jours après la fin des travaux annoncée\"));\nassert(T(d, \"Levée des réserves\").includes(\"23 jours restants au 18 décembre 2026\"));\nassert(T(d, \"Garantie de parfait achèvement\").includes(\"358 jours restants\"));\nassert(T(d, \"Garantie de bon fonctionnement\").includes(\"11 décembre 2028\"));\nassert(T(d, \"Responsabilité décennale\").includes(\"L241-1\"));\nassert(T(d, \"Libération de la retenue\").startsWith(\"Le 11 décembre 2027\"));\nassert.strictEqual(d.clause.split(\"\\n\").length, 7);\nassert(d.clause.includes(\"[30] jours\"));\nassert(d.clause.includes(\"71-584\"));\nassert(d.clause.includes(\"1792 à 1792-6\"));\nassert.strictEqual(d.actions.length, 2);\nassert(d.message.startsWith(\"Objet : chantier [référence] : réception du 11 décembre 2026 et suite\"));\nassert(d.message.includes(\"les 3 réserves listées\"));\nassert(d.message.includes(\"3 200 €\"));\nassert(d.message.endsWith(\"Cordialement\"));\nassert.strictEqual(d.recap.split(\"\\n\").length, 11);\nassert.strictEqual(d.recap.split(\"\\n\")[10], \"Calcul : quotebuilder.co/outils/\" + SLUG);\nassert.strictEqual(buildRecap(d), d.recap);\nassert(d.recap.includes(\"Contrôles : 6 conformes, 1 à compléter, 0 bloquant, 5 informations\"));\n\n// Scénarios ciblés\nconst s1 = run({ forme: \"aucune\" });\nassert.strictEqual(S(s1, \"Forme de la réception\"), \"bad\");\nassert.strictEqual(S(s1, \"Caractère contradictoire\"), \"warn\");\nassert.strictEqual(S(s1, \"Libération de la retenue\"), \"warn\");\nassert.strictEqual(S(s1, \"Transfert des risques\"), \"warn\");\nassert(T(s1, \"Transfert des risques\").includes(\"1788\"));\nassert.strictEqual(s1.recLabel, \"Pas de réception\");\nassert.strictEqual(s1.gpaLabel, \"Ne court pas\");\nassert.strictEqual(s1.libLabel, \"Bloquée\");\nassert(s1.message.startsWith(\"Objet : chantier [référence] : demande de réception des travaux\"));\nassert(s1.message.includes(\"4 décembre 2026\"));\nassert(s1.verdict.startsWith(\"1 point bloquant : forme de la réception.\"));\nconst s2 = run({ forme: \"pvMaitre\", convocation: \"aucune\" });\nassert.strictEqual(S(s2, \"Forme de la réception\"), \"warn\");\nassert.strictEqual(S(s2, \"Caractère contradictoire\"), \"bad\");\nconst s3 = run({ forme: \"pv\", convocation: \"aucune\" });\nassert.strictEqual(S(s3, \"Caractère contradictoire\"), \"info\");\nconst s4 = run({ convocation: \"orale\" });\nassert.strictEqual(S(s4, \"Caractère contradictoire\"), \"warn\");\nconst s5 = run({ forme: \"tacite\" });\nassert.strictEqual(S(s5, \"Forme de la réception\"), \"warn\");\nassert.strictEqual(S(s5, \"Caractère contradictoire\"), \"info\");\nconst s6 = run({ forme: \"judiciaire\" });\nassert.strictEqual(S(s6, \"Forme de la réception\"), \"info\");\nconst s7 = run({ dateReception: \"\" });\nassert.strictEqual(S(s7, \"Date de réception\"), \"bad\");\nassert.strictEqual(s7.recLabel, \"Non datée\");\nassert.strictEqual(S(s7, \"Libération de la retenue\"), \"warn\");\nassert.strictEqual(s7.leveeLabel, \"Non calculé\");\nconst s8 = run({ dateReception: \"2026-11-30\" });\nassert.strictEqual(S(s8, \"Date de réception\"), \"warn\");\nconst s9 = run({ reserves: \"aucune\" });\nassert.strictEqual(S(s9, \"Réserves\"), \"ok\");\nassert.strictEqual(S(s9, \"Levée des réserves\"), \"info\");\nassert.strictEqual(s9.etat, \"ok\");\nassert(s9.verdict.includes(\"sans réserves\"));\nconst s10 = run({ nbReserves: 0 });\nassert.strictEqual(S(s10, \"Réserves\"), \"warn\");\nconst s11 = run({ reserves: \"majeures\" });\nassert.strictEqual(S(s11, \"Réserves\"), \"warn\");\nconst s12 = run({ delaiLevee: 0 });\nassert.strictEqual(S(s12, \"Levée des réserves\"), \"warn\");\nassert.strictEqual(s12.leveeLabel, \"Délai non fixé\");\nassert(s12.clause.includes(\"[30] jours\"));\nconst s13 = run({ dateControle: \"2027-01-25\" });\nassert.strictEqual(S(s13, \"Levée des réserves\"), \"bad\");\nassert(T(s13, \"Levée des réserves\").includes(\"15 jours\"));\nconst s13m = run({ dateControle: \"2027-01-25\", role: \"maitre\" });\nassert(s13m.message.includes(\"mise en demeure\") || s13m.message.includes(\"mettons en demeure\"));\nconst s14 = run({ levee: \"levees\", dateControle: \"2027-01-25\" });\nassert.strictEqual(S(s14, \"Levée des réserves\"), \"ok\");\nassert.strictEqual(s14.etat, \"ok\");\nconst s15 = run({ dateControle: \"2027-12-20\" });\nassert(T(s15, \"Garantie de parfait achèvement\").startsWith(\"Expirée le 11 décembre 2027\"));\nassert(T(s15, \"Libération de la retenue\").startsWith(\"Libérable depuis le 11 décembre 2027\"));\nconst s16 = run({ retenue: 10 });\nassert.strictEqual(S(s16, \"Retenue de garantie\"), \"bad\");\nassert.strictEqual(s16.retenueEur, 6400);\nassert(s16.clause.includes(\"5 % au plus\"));\nconst s17 = run({ retenue: 10, nature: \"hors\" });\nassert.strictEqual(S(s17, \"Retenue de garantie\"), \"warn\");\nconst s18 = run({ garantieRetenue: \"nonConsignee\" });\nassert.strictEqual(S(s18, \"Retenue de garantie\"), \"warn\");\nconst s19 = run({ retenue: 0 });\nassert.strictEqual(S(s19, \"Retenue de garantie\"), \"info\");\nassert.strictEqual(s19.libLabel, \"Sans objet\");\nassert(s19.clause.includes(\"Aucune retenue de garantie\"));\nconst s20 = run({ clauseGaranties: \"limitative\" });\nassert.strictEqual(S(s20, \"Clause du devis\"), \"bad\");\nassert(T(s20, \"Clause du devis\").includes(\"1792-5\"));\nconst s21 = run({ clauseGaranties: \"limitative\", nature: \"pro\" });\nassert.strictEqual(S(s21, \"Clause du devis\"), \"info\");\nassert(T(s21, \"Garantie de bon fonctionnement\").includes(\"1792-7\"));\nassert(s21.clause.includes(\"[12] mois\"));\nconst s22 = run({ nature: \"hors\" });\nassert(T(s22, \"Garantie de parfait achèvement\").includes(\"garantie écrite au devis\"));\nassert.strictEqual(s22.decLabel, \"Non applicable\");\nconst s23 = run({ nature: \"equipement\" });\nassert(T(s23, \"Responsabilité décennale\").includes(\"1792-2\"));\nconst s24 = run({ role: \"maitre\" });\nassert(s24.message.startsWith(\"Objet : chantier [référence] : réserves du procès-verbal du 11 décembre 2026\"));\nassert(T(s24, \"Libération de la retenue\").includes(\"opposition abusive\"));\nconst s25 = run({ role: \"maitre\", reserves: \"aucune\" });\nassert(s25.message.includes(\"d'ici le 11 décembre 2027\"));\nconst s26 = run({ role: \"maitre\", reserves: \"aucune\", dateReception: \"x\" });\nassert(s26.message.includes(\"dans l'année qui suit la réception\"));\nconst s27 = run({ role: \"maitre\", forme: \"aucune\" });\nassert(s27.message.includes(\"visite de réception contradictoire\"));\nconst s28 = run({ dateReception: \"2028-02-29\" , dateFin: \"2028-02-20\", dateControle: \"2028-03-01\" });\nassert.strictEqual(s28.gpaLabel, \"28 février 2029\");\nconst s29 = run({ dateFin: \"\" });\nassert.strictEqual(T(s29, \"Date de réception\"), \"Réception le 11 décembre 2026.\");\nconst junk = run({ montant: \"abc\", nbReserves: \"x\", delaiLevee: \"\", retenue: \"-4\", role: \"zzz\", forme: \"?\", reserves: null, dateControle: \"nope\" });\nassert.strictEqual(junk.montant, 0); assert.strictEqual(junk.retenue, 0); assert.strictEqual(junk.role, \"entreprise\"); assert.strictEqual(junk.forme, \"pv\");\nconst big = run({ montant: \"99999999999\" });\nassert.strictEqual(big.montant, 1000000000);\nassert.strictEqual(big.retenueEur, 50000000);\n\n")(tool, require, console);
console.log("seo-am-20261112 ok");
