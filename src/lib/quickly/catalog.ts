import type { ProductAttribute } from "@/lib/catalog/attributes";

/**
 * Gammes publiées sur quickly-int.com, avec les cinq specs hors description.
 * Délai : aucun nombre de jours n’est publié. La fiche À propos indique un
 * entrepôt de 2500 m² pour répondre depuis le stock.
 * Superbuild, Unibuild, Unicant et la mezzanine ne sont pas ici : la fiche
 * Quickly ne donne pas à la fois charge / niveau, hauteur max, profondeur et matériau.
 */
export const QUICKLY_STOCK_LEAD = "Stock entrepôt 2500 m²";

export type QuicklyCatalogProduct = {
  sku: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  options: ProductAttribute[];
};

function choice(key: string, label: string, labels: string[]): ProductAttribute {
  return {
    key,
    label,
    kind: "choices",
    values: labels.map((item) => ({
      value: item
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      label: item,
    })),
  };
}

function measure(key: string, label: string, value: string, unit: string): ProductAttribute {
  return { key, label, kind: value.includes("–") ? "text" : "number", value, unit };
}

function fact(key: string, label: string, value: string): ProductAttribute {
  return { key, label, kind: "text", value };
}

const LIGHT_CHOICES: ProductAttribute[] = [
  choice("largeur", "Largeur", ["900 mm", "1050 mm", "1200 mm", "1350 mm", "1500 mm", "1650 mm", "1800 mm"]),
  choice("profondeur-utile", "Profondeur", ["300 mm", "400 mm", "500 mm", "600 mm", "700 mm", "800 mm"]),
  choice("hauteur-utile", "Hauteur", ["1570 mm", "1840 mm", "1972 mm", "2500 mm"]),
  choice("niveaux", "Niveaux", ["3", "4", "5", "6", "7"]),
];

export const QUICKLY_PRODUCTS: QuicklyCatalogProduct[] = [
  {
    sku: "QB-QCK-UNIRACK",
    name: "Rayonnage Unirack",
    description:
      "Étagère autoportante, assemblage sans vis ni boulons. Tablettes pleines, perforées 50 % ou polypropylène.",
    category: "Rayonnage léger",
    tags: ["leger", "commerce", "garage", "archives"],
    url: "https://quickly-int.com/produit/unirack/",
    options: [
      ...LIGHT_CHOICES,
      measure("charge", "Charge", "280", "kg"),
      measure("hauteur", "Hauteur max", "2500", "mm"),
      measure("profondeur", "Profondeur lisse", "300–800", "mm"),
      fact("materiau", "Matériau", "Acier galvanisé certifié EN10204"),
      fact("delai", "Délai livraison", QUICKLY_STOCK_LEAD),
    ],
  },
  {
    sku: "QB-QCK-SUPER123",
    name: "Rayonnage Super 1/2/3",
    description:
      "Rayonnage à prise manuelle, assemblage sans vis. Tablettes pleines, perforées ou polypropylène haute densité.",
    category: "Rayonnage léger",
    tags: ["leger", "commerce", "garage", "alimentaire", "archives"],
    url: "https://quickly-int.com/produit/super-1-2-3/",
    options: [
      ...LIGHT_CHOICES,
      measure("charge", "Charge", "280", "kg"),
      measure("hauteur", "Hauteur max", "2500", "mm"),
      measure("profondeur", "Profondeur lisse", "300–800", "mm"),
      fact("materiau", "Matériau", "Acier galvanisé certifié EN10204"),
      fact("delai", "Délai livraison", QUICKLY_STOCK_LEAD),
    ],
  },
  {
    sku: "QB-QCK-UNISHELF",
    name: "Unishelf",
    description:
      "Rack mi-lourd de picking. Lisse rivetée, niveaux réglables. Accessoires sur les profondeurs courantes.",
    category: "Rayonnage mi-lourd",
    tags: ["moyen", "entrepot", "picking", "commerce"],
    url: "https://quickly-int.com/produit/unishelf/",
    options: [
      choice("largeur", "Largeur", ["1800 mm", "2100 mm", "2400 mm", "2700 mm", "3000 mm"]),
      choice("profondeur-utile", "Profondeur", ["400 mm", "500 mm", "600 mm", "700 mm", "800 mm", "1000 mm", "1100 mm", "1200 mm"]),
      choice("hauteur-utile", "Hauteur", ["2000 mm", "2500 mm", "3000 mm", "3500 mm", "4000 mm", "4500 mm", "5000 mm"]),
      choice("niveaux", "Niveaux", ["3", "4", "5", "6", "7"]),
      measure("charge", "Charge", "240–800", "kg"),
      measure("hauteur", "Hauteur max", "5000", "mm"),
      measure("profondeur", "Profondeur lisse", "400–1200", "mm"),
      measure("hauteur-lisse", "Hauteur de lisse", "70", "mm"),
      fact("materiau", "Matériau", "Acier galvanisé"),
      fact("delai", "Délai livraison", QUICKLY_STOCK_LEAD),
    ],
  },
];

export const QUICKLY_PLACEHOLDER_NAMES = [
  "Rayonnage palettes lourd",
  "Rayonnage mi-lourd",
  "Rayonnage picking / léger",
  "Rayonnage alimentaire inox",
  "Cantilever",
] as const;

/** Règles déjà créées par le seed Quickly. On ne fait que remplacer les produits. */
export const QUICKLY_RULE_SKUS: { name: string; skus: string[] }[] = [
  { name: "Entrepôt palettes", skus: ["QB-QCK-UNISHELF"] },
  { name: "Commerce / réserve", skus: ["QB-QCK-UNIRACK", "QB-QCK-SUPER123", "QB-QCK-UNISHELF"] },
  { name: "Cuisine professionnelle", skus: ["QB-QCK-SUPER123"] },
  { name: "Garage / atelier", skus: ["QB-QCK-SUPER123", "QB-QCK-UNIRACK"] },
  { name: "Solution mixte", skus: ["QB-QCK-UNIRACK", "QB-QCK-SUPER123", "QB-QCK-UNISHELF"] },
];
