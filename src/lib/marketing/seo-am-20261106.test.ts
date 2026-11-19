import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_RESOLUTOIRE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-clause-resolutoire";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "clause-resolutoire-devis-b2b";
const BLOG_PATH = "/blog/clause-resolutoire-devis-b2b";
const TOOL_PATH = "/outils/verificateur-clause-resolutoire";
const DAY = "2026-11-06";
const DAY_PATHS = ["/blog/clause-resolutoire-devis-b2b", "/secteurs/funnel-devis-peinture-entreprise", "/outils/verificateur-clause-resolutoire"];

assert.equal(BLOG_TOOL_RESOLUTOIRE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 29);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de clause résolutoire");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Clause 1225, notification 1226 ou juge : mise en demeure, délai de régularisation, clause rédigée et actions.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-peinture-entreprise")?.priority, 0.8);

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
assert.ok(outilsHub.includes("verificateur-clause-resolutoire"));
assert.ok(outilsHub.includes("Vérificateur de clause résolutoire"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-clause-resolutoire\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-peinture-entreprise"));
assert.ok(secteursHub.includes("Peinture entreprise"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 6394);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-peinture-entreprise.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-peinture-entreprise/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 5044);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Peinture entreprise"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/verificateur-clause-resolutoire.ts","src/components/marketing/verificateur-clause-resolutoire-calculator.tsx","src/app/(marketing)/outils/verificateur-clause-resolutoire/page.tsx","src/content/blog/clause-resolutoire-devis-b2b.md","src/content/blog/funnel-devis-peinture-entreprise.md","src/app/(marketing)/secteurs/funnel-devis-peinture-entreprise/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst {\n  DEFAULTS, STATUT_LABELS, computeResolutoire, buildRecap, fmtDate, addDays, parseDate, num,\n  ROLE_LABELS, TYPE_CLAUSE_LABELS, MANQUEMENT_LABELS, GRAVITE_LABELS, MISE_LABELS, MENTION_LABELS,\n  URGENCE_LABELS, PRECISION_LABELS, PRESENTATION_LABELS, ACCEPTATION_LABELS, RECIPROCITE_LABELS,\n  EXCLUSION_FM_LABELS, BONNEFOI_LABELS\n} = X;\nconst run = (o) => computeResolutoire({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point.startsWith(point));\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\nconst POINTS = [\n  \"Voie choisie\", \"Précision des engagements\", \"Présentation de la clause\", \"Acceptation des CGV\",\n  \"Mise en demeure\", \"Mention de la clause\", \"Gravité du manquement\", \"Réciprocité\",\n  \"Force majeure\", \"Bonne foi\", \"Nature du manquement\", \"Urgence et limites\"\n];\n\nconst numIds = [\"delaiRegulJours\"];\nconst selIds = [\"role\", \"typeClause\", \"manquement\", \"gravite\", \"miseEnDemeure\", \"mentionClause\", \"urgence\", \"precisionEngagements\", \"presentation\", \"acceptation\", \"reciprocite\", \"exclusionForceMajeure\", \"bonneFoi\"];\nassert.strictEqual(Object.keys(DEFAULTS).length, 15);\nassert.strictEqual(numIds.length + selIds.length + 1, 15);\n\n\n\nconst labelMap = {\n  role: \"ROLE_LABELS\", typeClause: \"TYPE_CLAUSE_LABELS\", manquement: \"MANQUEMENT_LABELS\", gravite: \"GRAVITE_LABELS\",\n  miseEnDemeure: \"MISE_LABELS\", mentionClause: \"MENTION_LABELS\", urgence: \"URGENCE_LABELS\",\n  precisionEngagements: \"PRECISION_LABELS\", presentation: \"PRESENTATION_LABELS\", acceptation: \"ACCEPTATION_LABELS\",\n  reciprocite: \"RECIPROCITE_LABELS\", exclusionForceMajeure: \"EXCLUSION_FM_LABELS\", bonneFoi: \"BONNEFOI_LABELS\"\n};\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\n\n\nassert.strictEqual(fmtDate({ y: 2027, m: 2, d: 25 }), \"25 février 2027\");\nassert.strictEqual(fmtDate({ y: 2027, m: 3, d: 1 }), \"1er mars 2027\");\nassert.deepStrictEqual(parseDate(\"2027-02-10\"), { y: 2027, m: 2, d: 10 });\nassert.strictEqual(parseDate(\"2027-02-29\"), null);\nassert.strictEqual(parseDate(\"10/02/2027\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.deepStrictEqual(addDays({ y: 2027, m: 2, d: 10 }, 15), { y: 2027, m: 2, d: 25 });\nassert.deepStrictEqual(addDays({ y: 2027, m: 2, d: 10 }, 30), { y: 2027, m: 3, d: 12 });\nassert.deepStrictEqual(addDays({ y: 2027, m: 12, d: 20 }, 15), { y: 2028, m: 1, d: 4 });\nassert.deepStrictEqual(addDays({ y: 2028, m: 2, d: 1 }, 28), { y: 2028, m: 2, d: 29 });\nassert.strictEqual(num(\"15\", 0, 365, 0), 15);\nassert.strictEqual(num(\"abc\", 0, 365, 0), 0);\nassert.strictEqual(num(\"999\", 0, 365, 0), 365);\nassert.strictEqual(num(\"30,4\", 0, 365, 0), 30);\n\nconst r = computeResolutoire({});\nassert.strictEqual(r.controles.length, 12);\nassert.deepStrictEqual(r.controles.map((c) => c.point), POINTS);\nassert.strictEqual(r.nbBad, 0);\nassert.strictEqual(r.etat, \"warn\");\nassert.strictEqual(r.statutLabel, \"À compléter\");\nassert.strictEqual(r.voieLabel, \"Clause 1225\");\nassert.strictEqual(r.clauseQuality, \"Fragile\");\nassert.strictEqual(r.delaiLabel, \"Le 25 février 2027\");\nassert.strictEqual(r.finDelaiFmt, \"25 février 2027\");\nassert.strictEqual(r.articles, 5);\nassert.strictEqual(r.recap.split(\"\\n\").length, 11);\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert.strictEqual(S(r, \"Voie\"), \"ok\");\nassert.strictEqual(S(r, \"Précision\"), \"warn\");\nassert.strictEqual(S(r, \"Présentation\"), \"warn\");\nassert.strictEqual(S(r, \"Acceptation\"), \"ok\");\nassert.strictEqual(S(r, \"Mise en demeure\"), \"ok\");\nassert.strictEqual(S(r, \"Mention\"), \"ok\");\nassert.strictEqual(S(r, \"Gravité\"), \"info\");\nassert.strictEqual(S(r, \"Réciprocité\"), \"ok\");\nassert.strictEqual(S(r, \"Force majeure\"), \"warn\");\nassert.strictEqual(S(r, \"Bonne foi\"), \"ok\");\nassert.strictEqual(S(r, \"Nature\"), \"ok\");\nassert.strictEqual(S(r, \"Urgence\"), \"info\");\nassert(T(r, \"Voie\").includes(\"1225\"));\nassert(T(r, \"Précision\").includes(\"24-19.612\"));\nassert(T(r, \"Acceptation\").includes(\"1119\"));\nassert(T(r, \"Mise en demeure\").includes(\"25 février 2027\"));\nassert(r.clause.includes(\"Article 1\"));\nassert(r.clause.includes(\"Article 5\"));\nassert(r.clause.includes(\"1229\"));\nassert(r.actions.length === r.nbBad + r.nbWarn + 1);\nassert(r.message.includes(\"clause résolutoire\"));\nassert.strictEqual(buildRecap(r), r.recap);\n\n// Tout corrigé\nconst ok = run({\n  precisionEngagements: \"noms\", presentation: \"signature\", exclusionForceMajeure: \"oui\",\n  delaiRegulJours: 15, mentionClause: \"oui\", reciprocite: \"reciproque\", bonneFoi: \"non\"\n});\nassert.strictEqual(ok.etat, \"ok\");\nassert.strictEqual(ok.nbBad, 0);\nassert.strictEqual(ok.nbWarn, 0);\nassert.strictEqual(ok.clauseQuality, \"Solide\");\nassert(ok.verdict.includes(\"cohérente\"));\n\n// CGV jamais transmises\nconst cgv = run({ acceptation: \"aucune\" });\nassert.strictEqual(S(cgv, \"Acceptation\"), \"bad\");\nassert.strictEqual(cgv.etat, \"bad\");\nassert.strictEqual(cgv.clauseQuality, \"Inopposable\");\n\n// Facture seule\nassert.strictEqual(S(run({ presentation: \"facture\" }), \"Présentation\"), \"bad\");\n\n// Mention manquante clause résolutoire\nconst ment = run({ mentionClause: \"non\" });\nassert.strictEqual(S(ment, \"Mise en demeure\"), \"bad\");\nassert.strictEqual(S(ment, \"Mention\"), \"bad\");\n\n// Pas de mise en demeure\nconst nomed = run({ miseEnDemeure: \"non\", urgence: \"non\" });\nassert.strictEqual(S(nomed, \"Mise en demeure\"), \"bad\");\n\n// Urgence\nconst urg = run({ miseEnDemeure: \"non\", urgence: \"oui\" });\nassert.strictEqual(S(urg, \"Mise en demeure\"), \"warn\");\nassert.strictEqual(urg.delaiLabel, \"Urgence invoquée\");\nassert(T(urg, \"Mise en demeure\").includes(\"23-14.923\"));\n\n// Vaine\nconst vaine = run({ miseEnDemeure: \"vaine\" });\nassert.strictEqual(S(vaine, \"Mise en demeure\"), \"warn\");\nassert(T(vaine, \"Mise en demeure\").includes(\"22-20.785\"));\nassert.strictEqual(vaine.delaiLabel, \"Dispense (vaine)\");\n\n// Délai trop court / trop long / zéro\nassert.strictEqual(S(run({ delaiRegulJours: 5 }), \"Mise en demeure\"), \"warn\");\nassert.strictEqual(S(run({ delaiRegulJours: 120 }), \"Mise en demeure\"), \"warn\");\nassert.strictEqual(S(run({ delaiRegulJours: 0 }), \"Mise en demeure\"), \"warn\");\nassert.strictEqual(run({ delaiRegulJours: 0 }).delaiLabel, \"Délai non fixé\");\n\n// Engagements\nassert.strictEqual(S(run({ precisionEngagements: \"aucune\" }), \"Précision\"), \"bad\");\nassert.strictEqual(S(run({ precisionEngagements: \"noms\" }), \"Précision\"), \"ok\");\nassert.strictEqual(S(run({ precisionEngagements: \"vague\" }), \"Précision\"), \"warn\");\n\n// 1226 unilatérale\nconst u = run({ typeClause: \"unilaterale\", mentionClause: \"oui\", gravite: \"grave\" });\nassert.strictEqual(u.voieLabel, \"Notification 1226\");\nassert(T(u, \"Voie\").includes(\"96-21.485\"));\nassert.strictEqual(S(u, \"Gravité\"), \"ok\");\nconst uLegere = run({ typeClause: \"unilaterale\", gravite: \"legere\" });\nassert.strictEqual(S(uLegere, \"Gravité\"), \"bad\");\nconst uDisc = run({ typeClause: \"unilaterale\", gravite: \"discutee\" });\nassert.strictEqual(S(uDisc, \"Gravité\"), \"warn\");\nconst uMent = run({ typeClause: \"unilaterale\", mentionClause: \"non\", miseEnDemeure: \"ouiDate\" });\nassert.strictEqual(S(uMent, \"Mise en demeure\"), \"bad\");\nassert.strictEqual(S(uMent, \"Mention\"), \"bad\");\n\n// Judiciaire\nconst j = run({ typeClause: \"judiciaire\" });\nassert.strictEqual(j.voieLabel, \"Juge 1227\");\nassert.strictEqual(S(j, \"Voie\"), \"info\");\nassert.strictEqual(S(j, \"Mise en demeure\"), \"info\");\n\n// Aucune\nconst a = run({ typeClause: \"aucune\" });\nassert.strictEqual(a.voieLabel, \"Aucune\");\nassert.strictEqual(S(a, \"Voie\"), \"warn\");\nassert.strictEqual(a.clauseQuality === \"Absente\" || a.nbBad > 0 || a.etat === \"warn\", true);\n\n// Bonne foi\nassert.strictEqual(S(run({ bonneFoi: \"oui\" }), \"Bonne foi\"), \"bad\");\nassert(T(run({ bonneFoi: \"oui\" }), \"Bonne foi\").includes(\"92-20.654\"));\n\n// Réciprocité\nassert.strictEqual(S(run({ reciprocite: \"prestataireSeul\" }), \"Réciprocité\"), \"warn\");\nassert(T(run({ reciprocite: \"prestataireSeul\" }), \"Réciprocité\").includes(\"1171\"));\nassert.strictEqual(S(run({ reciprocite: \"clientSeul\" }), \"Réciprocité\"), \"warn\");\n\n// Force majeure\nassert.strictEqual(S(run({ exclusionForceMajeure: \"oui\" }), \"Force majeure\"), \"ok\");\nassert(T(run({ exclusionForceMajeure: \"non\" }), \"Force majeure\").includes(\"1218\"));\n\n// Lien acceptation\nassert.strictEqual(S(run({ acceptation: \"lien\" }), \"Acceptation\"), \"warn\");\n\n// Date inconnue\nassert.strictEqual(run({ miseEnDemeure: \"ouiSansDate\" }).delaiLabel, \"Date inconnue\");\n\n// Côté client\nconst rc = run({ role: \"client\" });\nassert(rc.message.startsWith(\"Bonjour,\\n\\nAvant de signer\"));\nassert(rc.recap.includes(\"Position : client qui relit la clause\"));\nassert(rc.message.includes(\"1225\") || rc.message.includes(\"1226\"));\n\n// Valeurs invalides\nconst rinv = computeResolutoire({ role: \"zz\", typeClause: \"zz\", manquement: \"zz\", gravite: \"zz\", miseEnDemeure: \"zz\", mentionClause: \"zz\", precisionEngagements: \"zz\", presentation: \"zz\", acceptation: \"zz\" });\nassert.strictEqual(rinv.role, \"prestataire\");\nassert.strictEqual(rinv.typeClause, \"resolutoirePleinDroit\");\nassert.strictEqual(rinv.manquement, \"impaye\");\nassert.strictEqual(rinv.gravite, \"grave\");\nassert.strictEqual(rinv.miseEnDemeure, \"ouiDate\");\nassert.strictEqual(rinv.mentionClause, \"oui\");\nassert.strictEqual(rinv.precisionEngagements, \"generale\");\nassert.strictEqual(rinv.presentation, \"noyee\");\nassert.strictEqual(rinv.acceptation, \"signee\");\nassert.strictEqual(run({ delaiRegulJours: \"abc\" }).delaiRegulJours, 0);\nassert.strictEqual(run({ delaiRegulJours: 999 }).delaiRegulJours, 365);\nassert.strictEqual(run({ dateMiseEnDemeure: \"n'importe quoi\" }).dateMiseEnDemeureFmt, \"10 février 2027\");\n\n// Labels sizes\nassert.strictEqual(Object.keys(ROLE_LABELS).length, 2);\nassert.strictEqual(Object.keys(TYPE_CLAUSE_LABELS).length, 4);\nassert.strictEqual(Object.keys(MANQUEMENT_LABELS).length, 4);\nassert.strictEqual(Object.keys(GRAVITE_LABELS).length, 3);\nassert.strictEqual(Object.keys(MISE_LABELS).length, 4);\nassert.strictEqual(Object.keys(PRECISION_LABELS).length, 4);\nassert.strictEqual(Object.keys(PRESENTATION_LABELS).length, 4);\nassert.strictEqual(Object.keys(ACCEPTATION_LABELS).length, 3);\n\n// Dates fin délai\nassert.strictEqual(run({ dateMiseEnDemeure: \"2027-02-10\", delaiRegulJours: 15 }).finDelaiFmt, \"25 février 2027\");\nassert.strictEqual(run({ dateMiseEnDemeure: \"2027-12-20\", delaiRegulJours: 15 }).finDelaiFmt, \"4 janvier 2028\");\nassert.strictEqual(run({ dateMiseEnDemeure: \"2027-02-10\", delaiRegulJours: 30 }).finDelaiFmt, \"12 mars 2027\");\n\n// Clause quality Correcte\nconst cor = run({ precisionEngagements: \"generale\", presentation: \"titre\", exclusionForceMajeure: \"oui\" });\nassert.strictEqual(cor.clauseQuality, \"Correcte\");\n\n// Nature autre\nassert.strictEqual(S(run({ manquement: \"autre\" }), \"Nature\"), \"warn\");\n\n")(tool, require, console);
console.log("seo-am-20261106 ok");
