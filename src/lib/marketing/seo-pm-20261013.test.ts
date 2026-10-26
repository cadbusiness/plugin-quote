import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_ACCES_EQUIPE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  ACCESS_COST_DEFAULTS,
  buildRecap,
  computeAccessCost,
  fmtEur,
  fmtNum,
} from "./cout-acces-mal-cadres-equipe-devis";
import { CAMPAIGN_WASTE_DEFAULTS, computeCampaignWaste } from "./cout-campagnes-email-sans-segmentation";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "roles-permissions-equipe-demande-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const TOOL_PATH = "/outils/estimateur-cout-acces-mal-cadres-equipe-devis";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_ACCES_EQUIPE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["funnel", "catalogue"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Rôles et permissions d'équipe : traiter les demandes de devis B2B sans tout ouvrir à tout le monde",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Propriétaire, Admin, Commercial : ce que chaque rôle ouvre écran par écran, comment inviter, changer un rôle ou retirer un accès depuis Équipe, ce que le rôle Commercial ne cache pas et une répartition simple selon la taille de l'équipe.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.accueil);
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

assert.equal(BLOG_TOOLS.length, 57);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Estimateur du coût des accès mal cadrés");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["funnel", "catalogue"]);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-sept outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-sept outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(57), outilsHubIntro());
assert.equal(outilsHubIntro(40), "Quarante outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
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
  /Rôles et permissions d'équipe : traiter les demandes de devis B2B sans tout ouvrir à tout le monde : https:\/\/www\.quotebuilder\.co\/blog\/roles-permissions-equipe-demande-devis-b2b/,
);
assert.match(
  llms,
  /Estimateur du coût des accès mal cadrés dans une équipe devis : https:\/\/www\.quotebuilder\.co\/outils\/estimateur-cout-acces-mal-cadres-equipe-devis/,
);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /estimateur-cout-acces-mal-cadres-equipe-devis/);
assert.match(outilsHub, /outilsHubIntro\(\)/);

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
      "# Rôles et permissions d'équipe : traiter les demandes de devis B2B sans tout ouvrir à tout le monde",
    ),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assert.match(blogBody, /\/fonctionnalites\/equipe/);
  assert.match(blogBody, /\/fonctionnalites\/demandes/);
  assert.match(blogBody, /assignation-sla-demande-devis-equipe/);
  assert.match(blogBody, /notes-internes-dossier-devis-equipe-b2b/);
  assert.match(blogBody, /transfert-brief-commercial-technique-devis-b2b/);
  assert.match(blogBody, /validation-interne-avant-envoi-devis-b2b/);
  assert.match(blogBody, /approbation-client-multi-decideurs-devis-b2b/);
  assert.match(blogBody, /statuts-pipeline-devis-b2b/);
  assert.match(blogBody, /calculateur-capacite-equipe-devis/);
  assert.match(blogBody, /\/outils\/estimateur-cout-acces-mal-cadres-equipe-devis/);
  assert.match(blogBody, /Propriétaire/);
  assert.match(blogBody, /Admin/);
  assert.match(blogBody, /Commercial/);
  assert.match(blogBody, /Ce que ce compte peut faire/);
  assert.match(blogBody, /Qui rejoignez-vous \?/);
  assert.match(blogBody, /Envoyer l'invitation/);
  assert.match(blogBody, /Renvoyer l'accès/);
  assert.match(blogBody, /Révoquer l'invitation/);
  assert.match(blogBody, /Enregistrer le rôle/);
  assert.match(blogBody, /Suspendre/);
  assert.match(blogBody, /Le propriétaire ne peut pas être modifié\./);
  assert.match(blogBody, /Directeur financier/);
  assert.match(blogBody, /Responsable technique/);
  assert.match(blogBody, /30 jours/);
  assert.match(blogBody, /Le rôle Commercial limite l'accès aux réglages, pas aux dossiers\./);
  assert.match(blogBody, /\| Google Ads \| Connexion, conversions, ROI \| Oui \| Lecture seule \|/);
  assert.match(blogBody, /La page Google Ads \(\/acquisition\) ne redirige pas/);
  assert.doesNotMatch(blogBody, /renvoyé vers la liste des Demandes/);
  assert.doesNotMatch(blogBody, /retirer l'accès \(révoquer\)/);
  assert.match(blogBody, /Révoquer l'invitation/);
  assert.match(blogBody, /n'existe que pour une invitation en attente/);
  assert.match(blogBody, /aujourd'hui l'application ne coupe pas de façon fiable l'accès d'un membre actif/);
  assert.match(blogBody, /essayez Suspendre/);
  assert.match(blogBody, /contactez le support/);
  assert.match(blogBody, /pas de coupure fiable de l'accès d'un membre actif/);
  assert.match(blogBody, /Vérifiez dans la liste Équipe que le statut a bien changé/);
  assert.doesNotMatch(blogBody, /réassignez-les, puis suspendez/);
  assert.doesNotMatch(blogBody, /suspendez ensuite/);
  assert.doesNotMatch(blogBody, /cliquez sur Suspendre/);
  assert.match(blogBody, /L'email n'est envoyé qu'aux membres qui ont une adresse d'invitation/);
  assert.match(blogBody, /Le Propriétaire n'en a pas : il ne reçoit jamais cet email/);
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.doesNotMatch(blogBody, /ACCESS_MATRIX/);
  assertNoDashes(blogRaw, "roles md");
  assertNoDashes(blogBody, "roles body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 4010);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "roles");
}

const addedSources = [
  "src/lib/marketing/cout-acces-mal-cadres-equipe-devis.ts",
  "src/lib/marketing/seo-pm-20261013.test.ts",
  "src/components/marketing/cout-acces-mal-cadres-equipe-devis-calculator.tsx",
  "src/app/(marketing)/outils/estimateur-cout-acces-mal-cadres-equipe-devis/page.tsx",
];
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/estimateur-cout-acces-mal-cadres-equipe-devis/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /https:\/\/www\.quotebuilder\.co\/outils\/estimateur-cout-acces-mal-cadres-equipe-devis|path: PATH/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /roles-permissions-equipe-demande-devis-b2b/);
assert.match(toolPage, /\/fonctionnalites\/equipe/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /Pour lire vos chiffres/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);

const close = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const base = { ...ACCESS_COST_DEFAULTS };

let r = computeAccessCost(base);
assert.strictEqual(r.incidentsMois, 1);
assert.strictEqual(r.heuresIncidents, 1.5);
assert.strictEqual(r.heuresBlocages, 4);
assert.strictEqual(r.heuresTotales, 5.5);
assert.strictEqual(r.coutTemps, 247.5);
close(r.dealsPerdus, 0.2);
close(r.caManque, 900);
close(r.heuresMiseEnOrdreMensuel, 1 / 12);
close(r.coutMiseEnOrdreMensuel, 3.75);
close(r.heuresNettes, 5.5 - 1 / 12);
close(r.coutNetMensuelEvite, 1143.75);
close(r.coutNetAnnuelEvite, 13725);
assert.strictEqual(r.verdict.tone, "bad");
assert.ok(r.verdict.text.includes("1" + NB + "144" + NB + "€ par mois"));
assert.ok(r.conseils.some((item) => item.startsWith("Le chiffre d'affaires manqué pèse plus de trois fois")));
assert.ok(r.conseils.some((item) => item.includes("le rôle Commercial ferme les réglages, pas les dossiers")));
assert.ok(!r.conseils.some((item) => item.startsWith("Seul dans l'espace")));
assert.ok(!r.conseils.some((item) => item.startsWith("Plus de la moitié")));
assert.ok(!r.conseils.some((item) => item.startsWith("Aucun Admin en trop")));
assert.ok(!r.conseils.some((item) => item.startsWith("Plus de 20 blocages")));
assert.ok(!r.conseils.some((item) => item.startsWith("Plus de 15 points")));

assert.ok(
  r.recap.includes(
    "Hypothèses : 6 personnes, 2 Admins en trop, 0,5 incident par Admin en trop et par mois, 1,5 h par incident, 12 blocages par mois de 20 min, dont 4 avec un prospect qui attend, 5 points de signature perdus, coût horaire 45" +
      NB +
      "€, panier 4" +
      NB +
      "500" +
      NB +
      "€, mise en ordre 1 h.",
  ),
);
assert.ok(r.recap.includes("Réglages modifiés par erreur : 1 incident et 1,5 h par mois."));
assert.ok(r.recap.includes("Commerciaux bloqués : 4 h par mois. Temps total perdu : 5,5 h, soit 247,50" + NB + "€."));
assert.ok(r.recap.includes("Réponses retardées : 0,2 affaire refroidie et 900" + NB + "€ de chiffre d'affaires manqué par mois."));
assert.ok(r.recap.includes("Mise en ordre amortie sur 12 mois : 3,75" + NB + "€ par mois."));
assert.ok(
  r.recap.includes(
    "Coût mensuel évité : 1" +
      NB +
      "144" +
      NB +
      "€ (13" +
      NB +
      "725" +
      NB +
      "€ sur 12 mois), avec 5,4 h nettes rendues par mois.",
  ),
);
assert.ok(r.recap.endsWith("Calcul : quotebuilder.co/outils/estimateur-cout-acces-mal-cadres-equipe-devis"));
assert.strictEqual(buildRecap(base), r.recap);
assert.ok(!/ €/.test(r.recap), "espace normale avant €");

assert.strictEqual(fmtEur(3.75), "3,75" + NB + "€");
assert.strictEqual(fmtEur(247.5), "247,50" + NB + "€");
assert.strictEqual(fmtEur(1143.75), "1" + NB + "144" + NB + "€");
assert.strictEqual(fmtEur(13725), "13" + NB + "725" + NB + "€");
assert.strictEqual(fmtEur(-150), "-150" + NB + "€");
assert.strictEqual(fmtEur(0), "0" + NB + "€");
assert.strictEqual(fmtEur(null), "n/a");
assert.strictEqual(fmtNum(0.2), "0,2");
assert.strictEqual(fmtNum(5.416667), "5,4");
assert.strictEqual(fmtNum(1 / 12), "0,1");
assert.strictEqual(fmtNum(12000), "12" + NB + "000");
assert.strictEqual(fmtNum(-0.01), "0");
assert.strictEqual(fmtNum(undefined), "n/a");

r = computeAccessCost({ ...base, membres: 0 });
assert.strictEqual(r.verdict.tone, "neutral");
assert.ok(r.verdict.text.startsWith("Saisissez"));
assert.strictEqual(r.adminsEnTrop, 0);
r = computeAccessCost({ ...base, membres: "" });
assert.strictEqual(r.membres, 0);
assert.strictEqual(r.verdict.tone, "neutral");
r = computeAccessCost({ ...base, membres: -3 });
assert.strictEqual(r.membres, 0);

r = computeAccessCost({
  ...base,
  membres: 2.7,
  adminsEnTrop: "abc",
  demandesRefroidies: 20,
  pointsSignaturePerdus: 150,
  heuresMiseEnOrdre: 100,
  incidentsParAdmin: 50,
  minutesParBlocage: 1000,
  heuresParIncident: 99,
  tauxHoraire: -5,
  panierMoyen: "x",
});
assert.strictEqual(r.membres, 2);
assert.strictEqual(r.adminsEnTrop, 0);
assert.strictEqual(r.refroidies, 12);
assert.strictEqual(r.pointsPerdus, 100);
assert.strictEqual(r.heuresMiseEnOrdre, 40);
assert.strictEqual(r.incidentsParAdmin, 30);
assert.strictEqual(r.minutesParBlocage, 480);
assert.strictEqual(r.heuresParIncident, 40);
assert.strictEqual(r.tauxHoraire, 0);
assert.strictEqual(r.panier, 0);
r = computeAccessCost({ ...base, membres: 3, adminsEnTrop: 9 });
assert.strictEqual(r.adminsEnTrop, 3);

r = computeAccessCost({
  membres: 4,
  adminsEnTrop: 1,
  incidentsParAdmin: 0.5,
  heuresParIncident: 2,
  blocagesParMois: 6,
  minutesParBlocage: 15,
  demandesRefroidies: 2,
  pointsSignaturePerdus: 3,
  tauxHoraire: 40,
  panierMoyen: 3000,
  heuresMiseEnOrdre: 1,
});
close(r.heuresIncidents, 1);
close(r.heuresBlocages, 1.5);
close(r.coutTemps, 100);
close(r.dealsPerdus, 0.06);
close(r.caManque, 180);
close(r.coutNetMensuelEvite, 280 - 40 / 12);
assert.strictEqual(r.verdict.tone, "warn");
assert.ok(r.verdict.text.startsWith("Coût modéré"));
assert.ok(r.recap.includes("4 personnes, 1 Admin en trop,"));
assert.ok(r.recap.includes("0,5 incident et 1 h par mois"));

r = computeAccessCost({
  membres: 3,
  adminsEnTrop: 0,
  incidentsParAdmin: 1,
  heuresParIncident: 2,
  blocagesParMois: 2,
  minutesParBlocage: 10,
  demandesRefroidies: 0,
  pointsSignaturePerdus: 5,
  tauxHoraire: 40,
  panierMoyen: 2000,
  heuresMiseEnOrdre: 1,
});
close(r.coutTemps, 40 / 3);
close(r.coutNetMensuelEvite, 10);
assert.strictEqual(r.verdict.tone, "ok");
assert.ok(r.verdict.text.startsWith("Coût faible"));
assert.ok(r.conseils.some((item) => item.startsWith("Aucun Admin en trop")));
assert.ok(!r.conseils.some((item) => item.startsWith("Le chiffre d'affaires manqué")));

r = computeAccessCost({ ...base, membres: 1, adminsEnTrop: 5 });
assert.strictEqual(r.adminsEnTrop, 1);
assert.ok(r.conseils.some((item) => item.startsWith("Seul dans l'espace")));
assert.ok(!r.conseils.some((item) => item.startsWith("Plus de la moitié")));
assert.ok(r.recap.includes("Hypothèses : 1 personne, 1 Admin en trop,"));

r = computeAccessCost({
  ...base,
  membres: 4,
  adminsEnTrop: 3,
  blocagesParMois: 25,
  demandesRefroidies: 12,
  pointsSignaturePerdus: 20,
});
assert.ok(r.conseils.some((item) => item.startsWith("Plus de la moitié")));
assert.ok(r.conseils.some((item) => item.startsWith("Plus de 20 blocages")));
assert.ok(r.conseils.some((item) => item.startsWith("Plus de 15 points")));
close(r.dealsPerdus, 2.4);
assert.ok(r.recap.includes("2,4 affaires refroidies et"));
assert.ok(r.recap.includes("1,5 incident et"));

r = computeAccessCost({
  membres: 2,
  adminsEnTrop: 0,
  incidentsParAdmin: 0,
  heuresParIncident: 0,
  blocagesParMois: 0,
  minutesParBlocage: 0,
  demandesRefroidies: 0,
  pointsSignaturePerdus: 0,
  tauxHoraire: 45,
  panierMoyen: 1000,
  heuresMiseEnOrdre: 40,
});
close(r.coutNetMensuelEvite, -150);
assert.strictEqual(r.heuresNettes, 0);
assert.strictEqual(r.verdict.tone, "ok");
assert.ok(r.verdict.text.includes("-150" + NB + "€"));
assert.ok(r.recap.includes("0 blocage par mois de 0 min"));

const at = (target: number) =>
  computeAccessCost({
    membres: 1,
    adminsEnTrop: 0,
    incidentsParAdmin: 0,
    heuresParIncident: 0,
    blocagesParMois: 1,
    minutesParBlocage: 0,
    demandesRefroidies: 1,
    pointsSignaturePerdus: 100,
    tauxHoraire: 0,
    panierMoyen: target,
    heuresMiseEnOrdre: 0,
  });
assert.strictEqual(at(1000).verdict.tone, "bad");
assert.strictEqual(at(999).verdict.tone, "warn");
assert.strictEqual(at(250).verdict.tone, "warn");
assert.strictEqual(at(249).verdict.tone, "ok");

function assertCostVerdictColors(relative: string) {
  const source = readFileSync(join(process.cwd(), relative), "utf8");
  assert.match(source, /tone === "bad" \? "text-rose-700"/);
  assert.match(source, /tone === "ok" \? "text-emerald-700"/);
  assert.match(source, /if \(tone === "ok"\) return "bg-emerald-50 text-emerald-800"/);
  assert.match(source, /if \(tone === "bad"\) return "bg-rose-50 text-rose-800"/);
  assertNoDashes(source, relative);
}

assertCostVerdictColors("src/components/marketing/cout-acces-mal-cadres-equipe-devis-calculator.tsx");
assert.ok(computeAccessCost(base).coutNetMensuelEvite >= 1000);
assert.strictEqual(computeAccessCost(base).verdict.tone, "bad");
assert.ok(at(249).coutNetMensuelEvite < 250);
assert.strictEqual(at(249).verdict.tone, "ok");

assertCostVerdictColors("src/components/marketing/cout-campagnes-email-sans-segmentation-calculator.tsx");
const campaignHigh = computeCampaignWaste(CAMPAIGN_WASTE_DEFAULTS);
assert.ok(campaignHigh.coutMensuel >= 2000);
assert.strictEqual(campaignHigh.verdict.tone, "bad");
const campaignLow = computeCampaignWaste({
  campagnesParMois: 1,
  tailleListe: 1,
  pctSansSegment: 0,
  minutesPreparation: 0,
  pctPlaintes: 0,
  minutesParPlainte: 0,
  pctDejaAutopilote: 0,
  tauxHoraire: 0,
  panierMoyen: 0,
  pctDealsFroids: 0,
});
assert.ok(campaignLow.coutMensuel < 400);
assert.strictEqual(campaignLow.verdict.tone, "ok");

assert.ok(
  !/[\u2013\u2014]/.test(
    computeAccessCost(base).recap +
      computeAccessCost({ ...base, membres: 1, adminsEnTrop: 1 }).conseils.join(" "),
  ),
);
