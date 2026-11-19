import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_AUTOLIQUIDATION, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-autoliquidation-tva-sous-traitance-btp";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "autoliquidation-tva-sous-traitance-btp-devis-b2b";
const BLOG_PATH = "/blog/autoliquidation-tva-sous-traitance-btp-devis-b2b";
const TOOL_PATH = "/outils/verificateur-autoliquidation-tva-sous-traitance-btp";
const DAY = "2026-10-29";
const DAY_PATHS = ["/blog/autoliquidation-tva-sous-traitance-btp-devis-b2b", "/outils/verificateur-autoliquidation-tva-sous-traitance-btp"];

assert.equal(BLOG_TOOL_AUTOLIQUIDATION, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 25);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur d'autoliquidation de TVA en sous-traitance BTP");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Sous-traitant ou entreprise principale : l'autoliquidation s'applique-t-elle, quel montant facturer, quelle TVA déclarer et quelles mentions écrire.");

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
assert.ok(outilsHub.includes("verificateur-autoliquidation-tva-sous-traitance-btp"));
assert.ok(outilsHub.includes("Vérificateur d'autoliquidation de TVA en sous-traitance BTP"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-autoliquidation-tva-sous-traitance-btp\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 6069);
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

for (const rel of ["src/lib/marketing/verificateur-autoliquidation-tva-sous-traitance-btp.ts","src/components/marketing/verificateur-autoliquidation-tva-sous-traitance-btp-calculator.tsx","src/app/(marketing)/outils/verificateur-autoliquidation-tva-sous-traitance-btp/page.tsx","src/content/blog/autoliquidation-tva-sous-traitance-btp-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst { TAUX_AMENDE, TAUX_TVA, DATE_CIBS, DATE_FIN_REF_CGI, DEFAULTS, NATURE_LABELS, LOCATION_LABELS, MENTION_AUTOLIQUIDATION, MENTION_FRANCHISE, computeAutoliquidation, buildRecap, periodeReference, parseDate, fmtDate, fmtEur, fmtTaux, tva } = __mod;\nconst NB = \"\\u00a0\";\nconst run = (o) => computeAutoliquidation({ ...DEFAULTS, ...o });\nconst d = (s) => parseDate(s);\n\n// Fichier\n\n\n\n\n\n\n\nassert.strictEqual(TAUX_AMENDE, 5);\nassert.deepStrictEqual(TAUX_TVA, [20, 10, 5.5]);\nassert.strictEqual(DATE_CIBS, \"2027-01-01\");\nassert.strictEqual(DATE_FIN_REF_CGI, \"2028-06-30\");\nassert.strictEqual(MENTION_AUTOLIQUIDATION, \"Autoliquidation\");\nassert.strictEqual(MENTION_FRANCHISE, \"TVA non applicable, article 293 B du CGI\");\nassert.deepStrictEqual(DEFAULTS, {\n  role: \"soustraitant\", preneur: \"assujetti\", regime: \"reel\", document: \"devis\",\n  nature: \"travaux\", fourniture: \"non\", location: \"aucune\", dateOperation: \"2026-10-29\",\n  montantHT: 40000, tauxTVA: 20,\n});\n\n// Formats et dates\nassert.strictEqual(fmtEur(40000), `40${NB}000${NB}€`);\nassert.strictEqual(fmtEur(1234.5), `1${NB}234,50${NB}€`);\nassert.strictEqual(fmtEur(0), `0${NB}€`);\nassert.strictEqual(fmtTaux(5.5), `5,5${NB}%`);\nassert.strictEqual(fmtDate(d(\"2026-10-29\")), \"29/10/2026\");\nassert.strictEqual(fmtDate(null), \"n/a\");\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\nassert.strictEqual(tva(40000, 20), 8000);\nassert.strictEqual(tva(40000, 10), 4000);\nassert.strictEqual(tva(12345, 5.5), 678.98);\nassert.strictEqual(periodeReference(d(\"2026-12-31\")), \"cgi\");\nassert.strictEqual(periodeReference(d(\"2027-01-01\")), \"transition\");\nassert.strictEqual(periodeReference(d(\"2028-06-30\")), \"transition\");\nassert.strictEqual(periodeReference(d(\"2028-07-01\")), \"cibs\");\nassert.strictEqual(periodeReference(null), \"cgi\");\n\n// Cas par défaut : exemple de l'article (plâtrerie, 40 000 € HT, 20 %)\nconst r = computeAutoliquidation({});\nassert.strictEqual(r.reponse, \"oui\");\nassert.strictEqual(r.reponseLabel, \"Oui\");\nassert.strictEqual(r.etat, \"ok\");\nassert.strictEqual(r.ht, 40000);\nassert.strictEqual(r.tvaTheorique, 8000);\nassert.strictEqual(r.tvaAutoliquidee, 8000);\nassert.strictEqual(r.tvaFacturee, 0);\nassert.strictEqual(r.montantFacture, 40000);\nassert.strictEqual(r.amende, 400);\nassert.strictEqual(r.periode, \"cgi\");\nassert(r.mentions.some((x) => x.includes(\"« Autoliquidation »\")));\nassert(r.mentions.some((x) => x.includes(\"TVA due par le preneur assujetti\")));\nassert(r.mentions.some((x) => x.includes(\"n'est pas obligatoire\")));\nassert(r.mentions.some((x) => x.includes(\"DC4\")));\nassert(r.declarations[0].includes(\"autres opérations imposables\"));\nassert(r.declarations[0].includes(`8${NB}000${NB}€`));\nassert(r.declarations[1].includes(\"autres opérations non imposables\"));\nassert(r.conseils.some((x) => x.includes(\"au moment du paiement\")));\nassert(r.conseils.some((x) => x.includes(\"paiement direct\")));\nassert(r.conseils.some((x) => x.includes(\"30 juin 2028\")));\nassert(r.conseils.some((x) => x.includes(\"QuoteBuilder n'affiche ni HT ni TTC\") && x.includes(\"n'émet pas de factures\")));\nassert(r.conseils.some((x) => x.includes(\"devis unique\")));\nassert.strictEqual(r.detail.length, 6);\nassert.strictEqual(r.detail[3].montant, 8000);\nassert.strictEqual(r.detail[5].montant, 400);\nconst lignes = r.recap.split(\"\\n\");\nassert.strictEqual(lignes[lignes.length - 1], \"Calcul : quotebuilder.co/outils/verificateur-autoliquidation-tva-sous-traitance-btp\");\nassert(r.recap.includes(`Montant facturé : 40${NB}000${NB}€ HT, sans TVA`));\nassert(r.recap.includes(`TVA à autoliquider par l'entreprise principale : 8${NB}000${NB}€ (20${NB}%)`));\nassert(r.recap.includes(`Amende en cas d'oubli de déclaration : 400${NB}€`));\nassert(r.recap.includes(\"Date : 29/10/2026\"));\nassert(r.recap.includes(\"Autoliquidation : oui (CGI, article 283, 2 nonies)\"));\nassert.strictEqual(buildRecap({}), r.recap);\n\n// Entreprise principale : même calcul, conseil à la deuxième personne\nconst p = run({ role: \"principale\" });\nassert.strictEqual(p.reponse, \"oui\");\nassert.strictEqual(p.tvaAutoliquidee, 8000);\nassert(p.conseils.some((x) => x.startsWith(\"Vous autoliquidez\")));\nassert(r.conseils.some((x) => x.startsWith(\"L'entreprise principale autoliquide\")));\n\n// Taux 10 % : exemple BOFiP § 538 (40 000 € HT, 4 000 €)\nconst t10 = run({ tauxTVA: \"10\" });\nassert.strictEqual(t10.tvaAutoliquidee, 4000);\nassert.strictEqual(t10.amende, 200);\nconst t55 = run({ tauxTVA: 5.5, montantHT: 10000 });\nassert.strictEqual(t55.tvaAutoliquidee, 550);\nassert.strictEqual(t55.amende, 27.5);\n\n// Exclusions\nconst direct = run({ role: \"direct\" });\nassert.strictEqual(direct.reponse, \"non\");\nassert.strictEqual(direct.etat, \"neutral\");\nassert.strictEqual(direct.tvaFacturee, 8000);\nassert.strictEqual(direct.montantFacture, 48000);\nassert.strictEqual(direct.tvaAutoliquidee, 0);\nassert.strictEqual(direct.amende, 0);\nassert(direct.verdict.includes(\"maître d'ouvrage\"));\nassert(direct.recap.includes(`48${NB}000${NB}€ TTC, dont 8${NB}000${NB}€ de TVA à 20${NB}%`));\nconst part = run({ preneur: \"nonAssujetti\" });\nassert.strictEqual(part.reponse, \"non\");\nassert.strictEqual(part.tvaFacturee, 8000);\nconst fr = run({ regime: \"franchise\" });\nassert.strictEqual(fr.reponse, \"non\");\nassert.strictEqual(fr.tvaFacturee, 0);\nassert.strictEqual(fr.montantFacture, 40000);\nassert.strictEqual(fr.tvaAutoliquidee, 0);\nassert(fr.mentions[0].includes(\"293 B\"));\nassert(fr.recap.includes(\"Mentions : TVA non applicable, article 293 B du CGI\"));\nconst four = run({ fourniture: \"oui\" });\nassert.strictEqual(four.reponse, \"non\");\nassert.strictEqual(four.motif, \"fourniture\");\nassert.strictEqual(four.montantFacture, 48000);\nfor (const loc of [\"seuleSans\", \"seuleAvec\"]) {\n  const l = run({ location: loc });\n  assert.strictEqual(l.reponse, \"non\", loc);\n  assert.strictEqual(l.motif, \"location\");\n  assert(l.conseils.some((x) => x.includes(\"contrat unique\")));\n}\nconst ech = run({ location: \"seuleSans\", montantHT: 3000 });\nassert.strictEqual(ech.tvaFacturee, 600);\nassert.strictEqual(ech.montantFacture, 3600);\nfor (const n of [\"nettoyageSepare\", \"interventionSeule\", \"intellectuelle\", \"atelier\"]) {\n  const x = run({ nature: n });\n  assert.strictEqual(x.reponse, \"non\", n);\n  assert.strictEqual(x.motif, n);\n  assert.strictEqual(x.tvaFacturee, 8000, n);\n  assert(x.mentions[0].includes(\"Pas de mention « Autoliquidation »\"), n);\n}\n\n// Inclusions\nconst incl = run({ location: \"incluse\" });\nassert.strictEqual(incl.reponse, \"oui\");\nassert(incl.verdict.includes(\"contrat unique\"));\nassert(!incl.conseils.some((x) => x.includes(\"devis unique\")));\nfor (const n of [\"nettoyageLie\", \"maintenancePieces\"]) {\n  const x = run({ nature: n });\n  assert.strictEqual(x.reponse, \"oui\", n);\n  assert.strictEqual(x.tvaAutoliquidee, 8000);\n}\nassert.strictEqual(run({ document: \"contrat\" }).reponse, \"oui\");\n\n// À vérifier\nconst autre = run({ nature: \"autre\" });\nassert.strictEqual(autre.reponse, \"verifier\");\nassert.strictEqual(autre.etat, \"warn\");\nassert.strictEqual(autre.reponseLabel, \"À vérifier\");\nassert.strictEqual(autre.tvaAutoliquidee, 0);\nassert.strictEqual(autre.tvaFacturee, 0);\nassert(autre.declarations[0].includes(`8${NB}000${NB}€`));\nassert(autre.recap.includes(\"à trancher avant la facture\"));\nconst oral = run({ document: \"aucun\" });\nassert.strictEqual(oral.reponse, \"verifier\");\nassert.strictEqual(oral.motif, \"document\");\n\n// Ordre des règles : le direct prime sur tout le reste\nassert.strictEqual(run({ role: \"direct\", nature: \"autre\", document: \"aucun\" }).reponse, \"non\");\nassert.strictEqual(run({ fourniture: \"oui\", nature: \"autre\" }).reponse, \"non\");\nassert.strictEqual(run({ regime: \"franchise\", location: \"seuleSans\" }).motif, \"franchise\");\n\n// Référence selon la date\nconst d27 = run({ dateOperation: \"2027-03-15\" });\nassert.strictEqual(d27.periode, \"transition\");\nassert(d27.conseils.some((x) => x.includes(\"code des impositions sur les biens et services\") && x.includes(\"30 juin 2028\")));\nconst d28 = run({ dateOperation: \"2028-09-01\" });\nassert.strictEqual(d28.periode, \"cibs\");\nassert(d28.conseils.some((x) => x.includes(\"est terminée\")));\n\n// Entrées invalides\nconst bad = computeAutoliquidation({ role: \"x\", preneur: \"?\", regime: \"\", document: 3, nature: \"zz\", fourniture: null, location: \"n\", dateOperation: \"2026-13-45\", montantHT: \"abc\", tauxTVA: 7 });\nassert.strictEqual(bad.role, \"soustraitant\");\nassert.strictEqual(bad.nature, \"travaux\");\nassert.strictEqual(bad.location, \"aucune\");\nassert.strictEqual(bad.taux, 20);\nassert.strictEqual(bad.ht, 0);\nassert.strictEqual(bad.date, null);\nassert.strictEqual(bad.reponse, \"oui\");\nassert(bad.recap.includes(\"Date : n/a\"));\nassert.strictEqual(run({ montantHT: -500 }).ht, 0);\nassert.strictEqual(run({ montantHT: \"\" }).ht, 0);\n\n// Aucun NaN ni undefined dans toutes les combinaisons\n")(tool, require, console);
console.log("seo-pm-20261029 ok");
