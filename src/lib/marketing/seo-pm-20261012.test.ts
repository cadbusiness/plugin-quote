import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_CHARGE_AUTOPILOTE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { AUTOPILOT_LOAD_DEFAULTS, buildRecap, computeAutopilotLoad, fmtEur, fmtNum } from "./charge-relances-manuelles-vs-autopilote";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "autopilote-workflows-relance-demande-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const TOOL_PATH = "/outils/estimateur-charge-relances-manuelles-vs-autopilote";
const RGPD_PATH = "/blog/rgpd-demande-devis-b2b-consentement-conservation";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_CHARGE_AUTOPILOTE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["relances", "funnel"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.automations);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 15);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, "2026-10-12");
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

assert.equal(BLOG_TOOLS.length, 54);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["relances", "funnel"]);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-quatre outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-quatre outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(54), outilsHubIntro());
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, "2026-10-12");
}

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "2026-10-12"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, "2026-10-12");
}
assert.match(sitemapSrc, new RegExp(`"${RGPD_PATH}": "2026-10-12"`));

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(
  llms,
  /Autopilote et workflows : relancer chaque demande de devis B2B sans y penser : https:\/\/www\.quotebuilder\.co\/blog\/autopilote-workflows-relance-demande-devis-b2b/,
);
assert.match(
  llms,
  /Estimateur de charge : relances manuelles ou Autopilote : https:\/\/www\.quotebuilder\.co\/outils\/estimateur-charge-relances-manuelles-vs-autopilote/,
);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /estimateur-charge-relances-manuelles-vs-autopilote/);
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
    blogBody.startsWith("# Autopilote et workflows : relancer chaque demande de devis B2B sans y penser"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assert.match(blogBody, /quote\.submitted/);
  assert.match(blogBody, /session\.abandoned/);
  assert.match(blogBody, /quote\.status_changed/);
  assert.match(blogBody, /Parcours demande/);
  assert.match(blogBody, /Parcours abandon/);
  assert.match(blogBody, /Rappel interne si non traité/);
  assert.match(blogBody, /Seconde relance reprise/);
  assert.match(blogBody, /Joindre le récapitulatif/);
  assert.match(blogBody, /Depuis la dernière activité/);
  assert.match(blogBody, /\/api\/cron\/automations/);
  assert.ok(blogBody.includes("*/15 * * * *"));
  assert.match(blogBody, /\/outils\/estimateur-charge-relances-manuelles-vs-autopilote/);
  assert.doesNotMatch(blogBody, /92 %/);
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assertNoDashes(blogRaw, "autopilote md");
  assertNoDashes(blogBody, "autopilote body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 4261);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "autopilote");
}

{
  const rgpdRaw = readFileSync(join(blogDir, "rgpd-demande-devis-b2b-consentement-conservation.md"), "utf8");
  const rgpdBody = stripFrontmatter(rgpdRaw);
  assert.doesNotMatch(rgpdBody, /avec le motif « pas de consentement marketing »/);
  assert.match(rgpdBody, /compté parmi les ignorés dans le bilan de la campagne/);
  assert.equal(
    BLOG_FAQ["rgpd-demande-devis-b2b-consentement-conservation"]?.find(
      (item) => item.q === "Peut-on envoyer une campagne à un prospect qui n'a pas coché la case ?",
    )?.a,
    "Non. QuoteBuilder l'écarte automatiquement de l'envoi, et il est compté parmi les ignorés dans le bilan de la campagne.",
  );
}

const addedSources = [
  "src/lib/marketing/charge-relances-manuelles-vs-autopilote.ts",
  "src/lib/marketing/seo-pm-20261012.test.ts",
  "src/components/marketing/charge-relances-manuelles-vs-autopilote-calculator.tsx",
  "src/app/(marketing)/outils/estimateur-charge-relances-manuelles-vs-autopilote/page.tsx",
];
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/estimateur-charge-relances-manuelles-vs-autopilote/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /autopilote-workflows-relance-demande-devis-b2b/);
assert.match(toolPage, /\/fonctionnalites\/autopilote/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /Pour lire vos chiffres/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /estimateur-charge-relances-manuelles-vs-autopilote/);

const close = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const base = { ...AUTOPILOT_LOAD_DEFAULTS };

let r = computeAutopilotLoad(base);
assert.strictEqual(r.touchesMois, 160);
assert.strictEqual(r.heuresManuelles, 16);
assert.strictEqual(r.coutTemps, 720);
assert.strictEqual(r.demandesSansSuite, 14);
assert.strictEqual(r.ecartTaux, 0.12);
close(r.dealsPerdus, 1.68);
close(r.caManque, 7560);
close(r.heuresSetupMensuel, 2 / 12);
close(r.coutSetupMensuel, 7.5);
close(r.heuresNettesGagnees, 16 - 2 / 12);
close(r.coutNetMensuelEvite, 8272.5);
close(r.coutNetAnnuelEvite, 99270);
assert.strictEqual(r.verdict.tone, "ok");
assert.ok(r.verdict.text.includes("8" + NB + "273" + NB + "€ par mois"));
assert.ok(!r.conseils.some((item) => item.startsWith("Moins de 10 demandes")));
assert.ok(!r.conseils.some((item) => item.startsWith("Plus de 4 heures")));
assert.ok(!r.conseils.some((item) => item.startsWith("Moins de 5 points")));
assert.ok(r.conseils.some((item) => item.startsWith("Le chiffre d'affaires manqué pèse plus de trois fois")));
assert.ok(r.conseils.some((item) => item.includes("L'appel du commercial et la visite restent à faire")));

assert.ok(r.recap.includes("Hypothèses : 40 demandes par mois, 4 touches à la main par demande, 6 min par touche, coût horaire 45" + NB + "€, 35 % des demandes avec une touche qui saute, panier 4" + NB + "500" + NB + "€, signature 22 % avec suite et 10 % sans suite, mise en place 2 h."));
assert.ok(r.recap.includes("Suivi à la main : 160 touches et 16 h par mois, soit 720" + NB + "€ de temps."));
assert.ok(r.recap.includes("Demandes sans suite complète : 14 par mois, soit 1,7 affaire perdue et 7" + NB + "560" + NB + "€ de chiffre d'affaires manqué."));
assert.ok(r.recap.includes("Mise en place amortie sur 12 mois : 7,50" + NB + "€ par mois."));
assert.ok(r.recap.includes("Coût mensuel évité : 8" + NB + "273" + NB + "€ (99" + NB + "270" + NB + "€ sur 12 mois), avec 15,8 h nettes rendues par mois."));
assert.ok(r.recap.endsWith("Calcul : quotebuilder.co/outils/estimateur-charge-relances-manuelles-vs-autopilote"));
assert.strictEqual(buildRecap(base), r.recap);
assert.ok(!/ €/.test(r.recap), "espace normale avant €");

assert.strictEqual(fmtEur(7.5), "7,50" + NB + "€");
assert.strictEqual(fmtEur(720), "720" + NB + "€");
assert.strictEqual(fmtEur(8272.5), "8" + NB + "273" + NB + "€");
assert.strictEqual(fmtEur(7560), "7" + NB + "560" + NB + "€");
assert.strictEqual(fmtEur(-149.25), "-149,25" + NB + "€");
assert.strictEqual(fmtEur(0), "0" + NB + "€");
assert.strictEqual(fmtEur(null), "n/a");
assert.strictEqual(fmtNum(1.68), "1,7");
assert.strictEqual(fmtNum(15.8333), "15,8");
assert.strictEqual(fmtNum(2 / 12), "0,2");
assert.strictEqual(fmtNum(160), "160");
assert.strictEqual(fmtNum(12000), "12" + NB + "000");
assert.strictEqual(fmtNum(-1.7), "-1,7");
assert.strictEqual(fmtNum(-0.01), "0");
assert.strictEqual(fmtNum(undefined), "n/a");

r = computeAutopilotLoad({ ...base, demandesParMois: 0 });
assert.strictEqual(r.verdict.tone, "neutral");
assert.ok(r.verdict.text.startsWith("Saisissez"));
assert.strictEqual(r.heuresManuelles, 0);
close(r.coutNetMensuelEvite, -7.5);
r = computeAutopilotLoad({ ...base, demandesParMois: "" });
assert.strictEqual(r.demandes, 0);
assert.strictEqual(r.verdict.tone, "neutral");

r = computeAutopilotLoad({
  ...base,
  pctSansSuiteManuelle: 150,
  tauxCloseAvecSuite: 180,
  tauxCloseSansSuite: -5,
  heuresSetupAutopilote: 100,
  panierMoyen: "abc",
  minutesParTouche: -3,
});
assert.strictEqual(r.pctSansSuite, 100);
assert.strictEqual(r.tauxAvec, 100);
assert.strictEqual(r.tauxSans, 0);
assert.strictEqual(r.heuresSetup, 40);
assert.strictEqual(r.panier, 0);
assert.strictEqual(r.minutes, 0);
assert.strictEqual(r.heuresManuelles, 0);
assert.strictEqual(r.ecartTaux, 1);
assert.strictEqual(r.caManque, 0);
assert.ok(r.conseils.some((item) => item.startsWith("Plus de 4 heures")));
r = computeAutopilotLoad({ ...base, demandesParMois: -10, heuresSetupAutopilote: -1 });
assert.strictEqual(r.demandes, 0);
assert.strictEqual(r.heuresSetup, 0);

r = computeAutopilotLoad({ ...base, tauxCloseAvecSuite: 10, tauxCloseSansSuite: 22 });
assert.strictEqual(r.ecartTaux, 0);
assert.strictEqual(r.dealsPerdus, 0);
assert.strictEqual(r.caManque, 0);
close(r.coutNetMensuelEvite, 712.5);
assert.strictEqual(r.verdict.tone, "warn");
assert.ok(r.conseils.some((item) => item.startsWith("Votre taux de signature sans suite dépasse")));
assert.ok(!r.conseils.some((item) => item.startsWith("Moins de 5 points")));

r = computeAutopilotLoad({
  demandesParMois: 20,
  touchesManuellesParDemande: 3,
  minutesParTouche: 5,
  tauxHoraire: 40,
  pctSansSuiteManuelle: 20,
  panierMoyen: 2000,
  tauxCloseAvecSuite: 20,
  tauxCloseSansSuite: 15,
  heuresSetupAutopilote: 2,
});
assert.strictEqual(r.heuresManuelles, 5);
assert.strictEqual(r.coutTemps, 200);
assert.strictEqual(r.demandesSansSuite, 4);
assert.strictEqual(r.ecartTaux, 0.05);
close(r.dealsPerdus, 0.2);
close(r.caManque, 400);
close(r.coutNetMensuelEvite, 200 + 400 - 80 / 12);
assert.strictEqual(r.verdict.tone, "warn");
assert.ok(r.verdict.text.startsWith("Écart modéré"));
assert.ok(!r.conseils.some((item) => item.startsWith("Moins de 5 points")));
assert.ok(r.recap.includes("soit 0,2 affaire perdue et 400" + NB + "€"));

r = computeAutopilotLoad({
  demandesParMois: 5,
  touchesManuellesParDemande: 2,
  minutesParTouche: 5,
  tauxHoraire: 30,
  pctSansSuiteManuelle: 10,
  panierMoyen: 1000,
  tauxCloseAvecSuite: 15,
  tauxCloseSansSuite: 12,
  heuresSetupAutopilote: 2,
});
close(r.heuresManuelles, 10 / 12);
close(r.coutTemps, 25);
close(r.caManque, 15);
close(r.coutNetMensuelEvite, 35);
assert.strictEqual(r.verdict.tone, "bad");
assert.ok(r.verdict.text.startsWith("Écart faible"));
assert.ok(r.conseils.some((item) => item.startsWith("Moins de 10 demandes")));
assert.ok(r.conseils.some((item) => item.startsWith("Moins de 5 points")));

r = computeAutopilotLoad({
  demandesParMois: 1,
  touchesManuellesParDemande: 1,
  minutesParTouche: 1,
  tauxHoraire: 45,
  pctSansSuiteManuelle: 0,
  panierMoyen: 1000,
  tauxCloseAvecSuite: 20,
  tauxCloseSansSuite: 10,
  heuresSetupAutopilote: 40,
});
close(r.coutTemps, 0.75);
close(r.coutSetupMensuel, 150);
close(r.coutNetMensuelEvite, -149.25);
assert.strictEqual(r.heuresNettesGagnees, 0);
assert.strictEqual(r.verdict.tone, "bad");
assert.ok(r.verdict.text.includes("-149,25" + NB + "€"));
assert.ok(r.conseils.some((item) => item.startsWith("Vous estimez qu'aucune touche ne saute")));

r = computeAutopilotLoad({ ...base, demandesParMois: 100, touchesManuellesParDemande: 8 });
assert.ok(r.conseils.some((item) => item.startsWith("Plus de 6 touches")));
close(r.dealsPerdus, 4.2);
assert.ok(r.recap.includes("soit 4,2 affaires perdues et"));

const at = (target: number) =>
  computeAutopilotLoad({
    demandesParMois: 1,
    touchesManuellesParDemande: 0,
    minutesParTouche: 0,
    tauxHoraire: 0,
    pctSansSuiteManuelle: 100,
    panierMoyen: target,
    tauxCloseAvecSuite: 100,
    tauxCloseSansSuite: 0,
    heuresSetupAutopilote: 0,
  });
assert.strictEqual(at(1500).verdict.tone, "ok");
assert.strictEqual(at(1499).verdict.tone, "warn");
assert.strictEqual(at(400).verdict.tone, "warn");
assert.strictEqual(at(399).verdict.tone, "bad");

assert.ok(
  !/[\u2013\u2014]/.test(
    computeAutopilotLoad(base).recap +
      computeAutopilotLoad({ ...base, demandesParMois: 5, heuresSetupAutopilote: 8 }).conseils.join(" "),
  ),
);
