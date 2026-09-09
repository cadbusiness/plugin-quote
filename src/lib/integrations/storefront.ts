/**
 * Réglages vitrine partagés entre WordPress, Shopify et QuoteBuilder.
 * Le plugin (WP aujourd'hui, app Shopify ensuite) lit et écrit ce contrat.
 */

export type StorefrontAudience = "all" | "logged_in";
export type StorefrontScope = "all" | "include" | "exclude";
export type StorefrontButtonStyle = "button" | "link";
export type StorefrontAfterAdd = "drawer" | "stay" | "list";

export type StorefrontSettings = {
  hidePrices: boolean;
  hideAddToCart: boolean;
  hideSaleFlash: boolean;
  hideCheckout: boolean;
  priceLabel: string;
  buttonLabel: string;
  buttonStyle: StorefrontButtonStyle;
  buttonBg: string;
  buttonColor: string;
  afterAdd: StorefrontAfterAdd;
  showFloatingButton: boolean;
  showOnShop: boolean;
  showOnProduct: boolean;
  showOnCart: boolean;
  showOnCheckout: boolean;
  audience: StorefrontAudience;
  outOfStockOnly: boolean;
  scope: StorefrontScope;
  productIds: string[];
  categoryIds: string[];
  listTitle: string;
  emptyMessage: string;
  funnelCta: string;
  continueShoppingLabel: string;
  showImages: boolean;
  showSku: boolean;
  showQty: boolean;
};

export const DEFAULT_STOREFRONT: StorefrontSettings = {
  hidePrices: true,
  hideAddToCart: true,
  hideSaleFlash: true,
  hideCheckout: false,
  priceLabel: "Sur devis",
  buttonLabel: "Demander un devis",
  buttonStyle: "button",
  buttonBg: "#E85D04",
  buttonColor: "#FFFFFF",
  afterAdd: "drawer",
  showFloatingButton: true,
  showOnShop: true,
  showOnProduct: true,
  showOnCart: true,
  showOnCheckout: true,
  audience: "all",
  outOfStockOnly: false,
  scope: "all",
  productIds: [],
  categoryIds: [],
  listTitle: "Demande de devis",
  emptyMessage: "Votre liste est vide. Ajoutez des produits depuis la boutique.",
  funnelCta: "Envoyer ma demande",
  continueShoppingLabel: "Retour à la boutique",
  showImages: true,
  showSku: false,
  showQty: true,
};

function asBool(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (value === "1" || value === "true" || value === "on") return true;
  if (value === "0" || value === "false" || value === "off") return false;
  return fallback;
}

function asText(value: unknown, fallback: string) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function asList(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[,\s]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

export function parseStorefront(value: unknown): StorefrontSettings {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const audience = raw.audience === "logged_in" ? "logged_in" : DEFAULT_STOREFRONT.audience;
  const scope = raw.scope === "include" || raw.scope === "exclude" ? raw.scope : DEFAULT_STOREFRONT.scope;
  const buttonStyle = raw.buttonStyle === "link" ? "link" : "button";
  const afterAdd =
    raw.afterAdd === "stay" || raw.afterAdd === "list" ? raw.afterAdd : DEFAULT_STOREFRONT.afterAdd;
  return {
    hidePrices: asBool(raw.hidePrices, DEFAULT_STOREFRONT.hidePrices),
    hideAddToCart: asBool(raw.hideAddToCart, DEFAULT_STOREFRONT.hideAddToCart),
    hideSaleFlash: asBool(raw.hideSaleFlash, DEFAULT_STOREFRONT.hideSaleFlash),
    hideCheckout: asBool(raw.hideCheckout, DEFAULT_STOREFRONT.hideCheckout),
    priceLabel: asText(raw.priceLabel, DEFAULT_STOREFRONT.priceLabel),
    buttonLabel: asText(raw.buttonLabel, DEFAULT_STOREFRONT.buttonLabel),
    buttonStyle,
    buttonBg: asText(raw.buttonBg, DEFAULT_STOREFRONT.buttonBg),
    buttonColor: asText(raw.buttonColor, DEFAULT_STOREFRONT.buttonColor),
    afterAdd,
    showFloatingButton: asBool(raw.showFloatingButton, DEFAULT_STOREFRONT.showFloatingButton),
    showOnShop: asBool(raw.showOnShop, DEFAULT_STOREFRONT.showOnShop),
    showOnProduct: asBool(raw.showOnProduct, DEFAULT_STOREFRONT.showOnProduct),
    showOnCart: asBool(raw.showOnCart, DEFAULT_STOREFRONT.showOnCart),
    showOnCheckout: asBool(raw.showOnCheckout, DEFAULT_STOREFRONT.showOnCheckout),
    audience,
    outOfStockOnly: asBool(raw.outOfStockOnly, DEFAULT_STOREFRONT.outOfStockOnly),
    scope,
    productIds: asList(raw.productIds),
    categoryIds: asList(raw.categoryIds),
    listTitle: asText(raw.listTitle, DEFAULT_STOREFRONT.listTitle),
    emptyMessage: asText(raw.emptyMessage, DEFAULT_STOREFRONT.emptyMessage),
    funnelCta: asText(raw.funnelCta, DEFAULT_STOREFRONT.funnelCta),
    continueShoppingLabel: asText(raw.continueShoppingLabel, DEFAULT_STOREFRONT.continueShoppingLabel),
    showImages: asBool(raw.showImages, DEFAULT_STOREFRONT.showImages),
    showSku: asBool(raw.showSku, DEFAULT_STOREFRONT.showSku),
    showQty: asBool(raw.showQty, DEFAULT_STOREFRONT.showQty),
  };
}

export type StorefrontCartLine = {
  id: string;
  qty: number;
  name?: string;
  sku?: string | null;
  variation?: string;
  options?: Record<string, string>;
};

export function parseStorefrontCart(raw: string | null | undefined): StorefrontCartLine[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const lines: StorefrontCartLine[] = [];
    for (const line of parsed) {
      if (!line || typeof line !== "object") continue;
      const row = line as Record<string, unknown>;
      const id = String(row.id ?? row.externalId ?? "").trim();
      if (!id) continue;
      const next: StorefrontCartLine = {
        id,
        qty: Math.max(1, Number(row.qty ?? row.quantity ?? 1) || 1),
      };
      if (typeof row.name === "string") next.name = row.name;
      if (typeof row.sku === "string") next.sku = row.sku;
      if (typeof row.variation === "string") next.variation = row.variation;
      if (row.options && typeof row.options === "object" && !Array.isArray(row.options)) {
        next.options = Object.fromEntries(
          Object.entries(row.options as Record<string, unknown>).map(([k, v]) => [k, String(v)]),
        );
      }
      lines.push(next);
    }
    return lines;
  } catch {
    return [];
  }
}
