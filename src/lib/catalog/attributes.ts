import type { ProductOption } from "@/lib/wizard/types";

export const ATTRIBUTE_KINDS = [
  { id: "choices", label: "Choix pour le prospect", hint: "Couleur, taille… le client choisit" },
  { id: "text", label: "Information", hint: "Dimensions, matière, référence" },
  { id: "number", label: "Mesure", hint: "Poids, hauteur, capacité" },
  { id: "note", label: "Texte long", hint: "Mode d’emploi, précisions" },
] as const;

export type ProductAttributeKind = (typeof ATTRIBUTE_KINDS)[number]["id"];

export type ProductAttribute = {
  key: string;
  label: string;
  kind: ProductAttributeKind;
  values?: { value: string; label: string }[];
  value?: string;
  unit?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function asKind(value: unknown): ProductAttributeKind {
  if (value === "text" || value === "number" || value === "note" || value === "choices") return value;
  return "choices";
}

export function normalizeAttributes(raw: unknown): ProductAttribute[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const label = typeof row.label === "string" ? row.label.trim() : "";
    if (!label) return [];
    const values = Array.isArray(row.values)
      ? row.values.flatMap((value) => {
          if (!value || typeof value !== "object") return [];
          const entry = value as { value?: unknown; label?: unknown };
          const text = typeof entry.label === "string" ? entry.label : typeof entry.value === "string" ? entry.value : "";
          if (!text.trim()) return [];
          return [{ value: slugify(String(entry.value ?? text)), label: text.trim() }];
        })
      : [];
    const kind = asKind(row.kind) === "choices" && !values.length && typeof row.value === "string" ? "text" : asKind(row.kind);
    return [
      {
        key: typeof row.key === "string" && row.key ? row.key : slugify(label) || `attr-${index}`,
        label,
        kind: values.length && !row.kind ? "choices" : kind,
        values: values.length ? values : undefined,
        value: typeof row.value === "string" ? row.value : undefined,
        unit: typeof row.unit === "string" ? row.unit : undefined,
      } satisfies ProductAttribute,
    ];
  });
}

export function toProspectOptions(attributes: ProductAttribute[]): ProductOption[] {
  return attributes
    .filter((attribute) => attribute.kind === "choices" && attribute.values?.length)
    .map((attribute) => ({
      key: attribute.key,
      label: attribute.label,
      values: attribute.values!,
    }));
}

export function parseProductAttributes(formData: FormData): ProductAttribute[] {
  const kinds = formData.getAll("attr_kind").map(String);
  const labels = formData.getAll("attr_label").map(String);
  const values = formData.getAll("attr_value").map(String);
  const units = formData.getAll("attr_unit").map(String);

  return labels.flatMap((label, index): ProductAttribute[] => {
    const trimmed = label.trim();
    if (!trimmed) return [];
    const kind = asKind(kinds[index]);
    const raw = (values[index] ?? "").trim();
    const unit = (units[index] ?? "").trim() || undefined;
    if (kind === "choices") {
      const parsed = raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => ({ value: slugify(value), label: value }));
      if (!parsed.length) return [];
      return [{ key: slugify(trimmed), label: trimmed, kind, values: parsed }];
    }
    if (!raw) return [];
    return [{ key: slugify(trimmed), label: trimmed, kind, value: raw, unit }];
  });
}
