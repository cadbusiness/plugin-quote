/** Liste de devis boutique : localStorage, sans session funnel. */

export type ShopQuoteLine = {
  id: string;
  qty: number;
  name?: string;
  sku?: string | null;
};

export function shopQuoteDraftKey(orgSlug: string, shopSlug: string) {
  return `qb-shop-quote:${orgSlug}:${shopSlug}`;
}

export function isShopQuoteFormPhase(value: unknown) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();
  return raw === "1" || raw === "true" || raw === "envoyer";
}

export function parseShopQuoteDraft(raw: unknown): ShopQuoteLine[] {
  let parsed = raw;
  if (typeof raw === "string") {
    if (!raw.trim()) return [];
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  const lines: ShopQuoteLine[] = [];
  const seen = new Set<string>();
  for (const row of parsed) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const id = String(item.id ?? "").trim();
    if (!id || seen.has(id)) continue;
    const qty = Math.max(1, Number(item.qty ?? item.quantity ?? 1) || 1);
    const next: ShopQuoteLine = { id, qty };
    if (typeof item.name === "string" && item.name.trim()) next.name = item.name.trim();
    if (typeof item.sku === "string" && item.sku.trim()) next.sku = item.sku.trim();
    lines.push(next);
    seen.add(id);
  }
  return lines;
}

export function shopQuoteItemCount(lines: ShopQuoteLine[]) {
  return lines.length;
}

export function shopQuoteQtyTotal(lines: ShopQuoteLine[]) {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function upsertShopQuoteLine(
  lines: ShopQuoteLine[],
  input: { id: string; qty?: number; name?: string; sku?: string | null },
): ShopQuoteLine[] {
  const id = input.id.trim();
  if (!id) return lines;
  const qty = Math.max(1, Number(input.qty ?? 1) || 1);
  const existing = lines.find((line) => line.id === id);
  const next: ShopQuoteLine = {
    id,
    qty,
    name: input.name?.trim() || existing?.name,
    sku: input.sku?.trim() || existing?.sku,
  };
  if (existing) return lines.map((line) => (line.id === id ? next : line));
  return [...lines, next];
}

export function setShopQuoteLineQty(lines: ShopQuoteLine[], id: string, qty: number): ShopQuoteLine[] {
  const nextQty = Math.max(1, Number(qty) || 1);
  return lines.map((line) => (line.id === id ? { ...line, qty: nextQty } : line));
}

export function removeShopQuoteLine(lines: ShopQuoteLine[], id: string): ShopQuoteLine[] {
  return lines.filter((line) => line.id !== id);
}

export function readShopQuoteDraft(orgSlug: string, shopSlug: string): ShopQuoteLine[] {
  if (typeof window === "undefined") return [];
  try {
    return parseShopQuoteDraft(window.localStorage.getItem(shopQuoteDraftKey(orgSlug, shopSlug)));
  } catch {
    return [];
  }
}

export function writeShopQuoteDraft(orgSlug: string, shopSlug: string, lines: ShopQuoteLine[]) {
  if (typeof window === "undefined") return;
  const key = shopQuoteDraftKey(orgSlug, shopSlug);
  try {
    if (!lines.length) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(lines));
  } catch {
    /* ignore quota */
  }
}
