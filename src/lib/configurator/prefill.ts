import type { Json } from "@/lib/db/database.types";
import type { Answers, Customization, WizardQuestion, WizardStep } from "@/lib/wizard/types";

/**
 * Query contract for the public funnel (`/c/:org/:slug` and `/embed/:org/:slug`).
 *
 * `besoin` — comma-separated gamme chips. Each token is a choice `value` or its
 * label (case and accents ignored). Repeatable: `?besoin=rayonnages&besoin=cantilever`
 * is the same as `?besoin=rayonnages,cantilever`.
 *
 * `add` — same chip tokens, or a catalogue product id / sku / external id / exact
 * name. A matching chip is selected. A matching product is added to the quote
 * (quantity 1) and named in the existing free-text answer (or `added` when the
 * funnel has no text question). Repeatable, comma-separated.
 *
 * `product` — alias of a single `add` token (product id).
 *
 * Existing session answers are kept. Query values are unioned in, never replaced.
 * Unknown tokens are ignored.
 */
export type PrefillChoice = { value: string; label: string };

export type PrefillProduct = {
  id: string;
  name: string;
  sku?: string | null;
  externalId?: string | null;
};

const CHOICE_ALIASES: Record<string, string> = {
  rayonnage: "rayonnages",
  rack: "rack_palettes",
  rack_a_palettes: "rack_palettes",
  rack_a_palette: "rack_palettes",
  palettes: "rack_palettes",
  palette: "rack_palettes",
  plateforme: "plateformes",
  rayonnage_leger: "leger",
  leger: "leger",
  autre_a_preciser: "autre",
};

const TEXT_KEYS = ["precision", "notes", "need"];

export function normalizePrefillToken(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function splitPrefillList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function readPrefillParams(search: URLSearchParams | string): { besoin: string[]; add: string[] } {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;
  return {
    besoin: params.getAll("besoin").flatMap(splitPrefillList),
    add: [...params.getAll("add"), ...params.getAll("product")].flatMap(splitPrefillList),
  };
}

export function matchChoice(token: string, choices: PrefillChoice[]): string | null {
  const norm = normalizePrefillToken(token);
  if (!norm) return null;
  const byValue = choices.find((choice) => normalizePrefillToken(choice.value) === norm);
  if (byValue) return byValue.value;
  const byLabel = choices.find((choice) => normalizePrefillToken(choice.label) === norm);
  if (byLabel) return byLabel.value;
  const alias = CHOICE_ALIASES[norm];
  if (!alias) return null;
  return choices.find((choice) => choice.value === alias)?.value ?? null;
}

function besoinQuestion(steps: WizardStep[]): WizardQuestion | null {
  for (const step of steps) {
    const named = step.questions.find(
      (question) =>
        question.key === "besoin" &&
        (question.type === "multi_select" || question.type === "visual_choice" || question.type === "select"),
    );
    if (named) return named;
  }
  for (const step of steps) {
    const first = step.questions.find(
      (question) => question.type === "multi_select" || question.type === "visual_choice" || question.type === "select",
    );
    if (first) return first;
  }
  return null;
}

function textQuestion(steps: WizardStep[]): WizardQuestion | null {
  const questions = steps.flatMap((step) => step.questions).filter((question) => question.type === "text");
  for (const key of TEXT_KEYS) {
    const named = questions.find((question) => question.key === key);
    if (named) return named;
  }
  return questions[0] ?? null;
}

function asStrings(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function sameToken(left: string, right: string) {
  const a = left.trim();
  const b = right.trim();
  if (!a || !b) return false;
  return a === b || normalizePrefillToken(a) === normalizePrefillToken(b);
}

function matchProduct(token: string, products: PrefillProduct[]): PrefillProduct | undefined {
  return products.find((product) =>
    [product.id, product.sku, product.externalId, product.name].some(
      (candidate) => typeof candidate === "string" && sameToken(candidate, token),
    ),
  );
}

export function applyFunnelPrefill(input: {
  search: URLSearchParams | string;
  steps: WizardStep[];
  products: PrefillProduct[];
  answers: Answers;
  customization: Customization;
}): {
  answers: Answers;
  customization: Customization;
  changed: boolean;
  /** Step index to show when the query added a gamme. Null when the step should stay put. */
  focusStep: number | null;
  besoin: string[];
  productIds: string[];
} {
  const { besoin: besoinTokens, add: addTokens } = readPrefillParams(input.search);
  const question = besoinQuestion(input.steps);
  const focusIndex = question
    ? input.steps.findIndex((step) => step.questions.some((item) => item.id === question.id))
    : -1;
  const choices = question?.options.choices ?? [];
  const key = question?.key ?? "besoin";
  const selected = new Set(asStrings(input.answers[key]));
  const productIds: string[] = [];
  const productNames: string[] = [];

  const take = (token: string) => {
    const choice = choices.length ? matchChoice(token, choices) : null;
    if (choice) {
      selected.add(choice);
      return;
    }
    const product = matchProduct(token, input.products);
    if (!product) return;
    if (!productIds.includes(product.id)) productIds.push(product.id);
    if (!productNames.includes(product.name)) productNames.push(product.name);
  };

  for (const token of besoinTokens) take(token);
  for (const token of addTokens) take(token);

  const answers: Answers = { ...input.answers };
  let changed = false;
  const previous = asStrings(input.answers[key]);
  const nextBesoin = [...selected];
  const besoinGrew = nextBesoin.some((value) => !previous.includes(value));

  if (question && besoinGrew) {
    if (question.type === "multi_select") {
      answers[key] = nextBesoin as unknown as Json;
      changed = true;
    } else if (!previous.length && nextBesoin[0]) {
      answers[key] = nextBesoin[0];
      changed = true;
    }
  } else if (!question && besoinTokens.length) {
    const raw = besoinTokens.map((token) => token.trim()).filter(Boolean);
    const merged = [...previous];
    for (const token of raw) {
      if (!merged.some((value) => sameToken(value, token))) merged.push(token);
    }
    if (merged.length !== previous.length) {
      answers.besoin = merged as unknown as Json;
      changed = true;
    }
  }

  const quantities = { ...input.customization.quantities };
  for (const id of productIds) {
    if ((quantities[id] ?? 0) < 1) {
      quantities[id] = 1;
      changed = true;
    }
  }

  if (productNames.length) {
    const note = textQuestion(input.steps);
    if (note) {
      const currentNote = answers[note.key];
      const existing = typeof currentNote === "string" ? currentNote.trim() : "";
      const missing = productNames.filter(
        (name) => !existing.toLocaleLowerCase("fr").includes(name.toLocaleLowerCase("fr")),
      );
      if (missing.length) {
        const line = `Ajouté au devis : ${missing.join(", ")}`;
        answers[note.key] = existing ? `${existing}\n${line}` : line;
        changed = true;
      }
    } else {
      const previousAdded = asStrings(answers.added);
      const merged = [...previousAdded];
      for (const name of productNames) {
        if (!merged.includes(name)) merged.push(name);
      }
      if (merged.length !== previousAdded.length) {
        answers.added = merged as unknown as Json;
        changed = true;
      }
    }
  }

  const visibleBesoin = question?.type === "multi_select" ? nextBesoin : asStrings(answers[key]);
  return {
    answers,
    customization: changed ? { ...input.customization, quantities } : input.customization,
    changed,
    focusStep: besoinGrew && focusIndex >= 0 ? focusIndex : null,
    besoin: visibleBesoin,
    productIds,
  };
}
