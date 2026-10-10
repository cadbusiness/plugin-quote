import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";
import type { Tables } from "@/lib/db/database.types";
import type { Answers } from "@/lib/wizard/types";
import { fill } from "@/lib/email/fill";
import { fillProspectTemplate, prospectDisplayName } from "@/lib/email/greeting";
import { formatPrice } from "@/lib/format";

function formatAnswers(answers: Answers) {
  return Object.entries(answers)
    .map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(", ") : String(value ?? "-")}`)
    .join("\n");
}

export async function sendQuoteEmails(input: {
  organization: Tables<"organizations">;
  quote: Tables<"quotes">;
  answers: Answers;
  suggestionName: string;
  priceMin: number | null;
  priceMax: number | null;
  currency?: string | null;
  pdf: Buffer | null;
  suiviUrl?: string;
  pin?: string;
  membresUrl?: string;
  /** Funnel submissions email the prospect. Plugin inbound leaves this false. */
  includeProspect?: boolean;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("RESEND_API_KEY manquante, emails non envoyés");
    return;
  }

  const supabase = createServiceClient();
  const { data: templates } = await supabase
    .from("email_templates")
    .select("*")
    .eq("organization_id", input.organization.id);

  const contactEmail = input.quote.contact_email?.trim() ?? "";
  const vars = {
    contact_name: prospectDisplayName(input.quote.contact_name ?? ""),
    contact_email: contactEmail,
    contact_company: input.quote.contact_company ?? "",
    score: String(input.quote.score ?? ""),
    score_label: input.quote.score_label ?? "",
    sales_name: input.organization.sales_name ?? "",
    answers_text: formatAnswers(input.answers),
    suggestion_name: input.suggestionName,
    price_range: formatPrice(input.priceMin, input.priceMax, input.currency),
    suivi_url: input.suiviUrl ?? "",
    membres_url: input.membresUrl ?? "",
    pin: input.pin ?? "",
  };

  const resend = new Resend(apiKey);
  const from = senderAddress();
  const includeProspect = input.includeProspect !== false;
  const prospect = includeProspect ? templates?.find((t) => t.kind === "prospect_confirm") : undefined;
  const sales = templates?.find((t) => t.kind === "sales_brief");
  const attachments = input.pdf
    ? [{ filename: "recapitulatif.pdf", content: input.pdf }]
    : [];

  let prospectSent = false;
  if (prospect && contactEmail) {
    const { error } = await resend.emails.send({
      from,
      to: contactEmail,
      replyTo: input.organization.sales_email ?? undefined,
      subject: fillProspectTemplate(prospect.subject, vars),
      text: fillProspectTemplate(prospect.body, vars),
      attachments,
    });
    if (error) console.error("Prospect confirmation email failed", error.message);
    prospectSent = !error;
  }

  let salesSent = false;
  if (sales && input.organization.sales_email) {
    const { error } = await resend.emails.send({
      from,
      to: input.organization.sales_email,
      replyTo: contactEmail ?? undefined,
      subject: fill(sales.subject, vars),
      text: fill(sales.body, vars),
      attachments,
    });
    if (error) console.error("Sales brief email failed", error.message);
    salesSent = !error;
  }

  if (prospectSent) {
    await supabase.from("quote_activities").insert({
      organization_id: input.organization.id,
      quote_id: input.quote.id,
      type: "email_sent",
      payload: { template_kind: "prospect_confirm" },
    });
  }
  if (salesSent) {
    await supabase.from("quote_activities").insert({
      organization_id: input.organization.id,
      quote_id: input.quote.id,
      type: "email_sent",
      payload: { template_kind: "sales_brief" },
    });
  }
}

function senderAddress() {
  const from = process.env.RESEND_FROM?.trim();
  if (from) return from;
  console.error("RESEND_FROM manquante : les emails partent de devis@localhost et seront rejetés");
  return "QuoteBuilder <devis@localhost>";
}

export async function sendTemplateEmail(input: {
  to: string;
  subject: string;
  body: string;
  replyTo?: string | null;
  attachments?: { filename: string; content: Buffer }[];
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("RESEND_API_KEY manquante, email non envoyé");
    return;
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: senderAddress(),
    to: input.to,
    replyTo: input.replyTo ?? undefined,
    subject: input.subject,
    text: input.body,
    attachments: input.attachments,
  });
  if (error) throw new Error(error.message);
}

export async function sendHtmlEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("RESEND_API_KEY manquante, email non envoyé");
    return { skipped: true as const };
  }
  const resend = new Resend(apiKey);
  const from = input.from || senderAddress();
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  });
  if (error) throw new Error(error.message);
  return { skipped: false as const };
}

export { fill };
