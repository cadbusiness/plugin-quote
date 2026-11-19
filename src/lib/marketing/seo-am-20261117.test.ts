import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_INTERETS_MORATOIRES, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./calculateur-interets-moratoires-marche-public";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "devis-acheteur-public-marche-sans-publicite-b2b";
const BLOG_PATH = "/blog/devis-acheteur-public-marche-sans-publicite-b2b";
const TOOL_PATH = "/outils/calculateur-interets-moratoires-marche-public";
const DAY = "2026-11-17";
const DAY_PATHS = ["/blog/devis-acheteur-public-marche-sans-publicite-b2b", "/secteurs/funnel-devis-sol-industriel-resine-marquage", "/outils/calculateur-interets-moratoires-marche-public"];

assert.equal(BLOG_TOOL_INTERETS_MORATOIRES, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 39);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Calculateur d'intérêts moratoires (marché public)");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Mairie, hôpital, établissement public : échéance, jours de retard, taux BCE plus 8 points, intérêts, indemnité de 40 €, la clause et le message.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-sol-industriel-resine-marquage")?.priority, 0.8);

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
assert.ok(outilsHub.includes("calculateur-interets-moratoires-marche-public"));
assert.ok(outilsHub.includes("Calculateur d'intérêts moratoires (marché public)"));
{
  const start = outilsHub.indexOf("href: \"/outils/calculateur-interets-moratoires-marche-public\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-sol-industriel-resine-marquage"));
assert.ok(secteursHub.includes("Sol industriel, résine et marquage au sol"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 7855);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-sol-industriel-resine-marquage.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-sol-industriel-resine-marquage/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 6316);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Sol industriel, résine et marquage au sol"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/calculateur-interets-moratoires-marche-public.ts","src/components/marketing/calculateur-interets-moratoires-marche-public-calculator.tsx","src/app/(marketing)/outils/calculateur-interets-moratoires-marche-public/page.tsx","src/content/blog/devis-acheteur-public-marche-sans-publicite-b2b.md","src/content/blog/funnel-devis-sol-industriel-resine-marquage.md","src/app/(marketing)/secteurs/funnel-devis-sol-industriel-resine-marquage/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, POINTS, LABEL_SETS, STATUT_LABELS, BCE_TABLE, DELAI_REGLEMENTAIRE, computeMoratoires, normalize, buildRecap, fmtEur, fmtTaux, fmtDate, parseDate, isoDate, addDays, diffDays, reportOuvre, dec, num } = X;\nconst run = (o) => computeMoratoires({ ...DEFAULTS, ...o });\nconst S = (r) => r.controles.map((c) => c.statut).join(\",\");\nconst T = (r, i) => r.controles[i].texte;\n\n// Statique\nassert.strictEqual(X.SLUG, SLUG);\nassert.strictEqual(Object.keys(DEFAULTS).length, 16);\nassert.strictEqual(POINTS.length, 10);\nconst numIds = [\"montantMarcheHT\", \"dureeMois\", \"delaiMarche\", \"montantTTC\", \"retenue\", \"tauxBce\", \"frais\"];\nconst dateIds = [\"dateServiceFait\", \"dateReception\", \"datePaiement\", \"dateNotif\", \"datePieces\"];\nconst selIds = Object.keys(LABEL_SETS);\nassert.deepStrictEqual(selIds, [\"acheteur\", \"nature\", \"depot\", \"interruption\"]);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 16);\n\n\n\n\n\n\n\n// Utilitaires\nassert.strictEqual(fmtEur(18464), \"184,64 €\");\nassert.strictEqual(fmtEur(2160000), \"21 600 €\");\nassert.strictEqual(fmtEur(4000), \"40 €\");\nassert.strictEqual(fmtEur(4505), \"45,05 €\");\nassert.strictEqual(fmtEur(123456789), \"1 234 567,89 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtTaux(1040), \"10,40 %\");\nassert.strictEqual(fmtTaux(240), \"2,40 %\");\nassert.strictEqual(fmtTaux(1000), \"10 %\");\nassert.strictEqual(fmtTaux(805), \"8,05 %\");\nassert.strictEqual(dec(\"21 600,50\", 1e8), 2160050);\nassert.strictEqual(dec(\"21\\u00a0600\", 1e8), 2160000);\nassert.strictEqual(dec(\"-5\", 1e8), 0);\nassert.strictEqual(dec(\"abc\", 1e8), 0);\nassert.strictEqual(dec(\"999999999\", 1e8), 1e10);\nassert.strictEqual(num(\"30\", 365), 30);\nassert.strictEqual(num(\"400\", 365), 365);\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.strictEqual(isoDate(parseDate(\"2026-09-14\")), \"2026-09-14\");\nassert.strictEqual(fmtDate(parseDate(\"2026-11-17\")), \"mardi 17 novembre 2026\");\nassert.strictEqual(fmtDate(parseDate(\"2026-07-01\")), \"mercredi 1er juillet 2026\");\nassert.strictEqual(fmtDate(null), \"[date]\");\nassert.strictEqual(isoDate(addDays(parseDate(\"2026-09-14\"), 30)), \"2026-10-14\");\nassert.strictEqual(diffDays(parseDate(\"2026-11-13\"), parseDate(\"2026-10-14\")), 30);\nassert.strictEqual(isoDate(reportOuvre(parseDate(\"2026-11-01\"))), \"2026-11-02\");\nassert.strictEqual(isoDate(reportOuvre(parseDate(\"2026-10-31\"))), \"2026-11-02\");\nassert.strictEqual(isoDate(reportOuvre(parseDate(\"2026-10-30\"))), \"2026-10-30\");\nassert.deepStrictEqual(DELAI_REGLEMENTAIRE, { collectivite: 30, sante: 50, entreprise_publique: 60 });\nassert.deepStrictEqual(BCE_TABLE, { \"2024-1\": 450, \"2024-2\": 425, \"2025-1\": 315, \"2025-2\": 215, \"2026-1\": 215, \"2026-2\": 240 });\n\n// Défauts : exemple de l'article\nconst d = run({});\nassert.strictEqual(S(d), \"info,ok,ok,ok,ok,warn,ok,info,info,info\");\nassert.strictEqual(d.nbOk, 5); assert.strictEqual(d.nbWarn, 1); assert.strictEqual(d.nbBad, 0); assert.strictEqual(d.nbInfo, 4);\nassert.strictEqual(d.etat, \"warn\");\nassert.strictEqual(d.delai, 30);\nassert.strictEqual(isoDate(d.depart), \"2026-09-14\");\nassert.strictEqual(isoDate(d.echeance), \"2026-10-14\");\nassert.strictEqual(d.retard, 30);\nassert.strictEqual(d.tauxBceC, 240); assert.strictEqual(d.tauxC, 1040); assert.strictEqual(d.tauxSource, \"table\");\nassert.strictEqual(d.baseCents, 2160000);\nassert.strictEqual(d.interetsCents, 18464);\nassert.strictEqual(d.indemniteCents, 4000);\nassert.strictEqual(d.totalCents, 22464);\nassert.strictEqual(isoDate(d.dateLimiteVersement), \"2026-12-28\");\nassert.strictEqual(d.echeanceLabel, \"mercredi 14 octobre 2026\");\nassert.strictEqual(d.retardLabel, \"30 jours\");\nassert.strictEqual(d.tauxLabel, \"10,40 % (BCE 2,40 % + 8 points)\");\nassert.strictEqual(d.interetsLabel, \"184,64 €\");\nassert.strictEqual(d.indemniteLabel, \"40 €\");\nassert.strictEqual(d.totalLabel, \"224,64 €\");\nassert.strictEqual(d.compteursLabel, \"0 / 1\");\nassert.strictEqual(d.verdict, \"Aucun point bloquant, 1 à compléter. Intérêts moratoires : 184,64 €, indemnité forfaitaire : 40 €, total : 224,64 €.\");\nassert.strictEqual(d.clause.split(\"\\n\").length, 7);\nassert.strictEqual(d.clause.split(\"\\n\")[0], \"Article [X] : Paiement et retard de paiement (acheteur public)\");\nassert.strictEqual(d.actions.length, 4);\nassert.strictEqual(d.recap.split(\"\\n\").length, 11);\nassert.strictEqual(d.recap.split(\"\\n\")[10], \"Calcul : quotebuilder.co/outils/\" + SLUG);\nassert.strictEqual(buildRecap(DEFAULTS), d.recap);\nassert(d.message.includes(\"224,64 €\") && d.message.includes(\"lundi 28 décembre 2026\"));\nassert(T(d, 9).includes(\"sous 100 000 € HT\"));\nassert(T(d, 6).includes(\"mercredi 1er juillet 2026\"));\n\n// Hôpital, marché muet : 50 jours, 10 jours de retard\nconst h = run({ acheteur: \"sante\", delaiMarche: \"0\" });\nassert.strictEqual(h.delai, 50);\nassert.strictEqual(isoDate(h.echeance), \"2026-11-03\");\nassert.strictEqual(h.retard, 10);\nassert.strictEqual(h.interetsCents, 6155);\nassert.strictEqual(h.totalLabel, \"101,55 €\");\nassert.strictEqual(h.controles[1].statut, \"info\");\n// Hôpital avec un marché à 30 jours : le délai écrit, plus court, s'applique\nassert.strictEqual(run({ acheteur: \"sante\" }).delai, 30);\n// Entreprise publique : 60 jours, payé dans le délai\nconst ep = run({ acheteur: \"entreprise_publique\", delaiMarche: \"0\" });\nassert.strictEqual(isoDate(ep.echeance), \"2026-11-13\");\nassert.strictEqual(ep.retard, 0);\nassert.strictEqual(ep.totalCents, 0);\nassert(ep.verdict.endsWith(\"Payé dans le délai : rien à réclamer.\"));\nassert(ep.message.startsWith(\"Objet : références de facturation\"));\n// Délai du marché trop long\nconst lg = run({ delaiMarche: \"45\" });\nassert.strictEqual(lg.controles[1].statut, \"warn\");\nassert.strictEqual(lg.delai, 30);\n// Interruption unique : nouveau délai de 30 jours, échéance dimanche reportée au lundi\nconst it = run({ interruption: \"une\", dateNotif: \"2026-09-25\", datePieces: \"2026-10-02\" });\nassert.strictEqual(it.nouveauDelai, 30);\nassert.strictEqual(isoDate(it.echeance), \"2026-11-02\");\nassert.strictEqual(it.echeanceReportee, true);\nassert.strictEqual(it.retard, 11);\nassert.strictEqual(it.interetsCents, 6770);\nassert.strictEqual(it.totalLabel, \"107,70 €\");\nassert.strictEqual(it.controles[4].statut, \"info\");\nassert(T(it, 5).includes(\"reporté au lundi\"));\n// Hôpital interrompu tôt : solde supérieur à 30 jours conservé\nconst hi = run({ acheteur: \"sante\", delaiMarche: \"0\", interruption: \"une\", dateNotif: \"2026-09-18\", datePieces: \"2026-09-21\" });\nassert.strictEqual(hi.nouveauDelai, 46);\nassert.strictEqual(isoDate(hi.echeance), \"2026-11-06\");\n// Plusieurs interruptions\nassert.strictEqual(run({ interruption: \"plusieurs\", dateNotif: \"2026-09-25\", datePieces: \"2026-10-02\" }).controles[4].statut, \"warn\");\n// Interruption tardive\nassert.strictEqual(run({ interruption: \"une\", dateNotif: \"2026-10-20\", datePieces: \"2026-10-22\" }).controles[4].statut, \"warn\");\n// Interruption sans dates, ou incohérente\nassert.strictEqual(run({ interruption: \"une\" }).controles[4].statut, \"bad\");\nassert.strictEqual(run({ interruption: \"une\", dateNotif: \"2026-10-02\", datePieces: \"2026-09-25\" }).controles[4].statut, \"bad\");\n// Facture reçue avant la fin des travaux\nconst av = run({ dateServiceFait: \"2026-09-18\" });\nassert.strictEqual(av.controles[3].statut, \"warn\");\nassert.strictEqual(isoDate(av.depart), \"2026-09-18\");\nassert.strictEqual(isoDate(av.echeance), \"2026-10-19\");\n// Fin des travaux inconnue\nassert.strictEqual(run({ dateServiceFait: \"\" }).controles[3].statut, \"warn\");\n// Dates manquantes\nconst nr = run({ dateReception: \"\" });\nassert.strictEqual(nr.controles[3].statut, \"bad\");\nassert.strictEqual(nr.etat, \"bad\");\nassert.strictEqual(nr.retard, null);\nassert.strictEqual(nr.verdict, \"1 point bloquant : complétez ou corrigez avant de réclamer quoi que ce soit.\");\nassert.strictEqual(run({ datePaiement: \"\" }).controles[5].statut, \"bad\");\nassert.strictEqual(run({ datePaiement: \"2026-09-01\" }).controles[5].statut, \"bad\");\n// Taux inconnu (intérêts qui courent en 2027), puis taux saisi\nconst t27 = run({ dateReception: \"2026-12-14\", dateServiceFait: \"2026-12-11\", datePaiement: \"2027-02-10\" });\nassert.strictEqual(t27.controles[6].statut, \"bad\");\nassert.strictEqual(t27.tauxLabel, \"À saisir\");\nassert.strictEqual(t27.interetsCents, 0);\nconst t27s = run({ dateReception: \"2026-12-14\", dateServiceFait: \"2026-12-11\", datePaiement: \"2027-02-10\", tauxBce: \"2,65\" });\nassert.strictEqual(t27s.controles[6].statut, \"info\");\nassert.strictEqual(t27s.tauxC, 1065);\nassert.strictEqual(isoDate(t27s.echeance), \"2027-01-13\");\nassert.strictEqual(t27s.retard, 28);\nassert.strictEqual(t27s.interetsCents, Math.round(2160000 * 1065 * 28 / 3650000));\n// Semestre 2026-1\nconst s1 = run({ dateServiceFait: \"2026-02-02\", dateReception: \"2026-02-03\", datePaiement: \"2026-03-20\" });\nassert.strictEqual(s1.tauxC, 1015);\n// Retenue de garantie\nconst rg = run({ retenue: \"1080\" });\nassert.strictEqual(rg.baseCents, 2052000);\nassert.strictEqual(rg.interetsCents, 17540);\nassert.strictEqual(run({ retenue: \"30000\" }).controles[7].statut, \"bad\");\nassert.strictEqual(run({ montantTTC: \"0\" }).controles[7].statut, \"bad\");\n// Frais complémentaires\nconst fr = run({ frais: \"640\" });\nassert.strictEqual(fr.complementCents, 60000);\nassert.strictEqual(fr.totalCents, 18464 + 4000 + 60000);\nassert.strictEqual(fr.indemniteLabel, \"640 €\");\n// Transmission\nassert.strictEqual(run({ depot: \"email\" }).controles[2].statut, \"warn\");\nassert.strictEqual(run({ depot: \"plateforme\" }).controles[2].statut, \"warn\");\nassert.strictEqual(run({ depot: \"plateforme\", nature: \"fournitures_services\" }).controles[2].statut, \"ok\");\n// Avance obligatoire\nconst avc = run({ montantMarcheHT: \"80000\", dureeMois: \"4\" });\nassert.strictEqual(avc.controles[9].statut, \"warn\");\nassert.strictEqual(avc.avanceDue, true);\nassert(avc.clause.includes(\"R2191-3\"));\nassert.strictEqual(run({ montantMarcheHT: \"80000\", dureeMois: \"2\" }).avanceDue, false);\nassert(T(run({ montantMarcheHT: \"70000\", nature: \"fournitures_services\" }), 9).includes(\"à partir de 60 000 € HT\"));\nassert(T(run({ montantMarcheHT: \"30000\" }), 9).startsWith(\"Écrit obligatoire\"));\nassert.strictEqual(run({ montantMarcheHT: \"0\" }).controles[9].statut, \"info\");\n// Client privé\nconst pv = run({ acheteur: \"prive\" });\nassert.strictEqual(pv.controles[0].statut, \"bad\");\nassert.strictEqual(pv.retard, null);\nassert.strictEqual(pv.totalCents, 0);\nassert(pv.verdict.startsWith(\"Client privé\"));\nassert.strictEqual(pv.clause.split(\"\\n\").length, 7);\n// Valeurs invalides ramenées aux défauts\nconst inv = normalize({ acheteur: \"x\", nature: \"y\", depot: \"z\", interruption: \"w\" });\nassert.deepStrictEqual([inv.acheteur, inv.nature, inv.depot, inv.interruption], [\"collectivite\", \"travaux\", \"chorus\", \"non\"]);\n\n")(tool, require, console);
console.log("seo-am-20261117 ok");
