import type { Json } from "@/lib/db/database.types";
import { formatPrice } from "@/lib/format";

/**
 * Fourchette d'un devis. Une seule règle, relue par la carte solution, le PDF,
 * l'email, la fiche et l'espace prospect.
 *
 * - Carte solution : fourchette de la règle Si/Alors quand elle est renseignée
 *   (estimation de lot posée par le commerçant). Sinon, somme des lignes
 *   (prix unitaire × quantité).
 * - PDF « Fourchette indicative », email {{price_range}}, fiche et espace :
 *   la même fourchette, figée à l'envoi dans quotes.extracted_params.quote_price.
 *   Sans ce tampon (devis déjà en base), repli sur la somme des lignes.
 * - Lignes PDF, fiche et espace : montant de la ligne = unitaire × quantité,
 *   pas le prix catalogue brut. Ce détail peut différer de la fourchette de lot.
 */

export type MoneyRange = {
  min: number | null;
  max: number | null;
};

export type PricedLine = {
  priceMin?: number | null;
  priceMax?: number | null;
  price_min?: number | null;
  price_max?: number | null;
  quantity?: number | null;
};

const QUOTE_PRICE_KEY = "quote_price";

function finiteOrNull(value: number | null | undefined): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function orderPriceBounds(
  min: number | null | undefined,
  max: number | null | undefined,
): MoneyRange {
  const low = finiteOrNull(min);
  const high = finiteOrNull(max);
  if (low != null && high != null && high < low) return { min: high, max: low };
  return { min: low, max: high };
}

function lineQuantity(quantity: number | null | undefined) {
  if (quantity == null || !Number.isFinite(quantity) || quantity <= 0) return 1;
  return quantity;
}

export function lineRange(line: PricedLine): MoneyRange {
  const unit = orderPriceBounds(line.priceMin ?? line.price_min, line.priceMax ?? line.price_max);
  const qty = lineQuantity(line.quantity);
  return {
    min: unit.min == null ? null : unit.min * qty,
    max: unit.max == null ? null : unit.max * qty,
  };
}

export function sumLineRanges(lines: PricedLine[]): MoneyRange {
  let min = 0;
  let max = 0;
  let hasMin = false;
  let hasMax = false;
  for (const line of lines) {
    const range = lineRange(line);
    if (range.min != null) {
      min += range.min;
      hasMin = true;
    }
    if (range.max != null) {
      max += range.max;
      hasMax = true;
    } else if (range.min != null) {
      max += range.min;
      hasMax = true;
    }
  }
  return {
    min: hasMin ? min : null,
    max: hasMax ? max : null,
  };
}

/** Règle commerçant si elle a un montant, sinon somme des lignes. */
export function quoteHeadlineRange(input: {
  lines?: PricedLine[];
  ruleMin?: number | null;
  ruleMax?: number | null;
}): MoneyRange {
  const rule = orderPriceBounds(input.ruleMin, input.ruleMax);
  if (rule.min != null || rule.max != null) return rule;
  return sumLineRanges(input.lines ?? []);
}

export function suggestionCardRange(
  suggestion: {
    priceMin: number | null;
    priceMax: number | null;
    products: { id: string; priceMin: number | null; priceMax: number | null }[];
  },
  quantities: Record<string, number> = {},
): MoneyRange {
  return quoteHeadlineRange({
    ruleMin: suggestion.priceMin,
    ruleMax: suggestion.priceMax,
    lines: suggestion.products.map((product) => ({
      priceMin: product.priceMin,
      priceMax: product.priceMax,
      quantity: quantities[product.id] || 1,
    })),
  });
}

/** Tampon d'envoi prioritaire. Absent → null, pour retomber sur les lignes. */
export function displayedQuoteRange(input: {
  stored: MoneyRange | null;
  lines: PricedLine[];
}): MoneyRange {
  if (input.stored) return { min: input.stored.min, max: input.stored.max };
  return sumLineRanges(input.lines);
}

export function resolveDisplayCurrency(
  codes: Array<string | null | undefined>,
  fallback = "EUR",
): string {
  const unique = [
    ...new Set(codes.map((code) => (code ?? "").trim().toUpperCase()).filter(Boolean)),
  ];
  if (unique.length === 1) return unique[0];
  const fb = fallback.trim().toUpperCase();
  return fb || "EUR";
}

export type StoredQuotePrice = MoneyRange & { currency: string | null };

export function stampQuotePrice(
  params: Json | null | undefined,
  range: MoneyRange,
  currency: string,
): Json {
  const base =
    params && typeof params === "object" && !Array.isArray(params)
      ? { ...(params as Record<string, unknown>) }
      : {};
  return {
    ...base,
    [QUOTE_PRICE_KEY]: {
      min: range.min,
      max: range.max,
      currency,
    },
  } as Json;
}

export function readQuotePrice(params: Json | null | undefined): StoredQuotePrice | null {
  if (!params || typeof params !== "object" || Array.isArray(params)) return null;
  const raw = (params as Record<string, unknown>)[QUOTE_PRICE_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const price = raw as Record<string, unknown>;
  return {
    min: finiteOrNull(typeof price.min === "number" ? price.min : price.min == null ? null : Number(price.min)),
    max: finiteOrNull(typeof price.max === "number" ? price.max : price.max == null ? null : Number(price.max)),
    currency:
      typeof price.currency === "string" && price.currency.trim()
        ? price.currency.trim().toUpperCase()
        : null,
  };
}

export function formatLineAmount(line: PricedLine, currency?: string | null) {
  const range = lineRange(line);
  return formatPrice(range.min, range.max, currency);
}
