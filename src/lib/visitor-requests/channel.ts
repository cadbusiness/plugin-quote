import type { Json } from "@/lib/db/database.types";
import { channelOf, type VisitorContact } from "@/lib/visitor-requests/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactPatch = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
};

export function normalizeEmail(value: unknown): string | null | "invalid" {
  if (value == null) return null;
  if (typeof value !== "string") return "invalid";
  const email = value.trim().toLowerCase();
  if (!email) return null;
  if (email.length > 200 || !EMAIL_RE.test(email)) return "invalid";
  return email;
}

export function normalizePhone(value: unknown): string | null | "invalid" {
  if (value == null) return null;
  if (typeof value !== "string") return "invalid";
  const trimmed = value.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return "invalid";
  return `${trimmed.startsWith("+") ? "+" : ""}${digits}`;
}

function normalizeLabel(value: unknown, max: number): string | null | "invalid" {
  if (value == null) return null;
  if (typeof value !== "string") return "invalid";
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

/** Keep a channel already given when the visitor omits it. Reject wiping the last one. */
export function mergeContact(
  current: VisitorContact,
  patch: ContactPatch,
): { ok: true; contact: VisitorContact } | { ok: false; message: string } {
  const email = patch.email === undefined ? current.email : normalizeEmail(patch.email);
  if (email === "invalid") return { ok: false, message: "Email invalide" };
  const phone = patch.phone === undefined ? current.phone : normalizePhone(patch.phone);
  if (phone === "invalid") return { ok: false, message: "Téléphone invalide" };
  const name = patch.name === undefined ? current.name : normalizeLabel(patch.name, 120);
  if (name === "invalid") return { ok: false, message: "Nom invalide" };
  const company = patch.company === undefined ? current.company : normalizeLabel(patch.company, 160);
  if (company === "invalid") return { ok: false, message: "Société invalide" };

  const next: VisitorContact = {
    name,
    email,
    phone,
    company,
  };
  if (channelOf(current) && !channelOf(next)) {
    return { ok: false, message: "Le canal de contact déjà indiqué reste requis" };
  }
  return { ok: true, contact: next };
}

export function sanitizeAnswers(value: unknown): { ok: true; answers: Record<string, Json> } | { ok: false } {
  if (value == null) return { ok: true, answers: {} };
  if (typeof value !== "object" || Array.isArray(value)) return { ok: false };
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 40) return { ok: false };
  const answers: Record<string, Json> = {};
  for (const [key, raw] of entries) {
    if (!/^[a-zA-Z0-9_]{1,40}$/.test(key)) return { ok: false };
    if (typeof raw === "string") {
      if (raw.length > 2000) return { ok: false };
      answers[key] = raw;
      continue;
    }
    if (typeof raw === "number") {
      if (!Number.isFinite(raw)) return { ok: false };
      answers[key] = raw;
      continue;
    }
    if (raw === null || typeof raw === "boolean") {
      answers[key] = raw;
      continue;
    }
    if (Array.isArray(raw) && raw.every((item) => typeof item === "string" && item.length <= 200) && raw.length <= 20) {
      answers[key] = raw;
      continue;
    }
    return { ok: false };
  }
  return { ok: true, answers };
}
