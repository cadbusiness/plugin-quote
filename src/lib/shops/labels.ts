export const SHOP_NODE_LABEL: Record<string, string> = {
  Section: "Section",
  Columns: "Colonnes",
  Heading: "Titre",
  Text: "Texte",
  Image: "Image",
  Button: "Bouton",
  Hero: "Bandeau",
  Catalog: "Grille produits",
  Categories: "Menu catégories",
  QuoteCta: "Demande de devis",
  Faq: "Questions fréquentes",
  Features: "Points forts",
  Legal: "Texte légal",
};

export function shopNodeLabel(type: string) {
  return SHOP_NODE_LABEL[type] ?? type;
}
