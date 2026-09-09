export const STATS = [
  {
    value: "80 %",
    label: "des ventes demandent 5 relances ou plus",
  },
  {
    value: "44 %",
    label: "des vendeurs s’arrêtent après un seul suivi",
  },
  {
    value: "24 %",
    label: "des sites n’ont aucun moyen de demander un devis",
  },
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
    a: "Oui. Free illimité dans le temps, 10 devis / mois, pas de carte bancaire.",
  },
] as const;

export const PLANS = [
  {
    name: "Free",
    price: "0 €",
    period: "",
    quotes: "10 devis / mois",
    modes: "Funnel",
    crm: "Basique",
    team: "1 user",
    whiteLabel: false,
    cta: "Commencer",
    href: "/signup",
    featured: false,
  },
  {
    name: "Starter",
    price: "19 €",
    period: "/mois",
    quotes: "50 devis / mois",
    modes: "Funnel + Chat",
    crm: "Complet",
    team: "3 users",
    whiteLabel: false,
    cta: "Commencer",
    href: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "49 €",
    period: "/mois",
    quotes: "Illimité",
    modes: "Tout",
    crm: "Complet",
    team: "10 users",
    whiteLabel: false,
    cta: "Commencer",
    href: "/signup",
    featured: true,
  },
  {
    name: "Agency",
    price: "149 €",
    period: "/mois",
    quotes: "Illimité",
    modes: "Tout",
    crm: "Complet",
    team: "Illimité",
    whiteLabel: true,
    cta: "Nous contacter",
    href: "mailto:hello@quotebuilder.app",
    featured: false,
  },
] as const;

export const FEATURE_BLOCKS = [
  {
    id: "funnel",
    title: "Funnel de devis",
    lead: "Le prospect compose son projet sur votre offre, pas dans un formulaire vague.",
    points: [
      "Steps : choix, texte, fichier, produits, identité, chat IA, soumission",
      "3 modes : wizard guidé, chat IA, ou les deux",
      "Collecte progressive d’identité (prénom, email, téléphone)",
      "URL publique, embed JS, plugin WordPress + Gutenberg",
    ],
  },
  {
    id: "catalogue",
    title: "Catalogue connecté",
    lead: "Vos vrais produits. Prix min/max, tags, catégories. Sync boutique si besoin.",
    points: [
      "Saisie manuelle ou import CSV",
      "Si/Alors : réponses → suggestions produits",
      "Sync WooCommerce et Shopify (Pro)",
      "Activation / désactivation par produit",
    ],
  },
  {
    id: "demandes",
    title: "Demandes & pipeline",
    lead: "Chaque soumission devient un dossier exploitable, pas un email à interpréter.",
    points: [
      "Liste flush : statut, score, assignation",
      "Fiche : réponses, produits, notes, timeline",
      "Score automatique Hot / Warm / Cold",
      "Sessions abandonnées + export CSV",
    ],
  },
  {
    id: "autopilote",
    title: "Autopilote & workflows",
    lead: "Confirmation, relances, rappels : les touches que personne n’a le temps de faire.",
    points: [
      "Canvas : emails, wait, branches, assignation, statut",
      "Triggers : soumission, abandon, changement de statut",
      "Parcours seedés (T+0, T+4 h, T+3 j) activables",
      "Suivi des exécutions par demande",
    ],
  },
  {
    id: "pilotage",
    title: "Stats & équipe",
    lead: "Volume, conversion, délai, CA potentiel. Qui traite quoi.",
    points: [
      "Tunnel visiteurs → gagné",
      "Sources UTM + abandons relançables",
      "Rôles Admin / Commercial, invitations",
      "Notifications d’assignation",
    ],
  },
  {
    id: "integrations",
    title: "Intégrations",
    lead: "Sur votre site, branché sur votre boutique, ouvert vers l’extérieur.",
    points: [
      "Widget JS universel",
      "Plugin WordPress (embed + appairage Woo)",
      "Webhooks sortants / export JSON",
      "Templates email et PDF",
    ],
  },
] as const;
