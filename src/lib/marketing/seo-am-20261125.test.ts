import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { articleHtml } from "./article-html";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_CESSION_CONTRAT,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";
import {
  DEFAULTS,
  LABEL_SETS,
  POINTS,
  SLUG,
  STATUT_LABELS,
  computeCession,
  dec,
  ent,
  fmtEur,
  fmtNum,
  fmtPct,
  normalize,
  pluriel,
  round2,
} from "./verificateur-cession-contrat-changement-client";

const FORBIDDEN = /[\u2014\u2013\u2212]/;
const blogDir = join(process.cwd(), "src/content/blog");
const BLOG_SLUG = "cession-contrat-changement-client-article-1216-devis-b2b";
const BLOG_PATH = "/blog/cession-contrat-changement-client-article-1216-devis-b2b";
const SECTOR_SLUG = "funnel-devis-arrosage-automatique-irrigation";
const SECTOR_PATH = "/secteurs/funnel-devis-arrosage-automatique-irrigation";
const TOOL_PATH = "/outils/verificateur-cession-contrat-changement-client";
const DAY = "2026-11-25";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];
const TOOL_TITLE = "Vérificateur de cession de contrat et de changement de client";
const TOOL_H1 = "Vérificateur de cession de contrat et de changement de client (article 1216)";
const TOOL_TEXT =
  "Le client passe la commande à une autre société : votre accord, l'écrit, la libération du cédant, la répartition de l'acompte, dix points de l'article 1216, la clause et le courrier.";
const PRIOR_TOOL = "/outils/verificateur-devoir-conseil-client-professionnel";
const PRIOR_SECTOR = "/secteurs/funnel-devis-elagage-abattage-arbres";
const HUB_101 = "Cent un outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.";
const HUB_100 = "Cent outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.";

type Controle = { id: string; point: string; statut: string; texte: string };
type Cession = {
  x: { P: number; paid: number; av: number; d: number; operation: string; imputation: string };
  incomplet: boolean;
  cession: boolean;
  execute: number;
  reste: number;
  solde: number;
  surplus: number;
  dueCedant: number;
  dueCessionnaire: number;
  exposition: number;
  executeLabel: string;
  resteLabel: string;
  soldeLabel: string;
  cedantLabel: string;
  cessionnaireLabel: string;
  expositionLabel: string;
  controles: Controle[];
  nbOk: number;
  nbWarn: number;
  nbBad: number;
  nbInfo: number;
  etat: string;
  verdict: string;
  actions: string[];
  clause: string;
  message: string;
  recap: string;
};

const run = (overrides: Record<string, string>) => computeCession({ ...DEFAULTS, ...overrides }) as unknown as Cession;
const S = (result: Cession) => result.controles.map((item) => item.statut).join(",");
const C = (result: Cession, id: string) => result.controles.find((item) => item.id === id);

assert.equal(SLUG, "verificateur-cession-contrat-changement-client");
assert.equal(BLOG_TOOL_CESSION_CONTRAT, TOOL_PATH);
assert.equal(BLOG_POSTS.some((post) => post.slug === SECTOR_SLUG), false);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisListe);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 38);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, DAY);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.ok(BLOG_TOOLS.some((item) => item.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.title, TOOL_TITLE);
assert.deepEqual(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags, ["catalogue", "relances"]);
assert.equal(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.text, TOOL_TEXT);
assert.ok(BLOG_TOOLS.find((item) => item.href === TOOL_PATH)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
assert.ok(BLOG_TOOLS.findIndex((item) => item.href === TOOL_PATH) > BLOG_TOOLS.findIndex((item) => item.href === PRIOR_TOOL));

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, DAY);
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === SECTOR_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === PRIOR_SECTOR)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.ok(paths.indexOf(BLOG_PATH) > paths.indexOf(PRIOR_TOOL));
assert.ok(paths.indexOf(SECTOR_PATH) > paths.indexOf(BLOG_PATH));
assert.ok(paths.indexOf(TOOL_PATH) > paths.indexOf(SECTOR_PATH));

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "${DAY}"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, DAY);
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
const blogTitle = BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title ?? "";
assert.ok(llms.includes(`${blogTitle} : https://www.quotebuilder.co${BLOG_PATH}`));
assert.ok(llms.includes(`Funnel de devis arrosage automatique et irrigation : https://www.quotebuilder.co${SECTOR_PATH}`));
assert.ok(llms.includes(`${TOOL_H1} : https://www.quotebuilder.co${TOOL_PATH}`));
assert.ok(llms.indexOf(`https://www.quotebuilder.co${BLOG_PATH}`) > llms.indexOf(`https://www.quotebuilder.co${PRIOR_TOOL}`));
assert.ok(llms.indexOf(`https://www.quotebuilder.co${TOOL_PATH}`) > llms.indexOf(`https://www.quotebuilder.co${BLOG_PATH}`));
assert.ok(llms.indexOf(`https://www.quotebuilder.co${SECTOR_PATH}`) > llms.indexOf(`https://www.quotebuilder.co${PRIOR_SECTOR}`));

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.ok(outilsHub.includes("verificateur-cession-contrat-changement-client"));
assert.ok(outilsHub.includes(TOOL_TITLE));
assert.ok(outilsHub.includes(TOOL_TEXT));
assert.ok(outilsHub.includes("vérificateur de cession de contrat et de changement de client"));
{
  const start = outilsHub.indexOf('href: "/outils/verificateur-cession-contrat-changement-client"');
  assert.ok(start > outilsHub.indexOf('href: "/outils/verificateur-devoir-conseil-client-professionnel"'));
  assert.match(outilsHub.slice(start, start + 500), /eyebrow: "Pilotage"/);
}
assert.ok(outilsHub.includes("outilsHubIntro()"));

const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.ok(secteursHub.includes(SECTOR_PATH));
assert.ok(secteursHub.includes("Arrosage et irrigation"));
assert.ok(secteursHub.indexOf(SECTOR_PATH) > secteursHub.indexOf(PRIOR_SECTOR));

assert.equal(BLOG_TOOLS.length, 101);
assert.equal(BLOG_POSTS.length, 111);
assert.equal(outilsHubIntro(), HUB_101);
assert.equal(outilsHubIntro(101), outilsHubIntro());
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());
assert.equal(outilsHubIntro(100), HUB_100);

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
  assert.equal(FORBIDDEN.test(text), false, `${label} has a long dash or typographic minus`);
}

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  const blogBody = stripFrontmatter(blogRaw);
  const title = blogRaw.match(/^title: "([\s\S]*?)"$/m)?.[1];
  const description = blogRaw.match(/^description: "([\s\S]*?)"$/m)?.[1];
  assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title, title);
  assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description, description);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertNoDashes(blogRaw, "blog md");
  assertInternalLinks(blogBody, "blog");
  const norm = blogBody.replace(/[\u00a0\u202f]/g, " ");
  for (const needle of [
    "1216",
    "1216-1",
    "1216-2",
    "1216-3",
    "1103",
    "1193",
    "1199",
    "L236-3",
    "1844-5",
    "L642-7",
    "22-15.958",
    "20-18.490",
    "48 000",
    "14 400",
    "16 800",
    "2 400",
    "31 200",
    "33 600",
    "hypothèses d'exemple",
    "non contractuel",
    "Gagné",
    "Compléter la demande",
    "/outils/verificateur-cession-contrat-changement-client",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(norm.includes(needle), `blog missing ${needle}`);
  }
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  const html = articleHtml(blogBody);
  assert.ok((html.match(/<table/g) ?? []).length >= 4, "markdown tables");
  assert.ok((blogBody.match(/^\d+\. /gm) ?? []).length >= 4, "numbered lists in markdown");
  assert.ok((html.match(/<ul/g) ?? []).length >= 1, "lists rendered");
  assert.ok((html.match(/<blockquote/g) ?? []).length >= 1, "citations");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  const sectorBody = stripFrontmatter(sectorRaw);
  const pageSrc = readFileSync(join(process.cwd(), `src/app/(marketing)/secteurs/${SECTOR_SLUG}/page.tsx`), "utf8");
  assert.equal(faqQuestionCount(sectorBody), 10);
  const fromMd = faqFromMarkdown(sectorBody);
  const questions = [...pageSrc.matchAll(/\bq: "([^"]*)"/g)].map((match) => match[1]);
  const answers = [...pageSrc.matchAll(/\ba: "([^"]*)"/g)].map((match) => match[1]);
  assert.equal(questions.length, 10);
  assert.deepEqual(fromMd, questions.map((q, index) => ({ q, a: answers[index] })));
  assertNoDashes(sectorRaw, "sector md");
  assertNoDashes(pageSrc, "sector page");
  assertInternalLinks(sectorBody, "sector");
  assert.ok(pageSrc.includes('about: "Arrosage automatique et irrigation"'));
  assert.ok(pageSrc.includes("Secteur · Arrosage et irrigation"));
  assert.ok(pageSrc.includes('title="Essayer gratuitement"'));
  assert.ok(pageSrc.includes("QuoteBuilder n'a pas de template arrosage ou irrigation : partez de Paysagiste."));
  for (const href of [
    "/blog/reconduction-tacite-preavis-resiliation-devis-b2b",
    "/outils/calculateur-preavis-reconduction-tacite",
    "/secteurs/funnel-devis-paysagiste-amenagement-jardin",
    "/fonctionnalites/espace-prospect",
  ]) {
    assert.ok(pageSrc.includes(href), href);
  }
  const norm = sectorBody.replace(/[\u00a0\u202f]/g, " ");
  for (const needle of [
    "Paysagiste",
    "Funnel jardin",
    "Plan (PDF ou image)",
    "R211-66",
    "R1321-57",
    "L2224-9",
    "1792-3",
    "R554-1",
    "vigilance",
    "alerte renforcée",
    "15 000",
    "Warm",
    "Cold",
    "/fonctionnalites/espace-prospect",
    "/blog/cession-contrat-changement-client-article-1216-devis-b2b",
  ]) {
    assert.ok(norm.includes(needle), `sector missing ${needle}`);
  }
}

const templates = readFileSync(join(process.cwd(), "src/lib/funnels/templates.ts"), "utf8");
{
  const start = templates.indexOf('id: "garden"');
  const next = templates.indexOf('\n    id: "', start + 1);
  const garden = templates.slice(start, next);
  assert.ok(start >= 0 && next > start);
  assert.ok(garden.includes('label: "Paysagiste"'));
  assert.ok(garden.includes('key: "usage"'));
  assert.ok(garden.includes('key: "surface"'));
  assert.ok(garden.includes('key: "upkeep"'));
  assert.ok(garden.includes("max: 5000"));
}
assert.ok(readFileSync(join(process.cwd(), "src/lib/quotes/score.ts"), "utf8").includes("surface"));
const builder = readFileSync(join(process.cwd(), "src/lib/funnels/builder.ts"), "utf8");
assert.ok(builder.includes("Texte"));
assert.ok(builder.includes("Liste"));
assert.ok(builder.includes("Mesure"));
assert.ok(builder.includes("Choix multiple"));
assert.ok(builder.includes("Fichier"));
assert.equal(builder.includes('type: "date"'), false);
const seed = readFileSync(join(process.cwd(), "src/lib/crm/seed.ts"), "utf8");
assert.ok(seed.includes("Gagné"));
assert.ok(seed.includes("Perdu"));
assert.ok(seed.includes("En attente"));
assert.match(readFileSync(join(process.cwd(), "src/lib/pdf/quote-pdf.tsx"), "utf8"), /Document indicatif, non contractuel/);
const crm = readFileSync(join(process.cwd(), "src/app/(app)/crm-actions.ts"), "utf8");
assert.equal(crm.includes("contact_name:"), false);
assert.equal(crm.includes("contact_company:"), false);
assert.equal(crm.includes("contact_email:"), false);
assert.equal(crm.includes("contact_phone:"), false);

const added = [
  "src/lib/marketing/verificateur-cession-contrat-changement-client.ts",
  "src/components/marketing/verificateur-cession-contrat-changement-client-calculator.tsx",
  "src/app/(marketing)/outils/verificateur-cession-contrat-changement-client/page.tsx",
  `src/app/(marketing)/secteurs/${SECTOR_SLUG}/page.tsx`,
  "src/lib/marketing/seo-am-20261125.test.ts",
  `src/content/blog/${BLOG_SLUG}.md`,
  `src/content/blog/${SECTOR_SLUG}.md`,
];
for (const rel of added) assertNoDashes(readFileSync(join(process.cwd(), rel), "utf8"), rel);

const pageSrc = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/verificateur-cession-contrat-changement-client/page.tsx"),
  "utf8",
);
const componentSrc = readFileSync(
  join(process.cwd(), "src/components/marketing/verificateur-cession-contrat-changement-client-calculator.tsx"),
  "utf8",
);
assert.ok(pageSrc.includes(TOOL_H1));
assert.ok(pageSrc.includes("Votre client annonce que la commande continue avec une autre société."));
assert.ok(pageSrc.includes("pas un conseil juridique"));
assert.ok(pageSrc.includes("Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."));
assert.ok(pageSrc.includes("Calcul local, aucune donnée envoyée."));
assert.ok(pageSrc.includes("WebApplication"));
assert.ok(pageSrc.includes(BLOG_PATH));
assert.ok(pageSrc.includes("/blog/pouvoir-signataire-devis-delegation-mandat-apparent-b2b"));
assert.ok(pageSrc.includes("/blog/cession-creance-affacturage-dailly-devis-b2b"));
assert.ok(pageSrc.includes("/blog/client-procedure-collective-declaration-creance-devis-b2b"));
assert.ok(pageSrc.includes("/outils/verificateur-pouvoir-signataire-devis"));
assert.ok(pageSrc.includes("/signup?plan=free"));
assert.ok(pageSrc.includes("/c/demo/rayonnage"));
assert.ok(pageSrc.includes("/tarifs"));
assert.equal(pageSrc.includes('type="date"'), false);
assert.equal(componentSrc.includes('type="date"'), false);
assert.ok(componentSrc.includes("lus le 25 novembre 2026"));
assert.ok(componentSrc.includes("22-15.958"));
assert.ok(componentSrc.includes("20-18.490"));
assert.equal((componentSrc.match(/<CopyButton /g) ?? []).length, 3);
for (const label of [
  "L'opération",
  "Ce que vous avez fait",
  "La commande",
  "Ce qui s'est passé",
  "Qui change",
  "Votre accord",
  "Libération du cédant",
  "Acte entre cédant et cessionnaire",
  "Notification ou paiement du nouveau client",
  "Vérifications sur le nouveau client",
  "Garanties et cautions",
  "Avenant à trois parties",
  "Clause de votre devis sur la cession",
  "Prix de la commande (€ HT)",
  "Acompte déjà reçu (€ HT)",
  "Avancement à la date d'effet (%)",
  "Part du travail exécutée avant la cession.",
  "Imputation de l'acompte",
  "Délai d'information avant la cession, pour votre clause (jours)",
  "Le résultat",
  "Travail exécuté",
  "Reste à exécuter",
  "Solde total",
  "À payer par le cédant",
  "À payer par le cessionnaire",
  "Points bloquants / à revoir",
  "Le contrôle point par point",
  "La clause à écrire dans vos devis",
  "Ce qu'il faut faire",
  "Le courrier au client",
  "Récapitulatif",
]) {
  assert.ok(componentSrc.includes(label), label);
}

assert.equal(Object.keys(DEFAULTS).length, 15);
assert.equal(POINTS.length, 10);
assert.equal(Object.keys(LABEL_SETS).length, 11);
assert.deepEqual(STATUT_LABELS, { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" });
assert.equal(fmtNum(1234.5), "1 234,50");
assert.equal(fmtNum(266.40000000000003), "266,40");
assert.equal(fmtNum(48000), "48 000");
assert.equal(fmtNum(-3.2), "-3,20");
assert.equal(fmtNum(0), "0");
assert.equal(fmtEur(2400), "2 400 € HT");
assert.equal(fmtPct(35), "35 %");
assert.equal(dec("1 234,5"), 1234.5);
assert.ok(Number.isNaN(dec("abc")));
assert.ok(Number.isNaN(dec("")));
assert.equal(ent("15,9"), 15);
const plural = pluriel as (n: number, singular: string, pluralForm?: string) => string;
assert.equal(plural(1, "jour"), "1 jour");
assert.equal(plural(15, "jour"), "15 jours");
assert.equal(plural(2, "point bloquant", "points bloquants"), "2 points bloquants");
assert.equal(round2(1.005 + 1e-9), 1.01);

const empty = normalize({}) as { operation: string; P: number; paid: number; av: number; d: number };
assert.equal(empty.operation, DEFAULTS.operation);
assert.equal(empty.P, 48000);
assert.equal(empty.paid, 14400);
assert.equal(empty.av, 35);
assert.equal(empty.d, 15);
const bad = normalize({ operation: "zzz", accord: "?", prix: "abc", acompte: "-5", avancement: "250", delai: "0" }) as {
  operation: string;
  accord: string;
  P: number;
  paid: number;
  av: number;
  d: number;
};
assert.equal(bad.operation, DEFAULTS.operation);
assert.equal(bad.accord, DEFAULTS.accord);
assert.equal(bad.P, 0);
assert.equal(bad.paid, 0);
assert.equal(bad.av, 100);
assert.equal(bad.d, 15);
assert.equal((normalize({ prix: "1000", acompte: "5000" }) as { paid: number }).paid, 1000);
assert.equal((normalize({ prix: "10 000,50", delai: "400" }) as { P: number; d: number }).P, 10000.5);
assert.equal((normalize({ prix: "10 000,50", delai: "400" }) as { d: number }).d, 365);

const base = run({});
assert.equal(base.execute, 16800);
assert.equal(base.reste, 31200);
assert.equal(base.solde, 33600);
assert.equal(base.dueCedant, 2400);
assert.equal(base.dueCessionnaire, 31200);
assert.equal(base.dueCedant + base.dueCessionnaire + base.x.paid, 48000);
assert.equal(base.executeLabel, "16 800 € HT");
assert.equal(base.resteLabel, "31 200 € HT");
assert.equal(base.soldeLabel, "33 600 € HT");
assert.equal(base.cedantLabel, "2 400 € HT");
assert.equal(base.cessionnaireLabel, "31 200 € HT");
assert.equal(base.expositionLabel, "Aucune : le cédant reste tenu");
assert.equal(base.controles.length, 10);
assert.deepEqual(base.controles.map((item) => item.id), POINTS.map((point: { id: string }) => point.id));
assert.equal(S(base), "info,ok,info,warn,info,ok,info,warn,info,warn");
assert.equal(base.nbBad, 0);
assert.equal(base.nbWarn, 3);
assert.equal(base.etat, "warn");
assert.equal(base.verdict, "Possible, avec 3 points à revoir avant de signer.");
assert.ok(base.clause.includes("au moins 15 jours avant la date d'effet"));
assert.ok(base.clause.includes("solidairement"));
assert.ok(base.message.includes("n'avons à ce jour donné aucun accord"));
assert.ok(base.recap.includes("pas un conseil juridique"));
assert.ok(base.recap.includes("2 400 € HT au cédant, 31 200 € HT au cessionnaire"));

const suit = run({ imputation: "suit" });
assert.equal(suit.dueCedant, 0);
assert.equal(suit.dueCessionnaire, 33600);
assert.equal(suit.cedantLabel, "0 € HT");
const surplus = run({ avancement: "20", acompte: "14400" });
assert.equal(surplus.execute, 9600);
assert.equal(surplus.dueCedant, 0);
assert.equal(surplus.surplus, 4800);
assert.equal(surplus.dueCessionnaire, 33600);
const none = run({ avancement: "0", acompte: "0" });
assert.equal(none.dueCedant, 0);
assert.equal(none.dueCessionnaire, 48000);
const done = run({ avancement: "100", acompte: "14400" });
assert.equal(done.dueCedant, 33600);
assert.equal(done.dueCessionnaire, 0);
const missingPrice = run({ prix: "" });
assert.equal(missingPrice.incomplet, true);
assert.ok(missingPrice.verdict.startsWith("Indiquez le prix"));
assert.equal(missingPrice.dueCedant, 0);

for (const operation of ["fusion", "parts", "judiciaire", "nom"]) {
  const other = run({ operation });
  assert.equal(other.cession, false);
  assert.equal(other.cedantLabel, "Sans objet");
  assert.equal(other.dueCessionnaire, 33600);
  assert.equal(C(other, "accord")?.statut, "info");
  assert.equal(C(other, "acte")?.statut, "info");
  assert.equal(C(other, "liberation")?.statut, "info");
  assert.ok(other.actions.length >= 2);
}
assert.ok(C(run({ operation: "fusion" }), "operation")?.texte.includes("L236-3"));
assert.ok(run({ operation: "fusion" }).actions.join(" ").includes("1844-5"));
assert.equal(C(run({ operation: "judiciaire" }), "operation")?.statut, "warn");
assert.ok(C(run({ operation: "judiciaire" }), "operation")?.texte.includes("L642-7"));
assert.equal(C(run({ operation: "fonds" }), "operation")?.statut, "warn");
assert.equal(run({ operation: "fonds" }).cession, true);
assert.ok(C(run({ operation: "parts" }), "operation")?.texte.includes("même personne morale"));

const ambigu = run({ accord: "ambigu" });
assert.equal(C(ambigu, "accord")?.statut, "bad");
assert.equal(C(ambigu, "forme")?.statut, "warn");
assert.ok(C(ambigu, "accord")?.texte.includes("22-15.958"));
const signed = run({ accord: "expres", avenant: "signe" });
assert.equal(C(signed, "accord")?.statut, "ok");
assert.equal(C(signed, "forme")?.statut, "ok");
assert.equal(C(signed, "avenant")?.statut, "ok");
assert.ok(signed.message.includes("Nous acceptons la cession"));
assert.equal(C(run({ accord: "expres", avenant: "aucun" }), "accord")?.statut, "warn");
assert.equal(C(run({ accord: "expres", avenant: "aucun" }), "avenant")?.statut, "bad");
assert.equal(C(run({ accord: "avance", notification: "paiement" }), "notification")?.statut, "warn");
assert.ok(C(run({ accord: "avance", notification: "paiement" }), "notification")?.texte.includes("20-18.490"));
assert.equal(C(run({ accord: "aucun", notification: "paiement" }), "notification")?.statut, "bad");
assert.equal(C(run({ accord: "refuse", notification: "paiement" }), "notification")?.statut, "bad");
assert.equal(C(run({ notification: "ecrite" }), "notification")?.statut, "ok");
assert.equal(C(run({ acte: "oui" }), "acte")?.statut, "ok");
assert.equal(C(run({ acte: "refus" }), "acte")?.statut, "bad");
assert.equal(C(run({ liberation: "flou" }), "liberation")?.statut, "bad");
const freed = run({ liberation: "expresse", nouveau: "verifie", suretes: "aucune" });
assert.equal(C(freed, "liberation")?.statut, "warn");
assert.equal(freed.exposition, 31200);
assert.equal(freed.expositionLabel, "31 200 € HT");
assert.equal(C(run({ liberation: "expresse", nouveau: "partiel" }), "liberation")?.statut, "bad");
assert.equal(C(run({ liberation: "expresse", nouveau: "verifie", suretes: "aconfirmer" }), "liberation")?.statut, "bad");
assert.equal(C(run({ liberation: "expresse", nouveau: "verifie", suretes: "aconfirmer" }), "suretes")?.statut, "bad");
assert.ok(C(run({ suretes: "aconfirmer" }), "suretes")?.texte.includes("1216-3"));
assert.equal(C(run({ suretes: "aconfirmer" }), "suretes")?.statut, "warn");
assert.equal(C(run({ suretes: "maintenues" }), "suretes")?.statut, "ok");
assert.equal(C(run({ nouveau: "aucun" }), "nouveau")?.statut, "bad");
assert.equal(C(run({ nouveau: "verifie" }), "nouveau")?.statut, "ok");
assert.equal(C(run({ clause: "large" }), "clause")?.statut, "warn");
assert.equal(C(run({ clause: "groupe" }), "clause")?.statut, "ok");
const forbiddenClause = run({ clause: "interdit" });
assert.equal(C(forbiddenClause, "clause")?.statut, "ok");
assert.equal(forbiddenClause.clause.includes("même groupe"), false);
assert.ok(forbiddenClause.clause.includes("accord écrit préalable"));
assert.ok(run({ delai: "8" }).clause.includes("8 jours"));
assert.ok(run({ delai: "1" }).clause.includes("1 jour avant"));

const clean = run({
  accord: "expres",
  acte: "oui",
  notification: "ecrite",
  liberation: "aucune",
  suretes: "maintenues",
  nouveau: "verifie",
  avenant: "signe",
  clause: "groupe",
});
assert.equal(clean.nbBad, 0);
assert.equal(clean.nbWarn, 0);
assert.equal(clean.etat, "ok");
assert.ok(clean.verdict.startsWith("Le dossier est cohérent"));
const worst = run({
  accord: "ambigu",
  acte: "refus",
  notification: "paiement",
  liberation: "flou",
  suretes: "aconfirmer",
  nouveau: "aucun",
  avenant: "aucun",
  clause: "large",
});
assert.equal(worst.nbBad, 5);
assert.equal(worst.etat, "bad");
assert.match(worst.verdict, /point(s)? bloquant/);

const keys = Object.keys(LABEL_SETS);
const sizes = keys.map((key) => Object.keys(LABEL_SETS[key as keyof typeof LABEL_SETS]));
const total = sizes.reduce((acc, values) => acc * values.length, 1);
const amounts = [
  { prix: "48000", acompte: "14400", avancement: "35" },
  { prix: "1000", acompte: "0", avancement: "0" },
  { prix: "999,99", acompte: "999,99", avancement: "100" },
];
const bads = /undefined|NaN|\[object/;
let combos = 0;
for (let i = 0; i < total; i++) {
  let rest = i;
  const overrides: Record<string, string> = {};
  for (let j = 0; j < keys.length; j++) {
    const values = sizes[j];
    overrides[keys[j]] = values[rest % values.length];
    rest = Math.floor(rest / values.length);
  }
  const result = computeCession({ ...DEFAULTS, ...overrides, ...amounts[i % amounts.length] }) as unknown as Cession;
  combos += 1;
  assert.equal(result.controles.length, 10);
  result.controles.forEach((item, index) => {
    assert.equal(item.id, POINTS[index].id);
    assert.equal(item.point, POINTS[index].label);
    assert.ok(["ok", "warn", "bad", "info"].includes(item.statut));
    assert.ok(item.texte.length > 20);
  });
  assert.equal(result.nbOk + result.nbWarn + result.nbBad + result.nbInfo, 10);
  assert.equal(result.etat, result.nbBad > 0 ? "bad" : result.nbWarn > 0 ? "warn" : "ok");
  assert.ok(result.dueCedant >= 0 && result.dueCessionnaire >= 0 && result.surplus >= 0);
  assert.ok(Math.abs(result.dueCedant + result.dueCessionnaire + result.x.paid - result.x.P) < 0.011);
  assert.ok(result.actions.length >= 2 && result.actions.every((action) => action.length > 20));
  assert.ok(result.clause.includes("Cession du contrat.") && result.clause.includes("solidairement"));
  assert.ok(result.message.startsWith("Objet : "));
  assert.ok(result.recap.includes("pas un conseil juridique"));
  const all = result.controles.map((item) => item.texte).join(" ") + result.actions.join(" ") + result.clause + result.message + result.recap + result.verdict;
  assert.equal(FORBIDDEN.test(all), false);
  assert.equal(bads.test(all), false);
  if (!result.cession) assert.equal(result.cedantLabel, "Sans objet");
}
assert.equal(combos, total);
assert.ok(combos >= 20000);
