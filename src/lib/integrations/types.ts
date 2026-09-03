import type { ProductOption } from "@/lib/wizard/types";

export type CatalogProvider = "woocommerce" | "shopify";

export const PROVIDER_LABELS: Record<CatalogProvider, string> = {
  woocommerce: "WooCommerce",
  shopify: "Shopify",
};

export type ProductImage = {
  src: string;
  alt: string | null;
};

export type ProductVariant = {
  externalId: string;
  title: string;
  sku: string | null;
  price: number | null;
  compareAtPrice: number | null;
  available: boolean;
  imageSrc: string | null;
  /** Valeurs d'options : { "Couleur": "Noir", "Taille": "L" } */
  selected: Record<string, string>;
};

/**
 * Produit normalisé — dénominateur commun entre WooCommerce et Shopify.
 * C'est la seule forme que le moteur de synchronisation manipule.
 */
export type NormalizedProduct = {
  externalId: string;
  name: string;
  description: string | null;
  sku: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  images: ProductImage[];
  category: string | null;
  tags: string[];
  url: string | null;
  status: "active" | "draft" | "archived";
  stockStatus: "instock" | "outofstock" | "onbackorder" | null;
  options: ProductOption[];
  variants: ProductVariant[];
  externalUpdatedAt: string | null;
};

export type WooCredentials = {
  consumer_key: string;
  consumer_secret: string;
};

export type ShopifyCredentials = {
  access_token: string;
};

export type ProviderCredentials = Record<string, string>;

export type ConnectionSettings = {
  /** Importer aussi les brouillons / produits non publiés */
  importDrafts: boolean;
  /** Ignorer les produits en rupture */
  skipOutOfStock: boolean;
  /** Désactiver dans QuoteBuilder les produits disparus de la boutique */
  archiveMissing: boolean;
  /** Marge appliquée aux prix importés, en pourcentage (0 = prix boutique) */
  markupPercent: number;
  /** Ne garder que ces catégories / types de produit (vide = tout) */
  categories: string[];
};

export const DEFAULT_SETTINGS: ConnectionSettings = {
  importDrafts: false,
  skipOutOfStock: false,
  archiveMissing: true,
  markupPercent: 0,
  categories: [],
};

export function parseSettings(value: unknown): ConnectionSettings {
  const raw = (value && typeof value === "object" ? value : {}) as Partial<ConnectionSettings>;
  return {
    importDrafts: Boolean(raw.importDrafts ?? DEFAULT_SETTINGS.importDrafts),
    skipOutOfStock: Boolean(raw.skipOutOfStock ?? DEFAULT_SETTINGS.skipOutOfStock),
    archiveMissing: Boolean(raw.archiveMissing ?? DEFAULT_SETTINGS.archiveMissing),
    markupPercent: Number(raw.markupPercent ?? 0) || 0,
    categories: Array.isArray(raw.categories) ? raw.categories.map(String).filter(Boolean) : [],
  };
}

/** Connexion résolue, credentials déjà déchiffrés. */
export type ResolvedConnection = {
  id: string;
  organizationId: string;
  configuratorId: string | null;
  provider: CatalogProvider;
  label: string;
  storeDomain: string;
  credentials: ProviderCredentials;
  settings: ConnectionSettings;
  webhookSecret: string | null;
  currency: string;
};

export type ConnectionTest =
  | { ok: true; shopName: string; currency: string; productCount: number | null }
  | { ok: false; error: string };

export type ProductPage = {
  products: NormalizedProduct[];
  /** Curseur pour la page suivante, null quand c'est fini. */
  cursor: string | null;
};

export type CatalogAdapter = {
  id: CatalogProvider;
  label: string;
  test(connection: ResolvedConnection): Promise<ConnectionTest>;
  fetchPage(connection: ResolvedConnection, cursor: string | null): Promise<ProductPage>;
  fetchOne(connection: ResolvedConnection, externalId: string): Promise<NormalizedProduct | null>;
  verifyWebhook(connection: ResolvedConnection, rawBody: string, headers: Headers): boolean;
  /** Extrait l'identifiant produit et le type d'évènement d'un webhook. */
  readWebhook(rawBody: string, headers: Headers): { externalId: string; deleted: boolean } | null;
};

export class IntegrationError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "IntegrationError";
    this.status = status;
  }
}
