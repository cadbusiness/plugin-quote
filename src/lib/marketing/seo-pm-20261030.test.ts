import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_ATTESTATION_DECENNALE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-attestation-assurance-decennale";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "attestation-assurance-decennale-devis-b2b";
const BLOG_PATH = "/blog/attestation-assurance-decennale-devis-b2b";
const TOOL_PATH = "/outils/verificateur-attestation-assurance-decennale";
const DAY = "2026-10-30";
const DAY_PATHS = ["/blog/attestation-assurance-decennale-devis-b2b", "/outils/verificateur-attestation-assurance-decennale"];

assert.equal(BLOG_TOOL_ATTESTATION_DECENNALE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 23);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur d'attestation d'assurance décennale");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "activités déclarées, validité, ouverture du chantier, coût de l'opération : ce que couvre l'attestation jointe au devis, et le message à envoyer à l'assureur.");

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
assert.ok(outilsHub.includes("verificateur-attestation-assurance-decennale"));
assert.ok(outilsHub.includes("Vérificateur d'attestation d'assurance décennale"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-attestation-assurance-decennale\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 5616);
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

for (const rel of ["src/lib/marketing/verificateur-attestation-assurance-decennale.ts","src/components/marketing/verificateur-attestation-assurance-decennale-calculator.tsx","src/app/(marketing)/outils/verificateur-attestation-assurance-decennale/page.tsx","src/content/blog/attestation-assurance-decennale-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, MENTIONS, OUVRAGE_LABELS, FORME_LABELS, ACTIVITE_LABELS, computeAttestation, buildRecap, parseDate, fmtDate, fmtEur, fmtPct } = X;\nconst NB = \"\\u00a0\";\nconst run = (o) => computeAttestation({ ...DEFAULTS, ...o });\nconst ctl = (r, p) => r.controles.find((c) => c.point === p);\n\n// Fichier\n\n\n\nassert.strictEqual(MENTIONS.length, 8);\n\n\n\n\n\nassert.strictEqual(X.AMENDE_MAX, 75000);\nassert.strictEqual(X.PRISON_MOIS, 6);\nassert.strictEqual(X.PLAFOND_R243_3, 150000000);\nassert.strictEqual(X.SLUG, SLUG);\n\n// Formats\nassert.strictEqual(fmtEur(86000), `86${NB}000${NB}€`);\nassert.strictEqual(fmtEur(1500000), `1${NB}500${NB}000${NB}€`);\nassert.strictEqual(fmtEur(0), `0${NB}€`);\nassert.strictEqual(fmtPct(89.0697), `89,1${NB}%`);\nassert.strictEqual(fmtDate(parseDate(\"2027-01-11\")), \"11/01/2027\");\nassert.strictEqual(fmtDate(null), \"n/a\");\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\n\n// Exemple par défaut (celui de l'article)\nconst r = run({});\nassert.strictEqual(r.obligation, \"oui\");\nassert.strictEqual(r.etat, \"bad\");\nassert.strictEqual(r.statutLabel, \"Bloquant\");\nassert.strictEqual(r.nbBad, 1);\nassert.strictEqual(r.nbWarn, 1);\nassert.strictEqual(r.nbOk, 7);\nassert.strictEqual(r.controles.length, 9);\nassert.strictEqual(r.partCouverte, 76600);\nassert.strictEqual(fmtPct(r.pct), `89,1${NB}%`);\nassert.strictEqual(ctl(r, \"Activités déclarées\").statut, \"bad\");\nassert(ctl(r, \"Activités déclarées\").texte.startsWith(`9${NB}400${NB}€`));\nassert.strictEqual(ctl(r, \"Ouverture du chantier\").statut, \"warn\");\nassert(ctl(r, \"Ouverture du chantier\").texte.includes(\"11 jours après la fin de validité (31/12/2026)\"));\nassert.strictEqual(ctl(r, \"Validité à la date du devis\").statut, \"ok\");\nassert(ctl(r, \"Coût de l'opération\").texte.includes(`marge de 1${NB}080${NB}000${NB}€`));\nassert.strictEqual(r.demandes.length, 2);\nassert(r.message.startsWith(\"Bonjour,\"));\nassert(r.message.includes(`devis de 86${NB}000${NB}€ HT`));\nassert(r.message.includes(\"prévue le 11/01/2027\"));\nassert(r.recap.includes(`part du devis couverte : 76${NB}600${NB}€ sur 86${NB}000${NB}€ (89,1${NB}%)`));\nassert(r.recap.includes(\"(1 bloquant, 1 à compléter, 7 conformes)\"));\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert.strictEqual(buildRecap({}), r.recap);\nassert(r.actions.some((a) => a.includes(\"L. 243-2\")));\nassert(r.actions.some((a) => a.includes(\"L. 243-3\")));\nassert(r.actions.some((a) => a.includes(\"annexe I à l'article A. 243-1\")));\n\n// Variantes\nconst ok = run({ activite: \"couverte\", dateOuverture: \"2026-11-16\" });\nassert.strictEqual(ok.etat, \"ok\");\nassert.strictEqual(ok.statutLabel, \"Conforme\");\nassert.strictEqual(ok.demandes.length, 0);\nassert(ok.message.startsWith(\"Rien à demander\"));\nassert.strictEqual(ok.partCouverte, 86000);\nconst st = run({ relation: \"soustraitant\" });\nassert.strictEqual(st.obligation, \"non\");\nassert.strictEqual(st.etat, \"neutral\");\nassert(st.verdict.includes(\"1792-1\"));\nassert.strictEqual(run({ ouvrage: \"exclu\" }).obligation, \"non\");\nassert.strictEqual(run({ ouvrage: \"accessoire\" }).obligation, \"oui\");\nassert.strictEqual(run({ ouvrage: \"entretien\", activite: \"couverte\", dateOuverture: \"2026-11-16\" }).etat, \"warn\");\nconst none = run({ forme: \"aucune\" });\nassert.strictEqual(ctl(none, \"Document fourni\").statut, \"bad\");\nassert.strictEqual(none.controles.filter((c) => c.statut === \"info\").length, 8);\nassert.strictEqual(none.partCouverte, 0);\nassert.strictEqual(ctl(run({ forme: \"rcSeule\" }), \"Document fourni\").statut, \"bad\");\nassert.strictEqual(ctl(run({ forme: \"libre\" }), \"Document fourni\").statut, \"warn\");\nassert.strictEqual(ctl(run({ activite: \"procede\" }), \"Activités déclarées\").statut, \"bad\");\nassert(ctl(run({ activite: \"procede\" }), \"Activités déclarées\").texte.includes(\"17-24.488\"));\nassert(ctl(run({ activite: \"generique\" }), \"Activités déclarées\").texte.includes(\"13-21.887\"));\nassert.strictEqual(run({ activite: \"absente\" }).partCouverte, 0);\nassert.strictEqual(ctl(run({ montantNonCouvert: 0 }), \"Activités déclarées\").statut, \"warn\");\nassert.strictEqual(run({ montantNonCouvert: 999999 }).partCouverte, 0);\nassert.strictEqual(ctl(run({ coutOperation: 2000000 }), \"Coût de l'opération\").statut, \"bad\");\nassert.strictEqual(ctl(run({ coutOperation: 1500000 }), \"Coût de l'opération\").statut, \"ok\");\nassert.strictEqual(ctl(run({ plafondCout: 0 }), \"Coût de l'opération\").statut, \"warn\");\nassert.strictEqual(ctl(run({ coutOperation: 0 }), \"Coût de l'opération\").statut, \"warn\");\nassert.strictEqual(ctl(run({ coutOperation: 50000 }), \"Coût de l'opération\").statut, \"warn\");\nassert.strictEqual(ctl(run({ plafondMarche: 80000 }), \"Plafond de marché\").statut, \"bad\");\nassert.strictEqual(ctl(run({ plafondMarche: 100000 }), \"Plafond de marché\").statut, \"ok\");\nassert.strictEqual(ctl(run({ zone: \"non\" }), \"Étendue géographique\").statut, \"bad\");\nassert.strictEqual(ctl(run({ zone: \"absente\" }), \"Étendue géographique\").statut, \"warn\");\nassert.strictEqual(ctl(run({ techniques: \"horsListe\" }), \"Techniques et produits\").statut, \"bad\");\nassert.strictEqual(ctl(run({ mSignature: false }), \"Mentions minimales\").statut, \"warn\");\nassert.strictEqual(ctl(run({ mActivites: false }), \"Mentions minimales\").statut, \"bad\");\nassert.strictEqual(ctl(run({ mValidite: \"false\" }), \"Mentions minimales\").statut, \"bad\");\nassert.strictEqual(ctl(run({ dateDevis: \"2027-01-05\" }), \"Validité à la date du devis\").statut, \"warn\");\nassert.strictEqual(ctl(run({ dateOuverture: \"\" }), \"Ouverture du chantier\").statut, \"warn\");\nassert.strictEqual(ctl(run({ dateOuverture: \"2025-12-15\" }), \"Ouverture du chantier\").statut, \"warn\");\nassert.strictEqual(ctl(run({ debut: \"2027-01-01\" }), \"Validité à la date du devis\").statut, \"warn\");\nconst cl = run({ role: \"client\" });\nassert(cl.message.includes(\"Avant de signer votre devis du 30/10/2026\"));\n\n// Entrées invalides\nconst bad = computeAttestation({ role: \"x\", relation: \"y\", ouvrage: \"z\", forme: \"w\", activite: \"v\", zone: \"u\", techniques: \"t\", montantDevis: \"abc\", montantNonCouvert: -5, coutOperation: null, plafondCout: \"\", debut: \"n\", fin: \"2026-13-01\", dateDevis: \"\", dateOuverture: \"x\" });\nassert.strictEqual(bad.role, \"entreprise\");\nassert.strictEqual(bad.activite, \"couverte\");\nassert.strictEqual(bad.montantDevis, 0);\nassert.strictEqual(bad.periodeOk, false);\nassert(!/NaN|undefined/.test(bad.recap + bad.message + bad.verdict));\n\n")(tool, require, console);
console.log("seo-pm-20261030 ok");
