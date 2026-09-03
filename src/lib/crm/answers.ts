import type { Json } from "@/lib/db/database.types";
import type { Answers, Choice, QuestionOptions } from "@/lib/wizard/types";

const SKIP_KEYS = new Set([
  "name",
  "email",
  "phone",
  "company",
  "contact_name",
  "contact_email",
  "contact_phone",
  "contact_company",
]);

const KEY_LABELS: Record<string, string> = {
  project_type: "Type de projet",
  surface: "Surface",
  height: "Hauteur disponible",
  load: "Charge par niveau",
  access: "Accès chantier",
  constraints: "Contraintes",
  budget: "Budget indicatif",
  style: "Style",
  timeline: "Délai souhaité",
  notes: "Précisions",
  usage: "Usage",
  essence: "Essence / finition",
  upkeep: "Entretien",
  category: "Famille",
  duration: "Durée",
};

const KEY_ORDER = [
  "project_type",
  "usage",
  "category",
  "surface",
  "height",
  "load",
  "access",
  "constraints",
  "budget",
  "style",
  "timeline",
  "duration",
  "essence",
  "upkeep",
  "notes",
];

const KEY_UNITS: Record<string, string> = {
  surface: "m²",
  height: "m",
  load: "kg",
};

const VALUE_LABELS: Record<string, string> = {
  entrepot: "Entrepôt",
  commerce: "Commerce",
  atelier: "Atelier",
  archive: "Archives",
  cuisine_pro: "Cuisine professionnelle",
  complete: "Cuisine complète",
  ilot: "Îlot / snack",
  partial: "Partiel",
  modern: "Contemporain",
  classic: "Classique",
  industrial: "Industriel",
  undecided: "Pas encore tranché",
  light: "Légère (< 250 kg)",
  medium: "Moyenne (250–800 kg)",
  heavy: "Lourde (> 800 kg)",
  haute: "Difficile / hauteur",
  moyenne: "Accès contraint",
  facile: "Accès facile",
  hauteur: "Hauteur limitée",
  horaires: "Horaires contraints",
  horaires_nuit: "Intervention de nuit",
  dalle_existante: "Dalle existante",
  acces_difficile: "Accès difficile",
  aucune: "Aucune",
  "10k": "Moins de 10 000 €",
  "20k": "10 000 – 20 000 €",
  "40k": "20 000 – 40 000 €",
  "40k+": "Plus de 40 000 €",
  "80k+": "Plus de 80 000 €",
  "avant saison": "Avant la saison",
  furniture: "Meuble",
  opening: "Ouverture",
  stair: "Escalier / garde-corps",
  fitout: "Agencement",
  oak: "Chêne",
  walnut: "Noyer",
  ash: "Frêne",
  painted: "Laqué / peint",
  open: "À conseiller",
  terrace: "Terrasse / salon d’été",
  lawn: "Pelouse / massifs",
  pool: "Tour de piscine",
  full: "Jardin complet",
  low: "Minimal",
  high: "Jardin soigné",
  lift: "Levage / Nacelle",
  earth: "Terrassement",
  power: "Énergie / Groupe",
  other: "Autre",
};

export type QuestionMeta = {
  key: string;
  label: string;
  type?: string;
  options?: QuestionOptions;
};

export type LabeledAnswer = {
  key: string;
  label: string;
  value: string;
};

function asOptions(value: Json | QuestionOptions | undefined): QuestionOptions {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as QuestionOptions;
}

function choiceLabel(value: string, choices?: Choice[]) {
  const match = choices?.find((c) => c.value === value);
  if (match) return match.label;
  return VALUE_LABELS[value] ?? humanize(value);
}

function humanize(raw: string) {
  const spaced = raw.replace(/[_-]+/g, " ");
  return spaced.replace(/^(\p{L})/u, (c) => c.toUpperCase());
}

function formatOne(value: unknown, meta?: QuestionMeta): string {
  if (value == null || value === "") return "—";
  const options = asOptions(meta?.options);
  if (Array.isArray(value)) {
    const parts = value.map((item) => formatOne(item, meta)).filter((part) => part !== "—");
    return parts.length ? parts.join(", ") : "—";
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const unit = options.unit || (meta?.key ? KEY_UNITS[meta.key] : undefined);
    const suffix = unit ? ` ${unit}` : "";
    return `${new Intl.NumberFormat("fr-FR").format(value)}${suffix}`;
  }
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  if (meta?.type === "number" && Number.isFinite(Number(text))) {
    return formatOne(Number(text), meta);
  }
  return choiceLabel(text, options.choices);
}

export function labelAnswers(answers: Answers, questions: QuestionMeta[] = []): LabeledAnswer[] {
  const byKey = new Map(questions.map((q) => [q.key, q]));
  return Object.entries(answers)
    .filter(([key]) => !SKIP_KEYS.has(key))
    .map(([key, value]) => {
      const meta = byKey.get(key) ?? { key, label: KEY_LABELS[key] || humanize(key) };
      return {
        key,
        label: meta.label || KEY_LABELS[key] || humanize(key),
        value: formatOne(value, meta),
      };
    })
    .filter((row) => row.value !== "—")
    .sort((a, b) => {
      const ai = KEY_ORDER.indexOf(a.key);
      const bi = KEY_ORDER.indexOf(b.key);
      return (ai === -1 ? KEY_ORDER.length : ai) - (bi === -1 ? KEY_ORDER.length : bi);
    });
}

export function formatItemOptions(options: Json): string | null {
  if (!options || typeof options !== "object" || Array.isArray(options)) return null;
  const parts = Object.entries(options as Record<string, unknown>)
    .filter(([, value]) => value != null && value !== "")
    .map(([key, value]) => `${KEY_LABELS[key] ?? humanize(key)} : ${formatOne(value)}`);
  return parts.length ? parts.join(" · ") : null;
}
