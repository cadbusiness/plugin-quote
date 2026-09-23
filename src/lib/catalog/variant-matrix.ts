import { normalizeAttributes, type ProductAttribute } from "@/lib/catalog/attributes";
import type { ProductOption } from "@/lib/wizard/types";

/** Page size is Woo's max. Above that the variations route truncates. */
export const WOO_VARIATION_PAGE_SIZE = 100;
export const WOO_VARIATION_MAX_PAGES = 50;

export type MatrixVariant = {
  externalId: string;
  title: string;
  sku: string | null;
  price: number | null;
  compareAtPrice?: number | null;
  available: boolean;
  imageSrc?: string | null;
  /** Clé d'axe → valeur (slug d'option). */
  selected: Record<string, string>;
  stockStatus?: "instock" | "outofstock" | "onbackorder" | null;
  stockQuantity?: number | null;
};

export type VariantAxis = {
  key: string;
  name: string;
  slug: string;
  options: { value: string; label: string }[];
};

export type WooAxisSource = {
  name?: string;
  slug?: string;
  variation?: boolean;
  options?: string[];
};

export type WooVariationAttribute = {
  name?: string;
  slug?: string;
  option?: string;
};

export type WooVariationSource = {
  id: number;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_status?: string;
  stock_quantity?: number | null;
  image?: { src?: string };
  attributes?: WooVariationAttribute[];
};

export function axisSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** `pa_couleur`, `attribute_pa_couleur` et « Couleur » partagent la même clé. */
export function wooAxisKey(name?: string, slug?: string) {
  const raw = (slug || name || "").trim().replace(/^attribute_/i, "");
  const stripped = raw.replace(/^pa_/i, "");
  return axisSlug(stripped || raw) || "choix";
}

export function wooOptionValue(option: string) {
  const text = option.trim();
  return axisSlug(text) || text;
}

function sameKey(a: string, b: string) {
  return a === b || wooAxisKey(a) === wooAxisKey(b);
}

function sameValue(a: string, b: string) {
  return a === b || wooOptionValue(a) === wooOptionValue(b);
}

export function shouldLoadWooVariations(product: { type?: string; variations?: unknown[] }) {
  if (product.type === "simple") return false;
  if (product.type === "variable") return true;
  if (product.type && product.type !== "variable") return false;
  return (product.variations?.length ?? 0) > 0;
}

export async function collectPaged<T>(
  load: (page: number, perPage: number) => Promise<{ items: T[]; totalPages: number | null }>,
  perPage = WOO_VARIATION_PAGE_SIZE,
  maxPages = WOO_VARIATION_MAX_PAGES,
): Promise<{ items: T[]; complete: boolean }> {
  const items: T[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const batch = await load(page, perPage);
    items.push(...batch.items);
    const reported = batch.totalPages;
    if (reported != null && page >= reported) return { items, complete: true };
    if (batch.items.length < perPage) return { items, complete: true };
  }
  return { items, complete: false };
}

function stockStatusOf(value: string | undefined): MatrixVariant["stockStatus"] {
  if (value === "instock" || value === "outofstock" || value === "onbackorder") return value;
  return null;
}

function findAxis(axes: WooAxisSource[], attr: WooVariationAttribute) {
  return axes.find((axis) => {
    const keys = [axis.slug, axis.name].filter((key): key is string => Boolean(key?.trim()));
    const wanted = [attr.slug, attr.name].filter((key): key is string => Boolean(key?.trim()));
    return wanted.some((key) => keys.some((candidate) => sameKey(candidate, key)));
  });
}

/**
 * Matrice Woo : axes `variation: true` et chaque variation (selected, sku, prix, stock).
 * Une combinaison absente n'est pas fabriquée.
 */
export function mapWooVariantMatrix(attributes: WooAxisSource[], variations: WooVariationSource[]): MatrixVariant[] {
  const axes = attributes.filter((attr) => attr.variation && (attr.name?.trim() || attr.slug?.trim()));
  return variations.flatMap((variation) => {
    if (!Number.isFinite(variation.id)) return [];
    const selected: Record<string, string> = {};
    const labels: string[] = [];
    for (const attr of variation.attributes ?? []) {
      const option = attr.option?.trim() ?? "";
      if (!option) continue;
      const axis = findAxis(axes, attr);
      const key = axis ? wooAxisKey(axis.name, axis.slug) : wooAxisKey(attr.name, attr.slug);
      selected[key] = wooOptionValue(option);
      labels.push(option);
    }
    const price = parseAmount(variation.price ?? variation.regular_price);
    const regular = parseAmount(variation.regular_price);
    const quantity = variation.stock_quantity;
    return [
      {
        externalId: String(variation.id),
        title: labels.join(" / ") || `Variante ${variation.id}`,
        sku: variation.sku?.trim() || null,
        price,
        compareAtPrice: variation.sale_price && regular != null ? regular : null,
        available: variation.stock_status !== "outofstock",
        imageSrc: variation.image?.src ?? null,
        selected,
        stockStatus: stockStatusOf(variation.stock_status),
        stockQuantity: typeof quantity === "number" && Number.isFinite(quantity) ? quantity : null,
      },
    ];
  });
}

function parseAmount(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function parseStoredVariants(value: unknown): MatrixVariant[] {
  if (!Array.isArray(value)) return [];
  const variants: MatrixVariant[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const record = row as Record<string, unknown>;
    const externalId = typeof record.externalId === "string" ? record.externalId.trim() : record.externalId != null ? String(record.externalId).trim() : "";
    if (!externalId || externalId === "0") continue;
    const selected: Record<string, string> = {};
    if (record.selected && typeof record.selected === "object" && !Array.isArray(record.selected)) {
      for (const [key, option] of Object.entries(record.selected as Record<string, unknown>)) {
        if (typeof option !== "string" && typeof option !== "number") continue;
        const text = String(option).trim();
        if (!key.trim() || !text) continue;
        selected[key.trim()] = text;
      }
    }
    const price = parseAmount(record.price);
    const sku = typeof record.sku === "string" && record.sku.trim() ? record.sku.trim() : null;
    const title = typeof record.title === "string" && record.title.trim() ? record.title.trim() : `Variante ${externalId}`;
    const stock = record.stockStatus;
    variants.push({
      externalId,
      title,
      sku,
      price,
      available: record.available !== false,
      imageSrc: typeof record.imageSrc === "string" ? record.imageSrc : null,
      selected,
      stockStatus: stock === "instock" || stock === "outofstock" || stock === "onbackorder" ? stock : null,
      stockQuantity: parseAmount(record.stockQuantity),
    });
  }
  return variants;
}

/**
 * Sync complète : la liste Woo remplace les variations.
 * Sync incomplète (page coupée) : on met à jour ce qui a été lu et on garde le reste.
 * Liste vide et incomplète : on ne vide pas la matrice déjà en base.
 */
export function storedVariantsForSync(incoming: MatrixVariant[], existing: unknown, complete: boolean): MatrixVariant[] {
  const prior = parseStoredVariants(existing);
  if (!complete && incoming.length === 0) return prior;
  if (!complete) {
    const seen = new Set(incoming.map((variant) => variant.externalId));
    return [...incoming, ...prior.filter((variant) => !seen.has(variant.externalId))];
  }
  return incoming;
}

/** Les attributs Woo remplacent la même clé. Un champ saisi au catalogue et absent du flux reste. */
export function storedOptionsForSync(incoming: unknown, existing?: unknown): ProductAttribute[] {
  const next = normalizeAttributes(incoming);
  const prior = normalizeAttributes(existing);
  if (!next.length) return prior;
  const kept = prior.filter(
    (attribute) => !next.some((item) => sameKey(item.key, attribute.key) || sameKey(item.label, attribute.label)),
  );
  return [...next, ...kept];
}

export function catalogAxes(input: {
  options?: ProductOption[];
  attributes?: ProductAttribute[];
  variants?: MatrixVariant[];
}): VariantAxis[] {
  const variants = input.variants ?? [];
  if (!variants.length) return [];
  const selectedKeys = new Set<string>();
  for (const variant of variants) {
    for (const key of Object.keys(variant.selected)) selectedKeys.add(key);
  }
  const fromOptions = (input.options ?? []).filter((option) =>
    [...selectedKeys].some((key) => sameKey(key, option.key) || sameKey(key, option.label)),
  );
  if (fromOptions.length) {
    return fromOptions.map((option) => ({
      key: option.key,
      name: option.label,
      slug: option.key,
      options: option.values,
    }));
  }
  const choices = (input.attributes ?? []).filter((attribute) => attribute.kind === "choices" && attribute.values?.length);
  const matched = choices.filter((attribute) =>
    [...selectedKeys].some((key) => sameKey(key, attribute.key) || sameKey(key, attribute.label)),
  );
  if (matched.length) {
    return matched.map((attribute) => ({
      key: attribute.key,
      name: attribute.label,
      slug: attribute.key,
      options: attribute.values ?? [],
    }));
  }
  const built = new Map<string, VariantAxis>();
  for (const variant of variants) {
    for (const [key, value] of Object.entries(variant.selected)) {
      const axisKey = wooAxisKey(key);
      const axis = built.get(axisKey) ?? { key: axisKey, name: key, slug: axisKey, options: [] };
      const optionValue = wooOptionValue(value);
      if (!axis.options.some((option) => option.value === optionValue)) {
        axis.options.push({ value: optionValue, label: value });
      }
      built.set(axisKey, axis);
    }
  }
  return [...built.values()];
}

function variantOption(variant: MatrixVariant, axis: VariantAxis) {
  if (variant.selected[axis.key]) return variant.selected[axis.key];
  const found = Object.entries(variant.selected).find(([key]) => sameKey(key, axis.key) || sameKey(key, axis.name));
  return found?.[1];
}

/** Combinaison exacte uniquement. Aucune variation proche, aucun SKU inventé. */
export function resolveCatalogVariant(
  variants: MatrixVariant[],
  axes: VariantAxis[],
  selection: Record<string, string>,
): MatrixVariant | null {
  if (!variants.length || !axes.length) return null;
  for (const axis of axes) {
    if (!selection[axis.key]?.trim()) return null;
  }
  const hits = variants.filter((variant) =>
    axes.every((axis) => {
      const raw = variantOption(variant, axis);
      if (!raw) return false;
      const wanted = selection[axis.key];
      return sameValue(raw, wanted);
    }),
  );
  return hits[0] ?? null;
}

export function variantById(variants: MatrixVariant[], variationId: string): MatrixVariant | null {
  const id = variationId.trim();
  if (!id) return null;
  return variants.find((variant) => variant.externalId === id) ?? null;
}

export type ResolvedCatalogLine = {
  options: Record<string, string>;
  variationId: string;
  sku: string | null;
  price: number | null;
  label: string;
};

/**
 * Produit simple : pas de variationId, pas de SKU fabriqué.
 * Produit variable : variation réelle ou rien.
 */
export function resolveCatalogLine(input: {
  variants?: MatrixVariant[];
  axes: VariantAxis[];
  selection: Record<string, string>;
  parentSku?: string | null;
}): { ok: true; line: ResolvedCatalogLine } | { ok: false; error: string } {
  const variants = input.variants ?? [];
  const selection = input.selection ?? {};
  if (!variants.length || !input.axes.length) {
    const options: Record<string, string> = {};
    for (const [key, value] of Object.entries(selection)) {
      if (key === "sku" || key === "woo_variation_id" || key === "woo_product_id") continue;
      if (value) options[key] = value;
    }
    return {
      ok: true,
      line: {
        options,
        variationId: "",
        sku: input.parentSku?.trim() || null,
        price: null,
        label: "",
      },
    };
  }
  const picked = resolveCatalogVariant(variants, input.axes, selection);
  const byId = selection.woo_variation_id ? variantById(variants, selection.woo_variation_id) : null;
  const variant = picked ?? (selectionHasAxes(input.axes, selection) ? null : byId);
  if (picked && byId && picked.externalId !== byId.externalId) {
    return { ok: false, error: "Cette combinaison n'existe pas." };
  }
  if (!variant) return { ok: false, error: "Cette combinaison n'existe pas." };
  const options: Record<string, string> = {};
  for (const axis of input.axes) {
    const raw = variantOption(variant, axis) ?? selection[axis.key];
    const match = axis.options.find((option) => sameValue(option.value, raw) || sameValue(option.label, raw));
    options[axis.key] = match?.value ?? wooOptionValue(raw);
  }
  options.woo_variation_id = variant.externalId;
  if (variant.sku) options.sku = variant.sku;
  return {
    ok: true,
    line: {
      options,
      variationId: variant.externalId,
      sku: variant.sku,
      price: variant.price,
      label: variant.title,
    },
  };
}

function selectionHasAxes(axes: VariantAxis[], selection: Record<string, string>) {
  return axes.some((axis) => Boolean(selection[axis.key]?.trim()));
}

export type WidgetMatrixVariation = {
  id: string;
  sku: string | null;
  price: number | null;
  available: boolean;
  label: string;
  selected: Record<string, string>;
};

export type WidgetMatrixProduct = {
  externalId: string;
  name: string;
  sku: string | null;
  axes: VariantAxis[];
  variations: WidgetMatrixVariation[];
};

/** Ligne devis : SKU et variationId seulement s'ils viennent d'une variation réelle. */
export function quoteSelectionForProduct(
  product: {
    name: string;
    sku?: string | null;
    priceMin: number | null;
    priceMax: number | null;
    options: ProductOption[];
    variants?: MatrixVariant[];
  },
  selection: Record<string, string>,
) {
  const variants = product.variants ?? [];
  const axes = catalogAxes({ options: product.options, variants });
  if (!variants.length || !axes.length) {
    const options: Record<string, string> = {};
    for (const [key, value] of Object.entries(selection)) {
      if (!value || key === "sku" || key === "woo_variation_id") continue;
      options[key] = value;
    }
    return { name: product.name, options, priceMin: product.priceMin, priceMax: product.priceMax };
  }
  const resolved = resolveCatalogLine({ variants, axes, selection, parentSku: product.sku });
  if (!resolved.ok) {
    const options: Record<string, string> = {};
    for (const [key, value] of Object.entries(selection)) {
      if (!value || key === "sku" || key === "woo_variation_id") continue;
      options[key] = value;
    }
    return { name: product.name, options, priceMin: product.priceMin, priceMax: product.priceMax };
  }
  const options = { ...resolved.line.options };
  for (const [key, value] of Object.entries(selection)) {
    if (!value || key === "sku" || key === "woo_variation_id" || options[key]) continue;
    if (axes.some((axis) => axis.key === key)) continue;
    options[key] = value;
  }
  return {
    name: resolved.line.label ? `${product.name} (${resolved.line.label})` : product.name,
    options,
    priceMin: resolved.line.price ?? product.priceMin,
    priceMax: resolved.line.price ?? product.priceMax,
  };
}

export function toWidgetMatrixProduct(input: {
  externalId: string;
  name: string;
  sku?: string | null;
  options: unknown;
  variants: unknown;
}): WidgetMatrixProduct | null {
  const externalId = input.externalId.trim();
  const name = input.name.trim();
  if (!externalId || !name) return null;
  const attributes = normalizeAttributes(input.options);
  const options = attributes
    .filter((attribute) => attribute.kind === "choices" && attribute.values?.length)
    .map((attribute) => ({ key: attribute.key, label: attribute.label, values: attribute.values ?? [] }));
  const variants = parseStoredVariants(input.variants);
  const axes = catalogAxes({ options, attributes, variants });
  return {
    externalId,
    name,
    sku: input.sku?.trim() || null,
    axes,
    variations: variants.map((variant) => {
      const selected: Record<string, string> = {};
      for (const axis of axes) {
        const raw = variantOption(variant, axis);
        if (!raw) continue;
        const match = axis.options.find((option) => sameValue(option.value, raw) || sameValue(option.label, raw));
        selected[axis.key] = match?.value ?? wooOptionValue(raw);
      }
      return {
        id: variant.externalId,
        sku: variant.sku,
        price: variant.price,
        available: variant.available,
        label: variant.title,
        selected,
      };
    }),
  };
}
