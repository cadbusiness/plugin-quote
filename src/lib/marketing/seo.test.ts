import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  BLOG_DEMO_SHOTS,
  BLOG_IMAGE_DIR,
  BLOG_POSTS,
  BLOG_TAG_DEFS,
  BLOG_TOOLS,
  BLOG_UI,
  blogArticleJsonLd,
  blogBreadcrumbJsonLd,
  blogOgImagePath,
  extractMarkdownH2s,
  filterBlogPosts,
  getFeaturedPost,
  getRelatedPosts,
  midArticleHeadingIndex,
  normalizeCoverPath,
  primaryTagLabel,
  outilsHubIntro,
  trimMetaDescription,
} from "./blog";
import { coverCandidatesForSlug, resolveCoverForPost } from "./blog-assets";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import { computeBriefScore } from "./brief-score";
import { computeLostQuote } from "./lost-quote";
import { computeConversionRate } from "./conversion-rate";
import { applyTeamCapacityMix, computeTeamCapacity } from "./team-capacity";
import { computeQuotingTime, quotingTimeVolumes } from "./quoting-time";
import { computeDiscountImpact } from "./discount-impact";
import { computeRoiLogicielDevis } from "./roi-logiciel-devis";
import { computeAcceptanceRate } from "./acceptance-rate";
import { computeCoutBriefIncomplet } from "./cout-brief-incomplet";
import { computeCoutDevisExpires } from "./cout-devis-expires";
import { computeAcompteDevis } from "./acompte-devis";
import { computeGainTempsCatalogue } from "./gain-temps-catalogue";
import { computeSeuilRemiseMarge } from "./seuil-remise-marge";
import { buildPrefillUrl } from "./prefill-url";
import { LEADS_FORMULAIRE_DEFAULTS, computeLeadsFormulaireVsFunnel } from "./leads-formulaire-vs-funnel";
import { COUT_DEVIS_PDF_SEULS_DEFAULTS, computeCoutDevisPdfSeuls } from "./cout-devis-pdf-seuls";
import { COUT_ALLER_RETOURS_BRIEF_DEFAULTS, computeCoutAllerRetoursBrief } from "./cout-aller-retours-brief-photos";
import { COUT_EMAILS_CLARIFICATION_DEFAULTS, computeCoutEmailsClarification } from "./cout-emails-clarification";
import {
  COUT_DEVIS_SANS_VALIDATION_DEFAULTS,
  COUT_DEVIS_SANS_VALIDATION_LABELS,
  computeCoutDevisSansValidation,
} from "./cout-devis-sans-validation";
import {
  COUT_RELANCES_AVEUGLES_DEFAULTS,
  COUT_RELANCES_AVEUGLES_LABELS,
  computeCoutRelancesAveugles,
} from "./cout-relances-aveugles";
import {
  COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS,
  COUT_ATTENTE_MULTI_DECIDEURS_LABELS,
  computeCoutAttenteMultiDecideurs,
} from "./cout-attente-multi-decideurs-devis";
import {
  COUT_VISITES_INUTILES_DEFAULTS,
  COUT_VISITES_INUTILES_LABELS,
  computeCoutVisitesInutiles,
} from "./cout-visites-techniques-inutiles";
import {
  COUT_DEMANDES_ORALES_DEFAULTS,
  COUT_DEMANDES_ORALES_LABELS,
  computeCoutDemandesOrales,
} from "./cout-demandes-orales-non-capturees";
import {
  COUT_HANDOFF_DEFAULTS,
  COUT_HANDOFF_LABELS,
  computeCoutHandoff,
} from "./cout-handoff-commercial-technique-devis";
import {
  COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS,
  COUT_CONTEXTE_HORS_DOSSIER_LABELS,
  computeCoutContexteHorsDossier,
} from "./cout-contexte-hors-dossier-devis";
import "./seo-am-suggestions.test";
import {
  COUT_DOUBLE_SAISIE_DEFAULTS,
  COUT_DOUBLE_SAISIE_LABELS,
  computeCoutDoubleSaisie,
} from "./cout-double-saisie-devis";
import {
  COUT_PIPELINE_FANTOME_DEFAULTS,
  COUT_PIPELINE_FANTOME_LABELS,
  computeCoutPipelineFantome,
} from "./cout-pipeline-fantome-devis";
import { computeTvaDevisHtTtc, resolveTvaRatePct } from "./tva-devis-ht-ttc";
import { CHECKLIST_MENTIONS_ITEMS, computeChecklistMentions } from "./checklist-mentions-devis";
import { MARKETING_ROUTES } from "./routes";
import sitemap from "../../app/sitemap";
import { APEX_HOST, SITE_HOST, SITE_URL, absoluteUrl, pageMetadata, rootJsonLd } from "./site";
import { CREAM_HEX, TAG_COVER } from "./theme";
import { calloutKind, calloutLabel, paragraphCalloutKind, parseImageLine, stripCalloutPrefix } from "./markdown-parse";

const EM_DASH = /\u2014/;

assert.equal(SITE_HOST, "www.quotebuilder.co");
assert.equal(APEX_HOST, "quotebuilder.co");
assert.equal(SITE_URL, "https://www.quotebuilder.co");
assert.equal(absoluteUrl("/blog"), "https://www.quotebuilder.co/blog");
assert.doesNotMatch(SITE_URL, /vercel\.app/);
assert.doesNotMatch(SITE_URL, /https:\/\/quotebuilder\.co$/);

const apexHost = /https:\/\/quotebuilder\.co(?![\w.-])/;
const llms = readFileSync(new URL("../../../public/llms.txt", import.meta.url), "utf8");
assert.match(llms, /https:\/\/www\.quotebuilder\.co\/sitemap\.xml/);
assert.match(llms, /https:\/\/www\.quotebuilder\.co\/robots\.txt/);
assert.match(llms, /https:\/\/www\.quotebuilder\.co/);
assert.doesNotMatch(llms, apexHost);

const json = JSON.stringify(rootJsonLd());
assert.match(json, /https:\/\/www\.quotebuilder\.co/);
assert.doesNotMatch(json, apexHost);

const vercel = JSON.parse(
  readFileSync(new URL("../../../vercel.json", import.meta.url), "utf8"),
) as { redirects: { has?: { value: string }[]; destination: string; statusCode: number }[] };
assert.ok(
  vercel.redirects.some(
    (rule) =>
      rule.statusCode === 308 &&
      rule.destination.startsWith("https://www.quotebuilder.co") &&
      rule.has?.some((item) => item.value === "quotebuilder.co"),
  ),
);

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const required of [
  "/",
  "/tarifs",
  "/blog",
  "/blog/pourquoi-les-devis-meurent-sans-relance",
  "/outils/cout-devis-non-relance",
  "/outils/generateur-sequence-relances",
  "/outils/score-brief-devis",
  "/outils/simulateur-taux-conversion-devis",
  "/outils/calculateur-capacite-equipe-devis",
  "/outils/estimateur-temps-chiffrage-devis",
  "/outils/simulateur-impact-remise-devis",
  "/outils/simulateur-roi-logiciel-devis",
  "/outils/simulateur-taux-acceptation-devis",
  "/outils/estimateur-cout-brief-incomplet",
  "/outils/simulateur-cout-devis-expires",
  "/outils/calculateur-acompte-devis",
  "/outils/estimateur-gain-temps-catalogue-devis",
  "/outils/calculateur-seuil-remise-marge",
  "/outils/generateur-url-prefill-devis",
  "/outils/estimateur-leads-formulaire-vs-funnel-wp",
  "/outils/estimateur-cout-devis-pdf-seuls",
  "/outils/checklist-mentions-devis-france",
  "/outils/estimateur-cout-aller-retours-brief-photos",
  "/outils/estimateur-cout-emails-clarification-devis",
  "/outils/estimateur-cout-devis-sans-validation",
  "/outils/estimateur-cout-relances-aveugles-devis",
  "/outils/estimateur-cout-attente-multi-decideurs-devis",
  "/outils/estimateur-cout-visites-techniques-inutiles",
  "/outils/estimateur-cout-pipeline-fantome-devis",
  "/outils/estimateur-cout-demandes-orales-non-capturees",
  "/outils/estimateur-cout-double-saisie-devis",
  "/outils/estimateur-cout-handoff-commercial-technique-devis",
  "/outils/estimateur-cout-contexte-hors-dossier-devis",
  "/outils/estimateur-valeur-produits-suggeres-devis",
  "/blog/regles-suggestion-produits-funnel-devis-b2b",
  "/blog/notes-internes-dossier-devis-equipe-b2b",
  "/blog/transfert-brief-commercial-technique-devis-b2b",
  "/blog/sources-demande-devis-b2b-funnel-api",
  "/blog/telephone-whatsapp-vers-brief-devis-b2b",
  "/blog/statuts-pipeline-devis-b2b",
  "/blog/visite-technique-avant-devis-b2b",
  "/outils/calculateur-tva-devis-ht-ttc",
  "/blog/tva-ht-ttc-devis-b2b-france",
  "/blog/approbation-client-multi-decideurs-devis-b2b",
  "/blog/suivi-ouverture-lecture-devis-en-ligne-b2b",
  "/blog/validation-interne-avant-envoi-devis-b2b",
  "/blog/commentaires-annotations-devis-collaboratif-b2b",
  "/a-propos",
  "/secteurs/funnel-devis-rayonnage-stockage",
  "/secteurs/funnel-devis-menuiserie-sur-mesure",
  "/secteurs/funnel-devis-location-evenementiel",
  "/secteurs/funnel-devis-agencement-bureau",
  "/secteurs/funnel-devis-stores-fermetures",
  "/secteurs/funnel-devis-cuisine-equipee",
  "/secteurs/funnel-devis-cloture-portail",
  "/secteurs/funnel-devis-pergola-terrasse",
  "/secteurs/funnel-devis-pompe-chaleur-chauffage",
  "/secteurs/funnel-devis-photovoltaique-solaire",
  "/secteurs/funnel-devis-isolation-thermique-ite",
  "/secteurs/funnel-devis-couverture-toiture",
  "/secteurs/funnel-devis-plomberie-sanitaire",
  "/secteurs/funnel-devis-electricite-tertiaire",
  "/secteurs/funnel-devis-metallerie-serrurerie",
  "/secteurs/funnel-devis-paysagiste-amenagement-jardin",
  "/blog/pieces-jointes-plans-photos-devis-b2b",
  "/blog/envoyer-devis-lien-securise-vs-pdf-email",
  "/blog/mentions-obligatoires-devis-france",
  "/blog/recevoir-demandes-devis-wordpress-quotebuilder",
  "/blog/bibliotheque-lignes-kits-devis-b2b",
  "/blog/remise-commerciale-marge-devis-b2b",
  "/blog/preremplir-devis-url-parametres",
  "/blog/fiche-produit-b2b-devis-unifie",
  "/blog/acomptes-echeances-devis-b2b",
  "/blog/validite-expiration-devis-b2b",
  "/blog/options-variantes-alternatives-devis-b2b",
  "/blog/signature-acceptation-devis-en-ligne-b2b",
  "/blog/revue-pipeline-devis-b2b",
  "/blog/centraliser-demandes-devis-multi-canaux",
  "/blog/versions-historique-devis-b2b",
  "/blog/assignation-sla-demande-devis-equipe",
  "/blog/qualifier-demande-devis-avant-chiffrage",
  "/blog/creer-devis-avec-claude-mcp",
  "/blog/visite-guidee-parcours-devis-b2b",
  "/blog/relancer-devis-hot-depuis-dossier",
  "/blog/delai-reponse-demande-devis-b2b",
  "/blog/template-boutique-en-ligne-menuiserie-devis",
  "/blog/devis-en-ligne-integre-boutique",
  "/blog/score-demande-devis-b2b",
  "/blog/configurateur-devis-vs-excel-pdf",
  "/legal/cgu",
  "/legal/confidentialite",
  "/fonctionnalites/funnel",
]) {
  assert.ok(paths.includes(required), `missing route ${required}`);
}

assert.equal(BLOG_POSTS.length, 48);
assert.equal(BLOG_TOOLS.length, 38);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === "/outils/estimateur-cout-demandes-orales-non-capturees"));
assert.ok(BLOG_TOOLS.some((tool) => tool.href === "/outils/estimateur-cout-double-saisie-devis"));
assert.ok(BLOG_TOOLS.some((tool) => tool.href === "/outils/estimateur-cout-handoff-commercial-technique-devis"));
assert.ok(BLOG_TOOLS.some((tool) => tool.href === "/outils/estimateur-cout-contexte-hors-dossier-devis"));
assert.ok(BLOG_TOOLS.some((tool) => tool.href === "/outils/estimateur-valeur-produits-suggeres-devis"));
const outilsHub = readFileSync(new URL("../../app/(marketing)/outils/page.tsx", import.meta.url), "utf8");
assert.match(outilsHub, /outilsHubIntro\(\)/);
assert.equal(
  outilsHubIntro(),
  "Trente-huit outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.",
);
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());
assert.doesNotMatch(outilsHub, /Vingt-quatre|Vingt-cinq|Vingt-six|Vingt-sept|Vingt-huit|Vingt-neuf|Trente/);
assert.match(outilsHub, /estimateur-cout-demandes-orales-non-capturees/);
assert.match(outilsHub, /estimateur-cout-double-saisie-devis/);
assert.match(outilsHub, /estimateur-cout-handoff-commercial-technique-devis/);
assert.match(outilsHub, /estimateur-cout-contexte-hors-dossier-devis/);
assert.match(outilsHub, /estimateur-valeur-produits-suggeres-devis/);
assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "notes-internes-dossier-devis-equipe-b2b")?.tags,
  ["funnel", "scoring"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "notes-internes-dossier-devis-equipe-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "notes-internes-dossier-devis-equipe-b2b")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "notes-internes-dossier-devis-equipe-b2b")?.readingMinutes,
  14,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "notes-internes-dossier-devis-equipe-b2b")?.publishedAt,
  "2026-10-02",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "notes-internes-dossier-devis-equipe-b2b")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "notes-internes-dossier-devis-equipe-b2b")?.path,
  "/blog/notes-internes-dossier-devis-equipe-b2b",
);
assert.equal(BLOG_FAQ["notes-internes-dossier-devis-equipe-b2b"]?.length, 10);
assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "transfert-brief-commercial-technique-devis-b2b")?.tags,
  ["funnel", "scoring"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "transfert-brief-commercial-technique-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "transfert-brief-commercial-technique-devis-b2b")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "transfert-brief-commercial-technique-devis-b2b")?.readingMinutes,
  13,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "transfert-brief-commercial-technique-devis-b2b")?.publishedAt,
  "2026-10-02",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "transfert-brief-commercial-technique-devis-b2b")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "transfert-brief-commercial-technique-devis-b2b")?.path,
  "/blog/transfert-brief-commercial-technique-devis-b2b",
);
assert.equal(BLOG_FAQ["transfert-brief-commercial-technique-devis-b2b"]?.length, 10);
assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "sources-demande-devis-b2b-funnel-api")?.tags,
  ["funnel", "scoring"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "sources-demande-devis-b2b-funnel-api")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "sources-demande-devis-b2b-funnel-api")?.cover,
  BLOG_DEMO_SHOTS.funnelPublic,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "sources-demande-devis-b2b-funnel-api")?.readingMinutes,
  14,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "sources-demande-devis-b2b-funnel-api")?.publishedAt,
  "2026-10-01",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "sources-demande-devis-b2b-funnel-api")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "sources-demande-devis-b2b-funnel-api")?.path,
  "/blog/sources-demande-devis-b2b-funnel-api",
);
assert.equal(BLOG_FAQ["sources-demande-devis-b2b-funnel-api"]?.length, 10);
const secteursHub = readFileSync(new URL("../../app/(marketing)/secteurs/page.tsx", import.meta.url), "utf8");
assert.match(secteursHub, /funnel-devis-electricite-tertiaire/);
assert.match(secteursHub, /funnel-devis-metallerie-serrurerie/);
assert.match(secteursHub, /funnel-devis-paysagiste-amenagement-jardin/);
assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "telephone-whatsapp-vers-brief-devis-b2b")?.tags,
  ["funnel", "scoring"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "telephone-whatsapp-vers-brief-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "telephone-whatsapp-vers-brief-devis-b2b")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "telephone-whatsapp-vers-brief-devis-b2b")?.readingMinutes,
  13,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "telephone-whatsapp-vers-brief-devis-b2b")?.publishedAt,
  "2026-10-01",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "telephone-whatsapp-vers-brief-devis-b2b")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "telephone-whatsapp-vers-brief-devis-b2b")?.path,
  "/blog/telephone-whatsapp-vers-brief-devis-b2b",
);
assert.equal(BLOG_FAQ["telephone-whatsapp-vers-brief-devis-b2b"]?.length, 10);
assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "statuts-pipeline-devis-b2b")?.tags,
  ["funnel", "scoring"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "statuts-pipeline-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "statuts-pipeline-devis-b2b")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "statuts-pipeline-devis-b2b")?.readingMinutes, 14);
assert.equal(BLOG_POSTS.find((post) => post.slug === "statuts-pipeline-devis-b2b")?.publishedAt, "2026-09-30");
assert.equal(BLOG_POSTS.find((post) => post.slug === "statuts-pipeline-devis-b2b")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "statuts-pipeline-devis-b2b")?.path,
  "/blog/statuts-pipeline-devis-b2b",
);
assert.equal(BLOG_FAQ["statuts-pipeline-devis-b2b"]?.length, 10);
assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "visite-technique-avant-devis-b2b")?.tags,
  ["funnel", "scoring"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "visite-technique-avant-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "visite-technique-avant-devis-b2b")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "visite-technique-avant-devis-b2b")?.readingMinutes,
  13,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "visite-technique-avant-devis-b2b")?.publishedAt,
  "2026-09-30",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "visite-technique-avant-devis-b2b")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "visite-technique-avant-devis-b2b")?.path,
  "/blog/visite-technique-avant-devis-b2b",
);
assert.equal(BLOG_FAQ["visite-technique-avant-devis-b2b"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "tva-ht-ttc-devis-b2b-france")?.tags, ["funnel"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "tva-ht-ttc-devis-b2b-france")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "tva-ht-ttc-devis-b2b-france")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "tva-ht-ttc-devis-b2b-france")?.readingMinutes, 13);
assert.equal(BLOG_POSTS.find((post) => post.slug === "tva-ht-ttc-devis-b2b-france")?.publishedAt, "2026-09-29");
assert.equal(BLOG_POSTS.find((post) => post.slug === "tva-ht-ttc-devis-b2b-france")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "tva-ht-ttc-devis-b2b-france")?.path,
  "/blog/tva-ht-ttc-devis-b2b-france",
);
assert.equal(BLOG_FAQ["tva-ht-ttc-devis-b2b-france"]?.length, 10);
assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "approbation-client-multi-decideurs-devis-b2b")?.tags,
  ["funnel", "scoring"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "approbation-client-multi-decideurs-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "approbation-client-multi-decideurs-devis-b2b")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "approbation-client-multi-decideurs-devis-b2b")?.readingMinutes,
  13,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "approbation-client-multi-decideurs-devis-b2b")?.publishedAt,
  "2026-09-29",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "approbation-client-multi-decideurs-devis-b2b")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "approbation-client-multi-decideurs-devis-b2b")?.path,
  "/blog/approbation-client-multi-decideurs-devis-b2b",
);
assert.equal(BLOG_FAQ["approbation-client-multi-decideurs-devis-b2b"]?.length, 10);
assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "suivi-ouverture-lecture-devis-en-ligne-b2b")?.tags,
  ["funnel", "scoring"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "suivi-ouverture-lecture-devis-en-ligne-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "suivi-ouverture-lecture-devis-en-ligne-b2b")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "suivi-ouverture-lecture-devis-en-ligne-b2b")?.readingMinutes,
  19,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "suivi-ouverture-lecture-devis-en-ligne-b2b")?.publishedAt,
  "2026-09-28",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "suivi-ouverture-lecture-devis-en-ligne-b2b")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "suivi-ouverture-lecture-devis-en-ligne-b2b")?.path,
  "/blog/suivi-ouverture-lecture-devis-en-ligne-b2b",
);
assert.equal(BLOG_FAQ["suivi-ouverture-lecture-devis-en-ligne-b2b"]?.length, 10);
assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "validation-interne-avant-envoi-devis-b2b")?.tags,
  ["funnel", "scoring"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "validation-interne-avant-envoi-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "validation-interne-avant-envoi-devis-b2b")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "validation-interne-avant-envoi-devis-b2b")?.readingMinutes,
  14,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "validation-interne-avant-envoi-devis-b2b")?.publishedAt,
  "2026-09-28",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "validation-interne-avant-envoi-devis-b2b")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "validation-interne-avant-envoi-devis-b2b")?.path,
  "/blog/validation-interne-avant-envoi-devis-b2b",
);
assert.equal(BLOG_FAQ["validation-interne-avant-envoi-devis-b2b"]?.length, 9);
assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "commentaires-annotations-devis-collaboratif-b2b")?.tags,
  ["funnel"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "commentaires-annotations-devis-collaboratif-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "commentaires-annotations-devis-collaboratif-b2b")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "commentaires-annotations-devis-collaboratif-b2b")?.readingMinutes,
  12,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "commentaires-annotations-devis-collaboratif-b2b")?.publishedAt,
  "2026-09-25",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "commentaires-annotations-devis-collaboratif-b2b")?.pinned,
  false,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "commentaires-annotations-devis-collaboratif-b2b")?.path,
  "/blog/commentaires-annotations-devis-collaboratif-b2b",
);
assert.equal(BLOG_FAQ["commentaires-annotations-devis-collaboratif-b2b"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "pieces-jointes-plans-photos-devis-b2b")?.tags, [
  "funnel",
  "catalogue",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "pieces-jointes-plans-photos-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "pieces-jointes-plans-photos-devis-b2b")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "pieces-jointes-plans-photos-devis-b2b")?.readingMinutes, 12);
assert.equal(BLOG_POSTS.find((post) => post.slug === "pieces-jointes-plans-photos-devis-b2b")?.publishedAt, "2026-09-25");
assert.equal(BLOG_POSTS.find((post) => post.slug === "pieces-jointes-plans-photos-devis-b2b")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "pieces-jointes-plans-photos-devis-b2b")?.path,
  "/blog/pieces-jointes-plans-photos-devis-b2b",
);
assert.equal(BLOG_FAQ["pieces-jointes-plans-photos-devis-b2b"]?.length, 9);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "mentions-obligatoires-devis-france")?.tags, ["funnel"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "mentions-obligatoires-devis-france")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "mentions-obligatoires-devis-france")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "mentions-obligatoires-devis-france")?.readingMinutes, 14);
assert.equal(BLOG_POSTS.find((post) => post.slug === "mentions-obligatoires-devis-france")?.publishedAt, "2026-09-24");
assert.equal(BLOG_POSTS.find((post) => post.slug === "mentions-obligatoires-devis-france")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "mentions-obligatoires-devis-france")?.path,
  "/blog/mentions-obligatoires-devis-france",
);
assert.equal(BLOG_FAQ["mentions-obligatoires-devis-france"]?.length, 10);
assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "envoyer-devis-lien-securise-vs-pdf-email")?.tags,
  ["funnel", "relances"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "envoyer-devis-lien-securise-vs-pdf-email")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "envoyer-devis-lien-securise-vs-pdf-email")?.cover,
  BLOG_DEMO_SHOTS.devisDetail,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "envoyer-devis-lien-securise-vs-pdf-email")?.readingMinutes,
  12,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "envoyer-devis-lien-securise-vs-pdf-email")?.publishedAt,
  "2026-09-24",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "envoyer-devis-lien-securise-vs-pdf-email")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "envoyer-devis-lien-securise-vs-pdf-email")?.path,
  "/blog/envoyer-devis-lien-securise-vs-pdf-email",
);
assert.equal(BLOG_FAQ["envoyer-devis-lien-securise-vs-pdf-email"]?.length, 10);
assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "recevoir-demandes-devis-wordpress-quotebuilder")?.tags,
  ["integrations", "funnel"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "recevoir-demandes-devis-wordpress-quotebuilder")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "recevoir-demandes-devis-wordpress-quotebuilder")?.cover,
  "/images/blog/visite-guidee-parcours-devis-b2b/08-integrations.png",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "recevoir-demandes-devis-wordpress-quotebuilder")?.readingMinutes,
  12,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "recevoir-demandes-devis-wordpress-quotebuilder")?.publishedAt,
  "2026-09-23",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "recevoir-demandes-devis-wordpress-quotebuilder")?.pinned,
  false,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "recevoir-demandes-devis-wordpress-quotebuilder")?.path,
  "/blog/recevoir-demandes-devis-wordpress-quotebuilder",
);
assert.equal(BLOG_FAQ["recevoir-demandes-devis-wordpress-quotebuilder"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "bibliotheque-lignes-kits-devis-b2b")?.tags, [
  "catalogue",
  "funnel",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "bibliotheque-lignes-kits-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "bibliotheque-lignes-kits-devis-b2b")?.cover,
  "/images/blog/sync-catalogue-woocommerce-shopify-parcours-devis/06-produits.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "bibliotheque-lignes-kits-devis-b2b")?.readingMinutes, 12);
assert.equal(BLOG_POSTS.find((post) => post.slug === "bibliotheque-lignes-kits-devis-b2b")?.publishedAt, "2026-09-23");
assert.equal(BLOG_POSTS.find((post) => post.slug === "bibliotheque-lignes-kits-devis-b2b")?.pinned, false);
assert.equal(BLOG_FAQ["bibliotheque-lignes-kits-devis-b2b"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "remise-commerciale-marge-devis-b2b")?.tags, [
  "funnel",
  "scoring",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "remise-commerciale-marge-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "remise-commerciale-marge-devis-b2b")?.cover,
  "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "remise-commerciale-marge-devis-b2b")?.readingMinutes, 13);
assert.equal(BLOG_POSTS.find((post) => post.slug === "remise-commerciale-marge-devis-b2b")?.publishedAt, "2026-09-22");
assert.equal(BLOG_POSTS.find((post) => post.slug === "remise-commerciale-marge-devis-b2b")?.pinned, false);
assert.equal(BLOG_FAQ["remise-commerciale-marge-devis-b2b"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "preremplir-devis-url-parametres")?.tags, [
  "funnel",
  "integrations",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "preremplir-devis-url-parametres")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "preremplir-devis-url-parametres")?.cover,
  "/images/blog/installer-widget-devis-wordpress-javascript/08-integrations.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "preremplir-devis-url-parametres")?.readingMinutes, 12);
assert.equal(BLOG_POSTS.find((post) => post.slug === "preremplir-devis-url-parametres")?.publishedAt, "2026-09-22");
assert.equal(BLOG_POSTS.find((post) => post.slug === "preremplir-devis-url-parametres")?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === "preremplir-devis-url-parametres")?.path, "/blog/preremplir-devis-url-parametres");
assert.equal(BLOG_FAQ["preremplir-devis-url-parametres"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "fiche-produit-b2b-devis-unifie")?.tags, [
  "catalogue",
  "integrations",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "fiche-produit-b2b-devis-unifie")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "fiche-produit-b2b-devis-unifie")?.cover,
  "/images/blog/sync-catalogue-woocommerce-shopify-parcours-devis/06-produits.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "fiche-produit-b2b-devis-unifie")?.readingMinutes, 11);
assert.equal(BLOG_POSTS.find((post) => post.slug === "fiche-produit-b2b-devis-unifie")?.publishedAt, "2026-09-22");
assert.equal(BLOG_POSTS.find((post) => post.slug === "fiche-produit-b2b-devis-unifie")?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === "fiche-produit-b2b-devis-unifie")?.path, "/blog/fiche-produit-b2b-devis-unifie");
assert.equal(BLOG_FAQ["fiche-produit-b2b-devis-unifie"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "acomptes-echeances-devis-b2b")?.tags, [
  "funnel",
  "relances",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "acomptes-echeances-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "acomptes-echeances-devis-b2b")?.cover,
  "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "acomptes-echeances-devis-b2b")?.readingMinutes, 14);
assert.equal(BLOG_POSTS.find((post) => post.slug === "acomptes-echeances-devis-b2b")?.publishedAt, "2026-09-21");
assert.equal(BLOG_POSTS.find((post) => post.slug === "acomptes-echeances-devis-b2b")?.pinned, false);
assert.equal(BLOG_FAQ["acomptes-echeances-devis-b2b"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "validite-expiration-devis-b2b")?.tags, [
  "relances",
  "funnel",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "validite-expiration-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "validite-expiration-devis-b2b")?.cover,
  "/images/blog/visite-guidee-parcours-devis-b2b/03-devis.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "validite-expiration-devis-b2b")?.readingMinutes, 12);
assert.equal(BLOG_POSTS.find((post) => post.slug === "validite-expiration-devis-b2b")?.publishedAt, "2026-09-21");
assert.equal(BLOG_POSTS.find((post) => post.slug === "validite-expiration-devis-b2b")?.pinned, false);
assert.equal(BLOG_FAQ["validite-expiration-devis-b2b"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "options-variantes-alternatives-devis-b2b")?.tags, [
  "funnel",
  "scoring",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "options-variantes-alternatives-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "options-variantes-alternatives-devis-b2b")?.cover,
  "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "options-variantes-alternatives-devis-b2b")?.readingMinutes, 12);
assert.equal(BLOG_POSTS.find((post) => post.slug === "options-variantes-alternatives-devis-b2b")?.publishedAt, "2026-09-18");
assert.equal(BLOG_POSTS.find((post) => post.slug === "options-variantes-alternatives-devis-b2b")?.pinned, false);
assert.equal(BLOG_FAQ["options-variantes-alternatives-devis-b2b"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "signature-acceptation-devis-en-ligne-b2b")?.tags, [
  "funnel",
  "relances",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "signature-acceptation-devis-en-ligne-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "signature-acceptation-devis-en-ligne-b2b")?.cover,
  "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "signature-acceptation-devis-en-ligne-b2b")?.readingMinutes, 12);
assert.equal(BLOG_POSTS.find((post) => post.slug === "signature-acceptation-devis-en-ligne-b2b")?.publishedAt, "2026-09-18");
assert.equal(BLOG_POSTS.find((post) => post.slug === "signature-acceptation-devis-en-ligne-b2b")?.pinned, false);
assert.equal(BLOG_FAQ["signature-acceptation-devis-en-ligne-b2b"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "revue-pipeline-devis-b2b")?.tags, [
  "scoring",
  "relances",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "revue-pipeline-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "revue-pipeline-devis-b2b")?.cover,
  "/images/blog/visite-guidee-parcours-devis-b2b/03-devis.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "revue-pipeline-devis-b2b")?.readingMinutes, 11);
assert.equal(BLOG_POSTS.find((post) => post.slug === "revue-pipeline-devis-b2b")?.publishedAt, "2026-09-17");
assert.equal(BLOG_POSTS.find((post) => post.slug === "revue-pipeline-devis-b2b")?.pinned, false);
assert.equal(BLOG_FAQ["revue-pipeline-devis-b2b"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "centraliser-demandes-devis-multi-canaux")?.tags, [
  "funnel",
  "scoring",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "centraliser-demandes-devis-multi-canaux")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "centraliser-demandes-devis-multi-canaux")?.cover,
  "/images/blog/relancer-devis-hot-depuis-dossier/03-devis.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "centraliser-demandes-devis-multi-canaux")?.readingMinutes, 11);
assert.equal(BLOG_POSTS.find((post) => post.slug === "centraliser-demandes-devis-multi-canaux")?.publishedAt, "2026-09-17");
assert.equal(BLOG_POSTS.find((post) => post.slug === "centraliser-demandes-devis-multi-canaux")?.pinned, false);
assert.equal(BLOG_FAQ["centraliser-demandes-devis-multi-canaux"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "versions-historique-devis-b2b")?.tags, [
  "funnel",
  "relances",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "versions-historique-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "versions-historique-devis-b2b")?.cover,
  "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "versions-historique-devis-b2b")?.readingMinutes, 11);
assert.equal(BLOG_POSTS.find((post) => post.slug === "versions-historique-devis-b2b")?.publishedAt, "2026-09-16");
assert.equal(BLOG_POSTS.find((post) => post.slug === "versions-historique-devis-b2b")?.pinned, false);
assert.equal(BLOG_FAQ["versions-historique-devis-b2b"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "assignation-sla-demande-devis-equipe")?.tags, [
  "scoring",
  "relances",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "assignation-sla-demande-devis-equipe")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "assignation-sla-demande-devis-equipe")?.cover,
  "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "assignation-sla-demande-devis-equipe")?.readingMinutes, 11);
assert.equal(BLOG_POSTS.find((post) => post.slug === "assignation-sla-demande-devis-equipe")?.publishedAt, "2026-09-15");
assert.equal(BLOG_POSTS.find((post) => post.slug === "assignation-sla-demande-devis-equipe")?.pinned, false);
assert.equal(BLOG_FAQ["assignation-sla-demande-devis-equipe"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "qualifier-demande-devis-avant-chiffrage")?.tags, [
  "funnel",
  "scoring",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "qualifier-demande-devis-avant-chiffrage")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "qualifier-demande-devis-avant-chiffrage")?.cover,
  "/images/blog/score-demande-devis-b2b/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "qualifier-demande-devis-avant-chiffrage")?.readingMinutes, 11);
assert.equal(BLOG_POSTS.find((post) => post.slug === "qualifier-demande-devis-avant-chiffrage")?.publishedAt, "2026-09-15");
assert.equal(BLOG_POSTS.find((post) => post.slug === "qualifier-demande-devis-avant-chiffrage")?.pinned, false);
assert.equal(BLOG_FAQ["qualifier-demande-devis-avant-chiffrage"]?.length, 10);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "creer-devis-avec-claude-mcp")?.tags, [
  "integrations",
  "scoring",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "creer-devis-avec-claude-mcp")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "creer-devis-avec-claude-mcp")?.cover,
  "/images/blog/creer-devis-avec-claude-mcp/03-devis.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "creer-devis-avec-claude-mcp")?.readingMinutes, 12);
assert.equal(BLOG_POSTS.find((post) => post.slug === "creer-devis-avec-claude-mcp")?.publishedAt, "2026-09-12");
assert.equal(BLOG_POSTS.find((post) => post.slug === "creer-devis-avec-claude-mcp")?.pinned, false);
assert.equal(BLOG_FAQ["creer-devis-avec-claude-mcp"]?.length, 8);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "visite-guidee-parcours-devis-b2b")?.tags, [
  "funnel",
  "scoring",
]);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "relancer-devis-hot-depuis-dossier")?.tags, [
  "relances",
  "scoring",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "relancer-devis-hot-depuis-dossier")?.ctaHref,
  "/outils/generateur-sequence-relances",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "relancer-devis-hot-depuis-dossier")?.cover,
  "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "relancer-devis-hot-depuis-dossier")?.pinned, false);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "delai-reponse-demande-devis-b2b")?.tags, [
  "scoring",
  "relances",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "delai-reponse-demande-devis-b2b")?.ctaHref,
  "/c/demo/rayonnage",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "delai-reponse-demande-devis-b2b")?.cover,
  "/images/blog/delai-reponse-demande-devis-b2b/03-devis.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "delai-reponse-demande-devis-b2b")?.pinned, false);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "template-boutique-en-ligne-menuiserie-devis")?.tags, [
  "integrations",
  "catalogue",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "template-boutique-en-ligne-menuiserie-devis")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "template-boutique-en-ligne-menuiserie-devis")?.cover,
  "/images/blog/template-boutique-secteur-devis/menuiserie-home.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "template-boutique-en-ligne-menuiserie-devis")?.readingMinutes, 12);
assert.equal(BLOG_POSTS.find((post) => post.slug === "template-boutique-en-ligne-menuiserie-devis")?.publishedAt, "2026-09-11");
assert.equal(BLOG_POSTS.find((post) => post.slug === "template-boutique-en-ligne-menuiserie-devis")?.pinned, false);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "devis-en-ligne-integre-boutique")?.tags, [
  "funnel",
  "catalogue",
]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "devis-en-ligne-integre-boutique")?.ctaHref,
  "https://www.quotebuilder.co/b/demo/atelier-peau-claire/devis",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "devis-en-ligne-integre-boutique")?.cover,
  "/images/blog/devis-en-ligne-integre-boutique/unify-shop-home.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "devis-en-ligne-integre-boutique")?.readingMinutes, 11);
assert.equal(BLOG_POSTS.find((post) => post.slug === "devis-en-ligne-integre-boutique")?.publishedAt, "2026-09-11");
assert.equal(BLOG_POSTS.find((post) => post.slug === "devis-en-ligne-integre-boutique")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "visite-guidee-parcours-devis-b2b")?.ctaHref,
  "/c/demo/rayonnage",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "visite-guidee-parcours-devis-b2b")?.cover,
  "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "visite-guidee-parcours-devis-b2b")?.pinned, false);
assert.deepEqual(BLOG_TAG_DEFS.map((tag) => tag.slug), [
  "scoring",
  "relances",
  "funnel",
  "integrations",
  "catalogue",
]);
assert.ok(
  BLOG_POSTS.every((post) => post.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag))),
  "every post needs known tags",
);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "score-demande-devis-b2b")?.tags, ["scoring", "funnel"]);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === "sync-catalogue-woocommerce-shopify-parcours-devis")?.tags, [
  "catalogue",
  "integrations",
]);
assert.equal(getFeaturedPost()?.slug, "score-demande-devis-b2b");
const funnelRelated = getRelatedPosts(BLOG_POSTS.find((post) => post.slug === "formulaire-contact-vs-funnel-devis-b2b")!);
assert.ok(funnelRelated.length > 0, "funnel posts should have same-tag siblings");
assert.ok(funnelRelated.every((post) => post.tags.includes("funnel") || post.tags.includes("scoring")));
assert.ok(!funnelRelated.some((post) => post.slug === "pourquoi-les-devis-meurent-sans-relance"));
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "scoring" }).length, 22);
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "Scoring" }).length, 22);
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "integrations" }).length, 11);
assert.equal(filterBlogPosts(BLOG_POSTS, { tag: "catalogue" }).length, 8);
assert.equal(filterBlogPosts(BLOG_POSTS, { q: "woocommerce" }).length, 2);
assert.equal(midArticleHeadingIndex(12), 5);
assert.ok(trimMetaDescription(BLOG_POSTS[0]!.description).length <= 155);
assert.equal(BLOG_UI.tryFree, "Essayer gratuitement");
assert.equal(BLOG_UI.toc, "Sur cette page");
assert.equal(BLOG_UI.midCtaLink, "Ouvrir la démo");
assert.equal(BLOG_POSTS.find((post) => post.slug === "score-demande-devis-b2b")?.ctaHref, "/c/demo/rayonnage");
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "installer-widget-devis-wordpress-javascript")?.ctaHref,
  "/b/demo/vitrine",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "pourquoi-les-devis-meurent-sans-relance")?.ctaHref,
  "/outils/generateur-sequence-relances",
);

const featuredScore = BLOG_POSTS.find((post) => post.slug === "score-demande-devis-b2b")!;
const articleLd = blogArticleJsonLd(featuredScore);
assert.equal(articleLd["@type"], "Article");
assert.match(String(articleLd.image), /images\/blog\/score-demande-devis-b2b\/04-devis-detail\.png/);
assert.match(String(articleLd.mainEntityOfPage), /www\.quotebuilder\.co\/blog\//);

const crumbs = blogBreadcrumbJsonLd(featuredScore);
assert.equal(crumbs["@type"], "BreadcrumbList");
assert.equal(crumbs.itemListElement.length, 3);
assert.equal(crumbs.itemListElement[0]?.name, "Blog");
assert.equal(crumbs.itemListElement[1]?.name, primaryTagLabel(featuredScore));

for (const value of Object.values(BLOG_UI)) {
  assert.doesNotMatch(value, EM_DASH, `BLOG_UI still contains an em dash: ${value}`);
}

const blogDir = join(process.cwd(), "src/content/blog");
const secteursDir = join(process.cwd(), "src/content/secteurs");
const blogFiles = readdirSync(blogDir).filter((name) => name.endsWith(".md"));
assert.ok(blogFiles.length >= 6, "expected blog markdown files");
assert.equal(
  existsSync(join(blogDir, "funnel-devis-photovoltaique-solaire.md")),
  false,
  "secteur photovoltaïque must not live under src/content/blog",
);
assert.ok(existsSync(join(secteursDir, "funnel-devis-photovoltaique-solaire.md")));

const requiredSources = {
  "pourquoi-les-devis-meurent-sans-relance.md": [
    "https://www.invespcro.com/blog/follow-up-sales-emails/",
    "https://belkins.io/blog/b2b-sales-follow-up-statistics",
    "https://pipeline.zoominfo.com/sales/sales-follow-up-statistics",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/outils/cout-devis-non-relance",
    "/images/blog/pourquoi-les-devis-meurent-sans-relance/05-automations.png",
  ],
  "formulaire-contact-vs-funnel-devis-b2b.md": [
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/installer-widget-devis-wordpress-javascript",
    "/fonctionnalites/funnel",
    "/images/blog/formulaire-contact-vs-funnel-devis-b2b/09-public-funnel.png",
  ],
  "installer-widget-devis-wordpress-javascript.md": [
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/blog/sync-catalogue-woocommerce-shopify-parcours-devis",
    "www.quotebuilder.co",
    "/images/blog/installer-widget-devis-wordpress-javascript/08-integrations.png",
  ],
  "sync-catalogue-woocommerce-shopify-parcours-devis.md": [
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/installer-widget-devis-wordpress-javascript",
    "/fonctionnalites/integrations",
    "/images/blog/sync-catalogue-woocommerce-shopify-parcours-devis/06-produits.png",
  ],
  "score-demande-devis-b2b.md": [
    "https://www.webyn.ai/blog/taux-conversion-moyen-b2b",
    "https://brixongroup.com/en/benchmark-study-how-top-performers-in-the-dach-industrial-sector-achieve-three-times-higher-conversion-rates",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/outils/score-brief-devis",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/images/blog/score-demande-devis-b2b/04-devis-detail.png",
  ],
  "configurateur-devis-vs-excel-pdf.md": [
    "/blog/score-demande-devis-b2b",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/outils/score-brief-devis",
    "/images/blog/configurateur-devis-vs-excel-pdf/09-public-funnel.png",
  ],
  "visite-guidee-parcours-devis-b2b.md": [
    "/images/blog/visite-guidee-parcours-devis-b2b/09-public-funnel.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/10-public-boutique.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/02-accueil.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/03-devis.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/06-produits.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/07-funnels.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/08-integrations.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/05-automations.png",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/blog/score-demande-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/c/demo/rayonnage",
    "/b/demo/vitrine",
    "/signup?plan=free",
  ],
  "relancer-devis-hot-depuis-dossier.md": [
    "/images/blog/relancer-devis-hot-depuis-dossier/09-public-funnel.png",
    "/images/blog/relancer-devis-hot-depuis-dossier/02-accueil.png",
    "/images/blog/relancer-devis-hot-depuis-dossier/03-devis.png",
    "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
    "/images/blog/relancer-devis-hot-depuis-dossier/05-automations.png",
    "/blog/score-demande-devis-b2b",
    "/blog/visite-guidee-parcours-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/outils/generateur-sequence-relances",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "delai-reponse-demande-devis-b2b.md": [
    "/images/blog/delai-reponse-demande-devis-b2b/02-accueil.png",
    "/images/blog/delai-reponse-demande-devis-b2b/03-devis.png",
    "/images/blog/delai-reponse-demande-devis-b2b/04-devis-detail.png",
    "/images/blog/delai-reponse-demande-devis-b2b/05-automations.png",
    "/blog/score-demande-devis-b2b",
    "/blog/relancer-devis-hot-depuis-dossier",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/secteurs/funnel-devis-location-evenementiel",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "template-boutique-en-ligne-menuiserie-devis.md": [
    "/images/blog/template-boutique-secteur-devis/menuiserie-home.png",
    "/images/blog/template-boutique-secteur-devis/menuiserie-catalog.png",
    "/images/blog/template-boutique-secteur-devis/skin-home.png",
    "/images/blog/template-boutique-secteur-devis/skin-cta.png",
    "/images/blog/template-boutique-secteur-devis/skin-catalog.png",
    "/images/blog/template-boutique-secteur-devis/stock-home.png",
    "/images/blog/template-boutique-secteur-devis/stock-catalog.png",
    "/images/blog/template-boutique-secteur-devis/catalogue-vendeur.png",
    "/images/blog/template-boutique-secteur-devis/integrations.png",
    "/b/demo/atelier-bois-nord",
    "/b/demo/atelier-peau-claire",
    "/b/demo/stock-pro-b2b",
    "/blog/visite-guidee-parcours-devis-b2b",
    "/blog/sync-catalogue-woocommerce-shopify-parcours-devis",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/signup?plan=free",
  ],
  "devis-en-ligne-integre-boutique.md": [
    "/images/blog/devis-en-ligne-integre-boutique/unify-shop-home.png",
    "/images/blog/devis-en-ligne-integre-boutique/unify-add-or-catalog.png",
    "/images/blog/devis-en-ligne-integre-boutique/unify-devis-skincare.png",
    "/images/blog/devis-en-ligne-integre-boutique/unify-devis-menuiserie.png",
    "/images/blog/devis-en-ligne-integre-boutique/unify-devis-stock.png",
    "/b/demo/atelier-peau-claire/devis",
    "/b/demo/atelier-bois-nord/devis",
    "/b/demo/stock-pro-b2b/devis",
    "/signup?plan=free",
  ],
  "revue-pipeline-devis-b2b.md": [
    "/images/blog/visite-guidee-parcours-devis-b2b/03-devis.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
    "/blog/score-demande-devis-b2b",
    "/blog/centraliser-demandes-devis-multi-canaux",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/relancer-devis-hot-depuis-dossier",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/assignation-sla-demande-devis-equipe",
    "/blog/delai-reponse-demande-devis-b2b",
    "/blog/versions-historique-devis-b2b",
    "/outils/estimateur-valeur-pipeline-devis",
    "/outils/calculateur-capacite-equipe-devis",
    "/outils/cout-devis-non-relance",
    "/outils/simulateur-taux-conversion-devis",
    "/outils/generateur-sequence-relances",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "centraliser-demandes-devis-multi-canaux.md": [
    "figure:multi-channel-pipeline",
    "/blog/delai-reponse-demande-devis-b2b",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/score-demande-devis-b2b",
    "/blog/assignation-sla-demande-devis-equipe",
    "/blog/versions-historique-devis-b2b",
    "/secteurs/funnel-devis-stores-fermetures",
    "/outils/calculateur-capacite-equipe-devis",
    "/outils/simulateur-impact-remise-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-stores-fermetures.md": [
    "/blog/centraliser-demandes-devis-multi-canaux",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/score-demande-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/secteurs/funnel-devis-rayonnage-stockage",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/outils/simulateur-impact-remise-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "mentions-obligatoires-devis-france.md": [
    "/outils/checklist-mentions-devis-france",
    "/blog/signature-acceptation-devis-en-ligne-b2b",
    "/blog/versions-historique-devis-b2b",
    "/blog/acomptes-echeances-devis-b2b",
    "/blog/validite-expiration-devis-b2b",
    "/blog/envoyer-devis-lien-securise-vs-pdf-email",
    "/blog/bibliotheque-lignes-kits-devis-b2b",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "envoyer-devis-lien-securise-vs-pdf-email.md": [
    "/fonctionnalites/espace-prospect",
    "/blog/configurateur-devis-vs-excel-pdf",
    "/blog/versions-historique-devis-b2b",
    "/blog/signature-acceptation-devis-en-ligne-b2b",
    "/outils/estimateur-cout-devis-pdf-seuls",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-pompe-chaleur-chauffage.md": [
    "/blog/envoyer-devis-lien-securise-vs-pdf-email",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/secteurs/funnel-devis-stores-fermetures",
    "/secteurs/funnel-devis-pergola-terrasse",
    "/outils/estimateur-cout-brief-incomplet",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "pieces-jointes-plans-photos-devis-b2b.md": [
    "/outils/estimateur-cout-aller-retours-brief-photos",
    "/outils/estimateur-cout-brief-incomplet",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/envoyer-devis-lien-securise-vs-pdf-email",
    "/secteurs/funnel-devis-photovoltaique-solaire",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "suivi-ouverture-lecture-devis-en-ligne-b2b.md": [
    "/outils/estimateur-cout-relances-aveugles-devis",
    "/blog/envoyer-devis-lien-securise-vs-pdf-email",
    "/blog/relancer-devis-hot-depuis-dossier",
    "/fonctionnalites/espace-prospect",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "statuts-pipeline-devis-b2b.md": [
    "/outils/estimateur-cout-pipeline-fantome-devis",
    "/blog/revue-pipeline-devis-b2b",
    "/blog/score-demande-devis-b2b",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "visite-technique-avant-devis-b2b.md": [
    "/outils/estimateur-cout-visites-techniques-inutiles",
    "/outils/estimateur-cout-aller-retours-brief-photos",
    "/outils/estimateur-cout-brief-incomplet",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/score-demande-devis-b2b",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/secteurs/funnel-devis-plomberie-sanitaire",
    "/secteurs/funnel-devis-couverture-toiture",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "notes-internes-dossier-devis-equipe-b2b.md": [
    "/outils/estimateur-cout-contexte-hors-dossier-devis",
    "/outils/estimateur-cout-handoff-commercial-technique-devis",
    "/outils/estimateur-cout-double-saisie-devis",
    "/blog/transfert-brief-commercial-technique-devis-b2b",
    "/blog/validation-interne-avant-envoi-devis-b2b",
    "/blog/commentaires-annotations-devis-collaboratif-b2b",
    "/fonctionnalites/espace-prospect",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "transfert-brief-commercial-technique-devis-b2b.md": [
    "/outils/estimateur-cout-handoff-commercial-technique-devis",
    "/blog/validation-interne-avant-envoi-devis-b2b",
    "/blog/score-demande-devis-b2b",
    "/blog/visite-technique-avant-devis-b2b",
    "/secteurs/funnel-devis-metallerie-serrurerie",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-metallerie-serrurerie.md": [
    "/blog/transfert-brief-commercial-technique-devis-b2b",
    "/blog/visite-technique-avant-devis-b2b",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/outils/estimateur-cout-handoff-commercial-technique-devis",
    "Escalier / garde-corps",
    "/signup?plan=free",
  ],
  "regles-suggestion-produits-funnel-devis-b2b.md": [
    "/blog/options-variantes-alternatives-devis-b2b",
    "/secteurs/funnel-devis-paysagiste-amenagement-jardin",
    "/secteurs/funnel-devis-rayonnage-stockage",
    "/fonctionnalites/catalogue",
    "/fonctionnalites/funnel",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-paysagiste-amenagement-jardin.md": [
    "/blog/regles-suggestion-produits-funnel-devis-b2b",
    "/secteurs/funnel-devis-pergola-terrasse",
    "/secteurs/funnel-devis-cloture-portail",
    "/outils/estimateur-valeur-produits-suggeres-devis",
    "/outils/estimateur-cout-visites-techniques-inutiles",
    "Paysagiste",
    "/signup?plan=free",
  ],
  "sources-demande-devis-b2b-funnel-api.md": [
    "/outils/estimateur-cout-double-saisie-devis",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/blog/preremplir-devis-url-parametres",
    "/blog/recevoir-demandes-devis-wordpress-quotebuilder",
    "/blog/telephone-whatsapp-vers-brief-devis-b2b",
    "/blog/score-demande-devis-b2b",
    "/blog/statuts-pipeline-devis-b2b",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "telephone-whatsapp-vers-brief-devis-b2b.md": [
    "/outils/estimateur-cout-demandes-orales-non-capturees",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/score-demande-devis-b2b",
    "/blog/centraliser-demandes-devis-multi-canaux",
    "/secteurs/funnel-devis-electricite-tertiaire",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-electricite-tertiaire.md": [
    "/blog/telephone-whatsapp-vers-brief-devis-b2b",
    "/blog/visite-technique-avant-devis-b2b",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/secteurs/funnel-devis-plomberie-sanitaire",
    "/outils/estimateur-cout-demandes-orales-non-capturees",
    "/outils/estimateur-cout-visites-techniques-inutiles",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-plomberie-sanitaire.md": [
    "/blog/visite-technique-avant-devis-b2b",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/validation-interne-avant-envoi-devis-b2b",
    "/secteurs/funnel-devis-couverture-toiture",
    "/secteurs/funnel-devis-pompe-chaleur-chauffage",
    "/outils/estimateur-cout-visites-techniques-inutiles",
    "/outils/estimateur-cout-brief-incomplet",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "tva-ht-ttc-devis-b2b-france.md": [
    "/outils/calculateur-tva-devis-ht-ttc",
    "/blog/acomptes-echeances-devis-b2b",
    "/blog/mentions-obligatoires-devis-france",
    "/blog/remise-commerciale-marge-devis-b2b",
    "/outils/checklist-mentions-devis-france",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "approbation-client-multi-decideurs-devis-b2b.md": [
    "/outils/estimateur-cout-attente-multi-decideurs-devis",
    "/blog/validation-interne-avant-envoi-devis-b2b",
    "/blog/commentaires-annotations-devis-collaboratif-b2b",
    "/blog/suivi-ouverture-lecture-devis-en-ligne-b2b",
    "/secteurs/funnel-devis-couverture-toiture",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-couverture-toiture.md": [
    "/blog/approbation-client-multi-decideurs-devis-b2b",
    "/blog/validation-interne-avant-envoi-devis-b2b",
    "/secteurs/funnel-devis-isolation-thermique-ite",
    "/outils/estimateur-cout-devis-sans-validation",
    "/outils/estimateur-cout-brief-incomplet",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "validation-interne-avant-envoi-devis-b2b.md": [
    "/outils/estimateur-cout-devis-sans-validation",
    "/blog/remise-commerciale-marge-devis-b2b",
    "/blog/versions-historique-devis-b2b",
    "/blog/mentions-obligatoires-devis-france",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-isolation-thermique-ite.md": [
    "/blog/validation-interne-avant-envoi-devis-b2b",
    "/secteurs/funnel-devis-pompe-chaleur-chauffage",
    "/secteurs/funnel-devis-photovoltaique-solaire",
    "/outils/estimateur-cout-devis-sans-validation",
    "/outils/estimateur-cout-aller-retours-brief-photos",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "commentaires-annotations-devis-collaboratif-b2b.md": [
    "/outils/estimateur-cout-emails-clarification-devis",
    "/outils/estimateur-cout-aller-retours-brief-photos",
    "/blog/envoyer-devis-lien-securise-vs-pdf-email",
    "/blog/versions-historique-devis-b2b",
    "/secteurs/funnel-devis-photovoltaique-solaire",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-photovoltaique-solaire.md": [
    "/blog/pieces-jointes-plans-photos-devis-b2b",
    "/blog/envoyer-devis-lien-securise-vs-pdf-email",
    "/secteurs/funnel-devis-pompe-chaleur-chauffage",
    "/outils/estimateur-cout-aller-retours-brief-photos",
    "/outils/estimateur-cout-brief-incomplet",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "recevoir-demandes-devis-wordpress-quotebuilder.md": [
    "/blog/installer-widget-devis-wordpress-javascript",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/outils/estimateur-leads-formulaire-vs-funnel-wp",
    "/blog/sync-catalogue-woocommerce-shopify-parcours-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "bibliotheque-lignes-kits-devis-b2b.md": [
    "/blog/configurateur-devis-vs-excel-pdf",
    "/blog/sync-catalogue-woocommerce-shopify-parcours-devis",
    "/blog/options-variantes-alternatives-devis-b2b",
    "/outils/estimateur-temps-chiffrage-devis",
    "/outils/estimateur-gain-temps-catalogue-devis",
    "/fonctionnalites/catalogue",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-pergola-terrasse.md": [
    "/blog/bibliotheque-lignes-kits-devis-b2b",
    "/blog/options-variantes-alternatives-devis-b2b",
    "/blog/validite-expiration-devis-b2b",
    "/blog/signature-acceptation-devis-en-ligne-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/secteurs/funnel-devis-stores-fermetures",
    "/secteurs/funnel-devis-cloture-portail",
    "/outils/estimateur-gain-temps-catalogue-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "remise-commerciale-marge-devis-b2b.md": [
    "/images/blog/remise-commerciale-marge-devis-b2b/04-devis-detail.png",
    "/images/blog/remise-commerciale-marge-devis-b2b/05-automations.png",
    "/images/blog/remise-commerciale-marge-devis-b2b/03-devis.png",
    "/blog/options-variantes-alternatives-devis-b2b",
    "/blog/versions-historique-devis-b2b",
    "/blog/validite-expiration-devis-b2b",
    "/blog/acomptes-echeances-devis-b2b",
    "/blog/signature-acceptation-devis-en-ligne-b2b",
    "/blog/revue-pipeline-devis-b2b",
    "/outils/calculateur-seuil-remise-marge",
    "/outils/simulateur-impact-remise-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "preremplir-devis-url-parametres.md": [
    "/blog/preremplir-devis-url-parametres/img-1.png",
    "/blog/preremplir-devis-url-parametres/img-2.png",
    "/blog/preremplir-devis-url-parametres/img-3.png",
    "/blog/preremplir-devis-url-parametres/img-4.png",
    "/blog/preremplir-devis-url-parametres/img-5.png",
    "/blog/preremplir-devis-url-parametres/img-6.png",
    "/blog/preremplir-devis-url-parametres/img-7.png",
    "/outils/generateur-url-prefill-devis",
    "/blog/fiche-produit-b2b-devis-unifie",
    "/blog/installer-widget-devis-wordpress-javascript",
    "/c/demo/rayonnage",
    "/c/quickly/rayonnage?besoin=rayonnages",
    "/signup?plan=free",
  ],
  "fiche-produit-b2b-devis-unifie.md": [
    "/blog/fiche-produit-b2b-devis-unifie/img-1.png",
    "/blog/fiche-produit-b2b-devis-unifie/img-2.png",
    "/blog/fiche-produit-b2b-devis-unifie/img-3.png",
    "/blog/fiche-produit-b2b-devis-unifie/img-4.png",
    "/blog/fiche-produit-b2b-devis-unifie/img-5.png",
    "/blog/fiche-produit-b2b-devis-unifie/img-6.png",
    "/blog/fiche-produit-b2b-devis-unifie/img-7.png",
    "/blog/preremplir-devis-url-parametres",
    "/blog/sync-catalogue-woocommerce-shopify-parcours-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "acomptes-echeances-devis-b2b.md": [
    "/blog/acomptes-echeances-devis-b2b/img-1.png",
    "/blog/acomptes-echeances-devis-b2b/img-2.png",
    "/blog/acomptes-echeances-devis-b2b/img-3.png",
    "/blog/acomptes-echeances-devis-b2b/img-4.png",
    "/blog/validite-expiration-devis-b2b",
    "/fonctionnalites/espace-prospect",
    "/blog/signature-acceptation-devis-en-ligne-b2b",
    "/blog/options-variantes-alternatives-devis-b2b",
    "/blog/versions-historique-devis-b2b",
    "/blog/relancer-devis-hot-depuis-dossier",
    "/blog/revue-pipeline-devis-b2b",
    "/blog/assignation-sla-demande-devis-equipe",
    "/outils/calculateur-acompte-devis",
    "/outils/simulateur-cout-devis-expires",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "validite-expiration-devis-b2b.md": [
    "/blog/versions-historique-devis-b2b",
    "/blog/signature-acceptation-devis-en-ligne-b2b",
    "/blog/relancer-devis-hot-depuis-dossier",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/options-variantes-alternatives-devis-b2b",
    "/blog/revue-pipeline-devis-b2b",
    "/blog/score-demande-devis-b2b",
    "/blog/assignation-sla-demande-devis-equipe",
    "/outils/simulateur-cout-devis-expires",
    "/outils/simulateur-taux-acceptation-devis",
    "/outils/cout-devis-non-relance",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-cloture-portail.md": [
    "/blog/validite-expiration-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/blog/centraliser-demandes-devis-multi-canaux",
    "/blog/configurateur-devis-vs-excel-pdf",
    "/blog/options-variantes-alternatives-devis-b2b",
    "/blog/score-demande-devis-b2b",
    "/blog/delai-reponse-demande-devis-b2b",
    "/blog/assignation-sla-demande-devis-equipe",
    "/secteurs/funnel-devis-stores-fermetures",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/outils/simulateur-cout-devis-expires",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "options-variantes-alternatives-devis-b2b.md": [
    "/images/blog/visite-guidee-parcours-devis-b2b/03-devis.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/09-public-funnel.png",
    "/images/blog/relancer-devis-hot-depuis-dossier/05-automations.png",
    "/images/blog/visite-guidee-parcours-devis-b2b/07-funnels.png",
    "/blog/versions-historique-devis-b2b",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/score-demande-devis-b2b",
    "/blog/signature-acceptation-devis-en-ligne-b2b",
    "/blog/revue-pipeline-devis-b2b",
    "/blog/configurateur-devis-vs-excel-pdf",
    "/outils/simulateur-impact-remise-devis",
    "/outils/score-brief-devis",
    "/outils/estimateur-temps-chiffrage-devis",
    "/outils/estimateur-cout-brief-incomplet",
    "/outils/simulateur-taux-acceptation-devis",
    "/secteurs/funnel-devis-cuisine-equipee",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "signature-acceptation-devis-en-ligne-b2b.md": [
    "/blog/versions-historique-devis-b2b",
    "/fonctionnalites/espace-prospect",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/relancer-devis-hot-depuis-dossier",
    "/blog/centraliser-demandes-devis-multi-canaux",
    "/blog/revue-pipeline-devis-b2b",
    "/outils/simulateur-impact-remise-devis",
    "/outils/simulateur-taux-acceptation-devis",
    "/outils/simulateur-roi-logiciel-devis",
    "/outils/cout-devis-non-relance",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/secteurs/funnel-devis-cuisine-equipee",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-cuisine-equipee.md": [
    "/blog/versions-historique-devis-b2b",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/score-demande-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/signature-acceptation-devis-en-ligne-b2b",
    "/blog/revue-pipeline-devis-b2b",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/secteurs/funnel-devis-agencement-bureau",
    "/outils/simulateur-impact-remise-devis",
    "/outils/simulateur-taux-acceptation-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "versions-historique-devis-b2b.md": [
    "figure:versions-flow",
    "figure:versions-timeline",
    "figure:versions-checklist",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/relancer-devis-hot-depuis-dossier",
    "/blog/score-demande-devis-b2b",
    "/blog/assignation-sla-demande-devis-equipe",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/outils/estimateur-temps-chiffrage-devis",
    "/outils/calculateur-capacite-equipe-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "assignation-sla-demande-devis-equipe.md": [
    "figure:assign-flow",
    "figure:assign-playbook",
    "figure:assign-dashboard",
    "/blog/score-demande-devis-b2b",
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/delai-reponse-demande-devis-b2b",
    "/blog/relancer-devis-hot-depuis-dossier",
    "/outils/calculateur-capacite-equipe-devis",
    "/outils/simulateur-taux-conversion-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "qualifier-demande-devis-avant-chiffrage.md": [
    "figure:qualify-before",
    "figure:qualify-axes",
    "figure:funnel-vs-form",
    "figure:qualify-stack",
    "figure:qualify-day",
    "/blog/score-demande-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/blog/formulaire-contact-vs-funnel-devis-b2b",
    "/blog/delai-reponse-demande-devis-b2b",
    "/outils/score-brief-devis",
    "/outils/simulateur-taux-conversion-devis",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "funnel-devis-agencement-bureau.md": [
    "/blog/qualifier-demande-devis-avant-chiffrage",
    "/blog/score-demande-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/secteurs/funnel-devis-menuiserie-sur-mesure",
    "/secteurs/funnel-devis-rayonnage-stockage",
    "/outils/score-brief-devis",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
  "creer-devis-avec-claude-mcp.md": [
    "/images/blog/creer-devis-avec-claude-mcp/02-accueil.png",
    "/images/blog/creer-devis-avec-claude-mcp/03-devis.png",
    "/images/blog/creer-devis-avec-claude-mcp/04-devis-detail.png",
    "/images/blog/creer-devis-avec-claude-mcp/05-automations.png",
    "/images/blog/creer-devis-avec-claude-mcp/08-integrations.png",
    "/signup?plan=free",
    "MCP_DEVIS_V0",
    "create_quote",
  ],
  "funnel-devis-location-evenementiel.md": [
    "/images/secteurs/funnel-devis-location-evenementiel/09-public-funnel.png",
    "/images/secteurs/funnel-devis-location-evenementiel/03-devis.png",
    "/images/secteurs/funnel-devis-location-evenementiel/07-funnels.png",
    "/blog/delai-reponse-demande-devis-b2b",
    "/blog/score-demande-devis-b2b",
    "/blog/pourquoi-les-devis-meurent-sans-relance",
    "/c/demo/rayonnage",
    "/signup?plan=free",
  ],
} as const;

const contentFiles = [
  ...blogFiles.map((file) => ({ file, dir: blogDir })),
  ...readdirSync(secteursDir)
    .filter((name) => name.endsWith(".md"))
    .map((file) => ({ file, dir: secteursDir })),
];

for (const { file, dir } of contentFiles) {
  const body = readFileSync(join(dir, file), "utf8");
  assert.doesNotMatch(body, EM_DASH, `${file} still contains an em dash`);
  const words = body.split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 1800, `${file} is too short for SEO (${words} words)`);
  const extras = requiredSources[file as keyof typeof requiredSources];
  if (extras) {
    for (const needle of extras) {
      assert.match(body, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${file} missing ${needle}`);
    }
  }
}

{
  const walkthroughRaw = readFileSync(join(blogDir, "visite-guidee-parcours-devis-b2b.md"), "utf8");
  assert.ok(walkthroughRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const walkthroughBody = stripFrontmatter(walkthroughRaw);
  assert.ok(
    walkthroughBody.startsWith("# De la demande au dossier devis"),
    "frontmatter must be stripped before render",
  );
  assert.match(walkthroughBody, /signup\?plan=free/);
}

{
  const relanceRaw = readFileSync(join(blogDir, "relancer-devis-hot-depuis-dossier.md"), "utf8");
  assert.ok(relanceRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const relanceBody = stripFrontmatter(relanceRaw);
  assert.ok(
    relanceBody.startsWith("# Relancer un devis Hot depuis le dossier"),
    "frontmatter must be stripped before render",
  );
  assert.match(relanceBody, /signup\?plan=free/);
}

{
  const delaiRaw = readFileSync(join(blogDir, "delai-reponse-demande-devis-b2b.md"), "utf8");
  assert.ok(delaiRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const delaiBody = stripFrontmatter(delaiRaw);
  assert.ok(
    delaiBody.startsWith("# Délai de réponse à une demande de devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.match(delaiBody, /signup\?plan=free/);
}

{
  const templateRaw = readFileSync(join(blogDir, "template-boutique-en-ligne-menuiserie-devis.md"), "utf8");
  assert.ok(templateRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const templateBody = stripFrontmatter(templateRaw);
  assert.ok(
    templateBody.startsWith("# Template boutique en ligne menuiserie devis"),
    "frontmatter must be stripped before render",
  );
  assert.match(templateBody, /signup\?plan=free/);
}

{
  const unifyRaw = readFileSync(join(blogDir, "devis-en-ligne-integre-boutique.md"), "utf8");
  assert.ok(unifyRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const unifyBody = stripFrontmatter(unifyRaw);
  assert.ok(
    unifyBody.startsWith("# Devis en ligne intégré boutique"),
    "frontmatter must be stripped before render",
  );
  assert.match(unifyBody, /signup\?plan=free/);
}

{
  const mcpRaw = readFileSync(join(blogDir, "creer-devis-avec-claude-mcp.md"), "utf8");
  assert.ok(mcpRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const mcpBody = stripFrontmatter(mcpRaw);
  assert.ok(
    mcpBody.startsWith("# Créer un devis avec Claude"),
    "frontmatter must be stripped before render",
  );
  assert.match(mcpBody, /signup\?plan=free/);
}

{
  const eventRaw = readFileSync(join(blogDir, "funnel-devis-location-evenementiel.md"), "utf8");
  assert.ok(eventRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const eventBody = stripFrontmatter(eventRaw);
  assert.ok(
    eventBody.startsWith("# Funnel de devis location événementielle"),
    "frontmatter must be stripped before render",
  );
  assert.match(eventBody, /signup\?plan=free/);
}

{
  const revueRaw = readFileSync(join(blogDir, "revue-pipeline-devis-b2b.md"), "utf8");
  assert.ok(revueRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const revueBody = stripFrontmatter(revueRaw);
  assert.ok(
    revueBody.startsWith("# Revue de pipeline devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.match(revueBody, /signup\?plan=free/);
  assert.doesNotMatch(revueBody, /img-1\.png/);
  assert.doesNotMatch(revueBody, /img-2\.png/);
}

{
  const centralRaw = readFileSync(join(blogDir, "centraliser-demandes-devis-multi-canaux.md"), "utf8");
  assert.ok(centralRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const centralBody = stripFrontmatter(centralRaw);
  assert.ok(
    centralBody.startsWith("# Centraliser les demandes de devis multi-canaux"),
    "frontmatter must be stripped before render",
  );
  assert.match(centralBody, /signup\?plan=free/);
}

{
  const storesRaw = readFileSync(join(blogDir, "funnel-devis-stores-fermetures.md"), "utf8");
  assert.ok(storesRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const storesBody = stripFrontmatter(storesRaw);
  assert.ok(
    storesBody.startsWith("# Funnel de devis stores et fermetures"),
    "frontmatter must be stripped before render",
  );
  assert.match(storesBody, /signup\?plan=free/);
  const storesPage = readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-stores-fermetures/page.tsx"),
    "utf8",
  );
  assert.match(storesPage, /Essayer le template Menuisier/);
  assert.match(storesPage, /Ouverture « Fenêtre, porte, store »/);
  assert.doesNotMatch(storesPage, /pas de template/i);
  const pergolaPage = readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-pergola-terrasse/page.tsx"),
    "utf8",
  );
  assert.doesNotMatch(pergolaPage, /Kits structure/);
  assert.match(pergolaPage, /produits liés de pose/);
  assert.match(pergolaPage, /Essayer le template Paysagiste/);
}

{
  const mentionsRaw = readFileSync(join(blogDir, "mentions-obligatoires-devis-france.md"), "utf8");
  assert.ok(mentionsRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const mentionsBody = stripFrontmatter(mentionsRaw);
  assert.ok(
    mentionsBody.startsWith("# Mentions obligatoires sur un devis en France (B2B)"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(mentionsBody, /^title:/m);
  assert.match(mentionsBody, /signup\?plan=free/);
  assert.match(mentionsBody, /\/outils\/checklist-mentions-devis-france/);
  assert.match(mentionsBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(mentionsBody, EM_DASH);
  assert.equal(mentionsBody.split(/\s+/).filter(Boolean).length, 2715);
}

{
  const lienRaw = readFileSync(join(blogDir, "envoyer-devis-lien-securise-vs-pdf-email.md"), "utf8");
  assert.ok(lienRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const lienBody = stripFrontmatter(lienRaw);
  assert.ok(
    lienBody.startsWith("# Envoyer un devis par lien sécurisé vs PDF en pièce jointe"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(lienBody, /^title:/m);
  assert.match(lienBody, /signup\?plan=free/);
  assert.match(lienBody, /\/outils\/estimateur-cout-devis-pdf-seuls/);
  assert.match(lienBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(lienBody, EM_DASH);
  assert.equal(lienBody.split(/\s+/).filter(Boolean).length, 2531);
}

{
  const pacRaw = readFileSync(join(blogDir, "funnel-devis-pompe-chaleur-chauffage.md"), "utf8");
  assert.ok(pacRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const pacBody = stripFrontmatter(pacRaw);
  assert.ok(
    pacBody.startsWith("# Funnel de devis pompe à chaleur et chauffage"),
    "frontmatter must be stripped before render",
  );
  assert.match(pacBody, /signup\?plan=free/);
  assert.doesNotMatch(pacBody, EM_DASH);
  assert.equal(pacBody.split(/\s+/).filter(Boolean).length, 2203);
}

{
  const pjRaw = readFileSync(join(blogDir, "pieces-jointes-plans-photos-devis-b2b.md"), "utf8");
  assert.ok(pjRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const pjBody = stripFrontmatter(pjRaw);
  assert.ok(
    pjBody.startsWith("# Pièces jointes, plans et photos dans un devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(pjBody, /^title:/m);
  assert.match(pjBody, /signup\?plan=free/);
  assert.match(pjBody, /\/outils\/estimateur-cout-aller-retours-brief-photos/);
  assert.match(pjBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(pjBody, EM_DASH);
  assert.equal(pjBody.split(/\s+/).filter(Boolean).length, 2433);
}

{
  const tvaRaw = readFileSync(join(blogDir, "tva-ht-ttc-devis-b2b-france.md"), "utf8");
  assert.ok(tvaRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const tvaBody = stripFrontmatter(tvaRaw);
  assert.ok(
    tvaBody.startsWith("# HT, TTC et TVA sur un devis B2B en France : afficher clair sans se tromper"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(tvaBody, /^title:/m);
  assert.match(tvaBody, /signup\?plan=free/);
  assert.match(tvaBody, /\/outils\/calculateur-tva-devis-ht-ttc/);
  assert.match(tvaBody, /\/c\/demo\/rayonnage/);
  assert.match(tvaBody, /Bonne pratique générale, hors QuoteBuilder/);
  assert.match(tvaBody, /Fourchette indicative/);
  assert.match(tvaBody, /Total indicatif/);
  assert.doesNotMatch(tvaBody, /ne prétend pas calculer la TVA/);
  assert.doesNotMatch(tvaBody, /blocs TVA/);
  assert.doesNotMatch(tvaBody, EM_DASH);
  assert.equal(tvaBody.split(/\s+/).filter(Boolean).length, 3314);
}

{
  const notesRaw = readFileSync(join(blogDir, "notes-internes-dossier-devis-equipe-b2b.md"), "utf8");
  assert.ok(notesRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const notesBody = stripFrontmatter(notesRaw);
  assert.ok(
    notesBody.startsWith("# Notes internes sur un dossier devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(notesBody, /^title:/m);
  assert.match(notesBody, /signup\?plan=free/);
  assert.match(notesBody, /\/outils\/estimateur-cout-contexte-hors-dossier-devis/);
  assert.match(notesBody, /\/fonctionnalites\/espace-prospect/);
  assert.match(notesBody, /\/c\/demo\/rayonnage/);
  assert.match(notesBody, /chat interne inventé|pas un chat interne/i);
  assert.match(notesBody, /commentaires ancrés/);
  assert.match(notesBody, /formule fixe/);
  assert.match(notesBody, /Commencée/);
  assert.match(notesBody, /En attente/);
  assert.match(notesBody, /Accepté/);
  assert.match(notesBody, /pas de versions Vn|Pas de versions Vn/i);
  assert.match(notesBody, /dernière consultation relative|dernière vue relative/i);
  assert.doesNotMatch(notesBody, /signature électronique/);
  assert.doesNotMatch(notesBody, EM_DASH);
  assert.equal(notesBody.split(/\s+/).filter(Boolean).length, 2693);
}

{
  const handoffRaw = readFileSync(join(blogDir, "transfert-brief-commercial-technique-devis-b2b.md"), "utf8");
  assert.ok(handoffRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const handoffBody = stripFrontmatter(handoffRaw);
  assert.ok(
    handoffBody.startsWith("# Transfert brief commercial → technique"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(handoffBody, /^title:/m);
  assert.match(handoffBody, /signup\?plan=free/);
  assert.match(handoffBody, /\/outils\/estimateur-cout-handoff-commercial-technique-devis/);
  assert.match(handoffBody, /\/secteurs\/funnel-devis-metallerie-serrurerie/);
  assert.match(handoffBody, /\/c\/demo\/rayonnage/);
  assert.match(handoffBody, /module de chat interne/);
  assert.match(handoffBody, /formule fixe/);
  assert.match(handoffBody, /Gagné/);
  assert.match(handoffBody, /fil plat|chat \*\*plat\*\*/);
  assert.match(handoffBody, /Pas de versions Vn|pas de versions Vn/i);
  assert.match(handoffBody, /pixel e-mail/);
  assert.doesNotMatch(handoffBody, /signature électronique/);
  assert.doesNotMatch(handoffBody, EM_DASH);
  assert.equal(handoffBody.split(/\s+/).filter(Boolean).length, 3156);
}

{
  const metalRaw = readFileSync(join(blogDir, "funnel-devis-metallerie-serrurerie.md"), "utf8");
  assert.ok(metalRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const metalBody = stripFrontmatter(metalRaw);
  assert.ok(
    metalBody.startsWith("# Funnel de devis métallerie et serrurerie"),
    "frontmatter must be stripped before render",
  );
  assert.match(metalBody, /signup\?plan=free/);
  assert.match(metalBody, /\/blog\/transfert-brief-commercial-technique-devis-b2b/);
  assert.match(metalBody, /\/outils\/estimateur-cout-handoff-commercial-technique-devis/);
  assert.match(metalBody, /ordre fixe/);
  assert.match(metalBody, /il n'existe pas de template secteur/);
  assert.match(metalBody, /Escalier \/ garde-corps/);
  assert.doesNotMatch(metalBody, /\/c\/demo\/rayonnage/);
  assert.match(metalBody, /menuiserie/);
  assert.match(metalBody, /Gagné/);
  assert.doesNotMatch(metalBody, /signature électronique/);
  assert.doesNotMatch(metalBody, EM_DASH);
  assert.equal(metalBody.split(/\s+/).filter(Boolean).length, 2995);
}

{
  const sourcesRaw = readFileSync(join(blogDir, "sources-demande-devis-b2b-funnel-api.md"), "utf8");
  assert.ok(sourcesRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const sourcesBody = stripFrontmatter(sourcesRaw);
  assert.ok(
    sourcesBody.startsWith("# Sources d'une demande de devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(sourcesBody, /^title:/m);
  assert.match(sourcesBody, /signup\?plan=free/);
  assert.match(sourcesBody, /\/outils\/estimateur-cout-double-saisie-devis/);
  assert.match(sourcesBody, /\/api\/leads/);
  assert.match(sourcesBody, /\/c\/demo\/rayonnage/);
  assert.match(sourcesBody, /d'écran de saisie manuelle/);
  assert.match(sourcesBody, /d'écran d'import de devis/);
  assert.match(sourcesBody, /ne joint pas/);
  assert.match(sourcesBody, /formule fixe/);
  assert.match(sourcesBody, /Commencée/);
  assert.match(sourcesBody, /En attente/);
  assert.match(sourcesBody, /Accepté \/ Signé ne sont pas des statuts/);
  assert.match(sourcesBody, /sans branchement conditionnel/);
  assert.match(sourcesBody, /pas de date de validité/);
  assert.match(sourcesBody, /pas de kits/);
  assert.doesNotMatch(sourcesBody, /signature électronique/);
  assert.doesNotMatch(sourcesBody, EM_DASH);
  assert.equal(sourcesBody.split(/\s+/).filter(Boolean).length, 2950);
}

{
  const oralRaw = readFileSync(join(blogDir, "telephone-whatsapp-vers-brief-devis-b2b.md"), "utf8");
  assert.ok(oralRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const oralBody = stripFrontmatter(oralRaw);
  assert.ok(
    oralBody.startsWith("# Téléphone et WhatsApp vers brief devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(oralBody, /^title:/m);
  assert.match(oralBody, /signup\?plan=free/);
  assert.match(oralBody, /\/outils\/estimateur-cout-demandes-orales-non-capturees/);
  assert.match(oralBody, /\/secteurs\/funnel-devis-electricite-tertiaire/);
  assert.match(oralBody, /\/c\/demo\/rayonnage/);
  assert.match(oralBody, /il n'y en a pas|ce n'est pas un client WhatsApp/i);
  assert.match(oralBody, /formule fixe/);
  assert.match(oralBody, /Gagné/);
  assert.match(oralBody, /dernière consultation/);
  assert.doesNotMatch(oralBody, /signature électronique/);
  assert.doesNotMatch(oralBody, EM_DASH);
  assert.equal(oralBody.split(/\s+/).filter(Boolean).length, 2775);
}

{
  const elecRaw = readFileSync(join(blogDir, "funnel-devis-electricite-tertiaire.md"), "utf8");
  assert.ok(elecRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const elecBody = stripFrontmatter(elecRaw);
  assert.ok(
    elecBody.startsWith("# Funnel de devis électricité tertiaire"),
    "frontmatter must be stripped before render",
  );
  assert.match(elecBody, /signup\?plan=free/);
  assert.match(elecBody, /\/blog\/telephone-whatsapp-vers-brief-devis-b2b/);
  assert.match(elecBody, /\/outils\/estimateur-cout-demandes-orales-non-capturees/);
  assert.match(elecBody, /ordre fixe|étapes produit restent en ordre fixe|ordre fixe/);
  assert.match(elecBody, /NF C 15-100/);
  assert.match(elecBody, /pas comme feature|pas un module QuoteBuilder/i);
  assert.match(elecBody, /il n'existe pas de template secteur électricité/);
  assert.doesNotMatch(elecBody, /signature électronique/);
  assert.doesNotMatch(elecBody, EM_DASH);
  assert.equal(elecBody.split(/\s+/).filter(Boolean).length, 2744);
}

{
  const statutsRaw = readFileSync(join(blogDir, "statuts-pipeline-devis-b2b.md"), "utf8");
  assert.ok(statutsRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const statutsBody = stripFrontmatter(statutsRaw);
  assert.ok(
    statutsBody.startsWith("# Les 7 statuts d'un pipeline devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(statutsBody, /^title:/m);
  assert.match(statutsBody, /signup\?plan=free/);
  assert.match(statutsBody, /\/outils\/estimateur-cout-pipeline-fantome-devis/);
  assert.match(statutsBody, /\/blog\/revue-pipeline-devis-b2b/);
  assert.match(statutsBody, /\/c\/demo\/rayonnage/);
  assert.match(statutsBody, /Commencée/);
  assert.match(statutsBody, /En attente/);
  assert.match(statutsBody, /libellé d'espace prospect/);
  assert.match(statutsBody, /libellé de graphique de stats/);
  assert.match(statutsBody, /pas d'acceptation \/ signature en ligne du prospect/);
  assert.match(statutsBody, /formule fixe/);
  assert.match(statutsBody, /Pas de SLA produit/);
  assert.match(statutsBody, /dernière consultation/);
  assert.match(statutsBody, /Valider le dossier/);
  assert.doesNotMatch(statutsBody, EM_DASH);
  assert.equal(statutsBody.split(/\s+/).filter(Boolean).length, 2740);
}

{
  const visiteRaw = readFileSync(join(blogDir, "visite-technique-avant-devis-b2b.md"), "utf8");
  assert.ok(visiteRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const visiteBody = stripFrontmatter(visiteRaw);
  assert.ok(
    visiteBody.startsWith("# Visite technique avant devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(visiteBody, /^title:/m);
  assert.match(visiteBody, /signup\?plan=free/);
  assert.match(visiteBody, /\/outils\/estimateur-cout-visites-techniques-inutiles/);
  assert.match(visiteBody, /\/secteurs\/funnel-devis-plomberie-sanitaire/);
  assert.match(visiteBody, /\/c\/demo\/rayonnage/);
  assert.match(visiteBody, /première ouverture/);
  assert.match(visiteBody, /pixel e-mail/);
  assert.match(visiteBody, /planification terrain reste hors produit|il n'y en a pas/);
  assert.match(visiteBody, /champ « Espace prospect »/);
  assert.match(visiteBody, /page prospect ne la montre pas/);
  assert.match(visiteBody, /En attente/);
  assert.match(visiteBody, /Consulté/);
  assert.match(visiteBody, /Validé/);
  assert.match(visiteBody, /Modifications/);
  assert.doesNotMatch(visiteBody, /badges vu/);
  assert.doesNotMatch(visiteBody, EM_DASH);
  assert.equal(visiteBody.split(/\s+/).filter(Boolean).length, 2811);
}

{
  const plombRaw = readFileSync(join(blogDir, "funnel-devis-plomberie-sanitaire.md"), "utf8");
  assert.ok(plombRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const plombBody = stripFrontmatter(plombRaw);
  assert.ok(
    plombBody.startsWith("# Funnel de devis plomberie et sanitaire"),
    "frontmatter must be stripped before render",
  );
  assert.match(plombBody, /signup\?plan=free/);
  assert.match(plombBody, /\/blog\/visite-technique-avant-devis-b2b/);
  assert.match(plombBody, /\/outils\/estimateur-cout-visites-techniques-inutiles/);
  assert.match(plombBody, /ne planifie pas la tournée/);
  assert.match(plombBody, /ordre fixe/);
  assert.match(plombBody, /Si\/Alors servent à suggérer/);
  assert.doesNotMatch(plombBody, /branche/i);
  assert.doesNotMatch(plombBody, /kits/i);
  assert.doesNotMatch(plombBody, /template plomberie/i);
  assert.doesNotMatch(plombBody, /signature électronique/);
  assert.doesNotMatch(plombBody, EM_DASH);
  assert.equal(plombBody.split(/\s+/).filter(Boolean).length, 2826);
}

{
  const approRaw = readFileSync(join(blogDir, "approbation-client-multi-decideurs-devis-b2b.md"), "utf8");
  assert.ok(approRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const approBody = stripFrontmatter(approRaw);
  assert.ok(
    approBody.startsWith("# Approbation client multi-décideurs sur un devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(approBody, /^title:/m);
  assert.match(approBody, /signup\?plan=free/);
  assert.match(approBody, /\/outils\/estimateur-cout-attente-multi-decideurs-devis/);
  assert.match(approBody, /\/secteurs\/funnel-devis-couverture-toiture/);
  assert.match(approBody, /\/c\/demo\/rayonnage/);
  assert.match(approBody, /Pas de première ouverture/);
  assert.match(approBody, /pas de pixel e-mail/);
  assert.doesNotMatch(approBody, EM_DASH);
  assert.equal(approBody.split(/\s+/).filter(Boolean).length, 3998);
}

{
  const couvRaw = readFileSync(join(blogDir, "funnel-devis-couverture-toiture.md"), "utf8");
  assert.ok(couvRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const couvBody = stripFrontmatter(couvRaw);
  assert.ok(
    couvBody.startsWith("# Funnel de devis couverture et toiture"),
    "frontmatter must be stripped before render",
  );
  assert.match(couvBody, /signup\?plan=free/);
  assert.match(couvBody, /\/blog\/approbation-client-multi-decideurs-devis-b2b/);
  assert.match(couvBody, /\/outils\/estimateur-cout-devis-sans-validation/);
  assert.doesNotMatch(couvBody, EM_DASH);
  assert.equal(couvBody.split(/\s+/).filter(Boolean).length, 3082);
}

{
  const suiviRaw = readFileSync(join(blogDir, "suivi-ouverture-lecture-devis-en-ligne-b2b.md"), "utf8");
  assert.ok(suiviRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const suiviBody = stripFrontmatter(suiviRaw);
  assert.ok(
    suiviBody.startsWith("# Devis en ligne B2B : dernière consultation, relecteurs et relances utiles"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(suiviBody, /^title:/m);
  assert.match(suiviBody, /signup\?plan=free/);
  assert.match(suiviBody, /\/outils\/estimateur-cout-relances-aveugles-devis/);
  assert.match(suiviBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(suiviBody, EM_DASH);
  assert.equal(suiviBody.split(/\s+/).filter(Boolean).length, 3851);
}

{
  const validationRaw = readFileSync(join(blogDir, "validation-interne-avant-envoi-devis-b2b.md"), "utf8");
  assert.ok(validationRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const validationBody = stripFrontmatter(validationRaw);
  assert.ok(
    validationBody.startsWith("# Validation interne avant envoi d’un devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(validationBody, /^title:/m);
  assert.match(validationBody, /signup\?plan=free/);
  assert.match(validationBody, /\/outils\/estimateur-cout-devis-sans-validation/);
  assert.match(validationBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(validationBody, EM_DASH);
  assert.equal(validationBody.split(/\s+/).filter(Boolean).length, 2754);
  assert.match(validationBody, /checklist en neuf points/);
  assert.doesNotMatch(validationBody, /checklist 10 points/);
}

{
  const iteRaw = readFileSync(join(blogDir, "funnel-devis-isolation-thermique-ite.md"), "utf8");
  assert.ok(iteRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const iteBody = stripFrontmatter(iteRaw);
  assert.ok(
    iteBody.startsWith("# Funnel de devis isolation thermique et ITE"),
    "frontmatter must be stripped before render",
  );
  assert.match(iteBody, /signup\?plan=free/);
  assert.match(iteBody, /\/outils\/estimateur-cout-devis-sans-validation/);
  assert.match(iteBody, /\/blog\/validation-interne-avant-envoi-devis-b2b/);
  assert.doesNotMatch(iteBody, EM_DASH);
  assert.equal(iteBody.split(/\s+/).filter(Boolean).length, 2718);
}

{
  const clarifRaw = readFileSync(join(blogDir, "commentaires-annotations-devis-collaboratif-b2b.md"), "utf8");
  assert.ok(clarifRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const clarifBody = stripFrontmatter(clarifRaw);
  assert.ok(
    clarifBody.startsWith("# Commentaires et annotations sur un devis collaboratif B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(clarifBody, /^title:/m);
  assert.match(clarifBody, /signup\?plan=free/);
  assert.match(clarifBody, /\/outils\/estimateur-cout-emails-clarification-devis/);
  assert.match(clarifBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(clarifBody, EM_DASH);
  assert.equal(clarifBody.split(/\s+/).filter(Boolean).length, 2644);
}

{
  const pvRaw = readFileSync(join(secteursDir, "funnel-devis-photovoltaique-solaire.md"), "utf8");
  assert.ok(pvRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const pvBody = stripFrontmatter(pvRaw);
  assert.ok(
    pvBody.startsWith("# Funnel de devis photovoltaïque et solaire"),
    "frontmatter must be stripped before render",
  );
  assert.match(pvBody, /signup\?plan=free/);
  assert.match(pvBody, /\/outils\/estimateur-cout-aller-retours-brief-photos/);
  assert.doesNotMatch(pvBody, EM_DASH);
  assert.equal(pvBody.split(/\s+/).filter(Boolean).length, 2421);
}

{
  const wpRaw = readFileSync(join(blogDir, "recevoir-demandes-devis-wordpress-quotebuilder.md"), "utf8");
  assert.ok(wpRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const wpBody = stripFrontmatter(wpRaw);
  assert.ok(
    wpBody.startsWith("# Recevoir des demandes de devis WordPress dans QuoteBuilder"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(wpBody, /^title:/m);
  assert.match(wpBody, /signup\?plan=free/);
  assert.match(wpBody, /\/outils\/estimateur-leads-formulaire-vs-funnel-wp/);
  assert.match(wpBody, /\/c\/demo\/rayonnage/);
  assert.doesNotMatch(wpBody, EM_DASH);
  assert.ok(wpBody.split(/\s+/).filter(Boolean).length >= 1800, "wordpress demandes article body too short");
}

{
  const biblioRaw = readFileSync(join(blogDir, "bibliotheque-lignes-kits-devis-b2b.md"), "utf8");
  assert.ok(biblioRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const biblioBody = stripFrontmatter(biblioRaw);
  assert.ok(
    biblioBody.startsWith("# Bibliothèque de lignes et kits pour devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.match(biblioBody, /signup\?plan=free/);
  assert.doesNotMatch(biblioBody, EM_DASH);
  const biblioWords = biblioBody.split(/\s+/).filter(Boolean).length;
  assert.equal(biblioWords, 2516);
}

{
  const pergolaRaw = readFileSync(join(blogDir, "funnel-devis-pergola-terrasse.md"), "utf8");
  assert.ok(pergolaRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const pergolaBody = stripFrontmatter(pergolaRaw);
  assert.ok(
    pergolaBody.startsWith("# Funnel de devis pergola et terrasse sur mesure"),
    "frontmatter must be stripped before render",
  );
  assert.match(pergolaBody, /signup\?plan=free/);
  assert.doesNotMatch(pergolaBody, EM_DASH);
  const pergolaWords = pergolaBody.split(/\s+/).filter(Boolean).length;
  assert.equal(pergolaWords, 2333);
}

{
  const remiseRaw = readFileSync(join(blogDir, "remise-commerciale-marge-devis-b2b.md"), "utf8");
  assert.ok(remiseRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const remiseBody = stripFrontmatter(remiseRaw);
  assert.ok(
    remiseBody.startsWith("# Remise commerciale et marge sur devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.match(remiseBody, /signup\?plan=free/);
  assert.doesNotMatch(remiseBody, /img-1\.png/);
  assert.doesNotMatch(remiseBody, /img-2\.png/);
  assert.doesNotMatch(remiseBody, /img-3\.png/);
  for (const name of ["03-devis.png", "04-devis-detail.png", "05-automations.png", "06-produits.png", "07-funnels.png"]) {
    assert.ok(
      existsSync(join(process.cwd(), "public/images/blog/remise-commerciale-marge-devis-b2b", name)),
      `missing blog image ${name}`,
    );
  }
  assert.doesNotMatch(remiseBody, EM_DASH);
}

{
  const prefillRaw = readFileSync(join(blogDir, "preremplir-devis-url-parametres.md"), "utf8");
  assert.ok(prefillRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const prefillBody = stripFrontmatter(prefillRaw);
  assert.ok(
    prefillBody.startsWith("# Préremplir un devis via l’URL"),
    "frontmatter must be stripped before render",
  );
  assert.ok(prefillBody.split(/\s+/).filter(Boolean).length >= 1800, "prefill article body too short");
  assert.match(prefillBody, /signup\?plan=free/);
  assert.match(prefillBody, /\/c\/demo\/rayonnage/);
  assert.match(prefillBody, /\/c\/quickly\/rayonnage\?besoin=rayonnages/);
}

{
  const ficheRaw = readFileSync(join(blogDir, "fiche-produit-b2b-devis-unifie.md"), "utf8");
  assert.ok(ficheRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const ficheBody = stripFrontmatter(ficheRaw);
  assert.ok(
    ficheBody.startsWith("# Fiche produit B2B unifiée pour le devis"),
    "frontmatter must be stripped before render",
  );
  assert.ok(ficheBody.split(/\s+/).filter(Boolean).length >= 1800, "fiche article body too short");
  assert.match(ficheBody, /signup\?plan=free/);
  assert.match(ficheBody, /\/c\/demo\/rayonnage/);
}

{
  const acomptesRaw = readFileSync(join(blogDir, "acomptes-echeances-devis-b2b.md"), "utf8");
  assert.ok(acomptesRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const acomptesBody = stripFrontmatter(acomptesRaw);
  assert.ok(
    acomptesBody.startsWith("# Acomptes et échéances sur devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.match(acomptesBody, /signup\?plan=free/);
}

{
  const validiteRaw = readFileSync(join(blogDir, "validite-expiration-devis-b2b.md"), "utf8");
  assert.ok(validiteRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const validiteBody = stripFrontmatter(validiteRaw);
  assert.ok(
    validiteBody.startsWith("# Validité et expiration des devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.match(validiteBody, /signup\?plan=free/);
}

{
  const clotureRaw = readFileSync(join(blogDir, "funnel-devis-cloture-portail.md"), "utf8");
  assert.ok(clotureRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const clotureBody = stripFrontmatter(clotureRaw);
  assert.ok(
    clotureBody.startsWith("# Funnel de devis clôture et portail"),
    "frontmatter must be stripped before render",
  );
  assert.match(clotureBody, /signup\?plan=free/);
}

{
  const optionsRaw = readFileSync(join(blogDir, "options-variantes-alternatives-devis-b2b.md"), "utf8");
  assert.ok(optionsRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const optionsBody = stripFrontmatter(optionsRaw);
  assert.ok(
    optionsBody.startsWith("# Options, variantes et alternatives sur un devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.match(optionsBody, /signup\?plan=free/);
  assert.doesNotMatch(optionsBody, /img-1\.png/);
  assert.doesNotMatch(optionsBody, /img-2\.png/);
}

{
  const signatureRaw = readFileSync(join(blogDir, "signature-acceptation-devis-en-ligne-b2b.md"), "utf8");
  assert.ok(signatureRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const signatureBody = stripFrontmatter(signatureRaw);
  assert.ok(
    signatureBody.startsWith("# Signature et acceptation de devis en ligne B2B"),
    "frontmatter must be stripped before render",
  );
  assert.match(signatureBody, /signup\?plan=free/);
}

{
  const cuisineRaw = readFileSync(join(blogDir, "funnel-devis-cuisine-equipee.md"), "utf8");
  assert.ok(cuisineRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const cuisineBody = stripFrontmatter(cuisineRaw);
  assert.ok(
    cuisineBody.startsWith("# Funnel de devis cuisine équipée"),
    "frontmatter must be stripped before render",
  );
  assert.match(cuisineBody, /signup\?plan=free/);
}

{
  const versionsRaw = readFileSync(join(blogDir, "versions-historique-devis-b2b.md"), "utf8");
  assert.ok(versionsRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const versionsBody = stripFrontmatter(versionsRaw);
  assert.ok(
    versionsBody.startsWith("# Versions et historique des devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.match(versionsBody, /signup\?plan=free/);
}

{
  const assignRaw = readFileSync(join(blogDir, "assignation-sla-demande-devis-equipe.md"), "utf8");
  assert.ok(assignRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const assignBody = stripFrontmatter(assignRaw);
  assert.ok(
    assignBody.startsWith("# Assignation et SLA des demandes de devis en équipe"),
    "frontmatter must be stripped before render",
  );
  assert.match(assignBody, /signup\?plan=free/);
}

{
  const qualifyRaw = readFileSync(join(blogDir, "qualifier-demande-devis-avant-chiffrage.md"), "utf8");
  assert.ok(qualifyRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const qualifyBody = stripFrontmatter(qualifyRaw);
  assert.ok(
    qualifyBody.startsWith("# Qualifier une demande de devis avant de chiffrer"),
    "frontmatter must be stripped before render",
  );
  assert.match(qualifyBody, /signup\?plan=free/);
}

{
  const agencementRaw = readFileSync(join(blogDir, "funnel-devis-agencement-bureau.md"), "utf8");
  assert.ok(agencementRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const agencementBody = stripFrontmatter(agencementRaw);
  assert.ok(
    agencementBody.startsWith("# Funnel de devis agencement de bureau"),
    "frontmatter must be stripped before render",
  );
  assert.match(agencementBody, /signup\?plan=free/);
}

for (const post of BLOG_POSTS) {
  assert.doesNotMatch(post.title, EM_DASH, `${post.slug} title has an em dash`);
  assert.doesNotMatch(post.description, EM_DASH, `${post.slug} description has an em dash`);
  assert.ok(BLOG_FAQ[post.slug]?.length, `${post.slug} missing FAQ`);
  for (const item of BLOG_FAQ[post.slug] ?? []) {
    assert.doesNotMatch(item.q, EM_DASH, `${post.slug} FAQ question has an em dash`);
    assert.doesNotMatch(item.a, EM_DASH, `${post.slug} FAQ answer has an em dash`);
  }
}

const meta = pageMetadata({
  title: "Connexion",
  description: "Accès",
  path: "/login",
  index: false,
});
assert.equal(meta.alternates?.canonical, "https://www.quotebuilder.co/login");
assert.deepEqual(meta.robots, { index: false, follow: false });

const articleMeta = pageMetadata({
  title: "Scorer une demande",
  description: "Grille",
  path: "/blog/score-demande-devis-b2b",
  type: "article",
  publishedTime: "2026-09-11",
  image: blogOgImagePath(featuredScore),
});
assert.equal(articleMeta.alternates?.canonical, "https://www.quotebuilder.co/blog/score-demande-devis-b2b");
const ogImages = articleMeta.openGraph?.images;
assert.ok(Array.isArray(ogImages));
assert.match(JSON.stringify(ogImages), /api\/og\/blog\/score-demande-devis-b2b/);
assert.equal(articleMeta.openGraph?.title, "Scorer une demande · QuoteBuilder");

const lost = computeLostQuote({
  quotesPerMonth: 40,
  basket: 3500,
  currentRate: 12,
  targetRate: 22,
});
assert.equal(lost.monthlyCurrent, 40 * 3500 * 0.12);
assert.equal(lost.monthlyGap, 40 * 3500 * 0.1);
assert.equal(lost.annualGap, lost.monthlyGap * 12);

const conversion = computeConversionRate({
  quotesSent: 40,
  basket: 5500,
  currentRate: 18,
  targetRate: 25,
});
assert.equal(conversion.monthlyCurrent, 40 * 5500 * 0.18);
assert.equal(conversion.monthlyTarget, 40 * 5500 * 0.25);
assert.equal(conversion.monthlyGain, conversion.monthlyTarget - conversion.monthlyCurrent);
assert.equal(conversion.annualGain, conversion.monthlyGain * 12);
assert.equal(conversion.weighted, null);
assert.match(conversion.tip, /petit gain de conversion/);

const conversionMix = computeConversionRate({
  quotesSent: 40,
  basket: 5500,
  currentRate: 18,
  targetRate: 25,
  mix: {
    hot: { mix: 20, win: 45 },
    warm: { mix: 45, win: 20 },
    cold: { mix: 35, win: 6 },
  },
});
assert.equal(
  conversionMix.weighted,
  40 * 0.2 * 5500 * 0.45 + 40 * 0.45 * 5500 * 0.2 + 40 * 0.35 * 5500 * 0.06,
);
assert.equal(conversionMix.mixTotal, 100);
assert.equal(conversionMix.mixOk, true);
assert.match(conversionMix.tip, /Mix correct/);

const capacity = computeTeamCapacity({
  reps: 3,
  hoursPerWeek: 12,
  weeksPerMonth: 4.3,
  minHot: 45,
  minWarm: 25,
  minCold: 12,
  volHot: 20,
  volWarm: 45,
  volCold: 35,
});
assert.equal(capacity.capacityHours, 3 * 12 * 4.3);
assert.equal(capacity.chargeHours, (20 * 45 + 45 * 25 + 35 * 12) / 60);
assert.equal(capacity.deltaHours, capacity.capacityHours - capacity.chargeHours);
assert.ok(capacity.utilization < 55);
assert.match(capacity.tip, /Surplus de capacité/);

const capacityMix = applyTeamCapacityMix(100, 20, 45, 35);
assert.deepEqual(capacityMix, { volHot: 20, volWarm: 45, volCold: 35 });
assert.equal(applyTeamCapacityMix(100, 20, 45, 30), null);

const capacityOver = computeTeamCapacity({
  reps: 1,
  hoursPerWeek: 8,
  weeksPerMonth: 4,
  minHot: 60,
  minWarm: 40,
  minCold: 20,
  volHot: 30,
  volWarm: 40,
  volCold: 20,
});
assert.ok(capacityOver.deltaHours < -8);
assert.match(capacityOver.tip, /Surcharge nette/);

const capacityEmpty = computeTeamCapacity({
  reps: 0,
  hoursPerWeek: 12,
  weeksPerMonth: 4.3,
  minHot: 45,
  minWarm: 25,
  minCold: 12,
  volHot: 20,
  volWarm: 45,
  volCold: 35,
});
assert.match(capacityEmpty.tip, /nombre de commerciaux/);

const quotingDefault = computeQuotingTime({
  volTotal: 80,
  pctHot: 20,
  pctWarm: 45,
  pctCold: 35,
  volHot: 16,
  volWarm: 36,
  volCold: 28,
  useDirect: false,
  minHot: 50,
  minWarm: 30,
  minCold: 15,
  minQual: 8,
  minRev: 12,
  people: 2,
  hoursPerMonth: 40,
});
assert.deepEqual(quotingDefault.volumes, { hot: 16, warm: 36, cold: 28 });
assert.equal(quotingDefault.totalDemands, 80);
assert.equal(quotingDefault.chiffrageHours, (16 * 50 + 36 * 30 + 28 * 15) / 60);
assert.equal(quotingDefault.qualHours, (80 * 8) / 60);
assert.equal(quotingDefault.revHours, (80 * 12) / 60);
assert.equal(
  quotingDefault.chargeHours,
  quotingDefault.chiffrageHours + quotingDefault.qualHours + quotingDefault.revHours,
);
assert.equal(quotingDefault.capacityHours, 80);
assert.equal(quotingDefault.deltaHours, quotingDefault.capacityHours - quotingDefault.chargeHours);
assert.equal(quotingDefault.mixOk, true);
assert.match(quotingDefault.mixWarn, /Mix à 100/);

const quotingDirect = quotingTimeVolumes({
  volTotal: 80,
  pctHot: 20,
  pctWarm: 45,
  pctCold: 35,
  volHot: 10,
  volWarm: 10,
  volCold: 5,
  useDirect: true,
});
assert.deepEqual(quotingDirect, { hot: 10, warm: 10, cold: 5 });

const quotingOver = computeQuotingTime({
  volTotal: 200,
  pctHot: 40,
  pctWarm: 40,
  pctCold: 20,
  volHot: 0,
  volWarm: 0,
  volCold: 0,
  useDirect: false,
  minHot: 60,
  minWarm: 40,
  minCold: 20,
  minQual: 10,
  minRev: 20,
  people: 1,
  hoursPerMonth: 20,
});
assert.ok(quotingOver.deltaHours < -10);
assert.match(quotingOver.tip, /Surcharge nette/);

const quotingEmpty = computeQuotingTime({
  volTotal: 80,
  pctHot: 20,
  pctWarm: 45,
  pctCold: 35,
  volHot: 16,
  volWarm: 36,
  volCold: 28,
  useDirect: false,
  minHot: 50,
  minWarm: 30,
  minCold: 15,
  minQual: 8,
  minRev: 12,
  people: 0,
  hoursPerMonth: 40,
});
assert.match(quotingEmpty.tip, /nombre de personnes qui chiffrent/);

const discountDefault = computeDiscountImpact({
  ca: 8500,
  cout: 5200,
  remise: 8,
  volume: 40,
  txAvant: 28,
  txApres: 34,
});
assert.equal(discountDefault.margeAvantE, 3300);
assert.equal(discountDefault.caApres, 8500 * 0.92);
assert.equal(discountDefault.margeApresE, 8500 * 0.92 - 5200);
assert.equal(discountDefault.perteUnite, 3300 - (8500 * 0.92 - 5200));
assert.ok(discountDefault.acceptUseful);
assert.equal(discountDefault.wonSans, 40 * (28 / 34));
assert.equal(discountDefault.impactNet, 40 * discountDefault.margeApresE - discountDefault.wonSans! * 3300);
assert.match(discountDefault.tip, /Remise tenable/);

const discountEmpty = computeDiscountImpact({
  ca: 0,
  cout: 5200,
  remise: 8,
  volume: 40,
  txAvant: 28,
  txApres: 34,
});
assert.match(discountEmpty.tip, /CA devis HT/);

const discountCost = computeDiscountImpact({
  ca: 4000,
  cout: 5200,
  remise: 8,
  volume: 40,
  txAvant: 28,
  txApres: 34,
});
assert.match(discountCost.tip, /structure de coût/);

const discountLoss = computeDiscountImpact({
  ca: 8500,
  cout: 8000,
  remise: 12,
  volume: 10,
  txAvant: 20,
  txApres: 22,
});
assert.ok(discountLoss.margeApresE < 0);
assert.match(discountLoss.tip, /marge est négative/);

const roiDefault = computeRoiLogicielDevis({
  demandes: 40,
  tempsAvant: 45,
  coutHoraire: 35,
  tauxAvant: 28,
  panier: 3500,
  tempsApres: 15,
  tauxApres: null,
  abonnement: 79,
  marge: 30,
});
assert.equal(roiDefault.heuresAvant, 30);
assert.equal(roiDefault.heuresApres, 10);
assert.equal(roiDefault.coutAvant, 1050);
assert.equal(roiDefault.coutApres, 350);
assert.equal(roiDefault.gainTemps, 700);
assert.equal(roiDefault.tauxApres, 28);
assert.equal(roiDefault.gainMarge, 0);
assert.equal(roiDefault.roiNet, 621);
assert.ok(roiDefault.paybackDays !== null);
assert.ok(Math.abs((roiDefault.paybackDays ?? 0) - (79 / 700) * 30) < 1e-9);
assert.match(roiDefault.tip, /retour est rapide/);

const roiAccept = computeRoiLogicielDevis({
  demandes: 40,
  tempsAvant: 45,
  coutHoraire: 35,
  tauxAvant: 28,
  panier: 3500,
  tempsApres: 15,
  tauxApres: 32,
  abonnement: 79,
  marge: 30,
});
assert.equal(roiAccept.deltaDeals, 1.6);
assert.equal(roiAccept.gainMarge, 1680);
assert.equal(roiAccept.roiNet, 2301);
assert.match(roiAccept.tip, /retour est rapide/);

const roiEmpty = computeRoiLogicielDevis({
  demandes: 0,
  tempsAvant: 45,
  coutHoraire: 35,
  tauxAvant: 28,
  panier: 3500,
  tempsApres: 15,
  tauxApres: null,
  abonnement: 79,
  marge: 30,
});
assert.match(roiEmpty.tip, /volume de demandes/);

const roiNeg = computeRoiLogicielDevis({
  demandes: 40,
  tempsAvant: 45,
  coutHoraire: 35,
  tauxAvant: 28,
  panier: 3500,
  tempsApres: 45,
  tauxApres: null,
  abonnement: 79,
  marge: 30,
});
assert.equal(roiNeg.gainTemps, 0);
assert.equal(roiNeg.roiNet, -79);
assert.match(roiNeg.tip, /scénario reste négatif/);

const roiLimited = computeRoiLogicielDevis({
  demandes: 10,
  tempsAvant: 20,
  coutHoraire: 30,
  tauxAvant: 20,
  panier: 1000,
  tempsApres: 10,
  tauxApres: null,
  abonnement: 79,
  marge: 30,
});
assert.equal(roiLimited.gainTemps, 50);
assert.equal(roiLimited.roiNet, -29);
assert.match(roiLimited.tip, /scénario reste négatif/);

const roiThin = computeRoiLogicielDevis({
  demandes: 12,
  tempsAvant: 30,
  coutHoraire: 30,
  tauxAvant: 20,
  panier: 1000,
  tempsApres: 10,
  tauxApres: null,
  abonnement: 79,
  marge: 30,
});
assert.equal(roiThin.gainTemps, 120);
assert.equal(roiThin.roiNet, 41);
assert.match(roiThin.tip, /gain existe mais reste limité/);

const acceptDefault = computeAcceptanceRate({
  envoyes: 35,
  tauxActuel: 28,
  panier: 4200,
  delai: 18,
  tauxCible: 36,
  marge: 30,
});
assert.ok(Math.abs(acceptDefault.acceptesActuel - 9.8) < 1e-9);
assert.ok(Math.abs(acceptDefault.acceptesCible - 12.6) < 1e-9);
assert.ok(Math.abs(acceptDefault.delta - 2.8) < 1e-9);
assert.ok(Math.abs(acceptDefault.caGagne - 11760) < 1e-6);
assert.ok(Math.abs(acceptDefault.margeGagnee - 3528) < 1e-6);
assert.ok(Math.abs(acceptDefault.nonAcceptes - 25.2) < 1e-9);
assert.ok(Math.abs(acceptDefault.pipeline - 105840) < 1e-6);
assert.ok(Math.abs(acceptDefault.coutAttente - 63504) < 1e-6);
assert.match(acceptDefault.tip, /scénario cible libère du CA/);

const acceptEmpty = computeAcceptanceRate({
  envoyes: 0,
  tauxActuel: 28,
  panier: 4200,
  delai: 18,
  tauxCible: 36,
  marge: 30,
});
assert.equal(acceptEmpty.caGagne, 0);
assert.match(acceptEmpty.tip, /volume de devis envoyés/);

const acceptDown = computeAcceptanceRate({
  envoyes: 35,
  tauxActuel: 36,
  panier: 4200,
  delai: 18,
  tauxCible: 28,
  marge: 30,
});
assert.ok(acceptDown.delta < 0);
assert.match(acceptDown.tip, /cible est inférieure/);

const acceptSmall = computeAcceptanceRate({
  envoyes: 5,
  tauxActuel: 28,
  panier: 4200,
  delai: 18,
  tauxCible: 36,
  marge: 30,
});
assert.ok(acceptSmall.delta < 1);
assert.match(acceptSmall.tip, /gain en nombre de devis reste faible/);

const acceptWait = computeAcceptanceRate({
  envoyes: 35,
  tauxActuel: 28,
  panier: 4200,
  delai: 21,
  tauxCible: 36,
  marge: 30,
});
assert.ok(acceptWait.coutAttente > 0);
assert.match(acceptWait.tip, /délai moyen est long/);

const briefCostDefault = computeCoutBriefIncomplet({
  demandes: 40,
  pctIncomplets: 45,
  minutes: 35,
  coutHoraire: 45,
  pctMorts: 12,
  panier: 3800,
});
assert.equal(briefCostDefault.briefs, 18);
assert.equal(briefCostDefault.heures, 10.5);
assert.equal(briefCostDefault.coutTemps, 472.5);
assert.equal(briefCostDefault.morts, 2.16);
assert.equal(briefCostDefault.caPerdu, 8208);
assert.equal(briefCostDefault.total, 8680.5);
assert.equal(briefCostDefault.caEstime, true);
assert.match(briefCostDefault.tip, /CA perdu dépasse le coût temps/);

const briefCostEmpty = computeCoutBriefIncomplet({
  demandes: 0,
  pctIncomplets: 45,
  minutes: 35,
  coutHoraire: 45,
  pctMorts: 12,
  panier: 3800,
});
assert.equal(briefCostEmpty.briefs, 0);
assert.match(briefCostEmpty.tip, /volume de demandes/);

const briefCostHighIncomplete = computeCoutBriefIncomplet({
  demandes: 40,
  pctIncomplets: 60,
  minutes: 40,
  coutHoraire: 45,
  pctMorts: 0,
  panier: 0,
});
assert.equal(briefCostHighIncomplete.briefs, 24);
assert.equal(briefCostHighIncomplete.heures, 16);
assert.equal(briefCostHighIncomplete.caEstime, false);
assert.equal(briefCostHighIncomplete.caPerdu, 0);
assert.match(briefCostHighIncomplete.tip, /Plus de la moitié des briefs/);

const briefCostMinutes = computeCoutBriefIncomplet({
  demandes: 20,
  pctIncomplets: 30,
  minutes: 50,
  coutHoraire: 40,
  pctMorts: 0,
  panier: 0,
});
assert.equal(briefCostMinutes.heures, 5);
assert.match(briefCostMinutes.tip, /beaucoup de minutes/);

const briefCostTime = computeCoutBriefIncomplet({
  demandes: 20,
  pctIncomplets: 20,
  minutes: 20,
  coutHoraire: 40,
  pctMorts: 0,
  panier: 0,
});
assert.ok(Math.abs(briefCostTime.coutTemps - (4 * 20 * 40) / 60) < 1e-9);
assert.match(briefCostTime.tip, /coût temps est déjà visible/);

const expiredDefault = computeCoutDevisExpires({
  ouverts: 40,
  pctExpirent: 25,
  panier: 4500,
  coutChiffrage: 120,
  heuresChiffrage: 2.5,
  tauxReprise: 15,
  coutRechiffrage: 80,
  pctSauves: 35,
});
assert.equal(expiredDefault.nbExpires, 10);
assert.equal(expiredDefault.caPerdu, 45000);
assert.equal(expiredDefault.heuresPerdues, 25);
assert.equal(expiredDefault.cout1, 1200);
assert.equal(expiredDefault.nbReprises, 1.5);
assert.equal(expiredDefault.coutRechiffrageTotal, 120);
assert.equal(expiredDefault.nbSauves, 3.5);
assert.equal(expiredDefault.gainCa, 15750);
assert.equal(expiredDefault.gainCout, 462);
assert.match(expiredDefault.tip, /avant expiration/);

const expiredEmpty = computeCoutDevisExpires({
  ouverts: 0,
  pctExpirent: 25,
  panier: 4500,
  coutChiffrage: 120,
  heuresChiffrage: 2.5,
  tauxReprise: 15,
  coutRechiffrage: 80,
  pctSauves: 35,
});
assert.equal(expiredEmpty.nbExpires, 0);
assert.match(expiredEmpty.tip, /volume de devis ouverts/);

const expiredHigh = computeCoutDevisExpires({
  ouverts: 40,
  pctExpirent: 45,
  panier: 4500,
  coutChiffrage: 120,
  heuresChiffrage: 2.5,
  tauxReprise: 15,
  coutRechiffrage: 80,
  pctSauves: 35,
});
assert.match(expiredHigh.tip, /fort taux d’expiration/);

const expiredReprise = computeCoutDevisExpires({
  ouverts: 40,
  pctExpirent: 20,
  panier: 4500,
  coutChiffrage: 120,
  heuresChiffrage: 2.5,
  tauxReprise: 35,
  coutRechiffrage: 80,
  pctSauves: 10,
});
assert.match(expiredReprise.tip, /Beaucoup de reprises/);

const expiredAdjust = computeCoutDevisExpires({
  ouverts: 40,
  pctExpirent: 10,
  panier: 4500,
  coutChiffrage: 120,
  heuresChiffrage: 2.5,
  tauxReprise: 10,
  coutRechiffrage: 80,
  pctSauves: 10,
});
assert.match(expiredAdjust.tip, /Ajustez le % d’expiration/);

const prefillEmpty = buildPrefillUrl({
  baseUrl: "https://www.quotebuilder.co/c/quickly/rayonnage",
  besoin: "",
  add: "",
  product: "",
});
assert.equal(prefillEmpty.url, "https://www.quotebuilder.co/c/quickly/rayonnage");
assert.equal(prefillEmpty.query, "");
assert.equal(prefillEmpty.shortcode, '[quotebuilder org="quickly" id="rayonnage"]');
assert.match(prefillEmpty.tip, /au moins un token/);

const prefillCombo = buildPrefillUrl({
  baseUrl: "https://www.quotebuilder.co/c/quickly/rayonnage/?utm_source=ads",
  besoin: "rayonnages, cantilever",
  add: "SKU-RAY-200",
  product: "",
});
assert.equal(
  prefillCombo.url,
  "https://www.quotebuilder.co/c/quickly/rayonnage?besoin=rayonnages%2Ccantilever&add=SKU-RAY-200",
);
assert.equal(prefillCombo.query, "?besoin=rayonnages%2Ccantilever&add=SKU-RAY-200");
assert.match(prefillCombo.tip, /Combinaison gamme/);

const prefillEmbed = buildPrefillUrl({
  baseUrl: "https://www.quotebuilder.co/embed/demo/rayonnage",
  besoin: "",
  add: "",
  product: "SKU-PACK-200",
});
assert.equal(
  prefillEmbed.url,
  "https://www.quotebuilder.co/embed/demo/rayonnage?product=SKU-PACK-200",
);
assert.equal(prefillEmbed.shortcode, '[quotebuilder org="demo" id="rayonnage"]');
assert.match(prefillEmbed.tip, /catalogue synchronisé/);

const leadsDefault = computeLeadsFormulaireVsFunnel({ ...LEADS_FORMULAIRE_DEFAULTS });
assert.equal(leadsDefault.heures, 12);
assert.equal(leadsDefault.mortes, 22);
assert.equal(leadsDefault.recup, 14);
assert.equal(leadsDefault.cout, 7560);
assert.equal(leadsDefault.score, 40);
assert.equal(leadsDefault.scoreTone, "bad");
assert.equal(leadsDefault.alertTone, "bad");
assert.match(leadsDefault.alert, /Pipeline fragile/);
assert.match(leadsDefault.recap, /origine Site Web/);
assert.match(leadsDefault.recap, /Score maturité pipeline : 40 \/ 100/);

const leadsEmpty = computeLeadsFormulaireVsFunnel({ ...LEADS_FORMULAIRE_DEFAULTS, demandes: 0 });
assert.equal(leadsEmpty.heures, 0);
assert.equal(leadsEmpty.mortes, 0);
assert.equal(leadsEmpty.recup, 0);
assert.equal(leadsEmpty.cout, 0);
assert.equal(leadsEmpty.alertTone, "neutral");
assert.match(leadsEmpty.alert, /volume de demandes/);

const leadsNoBasket = computeLeadsFormulaireVsFunnel({ ...LEADS_FORMULAIRE_DEFAULTS, panier: 0 });
assert.equal(leadsNoBasket.cout, null);
assert.equal(leadsNoBasket.coutLabel, "non calculé (panier = 0)");
assert.match(leadsNoBasket.recap, /Coût d’opportunité indicatif : n\/a/);

const leadsMature = computeLeadsFormulaireVsFunnel({
  demandes: 20,
  exploitPct: 85,
  minutes: 4,
  tauxActuel: 90,
  tauxCible: 95,
  panier: 0,
  convPct: 12,
});
assert.equal(leadsMature.score, 87);
assert.equal(leadsMature.alertTone, "ok");
assert.match(leadsMature.tip, /qualité catalogue/);

const leadsBuild = computeLeadsFormulaireVsFunnel({
  demandes: 10,
  exploitPct: 50,
  minutes: 12,
  tauxActuel: 50,
  tauxCible: 80,
  panier: 1000,
  convPct: 10,
});
assert.equal(leadsBuild.heures, 2);
assert.equal(leadsBuild.recup, 3);
assert.equal(leadsBuild.mortes, 4.5);
assert.equal(leadsBuild.cout, 300);
assert.equal(leadsBuild.score, 52);
assert.equal(leadsBuild.alertTone, "warn");

const leadsNoGap = computeLeadsFormulaireVsFunnel({
  demandes: 10,
  exploitPct: 50,
  minutes: 12,
  tauxActuel: 80,
  tauxCible: 40,
  panier: 1000,
  convPct: 10,
});
assert.equal(leadsNoGap.recup, 0);
assert.equal(leadsNoGap.cout, 0);
assert.equal(leadsNoGap.mortes, 3.5);

const pdfDefault = computeCoutDevisPdfSeuls({ ...COUT_DEVIS_PDF_SEULS_DEFAULTS });
assert.equal(pdfDefault.heures, 8.2);
assert.equal(pdfDefault.coutFriction, 451);
assert.equal(pdfDefault.fantomes, 13.2);
assert.equal(pdfDefault.deals, 1.4);
assert.equal(pdfDefault.opp, 9100);
assert.equal(pdfDefault.total, 9551);
assert.equal(pdfDefault.alertTone, "warn");
assert.equal(pdfDefault.totalTone, "warn");
assert.equal(pdfDefault.oppTone, "warn");
assert.match(pdfDefault.alert, /Friction PDF notable/);
assert.match(pdfDefault.recap, /Lien d’abord/);
assert.match(pdfDefault.recap, /Coût total indicatif/);

const pdfEmpty = computeCoutDevisPdfSeuls({ ...COUT_DEVIS_PDF_SEULS_DEFAULTS, devis: 0 });
assert.equal(pdfEmpty.heures, 0);
assert.equal(pdfEmpty.fantomes, 0);
assert.equal(pdfEmpty.deals, 0);
assert.equal(pdfEmpty.opp, 0);
assert.equal(pdfEmpty.total, 0);
assert.equal(pdfEmpty.alertTone, "neutral");
assert.match(pdfEmpty.alert, /volume de devis PDF/);

const pdfNoBasket = computeCoutDevisPdfSeuls({ ...COUT_DEVIS_PDF_SEULS_DEFAULTS, panier: 0 });
assert.equal(pdfNoBasket.opp, null);
assert.equal(pdfNoBasket.oppLabel, "non calculé (panier = 0)");
assert.equal(pdfNoBasket.total, pdfNoBasket.coutFriction);
assert.equal(pdfNoBasket.oppTone, "neutral");
assert.match(pdfNoBasket.recap, /Opportunités manquées : n\/a/);

const pdfHigh = computeCoutDevisPdfSeuls({
  devis: 40,
  jamaisPct: 30,
  obsoletesPct: 20,
  minutes: 20,
  taux: 55,
  panier: 1000,
  convPdf: 10,
  convLien: 12,
});
assert.equal(pdfHigh.heures, 13.3);
assert.equal(pdfHigh.coutFriction, 732);
assert.equal(pdfHigh.alertTone, "bad");
assert.match(pdfHigh.tip, /lien sécurisé/);

const pdfLow = computeCoutDevisPdfSeuls({
  devis: 4,
  jamaisPct: 5,
  obsoletesPct: 5,
  minutes: 15,
  taux: 40,
  panier: 1000,
  convPdf: 18,
  convLien: 18,
});
assert.equal(pdfLow.heures, 1);
assert.equal(pdfLow.coutFriction, 40);
assert.equal(pdfLow.fantomes, 0.3);
assert.equal(pdfLow.deals, 0);
assert.equal(pdfLow.opp, 0);
assert.equal(pdfLow.total, 40);
assert.equal(pdfLow.alertTone, "ok");
assert.equal(pdfLow.totalTone, "ok");

const pdfNoGap = computeCoutDevisPdfSeuls({
  ...COUT_DEVIS_PDF_SEULS_DEFAULTS,
  convPdf: 20,
  convLien: 12,
});
assert.equal(pdfNoGap.deals, 0);
assert.equal(pdfNoGap.opp, 0);

const pdfClamp = computeCoutDevisPdfSeuls({
  devis: -8,
  jamaisPct: 140,
  obsoletesPct: -3,
  minutes: 900,
  taux: 20000,
  panier: -1,
  convPdf: 150,
  convLien: -4,
});
assert.equal(pdfClamp.devis, 0);
assert.equal(pdfClamp.jamaisPct, 100);
assert.equal(pdfClamp.obsoletesPct, 0);
assert.equal(pdfClamp.minutes, 480);
assert.equal(pdfClamp.taux, 10000);
assert.equal(pdfClamp.panier, 0);
assert.equal(pdfClamp.convPdf, 100);
assert.equal(pdfClamp.convLien, 0);
assert.equal(pdfClamp.opp, null);

const allerDefault = computeCoutAllerRetoursBrief({ ...COUT_ALLER_RETOURS_BRIEF_DEFAULTS });
assert.equal(allerDefault.dossiers, 18);
assert.equal(allerDefault.heures, 6.6);
assert.equal(allerDefault.coutFriction, 363);
assert.equal(allerDefault.deplacements, 2.7);
assert.equal(allerDefault.coutTrajets, 230);
assert.equal(allerDefault.deals, 0.7);
assert.equal(allerDefault.opp, 5040);
assert.equal(allerDefault.total, 5633);
assert.equal(allerDefault.alertTone, "warn");
assert.equal(allerDefault.totalTone, "warn");
assert.equal(allerDefault.oppTone, "warn");
assert.match(allerDefault.alert, /Friction documents notable/);
assert.match(allerDefault.recap, /Upload photos \/ plans/);
assert.match(allerDefault.recap, /Coût total indicatif/);

const allerEmpty = computeCoutAllerRetoursBrief({ ...COUT_ALLER_RETOURS_BRIEF_DEFAULTS, demandes: 0 });
assert.equal(allerEmpty.dossiers, 0);
assert.equal(allerEmpty.heures, 0);
assert.equal(allerEmpty.deplacements, 0);
assert.equal(allerEmpty.deals, 0);
assert.equal(allerEmpty.opp, 0);
assert.equal(allerEmpty.total, 0);
assert.equal(allerEmpty.alertTone, "neutral");
assert.match(allerEmpty.alert, /volume de demandes/);

const allerNoBasket = computeCoutAllerRetoursBrief({ ...COUT_ALLER_RETOURS_BRIEF_DEFAULTS, panier: 0 });
assert.equal(allerNoBasket.opp, null);
assert.equal(allerNoBasket.oppLabel, "non calculé (panier = 0)");
assert.equal(allerNoBasket.total, allerNoBasket.coutFriction + allerNoBasket.coutTrajets);
assert.equal(allerNoBasket.oppTone, "neutral");
assert.match(allerNoBasket.recap, /Opportunités manquées : n\/a/);

const allerHigh = computeCoutAllerRetoursBrief({
  demandes: 80,
  sansDocPct: 60,
  minutes: 30,
  deplacPct: 25,
  coutTrajet: 100,
  taux: 60,
  panier: 10000,
  ecartConvPts: 8,
});
assert.equal(allerHigh.dossiers, 48);
assert.equal(allerHigh.heures, 24);
assert.equal(allerHigh.coutFriction, 1440);
assert.equal(allerHigh.deplacements, 12);
assert.equal(allerHigh.coutTrajets, 1200);
assert.equal(allerHigh.deals, 3.8);
assert.equal(allerHigh.opp, 38000);
assert.equal(allerHigh.total, 40640);
assert.equal(allerHigh.alertTone, "bad");
assert.match(allerHigh.tip, /upload photos/);

const allerLow = computeCoutAllerRetoursBrief({
  demandes: 4,
  sansDocPct: 10,
  minutes: 10,
  deplacPct: 0,
  coutTrajet: 0,
  taux: 40,
  panier: 1000,
  ecartConvPts: 0,
});
assert.equal(allerLow.dossiers, 0.4);
assert.equal(allerLow.heures, 0.1);
assert.equal(allerLow.coutFriction, 4);
assert.equal(allerLow.deplacements, 0);
assert.equal(allerLow.deals, 0);
assert.equal(allerLow.opp, 0);
assert.equal(allerLow.total, 4);
assert.equal(allerLow.alertTone, "ok");
assert.equal(allerLow.totalTone, "ok");

const allerClamp = computeCoutAllerRetoursBrief({
  demandes: -5,
  sansDocPct: 140,
  minutes: 900,
  deplacPct: -3,
  coutTrajet: 200000,
  taux: 20000,
  panier: -1,
  ecartConvPts: 80,
});
assert.equal(allerClamp.demandes, 0);
assert.equal(allerClamp.sansDocPct, 100);
assert.equal(allerClamp.minutes, 480);
assert.equal(allerClamp.deplacPct, 0);
assert.equal(allerClamp.coutTrajet, 100000);
assert.equal(allerClamp.taux, 10000);
assert.equal(allerClamp.panier, 0);
assert.equal(allerClamp.ecartConvPts, 50);
assert.equal(allerClamp.opp, null);
assert.equal(allerClamp.alertTone, "neutral");

const clarifDefault = computeCoutEmailsClarification({ ...COUT_EMAILS_CLARIFICATION_DEFAULTS });
assert.equal(clarifDefault.dossiers, 19.3);
assert.equal(clarifDefault.mailsMois, 115.8);
assert.equal(clarifDefault.heures, 15.4);
assert.equal(clarifDefault.coutTemps, 847);
assert.equal(clarifDefault.dealsPerdus, 0.8);
assert.equal(clarifDefault.opp, 5760);
assert.equal(clarifDefault.total, 6607);
assert.equal(clarifDefault.alertTone, "bad");
assert.equal(clarifDefault.totalTone, "warn");
assert.equal(clarifDefault.oppTone, "warn");
assert.match(clarifDefault.alert, /Friction clarification élevée/);
assert.match(clarifDefault.recap, /Fil prospect plat, un commentaire et un budget max par relecteur/);
assert.match(clarifDefault.recap, /Coût total indicatif/);

const clarifEmpty = computeCoutEmailsClarification({ ...COUT_EMAILS_CLARIFICATION_DEFAULTS, devis: 0 });
assert.equal(clarifEmpty.dossiers, 0);
assert.equal(clarifEmpty.mailsMois, 0);
assert.equal(clarifEmpty.heures, 0);
assert.equal(clarifEmpty.dealsPerdus, 0);
assert.equal(clarifEmpty.opp, 0);
assert.equal(clarifEmpty.total, 0);
assert.equal(clarifEmpty.alertTone, "neutral");
assert.match(clarifEmpty.alert, /volume de devis/);

const clarifNoBasket = computeCoutEmailsClarification({ ...COUT_EMAILS_CLARIFICATION_DEFAULTS, panier: 0 });
assert.equal(clarifNoBasket.opp, null);
assert.equal(clarifNoBasket.oppLabel, "non calculé (panier = 0)");
assert.equal(clarifNoBasket.total, clarifNoBasket.coutTemps);
assert.equal(clarifNoBasket.oppTone, "neutral");
assert.match(clarifNoBasket.recap, /Opportunités perdues : n\/a/);

const sansValidDefault = computeCoutDevisSansValidation({ ...COUT_DEVIS_SANS_VALIDATION_DEFAULTS });
assert.equal(sansValidDefault.aRisque, 19.3);
assert.equal(sansValidDefault.corrections, 5.8);
assert.equal(sansValidDefault.heures, 4.4);
assert.equal(sansValidDefault.coutFriction, 242);
assert.equal(sansValidDefault.dossiersMarge, 3.5);
assert.equal(sansValidDefault.coutMarge, 1190);
assert.equal(sansValidDefault.deals, 0.6);
assert.equal(sansValidDefault.opp, 5100);
assert.equal(sansValidDefault.total, 6532);
assert.equal(sansValidDefault.alertTone, "warn");
assert.equal(sansValidDefault.totalTone, "warn");
assert.equal(sansValidDefault.oppTone, "warn");
assert.match(sansValidDefault.alert, /Friction validation notable/);
assert.match(sansValidDefault.recap, /Checklist rapide/);
assert.match(sansValidDefault.recap, /Checklist 9 points/);
assert.doesNotMatch(sansValidDefault.recap, /Checklist 10 points/);
assert.match(sansValidDefault.recap, /Coût total indicatif/);
assert.equal(COUT_DEVIS_SANS_VALIDATION_LABELS.devis, "Devis envoyés / mois");
assert.equal(COUT_DEVIS_SANS_VALIDATION_LABELS.total, "Coût total indicatif mensuel");

const sansValidEmpty = computeCoutDevisSansValidation({ ...COUT_DEVIS_SANS_VALIDATION_DEFAULTS, devis: 0 });
assert.equal(sansValidEmpty.aRisque, 0);
assert.equal(sansValidEmpty.corrections, 0);
assert.equal(sansValidEmpty.heures, 0);
assert.equal(sansValidEmpty.opp, 0);
assert.equal(sansValidEmpty.total, 0);
assert.equal(sansValidEmpty.alertTone, "neutral");
assert.match(sansValidEmpty.alert, /volume de devis/);

const sansValidNoBasket = computeCoutDevisSansValidation({ ...COUT_DEVIS_SANS_VALIDATION_DEFAULTS, panier: 0 });
assert.equal(sansValidNoBasket.opp, null);
assert.equal(sansValidNoBasket.oppLabel, "non calculé (panier = 0)");
assert.equal(sansValidNoBasket.coutMargeLabel, "non calculé (panier = 0)");
assert.equal(sansValidNoBasket.total, sansValidNoBasket.coutFriction);
assert.equal(sansValidNoBasket.oppTone, "neutral");
assert.match(sansValidNoBasket.recap, /Opportunités manquées : n\/a/);
assert.match(sansValidNoBasket.recap, /Coût erreurs \/ marge : n\/a/);

const sansValidHigh = computeCoutDevisSansValidation({
  devis: 80,
  sansValidPct: 80,
  tauxErreur: 50,
  minutes: 60,
  remisePct: 40,
  ecartMarge: 8,
  panier: 12000,
  taux: 70,
  ecartConvPts: 6,
});
assert.equal(sansValidHigh.aRisque, 64);
assert.equal(sansValidHigh.corrections, 32);
assert.equal(sansValidHigh.heures, 32);
assert.equal(sansValidHigh.coutFriction, 2240);
assert.equal(sansValidHigh.dossiersMarge, 25.6);
assert.equal(sansValidHigh.coutMarge, 24576);
assert.equal(sansValidHigh.deals, 3.8);
assert.equal(sansValidHigh.opp, 45600);
assert.equal(sansValidHigh.total, 72416);
assert.equal(sansValidHigh.alertTone, "bad");
assert.equal(sansValidHigh.totalTone, "bad");
assert.equal(sansValidHigh.oppTone, "bad");
assert.match(sansValidHigh.tip, /en validation/);

const attenteDefault = computeCoutAttenteMultiDecideurs({ ...COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS });
assert.equal(attenteDefault.concernes, 18);
assert.equal(attenteDefault.jh, 6.3);
assert.equal(attenteDefault.heures, 16.5);
assert.equal(attenteDefault.coutTemps, 908);
assert.equal(attenteDefault.deals, 1.4);
assert.equal(attenteDefault.opp, 16800);
assert.equal(attenteDefault.total, 17708);
assert.equal(attenteDefault.decideurs, 3);
assert.equal(attenteDefault.alertTone, "warn");
assert.equal(attenteDefault.totalTone, "warn");
assert.equal(attenteDefault.oppTone, "bad");
assert.match(attenteDefault.alert, /Friction multi-décideurs notable/);
assert.match(attenteDefault.recap, /Checklist rapide/);
assert.match(attenteDefault.recap, /Badges En attente \/ Consulté \/ Validé \/ Modifications/);
assert.match(attenteDefault.recap, /Notifications : invitation par le prospect, validation, demande de modifications, validation complète/);
assert.doesNotMatch(attenteDefault.recap, /première ouverture/);
assert.doesNotMatch(attenteDefault.recap, /pixel/);
assert.doesNotMatch(attenteDefault.tip, /première ouverture/);
assert.equal(COUT_ATTENTE_MULTI_DECIDEURS_LABELS.devis, "Devis envoyés / mois");
assert.equal(COUT_ATTENTE_MULTI_DECIDEURS_LABELS.total, "Coût total indicatif mensuel");
assert.equal(COUT_ATTENTE_MULTI_DECIDEURS_LABELS.jh, "Jours-homme équivalents d’attente / mois");

const attenteEmpty = computeCoutAttenteMultiDecideurs({ ...COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS, devis: 0 });
assert.equal(attenteEmpty.concernes, 0);
assert.equal(attenteEmpty.jh, 0);
assert.equal(attenteEmpty.heures, 0);
assert.equal(attenteEmpty.opp, 0);
assert.equal(attenteEmpty.total, 0);
assert.equal(attenteEmpty.alertTone, "neutral");
assert.match(attenteEmpty.alert, /volume de devis/);

const attenteNoBasket = computeCoutAttenteMultiDecideurs({ ...COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS, panier: 0 });
assert.equal(attenteNoBasket.opp, null);
assert.equal(attenteNoBasket.oppLabel, "non calculé (panier = 0)");
assert.equal(attenteNoBasket.total, attenteNoBasket.coutTemps);
assert.equal(attenteNoBasket.oppTone, "neutral");
assert.match(attenteNoBasket.recap, /Opportunités : n\/a/);

const attenteLow = computeCoutAttenteMultiDecideurs({
  devis: 10,
  pctMulti: 20,
  decideurs: 2,
  jours: 1,
  minutes: 10,
  taux: 40,
  panier: 1000,
  pctPerdus: 2,
});
assert.equal(attenteLow.concernes, 2);
assert.equal(attenteLow.jh, 0.1);
assert.equal(attenteLow.heures, 0.3);
assert.equal(attenteLow.coutTemps, 12);
assert.equal(attenteLow.deals, 0);
assert.equal(attenteLow.opp, 0);
assert.equal(attenteLow.total, 12);
assert.equal(attenteLow.alertTone, "ok");
assert.match(attenteLow.alert, /Friction multi-décideurs contenue/);

const attenteHigh = computeCoutAttenteMultiDecideurs({
  devis: 80,
  pctMulti: 70,
  decideurs: 4,
  jours: 12,
  minutes: 90,
  taux: 70,
  panier: 15000,
  pctPerdus: 15,
});
assert.equal(attenteHigh.concernes, 56);
assert.equal(attenteHigh.jh, 33.6);
assert.equal(attenteHigh.heures, 84);
assert.equal(attenteHigh.coutTemps, 5880);
assert.equal(attenteHigh.deals, 8.4);
assert.equal(attenteHigh.opp, 126000);
assert.equal(attenteHigh.total, 131880);
assert.equal(attenteHigh.alertTone, "bad");
assert.equal(attenteHigh.totalTone, "bad");
assert.equal(attenteHigh.oppTone, "bad");
assert.match(attenteHigh.tip, /En attente/);

const attenteClamp = computeCoutAttenteMultiDecideurs({
  devis: -5,
  pctMulti: 140,
  decideurs: 40,
  jours: 400,
  minutes: 900,
  taux: 20000,
  panier: -1,
  pctPerdus: 140,
});
assert.equal(attenteClamp.devis, 0);
assert.equal(attenteClamp.pctMulti, 100);
assert.equal(attenteClamp.decideurs, 20);
assert.equal(attenteClamp.jours, 365);
assert.equal(attenteClamp.minutes, 480);
assert.equal(attenteClamp.taux, 10000);
assert.equal(attenteClamp.panier, 0);
assert.equal(attenteClamp.pctPerdus, 100);
assert.equal(attenteClamp.opp, null);
assert.equal(attenteClamp.alertTone, "neutral");

const visitesDefault = computeCoutVisitesInutiles({ ...COUT_VISITES_INUTILES_DEFAULTS });
assert.equal(visitesDefault.visites, 20);
assert.equal(visitesDefault.inutiles, 6);
assert.equal(visitesDefault.heures, 15);
assert.equal(visitesDefault.coutTemps, 975);
assert.equal(visitesDefault.coutDepl, 210);
assert.equal(visitesDefault.cout, 1185);
assert.equal(visitesDefault.deals, 3);
assert.equal(visitesDefault.opp, 13500);
assert.equal(visitesDefault.total, 14685);
assert.equal(visitesDefault.alertTone, "warn");
assert.equal(visitesDefault.totalTone, "warn");
assert.equal(visitesDefault.oppTone, "warn");
assert.match(visitesDefault.alert, /Friction visites notable/);
assert.match(visitesDefault.recap, /Checklist rapide/);
assert.match(visitesDefault.recap, /statut Gagné \/ Perdu posé par le commercial/);
assert.match(visitesDefault.recap, /Pas de planification de tournée dans cet outil/);
assert.doesNotMatch(visitesDefault.recap, /signature électronique/);
assert.doesNotMatch(visitesDefault.recap, /première ouverture/);
assert.doesNotMatch(visitesDefault.tip, /planifie les tournées/);
assert.equal(COUT_VISITES_INUTILES_LABELS.devis, "Devis / demandes traitées / mois");
assert.equal(COUT_VISITES_INUTILES_LABELS.total, "Coût total indicatif mensuel");
assert.equal(COUT_VISITES_INUTILES_LABELS.cout, "Coût temps + déplacement (visites inutiles)");

const visitesEmpty = computeCoutVisitesInutiles({ ...COUT_VISITES_INUTILES_DEFAULTS, devis: 0 });
assert.equal(visitesEmpty.visites, 0);
assert.equal(visitesEmpty.inutiles, 0);
assert.equal(visitesEmpty.heures, 0);
assert.equal(visitesEmpty.opp, 0);
assert.equal(visitesEmpty.total, 0);
assert.equal(visitesEmpty.alertTone, "neutral");
assert.match(visitesEmpty.alert, /volume de devis/);

const visitesNoBasket = computeCoutVisitesInutiles({ ...COUT_VISITES_INUTILES_DEFAULTS, panier: 0 });
assert.equal(visitesNoBasket.opp, null);
assert.equal(visitesNoBasket.oppLabel, "non calculé (panier = 0)");
assert.equal(visitesNoBasket.total, visitesNoBasket.cout);
assert.equal(visitesNoBasket.oppTone, "neutral");
assert.equal(visitesNoBasket.alertTone, "warn");
assert.match(visitesNoBasket.recap, /Opportunité indicative : n\/a/);

const visitesLow = computeCoutVisitesInutiles({
  devis: 8,
  pctVisite: 10,
  pctInutile: 10,
  duree: 1,
  taux: 40,
  deplacement: 10,
  panier: 500,
  pctPerdus: 1,
});
assert.equal(visitesLow.visites, 0.8);
assert.equal(visitesLow.inutiles, 0.1);
assert.equal(visitesLow.heures, 0.1);
assert.equal(visitesLow.coutTemps, 4);
assert.equal(visitesLow.coutDepl, 1);
assert.equal(visitesLow.cout, 5);
assert.equal(visitesLow.deals, 0.1);
assert.equal(visitesLow.opp, 50);
assert.equal(visitesLow.total, 55);
assert.equal(visitesLow.alertTone, "ok");
assert.match(visitesLow.alert, /Friction visites contenue/);

const visitesHigh = computeCoutVisitesInutiles({
  devis: 120,
  pctVisite: 70,
  pctInutile: 40,
  duree: 3,
  taux: 80,
  deplacement: 40,
  panier: 10000,
  pctPerdus: 12,
});
assert.equal(visitesHigh.visites, 84);
assert.equal(visitesHigh.inutiles, 33.6);
assert.equal(visitesHigh.heures, 100.8);
assert.equal(visitesHigh.coutTemps, 8064);
assert.equal(visitesHigh.coutDepl, 1344);
assert.equal(visitesHigh.cout, 9408);
assert.equal(visitesHigh.deals, 14.4);
assert.equal(visitesHigh.opp, 144000);
assert.equal(visitesHigh.total, 153408);
assert.equal(visitesHigh.alertTone, "bad");
assert.equal(visitesHigh.totalTone, "bad");
assert.equal(visitesHigh.oppTone, "bad");
assert.match(visitesHigh.tip, /hypothèses écrites/);

const visitesClamp = computeCoutVisitesInutiles({
  devis: -5,
  pctVisite: 140,
  pctInutile: 140,
  duree: 40,
  taux: 20000,
  deplacement: 200000,
  panier: -1,
  pctPerdus: 140,
});
assert.equal(visitesClamp.devis, 0);
assert.equal(visitesClamp.pctVisite, 100);
assert.equal(visitesClamp.pctInutile, 100);
assert.equal(visitesClamp.duree, 24);
assert.equal(visitesClamp.taux, 10000);
assert.equal(visitesClamp.deplacement, 100000);
assert.equal(visitesClamp.panier, 0);
assert.equal(visitesClamp.pctPerdus, 100);
assert.equal(visitesClamp.opp, null);
assert.equal(visitesClamp.alertTone, "neutral");

const doubleDefault = computeCoutDoubleSaisie({ ...COUT_DOUBLE_SAISIE_DEFAULTS });
assert.equal(doubleDefault.heures, 12);
assert.equal(doubleDefault.coutTemps, 660);
assert.equal(doubleDefault.deformes, 14);
assert.equal(doubleDefault.morts, 5.6);
assert.equal(doubleDefault.opp, 47600);
assert.equal(doubleDefault.total, 48260);
assert.equal(doubleDefault.alertTone, "warn");
assert.equal(doubleDefault.totalTone, "warn");
assert.equal(doubleDefault.defTone, "warn");
assert.equal(doubleDefault.oppTone, "warn");
assert.match(doubleDefault.alert, /Double saisie notable/);
assert.match(doubleDefault.recap, /Checklist rapide/);
assert.match(doubleDefault.recap, /pas d'écran import devis/);
assert.match(doubleDefault.recap, /formule fixe, pas de SLA produit/);
assert.match(doubleDefault.recap, /uploads prospect/);
assert.doesNotMatch(doubleDefault.recap, /signature électronique/);
assert.doesNotMatch(doubleDefault.recap, EM_DASH);
assert.equal(COUT_DOUBLE_SAISIE_LABELS.demandes, "Demandes / mois en double saisie");
assert.equal(COUT_DOUBLE_SAISIE_LABELS.total, "Coût total indicatif mensuel (temps + opportunités)");

const doubleFormula = computeCoutDoubleSaisie({
  demandes: 60,
  minutes: 20,
  pctPerte: 50,
  pctMort: 40,
  taux: 50,
  panier: 1000,
});
assert.equal(doubleFormula.heures, (60 * 20) / 60);
assert.equal(doubleFormula.coutTemps, doubleFormula.heures * 50);
assert.equal(doubleFormula.deformes, (60 * 50) / 100);
assert.equal(doubleFormula.morts, (doubleFormula.deformes * 40) / 100);
assert.equal(doubleFormula.opp, doubleFormula.morts * 1000);
assert.equal(doubleFormula.total, doubleFormula.coutTemps + (doubleFormula.opp ?? 0));
assert.equal(doubleFormula.heures, 20);
assert.equal(doubleFormula.coutTemps, 1000);
assert.equal(doubleFormula.deformes, 30);
assert.equal(doubleFormula.morts, 12);
assert.equal(doubleFormula.opp, 12000);
assert.equal(doubleFormula.total, 13000);
assert.equal(doubleFormula.alertTone, "bad");
assert.equal(doubleFormula.defTone, "bad");

const doubleEmpty = computeCoutDoubleSaisie({ ...COUT_DOUBLE_SAISIE_DEFAULTS, demandes: 0 });
assert.equal(doubleEmpty.heures, 0);
assert.equal(doubleEmpty.coutTemps, 0);
assert.equal(doubleEmpty.deformes, 0);
assert.equal(doubleEmpty.morts, 0);
assert.equal(doubleEmpty.opp, 0);
assert.equal(doubleEmpty.total, 0);
assert.equal(doubleEmpty.alertTone, "neutral");
assert.match(doubleEmpty.alert, /volume de demandes en double saisie/);

const doubleNoBasket = computeCoutDoubleSaisie({ ...COUT_DOUBLE_SAISIE_DEFAULTS, panier: 0 });
assert.equal(doubleNoBasket.opp, null);
assert.equal(doubleNoBasket.oppLabel, "non calculé (panier = 0)");
assert.equal(doubleNoBasket.total, doubleNoBasket.coutTemps);
assert.equal(doubleNoBasket.oppTone, "neutral");
assert.equal(doubleNoBasket.alertTone, "warn");
assert.match(doubleNoBasket.recap, /Opportunités perdues \(indicatif\) : n\/a/);

const doubleLow = computeCoutDoubleSaisie({
  demandes: 12,
  minutes: 10,
  pctPerte: 10,
  pctMort: 50,
  taux: 60,
  panier: 2000,
});
assert.equal(doubleLow.heures, 2);
assert.equal(doubleLow.coutTemps, 120);
assert.equal(doubleLow.deformes, 1.2);
assert.equal(doubleLow.morts, 0.6);
assert.equal(doubleLow.opp, 1200);
assert.equal(doubleLow.total, 1320);
assert.equal(doubleLow.alertTone, "ok");
assert.match(doubleLow.alert, /Double saisie plutôt contenue/);

const doubleHigh = computeCoutDoubleSaisie({
  demandes: 200,
  minutes: 30,
  pctPerte: 50,
  pctMort: 50,
  taux: 80,
  panier: 10000,
});
assert.equal(doubleHigh.heures, 100);
assert.equal(doubleHigh.coutTemps, 8000);
assert.equal(doubleHigh.deformes, 100);
assert.equal(doubleHigh.morts, 50);
assert.equal(doubleHigh.opp, 500000);
assert.equal(doubleHigh.total, 508000);
assert.equal(doubleHigh.alertTone, "bad");
assert.equal(doubleHigh.totalTone, "bad");
assert.equal(doubleHigh.defTone, "bad");
assert.equal(doubleHigh.oppTone, "bad");
assert.match(doubleHigh.tip, /source unique/);

const doubleClamp = computeCoutDoubleSaisie({
  demandes: -5,
  minutes: 2000,
  pctPerte: 140,
  pctMort: 140,
  taux: 20000,
  panier: -1,
});
assert.equal(doubleClamp.demandes, 0);
assert.equal(doubleClamp.minutes, 1440);
assert.equal(doubleClamp.pctPerte, 100);
assert.equal(doubleClamp.pctMort, 100);
assert.equal(doubleClamp.taux, 10000);
assert.equal(doubleClamp.panier, 0);
assert.equal(doubleClamp.opp, null);
assert.equal(doubleClamp.alertTone, "neutral");

const oralesDefault = computeCoutDemandesOrales({ ...COUT_DEMANDES_ORALES_DEFAULTS });
assert.equal(oralesDefault.nonCap, 36);
assert.equal(oralesDefault.heures, 15);
assert.equal(oralesDefault.cout, 825);
assert.equal(oralesDefault.deals, 4);
assert.equal(oralesDefault.opp, 16800);
assert.equal(oralesDefault.total, 17625);
assert.equal(oralesDefault.versFunnel, 48);
assert.equal(oralesDefault.alertTone, "bad");
assert.equal(oralesDefault.totalTone, "warn");
assert.equal(oralesDefault.oppTone, "bad");
assert.match(oralesDefault.alert, /Friction orale élevée/);
assert.match(oralesDefault.recap, /Checklist rapide/);
assert.match(oralesDefault.recap, /Gagné \/ Perdu posés par le commercial/);
assert.match(oralesDefault.recap, /pas de bot WhatsApp inventé/);
assert.match(oralesDefault.recap, /formule fixe produit/);
assert.match(oralesDefault.recap, /n'est pas un client WhatsApp/);
assert.doesNotMatch(oralesDefault.recap, /signature électronique/);
assert.doesNotMatch(oralesDefault.recap, /première ouverture/);
assert.equal(COUT_DEMANDES_ORALES_LABELS.orales, "Demandes orales / mois (tél + WhatsApp + SMS)");
assert.equal(COUT_DEMANDES_ORALES_LABELS.total, "Coût total indicatif mensuel");
assert.equal(COUT_DEMANDES_ORALES_LABELS.versFunnel, "Orales qui auraient pu aller au funnel (indicatif)");

const oralesEmpty = computeCoutDemandesOrales({ ...COUT_DEMANDES_ORALES_DEFAULTS, orales: 0 });
assert.equal(oralesEmpty.nonCap, 0);
assert.equal(oralesEmpty.heures, 0);
assert.equal(oralesEmpty.cout, 0);
assert.equal(oralesEmpty.opp, 0);
assert.equal(oralesEmpty.total, 0);
assert.equal(oralesEmpty.versFunnel, 0);
assert.equal(oralesEmpty.alertTone, "neutral");
assert.match(oralesEmpty.alert, /volume de demandes orales/);

const oralesNoBasket = computeCoutDemandesOrales({ ...COUT_DEMANDES_ORALES_DEFAULTS, panier: 0 });
assert.equal(oralesNoBasket.opp, null);
assert.equal(oralesNoBasket.oppLabel, "non calculé (panier = 0)");
assert.equal(oralesNoBasket.total, oralesNoBasket.cout);
assert.equal(oralesNoBasket.oppTone, "neutral");
assert.equal(oralesNoBasket.alertTone, "bad");
assert.match(oralesNoBasket.recap, /Opportunité indicative : n\/a/);

const oralesFunnelIgnored = computeCoutDemandesOrales({ ...COUT_DEMANDES_ORALES_DEFAULTS, pctFunnel: 0 });
assert.equal(oralesFunnelIgnored.versFunnel, 0);
assert.equal(oralesFunnelIgnored.total, oralesDefault.total);
assert.equal(oralesFunnelIgnored.cout, oralesDefault.cout);
assert.equal(oralesFunnelIgnored.opp, oralesDefault.opp);

const oralesLow = computeCoutDemandesOrales({
  orales: 10,
  pctNonCapturees: 10,
  minutes: 10,
  pctFunnel: 20,
  taux: 40,
  pctPerdus: 1,
  panier: 500,
});
assert.equal(oralesLow.nonCap, 1);
assert.equal(oralesLow.heures, 0.2);
assert.equal(oralesLow.cout, 8);
assert.equal(oralesLow.deals, 0.1);
assert.equal(oralesLow.opp, 50);
assert.equal(oralesLow.total, 58);
assert.equal(oralesLow.versFunnel, 2);
assert.equal(oralesLow.alertTone, "ok");
assert.match(oralesLow.alert, /Friction orale contenue/);

const oralesHigh = computeCoutDemandesOrales({
  orales: 200,
  pctNonCapturees: 80,
  minutes: 40,
  pctFunnel: 70,
  taux: 80,
  pctPerdus: 10,
  panier: 8000,
});
assert.equal(oralesHigh.nonCap, 160);
assert.equal(oralesHigh.heures, 106.7);
assert.equal(oralesHigh.cout, 8536);
assert.equal(oralesHigh.deals, 20);
assert.equal(oralesHigh.opp, 160000);
assert.equal(oralesHigh.total, 168536);
assert.equal(oralesHigh.versFunnel, 140);
assert.equal(oralesHigh.alertTone, "bad");
assert.equal(oralesHigh.totalTone, "bad");
assert.equal(oralesHigh.oppTone, "bad");
assert.match(oralesHigh.tip, /checklist collable/);

const handoffDefault = computeCoutHandoff({ ...COUT_HANDOFF_DEFAULTS });
assert.equal(handoffDefault.mauvais, 24);
assert.equal(handoffDefault.heures, 14);
assert.equal(handoffDefault.cout, 910);
assert.equal(handoffDefault.deals, 3.6);
assert.equal(handoffDefault.opp, 19800);
assert.equal(handoffDefault.total, 20710);
assert.equal(handoffDefault.evitables, 13.2);
assert.equal(handoffDefault.alertTone, "bad");
assert.equal(handoffDefault.totalTone, "bad");
assert.equal(handoffDefault.oppTone, "bad");
assert.match(handoffDefault.alert, /Friction handoff élevée/);
assert.match(handoffDefault.recap, /Checklist rapide/);
assert.match(handoffDefault.recap, /Gagné \/ Perdu posés par le commercial/);
assert.match(handoffDefault.recap, /formule fixe/);
assert.match(handoffDefault.recap, /chat fil plat/);
assert.match(handoffDefault.recap, /pas de TVA inventée/);
assert.doesNotMatch(handoffDefault.recap, /signature électronique/);
assert.doesNotMatch(handoffDefault.recap, /première ouverture/);
assert.equal(
  COUT_HANDOFF_LABELS.devis,
  "Devis / mois concernés par un handoff commercial→technique",
);
assert.equal(COUT_HANDOFF_LABELS.total, "Coût total indicatif mensuel");
assert.equal(COUT_HANDOFF_LABELS.evitables, "Handoffs qui auraient pu être évités (indicatif)");

const handoffEmpty = computeCoutHandoff({ ...COUT_HANDOFF_DEFAULTS, devis: 0 });
assert.equal(handoffEmpty.mauvais, 0);
assert.equal(handoffEmpty.heures, 0);
assert.equal(handoffEmpty.cout, 0);
assert.equal(handoffEmpty.opp, 0);
assert.equal(handoffEmpty.total, 0);
assert.equal(handoffEmpty.evitables, 0);
assert.equal(handoffEmpty.alertTone, "neutral");
assert.match(handoffEmpty.alert, /volume de devis/);

const handoffNoBasket = computeCoutHandoff({ ...COUT_HANDOFF_DEFAULTS, panier: 0 });
assert.equal(handoffNoBasket.opp, null);
assert.equal(handoffNoBasket.oppLabel, "non calculé (panier = 0)");
assert.equal(handoffNoBasket.total, handoffNoBasket.cout);
assert.equal(handoffNoBasket.oppTone, "neutral");
assert.equal(handoffNoBasket.alertTone, "warn");
assert.match(handoffNoBasket.recap, /Opportunités indicatives : n\/a/);

const handoffEvitablesIgnored = computeCoutHandoff({ ...COUT_HANDOFF_DEFAULTS, pctEvitables: 0 });
assert.equal(handoffEvitablesIgnored.evitables, 0);
assert.equal(handoffEvitablesIgnored.total, handoffDefault.total);
assert.equal(handoffEvitablesIgnored.cout, handoffDefault.cout);
assert.equal(handoffEvitablesIgnored.opp, handoffDefault.opp);

const handoffLow = computeCoutHandoff({
  devis: 10,
  pctSales: 10,
  minutes: 10,
  pctEvitables: 20,
  taux: 40,
  pctRetrav: 1,
  panier: 500,
});
assert.equal(handoffLow.mauvais, 1);
assert.equal(handoffLow.heures, 0.2);
assert.equal(handoffLow.cout, 8);
assert.equal(handoffLow.deals, 0.1);
assert.equal(handoffLow.opp, 50);
assert.equal(handoffLow.total, 58);
assert.equal(handoffLow.evitables, 0.2);
assert.equal(handoffLow.alertTone, "ok");
assert.match(handoffLow.alert, /Friction handoff contenue/);

const handoffWarn = computeCoutHandoff({
  devis: 40,
  pctSales: 40,
  minutes: 30,
  pctEvitables: 10,
  taux: 50,
  pctRetrav: 2,
  panier: 1000,
});
assert.equal(handoffWarn.mauvais, 16);
assert.equal(handoffWarn.heures, 8);
assert.equal(handoffWarn.cout, 400);
assert.equal(handoffWarn.deals, 0.8);
assert.equal(handoffWarn.opp, 800);
assert.equal(handoffWarn.total, 1200);
assert.equal(handoffWarn.alertTone, "warn");
assert.equal(handoffWarn.totalTone, "ok");
assert.match(handoffWarn.tip, /photos \/ grandeurs/);

const handoffHigh = computeCoutHandoff({
  devis: 200,
  pctSales: 80,
  minutes: 40,
  pctEvitables: 70,
  taux: 80,
  pctRetrav: 10,
  panier: 8000,
});
assert.equal(handoffHigh.mauvais, 160);
assert.equal(handoffHigh.heures, 106.7);
assert.equal(handoffHigh.cout, 8536);
assert.equal(handoffHigh.deals, 20);
assert.equal(handoffHigh.opp, 160000);
assert.equal(handoffHigh.total, 168536);
assert.equal(handoffHigh.evitables, 112);
assert.equal(handoffHigh.alertTone, "bad");
assert.equal(handoffHigh.totalTone, "bad");
assert.equal(handoffHigh.oppTone, "bad");
assert.match(handoffHigh.tip, /checklist handoff/);

const handoffClamp = computeCoutHandoff({
  devis: -5,
  pctSales: 140,
  minutes: 2000,
  pctEvitables: 140,
  taux: 20000,
  pctRetrav: 140,
  panier: -1,
});
assert.equal(handoffClamp.devis, 0);
assert.equal(handoffClamp.pctSales, 100);
assert.equal(handoffClamp.minutes, 1440);
assert.equal(handoffClamp.pctEvitables, 100);
assert.equal(handoffClamp.taux, 10000);
assert.equal(handoffClamp.pctRetrav, 100);
assert.equal(handoffClamp.panier, 0);
assert.equal(handoffClamp.opp, null);
assert.equal(handoffClamp.alertTone, "neutral");

const contexteDefault = computeCoutContexteHorsDossier({ ...COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS });
assert.equal(contexteDefault.fragiles, 22.5);
assert.equal(contexteDefault.heures, 8.3);
assert.equal(contexteDefault.coutTemps, 498);
assert.equal(contexteDefault.morts, 4);
assert.equal(contexteDefault.opp, 24000);
assert.equal(contexteDefault.total, 24498);
assert.equal(contexteDefault.alertTone, "bad");
assert.equal(contexteDefault.totalTone, "warn");
assert.equal(contexteDefault.oppTone, "bad");
assert.match(contexteDefault.alert, /Contexte hors dossier lourd/);
assert.match(contexteDefault.recap, /Checklist rapide/);
assert.match(contexteDefault.recap, /Notes internes sur le dossier/);
assert.match(contexteDefault.recap, /chat plat/);
assert.match(contexteDefault.recap, /formule fixe/);
assert.match(contexteDefault.recap, /Commencée, Nouveau, Contacté, En cours, Gagné, Perdu, En attente/);
assert.match(contexteDefault.recap, /pas Accepté \/ Signé comme statuts/);
assert.match(contexteDefault.recap, /pas un chat interne inventé/);
assert.match(contexteDefault.recap, /commentaires ancrés/);
assert.match(contexteDefault.recap, /pas de TVA inventée/);
assert.doesNotMatch(contexteDefault.recap, /signature électronique/);
assert.doesNotMatch(contexteDefault.recap, EM_DASH);
assert.equal(COUT_CONTEXTE_HORS_DOSSIER_LABELS.dossiers, "Dossiers devis / mois");
assert.equal(COUT_CONTEXTE_HORS_DOSSIER_LABELS.fragiles, "Dossiers fragiles / mois (sans notes utiles)");
assert.equal(COUT_CONTEXTE_HORS_DOSSIER_LABELS.total, "Coût total indicatif mensuel");

const contexteEmpty = computeCoutContexteHorsDossier({ ...COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS, dossiers: 0 });
assert.equal(contexteEmpty.fragiles, 0);
assert.equal(contexteEmpty.heures, 0);
assert.equal(contexteEmpty.coutTemps, 0);
assert.equal(contexteEmpty.morts, 0);
assert.equal(contexteEmpty.opp, 0);
assert.equal(contexteEmpty.total, 0);
assert.equal(contexteEmpty.alertTone, "neutral");
assert.match(contexteEmpty.alert, /volume de dossiers/);

const contexteNoBasket = computeCoutContexteHorsDossier({ ...COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS, panier: 0 });
assert.equal(contexteNoBasket.opp, null);
assert.equal(contexteNoBasket.oppLabel, "non calculé (panier = 0)");
assert.equal(contexteNoBasket.total, contexteNoBasket.coutTemps);
assert.equal(contexteNoBasket.oppTone, "neutral");
assert.equal(contexteNoBasket.alertTone, "bad");
assert.match(contexteNoBasket.recap, /Opportunités indicatives : n\/a/);

const contexteLow = computeCoutContexteHorsDossier({
  dossiers: 10,
  pctSans: 10,
  minutes: 10,
  pctMorts: 1,
  taux: 40,
  panier: 500,
});
assert.equal(contexteLow.fragiles, 1);
assert.equal(contexteLow.heures, 0.2);
assert.equal(contexteLow.coutTemps, 8);
assert.equal(contexteLow.morts, 0.1);
assert.equal(contexteLow.opp, 50);
assert.equal(contexteLow.total, 58);
assert.equal(contexteLow.alertTone, "ok");
assert.match(contexteLow.alert, /Contexte hors dossier plutôt contenu/);

const contexteWarn = computeCoutContexteHorsDossier({
  dossiers: 40,
  pctSans: 30,
  minutes: 30,
  pctMorts: 2,
  taux: 50,
  panier: 1000,
});
assert.equal(contexteWarn.fragiles, 12);
assert.equal(contexteWarn.heures, 6);
assert.equal(contexteWarn.coutTemps, 300);
assert.equal(contexteWarn.morts, 0.8);
assert.equal(contexteWarn.opp, 800);
assert.equal(contexteWarn.total, 1100);
assert.equal(contexteWarn.alertTone, "warn");
assert.equal(contexteWarn.totalTone, "ok");
assert.match(contexteWarn.tip, /5 lignes de notes/);

const contexteHigh = computeCoutContexteHorsDossier({
  dossiers: 200,
  pctSans: 80,
  minutes: 40,
  pctMorts: 10,
  taux: 80,
  panier: 8000,
});
assert.equal(contexteHigh.fragiles, 160);
assert.equal(contexteHigh.heures, 106.7);
assert.equal(contexteHigh.coutTemps, 8536);
assert.equal(contexteHigh.morts, 20);
assert.equal(contexteHigh.opp, 160000);
assert.equal(contexteHigh.total, 168536);
assert.equal(contexteHigh.alertTone, "bad");
assert.equal(contexteHigh.totalTone, "bad");
assert.equal(contexteHigh.oppTone, "bad");
assert.match(contexteHigh.tip, /notes internes sur chaque dossier/);

const contexteClamp = computeCoutContexteHorsDossier({
  dossiers: -5,
  pctSans: 140,
  minutes: 2000,
  pctMorts: 140,
  taux: 20000,
  panier: -1,
});
assert.equal(contexteClamp.dossiers, 0);
assert.equal(contexteClamp.pctSans, 100);
assert.equal(contexteClamp.minutes, 1440);
assert.equal(contexteClamp.pctMorts, 100);
assert.equal(contexteClamp.taux, 10000);
assert.equal(contexteClamp.panier, 0);
assert.equal(contexteClamp.opp, null);
assert.equal(contexteClamp.alertTone, "neutral");

const oralesClamp = computeCoutDemandesOrales({
  orales: -5,
  pctNonCapturees: 140,
  minutes: 2000,
  pctFunnel: 140,
  taux: 20000,
  pctPerdus: 140,
  panier: -1,
});
assert.equal(oralesClamp.orales, 0);
assert.equal(oralesClamp.pctNonCapturees, 100);
assert.equal(oralesClamp.minutes, 1440);
assert.equal(oralesClamp.pctFunnel, 100);
assert.equal(oralesClamp.taux, 10000);
assert.equal(oralesClamp.pctPerdus, 100);
assert.equal(oralesClamp.panier, 0);
assert.equal(oralesClamp.opp, null);
assert.equal(oralesClamp.alertTone, "neutral");

const fantomeDefault = computeCoutPipelineFantome({ ...COUT_PIPELINE_FANTOME_DEFAULTS });
assert.equal(fantomeDefault.fantomes, 34);
assert.equal(fantomeDefault.heures, 14.2);
assert.equal(fantomeDefault.coutTemps, 781);
assert.equal(fantomeDefault.perdusPot, 11.9);
assert.equal(fantomeDefault.gagnePot, 1.7);
assert.equal(fantomeDefault.opp, 119000);
assert.equal(fantomeDefault.gagneVal, 17000);
assert.equal(fantomeDefault.total, 119781);
assert.equal(fantomeDefault.alertTone, "bad");
assert.equal(fantomeDefault.totalTone, "bad");
assert.equal(fantomeDefault.oppTone, "bad");
assert.equal(fantomeDefault.gagneTone, "ok");
assert.match(fantomeDefault.alert, /Pipeline fantôme lourd/);
assert.match(fantomeDefault.recap, /Checklist rapide/);
assert.match(fantomeDefault.recap, /7 statuts CRM seulement/);
assert.match(fantomeDefault.recap, /Accepté \/ Signé ne sont pas des statuts CRM/);
assert.match(fantomeDefault.recap, /pas de signature prospect auto/);
assert.match(fantomeDefault.recap, /pas de SLA produit/);
assert.doesNotMatch(fantomeDefault.recap, /signature électronique/);
assert.equal(COUT_PIPELINE_FANTOME_LABELS.ouverts, "Dossiers ouverts dans le pipeline");
assert.equal(COUT_PIPELINE_FANTOME_LABELS.total, "Coût total indicatif mensuel (temps + opportunités)");

const fantomeEmpty = computeCoutPipelineFantome({ ...COUT_PIPELINE_FANTOME_DEFAULTS, ouverts: 0 });
assert.equal(fantomeEmpty.fantomes, 0);
assert.equal(fantomeEmpty.heures, 0);
assert.equal(fantomeEmpty.coutTemps, 0);
assert.equal(fantomeEmpty.opp, 0);
assert.equal(fantomeEmpty.total, 0);
assert.equal(fantomeEmpty.alertTone, "neutral");
assert.match(fantomeEmpty.alert, /dossiers ouverts/);

const fantomeNoBasket = computeCoutPipelineFantome({ ...COUT_PIPELINE_FANTOME_DEFAULTS, panier: 0 });
assert.equal(fantomeNoBasket.opp, null);
assert.equal(fantomeNoBasket.gagneVal, null);
assert.equal(fantomeNoBasket.oppLabel, "non calculé (panier = 0)");
assert.equal(fantomeNoBasket.gagneLabel, "non calculé (panier = 0)");
assert.equal(fantomeNoBasket.total, fantomeNoBasket.coutTemps);
assert.equal(fantomeNoBasket.oppTone, "neutral");
assert.equal(fantomeNoBasket.alertTone, "bad");
assert.match(fantomeNoBasket.recap, /Opportunités fantômes \(Perdu\) : n\/a/);

const fantomeLow = computeCoutPipelineFantome({
  ouverts: 20,
  pctFantome: 10,
  age: 20,
  minutes: 10,
  taux: 40,
  panier: 500,
  pctPerdu: 5,
  pctGagne: 2,
});
assert.equal(fantomeLow.fantomes, 2);
assert.equal(fantomeLow.heures, 0.3);
assert.equal(fantomeLow.coutTemps, 12);
assert.equal(fantomeLow.perdusPot, 0.1);
assert.equal(fantomeLow.gagnePot, 0);
assert.equal(fantomeLow.opp, 50);
assert.equal(fantomeLow.gagneVal, 0);
assert.equal(fantomeLow.total, 62);
assert.equal(fantomeLow.alertTone, "ok");
assert.match(fantomeLow.alert, /Pipeline plutôt tenu/);

const fantomeWarn = computeCoutPipelineFantome({
  ouverts: 40,
  pctFantome: 30,
  age: 50,
  minutes: 20,
  taux: 50,
  panier: 1000,
  pctPerdu: 10,
  pctGagne: 5,
});
assert.equal(fantomeWarn.fantomes, 12);
assert.equal(fantomeWarn.heures, 4);
assert.equal(fantomeWarn.coutTemps, 200);
assert.equal(fantomeWarn.perdusPot, 1.2);
assert.equal(fantomeWarn.opp, 1200);
assert.equal(fantomeWarn.total, 1400);
assert.equal(fantomeWarn.alertTone, "warn");
assert.equal(fantomeWarn.totalTone, "ok");
assert.match(fantomeWarn.tip, /45 jours/);

const fantomeHigh = computeCoutPipelineFantome({
  ouverts: 200,
  pctFantome: 50,
  age: 90,
  minutes: 40,
  taux: 70,
  panier: 8000,
  pctPerdu: 40,
  pctGagne: 8,
});
assert.equal(fantomeHigh.fantomes, 100);
assert.equal(fantomeHigh.heures, 66.7);
assert.equal(fantomeHigh.coutTemps, 4669);
assert.equal(fantomeHigh.perdusPot, 40);
assert.equal(fantomeHigh.gagnePot, 8);
assert.equal(fantomeHigh.opp, 320000);
assert.equal(fantomeHigh.gagneVal, 64000);
assert.equal(fantomeHigh.total, 324669);
assert.equal(fantomeHigh.alertTone, "bad");
assert.equal(fantomeHigh.totalTone, "bad");
assert.equal(fantomeHigh.oppTone, "bad");
assert.equal(fantomeHigh.gagneTone, "warn");
assert.match(fantomeHigh.tip, /Gagné \/ Perdu/);

const fantomeClamp = computeCoutPipelineFantome({
  ouverts: -5,
  pctFantome: 140,
  age: 9000,
  minutes: 24 * 60 + 30,
  taux: 20000,
  panier: -1,
  pctPerdu: 140,
  pctGagne: 140,
});
assert.equal(fantomeClamp.ouverts, 0);
assert.equal(fantomeClamp.pctFantome, 100);
assert.equal(fantomeClamp.age, 3650);
assert.equal(fantomeClamp.minutes, 24 * 60);
assert.equal(fantomeClamp.taux, 10000);
assert.equal(fantomeClamp.panier, 0);
assert.equal(fantomeClamp.pctPerdu, 100);
assert.equal(fantomeClamp.pctGagne, 100);
assert.equal(fantomeClamp.opp, null);
assert.equal(fantomeClamp.gagneVal, null);
assert.equal(fantomeClamp.alertTone, "neutral");

const sansValidClamp = computeCoutDevisSansValidation({
  devis: -5,
  sansValidPct: 140,
  tauxErreur: 140,
  minutes: 900,
  remisePct: -3,
  ecartMarge: 80,
  panier: -1,
  taux: 20000,
  ecartConvPts: 80,
});
assert.equal(sansValidClamp.devis, 0);
assert.equal(sansValidClamp.sansValidPct, 100);
assert.equal(sansValidClamp.tauxErreur, 100);
assert.equal(sansValidClamp.minutes, 480);
assert.equal(sansValidClamp.remisePct, 0);
assert.equal(sansValidClamp.ecartMarge, 50);
assert.equal(sansValidClamp.panier, 0);
assert.equal(sansValidClamp.taux, 10000);
assert.equal(sansValidClamp.ecartConvPts, 50);
assert.equal(sansValidClamp.opp, null);
assert.equal(sansValidClamp.alertTone, "neutral");

const relancesDefault = computeCoutRelancesAveugles({ ...COUT_RELANCES_AVEUGLES_DEFAULTS });
assert.equal(relancesDefault.aveugles, 28);
assert.equal(relancesDefault.relancesMois, 70);
assert.equal(relancesDefault.heures, 14);
assert.equal(relancesDefault.coutTemps, 770);
assert.equal(relancesDefault.dealsPriorises, 1.1);
assert.equal(relancesDefault.opp, 9350);
assert.equal(relancesDefault.dealsNuire, 4.2);
assert.equal(relancesDefault.coutNuire, 8925);
assert.equal(relancesDefault.total, 19045);
assert.equal(relancesDefault.alertTone, "warn");
assert.equal(relancesDefault.totalTone, "warn");
assert.equal(relancesDefault.nuireTone, "warn");
assert.match(relancesDefault.alert, /Friction relances notable/);
assert.match(relancesDefault.recap, /Checklist rapide/);
assert.match(relancesDefault.recap, /Coût total indicatif/);
assert.match(relancesDefault.recap, /hypothèse 25 % panier/);
assert.equal(COUT_RELANCES_AVEUGLES_LABELS.devis, "Devis envoyés / mois");
assert.equal(COUT_RELANCES_AVEUGLES_LABELS.total, "Coût total indicatif mensuel");

const relancesEmpty = computeCoutRelancesAveugles({ ...COUT_RELANCES_AVEUGLES_DEFAULTS, devis: 0 });
assert.equal(relancesEmpty.aveugles, 0);
assert.equal(relancesEmpty.relancesMois, 0);
assert.equal(relancesEmpty.heures, 0);
assert.equal(relancesEmpty.opp, 0);
assert.equal(relancesEmpty.coutNuire, 0);
assert.equal(relancesEmpty.total, 0);
assert.equal(relancesEmpty.alertTone, "neutral");
assert.match(relancesEmpty.alert, /volume de devis/);

const relancesNoBasket = computeCoutRelancesAveugles({ ...COUT_RELANCES_AVEUGLES_DEFAULTS, panier: 0 });
assert.equal(relancesNoBasket.opp, null);
assert.equal(relancesNoBasket.coutNuire, null);
assert.equal(relancesNoBasket.oppLabel, "non calculé (panier = 0)");
assert.equal(relancesNoBasket.coutNuireLabel, "non calculé (panier = 0)");
assert.equal(relancesNoBasket.total, relancesNoBasket.coutTemps);
assert.equal(relancesNoBasket.nuireTone, "neutral");
assert.match(relancesNoBasket.recap, /Opportunités mal priorisées : n\/a/);
assert.match(relancesNoBasket.recap, /Impact timing \(hypothèse 25 % panier\) : n\/a/);

const relancesHigh = computeCoutRelancesAveugles({
  devis: 80,
  sansSignalPct: 90,
  relancesParDevis: 3,
  minutes: 20,
  taux: 70,
  nuirePct: 30,
  panier: 12000,
  ecartConvPts: 8,
});
assert.equal(relancesHigh.aveugles, 72);
assert.equal(relancesHigh.relancesMois, 216);
assert.equal(relancesHigh.heures, 72);
assert.equal(relancesHigh.coutTemps, 5040);
assert.equal(relancesHigh.dealsPriorises, 5.8);
assert.equal(relancesHigh.opp, 69600);
assert.equal(relancesHigh.dealsNuire, 21.6);
assert.equal(relancesHigh.coutNuire, 64800);
assert.equal(relancesHigh.total, 139440);
assert.equal(relancesHigh.alertTone, "bad");
assert.equal(relancesHigh.totalTone, "bad");
assert.equal(relancesHigh.nuireTone, "bad");
assert.match(relancesHigh.tip, /dernière consultation/);

const relancesLow = computeCoutRelancesAveugles({
  devis: 10,
  sansSignalPct: 10,
  relancesParDevis: 1,
  minutes: 6,
  taux: 50,
  nuirePct: 0,
  panier: 2000,
  ecartConvPts: 5,
});
assert.equal(relancesLow.aveugles, 1);
assert.equal(relancesLow.relancesMois, 1);
assert.equal(relancesLow.heures, 0.1);
assert.equal(relancesLow.coutTemps, 5);
assert.equal(relancesLow.dealsPriorises, 0.1);
assert.equal(relancesLow.opp, 200);
assert.equal(relancesLow.coutNuire, 0);
assert.equal(relancesLow.total, 205);
assert.equal(relancesLow.alertTone, "ok");
assert.equal(relancesLow.nuireTone, "ok");
assert.match(relancesLow.alert, /Friction relances contenue/);

const relancesClamp = computeCoutRelancesAveugles({
  devis: -5,
  sansSignalPct: 140,
  relancesParDevis: 80,
  minutes: 900,
  taux: 20000,
  nuirePct: 140,
  panier: -1,
  ecartConvPts: 80,
});
assert.equal(relancesClamp.devis, 0);
assert.equal(relancesClamp.sansSignalPct, 100);
assert.equal(relancesClamp.relancesParDevis, 50);
assert.equal(relancesClamp.minutes, 480);
assert.equal(relancesClamp.taux, 10000);
assert.equal(relancesClamp.nuirePct, 100);
assert.equal(relancesClamp.panier, 0);
assert.equal(relancesClamp.ecartConvPts, 50);
assert.equal(relancesClamp.opp, null);
assert.equal(relancesClamp.coutNuire, null);
assert.equal(relancesClamp.alertTone, "neutral");

const clarifClamp = computeCoutEmailsClarification({
  devis: -5,
  pctClarif: 140,
  mails: 900,
  minutes: 900,
  taux: 20000,
  pctPerdus: 140,
  panier: -1,
});
assert.equal(clarifClamp.devis, 0);
assert.equal(clarifClamp.pctClarif, 100);
assert.equal(clarifClamp.mails, 200);
assert.equal(clarifClamp.minutes, 240);
assert.equal(clarifClamp.taux, 10000);
assert.equal(clarifClamp.pctPerdus, 100);
assert.equal(clarifClamp.panier, 0);
assert.equal(clarifClamp.opp, null);
assert.equal(clarifClamp.alertTone, "neutral");

const mentionsNone = computeChecklistMentions([]);
assert.equal(CHECKLIST_MENTIONS_ITEMS.length, 20);
assert.equal(mentionsNone.done, 0);
assert.equal(mentionsNone.pct, 0);
assert.equal(mentionsNone.missing.length, 20);
assert.equal(mentionsNone.alertTone, "neutral");
assert.match(mentionsNone.alert, /template de devis/);
assert.match(mentionsNone.recap, /Items manquants/);
assert.match(mentionsNone.recap, /SIRET \/ SIREN affiché/);
assert.match(mentionsNone.recap, /pas une validation juridique/);
assert.match(mentionsNone.recap, /\/blog\/mentions-obligatoires-devis-france/);

const mentionsLow = computeChecklistMentions(["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9"]);
assert.equal(mentionsLow.done, 9);
assert.equal(mentionsLow.pct, 45);
assert.equal(mentionsLow.alertTone, "bad");
assert.match(mentionsLow.alert, /Template incomplet · 45 % \(11 manques\)/);

const mentionsMid = computeChecklistMentions(CHECKLIST_MENTIONS_ITEMS.slice(0, 10).map((item) => item.id));
assert.equal(mentionsMid.pct, 50);
assert.equal(mentionsMid.alertTone, "warn");
assert.match(mentionsMid.alert, /Base correcte/);

const mentionsHigh = computeChecklistMentions(CHECKLIST_MENTIONS_ITEMS.slice(0, 17).map((item) => item.id));
assert.equal(mentionsHigh.pct, 85);
assert.equal(mentionsHigh.alertTone, "warn");
assert.match(mentionsHigh.alert, /Presque complet · 85 %/);

const mentionsFull = computeChecklistMentions(CHECKLIST_MENTIONS_ITEMS.map((item) => item.id));
assert.equal(mentionsFull.pct, 100);
assert.equal(mentionsFull.done, 20);
assert.equal(mentionsFull.missing.length, 0);
assert.equal(mentionsFull.alertTone, "ok");
assert.match(mentionsFull.alert, /pas une validation juridique/);
assert.match(mentionsFull.recap, /Aucun item manquant/);
assert.doesNotMatch(mentionsFull.recap, /Items manquants/);

const sitemapEntries = sitemap();
for (const expected of [
  { path: "/blog/preremplir-devis-url-parametres", priority: 0.8, lastmod: "2026-09-22" },
  { path: "/blog/fiche-produit-b2b-devis-unifie", priority: 0.8, lastmod: "2026-09-22" },
  { path: "/outils/generateur-url-prefill-devis", priority: 0.7, lastmod: "2026-09-22" },
  { path: "/blog/recevoir-demandes-devis-wordpress-quotebuilder", priority: 0.8, lastmod: "2026-09-23" },
  { path: "/outils/estimateur-leads-formulaire-vs-funnel-wp", priority: 0.7, lastmod: "2026-09-23" },
  { path: "/blog/envoyer-devis-lien-securise-vs-pdf-email", priority: 0.8, lastmod: "2026-09-24" },
  { path: "/blog/mentions-obligatoires-devis-france", priority: 0.8, lastmod: "2026-09-24" },
  { path: "/outils/estimateur-cout-devis-pdf-seuls", priority: 0.7, lastmod: "2026-09-24" },
  { path: "/outils/checklist-mentions-devis-france", priority: 0.7, lastmod: "2026-09-24" },
  { path: "/secteurs/funnel-devis-pompe-chaleur-chauffage", priority: 0.8, lastmod: "2026-09-24" },
  { path: "/blog/pieces-jointes-plans-photos-devis-b2b", priority: 0.8, lastmod: "2026-09-25" },
  { path: "/blog/regles-suggestion-produits-funnel-devis-b2b", priority: 0.8, lastmod: "2026-10-05" },
  { path: "/outils/estimateur-valeur-produits-suggeres-devis", priority: 0.7, lastmod: "2026-10-05" },
  { path: "/secteurs/funnel-devis-paysagiste-amenagement-jardin", priority: 0.8, lastmod: "2026-10-05" },
  { path: "/blog/notes-internes-dossier-devis-equipe-b2b", priority: 0.8, lastmod: "2026-10-02" },
  { path: "/outils/estimateur-cout-contexte-hors-dossier-devis", priority: 0.7, lastmod: "2026-10-02" },
  { path: "/blog/transfert-brief-commercial-technique-devis-b2b", priority: 0.8, lastmod: "2026-10-02" },
  { path: "/outils/estimateur-cout-handoff-commercial-technique-devis", priority: 0.7, lastmod: "2026-10-02" },
  { path: "/secteurs/funnel-devis-metallerie-serrurerie", priority: 0.8, lastmod: "2026-10-02" },
  { path: "/blog/sources-demande-devis-b2b-funnel-api", priority: 0.8, lastmod: "2026-10-01" },
  { path: "/outils/estimateur-cout-double-saisie-devis", priority: 0.7, lastmod: "2026-10-01" },
  { path: "/blog/telephone-whatsapp-vers-brief-devis-b2b", priority: 0.8, lastmod: "2026-10-01" },
  { path: "/outils/estimateur-cout-demandes-orales-non-capturees", priority: 0.7, lastmod: "2026-10-01" },
  { path: "/secteurs/funnel-devis-electricite-tertiaire", priority: 0.8, lastmod: "2026-10-01" },
  { path: "/blog/statuts-pipeline-devis-b2b", priority: 0.8, lastmod: "2026-09-30" },
  { path: "/outils/estimateur-cout-pipeline-fantome-devis", priority: 0.7, lastmod: "2026-09-30" },
  { path: "/blog/visite-technique-avant-devis-b2b", priority: 0.8, lastmod: "2026-09-30" },
  { path: "/outils/estimateur-cout-visites-techniques-inutiles", priority: 0.7, lastmod: "2026-09-30" },
  { path: "/secteurs/funnel-devis-plomberie-sanitaire", priority: 0.8, lastmod: "2026-09-30" },
  { path: "/blog/tva-ht-ttc-devis-b2b-france", priority: 0.8, lastmod: "2026-09-29" },
  { path: "/outils/calculateur-tva-devis-ht-ttc", priority: 0.7, lastmod: "2026-09-29" },
  { path: "/blog/approbation-client-multi-decideurs-devis-b2b", priority: 0.8, lastmod: "2026-09-29" },
  { path: "/outils/estimateur-cout-attente-multi-decideurs-devis", priority: 0.7, lastmod: "2026-09-29" },
  { path: "/secteurs/funnel-devis-couverture-toiture", priority: 0.8, lastmod: "2026-09-29" },
  { path: "/blog/suivi-ouverture-lecture-devis-en-ligne-b2b", priority: 0.8, lastmod: "2026-09-28" },
  { path: "/outils/estimateur-cout-relances-aveugles-devis", priority: 0.7, lastmod: "2026-09-28" },
  { path: "/blog/validation-interne-avant-envoi-devis-b2b", priority: 0.8, lastmod: "2026-09-28" },
  { path: "/outils/estimateur-cout-devis-sans-validation", priority: 0.7, lastmod: "2026-09-28" },
  { path: "/secteurs/funnel-devis-isolation-thermique-ite", priority: 0.8, lastmod: "2026-09-28" },
  { path: "/blog/commentaires-annotations-devis-collaboratif-b2b", priority: 0.8, lastmod: "2026-09-25" },
  { path: "/outils/estimateur-cout-aller-retours-brief-photos", priority: 0.7, lastmod: "2026-09-25" },
  { path: "/outils/estimateur-cout-emails-clarification-devis", priority: 0.7, lastmod: "2026-09-25" },
  { path: "/secteurs/funnel-devis-photovoltaique-solaire", priority: 0.8, lastmod: "2026-09-25" },
]) {
  const entry = sitemapEntries.find((item) => item.url === `https://www.quotebuilder.co${expected.path}`);
  assert.ok(entry, `sitemap missing ${expected.path}`);
  assert.equal(entry?.priority, expected.priority);
  assert.equal(entry?.lastModified, expected.lastmod);
}
assert.ok(paths.includes("/outils/generateur-url-prefill-devis"));
assert.ok(paths.includes("/outils/estimateur-leads-formulaire-vs-funnel-wp"));
assert.ok(paths.includes("/outils/estimateur-cout-devis-pdf-seuls"));
assert.ok(paths.includes("/blog/recevoir-demandes-devis-wordpress-quotebuilder"));
assert.ok(paths.includes("/blog/envoyer-devis-lien-securise-vs-pdf-email"));
assert.ok(paths.includes("/blog/mentions-obligatoires-devis-france"));
assert.ok(paths.includes("/outils/checklist-mentions-devis-france"));
assert.ok(paths.includes("/secteurs/funnel-devis-pompe-chaleur-chauffage"));
assert.ok(paths.includes("/blog/pieces-jointes-plans-photos-devis-b2b"));
assert.ok(paths.includes("/outils/estimateur-cout-aller-retours-brief-photos"));
assert.ok(paths.includes("/blog/commentaires-annotations-devis-collaboratif-b2b"));
assert.ok(paths.includes("/outils/estimateur-cout-emails-clarification-devis"));
assert.ok(paths.includes("/secteurs/funnel-devis-photovoltaique-solaire"));
assert.ok(paths.includes("/blog/tva-ht-ttc-devis-b2b-france"));
assert.ok(paths.includes("/outils/calculateur-tva-devis-ht-ttc"));
assert.ok(paths.includes("/blog/approbation-client-multi-decideurs-devis-b2b"));
assert.ok(paths.includes("/outils/estimateur-cout-attente-multi-decideurs-devis"));
assert.ok(paths.includes("/secteurs/funnel-devis-couverture-toiture"));
assert.ok(paths.includes("/blog/sources-demande-devis-b2b-funnel-api"));
assert.ok(paths.includes("/outils/estimateur-cout-double-saisie-devis"));
assert.ok(paths.includes("/blog/telephone-whatsapp-vers-brief-devis-b2b"));
assert.ok(paths.includes("/outils/estimateur-cout-demandes-orales-non-capturees"));
assert.ok(paths.includes("/blog/notes-internes-dossier-devis-equipe-b2b"));
assert.ok(paths.includes("/outils/estimateur-cout-contexte-hors-dossier-devis"));
assert.ok(paths.includes("/blog/transfert-brief-commercial-technique-devis-b2b"));
assert.ok(paths.includes("/outils/estimateur-cout-handoff-commercial-technique-devis"));
assert.ok(paths.includes("/secteurs/funnel-devis-metallerie-serrurerie"));
assert.ok(paths.includes("/secteurs/funnel-devis-paysagiste-amenagement-jardin"));
assert.ok(paths.includes("/blog/regles-suggestion-produits-funnel-devis-b2b"));
assert.ok(paths.includes("/outils/estimateur-valeur-produits-suggeres-devis"));
assert.ok(paths.includes("/secteurs/funnel-devis-electricite-tertiaire"));
assert.ok(paths.includes("/blog/statuts-pipeline-devis-b2b"));
assert.ok(paths.includes("/outils/estimateur-cout-pipeline-fantome-devis"));
assert.ok(paths.includes("/blog/visite-technique-avant-devis-b2b"));
assert.ok(paths.includes("/outils/estimateur-cout-visites-techniques-inutiles"));
assert.ok(paths.includes("/secteurs/funnel-devis-plomberie-sanitaire"));
assert.ok(paths.includes("/blog/suivi-ouverture-lecture-devis-en-ligne-b2b"));
assert.ok(paths.includes("/outils/estimateur-cout-relances-aveugles-devis"));
assert.ok(paths.includes("/blog/validation-interne-avant-envoi-devis-b2b"));
assert.ok(paths.includes("/outils/estimateur-cout-devis-sans-validation"));
assert.ok(paths.includes("/secteurs/funnel-devis-isolation-thermique-ite"));

const acompteDefault = computeAcompteDevis({
  ht: 12000,
  tva: 20,
  mode: "pct",
  pct: 30,
  fixe: 4000,
  jalons: 3,
  delai: 5,
});
assert.equal(acompteDefault.ttc, 14400);
assert.equal(acompteDefault.acompte, 4320);
assert.equal(acompteDefault.reste, 10080);
assert.equal(acompteDefault.pctReel, 30);
assert.equal(acompteDefault.demarrage, "sous 5 j après encaissement");
assert.equal(acompteDefault.jalons.length, 3);
assert.equal(acompteDefault.jalons[0]?.label, "Jalon 1 · signature / commande (acompte)");
assert.equal(acompteDefault.jalons[0]?.amount, 4320);
assert.equal(acompteDefault.jalons[1]?.amount, 5040);
assert.equal(acompteDefault.jalons[2]?.label, "Jalon 3 · solde / réception");
assert.equal(acompteDefault.jalons[2]?.amount, 5040);
assert.match(acompteDefault.tip, /3 jalons/);
assert.match(acompteDefault.recap, /Reste dû/);

const acompteEmpty = computeAcompteDevis({
  ht: 0,
  tva: 20,
  mode: "pct",
  pct: 30,
  fixe: 4000,
  jalons: 3,
  delai: 5,
});
assert.equal(acompteEmpty.ttc, 0);
assert.match(acompteEmpty.tip, /montant HT/);

const acompteLow = computeAcompteDevis({
  ht: 10000,
  tva: 20,
  mode: "pct",
  pct: 10,
  fixe: 4000,
  jalons: 2,
  delai: 5,
});
assert.equal(acompteLow.ttc, 12000);
assert.equal(acompteLow.acompte, 1200);
assert.match(acompteLow.tip, /Sous 20 %/);

const acompteHigh = computeAcompteDevis({
  ht: 10000,
  tva: 20,
  mode: "pct",
  pct: 60,
  fixe: 4000,
  jalons: 2,
  delai: 0,
});
assert.equal(acompteHigh.demarrage, "dès encaissement (J0)");
assert.match(acompteHigh.tip, /Acompte élevé/);
assert.match(acompteHigh.recap, /dès encaissement/);

const acompteFixe = computeAcompteDevis({
  ht: 12000,
  tva: 20,
  mode: "fixe",
  pct: 30,
  fixe: 4000,
  jalons: 2,
  delai: 5,
});
assert.equal(acompteFixe.acompte, 4000);
assert.equal(acompteFixe.reste, 10400);
assert.ok(Math.abs(acompteFixe.pctReel - (4000 / 14400) * 100) < 1e-9);
assert.equal(acompteFixe.jalons[1]?.label, "Jalon 2 · solde / réception");
assert.match(acompteFixe.tip, /bloquez le lancement atelier/);

const acompteCap = computeAcompteDevis({
  ht: 1000,
  tva: 20,
  mode: "fixe",
  pct: 30,
  fixe: 5000,
  jalons: 1,
  delai: 5,
});
assert.equal(acompteCap.ttc, 1200);
assert.equal(acompteCap.acompte, 1200);
assert.equal(acompteCap.reste, 0);
assert.equal(acompteCap.jalons.length, 1);

const acompteCents = computeAcompteDevis({
  ht: 100,
  tva: 0,
  mode: "pct",
  pct: 33.33,
  fixe: 0,
  jalons: 3,
  delai: 5,
});
assert.equal(acompteCents.ttc, 100);
assert.equal(acompteCents.acompte, 33.33);
assert.equal(acompteCents.jalons[1]?.amount, 33.34);
assert.equal(acompteCents.jalons[2]?.amount, 33.33);

const seuilDefault = computeSeuilRemiseMarge({
  prix: 10000,
  mode: "cout",
  cout: 7200,
  margeActuelle: 28,
  tva: 20,
  plancher: 22,
  remise: 12,
});
assert.equal(seuilDefault.margeEuro, 2800);
assert.ok(Math.abs(seuilDefault.margePct - 28) < 1e-9);
assert.equal(seuilDefault.prixPlancher, 9230.77);
assert.equal(seuilDefault.remiseMaxEuro, 769.23);
assert.ok(Math.abs(seuilDefault.remiseMaxPct - 7.6923) < 0.001);
assert.equal(seuilDefault.prixApresRemise, 8800);
assert.equal(seuilDefault.margeApresEuro, 1600);
assert.ok(Math.abs(seuilDefault.margeApresPct - (1600 / 8800) * 100) < 1e-9);
assert.equal(seuilDefault.prixPlancherTtc, 11076.92);
assert.equal(seuilDefault.alert, "bad");
assert.match(seuilDefault.alertText, /passe sous le plancher/);
assert.match(seuilDefault.recap, /Checklist rapide/);
assert.doesNotMatch(seuilDefault.recap, /\u2014/);
assert.doesNotMatch(seuilDefault.tip, /\u2014/);

const seuilFromMarge = computeSeuilRemiseMarge({
  prix: 10000,
  mode: "marge",
  cout: 0,
  margeActuelle: 28,
  tva: 20,
  plancher: 22,
  remise: 12,
});
assert.equal(seuilFromMarge.cout, 7200);
assert.equal(seuilFromMarge.prixPlancher, seuilDefault.prixPlancher);
assert.equal(seuilFromMarge.alert, "bad");

const seuilEmpty = computeSeuilRemiseMarge({
  prix: 0,
  mode: "cout",
  cout: 7200,
  margeActuelle: 28,
  tva: 20,
  plancher: 22,
  remise: 12,
});
assert.equal(seuilEmpty.alert, "neutral");
assert.match(seuilEmpty.alertText, /prix catalogue HT/);

const seuilCost = computeSeuilRemiseMarge({
  prix: 7000,
  mode: "cout",
  cout: 7200,
  margeActuelle: 28,
  tva: 20,
  plancher: 22,
  remise: 0,
});
assert.equal(seuilCost.alert, "bad");
assert.match(seuilCost.alertText, /dépasse déjà le prix catalogue/);

const seuilUnderFloor = computeSeuilRemiseMarge({
  prix: 10000,
  mode: "cout",
  cout: 8500,
  margeActuelle: 28,
  tva: 20,
  plancher: 22,
  remise: 0,
});
assert.equal(seuilUnderFloor.alert, "bad");
assert.match(seuilUnderFloor.alertText, /Même sans remise/);

const seuilOk = computeSeuilRemiseMarge({
  prix: 10000,
  mode: "cout",
  cout: 7200,
  margeActuelle: 28,
  tva: 20,
  plancher: 22,
  remise: 5,
});
assert.equal(seuilOk.alert, "ok");
assert.equal(seuilOk.prixApresRemise, 9500);
assert.equal(seuilOk.margeApresEuro, 2300);
assert.match(seuilOk.alertText, /compatible avec le plancher/);

const seuilNoDiscount = computeSeuilRemiseMarge({
  prix: 10000,
  mode: "cout",
  cout: 7200,
  margeActuelle: 28,
  tva: 20,
  plancher: 22,
  remise: 0,
});
assert.equal(seuilNoDiscount.alert, "ok");
assert.match(seuilNoDiscount.alertText, /aucune remise saisie/);

const seuilZeroCost = computeSeuilRemiseMarge({
  prix: 10000,
  mode: "cout",
  cout: 0,
  margeActuelle: 0,
  tva: 20,
  plancher: 22,
  remise: 0,
});
assert.equal(seuilZeroCost.remiseMaxPct, 78);
assert.equal(seuilZeroCost.remiseMaxEuro, 7800);
assert.equal(seuilZeroCost.prixPlancher, 2200);
assert.equal(seuilZeroCost.alert, "ok");
assert.equal(
  Math.round((acompteCents.jalons.reduce((sum, part) => sum + part.amount, 0) + Number.EPSILON) * 100) / 100,
  100,
);

const catalogGain = computeGainTempsCatalogue({
  nbDevis: 40,
  minManuel: 45,
  pctBiblio: 70,
  minGagnees: 18,
  taux: 55,
});
assert.equal(catalogGain.minMois, 720);
assert.equal(catalogGain.hMois, 12);
assert.equal(catalogGain.euroMois, 660);
assert.equal(catalogGain.hAn, 144);
assert.equal(catalogGain.euroAn, 7920);
assert.equal(catalogGain.minApres, 27);
assert.equal(catalogGain.tone, "gain");
assert.match(catalogGain.alert, /12 h \/ mois/);
assert.match(catalogGain.recap, /Devis \/ mois : 40/);
assert.match(catalogGain.recap, /5 à 10 kits/);

const catalogGainCapped = computeGainTempsCatalogue({
  nbDevis: 10,
  minManuel: 20,
  pctBiblio: 80,
  minGagnees: 40,
  taux: 50,
});
assert.equal(catalogGainCapped.minGagnees, 20);
assert.equal(catalogGainCapped.minApres, 0);
assert.equal(catalogGainCapped.minMois, 200);

const catalogGainEmpty = computeGainTempsCatalogue({
  nbDevis: 0,
  minManuel: 45,
  pctBiblio: 70,
  minGagnees: 18,
  taux: 55,
});
assert.equal(catalogGainEmpty.tone, "neutral");
assert.match(catalogGainEmpty.alert, /volume et un temps/);

const catalogGainZero = computeGainTempsCatalogue({
  nbDevis: 12,
  minManuel: 30,
  pctBiblio: 0,
  minGagnees: 0,
  taux: 40,
});
assert.match(catalogGainZero.alert, /Aucune minute gagnée/);
assert.match(catalogGainZero.tip, /5 kits/);

const conversionFloor = computeConversionRate({
  quotesSent: 10,
  basket: 1000,
  currentRate: 20,
  targetRate: 10,
});
assert.equal(conversionFloor.targetRate, 20);
assert.equal(conversionFloor.monthlyGain, 0);

const emptyBrief = computeBriefScore({
  products: null,
  constraints: null,
  budget: null,
  urgency: null,
  fit: null,
});
assert.equal(emptyBrief.total, 0);
assert.equal(emptyBrief.band, "pending");

const hotBrief = computeBriefScore({
  products: 25,
  constraints: 20,
  budget: 20,
  urgency: 20,
  fit: 15,
});
assert.equal(hotBrief.total, 100);
assert.equal(hotBrief.band, "hot");

const warmBrief = computeBriefScore({
  products: 18,
  constraints: 14,
  budget: 14,
  urgency: 8,
  fit: 6,
});
assert.equal(warmBrief.total, 60);
assert.equal(warmBrief.band, "warm");

const parkingBrief = computeBriefScore({
  products: 0,
  constraints: 0,
  budget: 0,
  urgency: 0,
  fit: 0,
});
assert.equal(parkingBrief.total, 0);
assert.equal(parkingBrief.band, "parking");

const llmsPaths = [
  "/blog/revue-pipeline-devis-b2b",
  "/blog/versions-historique-devis-b2b",
  "/blog/assignation-sla-demande-devis-equipe",
  "/blog/qualifier-demande-devis-avant-chiffrage",
  "/blog/creer-devis-avec-claude-mcp",
  "/blog/visite-guidee-parcours-devis-b2b",
  "/blog/relancer-devis-hot-depuis-dossier",
  "/blog/delai-reponse-demande-devis-b2b",
  "/blog/template-boutique-en-ligne-menuiserie-devis",
  "/blog/devis-en-ligne-integre-boutique",
  "/blog/score-demande-devis-b2b",
  "/blog/configurateur-devis-vs-excel-pdf",
  "/outils/score-brief-devis",
  "/outils/simulateur-taux-conversion-devis",
  "/outils/calculateur-capacite-equipe-devis",
  "/outils/estimateur-temps-chiffrage-devis",
  "/outils/simulateur-impact-remise-devis",
  "/outils/simulateur-roi-logiciel-devis",
  "/outils/simulateur-taux-acceptation-devis",
  "/secteurs/funnel-devis-menuiserie-sur-mesure",
  "/secteurs/funnel-devis-location-evenementiel",
  "/secteurs/funnel-devis-agencement-bureau",
  "/secteurs/funnel-devis-stores-fermetures",
  "/secteurs/funnel-devis-cuisine-equipee",
  "/blog/signature-acceptation-devis-en-ligne-b2b",
  "/blog/centraliser-demandes-devis-multi-canaux",
  "/blog/options-variantes-alternatives-devis-b2b",
  "/outils/estimateur-cout-brief-incomplet",
  "/blog/validite-expiration-devis-b2b",
  "/secteurs/funnel-devis-cloture-portail",
  "/outils/simulateur-cout-devis-expires",
  "/blog/acomptes-echeances-devis-b2b",
  "/outils/calculateur-acompte-devis",
  "/blog/bibliotheque-lignes-kits-devis-b2b",
  "/secteurs/funnel-devis-pergola-terrasse",
  "/outils/estimateur-gain-temps-catalogue-devis",
  "/blog/remise-commerciale-marge-devis-b2b",
  "/outils/calculateur-seuil-remise-marge",
  "/blog/preremplir-devis-url-parametres",
  "/blog/fiche-produit-b2b-devis-unifie",
  "/outils/generateur-url-prefill-devis",
  "/blog/recevoir-demandes-devis-wordpress-quotebuilder",
  "/outils/estimateur-leads-formulaire-vs-funnel-wp",
  "/blog/envoyer-devis-lien-securise-vs-pdf-email",
  "/outils/estimateur-cout-devis-pdf-seuls",
  "/blog/mentions-obligatoires-devis-france",
  "/outils/checklist-mentions-devis-france",
  "/secteurs/funnel-devis-pompe-chaleur-chauffage",
  "/blog/pieces-jointes-plans-photos-devis-b2b",
  "/blog/commentaires-annotations-devis-collaboratif-b2b",
  "/outils/estimateur-cout-aller-retours-brief-photos",
  "/outils/estimateur-cout-emails-clarification-devis",
  "/secteurs/funnel-devis-photovoltaique-solaire",
  "/blog/validation-interne-avant-envoi-devis-b2b",
  "/outils/estimateur-cout-devis-sans-validation",
  "/blog/suivi-ouverture-lecture-devis-en-ligne-b2b",
  "/outils/estimateur-cout-relances-aveugles-devis",
  "/secteurs/funnel-devis-isolation-thermique-ite",
  "/blog/approbation-client-multi-decideurs-devis-b2b",
  "/outils/estimateur-cout-attente-multi-decideurs-devis",
  "/blog/tva-ht-ttc-devis-b2b-france",
  "/outils/calculateur-tva-devis-ht-ttc",
  "/secteurs/funnel-devis-couverture-toiture",
  "/blog/statuts-pipeline-devis-b2b",
  "/outils/estimateur-cout-pipeline-fantome-devis",
  "/blog/visite-technique-avant-devis-b2b",
  "/outils/estimateur-cout-visites-techniques-inutiles",
  "/secteurs/funnel-devis-plomberie-sanitaire",
  "/blog/sources-demande-devis-b2b-funnel-api",
  "/outils/estimateur-cout-double-saisie-devis",
  "/blog/telephone-whatsapp-vers-brief-devis-b2b",
  "/secteurs/funnel-devis-electricite-tertiaire",
  "/outils/estimateur-cout-demandes-orales-non-capturees",
  "/blog/notes-internes-dossier-devis-equipe-b2b",
  "/blog/transfert-brief-commercial-technique-devis-b2b",
  "/secteurs/funnel-devis-metallerie-serrurerie",
  "/outils/estimateur-cout-handoff-commercial-technique-devis",
  "/outils/estimateur-cout-contexte-hors-dossier-devis",
  "/blog/regles-suggestion-produits-funnel-devis-b2b",
  "/secteurs/funnel-devis-paysagiste-amenagement-jardin",
  "/outils/estimateur-valeur-produits-suggeres-devis",
];
for (const path of llmsPaths) {
  assert.match(llms, new RegExp(`https://www\\.quotebuilder\\.co${path.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}`));
}

function isTableLine(line: string) {
  return /^\s*\|.+\|\s*$/.test(line);
}
function splitTableRow(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}
function isTableSeparator(line: string) {
  if (!isTableLine(line)) return false;
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}
assert.ok(isTableSeparator("|--------|--------------------|"), "two-column separator should parse");
assert.ok(isTableSeparator("|-------|-------|-------------|"), "three-column separator should parse");
const scoreMd = readFileSync(join(blogDir, "score-demande-devis-b2b.md"), "utf8");
const scoreLines = scoreMd.split("\n");
let tableBlocks = 0;
let i = 0;
let steps = 0;
while (i < scoreLines.length) {
  steps += 1;
  assert.ok(steps < scoreLines.length + 5, "markdown walk must terminate");
  const line = scoreLines[i] ?? "";
  if (isTableLine(line) && isTableSeparator(scoreLines[i + 1] ?? "")) {
    tableBlocks += 1;
    i += 2;
    while (i < scoreLines.length && isTableLine(scoreLines[i] ?? "") && !isTableSeparator(scoreLines[i] ?? "")) {
      i += 1;
    }
    continue;
  }
  i += 1;
}
assert.ok(tableBlocks >= 5, `expected scoring tables, got ${tableBlocks}`);

const scoreHeadings = extractMarkdownH2s(scoreMd);
assert.ok(scoreHeadings.length >= 8, "score article should expose H2s for the TOC");
assert.ok(scoreHeadings.every((heading) => heading.id && !heading.id.includes(" ")));
assert.ok(scoreHeadings.some((heading) => heading.text === "FAQ"));
assert.equal(
  scoreHeadings.filter((heading) => heading.id === "pourquoi-le-scoring-devis-n-est-pas-du-lead-scoring-marketing").length,
  0,
);
assert.ok(
  scoreHeadings.some((heading) => heading.id === "pourquoi-le-scoring-devis-nest-pas-du-lead-scoring-marketing"),
);

assert.equal(calloutKind("Note QuoteBuilder. On évite les slogans."), "tip");
assert.equal(calloutKind("Astuce : une fourchette indicative."), "tip");
assert.equal(calloutKind("Attention au wizard trop long."), "warning");
assert.equal(calloutKind("Le formulaire livre un message."), "quote");
assert.equal(calloutKind("[!TIP] Une fourchette indicative dans le parcours."), "tip");
assert.equal(calloutKind("[!WARNING] Le wizard trop long fatigue."), "warning");
assert.equal(calloutKind("[!NOTE] On reste factuel."), "tip");
assert.equal(paragraphCalloutKind("Astuce : une fourchette indicative dans le parcours."), "tip");
assert.equal(paragraphCalloutKind("Le comportement post-envoi compte."), null);
assert.equal(calloutLabel("tip"), "Astuce");
assert.equal(calloutLabel("warning"), "Attention");
assert.equal(stripCalloutPrefix("Astuce : une fourchette indicative."), "une fourchette indicative.");
assert.equal(stripCalloutPrefix("[!WARNING] Le wizard trop long fatigue."), "Le wizard trop long fatigue.");
assert.equal(
  stripCalloutPrefix("Note QuoteBuilder. On évite les slogans."),
  "Note QuoteBuilder. On évite les slogans.",
);

const walkthroughImages = [
  "02-accueil.png",
  "03-devis.png",
  "04-devis-detail.png",
  "05-automations.png",
  "06-produits.png",
  "07-funnels.png",
  "08-integrations.png",
  "09-public-funnel.png",
  "10-public-boutique.png",
];
const walkthroughDir = join(process.cwd(), "public/images/blog/visite-guidee-parcours-devis-b2b");
for (const name of walkthroughImages) {
  const file = join(walkthroughDir, name);
  assert.ok(existsSync(file), `missing blog image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}
{
  const uniqueNames = [
    "03-devis.png",
    "04-devis-detail.png",
    "05-automations.png",
    "06-produits.png",
    "08-integrations.png",
    "09-public-funnel.png",
    "10-public-boutique.png",
  ];
  const hashes = uniqueNames.map((name) => readFileSync(join(walkthroughDir, name)));
  const keys = hashes.map((buf) => buf.toString("binary"));
  assert.equal(new Set(keys).size, uniqueNames.length, "demo walkthrough screenshots must be unique files");
}

const relanceImages = [
  "02-accueil.png",
  "03-devis.png",
  "04-devis-detail.png",
  "05-automations.png",
  "09-public-funnel.png",
];
const relanceDir = join(process.cwd(), "public/images/blog/relancer-devis-hot-depuis-dossier");
for (const name of relanceImages) {
  const file = join(relanceDir, name);
  assert.ok(existsSync(file), `missing blog image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

const delaiImages = ["02-accueil.png", "03-devis.png", "04-devis-detail.png", "05-automations.png"];
const delaiDir = join(process.cwd(), "public/images/blog/delai-reponse-demande-devis-b2b");
for (const name of delaiImages) {
  const file = join(delaiDir, name);
  assert.ok(existsSync(file), `missing blog image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

const templateShopImages = [
  "menuiserie-home.png",
  "menuiserie-catalog.png",
  "skin-home.png",
  "skin-cta.png",
  "skin-catalog.png",
  "stock-home.png",
  "stock-catalog.png",
  "catalogue-vendeur.png",
  "integrations.png",
];
const templateShopDir = join(process.cwd(), "public/images/blog/template-boutique-secteur-devis");
for (const name of templateShopImages) {
  const file = join(templateShopDir, name);
  assert.ok(existsSync(file), `missing blog image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

const unifyShopImages = [
  "unify-shop-home.png",
  "unify-add-or-catalog.png",
  "unify-devis-skincare.png",
  "unify-devis-menuiserie.png",
  "unify-devis-stock.png",
];
const unifyShopDir = join(process.cwd(), "public/images/blog/devis-en-ligne-integre-boutique");
for (const name of unifyShopImages) {
  const file = join(unifyShopDir, name);
  assert.ok(existsSync(file), `missing blog image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

const mcpImages = [
  "02-accueil.png",
  "03-devis.png",
  "04-devis-detail.png",
  "05-automations.png",
  "08-integrations.png",
];
const mcpDir = join(process.cwd(), "public/images/blog/creer-devis-avec-claude-mcp");
for (const name of mcpImages) {
  const file = join(mcpDir, name);
  assert.ok(existsSync(file), `missing blog image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

const eventImages = ["03-devis.png", "07-funnels.png", "09-public-funnel.png"];
const eventDir = join(process.cwd(), "public/images/secteurs/funnel-devis-location-evenementiel");
for (const name of eventImages) {
  const file = join(eventDir, name);
  assert.ok(existsSync(file), `missing secteur image ${name}`);
  assert.ok(statSync(file).size > 10_000, `${name} is too small to be a real screenshot`);
}

assert.equal(BLOG_IMAGE_DIR, "/images/blog");
assert.equal(normalizeCoverPath("visite-guidee-parcours-devis-b2b.jpg"), "/images/blog/visite-guidee-parcours-devis-b2b.jpg");
assert.equal(normalizeCoverPath("/images/blog/score-demande-devis-b2b.webp"), "/images/blog/score-demande-devis-b2b.webp");
const upcomingCovers = coverCandidatesForSlug("visite-guidee-parcours-devis-b2b");
assert.ok(upcomingCovers.includes("/images/blog/visite-guidee-parcours-devis-b2b.webp"));
assert.ok(upcomingCovers.includes("/images/blog/visite-guidee-parcours-devis-b2b.jpg"));
assert.equal(resolveCoverForPost({ slug: "visite-guidee-parcours-devis-b2b" }), undefined);
assert.equal(BLOG_DEMO_SHOTS.devisDetail, "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png");
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "score-demande-devis-b2b")?.cover,
  "/images/blog/score-demande-devis-b2b/04-devis-detail.png",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "configurateur-devis-vs-excel-pdf")?.cover,
  "/images/blog/configurateur-devis-vs-excel-pdf/09-public-funnel.png",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "pourquoi-les-devis-meurent-sans-relance")?.cover,
  "/images/blog/pourquoi-les-devis-meurent-sans-relance/05-automations.png",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "formulaire-contact-vs-funnel-devis-b2b")?.cover,
  "/images/blog/formulaire-contact-vs-funnel-devis-b2b/09-public-funnel.png",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "installer-widget-devis-wordpress-javascript")?.cover,
  "/images/blog/installer-widget-devis-wordpress-javascript/08-integrations.png",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "sync-catalogue-woocommerce-shopify-parcours-devis")?.cover,
  "/images/blog/sync-catalogue-woocommerce-shopify-parcours-devis/06-produits.png",
);
for (const post of BLOG_POSTS) {
  assert.ok(post.cover, `${post.slug} missing cover`);
  assert.equal(resolveCoverForPost(post), normalizeCoverPath(post.cover!), `${post.slug} cover file missing`);
}
{
  const fixture = join(process.cwd(), "public/images/blog/visite-guidee-parcours-devis-b2b.webp");
  writeFileSync(fixture, "cover");
  try {
    assert.equal(
      resolveCoverForPost({ slug: "visite-guidee-parcours-devis-b2b" }),
      "/images/blog/visite-guidee-parcours-devis-b2b.webp",
    );
  } finally {
    unlinkSync(fixture);
  }
}

const articleSource = readFileSync(new URL("../../../src/components/marketing/marketing-article.tsx", import.meta.url), "utf8");
assert.match(articleSource, /bg-mk-surface/);
assert.match(articleSource, /BlogCover/);
assert.match(articleSource, /max-w-7xl/);
assert.doesNotMatch(articleSource, /<header className="max-w-/);
assert.match(articleSource, /max-w-\[45rem\]/);
assert.doesNotMatch(articleSource, /#F6F0E8/);
assert.doesNotMatch(
  readFileSync(new URL("../../../src/components/marketing/blog-cover.tsx", import.meta.url), "utf8"),
  /SCORING/,
);
assert.match(readFileSync(new URL("../../../src/lib/marketing/markdown.tsx", import.meta.url), "utf8"), /bg-mk-accent-soft/);

const figure = parseImageLine("![Grille scorecard 0-100](figure:score-grid)");
assert.equal(figure?.src, "figure:score-grid");
assert.match(scoreMd, /figure:score-grid/);
const funnelMd = readFileSync(join(blogDir, "formulaire-contact-vs-funnel-devis-b2b.md"), "utf8");
assert.match(funnelMd, /figure:funnel-vs-form/);
const qualifyMd = readFileSync(join(blogDir, "qualifier-demande-devis-avant-chiffrage.md"), "utf8");
assert.match(qualifyMd, /figure:qualify-axes/);
assert.match(qualifyMd, /figure:qualify-before/);
const assignMd = readFileSync(join(blogDir, "assignation-sla-demande-devis-equipe.md"), "utf8");
assert.match(assignMd, /figure:assign-flow/);
assert.match(assignMd, /figure:assign-playbook/);
assert.match(assignMd, /figure:assign-dashboard/);
assert.equal(parseImageLine("![Schéma : file d’entrée, score, owner, SLA](figure:assign-flow)")?.src, "figure:assign-flow");
const versionsMd = readFileSync(join(blogDir, "versions-historique-devis-b2b.md"), "utf8");
assert.match(versionsMd, /figure:versions-flow/);
assert.match(versionsMd, /figure:versions-timeline/);
assert.match(versionsMd, /figure:versions-checklist/);
assert.equal(
  parseImageLine("![Schéma : dossier, versions v1 v2 v3, envoi, historique](figure:versions-flow)")?.src,
  "figure:versions-flow",
);
const centralMd = readFileSync(join(blogDir, "centraliser-demandes-devis-multi-canaux.md"), "utf8");
assert.match(centralMd, /figure:multi-channel-pipeline/);
assert.doesNotMatch(centralMd, /img-1\.png/);
assert.equal(
  parseImageLine("![Schéma : canaux multiples vers un pipeline dossier unique](figure:multi-channel-pipeline)")?.src,
  "figure:multi-channel-pipeline",
);

const globals = readFileSync(new URL("../../../src/app/globals.css", import.meta.url), "utf8");
assert.match(globals, /--color-mk-bg:\s*#f7f8fa/);
assert.match(globals, /--color-mk-accent:\s*#e85d04/);
assert.doesNotMatch(globals, /#F6F0E8/);
assert.ok(TAG_COVER.scoring.accent === "#E85D04");

const marketingRoots = [
  join(process.cwd(), "src/components/marketing"),
  join(process.cwd(), "src/app/(marketing)"),
  join(process.cwd(), "src/app/blog"),
];
function walkTsx(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walkTsx(full);
    return entry.name.endsWith(".tsx") || entry.name.endsWith(".ts") ? [full] : [];
  });
}
for (const root of marketingRoots) {
  for (const file of walkTsx(root)) {
    const body = readFileSync(file, "utf8");
    assert.doesNotMatch(body, /#F6F0E8/, `${file} still uses the cream wash`);
    assert.doesNotMatch(body, EM_DASH, `${file} still contains an em dash`);
  }
}
assert.equal(CREAM_HEX, "#F6F0E8");

const tvaHt = computeTvaDevisHtTtc({ mode: "ht", montant: 10000, ratePct: 20, lines: [] });
assert.equal(tvaHt.ht, 10000);
assert.equal(tvaHt.tva, 2000);
assert.equal(tvaHt.ttc, 12000);
assert.equal(tvaHt.alertTone, "ok");
assert.match(tvaHt.alert, /HT → TTC à 20 %/);
assert.equal(tvaHt.showBreakdown, false);

const tvaFromTtc = computeTvaDevisHtTtc({ mode: "ttc", montant: 12000, ratePct: 20, lines: [] });
assert.equal(tvaFromTtc.ttc, 12000);
assert.equal(tvaFromTtc.ht, 10000);
assert.equal(tvaFromTtc.tva, 2000);
assert.match(tvaFromTtc.alert, /TTC → HT à 20 %/);

const tvaReduced = computeTvaDevisHtTtc({ mode: "ht", montant: 1000, ratePct: 5.5, lines: [] });
assert.equal(tvaReduced.tva, 55);
assert.equal(tvaReduced.ttc, 1055);

const tvaCustom = computeTvaDevisHtTtc({
  mode: "ht",
  montant: 10000,
  ratePct: resolveTvaRatePct("custom", 8.5),
  lines: [],
});
assert.equal(tvaCustom.tva, 850);
assert.equal(tvaCustom.ttc, 10850);
assert.equal(resolveTvaRatePct("custom", 150), 100);

const tvaZero = computeTvaDevisHtTtc({ mode: "ttc", montant: 1200, ratePct: 0, lines: [] });
assert.equal(tvaZero.ht, 1200);
assert.equal(tvaZero.tva, 0);
assert.equal(tvaZero.ttc, 1200);
assert.equal(tvaZero.alertTone, "warn");

const tvaEmpty = computeTvaDevisHtTtc({ mode: "ht", montant: 0, ratePct: 20, lines: [] });
assert.equal(tvaEmpty.ht, 0);
assert.equal(tvaEmpty.alertTone, "neutral");
assert.match(tvaEmpty.alert, /Indiquez un montant/);

const tvaMulti = computeTvaDevisHtTtc({
  mode: "lines",
  montant: 0,
  ratePct: 20,
  lines: [
    { ht: 4000, ratePct: 20 },
    { ht: 3000, ratePct: 10 },
    { ht: 0, ratePct: 20 },
  ],
});
assert.equal(tvaMulti.ht, 7000);
assert.equal(tvaMulti.tva, 1100);
assert.equal(tvaMulti.ttc, 8100);
assert.equal(tvaMulti.alertTone, "warn");
assert.equal(tvaMulti.lineTtc[0], 4800);
assert.equal(tvaMulti.lineTtc[1], 3300);
assert.equal(tvaMulti.lineTtc[2], null);
assert.deepEqual(
  tvaMulti.breakdown.map((row) => [row.ratePct, row.tva]),
  [
    [20, 800],
    [10, 300],
  ],
);
assert.equal(tvaMulti.showBreakdown, true);
assert.match(tvaMulti.alert, /Plusieurs taux/);
assert.match(tvaMulti.recap, /pas un conseil fiscal/);

const tvaSameRate = computeTvaDevisHtTtc({
  mode: "lines",
  montant: 0,
  ratePct: 20,
  lines: [
    { ht: 1000, ratePct: 20 },
    { ht: 0, ratePct: 10 },
  ],
});
assert.equal(tvaSameRate.ht, 1000);
assert.equal(tvaSameRate.tva, 200);
assert.equal(tvaSameRate.ttc, 1200);
assert.equal(tvaSameRate.alertTone, "ok");
assert.equal(tvaSameRate.showBreakdown, true);

for (const [path, lastmod] of [
  ["/blog/regles-suggestion-produits-funnel-devis-b2b", "2026-10-05"],
  ["/outils/estimateur-valeur-produits-suggeres-devis", "2026-10-05"],
  ["/secteurs/funnel-devis-paysagiste-amenagement-jardin", "2026-10-05"],
  ["/blog/notes-internes-dossier-devis-equipe-b2b", "2026-10-02"],
  ["/outils/estimateur-cout-contexte-hors-dossier-devis", "2026-10-02"],
  ["/blog/transfert-brief-commercial-technique-devis-b2b", "2026-10-02"],
  ["/outils/estimateur-cout-handoff-commercial-technique-devis", "2026-10-02"],
  ["/secteurs/funnel-devis-metallerie-serrurerie", "2026-10-02"],
  ["/blog/sources-demande-devis-b2b-funnel-api", "2026-10-01"],
  ["/outils/estimateur-cout-double-saisie-devis", "2026-10-01"],
  ["/blog/telephone-whatsapp-vers-brief-devis-b2b", "2026-10-01"],
  ["/outils/estimateur-cout-demandes-orales-non-capturees", "2026-10-01"],
  ["/secteurs/funnel-devis-electricite-tertiaire", "2026-10-01"],
  ["/blog/statuts-pipeline-devis-b2b", "2026-09-30"],
  ["/outils/estimateur-cout-pipeline-fantome-devis", "2026-09-30"],
  ["/blog/visite-technique-avant-devis-b2b", "2026-09-30"],
  ["/outils/estimateur-cout-visites-techniques-inutiles", "2026-09-30"],
  ["/secteurs/funnel-devis-plomberie-sanitaire", "2026-09-30"],
  ["/blog/tva-ht-ttc-devis-b2b-france", "2026-09-29"],
  ["/outils/calculateur-tva-devis-ht-ttc", "2026-09-29"],
  ["/blog/approbation-client-multi-decideurs-devis-b2b", "2026-09-29"],
  ["/outils/estimateur-cout-attente-multi-decideurs-devis", "2026-09-29"],
  ["/secteurs/funnel-devis-couverture-toiture", "2026-09-29"],
  ["/blog/suivi-ouverture-lecture-devis-en-ligne-b2b", "2026-09-28"],
  ["/outils/estimateur-cout-relances-aveugles-devis", "2026-09-28"],
  ["/blog/validation-interne-avant-envoi-devis-b2b", "2026-09-28"],
  ["/outils/estimateur-cout-devis-sans-validation", "2026-09-28"],
  ["/secteurs/funnel-devis-isolation-thermique-ite", "2026-09-28"],
  ["/blog/pieces-jointes-plans-photos-devis-b2b", "2026-09-25"],
  ["/blog/commentaires-annotations-devis-collaboratif-b2b", "2026-09-25"],
  ["/outils/estimateur-cout-aller-retours-brief-photos", "2026-09-25"],
  ["/outils/estimateur-cout-emails-clarification-devis", "2026-09-25"],
  ["/secteurs/funnel-devis-photovoltaique-solaire", "2026-09-25"],
  ["/blog/envoyer-devis-lien-securise-vs-pdf-email", "2026-09-24"],
  ["/blog/mentions-obligatoires-devis-france", "2026-09-24"],
  ["/outils/estimateur-cout-devis-pdf-seuls", "2026-09-24"],
  ["/outils/checklist-mentions-devis-france", "2026-09-24"],
  ["/secteurs/funnel-devis-pompe-chaleur-chauffage", "2026-09-24"],
  ["/blog/recevoir-demandes-devis-wordpress-quotebuilder", "2026-09-23"],
  ["/outils/estimateur-leads-formulaire-vs-funnel-wp", "2026-09-23"],
  ["/blog/bibliotheque-lignes-kits-devis-b2b", "2026-09-23"],
  ["/secteurs/funnel-devis-pergola-terrasse", "2026-09-23"],
  ["/outils/estimateur-gain-temps-catalogue-devis", "2026-09-23"],
  ["/blog/remise-commerciale-marge-devis-b2b", "2026-09-22"],
  ["/outils/calculateur-seuil-remise-marge", "2026-09-22"],
  ["/blog/preremplir-devis-url-parametres", "2026-09-22"],
  ["/blog/fiche-produit-b2b-devis-unifie", "2026-09-22"],
  ["/outils/generateur-url-prefill-devis", "2026-09-22"],
] as const) {
  const entry = sitemapEntries.find((item) => item.url === `https://www.quotebuilder.co${path}`);
  assert.ok(entry, `sitemap missing ${path}`);
  assert.equal(String(entry.lastModified).slice(0, 10), lastmod);
}

console.log("marketing seo tests ok");
