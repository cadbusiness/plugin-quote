import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { inspectProductCsv as inspectProductCsvCatalog } from "@/lib/catalog/csv";
import { FUNNEL_TEMPLATES } from "@/lib/funnels/templates";
import { getFunnelFamily } from "@/lib/funnels/families";
import { BLOG_DEMO_SHOTS, BLOG_POSTS, BLOG_TAG_DEFS, BLOG_TOOL_CSV_CATALOGUE, BLOG_TOOLS, outilsHubIntro } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import { MARKETING_ROUTES } from "./routes";
import {
  ALIASES,
  CSV_TEMPLATE,
  EXEMPLE_EXCEL_FR,
  buildRecap,
  checkCatalogCsv,
  convertToComma,
  detectDelimiter,
  inspectProductCsv,
  norm,
  prixAffiche,
  type CatalogCsvInspection,
} from "./verificateur-csv-catalogue-devis";

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;
const NB = "\u00a0";
const blogDir = join(process.cwd(), "src/content/blog");

const BLOG_SLUG = "import-catalogue-csv-funnel-devis-b2b";
const BLOG_PATH = `/blog/${BLOG_SLUG}`;
const SECTOR_SLUG = "funnel-devis-location-materiel-btp";
const SECTOR_PATH = `/secteurs/${SECTOR_SLUG}`;
const TOOL_PATH = "/outils/verificateur-csv-catalogue-devis";
const DAY_PATHS = [BLOG_PATH, SECTOR_PATH, TOOL_PATH];

assert.equal(BLOG_TOOL_CSV_CATALOGUE, TOOL_PATH);
assert.deepEqual(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags, ["catalogue", "integrations"]);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.cover, BLOG_DEMO_SHOTS.produits);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.readingMinutes, 15);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.publishedAt, "2026-10-14");
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.pinned, false);
assert.equal(BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.path, BLOG_PATH);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.title,
  "Importer son catalogue en CSV pour un funnel de devis B2B : colonnes, SKU, prix et pièges d'Excel",
);
assert.ok(
  BLOG_POSTS.find((post) => post.slug === BLOG_SLUG)?.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)),
);
assert.equal(BLOG_FAQ[BLOG_SLUG]?.length, 10);
assert.equal(BLOG_POSTS.some((post) => post.slug === SECTOR_SLUG), false);
for (const item of BLOG_FAQ[BLOG_SLUG] ?? []) {
  assert.doesNotMatch(item.q, EM_DASH);
  assert.doesNotMatch(item.q, EN_DASH);
  assert.doesNotMatch(item.a, EM_DASH);
  assert.doesNotMatch(item.a, EN_DASH);
}

assert.equal(BLOG_POSTS.length, 52);
assert.equal(BLOG_TOOLS.length, 42);
assert.ok(BLOG_TOOLS.some((tool) => tool.href === TOOL_PATH));
assert.equal(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.title, "Vérificateur de fichier CSV catalogue");
assert.deepEqual(BLOG_TOOLS.find((tool) => tool.href === TOOL_PATH)?.tags, ["catalogue", "integrations"]);
for (const tool of BLOG_TOOLS) {
  assert.ok(tool.tags.every((tag) => BLOG_TAG_DEFS.some((def) => def.slug === tag)));
}
assert.ok(outilsHubIntro().startsWith("Quarante-deux outils publics."));
assert.equal(outilsHubIntro(), "Quarante-deux outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(42), outilsHubIntro());
assert.equal(outilsHubIntro(41), "Quarante-et-un outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.");
assert.equal(outilsHubIntro(BLOG_TOOLS.length), outilsHubIntro());

const paths = MARKETING_ROUTES.map((route) => route.path);
for (const path of DAY_PATHS) assert.ok(paths.includes(path), path);
for (const path of DAY_PATHS) {
  assert.equal(MARKETING_ROUTES.find((route) => route.path === path)?.lastModified, "2026-10-14");
}
assert.equal(MARKETING_ROUTES.find((route) => route.path === BLOG_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === SECTOR_PATH)?.priority, 0.8);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.priority, 0.7);
assert.equal(MARKETING_ROUTES.find((route) => route.path === TOOL_PATH)?.changeFrequency, "monthly");

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
  /Importer son catalogue en CSV pour un funnel de devis B2B : colonnes, SKU, prix et pièges d'Excel : https:\/\/www\.quotebuilder\.co\/blog\/import-catalogue-csv-funnel-devis-b2b/,
);
assert.match(
  llms,
  /Funnel de devis location de matériel BTP : https:\/\/www\.quotebuilder\.co\/secteurs\/funnel-devis-location-materiel-btp/,
);
assert.match(
  llms,
  /Vérificateur de fichier CSV catalogue avant import : https:\/\/www\.quotebuilder\.co\/outils\/verificateur-csv-catalogue-devis/,
);

const outilsHub = readFileSync(join(process.cwd(), "src/app/(marketing)/outils/page.tsx"), "utf8");
const secteursHub = readFileSync(join(process.cwd(), "src/app/(marketing)/secteurs/page.tsx"), "utf8");
assert.match(outilsHub, /verificateur-csv-catalogue-devis/);
assert.match(outilsHub, /eyebrow: "Catalogue"/);
assert.match(outilsHub, /vérificateur de fichier CSV catalogue/);
assert.match(outilsHub, /outilsHubIntro\(\)/);
assert.match(secteursHub, /funnel-devis-location-materiel-btp/);
assert.match(secteursHub, /Location de matériel BTP/);

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

function faqFromPage(source: string) {
  const start = source.indexOf("const FAQ = [");
  assert.ok(start >= 0, "page FAQ missing");
  const end = source.indexOf("];", start);
  const block = source.slice(start, end);
  const qs = [...block.matchAll(/q: "((?:\\.|[^"\\])*)"/g)].map((match) => match[1] ?? "");
  const answers = [...block.matchAll(/a: "((?:\\.|[^"\\])*)"/g)].map((match) => (match[1] ?? "").replace(/\\"/g, '"'));
  return qs.map((q, index) => ({ q, a: answers[index] }));
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

{
  const blogRaw = readFileSync(join(blogDir, `${BLOG_SLUG}.md`), "utf8");
  assert.ok(blogRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const blogBody = stripFrontmatter(blogRaw);
  assert.ok(
    blogBody.startsWith(
      "# Importer son catalogue en CSV pour un funnel de devis B2B : colonnes, SKU, prix et pièges d'Excel",
    ),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(blogBody, /^title:/m);
  assert.match(blogBody, /price_min/);
  assert.match(blogBody, /prix_min/);
  assert.match(blogBody, /regular_price/);
  assert.match(blogBody, /Sur devis/);
  assert.match(blogBody, /point-virgule/);
  assert.match(blogBody, /UTF-8/);
  assert.match(blogBody, /RFC 4180/);
  assert.match(blogBody, /Propriétaire/);
  assert.match(blogBody, /Ce que la mise à jour efface/);
  assert.match(blogBody, /\/outils\/verificateur-csv-catalogue-devis/);
  assert.doesNotMatch(blogBody, /\/blog\/espace-prospect-devis-en-ligne/);
  assert.match(blogBody, /signup\?plan=free/);
  assert.match(blogBody, /\/c\/demo\/rayonnage/);
  assertNoDashes(blogRaw, "import csv md");
  assertNoDashes(blogBody, "import csv body");
  assert.equal(blogBody.split(/\s+/).filter(Boolean).length, 3499);
  assert.equal(faqQuestionCount(blogBody), 10);
  assert.deepEqual(faqFromMarkdown(blogBody), BLOG_FAQ[BLOG_SLUG]);
  assertInternalLinks(blogBody, "import csv");
}

{
  const sectorRaw = readFileSync(join(blogDir, `${SECTOR_SLUG}.md`), "utf8");
  assert.ok(sectorRaw.startsWith("---\n"));
  const sectorBody = stripFrontmatter(sectorRaw);
  assert.ok(
    sectorBody.startsWith(
      "# Funnel de devis location de matériel BTP : famille d'engin, durée et chantier avant le premier appel",
    ),
  );
  assert.match(sectorBody, /Location matériel/);
  assert.match(sectorBody, /Levage \/ Nacelle/);
  assert.match(sectorBody, /Terrassement/);
  assert.match(sectorBody, /Énergie \/ Groupe/);
  assert.match(sectorBody, /1 mois et \+/);
  assert.match(sectorBody, /Funnel location/);
  assert.match(sectorBody, /Cold/);
  assert.match(sectorBody, /Plan \(PDF ou image\)/);
  assert.match(sectorBody, /Responsable technique/);
  assert.match(sectorBody, /30 jours/);
  assert.match(sectorBody, /signup\?plan=free/);
  assert.match(sectorBody, /\/c\/demo\/rayonnage/);
  assert.match(sectorBody, /Essayer le template Location matériel/);
  assertNoDashes(sectorRaw, "location md");
  assert.equal(sectorBody.split(/\s+/).filter(Boolean).length, 3324);
  assert.equal(faqQuestionCount(sectorBody), 10);
  assertInternalLinks(sectorBody, "location");

  const sectorPage = readFileSync(
    join(process.cwd(), "src/app/(marketing)/secteurs/funnel-devis-location-materiel-btp/page.tsx"),
    "utf8",
  );
  assert.deepEqual(faqFromPage(sectorPage), faqFromMarkdown(sectorBody));
  assert.match(sectorPage, /Essayer le template Location matériel/);
  assert.match(sectorPage, /Secteur · Location de matériel BTP/);
  assert.match(sectorPage, /signup\?plan=free/);
  assert.match(sectorPage, /loadPostBody\("funnel-devis-location-materiel-btp"\)/);
  assert.match(sectorPage, /\/blog\/import-catalogue-csv-funnel-devis-b2b/);
  assert.match(sectorPage, /\/outils\/verificateur-csv-catalogue-devis/);
  assert.match(sectorPage, /\/blog\/regles-suggestion-produits-funnel-devis-b2b/);
  assert.match(sectorPage, /\/fonctionnalites\/espace-prospect/);
}

const rental = FUNNEL_TEMPLATES.find((template) => template.id === "rental");
assert.ok(rental, "template rental missing");
if (!rental) throw new Error("template rental missing");
assert.equal(rental.label, "Location matériel");
assert.equal(rental.defaultName, "Funnel location");
assert.equal(rental.defaultKind, "form");
assert.equal(rental.blurb, "Durée, capacité, options, une demande complète, pas un appel à vide.");
assert.equal(getFunnelFamily(rental.family).label, "Location & événementiel");
assert.equal(rental.steps[0]?.title, "Votre location");
const rentalQuestions = rental.steps[0]?.questions ?? [];
function choiceLabels(key: string) {
  const question = rentalQuestions.find((item) => item.key === key);
  const options = question?.options as { choices?: { label: string }[] } | null;
  return (options?.choices ?? []).map((choice) => choice.label);
}
assert.deepEqual(choiceLabels("category"), ["Levage / Nacelle", "Terrassement", "Énergie / Groupe", "Autre"]);
assert.deepEqual(choiceLabels("duration"), ["1 jour", "1 semaine", "1 mois et +"]);
assert.equal(rentalQuestions.find((item) => item.key === "when")?.required, false);
assert.equal(rental.steps[1]?.subtitle, "Matériel disponible dans votre parc");

const addedSources = [
  "src/lib/marketing/verificateur-csv-catalogue-devis.ts",
  "src/lib/marketing/seo-am-20261014.test.ts",
  "src/components/marketing/verificateur-csv-catalogue-devis-calculator.tsx",
  "src/app/(marketing)/outils/verificateur-csv-catalogue-devis/page.tsx",
  "src/app/(marketing)/secteurs/funnel-devis-location-materiel-btp/page.tsx",
  "src/components/marketing/cout-campagnes-email-sans-segmentation-calculator.tsx",
];
for (const relative of addedSources) {
  assertNoDashes(readFileSync(join(process.cwd(), relative), "utf8"), relative);
}

const toolPage = readFileSync(
  join(process.cwd(), "src/app/(marketing)/outils/verificateur-csv-catalogue-devis/page.tsx"),
  "utf8",
);
assert.match(toolPage, /WebApplication/);
assert.match(toolPage, /signup\?plan=free/);
assert.match(toolPage, /import-catalogue-csv-funnel-devis-b2b/);
assert.match(toolPage, /\/fonctionnalites\/catalogue/);
assert.match(toolPage, /\/c\/demo\/rayonnage/);
assert.match(toolPage, /Ce que l(?:'|&apos;)outil ne vérifie pas/);
assert.match(toolPage, /Calcul local, aucune donnée envoyée/);
assert.match(toolPage, /Vérificateur de fichier CSV catalogue avant import/);

const calculatorSrc = readFileSync(
  join(process.cwd(), "src/components/marketing/cout-campagnes-email-sans-segmentation-calculator.tsx"),
  "utf8",
);
assert.match(
  calculatorSrc,
  /tone=\{result\.verdict\.tone === "bad" \? "bad" : result\.verdict\.tone === "ok" \? "ok" : undefined\}/,
);
assert.doesNotMatch(calculatorSrc, /result\.coutMensuel < 0/);

const codes = (result: ReturnType<typeof checkCatalogCsv>) => result.findings.map((finding) => finding.code);

{
  const sample =
    'nom,sku,categorie,prix_min,prix_max,tags\nRayonnage,RAY-1,Rayonnage,10,20,"a;b"\n,SKIP,,\nBac,BAC-1,Bacs,18.42,18.42,plastique\n';
  const inspected = inspectProductCsv(sample);
  assert.strictEqual(inspected.ok, true);
  assert.strictEqual(inspected.rows.length, 2);
  assert.strictEqual(inspected.skipped, 1);
  assert.strictEqual(inspected.mapped.name, "nom");
  assert.strictEqual(inspected.rows[0]?.sku, "RAY-1");
  assert.deepStrictEqual(inspected.rows[0]?.tags, ["a", "b"]);
  const bad = inspectProductCsv("foo,bar\n1,2");
  assert.strictEqual(bad.ok, false);
  assert.strictEqual(bad.missingNameColumn, true);
  assert.strictEqual(inspectProductCsv("").ok, false);
  assert.deepStrictEqual(inspectProductCsv("").issues, [{ line: 1, message: "Fichier vide." }]);
  const swapped = inspectProductCsv("name,price_min,price_max\nBac,420,189\nFixe,18,18\n");
  assert.strictEqual(swapped.rows[0]?.price_min, 189);
  assert.strictEqual(swapped.rows[0]?.price_max, 420);
  assert.strictEqual(swapped.rows[1]?.price_min, 18);
  assert.strictEqual(swapped.rows[1]?.price_max, 18);
  assert.deepStrictEqual(
    inspectProductCsv("name\n").issues.map((issue) => issue.message),
    ["Aucune ligne produit sous l\u2019en-tête."],
  );
  assert.strictEqual(
    inspectProductCsv("foo\n1").issues[0]?.message,
    "Colonne nom introuvable. Attendu : name, nom ou product_name.",
  );
}

assert.strictEqual(norm("Prix min"), "prix_min");
assert.strictEqual(norm("Catégorie"), "categorie");
assert.strictEqual(norm("Étiquettes"), "etiquettes");
assert.strictEqual(norm("\ufeffname"), "name");
assert.strictEqual(norm("Référence"), "reference");
assert.strictEqual(inspectProductCsv("\ufeffName,Prix min\nA,3").mapped.name, "Name");
assert.equal(ALIASES.regular_price, "price_min");
assert.equal(ALIASES.prix_min, "price_min");

{
  let result = checkCatalogCsv(CSV_TEMPLATE);
  assert.strictEqual(result.verdict.tone, "ok");
  assert.strictEqual(result.delimiter, ",");
  assert.strictEqual(result.stats.prets, 2);
  assert.strictEqual(result.stats.prixFixe, 1);
  assert.strictEqual(result.stats.fourchette, 1);
  assert.strictEqual(result.stats.centimesMasques, 1);
  assert.deepStrictEqual(codes(result), ["centimes"]);
  assert.strictEqual(result.apercu[0]?.prix, "189" + NB + "€ à 420" + NB + "€");
  assert.strictEqual(result.apercu[1]?.prix, "18" + NB + "€");
  assert.deepStrictEqual(result.apercu[0]?.tags, ["entrepot", "lourd"]);
  assert.ok(result.verdict.text.startsWith("Fichier prêt : 2 produits seront créés ou mis à jour."));

  result = checkCatalogCsv(EXEMPLE_EXCEL_FR);
  assert.strictEqual(detectDelimiter(EXEMPLE_EXCEL_FR), ";");
  assert.strictEqual(result.verdict.tone, "bad");
  assert.strictEqual(
    result.verdict.text,
    "Fichier refusé en l'état : le bouton Importer restera grisé. Séparateur détecté : point-virgule.",
  );
  assert.deepStrictEqual(codes(result), ["separateur"]);
  assert.strictEqual(result.inspection.missingNameColumn, true);
  assert.strictEqual(result.stats.prets, 0);
  assert.strictEqual(result.stats.lignes, 5);

  const conv = convertToComma(EXEMPLE_EXCEL_FR);
  assert.ok(conv.startsWith("Nom,Référence,Catégorie,Prix,Description\n"));
  assert.ok(conv.includes('Nacelle ciseaux 8 m,NAC-08,Levage,"145,00","Location à la journée, livraison en sus"\n'));
  assert.ok(conv.includes('"Mini-pelle 2,5 t",MP-25,Terrassement,"210,50",Avec godets 30 et 60 cm\n'));
  result = checkCatalogCsv(conv);
  assert.strictEqual(result.delimiter, ",");
  assert.strictEqual(result.verdict.tone, "warn");
  assert.strictEqual(result.verdict.text, "Import possible pour 4 produits, mais 3 points méritent une correction avant.");
  assert.deepStrictEqual(codes(result), ["nom_manquant", "sku_doublon", "colonne_proche", "colonnes_absentes", "sur_devis"]);
  assert.deepStrictEqual(result.stats.doublonsSku, ["GE-20"]);
  assert.strictEqual(result.stats.ignores, 1);
  assert.strictEqual(result.stats.surDevis, 4);
  assert.ok(result.findings[2]?.text.startsWith("Colonne « Prix » ignorée. Si elle contient le prix, renommez-la en prix_min."));
  assert.ok(result.findings[3]?.text.startsWith("Colonnes absentes : prix min, prix max, tags."));
  assert.strictEqual(result.inspection.mapped.sku, "Référence");
  assert.strictEqual(result.inspection.mapped.category, "Catégorie");
  assert.strictEqual(result.recap, [
    "Vérification d'un CSV catalogue avant import QuoteBuilder.",
    "Séparateur : virgule.",
    "Colonnes reconnues : Nom = nom, Référence = SKU, Catégorie = catégorie, Description = description.",
    "Colonnes ignorées : Prix.",
    "Produits prêts : 4. Lignes ignorées : 1.",
    "SKU : 4 avec, 0 sans, 1 en double.",
    "Prix : 0 fixe, 0 fourchette, 0 avec une seule borne, 4 sur devis.",
    "Points bloquants : 0. À corriger : 3.",
    "Verdict : Import possible pour 4 produits, mais 3 points méritent une correction avant.",
    "Vérifié sur : quotebuilder.co/outils/verificateur-csv-catalogue-devis",
  ].join("\n"));
  assert.strictEqual(buildRecap(conv), result.recap);

  const conv2 = conv.replace("Nom,Référence,Catégorie,Prix,", "Nom,Référence,Catégorie,prix_min,");
  result = checkCatalogCsv(conv2);
  assert.strictEqual(result.inspection.rows[0]?.price_min, 145);
  assert.strictEqual(result.inspection.rows[1]?.price_min, 210.5);
  assert.strictEqual(result.inspection.rows[1]?.price_max, null);
  assert.strictEqual(result.stats.unSeulPrix, 4);
  assert.strictEqual(result.stats.centimesMasques, 1);
  assert.strictEqual(result.apercu[1]?.prix, "211" + NB + "€");
  assert.ok(!codes(result).includes("colonne_proche"));

  result = checkCatalogCsv('name,sku,price_min\nA,A1,1.234\nB,B1,"1.234,50"\nC,C1,"1 234,50"\nD,D1,sur demande\nE,E1,95 €\n');
  assert.deepStrictEqual(
    result.inspection.issues.map((issue) => `${issue.line} ${issue.message}`),
    ["3 Prix min illisible (1.234,50)."],
  );
  assert.strictEqual(result.inspection.rows[0]?.price_min, 1.234);
  assert.strictEqual(result.inspection.rows[1]?.price_min, null);
  assert.strictEqual(result.inspection.rows[2]?.price_min, 1234.5);
  assert.strictEqual(result.inspection.rows[3]?.price_min, 0);
  assert.strictEqual(result.inspection.rows[4]?.price_min, 95);
  assert.deepStrictEqual(codes(result), ["prix_illisible", "prix_texte", "prix_milliers", "colonnes_absentes", "sur_devis", "centimes"]);
  assert.ok(result.findings[1]?.text.startsWith("Prix écrit en lettres (ligne 5) : l'import ne le signale pas et l'enregistre à 0 €."));
  assert.ok(result.findings[2]?.text.startsWith("Prix avec un point des milliers (ligne 2)"));
  assert.strictEqual(result.apercu[3]?.prix, "0" + NB + "€");
  assert.strictEqual(result.apercu[0]?.prix, "1" + NB + "€");
  assert.strictEqual(result.verdict.tone, "warn");
  result = checkCatalogCsv("name,price_min\nA,1,234\n");
  assert.strictEqual(result.inspection.rows[0]?.price_min, 1);

  result = checkCatalogCsv("name,sku\nCat\ufffdgorie,X1\n");
  assert.ok(codes(result).includes("encodage"));
  result = checkCatalogCsv('name,sku,description\nA,A1,"début\nfin"\nB,B1,ok\n');
  assert.ok(codes(result).includes("retour_ligne"));
  assert.ok(result.findings.find((finding) => finding.code === "retour_ligne")?.text.startsWith("Guillemets non refermés aux lignes 2, 3."));
  result = checkCatalogCsv('name,sku\nCâble,3,76E+12\nGaine,"3,76E+12"\n');
  assert.ok(codes(result).includes("sku_excel"));
  result = checkCatalogCsv("name,price_min,price_max\nA,10,20\nB,30,10\n");
  assert.ok(codes(result).includes("sans_colonne_sku"));
  assert.ok(codes(result).includes("prix_inverses"));
  assert.strictEqual(result.stats.inverses, 1);
  assert.strictEqual(result.verdict.tone, "ok");
  let many = "name,sku\n";
  for (let k = 0; k < 7; k += 1) many += `,S${k}\n`;
  many += "Z,Z1\n";
  result = checkCatalogCsv(many);
  assert.strictEqual(result.stats.signalements, 7);
  assert.ok(codes(result).includes("signalements"));
  assert.strictEqual(result.stats.ignores, 7);

  result = checkCatalogCsv("designation,sku\nA,1\n");
  assert.deepStrictEqual(codes(result), ["colonne_nom", "colonne_proche"]);
  assert.strictEqual(result.verdict.text, "Fichier refusé en l'état : le bouton Importer restera grisé. Colonne nom introuvable.");
  result = checkCatalogCsv("");
  assert.strictEqual(result.verdict.tone, "neutral");
  assert.strictEqual(result.recap, "");
  result = checkCatalogCsv("   \n\n");
  assert.strictEqual(result.verdict.tone, "neutral");
  assert.strictEqual(detectDelimiter("name\tsku\nA\tB"), "\t");
  assert.strictEqual(convertToComma("name\tsku\nA, B\tB1", "\t"), 'name,sku\n"A, B",B1\n');
  result = checkCatalogCsv("name\nSeul\n");
  assert.strictEqual(result.verdict.tone, "ok");
}

assert.strictEqual(prixAffiche(null, null), "Sur devis");
assert.strictEqual(prixAffiche(0.9, 0.9), "0,90" + NB + "€");
assert.strictEqual(prixAffiche(18.42, 18.42), "18" + NB + "€");
assert.strictEqual(prixAffiche(1200, 4500), "1" + NB + "200" + NB + "€ à 4" + NB + "500" + NB + "€");
assert.strictEqual(prixAffiche(420, 189), "189" + NB + "€ à 420" + NB + "€");
assert.strictEqual(prixAffiche(95, null), "95" + NB + "€");

function stripPort(inspection: CatalogCsvInspection) {
  return {
    ...inspection,
    rows: inspection.rows.map((row) => ({
      name: row.name,
      sku: row.sku,
      description: row.description,
      price_min: row.price_min,
      price_max: row.price_max,
      tags: row.tags,
      category: row.category,
    })),
  };
}

const parityFixtures = [
  CSV_TEMPLATE,
  EXEMPLE_EXCEL_FR,
  convertToComma(EXEMPLE_EXCEL_FR),
  "",
  "  \n",
  "foo,bar\n1,2",
  "name\n",
  'nom,sku,categorie,prix_min,prix_max,tags\nRayonnage,RAY-1,Rayonnage,10,20,"a;b"\n,SKIP,,\nBac,BAC-1,Bacs,18.42,18.42,plastique\n',
  'name,sku,price_min\nA,A1,1.234\nB,B1,"1.234,50"\nC,C1,"1 234,50"\nD,D1,sur demande\nE,E1,95 €\n',
  '\ufeffName,Prix min,Étiquettes,Catégorie\r\nA,3,"x|y",Z\r\nB,-,,\r\n',
  'name,sku,description\nA,A1,"début\nfin"\nB,B1,ok\n',
  "name,price,price_min,regular_price\nA,1,2,3\n",
];
assert.equal(parityFixtures.length, 12);
for (const fixture of parityFixtures) {
  assert.deepEqual(stripPort(inspectProductCsv(fixture)), inspectProductCsvCatalog(fixture));
}

assert.ok(!/[\u2014\u2013]/.test(checkCatalogCsv(CSV_TEMPLATE).recap + checkCatalogCsv(convertToComma(EXEMPLE_EXCEL_FR)).recap));
