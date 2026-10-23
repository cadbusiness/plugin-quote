import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { QUESTION_ADD, defaultQuestion } from "@/lib/funnels/builder";
import { FUNNEL_TEMPLATES } from "@/lib/funnels/templates";
import { quoteHeadlineRange } from "@/lib/quotes/price-range";
import { scoreQuote } from "@/lib/quotes/score";
import type { Tables } from "@/lib/db/database.types";
import type { Product } from "@/lib/wizard/types";
import { evaluateSuggestions } from "@/lib/wizard/suggestions";
import { articleHtml } from "./article-html";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_FRAIS_DEPLACEMENT,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  FRAIS_DEPLACEMENT_DEFAULTS,
  buildRecap,
  ceil10,
  computeFraisDeplacement,
  fmtDuree,
  fmtEur,
  fmtNum,
} from "./calculateur-frais-deplacement-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "zone-intervention-frais-deplacement-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const TOOL_PATH = "/outils/calculateur-frais-deplacement-devis";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_FRAIS_DEPLACEMENT, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["funnel", "catalogue"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Zone d'intervention et frais de déplacement : chiffrer le trajet, dessiner ses zones et l'annoncer dès la demande de devis",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Frais de déplacement dans un devis B2B : le vrai coût d'un trajet (véhicule, temps d'équipe, allers-retours, péages), des zones d'intervention simples, absorber, forfaitiser ou refacturer, quoi écrire sur le devis, et comment poser la zone dans un funnel de demande de devis.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.produits);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 19);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, "2026-10-16");
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
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title,
  "Calculateur des frais de déplacement par zone",
);
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["funnel", "catalogue"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Véhicule, temps de route, allers-retours : ce que coûte le trajet d'un chantier dans chaque zone, le forfait à afficher et la commande minimum.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-six outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-six outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(56), outilsHubIntro());
assert.equal(outilsHubIntro(46), "Quarante-six outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, "2026-10-16");
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "2026-10-16"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, "2026-10-16");
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(
  llms,
  /Zone d'intervention et frais de déplacement : chiffrer le trajet, dessiner ses zones et l'annoncer dès la demande de devis : https:\/\/www\.quotebuilder\.co\/blog\/zone-intervention-frais-deplacement-devis-b2b/,
);
assert.match(
  llms,
  /Calculateur des frais de déplacement par zone : https:\/\/www\.quotebuilder\.co\/outils\/calculateur-frais-deplacement-devis/,
);
const blogLine = llms.split("\n").findIndex((line) => line.includes("/blog/zone-intervention-frais-deplacement-devis-b2b"));
const tarifsLine = llms.split("\n").findIndex((line) => line.includes("https://www.quotebuilder.co/tarifs"));
assert.ok(blogLine > tarifsLine, "article llms avec les articles");

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /calculateur-frais-deplacement-devis/);
assert.match(outilsHub, /Calculateur des frais de déplacement par zone/);
assert.match(outilsHub, /calculateur des frais de déplacement par zone/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
{
  const start = outilsHub.indexOf('href: "/outils/calculateur-frais-deplacement-devis"');
  assert.ok(start >= 0);
  assert.match(outilsHub.slice(start, start + 280), /eyebrow: "Catalogue"/);
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

function alphaTokens(body: string) {
  return body.split(/\s+/).filter((word) => /[A-Za-zÀ-ÿ0-9]/.test(word)).length;
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
      "# Zone d'intervention et frais de déplacement : chiffrer le trajet, dessiner ses zones et l'annoncer dès la demande de devis",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  for (const needle of [
    "Choix visuel",
    "Requis",
    "+ Ajouter une option",
    "Quand proposer ces produits ?",
    "Prix min",
    "Prix max",
    "Aucune solution ne correspond à vos réponses",
    "Réponses du funnel",
    "Réponse funnel",
    "consentement marketing",
    "24 janvier 2017",
    "Perdu",
    "En attente",
    "/outils/calculateur-frais-deplacement-devis",
  ]) {
    assert.ok(blogBody.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assertNoDashes(blogRaw, "zone md");
  assertNoDashes(blogBody, "zone body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 4772);
  assert.equal(alphaTokens(blogBody), 4398);
  assert.equal(blogBody.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length, 4387);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "zone");

  const html = articleHtml(blogBody);
  assert.equal((html.match(/<table/g) ?? []).length, 2);
  assert.match(html, /<blockquote/);
  assert.match(html, /<blockquote[^>]*>coût du déplacement = nombre d'allers-retours/);
  assert.match(html, /<code[^>]*>\{\{price_range\}\}<\/code>/);
  assert.match(html, /<code[^>]*>zone<\/code>/);
  assert.match(html, /<code[^>]*>zone_2<\/code>/);
}

const visual = QUESTION_ADD.find((item) => item.type === "visual_choice");
assert.equal(visual?.label, "Choix visuel");
assert.equal(defaultQuestion("select", 0).required, true);
const choiceTypes = new Set(["visual_choice", "select", "multi_select"]);
for (const template of FUNNEL_TEMPLATES) {
  for (const step of template.steps) {
    for (const question of step.questions ?? []) {
      if (!choiceTypes.has(question.type)) continue;
      assert.equal(question.key.includes("zone"), false, `${template.id} ${question.key}`);
    }
  }
}

function suggestionRule(
  id: string,
  conditions: { all: { key: string; op: "eq"; value: string }[] },
  priority = 0,
) {
  return {
    id,
    is_active: true,
    priority,
    name: id,
    headline: null,
    description: null,
    image_url: null,
    price_min: null,
    price_max: null,
    product_ids: [] as string[],
    conditions,
  } as unknown as Tables<"suggestion_rules">;
}

const openRules = [1, 2, 3, 4].map((n) => suggestionRule("r" + n, { all: [] }, n));
assert.equal(evaluateSuggestions({}, openRules, []).length, 3);
const both = suggestionRule("zone-ok", {
  all: [
    { key: "zone", op: "eq", value: "z2" },
    { key: "project_type", op: "eq", value: "entrepot" },
  ],
});
assert.equal(evaluateSuggestions({ zone: "z2" }, [both], []).length, 0);
assert.equal(evaluateSuggestions({ zone: "z2", project_type: "entrepot" }, [both], [] as Product[]).length, 1);

assert.deepEqual(
  quoteHeadlineRange({
    lines: [{ priceMin: 100, priceMax: 100, quantity: 1 }],
    ruleMin: 500,
    ruleMax: 900,
  }),
  { min: 500, max: 900 },
);
assert.deepEqual(quoteHeadlineRange({ lines: [{ priceMin: 100, priceMax: 100, quantity: 1 }] }), {
  min: 100,
  max: 100,
});
const scored = scoreQuote({ zone: "z3" });
assert.equal(scored.score, 30);
assert.equal(scored.label, "cold");

const addedSources = [
  "src/lib/marketing/calculateur-frais-deplacement-devis.ts",
  "src/lib/marketing/seo-pm-20261016.test.ts",
  "src/components/marketing/calculateur-frais-deplacement-devis-calculator.tsx",
  "src/app/(marketing)/outils/calculateur-frais-deplacement-devis/page.tsx",
  "src/content/blog/zone-intervention-frais-deplacement-devis-b2b.md",
];
assertNoDashes((BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"), "zone faq");
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/calculateur-frais-deplacement-devis/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /calculateur-frais-deplacement-devis/);
assert.match(toolPage, /Calculateur des frais de déplacement par zone/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /zone-intervention-frais-deplacement-devis-b2b/);
assert.match(toolPage, /\/fonctionnalites\/catalogue/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /dizaine d&apos;euros supérieure/);
assert.match(toolPage, /au-delà de la part absorbée/);
assert.doesNotMatch(toolPage, /\/blog\/espace-prospect-devis-en-ligne/);
assertNoDashes(toolPage, "tool page");

const calculator = readFileSync(
  join(process.cwd(), "src/components/marketing/calculateur-frais-deplacement-devis-calculator.tsx"),
  "utf8",
);
for (const id of [
  "coutKm",
  "vitesse",
  "personnes",
  "coutHoraire",
  "allers",
  "d1",
  "p1",
  "d2",
  "p2",
  "d3",
  "p3",
  "panier",
  "marge",
  "seuil",
]) {
  assert.match(calculator, new RegExp(`id="${id}"`));
}
assert.match(calculator, /Le trajet/);
assert.match(calculator, /Vos zones d&apos;intervention/);
assert.match(calculator, /Un chantier type/);
assert.match(calculator, /Repères/);
assert.match(calculator, /Pour lire vos chiffres/);
assert.match(calculator, /Récapitulatif/);
assert.match(calculator, /label="Copier"/);
assert.match(calculator, /Coût du déplacement par chantier et part de la marge/);
assert.match(calculator, /text-emerald-700/);
assert.match(calculator, /text-amber-800/);
assert.match(calculator, /text-rose-700/);
assert.match(calculator, /text-mk-ink/);
assert.match(calculator, /tone === "neutral"/);
assert.match(calculator, /hypothèses d&apos;exemple, pas des moyennes de marché/);
assert.match(calculator, /dizaine d&apos;euros supérieure/);
assert.doesNotMatch(calculator, /fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
assertNoDashes(calculator, "calculator");

assert.strictEqual(fmtEur(0.5), `0,50${NB}€`);
assert.strictEqual(fmtEur(28000), `28${NB}000${NB}€`);
assert.strictEqual(fmtEur(5333.333333), `5${NB}333${NB}€`);
assert.strictEqual(fmtEur(null), "n/a");
assert.strictEqual(fmtNum(22.5), "22,5");
assert.strictEqual(fmtNum(46.666667), "46,7");
assert.strictEqual(fmtDuree(0.666667), `40${NB}min`);
assert.strictEqual(fmtDuree(1.666667), `1${NB}h${NB}40`);
assert.strictEqual(fmtDuree(3), `3${NB}h`);
assert.strictEqual(fmtDuree(0), `0${NB}min`);
assert.strictEqual(ceil10(160), 160);
assert.strictEqual(ceil10(161), 170);
assert.strictEqual(ceil10(0), 0);
assert.strictEqual(ceil10(-5), 0);

const base = { ...FRAIS_DEPLACEMENT_DEFAULTS };
assert.deepEqual(base, {
  coutKm: 0.5,
  vitesse: 60,
  personnes: 2,
  coutHoraire: 45,
  allers: 2,
  d1: 20,
  p1: 0,
  d2: 50,
  p2: 0,
  d3: 100,
  p3: 20,
  panier: 6000,
  marge: 30,
  seuil: 10,
});

let result = computeFraisDeplacement(base);
close(result.tempsKm, 3);
close(result.kmAR, 4);
close(result.margeChantier, 1800);
close(result.partAcceptee, 180);
close(result.distanceSeuil, 22.5);
close(result.distanceTotale, 225);
const [z1, z2, z3] = result.zones;
assert.ok(z1 && z2 && z3);
close(z1.km, 40);
close(z1.heures, 0.666667);
close(z1.vehicule, 20);
close(z1.temps, 60);
close(z1.parAR, 80);
close(z1.chantier, 160);
close(z1.part, 8.888889);
close(z1.absorbe, 160);
close(z1.aFacturer, 0);
assert.strictEqual(z1.forfaitAuDela, 0);
assert.strictEqual(z1.forfaitComplet, 160);
close(z1.panierMin, 5333.333333);
assert.strictEqual(z1.tone, "ok");
close(z2.km, 100);
close(z2.heures, 1.666667);
close(z2.vehicule, 50);
close(z2.temps, 150);
close(z2.parAR, 200);
close(z2.chantier, 400);
close(z2.part, 22.222222);
close(z2.absorbe, 180);
close(z2.aFacturer, 220);
assert.strictEqual(z2.forfaitAuDela, 220);
assert.strictEqual(z2.forfaitComplet, 400);
close(z2.panierMin, 13333.333333);
assert.strictEqual(z2.tone, "warn");
close(z3.km, 200);
close(z3.heures, 3.333333);
close(z3.vehicule, 100);
close(z3.temps, 300);
close(z3.parAR, 420);
close(z3.chantier, 840);
close(z3.tempsChantier, 600);
close(z3.part, 46.666667);
close(z3.aFacturer, 660);
assert.strictEqual(z3.forfaitAuDela, 660);
assert.strictEqual(z3.forfaitComplet, 840);
close(z3.panierMin, 28000);
assert.strictEqual(z3.tone, "warn");
assert.strictEqual(result.verdict.tone, "warn");
assert.strictEqual(
  result.verdict.text,
  `Zones 2 et 3 : le trajet dépasse 10${NB}% de la marge d'un chantier type. Affichez un forfait de déplacement par zone, ou un montant minimum de commande.`,
);
assert.strictEqual(result.conseils.length, 5);
assert.strictEqual(
  result.conseils[0],
  `Un kilomètre de distance en plus vous coûte 4${NB}€ par aller-retour, dont 3${NB}€ de temps d'équipe.`,
);
assert.strictEqual(
  result.conseils[1],
  `Au-delà de 22,5${NB}km à l'aller, le trajet d'un chantier type dépasse 10${NB}% de sa marge ; au-delà de 225${NB}km, il mange toute la marge (péages non compris).`,
);
assert.strictEqual(
  result.conseils[2],
  `Le temps de route pèse plus que le véhicule : 71,4${NB}% du coût du déplacement en zone 3. Regrouper les chantiers d'une même zone sur une même tournée réduit d'abord ce poste.`,
);
assert.strictEqual(
  result.conseils[3],
  `Pour garder le trajet sous 10${NB}% de la marge, un chantier en zone 3 doit faire au moins 28${NB}000${NB}€ HT.`,
);
assert.ok(result.conseils[4]?.startsWith("Dans QuoteBuilder, posez la zone en « Choix visuel »"));
assert.ok(result.conseils[4]?.includes("Le funnel ne calcule pas de distance"));
const recap = result.recap.split("\n");
assert.strictEqual(recap.length, 7);
assert.strictEqual(
  recap[0],
  `Trajet : véhicule 0,50${NB}€ par km, 2 personnes à 45${NB}€ de l'heure, 60${NB}km/h de moyenne, 2 allers-retours par chantier.`,
);
assert.strictEqual(
  recap[1],
  `Chantier type : 6${NB}000${NB}€ HT, marge 30${NB}% (1${NB}800${NB}€), part acceptée pour le trajet 10${NB}% (180${NB}€).`,
);
assert.strictEqual(recap[2], `Zone 1 (jusqu'à 20${NB}km) : 160${NB}€ par chantier, 8,9${NB}% de la marge, absorbé.`);
assert.strictEqual(
  recap[3],
  `Zone 2 (jusqu'à 50${NB}km) : 400${NB}€ par chantier, 22,2${NB}% de la marge, forfait 220${NB}€ au-delà de la part absorbée ou 400${NB}€ en coût complet.`,
);
assert.strictEqual(
  recap[4],
  `Zone 3 (jusqu'à 100${NB}km) : 840${NB}€ par chantier, 46,7${NB}% de la marge, forfait 660${NB}€ au-delà de la part absorbée ou 840${NB}€ en coût complet.`,
);
assert.strictEqual(
  recap[5],
  `Distance où le trajet atteint 10${NB}% de la marge : 22,5${NB}km ; où il la mange entière : 225${NB}km.`,
);
assert.strictEqual(recap[6], "Calcul : quotebuilder.co/outils/calculateur-frais-deplacement-devis");
assert.strictEqual(buildRecap(base), result.recap);

const seuils = {
  ...base,
  coutKm: 1,
  personnes: 0,
  allers: 1,
  panier: 1000,
  marge: 100,
  seuil: 10,
  p1: 0,
  p2: 0,
  p3: 0,
};
result = computeFraisDeplacement({ ...seuils, d1: 50, d2: 50.5, d3: 250 });
assert.deepEqual(
  result.zones.map((zone) => zone.tone),
  ["ok", "warn", "warn"],
);
close(result.zones[0]?.part ?? null, 10);
close(result.zones[1]?.part ?? null, 10.1);
close(result.zones[2]?.part ?? null, 50);
result = computeFraisDeplacement({ ...seuils, d1: 10, d2: 20, d3: 250.5 });
assert.deepEqual(
  result.zones.map((zone) => zone.tone),
  ["ok", "ok", "bad"],
);
assert.strictEqual(result.verdict.tone, "bad");
assert.strictEqual(
  result.verdict.text,
  `Zone 3 : le trajet coûte plus de la moitié de la marge d'un chantier type (jusqu'à 50,1${NB}%). Facturez le déplacement au réel, fixez un montant minimum de commande, ou traitez cette zone comme hors secteur.`,
);
result = computeFraisDeplacement({ ...seuils, d1: 10, d2: 20, d3: 30 });
assert.strictEqual(result.verdict.tone, "ok");
assert.strictEqual(
  result.verdict.text,
  `Sur ces hypothèses, le trajet reste sous 10${NB}% de la marge d'un chantier type dans les trois zones. Vous pouvez l'inclure dans vos prix ; écrivez-le quand même sur le devis.`,
);
assert.strictEqual(result.recap.split("\n")[4], `Zone 3 (jusqu'à 30${NB}km) : 60${NB}€ par chantier, 6${NB}% de la marge, absorbé.`);
assert.ok(!result.conseils.some((item) => item.startsWith("Le temps de route")));
assert.ok(!result.conseils.some((item) => item.startsWith("Pour garder le trajet")));
assert.strictEqual(
  result.conseils[0],
  `Un kilomètre de distance en plus vous coûte 2${NB}€ par aller-retour, dont 0${NB}€ de temps d'équipe.`,
);
result = computeFraisDeplacement({ ...seuils, d1: 60, d2: 70, d3: 80 });
assert.strictEqual(result.verdict.text.startsWith("Zones 1, 2 et 3 : le trajet dépasse 10"), true);

result = computeFraisDeplacement({ ...base, d2: 15 });
assert.ok(result.conseils.includes("Les distances des zones ne vont pas en croissant : vérifiez les bornes."));
result = computeFraisDeplacement({ ...base, d3: 50 });
assert.ok(result.conseils.includes("Les distances des zones ne vont pas en croissant : vérifiez les bornes."));

result = computeFraisDeplacement({ ...base, allers: 0, p1: 0, p2: 0, p3: 0 });
assert.strictEqual(result.verdict.tone, "neutral");
assert.strictEqual(
  result.verdict.text,
  "Saisissez le coût du véhicule ou du temps d'équipe, et le nombre d'allers-retours par chantier, pour lancer le calcul.",
);
assert.strictEqual(result.distanceTotale, null);
result = computeFraisDeplacement({ ...base, panier: 0 });
assert.strictEqual(result.verdict.tone, "neutral");
assert.strictEqual(
  result.verdict.text,
  "Saisissez le montant d'un chantier type et sa marge pour comparer le trajet à ce qu'il rapporte.",
);
assert.deepEqual(
  result.zones.map((zone) => zone.tone),
  ["neutral", "neutral", "neutral"],
);
assert.strictEqual(result.zones[0]?.part, null);
assert.strictEqual(result.recap.split("\n")[2], `Zone 1 (jusqu'à 20${NB}km) : 160${NB}€ par chantier.`);
assert.strictEqual(
  result.recap.split("\n")[5],
  `Distance où le trajet atteint 10${NB}% de la marge : n/a ; où il la mange entière : n/a.`,
);
result = computeFraisDeplacement({ ...base, seuil: 0 });
assert.strictEqual(result.distanceSeuil, null);
close(result.distanceTotale, 225);
assert.strictEqual(result.zones[0]?.panierMin, null);
assert.strictEqual(result.zones[0]?.tone, "warn");
assert.strictEqual(result.conseils[1], `Au-delà de 225${NB}km, il mange toute la marge (péages non compris).`);

result = computeFraisDeplacement({
  ...base,
  personnes: "2.7",
  allers: "abc",
  vitesse: 0,
  coutKm: -3,
  marge: 150,
  seuil: "",
});
assert.strictEqual(result.personnes, 2);
assert.strictEqual(result.allers, 0);
assert.strictEqual(result.vitesse, 5);
assert.strictEqual(result.coutKm, 0);
assert.strictEqual(result.marge, 100);
assert.strictEqual(result.seuil, 0);
result = computeFraisDeplacement({ ...base, d1: 5000, p1: -10, personnes: 99 });
assert.strictEqual(result.zones[0]?.distance, 1000);
assert.strictEqual(result.zones[0]?.peages, 0);
assert.strictEqual(result.personnes, 20);

result = computeFraisDeplacement({ ...base, personnes: 1, allers: 1 });
assert.strictEqual(
  result.recap.split("\n")[0],
  `Trajet : véhicule 0,50${NB}€ par km, 1 personne à 45${NB}€ de l'heure, 60${NB}km/h de moyenne, 1 aller-retour par chantier.`,
);

console.log("seo-pm-20261016.test.ts ok");
