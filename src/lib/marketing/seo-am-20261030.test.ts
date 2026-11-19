import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_AVENANT, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import * as tool from "./calculateur-avenant-travaux-supplementaires";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";


const require = createRequire(process.cwd() + "/package.json");
const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "travaux-supplementaires-avenant-devis-b2b";
const BLOG_PATH = "/blog/travaux-supplementaires-avenant-devis-b2b";
const TOOL_PATH = "/outils/calculateur-avenant-travaux-supplementaires";
const DAY = "2026-10-30";
const DAY_PATHS = ["/blog/travaux-supplementaires-avenant-devis-b2b", "/secteurs/funnel-devis-securite-incendie-extincteurs", "/outils/calculateur-avenant-travaux-supplementaires"];

assert.equal(BLOG_TOOL_AVENANT, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 26);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, "Calculateur d'avenant et de travaux supplémentaires");
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue","relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, "Ligne par ligne, ce qui est sécurisé, à régulariser ou à risque, le nouveau total et un projet d'avenant à faire signer.");

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === "/secteurs/funnel-devis-securite-incendie-extincteurs")?.priority, 0.8);

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
assert.ok(outilsHub.includes("calculateur-avenant-travaux-supplementaires"));
assert.ok(outilsHub.includes("Calculateur d'avenant et de travaux supplémentaires"));
{
  const start = outilsHub.indexOf("href: \"/outils/calculateur-avenant-travaux-supplementaires\"");
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes("/secteurs/funnel-devis-securite-incendie-extincteurs"));
assert.ok(secteursHub.includes("Sécurité incendie et extincteurs"));


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
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 6141);
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
  const sectorRaw = readFileSync(join(blogDir, "funnel-devis-securite-incendie-extincteurs.md"), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const sectorPage = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-securite-incendie-extincteurs/page.tsx"), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  for (const item of faqFromMarkdown(sectorBody)) {
    assert.ok(sectorPage.includes(JSON.stringify(item.q)), item.q);
    assert.ok(sectorPage.includes(JSON.stringify(item.a)), item.a.slice(0, 80));
  }
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 5612);
  assertNoDashes(sectorRaw, "sector md");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(sectorPage.includes("Sécurité incendie et extincteurs"));
  for (const needle of [

  ]) assert.ok(sectorBody.includes(needle) || sectorPage.includes(needle), "sector missing " + needle);
}

for (const rel of ["src/lib/marketing/calculateur-avenant-travaux-supplementaires.ts","src/components/marketing/calculateur-avenant-travaux-supplementaires-calculator.tsx","src/app/(marketing)/outils/calculateur-avenant-travaux-supplementaires/page.tsx","src/content/blog/travaux-supplementaires-avenant-devis-b2b.md","src/content/blog/funnel-devis-securite-incendie-extincteurs.md","src/app/(marketing)/secteurs/funnel-devis-securite-incendie-extincteurs/page.tsx"]) {
  assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);
}
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);


new Function("__mod", "require", "console", "const assert = require(\"assert\");\nconst fs = { readFileSync() { return \"\"; } };\nconst path = require(\"path\");\nconst { MAX_LIGNES, TYPE_LABELS, ACCORD_LABELS, ETAT_LABELS, STATUT_LABELS, DEFAULTS, computeAvenant, buildRecap, buildAvenant, classer, action, num, fmtEur, fmtTaux, propre } = __mod;\nconst NB = \"\\u00a0\";\nconst run = (o) => computeAvenant({ ...DEFAULTS, ...o });\nconst vide = { l1: \"\", m1: 0, l2: \"\", m2: 0, l3: \"\", m3: 0, l4: \"\", m4: 0, l5: \"\", m5: 0 };\n\n// Fichier\nconst esc = (s) => String(s).replace(/&/g, \"&amp;\").replace(/\"/g, \"&quot;\").replace(/'/g, \"&#x27;\").replace(/</g, \"&lt;\");\n\n\n\n\nassert.strictEqual(MAX_LIGNES, 5);\nassert.deepStrictEqual(Object.keys(TYPE_LABELS), [\"forfait\", \"forfaitAutre\", \"unitaires\"]);\nassert.deepStrictEqual(Object.keys(ACCORD_LABELS), [\"ecritPrix\", \"apres\", \"ecritSansPrix\", \"oral\", \"aucun\"]);\nassert.deepStrictEqual(Object.keys(ETAT_LABELS), [\"fait\", \"afaire\"]);\nassert.deepStrictEqual(STATUT_LABELS, { ok: \"Sécurisé\", warn: \"À régulariser\", bad: \"À risque\" });\nassert.deepStrictEqual(DEFAULTS, {\n  typeMarche: \"forfait\", ref: \"D-2026-118\", montantInitial: 48000, seuilSignal: 20,\n  l1: \"Renfort de dalle sous rayonnage\", m1: 3200, a1: \"ecritPrix\", e1: \"fait\",\n  l2: \"Six prises supplémentaires au bureau\", m2: 1450, a2: \"oral\", e2: \"fait\",\n  l3: \"Cloison vitrée supplémentaire\", m3: 6800, a3: \"ecritSansPrix\", e3: \"afaire\",\n  l4: \"Reprise d'enduit découverte au démontage\", m4: 2100, a4: \"aucun\", e4: \"fait\",\n  l5: \"\", m5: 0, a5: \"ecritPrix\", e5: \"afaire\",\n});\n\n// Formats\nassert.strictEqual(fmtEur(48000), `48${NB}000${NB}€`);\nassert.strictEqual(fmtEur(61550), `61${NB}550${NB}€`);\nassert.strictEqual(fmtEur(1450.5), `1${NB}450,50${NB}€`);\nassert.strictEqual(fmtEur(0.07), `0,07${NB}€`);\nassert.strictEqual(fmtEur(0), `0${NB}€`);\nassert.strictEqual(fmtEur(-3550), `-3${NB}550${NB}€`);\nassert.strictEqual(fmtEur(null), \"n/a\");\nassert.strictEqual(fmtEur(Infinity), \"n/a\");\nassert.strictEqual(fmtTaux(28.229), `28,2${NB}%`);\nassert.strictEqual(fmtTaux(20), `20${NB}%`);\nassert.strictEqual(fmtTaux(null), \"n/a\");\nassert.strictEqual(num(\"\", 0, 100, 7), 7);\nassert.strictEqual(num(\"150\", 0, 100, 0), 100);\nassert.strictEqual(num(\"-3\", 0, null, 0), 0);\nassert.strictEqual(num(\"12,5\", 0, null, 0), 12.5);\nassert.strictEqual(num(\"abc\", 0, null, 4), 4);\nassert.strictEqual(propre(\"  a   b  \"), \"a b\");\nassert.strictEqual(propre(null), \"\");\nassert.strictEqual(propre(\"x\".repeat(200)).length, 120);\n\n// Classement : forfait de construction (article 1793)\nconst T = [\"forfait\", \"forfaitAutre\", \"unitaires\"];\nfor (const t of T) for (const e of [\"fait\", \"afaire\"]) {\n  assert.strictEqual(classer(t, \"ecritPrix\", e), \"ok\", `${t} ecritPrix ${e}`);\n  assert.strictEqual(classer(t, \"apres\", e), \"ok\", `${t} apres ${e}`);\n}\nassert.strictEqual(classer(\"forfait\", \"ecritSansPrix\", \"fait\"), \"bad\");\nassert.strictEqual(classer(\"forfait\", \"oral\", \"fait\"), \"bad\");\nassert.strictEqual(classer(\"forfait\", \"aucun\", \"fait\"), \"bad\");\nassert.strictEqual(classer(\"forfait\", \"ecritSansPrix\", \"afaire\"), \"warn\");\nassert.strictEqual(classer(\"forfait\", \"oral\", \"afaire\"), \"warn\");\nassert.strictEqual(classer(\"forfait\", \"aucun\", \"afaire\"), \"warn\");\n// Hors construction d'un bâtiment\nassert.strictEqual(classer(\"forfaitAutre\", \"ecritSansPrix\", \"fait\"), \"warn\");\nassert.strictEqual(classer(\"forfaitAutre\", \"oral\", \"fait\"), \"warn\");\nassert.strictEqual(classer(\"forfaitAutre\", \"aucun\", \"fait\"), \"bad\");\nassert.strictEqual(classer(\"forfaitAutre\", \"aucun\", \"afaire\"), \"warn\");\n// Prix unitaires\nassert.strictEqual(classer(\"unitaires\", \"ecritSansPrix\", \"fait\"), \"ok\");\nassert.strictEqual(classer(\"unitaires\", \"ecritSansPrix\", \"afaire\"), \"ok\");\nassert.strictEqual(classer(\"unitaires\", \"oral\", \"fait\"), \"warn\");\nassert.strictEqual(classer(\"unitaires\", \"aucun\", \"fait\"), \"bad\");\nassert.strictEqual(classer(\"unitaires\", \"oral\", \"afaire\"), \"warn\");\n\n// Actions\nassert.match(action(\"forfait\", \"ecritPrix\", \"fait\", \"ok\"), /Rien à faire/);\nassert.match(action(\"forfait\", \"apres\", \"fait\", \"ok\"), /acceptation/);\nassert.match(action(\"unitaires\", \"ecritSansPrix\", \"fait\", \"ok\"), /bordereau/);\nassert.match(action(\"forfait\", \"oral\", \"afaire\", \"warn\"), /Ne pas commencer/);\nassert.match(action(\"forfait\", \"ecritSansPrix\", \"afaire\", \"warn\"), /Chiffrer/);\nassert.match(action(\"forfait\", \"aucun\", \"fait\", \"bad\"), /risque de ne pas être payé/);\nassert.match(action(\"forfaitAutre\", \"aucun\", \"fait\", \"bad\"), /Aucune commande prouvée/);\nassert.match(action(\"forfaitAutre\", \"oral\", \"fait\", \"warn\"), /confirmer par écrit/);\nassert.match(action(\"forfaitAutre\", \"ecritSansPrix\", \"fait\", \"warn\"), /pas le prix/);\n\n// Cas par défaut\nconst r = run({});\nassert.strictEqual(r.type, \"forfait\");\nassert.strictEqual(r.ref, \"D-2026-118\");\nassert.strictEqual(r.initial, 48000);\nassert.strictEqual(r.lignes.length, 4, \"ligne 5 vide ignorée\");\nassert.deepStrictEqual(r.lignes.map((l) => l.statut), [\"ok\", \"bad\", \"warn\", \"bad\"]);\nassert.deepStrictEqual(r.lignes.map((l) => l.n), [1, 2, 3, 4]);\nassert.strictEqual(r.totalSupp, 13550);\nassert.strictEqual(r.totalOk, 3200);\nassert.strictEqual(r.totalWarn, 6800);\nassert.strictEqual(r.totalBad, 3550);\nassert.strictEqual(r.totalOk + r.totalWarn + r.totalBad, r.totalSupp);\nassert.deepStrictEqual(r.nb, { ok: 1, warn: 1, bad: 2 });\nassert.strictEqual(r.nouveau, 61550);\nassert.strictEqual(r.securise, 51200);\nassert.strictEqual(Math.round(r.ecartPct * 100) / 100, 28.23);\nassert.strictEqual(Math.round(r.ecartOkPct * 100) / 100, 6.67);\nassert.strictEqual(r.signal, true);\nassert.strictEqual(r.etat, \"bad\");\nassert.strictEqual(r.verdict, `3${NB}550${NB}€ HT de travaux déjà réalisés sont à risque : ni accord écrit avec prix avant les travaux, ni acceptation expresse après coup.`);\nassert(r.conseils.some((c) => c.includes(\"article 1793\") && c.includes(\"22-10.393\")), \"conseil 1793\");\nassert(r.conseils.some((c) => c.includes(\"16-25.262\")), \"conseil information insuffisante\");\nassert(r.conseils.some((c) => c.includes(\"02-13.875\") && c.includes(\"28,2\")), \"conseil bouleversement\");\nassert(r.conseils.some((c) => c.includes(\"R2194-1\")), \"conseil public\");\nassert(r.conseils.some((c) => c.startsWith(\"2 lignes sont\")), \"pluriel bad\");\nassert(r.conseils.some((c) => c.startsWith(\"1 ligne est\")), \"singulier warn\");\n\n// Avenant et récapitulatif\nconst av = r.avenant.split(\"\\n\");\nassert.strictEqual(av[0], \"Projet d'avenant au devis D-2026-118\");\nassert.strictEqual(av[1], `Montant initial du devis : 48${NB}000${NB}€ HT`);\nassert.strictEqual(av[3], `1. Renfort de dalle sous rayonnage : 3${NB}200${NB}€ HT (déjà accepté)`);\nassert.strictEqual(av[4], `2. Six prises supplémentaires au bureau : 1${NB}450${NB}€ HT`);\nassert(r.avenant.includes(`Total des travaux supplémentaires : 13${NB}550${NB}€ HT`));\nassert(r.avenant.includes(`Nouveau montant : 61${NB}550${NB}€ HT`));\nassert(r.avenant.includes(\"accepte leur prix\"));\nassert(r.avenant.includes(\"signature du client\"));\nassert.strictEqual(buildAvenant({}), r.avenant);\nassert.strictEqual(buildRecap({}), r.recap);\nassert(r.recap.startsWith(\"Devis D-2026-118 · Forfait de construction d'un bâtiment\"));\nassert(r.recap.includes(`Sécurisé : 3${NB}200${NB}€ HT · à régulariser : 6${NB}800${NB}€ HT · à risque : 3${NB}550${NB}€ HT`));\nassert(r.recap.includes(`(écart 28,2${NB}%)`));\nassert(r.recap.includes(`(écart 6,7${NB}%)`));\nassert(r.recap.includes(\"pas un conseil juridique\"));\nassert.strictEqual(r.recap.split(\"\\n\").length, 6 + 4 + 1);\n\n// Même saisie, autre type de marché\nconst r2 = run({ typeMarche: \"forfaitAutre\" });\nassert.deepStrictEqual(r2.lignes.map((l) => l.statut), [\"ok\", \"warn\", \"warn\", \"bad\"]);\nassert.strictEqual(r2.totalBad, 2100);\nassert.strictEqual(r2.totalWarn, 8250);\nassert.strictEqual(r2.totalOk, 3200);\nassert(r2.conseils.some((c) => c.includes(\"98-10.276\") && c.includes(\"L110-3\")));\nassert(!r2.conseils.some((c) => c.includes(\"22-10.393\")));\nconst r3 = run({ typeMarche: \"unitaires\" });\nassert.deepStrictEqual(r3.lignes.map((l) => l.statut), [\"ok\", \"warn\", \"ok\", \"bad\"]);\nassert.strictEqual(r3.totalOk, 10000);\nassert.strictEqual(r3.securise, 58000);\nassert(r3.conseils.some((c) => c.includes(\"bordereau\")));\nconst rx = run({ typeMarche: \"inconnu\" });\nassert.strictEqual(rx.type, \"forfait\", \"type inconnu ramené au défaut\");\n\n// Tout régularisé\nconst rok = run({ a2: \"ecritPrix\", a3: \"ecritPrix\", a4: \"apres\" });\nassert.strictEqual(rok.etat, \"ok\");\nassert.strictEqual(rok.totalOk, 13550);\nassert.strictEqual(rok.securise, rok.nouveau);\nassert.strictEqual(rok.verdict, `Toutes les lignes ont un accord exploitable : 13${NB}550${NB}€ HT sécurisés.`);\nassert(!rok.conseils.some((c) => c.includes(\"à risque\")));\n// Seulement à régulariser\nconst rw = run({ a2: \"ecritPrix\", a4: \"ecritPrix\" });\nassert.strictEqual(rw.etat, \"warn\");\nassert.strictEqual(rw.totalWarn, 6800);\nassert(rw.verdict.startsWith(`6${NB}800${NB}€ HT sont à régulariser`));\n// Aucune ligne\nconst r0 = run(vide);\nassert.strictEqual(r0.etat, \"neutral\");\nassert.strictEqual(r0.lignes.length, 0);\nassert.strictEqual(r0.totalSupp, 0);\nassert.strictEqual(r0.nouveau, 48000);\nassert.strictEqual(r0.ecartPct, 0);\nassert.strictEqual(r0.signal, false);\nassert(r0.avenant.includes(\"(aucune ligne)\"));\n// Seuil\nassert.strictEqual(run({ seuilSignal: 30 }).signal, false);\nassert.strictEqual(run({ seuilSignal: 28 }).signal, true);\nassert.strictEqual(run({ seuilSignal: 0 }).signal, false, \"seuil 0 : pas d'alerte\");\nassert(!run({ seuilSignal: 30 }).conseils.some((c) => c.includes(\"02-13.875\")));\n// Montant initial nul\nconst ri = run({ montantInitial: 0 });\nassert.strictEqual(ri.ecartPct, null);\nassert.strictEqual(ri.signal, false);\nassert(ri.conseils.some((c) => c.includes(\"Montant initial à 0\")));\nassert(ri.recap.includes(\"(écart n/a)\"));\n// Saisies invalides\nconst rn = run({ m1: \"-500\", montantInitial: \"abc\" });\nassert.strictEqual(rn.lignes[0].montant, 0);\nassert.strictEqual(rn.initial, 0);\nconst rl = run({ ...vide, l2: \"\", m2: 900, a2: \"zzz\", e2: \"zzz\" });\nassert.strictEqual(rl.lignes.length, 1);\nassert.strictEqual(rl.lignes[0].libelle, \"Ligne 2\");\nassert.strictEqual(rl.lignes[0].accord, \"aucun\");\nassert.strictEqual(rl.lignes[0].etat, \"fait\");\nassert.strictEqual(rl.lignes[0].statut, \"bad\");\nconst rlib = run({ ...vide, l5: \"Libellé seul\" });\nassert.strictEqual(rlib.lignes.length, 1, \"libellé sans montant gardé\");\nassert.strictEqual(rlib.lignes[0].montant, 0);\nconst rcts = run({ ...vide, m1: 0.1, l1: \"a\", m2: 0.2, l2: \"b\", a1: \"ecritPrix\", a2: \"ecritPrix\" });\nassert.strictEqual(rcts.totalOk, 0.3, \"arrondi aux centimes\");\nassert.strictEqual(run({ ref: \"   \" }).ref, \"sans référence\");\nassert(run({ ref: \"<b>x</b>\" }).avenant.includes(\"<b>x</b>\"), \"texte brut, rendu en textContent\");\n\n")(tool, require, console);
console.log("seo-am-20261030 ok");
