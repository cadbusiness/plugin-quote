export type ProductSpec = {
  label: string;
  value: string;
  unit?: string;
  valueAlt?: string;
};

/** Canonical fiche keys. `products.options` stays the choice list (couleur, niveaux). */
export const SPEC_KEYS = ["charge", "hauteur", "profondeur", "materiau", "delai"] as const;

/**
 * WooCommerce global attributes for a later sync. One value, not a variation.
 * Slugs are `pa_*`. Description HTML is not a spec source.
 */
export const WOO_SPEC_ATTRIBUTES: Record<(typeof SPEC_KEYS)[number], string> = {
  charge: "pa_charge",
  hauteur: "pa_hauteur",
  profondeur: "pa_profondeur",
  materiau: "pa_materiau",
  delai: "pa_delai",
};

export type SpecSnapshot = {
  productId: string;
  name: string;
  specs: Record<string, ProductSpec>;
};

export type SpecRow = {
  key: string;
  label: string;
  display: string;
};

/** Catalogue `products.specs` jsonb: `{ charge: { label, value, unit? } }`. */
export function parseProductSpecs(value: unknown): Record<string, ProductSpec> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const specs: Record<string, ProductSpec> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!key.trim() || !raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const row = raw as Record<string, unknown>;
    const label = typeof row.label === "string" ? row.label.trim() : "";
    const specValue = row.value == null ? "" : String(row.value).trim();
    if (!label || !specValue) continue;
    const spec: ProductSpec = { label, value: specValue };
    if (typeof row.unit === "string" && row.unit.trim()) spec.unit = row.unit.trim();
    if (typeof row.valueAlt === "string" && row.valueAlt.trim()) spec.valueAlt = row.valueAlt.trim();
    specs[key] = spec;
  }
  return specs;
}

export function formatSpecDisplay(spec: ProductSpec): string {
  const unit = spec.unit?.trim();
  const alt = spec.valueAlt?.trim();
  const core = unit ? `${spec.value} ${unit}` : spec.value;
  return alt ? `${core} (${alt})` : core;
}

export function orderedSpecRows(specs: Record<string, ProductSpec>): SpecRow[] {
  const preferred = new Set<string>(SPEC_KEYS);
  const keys = [
    ...SPEC_KEYS.filter((key) => specs[key]),
    ...Object.keys(specs).filter((key) => !preferred.has(key)),
  ];
  return keys.map((key) => ({
    key,
    label: specs[key].label,
    display: formatSpecDisplay(specs[key]),
  }));
}

export function specOptionStrings(specs: Record<string, ProductSpec>): Record<string, string> {
  return Object.fromEntries(orderedSpecRows(specs).map((row) => [row.key, row.display]));
}

export function readSpecSnapshots(value: unknown): SpecSnapshot[] {
  if (!Array.isArray(value)) return [];
  const snapshots: SpecSnapshot[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const productId = typeof row.productId === "string" ? row.productId.trim() : "";
    const name = typeof row.name === "string" ? row.name.trim() : "";
    const specs = parseProductSpecs(row.specs);
    if (!productId || !name || !Object.keys(specs).length) continue;
    snapshots.push({ productId, name, specs });
  }
  return snapshots;
}

/** Readable fiche for the dossier and the PDF. The stored payload stays structured. */
export function formatQuoteSpecs(value: unknown): string | null {
  const snapshots = readSpecSnapshots(value);
  if (!snapshots.length) return null;
  return snapshots
    .map((snapshot) => {
      const rows = orderedSpecRows(snapshot.specs)
        .map((row) => `${row.label} ${row.display}`)
        .join(", ");
      return `${snapshot.name} — ${rows}`;
    })
    .join(" · ");
}
