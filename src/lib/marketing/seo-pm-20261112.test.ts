import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_OUTILLAGE_SPECIFIQUE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./calculateur-amortissement-outillage-specifique";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "outillage-specifique-moule-propriete-amortissement-devis-b2b";
const BLOG_PATH = "/blog/outillage-specifique-moule-propriete-amortissement-devis-b2b";
const TOOL_PATH = "/outils/calculateur-amortissement-outillage-specifique";
const DAY = "2026-11-12";
const DAY_PATHS = ["/blog/outillage-specifique-moule-propriete-amortissement-devis-b2b", "/outils/calculateur-amortissement-outillage-specifique"];

assert.equal(BLOG_TOOL_OUTILLAGE_SPECIFIQUE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 45);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Calculateur d'amortissement d'un outillage spécifique");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "moule, matrice ou gabarit : prix par pièce, reste à amortir si les commandes s'arrêtent, douze points contrôlés, la clause et le message.");

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
assert.ok(outilsHub.includes("calculateur-amortissement-outillage-specifique"));
assert.ok(outilsHub.includes("Calculateur d'amortissement d'un outillage spécifique"));
{
  const start = outilsHub.indexOf("href: \"/outils/calculateur-amortissement-outillage-specifique\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 11123);
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

for (const rel of ["src/lib/marketing/calculateur-amortissement-outillage-specifique.ts","src/components/marketing/calculateur-amortissement-outillage-specifique-calculator.tsx","src/app/(marketing)/outils/calculateur-amortissement-outillage-specifique/page.tsx","src/content/blog/outillage-specifique-moule-propriete-amortissement-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, POINTS, computeOutillage, computeAmortissement, computePaliers, buildRecap, fmtEur, fmtCents, fmtMontant, fmtNb, fmtPct, num, dec } = X;\nconst run = (o) => computeOutillage({ ...DEFAULTS, ...o });\nconst C = (r, point) => r.controles.find((c) => c.point === point);\nconst S = (r, point) => C(r, point).statut;\nconst T = (r, point) => C(r, point).texte;\nconst NB = \"\\u00a0\";\n\n// Statique\nconst numIds = [\"coutOutillage\", \"participation\", \"quantiteAmortissement\", \"prixPiece\", \"quantiteLivree\", \"dureeConservation\"];\nconst selIds = [\"role\", \"mode\", \"propriete\", \"transfert\", \"marquage\", \"garde\", \"assurance\", \"entretien\", \"restitution\", \"retention\", \"arret\", \"plans\"];\nconst labelMap = {\n  role: \"ROLE_LABELS\", mode: \"MODE_LABELS\", propriete: \"PROPRIETE_LABELS\", transfert: \"TRANSFERT_LABELS\", marquage: \"MARQUAGE_LABELS\",\n  garde: \"GARDE_LABELS\", assurance: \"ASSURANCE_LABELS\", entretien: \"ENTRETIEN_LABELS\", restitution: \"RESTITUTION_LABELS\",\n  retention: \"RETENTION_LABELS\", arret: \"ARRET_LABELS\", plans: \"PLANS_LABELS\"\n};\nassert.strictEqual(Object.keys(DEFAULTS).length, 18);\nassert.strictEqual(numIds.length + selIds.length, 18);\n\n\n\n\n\nassert.strictEqual(X.SLUG, SLUG);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\nassert.deepStrictEqual(POINTS, [\"Coût et quantité\", \"Prise en charge\", \"Propriété de l'outillage\", \"Propriété et financement\", \"Moment du transfert\", \"Garde et conservation\", \"Assurance\", \"Entretien et usure\", \"Restitution\", \"Droit de rétention\", \"Arrêt avant la quantité prévue\", \"Plans et fichiers\"]);\nconst REFS = [\"1196\", \"1583\", \"1794\", \"1915\", \"1917\", \"1927\", \"1928\", \"1932\", \"1933\", \"1942\", \"1943\", \"1944\", \"1948\", \"2286\"];\n\n\n// Helpers\nassert.strictEqual(fmtEur(18000), \"18 000 €\");\nassert.strictEqual(fmtEur(0), \"0 €\");\nassert.strictEqual(fmtEur(1234567), \"1 234 567 €\");\nassert.strictEqual(fmtEur(-440), \"\\u2212440 €\");\nassert.strictEqual(fmtCents(60), \"0,60 €\");\nassert.strictEqual(fmtCents(300), \"3,00 €\");\nassert.strictEqual(fmtCents(5), \"0,05 €\");\nassert.strictEqual(fmtCents(123456789), \"1 234 567,89 €\");\nassert.strictEqual(fmtCents(-1205), \"\\u221212,05 €\");\nassert.strictEqual(fmtMontant(720000), \"7 200 €\");\nassert.strictEqual(fmtMontant(71356), \"713,56 €\");\nassert.strictEqual(fmtNb(20000), \"20 000\");\nassert.strictEqual(fmtNb(7), \"7\");\nassert.strictEqual(fmtPct(60), \"60\");\nassert.strictEqual(fmtPct(66.666), \"66,7\");\nassert.strictEqual(num(\"18 000\", 0, 1e9, 0), 18000);\nassert.strictEqual(num(\"18\" + NB + \"000\", 0, 1e9, 0), 18000);\nassert.strictEqual(num(\"18\\u202f000\", 0, 1e9, 0), 18000);\nassert.strictEqual(num(\"abc\", 0, 1e9, 7), 7);\nassert.strictEqual(num(\"-5\", 0, 1e9, 0), 0);\nassert.strictEqual(num(\"12.9\", 0, 1e9, 0), 12);\nassert.strictEqual(num(\"999\", 0, 600, 0), 600);\nassert.strictEqual(dec(\"2,4\", 0, 1e6, 0), 2.4);\nassert.strictEqual(dec(\"2,456\", 0, 1e6, 0), 2.46);\nassert.strictEqual(dec(\"\", 0, 1e6, 0), 0);\n\n// computeAmortissement\nassert.deepStrictEqual(computeAmortissement(12000, 20000, 8000), { amortCents: 60, recupere: 480000, reste: 720000, surplus: 0, restantes: 12000 });\nassert.deepStrictEqual(computeAmortissement(12000, 20000, 25000), { amortCents: 60, recupere: 1200000, reste: 0, surplus: 300000, restantes: 0 });\nassert.deepStrictEqual(computeAmortissement(999, 7, 2), { amortCents: 14272, recupere: 28544, reste: 71356, surplus: 0, restantes: 5 });\nassert.deepStrictEqual(computeAmortissement(10000, 3, 7), { amortCents: 333334, recupere: 1000000, reste: 0, surplus: 1333336, restantes: 0 });\nassert.deepStrictEqual(computeAmortissement(0, 20000, 8000), { amortCents: 0, recupere: 0, reste: 0, surplus: 0, restantes: 12000 });\nassert.deepStrictEqual(computeAmortissement(5000, 0, 8000), { amortCents: 0, recupere: 0, reste: 500000, surplus: 0, restantes: 0 });\n\n// Défauts (hypothèses d'exemple)\nconst d = run({});\nassert.deepStrictEqual(d.controles.map((c) => c.statut), [\"ok\", \"info\", \"ok\", \"ok\", \"ok\", \"ok\", \"warn\", \"ok\", \"ok\", \"info\", \"ok\", \"warn\"]);\nassert.strictEqual(d.nbOk, 8); assert.strictEqual(d.nbWarn, 2); assert.strictEqual(d.nbBad, 0); assert.strictEqual(d.nbInfo, 2);\nassert.strictEqual(d.etat, \"warn\");\nassert.strictEqual(d.participation, 6000); assert.strictEqual(d.partAmortie, 12000);\nassert.strictEqual(d.amortCents, 60); assert.strictEqual(d.prixCents, 240); assert.strictEqual(d.prixAvec, 300);\nassert.strictEqual(d.recupere, 480000); assert.strictEqual(d.reste, 720000); assert.strictEqual(d.paye, 1080000);\nassert.strictEqual(d.pctPaye, 60); assert.strictEqual(d.restantes, 12000); assert.strictEqual(d.surplus, 0);\nassert.strictEqual(d.prixLabel, \"3,00 €\"); assert.strictEqual(d.amortLabel, \"0,60 €\");\nassert.strictEqual(d.partLabel, \"6 000 € / 12 000 €\"); assert.strictEqual(d.resteLabel, \"7 200 €\"); assert.strictEqual(d.payeLabel, \"10 800 € (60 %)\");\nassert.strictEqual(d.verdict, \"Aucun point bloquant, 2 à compléter. Outillage de 18 000 € : 6 000 € facturés à part, 12 000 € amortis sur 20 000 pièces (0,60 € par pièce). Arrêt après 8 000 pièces : 7 200 € restent à amortir.\");\nassert.deepStrictEqual(d.paliers.map((p) => [p.pieces, p.recupere, p.reste, p.paye, Math.round(p.pct * 10) / 10, p.courant]), [\n  [5000, 300000, 900000, 900000, 50, false], [8000, 480000, 720000, 1080000, 60, true], [10000, 600000, 600000, 1200000, 66.7, false],\n  [15000, 900000, 300000, 1500000, 83.3, false], [20000, 1200000, 0, 1800000, 100, false]\n]);\nconst cl = d.clause.split(\"\\n\");\nassert.strictEqual(cl.length, 8);\nassert.strictEqual(cl[0], \"Article [X] : Outillage spécifique\");\nassert(cl[2].includes(\"[18 000 €]\") && cl[2].includes(\"[6 000 €]\") && cl[2].includes(\"[12 000 €]\") && cl[2].includes(\"[0,60 €]\") && cl[2].includes(\"[20 000]\") && cl[2].includes(\"[2,40 €]\"));\nassert(cl[3].includes(\"dès qu'il est entièrement payé\") && cl[3].includes(\"plaque à son nom\"));\nassert(cl[4].includes(\"sans frais\") && cl[4].includes(\"[36 mois]\") && cl[4].includes(\"[qui l'assure et contre quoi]\"));\nassert(cl[5].includes(\"[15] jours\") && !cl[5].includes(\"sous réserve du paiement\"));\nassert(cl[6].includes(\"reste non amorti\") && cl[6].includes(\"[0,60 €] par pièce non commandée\"));\nassert.strictEqual(cl[7], \"7. Plans et fichiers : [à qui ils appartiennent et s'ils sont remis].\");\nassert.deepStrictEqual(d.actions, [\n  \"Désignez qui assure l'outillage et contre quels risques, et demandez l'attestation.\",\n  \"Tranchez la question des plans et fichiers : remis au client, ou gardés par le fabricant.\",\n  \"Gardez la clause, le récapitulatif et la réponse écrite de l'autre partie dans le même dossier.\"\n]);\nassert(d.message.startsWith(\"Objet : outillage pour vos pièces [référence] : prix, propriété et garde\"));\nassert(d.message.includes(\"- Assurance\\n- Plans et fichiers\"));\nassert(d.message.includes(\"Garde : écrite, sans frais, 36 mois après la dernière commande.\"));\nassert(d.message.endsWith(\"Cordialement\"));\nconst rl = d.recap.split(\"\\n\");\nassert.strictEqual(rl.length, 11);\nassert.deepStrictEqual(rl, [\n  \"Récapitulatif outillage spécifique (indicatif)\",\n  \"Position : fabricant qui chiffre l'outillage\",\n  \"Outillage : 18 000 €, participation facturée à part, reste amorti\",\n  \"Facturé à part : 6 000 € ; amorti : 12 000 € sur 20 000 pièces\",\n  \"Prix par pièce : 2,40 € + 0,60 € = 3,00 €\",\n  \"Arrêt après 8 000 pièces : 4 800 € récupérés, 7 200 € restent à amortir\",\n  \"Payé par le client pour l'outillage à ce stade : 10 800 € (60 %)\",\n  \"Propriété : le client, quand l'outillage est entièrement payé ; marquage : plaque ou gravure au nom du propriétaire\",\n  \"Garde : écrite, sans frais, 36 mois ; assurance : rien d'écrit\",\n  \"Contrôles : 8 conformes, 2 à compléter, 0 bloquant, 2 informations\",\n  \"Calcul : quotebuilder.co/outils/\" + SLUG\n]);\nassert.strictEqual(buildRecap(d), d.recap);\nassert(T(d, \"Coût et quantité\").includes(\"2,40 € + 0,60 € = 3,00 €\"));\nassert(T(d, \"Droit de rétention\").includes(\"1948\") && T(d, \"Droit de rétention\").includes(\"2286\"));\nassert(T(d, \"Restitution\").includes(\"1932\") && T(d, \"Restitution\").includes(\"1933\"));\nassert(T(d, \"Moment du transfert\").includes(\"1196\"));\nassert(T(d, \"Garde et conservation\").includes(\"1927\"));\n\n// Mode facturé à part\nconst sep = run({ mode: \"separe\" });\nassert.strictEqual(sep.participation, 18000); assert.strictEqual(sep.partAmortie, 0); assert.strictEqual(sep.amortCents, 0);\nassert.strictEqual(sep.prixLabel, \"2,40 €\"); assert.strictEqual(sep.resteLabel, \"0 €\"); assert.strictEqual(sep.payeLabel, \"18 000 € (100 %)\");\nassert.strictEqual(S(sep, \"Prise en charge\"), \"info\"); assert.strictEqual(S(sep, \"Arrêt avant la quantité prévue\"), \"ok\");\nassert(sep.verdict.includes(\"Outillage de 18 000 € facturé à part, pièce à 2,40 €.\") && !sep.verdict.includes(\"Arrêt après\"));\nassert(sep.clause.includes(\"2. Prix : l'outillage est facturé à part, [18 000 €]\"));\nassert(sep.clause.includes(\"l'arrêt des commandes ne crée aucun reste à payer\"));\nassert.strictEqual(sep.paliers.length, 1);\nassert.strictEqual(S(run({ mode: \"separe\", arret: \"rien\" }), \"Arrêt avant la quantité prévue\"), \"ok\");\n\n// Mode amorti\nconst am = run({ mode: \"amorti\" });\nassert.strictEqual(am.partAmortie, 18000); assert.strictEqual(am.amortCents, 90); assert.strictEqual(am.prixLabel, \"3,30 €\");\nassert.strictEqual(am.reste, 1080000); assert.strictEqual(am.payeLabel, \"7 200 € (40 %)\");\nassert.strictEqual(am.verdict, \"Aucun point bloquant, 2 à compléter. Outillage de 18 000 € amorti sur 20 000 pièces (0,90 € par pièce). Arrêt après 8 000 pièces : 10 800 € restent à amortir.\");\nassert(am.clause.includes(\"2. Prix : le coût de l'outillage, [18 000 €], est amorti dans le prix des pièces, à raison de [0,90 €] par pièce sur [20 000] pièces\"));\nassert.strictEqual(S(am, \"Propriété et financement\"), \"ok\");\nconst amCmd = run({ mode: \"amorti\", transfert: \"commande\" });\nassert.strictEqual(S(amCmd, \"Propriété et financement\"), \"warn\");\nassert(T(amCmd, \"Propriété et financement\").includes(\"18 000 €\"));\nassert.strictEqual(S(run({ transfert: \"rien\" }), \"Propriété et financement\"), \"warn\");\nassert(T(run({ transfert: \"rien\" }), \"Propriété et financement\").includes(\"1196\"));\nassert.strictEqual(S(run({ transfert: \"rien\" }), \"Moment du transfert\"), \"warn\");\nassert.strictEqual(S(run({ mode: \"separe\", transfert: \"commande\" }), \"Propriété et financement\"), \"ok\");\n\n// Mixte incohérent\nconst mx0 = run({ participation: 0 });\nassert.strictEqual(S(mx0, \"Prise en charge\"), \"warn\"); assert(T(mx0, \"Prise en charge\").includes(\"entièrement amorti\"));\nconst mxAll = run({ participation: 18000 });\nassert.strictEqual(S(mxAll, \"Prise en charge\"), \"warn\"); assert(T(mxAll, \"Prise en charge\").includes(\"facturé à part\"));\nconst mxOver = run({ participation: 25000 });\nassert.strictEqual(S(mxOver, \"Coût et quantité\"), \"bad\"); assert(T(mxOver, \"Coût et quantité\").includes(\"25 000 €\"));\nassert.strictEqual(mxOver.participation, 18000); assert.strictEqual(mxOver.partAmortie, 0);\nassert(mxOver.verdict.startsWith(\"1 point bloquant (coût et quantité)\"));\n\n// Coût et quantité\nconst z = run({ coutOutillage: 0 });\nassert.strictEqual(S(z, \"Coût et quantité\"), \"bad\"); assert.strictEqual(z.etat, \"bad\"); assert(z.verdict.includes(\"Coût de l'outillage à saisir.\"));\nconst q0 = run({ quantiteAmortissement: 0 });\nassert.strictEqual(S(q0, \"Coût et quantité\"), \"bad\"); assert.strictEqual(q0.reste, 1200000); assert.strictEqual(q0.amortCents, 0);\nassert.strictEqual(S(q0, \"Arrêt avant la quantité prévue\"), \"ok\");\nassert.strictEqual(S(run({ quantiteAmortissement: 0, arret: \"rien\" }), \"Arrêt avant la quantité prévue\"), \"bad\");\nassert.strictEqual(S(run({ prixPiece: 0 }), \"Coût et quantité\"), \"bad\");\nassert.strictEqual(S(run({ mode: \"separe\", quantiteAmortissement: 0 }), \"Coût et quantité\"), \"ok\");\n\n// Propriété\nconst pr = run({ propriete: \"rien\" });\nassert.strictEqual(S(pr, \"Propriété de l'outillage\"), \"bad\"); assert.strictEqual(pr.etat, \"bad\");\nassert.strictEqual(S(pr, \"Propriété et financement\"), \"info\"); assert.strictEqual(S(pr, \"Moment du transfert\"), \"warn\"); assert.strictEqual(S(pr, \"Restitution\"), \"warn\");\nassert(pr.clause.includes(\"[client ou fabricant, à choisir]\"));\nassert(pr.message.includes(\"Propriété : à convenir ensemble.\"));\nassert(pr.verdict.startsWith(\"1 point bloquant (propriété de l'outillage), 4 à compléter.\"));\nassert.strictEqual(S(run({ marquage: \"non\" }), \"Propriété de l'outillage\"), \"warn\");\nconst fo = run({ propriete: \"fournisseur\" });\nassert.strictEqual(S(fo, \"Propriété et financement\"), \"info\"); assert.strictEqual(S(fo, \"Moment du transfert\"), \"info\");\nassert.strictEqual(S(fo, \"Restitution\"), \"info\"); assert.strictEqual(S(fo, \"Droit de rétention\"), \"info\");\nassert(fo.clause.includes(\"reste la propriété du fabricant\") && fo.clause.includes(\"sauf rachat\"));\nassert.strictEqual(S(run({ propriete: \"fournisseur\", mode: \"separe\" }), \"Propriété et financement\"), \"warn\");\nassert.strictEqual(S(run({ propriete: \"fournisseur\", mode: \"amorti\" }), \"Propriété et financement\"), \"ok\");\nassert.strictEqual(S(run({ propriete: \"fournisseur\", garde: \"rien\" }), \"Garde et conservation\"), \"info\");\n\n// Garde, assurance, entretien, restitution, rétention, plans\nassert.strictEqual(S(run({ garde: \"rien\" }), \"Garde et conservation\"), \"warn\");\nassert(T(run({ garde: \"rien\" }), \"Garde et conservation\").includes(\"1915\"));\nassert.strictEqual(S(run({ dureeConservation: 0 }), \"Garde et conservation\"), \"warn\");\nconst pay = run({ garde: \"payante\" });\nassert.strictEqual(S(pay, \"Garde et conservation\"), \"ok\"); assert(T(pay, \"Garde et conservation\").includes(\"1928\") && T(pay, \"Garde et conservation\").includes(\"1917\"));\nassert(pay.clause.includes(\"moyennant [montant] € par [mois]\"));\nassert(run({ garde: \"rien\" }).clause.includes(\"4. Garde : [lieu, durée de conservation\"));\nassert(run({ dureeConservation: 0 }).clause.includes(\"pendant [durée]\"));\nassert.strictEqual(S(run({ assurance: \"fabricant\" }), \"Assurance\"), \"ok\");\nassert(run({ assurance: \"fabricant\" }).clause.includes(\"l'assure contre l'incendie\"));\nassert.strictEqual(S(run({ entretien: \"rien\" }), \"Entretien et usure\"), \"warn\");\nassert.strictEqual(S(run({ entretien: \"client\" }), \"Entretien et usure\"), \"ok\");\nconst rs = run({ restitution: \"rien\" });\nassert.strictEqual(S(rs, \"Restitution\"), \"warn\"); assert(T(rs, \"Restitution\").includes(\"1944\") && T(rs, \"Restitution\").includes(\"1943\") && T(rs, \"Restitution\").includes(\"1942\"));\nconst rt = run({ retention: \"clause\" });\nassert.strictEqual(S(rt, \"Droit de rétention\"), \"ok\"); assert(rt.clause.includes(\"sous réserve du paiement de toutes les sommes dues\"));\nassert.strictEqual(S(run({ plans: \"client\" }), \"Plans et fichiers\"), \"ok\");\nassert(run({ plans: \"fabricant\" }).clause.includes(\"restent à lui et ne sont pas remis\"));\n\n// Arrêt anticipé\nconst ar = run({ arret: \"rien\" });\nassert.strictEqual(S(ar, \"Arrêt avant la quantité prévue\"), \"bad\"); assert(T(ar, \"Arrêt avant la quantité prévue\").includes(\"7 200 €\") && T(ar, \"Arrêt avant la quantité prévue\").includes(\"1794\"));\nassert(ar.verdict.startsWith(\"1 point bloquant (arrêt avant la quantité prévue), 2 à compléter.\"));\nconst full = run({ quantiteLivree: 25000 });\nassert.strictEqual(full.reste, 0); assert.strictEqual(full.surplus, 300000);\nassert(T(full, \"Arrêt avant la quantité prévue\").includes(\"3 000 €\"));\nassert(full.verdict.endsWith(\"Après 25 000 pièces, plus rien à amortir.\"));\nassert.strictEqual(S(run({ quantiteLivree: 25000, arret: \"rien\" }), \"Arrêt avant la quantité prévue\"), \"warn\");\nassert.strictEqual(full.paliers.length, 5); assert(full.paliers[4].courant && full.paliers[4].pieces === 25000);\nconst odd = run({ mode: \"amorti\", coutOutillage: 999, quantiteAmortissement: 7, prixPiece: \"1,99\", quantiteLivree: 2 });\nassert.strictEqual(odd.amortCents, 14272); assert.strictEqual(odd.prixLabel, \"144,71 €\"); assert.strictEqual(odd.resteLabel, \"713,56 €\");\nassert.strictEqual(odd.payeLabel, \"285,44 € (28,6 %)\");\n\n// Rôle client\nconst cli = run({ role: \"client\" });\nassert(cli.message.startsWith(\"Objet : outillage pour nos pièces [référence] : propriété, garde et restitution\"));\nassert(cli.message.includes(\"Avant d'accepter votre devis\"));\nassert(cli.message.includes(\"Pouvez-vous compléter le devis sur ces points :\\n- Assurance\\n- Plans et fichiers\"));\nconst okAll = run({ role: \"client\", assurance: \"fabricant\", plans: \"client\", retention: \"clause\" });\nassert.strictEqual(okAll.etat, \"ok\"); assert.strictEqual(okAll.verdict.startsWith(\"Aucun point bloquant, rien à compléter.\"), true);\nassert(okAll.message.includes(\"Ces points nous conviennent\"));\nassert.strictEqual(okAll.actions.length, 1);\nconst okF = run({ assurance: \"fabricant\", plans: \"fabricant\" });\nassert(okF.message.includes(\"nous lançons la fabrication de l'outillage dès votre accord écrit\"));\n\n// Saisies invalides\nconst inv = computeOutillage({ role: \"x\", mode: \"y\", coutOutillage: \"abc\", participation: null, quantiteAmortissement: undefined, prixPiece: \"\", quantiteLivree: \"-3\", dureeConservation: \"z\" });\nassert.strictEqual(inv.role, \"fournisseur\"); assert.strictEqual(inv.mode, \"mixte\"); assert.strictEqual(inv.cout, 0); assert.strictEqual(inv.etat, \"bad\");\nconst inv2 = computeOutillage({});\nassert.strictEqual(inv2.controles.length, 12);\nconst sp = run({ coutOutillage: \"18 000\", participation: \"6\" + NB + \"000\", quantiteAmortissement: \"20\\u202f000\", prixPiece: \"2,40\" });\nassert.strictEqual(sp.verdict, d.verdict);\n\n// computePaliers\nconst pal = computePaliers(18000, 6000, 12000, 20000, 5000);\nassert.strictEqual(pal.length, 4); assert.strictEqual(pal.filter((p) => p.courant).length, 1);\nassert.deepStrictEqual(computePaliers(0, 0, 0, 0, 0).map((p) => p.pieces), [0]);\n\n")(tool, require, console);
console.log("seo-pm-20261112 ok");
