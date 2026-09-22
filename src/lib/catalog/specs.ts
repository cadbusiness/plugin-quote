/**
 * Fiches techniques structurées (`products.specs`).
 *
 * Contrat Woo (Hostinger) : attributs globaux `pa_charge`, `pa_hauteur`,
 * `pa_profondeur`, `pa_materiau`, `pa_delai` — ou meta `charge` / `_qb_specs`.
 * La description HTML n'est jamais une source.
 */

export const PRODUCT_SPEC_KEYS = ["charge", "hauteur", "profondeur", "materiau", "delai"] as const;

export type ProductSpecKey = (typeof PRODUCT_SPEC_KEYS)[number];

export type ProductSpecEntry = {
  label: string;
  value: string;
  unit: string;
};

/** Alias historique du payload public. L’unité est toujours une chaîne (vide si absente). */
export type ProductSpec = ProductSpecEntry;

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

export type WooSpecAttribute = {
  id?: number;
  name?: string;
  slug?: string;
  visible?: boolean;
  variation?: boolean;
  options?: string[];
};

export type WooSpecMeta = {
  id?: number;
  key?: string;
  value?: unknown;
};

/** Sous-ensemble produit Woo lu par le mapping. Pas de description. */
export type WooSpecSource = {
  attributes?: WooSpecAttribute[];
  meta_data?: WooSpecMeta[];
};

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
    return { label, value: valueText, unit: unitText };
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

/** Normalise le jsonb `products.specs` (objet, chaîne JSON, ou vide). */
export function parseProductSpecs(raw: unknown): ProductSpecs {
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return {};
    try {
      return parseProductSpecs(JSON.parse(text) as unknown);
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
 * Un payload vide, ou un parse moins précis du même texte (« 1000 kg/niveau » replié
 * dans `value`), ne remplace pas l’entrée déjà en base.
 */
export function mergeProductSpecs(incoming: unknown, existing?: unknown): ProductSpecs {
  const woo = parseProductSpecs(incoming);
  const prior = parseProductSpecs(existing);
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
 * Attribut si son texte diffère de `_qb_specs`, sinon l’objet structuré (aller-retour exact).
 * Puis meta unitaire. Jamais la description.
 */
export function mapWooProductSpecs(source: WooSpecSource): ProductSpecs {
  const loose: ProductSpecs = {};
  let structured: ProductSpecs = {};
  for (const meta of source.meta_data ?? []) {
    const metaKey = meta.key?.trim();
    if (!metaKey) continue;
    if (metaKey === "_qb_specs" || metaKey === "qb_specs") {
      structured = parseProductSpecs(meta.value);
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

export function listProductSpecs(specs: ProductSpecs | null | undefined) {
  if (!specs) return [];
  return PRODUCT_SPEC_KEYS.flatMap((key) => {
    const entry = specs[key];
    if (!entry?.value?.trim()) return [];
    return [{ key, ...entry }];
  });
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

function readStructuredSpecFields(formData: FormData): ProductSpecs | null {
  const present = PRODUCT_SPEC_KEYS.some((key) => formData.has(`spec_value_${key}`));
  if (!present) return null;
  const specs: ProductSpecs = {};
  for (const key of PRODUCT_SPEC_KEYS) {
    const value = String(formData.get(`spec_value_${key}`) ?? "").trim();
    if (!value) continue;
    const label = String(formData.get(`spec_label_${key}`) ?? "").trim() || labelOf(key);
    const unit = String(formData.get(`spec_unit_${key}`) ?? "").trim();
    specs[key] = { label, value, unit };
  }
  return orderProductSpecs(specs);
}

/**
 * Champ formulaire `specs` (JSON) ou champs `spec_value_*`.
 * Absent ou illisible → null : la colonne n’est pas touchée.
 * `{}` est une écriture explicite (champs présents mais vides, ou JSON `{}`).
 */
export function readSpecsField(formData: FormData): ProductSpecs | null {
  const structured = readStructuredSpecFields(formData);
  if (structured) return structured;
  const raw = formData.get("specs");
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parseProductSpecs(parsed);
  } catch {
    return null;
  }
}
