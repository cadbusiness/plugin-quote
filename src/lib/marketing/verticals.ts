/**
 * Core market: sellers of configurable professional equipment.
 * Racking leads (first paying customer); the others share the same buying motion.
 */

export type Vertical = {
  id: string;
  label: string;
  examples: string;
  brief: string;
  href?: string;
};

export const LEAD_VERTICAL = {
  id: "rayonnage",
  label: "Rayonnage & stockage",
  headline: "Le prospect compose son rayonnage. Vous recevez un devis prêt à chiffrer.",
  text: "Charge par niveau, hauteur sous plafond, nombre de travées, type de charge. L’agent pose les bonnes questions sur votre catalogue, propose les configurations compatibles et vous livre un dossier scoré.",
  href: "/secteurs/funnel-devis-rayonnage-stockage",
  config: [
    { k: "Type", v: "Palettier lourd" },
    { k: "Charge", v: "800 kg / niveau" },
    { k: "Hauteur", v: "6 m sous plafond" },
    { k: "Linéaire", v: "40 m · 3 travées" },
    { k: "Délai", v: "Avant fin novembre" },
  ],
  result: { score: "Hot", budget: "4,8–6,2 k€" },
  proof: "En production chez un distributeur de rayonnage.",
} as const;

export const NEIGHBOR_VERTICALS: Vertical[] = [
  {
    id: "mezzanine",
    label: "Mezzanines & cloisons",
    examples: "Plateformes, cloisons d’atelier, bureaux d’entrepôt",
    brief: "Surface, charge au m², accès, escalier, garde-corps.",
  },
  {
    id: "manutention",
    label: "Manutention",
    examples: "Transpalettes, gerbeurs, chariots, convoyeurs",
    brief: "Charge, hauteur de levée, sol, fréquence d’usage.",
  },
  {
    id: "agencement",
    label: "Mobilier & agencement pro",
    examples: "Postes de travail, rangements, agencement de magasin",
    brief: "Nombre de postes, plans, finitions, délai chantier.",
    href: "/secteurs/funnel-devis-agencement-bureau",
  },
  {
    id: "atelier",
    label: "Équipement d’atelier",
    examples: "Établis, armoires, servantes, postes ESD",
    brief: "Dimensions, charge, options, quantité par site.",
  },
  {
    id: "emballage",
    label: "Emballage industriel",
    examples: "Caisses, calage, palettisation, consommables",
    brief: "Type, matière, volume, récurrence.",
    href: "/secteurs/funnel-devis-emballage-conditionnement",
  },
];

export const FIT_CRITERIA = [
  "Vos devis dépassent 2 000 €",
  "Vos produits se configurent (dimensions, charges, options)",
  "Votre catalogue est sur WooCommerce ou Shopify, ou saisi une fois",
  "Vous vendez à des pros, avec plusieurs relances par devis",
] as const;
