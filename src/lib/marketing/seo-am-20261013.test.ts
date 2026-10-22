import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_COUT_CAMPAGNES_EMAIL, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  CAMPAIGN_WASTE_DEFAULTS,
  buildCampaignWasteRecap,
  computeCampaignWaste,
  fmtEur,
  fmtNum,
} from "./cout-campagnes-email-sans-segmentation";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "segments-campagnes-email-demande-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_SLUG = "funnel-devis-architecte-bet";
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;
const TOOL_PATH = "/outils/estimateur-cout-campagnes-email-sans-segmentation";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_COUT_CAMPAGNES_EMAIL, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["funnel", "integrations"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 16);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, "2026-10-13");
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

assert.equal(BLOG_POSTS.length, 64);
assert.equal(BLOG_TOOLS.length, 54);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["funnel", "integrations"]);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-quatre outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-quatre outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(54), outilsHubIntro());
assert.equal(outilsHubIntro(39), "Trente-neuf outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, "2026-10-13");
}

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "2026-10-13"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, "2026-10-13");
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(
  llms,
  /Segments et campagnes email sur des demandes de devis B2B : écrire à un groupe sans polluer le parcours : https:\/\/www\.quotebuilder\.co\/blog\/segments-campagnes-email-demande-devis-b2b/,
);
assert.match(
  llms,
  /Funnel devis architecte et BET : https:\/\/www\.quotebuilder\.co\/secteurs\/funnel-devis-architecte-bet/,
);
assert.match(
  llms,
  /Estimateur coût des campagnes email sans segmentation : https:\/\/www\.quotebuilder\.co\/outils\/estimateur-cout-campagnes-email-sans-segmentation/,
);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(outilsHub, /estimateur-cout-campagnes-email-sans-segmentation/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
assert.match(secteursHub, /funnel-devis-architecte-bet/);

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
}

function assertNoDashes(text: string, label: string) {
  assert.doesNotMatch(text, EM_DASH, `${label} has an em dash`);
  assert.doesNotMatch(text, EN_DASH, `${label} has an en dash`);
}

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(
    blogBody.startsWith(
      "# Segments et campagnes email sur des demandes de devis B2B : écrire à un groupe sans polluer le parcours",
    ),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assert.match(blogBody, /autopilote-workflows-relance-demande-devis-b2b/);
  assert.match(blogBody, /rgpd-demande-devis-b2b-consentement-conservation/);
  assert.match(blogBody, /webhook-demande-devis-crm-signature-hmac/);
  assert.match(blogBody, /estimateur-cout-campagnes-email-sans-segmentation/);
  assert.match(blogBody, /no_marketing_consent/);
  assert.match(blogBody, /recently_contacted/);
  assert.match(blogBody, /compté parmi les ignorés|comptés parmi les ignorés/);
  assert.doesNotMatch(blogBody, /le motif s'affiche/);
  assertNoDashes(blogRaw, "segments md");
  assertNoDashes(blogBody, "segments body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 3973);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "segments");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"));
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith(
      "# Funnel de devis architecte et BET : une demande avec le type de mission, pas un appel à vide",
    ),
  );
  assert.match(sectorBody, /property_architect/);
  assert.match(sectorBody, /Conception \/ PC/);
  assert.match(sectorBody, /Suivi de chantier/);
  assert.match(sectorBody, /Étude \/ BET/);
  assert.match(sectorBody, /Plan \(PDF ou image\)/);
  assert.match(sectorBody, /10 Mo/);
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /\/c\/demo\/rayonnage/);
  assert.match(sectorBody, /Essayer le template Architecte \/ BET/);
  assert.match(sectorBody, /30 points/);
  assert.doesNotMatch(sectorBody, /signature en ligne disponible/);
  assertNoDashes(sectorRaw, "architecte md");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 4050);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "architecte");
}

const addedSources = [
  "src/lib/marketing/cout-campagnes-email-sans-segmentation.ts",
  "src/lib/marketing/seo-am-20261013.test.ts",
  "src/components/marketing/cout-campagnes-email-sans-segmentation-calculator.tsx",
  "src/app/(marketing)/outils/estimateur-cout-campagnes-email-sans-segmentation/page.tsx",
  "src/app/(marketing)/secteurs/funnel-devis-architecte-bet/page.tsx",
];
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/estimateur-cout-campagnes-email-sans-segmentation/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /segments-campagnes-email-demande-devis-b2b/);
assert.match(toolPage, /autopilote-workflows-relance-demande-devis-b2b/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /Pour lire vos chiffres/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);

const sectorPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-architecte-bet/page.tsx"),
  "utf8",
);
assert.match(sectorPage, /Essayer le template Architecte \/ BET/);
assert.match(sectorPage, /property_architect/);
assert.match(sectorPage, /signup\?plan=free/);
assert.match(sectorPage, /loadPostBody\("funnel-devis-architecte-bet"\)/);

const close = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const base = { ...CAMPAIGN_WASTE_DEFAULTS };

let r = computeCampaignWaste(base);
assert.strictEqual(r.contactsEnvoyes, 500);
assert.strictEqual(r.contactsMalCibles, 375);
assert.strictEqual(r.contactsDejaAutopilote, 200);
assert.strictEqual(r.plaintes, 15);
close(r.heuresPerdues, 10 / 3);
assert.strictEqual(r.coutTemps, 150);
close(r.dealsFroids, 5.625);
assert.strictEqual(r.opportunites, 27000);
assert.strictEqual(r.coutMensuel, 27150);
assert.strictEqual(r.verdict.tone, "bad");
assert.ok(r.verdict.text.includes("27" + NB + "150" + NB + "€ par mois"));
assert.ok(r.conseils.some((item) => item.startsWith("Au moins 60 % de la liste")));
assert.ok(r.conseils.some((item) => item.startsWith("Au moins un quart de la liste")));
assert.ok(r.conseils.some((item) => item.startsWith("2 % ou plus de plaintes")));
assert.ok(r.conseils.some((item) => item.startsWith("Les opportunités pèsent plus de trois fois")));
assert.ok(r.conseils.some((item) => item.startsWith("Une campagne écrit à un groupe")));
assert.ok(!r.conseils.some((item) => item.startsWith("Moins de 50 envois")));
assert.ok(!r.conseils.some((item) => item.startsWith("Vous estimez qu'aucune affaire")));

assert.ok(
  r.recap.includes(
    "Hypothèses : 2 campagnes par mois, liste de 250 contacts, 75 % sans segment, 40 min de préparation, 3 % de plaintes ou désabonnements, 8 min par plainte, 40 % déjà en parcours Autopilote, coût horaire 45" +
      NB +
      "€, panier 4" +
      NB +
      "800" +
      NB +
      "€, 1,5 % d'affaires qui refroidissent.",
  ),
);
assert.ok(r.recap.includes("Envois : 500 contacts touchés, 375 mal ciblés, 200 déjà en parcours Autopilote, 15 plaintes ou désabonnements."));
assert.ok(r.recap.includes("Temps : 3,3 h, soit 150" + NB + "€."));
assert.ok(r.recap.includes("Opportunités : 5,6 affaires refroidies et 27" + NB + "000" + NB + "€."));
assert.ok(r.recap.includes("Coût mensuel (temps + opportunités) : 27" + NB + "150" + NB + "€."));
assert.ok(r.recap.endsWith("Calcul : quotebuilder.co/outils/estimateur-cout-campagnes-email-sans-segmentation"));
assert.strictEqual(buildCampaignWasteRecap(base), r.recap);
assert.ok(!/ €/.test(r.recap), "espace normale avant €");

assert.strictEqual(fmtEur(150), "150" + NB + "€");
assert.strictEqual(fmtEur(27150), "27" + NB + "150" + NB + "€");
assert.strictEqual(fmtNum(5.625), "5,6");
assert.strictEqual(fmtNum(3.333333), "3,3");
assert.strictEqual(fmtNum(1.5), "1,5");

r = computeCampaignWaste({ ...base, campagnesParMois: 0 });
assert.strictEqual(r.verdict.tone, "neutral");
assert.ok(r.verdict.text.startsWith("Indiquez"));
assert.strictEqual(r.contactsEnvoyes, 0);
r = computeCampaignWaste({ ...base, tailleListe: "" });
assert.strictEqual(r.tailleListe, 0);
assert.strictEqual(r.verdict.tone, "neutral");

r = computeCampaignWaste({
  ...base,
  pctSansSegment: 150,
  pctPlaintes: -4,
  pctDealsFroids: 180,
  pctDejaAutopilote: 250,
  campagnesParMois: -2,
  minutesPreparation: -5,
  panierMoyen: "abc",
});
assert.strictEqual(r.pctSansSegment, 100);
assert.strictEqual(r.pctPlaintes, 0);
assert.strictEqual(r.pctDealsFroids, 100);
assert.strictEqual(r.pctDejaAutopilote, 100);
assert.strictEqual(r.campagnes, 0);
assert.strictEqual(r.minutesPreparation, 0);
assert.strictEqual(r.panier, 0);
assert.strictEqual(r.verdict.tone, "neutral");

r = computeCampaignWaste({ ...base, pctDealsFroids: 0, pctSansSegment: 0, pctPlaintes: 0, pctDejaAutopilote: 0 });
assert.strictEqual(r.contactsMalCibles, 0);
assert.strictEqual(r.opportunites, 0);
assert.strictEqual(r.dealsFroids, 0);
close(r.heuresPerdues, 80 / 60);
close(r.coutTemps, 60);
assert.strictEqual(r.verdict.tone, "ok");
assert.ok(r.conseils.some((item) => item.startsWith("Vous estimez qu'aucune affaire")));
assert.ok(r.conseils.some((item) => item.startsWith("Vous estimez que personne ne part sans segment")));

r = computeCampaignWaste({
  campagnesParMois: 1,
  tailleListe: 20,
  pctSansSegment: 50,
  minutesPreparation: 30,
  pctPlaintes: 0,
  minutesParPlainte: 0,
  pctDejaAutopilote: 0,
  tauxHoraire: 40,
  panierMoyen: 1000,
  pctDealsFroids: 10,
});
assert.strictEqual(r.contactsEnvoyes, 20);
assert.strictEqual(r.contactsMalCibles, 10);
assert.strictEqual(r.dealsFroids, 1);
assert.strictEqual(r.opportunites, 1000);
close(r.coutTemps, 20);
assert.strictEqual(r.coutMensuel, 1020);
assert.strictEqual(r.verdict.tone, "warn");
assert.ok(r.verdict.text.startsWith("Écart modéré"));
assert.ok(r.conseils.some((item) => item.startsWith("Moins de 50 envois")));
assert.ok(r.recap.includes("Opportunités : 1 affaire refroidie et 1" + NB + "000" + NB + "€."));

r = computeCampaignWaste({
  campagnesParMois: 4,
  tailleListe: 10,
  pctSansSegment: 10,
  minutesPreparation: 120,
  pctPlaintes: 0,
  minutesParPlainte: 0,
  pctDejaAutopilote: 0,
  tauxHoraire: 30,
  panierMoyen: 500,
  pctDealsFroids: 0,
});
close(r.heuresPerdues, 8);
assert.strictEqual(r.coutTemps, 240);
assert.strictEqual(r.coutMensuel, 240);
assert.strictEqual(r.verdict.tone, "ok");
assert.ok(r.conseils.some((item) => item.startsWith("Plus de 90 minutes")));

const at = (target: number) =>
  computeCampaignWaste({
    campagnesParMois: 1,
    tailleListe: 1,
    pctSansSegment: 100,
    minutesPreparation: 0,
    pctPlaintes: 0,
    minutesParPlainte: 0,
    pctDejaAutopilote: 0,
    tauxHoraire: 0,
    panierMoyen: target,
    pctDealsFroids: 100,
  });
assert.strictEqual(at(2000).verdict.tone, "bad");
assert.strictEqual(at(1999).verdict.tone, "warn");
assert.strictEqual(at(400).verdict.tone, "warn");
assert.strictEqual(at(399).verdict.tone, "ok");

assert.ok(
  !/[\u2013\u2014]/.test(
    computeCampaignWaste(base).recap + computeCampaignWaste({ ...base, campagnesParMois: 1, tailleListe: 10 }).conseils.join(" "),
  ),
);
