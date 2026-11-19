import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_REGLEMENT_LITIGES, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-clause-reglement-litiges";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "clause-attributive-juridiction-mediation-devis-b2b";
const BLOG_PATH = "/blog/clause-attributive-juridiction-mediation-devis-b2b";
const TOOL_PATH = "/outils/verificateur-clause-reglement-litiges";
const DAY = "2026-11-05";
const DAY_PATHS = ["/blog/clause-attributive-juridiction-mediation-devis-b2b", "/secteurs/funnel-devis-seminaire-entreprise", "/outils/verificateur-clause-reglement-litiges"];

assert.equal(BLOG_TOOL_REGLEMENT_LITIGES, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 32);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de clause de règlement des litiges");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "qualité des parties, présentation, acceptation des CGV, tribunal choisi, médiation préalable et délai : treize points contrôlés, la date de saisine possible et la clause à écrire.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-seminaire-entreprise")?.priority, 0.8);

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
assert.ok(outilsHub.includes("verificateur-clause-reglement-litiges"));
assert.ok(outilsHub.includes("Vérificateur de clause de règlement des litiges"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-clause-reglement-litiges\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-seminaire-entreprise"));
assert.ok(secteursHub.includes("Séminaire d'entreprise"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 7497);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-seminaire-entreprise.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-seminaire-entreprise/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 5276);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Séminaire d'entreprise"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/verificateur-clause-reglement-litiges.ts","src/components/marketing/verificateur-clause-reglement-litiges-calculator.tsx","src/app/(marketing)/outils/verificateur-clause-reglement-litiges/page.tsx","src/content/blog/clause-attributive-juridiction-mediation-devis-b2b.md","src/content/blog/funnel-devis-seminaire-entreprise.md","src/app/(marketing)/secteurs/funnel-devis-seminaire-entreprise/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, computeReglementLitiges, buildRecap, fmtDate, addDays, parseDate, num } = X;\nconst run = (o) => computeReglementLitiges({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point.startsWith(point));\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\nconst POINTS = [\"Qualité des parties\", \"Présentation de la clause\", \"Acceptation des CGV\", \"Tribunal choisi\", \"Client étranger\", \"Étape amiable\", \"Tiers\", \"Durée de l'étape\", \"Factures non contestées\", \"Urgence\", \"Réciprocité\", \"Arbitrage\", \"Prescription\"];\n\n// Fichier\nconst numIds = [\"delaiJours\"];\nconst selIds = [\"role\", \"qualiteP\", \"qualiteC\", \"etranger\", \"arbitrage\", \"tribunal\", \"presentation\", \"acceptation\", \"amiable\", \"tiers\", \"frais\", \"reciprocite\", \"exclusionImpayes\", \"urgence\"];\nassert.strictEqual(Object.keys(DEFAULTS).length, 16);\nassert.strictEqual(numIds.length + selIds.length + 1, 16);\n\n\n\nconst labelMap = { role: \"ROLE_LABELS\", qualiteP: \"QUALITE_P_LABELS\", qualiteC: \"QUALITE_C_LABELS\", etranger: \"ETRANGER_LABELS\", arbitrage: \"ARBITRAGE_LABELS\", tribunal: \"TRIBUNAL_LABELS\", presentation: \"PRESENTATION_LABELS\", acceptation: \"ACCEPTATION_LABELS\", amiable: \"AMIABLE_LABELS\", tiers: \"TIERS_LABELS\", frais: \"FRAIS_LABELS\", reciprocite: \"RECIPROCITE_LABELS\", exclusionImpayes: \"EXCLUSION_LABELS\", urgence: \"URGENCE_LABELS\" };\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\n\n\n// Formats et dates\nassert.strictEqual(fmtDate({ y: 2027, m: 4, d: 29 }), \"29 avril 2027\");\nassert.strictEqual(fmtDate({ y: 2027, m: 5, d: 1 }), \"1er mai 2027\");\nassert.deepStrictEqual(parseDate(\"2027-03-15\"), { y: 2027, m: 3, d: 15 });\nassert.strictEqual(parseDate(\"2027-02-29\"), null);\nassert.strictEqual(parseDate(\"15/03/2027\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.deepStrictEqual(addDays({ y: 2027, m: 3, d: 15 }, 45), { y: 2027, m: 4, d: 29 });\nassert.deepStrictEqual(addDays({ y: 2027, m: 3, d: 15 }, 30), { y: 2027, m: 4, d: 14 });\nassert.deepStrictEqual(addDays({ y: 2027, m: 12, d: 20 }, 15), { y: 2028, m: 1, d: 4 });\nassert.deepStrictEqual(addDays({ y: 2028, m: 2, d: 1 }, 28), { y: 2028, m: 2, d: 29 });\nassert.deepStrictEqual(addDays({ y: 2027, m: 3, d: 28 }, 1), { y: 2027, m: 3, d: 29 });\nassert.strictEqual(num(\"45\", 0, 365, 0), 45);\nassert.strictEqual(num(\"abc\", 0, 365, 0), 0);\nassert.strictEqual(num(\"999\", 0, 365, 0), 365);\nassert.strictEqual(num(\"30,4\", 0, 365, 0), 30);\n\n// Cas par défaut (hypothèses d'exemple de l'article)\nconst r = computeReglementLitiges({});\nassert.strictEqual(r.controles.length, 13);\nassert.deepStrictEqual(r.controles.map((c) => c.point), POINTS);\nassert.strictEqual(r.nbBad, 0);\nassert.strictEqual(r.nbWarn, 7);\nassert.strictEqual(r.nbOk, 3);\nassert.strictEqual(r.nbInfo, 3);\nassert.strictEqual(r.etat, \"warn\");\nassert.strictEqual(r.statutLabel, \"À compléter\");\nassert.strictEqual(r.tribunalLabel, \"Fragile\");\nassert.strictEqual(r.saisineLabel, \"Délai non fixé\");\nassert.strictEqual(r.amiableLabel, \"Trop vague\");\nassert.strictEqual(r.saisine, null);\nfor (const p of [\"Présentation\", \"Tribunal\", \"Étape amiable\", \"Tiers\", \"Durée\", \"Factures\", \"Urgence\"]) assert.strictEqual(S(r, p), \"warn\", p);\nfor (const p of [\"Qualité\", \"Acceptation\", \"Réciprocité\"]) assert.strictEqual(S(r, p), \"ok\", p);\nfor (const p of [\"Client étranger\", \"Arbitrage\", \"Prescription\"]) assert.strictEqual(S(r, p), \"info\", p);\nassert(T(r, \"Qualité\").includes(\"article 48\"));\nassert(T(r, \"Présentation\").includes(\"15-20.908\"));\nassert(T(r, \"Acceptation\").includes(\"1119\"));\nassert(T(r, \"Étape amiable\").includes(\"12-27.004\") && T(r, \"Étape amiable\").includes(\"16-26.403\"));\nassert(T(r, \"Urgence\").includes(\"1537\"));\nassert(T(r, \"Prescription\").includes(\"2238\"));\nassert(T(r, \"Factures\").startsWith(\"La clause vise tout différend : votre propre facture\"));\nassert.strictEqual(r.verdict, \"La clause tient en partie, mais 7 points restent à compléter. Ce sont eux qui seront discutés le jour du litige.\");\nassert.strictEqual(r.articles, 2);\nassert.strictEqual(r.clause.split(\"\\n\").length, 3);\nassert(r.clause.startsWith(\"Clauses proposées (à adapter avec votre conseil)\\nArticle [1] Règlement amiable préalable.\"));\nassert(r.clause.includes(\"dans un délai de 45 jours à compter de la notification\"));\nassert(r.clause.includes(\"tribunal de commerce de [ville], ou à la juridiction qui lui succède\"));\nassert(r.clause.includes(\"ne s'applique pas au recouvrement des factures non contestées\"));\nassert(r.clause.includes(\"juge des référés\"));\nassert.strictEqual(r.actions.length, 8);\nassert(r.actions[0].startsWith(\"À compléter, Présentation de la clause\"));\nassert(r.actions[7].startsWith(\"Le jour d'un différend\"));\nassert(r.message.startsWith(\"Bonjour,\\n\\nNous avons revu l'article de nos conditions\"));\nassert(r.message.includes(\"rappelée près de la signature\"));\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert.strictEqual(r.recap.split(\"\\n\").length, 11);\nassert(r.recap.includes(\"Parties : société commerciale et société commerciale, client établi en France\"));\nassert(r.recap.includes(\"Tribunal : formule vague, noyée dans les CGV (Fragile)\"));\nassert(r.recap.includes(\"Saisine du juge : délai non fixé\"));\nassert(r.recap.includes(\"Statut : À compléter (0 bloquant, 7 à compléter, 3 conformes, 3 pour information)\"));\nassert(r.recap.includes(\"Points à traiter : Présentation de la clause, Tribunal choisi, Étape amiable, Tiers, Durée de l'étape, Factures non contestées, Urgence\"));\nassert.strictEqual(buildRecap({}), r.recap);\n\n// Clause réécrite (exemple de l'article : rappel près de la signature, tribunal nommé, médiation 45 jours)\nconst rok = run({ presentation: \"signature\", tribunal: \"precis\", amiable: \"precise\", tiers: \"mediateur\", frais: \"partages\", delaiJours: 45, exclusionImpayes: \"oui\", urgence: \"oui\" });\nassert.strictEqual(rok.etat, \"ok\");\nassert.strictEqual(rok.nbOk, 10);\nassert.strictEqual(rok.nbInfo, 3);\nassert.strictEqual(rok.tribunalLabel, \"Opposable\");\nassert.strictEqual(rok.amiableLabel, \"Écrite\");\nassert.strictEqual(rok.saisineLabel, \"Le 29 avril 2027\");\nassert(T(rok, \"Durée\").includes(\"notification du 15 mars 2027 : saisine du juge possible le 29 avril 2027\"));\nassert(T(rok, \"Étape amiable\").includes(\"00-19.423\") && T(rok, \"Étape amiable\").includes(\"13-19.684\"));\nassert.strictEqual(rok.actions.length, 1);\nassert(rok.verdict.startsWith(\"La clause est complète\"));\nassert(rok.recap.includes(\"Saisine du juge : possible le 29 avril 2027 (notification du 15 mars 2027, 45 jours)\"));\nassert(rok.recap.includes(\"Points à traiter : aucun\"));\nassert(rok.clause.includes(\"dans un délai de 45 jours\"));\nassert.strictEqual(run({ amiable: \"precise\", delaiJours: 30 }).saisineLabel, \"Le 14 avril 2027\");\nassert(run({ amiable: \"precise\", delaiJours: 60 }).clause.includes(\"délai de 60 jours\"));\nassert(run({ amiable: \"precise\", delaiJours: 120 }).clause.includes(\"délai de 45 jours\"));\n\n// Qualité des parties (article 48)\nfor (const q of [\"artisan\", \"liberal\", \"association\", \"civile\", \"particulier\"]) {\n  const x = run({ qualiteC: q });\n  assert.strictEqual(S(x, \"Qualité\"), \"bad\", q);\n  assert.strictEqual(x.tribunalLabel, \"Réputée non écrite\", q);\n  assert(x.clause.includes(\"règles de droit commun\"), q);\n}\nassert(T(run({ qualiteC: \"artisan\" }), \"Qualité\").includes(\"91-14.734\"));\nassert(T(run({ qualiteC: \"artisan\" }), \"Qualité\").includes(\"(artisan en entreprise individuelle)\"));\nassert(T(run({ qualiteP: \"liberal\" }), \"Qualité\").includes(\"(profession libérale)\"));\nassert.strictEqual(S(run({ qualiteC: \"commercant\" }), \"Qualité\"), \"ok\");\nassert.strictEqual(S(run({ qualiteC: \"artisan\", tribunal: \"aucun\" }), \"Qualité\"), \"info\");\nassert.strictEqual(run({ qualiteC: \"artisan\", tribunal: \"aucun\" }).tribunalLabel, \"Droit commun\");\nassert(run({ role: \"client\", qualiteC: \"association\" }).message.includes(\"Notre structure n'étant pas commerçante\"));\nassert(!run({ role: \"client\" }).message.includes(\"Notre structure\"));\n\n// Présentation, acceptation, tribunal\nassert.strictEqual(S(run({ presentation: \"titre\" }), \"Présentation\"), \"ok\");\nassert.strictEqual(S(run({ presentation: \"facture\" }), \"Présentation\"), \"bad\");\nassert.strictEqual(run({ presentation: \"facture\", tribunal: \"precis\" }).tribunalLabel, \"Inopposable\");\nassert.strictEqual(S(run({ tribunal: \"aucun\" }), \"Présentation\"), \"info\");\nassert.strictEqual(S(run({ acceptation: \"lien\" }), \"Acceptation\"), \"warn\");\nassert.strictEqual(S(run({ acceptation: \"aucune\" }), \"Acceptation\"), \"bad\");\nassert.strictEqual(run({ acceptation: \"aucune\", tribunal: \"precis\", presentation: \"signature\" }).tribunalLabel, \"Inopposable\");\nassert.strictEqual(run({ acceptation: \"lien\", tribunal: \"precis\", presentation: \"signature\" }).tribunalLabel, \"Fragile\");\nassert.strictEqual(S(run({ tribunal: \"precis\" }), \"Tribunal\"), \"ok\");\nassert(T(run({ tribunal: \"aucun\" }), \"Tribunal\").includes(\"articles 42 et 46\"));\n\n// Client étranger\nconst rue = run({ etranger: \"ue\" });\nassert.strictEqual(S(rue, \"Qualité\"), \"info\");\nassert.strictEqual(S(rue, \"Client étranger\"), \"warn\");\nassert(T(rue, \"Client étranger\").includes(\"1215/2012\"));\nassert.strictEqual(rue.tribunalLabel, \"Règlement UE\");\nassert(rue.clause.includes(\"Clause à rédiger avec un conseil\"));\nassert.strictEqual(S(run({ etranger: \"horsUe\" }), \"Client étranger\"), \"warn\");\nassert(run({ etranger: \"horsUe\" }).clause.includes(\"hors de l'Union\"));\n\n// Étape amiable, tiers, durée\nconst rsans = run({ amiable: \"aucune\" });\nassert.strictEqual(rsans.saisineLabel, \"Immédiatement\");\nassert.strictEqual(rsans.amiableLabel, \"Aucune\");\nfor (const p of [\"Étape amiable\", \"Tiers\", \"Durée\", \"Factures\", \"Urgence\", \"Réciprocité\"]) assert.strictEqual(S(rsans, p), \"info\", p);\nassert(rsans.recap.includes(\"Étape amiable : aucune étape amiable\\n\"));\nassert(rsans.recap.includes(\"Saisine du juge : immédiatement\"));\nassert(rsans.clause.includes(\"Règlement amiable préalable\"));\nassert.strictEqual(S(run({ tiers: \"mediateur\" }), \"Tiers\"), \"warn\");\nassert.strictEqual(S(run({ tiers: \"mediateur\", frais: \"partages\" }), \"Tiers\"), \"ok\");\nassert.strictEqual(S(run({ tiers: \"conciliateur\" }), \"Tiers\"), \"ok\");\nassert(T(run({ tiers: \"dirigeants\" }), \"Tiers\").includes(\"1530\"));\nassert.strictEqual(S(run({ tiers: \"dirigeants\" }), \"Tiers\"), \"warn\");\nassert.strictEqual(S(run({ delaiJours: 14 }), \"Durée\"), \"warn\");\nassert.strictEqual(S(run({ delaiJours: 15 }), \"Durée\"), \"ok\");\nassert.strictEqual(S(run({ delaiJours: 90 }), \"Durée\"), \"ok\");\nassert.strictEqual(S(run({ delaiJours: 91 }), \"Durée\"), \"warn\");\nassert(T(run({ delaiJours: 1 }), \"Durée\").startsWith(\"1 jour :\"));\nassert.strictEqual(run({ delaiJours: 45, dateNotification: \"n'importe quoi\" }).saisineLabel, \"Le 29 avril 2027\");\nassert.strictEqual(run({ delaiJours: 15, dateNotification: \"2027-12-20\" }).saisineLabel, \"Le 4 janvier 2028\");\nassert.strictEqual(run({ delaiJours: \"abc\" }).delaiJours, 0);\nassert.strictEqual(run({ delaiJours: -3 }).delaiJours, 0);\nassert.strictEqual(run({ delaiJours: 999 }).delaiJours, 365);\n\n// Factures, urgence, réciprocité\nassert.strictEqual(S(run({ exclusionImpayes: \"oui\" }), \"Factures\"), \"ok\");\nassert.strictEqual(S(run({ role: \"client\" }), \"Factures\"), \"info\");\nassert.strictEqual(S(run({ urgence: \"oui\" }), \"Urgence\"), \"ok\");\nassert.strictEqual(S(run({ urgence: \"oui\", amiable: \"aucune\" }), \"Urgence\"), \"ok\");\nconst rcl = run({ reciprocite: \"clientSeul\" });\nassert.strictEqual(S(rcl, \"Réciprocité\"), \"warn\");\nassert(T(rcl, \"Réciprocité\").includes(\"1171\"));\n\n// Arbitrage\nassert.strictEqual(S(run({ arbitrage: \"oui\" }), \"Arbitrage\"), \"warn\");\nassert(T(run({ arbitrage: \"oui\" }), \"Arbitrage\").includes(\"L721-3\"));\nconst rarb = run({ arbitrage: \"oui\", qualiteC: \"particulier\" });\nassert.strictEqual(S(rarb, \"Arbitrage\"), \"bad\");\nassert(T(rarb, \"Arbitrage\").includes(\"2061\"));\nassert.strictEqual(rarb.nbBad, 2);\nassert.strictEqual(S(run({ arbitrage: \"oui\", qualiteC: \"liberal\" }), \"Arbitrage\"), \"warn\");\nassert(T(run({ arbitrage: \"oui\", qualiteC: \"liberal\" }), \"Arbitrage\").includes(\"2061\"));\n\n// Côté client\nconst rc = run({ role: \"client\" });\nassert(rc.message.startsWith(\"Bonjour,\\n\\nAvant de signer, nous avons relu l'article\"));\nassert(rc.message.includes(\"les points suivants : Présentation de la clause, Tribunal choisi\"));\nassert(rc.message.endsWith(\"Pouvez-vous nous envoyer une version modifiée ?\\n\\nBien cordialement,\"));\nassert(!run({ role: \"client\", presentation: \"signature\", tribunal: \"precis\", amiable: \"precise\", tiers: \"mediateur\", frais: \"partages\", delaiJours: 45, urgence: \"oui\" }).message.includes(\"points suivants\"));\nassert(rc.recap.includes(\"Position : client qui relit la clause\"));\n\n// Valeurs invalides\nconst rinv = computeReglementLitiges({ role: \"zz\", qualiteP: \"zz\", qualiteC: \"zz\", tribunal: \"zz\", amiable: \"zz\", tiers: \"zz\", acceptation: \"zz\", etranger: \"zz\" });\nassert.strictEqual(rinv.role, \"prestataire\");\nassert.strictEqual(rinv.qualiteP, \"societe\");\nassert.strictEqual(rinv.qualiteC, \"societe\");\nassert.strictEqual(S(rinv, \"Tribunal\"), \"warn\");\nassert.strictEqual(S(rinv, \"Acceptation\"), \"ok\");\nassert.strictEqual(S(rinv, \"Client étranger\"), \"info\");\n\n")(tool, require, console);
console.log("seo-am-20261105 ok");
