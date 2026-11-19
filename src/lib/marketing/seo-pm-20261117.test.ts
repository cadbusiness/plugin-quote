import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_POUVOIR_SIGNATAIRE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-pouvoir-signataire-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "pouvoir-signataire-devis-delegation-mandat-apparent-b2b";
const BLOG_PATH = "/blog/pouvoir-signataire-devis-delegation-mandat-apparent-b2b";
const TOOL_PATH = "/outils/verificateur-pouvoir-signataire-devis";
const DAY = "2026-11-17";
const DAY_PATHS = ["/blog/pouvoir-signataire-devis-delegation-mandat-apparent-b2b", "/outils/verificateur-pouvoir-signataire-devis"];

assert.equal(BLOG_TOOL_POUVOIR_SIGNATAIRE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 40);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur du pouvoir du signataire");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "gérant, président, salarié ou maître d'œuvre : le pouvoir de signer, la délégation, la confirmation de l'article 1158, la clause et le message.");

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
assert.ok(outilsHub.includes("verificateur-pouvoir-signataire-devis"));
assert.ok(outilsHub.includes("Vérificateur du pouvoir du signataire"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-pouvoir-signataire-devis\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 8078);
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

for (const rel of ["src/lib/marketing/verificateur-pouvoir-signataire-devis.ts","src/components/marketing/verificateur-pouvoir-signataire-devis-calculator.tsx","src/app/(marketing)/outils/verificateur-pouvoir-signataire-devis/page.tsx","src/content/blog/pouvoir-signataire-devis-delegation-mandat-apparent-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, POINTS, LABEL_SETS, STATUT_LABELS, NIVEAU_LABELS, REP_LEGAL, TITRE, FORME_LABELS, computePouvoir, normalize, fmtEur, fmtDate, parseDate, isoDate, addDays, diffDays, dec, num } = X;\nconst run = (o) => computePouvoir({ ...DEFAULTS, ...o });\nconst S = (r, i) => r.controles[i].statut;\nconst T = (r, i) => r.controles[i].texte;\n\n// Statique\nassert.strictEqual(X.SLUG, SLUG);\nassert.strictEqual(Object.keys(DEFAULTS).length, 12);\nassert.strictEqual(POINTS.length, 10);\nassert.deepStrictEqual(Object.keys(REP_LEGAL).sort(), Object.keys(FORME_LABELS).sort());\nassert.deepStrictEqual(Object.keys(TITRE).sort(), Object.keys(FORME_LABELS).sort());\nconst numIds = [\"montant\", \"plafond\", \"delai\"];\nconst dateIds = [\"dateDemande\", \"dateDebut\"];\nconst selIds = Object.keys(LABEL_SETS);\nassert.strictEqual(selIds.length, 7);\nassert.strictEqual(numIds.length + dateIds.length + selIds.length, 12);\n\n\n\n\n\n\n\n// Utilitaires\nassert.strictEqual(fmtEur(3860000), \"38 600 €\");\nassert.strictEqual(fmtEur(2500000), \"25 000 €\");\nassert.strictEqual(fmtEur(4550), \"45,50 €\");\nassert.strictEqual(fmtEur(4505), \"45,05 €\");\nassert.strictEqual(fmtEur(123456789), \"1 234 567,89 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(dec(\"38 600\", 1e8), 3860000); assert.strictEqual(dec(\"1\\u00a0000,5\", 1e8), 100050); assert.strictEqual(dec(\"-1\", 1e8), 0); assert.strictEqual(dec(\"x\", 1e8), 0);\nassert.strictEqual(num(\"10\", 365), 10); assert.strictEqual(num(\"7,9\", 365), 7); assert.strictEqual(num(\"-3\", 365), 0); assert.strictEqual(num(\"9999\", 365), 365); assert.strictEqual(num(\"\", 365), 0);\nassert.strictEqual(parseDate(\"2026-02-30\"), null); assert.strictEqual(parseDate(\"\"), null); assert.strictEqual(parseDate(\"20/11/2026\"), null);\nassert.strictEqual(isoDate(parseDate(\"2028-02-29\")), \"2028-02-29\");\nassert.strictEqual(isoDate(addDays(parseDate(\"2026-11-20\"), 10)), \"2026-11-30\");\nassert.strictEqual(isoDate(addDays(parseDate(\"2026-12-28\"), 10)), \"2027-01-07\");\nassert.strictEqual(diffDays(parseDate(\"2026-11-20\"), parseDate(\"2026-12-07\")), 17);\nassert.strictEqual(fmtDate(parseDate(\"2026-11-17\")), \"mardi 17 novembre 2026\");\nassert.strictEqual(fmtDate(parseDate(\"2026-11-20\")), \"vendredi 20 novembre 2026\");\nassert.strictEqual(fmtDate(parseDate(\"2026-11-30\")), \"lundi 30 novembre 2026\");\nassert.strictEqual(fmtDate(parseDate(\"2026-12-07\")), \"lundi 7 décembre 2026\");\nassert.strictEqual(fmtDate(null), \"[date]\");\nassert.strictEqual(normalize({}).forme, \"sas\");\nassert.strictEqual(normalize({ qualite: \"pirate\" }).qualite, \"salarie_annonce\");\n\n// Défauts : SAS de logistique, responsable d'entrepôt, demande envoyée au président\nconst d = computePouvoir(DEFAULTS);\nassert.deepStrictEqual(d.controles.map((c) => c.statut), [\"info\", \"warn\", \"ok\", \"warn\", \"info\", \"warn\", \"warn\", \"info\", \"info\", \"info\"]);\nassert.deepStrictEqual([d.nbOk, d.nbWarn, d.nbBad, d.nbInfo], [1, 4, 0, 5]);\nassert.strictEqual(d.etat, \"warn\");\nassert.strictEqual(d.niveauLabel, \"À sécuriser\");\nassert.strictEqual(d.engageLabel, \"Incertain (article 1156)\");\nassert.strictEqual(d.echeanceLabel, \"lundi 30 novembre 2026\");\nassert.strictEqual(d.verdict, \"Aucun point bloquant, 4 à compléter. Signataire : à sécuriser avant de lancer la commande.\");\nassert.strictEqual(d.actions.length, 4);\nassert(d.actions.some((a) => a.includes(\"avant le lundi 30 novembre 2026\")));\nassert.strictEqual(d.clause.split(\"\\n\").length, 8);\nassert.strictEqual(d.clause.split(\"\\n\")[0], \"Article [X] : Signature et pouvoir du signataire\");\nassert(d.clause.includes(\"38 600 € hors taxes\"));\nassert(d.clause.includes(\"article 1158 du code civil\"));\nassert.strictEqual(d.recap.split(\"\\n\").length, 11);\nassert.strictEqual(d.recap.split(\"\\n\")[10], \"Calcul : quotebuilder.co/outils/\" + SLUG);\nassert(d.recap.includes(\"demande envoyée le vendredi 20 novembre 2026, délai 10 jours, fin le lundi 30 novembre 2026\"));\nassert(d.recap.includes(\"Points : 0 bloquant, 4 à compléter, 1 conforme, 5 informations\"));\nassert(d.message.startsWith(\"Objet : Confirmation du pouvoir de signature\"));\nassert(d.message.includes(\"au plus tard le lundi 30 novembre 2026\"));\nassert(d.message.includes(\"sera réputé habilité à conclure cet acte (article 1158 du code civil)\"));\nassert(T(d, 0).includes(\"L227-6\"));\nassert(T(d, 6).includes(\"lundi 30 novembre 2026\"));\n\n// Cas\nlet r = run({ confirmation: \"confirme\" });\nassert.strictEqual(r.etabli, true); assert.strictEqual(S(r, 1), \"ok\"); assert.strictEqual(S(r, 3), \"ok\"); assert.strictEqual(S(r, 5), \"info\"); assert.strictEqual(S(r, 6), \"ok\");\nassert.strictEqual(r.etat, \"ok\"); assert.strictEqual(r.engageLabel, \"La société cliente\"); assert.strictEqual(r.echeanceLabel, \"Pas de demande en cours\");\nassert.strictEqual(r.verdict, \"Aucun point bloquant ni à compléter. Signataire : pouvoir établi pour ce devis.\");\nassert(r.message.includes(\"Nous avons bien reçu votre confirmation\"));\nr = run({ dateDebut: \"2026-11-27\" });\nassert.strictEqual(S(r, 6), \"bad\"); assert.strictEqual(r.etat, \"bad\"); assert(T(r, 6).includes(\"vendredi 27 novembre 2026\"));\nassert.strictEqual(r.verdict, \"1 point bloquant : le pouvoir du signataire n'est pas établi. Ne lancez rien avant une délégation écrite ou une confirmation du représentant légal.\");\nr = run({ dateDebut: \"2026-11-30\" }); assert.strictEqual(S(r, 6), \"warn\");\nr = run({ dateDebut: \"\" }); assert.strictEqual(S(r, 6), \"warn\"); assert(T(r, 6).includes(\"date de démarrage\")); assert(r.actions.some((a) => a.includes(\"date prévue\"))); assert(r.recap.includes(\"Démarrage prévu : [date]\"));\nr = run({ delai: \"0\" }); assert.strictEqual(S(r, 7), \"bad\"); assert.strictEqual(r.echeanceLabel, \"vendredi 20 novembre 2026\");\nr = run({ dateDemande: \"\" }); assert.strictEqual(S(r, 6), \"warn\"); assert.strictEqual(r.echeanceLabel, \"[date d'envoi manquante]\"); assert(r.message.includes(\"[date de réponse]\"));\nr = run({ confirmation: \"aucune\" }); assert.strictEqual(S(r, 6), \"warn\"); assert(r.actions.some((a) => a.includes(\"demande de confirmation ci-dessous\"))); assert.strictEqual(r.echeanceLabel, \"Pas de demande en cours\");\nr = run({ qualite: \"dirigeant\" });\nassert.strictEqual(r.legal, true); assert.strictEqual(r.etabli, true); assert.strictEqual(r.etat, \"ok\"); assert.strictEqual(S(r, 1), \"ok\"); assert.strictEqual(S(r, 3), \"info\"); assert.strictEqual(S(r, 6), \"info\");\nassert(T(r, 4).includes(\"inopposables aux tiers\")); assert(r.clause.includes(\"Il est inscrit comme président\")); assert(r.message.startsWith(\"Objet : Acceptation de notre devis\"));\nassert(r.recap.includes(\"Confirmation : sans objet (représentant légal)\")); assert.strictEqual(r.echeanceLabel, \"Pas de demande en cours\");\nr = run({ qualite: \"dirigeant\", forme: \"sarl\" }); assert(r.clause.includes(\"comme gérant\")); assert(T(r, 0).includes(\"L223-18\"));\nr = run({ qualite: \"dirigeant\", forme: \"sa\" }); assert(T(r, 0).includes(\"L225-56\"));\nr = run({ qualite: \"dirigeant\", registre: \"non_verifie\" }); assert.strictEqual(S(r, 1), \"warn\"); assert.strictEqual(S(r, 2), \"warn\"); assert.strictEqual(r.etabli, false); assert(r.message.includes(\"justificatif d'immatriculation\"));\nr = run({ qualite: \"dirigeant\", registre: \"discordant\" }); assert.strictEqual(S(r, 1), \"bad\"); assert.strictEqual(S(r, 2), \"bad\"); assert(T(r, 2).includes(\"L123-9\"));\nr = run({ qualite: \"dirigeant\", forme: \"association\" }); assert.strictEqual(S(r, 4), \"warn\"); assert(r.actions.some((a) => a.includes(\"statuts\"))); assert.strictEqual(r.engageLabel, \"L'association cliente\");\nr = run({ qualite: \"dirigeant\", forme: \"ei\" }); assert.strictEqual(r.etat, \"ok\"); assert.strictEqual(r.engageLabel, \"L'entrepreneur\");\nr = run({ forme: \"public\", qualite: \"dirigeant\" }); assert.strictEqual(S(r, 0), \"warn\"); assert.strictEqual(r.etat, \"warn\"); assert(r.actions.some((a) => a.includes(\"acheteur public\")));\nr = run({ qualite: \"dg_statutaire\" }); assert.strictEqual(r.legal, true); assert(r.clause.includes(\"directeur général ou directeur général délégué\"));\nr = run({ qualite: \"dg_statutaire\", forme: \"sarl\" }); assert.strictEqual(r.legal, false); assert.strictEqual(S(r, 1), \"warn\"); assert.strictEqual(S(r, 3), \"warn\");\nr = run({ qualite: \"salarie_ecrite\", confirmation: \"aucune\" }); assert.strictEqual(r.etabli, true); assert.strictEqual(S(r, 3), \"ok\"); assert(T(r, 3).includes(\"1155\")); assert.strictEqual(S(r, 6), \"info\"); assert.strictEqual(r.etat, \"ok\");\nr = run({ qualite: \"salarie_ecrite\", confirmation: \"aucune\", plafond: \"25000\" }); assert.strictEqual(r.depasse, true); assert.strictEqual(S(r, 1), \"bad\"); assert.strictEqual(S(r, 3), \"bad\");\nassert(T(r, 3).includes(\"38 600 €\") && T(r, 3).includes(\"25 000 €\")); assert(r.actions.some((a) => a.includes(\"couvre 38 600 €\")));\nr = run({ qualite: \"salarie_ecrite\", confirmation: \"aucune\", plafond: \"50000\" }); assert.strictEqual(r.depasse, false); assert.strictEqual(S(r, 3), \"ok\"); assert(r.recap.includes(\"plafond écrit : 50 000 €\"));\nr = run({ qualite: \"salarie_ecrite\", plafond: \"25000\", confirmation: \"confirme\" }); assert.strictEqual(r.etabli, true); assert.strictEqual(S(r, 1), \"ok\"); assert.strictEqual(S(r, 3), \"ok\");\nr = run({ qualite: \"salarie_aucune\", confirmation: \"aucune\" }); assert.strictEqual(S(r, 1), \"bad\"); assert.strictEqual(S(r, 3), \"bad\"); assert(T(r, 3).includes(\"1156\"));\nr = run({ qualite: \"inconnu\", apparence: \"faible\", confirmation: \"aucune\" }); assert.strictEqual(S(r, 5), \"bad\"); assert.strictEqual(r.nbBad, 3);\nr = run({ apparence: \"forte\", historique: \"precedent_paye\" }); assert.strictEqual(S(r, 5), \"warn\"); assert(T(r, 5).includes(\"comportement du client\"));\nr = run({ acompte: \"verse_societe\" }); assert.strictEqual(S(r, 8), \"ok\"); assert(T(r, 8).includes(\"1998\"));\nr = run({ acompte: \"verse_societe\", qualite: \"dirigeant\" }); assert.strictEqual(S(r, 8), \"info\");\nr = run({ acompte: \"aucun\" }); assert(r.clause.includes(\"Les factures sont réglées\"));\nr = run({ montant: \"0\" }); assert.strictEqual(S(r, 4), \"warn\"); assert(r.actions.some((a) => a.includes(\"montant\")));\nr = run({ qualite: \"mandataire_sans\", confirmation: \"aucune\" }); assert.strictEqual(S(r, 1), \"bad\");\nr = run({ qualite: \"mandataire_ecrit\", confirmation: \"aucune\" }); assert.strictEqual(r.etat, \"ok\");\nr = run({ confirmation: \"confirme\", registre: \"discordant\" }); assert.strictEqual(r.etabli, false); assert.strictEqual(r.etat, \"bad\"); assert.strictEqual(S(r, 2), \"bad\");\n\n")(tool, require, console);
console.log("seo-pm-20261117 ok");
