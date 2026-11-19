import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_PRESCRIPTION, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./calculateur-prescription-facture-impayee";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "prescription-facture-impayee-devis-b2b";
const BLOG_PATH = "/blog/prescription-facture-impayee-devis-b2b";
const TOOL_PATH = "/outils/calculateur-prescription-facture-impayee";
const DAY = "2026-10-27";
const DAY_PATHS = ["/blog/prescription-facture-impayee-devis-b2b", "/outils/calculateur-prescription-facture-impayee"];

assert.equal(BLOG_TOOL_PRESCRIPTION, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 26);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Calculateur de prescription d'une facture impayée");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Cinq ans entre professionnels, deux ans contre un particulier : la date limite pour agir, ce qui l'interrompt et ce qui ne change rien.");

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
assert.ok(outilsHub.includes("calculateur-prescription-facture-impayee"));
assert.ok(outilsHub.includes("Calculateur de prescription d'une facture impayée"));
{
  const start = outilsHub.indexOf("href: \"/outils/calculateur-prescription-facture-impayee\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 6657);
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

for (const rel of ["src/lib/marketing/calculateur-prescription-facture-impayee.ts","src/components/marketing/calculateur-prescription-facture-impayee-calculator.tsx","src/app/(marketing)/outils/calculateur-prescription-facture-impayee/page.tsx","src/content/blog/prescription-facture-impayee-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst { TYPES, DUREES, BUTOIR_ANS, SEUIL_ALERTE_JOURS, SEUIL_PETITE_CREANCE, DEFAULTS, computePrescription, buildRecap, finDelai, dureeApplicable, lireEvenements, parseDate, iso, addMonths, addYears, diffDays, fmtDate, fmtEur, fmtJours } = __mod;\nconst NB = \"\\u00a0\";\nconst run = (o) => computePrescription({ ...DEFAULTS, ...o });\nconst d = (s) => parseDate(s);\n\n// Fichier\n\n\nassert.deepStrictEqual(TYPES, [\"aucun\", \"relance\", \"reconnaissance\", \"mediation\", \"justice\"]);\nassert.deepStrictEqual(DUREES, { pro: 5, conso: 2 });\nassert.strictEqual(BUTOIR_ANS, 20);\nassert.strictEqual(SEUIL_ALERTE_JOURS, 180);\nassert.strictEqual(SEUIL_PETITE_CREANCE, 5000);\nassert.deepStrictEqual(DEFAULTS, {\n  debiteur: \"pro\", clause: 0, dateExecution: \"2021-11-30\", dateEcheance: \"2022-01-14\", montant: 3840, dateCalcul: \"2026-10-27\",\n  ev1Type: \"relance\", ev1Date: \"2022-02-10\", ev1Fin: \"\",\n  ev2Type: \"relance\", ev2Date: \"2026-09-15\", ev2Fin: \"\",\n  ev3Type: \"aucun\", ev3Date: \"\", ev3Fin: \"\",\n});\n\n// Formats et dates\nassert.strictEqual(fmtEur(3840), `3${NB}840${NB}€`);\nassert.strictEqual(fmtEur(33.47), `33,47${NB}€`);\nassert.strictEqual(fmtJours(34), \"34 jours\");\nassert.strictEqual(fmtJours(1), \"1 jour\");\nassert.strictEqual(fmtJours(-1234), `1${NB}234 jours`);\nassert.strictEqual(fmtDate(d(\"2027-01-14\")), \"14/01/2027\");\nassert.strictEqual(fmtDate(null), \"n/a\");\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.strictEqual(iso(addMonths(d(\"2026-08-31\"), 6)), \"2027-02-28\");\nassert.strictEqual(iso(addYears(d(\"2028-02-29\"), 1)), \"2029-02-28\");\nassert.strictEqual(diffDays(d(\"2026-10-27\"), d(\"2026-11-30\")), 34);\n\n// Fin du délai : même quantième, pas de report (2228, 2229 ; Cass. 1re civ., 12 déc. 2018, n° 17-25.697)\nassert.strictEqual(iso(finDelai(d(\"2022-01-14\"), 5)), \"2027-01-14\");\nassert.strictEqual(iso(finDelai(d(\"2021-11-30\"), 5)), \"2026-11-30\");\nassert.strictEqual(iso(finDelai(d(\"2008-06-18\"), 5)), \"2013-06-18\");\nassert.strictEqual(iso(finDelai(d(\"2028-02-29\"), 5)), \"2033-02-28\");\nassert.strictEqual(iso(finDelai(d(\"2026-12-31\"), 2)), \"2028-12-31\");\nassert.strictEqual(finDelai(null, 5), null);\n\n// Durée applicable\nassert.deepStrictEqual(dureeApplicable(\"pro\", 0), { annees: 5, source: \"L110-4 du Code de commerce et 2224 du Code civil\", clauseIgnoree: false });\nassert.deepStrictEqual(dureeApplicable(\"pro\", 1), { annees: 1, source: \"clause du contrat (article 2254 du Code civil)\", clauseIgnoree: false });\nassert.deepStrictEqual(dureeApplicable(\"pro\", 10), { annees: 10, source: \"clause du contrat (article 2254 du Code civil)\", clauseIgnoree: false });\nassert.deepStrictEqual(dureeApplicable(\"conso\", 3), { annees: 2, source: \"L218-2 du Code de la consommation\", clauseIgnoree: true });\n\n// Événements : tri par date, aucun et dates vides ignorés, fin de médiation avant le début ignorée\nconst evs = lireEvenements({ ev1Type: \"relance\", ev1Date: \"2026-09-15\", ev2Type: \"reconnaissance\", ev2Date: \"2024-03-01\", ev3Type: \"mediation\", ev3Date: \"2025-01-10\", ev3Fin: \"2024-12-01\" });\nassert.deepStrictEqual(evs.map((e) => [e.type, iso(e.date), iso(e.fin)]), [[\"reconnaissance\", \"2024-03-01\", null], [\"mediation\", \"2025-01-10\", null], [\"relance\", \"2026-09-15\", null]]);\nassert.strictEqual(lireEvenements({ ev1Type: \"relance\", ev1Date: \"\", ev2Type: \"aucun\", ev2Date: \"2024-01-01\", ev3Type: \"bidon\", ev3Date: \"2024-01-01\" }).length, 0);\n\n// Cas par défaut (hypothèses d'exemple) : deux relances, aucune ne compte\nconst r = computePrescription(DEFAULTS);\nassert.strictEqual(r.valide, true);\nassert.strictEqual(r.annees, 5);\nassert.strictEqual(iso(r.finEcheance), \"2027-01-14\");\nassert.strictEqual(iso(r.finExecution), \"2026-11-30\");\nassert.strictEqual(iso(r.finProche), \"2026-11-30\");\nassert.strictEqual(r.joursRestants, 34);\nassert.strictEqual(r.joursEcheance, 79);\nassert.strictEqual(r.etatDelai, \"courant\");\nassert.strictEqual(r.butoirApplique, false);\nassert.strictEqual(r.etat, \"warn\");\nassert.strictEqual(r.verdict, \"Il reste 34 jours avant le 30/11/2026. Une nouvelle relance ou une mise en demeure ne prolongera rien : obtenez une reconnaissance écrite ou engagez une procédure avant cette date.\");\nassert.strictEqual(r.calendrier.length, 3);\nassert.deepStrictEqual(r.calendrier.map((l) => [iso(l.date), iso(l.fin)]), [[\"2022-01-14\", \"2027-01-14\"], [\"2022-02-10\", \"2027-01-14\"], [\"2026-09-15\", \"2027-01-14\"]]);\nassert(r.calendrier[1].effet.startsWith(\"Aucun : une relance ou une mise en demeure n'interrompt pas\"));\nassert.strictEqual(r.procedures.length, 4);\nassert(r.procedures[0].startsWith(\"Injonction de payer : quel que soit le montant\"));\nassert(r.procedures[0].includes(`33,47${NB}€`));\nassert(r.procedures[1].includes(\"pas pour une créance commerciale facturée entre commerçants\"));\nassert(r.procedures[2].includes(\"pas encore applicable\"));\nassert(r.procedures[3].startsWith(\"Assignation en paiement\"));\nassert.strictEqual(r.conseils.length, 6);\nassert(r.conseils[0].startsWith(\"Deux dates\"));\nassert(r.conseils[1].includes(\"20-23.204\"));\nassert(r.conseils[5].startsWith(\"QuoteBuilder ne fait ni facture, ni encaissement, ni suivi d'échéance\"));\nconst lines = r.recap.split(\"\\n\");\nassert.strictEqual(lines.length, 9);\nassert.strictEqual(lines[0], \"Prescription d'une facture impayée (calcul indicatif)\");\nassert.strictEqual(lines[1], \"Client : professionnel, délai de 5 ans (L110-4 du Code de commerce et 2224 du Code civil)\");\nassert.strictEqual(lines[2], `Montant restant dû : 3${NB}840${NB}€`);\nassert.strictEqual(lines[3], \"Exécution : 30/11/2021, échéance de paiement : 14/01/2022\");\nassert.strictEqual(lines[4], \"Événements : relance ou mise en demeure le 10/02/2022, relance ou mise en demeure le 15/09/2026\");\nassert.strictEqual(lines[5], \"Fin du délai, point de départ à l'échéance : 14/01/2027\");\nassert.strictEqual(lines[6], \"Fin du délai par prudence, point de départ à l'exécution : 30/11/2026\");\nassert.strictEqual(lines[7], \"Au 27/10/2026 : 34 jours avant la date la plus proche\");\nassert.strictEqual(lines[8], \"Calcul : quotebuilder.co/outils/calculateur-prescription-facture-impayee\");\nassert.strictEqual(buildRecap(DEFAULTS), r.recap);\n\n// Paiement partiel le 15/09/2026 : nouveau délai complet\nconst rec = run({ ev2Type: \"reconnaissance\" });\nassert.strictEqual(iso(rec.finEcheance), \"2031-09-15\");\nassert.strictEqual(iso(rec.finExecution), \"2031-09-15\");\nassert.strictEqual(rec.joursRestants, 1784);\nassert.strictEqual(rec.etat, \"ok\");\nassert(rec.calendrier[2].effet.startsWith(\"Interruption : un nouveau délai de 5 ans\"));\nassert(rec.conseils[2].startsWith(\"Gardez la preuve de la reconnaissance\"));\nassert.strictEqual(rec.conseils[0], \"Le délai se compte en jours. Il finit à minuit le jour qui porte le même quantième que le point de départ, sans report si ce jour tombe un week-end ou un jour férié.\");\n\n// Médiation du 01/10/2026 au 15/11/2026 : reprise d'au moins six mois\nconst med = run({ ev2Type: \"mediation\", ev2Date: \"2026-10-01\", ev2Fin: \"2026-11-15\" });\nassert.strictEqual(iso(med.finEcheance), \"2027-05-15\");\nassert.strictEqual(iso(med.finExecution), \"2027-05-15\");\nassert.strictEqual(med.joursRestants, 200);\nassert.strictEqual(med.etat, \"ok\");\nassert(med.calendrier[2].evenement.includes(\"(jusqu'au 15/11/2026)\"));\nassert(med.calendrier[2].effet.includes(\"105 jours\"));\n// Médiation longue avant l'échéance : le reliquat dépasse six mois\nconst med2 = run({ ev1Type: \"mediation\", ev1Date: \"2023-01-10\", ev1Fin: \"2023-03-10\", ev2Type: \"aucun\" });\nassert.strictEqual(iso(med2.finEcheance), \"2027-03-14\");\nassert.strictEqual(iso(med2.finExecution), \"2027-01-28\");\nassert.strictEqual(med2.joursRestants, 93);\nassert.strictEqual(med2.etat, \"warn\");\n// Médiation sans date de fin : en cours\nconst medEnCours = run({ ev2Type: \"mediation\", ev2Date: \"2026-10-01\", ev2Fin: \"\" });\nassert.strictEqual(medEnCours.etatDelai, \"suspendu\");\nassert.strictEqual(medEnCours.finEcheance, null);\nassert.strictEqual(medEnCours.etat, \"neutral\");\nassert(medEnCours.recap.split(\"\\n\")[5].endsWith(\"suspendu, médiation en cours\"));\n\n// Demande en justice avant la fin du délai\nconst just = run({ ev2Type: \"justice\", ev2Date: \"2026-10-20\" });\nassert.strictEqual(just.etatDelai, \"instance\");\nassert.strictEqual(just.etat, \"neutral\");\nassert.strictEqual(just.joursRestants, null);\nassert(just.verdict.startsWith(\"Une demande en justice a été faite avant la fin du délai\"));\nassert.strictEqual(just.recap.split(\"\\n\")[7], \"Au 27/10/2026 : pas de date limite calculable\");\n// Demande en justice après la date d'exécution prudente : trop tard dans ce scénario seulement\nconst justTard = run({ ev2Type: \"justice\", ev2Date: \"2026-12-10\", dateCalcul: \"2026-12-11\" });\nassert.strictEqual(justTard.etatDelai, \"instance\");\nassert.strictEqual(justTard.etat, \"neutral\");\nassert.strictEqual(iso(justTard.finExecution), \"2026-11-30\");\n\n// Dates de calcul plus tardives\nconst tard1 = run({ dateCalcul: \"2026-12-15\" });\nassert.strictEqual(tard1.joursRestants, -15);\nassert.strictEqual(tard1.etat, \"bad\");\nassert(tard1.verdict.startsWith(\"Si le juge retient la date d'exécution, le délai a pris fin le 30/11/2026\"));\nassert.strictEqual(tard1.recap.split(\"\\n\")[7], \"Au 15/12/2026 : dépassé de 15 jours sur la date la plus proche\");\nconst tard2 = run({ dateCalcul: \"2027-02-01\" });\nassert.strictEqual(tard2.joursEcheance, -18);\nassert.strictEqual(tard2.etat, \"bad\");\nassert(tard2.verdict.includes(\"prescrite selon les deux points de départ\"));\nassert(tard2.procedures[2].includes(\"Vérifiez l'arrêté\"));\nconst loin = run({ dateCalcul: \"2026-01-02\" });\nassert.strictEqual(loin.joursRestants, 332);\nassert.strictEqual(loin.etat, \"ok\");\nassert.strictEqual(run({ dateCalcul: \"2026-06-03\" }).joursRestants, 180);\nassert.strictEqual(run({ dateCalcul: \"2026-06-03\" }).etat, \"warn\");\nassert.strictEqual(run({ dateCalcul: \"2026-06-02\" }).etat, \"ok\");\n\n// Consommateur : deux ans, clause ignorée, reconnaissance trop tardive\nconst conso = run({ debiteur: \"conso\", clause: 3, ev2Type: \"reconnaissance\", ev2Date: \"2025-01-10\" });\nassert.strictEqual(conso.annees, 2);\nassert.strictEqual(conso.clauseIgnoree, true);\nassert.strictEqual(iso(conso.finEcheance), \"2024-01-14\");\nassert.strictEqual(iso(conso.finExecution), \"2023-11-30\");\nassert.strictEqual(conso.etat, \"bad\");\nassert(conso.calendrier[2].effet.startsWith(\"Trop tard\"));\nassert(conso.procedures[1].startsWith(\"Procédure simplifiée de recouvrement des petites créances : possible\"));\nassert.strictEqual(conso.procedures.length, 3);\nassert(conso.recap.split(\"\\n\")[1].startsWith(\"Client : consommateur, délai de 2 ans\"));\n\n// Clause d'un an entre professionnels\nconst clause1 = run({ clause: 1, dateCalcul: \"2022-06-01\", ev2Type: \"aucun\" });\nassert.strictEqual(iso(clause1.finEcheance), \"2023-01-14\");\nassert.strictEqual(iso(clause1.finExecution), \"2022-11-30\");\nassert.strictEqual(clause1.joursRestants, 182);\nassert.strictEqual(clause1.etat, \"ok\");\n\n// Délai butoir de vingt ans (2232)\nconst but = run({ clause: 10, dateExecution: \"2008-06-30\", dateEcheance: \"\", ev1Type: \"reconnaissance\", ev1Date: \"2017-03-01\", ev2Type: \"reconnaissance\", ev2Date: \"2026-02-01\" });\nassert.strictEqual(iso(but.finEcheance), \"2028-06-30\");\nassert.strictEqual(but.butoirApplique, true);\nassert.strictEqual(but.calendrier[but.calendrier.length - 1].evenement, \"Délai butoir\");\nassert.strictEqual(but.recap.split(\"\\n\")[3], \"Exécution : 30/06/2008, échéance de paiement : n/a\");\n\n// Montants et procédures\nconst gros = run({ montant: 6000 });\nassert(gros.procedures[1].includes(\"non, le montant dépasse 5\"));\nconst zero = run({ montant: 0 });\nassert.strictEqual(zero.procedures.length, 3);\n\n// Échéance antérieure à l'exécution : ramenée à l'exécution\nconst inv = run({ dateEcheance: \"2021-10-01\" });\nassert.strictEqual(iso(inv.finEcheance), \"2026-11-30\");\n\n// Saisie incomplète\nconst vide = run({ dateExecution: \"\", dateEcheance: \"\" });\nassert.strictEqual(vide.valide, false);\nassert.strictEqual(vide.etat, \"neutral\");\nassert.strictEqual(vide.calendrier.length, 0);\nassert.strictEqual(vide.conseils.length, 6);\nassert.strictEqual(vide.recap.split(\"\\n\").length, 9);\nassert.strictEqual(run({ dateCalcul: \"\" }).valide, false);\nconst seuleEch = run({ dateExecution: \"\" });\nassert.strictEqual(iso(seuleEch.finEcheance), \"2027-01-14\");\nassert.strictEqual(iso(seuleEch.finExecution), \"2027-01-14\");\n\n\n\n")(tool, require, console);
console.log("seo-pm-20261027 ok");
