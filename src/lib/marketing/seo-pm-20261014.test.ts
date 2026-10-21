import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_SUIVI_CLIENTS, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import { clientQuoteStageLabel } from "@/lib/members/parse";
import { MEMBER_PAGE_TEMPLATES } from "@/lib/members/page-templates";
import { MEMBER_BLOCK_TYPES } from "@/lib/members/types";
import { MARKETING_ROUTES } from "./routes";
import {
  SUIVI_CLIENTS_DEFAULTS,
  buildRecap,
  computeSuiviClients,
  fmtEur,
  fmtNum,
} from "./temps-demandes-suivi-devis-clients";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "espace-membres-portail-client-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const TOOL_PATH = "/outils/estimateur-temps-demandes-suivi-devis-clients";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_SUIVI_CLIENTS, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["funnel", "relances"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Espace membres : un portail où vos clients B2B retrouvent tous leurs devis, documents et liens",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "Ce que voit un client connecté à l'espace membres, comment il s'y connecte avec l'email du devis et son code PIN, comment créer et remplir l'espace, ce que lisent vos clients quand vous changez un statut, et les limites à connaître avant de publier.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.devisDetail);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 15);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, "2026-10-14");
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

assert.equal(BLOG_POSTS.length, 62);
assert.equal(BLOG_TOOLS.length, 52);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title,
  "Estimateur du temps passé sur les demandes de suivi des clients",
);
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["funnel", "relances"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Questions « où en est mon devis ? », notices renvoyées. Le temps mensuel et ce qu'un espace membres en libre-service vous rend.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-deux outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-deux outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(52), outilsHubIntro());
assert.equal(outilsHubIntro(42), "Quarante-deux outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, "2026-10-14");
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "2026-10-14"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, "2026-10-14");
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(
  llms,
  /Espace membres : un portail où vos clients B2B retrouvent tous leurs devis, documents et liens : https:\/\/www\.quotebuilder\.co\/blog\/espace-membres-portail-client-devis-b2b/,
);
assert.match(
  llms,
  /Estimateur du temps passé sur les demandes de suivi des clients : https:\/\/www\.quotebuilder\.co\/outils\/estimateur-temps-demandes-suivi-devis-clients/,
);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /estimateur-temps-demandes-suivi-devis-clients/);
assert.match(outilsHub, /eyebrow: "Suivi client"/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
assert.match(outilsHub, /estimateur du temps passé sur les demandes de suivi des clients/);

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

assert.equal(clientQuoteStageLabel("in_progress"), "Devis envoyé");
assert.equal(clientQuoteStageLabel("contacted"), "En étude");
assert.equal(clientQuoteStageLabel("lost"), "Clôturé");
assert.equal(clientQuoteStageLabel("won"), "Accepté");
assert.equal(clientQuoteStageLabel("new"), "Reçu");
assert.equal(MEMBER_BLOCK_TYPES.length, 8);
for (const label of ["Documents", "Plugins et liens", "Comment ça marche", "Liens utiles", "Page vide"]) {
  assert.ok(
    MEMBER_PAGE_TEMPLATES.some((template) => template.label === label),
    label,
  );
}

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(blogBody.startsWith("# Espace membres : un portail où vos clients B2B retrouvent tous leurs devis, documents et liens"));
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /Espace membres/);
  assert.match(blogBody, /Mes devis/);
  assert.match(blogBody, /Ouvrir mon espace/);
  assert.match(blogBody, /Voir tous vos devis dans l'espace membres/);
  assert.match(blogBody, /Créer un espace membres/);
  assert.match(blogBody, /Que voient vos clients/);
  assert.match(blogBody, /Nom et lien public/);
  assert.match(blogBody, /Créer l'espace/);
  assert.match(blogBody, /Brouillon/);
  assert.match(blogBody, /Publier/);
  assert.match(blogBody, /Dépublier/);
  assert.match(blogBody, /Prévisualiser ouvre l'adresse publique d'un espace publié/);
  assert.match(blogBody, /Un brouillon renvoie une page introuvable/);
  assert.doesNotMatch(blogBody, /permet aussi de prévisualiser/);
  assert.match(blogBody, /Devis envoyé/);
  assert.match(blogBody, /En étude/);
  assert.match(blogBody, /Clôturé/);
  assert.match(blogBody, /\{\{membres_url\}\}/);
  assert.match(blogBody, /PIN à 6 chiffres/);
  assert.match(blogBody, /30 jours/);
  assert.match(blogBody, /12 Mo/);
  assert.match(blogBody, /noindex/);
  assert.match(blogBody, /\/fonctionnalites\/espace-prospect/);
  assert.match(blogBody, /\/outils\/estimateur-temps-demandes-suivi-devis-clients/);
  assert.match(blogBody, /Une ressource publiée est visible par toute personne connectée à l'espace\./);
  assert.match(blogBody, /Les essais de connexion sont limités/);
  assert.match(blogBody, /lien signé de courte durée/);
  assert.match(blogBody, /Un fichier déposé est privé/);
  assert.doesNotMatch(blogBody, /s'ouvre sans code/);
  assert.doesNotMatch(blogBody, /a une adresse publique/);
  assert.doesNotMatch(blogBody, /verrouill/i);
  assert.doesNotMatch(blogBody, /bucket/i);
  assert.doesNotMatch(blogBody, /ilike/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assert.match(blogBody, /\/fonctionnalites\/autopilote/);
  assert.match(blogBody, /statuts-pipeline-devis-b2b/);
  assert.match(blogBody, /roles-permissions-equipe-demande-devis-b2b/);
  assert.match(blogBody, /pieces-jointes-plans-photos-devis-b2b/);
  assert.match(blogBody, /rgpd-demande-devis-b2b-consentement-conservation/);
  assert.match(blogBody, /envoyer-devis-lien-securise-vs-pdf-email/);
  assert.match(blogBody, /suivi-ouverture-lecture-devis-en-ligne-b2b/);
  assert.match(blogBody, /approbation-client-multi-decideurs-devis-b2b/);
  assert.match(blogBody, /autopilote-workflows-relance-demande-devis-b2b/);
  assert.match(blogBody, /segments-campagnes-email-demande-devis-b2b/);
  assert.match(blogBody, /estimateur-cout-emails-clarification-devis/);
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assertNoDashes(blogRaw, "membres md");
  assertNoDashes(blogBody, "membres body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 3579);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "membres");
}

const addedSources = [
  "src/lib/marketing/temps-demandes-suivi-devis-clients.ts",
  "src/lib/marketing/seo-pm-20261014.test.ts",
  "src/components/marketing/temps-demandes-suivi-devis-clients-calculator.tsx",
  "src/app/(marketing)/outils/estimateur-temps-demandes-suivi-devis-clients/page.tsx",
  "src/content/blog/espace-membres-portail-client-devis-b2b.md",
];
assertNoDashes(
  (BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"),
  "membres faq",
);
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/estimateur-temps-demandes-suivi-devis-clients/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /estimateur-temps-demandes-suivi-devis-clients/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /espace-membres-portail-client-devis-b2b/);
assert.match(toolPage, /\/fonctionnalites\/espace-prospect/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /Pour lire vos chiffres/);
assert.match(toolPage, /Calcul local · aucune donnée envoyée/);
assert.match(toolPage, /hypothèses d&apos;exemple, pas des moyennes de marché/);
assert.doesNotMatch(toolPage, /\/blog\/espace-prospect-devis-en-ligne/);

const calculator = readFileSync(
  join(process.cwd(), "src/components/marketing/temps-demandes-suivi-devis-clients-calculator.tsx"),
  "utf8",
);
assert.match(calculator, /tone === "bad" \? "text-rose-700"/);
assert.match(calculator, /tone === "ok" \? "text-emerald-700"/);
assert.match(calculator, /tone === "warn" \? "text-amber-800"/);
assert.match(calculator, /: "text-mk-accent"/);
assert.match(calculator, /label="Gain net par mois"/);
assert.match(calculator, /tone=\{result\.verdict\.tone\}/);
assert.match(calculator, /if \(tone === "ok"\) return "bg-emerald-50 text-emerald-800"/);
assert.match(calculator, /if \(tone === "warn"\) return "bg-amber-50 text-amber-900"/);
assert.match(calculator, /if \(tone === "bad"\) return "bg-rose-50 text-rose-800"/);
assert.match(calculator, /hypothèses d&apos;exemple, pas des moyennes de marché/);

const close = (a: number | null, b: number, eps = 1e-6) => {
  assert.ok(a != null, "expected a number");
  assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
};
const base = { ...SUIVI_CLIENTS_DEFAULTS };

let r = computeSuiviClients(base);
assert.strictEqual(r.questionsMois, 60);
assert.strictEqual(r.heuresQuestions, 8);
assert.strictEqual(r.heuresDocuments, 1);
assert.strictEqual(r.heuresActuelles, 9);
assert.strictEqual(r.coutActuel, 405);
close(r.questionsEvitees, 21);
close(r.heuresEvitees, 3.3);
close(r.coutEvite, 148.5);
close(r.partTempsRendu, 36.666667);
close(r.heuresEntretien, 0.5);
close(r.coutEntretien, 22.5);
close(r.heuresMiseEnPlaceMensuel, 0.333333);
close(r.coutMiseEnPlaceMensuel, 15);
close(r.coutEntretienEtMiseEnPlace, 37.5);
close(r.heuresNettes, 2.466667);
close(r.gainNetMensuel, 111);
close(r.gainNetAnnuel, 1332);
close(r.moisRetour, 1.428571);
assert.strictEqual(r.verdict.tone, "warn");
assert.ok(r.verdict.text.startsWith("Gain modeste : environ 111" + NB + "€ par mois."));
assert.ok(r.conseils.some((item) => item.startsWith("Les documents de l'espace sont les mêmes pour tous les clients connectés")));
assert.ok(r.conseils.some((item) => item.includes("Un fichier déposé est privé et s'ouvre par un lien signé.")));
assert.ok(!r.conseils.some((item) => item.includes("adresse publique")));
assert.ok(r.conseils.some((item) => item.startsWith("L'espace membres regroupe les demandes d'une même adresse email.")));
assert.ok(!r.conseils.some((item) => item.startsWith("Moins de cinq clients")));
assert.ok(!r.conseils.some((item) => item.startsWith("Plus de la moitié des questions")));
assert.ok(!r.conseils.some((item) => item.startsWith("Plus de 80 %")));
assert.ok(!r.conseils.some((item) => item.startsWith("Zéro minute d'entretien")));
assert.ok(!r.conseils.some((item) => item.startsWith("La mise en place n'est pas rendue")));
assert.strictEqual(r.conseils.length, 2);

assert.strictEqual(r.recap.split("\n").length, 6);
assert.ok(
  r.recap.startsWith(
    "Hypothèses : 30 clients, 2 questions de suivi par client et par mois, 8 min par question, 70" +
      NB +
      "% sur des demandes de moins de 30 jours, 50" +
      NB +
      "% réglables seul dans l'espace, 12 documents renvoyés par mois de 5 min, coût horaire 45" +
      NB +
      "€, mise en place 4 h, entretien 30 min par mois.",
  ),
);
assert.ok(r.recap.includes("Aujourd'hui : 60 questions et 9 h de suivi par mois, soit 405" + NB + "€."));
assert.ok(r.recap.includes("Avec l'espace membres : 21 questions évitées et 3,3 h rendues par mois, soit 148,50" + NB + "€."));
assert.ok(r.recap.includes("Entretien et mise en place amortie sur 12 mois : 37,50" + NB + "€ par mois."));
assert.ok(
  r.recap.includes(
    "Gain net : 111" + NB + "€ par mois (1" + NB + "332" + NB + "€ sur 12 mois), avec 2,5 h nettes rendues par mois.",
  ),
);
assert.ok(r.recap.endsWith("Calcul : quotebuilder.co/outils/estimateur-temps-demandes-suivi-devis-clients"));
assert.strictEqual(buildRecap(base), r.recap);
assert.ok(!/ €/.test(r.recap), "espace normale avant €");
assert.ok(!/ %/.test(r.recap), "espace normale avant %");

assert.strictEqual(fmtEur(148.5), "148,50" + NB + "€");
assert.strictEqual(fmtEur(37.5), "37,50" + NB + "€");
assert.strictEqual(fmtEur(111), "111" + NB + "€");
assert.strictEqual(fmtEur(1332), "1" + NB + "332" + NB + "€");
assert.strictEqual(fmtEur(1234.56), "1" + NB + "235" + NB + "€");
assert.strictEqual(fmtEur(-22.5), "-22,50" + NB + "€");
assert.strictEqual(fmtEur(0), "0" + NB + "€");
assert.strictEqual(fmtEur(null), "n/a");
assert.strictEqual(fmtNum(2.466667), "2,5");
assert.strictEqual(fmtNum(36.666667), "36,7");
assert.strictEqual(fmtNum(1.428571), "1,4");
assert.strictEqual(fmtNum(12000), "12" + NB + "000");
assert.strictEqual(fmtNum(-0.01), "0");
assert.strictEqual(fmtNum(undefined), "n/a");

r = computeSuiviClients({ ...base, clientsActifs: 0 });
assert.strictEqual(r.verdict.tone, "neutral");
assert.ok(r.verdict.text.startsWith("Saisissez"));
assert.ok(!r.conseils.some((item) => item.startsWith("Moins de cinq clients")));
r = computeSuiviClients({ ...base, clientsActifs: "" });
assert.strictEqual(r.clients, 0);
assert.strictEqual(r.verdict.tone, "neutral");
r = computeSuiviClients({ ...base, clientsActifs: -3 });
assert.strictEqual(r.clients, 0);
r = computeSuiviClients({});
assert.strictEqual(r.verdict.tone, "neutral");
assert.strictEqual(r.partTempsRendu, 0);
assert.strictEqual(r.moisRetour, null);

r = computeSuiviClients({
  ...base,
  clientsActifs: 12.9,
  questionsParClient: 99,
  minutesParQuestion: 500,
  partRecente: 150,
  partLibreService: -10,
  documentsRenvoyes: "x",
  minutesParRenvoi: 90,
  tauxHoraire: -5,
  heuresMiseEnPlace: 100,
  minutesEntretien: 9999,
});
assert.strictEqual(r.clients, 12);
assert.strictEqual(r.questionsParClient, 30);
assert.strictEqual(r.minutesParQuestion, 120);
assert.strictEqual(r.partRecente, 100);
assert.strictEqual(r.partLibreService, 0);
assert.strictEqual(r.documents, 0);
assert.strictEqual(r.minutesParRenvoi, 60);
assert.strictEqual(r.tauxHoraire, 0);
assert.strictEqual(r.heuresMiseEnPlace, 40);
assert.strictEqual(r.minutesEntretien, 600);
assert.strictEqual(r.heuresNettes, 0);
assert.strictEqual(r.moisRetour, null);

r = computeSuiviClients({ ...base, clientsActifs: 60 });
close(r.questionsMois, 120);
close(r.heuresEvitees, 6.1);
close(r.gainNetMensuel, (6.1 - 0.5 - 4 / 12) * 45);
assert.strictEqual(r.verdict.tone, "ok");
assert.ok(r.verdict.text.startsWith("Sur ces hypothèses, un espace membres vous rend environ 237"));
assert.ok(r.verdict.text.includes("rendu en 0,7 mois."));

r = computeSuiviClients({
  clientsActifs: 3,
  questionsParClient: 1,
  minutesParQuestion: 10,
  partRecente: 30,
  partLibreService: 90,
  documentsRenvoyes: 0,
  minutesParRenvoi: 5,
  tauxHoraire: 40,
  heuresMiseEnPlace: 2,
  minutesEntretien: 0,
});
close(r.questionsEvitees, 0.81);
close(r.heuresEvitees, 0.135);
close(r.gainNetMensuel, (0.135 - 2 / 12) * 40);
assert.ok(r.gainNetMensuel < 0);
assert.strictEqual(r.verdict.tone, "bad");
assert.ok(r.verdict.text.startsWith("Gain faible sur ces hypothèses (-1,27" + NB + "€ par mois)."));
assert.ok(r.conseils.some((item) => item.startsWith("Moins de cinq clients")));
assert.ok(r.conseils.some((item) => item.startsWith("Plus de la moitié des questions")));
assert.ok(r.conseils.some((item) => item.startsWith("Plus de 80 %")));
assert.ok(r.conseils.some((item) => item.startsWith("Zéro minute d'entretien")));
assert.ok(r.conseils.some((item) => item.startsWith("La mise en place n'est pas rendue")));
assert.ok(r.conseils.some((item) => item.startsWith("L'espace membres regroupe les demandes d'une même adresse email.")));
assert.ok(!r.conseils.some((item) => item.startsWith("Les documents de l'espace")));
assert.strictEqual(r.conseils.length, 6);
assert.ok(r.recap.startsWith("Hypothèses : 3 clients, 1 question de suivi par client"));
assert.ok(r.recap.includes("0 document renvoyé par mois"));
assert.ok(r.recap.includes("Avec l'espace membres : 0,8 question évitée et 0,1 h rendues par mois"));

r = computeSuiviClients({ ...base, clientsActifs: 1, questionsParClient: 1, documentsRenvoyes: 1 });
assert.ok(r.recap.startsWith("Hypothèses : 1 client, 1 question de suivi par client et par mois"));
assert.ok(r.recap.includes("1 document renvoyé par mois de 5 min"));
assert.ok(r.recap.includes("Aujourd'hui : 1 question et"));

r = computeSuiviClients({ ...base, minutesEntretien: 600 });
assert.strictEqual(r.moisRetour, null);
assert.strictEqual(r.heuresNettes, 0);
assert.ok(r.conseils.some((item) => item.startsWith("La mise en place n'est pas rendue")));

const at = (target: number) =>
  computeSuiviClients({
    clientsActifs: 1,
    questionsParClient: 1,
    minutesParQuestion: 60,
    partRecente: 100,
    partLibreService: 100,
    documentsRenvoyes: 0,
    minutesParRenvoi: 0,
    tauxHoraire: target,
    heuresMiseEnPlace: 0,
    minutesEntretien: 0,
  });
assert.strictEqual(at(150).verdict.tone, "ok");
assert.strictEqual(at(149).verdict.tone, "warn");
assert.strictEqual(at(50).verdict.tone, "warn");
assert.strictEqual(at(49).verdict.tone, "bad");
assert.strictEqual(at(150).moisRetour, 0);

assert.ok(!/[\u2013\u2014]/.test(computeSuiviClients(base).recap + computeSuiviClients(base).conseils.join(" ")));
