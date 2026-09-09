export const PRODUCT_CURRENCIES = [
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "Dollar US", symbol: "$" },
  { code: "GBP", label: "Livre sterling", symbol: "£" },
  { code: "CHF", label: "Franc suisse", symbol: "CHF" },
  { code: "CAD", label: "Dollar canadien", symbol: "CA$" },
  { code: "MAD", label: "Dirham", symbol: "MAD" },
  { code: "XOF", label: "Franc CFA", symbol: "F CFA" },
] as const;

export type ProductCurrency = (typeof PRODUCT_CURRENCIES)[number]["code"];

/** Taux de secours (1 EUR = …) si le flux BCE est injoignable. */
export const FALLBACK_RATES_EUR: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  CHF: 0.94,
  CAD: 1.49,
  MAD: 10.75,
  XOF: 655.957,
};

export function isProductCurrency(value: string): value is ProductCurrency {
  return PRODUCT_CURRENCIES.some((currency) => currency.code === value);
}

export function convertAmount(amount: number, from: string, to: string, ratesEur: Record<string, number>) {
  if (from === to) return amount;
  const source = ratesEur[from];
  const target = ratesEur[to];
  if (!source || !target) return amount;
  return Math.round((amount / source) * target * 100) / 100;
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
