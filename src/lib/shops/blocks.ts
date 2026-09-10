import type { Json } from "@/lib/db/database.types";
import type { ShopBlock, ShopBlockType, ShopFaqItem, ShopFeatureItem } from "@/lib/shops/types";

export const BLOCK_LABELS: Record<ShopBlockType, string> = {
  hero: "Bandeau",
  text: "Texte",
  image: "Image",
  categories: "Menu catégories",
  catalog: "Grille produits",
  quote_cta: "Demande de devis",
  faq: "Questions fréquentes",
  features: "Points forts",
  legal: "Texte légal",
};

export const BLOCK_PALETTE: ShopBlockType[] = [
  "hero",
  "text",
  "image",
  "categories",
  "catalog",
  "quote_cta",
  "faq",
  "features",
  "legal",
];

export function newBlockId() {
  return crypto.randomUUID();
}

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function parseFaq(value: unknown): ShopFaqItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({ q: str(item.q), a: str(item.a) }))
    .filter((item) => item.q || item.a);
}

function parseFeatures(value: unknown): ShopFeatureItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({ title: str(item.title), text: str(item.text) }))
    .filter((item) => item.title || item.text);
}

export function isShopBlockType(value: string): value is ShopBlockType {
  return value in BLOCK_LABELS;
}

export function parseBlock(value: unknown): ShopBlock | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const type = str(raw.type);
  if (!isShopBlockType(type)) return null;
  return {
    id: str(raw.id) || newBlockId(),
    type,
    heading: str(raw.heading),
    sub: str(raw.sub),
    text: str(raw.text),
    image: str(raw.image),
    imageAlt: str(raw.imageAlt),
    ctaLabel: str(raw.ctaLabel),
    category: str(raw.category),
    limit: num(raw.limit, 12),
    faq: parseFaq(raw.faq),
    features: parseFeatures(raw.features),
  };
}

export function parseBlocks(value: unknown): ShopBlock[] {
  if (!Array.isArray(value)) return [];
  return value.map(parseBlock).filter((block): block is ShopBlock => Boolean(block));
}

export function emptyBlock(type: ShopBlockType): ShopBlock {
  switch (type) {
    case "hero":
      return {
        id: newBlockId(),
        type,
        heading: "Équipez votre projet",
        sub: "Catalogue, catégories et demande de devis — sans paiement en ligne.",
        ctaLabel: "Demander un devis",
        image: "",
        imageAlt: "",
      };
    case "text":
      return {
        id: newBlockId(),
        type,
        heading: "À propos",
        text: "Présentez votre savoir-faire, vos délais et votre zone d’intervention.",
      };
    case "image":
      return { id: newBlockId(), type, image: "", imageAlt: "Photo du showroom ou d’une réalisation" };
    case "categories":
      return { id: newBlockId(), type, heading: "Rayons" };
    case "catalog":
      return { id: newBlockId(), type, heading: "Catalogue", limit: 12, category: "" };
    case "quote_cta":
      return {
        id: newBlockId(),
        type,
        heading: "Un projet sur mesure ?",
        text: "Décrivez le besoin : nous chiffrons à partir du catalogue.",
        ctaLabel: "Ouvrir le devis",
      };
    case "faq":
      return {
        id: newBlockId(),
        type,
        heading: "Questions fréquentes",
        faq: [
          { q: "Est-ce un achat en ligne ?", a: "Non. Cette boutique prépare un devis. Aucun paiement n’est pris ici." },
          { q: "Puis-je ajouter plusieurs produits ?", a: "Oui. Le funnel devis reprend le catalogue et compile une demande globale." },
        ],
      };
    case "features":
      return {
        id: newBlockId(),
        type,
        heading: "Pourquoi cette vitrine",
        features: [
          { title: "Catalogue réel", text: "Les fiches viennent de votre catalogue QuoteBuilder." },
          { title: "Devis, pas de caisse", text: "Le prospect demande un chiffrage, vous restez maître du prix." },
          { title: "Référencement", text: "Pages indexables, données structurées, mentions légales." },
        ],
      };
    case "legal":
      return { id: newBlockId(), type, heading: "Mentions légales", text: "" };
  }
}

export function blocksJson(blocks: ShopBlock[]): Json {
  return blocks as unknown as Json;
}
