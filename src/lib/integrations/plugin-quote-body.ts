import { z } from "zod";
import type { Answers } from "@/lib/wizard/types";

export const PLUGIN_QUOTE_EXAMPLE = {
  need: "Rack 4 niveaux, 2,5 m, charge à préciser",
  name: "Marie Dupont",
  email: "marie@exemple.com",
  phone: "+32 470 00 00 00",
  company: "Entrepôt Nord",
  externalId: "wp-123",
} as const;

const emailSchema = z.string().email();

function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function fromContact(body: Record<string, unknown>, key: string): string {
  const contact = body.contact;
  if (!contact || typeof contact !== "object") return "";
  return text((contact as Record<string, unknown>)[key]);
}

function pick(body: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = text(body[key]);
    if (value) return value;
  }
  for (const key of keys) {
    const value = fromContact(body, key);
    if (value) return value;
  }
  return "";
}

function extraAnswers(body: Record<string, unknown>): Answers {
  const source = body.answers;
  if (!source || typeof source !== "object" || Array.isArray(source)) return {};
  const answers: Answers = {};
  for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
    if (!key || key === "quote_mode" || key === "external_id") continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      answers[key] = value;
    }
  }
  return answers;
}

export type ParsedPluginQuote = {
  need: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  externalId: string;
  page: string;
  answers: Answers;
};

export function parsePluginQuote(
  body: unknown,
): { ok: true; quote: ParsedPluginQuote } | { ok: false; error: string; expected: typeof PLUGIN_QUOTE_EXAMPLE } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Demande invalide", expected: PLUGIN_QUOTE_EXAMPLE };
  }
  const record = body as Record<string, unknown>;
  const need = pick(record, ["need", "message", "brief", "request", "demande"]);
  const name = pick(record, ["name", "contactName", "contact_name"]);
  const email = pick(record, ["email", "contactEmail", "contact_email"]);
  const phone = pick(record, ["phone", "contactPhone", "contact_phone"]);
  const company = pick(record, ["company", "contactCompany", "contact_company"]);
  const externalId = pick(record, ["externalId", "external_id", "wpId", "wp_id"]).slice(0, 120);
  const page = pick(record, ["page", "url", "landingPath"]).slice(0, 300);

  if (need.length < 2) {
    return { ok: false, error: "Le besoin est requis", expected: PLUGIN_QUOTE_EXAMPLE };
  }
  if (name.length < 2) {
    return { ok: false, error: "Le nom est requis", expected: PLUGIN_QUOTE_EXAMPLE };
  }
  if (!emailSchema.safeParse(email).success) {
    return { ok: false, error: "L'e-mail est requis", expected: PLUGIN_QUOTE_EXAMPLE };
  }

  return {
    ok: true,
    quote: {
      need,
      name,
      email,
      phone,
      company,
      externalId,
      page,
      answers: extraAnswers(record),
    },
  };
}
