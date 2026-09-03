import type { ProductOption } from "@/lib/wizard/types";

function toNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Trois façons d'annoncer un prix : montant unique, fourchette, ou rien du tout
 * (« sur devis »). La base ne connaît que price_min / price_max.
 */
export function readPriceRange(formData: FormData) {
  const mode = String(formData.get("price_mode") ?? "range");
  if (mode === "quote") return { priceMin: null, priceMax: null };
  if (mode === "fixed") {
    const price = toNumber(formData.get("price_min"));
    return { priceMin: price, priceMax: price };
  }
  const priceMin = toNumber(formData.get("price_min"));
  const priceMax = toNumber(formData.get("price_max"));
  if (priceMin !== null && priceMax !== null && priceMax < priceMin) {
    return { priceMin: priceMax, priceMax: priceMin };
  }
  return { priceMin, priceMax };
}

export function priceModeOf(priceMin: number | null, priceMax: number | null) {
  if (priceMin === null && priceMax === null) return "quote" as const;
  if (priceMin !== null && priceMin === priceMax) return "fixed" as const;
  return "range" as const;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Lignes « Libellé | valeurs séparées par des virgules » du formulaire produit. */
export function parseProductOptions(formData: FormData): ProductOption[] {
  const labels = formData.getAll("option_label").map(String);
  const values = formData.getAll("option_values").map(String);

  const options: ProductOption[] = [];
  labels.forEach((label, index) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const parsed = (values[index] ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => ({ value: slugify(value), label: value }));
    if (!parsed.length) return;
    options.push({ key: slugify(trimmed), label: trimmed, values: parsed });
  });
  return options;
}
