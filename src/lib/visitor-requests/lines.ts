import type { CatalogProduct, LineCommand, VisitorLine } from "@/lib/visitor-requests/types";

const MAX_QTY = 999;
const MAX_LINES = 40;

export function linesFromQuantities(input: {
  quantities: Record<string, number>;
  options?: Record<string, Record<string, string> | undefined>;
}): { productId: string; quantity: number; options?: Record<string, string> }[] {
  return Object.entries(input.quantities)
    .map(([productId, quantity]) => ({
      productId,
      quantity: Math.floor(Number(quantity) || 0),
      options: input.options?.[productId],
    }))
    .filter((line) => line.quantity > 0 && line.productId.length > 0);
}

function sanitizeOptions(options: Record<string, string> | undefined): Record<string, string> {
  if (!options) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(options)) {
    if (typeof value !== "string") continue;
    const trimmedKey = key.trim().slice(0, 40);
    if (!trimmedKey) continue;
    out[trimmedKey] = value.trim().slice(0, 80);
    if (Object.keys(out).length >= 12) break;
  }
  return out;
}

export function applyLineOps(
  current: VisitorLine[],
  ops: LineCommand[],
  catalog: Map<string, CatalogProduct>,
  mode: "merge" | "replace",
):
  | { ok: true; lines: VisitorLine[] }
  | { ok: false; code: "unknown_product" | "invalid_quantity"; message: string } {
  const next = new Map<string, VisitorLine>();
  if (mode === "merge") {
    for (const line of current) next.set(line.productId, { ...line, options: { ...line.options } });
  }

  for (const op of ops) {
    const productId = op.productId.trim();
    if (!productId) return { ok: false, code: "unknown_product", message: "Produit introuvable dans le catalogue" };

    if (op.op === "remove" || (op.op !== "add" && op.quantity <= 0)) {
      next.delete(productId);
      continue;
    }

    if (!Number.isInteger(op.quantity) || op.quantity < 1 || op.quantity > MAX_QTY) {
      return { ok: false, code: "invalid_quantity", message: "Quantité invalide" };
    }

    const product = catalog.get(productId);
    if (!product?.active) {
      return { ok: false, code: "unknown_product", message: "Produit introuvable dans le catalogue" };
    }

    const previous = next.get(productId);
    const quantity = op.op === "add" ? (previous?.quantity ?? 0) + op.quantity : op.quantity;
    if (quantity < 1 || quantity > MAX_QTY) {
      return { ok: false, code: "invalid_quantity", message: "Quantité invalide" };
    }

    next.set(productId, {
      productId: product.id,
      name: product.name,
      quantity,
      options: op.options ? sanitizeOptions(op.options) : (previous?.options ?? {}),
      priceMin: product.priceMin,
      priceMax: product.priceMax,
    });
  }

  if (next.size > MAX_LINES) {
    return { ok: false, code: "invalid_quantity", message: "Trop de lignes dans la demande" };
  }
  return { ok: true, lines: [...next.values()] };
}
