import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_LIMITATION_RESPONSABILITE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./verificateur-clause-limitation-responsabilite";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "clause-limitation-responsabilite-devis-b2b";
const BLOG_PATH = "/blog/clause-limitation-responsabilite-devis-b2b";
const TOOL_PATH = "/outils/verificateur-clause-limitation-responsabilite";
const DAY = "2026-11-03";
const DAY_PATHS = ["/blog/clause-limitation-responsabilite-devis-b2b", "/outils/verificateur-clause-limitation-responsabilite"];

assert.equal(BLOG_TOOL_LIMITATION_RESPONSABILITE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 31);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Vérificateur de clause de limitation de responsabilité");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Plafond, préjudices exclus, faute lourde, acceptation des CGV et délai pour agir : douze points contrôlés, ce que la clause laisse payer sur un sinistre type, et la clause à écrire.");

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
assert.ok(outilsHub.includes("verificateur-clause-limitation-responsabilite"));
assert.ok(outilsHub.includes("Vérificateur de clause de limitation de responsabilité"));
{
  const start = outilsHub.indexOf("href: \"/outils/verificateur-clause-limitation-responsabilite\"");
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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 7480);
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

for (const rel of ["src/lib/marketing/verificateur-clause-limitation-responsabilite.ts","src/components/marketing/verificateur-clause-limitation-responsabilite-calculator.tsx","src/app/(marketing)/outils/verificateur-clause-limitation-responsabilite/page.tsx","src/content/blog/clause-limitation-responsabilite-devis-b2b.md"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst SLUG = __mod.SLUG;\nconst X = __mod;\nconst { DEFAULTS, STATUT_LABELS, computeLimitation, buildRecap, plafondDe, fmtEur, fmtPct } = X;\nconst NB = \"\\u00a0\";\nconst E = (n) => fmtEur(n);\nconst run = (o) => computeLimitation({ ...DEFAULTS, ...o });\nconst S = (r, point) => r.controles.find((c) => c.point.startsWith(point)).statut;\nconst T = (r, point) => r.controles.find((c) => c.point.startsWith(point)).texte;\n\n// Fichier\nconst numIds = [\"montant\", \"plafondPct\", \"plafondFixe\", \"assurance\", \"delaiMois\", \"dommageDirect\", \"pertesExploitation\"];\nconst selIds = [\"role\", \"client\", \"prestation\", \"plafondType\", \"exclusions\", \"fauteLourde\", \"obligationEssentielle\", \"personnes\", \"acceptation\", \"cgvClient\", \"negociation\", \"delaiDepart\", \"faute\"];\nassert.strictEqual(Object.keys(DEFAULTS).length, 20);\nassert.strictEqual(numIds.length + selIds.length, 20);\n\n\n\nconst labelMap = { role: \"ROLE_LABELS\", client: \"CLIENT_LABELS\", prestation: \"PRESTATION_LABELS\", plafondType: \"PLAFOND_LABELS\", exclusions: \"EXCLUSIONS_LABELS\", fauteLourde: \"FAUTE_LOURDE_LABELS\", obligationEssentielle: \"OBLIGATION_LABELS\", personnes: \"PERSONNES_LABELS\", acceptation: \"ACCEPTATION_LABELS\", cgvClient: \"CGV_CLIENT_LABELS\", negociation: \"NEGOCIATION_LABELS\", delaiDepart: \"DEPART_LABELS\", faute: \"FAUTE_LABELS\" };\n\n\n\nassert.strictEqual(X.SEUIL_REPERE_PCT, 10);\nassert.strictEqual(X.DELAI_MIN_MOIS, 12);\nassert.strictEqual(X.DELAI_MAX_MOIS, 120);\nassert.strictEqual(X.PRESCRIPTION_ANS, 5);\nassert.strictEqual(X.SLUG, SLUG);\nassert.deepStrictEqual(Object.keys(STATUT_LABELS), [\"ok\", \"warn\", \"bad\", \"info\"]);\n\n// Formats\nassert.strictEqual(fmtEur(24000), \"24\" + NB + \"000\" + NB + \"€\");\nassert.strictEqual(fmtEur(0), \"0\" + NB + \"€\");\nassert.strictEqual(fmtEur(1234567), \"1\" + NB + \"234\" + NB + \"567\" + NB + \"€\");\nassert.strictEqual(fmtEur(999.6), \"1\" + NB + \"000\" + NB + \"€\");\nassert.strictEqual(fmtPct(1), \"100\" + NB + \"%\");\nassert.strictEqual(fmtPct(0.0417), \"4,2\" + NB + \"%\");\nassert.strictEqual(plafondDe(\"pct\", 24000, 50, 0, 0), 12000);\nassert.strictEqual(plafondDe(\"fixe\", 24000, 50, 7000, 0), 7000);\nassert.strictEqual(plafondDe(\"assurance\", 24000, 50, 7000, 300000), 300000);\nassert.strictEqual(plafondDe(\"aucun\", 24000, 50, 7000, 300000), null);\nassert.strictEqual(plafondDe(\"exclusionTotale\", 24000, 50, 7000, 300000), 0);\n\n// Cas par défaut (exemple de l'article)\nconst r = computeLimitation({});\nassert.strictEqual(r.controles.length, 12);\nassert.strictEqual(r.nbBad, 0);\nassert.strictEqual(r.nbWarn, 1);\nassert.strictEqual(r.nbInfo, 2);\nassert.strictEqual(r.nbOk, 9);\nassert.strictEqual(r.etat, \"warn\");\nassert.strictEqual(r.statutLabel, \"À compléter\");\nassert.strictEqual(r.plafond, 24000);\nassert.strictEqual(r.ratio, 1);\nassert.strictEqual(r.plafondLabel, E(24000) + \" (100\" + NB + \"% du prix)\");\nassert.strictEqual(r.total, 60000);\nassert.strictEqual(r.exclus, 0);\nassert.strictEqual(r.base, 60000);\nassert.strictEqual(r.indemnisation, 24000);\nassert.strictEqual(r.siIndirect, 18000);\nassert.strictEqual(r.horsAssurance, 0);\nassert.strictEqual(r.resteClient, 36000);\nassert.strictEqual(r.ecartee, false);\nassert.strictEqual(S(r, \"Préjudices exclus\"), \"warn\");\nassert.strictEqual(S(r, \"Faute lourde\"), \"info\");\nassert.strictEqual(S(r, \"Contrat d'adhésion\"), \"info\");\nassert.strictEqual(S(r, \"Délai\"), \"ok\");\nassert.strictEqual(r.verdict, \"Aucun point bloquant, mais 1 point à compléter avant la signature. Sur le sinistre type : \" + E(24000) + \" à payer au lieu de \" + E(60000) + \" réclamés.\");\nassert.strictEqual(r.lignes.length, 8);\nassert(r.clause.startsWith(\"Responsabilité\\n1. \"));\nassert.strictEqual(r.clause.split(\"\\n\").length, 8);\nassert(r.clause.includes(\"limitée à \" + E(24000) + \", soit 100\" + NB + \"% du prix du devis\"));\nassert(r.clause.includes(\"faute lourde ou dolosive\"));\nassert(r.clause.includes(\"12 mois à compter du jour où le client a connu ou aurait dû connaître les faits\"));\nassert(r.clause.includes(\"prévaut sur toute clause contraire des conditions générales d'achat du client\"));\nassert(r.clause.includes(\"tient compte de cette répartition des risques\"));\nassert.strictEqual(r.actions.length, 2);\nassert(r.message.startsWith(\"Bonjour,\\n\\nVous trouverez ci-joint notre devis de \" + E(24000)));\nassert(r.recap.endsWith(\"Calcul : quotebuilder.co/outils/\" + SLUG));\nassert.strictEqual(r.recap.split(\"\\n\").length, 12);\nassert(r.recap.includes(\"Statut : À compléter (0 bloquant, 1 à compléter, 9 conformes, 2 pour information)\"));\nassert.strictEqual(buildRecap({}), r.recap);\n\n// Exclusions\nconst rl = run({ exclusions: \"liste\" });\nassert.strictEqual(rl.etat, \"ok\");\nassert.strictEqual(rl.exclus, 42000);\nassert.strictEqual(rl.base, 18000);\nassert.strictEqual(rl.indemnisation, 18000);\nassert.strictEqual(rl.siIndirect, null);\nassert.strictEqual(rl.lignes.length, 7);\nassert(rl.verdict.startsWith(\"Clause solide sur les douze points vérifiés.\"));\nconst ra = run({ exclusions: \"aucune\" });\nassert.strictEqual(S(ra, \"Préjudices exclus\"), \"info\");\nassert(!ra.clause.includes(\"Sont exclues\"));\nassert.strictEqual(ra.indemnisation, 24000);\n\n// Faute lourde dans le sinistre\nconst rf = run({ faute: \"lourde\" });\nassert.strictEqual(rf.ecartee, true);\nassert.strictEqual(rf.indemnisation, 60000);\nassert.strictEqual(rf.plafondApplique, null);\nassert.strictEqual(rf.resteClient, 0);\nassert(rf.verdict.includes(\"la limitation ne jouerait pas (faute lourde ou dolosive) : jusqu'à \" + E(60000) + \" réclamables, à prouver.\"));\nassert.strictEqual(run({ faute: \"lourde\", exclusions: \"liste\" }).indemnisation, 60000);\nassert.strictEqual(S(run({ fauteLourde: \"couverte\" }), \"Faute lourde\"), \"warn\");\nassert.strictEqual(S(run({ fauteLourde: \"reserve\" }), \"Faute lourde\"), \"ok\");\n\n// Client consommateur\nconst rc = run({ client: \"consommateur\" });\nassert.strictEqual(S(rc, \"Client professionnel\"), \"bad\");\nassert.strictEqual(rc.etat, \"bad\");\nassert.strictEqual(rc.ecartee, true);\nassert.strictEqual(rc.indemnisation, 60000);\nassert(rc.clause.startsWith(\"Client consommateur : pas de clause\"));\nassert(T(rc, \"Client professionnel\").includes(\"R. 212-1, 6°\"));\nassert(rc.message.includes(\"ses limites techniques\"));\nassert(rc.verdict.startsWith(\"1 point bloquant\"));\n\n// Acceptation et conditions d'achat\nassert.strictEqual(S(run({ acceptation: \"signe\" }), \"Acceptation\"), \"ok\");\nassert.strictEqual(S(run({ acceptation: \"cgvVerso\" }), \"Acceptation\"), \"warn\");\nconst rn = run({ acceptation: \"aucune\" });\nassert.strictEqual(S(rn, \"Acceptation\"), \"bad\");\nassert.strictEqual(rn.ecartee, true);\nconst rcg = run({ cgvClient: \"contraire\" });\nassert.strictEqual(S(rcg, \"Conditions d'achat\"), \"bad\");\nassert(T(rcg, \"Conditions d'achat\").includes(\"alinéa 2\"));\nassert.strictEqual(rcg.ecartee, true);\nconst rcs = run({ cgvClient: \"contraire\", acceptation: \"signe\" });\nassert.strictEqual(S(rcs, \"Conditions d'achat\"), \"info\");\nassert(T(rcs, \"Conditions d'achat\").includes(\"alinéa 3\"));\nassert.strictEqual(rcs.ecartee, false);\nassert.strictEqual(rcs.indemnisation, 24000);\n\n// Plafonds\nconst rx = run({ plafondType: \"exclusionTotale\" });\nassert.strictEqual(S(rx, \"Plafond chiffré\"), \"bad\");\nassert.strictEqual(S(rx, \"Niveau du plafond\"), \"info\");\nassert.strictEqual(S(rx, \"Assurance\"), \"info\");\nassert.strictEqual(rx.ecartee, true);\nassert.strictEqual(rx.indemnisation, 60000);\nassert(rx.clause.includes(\"limitée au prix du devis, soit \" + E(24000)));\nassert.strictEqual(rx.plafondLabel, \"0\" + NB + \"€ (aucune responsabilité)\");\nconst r0 = run({ plafondType: \"aucun\" });\nassert.strictEqual(S(r0, \"Plafond chiffré\"), \"info\");\nassert.strictEqual(S(r0, \"Niveau du plafond\"), \"info\");\nassert.strictEqual(r0.indemnisation, 60000);\nassert.strictEqual(run({ plafondType: \"aucun\", exclusions: \"liste\" }).indemnisation, 18000);\nassert.strictEqual(r0.plafondLabel, \"aucun\");\nconst r5 = run({ plafondPct: 5 });\nassert.strictEqual(r5.plafond, 1200);\nassert.strictEqual(S(r5, \"Niveau du plafond\"), \"warn\");\nassert(T(r5, \"Niveau du plafond\").includes(\"repère de cet outil et non seuil légal\"));\nassert.strictEqual(S(r5, \"Contrat d'adhésion\"), \"warn\");\nassert.strictEqual(r5.indemnisation, 1200);\nassert.strictEqual(S(run({ plafondPct: 10 }), \"Niveau du plafond\"), \"info\");\nassert.strictEqual(S(run({ plafondPct: 50 }), \"Niveau du plafond\"), \"info\");\nassert.strictEqual(S(run({ plafondPct: 50, negociation: \"negociee\" }), \"Contrat d'adhésion\"), \"ok\");\nassert.strictEqual(S(run({ plafondPct: 200 }), \"Niveau du plafond\"), \"ok\");\nconst rfx = run({ plafondType: \"fixe\" });\nassert.strictEqual(rfx.plafond, 10000);\nassert.strictEqual(rfx.indemnisation, 10000);\nassert.strictEqual(rfx.siIndirect, 10000);\nassert(rfx.clause.includes(\"limitée à \" + E(10000) + \".\"));\nconst ras = run({ plafondType: \"assurance\" });\nassert.strictEqual(ras.plafond, 500000);\nassert.strictEqual(ras.indemnisation, 60000);\nassert(ras.clause.includes(\"montant garanti par son assurance\"));\nassert.strictEqual(S(run({ montant: 0 }), \"Niveau du plafond\"), \"info\");\n\n// Engagement principal, personnes\nconst rv = run({ obligationEssentielle: \"videe\" });\nassert.strictEqual(S(rv, \"Engagement principal\"), \"bad\");\nassert(T(rv, \"Engagement principal\").includes(\"93-18.632\"));\nassert.strictEqual(rv.ecartee, true);\nassert.strictEqual(S(run({ personnes: \"inclus\" }), \"Dommages aux personnes\"), \"bad\");\nassert.strictEqual(S(run({ personnes: \"inclus\", prestation: \"vente\" }), \"Dommages aux personnes\"), \"bad\");\nassert.strictEqual(S(run({ personnes: \"inclus\", prestation: \"service\" }), \"Dommages aux personnes\"), \"info\");\nassert.strictEqual(S(run({ prestation: \"service\" }), \"Dommages aux personnes\"), \"ok\");\nassert.strictEqual(run({ personnes: \"inclus\" }).ecartee, false);\n\n// Délai\nassert.strictEqual(S(run({ delaiMois: 0 }), \"Délai\"), \"info\");\nassert(T(run({ delaiMois: 0 }), \"Délai\").includes(\"5 ans\"));\nassert.strictEqual(S(run({ delaiMois: 6 }), \"Délai\"), \"bad\");\nassert.strictEqual(S(run({ delaiMois: 11 }), \"Délai\"), \"bad\");\nassert.strictEqual(S(run({ delaiMois: 120 }), \"Délai\"), \"ok\");\nassert.strictEqual(S(run({ delaiMois: 121 }), \"Délai\"), \"bad\");\nconst rd = run({ delaiDepart: \"fait\" });\nassert.strictEqual(S(rd, \"Délai\"), \"bad\");\nassert(T(rd, \"Délai\").includes(\"22-12.345\"));\nassert.strictEqual(S(run({ delaiDepart: \"fait\", delaiMois: 24 }), \"Délai\"), \"warn\");\nassert(run({ delaiMois: 6 }).clause.includes(\"par 12 mois\"));\nassert(run({ delaiMois: 200 }).clause.includes(\"par 120 mois\"));\nassert(!run({ delaiMois: 0 }).clause.includes(\"se prescrit\"));\n\n// Assurance\nconst rA = run({ assurance: 10000 });\nassert.strictEqual(S(rA, \"Assurance\"), \"warn\");\nassert.strictEqual(rA.horsAssurance, 14000);\nassert(T(rA, \"Assurance\").includes(E(14000)));\nassert.strictEqual(S(run({ assurance: 0 }), \"Assurance\"), \"warn\");\nassert.strictEqual(S(run({ plafondType: \"aucun\" }), \"Assurance\"), \"info\");\nassert.strictEqual(S(run({ assurance: 24000 }), \"Assurance\"), \"ok\");\n\n// Position client\nconst rcl = run({ role: \"client\" });\nassert(rcl.message.includes(\"Avant de signer votre devis de \" + E(24000)));\nassert(rcl.message.includes(\"- Préjudices exclus : à compléter\"));\nconst rclOk = run({ role: \"client\", exclusions: \"liste\" });\nassert(rclOk.message.includes(\"elle nous convient\"));\nassert(rcl.recap.includes(\"Position : client qui relit la clause\"));\n\n// Saisies invalides\nconst ri = computeLimitation({ montant: \"abc\", plafondPct: -5, delaiMois: \"1e9\", dommageDirect: \"18 000\", pertesExploitation: \"4,2e4\", role: \"x\", plafondType: \"zz\", exclusions: null });\nassert.strictEqual(ri.montant, 0);\nassert.strictEqual(ri.pct, 0);\nassert.strictEqual(ri.delaiMois, 240);\nassert.strictEqual(ri.total, 18000 + 42000);\nassert.strictEqual(ri.role, \"prestataire\");\nassert.strictEqual(ri.plafondType, \"aucun\");\nassert.strictEqual(ri.exclusions, \"aucune\");\nassert.strictEqual(computeLimitation({ exclusions: \"zz\" }).exclusions, \"aucune\");\nassert.strictEqual(computeLimitation({ dommageDirect: -100 }).total, 42000);\n\n")(tool, require, console);
console.log("seo-pm-20261103 ok");
