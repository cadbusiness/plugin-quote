import { COMPANY, SITE_URL, absoluteUrl } from "@/lib/marketing/site";

export const BLOG_TAG_DEFS = [
  { slug: "scoring", label: "Scoring" },
  { slug: "relances", label: "Relances" },
  { slug: "funnel", label: "Funnel" },
  { slug: "integrations", label: "Intégrations" },
  { slug: "catalogue", label: "Catalogue" },
] as const;

export type BlogTagSlug = (typeof BLOG_TAG_DEFS)[number]["slug"];
export type BlogTagLabel = (typeof BLOG_TAG_DEFS)[number]["label"];

/** Captures d’articles : `public/images/blog/{slug}.jpg|jpeg|png|webp`. */
export const BLOG_IMAGE_DIR = "/images/blog";

/** Écrans démo (données fictives uniquement). */
const WALKTHROUGH = `${BLOG_IMAGE_DIR}/visite-guidee-parcours-devis-b2b`;
export const BLOG_DEMO_SHOTS = {
  accueil: `${WALKTHROUGH}/02-accueil.png`,
  devisListe: `${WALKTHROUGH}/03-devis.png`,
  devisDetail: `${WALKTHROUGH}/04-devis-detail.png`,
  automations: `${WALKTHROUGH}/05-automations.png`,
  produits: `${WALKTHROUGH}/06-produits.png`,
  funnels: `${WALKTHROUGH}/07-funnels.png`,
  integrations: `${WALKTHROUGH}/08-integrations.png`,
  funnelPublic: `${WALKTHROUGH}/09-public-funnel.png`,
  boutiquePublic: `${WALKTHROUGH}/10-public-boutique.png`,
} as const;

export function normalizeCoverPath(cover: string): string {
  const trimmed = cover.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `${BLOG_IMAGE_DIR}/${trimmed.replace(/^\/+/, "")}`;
}

export type BlogPost = {
  slug: string;
  path: string;
  title: string;
  description: string;
  publishedAt: string;
  readingMinutes: number;
  tags: readonly BlogTagSlug[];
  ctaHref: string;
  /**
   * Visuel optionnel (`/images/blog/…`, nom de fichier, ou URL).
   * Si absent, on cherche `public/images/blog/{slug}.{webp,jpg,jpeg,png}`.
   * Placeholder géométrique uniquement si aucun fichier n’existe.
   */
  cover?: string;
  pinned?: boolean;
};

export const BLOG_UI = {
  eyebrow: "Blog",
  heroTitle: "Ce qui fait aboutir un devis",
  heroSubtitle:
    "Relances, parcours, catalogue, intégration. Des guides concrets, pas des fiches produit.",
  tryFree: "Essayer gratuitement",
  featured: "À la une",
  grid: "Tous les articles",
  empty: "Aucun article sur ce thème pour l’instant",
  searchPlaceholder: "Chercher un article",
  byline: "Équipe QuoteBuilder",
  toc: "Sur cette page",
  midCtaTitle: "Voir un parcours en vrai",
  midCtaText: "Un funnel public démo, sans créer de compte.",
  midCtaLink: "Ouvrir la démo",
  related: "Continuer sur le même thème",
  tools: "Mini-outils liés",
  reading: "min de lecture",
} as const;

export const BLOG_DEMO_FUNNEL = "/c/demo/rayonnage";
export const BLOG_DEMO_SHOP = "/b/demo/vitrine";
export const BLOG_TOOL_SEQUENCE = "/outils/generateur-sequence-relances";
export const BLOG_TOOL_SCORE = "/outils/score-brief-devis";
export const BLOG_TOOL_CONVERSION = "/outils/simulateur-taux-conversion-devis";
export const BLOG_TOOL_CAPACITY = "/outils/calculateur-capacite-equipe-devis";
export const BLOG_TOOL_QUOTING_TIME = "/outils/estimateur-temps-chiffrage-devis";
export const BLOG_TOOL_DISCOUNT = "/outils/simulateur-impact-remise-devis";
export const BLOG_TOOL_ROI = "/outils/simulateur-roi-logiciel-devis";
export const BLOG_TOOL_ACCEPTANCE = "/outils/simulateur-taux-acceptation-devis";
export const BLOG_TOOL_INCOMPLETE_BRIEF = "/outils/estimateur-cout-brief-incomplet";
export const BLOG_TOOL_EXPIRED_QUOTES = "/outils/simulateur-cout-devis-expires";
export const BLOG_TOOL_ACOMPTE = "/outils/calculateur-acompte-devis";
export const BLOG_TOOL_CATALOG_GAIN = "/outils/estimateur-gain-temps-catalogue-devis";
export const BLOG_TOOL_SEUIL_REMISE = "/outils/calculateur-seuil-remise-marge";
export const BLOG_TOOL_PREFILL_URL = "/outils/generateur-url-prefill-devis";
export const BLOG_TOOL_LEADS_WP = "/outils/estimateur-leads-formulaire-vs-funnel-wp";
export const BLOG_TOOL_PDF_SEULS = "/outils/estimateur-cout-devis-pdf-seuls";
export const BLOG_TOOL_CHECKLIST_MENTIONS = "/outils/checklist-mentions-devis-france";
export const BLOG_TOOL_ALLER_RETOURS_BRIEF = "/outils/estimateur-cout-aller-retours-brief-photos";
export const BLOG_TOOL_EMAILS_CLARIFICATION = "/outils/estimateur-cout-emails-clarification-devis";
export const BLOG_TOOL_DEVIS_SANS_VALIDATION = "/outils/estimateur-cout-devis-sans-validation";
export const BLOG_TOOL_RELANCES_AVEUGLES = "/outils/estimateur-cout-relances-aveugles-devis";
export const BLOG_TOOL_ATTENTE_MULTI = "/outils/estimateur-cout-attente-multi-decideurs-devis";
export const BLOG_TOOL_VISITES_INUTILES = "/outils/estimateur-cout-visites-techniques-inutiles";
export const BLOG_TOOL_PIPELINE_FANTOME = "/outils/estimateur-cout-pipeline-fantome-devis";
export const BLOG_TOOL_DEMANDES_ORALES = "/outils/estimateur-cout-demandes-orales-non-capturees";
export const BLOG_TOOL_DOUBLE_SAISIE = "/outils/estimateur-cout-double-saisie-devis";
export const BLOG_TOOL_HANDOFF = "/outils/estimateur-cout-handoff-commercial-technique-devis";
export const BLOG_TOOL_CONTEXTE_HORS_DOSSIER = "/outils/estimateur-cout-contexte-hors-dossier-devis";
export const BLOG_TOOL_VALEUR_SUGGESTIONS = "/outils/estimateur-valeur-produits-suggeres-devis";
export const BLOG_TOOL_REQUALIFICATION = "/outils/estimateur-requalification-chat-vs-formulaire-devis";
export const BLOG_TOOL_HORS_BUDGET_FOURCHETTE = "/outils/estimateur-demandes-hors-budget-fourchette-devis";
export const BLOG_TOOL_ABANDONS_FUNNEL = "/outils/estimateur-demandes-devis-abandonnees-funnel";
export const BLOG_TOOL_FUITES_ENTONNOIR = "/outils/estimateur-fuites-entonnoir-funnel-devis";
export const BLOG_TOOL_MENTION_RGPD = "/outils/generateur-mention-rgpd-formulaire-devis";
export const BLOG_TOOL_SIGNATURE_WEBHOOK = "/outils/verificateur-signature-webhook-devis";
export const BLOG_TOOL_COUT_CLIENT_GOOGLE_ADS = "/outils/calculateur-cout-par-client-google-ads-devis";
export const BLOG_TOOL_CHARGE_AUTOPILOTE = "/outils/estimateur-charge-relances-manuelles-vs-autopilote";
export const BLOG_TOOL_COUT_CAMPAGNES_EMAIL = "/outils/estimateur-cout-campagnes-email-sans-segmentation";
export const BLOG_TOOL_ACCES_EQUIPE = "/outils/estimateur-cout-acces-mal-cadres-equipe-devis";
export const BLOG_TOOL_CSV_CATALOGUE = "/outils/verificateur-csv-catalogue-devis";
export const BLOG_TOOL_SUIVI_CLIENTS = "/outils/estimateur-temps-demandes-suivi-devis-clients";
export const BLOG_TOOL_DEVIS_PAYANT = "/outils/calculateur-devis-payant-etude-prealable";
export const BLOG_TOOL_EMAIL_CONFIRMATION = "/outils/generateur-email-confirmation-demande-devis";
export const BLOG_TOOL_ROI_SALON = "/outils/calculateur-roi-salon-professionnel-devis";
export const BLOG_TOOL_FRAIS_DEPLACEMENT = "/outils/calculateur-frais-deplacement-devis";
export const BLOG_TOOL_MOTIFS_PERDUS = "/outils/analyseur-motifs-devis-perdus";
export const BLOG_TOOL_REVISION_PRIX = "/outils/calculateur-revision-prix-devis";
export const BLOG_TOOL_PENALITES_RETARD = "/outils/calculateur-penalites-retard-paiement";
export const BLOG_TOOL_RETENUE_GARANTIE = "/outils/calculateur-retenue-garantie";
export const BLOG_TOOL_FRAIS_ANNULATION = "/outils/calculateur-frais-annulation-commande";
export const BLOG_TOOL_PENALITES_RETARD_LIVRAISON = "/outils/calculateur-penalites-retard-livraison";
export const BLOG_TOOL_ESCOMPTE = "/outils/calculateur-escompte-paiement-anticipe";
export const BLOG_TOOL_COUT_GARANTIE = "/outils/calculateur-cout-garantie-sav-devis";
export const BLOG_TOOL_FRANCO = "/outils/calculateur-seuil-franco-port";
export const BLOG_TOOL_PREAVIS = "/outils/calculateur-preavis-reconduction-tacite";
export const BLOG_TOOL_COEFFICIENT = "/outils/calculateur-coefficient-vente-devis";
export const BLOG_TOOL_TVA = "/outils/calculateur-tva-devis-ht-ttc";
export const BLOG_TOOL_RETRACTATION = "/outils/calculateur-delai-retractation-hors-etablissement";
export const BLOG_TOOL_PRESCRIPTION = "/outils/calculateur-prescription-facture-impayee";
export const BLOG_TOOL_ECHEANCE_FE = "/outils/calculateur-echeance-facturation-electronique";
export const BLOG_TOOL_GARANTIE_PAIEMENT = "/outils/calculateur-garantie-paiement-marche-travaux";
export const BLOG_TOOL_REMISE_VOLUME = "/outils/calculateur-remise-volume-contrat-cadre";
export const BLOG_TOOL_AUTOLIQUIDATION = "/outils/verificateur-autoliquidation-tva-sous-traitance-btp";
export const BLOG_TOOL_AVENANT = "/outils/calculateur-avenant-travaux-supplementaires";
export const BLOG_TOOL_ATTESTATION_DECENNALE = "/outils/verificateur-attestation-assurance-decennale";
export const BLOG_TOOL_CGV_CGA = "/outils/comparateur-cgv-conditions-achat-client";
export const BLOG_TOOL_VIGILANCE = "/outils/verificateur-obligation-vigilance-sous-traitant";
export const BLOG_TOOL_CESSION_DROITS = "/outils/verificateur-clause-cession-droits-auteur";
export const BLOG_TOOL_LIMITATION_RESPONSABILITE = "/outils/verificateur-clause-limitation-responsabilite";
export const BLOG_TOOL_ACCORD_CONFIDENTIALITE = "/outils/verificateur-accord-confidentialite-nda";
export const BLOG_TOOL_NON_SOLLICITATION = "/outils/verificateur-clause-non-sollicitation-personnel";
export const BLOG_TOOL_REGLEMENT_LITIGES = "/outils/verificateur-clause-reglement-litiges";
export const BLOG_TOOL_FORCE_MAJEURE_IMPREVISION = "/outils/verificateur-clause-force-majeure-imprevision";
export const BLOG_TOOL_RESOLUTOIRE = "/outils/verificateur-clause-resolutoire";
export const BLOG_TOOL_EXCEPTION_INEXECUTION = "/outils/verificateur-exception-inexecution";
export const BLOG_TOOL_SOUS_TRAITANCE = "/outils/verificateur-sous-traitance-loi-1975";
export const BLOG_TOOL_COMPENSATION = "/outils/verificateur-compensation-creances";
export const BLOG_TOOL_RUPTURE_BRUTALE = "/outils/calculateur-preavis-rupture-brutale";
export const BLOG_TOOL_ERREUR_PRIX = "/outils/verificateur-erreur-prix-devis";
export const BLOG_TOOL_CESSION_CREANCE = "/outils/verificateur-cession-creance-affacturage";
export const BLOG_TOOL_GROUPEMENT_COTRAITANCE = "/outils/calculateur-repartition-groupement-cotraitance";
export const BLOG_TOOL_RECEPTION_TRAVAUX = "/outils/verificateur-reception-travaux-reserves";
export const BLOG_TOOL_OUTILLAGE_SPECIFIQUE = "/outils/calculateur-amortissement-outillage-specifique";
export const BLOG_TOOL_PLAN_PREVENTION = "/outils/verificateur-plan-prevention-entreprise-exterieure";
export const BLOG_TOOL_BON_A_TIRER = "/outils/verificateur-bon-a-tirer-validation-production";
export const BLOG_TOOL_FORFAIT_REGIE = "/outils/comparateur-forfait-regie-devis";
export const BLOG_TOOL_TVA_CLIENT_ETRANGER = "/outils/verificateur-tva-client-etranger-devis";
export const BLOG_TOOL_INTERETS_MORATOIRES = "/outils/calculateur-interets-moratoires-marche-public";
export const BLOG_TOOL_POUVOIR_SIGNATAIRE = "/outils/verificateur-pouvoir-signataire-devis";
export const BLOG_TOOL_MENTION_DECHETS = "/outils/verificateur-mention-dechets-devis-travaux";
export const BLOG_TOOL_DECLARATION_CREANCE = "/outils/calculateur-declaration-creance-procedure-collective";
export const BLOG_TOOL_PRET_MAIN_OEUVRE = "/outils/verificateur-pret-main-oeuvre-devis";

export type BlogTool = {
  href: string;
  title: string;
  text: string;
  tags: readonly BlogTagSlug[];
};

/** Intro du hub /outils, calée sur le nombre réel d’entrées de BLOG_TOOLS. */
export function outilsHubIntro(count = BLOG_TOOLS.length): string {
  const words: Record<number, string> = {
    27: "Vingt-sept",
    28: "Vingt-huit",
    29: "Vingt-neuf",
    30: "Trente",
    31: "Trente et un",
    32: "Trente-deux",
    33: "Trente-trois",
    34: "Trente-quatre",
    35: "Trente-cinq",
    36: "Trente-six",
    37: "Trente-sept",
    38: "Trente-huit",
    39: "Trente-neuf",
    40: "Quarante",
    41: "Quarante-et-un",
    42: "Quarante-deux",
    43: "Quarante-trois",
    44: "Quarante-quatre",
    45: "Quarante-cinq",
    46: "Quarante-six",
    47: "Quarante-sept",
    48: "Quarante-huit",
    49: "Quarante-neuf",
    50: "Cinquante",
    51: "Cinquante-et-un",
    52: "Cinquante-deux",
    53: "Cinquante-trois",
    54: "Cinquante-quatre",
    55: "Cinquante-cinq",
    56: "Cinquante-six",
    57: "Cinquante-sept",
    58: "Cinquante-huit",
    59: "Cinquante-neuf",
    60: "Soixante",
    61: "Soixante-et-un",
    62: "Soixante-deux",
    63: "Soixante-trois",
    64: "Soixante-quatre",
    65: "Soixante-cinq",
    66: "Soixante-six",
    67: "Soixante-sept",
    68: "Soixante-huit",
    69: "Soixante-neuf",
    70: "Soixante-dix",
    71: "Soixante-et-onze",
    72: "Soixante-douze",
    73: "Soixante-treize",
    74: "Soixante-quatorze",
    75: "Soixante-quinze",
    76: "Soixante-seize",
    77: "Soixante-dix-sept",
    78: "Soixante-dix-huit",
    79: "Soixante-dix-neuf",
    80: "Quatre-vingts",
    81: "Quatre-vingt-un",
    82: "Quatre-vingt-deux",
    83: "Quatre-vingt-trois",
    84: "Quatre-vingt-quatre",
    85: "Quatre-vingt-cinq",
    86: "Quatre-vingt-six",
    87: "Quatre-vingt-sept",
    88: "Quatre-vingt-huit",
    89: "Quatre-vingt-neuf",
    90: "Quatre-vingt-dix",
    91: "Quatre-vingt-onze",
    92: "Quatre-vingt-douze",
    93: "Quatre-vingt-treize",
  };
  const label = words[count] ?? String(count);
  return `${label} outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.`;
}

export const BLOG_TOOLS: readonly BlogTool[] = [
  {
    href: "/outils/cout-devis-non-relance",
    title: "Coût d’un devis non relancé",
    text: "Devis par mois, panier, taux actuel et cible. L’écart annuel s’affiche. À coller dans un COMEX.",
    tags: ["relances"],
  },
  {
    href: BLOG_TOOL_SEQUENCE,
    title: "Générateur de séquence de relances",
    text: "T+0, T+4 h, T+24 h, T+3 j, T+7 j, T+30 j. Sujets et corps prêts à copier, selon le secteur.",
    tags: ["relances"],
  },
  {
    href: BLOG_TOOL_SCORE,
    title: "Score brief devis (0–100)",
    text: "Cinq questions pondérées. Score live et reco Hot / Warm / Cold / Parking avant de chiffrer.",
    tags: ["scoring", "funnel"],
  },
  {
    href: BLOG_TOOL_CONVERSION,
    title: "Simulateur de taux de conversion devis",
    text: "Devis envoyés, panier, taux actuel et cible. CA mensuel, gain, option mix Hot / Warm / Cold.",
    tags: ["scoring", "funnel"],
  },
  {
    href: BLOG_TOOL_CAPACITY,
    title: "Calculateur de capacité équipe devis",
    text: "Commerciaux, heures dispo, minutes Hot / Warm / Cold. Charge vs capacité, taux d’utilisation.",
    tags: ["scoring", "relances"],
  },
  {
    href: BLOG_TOOL_QUOTING_TIME,
    title: "Estimateur de temps de chiffrage devis",
    text: "Minutes Hot / Warm / Cold, qualification et revisions / versions. Charge vs capacité des personnes qui chiffrent.",
    tags: ["funnel", "relances"],
  },
  {
    href: BLOG_TOOL_DISCOUNT,
    title: "Simulateur d’impact remise devis",
    text: "CA HT, coût, remise %, volume annuel. Marge avant/après, perte unitaire, impact annuel, option taux d’acceptation.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_ROI,
    title: "Simulateur ROI logiciel de devis",
    text: "Demandes, temps de chiffrage, coût horaire, taux, panier, abonnement. Gain temps, marge, ROI net/mois et délai de retour.",
    tags: ["scoring", "relances"],
  },
  {
    href: BLOG_TOOL_ACCEPTANCE,
    title: "Simulateur de taux d’acceptation de devis",
    text: "Devis envoyés, taux actuel et cible, panier, délai. Acceptés en plus, CA, marge, coût d’attente (valeur coincée × délai).",
    tags: ["funnel", "relances"],
  },
  {
    href: BLOG_TOOL_INCOMPLETE_BRIEF,
    title: "Estimateur du coût d’un brief devis incomplet",
    text: "Demandes, % de briefs incomplets, minutes perdues, coût horaire. Heures, coût temps, CA potentiel perdu si des dossiers meurent.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_EXPIRED_QUOTES,
    title: "Simulateur du coût des devis expirés",
    text: "Devis ouverts, % qui expirent, panier, heures, re-chiffrage. CA potentiel, coûts de reprise, gain si relance avant expiration.",
    tags: ["relances", "funnel"],
  },
  {
    href: BLOG_TOOL_ACOMPTE,
    title: "Calculateur d’acompte et d’échéances devis",
    text: "HT, TVA, % ou montant fixe, 1 à 4 jalons. Acompte TTC, reste dû, répartition indicative et délai de démarrage.",
    tags: ["funnel", "relances"],
  },
  {
    href: BLOG_TOOL_CATALOG_GAIN,
    title: "Estimateur gain de temps catalogue / kits",
    text: "Devis par mois, minutes manuelles, part bibliothèque, minutes gagnées, taux horaire. Heures et euros par mois et par an.",
    tags: ["catalogue", "funnel"],
  },
  {
    href: BLOG_TOOL_SEUIL_REMISE,
    title: "Calculateur seuil de remise et plancher de marge",
    text: "Prix catalogue HT, coût ou marge actuelle, plancher cible, TVA. Remise max, prix plancher HT/TTC, marge restante, alerte OK/KO.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_PREFILL_URL,
    title: "Générateur d’URL de préremplissage devis",
    text: "URL de funnel avec ?besoin=, ?add= et ?product=, query seule et shortcode WordPress. Assemblage 100 % local.",
    tags: ["funnel", "integrations"],
  },
  {
    href: BLOG_TOOL_LEADS_WP,
    title: "Estimateur leads formulaire vs funnel WordPress",
    text: "Demandes / mois, % exploitables, ressaisie, réponse sous 24 h. Heures perdues, demandes mortes, coût d’opportunité optionnel, score de maturité. Calcul 100 % local.",
    tags: ["integrations", "funnel"],
  },
  {
    href: BLOG_TOOL_PDF_SEULS,
    title: "Estimateur coût des devis PDF seuls",
    text: "Devis PDF / mois, % jamais ouverts, versions foireuses, ressaisie, taux horaire, panier, conv. PDF vs lien. Heures, coût friction, fantômes, deals, opportunités. Calcul 100 % local.",
    tags: ["funnel", "relances"],
  },
  {
    href: BLOG_TOOL_CHECKLIST_MENTIONS,
    title: "Checklist mentions devis France (B2B)",
    text: "Vingt blocs (identité, SIRET, TVA, prix, validité, acomptes, CGV, process). Score de complétion et récap des manques. Calcul 100 % local, pas une validation juridique.",
    tags: ["funnel"],
  },
  {
    href: BLOG_TOOL_ALLER_RETOURS_BRIEF,
    title: "Estimateur coût des allers-retours brief sans photos",
    text: "Demandes / mois, % sans photo ni plan, minutes perdues, déplacements inutiles, coût trajet, taux horaire, panier, écart de conversion. Heures, friction, trajets, opportunités. Calcul 100 % local.",
    tags: ["funnel", "catalogue"],
  },
  {
    href: BLOG_TOOL_EMAILS_CLARIFICATION,
    title: "Estimateur coût des e-mails de clarification devis",
    text: "Devis / mois, % clarification mail, mails moyens, minutes, taux horaire, % deals perdus, panier. Heures, coût temps, opportunités. Calcul 100 % local.",
    tags: ["funnel", "relances"],
  },
  {
    href: BLOG_TOOL_DEVIS_SANS_VALIDATION,
    title: "Estimateur coût des devis envoyés sans validation interne",
    text: "Devis / mois, % sans relecture, taux de correction, minutes, remises et écart de marge, panier, taux horaire, écart de conversion. Devis à risque, heures, friction, coût marge, opportunités. Calcul 100 % local.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_RELANCES_AVEUGLES,
    title: "Estimateur coût des relances à l’aveugle sur devis",
    text: "Devis / mois, part relancée sans signal utile, relances aveugles, minutes, taux horaire, timing nuisible, panier, écart de conversion. Heures, coût temps, opportunités mal priorisées, impact timing. Calcul 100 % local.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_ATTENTE_MULTI,
    title: "Estimateur coût d’attente multi-décideurs sur devis",
    text: "Devis / mois, % multi-décideurs, jours d’attente, minutes de relance, taux horaire, panier, % deals perdus ou retardés. Devis concernés, jours-homme, heures, coût temps, opportunités. Calcul 100 % local.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_VISITES_INUTILES,
    title: "Estimateur coût des visites techniques inutiles",
    text: "Devis / mois, % de visites, % inutiles, durée, taux horaire, déplacement, panier, % deals mal priorisés. Visites, heures, coût temps + déplacement, opportunités. Calcul 100 % local.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_PIPELINE_FANTOME,
    title: "Estimateur coût du pipeline fantôme devis",
    text: "Dossiers ouverts, % sans maj de statut depuis 30 jours, minutes de suivi, taux horaire, panier, parts Perdu et Gagné non closés. Fantômes, heures, coût temps, opportunités. Calcul 100 % local.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_TVA,
    title: "Calculateur TVA devis HT / TTC",
    text: "HT vers TTC ou l’inverse, taux 20 % 10 % 5,5 % 2,1 % 0 % ou perso, jusqu’à 3 lignes. Totaux HT, TVA ventilée, TTC. Calcul 100 % local, indicatif, pas un conseil fiscal.",
    tags: ["funnel"],
  },
  {
    href: BLOG_TOOL_DEMANDES_ORALES,
    title: "Estimateur coût des demandes orales non capturées",
    text: "Demandes orales / mois (tél + WhatsApp + SMS), % non capturées, minutes, taux horaire, panier, % deals perdus. Heures, coût temps, opportunités. Le % funnel est indicatif. Calcul 100 % local.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_DOUBLE_SAISIE,
    title: "Estimateur coût de la double saisie devis",
    text: "Demandes / mois en double saisie, minutes, % d’infos déformées, % qui meurent ou repartent en clarification, taux horaire, panier. Heures, coût temps, dossiers déformés, opportunités. Calcul 100 % local.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_HANDOFF,
    title: "Estimateur coût handoff commercial → technique",
    text: "Devis / mois concernés par un handoff, % de briefs incomplets, minutes, taux horaire, panier, % de devis retravaillés. Heures, coût temps, opportunités. Le % évitables est indicatif. Calcul 100 % local.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_CONTEXTE_HORS_DOSSIER,
    title: "Estimateur coût du contexte hors dossier devis",
    text: "Dossiers / mois, % sans notes internes utiles, minutes de re-brief, % morts ou clarifs faute de contexte, taux horaire, panier. Dossiers fragiles, heures, coût temps, opportunités. Calcul 100 % local.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_VALEUR_SUGGESTIONS,
    title: "Estimateur valeur des produits suggérés dans un devis",
    text: "Demandes via le funnel / mois, % de dossiers avec suggestion retenue aujourd'hui et visé, valeur moyenne ajoutée, taux de transformation, minutes gagnées, taux horaire. Écart de valeur, valeur gagnée, temps libéré. Calcul 100 % local, sur vos hypothèses.",
    tags: ["funnel", "catalogue"],
  },
  {
    href: BLOG_TOOL_REQUALIFICATION,
    title: "Estimateur requalification chat vs formulaire",
    text: "Demandes de devis / mois, part qui arrive par le chat, % à requalifier selon le canal, minutes, taux horaire. Dossiers, heures, coût mensuel et écart attribuable au chat. Calcul 100 % local, sur vos hypothèses.",
    tags: ["funnel", "scoring"],
  },
  {
    href: BLOG_TOOL_HORS_BUDGET_FOURCHETTE,
    title: "Estimateur des demandes hors budget",
    text: "Demandes de devis / mois, part qui s'arrête au prix, minutes, taux horaire, hypothèse de fourchette affichée plus tôt. Heures, coût, temps récupérable, aperçu du montant d'une ligne. Calcul 100 % local, sur vos hypothèses.",
    tags: ["catalogue", "funnel"],
  },
  {
    href: BLOG_TOOL_ABANDONS_FUNNEL,
    title: "Estimateur des demandes de devis abandonnées",
    text: "Parcours commencés / mois, part abandonnée avant l'envoi, part avec email, hypothèses de reprise et de signature, panier. Relançables, reprises, devis gagnés, chiffre d'affaires et plafond. Calcul 100 % local, sur vos hypothèses.",
    tags: ["relances", "funnel"],
  },
  {
    href: BLOG_TOOL_FUITES_ENTONNOIR,
    title: "Estimateur des fuites d'un entonnoir de devis",
    text: "Sept marches sur une période, montant moyen d'une affaire gagnée, marche à améliorer et gain en points. Taux de passage, volume perdu, effet de l'hypothèse. Calcul 100 % local, sur vos chiffres.",
    tags: ["funnel", "integrations"],
  },
  {
    href: BLOG_TOOL_MENTION_RGPD,
    title: "Générateur de mention RGPD pour formulaire de devis",
    text: "Mention courte près du bouton d'envoi et texte complet pour la page de confidentialité. Responsable, durée, droits. Calcul 100 % local.",
    tags: ["funnel", "integrations"],
  },
  {
    href: BLOG_TOOL_SIGNATURE_WEBHOOK,
    title: "Vérificateur de signature webhook (HMAC SHA-256)",
    text: "Corps brut, secret, en-tête X-QuoteBuilder-Signature. Comparaison HMAC SHA-256 locale et causes d'écart courantes. Rien n'est envoyé.",
    tags: ["integrations", "funnel"],
  },
  {
    href: BLOG_TOOL_COUT_CLIENT_GOOGLE_ADS,
    title: "Calculateur de coût par devis et par client Google Ads",
    text: "Budget, coût par clic, deux taux, panier, marge, délai de signature. Coût par devis, coût par client, plafond à l'équilibre. Calcul 100 % local.",
    tags: ["integrations", "funnel"],
  },
  {
    href: BLOG_TOOL_CHARGE_AUTOPILOTE,
    title: "Estimateur de charge : relances manuelles ou Autopilote",
    text: "Demandes par mois, touches à la main, minutes, coût horaire, part où une touche saute, panier, taux de signature, mise en place. Temps, affaires perdues, coût mensuel évité. Calcul 100 % local.",
    tags: ["relances", "funnel"],
  },
  {
    href: BLOG_TOOL_COUT_CAMPAGNES_EMAIL,
    title: "Estimateur coût des campagnes email sans segmentation",
    text: "Campagnes par mois, taille de liste, part sans segment, minutes, plaintes, part déjà en parcours Autopilote, taux horaire, panier, affaires qui refroidissent. Heures, coût temps, contacts mal ciblés, opportunités. Calcul 100 % local.",
    tags: ["funnel", "integrations"],
  },
  {
    href: BLOG_TOOL_ACCES_EQUIPE,
    title: "Estimateur du coût des accès mal cadrés",
    text: "Admins en trop, commerciaux bloqués, réponses retardées. Le coût mensuel et ce qu'une répartition propre des rôles évite.",
    tags: ["funnel", "catalogue"],
  },
  {
    href: BLOG_TOOL_CSV_CATALOGUE,
    title: "Vérificateur de fichier CSV catalogue",
    text: "Séparateur, colonnes reconnues, SKU en double, prix lus à 0 €. Ce que l'import QuoteBuilder fera de votre fichier, avant de cliquer.",
    tags: ["catalogue", "integrations"],
  },
  {
    href: BLOG_TOOL_SUIVI_CLIENTS,
    title: "Estimateur du temps passé sur les demandes de suivi des clients",
    text: "Questions « où en est mon devis ? », notices renvoyées. Le temps mensuel et ce qu'un espace membres en libre-service vous rend.",
    tags: ["funnel", "relances"],
  },
  {
    href: BLOG_TOOL_DEVIS_PAYANT,
    title: "Calculateur devis payant et étude préalable",
    text: "Études facturées, temps récupéré, contrats perdus : faire payer l'étude vous rapporte-t-il plus qu'il ne vous coûte ?",
    tags: ["funnel", "catalogue"],
  },
  {
    href: BLOG_TOOL_EMAIL_CONFIRMATION,
    title: "Générateur d'email de confirmation de demande de devis",
    text: "Délai, prochaine étape, lien de suivi, signature : l'accusé de réception prêt à coller, avec les promesses incohérentes signalées.",
    tags: ["relances", "funnel"],
  },
  {
    href: BLOG_TOOL_ROI_SALON,
    title: "Calculateur ROI salon professionnel",
    text: "Stand, déplacements, journées d'équipe : combien vous coûte chaque demande de devis venue d'un salon, et à partir de combien de clients il est remboursé ?",
    tags: ["funnel", "relances"],
  },
  {
    href: BLOG_TOOL_FRAIS_DEPLACEMENT,
    title: "Calculateur des frais de déplacement par zone",
    text: "Véhicule, temps de route, allers-retours : ce que coûte le trajet d'un chantier dans chaque zone, le forfait à afficher et la commande minimum.",
    tags: ["funnel", "catalogue"],
  },
  {
    href: BLOG_TOOL_MOTIFS_PERDUS,
    title: "Analyseur des motifs de devis perdus",
    text: "Prix, délai, concurrent, pas de réponse : comment se répartissent vos devis perdus, ce qu'ils représentent, et ce que rapporterait d'en récupérer une partie ?",
    tags: ["relances", "scoring"],
  },
  {
    href: BLOG_TOOL_REVISION_PRIX,
    title: "Calculateur de révision de prix",
    text: "Partie fixe, indices pondérés, seuil et plafond : le coefficient de révision, le prix révisé et l'effet de chaque indice sur votre devis.",
    tags: ["catalogue", "funnel"],
  },
  {
    href: BLOG_TOOL_PENALITES_RETARD,
    title: "Calculateur de pénalités de retard de paiement",
    text: "Facture payée en retard : échéance, jours de retard, pénalités au taux BCE + 10 points par semestre et indemnité de 40 €, avec un récapitulatif à copier.",
    tags: ["relances", "catalogue"],
  },
  {
    href: BLOG_TOOL_RETENUE_GARANTIE,
    title: "Calculateur de retenue de garantie",
    text: "Montant, taux, base HT ou TTC et versements : la retenue, sa date de libération et ce qu'elle vous coûte face à une caution bancaire.",
    tags: ["catalogue", "funnel"],
  },
  {
    href: BLOG_TOOL_FRAIS_ANNULATION,
    title: "Calculateur de frais d'annulation",
    text: "Commande annulée avant le début : palier du barème, indemnité, acompte ou arrhes à garder ou à rendre, solde et perte réelle, avec un récapitulatif à copier.",
    tags: ["catalogue", "relances"],
  },
  {
    href: BLOG_TOOL_PENALITES_RETARD_LIVRAISON,
    title: "Calculateur de pénalités de retard de livraison",
    text: "Livraison en retard : jours pénalisés après franchise, pénalité par jour, plafond, montant dû et part de la commande, avec un récapitulatif à copier.",
    tags: ["catalogue", "relances"],
  },
  {
    href: BLOG_TOOL_ESCOMPTE,
    title: "Calculateur d'escompte pour paiement anticipé",
    text: "Escompte pour paiement anticipé : montant, taux annuel équivalent, comparaison avec votre coût de financement et mention à porter sur la facture.",
    tags: ["catalogue", "relances"],
  },
  {
    href: BLOG_TOOL_COUT_GARANTIE,
    title: "Calculateur de coût de garantie et de SAV",
    text: "Garantie pièces et main-d'œuvre : coût par intervention, provision par vente, part du prix et de la marge, prix d'une année de plus et ligne de garantie à copier.",
    tags: ["catalogue", "relances"],
  },
  {
    href: BLOG_TOOL_FRANCO,
    title: "Calculateur de seuil franco de port",
    text: "Seuil franco de port calculé sur la marge : part de marge prise par le transport, participation sous le seuil et mention à reprendre dans le devis.",
    tags: ["catalogue", "relances"],
  },
  {
    href: BLOG_TOOL_PREAVIS,
    title: "Calculateur de préavis et de reconduction tacite",
    text: "Date limite pour dénoncer, fin effective du contrat et montant encore engagé si le courrier arrive trop tard.",
    tags: ["catalogue", "relances"],
  },
  {
    href: BLOG_TOOL_COEFFICIENT,
    title: "Calculateur de coefficient de vente",
    text: "Du déboursé sec au prix de vente HT : coefficient, taux de marque et taux de marge, prix plancher et bénéfice réel au prix que vous envisagez.",
    tags: ["catalogue"],
  },
  {
    href: BLOG_TOOL_RETRACTATION,
    title: "Calculateur de délai de rétractation hors établissement",
    text: "Les trois conditions de L221-3, la fin du délai de quatorze jours, reportée si besoin, et les sept jours sans paiement.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_PRESCRIPTION,
    title: "Calculateur de prescription d'une facture impayée",
    text: "Cinq ans entre professionnels, deux ans contre un particulier : la date limite pour agir, ce qui l'interrompt et ce qui ne change rien.",
    tags: ["relances"],
  },
  {
    href: BLOG_TOOL_ECHEANCE_FE,
    title: "Calculateur d'échéance de facturation électronique",
    text: "votre catégorie, vos dates de réception et d'émission, les nouvelles mentions et l'amende théorique, à partir de votre effectif, de votre chiffre d'affaires et de votre bilan.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_GARANTIE_PAIEMENT,
    title: "Calculateur de garantie de paiement (article 1799-1)",
    text: "au-delà de 12 000 € HT : la garantie due par le client, sa forme, le solde à couvrir et la date à partir de laquelle le chantier peut être suspendu.",
    tags: ["relances"],
  },
  {
    href: BLOG_TOOL_REMISE_VOLUME,
    title: "Calculateur de remise sur volume d'un contrat-cadre",
    text: "Paliers globaux ou par tranche, volume réalisé contre volume engagé : le montant dû, le rappel de prix ou la ristourne à facturer en fin de période.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_AUTOLIQUIDATION,
    title: "Vérificateur d'autoliquidation de TVA en sous-traitance BTP",
    text: "Sous-traitant ou entreprise principale : l'autoliquidation s'applique-t-elle, quel montant facturer, quelle TVA déclarer et quelles mentions écrire.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_AVENANT,
    title: "Calculateur d'avenant et de travaux supplémentaires",
    text: "Ligne par ligne, ce qui est sécurisé, à régulariser ou à risque, le nouveau total et un projet d'avenant à faire signer.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_ATTESTATION_DECENNALE,
    title: "Vérificateur d'attestation d'assurance décennale",
    text: "activités déclarées, validité, ouverture du chantier, coût de l'opération : ce que couvre l'attestation jointe au devis, et le message à envoyer à l'assureur.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_CGV_CGA,
    title: "Comparateur CGV et conditions d'achat du client",
    text: "Vos CGV contre le bon de commande du client : clause par clause, ce qui s'applique, ce que vous perdez, et ce qu'il faut écrire dans le devis signé.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_VIGILANCE,
    title: "Vérificateur d'obligation de vigilance (attestation Urssaf)",
    text: "seuil de 5 000 € HT, pièces de l'article D. 8222-5, attestation de moins de six mois et échéancier des remises : ce qu'il faut réunir avant de signer, et le message à envoyer.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_CESSION_DROITS,
    title: "Vérificateur de clause de cession de droits d'auteur",
    text: "Photos, vidéos, graphisme : droits nommés, supports, destination, territoire, durée et rémunération. Ce qui manque à la clause, et le texte à compléter.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_LIMITATION_RESPONSABILITE,
    title: "Vérificateur de clause de limitation de responsabilité",
    text: "Plafond, préjudices exclus, faute lourde, acceptation des CGV et délai pour agir : douze points contrôlés, ce que la clause laisse payer sur un sinistre type, et la clause à écrire.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_ACCORD_CONFIDENTIALITE,
    title: "Vérificateur d'accord de confidentialité (NDA)",
    text: "avant d'envoyer un plan ou un fichier pour un devis : définition, exclusions, finalité, rétro-ingénierie, durée et sanction. Quinze points contrôlés, et les clauses à compléter.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_NON_SOLLICITATION,
    title: "Vérificateur de clause de non-sollicitation du personnel",
    text: "personnes visées, durée, initiative du salarié, indemnité, intérim et acceptation des CGV : treize points contrôlés, la date de fin de l'interdiction et la clause à écrire.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_REGLEMENT_LITIGES,
    title: "Vérificateur de clause de règlement des litiges",
    text: "qualité des parties, présentation, acceptation des CGV, tribunal choisi, médiation préalable et délai : treize points contrôlés, la date de saisine possible et la clause à écrire.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_FORCE_MAJEURE_IMPREVISION,
    title: "Vérificateur de clause de force majeure et d'imprévision",
    text: "Force majeure (1218) ou imprévision (1195) : douze points contrôlés, le régime probable, et la clause à écrire.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_RESOLUTOIRE,
    title: "Vérificateur de clause résolutoire",
    text: "Clause 1225, notification 1226 ou juge : mise en demeure, délai de régularisation, clause rédigée et actions.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_EXCEPTION_INEXECUTION,
    title: "Vérificateur d'exception d'inexécution",
    text: "articles 1219 et 1220 : douze points contrôlés, le régime probable, et la clause à écrire.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_SOUS_TRAITANCE,
    title: "Vérificateur de sous-traitance (loi de 1975)",
    text: "Acceptation, agrément, caution, mise en demeure : douze points contrôlés, l'action directe ou le paiement direct, et les clauses à écrire.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_COMPENSATION,
    title: "Vérificateur de compensation de créances",
    text: "facture payée moins une somme : douze points contrôlés (articles 1347 à 1348-2, L441-17), le montant compensé, le reste exigible et la clause à écrire.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_RUPTURE_BRUTALE,
    title: "Calculateur de préavis de rupture brutale",
    text: "ancienneté, préavis écrit, dépendance, usages : douze points contrôlés, un repère de préavis, le préavis manquant et la perte de marge estimée.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_ERREUR_PRIX,
    title: "Vérificateur d'erreur de prix dans un devis",
    text: "Total faux, prix unitaire, oubli ou mauvaise estimation : douze points contrôlés, l'écart, le prix de référence et la clause à écrire.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_CESSION_CREANCE,
    title: "Vérificateur de cession de créance et d'affacturage",
    text: "Cession, Dailly ou affacturage : douze points contrôlés, le net versé, le coût ramené à l'année, la clause et la notification au client.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_GROUPEMENT_COTRAITANCE,
    title: "Calculateur de répartition d'un groupement de cotraitants",
    text: "plusieurs entreprises, un seul devis : douze points contrôlés, la part et le net de chaque membre, l'exposition si l'un fait défaut, la clause et le message.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_RECEPTION_TRAVAUX,
    title: "Vérificateur de réception des travaux et des réserves",
    text: "Procès-verbal, réserves, levée, garanties et retenue : douze points contrôlés, les dates calculées, la clause et le message.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_OUTILLAGE_SPECIFIQUE,
    title: "Calculateur d'amortissement d'un outillage spécifique",
    text: "moule, matrice ou gabarit : prix par pièce, reste à amortir si les commandes s'arrêtent, douze points contrôlés, la clause et le message.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_PLAN_PREVENTION,
    title: "Vérificateur de plan de prévention pour entreprise extérieure",
    text: "Inspection commune, seuil des 400 heures, travaux dangereux, sous-traitants et amiante : douze points contrôlés, la clause et le message.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_BON_A_TIRER,
    title: "Vérificateur de bon à tirer (BAT) avant production",
    text: "BAT, échantillon ou prototype : qui valide, ce que vaut le silence, tours de corrections, date de livraison en jours ouvrés, la clause et le message.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_FORFAIT_REGIE,
    title: "Comparateur forfait ou régie",
    text: "forfait, régie, régie plafonnée ou forfait par phase : prix, marge, point mort, dix points contrôlés, la clause et le message.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_TVA_CLIENT_ETRANGER,
    title: "Vérificateur TVA client étranger",
    text: "client dans l'UE ou hors UE : régime de TVA, numéro à vérifier, preuves de transport, mentions de facture, la clause et le message.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_INTERETS_MORATOIRES,
    title: "Calculateur d'intérêts moratoires (marché public)",
    text: "Mairie, hôpital, établissement public : échéance, jours de retard, taux BCE plus 8 points, intérêts, indemnité de 40 €, la clause et le message.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_POUVOIR_SIGNATAIRE,
    title: "Vérificateur du pouvoir du signataire",
    text: "gérant, président, salarié ou maître d'œuvre : le pouvoir de signer, la délégation, la confirmation de l'article 1158, la clause et le message.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_MENTION_DECHETS,
    title: "Vérificateur de mention déchets",
    text: "Construction, rénovation, démolition ou jardinage : quantité, tri, point de collecte, coût de la ligne déchets, la ligne à coller et le message.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_DECLARATION_CREANCE,
    title: "Calculateur de déclaration de créance",
    text: "Client en sauvegarde, redressement ou liquidation : la date limite depuis le BODACC, le montant à déclarer, le contrat en cours et le courrier à envoyer.",
    tags: ["catalogue","relances"],
  },
  {
    href: BLOG_TOOL_PRET_MAIN_OEUVRE,
    title: "Vérificateur de prêt de main-d'œuvre",
    text: "Régie, assistance technique ou mise à disposition : indices de fourniture de personnel, coût réel, but lucratif, la clause à coller et le message.",
    tags: ["catalogue","relances"],
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "pret-main-oeuvre-illicite-marchandage-devis-regie-b2b",
    path: "/blog/pret-main-oeuvre-illicite-marchandage-devis-regie-b2b",
    title: "Prêt de main-d'œuvre illicite et marchandage : rédiger un devis de régie ou d'assistance technique sans vendre du personnel",
    description: "Un client vous demande « deux techniciens pendant six mois, à l'heure ». Ce que disent les articles L8241-1 et L8231-1 du code du travail, ce qui reste permis (vraie prestation, prêt sans but lucratif, intérim), les indices que regardent les juges, comment écrire l'objet, le prix, l'encadrement et les moyens dans le devis, le calcul du prêt au coût, les sanctions, un exemple daté et un vérificateur gratuit.",
    publishedAt: "2026-11-19",
    readingMinutes: 34,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "client-procedure-collective-declaration-creance-devis-b2b",
    path: "/blog/client-procedure-collective-declaration-creance-devis-b2b",
    title: "Client en redressement ou liquidation judiciaire : devis en cours, acompte et déclaration de créance",
    description: "Votre client est placé en sauvegarde, en redressement ou en liquidation judiciaire alors qu'un devis est en cours ou qu'une facture reste due. Ce qui change le jour du jugement, la déclaration de créance et son délai de deux mois depuis la publication au BODACC, le décompte des mois, le contrat en cours et la mise en demeure de prendre parti, l'acompte, les travaux faits après le jugement, la réserve de propriété, le relevé de forclusion, un exemple daté et chiffré, et un calculateur gratuit.",
    publishedAt: "2026-11-18",
    readingMinutes: 52,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "mention-dechets-devis-travaux-bordereau-depot-b2b",
    path: "/blog/mention-dechets-devis-travaux-bordereau-depot-b2b",
    title: "Mention déchets sur un devis de travaux : les quatre informations obligatoires, le bordereau de dépôt, le tri et le coût à chiffrer",
    description: "Depuis le 1er juillet 2021, un devis de construction, de rénovation, de démolition de bâtiment ou de jardinage doit indiquer la quantité estimée de déchets, le tri prévu, le point de collecte et le coût estimé (article L541-21-2-3 et article D541-45-1 du code de l'environnement). Qui est concerné, l'exception du diagnostic PEMD, le bordereau de dépôt, les déchets dangereux, le tri des sept flux, l'amende jusqu'à 15 000 €, comment chiffrer la ligne, un exemple daté et un vérificateur gratuit.",
    publishedAt: "2026-11-18",
    readingMinutes: 43,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "pouvoir-signataire-devis-delegation-mandat-apparent-b2b",
    path: "/blog/pouvoir-signataire-devis-delegation-mandat-apparent-b2b",
    title: "Qui peut signer un devis côté client : pouvoir, délégation et mandat apparent",
    description: "Un devis signé par un acheteur, un responsable de site ou un maître d'œuvre engage-t-il vraiment le client ? Qui représente une SARL, une SAS, une SA ou une association, ce que valent les limites des statuts, la délégation et son plafond, le mandat apparent, la demande de confirmation de l'article 1158 du code civil, la ratification, la clause à écrire, un exemple daté et chiffré, et un vérificateur gratuit.",
    publishedAt: "2026-11-17",
    readingMinutes: 40,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "devis-acheteur-public-marche-sans-publicite-b2b",
    path: "/blog/devis-acheteur-public-marche-sans-publicite-b2b",
    title: "Devis pour un acheteur public (mairie, hôpital, établissement public) : seuils, bon de commande, Chorus Pro, délai de paiement et intérêts moratoires",
    description: "Répondre par un simple devis à une mairie, une communauté de communes, un hôpital ou un établissement public : quand l'acheteur peut commander sans publicité ni mise en concurrence (60 000 € et 100 000 € HT depuis 2026), l'écrit dès 25 000 € HT, le bon de commande et les références Chorus Pro, le délai de paiement de 30, 50 ou 60 jours, l'interruption du délai, les intérêts moratoires et l'indemnité de 40 €, l'avance, ce qu'il faut écrire dans le devis, un exemple daté et chiffré, et un calculateur gratuit.",
    publishedAt: "2026-11-17",
    readingMinutes: 39,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "tva-client-etranger-ue-export-devis-b2b",
    path: "/blog/tva-client-etranger-ue-export-devis-b2b",
    title: "TVA d'un devis pour un client étranger (UE ou export) : ce qu'il faut vérifier et écrire avant de chiffrer",
    description: "Client dans un autre pays de l'Union européenne ou hors UE : quand facturer la TVA française, quand l'exonération intracommunautaire ou à l'export s'applique, quand le client autoliquide, le numéro de TVA à obtenir et vérifier, les preuves de transport, l'état récapitulatif, les mentions de facture, le passage au code des impositions sur les biens et services au 1er janvier 2027, un exemple daté et chiffré, et un vérificateur gratuit.",
    publishedAt: "2026-11-16",
    readingMinutes: 39,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "forfait-regie-temps-passe-devis-b2b",
    path: "/blog/forfait-regie-temps-passe-devis-b2b",
    title: "Forfait, régie ou régie plafonnée : comment choisir le mode de facturation d'un devis de prestation B2B",
    description: "Un prix ferme ou du temps passé ? Forfait, régie, régie plafonnée, forfait par phase : qui porte le risque, comment chiffrer la réserve et la marge, comment écrire le périmètre, les hypothèses et l'avenant (articles 1103, 1104, 1165, 1193, 1793 et 1794 du code civil), avec un exemple daté et chiffré, ce que QuoteBuilder fait ou ne fait pas, et un comparateur gratuit.",
    publishedAt: "2026-11-16",
    readingMinutes: 41,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "bon-a-tirer-bat-validation-avant-production-devis-b2b",
    path: "/blog/bon-a-tirer-bat-validation-avant-production-devis-b2b",
    title: "Bon à tirer, échantillon et prototype : faire valider avant de produire, ce qu'il faut écrire dans un devis B2B",
    description: "BAT fichier, épreuve, échantillon, prototype ou présérie : qui valide, par quel écrit, dans quel délai, ce que le silence du client vaut (article 1120 du code civil), ce que la validation fige, les tours de corrections inclus et facturés, le délai de livraison qui part du BAT validé, l'erreur validée par le client, exemple daté et chiffré, ce que QuoteBuilder fait ou ne fait pas, et un vérificateur gratuit.",
    publishedAt: "2026-11-13",
    readingMinutes: 24,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "plan-prevention-entreprise-exterieure-devis-b2b",
    path: "/blog/plan-prevention-entreprise-exterieure-devis-b2b",
    title: "Plan de prévention et entreprise extérieure : ce qu'il faut prévoir dans un devis B2B avant d'intervenir chez un client",
    description: "Intervenir dans l'usine, l'entrepôt ou le magasin d'un client : inspection commune préalable, plan de prévention écrit dès 400 heures sur douze mois sous-traitants compris ou pour un travail de la liste de l'arrêté du 19 mars 1993 (articles R4511-1 à R4512-16 du code du travail), protocole de sécurité pour le chargement et le déchargement (R4515-1 à R4515-11), sous-traitants à déclarer, dossier amiante, temps d'accueil à chiffrer, exemple daté et chiffré, ce que QuoteBuilder fait ou ne fait pas, et un vérificateur gratuit.",
    publishedAt: "2026-11-13",
    readingMinutes: 42,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "outillage-specifique-moule-propriete-amortissement-devis-b2b",
    path: "/blog/outillage-specifique-moule-propriete-amortissement-devis-b2b",
    title: "Outillage spécifique et moules dans un devis B2B : amortissement, propriété, garde et restitution, ce qu'il faut écrire avant de lancer l'outil",
    description: "Moule, matrice, gabarit, montage ou cliché fabriqué pour un seul client : facturer l'outillage à part, l'amortir dans le prix des pièces ou mélanger les deux, calculer le reste à amortir si les commandes s'arrêtent, fixer le propriétaire et le moment du transfert (articles 1196 et 1583 du code civil), la garde chez le fabricant (dépôt, articles 1915 à 1948), l'assurance, l'usure, la restitution et le droit de rétention (article 2286), avec un exemple daté et chiffré, ce que QuoteBuilder fait ou ne fait pas, et un calculateur gratuit.",
    publishedAt: "2026-11-12",
    readingMinutes: 45,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "reception-travaux-proces-verbal-reserves-devis-b2b",
    path: "/blog/reception-travaux-proces-verbal-reserves-devis-b2b",
    title: "Réception des travaux en B2B : procès-verbal, réserves, levée et garanties, ce qu'il faut prévoir dès le devis",
    description: "La réception des travaux entre professionnels : définition de l'article 1792-6 du code civil, procès-verbal contradictoire, réception avec ou sans réserves, tacite ou judiciaire, délai de levée fixé d'un commun accord, garantie de parfait achèvement d'un an, bon fonctionnement de deux ans (1792-3), décennale de dix ans (1792-4-1), équipements professionnels exclus (1792-7), clauses réputées non écrites (1792-5), risques avant livraison (1788), retenue de garantie libérée à un an (loi n° 71-584), exemple daté et chiffré, et ce que QuoteBuilder fait ou ne fait pas, avec un vérificateur gratuit.",
    publishedAt: "2026-11-12",
    readingMinutes: 40,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "cotraitance-groupement-entreprises-devis-b2b",
    path: "/blog/cotraitance-groupement-entreprises-devis-b2b",
    title: "Cotraitance et groupement d'entreprises dans un devis B2B : forme, solidarité, mandataire et répartition, ce qu'il faut écrire avant l'acceptation",
    description: "Répondre à plusieurs entreprises à une même demande de devis : cotraitance ou sous-traitance, groupement conjoint, conjoint avec mandataire solidaire ou solidaire, solidarité qui ne se présume pas en droit civil (article 1310) mais se présume entre commerçants, pouvoirs du mandataire (articles 1984 à 1993), répartition par parts égales faute d'écrit (article 1309), défaillance d'un membre (articles 1313 et 1317 à 1319), exemple daté et chiffré, et ce que QuoteBuilder fait ou ne fait pas, avec un calculateur gratuit.",
    publishedAt: "2026-11-11",
    readingMinutes: 40,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "cession-creance-affacturage-dailly-devis-b2b",
    path: "/blog/cession-creance-affacturage-dailly-devis-b2b",
    title: "Céder une facture B2B : cession de créance, Dailly et affacturage, ce qu'il faut prévoir dès le devis",
    description: "Faire avancer l'argent d'une facture née d'un devis accepté : cession de créance du code civil (articles 1321 à 1326), bordereau Dailly (articles L313-23 à L313-29 du code monétaire et financier), affacturage par subrogation (articles 1346-1 et 1346-5), clause d'incessibilité nulle entre professionnels (article L442-3 c) du code de commerce), notification au client, avoirs et réserves, coût réel, exemple daté et ce que QuoteBuilder fait ou ne fait pas, avec un vérificateur gratuit.",
    publishedAt: "2026-11-11",
    readingMinutes: 35,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "erreur-prix-devis-b2b",
    path: "/blog/erreur-prix-devis-b2b",
    title: "Erreur de prix dans un devis B2B : total faux, prix unitaire, oubli ou mauvaise estimation, ce qui se corrige et ce qui engage",
    description: "Erreur de prix dans un devis entre professionnels : devis pas encore envoyé, envoyé, accepté ou en cours d'exécution, total qui ne correspond pas aux lignes, prix unitaire mal saisi, quantité fausse, poste oublié, sous-estimation, prix confirmé, marché à forfait (article 1793), erreur sur la valeur (article 1136), interprétation (articles 1188 à 1192), exemple daté fabricant de rayonnage, et ce que QuoteBuilder fait ou ne fait pas, avec un vérificateur gratuit.",
    publishedAt: "2026-11-10",
    readingMinutes: 44,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "rupture-brutale-relations-commerciales-devis-b2b",
    path: "/blog/rupture-brutale-relations-commerciales-devis-b2b",
    title: "Rupture brutale d'une relation commerciale établie : préavis écrit, durée, dépendance et devis récurrents B2B",
    description: "Article L442-1 II du code de commerce dans une relation B2B faite de devis et de commandes récurrentes : ce qu'est une relation établie, le préavis écrit, la durée selon l'ancienneté et la dépendance, le plafond de dix-huit mois, la rupture partielle, le préavis effectif, le calcul de la perte de marge, les juridictions spécialisées, un exemple daté et ce que QuoteBuilder fait ou ne fait pas, avec un calculateur gratuit.",
    publishedAt: "2026-11-10",
    readingMinutes: 36,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "compensation-creances-deduction-facture-devis-b2b",
    path: "/blog/compensation-creances-deduction-facture-devis-b2b",
    title: "Compensation de créances dans un devis B2B : quand le client paie la facture « moins » une somme, ce que dit le code civil et ce qu'il faut écrire",
    description: "Compensation de créances entre professionnels (articles 1347 à 1348-2 du code civil) : facture payée moins des pénalités, un avoir ou une remise, réciprocité, certitude, liquidité, exigibilité, clause de compensation, connexité, procédure collective, affacturage, pénalités logistiques (L441-17), exemple daté fabricant de rayonnage, et ce que QuoteBuilder fait ou ne fait pas, avec un vérificateur gratuit.",
    publishedAt: "2026-11-09",
    readingMinutes: 43,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "sous-traitance-loi-1975-paiement-direct-devis-b2b",
    path: "/blog/sous-traitance-loi-1975-paiement-direct-devis-b2b",
    title: "Sous-traitance et loi de 1975 dans un devis B2B : acceptation, caution, action directe et paiement direct",
    description: "Loi n° 75-1334 du 31 décembre 1975 dans un devis entre professionnels : qui est sous-traitant, acceptation et agrément des conditions de paiement par le maître de l'ouvrage, caution ou délégation, action directe, paiement direct en marché public, obligations du maître de l'ouvrage (article 14-1), exemple daté d'un chantier de rayonnage, et ce que QuoteBuilder fait ou ne fait pas, avec un vérificateur gratuit.",
    publishedAt: "2026-11-09",
    readingMinutes: 37,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "exception-inexecution-devis-b2b",
    path: "/blog/exception-inexecution-devis-b2b",
    title: "Exception d'inexécution dans un devis B2B : articles 1219 et 1220, gravité, notification, et ce qu'il faut écrire",
    description: "Exception d'inexécution (articles 1219 et 1220 du code civil) dans un devis entre professionnels : refus réactif ou suspension anticipée, gravité, réciprocité, notification dans les meilleurs délais, proportionnalité, risques d'abus, articulation avec la résolution, exemple daté fabricant de rayonnage, et ce que QuoteBuilder fait ou ne fait pas, avec un vérificateur gratuit.",
    publishedAt: "2026-11-06",
    readingMinutes: 30,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "clause-resolutoire-devis-b2b",
    path: "/blog/clause-resolutoire-devis-b2b",
    title: "Clause résolutoire dans un devis B2B : articles 1224 à 1226, mise en demeure, et ce qui tient vraiment",
    description: "Clause résolutoire de plein droit, résolution unilatérale et résolution judiciaire dans un devis entre professionnels : articles 1224, 1225 et 1226 du code civil, mise en demeure qui cite la clause, gravité de l'inexécution, bonne foi, restitutions, exemple daté d'un fabricant de rayonnage, et ce que QuoteBuilder fait ou ne fait pas, avec un vérificateur gratuit.",
    publishedAt: "2026-11-06",
    readingMinutes: 29,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "force-majeure-imprevision-devis-b2b",
    path: "/blog/force-majeure-imprevision-devis-b2b",
    title: "Force majeure et imprévision dans un devis B2B : article 1218, article 1195, et ce qu'il faut écrire dans la clause",
    description: "Force majeure (article 1218 du code civil) et imprévision (article 1195) dans un devis entre professionnels : trois conditions de la force majeure, suspension ou résolution, renégociation et risque accepté, clauses d'aménagement, notification, exemple daté d'un fabricant de menuiserie aluminium, arrêts COVID sur les loyers, et ce que QuoteBuilder fait ou ne fait pas, avec un vérificateur gratuit.",
    publishedAt: "2026-11-05",
    readingMinutes: 31,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "clause-attributive-juridiction-mediation-devis-b2b",
    path: "/blog/clause-attributive-juridiction-mediation-devis-b2b",
    title: "Clause attributive de juridiction et médiation préalable dans un devis B2B : quel tribunal, quelle étape amiable, et ce qui tient vraiment",
    description: "Clause attributive de compétence et clause de médiation ou de conciliation préalable dans un devis entre professionnels : l'article 48 du code de procédure civile (commerçants seulement, clause très apparente), le cas de l'artisan (Cass. com., 11 mai 1993), la typographie (Cass. com., 20 avril 2017), la fin de non-recevoir (Cass. ch. mixte, 14 février 2003 et 12 décembre 2014), la clause trop vague (Cass. com., 29 avril 2014 et 30 mai 2018), les modes amiables réécrits au 1er septembre 2025, l'urgence, la prescription, l'arbitrage, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-11-05",
    readingMinutes: 32,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "clause-non-sollicitation-personnel-devis-b2b",
    path: "/blog/clause-non-sollicitation-personnel-devis-b2b",
    title: "Clause de non-sollicitation du personnel dans un devis B2B : quand elle tient, combien de temps, et qui doit la justifier",
    description: "Clause de non-sollicitation ou de non-débauchage entre entreprises : proportionnalité aux intérêts légitimes (Cass. com., 27 mai 2021 et 23 septembre 2026), charge de la preuve, salarié tiers au contrat (Cass. soc., 2 mars 2011), travail temporaire (article L1251-44), durée, personnes visées, indemnité et clause pénale, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-11-04",
    readingMinutes: 33,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "accord-confidentialite-nda-avant-devis-b2b",
    path: "/blog/accord-confidentialite-nda-avant-devis-b2b",
    title: "Accord de confidentialité (NDA) avant un devis B2B : protéger ses plans, ses fichiers et son savoir-faire avant de demander un prix",
    description: "Envoyer un plan, un fichier 3D ou un cahier des charges pour obtenir un devis, c'est confier une information qui a de la valeur. Ce que dit le droit sans contrat (article 1112-2 du code civil, secret des affaires L151-1 et suivants), ce qu'un accord de confidentialité doit écrire (définition, exclusions, finalité, rétro-ingénierie, destinataires, durée, restitution, clause pénale), le brevet et l'e-Soleau, la preuve du préjudice (Cass. com., 7 mai 2019), un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-11-04",
    readingMinutes: 28,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "clause-limitation-responsabilite-devis-b2b",
    path: "/blog/clause-limitation-responsabilite-devis-b2b",
    title: "Clause de limitation de responsabilité dans un devis B2B : ce qui tient, ce qui tombe, et comment l'écrire",
    description: "Clause limitative de responsabilité entre professionnels : plafond, préjudices exclus, obligation essentielle (article 1170, Chronopost, Faurecia), faute lourde, produits défectueux (article 1245-14), acceptation des CGV, contrat d'adhésion, délai pour agir (article 2254), client consommateur, assurance, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-11-03",
    readingMinutes: 31,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "cession-droits-auteur-devis-b2b",
    path: "/blog/cession-droits-auteur-devis-b2b",
    title: "Cession de droits d'auteur dans un devis B2B : photos, vidéos, graphisme, ce qu'il faut écrire pour pouvoir vraiment s'en servir",
    description: "Payer un reportage photo, une vidéo ou un logo ne transfère pas les droits d'auteur. Ce qu'une clause de cession doit dire dans un devis B2B (droits nommés, supports, destination, territoire, durée, rémunération selon l'article L131-4), le nom de l'auteur, les œuvres futures, les agences, le droit à l'image, la contribution diffuseur, l'arrêt Vittel de 2006, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-11-03",
    readingMinutes: 28,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "obligation-vigilance-attestation-urssaf-devis-b2b",
    path: "/blog/obligation-vigilance-attestation-urssaf-devis-b2b",
    title: "Obligation de vigilance et attestation Urssaf : ce que le devis doit prévoir, et comment la vérifier",
    description: "Obligation de vigilance du donneur d'ordre : le seuil de 5 000 € HT, les pièces exactes de l'article D. 8222-5, l'attestation Urssaf de moins de six mois, le contrôle d'authenticité, le renouvellement tous les six mois, la solidarité financière, ce que refuse la Cour de cassation, le nouvel article L. 8222-1-1 de 2026, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-11-02",
    readingMinutes: 30,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "cgv-conditions-achat-client-devis-b2b",
    path: "/blog/cgv-conditions-achat-client-devis-b2b",
    title: "Vos CGV contre les conditions d'achat du client : quelle clause s'applique à votre devis ?",
    description: "Votre devis renvoie à vos CGV, le bon de commande du client à ses conditions générales d'achat : l'article 1119 du code civil, le bon de commande qui vaut nouvelle offre, les clauses qui se neutralisent, la réserve de propriété refusée (Cass. com., 11 février 2026), le tribunal compétent, les délais de paiement de l'article L441-10, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-11-02",
    readingMinutes: 27,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "attestation-assurance-decennale-devis-b2b",
    path: "/blog/attestation-assurance-decennale-devis-b2b",
    title: "Attestation d'assurance décennale et devis : ce qu'elle doit couvrir, et comment la vérifier",
    description: "Attestation d'assurance décennale jointe au devis : qui doit la fournir, les mentions du modèle de 2016, les activités déclarées, la date d'ouverture du chantier, le coût total de l'opération, la zone géographique, les sous-traitants, les ouvrages exclus, la sanction de six mois et 75 000 €, ce que dit la Cour de cassation, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-10-30",
    readingMinutes: 23,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "travaux-supplementaires-avenant-devis-b2b",
    path: "/blog/travaux-supplementaires-avenant-devis-b2b",
    title: "Travaux supplémentaires et avenant au devis : ce qui se paie, ce qui se perd, et comment l'écrire",
    description: "Le client demande « en plus » pendant le chantier : comment faire payer des travaux supplémentaires sans litige. Marché à forfait et article 1793 du Code civil, autorisation écrite et prix convenu, acceptation expresse après exécution, silence au décompte (Cass. 3e civ., 8 juin 2023), bouleversement de l'économie du contrat, travaux hors construction de bâtiment, preuve entre professionnels, client public et avenant R2194-8, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-10-30",
    readingMinutes: 26,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "autoliquidation-tva-sous-traitance-btp-devis-b2b",
    path: "/blog/autoliquidation-tva-sous-traitance-btp-devis-b2b",
    title: "Autoliquidation de la TVA en sous-traitance BTP : ce que doivent dire votre devis et votre facture",
    description: "Sous-traitance dans le bâtiment : quand le sous-traitant facture hors taxes avec la mention « Autoliquidation » et quand l'entreprise principale déclare et déduit la TVA (article 283, 2 nonies du CGI). Les trois conditions, les travaux concernés et exclus, la règle du contrat unique, la franchise en base, la sanction de 5 %, le passage au CIBS en 2027, la clause à écrire dans le devis, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-10-29",
    readingMinutes: 25,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "contrat-cadre-bordereau-prix-unitaires-devis-b2b",
    path: "/blog/contrat-cadre-bordereau-prix-unitaires-devis-b2b",
    title: "Contrat-cadre et bordereau de prix unitaires : chiffrer un client récurrent sans refaire un devis à chaque commande",
    description: "Client récurrent : comment passer d'un devis par commande à un contrat-cadre avec bordereau de prix unitaires et bons de commande. Ce que disent les articles 1111, 1164 et 1165 du Code civil sur le prix, l'abus et la motivation, les remises sur volume par tranche ou globales, l'effet de seuil, le rappel de prix et la ristourne de fin de période, l'engagement de volume et la clause pénale, l'accord-cadre public, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-10-29",
    readingMinutes: 26,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "garantie-paiement-1799-1-devis-travaux-b2b",
    path: "/blog/garantie-paiement-1799-1-devis-travaux-b2b",
    title: "Garantie de paiement de l'article 1799-1 : ce que votre client doit fournir au-delà de 12 000 € HT de travaux",
    description: "Au-delà de 12 000 € HT, le client professionnel d'un marché de travaux privé doit garantir le paiement de l'entreprise (article 1799-1 du Code civil) : versement direct d'un crédit dédié ou caution solidaire. Qui est concerné, comment calculer le seuil, quand la demander, la mise en demeure et la suspension du chantier après quinze jours, le cas du sous-traitant, la clause à mettre dans le devis, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-10-28",
    readingMinutes: 25,
    tags: ["relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "facturation-electronique-2026-devis-b2b-tpe-pme",
    path: "/blog/facturation-electronique-2026-devis-b2b-tpe-pme",
    title: "Facturation électronique 2026 : ce qui change pour une TPE ou une PME qui fait des devis B2B, de la demande à la facture",
    description: "Réception obligatoire depuis le 1er septembre 2026, émission au 1er septembre 2027 pour les PME et micro-entreprises, quatre nouvelles mentions, e-reporting des paiements pour les prestataires de services, amendes revues par la loi de finances 2026. Ce que la réforme change au devis, ce qu'elle ne change pas, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-10-28",
    readingMinutes: 20,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "prescription-facture-impayee-devis-b2b",
    path: "/blog/prescription-facture-impayee-devis-b2b",
    title: "Facture impayée entre professionnels : cinq ans pour agir, et ce qui fait courir, arrêter ou repartir la prescription",
    description: "Une facture B2B impayée se prescrit en principe par cinq ans (L110-4 du Code de commerce), deux ans contre un consommateur. Le point de départ selon la Cour de cassation, le calcul du dernier jour, pourquoi une mise en demeure ne suffit pas, ce qui interrompt ou suspend le délai, le butoir de vingt ans, les procédures de recouvrement en 2026, un exemple daté et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-10-27",
    readingMinutes: 26,
    tags: ["relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "retractation-hors-etablissement-tpe-devis-b2b",
    path: "/blog/retractation-hors-etablissement-tpe-devis-b2b",
    title: "Rétractation hors établissement entre professionnels : la règle des cinq salariés, expliquée sur un devis B2B",
    description: "Un devis signé chez un client de cinq salariés ou moins peut ouvrir 14 jours de rétractation. Les trois conditions de l'article L221-3, le calcul du délai, les sept jours sans paiement, les mentions du devis et un exemple daté.",
    publishedAt: "2026-10-27",
    readingMinutes: 23,
    tags: ["catalogue","relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "prix-vente-coefficient-debourse-sec-devis-b2b",
    path: "/blog/prix-vente-coefficient-debourse-sec-devis-b2b",
    title:
      "Calculer le prix de vente d'un devis B2B : déboursé sec, frais généraux, coefficient, taux de marge et taux de marque",
    description:
      "Partir du déboursé sec, ajouter la juste part des frais généraux et un bénéfice, en tirer un coefficient de vente : la méthode pas à pas pour chiffrer un devis B2B sans se tromper de base. La différence entre taux de marge et taux de marque selon l'Insee, l'erreur du pourcentage ajouté au coût, le prix plancher, ce que disent la liberté des prix (L410-2), la revente à perte (L442-5), l'article 1165 du Code civil et le marché à forfait (1793), un exemple chiffré et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-10-26",
    readingMinutes: 22,
    tags: ["catalogue"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.produits,
    pinned: false,
  },
  {
    slug: "reconduction-tacite-preavis-resiliation-devis-b2b",
    path: "/blog/reconduction-tacite-preavis-resiliation-devis-b2b",
    title:
      "Reconduction tacite et préavis dans un devis B2B : durée, renouvellement, résiliation et rupture brutale",
    description:
      "Contrat d'entretien, de maintenance ou de nettoyage signé pour un an puis « reconduit tacitement » : ce qu'il faut écrire dans le devis pour que la durée, la reconduction et le préavis soient clairs. Ce que disent les articles 1210 à 1215 du Code civil, la jurisprudence sur le contenu du contrat reconduit, la rupture brutale de l'article L442-1 II du Code de commerce, pourquoi la loi Chatel ne protège pas un client professionnel, un exemple chiffré de préavis manqué et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-10-26",
    readingMinutes: 19,
    tags: ["catalogue", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "frais-port-franco-incoterms-devis-b2b",
    path: "/blog/frais-port-franco-incoterms-devis-b2b",
    title:
      "Frais de port et franco dans un devis B2B : fixer le seuil, choisir l'Incoterm, savoir qui porte les risques",
    description:
      "Port payé, port dû, franco à partir d'un montant : ce qu'il faut écrire dans un devis B2B pour que le transport ne mange pas la marge et ne finisse pas en litige. Ce que disent les articles 1604 à 1609 du Code civil sur la délivrance, les Incoterms® 2020, la responsabilité du transporteur (L133-1), les trois jours pour protester (L133-3), l'action directe du voiturier (L132-8), les plafonds du contrat type, un exemple chiffré de seuil franco et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-10-23",
    readingMinutes: 21,
    tags: ["catalogue", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "garantie-vices-caches-sav-devis-b2b",
    path: "/blog/garantie-vices-caches-sav-devis-b2b",
    title:
      "Garantie et SAV dans un devis B2B : vices cachés, garantie contractuelle, clauses limitatives et coût à prévoir",
    description:
      "Entre professionnels, la garantie ne se résume pas à « 1 an pièces ». Ce que disent les articles 1603, 1604 et 1641 à 1649 du Code civil, le délai de deux ans et le butoir de vingt ans (chambre mixte, 21 juillet 2023), la présomption de connaissance du vendeur professionnel, ce qu'une clause limitative peut faire ou pas, comment écrire la garantie dans le devis, comment chiffrer le SAV, et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-10-23",
    readingMinutes: 15,
    tags: ["catalogue", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "clause-reserve-propriete-devis-b2b",
    path: "/blog/clause-reserve-propriete-devis-b2b",
    title:
      "Clause de réserve de propriété dans un devis B2B : quand elle protège, comment l'écrire, ce qu'elle ne couvre pas",
    description:
      "Vous livrez avant d'être payé : la clause de réserve de propriété vous garde propriétaire jusqu'au paiement complet. Ce que disent les articles 2367 à 2372 du Code civil et L624-16 du Code de commerce, pourquoi elle doit être acceptée par écrit au plus tard à la livraison (la facture ne suffit pas), le délai de trois mois en cas de procédure collective, les biens incorporés ou revendus, un exemple chiffré, un modèle de clause et ce que QuoteBuilder fait, ou pas.",
    publishedAt: "2026-10-22",
    readingMinutes: 15,
    tags: ["catalogue", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "delai-livraison-penalites-retard-execution-devis-b2b",
    path: "/blog/delai-livraison-penalites-retard-execution-devis-b2b",
    title: "Délai de livraison et pénalités de retard dans un devis B2B : date, franchise, taux et plafond",
    description:
      "Votre devis promet un délai et la livraison arrive en retard : ce que dit le Code civil (délivrance au temps convenu, articles 1610 et 1611, sanctions de l'article 1217, mise en demeure), pourquoi une pénalité de retard est une clause pénale (article 1231-5), les repères des CCAG publics (1/3000, 1/1000, plafond de 10 %, seuil de 1 000 €), comment écrire une clause qui tient, un exemple chiffré et ce que QuoteBuilder permet, ou pas.",
    publishedAt: "2026-10-22",
    readingMinutes: 25,
    tags: ["catalogue", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "annulation-commande-devis-b2b-arrhes-dedit-clause-penale",
    path: "/blog/annulation-commande-devis-b2b-arrhes-dedit-clause-penale",
    title: "Annulation d'une commande B2B après un devis signé : arrhes, acompte, dédit et clause pénale",
    description:
      "Un client professionnel annule une commande signée : ce que vous pouvez garder selon que la somme versée est un acompte ou des arrhes (article 1590 du Code civil), la différence entre clause de dédit et clause pénale (article 1231-5), le cas du marché de travaux à forfait (article 1794), la force majeure, un barème d'annulation qui tient, un exemple chiffré et ce que QuoteBuilder permet, ou pas.",
    publishedAt: "2026-10-21",
    readingMinutes: 22,
    tags: ["catalogue", "funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "retenue-garantie-caution-devis-travaux-b2b",
    path: "/blog/retenue-garantie-caution-devis-travaux-b2b",
    title: "Retenue de garantie dans un devis de travaux B2B : 5 %, caution bancaire et libération à un an",
    description:
      "Retenue de garantie sur un marché de travaux : plafond de 5 % (loi du 16 juillet 1971), consignation obligatoire, caution bancaire à la place, libération un an après la réception, règles des marchés publics (5 %, ou 3 % pour une PME dans certains cas, remboursement sous 30 jours), calcul sur le HT ou le TTC, et ce qu'on écrit dans le devis. Avec un exemple chiffré, un calculateur et ce que QuoteBuilder permet, ou pas.",
    publishedAt: "2026-10-20",
    readingMinutes: 22,
    tags: ["catalogue", "funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.funnelPublic,
    pinned: false,
  },
  {
    slug: "conditions-paiement-penalites-retard-devis-b2b",
    path: "/blog/conditions-paiement-penalites-retard-devis-b2b",
    title: "Conditions de paiement dans un devis B2B : délai, pénalités de retard et indemnité de 40 €",
    description:
      "Conditions de paiement entre professionnels : délai de 30 jours par défaut, 60 jours maximum ou 45 jours fin de mois, pénalités de retard au taux BCE majoré de 10 points (12,40 % au second semestre 2026), plancher de trois fois l'intérêt légal, indemnité forfaitaire de 40 €, escompte, et pourquoi tout cela s'écrit dès le devis. Avec un exemple chiffré, un calculateur et ce que QuoteBuilder permet, ou pas.",
    publishedAt: "2026-10-20",
    readingMinutes: 21,
    tags: ["catalogue", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "revision-prix-indexation-devis-b2b",
    path: "/blog/revision-prix-indexation-devis-b2b",
    title:
      "Révision de prix dans un devis B2B : choisir l'indice, écrire la formule et l'annoncer dès la demande",
    description:
      "Prix ferme, actualisable ou révisable : quand une clause de révision vaut la peine, comment choisir un indice (BT, TP, prix de production, matières), écrire la formule avec ou sans partie fixe, fixer les mois de référence, un seuil et un plafond, et ce qu'on annonce au client dès la demande de devis. Avec un exemple chiffré et ce que QuoteBuilder permet pour des prix qui bougent.",
    publishedAt: "2026-10-19",
    readingMinutes: 21,
    tags: ["catalogue", "funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.produits,
    pinned: false,
  },
  {
    slug: "analyser-devis-perdus-motifs-perte-b2b",
    path: "/blog/analyser-devis-perdus-motifs-perte-b2b",
    title: "Devis perdus : noter le motif, compter les pertes et corriger ce qui peut l'être",
    description:
      "Devis perdus en B2B : une liste courte de motifs de perte, quand les noter et que demander au client, comment calculer le taux de gain sans se tromper, quoi faire pour chaque motif (prix, délai, concurrent, silence, projet reporté, hors cible) et comment tenir une revue trimestrielle des pertes.",
    publishedAt: "2026-10-19",
    readingMinutes: 20,
    tags: ["relances", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "zone-intervention-frais-deplacement-devis-b2b",
    path: "/blog/zone-intervention-frais-deplacement-devis-b2b",
    title:
      "Zone d'intervention et frais de déplacement : chiffrer le trajet, dessiner ses zones et l'annoncer dès la demande de devis",
    description:
      "Frais de déplacement dans un devis B2B : le vrai coût d'un trajet (véhicule, temps d'équipe, allers-retours, péages), des zones d'intervention simples, absorber, forfaitiser ou refacturer, quoi écrire sur le devis, et comment poser la zone dans un funnel de demande de devis.",
    publishedAt: "2026-10-16",
    readingMinutes: 19,
    tags: ["funnel", "catalogue"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.produits,
    pinned: false,
  },
  {
    slug: "salon-professionnel-demandes-devis-b2b",
    path: "/blog/salon-professionnel-demandes-devis-b2b",
    title:
      "Salon professionnel : transformer les contacts du stand en demandes de devis, avec un QR code, un funnel et une relance qui part le jour même",
    description:
      "Salon professionnel B2B : pourquoi les badges et les cartes de visite donnent si peu de devis, comment prendre une vraie demande sur le stand (QR code vers un funnel, lien tagué utm, tablette en navigation privée), relancer le soir même et calculer le coût par demande et par client.",
    publishedAt: "2026-10-16",
    readingMinutes: 19,
    tags: ["funnel", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.funnelPublic,
    pinned: false,
  },
  {
    slug: "email-confirmation-demande-devis-b2b",
    path: "/blog/email-confirmation-demande-devis-b2b",
    title:
      "Email de confirmation d'une demande de devis B2B : quoi écrire, trois modèles et les réglages à vérifier",
    description:
      "L'accusé de réception d'une demande de devis entre professionnels : ce que le client y cherche, les sept éléments à mettre, ce qu'il faut laisser dehors, trois modèles à adapter, et comment QuoteBuilder envoie ce message.",
    publishedAt: "2026-10-15",
    readingMinutes: 15,
    tags: ["relances", "funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.automations,
    pinned: false,
  },
  {
    slug: "devis-payant-etude-prealable-b2b",
    path: "/blog/devis-payant-etude-prealable-b2b",
    title:
      "Devis payant en B2B : quand faire payer l'étude, comment l'annoncer et ce que ça change sur vos demandes",
    description:
      "Faire payer un devis ou une étude préalable entre professionnels : ce que dit la règle, les cas où ça se justifie, comment l'annoncer avant le chiffrage, combien demander, la déduction de la commande, et comment le poser dans un funnel QuoteBuilder.",
    publishedAt: "2026-10-15",
    readingMinutes: 16,
    tags: ["funnel", "catalogue"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.funnelPublic,
    pinned: false,
  },
  {
    slug: "espace-membres-portail-client-devis-b2b",
    path: "/blog/espace-membres-portail-client-devis-b2b",
    title: "Espace membres : un portail où vos clients B2B retrouvent tous leurs devis, documents et liens",
    description:
      "Ce que voit un client connecté à l'espace membres, comment il s'y connecte avec l'email du devis et son code PIN, comment créer et remplir l'espace, ce que lisent vos clients quand vous changez un statut, et les limites à connaître avant de publier.",
    publishedAt: "2026-10-14",
    readingMinutes: 15,
    tags: ["funnel", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "import-catalogue-csv-funnel-devis-b2b",
    path: "/blog/import-catalogue-csv-funnel-devis-b2b",
    title: "Importer son catalogue en CSV pour un funnel de devis B2B : colonnes, SKU, prix et pièges d'Excel",
    description:
      "Colonnes reconnues, rôle du SKU, prix fixes ou en fourchette, ce que la mise à jour efface, et les pièges d'un fichier Excel français : point-virgule, encodage, zéros perdus. Avec un vérificateur gratuit.",
    publishedAt: "2026-10-14",
    readingMinutes: 15,
    tags: ["catalogue", "integrations"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.produits,
    pinned: false,
  },
  {
    slug: "roles-permissions-equipe-demande-devis-b2b",
    path: "/blog/roles-permissions-equipe-demande-devis-b2b",
    title: "Rôles et permissions d'équipe : traiter les demandes de devis B2B sans tout ouvrir à tout le monde",
    description:
      "Propriétaire, Admin, Commercial : ce que chaque rôle ouvre écran par écran, comment inviter, changer un rôle ou retirer un accès depuis Équipe, ce que le rôle Commercial ne cache pas et une répartition simple selon la taille de l'équipe.",
    publishedAt: "2026-10-13",
    readingMinutes: 16,
    tags: ["funnel", "catalogue"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.accueil,
    pinned: false,
  },
  {
    slug: "segments-campagnes-email-demande-devis-b2b",
    path: "/blog/segments-campagnes-email-demande-devis-b2b",
    title: "Segments et campagnes email sur des demandes de devis B2B : écrire à un groupe sans polluer le parcours",
    description:
      "Autopilote, campagnes et segments ne font pas le même travail. Champs, opérateurs, consentement marketing, fenêtre de 30 jours, et ce que le bilan d'envoi affiche vraiment.",
    publishedAt: "2026-10-13",
    readingMinutes: 16,
    tags: ["funnel", "integrations"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisListe,
    pinned: false,
  },
  {
    slug: "autopilote-workflows-relance-demande-devis-b2b",
    path: "/blog/autopilote-workflows-relance-demande-devis-b2b",
    title: "Autopilote et workflows : relancer chaque demande de devis B2B sans y penser",
    description:
      "Confirmation, rappel interne, relances et reprise des abandons : le canvas de l'Autopilote, ses trois déclencheurs, ses sept étapes, les huit emails fournis, les deux parcours livrés par défaut et ce que l'outil ne fait pas.",
    publishedAt: "2026-10-12",
    readingMinutes: 15,
    tags: ["relances", "funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.automations,
    pinned: false,
  },
  {
    slug: "google-ads-demande-devis-b2b-cout-par-client",
    path: "/blog/google-ads-demande-devis-b2b-cout-par-client",
    title: "Google Ads et demande de devis B2B : mesurer le coût par devis et le coût par client",
    description:
      "Coût par devis, coût par client, plafond calculé sur la marge, rattachement au clic (gclid, UTM), conversions renvoyées à Google Ads et lecture des chiffres : ce que fait QuoteBuilder et ce qu'il ne fait pas.",
    publishedAt: "2026-10-09",
    readingMinutes: 13,
    tags: ["integrations", "funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.integrations,
    pinned: false,
  },
  {
    slug: "rgpd-demande-devis-b2b-consentement-conservation",
    path: "/blog/rgpd-demande-devis-b2b-consentement-conservation",
    title: "RGPD et demande de devis B2B : ce que votre formulaire doit dire, garder et effacer",
    description:
      "Base légale, mention d'information, case de consentement, durée de conservation, effacement, fichiers joints et cookies : ce que QuoteBuilder fait aujourd'hui et ce qui reste à votre charge.",
    publishedAt: "2026-10-09",
    readingMinutes: 13,
    tags: ["funnel", "integrations"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.accueil,
    pinned: false,
  },
  {
    slug: "webhook-demande-devis-crm-signature-hmac",
    path: "/blog/webhook-demande-devis-crm-signature-hmac",
    title: "Webhook de demande de devis : envoyer chaque demande vers votre CRM, signée et vérifiable",
    description:
      "Ce que le webhook QuoteBuilder envoie à chaque demande, comment vérifier la signature HMAC SHA-256, pourquoi il n'y a qu'une tentative et comment faire remonter les statuts par l'API.",
    publishedAt: "2026-10-07",
    readingMinutes: 13,
    tags: ["integrations", "funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.integrations,
    pinned: false,
  },
  {
    slug: "mesurer-funnel-devis-b2b-entonnoir-statistiques",
    path: "/blog/mesurer-funnel-devis-b2b-entonnoir-statistiques",
    title: "Mesurer un funnel de devis B2B : de la visite à l'affaire gagnée, marche par marche",
    description:
      "Comment mesurer un funnel de demande de devis B2B : les sept marches de l'entonnoir (visiteurs, commencé, email, complété, devis, rappelé, gagné), les taux de passage à suivre, où les lire dans les Statistiques de QuoteBuilder, les pièges de lecture et ce que GA4 ou Google Ads ajoutent.",
    publishedAt: "2026-10-07",
    readingMinutes: 13,
    tags: ["funnel", "integrations"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.accueil,
    pinned: false,
  },
  {
    slug: "demande-devis-abandonnee-funnel-reprise",
    path: "/blog/demande-devis-abandonnee-funnel-reprise",
    title: "Demande de devis abandonnée en cours de funnel : capter l'email, relancer, faire reprendre",
    description:
      "Une demande de devis B2B commencée puis laissée en plan n'est pas perdue si l'email a été laissé. Pourquoi les prospects s'arrêtent, ce qu'on peut récupérer, comment QuoteBuilder sauvegarde la session, la relance après une heure d'inactivité, le lien de reprise, la page Sessions et les limites à connaître.",
    publishedAt: "2026-10-06",
    readingMinutes: 13,
    tags: ["relances", "funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.funnelPublic,
    pinned: false,
  },
  {
    slug: "fourchette-prix-indicative-demande-devis-b2b",
    path: "/blog/fourchette-prix-indicative-demande-devis-b2b",
    title:
      "Fourchette de prix indicative dans une demande de devis B2B : donner un ordre de grandeur sans s'engager",
    description:
      "Afficher une fourchette de prix (prix min, prix max) avant le devis B2B : pourquoi les acheteurs la cherchent, prix fixe, fourchette ou sur devis, où elle apparaît dans QuoteBuilder (parcours, fiche devis, espace prospect, PDF), comment la calculer et ce qu'elle ne remplace pas.",
    publishedAt: "2026-10-06",
    readingMinutes: 13,
    tags: ["catalogue", "funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.produits,
    pinned: false,
  },
  {
    slug: "funnel-devis-chat-ia-vs-formulaire-etapes-b2b",
    path: "/blog/funnel-devis-chat-ia-vs-formulaire-etapes-b2b",
    title: "Funnel de devis en chat IA ou formulaire par étapes : lequel choisir en B2B",
    description:
      "Chat IA ou formulaire par étapes pour vos demandes de devis B2B : ce que chaque mode capte, comment les réponses du chat alimentent le dossier (et pourquoi les réponses de formulaire priment), quand choisir l'un ou l'autre.",
    publishedAt: "2026-10-05",
    readingMinutes: 13,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.funnelPublic,
    pinned: false,
  },
  {
    slug: "regles-suggestion-produits-funnel-devis-b2b",
    path: "/blog/regles-suggestion-produits-funnel-devis-b2b",
    title:
      "Règles de suggestion produits dans un funnel de devis B2B : proposer le bon produit sans alourdir le formulaire",
    description:
      "Comment écrire les règles Si/Alors qui choisissent les produits suggérés dans un funnel de devis B2B : conditions, priorité, limite de 3 blocs, options et produits liés. Ce que les règles font, et ce qu'elles ne font pas.",
    publishedAt: "2026-10-05",
    readingMinutes: 13,
    tags: ["funnel", "catalogue"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.produits,
    pinned: false,
  },
  {
    slug: "notes-internes-dossier-devis-equipe-b2b",
    path: "/blog/notes-internes-dossier-devis-equipe-b2b",
    title:
      "Notes internes sur un dossier devis B2B : garder le contexte équipe sans polluer le fil prospect",
    description:
      "Notes internes sur un dossier devis B2B : comment garder le contexte équipe (marge, risque, handoff) hors du fil prospect. Process métier + modèle QuoteBuilder (notes sur le dossier, chat fil plat, relecteurs).",
    publishedAt: "2026-10-02",
    readingMinutes: 14,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "transfert-brief-commercial-technique-devis-b2b",
    path: "/blog/transfert-brief-commercial-technique-devis-b2b",
    title: "Transfert brief commercial → technique : réduire les allers-retours sur un devis B2B",
    description:
      "Handoff commercial ↔ technique / bureau d'études sur un devis B2B : comment un brief funnel (photos, besoin, options, score Hot/Warm/Cold, espace prospect, relecteurs) réduit re-qualifs et erreurs de chiffrage. Sans inventer un chat interne.",
    publishedAt: "2026-10-02",
    readingMinutes: 13,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "sources-demande-devis-b2b-funnel-api",
    path: "/blog/sources-demande-devis-b2b-funnel-api",
    title: "Sources d'une demande de devis B2B : funnel, API, intégrations (sans double saisie)",
    description:
      "D'où viennent vraiment les demandes de devis B2B (funnel, API, plugins, préfill) et pourquoi la double saisie mail → Excel → logiciel tue la qualité du brief. Process métier + modèle sain.",
    publishedAt: "2026-10-01",
    readingMinutes: 14,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.funnelPublic,
    pinned: false,
  },
  {
    slug: "telephone-whatsapp-vers-brief-devis-b2b",
    path: "/blog/telephone-whatsapp-vers-brief-devis-b2b",
    title:
      "Téléphone et WhatsApp vers brief devis B2B : transformer une demande orale en dossier chiffrable",
    description:
      "Transformer un appel, un WhatsApp ou un SMS en brief devis B2B chiffrable : script de qualification, checklist collable, bascule vers funnel ou préremplissage URL, score Hot/Warm/Cold, assignation et relances. Sans inventer un module WhatsApp.",
    publishedAt: "2026-10-01",
    readingMinutes: 13,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "statuts-pipeline-devis-b2b",
    path: "/blog/statuts-pipeline-devis-b2b",
    title:
      "Les 7 statuts d'un pipeline devis B2B (et pourquoi « Accepté » / « Signé » ne sont pas des statuts)",
    description:
      "Process métier pour nommer et faire vivre les 7 statuts CRM d'un pipeline devis (Commencée → Gagné/Perdu) : playbook, anti-patterns, sans confondre Accepté / Signé.",
    publishedAt: "2026-09-30",
    readingMinutes: 14,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "visite-technique-avant-devis-b2b",
    path: "/blog/visite-technique-avant-devis-b2b",
    title: "Visite technique avant devis B2B : quand y aller (et quand s'en passer)",
    description:
      "Quand (et quand ne pas) faire une visite technique avant de chiffrer un devis B2B : funnel et libellé automatique pour filtrer les déplacements inutiles, hypothèses écrites si on chiffre sans visite, relance après visite.",
    publishedAt: "2026-09-30",
    readingMinutes: 13,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "tva-ht-ttc-devis-b2b-france",
    path: "/blog/tva-ht-ttc-devis-b2b-france",
    title: "HT, TTC et TVA sur un devis B2B en France : afficher clair sans se tromper",
    description:
      "Comment afficher HT, TTC et TVA sur un devis B2B en France. Bonnes pratiques générales, et fourchette indicative dans QuoteBuilder. Pas un conseil fiscal.",
    publishedAt: "2026-09-29",
    readingMinutes: 13,
    tags: ["funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "approbation-client-multi-decideurs-devis-b2b",
    path: "/blog/approbation-client-multi-decideurs-devis-b2b",
    title: "Approbation client multi-décideurs sur un devis B2B : achats, technique, finance, direction",
    description:
      "Devis B2B relu par plusieurs décideurs : lien partagé, invitations, badges En attente / Consulté / Validé / Modifications, commentaire et budget max.",
    publishedAt: "2026-09-29",
    readingMinutes: 13,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "suivi-ouverture-lecture-devis-en-ligne-b2b",
    path: "/blog/suivi-ouverture-lecture-devis-en-ligne-b2b",
    title: "Devis en ligne B2B : dernière consultation, relecteurs et relances utiles",
    description:
      "Lien de devis plutôt qu’un PDF : dernière consultation sur la fiche, relecteurs, notifications de validation. Relancer sur ces signaux.",
    publishedAt: "2026-09-28",
    readingMinutes: 19,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "validation-interne-avant-envoi-devis-b2b",
    path: "/blog/validation-interne-avant-envoi-devis-b2b",
    title: "Validation interne avant envoi d’un devis B2B : relecture commerciale, technique et marge",
    description:
      "Mettre en place une validation interne avant d’envoyer un devis B2B : rôles, checklist, relecture, mentions et marge. Pas de SLA produit ni de versions.",
    publishedAt: "2026-09-28",
    readingMinutes: 14,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "commentaires-annotations-devis-collaboratif-b2b",
    path: "/blog/commentaires-annotations-devis-collaboratif-b2b",
    title: "Commentaires et annotations sur un devis collaboratif B2B : fin des fils RE: RE:",
    description:
      "Remplacer les mails RE: RE: par le fil plat du prospect et le commentaire de chaque relecteur (budget max). Pas de threads par ligne, pas de versions.",
    publishedAt: "2026-09-25",
    readingMinutes: 12,
    tags: ["funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "pieces-jointes-plans-photos-devis-b2b",
    path: "/blog/pieces-jointes-plans-photos-devis-b2b",
    title: "Pièces jointes, plans et photos dans un devis B2B : du chaos WhatsApp au brief chiffrable",
    description:
      "Gérer plans, photos, PDF techniques et specs dans un devis B2B : éviter WhatsApp et mails orphelins, versions, espace prospect, brief chiffrable.",
    publishedAt: "2026-09-25",
    readingMinutes: 12,
    tags: ["funnel", "catalogue"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "mentions-obligatoires-devis-france",
    path: "/blog/mentions-obligatoires-devis-france",
    title: "Mentions obligatoires sur un devis en France (B2B)",
    description:
      "Mentions légales et blocs utiles sur un devis B2B en France : identité, SIRET, TVA, prix HT/TTC, validité, acomptes, CGV. Checklist pratique, pas un conseil juridique.",
    publishedAt: "2026-09-24",
    readingMinutes: 14,
    tags: ["funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "envoyer-devis-lien-securise-vs-pdf-email",
    path: "/blog/envoyer-devis-lien-securise-vs-pdf-email",
    title: "Envoyer un devis par lien sécurisé vs PDF en pièce jointe",
    description:
      "PDF en e-mail vs lien sécurisé : dernière consultation sur la fiche, relecteurs, relances. Pas de stats d’ouverture ni de versions.",
    publishedAt: "2026-09-24",
    readingMinutes: 12,
    tags: ["funnel", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.devisDetail,
    pinned: false,
  },
  {
    slug: "recevoir-demandes-devis-wordpress-quotebuilder",
    path: "/blog/recevoir-demandes-devis-wordpress-quotebuilder",
    title: "Recevoir des demandes de devis WordPress dans QuoteBuilder",
    description:
      "Plugin WordPress devis B2B : créer un devis QuoteBuilder depuis le site (clé site + CORS), lignes Woo, variantes, widget dual-mode, chat ancré catalogue, notif commerciale. Pipeline, pas un simple formulaire.",
    publishedAt: "2026-09-23",
    readingMinutes: 12,
    tags: ["integrations", "funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: BLOG_DEMO_SHOTS.integrations,
    pinned: false,
  },
  {
    slug: "bibliotheque-lignes-kits-devis-b2b",
    path: "/blog/bibliotheque-lignes-kits-devis-b2b",
    title: "Bibliothèque de lignes et kits pour devis B2B : chiffrer plus vite sans Excel",
    description:
      "Options, variantes, produits liés et fourchette min-max dans QuoteBuilder. Kits et catalogue HT : pratique générale, hors produit.",
    publishedAt: "2026-09-23",
    readingMinutes: 12,
    tags: ["catalogue", "funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/sync-catalogue-woocommerce-shopify-parcours-devis/06-produits.png",
    pinned: false,
  },
  {
    slug: "remise-commerciale-marge-devis-b2b",
    path: "/blog/remise-commerciale-marge-devis-b2b",
    title: "Remise commerciale et marge sur devis B2B : protéger le plancher avant de négocier",
    description:
      "Remise devis B2B, plancher de marge, seuils auto/manager/directeur, alternatives (options, phasage, validité, acompte) et KPIs pour PME pose/fabrication. Process commercial clair.",
    publishedAt: "2026-09-22",
    readingMinutes: 13,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
    pinned: false,
  },
  {
    slug: "preremplir-devis-url-parametres",
    path: "/blog/preremplir-devis-url-parametres",
    title: "Préremplir un devis via l’URL : paramètres query, CTA WordPress et funnel embarqué",
    description:
      "Comment préremplir un funnel devis avec ?besoin=, ?add= et ?product= sur /c/ et /embed/, y compris depuis un shortcode WordPress. Tableau des params, règles de session, cas e-commerce et checklist QA.",
    publishedAt: "2026-09-22",
    readingMinutes: 12,
    tags: ["funnel", "integrations"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/installer-widget-devis-wordpress-javascript/08-integrations.png",
    pinned: false,
  },
  {
    slug: "fiche-produit-b2b-devis-unifie",
    path: "/blog/fiche-produit-b2b-devis-unifie",
    title: "Fiche produit B2B unifiée pour le devis : specs, médias, mode d’emploi et sync Woo non destructive",
    description:
      "Structurer une fiche produit B2B pour le parcours devis : specs éditables, médias photo/plan/usage, notice et PDF (manuel, conformité, garantie), sync WooCommerce qui n’écrase pas le vide. Process commercial et checklist.",
    publishedAt: "2026-09-22",
    readingMinutes: 11,
    tags: ["catalogue", "integrations"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/sync-catalogue-woocommerce-shopify-parcours-devis/06-produits.png",
    pinned: false,
  },
  {
    slug: "acomptes-echeances-devis-b2b",
    path: "/blog/acomptes-echeances-devis-b2b",
    title: "Acomptes et échéances sur devis B2B : cadrer le cash avant le lancement atelier",
    description:
      "Acompte à la commande, échéancier en 2-4 jalons, reste dû, blocage atelier et indicateurs cash pour PME pose/fabrication. Process commercial + points à écrire clairement sur le devis.",
    publishedAt: "2026-09-21",
    readingMinutes: 14,
    tags: ["funnel", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
    pinned: false,
  },
  {
    slug: "validite-expiration-devis-b2b",
    path: "/blog/validite-expiration-devis-b2b",
    title: "Validité et expiration des devis B2B : combien de jours, quand prolonger, quand re-chiffrer",
    description:
      "Durée de validité d’un devis B2B, statut expiré, prolongation, re-chiffrage, relances avant expiration et litiges sur prix figés. Process + indicateurs pour PME.",
    publishedAt: "2026-09-21",
    readingMinutes: 12,
    tags: ["relances", "funnel"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/visite-guidee-parcours-devis-b2b/03-devis.png",
    pinned: false,
  },
  {
    slug: "options-variantes-alternatives-devis-b2b",
    path: "/blog/options-variantes-alternatives-devis-b2b",
    title: "Options, variantes et alternatives sur un devis B2B : décider sans noyer le prospect",
    description:
      "Comment structurer un devis B2B avec options, variantes et alternatives (A vs B, lignes optionnelles, pack standard vs premium) pour que le prospect tranche sans pile de PDF V2.",
    publishedAt: "2026-09-18",
    readingMinutes: 12,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
    pinned: false,
  },
  {
    slug: "signature-acceptation-devis-en-ligne-b2b",
    path: "/blog/signature-acceptation-devis-en-ligne-b2b",
    title: "Signature et acceptation de devis en ligne B2B : finir le ping-pong PDF",
    description:
      "Faire accepter et signer un devis B2B en ligne sans ping-pong PDF : friction envoi → vue → questions → acceptation, statut, versions.",
    publishedAt: "2026-09-18",
    readingMinutes: 12,
    tags: ["funnel", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
    pinned: false,
  },
  {
    slug: "revue-pipeline-devis-b2b",
    path: "/blog/revue-pipeline-devis-b2b",
    title: "Revue de pipeline devis B2B : animer la réunion hebdo sans Excel",
    description:
      "Animer une revue de pipeline devis B2B (hebdo) : Hot/Warm/Cold, relances vs abandon, briefs bloqués, sans Excel.",
    publishedAt: "2026-09-17",
    readingMinutes: 11,
    tags: ["scoring", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/visite-guidee-parcours-devis-b2b/03-devis.png",
    pinned: false,
  },
  {
    slug: "centraliser-demandes-devis-multi-canaux",
    path: "/blog/centraliser-demandes-devis-multi-canaux",
    title: "Centraliser les demandes de devis multi-canaux : un seul pipeline",
    description:
      "Formulaire site, email, téléphone, marketplace, WhatsApp, LinkedIn : un dossier scoré pour éviter leads orphelins et doubles chiffrages.",
    publishedAt: "2026-09-17",
    readingMinutes: 11,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/relancer-devis-hot-depuis-dossier/03-devis.png",
    pinned: false,
  },
  {
    slug: "versions-historique-devis-b2b",
    path: "/blog/versions-historique-devis-b2b",
    title: "Versions et historique des devis B2B : v1, v2, v3 sans perdre le fil",
    description:
      "Process d’équipe quand le prospect itère. Hors QuoteBuilder : pas de versions, pas d’historique v1/v2/v3. Le dossier courant se met à jour.",
    publishedAt: "2026-09-16",
    readingMinutes: 11,
    tags: ["funnel", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
    pinned: false,
  },
  {
    slug: "assignation-sla-demande-devis-equipe",
    path: "/blog/assignation-sla-demande-devis-equipe",
    title: "Assignation et SLA des demandes de devis en équipe : owner, Hot/Warm/Cold, escalade",
    description:
      "Owner unique et playbook d’équipe Hot/Warm/Cold. Pas de SLA QuoteBuilder. Le libellé automatique ignore urgence, zone et délai.",
    publishedAt: "2026-09-15",
    readingMinutes: 11,
    tags: ["scoring", "relances"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
    pinned: false,
  },
  {
    slug: "qualifier-demande-devis-avant-chiffrage",
    path: "/blog/qualifier-demande-devis-avant-chiffrage",
    title: "Qualifier une demande de devis avant de chiffrer : grille, brief et score",
    description:
      "Pourquoi chiffrer trop tôt brûle des heures. Grille budget/délai/décideur/site, score Hot/Warm/Cold, brief minimum, process équipe et FAQ B2B.",
    publishedAt: "2026-09-15",
    readingMinutes: 11,
    tags: ["funnel", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/score-demande-devis-b2b/04-devis-detail.png",
    pinned: false,
  },
  {
    slug: "creer-devis-avec-claude-mcp",
    path: "/blog/creer-devis-avec-claude-mcp",
    title: "Créer un devis avec Claude : QuoteBuilder MCP sur Claude Desktop",
    description:
      "Créer et suivre un devis B2B depuis Claude Desktop via QuoteBuilder MCP (create_quote, list_quotes, get_quote_status). Clé API, flag MCP_DEVIS_V0, process create→dossier, limites v0.",
    publishedAt: "2026-09-12",
    readingMinutes: 12,
    tags: ["integrations", "scoring"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/creer-devis-avec-claude-mcp/03-devis.png",
    pinned: false,
  },
  {
    slug: "score-demande-devis-b2b",
    path: "/blog/score-demande-devis-b2b",
    title: "Comment scorer et prioriser une demande de devis B2B (grille 0–100)",
    description:
      "Guide pratique : scorer les demandes de devis B2B (fit, urgence, complétude, budget, comportement). Grille 0–100, playbooks Hot/Warm/Cold, métriques et FAQ.",
    publishedAt: "2026-09-11",
    readingMinutes: 12,
    tags: ["scoring", "funnel"],
    ctaHref: BLOG_DEMO_FUNNEL,
    cover: `${BLOG_IMAGE_DIR}/score-demande-devis-b2b/04-devis-detail.png`,
    pinned: true,
  },
  {
    slug: "visite-guidee-parcours-devis-b2b",
    path: "/blog/visite-guidee-parcours-devis-b2b",
    title: "De la demande au dossier devis : visite guidée d’un parcours B2B",
    description:
      "Visite guidée d’un parcours devis B2B : funnel public, boutique, pipeline, dossier devis, catalogue, automations et relances. Captures démo et checklist de mise en place.",
    publishedAt: "2026-09-11",
    readingMinutes: 14,
    tags: ["funnel", "scoring"],
    ctaHref: BLOG_DEMO_FUNNEL,
    cover: "/images/blog/visite-guidee-parcours-devis-b2b/04-devis-detail.png",
    pinned: false,
  },
  {
    slug: "relancer-devis-hot-depuis-dossier",
    path: "/blog/relancer-devis-hot-depuis-dossier",
    title: "Relancer un devis Hot depuis le dossier : SLA, owner et automations",
    description:
      "Relancer un devis Hot depuis le dossier. Libellé automatique, owner d’équipe, relances. Le délai de réponse est hors produit : pas de SLA QuoteBuilder.",
    publishedAt: "2026-09-11",
    readingMinutes: 12,
    tags: ["relances", "scoring"],
    ctaHref: BLOG_TOOL_SEQUENCE,
    cover: "/images/blog/relancer-devis-hot-depuis-dossier/04-devis-detail.png",
    pinned: false,
  },
  {
    slug: "delai-reponse-demande-devis-b2b",
    path: "/blog/delai-reponse-demande-devis-b2b",
    title: "Délai de réponse à une demande de devis B2B : SLA, chiffres et process",
    description:
      "Délai de réponse devis B2B : benchmarks et process d’équipe. Pas de SLA QuoteBuilder. Le libellé automatique ignore urgence et zone.",
    publishedAt: "2026-09-11",
    readingMinutes: 11,
    tags: ["scoring", "relances"],
    ctaHref: BLOG_DEMO_FUNNEL,
    cover: "/images/blog/delai-reponse-demande-devis-b2b/03-devis.png",
    pinned: false,
  },
  {
    slug: "template-boutique-en-ligne-menuiserie-devis",
    path: "/blog/template-boutique-en-ligne-menuiserie-devis",
    title: "Template boutique en ligne menuiserie devis : base métier vs thème générique",
    description:
      "Pourquoi un template boutique métier (menuiserie, skincare B2B, stock rayonnage) convertit mieux en demande de devis qu’un thème e-commerce générique. Process Puck + Chat IA, captures et checklist.",
    publishedAt: "2026-09-11",
    readingMinutes: 12,
    tags: ["integrations", "catalogue"],
    ctaHref: "https://www.quotebuilder.co/signup?plan=free",
    cover: "/images/blog/template-boutique-secteur-devis/menuiserie-home.png",
    pinned: false,
  },
  {
    slug: "devis-en-ligne-integre-boutique",
    path: "/blog/devis-en-ligne-integre-boutique",
    title: "Devis en ligne intégré boutique : le configurateur reste dans votre vitrine",
    description:
      "Comment intégrer un devis en ligne et un configurateur dans la boutique publique : même chrome, CTA Ajouter au devis, route /devis, dossier vendeur. Process, 3 démos, checklist.",
    publishedAt: "2026-09-11",
    readingMinutes: 11,
    tags: ["funnel", "catalogue"],
    ctaHref: "https://www.quotebuilder.co/b/demo/atelier-peau-claire/devis",
    cover: "/images/blog/devis-en-ligne-integre-boutique/unify-shop-home.png",
    pinned: false,
  },
  {
    slug: "configurateur-devis-vs-excel-pdf",
    path: "/blog/configurateur-devis-vs-excel-pdf",
    title: "Configurateur de devis vs Excel + PDF + email : ce qui change vraiment",
    description:
      "Comparatif pragmatique : parcours / configurateur de devis contre Excel, PDF et emails. Erreurs, marge, cycle time, multi-décideurs, migration et FAQ pour PME B2B.",
    publishedAt: "2026-09-11",
    readingMinutes: 11,
    tags: ["funnel", "scoring"],
    ctaHref: BLOG_DEMO_FUNNEL,
    cover: `${BLOG_IMAGE_DIR}/configurateur-devis-vs-excel-pdf/09-public-funnel.png`,
  },
  {
    slug: "pourquoi-les-devis-meurent-sans-relance",
    path: "/blog/pourquoi-les-devis-meurent-sans-relance",
    title: "Pourquoi les devis meurent sans relance",
    description:
      "80 % des ventes demandent 5 relances. 44 % des équipes s’arrêtent à la première. Sources Invesp, Belkins, ZoomInfo, et ce qu’un calendrier de relances change vraiment.",
    publishedAt: "2026-09-11",
    readingMinutes: 12,
    tags: ["relances"],
    ctaHref: BLOG_TOOL_SEQUENCE,
    cover: `${BLOG_IMAGE_DIR}/pourquoi-les-devis-meurent-sans-relance/05-automations.png`,
  },
  {
    slug: "formulaire-contact-vs-funnel-devis-b2b",
    path: "/blog/formulaire-contact-vs-funnel-devis-b2b",
    title: "Formulaire de contact vs funnel de devis B2B",
    description:
      "Un formulaire recueille un message vague. Un funnel livre un dossier : produits, contraintes, budget, score. La différence qui change le pipeline.",
    publishedAt: "2026-09-11",
    readingMinutes: 11,
    tags: ["funnel"],
    ctaHref: BLOG_DEMO_FUNNEL,
    cover: `${BLOG_IMAGE_DIR}/formulaire-contact-vs-funnel-devis-b2b/09-public-funnel.png`,
  },
  {
    slug: "installer-widget-devis-wordpress-javascript",
    path: "/blog/installer-widget-devis-wordpress-javascript",
    title: "Installer un widget de devis (WordPress ou JavaScript)",
    description:
      "Deux lignes de JS ou le plugin WordPress + bloc Gutenberg. Le funnel s’affiche sur votre site, sans refonte ni nouveau thème.",
    publishedAt: "2026-09-11",
    readingMinutes: 10,
    tags: ["integrations"],
    ctaHref: BLOG_DEMO_SHOP,
    cover: `${BLOG_IMAGE_DIR}/installer-widget-devis-wordpress-javascript/08-integrations.png`,
  },
  {
    slug: "sync-catalogue-woocommerce-shopify-parcours-devis",
    path: "/blog/sync-catalogue-woocommerce-shopify-parcours-devis",
    title: "Sync catalogue WooCommerce / Shopify dans un parcours de devis",
    description:
      "Importer prix, photos et déclinaisons, puis les poser dans un funnel Si/Alors. La boutique reste la source ; le devis devient le dossier.",
    publishedAt: "2026-09-11",
    readingMinutes: 11,
    tags: ["catalogue", "integrations"],
    ctaHref: BLOG_DEMO_SHOP,
    cover: `${BLOG_IMAGE_DIR}/sync-catalogue-woocommerce-shopify-parcours-devis/06-produits.png`,
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function resolveBlogTag(value: string | undefined): BlogTagSlug | undefined {
  if (!value) return undefined;
  return BLOG_TAG_DEFS.find((tag) => tag.slug === value || tag.label === value)?.slug;
}

export function isBlogTag(value: string | undefined): value is BlogTagSlug {
  return !!resolveBlogTag(value);
}

export function blogTagLabel(slug: BlogTagSlug): BlogTagLabel {
  return BLOG_TAG_DEFS.find((tag) => tag.slug === slug)?.label ?? "Funnel";
}

export function primaryTag(post: Pick<BlogPost, "tags">): BlogTagSlug {
  return post.tags[0] ?? "funnel";
}

export function primaryTagLabel(post: Pick<BlogPost, "tags">): BlogTagLabel {
  return blogTagLabel(primaryTag(post));
}

export function getFeaturedPost(posts: readonly BlogPost[] = BLOG_POSTS) {
  const pinned = posts.find((post) => post.pinned);
  if (pinned) return pinned;
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title, "fr"))[0];
}

export function getRelatedPosts(post: BlogPost, limit = 3) {
  return BLOG_POSTS.filter(
    (item) => item.slug !== post.slug && item.tags.some((tag) => post.tags.includes(tag)),
  ).slice(0, limit);
}

export function getRelatedTools(post: BlogPost) {
  return BLOG_TOOLS.filter((tool) => tool.tags.some((tag) => post.tags.includes(tag)));
}

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function filterBlogPosts(
  posts: readonly BlogPost[],
  { tag, q }: { tag?: string; q?: string } = {},
) {
  const slug = resolveBlogTag(tag);
  const needle = q ? normalizeSearch(q) : "";
  return posts.filter((post) => {
    if (slug && !post.tags.includes(slug)) return false;
    if (!needle) return true;
    return normalizeSearch(`${post.title} ${post.description}`).includes(needle);
  });
}

export function formatBlogDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function stripMarkdownInline(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

export function slugifyHeading(text: string) {
  return stripMarkdownInline(text)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractMarkdownH2s(source: string) {
  const headings: { id: string; text: string }[] = [];
  for (const line of source.replace(/\r\n/g, "\n").split("\n")) {
    if (line.startsWith("## ") && !line.startsWith("### ")) {
      const text = stripMarkdownInline(line.slice(3));
      if (!text) continue;
      headings.push({ id: slugifyHeading(text), text });
    }
  }
  return headings;
}

export function midArticleHeadingIndex(headingCount: number) {
  if (headingCount < 3) return -1;
  return Math.max(2, Math.floor(headingCount / 2) - 1);
}

export function blogOgImagePath(post: Pick<BlogPost, "slug">) {
  return `/api/og/blog/${post.slug}`;
}

export function blogImageUrl(post: BlogPost) {
  if (post.cover) {
    return post.cover.startsWith("http") ? post.cover : post.cover;
  }
  return blogOgImagePath(post);
}

export function trimMetaDescription(text: string, max = 155) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  const slice = compact.slice(0, max);
  const cut = slice.lastIndexOf(" ");
  return (cut > 40 ? slice.slice(0, cut) : slice).replace(/[.,;:]$/, "");
}

export function blogArticleJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: trimMetaDescription(post.description),
    datePublished: post.publishedAt,
    inLanguage: "fr-FR",
    mainEntityOfPage: `${SITE_URL}${post.path}`,
    author: { "@type": "Organization", name: COMPANY.product, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: absoluteUrl(blogImageUrl(post)),
  };
}

export function blogBreadcrumbJsonLd(post: BlogPost) {
  const tag = primaryTag(post);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: blogTagLabel(tag),
        item: `${SITE_URL}/blog?tag=${encodeURIComponent(tag)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}${post.path}`,
      },
    ],
  };
}
