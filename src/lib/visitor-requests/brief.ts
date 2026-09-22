import type { Json } from "@/lib/db/database.types";
import { fill } from "@/lib/email/fill";
import { displayName, type VisitorContact, type VisitorLine } from "@/lib/visitor-requests/types";

/** Addresses that must never receive mail from this path (Quickly contact stays silent). */
const SILENT_RECIPIENTS = new Set(["info@quickly-int.com"]);

export function salesRecipientDecision(
  salesEmail: string | null | undefined,
  contactEmail: string | null,
): { ok: true; to: string } | { ok: false; reason: "missing" | "silent" | "contact" | "invalid" } {
  const to = salesEmail?.trim().toLowerCase() ?? "";
  if (!to) return { ok: false, reason: "missing" };
  if (!to.includes("@") || to.length > 200) return { ok: false, reason: "invalid" };
  if (SILENT_RECIPIENTS.has(to)) return { ok: false, reason: "silent" };
  if (contactEmail && to === contactEmail.trim().toLowerCase()) return { ok: false, reason: "contact" };
  return { ok: true, to };
}

function formatAnswers(answers: Record<string, Json>) {
  const lines = Object.entries(answers).map(([key, value]) => {
    const rendered = Array.isArray(value) ? value.join(", ") : String(value ?? "-");
    return `- ${key}: ${rendered}`;
  });
  return lines.join("\n");
}

export function buildSalesBrief(input: {
  template: { subject: string; body: string } | null;
  salesName: string | null;
  contact: VisitorContact;
  lines: VisitorLine[];
  answers: Record<string, Json>;
}) {
  const vars: Record<string, string> = {
    contact_name: displayName(input.contact),
    contact_email: input.contact.email ?? "",
    contact_company: input.contact.company ?? "",
    contact_phone: input.contact.phone ?? "",
    score: "",
    score_label: "",
    sales_name: input.salesName ?? "",
    answers_text: formatAnswers(input.answers),
    suggestion_name: "Demande catalogue",
    price_range: "Sur devis",
    suivi_url: "",
    membres_url: "",
    pin: "",
  };
  const subject = input.template
    ? fill(input.template.subject, vars)
    : `[QuoteBuilder] Nouvelle demande — ${vars.contact_name}`;
  const base = input.template
    ? fill(input.template.body, vars)
    : `Nouvelle demande.\n\nProspect : ${vars.contact_name}`;
  const phoneLine = input.contact.phone ? `Téléphone : ${input.contact.phone}` : "";
  const lineBlock = input.lines.length
    ? `Lignes :\n${input.lines.map((line) => `- ${line.name} × ${line.quantity}`).join("\n")}`
    : "";
  const text = [base, phoneLine, lineBlock].filter(Boolean).join("\n\n");
  return { subject, text };
}
