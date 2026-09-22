import { normalizeAttributes, type ProductAttribute } from "@/lib/catalog/attributes";
import type { ProductSpec } from "@/lib/wizard/types";

/** Ligne déjà stockée dans `products.specs` (jsonb prod). */
export type StoredProductSpec = {
  label: string;
  value: string;
  unit?: string;
  valueAlt?: string;
};

/** Catalogue `products.specs` jsonb: `{ charge: { label, value, unit? } }`. */
export function parseProductSpecs(value: unknown): Record<string, StoredProductSpec> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const specs: Record<string, StoredProductSpec> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!key.trim() || !raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const row = raw as Record<string, unknown>;
    const label = typeof row.label === "string" ? row.label.trim() : "";
    const specValue = row.value == null ? "" : String(row.value).trim();
    if (!label || !specValue) continue;
    const spec: StoredProductSpec = { label, value: specValue };
    if (typeof row.unit === "string" && row.unit.trim()) spec.unit = row.unit.trim();
    if (typeof row.valueAlt === "string" && row.valueAlt.trim()) spec.valueAlt = row.valueAlt.trim();
    specs[key] = spec;
  }
  return specs;
}

/** Clés lues par SpecTable. Les choix prospect restent dans `options`. */
export const RACKING_SPEC_KEYS = ["charge", "hauteur", "profondeur", "materiau", "delai"] as const;

export type RackingSpecKey = (typeof RACKING_SPEC_KEYS)[number];

type CanonField = { key: RackingSpecKey; label: string; names: string[] };

const CANON: CanonField[] = [
  { key: "charge", label: "Charge", names: ["charge", "charge max", "charge maximale", "capacite", "capacite de charge", "load"] },
  { key: "hauteur", label: "Hauteur max", names: ["hauteur", "hauteur max", "hauteur maximale", "height"] },
  { key: "profondeur", label: "Profondeur lisse", names: ["profondeur", "profondeur lisse", "depth"] },
  { key: "materiau", label: "Matériau", names: ["materiau", "matiere", "material"] },
  { key: "delai", label: "Délai livraison", names: ["delai", "delai livraison", "delai de livraison", "lead time"] },
];

export type WooSpecSource = {
  attributes?: { name?: string; options?: string[]; variation?: boolean }[];
  dimensions?: { length?: string; width?: string; height?: string };
  weight?: string;
  meta_data?: { key?: string; value?: unknown }[];
  description?: string | null;
  short_description?: string | null;
};

export type WooSpecUnits = {
  dimension?: string;
  weight?: string;
};

export function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value: string) {
  return fold(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function canonFor(name: string) {
  const folded = fold(name);
  return CANON.find((field) => field.names.includes(folded)) ?? null;
}

function plain(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function isBlankMeasure(value: string) {
  const trimmed = value.trim();
  return !trimmed || trimmed === "0" || trimmed === "0.0" || trimmed === "0,0";
}

/** Découpe « 280 kg » ou « 240–800 ». Le texte libre reste tel quel. */
export function parseMeasure(raw: string, fallbackUnit?: string): { value: string; unit?: string; numeric: boolean } {
  const text = raw.trim().replace(/\s+/g, " ");
  const range = text.match(/^(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)(?:\s*([a-zA-Zµ°%]{1,8}))?$/);
  if (range) {
    const unit = range[3] || fallbackUnit;
    return {
      value: `${range[1].replace(",", ".")}–${range[2].replace(",", ".")}`,
      unit: unit || undefined,
      numeric: true,
    };
  }
  const single = text.match(/^(\d+(?:[.,]\d+)?)(?:\s*([a-zA-Zµ°%]{1,8}))?$/);
  if (single) {
    const unit = single[2] || fallbackUnit;
    return { value: single[1].replace(",", "."), unit: unit || undefined, numeric: true };
  }
  return { value: text, numeric: false };
}

function specFromText(key: string, label: string, raw: string, fallbackUnit?: string): ProductAttribute | null {
  const parsed = parseMeasure(raw, fallbackUnit);
  if (!parsed.value) return null;
  if (!parsed.numeric) {
    return { key, label, kind: parsed.value.length > 80 ? "note" : "text", value: parsed.value };
  }
  const ranged = parsed.value.includes("–");
  return {
    key,
    label,
    kind: ranged ? "text" : "number",
    value: parsed.value,
    unit: parsed.unit,
  };
}

function numericOptions(options: string[]) {
  const parsed = options.map((option) => parseMeasure(option)).filter((item) => item.numeric && item.value);
  if (!parsed.length || parsed.length !== options.filter(Boolean).length) return null;
  const units = new Set(parsed.map((item) => item.unit ?? ""));
  if (units.size > 1) return null;
  const numbers = parsed.flatMap((item) =>
    item.value.split("–").map((part) => Number(part.replace(",", "."))),
  );
  if (numbers.some((n) => !Number.isFinite(n))) return null;
  return { numbers, unit: parsed[0]?.unit };
}

function choiceAttribute(name: string, options: string[]): ProductAttribute {
  return {
    key: slugify(name) || "choix",
    label: name.trim(),
    kind: "choices",
    values: options.map((option) => ({ value: slugify(option) || option, label: option.trim() })),
  };
}

function pushSpec(specs: ProductAttribute[], next: ProductAttribute | null) {
  if (!next?.value?.trim()) return;
  if (specs.some((spec) => spec.key === next.key)) return;
  specs.push(next);
}

function specFromAttribute(name: string, options: string[], fallbackUnit?: string): ProductAttribute | null {
  const canon = canonFor(name);
  const key = canon?.key ?? (slugify(name) || "spec");
  const label = canon?.label ?? name.trim();
  const measures = numericOptions(options);
  if (measures && canon?.key === "hauteur") {
    return specFromText(key, label, String(Math.max(...measures.numbers)), measures.unit ?? fallbackUnit);
  }
  if (measures && (canon?.key === "charge" || canon?.key === "profondeur")) {
    const min = Math.min(...measures.numbers);
    const max = Math.max(...measures.numbers);
    const raw = min === max ? String(max) : `${min}–${max}`;
    return specFromText(key, label, raw, measures.unit ?? fallbackUnit);
  }
  if (options.length === 1) return specFromText(key, label, options[0], fallbackUnit);
  return specFromText(key, label, options.join(", "));
}

/**
 * Attributs Woo (variations + fiches), dimensions, meta publiques et libellés
 * explicites dans la description. Les variations restent des choix ; un résumé
 * chiffré est ajouté pour Charge, Hauteur max et Profondeur lisse.
 */
export function mapWooCatalogAttributes(source: WooSpecSource, units: WooSpecUnits = {}): ProductAttribute[] {
  const choices: ProductAttribute[] = [];
  const specs: ProductAttribute[] = [];

  for (const attr of source.attributes ?? []) {
    const name = attr.name?.trim();
    const options = (attr.options ?? []).map((option) => String(option).trim()).filter(Boolean);
    if (!name || !options.length) continue;
    if (attr.variation) {
      choices.push(choiceAttribute(name, options));
      if (canonFor(name)) pushSpec(specs, specFromAttribute(name, options, units.dimension));
      continue;
    }
    pushSpec(specs, specFromAttribute(name, options, units.dimension));
  }

  const dimensions: { key: string; label: string; raw?: string }[] = [
    { key: "longueur", label: "Longueur", raw: source.dimensions?.length },
    { key: "largeur", label: "Largeur", raw: source.dimensions?.width },
    { key: "hauteur", label: "Hauteur max", raw: source.dimensions?.height },
  ];
  for (const dimension of dimensions) {
    if (!dimension.raw || isBlankMeasure(dimension.raw)) continue;
    const canon = canonFor(dimension.label);
    pushSpec(
      specs,
      specFromText(canon?.key ?? dimension.key, canon?.label ?? dimension.label, dimension.raw, units.dimension ?? "cm"),
    );
  }
  if (source.weight && !isBlankMeasure(source.weight)) {
    pushSpec(specs, specFromText("poids", "Poids", source.weight, units.weight ?? "kg"));
  }

  for (const meta of source.meta_data ?? []) {
    const keyName = typeof meta.key === "string" ? meta.key.trim() : "";
    if (!keyName || keyName.startsWith("_")) continue;
    const folded = fold(keyName);
    if (/yoast|rank math|wpseo/.test(folded)) continue;
    const canon = canonFor(keyName);
    if (!canon) continue;
    const raw = metaValue(meta.value);
    if (!raw) continue;
    pushSpec(specs, specFromText(canon.key, canon.label, raw));
  }

  const description = plain([source.description, source.short_description].filter(Boolean).join(" \n "));
  if (description) fillFromDescription(specs, description);

  return [...choices, ...specs];
}

function metaValue(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed && trimmed.length <= 80 ? trimmed : null;
  }
  return null;
}

function fillFromDescription(specs: ProductAttribute[], text: string) {
  const charge = text.match(/jusqu['’]?\s*à\s+(\d+(?:[.,]\d+)?)\s*kg(?:\s*(?:\/|par)\s*niveau(?:\s+de\s+tablette)?)?/i);
  if (charge) pushSpec(specs, specFromText("charge", "Charge", `${charge[1]} kg`));

  const labeled: { key: RackingSpecKey; label: string; pattern: RegExp }[] = [
    { key: "charge", label: "Charge", pattern: /(?:charge|capacit[eé](?:\s+de\s+charge)?)\s*[:：]\s*([^;\n|]{1,40})/i },
    { key: "hauteur", label: "Hauteur max", pattern: /hauteur(?:\s+max(?:imale)?)?\s*[:：]\s*([^;\n|]{1,40})/i },
    { key: "profondeur", label: "Profondeur lisse", pattern: /profondeur(?:\s+lisse)?\s*[:：]\s*([^;\n|]{1,40})/i },
    { key: "materiau", label: "Matériau", pattern: /mat[eé]riau\s*[:：]\s*([^;\n|]{1,60})/i },
    { key: "delai", label: "Délai livraison", pattern: /d[eé]lai(?:\s+de\s+livraison|\s+livraison)?\s*[:：]\s*([^;\n|]{1,60})/i },
  ];
  for (const field of labeled) {
    const match = text.match(field.pattern);
    if (!match?.[1]) continue;
    pushSpec(specs, specFromText(field.key, field.label, match[1].trim()));
  }
}

export function toProductSpecs(raw: unknown): ProductSpec[] {
  return normalizeAttributes(raw).flatMap((attribute) => {
    if (attribute.kind === "choices") return [];
    const value = attribute.value?.trim();
    if (!value) return [];
    return [
      {
        key: attribute.key,
        label: attribute.label,
        value,
        ...(attribute.unit ? { unit: attribute.unit } : {}),
      },
    ];
  });
}

export function missingRackingSpecs(raw: unknown): RackingSpecKey[] {
  const present = new Set(toProductSpecs(raw).map((spec) => spec.key));
  return RACKING_SPEC_KEYS.filter((key) => !present.has(key));
}

/**
 * Payload public : specs issues de `products.options` (Woo / seed), puis les
 * clés encore présentes uniquement dans la colonne `products.specs`.
 */
export function publicProductSpecs(options: unknown, column: unknown): ProductSpec[] {
  const fromOptions = toProductSpecs(options);
  const seen = new Set(fromOptions.map((spec) => spec.key));
  const fromColumn: ProductSpec[] = [];
  for (const [key, spec] of Object.entries(parseProductSpecs(column))) {
    if (seen.has(key)) continue;
    fromColumn.push({
      key,
      label: spec.label,
      value: spec.value,
      ...(spec.unit ? { unit: spec.unit } : {}),
      ...(spec.valueAlt ? { valueAlt: spec.valueAlt } : {}),
    });
  }
  return [...fromOptions, ...fromColumn];
}
