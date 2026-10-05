import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";
import {
  REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS,
  REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS,
  computeRequalificationChatVsFormulaire,
} from "./requalification-chat-vs-formulaire-devis";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "funnel-devis-chat-ia-vs-formulaire-etapes-b2b";
const SECTOR_SLUG = "funnel-devis-usinage-sous-traitance-pieces";
const TOOL_PATH = "/outils/estimateur-requalification-chat-vs-formulaire-devis";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;

assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["funnel", "scoring"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.funnelPublic);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 13);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, "2026-10-05");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.ok(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) =>
    BLOG_TAG_DEFS.some((def) => def.slug === tag),
  ),
);
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);

assert.equal(BLOG_TOOLS.length, 32);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.deepEqual(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags,
  ["funnel", "scoring"],
);
assert.equal(
  outilsHubIntro(),
  "Trente-deux outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.",
);
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
assert.ok(paths.includes(BLOG_PATH));
assert.ok(paths.includes(SECTOR_PATH));
assert.ok(paths.includes(TOOL_PATH));
assert.equal(MARKETING_ROUTES.find((route) => route.path === SECTOR_PATH)?.lastModified, "2026-10-05");
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.lastModified, "2026-10-05");
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.lastModified, "2026-10-05");

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of [BLOG_PATH, SECTOR_PATH, TOOL_PATH]) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "2026-10-05"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, "2026-10-05");
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${BLOG_PATH}`));
assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${SECTOR_PATH}`));
assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${TOOL_PATH}`));

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(outilsHub, /estimateur-requalification-chat-vs-formulaire-devis/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
assert.match(secteursHub, /funnel-devis-usinage-sous-traitance-pieces/);

function faqQuestionCount(body: string) {
  const marker = "\n## FAQ\n";
  const start = body.indexOf(marker);
  assert.ok(start >= 0, "FAQ heading missing");
  const after = body.slice(start + marker.length);
  const next = after.search(/\n## [^#]/);
  const section = next === -1 ? after : after.slice(0, next);
  return section.split("\n").filter((line) => line.startsWith("### ")).length;
}

function assertInternalLinks(body: string, label: string) {
  const hrefs = body.match(/https:\/\/www\.quotebuilder\.co[^)\s]*/g) ?? [];
  for (const href of hrefs) {
    const path = href.replace("https://www.quotebuilder.co", "").split("?")[0] ?? "";
    if (path.startsWith("/c/") || path.startsWith("/signup") || path.startsWith("/b/")) continue;
    assert.ok(paths.includes(path), `${label} link not in routes.ts: ${path}`);
  }
}

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(
    blogBody.startsWith("# Funnel de devis en chat IA ou formulaire par étapes"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assert.match(blogBody, /\/outils\/estimateur-requalification-chat-vs-formulaire-devis/);
  assert.match(blogBody, /mergeAnswers|réponse de formulaire|formulaire prime/i);
  assert.match(blogBody, /formule fixe/);
  assert.doesNotMatch(blogRaw, EM_DASH);
  assert.doesNotMatch(blogRaw, EN_DASH);
  assert.doesNotMatch(blogBody, EM_DASH);
  assert.doesNotMatch(blogBody, EN_DASH);
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 2799);
  assert.equal(faqQuestionCount(blogBody), 10);
  assertInternalLinks(blogBody, "blog");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith("# Funnel de devis usinage et sous-traitance"),
    "frontmatter must be stripped before render",
  );
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /Pièces & sous-traitance/);
  assert.match(sectorBody, /\/blog\/funnel-devis-chat-ia-vs-formulaire-etapes-b2b/);
  assert.match(sectorBody, /ordre fixe/);
  assert.match(sectorBody, /pas de kits|n'existe pas dans QuoteBuilder/i);
  assert.match(sectorBody, /sans gestion de TVA|sans TVA/);
  assert.match(sectorBody, /Responsable technique/);
  assert.doesNotMatch(sectorRaw, EM_DASH);
  assert.doesNotMatch(sectorRaw, EN_DASH);
  assert.doesNotMatch(sectorBody, EM_DASH);
  assert.doesNotMatch(sectorBody, EN_DASH);
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 2651);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "secteur");
}

const sectorPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-usinage-sous-traitance-pieces/page.tsx"),
  "utf8",
);
assert.equal(sectorPage.split("\n").filter((line) => line.includes("q:")).length, 10);
assert.doesNotMatch(sectorPage, EM_DASH);
assert.doesNotMatch(sectorPage, EN_DASH);

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/estimateur-requalification-chat-vs-formulaire-devis/page.tsx"),
  "utf8",
);
const ecartFormula = "% de requalification chat moins % de requalification formulaire";
assert.equal(toolPage.split(ecartFormula).length - 1, 2);
assert.doesNotMatch(toolPage, /pourcentage chat moins pourcentage formulaire/);
assert.doesNotMatch(toolPage, EM_DASH);
assert.doesNotMatch(toolPage, EN_DASH);

const defaults = computeRequalificationChatVsFormulaire({ ...REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS });
assert.equal(defaults.dChat, 24);
assert.equal(defaults.dForm, 56);
assert.equal(defaults.rChat, 9.6);
assert.equal(defaults.rForm, 14);
assert.equal(defaults.hChat, 2.4);
assert.equal(defaults.hForm, 3.5);
assert.equal(defaults.cChat, 132);
assert.equal(defaults.cForm, 193);
assert.equal(defaults.total, 325);
assert.equal(defaults.an, 3900);
assert.equal(defaults.ecartDossiers, 3.6);
assert.equal(defaults.ecartHeures, 0.9);
assert.equal(defaults.ecartCout, 50);
assert.equal(defaults.alertTone, "neutral");
assert.equal(defaults.totalTone, "neutral");
assert.equal(defaults.ecartTone, "bad");
assert.match(defaults.alert, /Enjeu modeste/);
assert.match(defaults.dossiersLabel, /24 · 56/);
assert.match(defaults.recap, /Checklist dossiers issus du chat/);
assert.match(defaults.recap, /la réponse de formulaire prime/);
assert.match(defaults.recap, /La conversation n'est pas reprise/);
assert.match(defaults.recap, /Même formule de score/);
assert.match(defaults.recap, /pas un benchmark/);
assert.match(defaults.recap, /pas de TVA/);
assert.doesNotMatch(defaults.recap, EM_DASH);
assert.doesNotMatch(defaults.recap, EN_DASH);
assert.equal(REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.demandes, "Demandes de devis / mois");
assert.equal(REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.total, "Total indicatif mensuel");
assert.equal(REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.an, "Sur 12 mois (indicatif)");

const important = computeRequalificationChatVsFormulaire({
  demandes: 300,
  pctChat: 50,
  reqChat: 60,
  reqForm: 20,
  minutes: 20,
  taux: 60,
});
assert.equal(important.cChat, 1800);
assert.equal(important.cForm, 600);
assert.equal(important.total, 2400);
assert.equal(important.an, 28800);
assert.equal(important.ecartHeures, 20);
assert.equal(important.ecartCout, 1200);
assert.equal(important.alertTone, "bad");
assert.equal(important.totalTone, "bad");
assert.match(important.alert, /Enjeu important/);

const chatLower = computeRequalificationChatVsFormulaire({
  ...REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS,
  reqChat: 10,
});
assert.equal(chatLower.rChat, 2.4);
assert.equal(chatLower.hChat, 0.6);
assert.equal(chatLower.cChat, 33);
assert.equal(chatLower.total, 226);
assert.equal(chatLower.ecartDossiers, -3.6);
assert.equal(chatLower.ecartHeures, -0.9);
assert.equal(chatLower.ecartCout, -49);
assert.equal(chatLower.ecartTone, "ok");
assert.match(chatLower.tip, /moins de reprises/);

const formOnly = computeRequalificationChatVsFormulaire({
  ...REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS,
  pctChat: 0,
});
assert.equal(formOnly.dChat, 0);
assert.equal(formOnly.total, 275);
assert.equal(formOnly.alertTone, "neutral");
assert.match(formOnly.alert, /formulaire/);

const empty = computeRequalificationChatVsFormulaire({
  ...REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS,
  demandes: 0,
});
assert.equal(empty.total, 0);
assert.equal(empty.an, 0);
assert.equal(empty.alertTone, "neutral");
assert.match(empty.alert, /Indiquez un volume/);

const notable = computeRequalificationChatVsFormulaire({
  demandes: 80,
  pctChat: 100,
  reqChat: 50,
  reqForm: 0,
  minutes: 15,
  taux: 55,
});
assert.equal(notable.total, 550);
assert.equal(notable.alertTone, "warn");
assert.match(notable.alert, /Enjeu notable/);

const noGap = computeRequalificationChatVsFormulaire({
  ...REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS,
  reqChat: 25,
});
assert.equal(noGap.ecartCout, 0);
assert.equal(noGap.ecartTone, "neutral");
assert.match(noGap.tip, /Pas d'écart/);

const clamped = computeRequalificationChatVsFormulaire({
  demandes: -5,
  pctChat: 140,
  reqChat: -10,
  reqForm: 200,
  minutes: 2000,
  taux: 20000,
});
assert.equal(clamped.demandes, 0);
assert.equal(clamped.pctChat, 100);
assert.equal(clamped.reqChat, 0);
assert.equal(clamped.reqForm, 100);
assert.equal(clamped.minutes, 1440);
assert.equal(clamped.taux, 10000);
assert.match(clamped.alert, /Indiquez un volume/);

const nonFinite = computeRequalificationChatVsFormulaire({
  demandes: Number.NaN,
  pctChat: Number.NaN,
  reqChat: Number.NaN,
  reqForm: Number.NaN,
  minutes: Number.NaN,
  taux: Number.NaN,
});
assert.equal(nonFinite.demandes, 0);
assert.equal(nonFinite.total, 0);
assert.match(nonFinite.alert, /Indiquez un volume/);
