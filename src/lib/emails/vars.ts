import type { Answers } from "@/lib/wizard/types";
import type { SegmentContact } from "@/lib/segments/types";
import { fill } from "@/lib/email/fill";

function asRecord(value: unknown): Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Answers;
}

export function formatAnswersText(answers: Answers) {
  return Object.entries(answers)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value ?? "-")}`)
    .join("\n");
}

export function campaignVars(
  contact: Pick<SegmentContact, "contactName" | "contactEmail" | "contactCompany" | "scoreLabel" | "answers">,
  extras: { suiviUrl?: string; orgName?: string; salesName?: string } = {},
): Record<string, string> {
  return {
    contact_name: contact.contactName,
    contact_email: contact.contactEmail,
    contact_company: contact.contactCompany ?? "",
    score_label: contact.scoreLabel ?? "",
    answers_text: formatAnswersText(asRecord(contact.answers)),
    suivi_url: extras.suiviUrl ?? "",
    org_name: extras.orgName ?? "",
    sales_name: extras.salesName ?? "",
  };
}

export function applyPersonalization(value: string, vars: Record<string, string>, mode: "personal" | "group") {
  if (mode === "group") {
    return fill(value, {
      contact_name: "vous",
      contact_email: "",
      contact_company: "",
      score_label: "",
      answers_text: "",
      suivi_url: vars.suivi_url ?? "",
      org_name: vars.org_name ?? "",
      sales_name: vars.sales_name ?? "",
    });
  }
  return fill(value, vars);
}
