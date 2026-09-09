/**
 * Réglages vitrine partagés entre WordPress, Shopify et QuoteBuilder.
 * Le plugin (WP aujourd'hui, app Shopify ensuite) lit et écrit ce contrat.
 */

export type StorefrontAudience = "all" | "logged_in";
export type StorefrontScope = "all" | "include" | "exclude";
export type StorefrontButtonStyle = "button" | "link";

export type StorefrontSettings = {
  hidePrices: boolean;
  hideAddToCart: boolean;
  buttonLabel: string;
  buttonStyle: StorefrontButtonStyle;
  buttonBg: string;
  buttonColor: string;
  showOnShop: boolean;
  showOnProduct: boolean;
  showOnCart: boolean;
  showOnCheckout: boolean;
  audience: StorefrontAudience;
  outOfStockOnly: boolean;
  scope: StorefrontScope;
  productIds: string[];
  categoryIds: string[];
};

export const DEFAULT_STOREFRONT: StorefrontSettings = {
  hidePrices: true,
  hideAddToCart: true,
  buttonLabel: "Demander un devis",
  buttonStyle: "button",
  buttonBg: "#E85D04",
  buttonColor: "#FFFFFF",
  showOnShop: true,
  showOnProduct: true,
  showOnCart: true,
  showOnCheckout: true,
  audience: "all",
  outOfStockOnly: false,
  scope: "all",
  productIds: [],
  categoryIds: [],
};

function asBool(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (value === "1" || value === "true" || value === "on") return true;
  if (value === "0" || value === "false" || value === "off") return false;
  return fallback;
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
  return {
    hidePrices: asBool(raw.hidePrices, DEFAULT_STOREFRONT.hidePrices),
    hideAddToCart: asBool(raw.hideAddToCart, DEFAULT_STOREFRONT.hideAddToCart),
    buttonLabel: String(raw.buttonLabel ?? DEFAULT_STOREFRONT.buttonLabel).trim() || DEFAULT_STOREFRONT.buttonLabel,
    buttonStyle,
    buttonBg: String(raw.buttonBg ?? DEFAULT_STOREFRONT.buttonBg).trim() || DEFAULT_STOREFRONT.buttonBg,
    buttonColor: String(raw.buttonColor ?? DEFAULT_STOREFRONT.buttonColor).trim() || DEFAULT_STOREFRONT.buttonColor,
    showOnShop: asBool(raw.showOnShop, DEFAULT_STOREFRONT.showOnShop),
    showOnProduct: asBool(raw.showOnProduct, DEFAULT_STOREFRONT.showOnProduct),
    showOnCart: asBool(raw.showOnCart, DEFAULT_STOREFRONT.showOnCart),
    showOnCheckout: asBool(raw.showOnCheckout, DEFAULT_STOREFRONT.showOnCheckout),
    audience,
    outOfStockOnly: asBool(raw.outOfStockOnly, DEFAULT_STOREFRONT.outOfStockOnly),
    scope,
    productIds: asList(raw.productIds),
    categoryIds: asList(raw.categoryIds),
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
