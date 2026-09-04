import type { QuestionOptions, QuestionType, ScreenType } from "@/lib/wizard/types";

export type FunnelPreviewMode = "form" | "chat" | "catalog";

export const SCREEN_LABEL: Record<ScreenType, string> = {
  questions: "Questions",
  suggestions: "Catalogue",
  customize: "Options",
  contact: "Identité",
};

export const QUESTION_LABEL: Record<QuestionType, string> = {
  visual_choice: "Choix visuel",
  number: "Mesure",
  select: "Liste",
  multi_select: "Choix multiple",
  text: "Texte",
  file: "Fichier",
};

export const SCREEN_ADD: { type: ScreenType; label: string; hint: string }[] = [
  { type: "questions", label: "Questions", hint: "Écran de brief" },
  { type: "suggestions", label: "Catalogue", hint: "Produits recommandés" },
  { type: "customize", label: "Options", hint: "Quantités et variantes" },
  { type: "contact", label: "Identité", hint: "Nom, email, société" },
];

export const QUESTION_ADD: { type: QuestionType; label: string; hint: string }[] = [
  { type: "visual_choice", label: "Choix visuel", hint: "Cartes à cliquer" },
  { type: "number", label: "Mesure", hint: "Surface, hauteur, charge" },
  { type: "select", label: "Liste", hint: "Une seule option" },
  { type: "multi_select", label: "Choix multiple", hint: "Plusieurs options" },
  { type: "text", label: "Texte", hint: "Réponse libre" },
  { type: "file", label: "Fichier", hint: "Plan ou photo" },
];

export function newKey(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultStepCopy(type: ScreenType) {
  if (type === "suggestions") {
    return { title: "Solutions recommandées", subtitle: "Configurations adaptées à votre brief" };
  }
  if (type === "customize") {
    return { title: "Personnalisation", subtitle: "Quantités, options et précisions" };
  }
  if (type === "contact") {
    return { title: "Vos coordonnées", subtitle: "Recevez le récapitulatif de votre projet" };
  }
  return { title: "Nouvelle question", subtitle: "Précisez le besoin" };
}

export function defaultQuestion(type: QuestionType, sortOrder: number) {
  const options = defaultOptions(type);
  return {
    key: newKey(type),
    label: QUESTION_LABEL[type],
    help_text: null as string | null,
    type,
    required: true,
    sort_order: sortOrder,
    options,
  };
}

export function defaultOptions(type: QuestionType): QuestionOptions {
  if (type === "visual_choice" || type === "select" || type === "multi_select") {
    return {
      choices: [
        { value: "a", label: "Option A" },
        { value: "b", label: "Option B" },
      ],
    };
  }
  if (type === "number") {
    return { min: 0, max: 10000, step: 1, unit: "", placeholder: "0" };
  }
  if (type === "text") {
    return { placeholder: "Votre réponse" };
  }
  return {};
}

export function isScreenType(value: string): value is ScreenType {
  return value === "questions" || value === "suggestions" || value === "customize" || value === "contact";
}

export function isQuestionType(value: string): value is QuestionType {
  return (
    value === "visual_choice" ||
    value === "number" ||
    value === "select" ||
    value === "multi_select" ||
    value === "text" ||
    value === "file"
  );
}
