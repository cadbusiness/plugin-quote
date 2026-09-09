export type KeywordPack = {
  sector: string;
  label: string;
  campaignName: string;
  matchTypes: { broad: string[]; phrase: string[]; exact: string[] };
  negatives: string[];
  headlines: string[];
  descriptions: string[];
};

const PACKS: KeywordPack[] = [
  {
    sector: "racking",
    label: "Rayonnage & stockage",
    campaignName: "search-rayonnage",
    matchTypes: {
      broad: [
        "rayonnage industriel",
        "rayonnage entrepôt",
        "rayonnage métallique",
        "installation rayonnage",
        "stockage palettes",
      ],
      phrase: [
        "rayonnage industriel sur mesure",
        "rayonnage palettes entrepôt",
        "devis rayonnage métallique",
        "rayonnage cantilever",
        "rayonnage dynamiques picking",
      ],
      exact: [
        "rayonnage industriel",
        "devis rayonnage",
        "rayonnage palettes",
        "installateur rayonnage",
      ],
    },
    negatives: ["occasion", "emploi", "stage", "locatif", "ikea", "brico"],
    headlines: [
      "Devis rayonnage en 3 min",
      "Rayonnage adapté à votre site",
      "Brief cadré, pas un appel à vide",
    ],
    descriptions: [
      "Type d’espace, surface, charge : recevez une configuration et un devis, pas un formulaire vague.",
      "Installateur de rayonnage. Le prospect configure, vous rappelez un dossier complet.",
    ],
  },
  {
    sector: "kitchen",
    label: "Cuisiniste",
    campaignName: "search-cuisine",
    matchTypes: {
      broad: [
        "cuisiniste",
        "cuisine sur mesure",
        "devis cuisine",
        "cuisiniste haut de gamme",
        "rénovation cuisine",
      ],
      phrase: [
        "cuisiniste près de moi",
        "devis cuisine équipée",
        "cuisine contemporaine sur mesure",
        "cuisiniste sans engagement",
      ],
      exact: ["cuisiniste", "devis cuisine", "cuisine sur mesure"],
    },
    negatives: ["ikea", "castorama", "brico dépôt", "emploi", "formation", "plan 3d gratuit"],
    headlines: [
      "Configurez votre cuisine",
      "Devis cuisiniste, déjà cadré",
      "Style, budget, puis le brief",
    ],
    descriptions: [
      "Le prospect choisit pièce, style et budget. Vous recevez un dossier, pas un « rappelez-moi ».",
      "Cuisiniste : un funnel de devis, pas un formulaire contact.",
    ],
  },
  {
    sector: "wood",
    label: "Menuisier",
    campaignName: "search-menuiserie",
    matchTypes: {
      broad: [
        "menuisier sur mesure",
        "menuiserie agencement",
        "escalier bois sur mesure",
        "devis menuisier",
      ],
      phrase: [
        "menuisier meuble sur mesure",
        "devis menuiserie intérieure",
        "agencement bois atelier",
      ],
      exact: ["menuisier", "devis menuisier", "menuiserie sur mesure"],
    },
    negatives: ["fenêtre pvc pas cher", "emploi", "formation", "castorama"],
    headlines: [
      "Menuiserie sur mesure",
      "Devis menuisier en ligne",
      "L’ouvrage déjà cadré",
    ],
    descriptions: [
      "Usage, essence, dimensions : le prospect compose avant l’appel.",
      "Uniquement ce que vous fabriquez. Le brief arrive complet.",
    ],
  },
  {
    sector: "garden",
    label: "Paysagiste",
    campaignName: "search-paysagiste",
    matchTypes: {
      broad: [
        "paysagiste",
        "aménagement jardin",
        "devis paysagiste",
        "création jardin",
      ],
      phrase: [
        "paysagiste aménagement extérieur",
        "devis jardin sur mesure",
        "création terrasse jardin",
      ],
      exact: ["paysagiste", "devis paysagiste", "aménagement jardin"],
    },
    negatives: ["emploi", "mower", "tondeuse", "diy", "leroy merlin"],
    headlines: [
      "Paysagiste, projet cadré",
      "Devis jardin en quelques choix",
      "Surface, usage, entretien",
    ],
    descriptions: [
      "Le prospect pose surface, usage et entretien. Vous rappelez pour proposer, pas pour découvrir.",
      "Aménagements à partir de vos gammes, pas un appel à vide.",
    ],
  },
  {
    sector: "rental",
    label: "Location matériel",
    campaignName: "search-location-materiel",
    matchTypes: {
      broad: [
        "location nacelle",
        "location matériel btp",
        "location groupe électrogène",
        "location mini pelle",
      ],
      phrase: [
        "location nacelle journée",
        "location matériel chantier",
        "devis location btp",
      ],
      exact: ["location nacelle", "location mini pelle", "location matériel btp"],
    },
    negatives: ["emploi", "vente", "occasion", "jeu", "jouet"],
    headlines: [
      "Location matériel, devis net",
      "Durée, capacité, options",
      "Demande complète, pas un appel",
    ],
    descriptions: [
      "Le chantier est cadré avant le coup de fil : matériel, durée, date.",
      "Votre parc, vos disponibilités, une demande exploitable.",
    ],
  },
  {
    sector: "fitout",
    label: "Aménagement industriel",
    campaignName: "search-amenagement-industriel",
    matchTypes: {
      broad: [
        "aménagement entrepôt",
        "aménagement atelier",
        "mobilier industriel",
        "agencement usine",
      ],
      phrase: [
        "aménagement logistique entrepôt",
        "devis aménagement industriel",
        "vestiaires atelier production",
      ],
      exact: ["aménagement entrepôt", "aménagement atelier", "agencement industriel"],
    },
    negatives: ["emploi", "bureau coworking", "ikea", "décoration"],
    headlines: [
      "Aménagement de site",
      "Devis industriel cadré",
      "Contraintes déjà posées",
    ],
    descriptions: [
      "Site, contraintes, gammes : vous rappelez pour proposer.",
      "Un funnel B2B, pas un formulaire « laissez un message ».",
    ],
  },
  {
    sector: "general",
    label: "Sur mesure",
    campaignName: "search-devis",
    matchTypes: {
      broad: ["devis sur mesure", "configurateur devis", "demande de devis"],
      phrase: ["devis en ligne sur mesure", "demande de devis professionnelle"],
      exact: ["devis sur mesure", "demande de devis"],
    },
    negatives: ["gratuit pdf", "modèle excel", "emploi"],
    headlines: [
      "Devis déjà cadré",
      "Le prospect configure",
      "Vous recevez un dossier",
    ],
    descriptions: [
      "Un parcours de devis, pas un formulaire de contact.",
      "Brief, catalogue, coordonnées. Vous rappelez pour vendre.",
    ],
  },
];

export function keywordPackForSector(sector: string): KeywordPack {
  return PACKS.find((pack) => pack.sector === sector) ?? PACKS[PACKS.length - 1]!;
}

export function allKeywordPacks(): KeywordPack[] {
  return PACKS;
}

export function keywordsAsPaste(pack: KeywordPack) {
  const lines = [
    "# Large",
    ...pack.matchTypes.broad,
    "",
    "# Expression",
    ...pack.matchTypes.phrase.map((word) => `"${word}"`),
    "",
    "# Exact",
    ...pack.matchTypes.exact.map((word) => `[${word}]`),
    "",
    "# Négatifs",
    ...pack.negatives.map((word) => `-${word.trim()}`),
  ];
  return lines.join("\n");
}
