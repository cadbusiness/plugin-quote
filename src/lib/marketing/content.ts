export const STATS = [
  { value: "80 %", label: "des ventes demandent 5 relances ou plus" },
  { value: "44 %", label: "des vendeurs s’arrêtent après un seul suivi" },
  { value: "24 %", label: "des sites n’ont aucun moyen de demander un devis" },
] as const;

export const FAQ = [
  {
    q: "C’est quoi la différence avec un formulaire de contact ?",
    a: "Un formulaire recueille un message vague. QuoteBuilder fait configurer le projet (produits, contraintes, budget), livre un dossier scoré, puis relance tout seul. Vous ne redistribuez plus des emails : vous traitez des devis.",
  },
  {
    q: "C’est quoi la différence avec un catalogue ou une boutique ?",
    a: "Un catalogue stocke des produits. Une boutique encaisse. QuoteBuilder pose votre offre dans un parcours de devis, puis pilote chaque demande : score, assignation, relances. Le catalogue est l’entrée. L’autopilote, c’est le produit.",
  },
  {
    q: "Est-ce que je dois avoir WooCommerce ?",
    a: "Non. Saisie manuelle ou CSV. WooCommerce et Shopify en sync sur le plan Pro.",
  },
  {
    q: "Comment ça s’installe sur mon site ?",
    a: "Deux lignes de JavaScript, ou le plugin WordPress. Sans toucher à votre design.",
  },
  {
    q: "Je suis seul, sans équipe. Ça sert ?",
    a: "Oui. L’autopilote (confirmation, relances, rappels) travaille pour un solo comme pour une équipe.",
  },
  {
    q: "Puis-je tester sans payer ?",
    a: "Oui. Le plan Free est illimité dans le temps : 1 funnel, wizard, 10 soumissions au total, sans carte. Assez pour voir l’interface avant de passer Starter ou Pro.",
  },
  {
    q: "Mensuel ou annuel ?",
    a: "Les deux. L’annuel revient à 39 €/mois (Starter), 79 €/mois (Pro) ou 159 €/mois (Agency), soit deux mois offerts.",
  },
  {
    q: "C’est quoi Agency ?",
    a: "Multi-compte, white-label, sièges illimités, support prioritaire. Pour les agences et réseaux multi-marques. Inscription directe, pas de devis obligatoire.",
  },
] as const;

export type PlanId = "free" | "starter" | "pro" | "agency";

export type PublicPlan = {
  id: PlanId;
  name: string;
  audience: string;
  monthlyPrice: number | null;
  annualMonthly: number | null;
  annualTotal: number | null;
  href: string;
  cta: string;
  featured: boolean;
  badge: string | null;
  highlight: "free" | "default" | "featured" | "agency";
  features: string[];
};

/** Grille publique : Free → Agency, toujours visibles. */
export const PUBLIC_PLANS: PublicPlan[] = [
  {
    id: "free",
    name: "Free",
    audience: "Voir l’interface, sans carte",
    monthlyPrice: 0,
    annualMonthly: 0,
    annualTotal: 0,
    href: "/signup?plan=free",
    cta: "Commencer gratuitement",
    featured: false,
    badge: "Gratuit",
    highlight: "free",
    features: [
      "1 funnel",
      "Wizard uniquement",
      "10 soumissions au total",
      "Pas de chat IA",
      "Pas de flux auto",
      "Pas d’espace prospect",
      "Pas de catalogue",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    audience: "Solo & très petite PME",
    monthlyPrice: 49,
    annualMonthly: 39,
    annualTotal: 390,
    href: "/signup?plan=starter",
    cta: "Choisir Starter",
    featured: false,
    badge: null,
    highlight: "default",
    features: [
      "Soumissions illimitées",
      "3 funnels",
      "Wizard + Chat IA",
      "Catalogue (50 produits)",
      "Espace prospect basique",
      "Flux T+0, T+24h, T+3j",
      "CRM basique",
      "1 membre · WooCommerce",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    audience: "PME & équipe commerciale",
    monthlyPrice: 99,
    annualMonthly: 79,
    annualTotal: 790,
    href: "/signup?plan=pro",
    cta: "Choisir Pro",
    featured: true,
    badge: "Populaire",
    highlight: "featured",
    features: [
      "Funnels & catalogue illimités",
      "Espace prospect + messagerie",
      "Flux jusqu’à J+30",
      "Panier abandonné",
      "Newsletter segmentée",
      "CRM + pipeline Kanban",
      "Stats avancées + GA4",
      "5 membres · Woo + Shopify · Webhooks",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    audience: "Agences & multi-marques",
    monthlyPrice: 199,
    annualMonthly: 159,
    annualTotal: 1590,
    href: "/signup?plan=agency",
    cta: "Choisir Agency",
    featured: false,
    badge: null,
    highlight: "agency",
    features: [
      "Tout Pro, multi-comptes",
      "White-label",
      "Sièges illimités",
      "Templates & onboarding",
      "Support prioritaire",
      "Export / API étendue",
      "Facturation centralisée",
      "Inscription directe",
    ],
  },
];

export const PRICING_COMPARE_ROWS: {
  label: string;
  values: Record<PlanId, string>;
}[] = [
  {
    label: "Funnels",
    values: { free: "1", starter: "3", pro: "Illimités", agency: "Illimités" },
  },
  {
    label: "Soumissions",
    values: { free: "10 total", starter: "Illimitées", pro: "Illimitées", agency: "Illimitées" },
  },
  {
    label: "Chat IA",
    values: { free: "Non", starter: "Oui", pro: "Oui", agency: "Oui" },
  },
  {
    label: "Catalogue",
    values: { free: "Non", starter: "50", pro: "Illimité", agency: "Illimité" },
  },
  {
    label: "Autopilote",
    values: { free: "Non", starter: "T+3j", pro: "J+30", agency: "J+30" },
  },
  {
    label: "Équipe",
    values: { free: "1", starter: "1", pro: "5", agency: "Illimitée" },
  },
  {
    label: "Intégrations",
    values: { free: "Widget", starter: "Woo", pro: "Woo + Shopify", agency: "Stack + white-label" },
  },
];

export const FREE_TRIAL = {
  href: "/signup?plan=free",
  label: "Commencer gratuitement",
  hint: "Free : 1 funnel, wizard, 10 soumissions. Sans carte.",
} as const;

/** @deprecated Prefer PUBLIC_PLANS agency entry. */
export const AGENCY_PLAN = {
  name: "Agency",
  monthlyPrice: 199,
  href: "/signup?plan=agency",
  blurb: "Multi-compte, white-label, sièges illimités. Inscription directe.",
} as const;

/** @deprecated Prefer PUBLIC_PLANS. */
export const PLANS = PUBLIC_PLANS;

export type FeatureSlug =
  | "funnel"
  | "catalogue"
  | "demandes"
  | "autopilote"
  | "espace-prospect"
  | "stats"
  | "equipe"
  | "integrations";

export type Feature = {
  slug: FeatureSlug;
  title: string;
  menuLabel: string;
  menuBlurb: string;
  eyebrow: string;
  headline: string;
  lead: string;
  outcomes: string[];
  capabilities: { title: string; text: string }[];
  proof: string;
};

export const FEATURES: Feature[] = [
  {
    slug: "funnel",
    title: "Funnel de devis",
    menuLabel: "Funnel de devis",
    menuBlurb: "Wizard, chat IA ou les deux sur votre offre.",
    eyebrow: "Acquisition",
    headline: "Le prospect configure. Vous recevez un dossier.",
    lead: "Plus de formulaire vague. Un parcours guidé sur vos produits, vos contraintes, vos gammes. Le brief arrive déjà cadré.",
    outcomes: [
      "Moins d’emails flous à interpréter",
      "Budget indicatif avant l’appel",
      "Embed sur votre site en deux lignes",
    ],
    capabilities: [
      {
        title: "Steps métier",
        text: "Choix, texte, fichier, produits, identité, chat IA, soumission. Dans l’ordre que vous voulez.",
      },
      {
        title: "Trois modes",
        text: "Wizard guidé, chat IA, ou les deux. Même catalogue, même pipeline derrière.",
      },
      {
        title: "Identité progressive",
        text: "Prénom, email, téléphone intercalés. Session sauvée dès que l’email est là.",
      },
      {
        title: "Diffusion",
        text: "URL publique, widget JS, plugin WordPress + bloc Gutenberg.",
      },
    ],
    proof: "Le funnel n’est pas un gadget. C’est la porte d’entrée du système commercial.",
  },
  {
    slug: "catalogue",
    title: "Catalogue & règles",
    menuLabel: "Catalogue & règles",
    menuBlurb: "Produits réels, Si/Alors, sync Woo / Shopify.",
    eyebrow: "Acquisition",
    headline: "Uniquement ce que vous savez livrer.",
    lead: "Le catalogue QuoteBuilder n’est pas une vitrine. C’est le périmètre de vente : prix min/max, tags, suggestions conditionnelles.",
    outcomes: [
      "Pas de promesses impossibles",
      "Suggestions produits selon les réponses",
      "Boutique syncée si vous en avez une",
    ],
    capabilities: [
      {
        title: "Saisie & CSV",
        text: "Nom, SKU, description, fourchettes de prix, catégories, tags.",
      },
      {
        title: "Si / Alors",
        text: "Les réponses du funnel mappent vers des suggestions produits visibles côté prospect.",
      },
      {
        title: "Woo & Shopify",
        text: "Import, sync planifiée, webhooks. Photos, prix, déclinaisons.",
      },
      {
        title: "Activation fine",
        text: "Activez ou coupez un produit sans casser le funnel.",
      },
    ],
    proof: "Le catalogue est le socle. Le différenciateur, c’est ce qui se passe après.",
  },
  {
    slug: "demandes",
    title: "Demandes & pipeline",
    menuLabel: "Demandes & pipeline",
    menuBlurb: "Dossiers scorés, assignés, prêts à conclure.",
    eyebrow: "Pilotage",
    headline: "Chaque demande est un dossier, pas un email.",
    lead: "Statut, score Hot / Warm / Cold, assignation, notes, timeline. La ligne entière ouvre la fiche. Vous priorisez d’un coup d’œil.",
    outcomes: [
      "Priorisation par score",
      "Plus de “qui s’en occupe ?”",
      "Abandons visibles et relançables",
    ],
    capabilities: [
      {
        title: "Liste flush",
        text: "Prospect, projet, score, statut, commercial. Clic sur la ligne = fiche.",
      },
      {
        title: "Fiche complète",
        text: "Réponses, produits, budget, notes internes, historique d’activité.",
      },
      {
        title: "Score automatique",
        text: "Hot, warm, cold calculés sur le dossier. Pas un feeling.",
      },
      {
        title: "Abandons",
        text: "Sessions avec email, prêtes à relancer. Export CSV inclus.",
      },
    ],
    proof: "Le pipeline remplace la boîte mail comme système de vérité.",
  },
  {
    slug: "autopilote",
    title: "Autopilote & workflows",
    menuLabel: "Autopilote",
    menuBlurb: "Relances, waits, branches. Sans traquer chaque fil.",
    eyebrow: "Pilotage",
    headline: "Les devis avancent tout seuls.",
    lead: "Canvas de parcours : emails, waits, branches score / statut / réponses, assignation. Les touches que 92 % des équipes n’enchaînent jamais.",
    outcomes: [
      "Confirmation immédiate",
      "Rappel si non traité",
      "Relances d’abandon planifiées",
    ],
    capabilities: [
      {
        title: "Canvas visuel",
        text: "Emails, wait, branches devis, assignation, statut. Draft ou Actif.",
      },
      {
        title: "Triggers",
        text: "Soumission, abandon, changement de statut. Moteur toutes les 15 min.",
      },
      {
        title: "Parcours seedés",
        text: "T+0 confirmation + PDF, notif commercial, rappel 4 h, nurturing J+3.",
      },
      {
        title: "Exécutions",
        text: "Liste des runs + détail sur chaque demande.",
      },
    ],
    proof: "C’est là que les formulaires s’arrêtent. QuoteBuilder continue.",
  },
  {
    slug: "espace-prospect",
    title: "Espace prospect",
    menuLabel: "Espace prospect",
    menuBlurb: "Lien magique, PIN, récap, messagerie légère.",
    eyebrow: "Pilotage",
    headline: "Le prospect reste dans le loop.",
    lead: "Après soumission : lien magique, code PIN, barre de statut, récap, zone de complétion. Moins d’allers-retours chaotiques.",
    outcomes: [
      "Le prospect suit son dossier",
      "Compléments (photos, notes) au bon endroit",
      "Moins de “vous avez reçu mon mail ?”",
    ],
    capabilities: [
      {
        title: "Accès sécurisé",
        text: "Lien magique + PIN 6 chiffres. Pas de compte à créer.",
      },
      {
        title: "Statut visible",
        text: "Barre de progression côté prospect. Transparence sans ticket support.",
      },
      {
        title: "Complétion",
        text: "Upload photos / plans, notes. Le dossier s’enrichit.",
      },
      {
        title: "Messagerie légère",
        text: "Échanges prospect ↔ équipe rattachés à la demande.",
      },
    ],
    proof: "Le devis n’est plus un PDF perdu. C’est un espace partagé.",
  },
  {
    slug: "stats",
    title: "Statistiques",
    menuLabel: "Statistiques",
    menuBlurb: "Volume, conversion, délai, CA potentiel, UTM.",
    eyebrow: "Organisation",
    headline: "Les chiffres qui font agir.",
    lead: "Tunnel visiteurs → gagné, sources UTM, pipeline financier, abandons à un clic. Pas un dashboard vanity.",
    outcomes: [
      "Voir où ça fuit",
      "Relancer les abandons utiles",
      "Piloter le CA potentiel",
    ],
    capabilities: [
      {
        title: "Tunnel",
        text: "Visiteurs, démarrages, soumissions, gagnés. KPI flush.",
      },
      {
        title: "Attribution",
        text: "UTM Google Ads, organique, etc. Captés session + widget.",
      },
      {
        title: "Pipeline €",
        text: "CA potentiel, délais, courbe 6 mois, export PDF agence.",
      },
      {
        title: "Abandons",
        text: "Depuis les stats, CTA direct vers les sessions relançables.",
      },
    ],
    proof: "La stats sert à traiter. Pas à décorer.",
  },
  {
    slug: "equipe",
    title: "Équipe & rôles",
    menuLabel: "Équipe & rôles",
    menuBlurb: "Invitations, Admin / Commercial, assignation.",
    eyebrow: "Organisation",
    headline: "Qui traite quoi. Clair.",
    lead: "Invitations email, rôles Admin / Commercial (Owner en plus), assignation avec notification. Solo ou équipe de dix.",
    outcomes: [
      "Responsable nommé sur chaque dossier",
      "Pas de doublon de suivi",
      "Onboarding commercial rapide",
    ],
    capabilities: [
      {
        title: "Invitations",
        text: "Par email. L’invité rejoint l’espace org.",
      },
      {
        title: "Rôles",
        text: "Admin, Commercial, Owner. Droits adaptés.",
      },
      {
        title: "Assignation",
        text: "Depuis la fiche demande. Notification immédiate.",
      },
      {
        title: "Solo-friendly",
        text: "L’autopilote travaille aussi bien à un qu’à dix.",
      },
    ],
    proof: "L’outil scale avec l’équipe. Pas l’inverse.",
  },
  {
    slug: "integrations",
    title: "Intégrations",
    menuLabel: "Intégrations",
    menuBlurb: "Widget, WordPress, Woo, Shopify, webhooks.",
    eyebrow: "Organisation",
    headline: "Dans votre stack. Pas à côté.",
    lead: "Widget universel, WordPress, sync boutique, webhooks JSON, templates email/PDF. QuoteBuilder s’insère, il ne remplace pas tout.",
    outcomes: [
      "Embed sans refonte de site",
      "Catalogue déjà en boutique = sync",
      "Export vers vos outils",
    ],
    capabilities: [
      {
        title: "Widget JS",
        text: "Deux lignes. Funnel sur n’importe quel site.",
      },
      {
        title: "WordPress",
        text: "Plugin + bloc Gutenberg + shortcode. Appairage Woo.",
      },
      {
        title: "Boutiques",
        text: "WooCommerce et Shopify : produits, photos, prix, déclinaisons.",
      },
      {
        title: "Webhooks & templates",
        text: "Sortie JSON. Emails et PDF personnalisables.",
      },
    ],
    proof: "Installation en minutes. Valeur en jours.",
  },
];

export const SITE = {
  name: "QuoteBuilder",
  tagline: "La plateforme de devis B2B qui ne s’arrête pas au formulaire.",
} as const;

const MENU_GROUP_DEFS: {
  id: string;
  label: string;
  blurb: string;
  slugs: FeatureSlug[];
}[] = [
  {
    id: "acquisition",
    label: "Acquisition",
    blurb: "Faire entrer un vrai devis, pas un message vague.",
    slugs: ["funnel", "catalogue"],
  },
  {
    id: "pilotage",
    label: "Pilotage",
    blurb: "Faire avancer chaque dossier sans traquer les fils.",
    slugs: ["demandes", "autopilote", "espace-prospect"],
  },
  {
    id: "organisation",
    label: "Organisation",
    blurb: "Équipe, chiffres, stack. Tout relié.",
    slugs: ["stats", "equipe", "integrations"],
  },
];

export const FEATURE_MENU_GROUPS = MENU_GROUP_DEFS.map((group) => ({
  id: group.id,
  label: group.label,
  blurb: group.blurb,
  /** @deprecated use label — kept for pages that still read title */
  title: group.label,
  description: group.blurb,
  slugs: group.slugs,
  items: group.slugs.map((slug) => {
    const feature = FEATURES.find((f) => f.slug === slug)!;
    return feature;
  }),
}));

export function getFeature(slug: string): Feature | undefined {
  return FEATURES.find((f) => f.slug === slug);
}

export function getFeatureHref(slug: FeatureSlug) {
  return `/fonctionnalites/${slug}`;
}
