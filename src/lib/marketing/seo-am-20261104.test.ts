import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_ACCORD_CONFIDENTIALITE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-accord-confidentialite-nda";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "accord-confidentialite-nda-avant-devis-b2b";
const BLOG_PATH = "/blog/accord-confidentialite-nda-avant-devis-b2b";
const TOOL_PATH = "/outils/verificateur-accord-confidentialite-nda";
const DAY = "2026-11-04";
const DAY_PATHS = ["/blog/accord-confidentialite-nda-avant-devis-b2b", "/secteurs/funnel-devis-impression-3d-prototypage", "/outils/verificateur-accord-confidentialite-nda"];

assert.equal(BLOG_TOOL_ACCORD_CONFIDENTIALITE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 28);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur d'accord de confidentialité (NDA)");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "avant d'envoyer un plan ou un fichier pour un devis : définition, exclusions, finalité, rétro-ingénierie, durée et sanction. Quinze points contrôlés, et les clauses à compléter.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-impression-3d-prototypage")?.priority, 0.8);

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
assert.ok(outilsHub.includes("verificateur-accord-confidentialite-nda"));
assert.ok(outilsHub.includes("Vérificateur d'accord de confidentialité (NDA)"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-accord-confidentialite-nda\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-impression-3d-prototypage"));
assert.ok(secteursHub.includes("Impression 3D et prototypage"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 6997);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-impression-3d-prototypage.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-impression-3d-prototypage/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 5588);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Impression 3D et prototypage"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/verificateur-accord-confidentialite-nda.ts","src/components/marketing/verificateur-accord-confidentialite-nda-calculator.tsx","src/app/(marketing)/outils/verificateur-accord-confidentialite-nda/page.tsx","src/content/blog/accord-confidentialite-nda-avant-devis-b2b.md","src/content/blog/funnel-devis-impression-3d-prototypage.md","src/app/(marketing)/secteurs/funnel-devis-impression-3d-prototypage/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, computeNda, buildRecap, fmtEur, fmtDate, addYears, parseDate } = X;\nconst NB = \"\\u00a0\";\nconst run = (o) => computeNda({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point.startsWith(point));\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\n\n// Fichier\nconst numIds = [\"dureeAns\", \"vieAns\", \"penalite\"];\nconst selIds = [\"role\", \"sens\", \"moment\", \"brevet\", \"echantillons\", \"definition\", \"oral\", \"exclusions\", \"finalite\", \"retro\", \"destinataires\", \"survie\", \"restitution\", \"licence\", \"sanction\", \"etranger\", \"juridiction\"];\nassert.strictEqual(Object.keys(DEFAULTS).length, 21);\nassert.strictEqual(numIds.length + selIds.length + 1, 21);\n\n\n\nconst labelMap = { role: \"ROLE_LABELS\", sens: \"SENS_LABELS\", moment: \"MOMENT_LABELS\", brevet: \"BREVET_LABELS\", echantillons: \"ECHANTILLONS_LABELS\", definition: \"DEFINITION_LABELS\", oral: \"ORAL_LABELS\", exclusions: \"EXCLUSIONS_LABELS\", finalite: \"FINALITE_LABELS\", retro: \"RETRO_LABELS\", destinataires: \"DESTINATAIRES_LABELS\", survie: \"SURVIE_LABELS\", restitution: \"RESTITUTION_LABELS\", licence: \"LICENCE_LABELS\", sanction: \"SANCTION_LABELS\", etranger: \"ETRANGER_LABELS\", juridiction: \"JURIDICTION_LABELS\" };\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\n\n\n// Formats et dates\nassert.strictEqual(fmtEur(20000), \"20\" + NB + \"000\" + NB + \"€\");\nassert.strictEqual(fmtEur(0), \"0\" + NB + \"€\");\nassert.strictEqual(fmtEur(1234567), \"1\" + NB + \"234\" + NB + \"567\" + NB + \"€\");\nassert.strictEqual(fmtDate({ y: 2031, m: 11, d: 5 }), \"5 novembre 2031\");\nassert.strictEqual(fmtDate({ y: 2027, m: 8, d: 1 }), \"1er août 2027\");\nassert.deepStrictEqual(parseDate(\"2026-11-05\"), { y: 2026, m: 11, d: 5 });\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\nassert.strictEqual(parseDate(\"05/11/2026\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.deepStrictEqual(addYears({ y: 2028, m: 2, d: 29 }, 1), { y: 2029, m: 2, d: 28 });\nassert.deepStrictEqual(addYears({ y: 2028, m: 2, d: 29 }, 4), { y: 2032, m: 2, d: 29 });\nassert.deepStrictEqual(addYears({ y: 2028, m: 2, d: 29 }, 72), { y: 2100, m: 2, d: 28 });\nassert.deepStrictEqual(addYears({ y: 2024, m: 2, d: 29 }, 376), { y: 2400, m: 2, d: 29 });\n\n// Cas par défaut (hypothèses d'exemple de l'article)\nconst r = computeNda({});\nassert.strictEqual(r.controles.length, 15);\nassert.strictEqual(r.nbBad, 0);\nassert.strictEqual(r.nbWarn, 3);\nassert.strictEqual(r.nbInfo, 1);\nassert.strictEqual(r.nbOk, 11);\nassert.strictEqual(r.etat, \"warn\");\nassert.strictEqual(r.statutLabel, \"À compléter\");\nassert.strictEqual(r.finLabel, \"5 novembre 2031\");\nassert.strictEqual(r.ecart, -3);\nassert.strictEqual(r.ecartLabel, \"3 ans de moins\");\nassert.strictEqual(r.sanctionLabel, fmtEur(20000));\nassert.strictEqual(S(r, \"Informations orales\"), \"warn\");\nassert.strictEqual(S(r, \"Durée\"), \"warn\");\nassert.strictEqual(S(r, \"Restitution\"), \"warn\");\nassert.strictEqual(S(r, \"Droits sur\"), \"info\");\nassert.strictEqual(S(r, \"Invention\"), \"ok\");\nassert(T(r, \"Durée\").includes(\"le 5 novembre 2031, 3 ans avant\"));\nassert(T(r, \"Durée\").includes(\"Allongez la durée à 8 ans.\"));\nassert(T(r, \"Sanction\").includes(\"1231-5\"));\nassert.strictEqual(r.verdict, \"Aucun point bloquant, mais 3 points à compléter avant la signature. Obligation jusqu'au 5 novembre 2031.\");\nassert.strictEqual(r.dureeProposee, 8);\nassert.strictEqual(r.articles, 10);\nassert(r.clause.startsWith(\"Accord de confidentialité\\n1. Objet\"));\nassert.strictEqual(r.clause.split(\"\\n\").length, 11);\nassert(r.clause.includes(\"pendant 8 ans à compter du [date de signature], soit jusqu'au 5 novembre 2034\"));\nassert(r.clause.includes(\"pénalité de \" + fmtEur(20000)));\nassert(r.clause.includes(\"[la juridiction compétente du ressort de ville]\"));\nassert(r.clause.includes(\"le Destinataire n'utilise les informations que pour étudier la demande\"));\nassert(r.clause.includes(\"5. Échantillons\"));\nassert(!r.clause.includes(\"listées en annexe\"));\nassert.strictEqual(r.actions.length, 4);\nassert(r.actions[3].startsWith(\"Notez dans le dossier\"));\nassert(r.message.startsWith(\"Bonjour,\\n\\nPour vous permettre de chiffrer notre demande\"));\nassert(r.message.includes(\"d'une durée de 8 ans\"));\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert.strictEqual(r.recap.split(\"\\n\").length, 11);\nassert(r.recap.includes(\"Statut : À compléter (0 bloquant, 3 à compléter, 11 conformes, 1 pour information)\"));\nassert(r.recap.includes(\"Points à traiter : informations orales, durée, restitution et destruction\"));\nassert(r.recap.includes(\"Durée : 5 ans, jusqu'au 5 novembre 2031\"));\nassert.strictEqual(buildRecap({}), r.recap);\n\n// Tout corrigé\nconst rok = run({ oral: \"confirme\", dureeAns: 8, restitution: \"prevue\", licence: \"exclue\" });\nassert.strictEqual(rok.etat, \"ok\");\nassert.strictEqual(rok.nbOk, 15);\nassert.strictEqual(rok.ecartLabel, \"Couverte\");\nassert.strictEqual(rok.finLabel, \"5 novembre 2034\");\nassert.strictEqual(rok.actions.length, 1);\nassert(rok.verdict.startsWith(\"L'accord couvre les points essentiels.\"));\nassert(rok.message.includes(\"L'accord de confidentialité est signé\"));\nassert(rok.recap.includes(\"Points à traiter : aucun\"));\n\n// Moment et brevet\nconst rap = run({ moment: \"apres\" });\nassert.strictEqual(S(rap, \"Moment\"), \"warn\");\nassert.strictEqual(S(rap, \"Invention\"), \"bad\");\nassert.strictEqual(rap.etat, \"bad\");\nassert(rap.clause.includes(\"listées en annexe\"));\nassert(rap.verdict.startsWith(\"1 point bloquant et 4 points à compléter : corrigez l'accord\"));\nconst rns = run({ moment: \"nonSigne\" });\nassert.strictEqual(S(rns, \"Moment\"), \"warn\");\nassert.strictEqual(S(rns, \"Invention\"), \"warn\");\nassert(T(rns, \"Moment\").includes(\"1112-2\"));\nassert.strictEqual(S(run({ moment: \"apres\", brevet: \"non\" }), \"Invention\"), \"info\");\nassert.strictEqual(run({ moment: \"apres\", brevet: \"non\" }).etat, \"warn\");\n\n// Sens\nassert.strictEqual(S(run({ sens: \"mutuel\" }), \"Sens\"), \"ok\");\nassert.strictEqual(S(run({ role: \"destinataire\" }), \"Sens\"), \"info\");\nassert(run({ sens: \"mutuel\" }).clause.includes(\"chaque partie, pour les informations qu'elle reçoit de l'autre, n'utilise\"));\nassert(run({ sens: \"mutuel\" }).clause.includes(\"informations de l'autre partie\"));\nassert(r.clause.includes(\"informations du Divulgateur\"));\n\n// Définition, exclusions, finalité\nassert.strictEqual(S(run({ definition: \"large\" }), \"Définition\"), \"warn\");\nassert.strictEqual(S(run({ definition: \"aucune\" }), \"Définition\"), \"bad\");\nassert.strictEqual(S(run({ exclusions: \"partielles\" }), \"Exclusions\"), \"warn\");\nassert.strictEqual(S(run({ exclusions: \"aucune\" }), \"Exclusions\"), \"warn\");\nassert.strictEqual(S(run({ exclusions: \"aucune\", role: \"destinataire\" }), \"Exclusions\"), \"bad\");\nassert.strictEqual(S(run({ finalite: \"absente\" }), \"Finalité\"), \"bad\");\nassert(T(run({ finalite: \"absente\" }), \"Finalité\").includes(\"L151-5\"));\n\n// Rétro-ingénierie\nassert.strictEqual(S(run({ retro: \"silence\" }), \"Rétro\"), \"bad\");\nassert(T(run({ retro: \"silence\" }), \"Rétro\").includes(\"L151-3\"));\nassert.strictEqual(S(run({ retro: \"silence\", role: \"destinataire\" }), \"Rétro\"), \"info\");\nassert.strictEqual(S(run({ echantillons: \"non\", retro: \"silence\" }), \"Rétro\"), \"info\");\nconst rne = run({ echantillons: \"non\" });\nassert.strictEqual(rne.articles, 9);\nassert(!rne.clause.includes(\"Échantillons\"));\nassert(rne.recap.includes(\"Échantillons : documents et fichiers seulement\\n\"));\n\n// Destinataires, survie\nassert.strictEqual(S(run({ destinataires: \"libre\" }), \"Destinataires\"), \"warn\");\nassert.strictEqual(S(run({ destinataires: \"silence\" }), \"Destinataires\"), \"warn\");\nassert.strictEqual(S(run({ survie: \"non\" }), \"Après\"), \"warn\");\n\n// Durée\nconst r0 = run({ dureeAns: 0 });\nassert.strictEqual(S(r0, \"Durée\"), \"warn\");\nassert(T(r0, \"Durée\").includes(\"1210\") && T(r0, \"Durée\").includes(\"1211\"));\nassert.strictEqual(r0.fin, null);\nassert.strictEqual(r0.finLabel, \"Sans limite écrite\");\nassert.strictEqual(r0.ecartLabel, \"Durée à fixer\");\nassert.strictEqual(r0.dureeProposee, 8);\nassert(r0.verdict.endsWith(\"Aucune date de fin écrite.\"));\nassert(r0.recap.includes(\"Durée : aucune durée écrite\"));\nconst rd = run({ role: \"destinataire\", dureeAns: 3 });\nassert.strictEqual(S(rd, \"Durée\"), \"info\");\nassert.strictEqual(rd.dureeProposee, 3);\nassert.strictEqual(rd.ecartLabel, \"5 ans de moins\");\nassert.strictEqual(run({ dureeAns: 1, vieAns: 2 }).ecartLabel, \"1 an de moins\");\nassert.strictEqual(S(run({ dureeAns: 10 }), \"Durée\"), \"ok\");\nassert.strictEqual(run({ dureeAns: 10 }).dureeProposee, 10);\nconst rb = run({ dateSignature: \"2028-02-29\", dureeAns: 1 });\nassert.strictEqual(rb.finLabel, \"28 février 2029\");\nassert(rb.recap.includes(\"Signature : 29 février 2028\"));\nassert.strictEqual(run({ dateSignature: \"n'importe quoi\" }).finLabel, \"5 novembre 2031\");\nassert.strictEqual(run({ dureeAns: \"abc\" }).dureeAns, 0);\nassert.strictEqual(run({ dureeAns: 99 }).dureeAns, 50);\nassert.strictEqual(run({ vieAns: 0 }).vieAns, 1);\nassert.strictEqual(run({ penalite: -5 }).penalite, 0);\nassert.strictEqual(run({ dureeAns: \"6,4\" }).dureeAns, 6);\n\n// Sanction\nassert.strictEqual(S(run({ penalite: 0 }), \"Sanction\"), \"warn\");\nassert(run({ penalite: 0 }).clause.includes(\"pénalité de [montant] €\"));\nconst rdc = run({ sanction: \"droitCommun\" });\nassert.strictEqual(S(rdc, \"Sanction\"), \"warn\");\nassert(T(rdc, \"Sanction\").includes(\"7 mai 2019\"));\nassert.strictEqual(rdc.sanctionLabel, \"Préjudice à prouver\");\nassert(rdc.clause.includes(\"dans les conditions du droit commun\"));\nassert(rdc.recap.includes(\"Sanction : droit commun, préjudice à prouver\"));\nassert.strictEqual(S(run({ sanction: \"droitCommun\", role: \"destinataire\" }), \"Sanction\"), \"info\");\n\n// Juridiction\nassert.strictEqual(S(run({ juridiction: \"silence\" }), \"Droit applicable\"), \"info\");\nassert.strictEqual(S(run({ juridiction: \"silence\", etranger: \"oui\" }), \"Droit applicable\"), \"warn\");\nassert.strictEqual(S(run({ juridiction: \"prevue\", etranger: \"oui\" }), \"Droit applicable\"), \"ok\");\n\n// Message côté fournisseur\nconst rf = run({ role: \"destinataire\" });\nassert(rf.message.startsWith(\"Bonjour,\\n\\nMerci pour votre demande de devis\"));\nassert(rf.message.includes(\"Avant de le signer, nous souhaitons revoir ces points : informations orales\"));\nconst rfok = run({ role: \"destinataire\", oral: \"confirme\", restitution: \"prevue\", sens: \"mutuel\" });\nassert(rfok.message.includes(\"Il nous convient\"));\n\n// Valeurs invalides\nconst ri = computeNda({ role: \"zz\", sens: \"zz\", moment: \"zz\", sanction: \"zz\", exclusions: \"zz\", finalite: \"zz\" });\nassert.strictEqual(ri.role, \"divulgateur\");\nassert.strictEqual(ri.moment, \"nonSigne\");\nassert.strictEqual(ri.sanction, \"droitCommun\");\nassert.strictEqual(S(ri, \"Finalité\"), \"bad\");\n\n")(tool, require, console);
console.log("seo-am-20261104 ok");
