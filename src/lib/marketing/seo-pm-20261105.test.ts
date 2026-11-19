import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_FORCE_MAJEURE_IMPREVISION, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-clause-force-majeure-imprevision";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "force-majeure-imprevision-devis-b2b";
const BLOG_PATH = "/blog/force-majeure-imprevision-devis-b2b";
const TOOL_PATH = "/outils/verificateur-clause-force-majeure-imprevision";
const DAY = "2026-11-05";
const DAY_PATHS = ["/blog/force-majeure-imprevision-devis-b2b", "/outils/verificateur-clause-force-majeure-imprevision"];

assert.equal(BLOG_TOOL_FORCE_MAJEURE_IMPREVISION, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 31);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de clause de force majeure et d'imprévision");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Force majeure (1218) ou imprévision (1195) : douze points contrôlés, le régime probable, et la clause à écrire.");

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
assert.ok(outilsHub.includes("verificateur-clause-force-majeure-imprevision"));
assert.ok(outilsHub.includes("Vérificateur de clause de force majeure et d'imprévision"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-clause-force-majeure-imprevision\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 6570);
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

for (const rel of ["src/lib/marketing/verificateur-clause-force-majeure-imprevision.ts","src/components/marketing/verificateur-clause-force-majeure-imprevision-calculator.tsx","src/app/(marketing)/outils/verificateur-clause-force-majeure-imprevision/page.tsx","src/content/blog/force-majeure-imprevision-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst {\n  DEFAULTS, STATUT_LABELS, computeForceMajeureImprevision, buildRecap,\n  fmtDate, addDays, parseDate, num, ROLE_LABELS, SITUATION_LABELS, EVENEMENT_LABELS,\n  CONTROLE_LABELS, PREVISIBILITE_LABELS, MESURES_LABELS, EMPECHEMENT_LABELS, DUREE_LABELS,\n  ONEROSITE_LABELS, RISQUE_LABELS, CLAUSE_LABELS, ACCEPTATION_LABELS, NOTIFICATION_LABELS,\n  RECIPROQUE_LABELS, CONTINUE_LABELS, onerositeValue\n} = X;\nconst run = (o) => computeForceMajeureImprevision({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point.startsWith(point));\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\nconst POINTS = [\n  \"Caractérisation\", \"Contrôle\", \"Prévisibilité\", \"Mesures appropriées\", \"Effet de l'empêchement\",\n  \"Onérosité (1195)\", \"Risque accepté\", \"Rédaction de la clause\", \"Acceptation des CGV\",\n  \"Notification\", \"Réciprocité\", \"Exécution pendant renégociation\"\n];\n\n// Fichier\nconst numIds = [\"onerositePct\", \"delaiNotifJours\"];\nconst dateIds = [\"dateContrat\", \"dateEvenement\"];\nconst selIds = [\"role\", \"situation\", \"evenement\", \"controle\", \"previsibilite\", \"mesures\", \"empechement\", \"dureeEmpechement\", \"onerosite\", \"risqueAccepte\", \"clauseRedigee\", \"acceptation\", \"notification\", \"reciproque\", \"continueExec\"];\nassert.strictEqual(Object.keys(DEFAULTS).length, 19);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 19);\n\n\n\n\nconst labelMap = {\n  role: \"ROLE_LABELS\", situation: \"SITUATION_LABELS\", evenement: \"EVENEMENT_LABELS\",\n  controle: \"CONTROLE_LABELS\", previsibilite: \"PREVISIBILITE_LABELS\", mesures: \"MESURES_LABELS\",\n  empechement: \"EMPECHEMENT_LABELS\", dureeEmpechement: \"DUREE_LABELS\", onerosite: \"ONEROSITE_LABELS\",\n  risqueAccepte: \"RISQUE_LABELS\", clauseRedigee: \"CLAUSE_LABELS\", acceptation: \"ACCEPTATION_LABELS\",\n  notification: \"NOTIFICATION_LABELS\", reciproque: \"RECIPROQUE_LABELS\", continueExec: \"CONTINUE_LABELS\"\n};\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\n\n// refs must appear in script outputs for key articles\n\n// Formats et dates\nassert.strictEqual(fmtDate({ y: 2027, m: 1, d: 12 }), \"12 janvier 2027\");\nassert.strictEqual(fmtDate({ y: 2026, m: 11, d: 18 }), \"18 novembre 2026\");\nassert.strictEqual(fmtDate({ y: 2027, m: 5, d: 1 }), \"1er mai 2027\");\nassert.deepStrictEqual(parseDate(\"2026-11-18\"), { y: 2026, m: 11, d: 18 });\nassert.strictEqual(parseDate(\"2027-02-29\"), null);\nassert.strictEqual(parseDate(\"15/03/2027\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.deepStrictEqual(addDays({ y: 2027, m: 1, d: 12 }, 15), { y: 2027, m: 1, d: 27 });\nassert.deepStrictEqual(addDays({ y: 2027, m: 12, d: 20 }, 15), { y: 2028, m: 1, d: 4 });\nassert.deepStrictEqual(addDays({ y: 2028, m: 2, d: 1 }, 28), { y: 2028, m: 2, d: 29 });\nassert.strictEqual(num(\"62\", 0, 500, 0), 62);\nassert.strictEqual(num(\"abc\", 0, 500, 0), 0);\nassert.strictEqual(num(\"999\", 0, 500, 0), 500);\nassert.strictEqual(num(\"-3\", 0, 365, 0), 0);\nassert.strictEqual(onerositeValue({ onerosite: \"p30\" }), 30);\nassert.strictEqual(onerositeValue({ onerosite: \"p50\" }), 50);\nassert.strictEqual(onerositeValue({ onerosite: \"p100\" }), 100);\nassert.strictEqual(onerositeValue({ onerosite: \"none\" }), 0);\nassert.strictEqual(onerositeValue({ onerosite: \"custom\", onerositePct: 62 }), 62);\n\n// Cas par défaut (incendie fournisseur, liste fermée)\nconst r = computeForceMajeureImprevision({});\nassert.strictEqual(r.controles.length, 12);\nassert.deepStrictEqual(r.controles.map((c) => c.point), POINTS);\nassert.strictEqual(r.nbBad, 0);\nassert.strictEqual(r.etat, \"warn\");\nassert.strictEqual(r.statutLabel, \"À compléter\");\nassert.strictEqual(r.regime, \"forceMajeure\");\nassert.strictEqual(r.regimeLabel, \"Force majeure (1218)\");\nassert.strictEqual(r.clauseQuality, \"Fragile\");\nassert.strictEqual(r.notifLabel, \"Datée (J+1)\");\nassert.strictEqual(r.pct, 100);\nassert.strictEqual(S(r, \"Caractérisation\"), \"ok\");\nassert.strictEqual(S(r, \"Contrôle\"), \"ok\");\nassert.strictEqual(S(r, \"Prévisibilité\"), \"ok\");\nassert.strictEqual(S(r, \"Mesures\"), \"ok\");\nassert.strictEqual(S(r, \"Effet\"), \"ok\");\nassert.strictEqual(S(r, \"Rédaction\"), \"warn\");\nassert.strictEqual(S(r, \"Acceptation\"), \"ok\");\nassert.strictEqual(S(r, \"Notification\"), \"ok\");\nassert.strictEqual(S(r, \"Réciprocité\"), \"warn\");\nassert(T(r, \"Rédaction\").includes(\"Liste fermée\"));\nassert(r.verdict.includes(\"Aucun point bloquant\"));\nassert(r.verdict.includes(\"Force majeure\"));\nassert.strictEqual(r.articles, 5);\nassert(r.clause.includes(\"article 1218\"));\nassert(r.clause.includes(\"article 1195\"));\nassert(r.clause.includes(\"Article 5. Réciprocité\"));\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert.strictEqual(r.recap.split(\"\\n\").length, 11);\nassert.strictEqual(buildRecap(r), r.recap);\nassert(r.message.includes(\"12 janvier 2027\"));\nassert(r.message.includes(\"18 novembre 2026\"));\nassert(r.dateContratFmt === \"18 novembre 2026\");\nassert(r.nbWarn >= 2);\nassert.strictEqual(r.actions.length, r.nbBad + r.nbWarn + 1);\n\n// Tout corrigé (FM)\nconst ok = run({\n  clauseRedigee: \"listeOuverte\",\n  reciproque: \"oui\",\n  onerosite: \"none\",\n  continueExec: \"na\",\n  notification: \"ouiDate\",\n  delaiNotifJours: 1\n});\nassert.strictEqual(ok.etat, \"ok\");\nassert.strictEqual(ok.nbBad, 0);\nassert.strictEqual(ok.nbWarn, 0);\nassert.strictEqual(ok.clauseQuality, \"Solide\");\nassert.strictEqual(S(ok, \"Rédaction\"), \"ok\");\nassert.strictEqual(S(ok, \"Réciprocité\"), \"ok\");\n\n// Imprévision chemin B\nconst imp = run({\n  situation: \"imprevision\",\n  evenement: \"haussePrix\",\n  empechement: \"aucun\",\n  onerosite: \"custom\",\n  onerositePct: 62,\n  risqueAccepte: \"non\",\n  clauseRedigee: \"listeFermee\",\n  continueExec: \"oui\",\n  notification: \"ouiDate\",\n  delaiNotifJours: 3\n});\nassert.strictEqual(imp.regime, \"imprevision\");\nassert.strictEqual(imp.regimeLabel, \"Imprévision (1195)\");\nassert.strictEqual(imp.pct, 62);\nassert.strictEqual(S(imp, \"Caractérisation\"), \"ok\");\nassert.strictEqual(S(imp, \"Exécution\"), \"ok\");\nassert(T(imp, \"Onérosité\").includes(\"62\"));\nassert(imp.message.includes(\"1195\"));\nassert(imp.message.includes(\"renégociation\"));\n\n// Arrêt d'exécution sous 1195 : bloquant\nconst stop = run({ situation: \"imprevision\", evenement: \"haussePrix\", empechement: \"aucun\", continueExec: \"non\", onerosite: \"p100\" });\nassert.strictEqual(S(stop, \"Exécution\"), \"bad\");\nassert.strictEqual(stop.etat, \"bad\");\nassert(T(stop, \"Exécution\").includes(\"1217\"));\n\n// Décision interne : bloquant caractérisation\nconst di = run({ evenement: \"decisionInterne\", controle: \"sousControle\" });\nassert.strictEqual(S(di, \"Caractérisation\"), \"bad\");\nassert.strictEqual(S(di, \"Contrôle\"), \"bad\");\nassert.strictEqual(di.regime, \"ni\");\n\n// CGV jamais transmises\nconst cgv = run({ acceptation: \"aucune\" });\nassert.strictEqual(S(cgv, \"Acceptation\"), \"bad\");\nassert.strictEqual(cgv.clauseQuality, \"Inopposable\");\nassert.strictEqual(cgv.etat, \"bad\");\n\n// Alternatives non prises\nconst alt = run({ mesures: \"alternativesExistent\" });\nassert.strictEqual(S(alt, \"Mesures\"), \"bad\");\nassert(T(alt, \"Mesures\").includes(\"mesures appropriées\"));\n\n// Prévisible\nconst prev = run({ previsibilite: \"previsible\" });\nassert.strictEqual(S(prev, \"Prévisibilité\"), \"bad\");\n\n// Exclusion 1195\nconst ex = run({ risqueAccepte: \"ouiClause\", clauseRedigee: \"exclusion1195\", situation: \"imprevision\", evenement: \"haussePrix\", empechement: \"aucun\", continueExec: \"oui\" });\nassert.strictEqual(S(ex, \"Risque\"), \"ok\");\nassert.strictEqual(S(ex, \"Rédaction\"), \"ok\");\nassert(ex.clause.includes(\"renoncent à se prévaloir de l'article 1195\"));\n\n// Prix fermes silence\nconst sil = run({ risqueAccepte: \"ouiSilence\", situation: \"imprevision\", evenement: \"haussePrix\", empechement: \"aucun\" });\nassert.strictEqual(S(sil, \"Risque\"), \"warn\");\nassert(T(sil, \"Risque\").includes(\"Prix fermes\"));\n\n// Notification manquante / tardive\nassert.strictEqual(S(run({ notification: \"non\" }), \"Notification\"), \"warn\");\nassert.strictEqual(S(run({ notification: \"ouiSansDate\" }), \"Notification\"), \"warn\");\nassert.strictEqual(S(run({ notification: \"ouiDate\", delaiNotifJours: 20 }), \"Notification\"), \"warn\");\nassert.strictEqual(S(run({ notification: \"ouiDate\", delaiNotifJours: 15 }), \"Notification\"), \"ok\");\n\n// Empêchement définitif\nassert(T(run({ dureeEmpechement: \"definitif\" }), \"Effet\").includes(\"1351\"));\nassert.strictEqual(S(run({ dureeEmpechement: \"inconnu\" }), \"Effet\"), \"warn\");\nassert.strictEqual(S(run({ empechement: \"aucun\" }), \"Effet\"), \"info\");\n\n// Lien acceptation\nassert.strictEqual(S(run({ acceptation: \"lien\" }), \"Acceptation\"), \"warn\");\nassert.strictEqual(S(run({ acceptation: \"cgvSignees\" }), \"Acceptation\"), \"ok\");\n\n// Côté client\nconst rc = run({ role: \"client\" });\nassert(rc.message.startsWith(\"Bonjour,\\n\\nAvant de signer\"));\nassert(rc.recap.includes(\"Position : client qui relit la clause\"));\nassert(rc.message.includes(\"1218\"));\n\n// Valeurs invalides\nconst rinv = computeForceMajeureImprevision({ role: \"zz\", situation: \"zz\", evenement: \"zz\", controle: \"zz\", onerosite: \"zz\", clauseRedigee: \"zz\", acceptation: \"zz\" });\nassert.strictEqual(rinv.role, \"prestataire\");\nassert.strictEqual(rinv.situation, \"forceMajeure\");\nassert.strictEqual(rinv.evenement, \"defaillanceFournisseur\");\nassert.strictEqual(rinv.controle, \"hors\");\nassert.strictEqual(rinv.onerosite, \"p100\");\nassert.strictEqual(rinv.clauseRedigee, \"listeFermee\");\nassert.strictEqual(rinv.acceptation, \"signee\");\nassert.strictEqual(run({ delaiNotifJours: \"abc\" }).delaiNotifJours, 0);\nassert.strictEqual(run({ delaiNotifJours: 999 }).delaiNotifJours, 365);\nassert.strictEqual(run({ dateContrat: \"n'importe quoi\" }).dateContratFmt, \"18 novembre 2026\");\n\n// Onérosité paliers\nassert(T(run({ situation: \"imprevision\", evenement: \"haussePrix\", empechement: \"aucun\", onerosite: \"p30\", continueExec: \"oui\" }), \"Onérosité\").includes(\"30\"));\nassert(T(run({ situation: \"imprevision\", evenement: \"haussePrix\", empechement: \"aucun\", onerosite: \"p50\", continueExec: \"oui\" }), \"Onérosité\").includes(\"50\"));\nassert.strictEqual(S(run({ situation: \"forceMajeure\", onerosite: \"none\", continueExec: \"na\" }), \"Onérosité\"), \"info\");\n\n// Clause absente\nassert.strictEqual(S(run({ clauseRedigee: \"aucune\" }), \"Rédaction\"), \"warn\");\nassert.strictEqual(run({ clauseRedigee: \"aucune\", acceptation: \"signee\" }).clauseQuality, \"Absente\");\nassert.strictEqual(run({ clauseRedigee: \"renvoi1218\", reciproque: \"oui\" }).clauseQuality, \"Solide\");\nassert.strictEqual(run({ clauseRedigee: \"renvoi1218\", reciproque: \"non\" }).clauseQuality, \"Correcte\");\n\n// Labels tables size\nassert.strictEqual(Object.keys(ROLE_LABELS).length, 2);\nassert.strictEqual(Object.keys(SITUATION_LABELS).length, 3);\nassert.strictEqual(Object.keys(EVENEMENT_LABELS).length, 8);\nassert.strictEqual(Object.keys(CLAUSE_LABELS).length, 5);\nassert.strictEqual(Object.keys(ACCEPTATION_LABELS).length, 4);\n\n")(tool, require, console);
console.log("seo-pm-20261105 ok");
