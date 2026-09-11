export type WalkthroughScreen = {
  id: string;
  label: string;
  path: string;
  why: string;
  seedModule: string;
};

export const WALKTHROUGH_SCREENS: WalkthroughScreen[] = [
  {
    id: "login",
    label: "Connexion",
    path: "/login",
    why: "Accès test (emails démo). Mot de passe via DEMO_PASSWORD.",
    seedModule: "accounts",
  },
  {
    id: "accueil",
    label: "Tableau de bord",
    path: "/accueil",
    why: "KPI, pipeline, abandons — premier écran après login owner.",
    seedModule: "analytics",
  },
  {
    id: "devis",
    label: "Liste des demandes",
    path: "/devis",
    why: "Scores hot/warm/cold, statuts pipeline, pastilles.",
    seedModule: "quotes",
  },
  {
    id: "dossier",
    label: "Dossier demande",
    path: "/devis/{quoteId}",
    why: "Réponses, lignes, notes, activité, message prospect.",
    seedModule: "quotes",
  },
  {
    id: "sessions",
    label: "Abandons",
    path: "/sessions",
    why: "Sessions stale avec email, relance.",
    seedModule: "sessions",
  },
  {
    id: "automations",
    label: "Automatisations",
    path: "/automations",
    why: "Parcours seedés (soumission + abandon).",
    seedModule: "crm",
  },
  {
    id: "automation-canvas",
    label: "Canvas parcours",
    path: "/automations/{workflowId}",
    why: "Emails, wait, branches score/statut.",
    seedModule: "crm",
  },
  {
    id: "catalogue",
    label: "Catalogue",
    path: "/produits",
    why: "Gammes rayonnage, SKU, fourchettes, tags.",
    seedModule: "catalog",
  },
  {
    id: "regles",
    label: "Règles Si/Alors",
    path: "/produits/regles",
    why: "Suggestions selon le type d’espace.",
    seedModule: "catalog",
  },
  {
    id: "funnels",
    label: "Funnels",
    path: "/funnels",
    why: "Funnel rayonnage formulaire + chat.",
    seedModule: "funnel",
  },
  {
    id: "builder",
    label: "Éditeur de funnel",
    path: "/funnels/{funnelId}",
    why: "Steps, questions, modes.",
    seedModule: "funnel",
  },
  {
    id: "boutiques",
    label: "Boutiques",
    path: "/integrations",
    why: "Boutique native légère, liée au funnel.",
    seedModule: "shop",
  },
  {
    id: "shop-builder",
    label: "Builder boutique",
    path: "/integrations/shop/{shopId}",
    why: "Pages accueil / catalogue / légales.",
    seedModule: "shop",
  },
  {
    id: "stats",
    label: "Statistiques",
    path: "/stats",
    why: "Visites → devis, tunnel, sources.",
    seedModule: "analytics",
  },
  {
    id: "segments",
    label: "Segmentation",
    path: "/segments",
    why: "Hot, B2B, type d’espace.",
    seedModule: "segments",
  },
  {
    id: "equipe",
    label: "Équipe",
    path: "/equipe",
    why: "Owner + commercial assignables.",
    seedModule: "accounts",
  },
  {
    id: "public-funnel",
    label: "Funnel public",
    path: "/c/demo/rayonnage",
    why: "Parcours prospect (wizard + chat).",
    seedModule: "funnel",
  },
  {
    id: "public-shop",
    label: "Boutique publique",
    path: "/b/demo/vitrine",
    why: "Mini-site devis, pas de paiement.",
    seedModule: "shop",
  },
];

export function walkthroughPath(screen: WalkthroughScreen, ids: Record<string, string> = {}) {
  return screen.path.replace(/\{(\w+)\}/g, (_, key: string) => ids[key] ?? `{${key}}`);
}

export function screensForModule(moduleId: string) {
  return WALKTHROUGH_SCREENS.filter((screen) => screen.seedModule === moduleId);
}
