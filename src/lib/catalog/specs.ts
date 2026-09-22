export type ProductSpec = {
  label: string;
  value: string;
  unit?: string;
  valueAlt?: string;
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
