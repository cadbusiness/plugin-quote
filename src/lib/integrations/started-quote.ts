import { createHash } from "crypto";
import { z } from "zod";
import { parsePluginQuote, type ParsedPluginQuote } from "@/lib/integrations/plugin-quote-body";

export const STARTED_STATUS = "started";
export const STARTED_LABEL = "Commencée";
export const STARTED_REMINDER_MS = 2 * 60 * 60 * 1000;
export const STARTED_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const EMAIL_NOTICE =
  "Nous enregistrons votre adresse pour vous recontacter au sujet de cette demande.";

export const PLUGIN_CAPTURE_CONTRACT = {
  method: "POST",
  path: "/api/integrations/plugin/quotes/started",
  resume: "GET /api/integrations/plugin/quotes/started?token=",
  function: "quotebuilder_start",
  notice: EMAIL_NOTICE,
  status: STARTED_STATUS,
  statusLabel: STARTED_LABEL,
  reminder: "Un seul e-mail, 2 h après la saisie, avec ?qb_resume=",
  retentionDays: 30,
  events: ["quotebuilder_start", "quotebuilder_step", "quotebuilder_email", "quotebuilder_submit"],
  adsEvent: "quotebuilder_ads",
  checks: [
    "La mention est visible sous le champ e-mail avant la capture.",
    "Quitter un e-mail valide crée un dossier Commencée, sans e-mail dans dataLayer.",
    "L'envoi met à jour ce dossier (même externalId), sans second dossier.",
    "quotebuilder_start, quotebuilder_step, quotebuilder_email et quotebuilder_submit ne contiennent ni e-mail, ni téléphone, ni nom, ni empreinte.",
    "quotebuilder_ads ne part qu'à l'envoi, et seulement si les cookies publicitaires sont acceptés.",
    "Une seule relance, avec le lien de reprise, tant que le statut est Commencée.",
    "Un dossier Commencée de plus de 30 jours est supprimé. Un dossier envoyé ne l'est pas.",
  ],
} as const;

const PII_KEYS = new Set([
  "email",
  "phone",
  "name",
  "company",
  "sha256_email",
  "hashedEmail",
  "hashed_email",
  "contact_email",
  "contact_name",
  "contact_phone",
]);

export function hashEmailForAds(email: string) {
  let value = email.trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at > 0) {
    let local = value.slice(0, at);
    const domain = value.slice(at + 1);
    if (domain === "gmail.com" || domain === "googlemail.com") {
      local = local.split("+")[0]?.replace(/\./g, "") ?? local;
      value = `${local}@gmail.com`;
    }
  }
  return createHash("sha256").update(value).digest("hex");
}

export function anonymousEvent(name: string, params: Record<string, unknown>) {
  const out: Record<string, unknown> = { event: name };
  for (const [key, value] of Object.entries(params)) {
    if (PII_KEYS.has(key)) continue;
    if (typeof value === "string" && value.includes("@")) continue;
    out[key] = value;
  }
  return out;
}

export function resumeUrl(page: string, token: string) {
  if (!token || !page) return "";
  try {
    const url = new URL(page);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    url.searchParams.set("qb_resume", token);
    return url.toString();
  } catch {
    return "";
  }
}

export function startedReminderDue(createdAt: string, reminderSentAt: unknown, now: number) {
  if (typeof reminderSentAt === "string" && reminderSentAt) return false;
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) return false;
  return now - created >= STARTED_REMINDER_MS;
}

export function startedExpired(createdAt: string, now: number) {
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) return false;
  return now - created >= STARTED_RETENTION_MS;
}

export function parsePluginStart(
  body: unknown,
): { ok: true; quote: ParsedPluginQuote } | { ok: false; error: string; code: "invalid_email" } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "L'e-mail est requis", code: "invalid_email" };
  }
  const record = body as Record<string, unknown>;
  const contact =
    record.contact && typeof record.contact === "object" && !Array.isArray(record.contact)
      ? (record.contact as Record<string, unknown>)
      : null;
  const email = (typeof record.email === "string"
    ? record.email
    : typeof contact?.email === "string"
      ? contact.email
      : ""
  ).trim();
  if (!z.string().email().safeParse(email).success) {
    return { ok: false, error: "L'e-mail est requis", code: "invalid_email" };
  }
  const named = typeof record.name === "string" && record.name.trim().length >= 2
    ? record.name
    : typeof contact?.name === "string" && contact.name.trim().length >= 2
      ? contact.name
      : "Demande commencée";
  let full = parsePluginQuote({ ...record, email, name: named });
  if (!full.ok) {
    full = parsePluginQuote({ ...record, email, name: named, need: "Demande commencée" });
  }
  if (!full.ok) return { ok: false, error: "L'e-mail est requis", code: "invalid_email" };
  return { ok: true, quote: { ...full.quote, email, consentAds: false } };
}
