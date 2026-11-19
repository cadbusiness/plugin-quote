import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_DECLARATION_CREANCE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./calculateur-declaration-creance-procedure-collective";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "client-procedure-collective-declaration-creance-devis-b2b";
const BLOG_PATH = "/blog/client-procedure-collective-declaration-creance-devis-b2b";
const TOOL_PATH = "/outils/calculateur-declaration-creance-procedure-collective";
const DAY = "2026-11-18";
const DAY_PATHS = ["/blog/client-procedure-collective-declaration-creance-devis-b2b", "/outils/calculateur-declaration-creance-procedure-collective"];

assert.equal(BLOG_TOOL_DECLARATION_CREANCE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 52);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Calculateur de déclaration de créance");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Client en sauvegarde, redressement ou liquidation : la date limite depuis le BODACC, le montant à déclarer, le contrat en cours et le courrier à envoyer.");

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
assert.ok(outilsHub.includes("calculateur-declaration-creance-procedure-collective"));
assert.ok(outilsHub.includes("Calculateur de déclaration de créance"));
{
  const start = outilsHub.indexOf("href: \"/outils/calculateur-declaration-creance-procedure-collective\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 10354);
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

for (const rel of ["src/lib/marketing/calculateur-declaration-creance-procedure-collective.ts","src/components/marketing/calculateur-declaration-creance-procedure-collective-calculator.tsx","src/app/(marketing)/outils/calculateur-declaration-creance-procedure-collective/page.tsx","src/content/blog/client-procedure-collective-declaration-creance-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, POINTS, LABEL_SETS, STATUT_LABELS, TVA_BP, TVA_LABELS, computeDeclaration, normalize, fmtEur, fmtDate, parseDate, isoDate, addDays, diffDays, addMonths, easter, joursFeries, isOuvrable, nextOuvrable, prevOuvrable, dec } = X;\nconst run = (o) => computeDeclaration({ ...DEFAULTS, ...o });\nconst S = (r, i) => r.controles[i].statut;\nconst T = (r, i) => r.controles[i].texte;\nconst D = (s) => parseDate(s);\n\n// Statique\nassert.strictEqual(X.SLUG, SLUG);\nassert.strictEqual(Object.keys(DEFAULTS).length, 22);\nassert.strictEqual(POINTS.length, 10);\nassert.deepStrictEqual(Object.keys(TVA_BP).sort(), Object.keys(TVA_LABELS).sort());\nconst numIds = [\"montantExecute\", \"dejaPaye\", \"penalites\", \"posterieur\"];\nconst dateIds = [\"dateJugement\", \"datePublication\", \"dateAvertissement\", \"dateCalcul\", \"dateEcheance\", \"dateMiseEnDemeure\"];\nconst selIds = Object.keys(LABEL_SETS);\nassert.strictEqual(selIds.length, 12);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 22);\n\n\n\n\n\n\n\n\n// Utilitaires\nassert.strictEqual(fmtEur(1684800), \"16 848 €\");\nassert.strictEqual(fmtEur(4505), \"45,05 €\");\nassert.strictEqual(fmtEur(4550), \"45,50 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtEur(123456789), \"1 234 567,89 €\");\nassert.strictEqual(dec(\"28 080,50\", 1e8), 2808050);\nassert.strictEqual(dec(\"28\\u00a0080\", 1e8), 2808000);\nassert.strictEqual(dec(\"28\\u202f080\", 1e8), 2808000);\nassert.strictEqual(dec(\"-5\", 1e8), 0);\nassert.strictEqual(dec(\"abc\", 1e8), 0);\nassert.strictEqual(dec(\"1e12\", 1e8), 1e10);\nassert.strictEqual(parseDate(\"2026-02-30\"), null);\nassert.strictEqual(parseDate(\"\"), null);\nassert.strictEqual(parseDate(\"1800-01-01\"), null);\nassert.strictEqual(isoDate(parseDate(\"2026-11-17\")), \"2026-11-17\");\nassert.strictEqual(fmtDate(D(\"2027-01-17\")), \"dimanche 17 janvier 2027\");\nassert.strictEqual(fmtDate(null), \"[date]\");\nassert.strictEqual(isoDate(addMonths(D(\"2026-11-17\"), 2)), \"2027-01-17\");\nassert.strictEqual(isoDate(addMonths(D(\"2026-12-31\"), 2)), \"2027-02-28\");\nassert.strictEqual(isoDate(addMonths(D(\"2027-11-30\"), 3)), \"2028-02-29\");\nassert.strictEqual(isoDate(addMonths(D(\"2026-08-31\"), 1)), \"2026-09-30\");\nassert.strictEqual(isoDate(addMonths(D(\"2026-11-17\"), 6)), \"2027-05-17\");\nassert.strictEqual(isoDate(addMonths(D(\"2026-11-17\"), 12)), \"2027-11-17\");\nassert.strictEqual(isoDate(easter(2026)), \"2026-04-05\");\nassert.strictEqual(isoDate(easter(2027)), \"2027-03-28\");\nassert.strictEqual(isoDate(easter(2028)), \"2028-04-16\");\nassert.strictEqual(joursFeries(2027).length, 11);\nfor (const j of [\"2027-01-01\", \"2027-03-29\", \"2027-05-01\", \"2027-05-06\", \"2027-05-08\", \"2027-05-17\", \"2027-07-14\", \"2027-08-15\", \"2027-11-01\", \"2027-11-11\", \"2027-12-25\"]) assert(joursFeries(2027).includes(j), \"férié \" + j);\nassert.strictEqual(isOuvrable(D(\"2027-01-17\")), false);\nassert.strictEqual(isOuvrable(D(\"2027-01-18\")), true);\nassert.strictEqual(isOuvrable(D(\"2027-05-17\")), false, \"lundi de Pentecôte 2027\");\nassert.strictEqual(isoDate(nextOuvrable(D(\"2027-01-17\"))), \"2027-01-18\");\nassert.strictEqual(isoDate(prevOuvrable(D(\"2027-01-17\"))), \"2027-01-15\");\nassert.strictEqual(isoDate(nextOuvrable(D(\"2027-05-17\"))), \"2027-05-18\");\nassert.strictEqual(isoDate(prevOuvrable(D(\"2026-12-27\"))), \"2026-12-24\");\nassert.strictEqual(isoDate(nextOuvrable(D(\"2026-12-25\"))), \"2026-12-28\");\nassert.strictEqual(diffDays(D(\"2026-11-18\"), D(\"2027-01-15\")), 58);\n\n// Défauts (hypothèses d'exemple)\nlet r = computeDeclaration(DEFAULTS);\nassert.strictEqual(r.finLabel, \"dimanche 17 janvier 2027\");\nassert.strictEqual(r.envoiLabel, \"vendredi 15 janvier 2027\");\nassert.strictEqual(isoDate(r.proroge), \"2027-01-18\");\nassert.strictEqual(r.montantLabel, \"16 848 € TTC\");\nassert.strictEqual(r.htCents, 1404000);\nassert.strictEqual(r.tvaCents, 280800);\nassert.strictEqual(r.ttcCents, 1684800);\nassert.strictEqual(r.aEchoir, true);\nassert.strictEqual(isoDate(r.releve), \"2027-05-17\");\nassert.strictEqual(isoDate(r.revendication), \"2027-02-17\");\nassert.strictEqual(isoDate(r.finOption), \"2026-12-19\");\nassert.strictEqual(r.resilie, false);\nassert.deepStrictEqual(r.controles.map((c) => c.statut), [\"info\", \"ok\", \"warn\", \"ok\", \"info\", \"ok\", \"ok\", \"warn\", \"info\", \"ok\"]);\nassert.strictEqual(r.nbOk, 5); assert.strictEqual(r.nbWarn, 2); assert.strictEqual(r.nbBad, 0); assert.strictEqual(r.nbInfo, 3);\nassert.strictEqual(r.etat, \"warn\");\nassert.strictEqual(r.verdict, \"Aucun point bloquant, 2 à compléter. Déclaration à envoyer au plus tard le vendredi 15 janvier 2027.\");\nassert(T(r, 2).includes(\"Il reste 58 jours\"));\nassert(T(r, 2).includes(\"article 642\"));\nassert(T(r, 3).includes(\"somme à échoir le samedi 14 novembre 2026\"));\nassert(T(r, 7).includes(\"samedi 19 décembre 2026\"));\nassert.strictEqual(r.actions.length, 3);\nassert(r.actions[0].startsWith(\"Envoyez la déclaration au mandataire judiciaire\"));\nassert(r.actions[2].startsWith(\"Classez dans le dossier\"));\nassert.strictEqual(r.declaration.split(\"\\n\").length, 13);\nassert(r.declaration.startsWith(\"Objet : Déclaration de créance, procédure de redressement judiciaire\"));\nassert(r.declaration.includes(\"Montant échu au jour du jugement : néant\"));\nassert(r.declaration.includes(\"Sommes à échoir : 16 848 € TTC (14 040 € HT et 2 808 € de TVA à 20 %), échéance le samedi 14 novembre 2026\"));\nassert(r.declaration.includes(\"montant total déclaré : 16 848 €.\"));\nassert(r.message.startsWith(\"Objet : Mise en demeure de prendre parti sur la poursuite du contrat (article L622-13, III)\"));\nassert.strictEqual(r.message.split(\"\\n\").length, 10);\nassert(r.message.includes(\"auprès du mandataire judiciaire\"));\nassert.strictEqual(r.recap.split(\"\\n\").length, 11);\nassert.strictEqual(r.recap.split(\"\\n\")[10], \"Calcul : quotebuilder.co/outils/\" + SLUG);\nassert(r.recap.includes(\"Relevé de forclusion : jusqu'au lundi 17 mai 2027\"));\n\n// Variantes\nr = run({ etatDeclaration: \"envoyee\", dateCalcul: \"2026-11-30\" }); assert.strictEqual(S(r, 2), \"ok\"); assert.strictEqual(r.envoiLabel, \"Envoyée le lundi 30 novembre 2026\"); assert.strictEqual(r.etat, \"warn\");\nr = run({ etatDeclaration: \"envoyee\", dateCalcul: \"2026-11-30\", contrat: \"termine\" }); assert.strictEqual(r.etat, \"ok\"); assert.strictEqual(r.verdict, \"Dossier en ordre : déclaration envoyée le lundi 30 novembre 2026.\"); assert.strictEqual(S(r, 7), \"info\");\nr = run({ dateCalcul: \"2027-01-18\" }); assert.strictEqual(S(r, 2), \"warn\"); assert(T(r, 2).includes(\"La date d'envoi conseillée est passée\"));\nr = run({ dateCalcul: \"2027-01-19\" }); assert.strictEqual(S(r, 2), \"bad\"); assert(T(r, 2).includes(\"lundi 17 mai 2027\")); assert(T(r, 2).includes(\"L622-26\")); assert(r.actions.some((a) => a.includes(\"relevé de forclusion\")));\nr = run({ dateCalcul: \"2027-06-01\" }); assert.strictEqual(S(r, 2), \"bad\"); assert(T(r, 2).includes(\"six mois est lui aussi expiré\"));\nr = run({ etatDeclaration: \"envoyee\", dateCalcul: \"2027-01-18\" }); assert.strictEqual(S(r, 2), \"warn\"); assert(T(r, 2).includes(\"article 642\"));\nr = run({ etatDeclaration: \"envoyee\", dateCalcul: \"2027-01-19\" }); assert.strictEqual(S(r, 2), \"bad\");\nr = run({ etatDeclaration: \"envoyee\", dateCalcul: \"2026-11-10\" }); assert.strictEqual(S(r, 2), \"warn\"); assert(T(r, 2).includes(\"avant la publication\"));\nr = run({ dateCalcul: \"2026-11-10\" }); assert.strictEqual(S(r, 2), \"warn\"); assert(T(r, 2).includes(\"préparez la déclaration\"));\nr = run({ dateCalcul: \"\" }); assert.strictEqual(S(r, 2), \"warn\");\nr = run({ domicile: \"autre\" }); assert.strictEqual(r.finLabel, \"mercredi 17 mars 2027\"); assert.strictEqual(r.nbMois, 4); assert(r.recap.includes(\"quatre mois\"));\nr = run({ datePublication: \"\" }); assert.strictEqual(S(r, 1), \"bad\"); assert.strictEqual(S(r, 2), \"bad\"); assert.strictEqual(r.finLabel, \"Non calculable\"); assert(r.verdict.includes(\"Délai non calculable\")); assert(r.actions[0].includes(\"BODACC\"));\nr = run({ datePublication: \"\", reserve: \"reserve\" }); assert.strictEqual(S(r, 8), \"bad\");\nr = run({ datePublication: \"2026-11-01\" }); assert.strictEqual(S(r, 1), \"warn\");\nr = run({ dateJugement: \"\" }); assert.strictEqual(S(r, 1), \"warn\"); assert.strictEqual(r.aEchoir, false);\nr = run({ surete: \"publiee\" }); assert.strictEqual(S(r, 1), \"warn\"); assert.strictEqual(r.finLabel, \"dimanche 17 janvier 2027\");\nr = run({ surete: \"publiee\", dateAvertissement: \"2026-12-01\" }); assert.strictEqual(S(r, 1), \"ok\"); assert.strictEqual(r.finLabel, \"lundi 1 février 2027\"); assert.strictEqual(isoDate(r.releve), \"2027-06-01\");\nr = run({ surete: \"publiee\", dateAvertissement: \"2026-11-10\" }); assert.strictEqual(r.finLabel, \"dimanche 17 janvier 2027\");\nr = run({ dejaPaye: \"30000\" }); assert.strictEqual(S(r, 3), \"warn\"); assert.strictEqual(r.excedentCents, 192000); assert.strictEqual(r.montantLabel, \"Rien à déclarer\"); assert(T(r, 3).includes(\"1 920 €\"));\nr = run({ montantExecute: \"0\", dejaPaye: \"0\" }); assert.strictEqual(S(r, 3), \"info\"); assert(r.declaration.includes(\"montant total déclaré : 0 €.\"));\nr = run({ penalites: \"120\" }); assert.strictEqual(r.montantLabel, \"16 968 € TTC\"); assert(r.declaration.includes(\"Pénalités et intérêts courus jusqu'au jugement : 120 €\"));\nr = run({ tva: \"0\" }); assert.strictEqual(r.montantLabel, \"14 040 € TTC\");\nr = run({ tva: \"5.5\" }); assert.strictEqual(r.tvaCents, 77220); assert.strictEqual(r.montantLabel, \"14 812,20 € TTC\");\nr = run({ tva: \"10\" }); assert.strictEqual(r.montantLabel, \"15 444 € TTC\");\nr = run({ dateEcheance: \"2026-11-01\" }); assert.strictEqual(r.aEchoir, false); assert(r.declaration.includes(\"Montant échu au jour du jugement : 16 848 € TTC\")); assert(r.declaration.includes(\"Sommes à échoir : néant\"));\nr = run({ posterieur: \"18720\" }); assert.strictEqual(S(r, 4), \"warn\"); assert(T(r, 4).includes(\"L622-17 IV\"));\nr = run({ posterieur: \"18720\", procedure: \"liquidation\" }); assert.strictEqual(isoDate(r.posterieurLimite), \"2027-05-17\"); assert(T(r, 4).includes(\"L641-13 III\"));\nr = run({ pieces: \"aucun\" }); assert.strictEqual(S(r, 5), \"bad\"); assert.strictEqual(r.etat, \"bad\"); assert(r.verdict.startsWith(\"1 point bloquant, 2 à compléter.\"));\nr = run({ pieces: \"partiel\" }); assert.strictEqual(S(r, 5), \"warn\");\nr = run({ signataire: \"sans_pouvoir\" }); assert.strictEqual(S(r, 6), \"bad\"); assert(r.declaration.includes(\"pouvoir du signataire\"));\nr = run({ signataire: \"prepose_pouvoir\" }); assert.strictEqual(S(r, 6), \"ok\"); assert(r.declaration.includes(\"muni du pouvoir joint\"));\nr = run({ contrat: \"termine\" }); assert.strictEqual(S(r, 7), \"info\"); assert(r.message.startsWith(\"Objet : Note interne\"));\nr = run({ reponse: \"poursuite\" }); assert.strictEqual(S(r, 7), \"ok\"); assert(T(r, 7).includes(\"au comptant\")); assert(T(r, 7).includes(\"L631-14\"));\nr = run({ reponse: \"poursuite\", procedure: \"sauvegarde\" }); assert(T(r, 7).includes(\"fixez par écrit\"));\nr = run({ reponse: \"poursuite\", procedure: \"liquidation\" }); assert(T(r, 7).includes(\"L641-11-1 II\"));\nr = run({ reponse: \"refus\" }); assert.strictEqual(S(r, 7), \"warn\"); assert.strictEqual(r.resilie, true); assert(r.actions.some((a) => a.includes(\"réception du refus\")));\nr = run({ dateCalcul: \"2026-12-21\" }); assert.strictEqual(r.resilie, true); assert.strictEqual(isoDate(r.limiteIndemnite), \"2027-01-19\"); assert(T(r, 7).includes(\"mardi 19 janvier 2027\")); assert(r.message.startsWith(\"Objet : Note interne\"));\nr = run({ dateMiseEnDemeure: \"\" }); assert.strictEqual(S(r, 7), \"warn\"); assert(T(r, 7).includes(\"mise en demeure de prendre parti à l'administrateur\")); assert(r.actions.some((a) => a.startsWith(\"Adressez à l'administrateur une mise en demeure\")));\nr = run({ administrateur: \"non\" }); assert(T(r, 0).includes(\"L627-2\")); assert(r.message.includes(\"au client, avec copie au mandataire judiciaire\"));\nr = run({ administrateur: \"non\", dateMiseEnDemeure: \"\" }); assert(T(r, 7).includes(\"appartient à votre client lui-même\"));\nr = run({ procedure: \"liquidation\" }); assert(T(r, 0).includes(\"liquidateur\")); assert(r.declaration.includes(\"Destinataire : [Nom], liquidateur\")); assert(r.message.includes(\"L641-11-1, III\")); assert(r.recap.startsWith(\"Procédure : liquidation judiciaire (liquidateur)\"));\nr = run({ procedure: \"sauvegarde\" }); assert(T(r, 0).startsWith(\"Sauvegarde\"));\nr = run({ reserve: \"reserve\" }); assert.strictEqual(S(r, 8), \"warn\"); assert(T(r, 8).includes(\"mercredi 17 février 2027\")); assert(r.message.startsWith(\"Objet : Mise en demeure\"));\nr = run({ reserve: \"reserve\", contrat: \"termine\" }); assert(r.message.startsWith(\"Objet : Demande en revendication\")); assert.strictEqual(r.message.split(\"\\n\").length, 10);\nr = run({ reserve: \"reserve\", dateCalcul: \"2027-02-18\" }); assert.strictEqual(S(r, 8), \"bad\");\nr = run({ demarche: \"relance\" }); assert.strictEqual(S(r, 9), \"bad\"); assert(T(r, 9).includes(\"L622-7 III\"));\nr = run({ demarche: \"injonction\" }); assert.strictEqual(S(r, 9), \"bad\"); assert(T(r, 9).includes(\"L622-21\"));\nr = run({ demarche: \"compensation\" }); assert.strictEqual(S(r, 9), \"warn\"); assert(T(r, 9).includes(\"connexes\"));\nr = run({ procedure: \"bidon\", tva: \"33\", montantExecute: \"x\" }); assert.strictEqual(r.input.procedure, \"redressement\"); assert.strictEqual(r.input.tva, \"20\"); assert.strictEqual(r.htCents, 0);\nr = computeDeclaration({}); assert.strictEqual(r.controles.length, 10);\nr = computeDeclaration(null); assert.strictEqual(r.controles.length, 10);\n\n")(tool, require, console);
console.log("seo-pm-20261118 ok");
