import type { FunnelFamilyId } from "@/lib/funnels/families";

/**
 * Photos stock Unsplash — placeholders de premier jet, à remplacer dans Puck
 * (inspecteur Image → URL + texte alternatif). Pas des visuels commerçant.
 */
export const SHOP_PLACEHOLDER_SOURCE =
  "Stock Unsplash (placeholder). Remplacez l’URL dans l’inspecteur Image de Puck.";

export type ShopPlaceholderSlot = "hero" | "split" | "catalog";

export type ShopPlaceholderSet = Record<ShopPlaceholderSlot, { image: string; hint: string }>;

function unsplash(id: string, w = 1600) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

const SETS: Record<FunnelFamilyId, ShopPlaceholderSet> = {
  racking: {
    hero: { image: unsplash("photo-1586528116311-ad8dd3c8310d"), hint: "Entrepôt, travées" },
    split: { image: unsplash("photo-1553413077-190dd305871c", 1400), hint: "Allée de stockage" },
    catalog: { image: unsplash("photo-1587293852726-70cdb56c2866", 1400), hint: "Rayonnage en situation" },
  },
  habitat: {
    hero: { image: unsplash("photo-1556912173-46c336c7fd55"), hint: "Cuisine aménagée" },
    split: { image: unsplash("photo-1600585154340-be6161a56a0c", 1400), hint: "Intérieur d’habitation" },
    catalog: { image: unsplash("photo-1556909114-f6e7ad7d3136", 1400), hint: "Détail d’aménagement" },
  },
  events: {
    hero: { image: unsplash("photo-1519167758481-83f29da84989"), hint: "Salle événementielle" },
    split: { image: unsplash("photo-1464366400600-7168b8af9bc3", 1400), hint: "Table dressée" },
    catalog: { image: unsplash("photo-1492684223066-81342ee5ff30", 1400), hint: "Scène / jauge" },
  },
  industry: {
    hero: { image: unsplash("photo-1565043589221-1a6fd9ae45c7"), hint: "Atelier de fabrication" },
    split: { image: unsplash("photo-1504328345606-18bbc8c9d7d1", 1400), hint: "Ligne industrielle" },
    catalog: { image: unsplash("photo-1581091226825-a6a2a5aee158", 1400), hint: "Poste de production" },
  },
  services: {
    hero: { image: unsplash("photo-1497366216548-37526070297c"), hint: "Espace de travail" },
    split: { image: unsplash("photo-1497366811353-6870744d04b2", 1400), hint: "Salle de réunion" },
    catalog: { image: unsplash("photo-1522071820081-009f0129c71c", 1400), hint: "Équipe en session" },
  },
  property: {
    hero: { image: unsplash("photo-1486406146926-c627a92ad1ab"), hint: "Immeuble / chantier urbain" },
    split: { image: unsplash("photo-1503387762-592deb58ef4e", 1400), hint: "Plan et architecture" },
    catalog: { image: unsplash("photo-1487958449943-2429e8be8625", 1400), hint: "Façade contemporaine" },
  },
  health: {
    hero: { image: unsplash("photo-1576091160399-112ba8d25d1d"), hint: "Espace de soin" },
    split: { image: unsplash("photo-1579684385127-1ef15d508118", 1400), hint: "Accueil clinique" },
    catalog: { image: unsplash("photo-1576091160550-2173dba999ef", 1400), hint: "Équipement médical" },
  },
  tech: {
    hero: { image: unsplash("photo-1519389950473-47ba0277781c"), hint: "Équipe produit" },
    split: { image: unsplash("photo-1460925895917-afdab827c52f", 1400), hint: "Tableau de bord" },
    catalog: { image: unsplash("photo-1553877522-43269d4ea984", 1400), hint: "Atelier numérique" },
  },
  custom: {
    hero: { image: unsplash("photo-1497366811353-6870744d04b2"), hint: "Showroom / bureau" },
    split: { image: unsplash("photo-1497366216548-37526070297c", 1400), hint: "Espace d’accueil" },
    catalog: { image: unsplash("photo-1524758631624-e2822e304c36", 1400), hint: "Détail d’intérieur" },
  },
};

export function shopPlaceholders(sector: string): ShopPlaceholderSet {
  return SETS[(sector in SETS ? sector : "custom") as FunnelFamilyId];
}

export function placeholderCatalogForPrompt(sector: string) {
  const set = shopPlaceholders(sector);
  return [
    `${SHOP_PLACEHOLDER_SOURCE}`,
    `- hero : ${set.hero.image} (${set.hero.hint})`,
    `- split : ${set.split.image} (${set.split.hint})`,
    `- catalogue : ${set.catalog.image} (${set.catalog.hint})`,
  ].join("\n");
}
