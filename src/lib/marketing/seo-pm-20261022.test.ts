import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_ESCOMPTE,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  DEFAULTS,
  PALIERS_TABLE,
  buildRecap,
  computeEscompte,
  escompteMaximum,
  fmtEur,
  fmtJours,
  fmtPct,
  mentionFacture,
  tauxAnnuelCompose,
  tauxAnnuelSimple,
  type EscompteInput,
} from "./calculateur-escompte-paiement-anticipe";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "clause-reserve-propriete-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const TOOL_PATH = "/outils/calculateur-escompte-paiement-anticipe";
const DAY = "2026-10-22";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_ESCOMPTE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Clause de réserve de propriété dans un devis B2B : quand elle protège, comment l'écrire, ce qu'elle ne couvre pas",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Vous livrez avant d'être payé : la clause de réserve de propriété vous garde propriétaire jusqu'au paiement complet. Ce que disent les articles 2367 à 2372 du Code civil et L624-16 du Code de commerce, pourquoi elle doit être acceptée par écrit au plus tard à la livraison (la facture ne suffit pas), le délai de trois mois en cas de procédure collective, les biens incorporés ou revendus, un exemple chiffré, un modèle de clause et ce que QuoteBuilder fait, ou pas.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisDetail);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 15);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)),
);
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
for (const item of BLOG_FAQ[BLOG_SLUG] ?? []) {
  assert.doesNotMatch(item.q, EM_DASH);
  assert.doesNotMatch(item.q, EN_DASH);
  assert.doesNotMatch(item.a, EM_DASH);
  assert.doesNotMatch(item.a, EN_DASH);
}

assert.equal(BLOG_POSTS.length, 66);
assert.equal(BLOG_TOOLS.length, 56);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Calculateur d'escompte pour paiement anticipé");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["catalogue", "relances"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Escompte pour paiement anticipé : montant, taux annuel équivalent, comparaison avec votre coût de financement et mention à porter sur la facture.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-six outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-six outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(56), outilsHubIntro());
assert.equal(outilsHubIntro(53), "Cinquante-trois outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

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
assert.match(
  llms,
  /Clause de réserve de propriété dans un devis B2B : quand elle protège, comment l'écrire, ce qu'elle ne couvre pas : https:\/\/www\.quotebuilder\.co\/blog\/clause-reserve-propriete-devis-b2b/,
);
assert.match(
  llms,
  /Calculateur d'escompte pour paiement anticipé : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-escompte-paiement-anticipe/,
);
const llmsLines = llms.split("\n");
const blogLine = llmsLines.findIndex((line) => line.includes(BLOG_PATH));
const toolLine = llmsLines.findIndex((line) => line.includes(TOOL_PATH));
const tarifsLine = llmsLines.findIndex((line) => line.includes("https://www.quotebuilder.co/tarifs"));
assert.ok(blogLine > tarifsLine, "article llms avec les articles");
assert.ok(toolLine > blogLine, "outil llms avec les outils");

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /calculateur-escompte-paiement-anticipe/);
assert.match(outilsHub, /Calculateur d'escompte pour paiement anticipé/);
assert.match(outilsHub, /calculateur d'escompte pour paiement anticipé/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-escompte-paiement-anticipe"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 320), /eyebrow: "Pilotage"/);
}

function faqQuestionCount(body: string) {
  const marker = "\n## FAQ\n";
  const start = body.indexOf(marker);
  assert.ok(start >= 0, "FAQ heading missing");
  const after = body.slice(start + marker.length);
  const next = after.search(/\n## [^#]/);
  const section = next === -1 ? after : after.slice(0, next);
  return section.split("\n").filter((line) => line.startsWith("### ")).length;
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
    .map((part) => {
      const nl = part.indexOf("\n");
      return {
        q: part.slice(0, nl).trim(),
        a: part
          .slice(nl + 1)
          .trim()
          .replace(/\s+/g, " "),
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

function close(actual: number | null, expected: number, eps = 1e-4) {
  assert.ok(actual != null, `expected ${expected}, got null`);
  assert.ok(Math.abs(actual - expected) < eps, `${actual} != ${expected}`);
}

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(
    blogBody.startsWith(
      "# Clause de réserve de propriété dans un devis B2B : quand elle protège, comment l'écrire, ce qu'elle ne couvre pas",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  const frontTitle = blogRaw.match(/^title: "(.*)"$/m)?.[1];
  const frontDescription = blogRaw.match(/^description: "(.*)"$/m)?.[1];
  assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title, frontTitle);
  assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description, frontDescription);
  for (const needle of [
    "2367",
    "2368",
    "2369",
    "2370",
    "2371",
    "2372",
    "1196",
    "1119",
    "L624-9",
    "L624-16",
    "L624-18",
    "L441-9",
    "20-11.003",
    "exemple à adapter",
    "non contractuel",
    "Gagné",
    "/outils/calculateur-escompte-paiement-anticipe",
    "/blog/conditions-paiement-penalites-retard-devis-b2b",
  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assertNoDashes(blogRaw, "reserve md");
  assertNoDashes(blogBody, "reserve body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 3519);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "reserve");
}

const pdf = readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8");
assert.match(pdf, /Document indicatif, non contractuel/);

const addedSources = [
  "src/lib/marketing/calculateur-escompte-paiement-anticipe.ts",
  "src/lib/marketing/seo-pm-20261022.test.ts",
  "src/components/marketing/calculateur-escompte-paiement-anticipe-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-escompte-paiement-anticipe/page.tsx",
  "src/content/blog/clause-reserve-propriete-devis-b2b.md",
];
assertNoDashes((BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"), "reserve faq");
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-escompte-paiement-anticipe/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-escompte-paiement-anticipe/);
assert.match(toolPage, /Calculateur d'escompte pour paiement anticipé \(B2B\)/);
assert.match(toolPage, /ne remplace pas un conseil comptable ou juridique/);
assert.match(toolPage, /L441-9/);
assert.match(toolPage, /expert-comptable/);
assert.doesNotMatch(toolPage, /CGI/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /\/blog\/clause-reserve-propriete-devis-b2b/);
assert.match(toolPage, /\/blog\/conditions-paiement-penalites-retard-devis-b2b/);
assert.match(toolPage, /\/outils\/calculateur-penalites-retard-paiement/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /\/signup\?plan=free/);
assertNoDashes(toolPage, "outil page");

const toolUi = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-escompte-paiement-anticipe-calculator.tsx"),
  "utf8",
);
assert.match(toolUi, /hypothèses d'exemple, pas des taux de référence ni des usages d'une profession/);
assert.match(toolUi, /La facture/);
assert.match(toolUi, /Votre coût de financement/);
assert.match(toolUi, /L'escompte/);
assert.match(toolUi, /Le coût réel/);
assert.match(toolUi, /Le taux annuel selon l'escompte/);
assert.match(toolUi, /Taux annuel simple/);
assert.match(toolUi, /Taux annuel composé/);
assert.match(toolUi, /bg-orange-50/);
assert.match(toolUi, /bg-amber-50/);
assert.match(toolUi, /Pour lire vos chiffres/);
assert.match(toolUi, /Mention pour la facture/);
assert.match(toolUi, /Récapitulatif/);
assert.match(toolUi, /label="Copier"/);
assert.match(toolUi, /bg-emerald-50/);
assert.doesNotMatch(toolUi, /fetch\(/);
assertNoDashes(toolUi, "outil ui");

const toolLogic = readFileSync(
  join(process.cwd(), "src/lib/marketing/calculateur-escompte-paiement-anticipe.ts"),
  "utf8",
);
assert.doesNotMatch(toolLogic, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket/);
assert.doesNotMatch(toolLogic, /QuoteBuilder (calcule|applique|facture|encaisse|gère les paiements)/);
assert.match(toolLogic, /plus du double/);

assert.deepStrictEqual(PALIERS_TABLE, [0.5, 1, 1.5, 2, 3]);
assert.deepEqual(DEFAULTS, {
  montant: 24000,
  escompte: 2,
  delaiNormal: 45,
  delaiEscompte: 10,
  tauxFinancement: 6,
});

assert.strictEqual(fmtEur(24000), `24${NB}000${NB}€`);
assert.strictEqual(fmtEur(135.32), `135,32${NB}€`);
assert.strictEqual(fmtPct(2), `2${NB}%`);
assert.strictEqual(fmtJours(1), "1 jour");
assert.strictEqual(fmtJours(35), "35 jours");

const run = (o: EscompteInput) => computeEscompte({ ...DEFAULTS, ...o });

const d = run({});
assert.strictEqual(d.jours, 35);
assert.strictEqual(d.montantEscompte, 480);
assert.strictEqual(d.net, 23520);
close(d.tauxSimple, (0.02 / 0.98) * (365 / 35) * 100);
close(d.tauxSimple, 21.282799);
close(d.tauxCompose, (Math.pow(1 / 0.98, 365 / 35) - 1) * 100);
close(d.tauxCompose, 23.452388);
assert.ok(d.tauxCompose != null && d.tauxSimple != null && d.tauxCompose > d.tauxSimple);
assert.strictEqual(d.coutFinancement, Math.round(((23520 * 0.06 * 35) / 365) * 100) / 100);
assert.strictEqual(d.coutFinancement, 135.32);
assert.strictEqual(d.ecart, 344.68);
close(d.escompteMax, ((0.06 * 35) / 365 / (1 + (0.06 * 35) / 365)) * 100);
close(d.escompteMax, 0.572051);
close(tauxAnnuelSimple(d.escompteMax ?? 0, 35), 6);
assert.strictEqual(d.etat, "bad");
assert.ok(d.verdict.includes(`21,28${NB}%`));
assert.ok(d.verdict.includes("plus du double"));
assert.strictEqual(d.lignes.length, 5);
assert.deepStrictEqual(
  d.lignes.filter((ligne) => ligne.courant).map((ligne) => ligne.escompte),
  [2],
);
assert.strictEqual(d.mention, `Escompte de 2${NB}% pour paiement sous 10 jours à compter de la date de facture.`);
assert.ok(d.recap.includes("quotebuilder.co/outils/calculateur-escompte-paiement-anticipe"));
assert.strictEqual(d.recap.split("\n").at(-1), "Calcul : quotebuilder.co/outils/calculateur-escompte-paiement-anticipe");
assert.strictEqual(d.recap.split("\n").length, 9);
assert.strictEqual(buildRecap({ ...DEFAULTS }), d.recap);
assert.ok(d.conseils.join(" ").includes("article L441-9 du Code de commerce"));
assert.ok(d.conseils.join(" ").includes("QuoteBuilder ne gère ni la facturation ni les paiements"));

const ok = run({ escompte: 0.5 });
assert.strictEqual(ok.etat, "ok");
close(ok.tauxSimple, (0.005 / 0.995) * (365 / 35) * 100);

const warn = run({ escompte: 0.5, tauxFinancement: 4 });
assert.strictEqual(warn.etat, "warn");

const palier = run({ escompte: 2.5 });
assert.strictEqual(palier.lignes.length, 6);
assert.deepStrictEqual(
  palier.lignes.map((ligne) => ligne.escompte),
  [0.5, 1, 1.5, 2, 2.5, 3],
);

const zero = run({ escompte: 0 });
assert.strictEqual(zero.etat, "neutral");
assert.strictEqual(zero.mention, "Escompte pour paiement anticipé : néant.");
assert.strictEqual(zero.tauxSimple, null);

const nul = run({ delaiEscompte: 45 });
assert.strictEqual(nul.jours, 0);
assert.strictEqual(nul.etat, "bad");
assert.strictEqual(nul.lignes.length, 0);
assert.strictEqual(run({ delaiEscompte: 60 }).jours, 0);

assert.strictEqual(run({ montant: 0 }).valide, false);
assert.strictEqual(run({ montant: "" }).verdict, "Renseignez le montant de la facture.");
assert.strictEqual(run({ tauxFinancement: 0 }).etat, "neutral");
assert.strictEqual(mentionFacture(1, 0), `Escompte de 1${NB}% pour paiement comptant, à réception de la facture.`);
assert.strictEqual(tauxAnnuelCompose(2, 0), null);
assert.strictEqual(escompteMaximum(6, 0), null);
assert.strictEqual(run({ escompte: 80 }).escompte, 50);
