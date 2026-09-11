import type { Json } from "@/lib/db/database.types";

export const QUOTE_MODES = ["wizard", "catalog", "rfq"] as const;
export type QuoteMode = (typeof QUOTE_MODES)[number];

export const QUOTE_MODE_OPTIONS: {
  id: QuoteMode;
  label: string;
  hint: string;
}[] = [
  {
    id: "wizard",
    label: "Parcours",
    hint: "Funnel multi-étapes : questions, suggestions, règles Si/Alors.",
  },
  {
    id: "catalog",
    label: "Catalogue",
    hint: "Rayons d’abord, puis demande de devis.",
  },
  {
    id: "rfq",
    label: "Demande simple",
    hint: "Contact, besoin, lignes catalogue optionnelles. Même pipeline devis.",
  },
];

const LEGACY_TO_MODE: Record<string, QuoteMode> = {
  rfq: "rfq",
  light: "rfq",
  simple: "rfq",
  wizard: "wizard",
  configurator: "wizard",
  catalog: "catalog",
};

function themeRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** Parse stored or form input. Legacy aliases map onto the canonical enum. */
export function parseQuoteMode(value: unknown): QuoteMode | null {
  if (typeof value !== "string") return null;
  return LEGACY_TO_MODE[value.trim().toLowerCase()] ?? null;
}

export function isQuoteMode(value: string): value is QuoteMode {
  return QUOTE_MODES.includes(value as QuoteMode);
}

export function quoteModeFromTheme(theme: unknown): QuoteMode | null {
  const raw = themeRecord(theme);
  if (!raw) return null;
  return parseQuoteMode(raw.quoteMode);
}

function catalogKindFromTheme(theme: unknown): boolean {
  const raw = themeRecord(theme);
  return raw?.kind === "catalog";
}

/**
 * Shop theme wins when present (shop-local /b/…/devis).
 * Otherwise the linked configurator theme.
 * Unset + existing catalog-kind funnel → catalog.
 * Unset otherwise → wizard.
 */
export function resolveQuoteMode(input: { shopTheme?: unknown; configuratorTheme?: unknown }): QuoteMode {
  return (
    quoteModeFromTheme(input.shopTheme) ??
    quoteModeFromTheme(input.configuratorTheme) ??
    (catalogKindFromTheme(input.configuratorTheme) ? "catalog" : "wizard")
  );
}

export function isRfqQuoteMode(mode: QuoteMode | string | null | undefined): boolean {
  return mode === "rfq";
}

export function isCatalogQuoteMode(mode: QuoteMode | string | null | undefined): boolean {
  return mode === "catalog";
}

export function quoteModeLabel(mode: QuoteMode): string {
  return QUOTE_MODE_OPTIONS.find((item) => item.id === mode)?.label ?? "Parcours";
}

/** Persist only canonical `wizard` | `catalog` | `rfq`. */
export function themeWithQuoteMode(theme: Json | Record<string, unknown> | null | undefined, mode: QuoteMode): Json {
  const base = themeRecord(theme) ? { ...themeRecord(theme) } : {};
  return { ...base, quoteMode: mode } as Json;
}

/**
 * RFQ / shop devis catalog lines stay bound to the shop’s linked configurator
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
