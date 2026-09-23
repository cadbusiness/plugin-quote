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

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => text(item)).filter((item) => item.length > 0).slice(0, 12);
  }
  const single = text(value);
  if (!single) return [];
  return single.split(/[,;]+/).map((item) => item.trim()).filter(Boolean).slice(0, 12);
}

function scalarMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const clean = key.replace(/[^\w.-]/g, "").slice(0, 40);
    const item = text(raw).slice(0, 200);
    if (clean && item) out[clean] = item;
  }
  return out;
}

function productLines(value: unknown): PluginQuoteLine[] {
  if (!Array.isArray(value)) return [];
  const lines: PluginQuoteLine[] = [];
  for (const row of value.slice(0, 40)) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const name = text(item.name || item.title).slice(0, 180);
    const id = text(item.id || item.externalId || item.sku).slice(0, 80);
    if (!name && !id) continue;
    lines.push({
      id,
      name: name || id,
      qty: Math.max(1, Number(item.qty ?? item.quantity ?? 1) || 1),
      sku: text(item.sku).slice(0, 80),
      variation: text(item.variation || item.variant).slice(0, 240),
      note: text(item.note).slice(0, 240),
    });
  }
  return lines;
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

export type PluginQuoteLine = {
  id: string;
  name: string;
  qty: number;
  sku: string;
  variation: string;
  note: string;
};

export type ParsedPluginQuote = {
  need: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  externalId: string;
  page: string;
  city: string;
  needs: string[];
  space: Record<string, string>;
  products: PluginQuoteLine[];
  answers: Answers;
  /** True only when the visitor accepted advertising cookies. Never implied. */
  consentAds: boolean;
};

export function parsePluginQuote(
  body: unknown,
): { ok: true; quote: ParsedPluginQuote } | { ok: false; error: string; expected: typeof PLUGIN_QUOTE_EXAMPLE } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Demande invalide", expected: PLUGIN_QUOTE_EXAMPLE };
  }
  const record = body as Record<string, unknown>;
  const need = pick(record, ["need", "message", "brief", "request", "demande", "description"]);
  const name = pick(record, ["name", "contactName", "contact_name"]);
  const email = pick(record, ["email", "contactEmail", "contact_email"]);
  const phone = pick(record, ["phone", "contactPhone", "contact_phone"]);
  const company = pick(record, ["company", "contactCompany", "contact_company"]);
  const externalId = pick(record, ["externalId", "external_id", "wpId", "wp_id"]).slice(0, 120);
  const page = pick(record, ["page", "url", "landingPath"]).slice(0, 300);
  const city = pick(record, ["city", "ville"]).slice(0, 120);
  const needs = stringList(record.needs ?? record.besoins ?? record.needIds);
  const space = {
    ...scalarMap(record.space ?? record.espace),
  };
  for (const key of ["length", "width", "height", "city"] as const) {
    const value = key === "city" ? city : pick(record, [key]);
    if (value && !space[key]) space[key] = value.slice(0, 80);
  }
  const products = productLines(record.products ?? record.produits ?? record.lines ?? record.items);
  const consentAds =
    record.consentAds === true ||
    record.consentAds === 1 ||
    record.consentAds === "1" ||
    record.consent_ads === true ||
    record.consent_ads === 1 ||
    record.consent_ads === "1";

  const needText = need.length >= 2 ? need : needs.join(" · ");
  if (needText.length < 2) {
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
      need: needText,
      name,
      email,
      phone,
      company,
      externalId,
      page,
      city,
      needs,
      space,
      products,
      answers: extraAnswers(record),
      consentAds,
    },
  };
}
