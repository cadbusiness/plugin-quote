import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_CESSION_DROITS, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-clause-cession-droits-auteur";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "cession-droits-auteur-devis-b2b";
const BLOG_PATH = "/blog/cession-droits-auteur-devis-b2b";
const TOOL_PATH = "/outils/verificateur-clause-cession-droits-auteur";
const DAY = "2026-11-03";
const DAY_PATHS = ["/blog/cession-droits-auteur-devis-b2b", "/secteurs/funnel-devis-photographe-video-entreprise", "/outils/verificateur-clause-cession-droits-auteur"];

assert.equal(BLOG_TOOL_CESSION_DROITS, TOOL_PATH);
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
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de clause de cession de droits d'auteur");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Photos, vidéos, graphisme : droits nommés, supports, destination, territoire, durée et rémunération. Ce qui manque à la clause, et le texte à compléter.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-photographe-video-entreprise")?.priority, 0.8);

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
assert.ok(outilsHub.includes("verificateur-clause-cession-droits-auteur"));
assert.ok(outilsHub.includes("Vérificateur de clause de cession de droits d'auteur"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-clause-cession-droits-auteur\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-photographe-video-entreprise"));
assert.ok(secteursHub.includes("Photo et vidéo d'entreprise"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 6500);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-photographe-video-entreprise.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-photographe-video-entreprise/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 6162);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Photo et vidéo d'entreprise"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/verificateur-clause-cession-droits-auteur.ts","src/components/marketing/verificateur-clause-cession-droits-auteur-calculator.tsx","src/app/(marketing)/outils/verificateur-clause-cession-droits-auteur/page.tsx","src/content/blog/cession-droits-auteur-devis-b2b.md","src/content/blog/funnel-devis-photographe-video-entreprise.md","src/app/(marketing)/secteurs/funnel-devis-photographe-video-entreprise/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, CHECKS, SUPPORTS, computeCession, buildRecap, normalise, fmtEur, fmtPct, fmtDate, finCession, parseDate } = X;\nconst NB = \"\\u00a0\";\nconst run = (o) => computeCession({ ...DEFAULTS, ...o });\nconst S = (r, id) => r.lignes.find((l) => l.id === id).statut;\n\n// Fichier\n\n\nconst checkIds = [\"repro\", \"repres\", \"adapt\", \"modifs\", \"tousSupports\", \"futures\", \"garantieAgence\", \"artisteAuteur\"].concat(SUPPORTS.map((s) => \"sup_\" + s.id));\n\nassert.strictEqual(CHECKS.length, 14);\nassert.strictEqual(SUPPORTS.length, 8);\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.strictEqual(X.TAUX_DIFFUSEUR, 1.1);\nassert.strictEqual(X.DUREE_POST_MORTEM, 70);\n\n// Formats\nassert.strictEqual(fmtEur(1800), \"1\" + NB + \"800\" + NB + \"€\");\nassert.strictEqual(fmtEur(6.6), \"6,60\" + NB + \"€\");\nassert.strictEqual(fmtEur(NaN), \"n/a\");\nassert.strictEqual(fmtPct(25), \"25\" + NB + \"%\");\nassert.strictEqual(fmtPct(1.1), \"1,1\" + NB + \"%\");\nassert.strictEqual(fmtDate(parseDate(\"2026-10-30\")), \"30 octobre 2026\");\nassert.strictEqual(fmtDate(parseDate(\"2027-01-01\")), \"1er janvier 2027\");\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\nassert.strictEqual(finCession(parseDate(\"2026-10-30\"), 5).toISOString().slice(0, 10), \"2031-10-29\");\nassert.strictEqual(finCession(parseDate(\"2028-02-29\"), 1).toISOString().slice(0, 10), \"2029-02-28\");\nassert.strictEqual(finCession(parseDate(\"2026-01-01\"), 3).toISOString().slice(0, 10), \"2028-12-31\");\n\n// Exemple par défaut (celui de l'article)\nconst r = computeCession({});\nassert.deepStrictEqual(r.compte, { ok: 8, warn: 5, bad: 0, info: 1 });\nassert.strictEqual(r.etat, \"warn\");\nassert.strictEqual(r.verdict, \"Aucun point bloquant, mais 5 points à compléter avant de signer.\");\nassert.deepStrictEqual(r.lignes.filter((l) => l.statut === \"warn\").map((l) => l.id), [\"adaptation\", \"remuneration\", \"nom\", \"souscession\", \"image\"]);\nassert.strictEqual(S(r, \"exclusivite\"), \"info\");\nassert.strictEqual(r.total, 2400);\nassert.strictEqual(r.partCession, 25);\nassert.strictEqual(r.coutParAn, 120);\nassert.strictEqual(r.contribution, 6.6);\nassert.strictEqual(r.dateFin, \"2031-10-29\");\nassert.strictEqual(r.dateFinTexte, \"29 octobre 2031\");\nassert.strictEqual(r.nbTrous, 6);\nassert.strictEqual(r.alertes.length, 6);\nassert.strictEqual(r.actions.length, 7);\nassert(r.alertes.some((a) => a.includes(\"6,60\" + NB + \"€\")), \"contribution dans les alertes\");\nassert(r.clause.startsWith(\"Cession de droits d'auteur\\nObjet : les 40 photographies\"));\nassert(r.clause.includes(\"Durée : 5 ans à compter du 30 octobre 2026, soit jusqu'au 29 octobre 2031.\"));\nassert(r.clause.includes(\"600\" + NB + \"€ pour la cession, distincts du prix de la prestation (1\" + NB + \"800\" + NB + \"€)\"));\nassert(r.clause.endsWith(\"Tout usage qui n'est pas listé ci-dessus reste soumis à l'accord écrit de l'auteur.\"));\nassert.strictEqual(r.clause.split(\"\\n\").length, 13);\nassert(r.message.includes(\"sur 5 points\"));\nassert.strictEqual(r.message.split(\"\\n\").length, 12);\nconst rl = r.recap.split(\"\\n\");\nassert.strictEqual(rl.length, 21);\nassert.strictEqual(rl[0], \"Vérificateur de clause de cession de droits d'auteur\");\nassert.strictEqual(rl[rl.length - 1], \"Calcul : quotebuilder.co/outils/\" + SLUG);\nassert(rl.includes(\"Prestation : 1\" + NB + \"800\" + NB + \"€ ; cession : 600\" + NB + \"€ (25\" + NB + \"% du total)\"));\nassert(rl.includes(\"Cession par an : 120\" + NB + \"€ ; fin : 29 octobre 2031\"));\nassert.strictEqual(buildRecap({}), r.recap);\n\n// Clause complète : tout conforme\nconst full = run({ adapt: true, forfaitCas: \"1\", nom: \"oui\", souscession: \"prevue\", image: \"autorisees\", exclusivite: \"exclusive\" });\nassert.deepStrictEqual(full.compte, { ok: 14, warn: 0, bad: 0, info: 0 });\nassert.strictEqual(full.etat, \"ok\");\nassert.strictEqual(full.verdict, \"La clause couvre les 14 points vérifiés.\");\nassert.strictEqual(full.nbTrous, 0);\nassert(full.clause.includes(\"Forfait retenu car la base de calcul proportionnelle ne peut pas être déterminée (1°)\"));\nassert(full.message.includes(\"me convient\"));\nassert(full.clause.includes(\"Modifications acceptées\"));\n\n// Points bloquants\nassert.strictEqual(S(run({ ecrit: \"oral\" }), \"ecrit\"), \"bad\");\nassert.strictEqual(S(run({ ecrit: \"cgv\" }), \"ecrit\"), \"warn\");\nassert(run({ ecrit: \"cgv\" }).lignes[0].texte.includes(\"05-15.472\"));\nassert.strictEqual(S(run({ ecrit: \"email\" }), \"ecrit\"), \"warn\");\nassert.strictEqual(S(run({ repro: false, repres: false, adapt: false }), \"droits\"), \"bad\");\nassert.strictEqual(S(run({ repres: false }), \"droits\"), \"warn\");\nassert.strictEqual(S(run({ repro: false }), \"droits\"), \"ok\");\nassert.strictEqual(S(run({ modifs: false }), \"adaptation\"), \"ok\");\nassert.strictEqual(S(run({ tousSupports: true }), \"supports\"), \"warn\");\nconst noSup = {}; SUPPORTS.forEach((s) => (noSup[\"sup_\" + s.id] = false));\nassert.strictEqual(S(run(noSup), \"supports\"), \"bad\");\nassert.strictEqual(S(run({ destination: \"nonprecisee\" }), \"destination\"), \"bad\");\nassert.strictEqual(S(run({ destination: \"publicite\" }), \"destination\"), \"ok\");\nassert(run({ destination: \"publicite\" }).alertes.some((a) => a.includes(\"L132-31\")));\nassert(run({ destination: \"publicite\", remuneration: \"incluse\" }).lignes.find((l) => l.id === \"remuneration\").texte.includes(\"L132-31\"));\nassert.strictEqual(S(run({ territoire: \"nonprecise\" }), \"territoire\"), \"bad\");\nassert.strictEqual(S(run({ dureeMode: \"nonprecisee\" }), \"duree\"), \"bad\");\nconst leg = run({ dureeMode: \"legale\" });\nassert.strictEqual(S(leg, \"duree\"), \"info\");\nassert.strictEqual(leg.coutParAn, null);\nassert.strictEqual(leg.dateFin, null);\nassert(leg.recap.indexOf(\"Cession par an\") < 0);\nassert(leg.clause.includes(\"toute la durée légale des droits d'auteur\"));\nassert.strictEqual(S(run({ remuneration: \"nonprecisee\" }), \"remuneration\"), \"bad\");\nassert.strictEqual(run({ remuneration: \"nonprecisee\" }).contribution, 0);\nassert.strictEqual(S(run({ remuneration: \"incluse\" }), \"remuneration\"), \"warn\");\nassert.strictEqual(S(run({ remuneration: \"gratuite\" }), \"remuneration\"), \"warn\");\nassert.strictEqual(run({ remuneration: \"gratuite\" }).contribution, 0);\nassert.strictEqual(S(run({ remuneration: \"proportionnelle\" }), \"remuneration\"), \"ok\");\nassert.strictEqual(S(run({ forfaitCas: \"4\" }), \"remuneration\"), \"ok\");\nassert.strictEqual(S(run({ forfaitCas: \"1\", montantCession: 0 }), \"remuneration\"), \"warn\");\nassert.strictEqual(S(run({ oeuvre: \"logiciel\" }), \"remuneration\"), \"ok\");\nassert.strictEqual(S(run({ auteur: \"agence\" }), \"titularite\"), \"warn\");\nassert.strictEqual(S(run({ auteur: \"agence\", garantieAgence: true }), \"titularite\"), \"ok\");\nassert.strictEqual(run({ auteur: \"agence\" }).contribution, 0);\nassert.strictEqual(S(run({ auteur: \"salarie\" }), \"titularite\"), \"warn\");\nassert.strictEqual(S(run({ auteur: \"salarie\", oeuvre: \"logiciel\" }), \"titularite\"), \"ok\");\nassert.strictEqual(S(run({ auteur: \"inconnu\" }), \"titularite\"), \"bad\");\nassert.strictEqual(S(run({ nom: \"renonce\" }), \"nom\"), \"ok\");\nassert.strictEqual(S(run({ futures: true }), \"futures\"), \"bad\");\nassert(run({ futures: true }).lignes.find((l) => l.id === \"futures\").texte.includes(\"L131-1\"));\nassert.strictEqual(S(run({ souscession: \"nonbesoin\" }), \"souscession\"), \"ok\");\nassert(run({ souscession: \"nonbesoin\" }).clause.indexOf(\"Transmission\") < 0);\nassert.strictEqual(S(run({ image: \"aucune\" }), \"image\"), \"ok\");\nassert(run({ image: \"aucune\" }).clause.indexOf(\"Personnes reconnaissables\") < 0);\nassert.strictEqual(S(run({ exclusivite: \"nonexclusive\" }), \"exclusivite\"), \"info\");\nassert.strictEqual(run({ artisteAuteur: false }).contribution, 0);\nconst bad = run({ ecrit: \"oral\", territoire: \"nonprecise\" });\nassert.strictEqual(bad.etat, \"bad\");\nassert.strictEqual(bad.verdict, \"2 points bloquants : sur ces points, la cession risque de ne rien transférer. Corrigez la clause avant de livrer les fichiers.\");\nassert.strictEqual(run({ futures: true }).verdict.startsWith(\"1 point bloquant :\"), true);\n\n// Normalisation\nconst n = normalise({ duree: \"abc\", nbOeuvres: -3, montantCession: \"-10\", auteur: \"x\", dateDebut: \"2026-13-01\", forfaitCas: 9 });\nassert.strictEqual(n.duree, 5);\nassert.strictEqual(n.nbOeuvres, 1);\nassert.strictEqual(n.montantCession, 0);\nassert.strictEqual(n.auteur, \"independant\");\nassert.strictEqual(n.dateDebut, \"2026-10-30\");\nassert.strictEqual(n.forfaitCas, \"aucun\");\nassert.strictEqual(normalise({ duree: 150 }).duree, 99);\nassert.strictEqual(normalise({ forfaitCas: 3 }).forfaitCas, \"3\");\nassert.strictEqual(normalise({ repro: \"false\" }).repro, false);\n\n")(tool, require, console);
console.log("seo-am-20261103 ok");
