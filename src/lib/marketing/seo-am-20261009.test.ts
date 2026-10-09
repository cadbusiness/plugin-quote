import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { MENTION_RGPD_DEFAULTS, buildMentions } from "./generateur-mention-rgpd-formulaire-devis";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";
import {
  SIGNATURE_DEFAULT_BODY,
  SIGNATURE_DEFAULT_RECEIVED,
  SIGNATURE_DEFAULT_SECRET,
  analyzeBody,
  buildRecap,
  describe,
  formatBodySummary,
  hints,
  normalizeSignature,
  verifySignature,
} from "./verificateur-signature-webhook-devis";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const blogDir = join(process.cwd(), "src/content/blog");

const RGPD_SLUG = "rgpd-demande-devis-b2b-consentement-conservation";
const WEBHOOK_SLUG = "webhook-demande-devis-crm-signature-hmac";
const LABO_SLUG = "funnel-devis-laboratoire-faconnage-cosmetique";
const FORMATION_SLUG = "funnel-devis-formation-professionnelle";
const RGPD_TOOL = "/outils/generateur-mention-rgpd-formulaire-devis";
const SIGNATURE_TOOL = "/outils/verificateur-signature-webhook-devis";
const DAY_PATHS = [`/blog/${RGPD_SLUG}`, `/secteurs/${LABO_SLUG}`, RGPD_TOOL];
const CATCHUP_PATHS = [`/blog/${WEBHOOK_SLUG}`, `/secteurs/${FORMATION_SLUG}`, SIGNATURE_TOOL];
const ALL_PATHS = [...DAY_PATHS, ...CATCHUP_PATHS];

const REFERENCE_COURTE =
  "Vos données servent à établir votre devis et à en assurer le suivi. Responsable : Rayonnages Martin SAS. Conservation 3 ans après notre dernier échange. Offres envoyées seulement si vous cochez la case. Vos droits : rgpd@rayonnages-martin.fr. Détails : rayonnages-martin.fr/confidentialite.";

assert.deepEqual(BLOG_POSTS.find((post) => post.slug === RGPD_SLUG)?.tags, ["funnel", "integrations"]);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === WEBHOOK_SLUG)?.tags, ["integrations", "funnel"]);
assert.equal(BLOG_POSTS.find((post) => post.slug === RGPD_SLUG)?.ctaHref, "https://www.quotebuilder.co/signup?plan=free");
assert.equal(
  BLOG_POSTS.find((post) => post.slug === WEBHOOK_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === RGPD_SLUG)?.cover, BLOG_DEMO_SHOTS.accueil);
assert.equal(BLOG_POSTS.find((post) => post.slug === WEBHOOK_SLUG)?.cover, BLOG_DEMO_SHOTS.integrations);
assert.equal(BLOG_POSTS.find((post) => post.slug === RGPD_SLUG)?.readingMinutes, 13);
assert.equal(BLOG_POSTS.find((post) => post.slug === WEBHOOK_SLUG)?.readingMinutes, 13);
assert.equal(BLOG_POSTS.find((post) => post.slug === RGPD_SLUG)?.publishedAt, "2026-10-09");
assert.equal(BLOG_POSTS.find((post) => post.slug === WEBHOOK_SLUG)?.publishedAt, "2026-10-07");
assert.equal(BLOG_POSTS.find((post) => post.slug === RGPD_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === WEBHOOK_SLUG)?.pinned, false);
for (const slug of [RGPD_SLUG, WEBHOOK_SLUG]) {
  assert.ok(
    BLOG_POSTS.find((post) => post.slug === slug)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)),
  );
  assert.equal(BLOG_FAQ[slug]?.length, 10);
  for (const item of BLOG_FAQ[slug] ?? []) {
    assert.doesNotMatch(item.q, EM_DASH);
    assert.doesNotMatch(item.q, EN_DASH);
    assert.doesNotMatch(item.a, EM_DASH);
    assert.doesNotMatch(item.a, EN_DASH);
  }
}

assert.equal(BLOG_TOOLS.length, 37);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === RGPD_TOOL));
assert.ok(BLOG_TOOLS.some((tool) => tool.href === SIGNATURE_TOOL));
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === RGPD_TOOL)?.tags, ["funnel", "integrations"]);
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === SIGNATURE_TOOL)?.tags, ["integrations", "funnel"]);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.equal(outilsHubIntro(), "Trente-sept outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(36), "Trente-six outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(37), outilsHubIntro());
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of ALL_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, "2026-10-09");
}
for (const path of CATCHUP_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, "2026-10-07");
}

const sitemapSrc = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
for (const path of DAY_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "2026-10-09"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, "2026-10-09");
}
for (const path of CATCHUP_PATHS) {
  assert.match(sitemapSrc, new RegExp(`"${path}": "2026-10-07"`));
  const entry = sitemap().find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(entry?.lastModified, "2026-10-07");
}

const llms = readFileSync(join(process.cwd(), "public/llms.txt"), "utf8");
for (const path of ALL_PATHS) {
  assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${path}`));
}

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(outilsHub, /generateur-mention-rgpd-formulaire-devis/);
assert.match(outilsHub, /verificateur-signature-webhook-devis/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
assert.match(secteursHub, /funnel-devis-laboratoire-faconnage-cosmetique/);
assert.match(secteursHub, /funnel-devis-formation-professionnelle/);

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

function assertNoDashes(text: string, label: string) {
  assert.doesNotMatch(text, EM_DASH, `${label} has an em dash`);
  assert.doesNotMatch(text, EN_DASH, `${label} has an en dash`);
}

{
  const blogRaw = readFileSync(join(blogDir, `${RGPD_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(blogBody.startsWith("# RGPD et demande de devis B2B"), "frontmatter must be stripped before render");
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assert.match(blogBody, /Données personnelles \(RGPD\)/);
  assert.match(blogBody, /Anonymiser/);
  assert.match(blogBody, /pas de consentement marketing/);
  assert.match(blogBody, /trois ans/);
  assert.match(blogBody, /L123-22/);
  assert.match(blogBody, /\/outils\/generateur-mention-rgpd-formulaire-devis/);
  assertNoDashes(blogRaw, "rgpd md");
  assertNoDashes(blogBody, "rgpd body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 3436);
  assert.equal(faqQuestionCount(blogBody), 10);
  assertInternalLinks(blogBody, "rgpd");
}

{
  const blogRaw = readFileSync(join(blogDir, `${WEBHOOK_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"));
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(blogBody.startsWith("# Webhook de demande de devis"));
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assert.match(blogBody, /quote\.submitted/);
  assert.match(blogBody, /X-QuoteBuilder-Signature/);
  assert.match(blogBody, /\/outils\/verificateur-signature-webhook-devis/);
  assertNoDashes(blogRaw, "webhook md");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 3185);
  assert.equal(faqQuestionCount(blogBody), 10);
  assertInternalLinks(blogBody, "webhook");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${LABO_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"));
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(sectorBody.startsWith("# Funnel de devis laboratoire et façonnage"));
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /« Labos & fabrication »/);
  assert.match(sectorBody, /Funnel labo/);
  assert.match(sectorBody, /Industrie & fabrication/);
  assert.match(sectorBody, /ordre fixe/);
  assert.match(sectorBody, /ne gère pas la TVA/);
  assert.match(sectorBody, /30 points/);
  assert.match(sectorBody, /10 Mo/);
  assert.match(sectorBody, /1223\/2009/);
  assert.match(sectorBody, /ISO 22716/);
  assertNoDashes(sectorRaw, "labo md");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 3186);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "labo");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${FORMATION_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"));
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(sectorBody.startsWith("# Funnel de devis formation professionnelle"));
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /\/c\/demo\/rayonnage/);
  assert.match(sectorBody, /Funnel formation/);
  assert.match(sectorBody, /ordre fixe/);
  assert.match(sectorBody, /ne gère pas la TVA/);
  assert.match(sectorBody, /30 points/);
  assert.match(sectorBody, /10 Mo/);
  assertNoDashes(sectorRaw, "formation md");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 3166);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "formation");
}

const addedSources = [
  "src/lib/marketing/generateur-mention-rgpd-formulaire-devis.ts",
  "src/lib/marketing/verificateur-signature-webhook-devis.ts",
  "src/lib/marketing/seo-am-20261009.test.ts",
  "src/components/marketing/generateur-mention-rgpd-formulaire-devis-calculator.tsx",
  "src/components/marketing/verificateur-signature-webhook-devis-calculator.tsx",
  "src/app/(marketing)/outils/generateur-mention-rgpd-formulaire-devis/page.tsx",
  "src/app/(marketing)/outils/verificateur-signature-webhook-devis/page.tsx",
  "src/app/(marketing)/secteurs/funnel-devis-laboratoire-faconnage-cosmetique/page.tsx",
  "src/app/(marketing)/secteurs/funnel-devis-formation-professionnelle/page.tsx",
];
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const laboPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-laboratoire-faconnage-cosmetique/page.tsx"),
  "utf8",
);
const formationPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-formation-professionnelle/page.tsx"),
  "utf8",
);
assert.equal(laboPage.split("\n").filter((line) => line.includes("q:")).length, 10);
assert.equal(formationPage.split("\n").filter((line) => line.includes("q:")).length, 10);
assert.match(laboPage, /signup\?plan=free/);
assert.match(laboPage, /Industrie & fabrication/);
assert.match(formationPage, /signup\?plan=free/);
assert.match(formationPage, /Services professionnels/);

const rgpdToolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/generateur-mention-rgpd-formulaire-devis/page.tsx"),
  "utf8",
);
assert.match(rgpdToolPage, /WebApplication/);
assert.match(rgpdToolPage, /signup\?plan=free/);
assert.match(rgpdToolPage, /rgpd-demande-devis-b2b-consentement-conservation/);
assert.match(rgpdToolPage, /\/c\/demo\/rayonnage/);

const signatureToolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/verificateur-signature-webhook-devis/page.tsx"),
  "utf8",
);
assert.match(signatureToolPage, /WebApplication/);
assert.match(signatureToolPage, /signup\?plan=free/);
assert.match(signatureToolPage, /webhook-demande-devis-crm-signature-hmac/);
assert.match(signatureToolPage, /funnel-devis-formation-professionnelle/);
assert.match(signatureToolPage, /\/c\/demo\/rayonnage/);
assert.match(
  readFileSync(join(process.cwd(), "src/lib/marketing/verificateur-signature-webhook-devis.ts"), "utf8"),
  /crypto\.subtle/,
);

const defaults = buildMentions(MENTION_RGPD_DEFAULTS);
assert.equal(defaults.courte, REFERENCE_COURTE);
assert.equal(defaults.courteLength, 290);
assert.equal(REFERENCE_COURTE.length, 290);

const base = {
  societe: "Rayonnages Martin SAS",
  email: "rgpd@rayonnages-martin.fr",
  url: "rayonnages-martin.fr/confidentialite",
  suivi: true,
  prospection: true,
  basePro: "consentement",
  mesure: false,
  duree: 3,
  soustraitants: "notre CRM",
  horsUE: "non",
};
let mention = buildMentions(base);
assert.ok(mention.courte.startsWith("Vos données servent à établir votre devis et à en assurer le suivi."));
assert.match(mention.courte, /Conservation 3 ans/);
assert.match(mention.courte, /seulement si vous cochez la case/);
assert.match(mention.courte, /Vos droits : rgpd@rayonnages-martin\.fr\./);
assert.ok(mention.courteLength <= 320, `courte trop longue ${mention.courteLength}`);
assert.match(mention.complete, /article 6\.1\.b/);
assert.match(mention.complete, /article 6\.1\.a/);
assert.doesNotMatch(mention.complete, /6\.1\.f/);
assert.match(mention.complete, /CNIL/);
assert.match(mention.complete, /dix ans/);
assertNoDashes(mention.courte + mention.complete, "mentions");
mention = buildMentions({ ...base, basePro: "interet" });
assert.match(mention.complete, /6\.1\.f/);
assert.match(mention.courte, /opposition à tout moment/);
assert.ok(mention.rappels.some((item) => item.includes("professionnels")));
mention = buildMentions({ ...base, prospection: false, suivi: false, duree: 1 });
assert.match(mention.courte, /Conservation 1 an /);
assert.doesNotMatch(mention.courte, /Offres/);
assert.doesNotMatch(mention.complete, /6\.1\.a/);
mention = buildMentions({ ...base, duree: 0 });
assert.equal(mention.duree, 3);
mention = buildMentions({ ...base, duree: 25 });
assert.equal(mention.duree, 10);
mention = buildMentions({ ...base, email: "" });
assert.match(mention.rappels[0] ?? "", /email pour exercer/);
mention = buildMentions({ ...base, horsUE: "oui", garanties: "" });
assert.ok(mention.rappels.some((item) => item.includes("hors UE")));
mention = buildMentions({ ...base, horsUE: "oui", garanties: "clauses contractuelles types" });
assert.match(mention.complete, /garanties suivantes : clauses contractuelles types/);
mention = buildMentions({ ...base, societe: "X".repeat(200) });
assert.ok(mention.courteLength > 320);
assert.ok(mention.rappels.some((item) => item.includes("320")));
mention = buildMentions({ ...base, mesure: true });
assert.match(mention.complete, /mesurer l'audience/);

const signatureDefaults = {
  body: SIGNATURE_DEFAULT_BODY,
  secret: SIGNATURE_DEFAULT_SECRET,
  received: SIGNATURE_DEFAULT_RECEIVED,
};

void (async () => {
  const matched = await verifySignature(signatureDefaults);
  assert.equal(matched.state, "match");
  assert.equal(matched.match, true);
  assert.equal(matched.computed, SIGNATURE_DEFAULT_RECEIVED);
  assert.equal(matched.bytes, 665);
  assert.equal(matched.secretBytes, 44);
  assert.equal(matched.secretShort, false);
  assert.equal(matched.event, "quote.submitted");
  assert.equal(matched.quoteId, "7f1c2e4a-0b9d-4c61-9a52-3d8e6f1b2c90");
  assert.equal(matched.jsonValid, true);
  assert.equal(matched.isCompact, true);
  assert.equal(describe(matched).cls, "ok");
  assert.deepEqual(hints(matched), []);
  assert.match(formatBodySummary(matched), /665 octets · JSON valide · compact · quote\.submitted/);

  const computedOnly = await verifySignature({ ...signatureDefaults, received: "" });
  assert.equal(computedOnly.state, "computed");
  assert.equal(computedOnly.computed, SIGNATURE_DEFAULT_RECEIVED);
  assert.equal(describe(computedOnly).cls, "neutral");

  const prefixed = await verifySignature({
    ...signatureDefaults,
    received: `  sha256=${SIGNATURE_DEFAULT_RECEIVED.toUpperCase()} `,
  });
  assert.equal(prefixed.state, "match");
  assert.deepEqual(prefixed.receivedNotes, ["prefix", "uppercase"]);

  const withHeader = await verifySignature({
    ...signatureDefaults,
    received: `X-QuoteBuilder-Signature: ${SIGNATURE_DEFAULT_RECEIVED}`,
  });
  assert.equal(withHeader.state, "match");
  assert.deepEqual(withHeader.receivedNotes, ["header"]);

  const pretty = JSON.stringify(JSON.parse(SIGNATURE_DEFAULT_BODY), null, 2);
  const reindented = await verifySignature({ ...signatureDefaults, body: pretty });
  assert.equal(reindented.state, "mismatch");
  assert.equal(reindented.variant, "compact");
  assert.equal(reindented.isCompact, false);
  assert.equal(describe(reindented).cls, "bad");

  const trailing = await verifySignature({ ...signatureDefaults, body: `${SIGNATURE_DEFAULT_BODY}\n` });
  assert.equal(trailing.state, "mismatch");
  assert.equal(trailing.variant, "trimmed_body");
  assert.equal(trailing.bytes, 666);

  const spacedSecret = await verifySignature({ ...signatureDefaults, secret: `${SIGNATURE_DEFAULT_SECRET} ` });
  assert.equal(spacedSecret.state, "mismatch");
  assert.equal(spacedSecret.variant, "trimmed_secret");
  assert.equal(spacedSecret.secretSpaces, true);

  const wrongSecret = await verifySignature({
    ...signatureDefaults,
    secret: "un-autre-secret-de-test-de-plus-de-32-octets",
  });
  assert.equal(wrongSecret.state, "mismatch");
  assert.equal(wrongSecret.variant, null);

  const missingSecret = await verifySignature({ ...signatureDefaults, secret: "" });
  assert.equal(missingSecret.state, "missing_secret");
  assert.equal(missingSecret.computed, null);
  assert.equal(describe(missingSecret).cls, "warn");

  const emptyBody = await verifySignature({ ...signatureDefaults, body: "" });
  assert.equal(emptyBody.state, "empty_body");
  assert.equal(emptyBody.computed, null);
  assert.equal(emptyBody.bytes, 0);

  const badFormat = await verifySignature({ ...signatureDefaults, received: "abc123" });
  assert.equal(badFormat.state, "bad_format");
  assert.equal(badFormat.receivedValid, false);
  assert.equal(badFormat.computed, SIGNATURE_DEFAULT_RECEIVED);

  const rfc = await verifySignature({
    body: "what do ya want for nothing?",
    secret: "Jefe",
    received: "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843",
  });
  assert.equal(rfc.state, "match");
  assert.equal(rfc.secretShort, true);
  assert.equal(rfc.secretBytes, 4);
  assert.equal(rfc.jsonValid, false);
  assert.ok(hints(rfc).some((item) => item.includes("RFC 2104")));
  assert.ok(hints(rfc).some((item) => item.includes("pas un JSON valide")));

  const accents = '{"event":"quote.submitted","quote":{"id":"x","contact_name":"Hélène Dupré"}}';
  const accented = await verifySignature({
    body: accents,
    secret: SIGNATURE_DEFAULT_SECRET,
    received: "",
  });
  const accentedMatch = await verifySignature({
    body: accents,
    secret: SIGNATURE_DEFAULT_SECRET,
    received: accented.computed ?? "",
  });
  assert.equal(accentedMatch.state, "match");
  assert.equal(accentedMatch.bytes, 79);
  assert.equal(accents.length, 76);
  assert.equal(analyzeBody(accents).bytes, 79);

  const otherEvent = await verifySignature({
    body: '{"event":"test"}',
    secret: SIGNATURE_DEFAULT_SECRET,
    received: "",
  });
  assert.equal(otherEvent.event, "test");
  assert.ok(hints(otherEvent).some((item) => item.includes("quote.submitted")));

  assert.deepEqual(normalizeSignature(""), { value: "", empty: true, valid: false, notes: [] });

  const recap = buildRecap(matched, describe(matched).text);
  assert.equal(describe(matched).cls, "ok");
  assert.equal(matched.computed, SIGNATURE_DEFAULT_RECEIVED);
  assert.ok(!recap.includes(SIGNATURE_DEFAULT_SECRET));
  assert.match(recap, /Secret : 44 octets \(non recopié ici\)/);
})().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
