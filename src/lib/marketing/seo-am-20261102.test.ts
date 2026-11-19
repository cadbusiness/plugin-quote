import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_CGV_CGA, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./comparateur-cgv-conditions-achat-client";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "cgv-conditions-achat-client-devis-b2b";
const BLOG_PATH = "/blog/cgv-conditions-achat-client-devis-b2b";
const TOOL_PATH = "/outils/comparateur-cgv-conditions-achat-client";
const DAY = "2026-11-02";
const DAY_PATHS = ["/blog/cgv-conditions-achat-client-devis-b2b", "/secteurs/funnel-devis-deratisation-desinsectisation-3d", "/outils/comparateur-cgv-conditions-achat-client"];

assert.equal(BLOG_TOOL_CGV_CGA, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 27);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Comparateur CGV et conditions d'achat du client");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Vos CGV contre le bon de commande du client : clause par clause, ce qui s'applique, ce que vous perdez, et ce qu'il faut écrire dans le devis signé.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-deratisation-desinsectisation-3d")?.priority, 0.8);

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
assert.ok(outilsHub.includes("comparateur-cgv-conditions-achat-client"));
assert.ok(outilsHub.includes("Comparateur CGV et conditions d'achat du client"));
{
  const start = outilsHub.indexOf("href: \"/outils/comparateur-cgv-conditions-achat-client\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-deratisation-desinsectisation-3d"));
assert.ok(secteursHub.includes("Dératisation et désinsectisation"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 6325);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-deratisation-desinsectisation-3d.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-deratisation-desinsectisation-3d/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 5869);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Dératisation et désinsectisation"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/comparateur-cgv-conditions-achat-client.ts","src/components/marketing/comparateur-cgv-conditions-achat-client-calculator.tsx","src/app/(marketing)/outils/comparateur-cgv-conditions-achat-client/page.tsx","src/content/blog/cgv-conditions-achat-client-devis-b2b.md","src/content/blog/funnel-devis-deratisation-desinsectisation-3d.md","src/app/(marketing)/secteurs/funnel-devis-deratisation-desinsectisation-3d/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, CLAUSES, CGV_LABELS, CGA_LABELS, computeComparaison, buildRecap, normalise, fmtEur, fmtJours } = X;\nconst NB = \"\\u00a0\";\nconst run = (o) => computeComparaison({ ...DEFAULTS, ...o });\nconst L = (r, id) => r.lignes.find((l) => l.id === id);\n\n// Fichier\n\n\nassert.strictEqual(CLAUSES.length, 8);\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.strictEqual(X.DELAI_LEGAL_DEFAUT, 30);\nassert.strictEqual(X.PLAFOND_JOURS, 60);\nassert.strictEqual(X.PLAFOND_FIN_DE_MOIS, 45);\n\n// Formats\nassert.strictEqual(fmtEur(28400), \"28\" + NB + \"400\" + NB + \"€\");\nassert.strictEqual(fmtEur(140), \"140\" + NB + \"€\");\nassert.strictEqual(fmtEur(1234.5), \"1\" + NB + \"234,50\" + NB + \"€\");\nassert.strictEqual(fmtEur(NaN), \"n/a\");\nassert.strictEqual(fmtJours(1), \"1 jour\");\nassert.strictEqual(fmtJours(30), \"30 jours\");\n\n// Exemple par défaut (celui de l'article)\nconst r = computeComparaison({});\nassert.deepStrictEqual(r.compte, { cp: 0, cgv: 2, cga: 1, neutralisee: 4, droitCommun: 1 });\nassert.strictEqual(r.nbCgv, 2);\nassert.strictEqual(r.nbCga, 1);\nassert.strictEqual(r.nbPerdues, 4);\nassert.strictEqual(r.delaiApplicable, 30);\nassert.strictEqual(r.delaiPratique, 60);\nassert.strictEqual(r.ecartJours, 30);\nassert.strictEqual(r.coutEcart, 140);\nassert.strictEqual(r.etat, \"bad\");\nassert.strictEqual(r.cgaHorsPlafond, false);\nassert.strictEqual(L(r, \"paiement\").source, \"neutralisee\");\nassert.strictEqual(L(r, \"penalites\").source, \"cgv\");\nassert.strictEqual(L(r, \"reserve\").source, \"neutralisee\");\nassert(L(r, \"reserve\").texte.includes(\"24-13.195\"));\nassert.strictEqual(L(r, \"responsabilite\").source, \"neutralisee\");\nassert.strictEqual(L(r, \"retard\").source, \"cga\");\nassert.strictEqual(L(r, \"retard\").statut, \"warn\");\nassert.strictEqual(L(r, \"juridiction\").source, \"neutralisee\");\nassert(L(r, \"juridiction\").texte.includes(\"93-13.237\"));\nassert.strictEqual(L(r, \"annulation\").source, \"cgv\");\nassert.strictEqual(L(r, \"revision\").source, \"droitCommun\");\nassert.strictEqual(L(r, \"revision\").statut, \"info\");\nassert.strictEqual(r.verdict, \"4 clauses sur 8 ne jouent plus en votre faveur. Fixez-les dans le devis signé avant la livraison.\");\nassert(r.alertes.some((a) => a.includes(\"article 1118\")));\nassert(r.alertes.some((a) => a.includes(\"prévalent sur toute condition d'achat\")));\nassert(r.alertes.some((a) => a.includes(\"4 clauses se neutralisent\")));\nassert.strictEqual(r.actions.length, 7);\nassert(r.message.includes(\"· Délai de paiement : 30 jours à compter de la date de facture\"));\nassert(r.message.includes(\"· Pénalités de retard de livraison : une version à convenir ensemble, avec un plafond\"));\nassert(!r.message.includes(\"Pénalités de retard de paiement\"));\nassert(r.recap.includes(\"Montant du devis : 28\" + NB + \"400\" + NB + \"€ HT\"));\nassert(r.recap.includes(\"Clauses neutralisées : 4 / 8\"));\nassert(r.recap.includes(\"Coût de trésorerie de l'écart : 140\" + NB + \"€\"));\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert.strictEqual(buildRecap({}), r.recap);\n\n// Conditions particulières : le devis signé l'emporte\nconst rcp = run({ cp_paiement: true, cp_reserve: true, cp_responsabilite: true, cp_juridiction: true, cp_retard: true });\nassert.strictEqual(rcp.compte.cp, 5);\nassert.strictEqual(rcp.nbPerdues, 0);\nassert.strictEqual(rcp.delaiApplicable, 30);\nassert.strictEqual(L(rcp, \"reserve\").source, \"cp\");\nassert.strictEqual(rcp.etat, \"warn\");\n\n// Devis signé et pas de conditions d'achat : tout à vos conditions\nconst rok = run({ cgvStatut: \"signees\", cgaStatut: \"aucune\" });\nassert.strictEqual(rok.nbCgv, 6);\nassert.strictEqual(rok.compte.droitCommun, 2);\nassert.strictEqual(rok.nbPerdues, 0);\nassert.strictEqual(rok.delaiPratique, 30);\nassert.strictEqual(rok.coutEcart, 0);\nassert.strictEqual(rok.etat, \"ok\");\nassert(rok.message.startsWith(\"Bonjour,\\n\\nMerci pour votre commande. Nous avons bien noté\"));\n\n// CGV au dos des factures : les conditions d'achat s'appliquent\nconst rf = run({ cgvStatut: \"facture\" });\nassert.strictEqual(rf.compte.cgv, 0);\nassert.strictEqual(L(rf, \"paiement\").source, \"cga\");\nassert.strictEqual(rf.delaiApplicable, 60);\nassert.strictEqual(rf.ecartJours, 0);\nassert.strictEqual(L(rf, \"reserve\").source, \"cga\");\nassert.strictEqual(L(rf, \"reserve\").statut, \"bad\");\nassert(L(rf, \"reserve\").texte.includes(\"93-10.383\"));\nassert.strictEqual(L(rf, \"penalites\").source, \"droitCommun\");\nassert.strictEqual(L(rf, \"penalites\").statut, \"bad\");\nassert(rf.alertes.some((a) => a.includes(\"au dos des factures\")));\n\n// Refus écrit confirmé : vos CGV reprennent la main\nconst rr = run({ cgaStatut: \"refus\" });\nassert.strictEqual(rr.compte.cgv, 6);\nassert.strictEqual(rr.compte.neutralisee, 0);\nassert.strictEqual(rr.delaiPratique, 30);\nassert.strictEqual(L(rr, \"retard\").source, \"droitCommun\");\n\n// Plafond légal du délai de paiement\nconst rp = run({ cgaDelai: 90 });\nassert.strictEqual(rp.cgaHorsPlafond, true);\nassert(rp.alertes.some((a) => a.includes(\"90 jours\") && a.includes(\"1er janvier 2027\")));\nassert.strictEqual(rp.coutEcart, Math.round(28400 * 60 / 365 * 0.06));\nconst rfm = run({ cgaDelai: 50, cgaFinDeMois: true });\nassert.strictEqual(rfm.cgaHorsPlafond, true);\nassert.strictEqual(run({ cgaDelai: 45, cgaFinDeMois: true }).cgaHorsPlafond, false);\nassert.strictEqual(run({ cgaDelai: 60 }).cgaHorsPlafond, false);\nassert.strictEqual(run({ cgvDelai: 75 }).cgvHorsPlafond, true);\n\n// Compatibilité : pas de conflit, vos CGV jouent\nconst rc = run({ cga_paiement: \"compatible\", cga_responsabilite: \"compatible\" });\nassert.strictEqual(L(rc, \"paiement\").source, \"cgv\");\nassert.strictEqual(L(rc, \"responsabilite\").source, \"cgv\");\n\n// Primauté décochée : l'alerte disparaît\nassert(!run({ primaute: false }).alertes.some((a) => a.includes(\"prévalent\")));\n\n// Normalisation et entrées invalides\nconst n0 = normalise({ cgvStatut: \"x\", montant: \"-5\", taux: \"99\", cgvDelai: \"abc\", cp_paiement: \"on\" });\nassert.strictEqual(n0.cgvStatut, \"jointes\");\nassert.strictEqual(n0.montant, 0);\nassert.strictEqual(n0.taux, 30);\nassert.strictEqual(n0.cgvDelai, 30);\nassert.strictEqual(n0.cp_paiement, true);\nassert.strictEqual(run({ montant: 0 }).coutEcart, 0);\n\n")(tool, require, console);
console.log("seo-am-20261102 ok");
