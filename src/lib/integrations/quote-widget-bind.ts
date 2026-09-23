import { resolveCatalogLine, type WidgetMatrixProduct } from "@/lib/catalog/variant-matrix";

export type { WidgetMatrixProduct };
import { normalizeVariationId } from "@/lib/integrations/plugin-quotes";

export type WidgetLine = {
  productId: string;
  variationId: string;
  name: string;
  qty: number;
  sku: string;
  variation: string;
  url: string;
  selected?: Record<string, string>;
};

function text(value: unknown, max: number) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).trim().slice(0, max);
}

function readSelected(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const selected: Record<string, string> = {};
  for (const [key, option] of Object.entries(value as Record<string, unknown>)) {
    const name = text(key, 80);
    const choice = text(option, 120);
    if (!name || !choice || name === "woo_variation_id") continue;
    selected[name] = choice;
  }
  return Object.keys(selected).length ? selected : null;
}

function clampQty(value: unknown) {
  const qty = typeof value === "number" ? value : typeof value === "string" ? Number(value) : 1;
  if (!Number.isFinite(qty) || qty < 1) return 1;
  return Math.min(9999, Math.round(qty));
}

/** Woo cart rows (`id`, `variation_id`) and explicit productId rows. Drops lines without a product id. */
export function widgetLinesFromUnknown(value: unknown): WidgetLine[] {
  if (!Array.isArray(value)) return [];
  const lines: WidgetLine[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const row = entry as Record<string, unknown>;
    const productId = text(row.productId ?? row.id, 64);
    if (!productId || productId === "0") continue;
    const selected = readSelected(row.selected);
    lines.push({
      productId,
      variationId: normalizeVariationId(row.variationId ?? row.variation_id),
      name: text(row.name, 300),
      qty: clampQty(row.qty ?? row.quantity),
      sku: text(row.sku, 80),
      variation: text(row.variation, 300),
      url: text(row.url, 2000),
      ...(selected ? { selected } : {}),
    });
    if (lines.length >= 100) break;
  }
  return lines;
}

/**
 * Catalogue mode : une ligne variable doit tomber sur une variation réelle.
 * Combinaison inconnue → erreur, le SKU client n'est pas repris.
 * Produit simple → variationId vide et SKU parent (ou vide), jamais un SKU composé.
 */
export function bindWidgetLines(
  lines: WidgetLine[],
  catalog: readonly WidgetMatrixProduct[],
): { ok: true; lines: WidgetLine[] } | { ok: false; error: string } {
  const byId = new Map(catalog.map((product) => [product.externalId, product]));
  const next: WidgetLine[] = [];
  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) {
      next.push(line);
      continue;
    }
    if (!product.variations.length) {
      if (line.variationId) return { ok: false, error: "Cette combinaison n'existe pas." };
      next.push({
        ...line,
        name: line.name || product.name,
        variationId: "",
        variation: "",
        sku: product.sku || "",
        selected: undefined,
      });
      continue;
    }
    const selection = { ...(line.selected ?? {}) };
    if (line.variationId) selection.woo_variation_id = line.variationId;
    const resolved = resolveCatalogLine({
      variants: product.variations.map((variant) => ({
        externalId: variant.id,
        title: variant.label,
        sku: variant.sku,
        price: variant.price,
        available: variant.available,
        selected: variant.selected,
      })),
      axes: product.axes,
      selection,
      parentSku: product.sku,
    });
    if (!resolved.ok) return resolved;
    next.push({
      ...line,
      name: line.name || product.name,
      variationId: resolved.line.variationId,
      variation: resolved.line.label || line.variation,
      sku: resolved.line.sku || "",
      selected: line.selected,
    });
  }
  return { ok: true, lines: next };
}

/** Réécrit les lignes d'un devis site quand le catalogue connaît le produit. */
export function bindQuoteBody(
  body: unknown,
  catalog: readonly WidgetMatrixProduct[],
): { ok: true; body: unknown } | { ok: false; error: string } {
  if (!catalog.length || !body || typeof body !== "object" || Array.isArray(body)) return { ok: true, body };
  const raw = body as Record<string, unknown>;
  if (!Array.isArray(raw.items)) return { ok: true, body };
  const lines = widgetLinesFromUnknown(raw.items);
  if (!lines.length) return { ok: true, body };
  const bound = bindWidgetLines(lines, catalog);
  if (!bound.ok) return bound;
  return {
    ok: true,
    body: {
      ...raw,
      items: bound.lines.map((line) => ({
        productId: line.productId,
        variationId: line.variationId,
        sku: line.sku,
        name: line.name,
        variation: line.variation,
        qty: line.qty,
        url: line.url,
        ...(line.selected ? { selected: line.selected } : {}),
      })),
    },
  };
}
