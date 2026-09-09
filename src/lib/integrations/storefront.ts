/**
 * Réglages vitrine partagés entre WordPress, Shopify et QuoteBuilder.
 * Le plugin (WP aujourd’hui, app Shopify ensuite) lit et écrit ce contrat.
 */

export type StorefrontAudience = "all" | "logged_in" | "guests" | "roles";
export type StorefrontScope = "all" | "include" | "exclude";
export type StorefrontButtonStyle = "button" | "link";
export type StorefrontAfterAdd = "drawer" | "notice" | "list" | "stay";
export type StorefrontStockMode = "all" | "oos_only" | "hide_oos";
export type StorefrontProductPosition = "inline" | "below";
export type StorefrontPageLayout = "split" | "stack";
export type StorefrontShopUrlMode = "shop" | "custom";

export type StorefrontSettings = {
  hidePrices: boolean;
  hideAddToCart: boolean;
  hideSaleFlash: boolean;
  hideCheckout: boolean;
  priceLabel: string;
  buttonLabel: string;
  buttonStyle: StorefrontButtonStyle;
  buttonBg: string;
  buttonBgHover: string;
  buttonBorder: string;
  buttonBorderHover: string;
  buttonColor: string;
  buttonColorHover: string;
  requestQuoteLabel: string;
  requestButtonStyle: StorefrontButtonStyle;
  requestBg: string;
  requestBgHover: string;
  requestBorder: string;
  requestBorderHover: string;
  requestColor: string;
  requestColorHover: string;
  afterAdd: StorefrontAfterAdd;
  addedLabel: string;
  alreadyInListLabel: string;
  browseListLabel: string;
  showFloatingButton: boolean;
  showOnShop: boolean;
  showOnProduct: boolean;
  showOnBlocks: boolean;
  showOnCart: boolean;
  showOnCheckout: boolean;
  productButtonPosition: StorefrontProductPosition;
  audience: StorefrontAudience;
  roles: string[];
  stockMode: StorefrontStockMode;
  /** @deprecated dérivé de stockMode, conservé pour les anciens plugins */
  outOfStockOnly: boolean;
  scope: StorefrontScope;
  productIds: string[];
  categoryIds: string[];
  tagIds: string[];
  listTitle: string;
  emptyMessage: string;
  funnelCta: string;
  formTitle: string;
  pageLayout: StorefrontPageLayout;
  showFormWhenEmpty: boolean;
  showImages: boolean;
  showSku: boolean;
  showQty: boolean;
  showPrice: boolean;
  showLineTotal: boolean;
  showGrandTotal: boolean;
  showTaxes: boolean;
  showUniqueCount: boolean;
  showBackToShop: boolean;
  continueShoppingLabel: string;
  continueShoppingUrlMode: StorefrontShopUrlMode;
  continueShoppingCustomUrl: string;
  showUpdateList: boolean;
  updateListLabel: string;
  showClearList: boolean;
  clearListLabel: string;
  quotePageId: string;
};

const ORANGE = "#E85D04";
const ORANGE_HOVER = "#C2410C";
const WHITE = "#FFFFFF";

export const DEFAULT_STOREFRONT: StorefrontSettings = {
  hidePrices: true,
  hideAddToCart: true,
  hideSaleFlash: true,
  hideCheckout: false,
  priceLabel: "Sur devis",
  buttonLabel: "Ajouter au devis",
  buttonStyle: "button",
  buttonBg: ORANGE,
  buttonBgHover: ORANGE_HOVER,
  buttonBorder: ORANGE,
  buttonBorderHover: ORANGE_HOVER,
  buttonColor: WHITE,
  buttonColorHover: WHITE,
  requestQuoteLabel: "Demander un devis",
  requestButtonStyle: "button",
  requestBg: ORANGE,
  requestBgHover: ORANGE_HOVER,
  requestBorder: ORANGE,
  requestBorderHover: ORANGE_HOVER,
  requestColor: WHITE,
  requestColorHover: WHITE,
  afterAdd: "drawer",
  addedLabel: "Produit ajouté à la liste",
  alreadyInListLabel: "Ce produit figure déjà dans votre liste de devis.",
  browseListLabel: "Consulter la liste",
  showFloatingButton: true,
  showOnShop: true,
  showOnProduct: true,
  showOnBlocks: true,
  showOnCart: true,
  showOnCheckout: false,
  productButtonPosition: "inline",
  audience: "all",
  roles: [],
  stockMode: "all",
  outOfStockOnly: false,
  scope: "all",
  productIds: [],
  categoryIds: [],
  tagIds: [],
  listTitle: "Demande de devis",
  emptyMessage: "Votre liste est vide. Ajoutez des produits depuis la boutique.",
  funnelCta: "Envoyer ma demande",
  formTitle: "Envoyer la demande",
  pageLayout: "split",
  showFormWhenEmpty: false,
  showImages: true,
  showSku: false,
  showQty: true,
  showPrice: false,
  showLineTotal: false,
  showGrandTotal: false,
  showTaxes: false,
  showUniqueCount: false,
  showBackToShop: true,
  continueShoppingLabel: "Retour à la boutique",
  continueShoppingUrlMode: "shop",
  continueShoppingCustomUrl: "",
  showUpdateList: true,
  updateListLabel: "Mettre à jour la liste",
  showClearList: true,
  clearListLabel: "Effacer la liste",
  quotePageId: "",
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

function asOptionalText(value: unknown, fallback: string) {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
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

function asStockMode(raw: Record<string, unknown>): StorefrontStockMode {
  if (raw.stockMode === "oos_only" || raw.stockMode === "hide_oos" || raw.stockMode === "all") {
    return raw.stockMode;
  }
  return asBool(raw.outOfStockOnly, false) ? "oos_only" : DEFAULT_STOREFRONT.stockMode;
}

export function parseStorefront(value: unknown): StorefrontSettings {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const audience: StorefrontAudience =
    raw.audience === "logged_in" || raw.audience === "guests" || raw.audience === "roles"
      ? raw.audience
      : DEFAULT_STOREFRONT.audience;
  const scope = raw.scope === "include" || raw.scope === "exclude" ? raw.scope : DEFAULT_STOREFRONT.scope;
  const buttonStyle = raw.buttonStyle === "link" ? "link" : "button";
  const requestButtonStyle = raw.requestButtonStyle === "link" ? "link" : "button";
  const afterAdd: StorefrontAfterAdd =
    raw.afterAdd === "stay" || raw.afterAdd === "list" || raw.afterAdd === "notice"
      ? raw.afterAdd
      : DEFAULT_STOREFRONT.afterAdd;
  const stockMode = asStockMode(raw);
  const productButtonPosition: StorefrontProductPosition =
    raw.productButtonPosition === "below" ? "below" : "inline";
  const pageLayout: StorefrontPageLayout = raw.pageLayout === "stack" ? "stack" : "split";
  const continueShoppingUrlMode: StorefrontShopUrlMode =
    raw.continueShoppingUrlMode === "custom" ? "custom" : "shop";

  return {
    hidePrices: asBool(raw.hidePrices, DEFAULT_STOREFRONT.hidePrices),
    hideAddToCart: asBool(raw.hideAddToCart, DEFAULT_STOREFRONT.hideAddToCart),
    hideSaleFlash: asBool(raw.hideSaleFlash, DEFAULT_STOREFRONT.hideSaleFlash),
    hideCheckout: asBool(raw.hideCheckout, DEFAULT_STOREFRONT.hideCheckout),
    priceLabel: asText(raw.priceLabel, DEFAULT_STOREFRONT.priceLabel),
    buttonLabel: asText(raw.buttonLabel, DEFAULT_STOREFRONT.buttonLabel),
    buttonStyle,
    buttonBg: asText(raw.buttonBg, DEFAULT_STOREFRONT.buttonBg),
    buttonBgHover: asText(raw.buttonBgHover, DEFAULT_STOREFRONT.buttonBgHover),
    buttonBorder: asText(raw.buttonBorder, asText(raw.buttonBg, DEFAULT_STOREFRONT.buttonBorder)),
    buttonBorderHover: asText(raw.buttonBorderHover, asText(raw.buttonBgHover, DEFAULT_STOREFRONT.buttonBorderHover)),
    buttonColor: asText(raw.buttonColor, DEFAULT_STOREFRONT.buttonColor),
    buttonColorHover: asText(raw.buttonColorHover, asText(raw.buttonColor, DEFAULT_STOREFRONT.buttonColorHover)),
    requestQuoteLabel: asText(raw.requestQuoteLabel, DEFAULT_STOREFRONT.requestQuoteLabel),
    requestButtonStyle,
    requestBg: asText(raw.requestBg, asText(raw.buttonBg, DEFAULT_STOREFRONT.requestBg)),
    requestBgHover: asText(raw.requestBgHover, asText(raw.buttonBgHover, DEFAULT_STOREFRONT.requestBgHover)),
    requestBorder: asText(raw.requestBorder, asText(raw.requestBg, DEFAULT_STOREFRONT.requestBorder)),
    requestBorderHover: asText(
      raw.requestBorderHover,
      asText(raw.requestBgHover, DEFAULT_STOREFRONT.requestBorderHover),
    ),
    requestColor: asText(raw.requestColor, asText(raw.buttonColor, DEFAULT_STOREFRONT.requestColor)),
    requestColorHover: asText(raw.requestColorHover, asText(raw.requestColor, DEFAULT_STOREFRONT.requestColorHover)),
    afterAdd,
    addedLabel: asText(raw.addedLabel, DEFAULT_STOREFRONT.addedLabel),
    alreadyInListLabel: asText(raw.alreadyInListLabel, DEFAULT_STOREFRONT.alreadyInListLabel),
    browseListLabel: asText(raw.browseListLabel, DEFAULT_STOREFRONT.browseListLabel),
    showFloatingButton: asBool(raw.showFloatingButton, DEFAULT_STOREFRONT.showFloatingButton),
    showOnShop: asBool(raw.showOnShop, DEFAULT_STOREFRONT.showOnShop),
    showOnProduct: asBool(raw.showOnProduct, DEFAULT_STOREFRONT.showOnProduct),
    showOnBlocks: asBool(raw.showOnBlocks, DEFAULT_STOREFRONT.showOnBlocks),
    showOnCart: asBool(raw.showOnCart, DEFAULT_STOREFRONT.showOnCart),
    showOnCheckout: asBool(raw.showOnCheckout, DEFAULT_STOREFRONT.showOnCheckout),
    productButtonPosition,
    audience,
    roles: asList(raw.roles),
    stockMode,
    outOfStockOnly: stockMode === "oos_only",
    scope,
    productIds: asList(raw.productIds),
    categoryIds: asList(raw.categoryIds),
    tagIds: asList(raw.tagIds),
    listTitle: asText(raw.listTitle, DEFAULT_STOREFRONT.listTitle),
    emptyMessage: asText(raw.emptyMessage, DEFAULT_STOREFRONT.emptyMessage),
    funnelCta: asText(raw.funnelCta, DEFAULT_STOREFRONT.funnelCta),
    formTitle: asOptionalText(raw.formTitle, DEFAULT_STOREFRONT.formTitle),
    pageLayout,
    showFormWhenEmpty: asBool(raw.showFormWhenEmpty, DEFAULT_STOREFRONT.showFormWhenEmpty),
    showImages: asBool(raw.showImages, DEFAULT_STOREFRONT.showImages),
    showSku: asBool(raw.showSku, DEFAULT_STOREFRONT.showSku),
    showQty: asBool(raw.showQty, DEFAULT_STOREFRONT.showQty),
    showPrice: asBool(raw.showPrice, DEFAULT_STOREFRONT.showPrice),
    showLineTotal: asBool(raw.showLineTotal, DEFAULT_STOREFRONT.showLineTotal),
    showGrandTotal: asBool(raw.showGrandTotal, DEFAULT_STOREFRONT.showGrandTotal),
    showTaxes: asBool(raw.showTaxes, DEFAULT_STOREFRONT.showTaxes),
    showUniqueCount: asBool(raw.showUniqueCount, DEFAULT_STOREFRONT.showUniqueCount),
    showBackToShop: asBool(raw.showBackToShop, DEFAULT_STOREFRONT.showBackToShop),
    continueShoppingLabel: asText(raw.continueShoppingLabel, DEFAULT_STOREFRONT.continueShoppingLabel),
    continueShoppingUrlMode,
    continueShoppingCustomUrl: asOptionalText(
      raw.continueShoppingCustomUrl,
      DEFAULT_STOREFRONT.continueShoppingCustomUrl,
    ),
    showUpdateList: asBool(raw.showUpdateList, DEFAULT_STOREFRONT.showUpdateList),
    updateListLabel: asText(raw.updateListLabel, DEFAULT_STOREFRONT.updateListLabel),
    showClearList: asBool(raw.showClearList, DEFAULT_STOREFRONT.showClearList),
    clearListLabel: asText(raw.clearListLabel, DEFAULT_STOREFRONT.clearListLabel),
    quotePageId: asOptionalText(raw.quotePageId, DEFAULT_STOREFRONT.quotePageId),
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
