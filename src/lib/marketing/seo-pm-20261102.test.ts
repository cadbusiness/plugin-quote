import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_VIGILANCE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-obligation-vigilance-sous-traitant";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "obligation-vigilance-attestation-urssaf-devis-b2b";
const BLOG_PATH = "/blog/obligation-vigilance-attestation-urssaf-devis-b2b";
const TOOL_PATH = "/outils/verificateur-obligation-vigilance-sous-traitant";
const DAY = "2026-11-02";
const DAY_PATHS = ["/blog/obligation-vigilance-attestation-urssaf-devis-b2b", "/outils/verificateur-obligation-vigilance-sous-traitant"];

assert.equal(BLOG_TOOL_VIGILANCE, TOOL_PATH);
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
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur d'obligation de vigilance (attestation Urssaf)");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "seuil de 5 000 € HT, pièces de l'article D. 8222-5, attestation de moins de six mois et échéancier des remises : ce qu'il faut réunir avant de signer, et le message à envoyer.");

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
assert.ok(outilsHub.includes("verificateur-obligation-vigilance-sous-traitant"));
assert.ok(outilsHub.includes("Vérificateur d'obligation de vigilance (attestation Urssaf)"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-obligation-vigilance-sous-traitant\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 7460);
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

for (const rel of ["src/lib/marketing/verificateur-obligation-vigilance-sous-traitant.ts","src/components/marketing/verificateur-obligation-vigilance-sous-traitant-calculator.tsx","src/app/(marketing)/outils/verificateur-obligation-vigilance-sous-traitant/page.tsx","src/content/blog/obligation-vigilance-attestation-urssaf-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, CLIENT_LABELS, ETABLI_LABELS, TYPE_ATT_LABELS, PIECE_LABELS, ROLE_LABELS, computeVigilance, buildRecap, echeancier, addMonths, fraicheAu, dernierJourUtile, parseDate, fmtDate, fmtEur } = X;\nconst NB = \"\\u00a0\";\nconst run = (o) => computeVigilance({ ...DEFAULTS, ...o });\nconst ctl = (r, p) => r.controles.find((c) => c.point === p);\nconst D = parseDate;\n\n// Fichier\n\n\nassert.strictEqual(Object.keys(DEFAULTS).length, 13);\n\n\n\n\nassert.strictEqual(X.SEUIL_HT, 5000);\nassert.strictEqual(X.PERIODE_MOIS, 6);\nassert.strictEqual(X.PRISON_ANS, 3);\nassert.strictEqual(X.AMENDE_MAX, 45000);\nassert.strictEqual(X.SLUG, SLUG);\n\n// Formats et dates\nassert.strictEqual(fmtEur(18600), `18${NB}600${NB}€`);\nassert.strictEqual(fmtEur(0), `0${NB}€`);\nassert.strictEqual(fmtEur(4999.6), `5${NB}000${NB}€`);\nassert.strictEqual(fmtDate(D(\"2026-11-16\")), \"16/11/2026\");\nassert.strictEqual(fmtDate(null), \"n/a\");\nassert.strictEqual(D(\"2026-02-30\"), null);\nassert.strictEqual(D(\"16/11/2026\"), null);\nassert.strictEqual(fmtDate(addMonths(D(\"2026-08-31\"), 6)), \"28/02/2027\");\nassert.strictEqual(fmtDate(addMonths(D(\"2027-08-31\"), 6)), \"29/02/2028\");\nassert.strictEqual(fmtDate(addMonths(D(\"2026-11-16\"), 6)), \"16/05/2027\");\nassert.strictEqual(fmtDate(addMonths(D(\"2026-11-16\"), -6)), \"16/05/2026\");\nassert.strictEqual(fmtDate(addMonths(D(\"2026-12-31\"), 12)), \"31/12/2027\");\nassert.strictEqual(fmtDate(dernierJourUtile(D(\"2026-10-12\"))), \"11/04/2027\");\nassert.strictEqual(fraicheAu(D(\"2026-10-12\"), D(\"2027-04-11\")), true);\nassert.strictEqual(fraicheAu(D(\"2026-10-12\"), D(\"2027-04-12\")), false);\nassert.strictEqual(fraicheAu(D(\"2026-11-20\"), D(\"2026-11-16\")), false);\nassert.deepStrictEqual(echeancier(D(\"2026-11-16\"), D(\"2027-09-30\")).map(fmtDate), [\"16/11/2026\", \"16/05/2027\"]);\nassert.deepStrictEqual(echeancier(D(\"2026-11-16\"), D(\"2027-11-16\")).map(fmtDate), [\"16/11/2026\", \"16/05/2027\", \"16/11/2027\"]);\nassert.deepStrictEqual(echeancier(D(\"2026-11-16\"), D(\"2027-05-15\")).map(fmtDate), [\"16/11/2026\"]);\nassert.deepStrictEqual(echeancier(D(\"2026-11-16\"), null).map(fmtDate), [\"16/11/2026\"]);\nassert.strictEqual(echeancier(D(\"2026-01-01\"), D(\"2028-12-31\")).length, 6);\n\n// Exemple par défaut (celui de l'article)\nconst r = run({});\nassert.strictEqual(r.obligatoire, true);\nassert.strictEqual(r.etat, \"ok\");\nassert.strictEqual(r.statutLabel, \"Complet\");\nassert.strictEqual(r.nbBad, 0);\nassert.strictEqual(r.nbWarn, 0);\nassert.strictEqual(r.nbOk, 6);\nassert.strictEqual(r.controles.length, 7);\nassert.strictEqual(r.nbRemises, 2);\nassert.strictEqual(fmtDate(r.prochaine), \"16/05/2027\");\nassert.strictEqual(fmtDate(r.dernierJour), \"11/04/2027\");\nassert.strictEqual(r.echeances[1].texte, \"attestation de vigilance délivrée après le 16/11/2026\");\nassert.strictEqual(ctl(r, \"Sous-traitant accepté\").statut, \"info\");\nassert(ctl(r, \"Attestation de vigilance\").texte.includes(\"utilisable jusqu'au 11/04/2027 inclus\"));\nassert(ctl(r, \"Seuil de 5 000 € HT\").texte.startsWith(`Contrat de 18${NB}600${NB}€ HT`));\nassert.strictEqual(r.pieces.length, 2);\nassert(r.actions[0].includes(\"délivrée après le 16/11/2026, à remettre au plus tard le 16/05/2027\"));\nassert(r.message.startsWith(\"Bonjour,\"));\nassert(r.message.includes(`contrat de 18${NB}600${NB}€ HT, dont la signature est prévue le 16/11/2026`));\nassert(r.message.includes(\"au plus tard le 16/05/2027\"));\nassert(r.recap.includes(\"Remises prévues : 2 (16/11/2026, 16/05/2027)\"));\nassert(r.recap.includes(\"Statut : Complet (0 bloquant, 0 à compléter, 6 conformes)\"));\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert.strictEqual(buildRecap({}), r.recap);\n\n// Variantes\nconst vieille = run({ dateAttestation: \"2026-05-10\" });\nassert.strictEqual(vieille.etat, \"bad\");\nassert.strictEqual(ctl(vieille, \"Attestation de vigilance\").statut, \"bad\");\nassert(ctl(vieille, \"Attestation de vigilance\").texte.includes(\"dernier jour utile : 09/11/2026\"));\nassert(ctl(vieille, \"Attestation de vigilance\").texte.includes(\"délivrée après le 16/05/2026\"));\nassert.strictEqual(ctl(run({ dateAttestation: \"2026-05-17\" }), \"Attestation de vigilance\").statut, \"ok\");\nassert.strictEqual(ctl(run({ dateAttestation: \"2026-05-16\" }), \"Attestation de vigilance\").statut, \"bad\");\nassert.strictEqual(ctl(run({ dateAttestation: \"2026-11-20\" }), \"Attestation de vigilance\").statut, \"warn\");\nassert.strictEqual(ctl(run({ dateAttestation: \"\" }), \"Attestation de vigilance\").statut, \"warn\");\nconst hon = run({ typeAttestation: \"honneur\" });\nassert.strictEqual(hon.etat, \"bad\");\nassert(ctl(hon, \"Attestation de vigilance\").texte.includes(\"n° 14-10.614\"));\nassert(ctl(hon, \"Attestation de vigilance\").texte.includes(\"n° 22-21.152\"));\nassert.strictEqual(ctl(run({ typeAttestation: \"aucune\" }), \"Attestation de vigilance\").statut, \"bad\");\nassert.strictEqual(ctl(run({ typeAttestation: \"aucune\", client: \"particulier\" }), \"Attestation de vigilance\").statut, \"ok\");\nassert.strictEqual(run({ typeAttestation: \"aucune\", client: \"particulier\" }).etat, \"ok\");\nassert.strictEqual(ctl(run({ typeAttestation: \"aucune\", client: \"particulier\", piece: \"aucune\" }), \"Attestation de vigilance\").statut, \"bad\");\nassert(ctl(run({ typeAttestation: \"provisoire\" }), \"Attestation de vigilance\").texte.includes(\"première échéance déclarative\"));\nconst auth = run({ authenticite: \"non\" });\nassert.strictEqual(auth.etat, \"warn\");\nassert.strictEqual(ctl(auth, \"Authenticité\").statut, \"warn\");\nassert.strictEqual(ctl(run({ authenticite: \"non\", client: \"particulier\" }), \"Authenticité\").statut, \"info\");\nassert.strictEqual(ctl(run({ piece: \"aucune\" }), \"Immatriculation\").statut, \"bad\");\nassert.strictEqual(ctl(run({ piece: \"aucune\", client: \"particulier\" }), \"Immatriculation\").statut, \"info\");\nassert.strictEqual(ctl(run({ piece: \"nonRequis\" }), \"Immatriculation\").statut, \"info\");\nassert.strictEqual(ctl(run({ piece: \"kbis\" }), \"Immatriculation\").statut, \"ok\");\nassert.strictEqual(ctl(run({ salaries: \"non\" }), \"Mentions liées aux salariés\").statut, \"info\");\nconst etr = run({ etrangers: \"oui\" });\nassert.strictEqual(ctl(etr, \"Salariés étrangers\").statut, \"warn\");\nassert(ctl(etr, \"Salariés étrangers\").texte.includes(\"puis tous les six mois\"));\nassert.strictEqual(etr.echeances[1].texte, \"attestation de vigilance délivrée après le 16/11/2026 + liste nominative des salariés étrangers\");\nconst etrP = run({ etrangers: \"oui\", client: \"particulier\" });\nassert(ctl(etrP, \"Salariés étrangers\").texte.includes(\"sans renouvellement semestriel\"));\nassert.strictEqual(etrP.echeances[1].texte, \"l'un des documents de l'article D. 8222-5\");\nconst ext = run({ etabli: \"etranger\" });\nassert.strictEqual(ctl(ext, \"Documents du prestataire étranger\").statut, \"warn\");\nassert.strictEqual(ext.pieces.length, 4);\nassert.strictEqual(ctl(ext, \"Immatriculation\"), undefined);\nassert(ext.echeances[0].texte.includes(\"D. 8222-7\"));\nassert(ctl(run({ client: \"public\" }), \"Client public\").texte.includes(\"L. 8222-6\"));\nassert.strictEqual(ctl(run({ sousTraitant: \"non\" }), \"Sous-traitant accepté\"), undefined);\nconst petit = run({ montant: 4999 });\nassert.strictEqual(petit.obligatoire, false);\nassert.strictEqual(petit.etat, \"neutral\");\nassert.strictEqual(petit.statutLabel, \"Non obligatoire\");\nassert.strictEqual(petit.nbRemises, 0);\nassert.strictEqual(petit.echeances.length, 0);\nassert(petit.message.includes(\"sous le seuil\"));\nassert.strictEqual(run({ montant: 5000 }).obligatoire, true);\nconst long = run({ dateFin: \"2028-11-16\" });\nassert.strictEqual(long.nbRemises, 5);\nassert(long.actions[0].includes(\"puis tous les six mois\"));\nconst court = run({ dateFin: \"2027-02-28\" });\nassert.strictEqual(court.nbRemises, 1);\nassert.strictEqual(court.prochaine, null);\nassert(court.message.includes(\"avant le premier renouvellement\"));\nassert.strictEqual(ctl(run({ dateFin: \"2026-10-01\" }), \"Dates du contrat\").statut, \"warn\");\nassert.strictEqual(ctl(run({ dateFin: \"\" }), \"Dates du contrat\").statut, \"warn\");\nconst sansDate = run({ dateConclusion: \"\" });\nassert.strictEqual(ctl(sansDate, \"Dates du contrat\").statut, \"warn\");\nassert.strictEqual(sansDate.nbRemises, 0);\nconst don = run({ role: \"donneur\" });\nassert(don.message.includes(\"pourriez-vous nous transmettre\"));\nassert(don.message.includes(\"Nous vous redemanderons\"));\nassert(run({ role: \"donneur\", authenticite: \"non\" }).actions.some((a) => a.includes(\"service de vérification de l'Urssaf\")));\n\n// Entrées invalides\nconst bad = computeVigilance({ role: \"x\", client: \"y\", etabli: \"z\", typeAttestation: \"w\", piece: \"v\", montant: \"abc\", dateConclusion: \"2026-13-01\", dateFin: \"n\", dateAttestation: null, salaries: 7, etrangers: undefined, sousTraitant: \"peut-être\", authenticite: {} });\nassert.strictEqual(bad.role, \"prestataire\");\nassert.strictEqual(bad.client, \"entreprise\");\nassert.strictEqual(bad.typeAttestation, \"aucune\");\nassert.strictEqual(bad.montant, 0);\nassert.strictEqual(bad.obligatoire, false);\nassert(!/NaN|undefined|null/.test(bad.recap + bad.message + bad.verdict));\nassert.strictEqual(computeVigilance({ montant: -500 }).montant, 0);\nassert.strictEqual(computeVigilance({ montant: \"12 000\" }).montant, 12000);\nassert.strictEqual(computeVigilance({ montant: \"7500,4\" }).montant, 7500);\n\n")(tool, require, console);
console.log("seo-pm-20261102 ok");
