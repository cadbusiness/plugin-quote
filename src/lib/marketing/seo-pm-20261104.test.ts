import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_NON_SOLLICITATION, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-clause-non-sollicitation-personnel";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "clause-non-sollicitation-personnel-devis-b2b";
const BLOG_PATH = "/blog/clause-non-sollicitation-personnel-devis-b2b";
const TOOL_PATH = "/outils/verificateur-clause-non-sollicitation-personnel";
const DAY = "2026-11-04";
const DAY_PATHS = ["/blog/clause-non-sollicitation-personnel-devis-b2b", "/outils/verificateur-clause-non-sollicitation-personnel"];

assert.equal(BLOG_TOOL_NON_SOLLICITATION, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 33);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de clause de non-sollicitation du personnel");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "personnes visées, durée, initiative du salarié, indemnité, intérim et acceptation des CGV : treize points contrôlés, la date de fin de l'interdiction et la clause à écrire.");

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
assert.ok(outilsHub.includes("verificateur-clause-non-sollicitation-personnel"));
assert.ok(outilsHub.includes("Vérificateur de clause de non-sollicitation du personnel"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-clause-non-sollicitation-personnel\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 7522);
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

for (const rel of ["src/lib/marketing/verificateur-clause-non-sollicitation-personnel.ts","src/components/marketing/verificateur-clause-non-sollicitation-personnel-calculator.tsx","src/app/(marketing)/outils/verificateur-clause-non-sollicitation-personnel/page.tsx","src/content/blog/clause-non-sollicitation-personnel-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, computeNonSollicitation, buildRecap, fmtEur, fmtDate, addMonths, finPeriode, parseDate } = X;\nconst NB = \"\\u00a0\";\nconst run = (o) => computeNonSollicitation({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point.startsWith(point));\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\n\n// Fichier\nconst numIds = [\"dureeContratMois\", \"dureeApresMois\", \"indemniteMois\", \"salaireMensuel\"];\nconst selIds = [\"role\", \"relation\", \"interet\", \"personnes\", \"actes\", \"initiative\", \"derogation\", \"reciprocite\", \"sanction\", \"acceptation\", \"negociation\"];\nassert.strictEqual(Object.keys(DEFAULTS).length, 16);\nassert.strictEqual(numIds.length + selIds.length + 1, 16);\n\n\n\nconst labelMap = { role: \"ROLE_LABELS\", relation: \"RELATION_LABELS\", interet: \"INTERET_LABELS\", personnes: \"PERSONNES_LABELS\", actes: \"ACTES_LABELS\", initiative: \"INITIATIVE_LABELS\", derogation: \"DEROGATION_LABELS\", reciprocite: \"RECIPROCITE_LABELS\", sanction: \"SANCTION_LABELS\", acceptation: \"ACCEPTATION_LABELS\", negociation: \"NEGOCIATION_LABELS\" };\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\n\n\n// Formats et dates\nassert.strictEqual(fmtEur(38400), \"38\" + NB + \"400\" + NB + \"€\");\nassert.strictEqual(fmtEur(0), \"0\" + NB + \"€\");\nassert.strictEqual(fmtEur(1234567), \"1\" + NB + \"234\" + NB + \"567\" + NB + \"€\");\nassert.strictEqual(fmtDate({ y: 2029, m: 11, d: 30 }), \"30 novembre 2029\");\nassert.strictEqual(fmtDate({ y: 2026, m: 12, d: 1 }), \"1er décembre 2026\");\nassert.deepStrictEqual(parseDate(\"2026-12-01\"), { y: 2026, m: 12, d: 1 });\nassert.strictEqual(parseDate(\"2027-02-29\"), null);\nassert.strictEqual(parseDate(\"01/12/2026\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.deepStrictEqual(addMonths({ y: 2027, m: 1, d: 31 }, 1), { y: 2027, m: 2, d: 28 });\nassert.deepStrictEqual(addMonths({ y: 2028, m: 1, d: 31 }, 1), { y: 2028, m: 2, d: 29 });\nassert.deepStrictEqual(addMonths({ y: 2026, m: 12, d: 1 }, 12), { y: 2027, m: 12, d: 1 });\nassert.deepStrictEqual(addMonths({ y: 2026, m: 11, d: 15 }, 2), { y: 2027, m: 1, d: 15 });\nassert.deepStrictEqual(finPeriode({ y: 2026, m: 12, d: 1 }, 12), { y: 2027, m: 11, d: 30 });\nassert.deepStrictEqual(finPeriode({ y: 2026, m: 12, d: 1 }, 36), { y: 2029, m: 11, d: 30 });\nassert.deepStrictEqual(finPeriode({ y: 2027, m: 3, d: 1 }, 12), { y: 2028, m: 2, d: 29 });\nassert.deepStrictEqual(finPeriode({ y: 2027, m: 1, d: 1 }, 12), { y: 2027, m: 12, d: 31 });\n\n// Cas par défaut (hypothèses d'exemple de l'article)\nconst r = computeNonSollicitation({});\nassert.strictEqual(r.controles.length, 13);\nassert.strictEqual(r.nbBad, 0);\nassert.strictEqual(r.nbWarn, 4);\nassert.strictEqual(r.nbOk, 4);\nassert.strictEqual(r.nbInfo, 5);\nassert.strictEqual(r.etat, \"warn\");\nassert.strictEqual(r.statutLabel, \"À compléter\");\nassert.strictEqual(r.finContratLabel, \"30 novembre 2027\");\nassert.strictEqual(r.finInterdictionLabel, \"30 novembre 2029\");\nassert.strictEqual(r.montant, 38400);\nassert.strictEqual(r.indemniteLabel, fmtEur(38400));\nfor (const p of [\"Intérêt protégé\", \"Personnes visées\", \"Durée\", \"Initiative du salarié\"]) assert.strictEqual(S(r, p), \"warn\", p);\nfor (const p of [\"Acceptation\", \"Actes visés\", \"Dérogation\", \"Indemnité\"]) assert.strictEqual(S(r, p), \"ok\", p);\nfor (const p of [\"Type de relation\", \"Réciprocité\", \"Négociation\", \"Situation du salarié\", \"Fin de l'interdiction\"]) assert.strictEqual(S(r, p), \"info\", p);\nassert(T(r, \"Intérêt protégé\").includes(\"24-21.805\"));\nassert(T(r, \"Intérêt protégé\").startsWith(\"Si vous invoquez la clause, c'est à vous\"));\nassert(T(r, \"Durée\").includes(\"jusqu'au 30 novembre 2029, soit 24 mois après la fin du contrat\"));\nassert(T(r, \"Dérogation\").includes(\"18-23.261\"));\nassert(T(r, \"Indemnité\").includes(\"1231-5\") && T(r, \"Indemnité\").includes(fmtEur(38400)));\nassert(T(r, \"Situation du salarié\").includes(\"1199\") && T(r, \"Situation du salarié\").includes(\"09-40.547\"));\nassert(T(r, \"Négociation\").includes(\"1171\"));\nassert(T(r, \"Acceptation\").includes(\"1119\"));\nassert(T(r, \"Type de relation\").includes(\"Aucune décision publiée\"));\nassert.strictEqual(r.verdict, \"Aucun point bloquant, mais 4 points à compléter : en l'état, la proportionnalité sera difficile à démontrer. Interdiction jusqu'au 30 novembre 2029.\");\nassert.strictEqual(r.apresPropose, 12);\nassert.strictEqual(r.indemPropose, 12);\nassert.strictEqual(r.articles, 6);\nassert(r.clause.startsWith(\"Non-sollicitation du personnel\\n1. Objet\"));\nassert.strictEqual(r.clause.split(\"\\n\").length, 7);\nassert(r.clause.includes(\"pendant la durée du contrat et pendant 12 mois après sa fin.\"));\nassert(r.clause.includes(\"directement ou par personne interposée\"));\nassert(r.clause.includes(\"4. Exception\"));\nassert(r.clause.includes(\"soit \" + fmtEur(38400) + \" pour un salaire de \" + fmtEur(3200)));\nassert(!r.clause.includes(\"Réciprocité\"));\nassert.strictEqual(r.actions.length, 5);\nassert(r.actions[4].startsWith(\"Gardez dans le dossier la liste des intervenants\"));\nassert(r.message.startsWith(\"Bonjour,\\n\\nNotre devis comporte une clause de non-sollicitation\"));\nassert(r.message.includes(\"Nous l'avons revue\") && r.message.includes(\"et 12 mois après sa fin\"));\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert.strictEqual(r.recap.split(\"\\n\").length, 11);\nassert(r.recap.includes(\"Contrat : du 1er décembre 2026 au 30 novembre 2027 (12 mois)\"));\nassert(r.recap.includes(\"Interdiction : jusqu'au 30 novembre 2029 (24 mois après la fin)\"));\nassert(r.recap.includes(\"Sanction : 12 mois de salaire brut, soit \" + fmtEur(38400)));\nassert(r.recap.includes(\"Statut : À compléter (0 bloquant, 4 à compléter, 4 conformes, 5 pour information)\"));\nassert(r.recap.includes(\"Points à traiter : intérêt protégé, personnes visées, durée, initiative du salarié\"));\nassert.strictEqual(buildRecap({}), r.recap);\n\n// Réécriture de l'article (intervenants, 12 mois, offres publiques, 6 mois, intérêt écrit)\nconst rok = run({ interet: \"documente\", personnes: \"intervenants\", dureeApresMois: 12, initiative: \"exclue\", indemniteMois: 6 });\nassert.strictEqual(rok.etat, \"ok\");\nassert.strictEqual(rok.nbOk, 8);\nassert.strictEqual(rok.finInterdictionLabel, \"30 novembre 2028\");\nassert.strictEqual(rok.indemniteLabel, fmtEur(19200));\nassert.strictEqual(rok.actions.length, 1);\nassert(rok.verdict.startsWith(\"La clause est limitée et justifiée.\"));\nassert(rok.message.includes(\"elle explique pourquoi nous la demandons\"));\nassert(rok.recap.includes(\"Points à traiter : aucun\"));\nassert(rok.clause.includes(\"indemnité égale à 6 mois\"));\n\n// Intérim\nconst ri = run({ relation: \"interim\" });\nassert.strictEqual(S(ri, \"Type de relation\"), \"bad\");\nassert(T(ri, \"Type de relation\").includes(\"L1251-44\") && T(ri, \"Type de relation\").includes(\"L1251-16\"));\nassert.strictEqual(ri.etat, \"bad\");\nassert.strictEqual(ri.finInterdiction, null);\nassert.strictEqual(ri.finInterdictionLabel, \"Clause non écrite\");\nassert.strictEqual(ri.articles, 1);\nassert(ri.clause.includes(\"réputée non écrite (article L1251-44\"));\nassert(ri.verdict.startsWith(\"1 point bloquant et 4 points à compléter : la clause ne pourra pas\"));\nassert(!ri.verdict.includes(\"Interdiction jusqu'au\"));\nassert(ri.message.includes(\"la loi la répute non écrite\"));\nassert(ri.recap.includes(\"Interdiction : réputée non écrite (article L1251-44)\"));\nassert(ri.actions[ri.actions.length - 1].startsWith(\"Retirez la clause\"));\nassert(run({ relation: \"interim\", role: \"client\" }).message.includes(\"Merci de la retirer.\"));\nassert(T(run({ relation: \"concurrents\" }), \"Type de relation\").includes(\"18-23.261\"));\nassert.strictEqual(S(run({ relation: \"concurrents\" }), \"Type de relation\"), \"info\");\n\n// Acceptation\nassert.strictEqual(S(run({ acceptation: \"signe\" }), \"Acceptation\"), \"ok\");\nassert.strictEqual(S(run({ acceptation: \"cgvVerso\" }), \"Acceptation\"), \"warn\");\nassert.strictEqual(S(run({ acceptation: \"aucune\" }), \"Acceptation\"), \"bad\");\nassert.strictEqual(run({ acceptation: \"aucune\" }).etat, \"bad\");\n\n// Personnes, actes, initiative\nassert.strictEqual(S(run({ personnes: \"metier\" }), \"Personnes\"), \"warn\");\nassert.strictEqual(S(run({ personnes: \"intervenants\" }), \"Personnes\"), \"ok\");\nassert.strictEqual(S(run({ actes: \"embauche\" }), \"Actes\"), \"info\");\nconst rs = run({ actes: \"sollicitation\" });\nassert.strictEqual(S(rs, \"Actes\"), \"info\");\nassert.strictEqual(S(rs, \"Initiative\"), \"ok\");\nassert.strictEqual(rs.articles, 5);\nassert(!rs.clause.includes(\"Exception\"));\nassert(rs.clause.includes(\"à ne pas solliciter les personnes visées en vue de les embaucher\"));\nassert.strictEqual(S(run({ initiative: \"incluse\" }), \"Initiative\"), \"warn\");\nassert.strictEqual(S(run({ initiative: \"exclue\" }), \"Initiative\"), \"ok\");\n\n// Durée\nconst r0 = run({ dureeApresMois: 0 });\nassert.strictEqual(S(r0, \"Durée\"), \"ok\");\nassert(T(r0, \"Durée\").startsWith(\"L'interdiction ne joue que pendant le contrat, jusqu'au 30 novembre 2027.\"));\nassert.strictEqual(r0.finInterdictionLabel, \"30 novembre 2027\");\nassert(r0.clause.includes(\"pendant la durée du contrat.\"));\nassert(r0.recap.includes(\"Interdiction : pendant le contrat seulement, jusqu'au 30 novembre 2027\"));\nassert(r0.verdict.endsWith(\"Interdiction jusqu'au 30 novembre 2027.\"));\nassert.strictEqual(S(run({ dureeApresMois: 12 }), \"Durée\"), \"ok\");\nassert.strictEqual(S(run({ dureeApresMois: 13 }), \"Durée\"), \"warn\");\nassert.strictEqual(S(run({ dureeApresMois: 24 }), \"Durée\"), \"warn\");\nassert.strictEqual(S(run({ dureeApresMois: 25 }), \"Durée\"), \"bad\");\nassert.strictEqual(run({ dureeApresMois: 6 }).apresPropose, 6);\nconst rb = run({ dateDebut: \"2027-03-01\", dureeContratMois: 12, dureeApresMois: 0 });\nassert.strictEqual(rb.finContratLabel, \"29 février 2028\");\nassert.strictEqual(run({ dateDebut: \"n'importe quoi\" }).finContratLabel, \"30 novembre 2027\");\nassert.strictEqual(run({ dureeApresMois: \"abc\" }).dureeApresMois, 0);\nassert.strictEqual(run({ dureeApresMois: 999 }).dureeApresMois, 120);\nassert.strictEqual(run({ dureeContratMois: 0 }).dureeContratMois, 1);\nassert.strictEqual(run({ dureeContratMois: \"abc\" }).dureeContratMois, 12);\nassert.strictEqual(run({ salaireMensuel: -5 }).salaireMensuel, 0);\nassert.strictEqual(run({ salaireMensuel: \"3 200\" }).salaireMensuel, 3200);\nassert.strictEqual(run({ indemniteMois: \"6,4\" }).indemniteMois, 6);\n\n// Indemnité\nassert.strictEqual(S(run({ indemniteMois: 13 }), \"Indemnité\"), \"warn\");\nassert.strictEqual(run({ indemniteMois: 18 }).indemPropose, 12);\nconst ri0 = run({ indemniteMois: 0 });\nassert.strictEqual(S(ri0, \"Indemnité\"), \"warn\");\nassert.strictEqual(ri0.indemniteLabel, \"Montant à fixer\");\nassert.strictEqual(ri0.indemPropose, 6);\nconst rsal = run({ salaireMensuel: 0 });\nassert.strictEqual(rsal.indemniteLabel, \"12 mois de salaire\");\nassert(!rsal.clause.includes(\"pour un salaire de\"));\nconst rdc = run({ sanction: \"droitCommun\" });\nassert.strictEqual(S(rdc, \"Indemnité\"), \"warn\");\nassert.strictEqual(rdc.indemniteLabel, \"Préjudice à prouver\");\nassert(rdc.clause.includes(\"dans les conditions du droit commun\"));\nassert(rdc.recap.includes(\"Sanction : droit commun, préjudice à prouver\"));\nassert.strictEqual(S(run({ sanction: \"droitCommun\", role: \"client\" }), \"Indemnité\"), \"info\");\n\n// Dérogation, réciprocité, négociation, intérêt\nassert.strictEqual(S(run({ derogation: \"silence\" }), \"Dérogation\"), \"info\");\nconst rr = run({ reciprocite: \"reciproque\" });\nassert.strictEqual(S(rr, \"Réciprocité\"), \"ok\");\nassert.strictEqual(rr.articles, 7);\nassert(rr.clause.includes(\"5. Réciprocité\"));\nassert.strictEqual(S(run({ negociation: \"negociee\" }), \"Négociation\"), \"ok\");\nassert.strictEqual(S(run({ interet: \"documente\" }), \"Intérêt\"), \"ok\");\nassert(T(run({ role: \"client\" }), \"Intérêt\").startsWith(\"Si le prestataire invoque la clause, c'est à lui\"));\n\n// Message côté client\nconst rc = run({ role: \"client\" });\nassert(rc.message.startsWith(\"Bonjour,\\n\\nMerci pour votre devis. Avant de le signer\"));\nassert(rc.message.includes(\"sur ces points : intérêt protégé, personnes visées, durée, initiative du salarié\"));\nassert(rc.verdict.startsWith(\"Aucun point bloquant, mais 4 points à négocier avant de signer.\"));\nassert(run({ role: \"client\", interet: \"documente\", personnes: \"intervenants\", dureeApresMois: 12, initiative: \"exclue\" }).message.includes(\"nous convient\"));\n\n// Valeurs invalides\nconst rinv = computeNonSollicitation({ role: \"zz\", relation: \"zz\", acceptation: \"zz\", sanction: \"zz\", personnes: \"zz\", derogation: \"zz\" });\nassert.strictEqual(rinv.role, \"prestataire\");\nassert.strictEqual(rinv.relation, \"client\");\nassert.strictEqual(rinv.sanction, \"droitCommun\");\nassert.strictEqual(S(rinv, \"Acceptation\"), \"bad\");\nassert.strictEqual(S(rinv, \"Dérogation\"), \"info\");\n\n")(tool, require, console);
console.log("seo-pm-20261104 ok");
