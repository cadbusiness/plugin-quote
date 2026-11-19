import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_GARANTIE_PAIEMENT, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./calculateur-garantie-paiement-marche-travaux";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "garantie-paiement-1799-1-devis-travaux-b2b";
const BLOG_PATH = "/blog/garantie-paiement-1799-1-devis-travaux-b2b";
const TOOL_PATH = "/outils/calculateur-garantie-paiement-marche-travaux";
const DAY = "2026-10-28";
const DAY_PATHS = ["/blog/garantie-paiement-1799-1-devis-travaux-b2b", "/outils/calculateur-garantie-paiement-marche-travaux"];

assert.equal(BLOG_TOOL_GARANTIE_PAIEMENT, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 25);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Calculateur de garantie de paiement (article 1799-1)");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "au-delà de 12 000 € HT : la garantie due par le client, sa forme, le solde à couvrir et la date à partir de laquelle le chantier peut être suspendu.");

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
assert.ok(outilsHub.includes("calculateur-garantie-paiement-marche-travaux"));
assert.ok(outilsHub.includes("Calculateur de garantie de paiement (article 1799-1)"));
{
  const start = outilsHub.indexOf("href: \"/outils/calculateur-garantie-paiement-marche-travaux\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 5121);
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

for (const rel of ["src/lib/marketing/calculateur-garantie-paiement-marche-travaux.ts","src/components/marketing/calculateur-garantie-paiement-marche-travaux-calculator.tsx","src/app/(marketing)/outils/calculateur-garantie-paiement-marche-travaux/page.tsx","src/content/blog/garantie-paiement-1799-1-devis-travaux-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst { SEUIL_HT, DELAI_MISE_EN_DEMEURE_JOURS, DELAI_ACTION_DIRECTE_MOIS, TAUX_TVA, DEFAULTS, computeGarantie, buildRecap, finMiseEnDemeure, debutSursis, ttc, parseDate, iso, addMonths, diffDays, fmtDate, fmtEur, fmtJours, fmtTaux } = __mod;\nconst NB = \"\\u00a0\";\nconst run = (o) => computeGarantie({ ...DEFAULTS, ...o });\nconst d = (s) => parseDate(s);\n\n// Fichier\n\n\n\nassert.strictEqual(SEUIL_HT, 12000);\nassert.strictEqual(DELAI_MISE_EN_DEMEURE_JOURS, 15);\nassert.strictEqual(DELAI_ACTION_DIRECTE_MOIS, 1);\nassert.deepStrictEqual(TAUX_TVA, [20, 10, 5.5, 0]);\nassert.deepStrictEqual(DEFAULTS, {\n  role: \"titulaire\", client: \"pro\", financement: \"fonds\", tauxTVA: 20,\n  prixHT: 48600, avenantsHT: 3200, nonAcceptesHT: 2400, versesConclusionHT: 9720, payesDepuisHT: 14580, impayesHT: 8640,\n  dateMiseEnDemeure: \"2026-10-13\", dateCalcul: \"2026-10-28\",\n});\n\n// Formats et dates\nassert.strictEqual(fmtEur(27500), `27${NB}500${NB}€`);\nassert.strictEqual(fmtEur(12000.5), `12${NB}000,50${NB}€`);\nassert.strictEqual(fmtEur(0), `0${NB}€`);\nassert.strictEqual(fmtJours(1), \"1 jour\");\nassert.strictEqual(fmtJours(16), \"16 jours\");\nassert.strictEqual(fmtTaux(5.5), `5,5${NB}%`);\nassert.strictEqual(fmtDate(d(\"2026-10-29\")), \"29/10/2026\");\nassert.strictEqual(fmtDate(null), \"n/a\");\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.strictEqual(iso(addMonths(d(\"2026-01-31\"), 1)), \"2026-02-28\");\nassert.strictEqual(diffDays(d(\"2026-10-28\"), d(\"2026-10-29\")), 1);\nassert.strictEqual(ttc(27500, 20), 33000);\nassert.strictEqual(ttc(1000, 5.5), 1055);\nassert.strictEqual(ttc(1000, 0), 1000);\n\n// Délai de quinze jours : le jour de réception ne compte pas\nassert.strictEqual(iso(finMiseEnDemeure(d(\"2026-10-13\"))), \"2026-10-28\");\nassert.strictEqual(iso(debutSursis(d(\"2026-10-13\"))), \"2026-10-29\");\nassert.strictEqual(iso(finMiseEnDemeure(d(\"2026-12-20\"))), \"2027-01-04\");\nassert.strictEqual(iso(debutSursis(d(\"2027-02-20\"))), \"2027-03-08\");\nassert.strictEqual(finMiseEnDemeure(null), null);\nassert.strictEqual(debutSursis(null), null);\n\n// Exemple par défaut : client professionnel, sans crédit dédié\nconst r = run({});\nassert.strictEqual(r.cas, \"pro\");\nassert.strictEqual(r.garantieDue, true);\nassert.strictEqual(r.sursisOuvert, true);\nassert.strictEqual(r.sommesDues, 42080);\nassert.strictEqual(r.auDessus, true);\nassert.strictEqual(r.solde, 27500);\nassert.strictEqual(r.soldeTTC, 33000);\nassert.strictEqual(r.impayes, 8640);\nassert.strictEqual(iso(r.finMiseEnDemeure), \"2026-10-28\");\nassert.strictEqual(iso(r.dateSursis), \"2026-10-29\");\nassert.strictEqual(r.joursAvantSursis, 1);\nassert.strictEqual(r.etat, \"ok\");\nassert(r.verdict.includes(\"jusqu'au 28/10/2026 inclus\"));\nassert(r.verdict.includes(\"à partir du 29/10/2026\"));\nassert(r.forme.startsWith(\"Caution solidaire\"));\nassert.strictEqual(r.detail.length, 8);\nassert.deepStrictEqual(r.detail[2], { ligne: \"Travaux supplémentaires non acceptés\", ht: 2400, ttc: 2880, garantie: \"non couvert tant que non accepté\" });\nassert.strictEqual(r.detail[4].ht, 42080);\nassert.strictEqual(r.detail[4].garantie, \"base de la garantie\");\nassert.strictEqual(r.detail[6].ttc, 33000);\nassert.strictEqual(r.calendrier.length, 4);\nassert.deepStrictEqual(r.calendrier.map((l) => iso(l.date)), [\"2026-10-13\", \"2026-10-28\", \"2026-10-28\", \"2026-10-29\"]);\nassert.strictEqual(r.calendrier.find((l) => l.cur).effet, \"1 jour avant la suspension possible\");\nassert.strictEqual(r.conseils.length, 6);\nassert(r.conseils[0].includes(`27${NB}500${NB}€ HT`));\nassert(r.conseils[2].startsWith(`2${NB}400${NB}€ HT de travaux supplémentaires ne sont pas couverts`));\nassert(r.conseils[5].startsWith(\"QuoteBuilder ne fait ni signature de devis, ni facture, ni suivi de paiement\"));\nconst lignes = r.recap.split(\"\\n\");\nassert.strictEqual(lignes.length, 9);\nassert.strictEqual(lignes[0], \"Garantie de paiement, article 1799-1 du Code civil (calcul indicatif)\");\nassert.strictEqual(lignes[1], \"Position : titulaire du marché ; client : professionnel ou personne morale ; financement : sans crédit dédié\");\nassert.strictEqual(lignes[3], `Versements à la signature : 9${NB}720${NB}€ HT ; sommes à garantir : 42${NB}080${NB}€ HT (seuil de 12${NB}000${NB}€ HT dépassé)`);\nassert.strictEqual(lignes[5], `Solde encore dû : 27${NB}500${NB}€ HT, soit 33${NB}000${NB}€ TTC à 20${NB}%`);\nassert.strictEqual(lignes[6], \"Mise en demeure reçue le : 13/10/2026 ; fin du délai de quinze jours : 28/10/2026\");\nassert.strictEqual(lignes[7], \"Au 28/10/2026 : suspension possible dans 1 jour, le 29/10/2026\");\nassert.strictEqual(lignes[8], \"Calcul : quotebuilder.co/outils/calculateur-garantie-paiement-marche-travaux\");\nassert.strictEqual(buildRecap(DEFAULTS), r.recap);\n\n// Délai expiré\nconst exp = run({ dateCalcul: \"2026-10-29\" });\nassert.strictEqual(exp.etat, \"warn\");\nassert.strictEqual(exp.joursAvantSursis, 0);\nassert(exp.verdict.startsWith(\"Le délai de quinze jours a expiré le 28/10/2026\"));\nassert(exp.recap.split(\"\\n\")[7].includes(\"suspension possible depuis le 29/10/2026\"));\nassert.strictEqual(run({ dateCalcul: \"2026-12-01\" }).etat, \"warn\");\n\n// Seuil strictement dépassé\nassert.strictEqual(run({ prixHT: 21720, avenantsHT: 0 }).sommesDues, 12000);\nassert.strictEqual(run({ prixHT: 21720, avenantsHT: 0 }).cas, \"sousSeuil\");\nassert.strictEqual(run({ prixHT: 21720, avenantsHT: 0 }).garantieDue, false);\nassert.strictEqual(run({ prixHT: 21721, avenantsHT: 0 }).cas, \"pro\");\n// Les acomptes à la signature comptent pour le seuil, les paiements ultérieurs non\nassert.strictEqual(run({ prixHT: 15000, avenantsHT: 0, versesConclusionHT: 4500 }).cas, \"sousSeuil\");\nconst ult = run({ prixHT: 15000, avenantsHT: 0, versesConclusionHT: 0, payesDepuisHT: 4500, impayesHT: 0 });\nassert.strictEqual(ult.cas, \"pro\");\nassert.strictEqual(ult.solde, 10500);\n// Un avenant accepté peut faire franchir le seuil, un travail non accepté non\nassert.strictEqual(run({ prixHT: 11000, avenantsHT: 1500, versesConclusionHT: 0 }).auDessus, true);\nassert.strictEqual(run({ prixHT: 11000, avenantsHT: 0, nonAcceptesHT: 5000, versesConclusionHT: 0 }).auDessus, false);\nconst ss = run({ prixHT: 9000, avenantsHT: 0 });\nassert(ss.forme.includes(\"n'est pas dépassé\"));\nassert.strictEqual(ss.detail[0].garantie, \"sans objet\");\nassert.strictEqual(ss.detail[4].garantie, \"comparé au seuil\");\nassert.strictEqual(ss.dateSursis, null);\nassert(ss.recap.split(\"\\n\")[3].endsWith(\"non dépassé)\"));\nassert(ss.recap.split(\"\\n\")[7].endsWith(\"pas de garantie de l'article 1799-1 exigible\"));\n\n// Financement\nconst tot = run({ financement: \"total\" });\nassert.strictEqual(tot.sursisOuvert, false);\nassert.strictEqual(tot.dateSursis, null);\nassert.strictEqual(tot.etat, \"ok\");\nassert(tot.forme.startsWith(\"Versement direct du crédit\"));\nassert(tot.verdict.includes(\"sur ordre écrit du client\"));\nconst par = run({ financement: \"partiel\" });\nassert.strictEqual(par.sursisOuvert, true);\nassert(par.forme.includes(\"plus une caution solidaire\"));\nassert.strictEqual(iso(par.dateSursis), \"2026-10-29\");\n\n// Particulier\nconst pf = run({ client: \"particulier\" });\nassert.strictEqual(pf.garantieDue, false);\nassert(pf.forme.includes(\"pas de caution exigible (alinéa 4)\"));\nassert.strictEqual(pf.dateSursis, null);\nconst pc = run({ client: \"particulier\", financement: \"total\" });\nassert.strictEqual(pc.garantieDue, true);\nassert.strictEqual(pc.sursisOuvert, false);\nassert(pc.forme.startsWith(\"Versement direct du crédit\"));\nassert(pc.verdict.includes(\"pas de suspension du chantier sur ce fondement\"));\nassert.strictEqual(run({ client: \"particulier\", financement: \"partiel\" }).garantieDue, true);\nassert.strictEqual(run({ client: \"particulier\", prixHT: 5000 }).cas, \"sousSeuil\");\n\n// Hors champ\nconst hlm = run({ client: \"bailleur\" });\nassert.strictEqual(hlm.cas, \"bailleur\");\nassert.strictEqual(hlm.garantieDue, false);\nassert(hlm.forme.includes(\"alinéa 5\"));\nconst pub = run({ client: \"public\" });\nassert.strictEqual(pub.cas, \"public\");\nassert.strictEqual(pub.garantieDue, false);\nassert.strictEqual(pub.etat, \"neutral\");\nassert(pub.verdict.includes(\"commande publique\"));\n\n// Sous-traitant\nconst st = run({ role: \"soustraitant\" });\nassert.strictEqual(st.cas, \"soustraitant\");\nassert.strictEqual(st.garantieDue, true);\nassert(st.forme.includes(\"article 14 de la loi du 31 décembre 1975\"));\nassert.strictEqual(iso(st.dateActionDirecte), \"2026-11-13\");\nassert.strictEqual(st.dateSursis, null);\nassert.strictEqual(st.calendrier.length, 3);\nassert(st.calendrier[2].effet.includes(\"Action directe\"));\nassert(st.conseils[0].includes(\"article 14-1\"));\nassert.strictEqual(st.recap.split(\"\\n\")[6], \"Mise en demeure reçue le : 13/10/2026\");\nassert(st.recap.split(\"\\n\")[7].includes(\"action directe possible à partir du 13/11/2026\"));\nassert.strictEqual(run({ role: \"soustraitant\", prixHT: 3000, avenantsHT: 0 }).garantieDue, true);\nconst stp = run({ role: \"soustraitant\", client: \"public\" });\nassert.strictEqual(stp.garantieDue, false);\nassert(stp.forme.startsWith(\"Paiement direct par l'acheteur public\"));\nassert.strictEqual(stp.dateActionDirecte, null);\nassert.strictEqual(iso(run({ role: \"soustraitant\", dateMiseEnDemeure: \"2026-01-31\" }).dateActionDirecte), \"2026-02-28\");\n\n// Cas limites du titulaire\nconst paye = run({ payesDepuisHT: 60000 });\nassert.strictEqual(paye.solde, 0);\nassert.strictEqual(paye.impayes, 0);\nassert.strictEqual(paye.verdict, \"Le prix est payé : il n'y a plus rien à garantir.\");\nassert(paye.recap.split(\"\\n\")[7].endsWith(\"prix payé, plus rien à garantir\"));\nconst sansMED = run({ dateMiseEnDemeure: \"\" });\nassert.strictEqual(sansMED.dateSursis, null);\nassert.strictEqual(sansMED.finMiseEnDemeure, null);\nassert(sansMED.verdict.includes(\"lettre recommandée avec accusé de réception\"));\nassert.strictEqual(sansMED.calendrier.length, 1);\nassert(sansMED.recap.split(\"\\n\")[7].endsWith(`garantie due sur 27${NB}500${NB}€ HT`));\nconst sansImpaye = run({ impayesHT: 0 });\nassert.strictEqual(sansImpaye.dateSursis, null);\nassert(sansImpaye.verdict.includes(\"la suspension du chantier n'est pas ouverte\"));\nassert.strictEqual(run({ impayesHT: 999999 }).impayes, 27500);\nconst sansNA = run({ nonAcceptesHT: 0 });\nassert(sansNA.conseils[2].includes(\"04-17.226\"));\nassert.strictEqual(sansNA.detail[2].ht, 0);\n\n// Saisies invalides\nconst inv = run({ role: \"x\", client: \"y\", financement: \"z\", tauxTVA: 7, prixHT: \"abc\", avenantsHT: -50, versesConclusionHT: \"\" });\nassert.strictEqual(inv.role, \"titulaire\");\nassert.strictEqual(inv.client, \"pro\");\nassert.strictEqual(inv.financement, \"fonds\");\nassert.strictEqual(inv.taux, 20);\nassert.strictEqual(inv.prix, 0);\nassert.strictEqual(inv.avenants, 0);\nassert.strictEqual(inv.cas, \"sousSeuil\");\nassert.strictEqual(run({ tauxTVA: \"5.5\" }).taux, 5.5);\nassert.strictEqual(run({ tauxTVA: \"0\" }).soldeTTC, 27500);\nassert.strictEqual(run({ dateCalcul: \"\" }).joursAvantSursis, null);\nassert.strictEqual(run({ prixHT: 5000, versesConclusionHT: 9000, avenantsHT: 0 }).sommesDues, 0);\n\n// Textes\nfor (const x of [r, exp, ss, tot, par, pf, pc, hlm, pub, st, stp, paye, sansMED, sansImpaye]) {\n  assert(!/[\\u2013\\u2014]/.test(x.verdict + x.forme + x.recap + x.conseils.join(\"\")), \"tiret long dans un texte\");\n  assert(!/NaN|undefined/.test(x.recap + x.verdict), \"valeur manquante\");\n}\n\n\n\n")(tool, require, console);
console.log("seo-pm-20261028 ok");
