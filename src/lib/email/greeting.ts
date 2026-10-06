import { fill } from "@/lib/email/fill";

/** Names we must not print after « Bonjour ». They are placeholders, not a prospect. */
const PLACEHOLDER_NAMES = new Set([
  "bonjour",
  "demande commencée",
  "demande commencee",
]);

export function prospectDisplayName(raw: string | null | undefined): string {
  const name = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!name) return "";
  if (PLACEHOLDER_NAMES.has(name.toLowerCase())) return "";
  return name;
}

/** Session drafts often have no name. Never substitute the greeting itself. */
export function sessionContactName(raw: unknown): string {
  return prospectDisplayName(typeof raw === "string" ? raw : "");
}

/**
 * « Bonjour {{contact_name}}, » becomes « Bonjour bonjour, » or « Bonjour , »
 * when the name is missing. Collapse that to « Bonjour, ».
 */
export function polishProspectGreeting(text: string): string {
  return text.replace(/Bonjour\s+bonjour\b/gi, "Bonjour").replace(/Bonjour\s+,/g, "Bonjour,");
}

export function fillProspectTemplate(template: string, vars: Record<string, string>): string {
  const contact_name = prospectDisplayName(vars.contact_name);
  return polishProspectGreeting(fill(template, { ...vars, contact_name }));
}
