import { z } from "zod";
import type { Answers, WizardQuestion, WizardStep } from "@/lib/wizard/types";

function questionSchema(question: WizardQuestion): z.ZodTypeAny {
  const opts = question.options ?? {};
  let schema: z.ZodTypeAny;

  switch (question.type) {
    case "number": {
      let num = z.coerce.number();
      if (typeof opts.min === "number") num = num.min(opts.min);
      if (typeof opts.max === "number") num = num.max(opts.max);
      schema = num;
      break;
    }
    case "multi_select":
      schema = z.array(z.string());
      if (question.required) schema = (schema as z.ZodArray<z.ZodString>).min(1);
      break;
    case "file":
      schema = z.string();
      break;
    default:
      schema = z.string().min(question.required ? 1 : 0);
  }

  return question.required ? schema : schema.optional().nullable();
}

export function stepSchema(step: WizardStep) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const q of step.questions) {
    shape[q.key] = questionSchema(q);
  }
  return z.object(shape);
}

export function validateStep(step: WizardStep, answers: Answers) {
  if (step.screenType !== "questions") return { ok: true as const, errors: {} };
  const parsed = stepSchema(step).safeParse(answers);
  if (parsed.success) return { ok: true as const, errors: {} };
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false as const, errors };
}

export const contactSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  company: z.string().optional(),
});
