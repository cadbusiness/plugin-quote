/** Pure validation / shaping for the MCP / REST funnel configuration tools. */
import { z } from "zod";
import type { Json } from "@/lib/db/database.types";
import { defaultOptions, type FunnelKind } from "@/lib/funnels/builder";
import { FUNNEL_TEMPLATES } from "@/lib/funnels/templates";
import { getFunnelFamily } from "@/lib/funnels/families";
import type { FunnelTracking } from "@/lib/funnels/tracking";
import { AGENT_GREETING_MAX, AGENT_INSTRUCTIONS_MAX } from "@/lib/funnels/agent-settings";
import { catalogMatchScore, normalizeSearch, parseVariants, type CatalogProductRow } from "@/lib/api/catalog-search";
import { isUuid } from "@/lib/api/crm-core";
import type { Condition, QuestionOptions, QuestionType, ScreenType } from "@/lib/wizard/types";

export const SCREEN_TYPES = ["questions", "suggestions", "customize", "contact"] as const;
export const QUESTION_TYPES = ["visual_choice", "number", "select", "multi_select", "text", "file"] as const;
export const CONDITION_OPS = ["eq", "neq", "gte", "lte", "in", "contains"] as const;
export const FUNNEL_MODES = ["form", "chat", "catalog"] as const;

export const LIMITS = {
  steps: 15,
  questionsPerStep: 15,
  questions: 60,
  choices: 30,
  rules: 50,
  productsPerRule: 20,
  conditionsPerRule: 10,
  title: 120,
  subtitle: 240,
  label: 200,
  help: 500,
  choiceLabel: 120,
  choiceValue: 60,
} as const;

const KEY_RE = /^[a-z][a-z0-9_]{0,39}$/;
const CHOICE_TYPES = new Set<QuestionType>(["visual_choice", "select", "multi_select"]);
const uuidString = z.string().refine((value) => isUuid(value), "UUID attendu");

export const choiceInputSchema = z.object({
  value: z.string().trim().min(1).max(LIMITS.choiceValue).optional().describe("Valeur technique (défaut : dérivée du libellé)"),
  label: z.string().trim().min(1).max(LIMITS.choiceLabel),
  description: z.string().trim().max(200).optional(),
});

export const questionInputSchema = z.object({
  id: uuidString.optional().describe("ID d’une question existante à conserver (voir get_funnel)"),
  key: z
    .string()
    .regex(KEY_RE, "snake_case, 40 caractères max, commence par une lettre")
    .optional()
    .describe("Clé de réponse utilisée par les règles (défaut : clé existante ou dérivée du libellé)"),
  label: z.string().trim().min(1).max(LIMITS.label).describe("Question posée"),
  type: z.enum(QUESTION_TYPES).describe("visual_choice (cartes), select (liste), multi_select, number (mesure), text, file"),
  required: z.boolean().optional().describe("Défaut true"),
  help: z.string().trim().max(LIMITS.help).nullable().optional().describe("Texte d’aide"),
  options: z
    .object({
      choices: z.array(choiceInputSchema).max(LIMITS.choices).optional().describe("Obligatoire pour visual_choice / select / multi_select"),
      min: z.number().optional(),
      max: z.number().optional(),
      step: z.number().positive().optional(),
      unit: z.string().trim().max(20).optional().describe("Unité (m², kg…) pour number"),
      placeholder: z.string().trim().max(120).optional(),
    })
    .optional(),
});

export const stepInputSchema = z.object({
  id: uuidString.optional().describe("ID d’une étape existante à conserver (voir get_funnel)"),
  type: z.enum(SCREEN_TYPES).describe("questions, suggestions (produits recommandés), customize (quantités / options), contact"),
  title: z.string().trim().min(1).max(LIMITS.title),
  subtitle: z.string().trim().max(LIMITS.subtitle).nullable().optional(),
  questions: z.array(questionInputSchema).max(LIMITS.questionsPerStep).optional().describe("Seulement pour type=questions"),
});

export const stepsInputSchema = z.array(stepInputSchema).min(1).max(LIMITS.steps);

export type StepInput = z.infer<typeof stepInputSchema>;
export type QuestionInput = z.infer<typeof questionInputSchema>;

export const conditionInputSchema = z.object({
  question_key: z.string().min(1).describe("Clé de la question (voir get_funnel)"),
  op: z.enum(CONDITION_OPS).describe("eq, neq, gte, lte (nombres), in (parmi une liste), contains (choix multiple)"),
  value: z
    .union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))])
    .describe("Valeur ou libellé d’option ; liste pour in"),
});

export const ruleInputSchema = z.object({
  id: uuidString.optional().describe("ID d’une règle existante à mettre à jour"),
  name: z.string().trim().min(2).max(120).describe("Nom interne (sert aussi à retrouver la règle)"),
  headline: z.string().trim().max(160).nullable().optional().describe("Titre affiché au prospect"),
  description: z.string().trim().max(600).nullable().optional(),
  priority: z.number().int().min(-100).max(100).optional().describe("Plus haut = affiché en premier (défaut 0)"),
  is_active: z.boolean().optional(),
  price_min: z.number().nonnegative().nullable().optional(),
  price_max: z.number().nonnegative().nullable().optional(),
  conditions: z
    .array(conditionInputSchema)
    .max(LIMITS.conditionsPerRule)
    .describe("Toutes doivent être vraies (ET). Vide = toujours proposée"),
  products: z
    .array(z.string().trim().min(1))
    .min(1)
    .max(LIMITS.productsPerRule)
    .describe("Produits du catalogue du funnel : ID, SKU ou nom exact"),
});

export type RuleInput = z.infer<typeof ruleInputSchema>;

// --- keys

export function keyFromLabel(label: string) {
  const base = label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36)
    .replace(/_+$/g, "");
  if (!base) return "q";
  return /^[a-z]/.test(base) ? base : `q_${base}`.slice(0, 36);
}

function uniqueKey(base: string, taken: Set<string>) {
  let key = base;
  let n = 2;
  while (taken.has(key)) {
    key = `${base}_${n}`;
    n += 1;
  }
  taken.add(key);
  return key;
}

// --- steps

export type StoredStep = { id: string; screen_type: string; sort_order: number; title: string; subtitle: string | null };
export type StoredQuestion = {
  id: string;
  step_id: string;
  key: string;
  label: string;
  help_text: string | null;
  type: string;
  required: boolean;
  sort_order: number;
  options: Json;
};

export type PlannedQuestion = {
  id: string | null;
  key: string;
  label: string;
  help_text: string | null;
  type: QuestionType;
  required: boolean;
  sort_order: number;
  options: QuestionOptions;
};

export type PlannedStep = {
  id: string | null;
  screen_type: ScreenType;
  title: string;
  subtitle: string | null;
  sort_order: number;
  questions: PlannedQuestion[];
};

export type StepsPlan = {
  steps: PlannedStep[];
  deleteStepIds: string[];
  deleteQuestionIds: string[];
  /** Answer keys that existed before and are gone now (rules using them stop matching). */
  removedKeys: string[];
};

type Shape = { screen_type: string; questions: { type: string; options: unknown; label?: string }[] };

/** Runtime constraints of the public funnel; shared by the step editor tool and publish checks. */
export function structureIssues(steps: Shape[], kind: FunnelKind): string[] {
  const issues: string[] = [];
  if (!steps.length) return ["Le funnel doit avoir au moins une étape."];
  const contacts = steps.filter((step) => step.screen_type === "contact").length;
  if (contacts !== 1) issues.push("Le funnel doit avoir exactement une étape contact (c’est elle qui envoie la demande).");
  else if (steps.at(-1)?.screen_type !== "contact") {
    issues.push("L’étape contact doit être la dernière : les étapes placées après ne sont jamais affichées.");
  }
  if (kind === "catalog") {
    for (const type of ["suggestions", "customize"] as const) {
      if (!steps.some((step) => step.screen_type === type)) {
        issues.push(`Un funnel catalogue a besoin d’une étape ${type} (rayons puis devis).`);
      }
    }
  }
  steps.forEach((step, index) => {
    if (step.screen_type === "questions" && !step.questions.length) {
      issues.push(`Étape ${index + 1} : une étape questions doit contenir au moins une question.`);
    }
    if (step.screen_type !== "questions" && step.questions.length) {
      issues.push(`Étape ${index + 1} : seules les étapes questions portent des questions.`);
    }
    for (const question of step.questions) {
      if (!CHOICE_TYPES.has(question.type as QuestionType)) continue;
      const choices = (question.options as { choices?: unknown } | null)?.choices;
      if (!Array.isArray(choices) || !choices.length) {
        issues.push(`Étape ${index + 1} : « ${question.label ?? "question"} » doit proposer au moins une option.`);
      }
    }
  });
  const total = steps.reduce((sum, step) => sum + step.questions.length, 0);
  if (total > LIMITS.questions) issues.push(`${LIMITS.questions} questions maximum au total.`);
  return issues;
}

function plannedOptions(question: QuestionInput, prefix: string, errors: string[]): QuestionOptions {
  const given = question.options ?? {};
  if (CHOICE_TYPES.has(question.type)) {
    const taken = new Set<string>();
    const choices = (given.choices ?? []).map((choice) => {
      const base = choice.value ?? keyFromLabel(choice.label);
      if (choice.value && taken.has(base)) errors.push(`${prefix} : valeur d’option « ${base} » en double.`);
      const value = uniqueKey(base, taken);
      return { value, label: choice.label, ...(choice.description ? { description: choice.description } : {}) };
    });
    if (!choices.length) errors.push(`${prefix} : au moins une option (options.choices) pour le type ${question.type}.`);
    return { choices };
  }
  if (given.choices?.length) errors.push(`${prefix} : options.choices n’est valable que pour visual_choice / select / multi_select.`);
  if (question.type === "number") {
    const base = defaultOptions("number");
    const merged: QuestionOptions = {
      min: given.min ?? base.min,
      max: given.max ?? base.max,
      step: given.step ?? base.step,
      unit: given.unit ?? base.unit,
      placeholder: given.placeholder ?? base.placeholder,
    };
    if (typeof merged.min === "number" && typeof merged.max === "number" && merged.min > merged.max) {
      errors.push(`${prefix} : min doit être inférieur ou égal à max.`);
    }
    return merged;
  }
  if (question.type === "text") return { placeholder: given.placeholder ?? defaultOptions("text").placeholder };
  return {};
}

/**
 * Declarative replace: `desired` is the full ordered list of steps. Items carrying an `id`
 * keep their row (and answer key); steps / questions left out are deleted.
 */
export function planStepsReplace(
  desired: StepInput[],
  current: { steps: StoredStep[]; questions: StoredQuestion[] },
  kind: FunnelKind,
): { ok: true; plan: StepsPlan } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const stepIds = new Set(current.steps.map((step) => step.id));
  const questionById = new Map(current.questions.map((question) => [question.id, question]));
  const seenSteps = new Set<string>();
  const seenQuestions = new Set<string>();
  const explicitKeys = new Set<string>();
  const keys = new Set<string>();

  desired.forEach((step, si) => {
    if (step.id) {
      if (!stepIds.has(step.id)) errors.push(`Étape ${si + 1} : id ${step.id} inconnu dans ce funnel.`);
      if (seenSteps.has(step.id)) errors.push(`Étape ${si + 1} : id ${step.id} utilisé deux fois.`);
      seenSteps.add(step.id);
    }
    for (const [qi, question] of (step.questions ?? []).entries()) {
      const prefix = `Étape ${si + 1}, question ${qi + 1}`;
      if (question.id) {
        if (!questionById.has(question.id)) errors.push(`${prefix} : id ${question.id} inconnu dans ce funnel.`);
        if (seenQuestions.has(question.id)) errors.push(`${prefix} : id ${question.id} utilisé deux fois.`);
        seenQuestions.add(question.id);
      }
      const key = question.key ?? (question.id ? questionById.get(question.id)?.key : undefined);
      if (key) {
        if (explicitKeys.has(key)) errors.push(`${prefix} : clé « ${key} » déjà utilisée par une autre question.`);
        explicitKeys.add(key);
      }
    }
  });
  explicitKeys.forEach((key) => keys.add(key));

  const steps: PlannedStep[] = desired.map((step, si) => ({
    id: step.id ?? null,
    screen_type: step.type,
    title: step.title,
    subtitle: step.subtitle?.trim() || null,
    sort_order: si,
    questions: (step.questions ?? []).map((question, qi) => {
      const prefix = `Étape ${si + 1}, question ${qi + 1}`;
      const kept = question.id ? questionById.get(question.id) : undefined;
      const key = question.key ?? kept?.key ?? uniqueKey(keyFromLabel(question.label), keys);
      return {
        id: question.id ?? null,
        key,
        label: question.label,
        help_text: question.help?.trim() || null,
        type: question.type,
        required: question.required ?? true,
        sort_order: qi,
        options: plannedOptions(question, prefix, errors),
      };
    }),
  }));

  errors.push(
    ...structureIssues(
      steps.map((step) => ({
        screen_type: step.screen_type,
        questions: step.questions.map((q) => ({ type: q.type, options: q.options, label: q.label })),
      })),
      kind,
    ),
  );
  if (errors.length) return { ok: false, errors: [...new Set(errors)] };

  const nextKeys = new Set(steps.flatMap((step) => step.questions.map((q) => q.key)));
  return {
    ok: true,
    plan: {
      steps,
      deleteStepIds: current.steps.filter((step) => !seenSteps.has(step.id)).map((step) => step.id),
      deleteQuestionIds: current.questions.filter((q) => !seenQuestions.has(q.id)).map((q) => q.id),
      removedKeys: [...new Set(current.questions.map((q) => q.key))].filter((key) => !nextKeys.has(key)),
    },
  };
}

// --- suggestion rules

export type RuleQuestion = { key: string; label: string; type: string; options: Json | QuestionOptions };

function choicesOf(question: RuleQuestion) {
  const raw = (question.options as { choices?: unknown } | null)?.choices;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (choice): choice is { value: string; label: string } =>
      Boolean(choice) && typeof choice === "object" && typeof (choice as { value?: unknown }).value === "string",
  );
}

function matchChoice(question: RuleQuestion, raw: unknown): string | null {
  const choices = choicesOf(question);
  const text = normalizeSearch(String(raw));
  const hit =
    choices.find((choice) => choice.value === String(raw)) ??
    choices.find((choice) => normalizeSearch(choice.value) === text) ??
    choices.find((choice) => normalizeSearch(choice.label) === text);
  return hit?.value ?? null;
}

function asNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    const n = Number(raw.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Maps tool conditions to `RuleConditions.all`, so `evaluateSuggestions` can actually match them. */
export function normalizeConditions(
  input: RuleInput["conditions"],
  questions: RuleQuestion[],
  prefix: string,
): { conditions: Condition[]; errors: string[] } {
  const errors: string[] = [];
  const byKey = new Map(questions.map((q) => [q.key, q]));
  const conditions: Condition[] = [];
  for (const condition of input) {
    const question = byKey.get(condition.question_key);
    const where = `${prefix}, condition « ${condition.question_key} »`;
    if (!question) {
      errors.push(`${where} : clé inconnue. Clés disponibles : ${[...byKey.keys()].join(", ") || "aucune"}.`);
      continue;
    }
    const isChoice = CHOICE_TYPES.has(question.type as QuestionType);
    const allowed = choicesOf(question).map((c) => `${c.value} (${c.label})`).join(", ");
    const { op } = condition;

    if (op === "gte" || op === "lte") {
      const n = Array.isArray(condition.value) ? null : asNumber(condition.value);
      if (n === null) errors.push(`${where} : ${op} attend un nombre.`);
      else conditions.push({ key: question.key, op, value: n });
      continue;
    }
    if (op === "contains") {
      if (question.type !== "multi_select") {
        errors.push(`${where} : contains ne s’applique qu’à une question à choix multiple (utilisez eq ou in).`);
        continue;
      }
      const value = Array.isArray(condition.value) ? null : matchChoice(question, condition.value);
      if (!value) errors.push(`${where} : option inconnue. Options : ${allowed}.`);
      else conditions.push({ key: question.key, op, value });
      continue;
    }
    if (question.type === "multi_select") {
      errors.push(`${where} : pour un choix multiple, utilisez contains (une condition par option).`);
      continue;
    }
    if (op === "in") {
      const list = Array.isArray(condition.value) ? condition.value : [condition.value];
      if (!list.length) {
        errors.push(`${where} : in attend au moins une valeur.`);
        continue;
      }
      if (isChoice) {
        const mapped = list.map((item) => matchChoice(question, item));
        const unknown = list.filter((_, i) => !mapped[i]);
        if (unknown.length) errors.push(`${where} : option(s) inconnue(s) ${unknown.join(", ")}. Options : ${allowed}.`);
        else conditions.push({ key: question.key, op, value: mapped as string[] });
      } else {
        conditions.push({ key: question.key, op, value: list.map(String) });
      }
      continue;
    }
    // eq / neq
    if (Array.isArray(condition.value)) {
      errors.push(`${where} : ${op} attend une seule valeur (utilisez in pour une liste).`);
      continue;
    }
    if (isChoice) {
      const value = matchChoice(question, condition.value);
      if (!value) errors.push(`${where} : option inconnue « ${String(condition.value)} ». Options : ${allowed}.`);
      else conditions.push({ key: question.key, op, value });
      continue;
    }
    if (question.type === "number") {
      const n = asNumber(condition.value);
      if (n === null) errors.push(`${where} : nombre attendu.`);
      else conditions.push({ key: question.key, op, value: n });
      continue;
    }
    conditions.push({ key: question.key, op, value: String(condition.value) });
  }
  return { conditions, errors };
}

export type ResolvableProduct = CatalogProductRow;

/**
 * Exact resolution only (id, product SKU, variation SKU, exact name). Anything else is
 * an error carrying up to three candidates: the tool never guesses.
 */
export function resolveProductRefs(
  refs: string[],
  funnelProducts: ResolvableProduct[],
  orgProducts: ResolvableProduct[],
  funnels: Map<string, string> = new Map(),
): { ids: string[]; errors: string[]; resolved: { ref: string; id: string; name: string }[] } {
  const errors: string[] = [];
  const resolved: { ref: string; id: string; name: string }[] = [];

  const find = (rows: ResolvableProduct[], ref: string) => {
    const wanted = ref.trim();
    const sku = wanted.toLowerCase();
    const name = normalizeSearch(wanted);
    const byId = rows.filter((row) => row.id === wanted);
    if (byId.length) return byId;
    const bySku = rows.filter((row) => row.sku?.trim().toLowerCase() === sku);
    if (bySku.length) return bySku;
    const byVariant = rows.filter((row) =>
      parseVariants(row.variants).some((variant) => variant.sku?.trim().toLowerCase() === sku),
    );
    if (byVariant.length) return byVariant;
    return rows.filter((row) => normalizeSearch(row.name) === name);
  };

  for (const ref of refs) {
    const hits = find(funnelProducts, ref);
    if (hits.length === 1) {
      const [hit] = hits;
      if (!hit.is_active) {
        errors.push(`« ${ref} » : produit masqué / inactif (${hit.name}), il ne serait jamais proposé.`);
        continue;
      }
      resolved.push({ ref, id: hit.id, name: hit.name });
      continue;
    }
    if (hits.length > 1) {
      errors.push(
        `« ${ref} » : ambigu (${hits.slice(0, 5).map((h) => `${h.name} [${h.sku ?? h.id}]`).join(" ; ")}). Utilisez l’ID.`,
      );
      continue;
    }
    const elsewhere = find(orgProducts, ref).filter((row) => row.configurator_id);
    if (elsewhere.length) {
      const owner = funnels.get(elsewhere[0].configurator_id) ?? elsewhere[0].configurator_id;
      errors.push(
        `« ${ref} » : ce produit appartient au catalogue d’un autre funnel (${owner}). Un funnel ne propose que son propre catalogue : recréez le funnel avec from_catalog ou choisissez un produit de ce funnel.`,
      );
      continue;
    }
    const candidates = funnelProducts
      .map((row) => ({ row, score: catalogMatchScore(row, parseVariants(row.variants), ref) }))
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((hit) => `${hit.row.name} [${hit.row.id}]`);
    errors.push(
      `« ${ref} » : introuvable dans le catalogue du funnel.${candidates.length ? ` Proches : ${candidates.join(" ; ")}.` : ""}`,
    );
  }
  return { ids: [...new Set(resolved.map((item) => item.id))], errors, resolved };
}

// --- tracking

export const trackingInputSchema = {
  ga4_id: z.string().max(40).optional().describe("Google Analytics 4 (G-XXXXXXX). Chaîne vide = retirer"),
  gtm_id: z.string().max(40).optional().describe("Google Tag Manager (GTM-XXXXXXX). Chaîne vide = retirer"),
  meta_pixel_id: z.string().max(40).optional().describe("Pixel Meta (chiffres). Chaîne vide = retirer"),
};

/** Omitted field = unchanged, empty string = removed, otherwise validated and upper-cased. */
export function applyTrackingPatch(
  current: FunnelTracking,
  patch: { ga4_id?: string; gtm_id?: string; meta_pixel_id?: string },
): { ok: true; tracking: FunnelTracking } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const next = { ...current };
  if (patch.ga4_id !== undefined) {
    const value = patch.ga4_id.trim().toUpperCase();
    if (value && !/^G-[A-Z0-9]{4,20}$/.test(value)) errors.push(`ga4_id « ${patch.ga4_id} » invalide (format G-XXXXXXX).`);
    else next.ga = value;
  }
  if (patch.gtm_id !== undefined) {
    const value = patch.gtm_id.trim().toUpperCase();
    if (value && !/^GTM-[A-Z0-9]{4,12}$/.test(value)) errors.push(`gtm_id « ${patch.gtm_id} » invalide (format GTM-XXXXXXX).`);
    else next.gtm = value;
  }
  if (patch.meta_pixel_id !== undefined) {
    const value = patch.meta_pixel_id.trim();
    if (value && !/^\d{6,20}$/.test(value)) errors.push(`meta_pixel_id « ${patch.meta_pixel_id} » invalide (chiffres uniquement).`);
    else next.metaPixel = value;
  }
  return errors.length ? { ok: false, errors } : { ok: true, tracking: next };
}

// --- publish

export function publishWarnings(input: {
  kind: FunnelKind;
  productCount: number;
  ruleCount: number;
  hasSuggestionsStep: boolean;
}): string[] {
  const warnings: string[] = [];
  if (!input.productCount && (input.kind !== "form" || input.hasSuggestionsStep)) {
    warnings.push("Aucun produit actif dans le catalogue de ce funnel : rien ne sera proposé au prospect.");
  }
  if (input.kind === "form" && input.hasSuggestionsStep && input.productCount && !input.ruleCount) {
    warnings.push("Aucune règle de suggestion : l’étape « Produits recommandés » restera vide (voir set_suggestion_rules).");
  }
  return warnings;
}

// --- templates

export function listTemplates() {
  return FUNNEL_TEMPLATES.map((template) => ({
    id: template.id,
    label: template.label,
    description: template.blurb,
    default_mode: template.defaultKind,
    default_name: template.defaultName,
    family: getFunnelFamily(template.family).label,
    aliases: template.id === "racking" ? ["rayonnage"] : [],
    steps: template.steps.map((step) => ({
      type: step.screen_type,
      title: step.title,
      questions: (step.questions ?? []).map((q) => q.label),
    })),
  }));
}

export function resolveTemplateId(id: string | undefined, mode: FunnelKind): string | null {
  if (!id) return mode === "catalog" ? "custom_catalog" : "general";
  const normalized = id.trim().toLowerCase() === "rayonnage" ? "racking" : id.trim();
  return FUNNEL_TEMPLATES.some((template) => template.id === normalized) ? normalized : null;
}

// --- request bodies (shared by the MCP tools and the REST routes)

const confirmPublished = z
  .boolean()
  .optional()
  .describe("Obligatoire (true) si le funnel est publié : la modification s’applique tout de suite aux visiteurs");

export const createFunnelBody = z.object({
  name: z.string().trim().min(2).max(80).describe("Nom du funnel"),
  mode: z.enum(FUNNEL_MODES).describe("form (questions), chat (agent IA), catalog (rayons) ; non modifiable ensuite"),
  template: z.string().optional().describe("ID de modèle (list_funnel_templates). Défaut : general, ou custom_catalog en mode catalog"),
  from_catalog: z.string().optional().describe("ID du funnel dont copier les produits, ou « auto »"),
  screens: z
    .array(z.enum(SCREEN_TYPES))
    .optional()
    .describe("Écrans du modèle à garder (défaut : tous). L’écran contact est toujours ajouté"),
});

export const stepsBody = z.object({ steps: stepsInputSchema, confirm_published: confirmPublished });

export const rulesBody = z.object({
  rules: z.array(ruleInputSchema).max(LIMITS.rules),
  mode: z.enum(["replace", "upsert"]).optional().describe("replace (défaut) supprime les règles non listées, upsert les garde"),
  confirm_published: confirmPublished,
});

export const chatAgentBody = z.object({
  instructions: z.string().max(AGENT_INSTRUCTIONS_MAX).optional().describe("Consignes de ton / priorités pour l’agent"),
  greeting: z.string().max(AGENT_GREETING_MAX).optional().describe("Premier message affiché au prospect"),
  confirm_published: confirmPublished,
});

export const trackingBody = z.object(trackingInputSchema);

export const publishBody = z.object({
  publish: z.boolean(),
  confirm: z.boolean().describe("true uniquement après accord explicite du marchand"),
});
