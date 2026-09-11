import type { Json } from "@/lib/db/database.types";

export const QUOTE_MODES = ["configurator", "rfq"] as const;
export type QuoteMode = (typeof QUOTE_MODES)[number];

export const QUOTE_MODE_OPTIONS: {
  id: QuoteMode;
  label: string;
  hint: string;
}[] = [
  {
    id: "configurator",
    label: "Configurateur",
    hint: "Funnel complet : questions, catalogue, règles Si/Alors.",
  },
  {
    id: "rfq",
    label: "Demande simple",
    hint: "Contact, besoin, lignes catalogue optionnelles. Même pipeline devis.",
  },
];

const RFQ_ALIASES = new Set(["rfq", "light", "simple"]);

function themeRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** Parse a stored flag. Unknown values are ignored (default stays configurator). */
export function parseQuoteMode(value: unknown): QuoteMode | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "configurator") return "configurator";
  if (RFQ_ALIASES.has(normalized)) return "rfq";
  return null;
}

export function quoteModeFromTheme(theme: unknown): QuoteMode | null {
  const raw = themeRecord(theme);
  if (!raw) return null;
  return parseQuoteMode(raw.quoteMode);
}

/**
 * Shop theme wins when present (shop-local /b/…/devis).
 * Otherwise the linked configurator theme. Missing / invalid → configurator.
 */
export function resolveQuoteMode(input: { shopTheme?: unknown; configuratorTheme?: unknown }): QuoteMode {
  return quoteModeFromTheme(input.shopTheme) ?? quoteModeFromTheme(input.configuratorTheme) ?? "configurator";
}

export function isRfqQuoteMode(mode: QuoteMode | string | null | undefined): boolean {
  return mode === "rfq";
}

export function quoteModeLabel(mode: QuoteMode): string {
  return QUOTE_MODE_OPTIONS.find((item) => item.id === mode)?.label ?? "Configurateur";
}

export function themeWithQuoteMode(theme: Json | Record<string, unknown> | null | undefined, mode: QuoteMode): Json {
  const base = themeRecord(theme) ? { ...themeRecord(theme) } : {};
  if (mode === "configurator") {
    delete base.quoteMode;
    return base as Json;
  }
  return { ...base, quoteMode: "rfq" } as Json;
}

/**
 * RFQ (and shop devis) catalog lines stay bound to the shop’s linked configurator
 * when a shopSlug is present. Public /c/ without shop hint keeps the funnel catalog.
 */
export function scopeQuoteCatalog<T extends { configuratorId: string }>(
  products: T[],
  opts: { shopSlug?: string | null; shopConfiguratorId?: string | null },
): T[] {
  const shopSlug = opts.shopSlug?.trim() || "";
  const shopConfiguratorId = opts.shopConfiguratorId?.trim() || "";
  if (!shopSlug) return products;
  if (!shopConfiguratorId) return [];
  return products.filter((product) => product.configuratorId === shopConfiguratorId);
}

export function matchCatalogPrefill<T extends { id: string; sku?: string | null; externalId?: string | null }>(
  products: T[],
  prefill?: string | null,
): T | undefined {
  const key = prefill?.trim() || "";
  if (!key) return undefined;
  return products.find((product) => product.id === key || product.sku === key || product.externalId === key);
}
