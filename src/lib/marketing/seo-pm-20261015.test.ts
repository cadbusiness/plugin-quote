import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/crm/email-templates";
import { fill } from "@/lib/email/fill";
import { fillProspectTemplate } from "@/lib/email/greeting";
import { formatPrice } from "@/lib/format";
import { quoteSubmittedDefinition } from "@/lib/workflows/defaults";
import { articleHtml } from "./article-html";
import {
  BLOG_DEMO_SHOTS,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOL_EMAIL_CONFIRMATION,
  BLOG_TOOLS,
  outilsHubIntro,
} from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import {
  CONFIRMATION_EMAIL_DEFAULTS,
  buildConfirmationEmail,
  countWords,
  fmtDelai,
  normalize,
} from "./generateur-email-confirmation-demande-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "email-confirmation-demande-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const TOOL_PATH = "/outils/generateur-email-confirmation-demande-devis";
const DAY_PATHS = [BLOG_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_EMAIL_CONFIRMATION, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["relances", "funnel"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Email de confirmation d'une demande de devis B2B : quoi écrire, trois modèles et les réglages à vérifier",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.description,
  "L'accusé de réception d'une demande de devis entre professionnels : ce que le client y cherche, les sept éléments à mettre, ce qu'il faut laisser dehors, trois modèles à adapter, et comment QuoteBuilder envoie ce message.",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.automations);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 15);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, "2026-10-15");
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

assert.equal(BLOG_POSTS.length, 67);
assert.equal(BLOG_TOOLS.length, 57);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title,
  "Générateur d'email de confirmation de demande de devis",
);
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["relances", "funnel"]);
assert.equal(
  BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.text,
  "Délai, prochaine étape, lien de suivi, signature : l'accusé de réception prêt à coller, avec les promesses incohérentes signalées.",
);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Cinquante-sept outils publics."));
assert.equal(outilsHubIntro(), "Cinquante-sept outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(57), outilsHubIntro());
assert.equal(outilsHubIntro(44), "Quarante-quatre outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, "2026-10-15");
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.changeFrequency, "monthly");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "2026-10-15"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, "2026-10-15");
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
assert.match(
  llms,
  /Email de confirmation d'une demande de devis B2B : quoi écrire, trois modèles et les réglages à vérifier : https:\/\/www\.quotebuilder\.co\/blog\/email-confirmation-demande-devis-b2b/,
);
assert.match(
  llms,
  /Générateur d'email de confirmation de demande de devis : https:\/\/www\.quotebuilder\.co\/outils\/generateur-email-confirmation-demande-devis/,
);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
assert.match(outilsHub, /generateur-email-confirmation-demande-devis/);
assert.match(outilsHub, /eyebrow: "Relances"/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
assert.match(outilsHub, /générateur d'email de confirmation de demande de devis/);

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

const confirm = DEFAULT_EMAIL_TEMPLATES.find((template) => template.kind === "prospect_confirm");
const reassure = DEFAULT_EMAIL_TEMPLATES.find((template) => template.kind === "prospect_reassure");
assert.ok(confirm?.body.includes("sous 24h ouvrées"));
assert.ok(confirm?.body.includes("{{membres_url}}"));
assert.ok(reassure?.body.includes("Retour sous 48h"));
const confirmNode = quoteSubmittedDefinition().nodes.find(
  (node) => node.type === "send_email" && node.data.templateKind === "prospect_confirm",
);
assert.equal(confirmNode?.data.recipient, "prospect");
assert.equal(confirmNode?.data.attachPdf, true);
assert.equal(fill("a {{inconnu}} b", {}), "a  b");
assert.equal(fillProspectTemplate("Bonjour {{contact_name}},", { contact_name: "" }), "Bonjour,");
assert.equal(formatPrice(null, null), "Sur devis");

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(
    blogBody.startsWith(
      "# Email de confirmation d'une demande de devis B2B : quoi écrire, trois modèles et les réglages à vérifier",
    ),
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /Email · prospect_confirm/);
  assert.match(blogBody, /Joindre le récapitulatif/);
  assert.match(blogBody, /\{\{suivi_url\}\}/);
  assert.match(blogBody, /\{\{membres_url\}\}/);
  assert.match(blogBody, /\{\{price_range\}\}/);
  assert.match(blogBody, /Sur devis/);
  assert.match(blogBody, /Configuration/);
  assert.match(blogBody, /Suivre votre demande/);
  assert.match(blogBody, /30 jours/);
  assert.match(blogBody, /24h ouvrées/);
  assert.match(blogBody, /Retour sous 48h/);
  assert.match(blogBody, /\/outils\/generateur-email-confirmation-demande-devis/);
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assertNoDashes(blogRaw, "confirmation md");
  assertNoDashes(blogBody, "confirmation body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 3759);
  assert.equal(alphaTokens(blogBody), 3450);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "confirmation");

  const html = articleHtml(blogBody);
  assert.equal((html.match(/<pre /g) ?? []).length, 3);
  assert.match(html, /<table/);
  assert.match(html, /Objet : Demande de devis reçue, Atelier Martin/);
  assert.match(html, /Objet : Votre demande d'étude est enregistrée/);
  assert.match(html, /Objet : Demande reçue, réponse à partir du 4 novembre/);
  assert.match(html, /\{\{contact_name\}\}/);
  assert.match(html, /<th[^>]*>Variable<\/th>/);
  assert.doesNotMatch(html, /```/);
}

const addedSources = [
  "src/lib/marketing/generateur-email-confirmation-demande-devis.ts",
  "src/lib/marketing/article-html.ts",
  "src/lib/marketing/seo-pm-20261015.test.ts",
  "src/components/marketing/generateur-email-confirmation-demande-devis-generator.tsx",
  "src/app/(marketing)/outils/generateur-email-confirmation-demande-devis/page.tsx",
  "src/content/blog/email-confirmation-demande-devis-b2b.md",
];
assertNoDashes(
  (BLOG_FAQ[BLOG_SLUG] ?? []).map((item) => `${item.q}\n${item.a}`).join("\n"),
  "confirmation faq",
);
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/generateur-email-confirmation-demande-devis/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /path: PATH/);
assert.match(toolPage, /generateur-email-confirmation-demande-devis/);
assert.match(toolPage, /Générateur d&apos;email de confirmation de demande de devis/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /email-confirmation-demande-devis-b2b/);
assert.match(toolPage, /\/fonctionnalites\/autopilote/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.doesNotMatch(toolPage, /\/blog\/espace-prospect-devis-en-ligne/);
assertNoDashes(toolPage, "tool page");

const generator = readFileSync(
  join(process.cwd(), "src/components/marketing/generateur-email-confirmation-demande-devis-generator.tsx"),
  "utf8",
);
assert.match(generator, /if \(tone === "ok"\) return "bg-emerald-50 text-emerald-800"/);
assert.match(generator, /if \(tone === "warn"\) return "bg-amber-50 text-amber-900"/);
assert.match(generator, /if \(tone === "bad"\) return "bg-rose-50 text-rose-800"/);
assert.match(generator, /id="entreprise"/);
assert.match(generator, /id="signataire"/);
assert.match(generator, /id="email"/);
assert.match(generator, /id="telephone"/);
assert.match(generator, /id="delai"/);
assert.match(generator, /id="unite"/);
assert.match(generator, /id="delaiReel"/);
assert.match(generator, /id="etape"/);
assert.match(generator, /id="reprise"/);
assert.match(generator, /id="pdf"/);
assert.match(generator, /id="fourchette"/);
assert.match(generator, /id="suivi"/);
assert.match(generator, /id="membres"/);
assert.match(generator, /id="format"/);
assert.match(generator, /id="delaiRassurant"/);
assert.match(generator, /Copier objet et texte/);
assert.match(generator, /Dans QuoteBuilder/);
assert.match(generator, /Email · prospect_confirm/);
assert.match(generator, /exemples, pas des recommandations/);
assert.doesNotMatch(generator, /fetch\(|navigator\.sendBeacon/);

const base = { ...CONFIRMATION_EMAIL_DEFAULTS };
let result = buildConfirmationEmail(base);
assert.strictEqual(result.subject, "Demande de devis reçue, Atelier Martin");
const expected = [
  "Bonjour {{contact_name}},",
  "",
  "Nous avons bien reçu votre demande : {{suggestion_name}}.",
  "Vous trouverez en pièce jointe le récapitulatif de vos réponses, avec une fourchette indicative ({{price_range}}). Ce n'est pas encore un devis.",
  "",
  `Un membre de l'équipe vous appelle sous 2${NB}jours ouvrés pour valider votre besoin.`,
  "",
  "Un plan, une photo ou une précision à ajouter ? Ouvrez votre demande : {{suivi_url}}",
  "Code PIN : {{pin}}",
  "",
  "Une question d'ici là : devis@atelier-martin.fr ou 01 23 45 67 89.",
  "",
  "Claire, service devis, Atelier Martin",
].join("\n");
assert.strictEqual(result.body, expected);
assert.strictEqual(result.body.split("\n").length, 13);
assert.strictEqual(result.recap, `Objet : Demande de devis reçue, Atelier Martin\n\n${expected}`);
assert.strictEqual(result.lines, 8);
assert.strictEqual(result.verdict.tone, "ok");
assert.strictEqual(result.verdict.text, "Prêt à coller, après une demande de test.");
assert.deepStrictEqual(
  result.checks.map((check) => check.tone),
  ["ok", "ok", "info"],
);
assert.doesNotMatch(result.body, /score|answers_text|membres_url/);

assert.strictEqual(fmtDelai(1, "jours"), `1${NB}jour ouvré`);
assert.strictEqual(fmtDelai(1, "heures"), `1${NB}heure ouvrée`);
assert.strictEqual(fmtDelai(4, "heures"), `4${NB}heures ouvrées`);

result = buildConfirmationEmail({ ...base, delaiReel: 3 });
assert.strictEqual(result.verdict.tone, "bad");
assert.ok(
  result.checks[0]?.text.startsWith(
    `Vous promettez 2${NB}jours ouvrés alors que votre délai tenu est de 3${NB}jours ouvrés.`,
  ),
);

result = buildConfirmationEmail({ ...base, delaiReel: 0 });
assert.strictEqual(result.verdict.tone, "warn");
assert.strictEqual(result.checks[0]?.tone, "warn");

result = buildConfirmationEmail({ ...base, delai: 0 });
assert.strictEqual(result.verdict.tone, "bad");
assert.ok(result.body.includes("Un membre de l'équipe vous appelle pour valider votre besoin."));
assert.strictEqual(result.checks.filter((check) => /email rassurant/.test(check.text)).length, 0);

result = buildConfirmationEmail({ ...base, delai: 24, delaiReel: 24, unite: "heures" });
assert.strictEqual(result.verdict.tone, "warn");
assert.ok(
  result.checks.some(
    (check) => check.tone === "warn" && check.text.startsWith(`L'email rassurant annonce 48${NB}h, la confirmation 24${NB}heures ouvrées`),
  ),
);
result = buildConfirmationEmail({ ...base, delai: 48, delaiReel: 48, unite: "heures" });
assert.strictEqual(result.verdict.tone, "ok");
result = buildConfirmationEmail({ ...base, delaiRassurant: 0, delai: 3, delaiReel: 3 });
assert.strictEqual(result.verdict.tone, "ok");
result = buildConfirmationEmail({ ...base, format: "neutre", delai: 3, delaiReel: 3 });
assert.strictEqual(result.verdict.tone, "ok");
assert.ok(result.body.startsWith("Bonjour [Prénom Nom],"));
assert.ok(result.body.includes("[Lien de suivi]") && result.body.includes("Code PIN : [Code]"));
assert.doesNotMatch(result.body, /\{\{/);

assert.ok(buildConfirmationEmail({ ...base, etape: "visite" }).body.includes(`Nous vous proposons un créneau sous 2${NB}jours ouvrés.`));
assert.ok(buildConfirmationEmail({ ...base, etape: "devis" }).body.includes(`Vous recevez votre devis chiffré sous 2${NB}jours ouvrés.`));
assert.ok(
  buildConfirmationEmail({ ...base, etape: "email" }).body.includes(
    `Nous vous écrivons sous 2${NB}jours ouvrés avec nos questions sur votre projet.`,
  ),
);
assert.ok(buildConfirmationEmail({ ...base, etape: "nimporte" }).body.includes("vous appelle"));

result = buildConfirmationEmail({ ...base, pdf: false });
assert.ok(result.body.includes("Fourchette indicative : {{price_range}}. Ce n'est pas encore un devis."));
assert.doesNotMatch(result.body, /pièce jointe/);
assert.ok(result.checks.some((check) => check.text.includes("Joindre le récapitulatif")));
result = buildConfirmationEmail({ ...base, fourchette: false });
assert.ok(result.body.includes("Vous trouverez en pièce jointe le récapitulatif de vos réponses.\n"));
assert.doesNotMatch(result.body, /price_range/);
result = buildConfirmationEmail({ ...base, pdf: false, fourchette: false });
assert.doesNotMatch(result.body, /pièce jointe/);
assert.doesNotMatch(result.body, /Fourchette/);

result = buildConfirmationEmail({ ...base, suivi: false });
assert.ok(result.body.includes("Répondez simplement à ce message."));
assert.doesNotMatch(result.body, /\{\{pin\}\}/);
result = buildConfirmationEmail({ ...base, membres: true });
assert.ok(result.body.includes("Tous vos devis : {{membres_url}}"));
assert.ok(result.checks.some((check) => check.text.includes("{{membres_url}} reste vide")));

result = buildConfirmationEmail({ ...base, reprise: "4 novembre" });
assert.strictEqual(result.subject, "Demande reçue, réponse à partir du 4 novembre");
assert.ok(result.body.includes("à partir du 4 novembre."));
assert.ok(result.checks.some((check) => check.text.startsWith("Pensez à remettre")));

result = buildConfirmationEmail({ ...base, signataire: "", entreprise: "" });
assert.strictEqual(result.subject, "Votre demande de devis est bien reçue");
assert.ok(result.body.endsWith("[Signature]"));
assert.strictEqual(result.verdict.tone, "bad");
result = buildConfirmationEmail({ ...base, signataire: "" });
assert.ok(result.body.endsWith("\nAtelier Martin"));
result = buildConfirmationEmail({ ...base, email: "", telephone: "" });
assert.doesNotMatch(result.body, /Une question d'ici là/);
assert.strictEqual(result.verdict.tone, "warn");
result = buildConfirmationEmail({ ...base, email: "" });
assert.ok(result.body.includes("Une question d'ici là : 01 23 45 67 89."));

const normalized = normalize({
  entreprise: "  Atelier \u2014 Martin  ",
  delai: "2,6",
  delaiReel: "-3",
  delaiRassurant: "abc",
  pdf: "on",
  suivi: 1,
  membres: "false",
});
assert.strictEqual(normalized.entreprise, "Atelier , Martin");
assert.strictEqual(normalized.delai, 3);
assert.strictEqual(normalized.delaiReel, 0);
assert.strictEqual(normalized.delaiRassurant, 0);
assert.strictEqual(normalized.pdf, true);
assert.strictEqual(normalized.suivi, true);
assert.strictEqual(normalized.membres, false);
assert.strictEqual(normalize({ delai: 500 }).delai, 99);
assert.strictEqual(normalize({ entreprise: "x".repeat(200) }).entreprise.length, 80);
assert.strictEqual(normalize({}).unite, "jours");
assert.strictEqual(normalize({}).format, "quotebuilder");
assert.strictEqual(buildConfirmationEmail({}).verdict.tone, "bad");

result = buildConfirmationEmail({
  ...base,
  reprise: "x".repeat(40),
  membres: true,
  signataire: "a b c d e f g h i j k l m n o p q r s t u v w x y z",
});
assert.strictEqual(typeof result.words, "number");
assert.strictEqual(countWords("Bonjour {{contact_name}}, merci."), 3);

console.log("seo-pm-20261015.test.ts ok");
