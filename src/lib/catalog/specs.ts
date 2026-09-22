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

export type WooSpecAttribute = {
  id?: number;
  name?: string;
  slug?: string;
  visible?: boolean;
  variation?: boolean;
  options?: string[];
};

export type WooSpecSource = {
  attributes?: WooSpecAttribute[];
  dimensions?: { length?: string; width?: string; height?: string };
  weight?: string;
  meta_data?: { id?: number; key?: string; value?: unknown }[];
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

/**
 * Aller-retour colonne `products.specs` ↔ Woo.
 * Attributs `pa_*`, meta `_qb_specs`, puis meta unitaire. Jamais la description.
 * `products.options` (mapWooCatalogAttributes) reste un canal séparé.
 */
export const PRODUCT_SPEC_KEYS = RACKING_SPEC_KEYS;

export type ProductSpecKey = RackingSpecKey;

export type ProductSpecEntry = {
  label: string;
  value: string;
  unit: string;
  valueAlt?: string;
};

export type ProductSpecs = Partial<Record<ProductSpecKey, ProductSpecEntry>>;

export const PRODUCT_SPEC_LABELS: Record<ProductSpecKey, string> = {
  charge: "Charge",
  hauteur: "Hauteur",
  profondeur: "Profondeur",
  materiau: "Matériau",
  delai: "Délai",
};

const SPEC_ALIASES: Record<string, ProductSpecKey> = {
  charge: "charge",
  capacite: "charge",
  capacity: "charge",
  load: "charge",
  hauteur: "hauteur",
  height: "hauteur",
  profondeur: "profondeur",
  depth: "profondeur",
  materiau: "materiau",
  material: "materiau",
  matiere: "materiau",
  delai: "delai",
  delay: "delai",
  lead_time: "delai",
  delai_livraison: "delai",
};

const UNIT_TOKENS = new Set([
  "kg",
  "kg/niveau",
  "kg/niveaux",
  "kg/m2",
  "kg/m²",
  "kg/ml",
  "kg/m",
  "t",
  "g",
  "mm",
  "cm",
  "m",
  "ml",
  "jour",
  "jours",
  "semaine",
  "semaines",
  "mois",
  "j",
  "sem",
  "h",
  "heure",
  "heures",
]);

export type WooSpecWrite = {
  /** Présent seulement si la liste d'attributs courante est connue (pas d'écrasement). */
  attributes?: WooSpecAttribute[];
  meta_data: Array<{ id?: number; key: string; value: unknown }>;
};

export function canonicalSpecKey(raw: string): ProductSpecKey | null {
  const token = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^attribute_/, "")
    .replace(/^pa_/, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return SPEC_ALIASES[token] ?? null;
}

function isUnitToken(token: string) {
  const lower = token.toLowerCase();
  const folded = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/²/g, "2");
  if (UNIT_TOKENS.has(lower) || UNIT_TOKENS.has(folded)) return true;
  return /^kg\/[a-z0-9]+$/.test(folded);
}

/** Sépare « 1000 kg/niveau » en valeur + unité. Le matériau reste une valeur entière. */
export function splitSpecText(key: ProductSpecKey, raw: string): { value: string; unit: string } {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return { value: "", unit: "" };
  if (key === "materiau") return { value: text, unit: "" };

  const spaced = text.match(/^(.+?)\s+(\S+)$/);
  if (spaced && /\d/.test(spaced[1]) && isUnitToken(spaced[2])) {
    return { value: spaced[1].trim(), unit: spaced[2].trim() };
  }
  const glued = text.match(/^(\d+(?:[.,]\d+)?)([a-zA-Zµ°/].+)$/);
  if (glued && isUnitToken(glued[2])) {
    return { value: glued[1], unit: glued[2] };
  }
  return { value: text, unit: "" };
}

function labelOf(key: ProductSpecKey) {
  return PRODUCT_SPEC_LABELS[key];
}

function asEntry(key: ProductSpecKey, raw: unknown): ProductSpecEntry | null {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return { label: labelOf(key), value: String(raw), unit: "" };
  }
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return null;
    if (text.startsWith("{") || text.startsWith("[")) {
      try {
        const parsed = asEntry(key, JSON.parse(text) as unknown);
        if (parsed) return parsed;
      } catch {
        // texte libre
      }
    }
    const split = splitSpecText(key, text);
    if (!split.value) return null;
    return { label: labelOf(key), value: split.value, unit: split.unit };
  }
  if (Array.isArray(raw)) {
    const parts = raw.map((item) => (item == null ? "" : String(item).trim())).filter(Boolean);
    if (!parts.length) return null;
    return asEntry(key, parts.join(" / "));
  }
  if (typeof raw === "object") {
    const row = raw as Record<string, unknown>;
    const labelRaw = row.label ?? row.libelle;
    let value = row.value ?? row.valeur;
    let unit = row.unit ?? row.unite;
    if ((value == null || String(value).trim() === "") && typeof row.text === "string") {
      const split = splitSpecText(key, row.text);
      value = split.value;
      if (unit == null || String(unit).trim() === "") unit = split.unit;
    }
    let valueText = value == null ? "" : String(value).trim();
    let unitText = unit == null ? "" : String(unit).trim();
    const unitProvided = Object.prototype.hasOwnProperty.call(row, "unit") || Object.prototype.hasOwnProperty.call(row, "unite");
    if (valueText && !unitText && !unitProvided) {
      const split = splitSpecText(key, valueText);
      if (split.unit) {
        valueText = split.value;
        unitText = split.unit;
      }
    }
    if (!valueText) return null;
    const label = typeof labelRaw === "string" && labelRaw.trim() ? labelRaw.trim() : labelOf(key);
    const entry: ProductSpecEntry = { label, value: valueText, unit: unitText };
    if (typeof row.valueAlt === "string" && row.valueAlt.trim()) entry.valueAlt = row.valueAlt.trim();
    return entry;
  }
  return null;
}

export function orderProductSpecs(specs: ProductSpecs): ProductSpecs {
  const ordered: ProductSpecs = {};
  for (const key of PRODUCT_SPEC_KEYS) {
    const entry = specs[key];
    if (entry?.value) ordered[key] = entry;
  }
  return ordered;
}

/** Normalise le jsonb canonique (5 clés). Une chaîne JSON invalide donne {}. */
export function parseColumnSpecs(raw: unknown): ProductSpecs {
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return {};
    try {
      return parseColumnSpecs(JSON.parse(text) as unknown);
    } catch {
      return {};
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: ProductSpecs = {};
  for (const [rawKey, rawValue] of Object.entries(raw as Record<string, unknown>)) {
    const key = canonicalSpecKey(rawKey);
    if (!key) continue;
    const entry = asEntry(key, rawValue);
    if (entry) out[key] = entry;
  }
  return orderProductSpecs(out);
}

/**
 * Woo gagne clé par clé seulement si le texte affiché change.
 * Un payload vide, ou le même texte replié dans `value`, ne remplace pas l’entrée déjà en base.
 */
export function mergeProductSpecs(incoming: unknown, existing?: unknown): ProductSpecs {
  const woo = parseColumnSpecs(incoming);
  const prior = parseColumnSpecs(existing);
  if (!Object.keys(woo).length) return prior;
  const merged: ProductSpecs = { ...prior };
  for (const key of PRODUCT_SPEC_KEYS) {
    const next = woo[key];
    if (!next) continue;
    const prev = prior[key];
    merged[key] = prev && formatSpecDisplay(prev) === formatSpecDisplay(next) ? prev : next;
  }
  return orderProductSpecs(merged);
}

function attributeLabel(key: ProductSpecKey, name?: string) {
  const trimmed = name?.trim() ?? "";
  if (!trimmed) return labelOf(key);
  if (canonicalSpecKey(trimmed) === key && !/\s/.test(trimmed)) return labelOf(key);
  return trimmed;
}

function attributeRaw(attr: WooSpecAttribute): string | null {
  const options = (attr.options ?? []).map((option) => option.trim()).filter(Boolean);
  if (!options.length) return null;
  if (attr.variation && options.length > 1) return null;
  return options.join(" / ");
}

/**
 * Attribut si son texte diffère de `_qb_specs`, sinon l’objet structuré.
 * Puis meta unitaire. La description n’est pas lue.
 */
export function mapWooProductSpecs(source: WooSpecSource): ProductSpecs {
  const loose: ProductSpecs = {};
  let structured: ProductSpecs = {};
  for (const meta of source.meta_data ?? []) {
    const metaKey = meta.key?.trim();
    if (!metaKey) continue;
    if (metaKey === "_qb_specs" || metaKey === "qb_specs") {
      structured = parseColumnSpecs(meta.value);
      continue;
    }
    const key = canonicalSpecKey(metaKey);
    if (!key) continue;
    const entry = asEntry(key, meta.value);
    if (entry) loose[key] = entry;
  }

  const merged = orderProductSpecs({ ...loose, ...structured });
  for (const attr of source.attributes ?? []) {
    const key = canonicalSpecKey(attr.slug || attr.name || "");
    if (!key) continue;
    const raw = attributeRaw(attr);
    if (!raw) continue;
    const exact = structured[key];
    if (exact && formatSpecDisplay(exact) === raw) {
      merged[key] = exact;
      continue;
    }
    const entry = asEntry(key, raw);
    if (!entry) continue;
    entry.label = attributeLabel(key, attr.name);
    merged[key] = entry;
  }

  return orderProductSpecs(merged);
}

export function formatSpecDisplay(entry: ProductSpecEntry) {
  return [entry.value.trim(), entry.unit.trim()].filter(Boolean).join(" ");
}

/** Payload PUT Woo : meta `_qb_specs` + clés canoniques, attributs fusionnés si la liste courante est connue. */
export function wooSpecsWrite(specs: ProductSpecs, current?: WooSpecSource): WooSpecWrite {
  const ordered = orderProductSpecs(specs);
  const meta_data: WooSpecWrite["meta_data"] = [];
  if (!Object.keys(ordered).length) return { meta_data };

  const upsert = (key: string, value: unknown) => {
    const found = (current?.meta_data ?? []).find((meta) => meta.key === key);
    meta_data.push(found?.id != null ? { id: found.id, key, value } : { key, value });
  };
  upsert("_qb_specs", ordered);
  for (const key of PRODUCT_SPEC_KEYS) {
    const entry = ordered[key];
    if (!entry) continue;
    upsert(key, formatSpecDisplay(entry));
  }

  if (!Array.isArray(current?.attributes)) return { meta_data };

  const attributes = current.attributes.map((attr) => ({
    ...attr,
    options: attr.options ? [...attr.options] : attr.options,
  }));
  for (const key of PRODUCT_SPEC_KEYS) {
    const entry = ordered[key];
    if (!entry) continue;
    const display = formatSpecDisplay(entry);
    const index = attributes.findIndex((attr) => canonicalSpecKey(attr.slug || attr.name || "") === key);
    if (index >= 0) {
      const prev = attributes[index];
      attributes[index] = {
        ...prev,
        options: [display],
        visible: prev.visible ?? true,
      };
    } else {
      attributes.push({
        name: entry.label || labelOf(key),
        visible: true,
        variation: false,
        options: [display],
      });
    }
  }
  return { attributes, meta_data };
}

function columnSpecsPayload(raw: unknown): Record<string, unknown> {
  const canonical = parseColumnSpecs(raw);
  const full = parseProductSpecs(raw);
  const out: Record<string, unknown> = { ...canonical };
  for (const [key, spec] of Object.entries(full)) {
    if (canonical[key as ProductSpecKey]) {
      if (spec.valueAlt) out[key] = { ...canonical[key as ProductSpecKey], valueAlt: spec.valueAlt };
    } else {
      out[key] = spec;
    }
  }
  return out;
}

/**
 * Valeur écrite en base pendant une sync. Vide côté Woo : null, la colonne n’est pas touchée.
 * Les clés hors contrat (et `valueAlt`) déjà stockées restent.
 */
export function storedSpecsForSync(incoming: unknown, existing?: unknown): Record<string, unknown> | null {
  const merged = mergeProductSpecs(incoming, existing);
  if (!Object.keys(merged).length) return null;
  const prior = parseProductSpecs(existing);
  const out: Record<string, unknown> = {};
  for (const [key, spec] of Object.entries(prior)) {
    if (!canonicalSpecKey(key)) out[key] = spec;
  }
  for (const key of PRODUCT_SPEC_KEYS) {
    const next = merged[key];
    if (!next) continue;
    const prev = prior[key];
    const sameText =
      prev != null &&
      formatSpecDisplay({ label: prev.label, value: prev.value, unit: prev.unit ?? "" }) === formatSpecDisplay(next);
    out[key] = sameText && prev?.valueAlt ? { ...next, valueAlt: prev.valueAlt } : next;
  }
  return out;
}

/** Champ caché du formulaire produit. Conserve les clés hors contrat. */
export function specsFieldValue(raw: unknown): Record<string, unknown> {
  return columnSpecsPayload(raw);
}

/**
 * Champ formulaire `specs` (JSON). Absent ou illisible → null : la colonne n’est pas touchée.
 * `{}` est une écriture explicite.
 */
export function readSpecsField(formData: FormData): Record<string, unknown> | null {
  const raw = formData.get("specs");
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return columnSpecsPayload(parsed);
  } catch {
    return null;
  }
}
