import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BLOG_DEMO_SHOTS, BLOG_POSTS } from "./blog";
import { BLOG_FAQ } from "./blog-faq";
import { stripFrontmatter } from "./load-post";
import {
  VALEUR_PRODUITS_SUGGERES_DEFAULTS,
  VALEUR_PRODUITS_SUGGERES_LABELS,
  computeValeurProduitsSuggeres,
} from "./valeur-produits-suggeres-devis";

const EM_DASH = /\u2014/;
const blogDir = join(process.cwd(), "src/content/blog");

assert.deepEqual(
  BLOG_POSTS.find((post) => post.slug === "regles-suggestion-produits-funnel-devis-b2b")?.tags,
  ["funnel", "catalogue"],
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "regles-suggestion-produits-funnel-devis-b2b")?.ctaHref,
  "https://www.quotebuilder.co/signup?plan=free",
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "regles-suggestion-produits-funnel-devis-b2b")?.cover,
  BLOG_DEMO_SHOTS.produits,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "regles-suggestion-produits-funnel-devis-b2b")?.readingMinutes,
  13,
);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "regles-suggestion-produits-funnel-devis-b2b")?.publishedAt,
  "2026-10-05",
);
assert.equal(BLOG_POSTS.find((post) => post.slug === "regles-suggestion-produits-funnel-devis-b2b")?.pinned, false);
assert.equal(
  BLOG_POSTS.find((post) => post.slug === "regles-suggestion-produits-funnel-devis-b2b")?.path,
  "/blog/regles-suggestion-produits-funnel-devis-b2b",
);
assert.equal(BLOG_FAQ["regles-suggestion-produits-funnel-devis-b2b"]?.length, 10);

{
  const reglesRaw = readFileSync(join(blogDir, "regles-suggestion-produits-funnel-devis-b2b.md"), "utf8");
  assert.ok(reglesRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const reglesBody = stripFrontmatter(reglesRaw);
  assert.ok(
    reglesBody.startsWith("# Règles de suggestion produits dans un funnel de devis B2B"),
    "frontmatter must be stripped before render",
  );
  assert.doesNotMatch(reglesBody, /^title:/m);
  assert.match(reglesBody, /signup\?plan=free/);
  assert.match(reglesBody, /\/secteurs\/funnel-devis-paysagiste-amenagement-jardin/);
  assert.match(reglesBody, /\/c\/demo\/rayonnage/);
  assert.match(reglesBody, /3 blocs|trois blocs/i);
  assert.match(reglesBody, /ordre fixe/);
  assert.match(reglesBody, /pas de kits|Il n'y a pas de kits/i);
  assert.match(reglesBody, /formule fixe/);
  assert.match(reglesBody, /Solutions recommandées/);
  assert.doesNotMatch(reglesBody, /signature électronique/);
  assert.doesNotMatch(reglesBody, EM_DASH);
  assert.equal(reglesBody.split(/\s+/).filter(Boolean).length, 2831);
}

{
  const jardinRaw = readFileSync(join(blogDir, "funnel-devis-paysagiste-amenagement-jardin.md"), "utf8");
  assert.ok(jardinRaw.startsWith("---\n"), "QB Content frontmatter must stay on disk");
  const jardinBody = stripFrontmatter(jardinRaw);
  assert.ok(
    jardinBody.startsWith("# Funnel de devis paysagiste"),
    "frontmatter must be stripped before render",
  );
  assert.match(jardinBody, /signup\?plan=free/);
  assert.match(jardinBody, /\/blog\/regles-suggestion-produits-funnel-devis-b2b/);
  assert.match(jardinBody, /\/outils\/estimateur-valeur-produits-suggeres-devis/);
  assert.match(jardinBody, /template « Paysagiste »|template Paysagiste/);
  assert.match(jardinBody, /ordre fixe|étapes restent les mêmes/);
  assert.match(jardinBody, /pas de kits|n'existe pas dans QuoteBuilder/i);
  assert.match(jardinBody, /formule fixe/);
  assert.match(jardinBody, /Gagné/);
  assert.match(jardinBody, /sans gestion de TVA|sans TVA/);
  assert.doesNotMatch(jardinBody, /signature électronique/);
  assert.doesNotMatch(jardinBody, EM_DASH);
  assert.equal(jardinBody.split(/\s+/).filter(Boolean).length, 2642);
}

const suggestionsDefault = computeValeurProduitsSuggeres({ ...VALEUR_PRODUITS_SUGGERES_DEFAULTS });
assert.equal(suggestionsDefault.dossiersActuel, 9);
assert.equal(suggestionsDefault.dossiersCible, 18);
assert.equal(suggestionsDefault.ecartDossiers, 9);
assert.equal(suggestionsDefault.devisActuel, 4500);
assert.equal(suggestionsDefault.devisCible, 9000);
assert.equal(suggestionsDefault.ecartDevis, 4500);
assert.equal(suggestionsDefault.gagne, 1125);
assert.equal(suggestionsDefault.heures, 0.9);
assert.equal(suggestionsDefault.temps, 50);
assert.equal(suggestionsDefault.total, 1175);
assert.equal(suggestionsDefault.an, 14100);
assert.equal(suggestionsDefault.alertTone, "neutral");
assert.equal(suggestionsDefault.totalTone, "neutral");
assert.match(suggestionsDefault.alert, /Enjeu modeste/);
assert.match(suggestionsDefault.dossiersLabel, /9 → 18/);
assert.match(suggestionsDefault.recap, /Checklist règles de suggestion/);
assert.match(suggestionsDefault.recap, /3 blocs max affichés/);
assert.match(suggestionsDefault.recap, /pas les étapes ni le prix ni le score/);
assert.match(suggestionsDefault.recap, /pas un benchmark/);
assert.match(suggestionsDefault.recap, /pas de TVA/);
assert.match(suggestionsDefault.recap, /Pas de kits/);
assert.doesNotMatch(suggestionsDefault.recap, /signature électronique/);
assert.doesNotMatch(suggestionsDefault.recap, EM_DASH);
assert.equal(VALEUR_PRODUITS_SUGGERES_LABELS.demandes, "Demandes via le funnel / mois");
assert.equal(VALEUR_PRODUITS_SUGGERES_LABELS.total, "Total indicatif mensuel (valeur gagnée + temps)");
assert.equal(VALEUR_PRODUITS_SUGGERES_LABELS.an, "Sur 12 mois (indicatif)");

const suggestionsEmpty = computeValeurProduitsSuggeres({ ...VALEUR_PRODUITS_SUGGERES_DEFAULTS, demandes: 0 });
assert.equal(suggestionsEmpty.dossiersActuel, 0);
assert.equal(suggestionsEmpty.dossiersCible, 0);
assert.equal(suggestionsEmpty.ecartDossiers, 0);
assert.equal(suggestionsEmpty.total, 0);
assert.equal(suggestionsEmpty.an, 0);
assert.equal(suggestionsEmpty.alertTone, "neutral");
assert.match(suggestionsEmpty.alert, /volume de demandes/);

const suggestionsNoGap = computeValeurProduitsSuggeres({ ...VALEUR_PRODUITS_SUGGERES_DEFAULTS, pctCible: 15 });
assert.equal(suggestionsNoGap.ecartDossiers, 0);
assert.equal(suggestionsNoGap.ecartDevis, 0);
assert.equal(suggestionsNoGap.gagne, 0);
assert.equal(suggestionsNoGap.total, 0);
assert.equal(suggestionsNoGap.alertTone, "neutral");
assert.match(suggestionsNoGap.alert, /pas d'écart à estimer/);

const suggestionsBelow = computeValeurProduitsSuggeres({ ...VALEUR_PRODUITS_SUGGERES_DEFAULTS, pctCible: 10 });
assert.equal(suggestionsBelow.ecartDossiers, 0);
assert.equal(suggestionsBelow.ecartDevis, 0);
assert.match(suggestionsBelow.alert, /pas d'écart à estimer/);

const suggestionsNotable = computeValeurProduitsSuggeres({
  demandes: 80,
  pctActuel: 10,
  pctCible: 40,
  valeur: 800,
  transfo: 20,
  minutes: 10,
  taux: 60,
});
assert.equal(suggestionsNotable.dossiersActuel, 8);
assert.equal(suggestionsNotable.dossiersCible, 32);
assert.equal(suggestionsNotable.ecartDossiers, 24);
assert.equal(suggestionsNotable.devisActuel, 6400);
assert.equal(suggestionsNotable.devisCible, 25600);
assert.equal(suggestionsNotable.ecartDevis, 19200);
assert.equal(suggestionsNotable.gagne, 3840);
assert.equal(suggestionsNotable.heures, 4);
assert.equal(suggestionsNotable.temps, 240);
assert.equal(suggestionsNotable.total, 4080);
assert.equal(suggestionsNotable.an, 48960);
assert.equal(suggestionsNotable.alertTone, "warn");
assert.equal(suggestionsNotable.totalTone, "warn");
assert.match(suggestionsNotable.alert, /Enjeu notable/);
assert.match(suggestionsNotable.tip, /2 ou 3 segments/);

const suggestionsHigh = computeValeurProduitsSuggeres({
  demandes: 200,
  pctActuel: 10,
  pctCible: 40,
  valeur: 2000,
  transfo: 30,
  minutes: 12,
  taux: 70,
});
assert.equal(suggestionsHigh.dossiersActuel, 20);
assert.equal(suggestionsHigh.dossiersCible, 80);
assert.equal(suggestionsHigh.ecartDossiers, 60);
assert.equal(suggestionsHigh.ecartDevis, 120000);
assert.equal(suggestionsHigh.gagne, 36000);
assert.equal(suggestionsHigh.heures, 12);
assert.equal(suggestionsHigh.temps, 840);
assert.equal(suggestionsHigh.total, 36840);
assert.equal(suggestionsHigh.an, 442080);
assert.equal(suggestionsHigh.alertTone, "ok");
assert.equal(suggestionsHigh.totalTone, "ok");
assert.match(suggestionsHigh.alert, /Enjeu important/);
assert.match(suggestionsHigh.tip, /3 blocs/);

const suggestionsClamp = computeValeurProduitsSuggeres({
  demandes: -5,
  pctActuel: 140,
  pctCible: -10,
  valeur: -1,
  transfo: 140,
  minutes: 2000,
  taux: 20000,
});
assert.equal(suggestionsClamp.demandes, 0);
assert.equal(suggestionsClamp.pctActuel, 100);
assert.equal(suggestionsClamp.pctCible, 0);
assert.equal(suggestionsClamp.valeur, 0);
assert.equal(suggestionsClamp.transfo, 100);
assert.equal(suggestionsClamp.minutes, 1440);
assert.equal(suggestionsClamp.taux, 10000);
assert.equal(suggestionsClamp.alertTone, "neutral");
assert.match(suggestionsClamp.alert, /volume de demandes/);
