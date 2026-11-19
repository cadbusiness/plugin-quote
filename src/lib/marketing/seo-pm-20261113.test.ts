import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_BON_A_TIRER, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-bon-a-tirer-validation-production";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "bon-a-tirer-bat-validation-avant-production-devis-b2b";
const BLOG_PATH = "/blog/bon-a-tirer-bat-validation-avant-production-devis-b2b";
const TOOL_PATH = "/outils/verificateur-bon-a-tirer-validation-production";
const DAY = "2026-11-13";
const DAY_PATHS = ["/blog/bon-a-tirer-bat-validation-avant-production-devis-b2b", "/outils/verificateur-bon-a-tirer-validation-production"];

assert.equal(BLOG_TOOL_BON_A_TIRER, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 24);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de bon à tirer (BAT) avant production");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "BAT, échantillon ou prototype : qui valide, ce que vaut le silence, tours de corrections, date de livraison en jours ouvrés, la clause et le message.");

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
assert.ok(outilsHub.includes("verificateur-bon-a-tirer-validation-production"));
assert.ok(outilsHub.includes("Vérificateur de bon à tirer (BAT) avant production"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-bon-a-tirer-validation-production\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 5375);
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

for (const rel of ["src/lib/marketing/verificateur-bon-a-tirer-validation-production.ts","src/components/marketing/verificateur-bon-a-tirer-validation-production-calculator.tsx","src/app/(marketing)/outils/verificateur-bon-a-tirer-validation-production/page.tsx","src/content/blog/bon-a-tirer-bat-validation-avant-production-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, POINTS, LABEL_SETS, STATUT_LABELS, computeBat, fmtEur, fmtDate, parseDate, isoDate, num, dec, addBusinessDays, subBusinessDays, businessDaysBetween } = X;\nconst run = (o) => computeBat({ ...DEFAULTS, ...o });\nconst S = (r, i) => r.controles[i].statut;\nconst T = (r, i) => r.controles[i].texte;\n\n// Statique\nassert.strictEqual(X.SLUG, SLUG);\nassert.strictEqual(Object.keys(DEFAULTS).length, 17);\nassert.strictEqual(POINTS.length, 12);\nconst numIds = [\"delaiReponse\", \"prixTour\", \"toursInclus\", \"toursReels\", \"delaiProd\"];\nconst dateIds = [\"dateValidation\", \"datePromise\"];\nconst selIds = Object.keys(LABEL_SETS);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 17);\n\n\n\n\n\n\n// Utilitaires\nassert.strictEqual(fmtEur(9000), \"90 €\");\nassert.strictEqual(fmtEur(4550), \"45,50 €\");\nassert.strictEqual(fmtEur(4505), \"45,05 €\");\nassert.strictEqual(fmtEur(115800), \"1 158 €\");\nassert.strictEqual(fmtEur(123456789), \"1 234 567,89 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(num(\"12\"), 12); assert.strictEqual(num(\"-3\", 10), 0); assert.strictEqual(num(\"abc\", 10), 0); assert.strictEqual(num(\"99\", 50), 50); assert.strictEqual(num(\"1 2\", 50), 12);\nassert.strictEqual(dec(\"45,5\", 1e6), 4550); assert.strictEqual(dec(\"1\\u00a0000\", 1e6), 100000); assert.strictEqual(dec(\"-1\", 1e6), 0); assert.strictEqual(dec(\"x\", 1e6), 0); assert.strictEqual(dec(\"9999999\", 1e6), 100000000);\nassert.strictEqual(parseDate(\"2026-02-30\"), null); assert.strictEqual(parseDate(\"\"), null); assert.strictEqual(parseDate(\"16/11/2026\"), null);\nassert.strictEqual(isoDate(parseDate(\"2028-02-29\")), \"2028-02-29\");\nassert.strictEqual(fmtDate(parseDate(\"2026-11-16\")), \"lundi 16 novembre 2026\");\nassert.strictEqual(fmtDate(null), \"[date]\");\nconst D = (s) => parseDate(s);\nassert.strictEqual(isoDate(addBusinessDays(D(\"2026-11-16\"), 5)), \"2026-11-23\");\nassert.strictEqual(isoDate(addBusinessDays(D(\"2026-11-13\"), 5)), \"2026-11-20\");\nassert.strictEqual(isoDate(addBusinessDays(D(\"2026-11-14\"), 1)), \"2026-11-16\");\nassert.strictEqual(isoDate(addBusinessDays(D(\"2026-11-16\"), 0)), \"2026-11-16\");\nassert.strictEqual(isoDate(subBusinessDays(D(\"2026-11-20\"), 5)), \"2026-11-13\");\nassert.strictEqual(isoDate(subBusinessDays(D(\"2026-11-16\"), 1)), \"2026-11-13\");\nassert.strictEqual(businessDaysBetween(D(\"2026-11-20\"), D(\"2026-11-23\")), 1);\nassert.strictEqual(businessDaysBetween(D(\"2026-11-23\"), D(\"2026-11-20\")), 0);\nassert.strictEqual(businessDaysBetween(D(\"2026-11-16\"), D(\"2026-11-30\")), 10);\nfor (let i = 0; i < 400; i++) {\n  const base = new Date(Date.UTC(2026, 0, 1) + i * 86400000);\n  for (const n of [0, 1, 3, 5, 10, 23]) {\n    const a = addBusinessDays(base, n);\n    assert([1, 2, 3, 4, 5].includes(a.getUTCDay()) || n === 0, \"jour ouvré\");\n    if (n > 0) assert.strictEqual(businessDaysBetween(base, a), n, \"aller retour \" + n);\n    const s = subBusinessDays(base, n);\n    if (n > 0 && ![0, 6].includes(base.getUTCDay())) assert.strictEqual(businessDaysBetween(s, base), n, \"retour \" + n);\n  }\n}\n\n// Valeurs de référence (défauts)\nconst r0 = computeBat(DEFAULTS);\nassert.deepStrictEqual(r0.controles.map((c) => c.statut), [\"info\", \"ok\", \"warn\", \"ok\", \"ok\", \"warn\", \"warn\", \"info\", \"warn\", \"ok\", \"info\", \"ok\"]);\nassert.deepStrictEqual(r0.controles.map((c) => c.point), POINTS);\nassert.strictEqual(r0.nbOk, 5); assert.strictEqual(r0.nbWarn, 4); assert.strictEqual(r0.nbBad, 0); assert.strictEqual(r0.nbInfo, 3);\nassert.strictEqual(r0.etat, \"warn\");\nassert.strictEqual(isoDate(r0.livraison), \"2026-11-23\");\nassert.strictEqual(isoDate(r0.limite), \"2026-11-13\");\nassert.strictEqual(r0.retard, 1); assert.strictEqual(r0.avance, 0);\nassert.strictEqual(r0.extra, 2); assert.strictEqual(r0.coutCents, 9000);\nassert.strictEqual(r0.verdict, \"Aucun point bloquant, 4 à compléter. Livraison calculée le lundi 23 novembre 2026, 5 jours ouvrés après la validation du lundi 16 novembre 2026 : 1 jour ouvré après la date promise du vendredi 20 novembre 2026. 2 tours supplémentaires : 90 €.\");\nassert.strictEqual(r0.livraisonLabel, \"lundi 23 novembre 2026\");\nassert.strictEqual(r0.limiteLabel, \"vendredi 13 novembre 2026\");\nassert.strictEqual(r0.ecartLabel, \"1 jour ouvré de retard\");\nassert.strictEqual(r0.toursLabel, \"2 tours, soit 90 €\");\nconst cl = r0.clause.split(\"\\n\");\nassert.strictEqual(cl.length, 8);\nassert.strictEqual(cl[0], \"Article [X] : Validation avant production\");\nassert(cl[1].startsWith(\"1. Un BAT au format PDF est soumis\"));\nassert(cl[3].includes(\"[2] jours ouvrés\"));\nassert(cl[5].includes(\"[45 €]\"));\nassert(cl[6].includes(\"[5] jours ouvrés\") && cl[6].includes(\"[vendredi 20 novembre 2026]\") && cl[6].includes(\"[vendredi 13 novembre 2026]\"));\nassert(r0.message.startsWith(\"Objet : commande [référence] : validation et date de livraison\"));\nassert(r0.message.includes(\"livraison le lundi 23 novembre 2026\") && r0.message.includes(\"pour 90 €\"));\nconst rc = r0.recap.split(\"\\n\");\nassert.strictEqual(rc.length, 11);\nassert.strictEqual(rc[10], \"Calcul : quotebuilder.co/outils/\" + SLUG);\nassert.strictEqual(r0.actions.length, 4);\nassert.strictEqual(X.buildRecap(r0), r0.recap);\n\n// Cas ciblés\nconst ok = run({ canal: \"ecrit_version\", perimetre: \"liste\", tolerance: \"ecrite\", responsabilite: \"ecrite\", toursReels: \"2\", dateValidation: \"2026-11-13\" });\nassert.strictEqual(ok.etat, \"ok\"); assert.strictEqual(ok.nbWarn, 0); assert.strictEqual(ok.nbBad, 0);\nassert.strictEqual(S(ok, 10), \"ok\"); assert.strictEqual(ok.retard, 0); assert.strictEqual(ok.ecartLabel, \"À la date promise\");\nassert(ok.verdict.startsWith(\"Tout est en place.\")); assert(ok.verdict.includes(\"date promise du vendredi 20 novembre 2026 tenue.\"));\nassert.strictEqual(ok.actions.length, 1); assert(ok.actions[0].startsWith(\"Rien à ajouter\"));\nassert.strictEqual(ok.toursLabel, \"Aucun\");\nconst early = run({ dateValidation: \"2026-11-10\" });\nassert.strictEqual(early.avance, 3); assert.strictEqual(S(early, 10), \"ok\"); assert(T(early, 10).includes(\"3 jours ouvrés avant\"));\nconst lateCmd = run({ delaiDepart: \"commande\" });\nassert.strictEqual(S(lateCmd, 9), \"warn\"); assert.strictEqual(S(lateCmd, 10), \"bad\"); assert.strictEqual(lateCmd.etat, \"bad\");\nassert(lateCmd.verdict.startsWith(\"1 point bloquant, 5 à compléter.\"));\nconst lateRien = run({ delaiDepart: \"rien\", dateValidation: \"2026-11-20\" });\nassert.strictEqual(lateRien.retard, 5); assert.strictEqual(S(lateRien, 10), \"bad\");\nassert.strictEqual(S(run({ valideur: \"service\" }), 1), \"warn\");\nassert.strictEqual(S(run({ valideur: \"rien\" }), 1), \"bad\");\nassert.strictEqual(S(run({ canal: \"oral\" }), 2), \"bad\");\nassert.strictEqual(S(run({ canal: \"rien\" }), 2), \"bad\");\nassert.strictEqual(S(run({ delaiReponse: \"0\" }), 3), \"warn\");\nassert(run({ delaiReponse: \"0\" }).clause.includes(\"[2] jours ouvrés\"));\nconst tac = run({ silence: \"tacite\" });\nassert.strictEqual(S(tac, 4), \"warn\"); assert(T(tac, 4).includes(\"1120\"));\nassert.strictEqual(S(run({ silence: \"rien\" }), 4), \"warn\");\nassert.strictEqual(S(run({ perimetre: \"rien\" }), 5), \"bad\");\nassert.strictEqual(S(run({ tolerance: \"sans_objet\" }), 6), \"info\");\nassert.strictEqual(S(run({ toursInclus: \"0\" }), 7), \"warn\");\nconst noPrice = run({ prixTour: \"0\" });\nassert.strictEqual(S(noPrice, 7), \"warn\"); assert.strictEqual(noPrice.coutCents, 0); assert(noPrice.verdict.endsWith(\"2 tours supplémentaires, sans prix écrit.\"));\nassert(noPrice.clause.includes(\"[prix]\")); assert.strictEqual(noPrice.toursLabel, \"2 tours, sans prix écrit\");\nconst one = run({ toursReels: \"3\", prixTour: \"47,50\" });\nassert.strictEqual(one.coutCents, 4750); assert(T(one, 7).startsWith(\"1 tour supplémentaire\")); assert(one.message.includes(\"1 tour de corrections a été nécessaire\") && one.message.includes(\"il apparaîtra\"));\nassert(T(run({ responsabilite: \"rien\" }), 8).includes(\"1642\"));\nassert.strictEqual(S(run({ versions: \"non\" }), 11), \"warn\");\nconst noDate = run({ dateValidation: \"\", datePromise: \"\" });\nassert.strictEqual(S(noDate, 10), \"warn\"); assert.strictEqual(noDate.livraisonLabel, \"[date]\"); assert.strictEqual(noDate.ecartLabel, \"Dates à renseigner\");\nassert(noDate.clause.includes(\"[date]\") && !noDate.clause.includes(\"[[\")); assert(noDate.verdict === \"Aucun point bloquant, 5 à compléter. 2 tours supplémentaires : 90 €.\");\nconst noPromise = run({ datePromise: \"\" });\nassert(noPromise.verdict.includes(\"validation du lundi 16 novembre 2026.\"));\nconst cli = run({ role: \"client\" });\nassert(cli.message.startsWith(\"Objet : commande [référence] : conditions de validation avant production\"));\nassert(cli.message.includes(\"la livraison aurait lieu le lundi 23 novembre 2026\"));\nfor (const [type, start] of [[\"epreuve\", \"1. Une épreuve sur support est soumise\"], [\"echantillon\", \"1. Un échantillon est soumis\"], [\"prototype\", \"1. Un prototype est soumis\"], [\"preserie\", \"1. Une présérie est soumise\"]]) {\n  const r = run({ type });\n  assert(r.clause.split(\"\\n\")[1].startsWith(start), type);\n  assert.strictEqual(S(r, 0), \"info\");\n}\nconst junk = computeBat({ role: \"x\", type: \"y\", valideur: 3, canal: null, silence: \"\", toursInclus: \"abc\", prixTour: \"-5\", delaiProd: \"9999\", dateValidation: \"2026-13-01\" });\nassert.strictEqual(junk.input.role, \"fabricant\"); assert.strictEqual(junk.input.type, \"bat_fichier\"); assert.strictEqual(junk.input.toursInclus, 0);\nassert.strictEqual(junk.input.prixTourCents, 0); assert.strictEqual(junk.input.delaiProd, 250); assert.strictEqual(junk.input.dateValidation, null);\nassert.strictEqual(computeBat(undefined).controles.length, 12);\n\n")(tool, require, console);
console.log("seo-pm-20261113 ok");
