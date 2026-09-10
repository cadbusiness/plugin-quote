import { formatPrice } from "@/lib/format";

export function displayProductName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  const shout = trimmed === trimmed.toUpperCase() && /\p{L}/u.test(trimmed);
  let text = shout ? trimmed.toLowerCase() : trimmed;
  text = text.replace(/(\d)\s*[x×X]\s*(?=\d)/g, "$1 × ");
  return text.replace(/^(\p{L})/u, (letter) => letter.toUpperCase());
}

export function formatCatalogPrice(
  min: number | null | undefined,
  max: number | null | undefined,
  currency = "EUR",
) {
  if (min == null && max == null) return null;
  if (min != null && max != null && min === max) return formatPrice(min, null, currency);
  return formatPrice(min, max, currency);
}

export function catalogChromeSummary(total: number, synced: number, shopLabel: string | null) {
  const products = `${total} produit${total > 1 ? "s" : ""}`;
  if (!synced) return products;
  if (shopLabel) return `${products} · ${synced} synchronisé${synced > 1 ? "s" : ""} depuis ${shopLabel}`;
  return `${products} · ${synced} synchronisé${synced > 1 ? "s" : ""}`;
}
