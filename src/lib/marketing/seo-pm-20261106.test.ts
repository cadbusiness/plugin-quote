import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_EXCEPTION_INEXECUTION, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-exception-inexecution";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "exception-inexecution-devis-b2b";
const BLOG_PATH = "/blog/exception-inexecution-devis-b2b";
const TOOL_PATH = "/outils/verificateur-exception-inexecution";
const DAY = "2026-11-06";
const DAY_PATHS = ["/blog/exception-inexecution-devis-b2b", "/outils/verificateur-exception-inexecution"];

assert.equal(BLOG_TOOL_EXCEPTION_INEXECUTION, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 30);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur d'exception d'inexécution");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "articles 1219 et 1220 : douze points contrôlés, le régime probable, et la clause à écrire.");

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
assert.ok(outilsHub.includes("verificateur-exception-inexecution"));
assert.ok(outilsHub.includes("Vérificateur d'exception d'inexécution"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-exception-inexecution\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 6312);
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

for (const rel of ["src/lib/marketing/verificateur-exception-inexecution.ts","src/components/marketing/verificateur-exception-inexecution-calculator.tsx","src/app/(marketing)/outils/verificateur-exception-inexecution/page.tsx","src/content/blog/exception-inexecution-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst {\n  DEFAULTS, STATUT_LABELS, computeExceptionInexecution, buildRecap,\n  fmtDate, addDays, parseDate, num, ROLE_LABELS, VOIE_LABELS, MANQUEMENT_LABELS,\n  GRAVITE_LABELS, INEXEC_LABELS, MANIFESTE_LABELS, CONSEQ_LABELS, NOTIFICATION_LABELS,\n  RECIPROQUE_LABELS, PROPORTION_LABELS, MISE_LABELS, ACCEPTATION_LABELS, CONTINUE_LABELS\n} = X;\nconst run = (o) => computeExceptionInexecution({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point.startsWith(point));\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\nconst POINTS = [\n  \"Voie\", \"Gravité\", \"Inexécution actuelle (1219)\", \"Caractère manifeste (1220)\", \"Conséquences\",\n  \"Notification\", \"Délai notification\", \"Réciprocité\", \"Proportionnalité\", \"CGV/acceptation\",\n  \"Risque d'abus\", \"Articulation résolution\"\n];\n\nconst numIds = [\"delaiNotifJours\"];\nconst dateIds = [\"dateEvenement\", \"dateNotification\"];\nconst selIds = [\"role\", \"voie\", \"manquement\", \"gravite\", \"inexecutionActuelle\", \"caractereManifeste\", \"consequencesGraves\", \"notification\", \"obligationsReciproques\", \"proportionSuspension\", \"miseEnDemeure\", \"acceptationCgv\", \"continueRelation\"];\nassert.strictEqual(Object.keys(DEFAULTS).length, 16);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 16);\n\n\n\n\nconst labelMap = {\n  role: \"ROLE_LABELS\", voie: \"VOIE_LABELS\", manquement: \"MANQUEMENT_LABELS\",\n  gravite: \"GRAVITE_LABELS\", inexecutionActuelle: \"INEXEC_LABELS\", caractereManifeste: \"MANIFESTE_LABELS\",\n  consequencesGraves: \"CONSEQ_LABELS\", notification: \"NOTIFICATION_LABELS\",\n  obligationsReciproques: \"RECIPROQUE_LABELS\", proportionSuspension: \"PROPORTION_LABELS\",\n  miseEnDemeure: \"MISE_LABELS\", acceptationCgv: \"ACCEPTATION_LABELS\", continueRelation: \"CONTINUE_LABELS\"\n};\n\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\n\nassert.strictEqual(fmtDate({ y: 2026, m: 12, d: 20 }), \"20 décembre 2026\");\nassert.strictEqual(fmtDate({ y: 2026, m: 12, d: 21 }), \"21 décembre 2026\");\nassert.strictEqual(fmtDate({ y: 2027, m: 1, d: 1 }), \"1er janvier 2027\");\nassert.deepStrictEqual(parseDate(\"2026-12-20\"), { y: 2026, m: 12, d: 20 });\nassert.strictEqual(parseDate(\"2027-02-29\"), null);\nassert.strictEqual(parseDate(\"15/03/2027\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.deepStrictEqual(addDays({ y: 2026, m: 12, d: 20 }, 1), { y: 2026, m: 12, d: 21 });\nassert.deepStrictEqual(addDays({ y: 2026, m: 12, d: 31 }, 1), { y: 2027, m: 1, d: 1 });\nassert.deepStrictEqual(addDays({ y: 2028, m: 2, d: 1 }, 28), { y: 2028, m: 2, d: 29 });\nassert.strictEqual(num(\"15\", 0, 365, 0), 15);\nassert.strictEqual(num(\"abc\", 0, 365, 0), 0);\nassert.strictEqual(num(\"999\", 0, 365, 0), 365);\nassert.strictEqual(num(\"-3\", 0, 365, 0), 0);\n\nconst r = computeExceptionInexecution({});\nassert.strictEqual(r.controles.length, 12);\nassert.deepStrictEqual(r.controles.map((c) => c.point), POINTS);\nassert.strictEqual(r.nbBad, 0);\nassert.strictEqual(r.etat, \"warn\");\nassert.strictEqual(r.statutLabel, \"À compléter\");\nassert.strictEqual(r.regimeLabel, \"Exception 1219 (réactive)\");\nassert.strictEqual(S(r, \"Voie\"), \"ok\");\nassert.strictEqual(S(r, \"Gravité\"), \"ok\");\nassert.strictEqual(S(r, \"Inexécution\"), \"ok\");\nassert.strictEqual(S(r, \"Notification\"), \"ok\");\nassert.strictEqual(S(r, \"Réciprocité\"), \"ok\");\nassert.strictEqual(S(r, \"CGV\"), \"ok\");\nassert.strictEqual(S(r, \"Risque\"), \"warn\");\nassert.strictEqual(S(r, \"Articulation\"), \"info\");\nassert.strictEqual(r.articles, 5);\nassert(r.clause.includes(\"article 1219\") || r.clause.includes(\"articles 1219\"));\nassert(r.clause.includes(\"1220\"));\nassert(r.clause.includes(\"Article 5. Réciprocité\"));\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert.strictEqual(r.recap.split(\"\\n\").length, 11);\nassert.strictEqual(buildRecap(r), r.recap);\nassert(r.message.includes(\"20 décembre 2026\") || r.dateEvenementFmt === \"20 décembre 2026\");\nassert.strictEqual(r.dateEvenementFmt, \"20 décembre 2026\");\nassert.strictEqual(r.dateNotificationFmt, \"21 décembre 2026\");\nassert.strictEqual(r.actions.length, r.nbBad + r.nbWarn + 1);\n\nconst ok = run({\n  voie: \"1219\",\n  gravite: \"tresGrave\",\n  inexecutionActuelle: \"oui\",\n  notification: \"ouiDate\",\n  delaiNotifJours: 1,\n  miseEnDemeure: \"inutile\",\n  proportionSuspension: \"partielle\",\n  acceptationCgv: \"signee\",\n  continueRelation: \"non\",\n  obligationsReciproques: \"oui\"\n});\nassert.strictEqual(ok.etat, \"ok\");\nassert.strictEqual(ok.nbBad, 0);\nassert.strictEqual(ok.nbWarn, 0);\nassert.strictEqual(ok.clauseQuality, \"Solide\");\n\nconst v1220 = run({\n  voie: \"1220\",\n  manquement: \"annonceExpresse\",\n  inexecutionActuelle: \"non\",\n  caractereManifeste: \"oui\",\n  consequencesGraves: \"oui\",\n  notification: \"ouiDate\",\n  delaiNotifJours: 1,\n  gravite: \"suffisante\",\n  miseEnDemeure: \"non\",\n  continueRelation: \"non\"\n});\nassert(v1220.regimeLabel.includes(\"1220\"));\nassert.strictEqual(S(v1220, \"Caractère\"), \"ok\");\nassert.strictEqual(S(v1220, \"Notification\"), \"ok\");\nassert(v1220.message.includes(\"1220\"));\n\nassert.strictEqual(S(run({ gravite: \"legere\" }), \"Gravité\"), \"bad\");\nassert.strictEqual(run({ gravite: \"legere\" }).etat, \"bad\");\nassert.strictEqual(S(run({ voie: \"1219\", inexecutionActuelle: \"non\" }), \"Inexécution\"), \"bad\");\nassert.strictEqual(S(run({ voie: \"1220\", caractereManifeste: \"non\", inexecutionActuelle: \"non\", manquement: \"annonceExpresse\" }), \"Caractère\"), \"bad\");\nassert.strictEqual(S(run({ voie: \"1220\", consequencesGraves: \"non\", caractereManifeste: \"oui\", inexecutionActuelle: \"non\", manquement: \"annonceExpresse\" }), \"Conséquences\"), \"bad\");\nassert.strictEqual(S(run({ voie: \"1220\", notification: \"non\", caractereManifeste: \"oui\", inexecutionActuelle: \"non\", manquement: \"annonceExpresse\" }), \"Notification\"), \"bad\");\nassert.strictEqual(S(run({ notification: \"ouiDate\", delaiNotifJours: 20 }), \"Délai\"), \"warn\");\nassert.strictEqual(S(run({ notification: \"ouiDate\", delaiNotifJours: 15 }), \"Délai\"), \"ok\");\nassert.strictEqual(S(run({ obligationsReciproques: \"non\" }), \"Réciprocité\"), \"bad\");\nassert.strictEqual(S(run({ proportionSuspension: \"excessive\" }), \"Proportionnalité\"), \"bad\");\nassert.strictEqual(S(run({ acceptationCgv: \"jamais\" }), \"CGV\"), \"bad\");\nassert.strictEqual(run({ acceptationCgv: \"jamais\" }).clauseQuality, \"Inopposable\");\nassert.strictEqual(S(run({ acceptationCgv: \"transmise\" }), \"CGV\"), \"warn\");\nassert.strictEqual(S(run({ continueRelation: \"oui\", gravite: \"suffisante\" }), \"Risque\"), \"bad\");\nassert.strictEqual(S(run({ voie: \"aucune\" }), \"Voie\"), \"warn\");\n\nconst rc = run({ role: \"client\" });\nassert(rc.message.startsWith(\"Bonjour,\\n\\nAvant de signer\"));\nassert(rc.recap.includes(\"Position : client qui relit la clause\"));\n\nconst rinv = computeExceptionInexecution({ role: \"zz\", voie: \"zz\", manquement: \"zz\", gravite: \"zz\", acceptationCgv: \"zz\" });\nassert.strictEqual(rinv.role, \"prestataire\");\nassert.strictEqual(rinv.voie, \"1219\");\nassert.strictEqual(rinv.manquement, \"impayeAcompte\");\nassert.strictEqual(rinv.gravite, \"suffisante\");\nassert.strictEqual(rinv.acceptationCgv, \"signee\");\nassert.strictEqual(run({ delaiNotifJours: \"abc\" }).delaiNotifJours, 0);\nassert.strictEqual(run({ delaiNotifJours: 999 }).delaiNotifJours, 365);\nassert.strictEqual(run({ dateEvenement: \"n'importe quoi\" }).dateEvenementFmt, \"20 décembre 2026\");\n\nassert.strictEqual(Object.keys(ROLE_LABELS).length, 2);\nassert.strictEqual(Object.keys(VOIE_LABELS).length, 3);\nassert.strictEqual(Object.keys(MANQUEMENT_LABELS).length, 8);\nassert.strictEqual(Object.keys(GRAVITE_LABELS).length, 4);\nassert.strictEqual(Object.keys(ACCEPTATION_LABELS).length, 3);\nassert.strictEqual(Object.keys(PROPORTION_LABELS).length, 3);\n\n")(tool, require, console);
console.log("seo-pm-20261106 ok");
