import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";
import type { Tables } from "@/lib/db/database.types";
import type { Answers } from "@/lib/wizard/types";

function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

function formatAnswers(answers: Answers) {
  return Object.entries(answers)
    .map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(", ") : String(value ?? "—")}`)
    .join("\n");
}

function formatPrice(min: number | null, max: number | null) {
  if (min == null && max == null) return "Sur devis";
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  return fmt((min ?? max) as number);
}

export async function sendQuoteEmails(input: {
  organization: Tables<"organizations">;
  quote: Tables<"quotes">;
  answers: Answers;
  suggestionName: string;
  priceMin: number | null;
  priceMax: number | null;
  pdf: Buffer | null;
  suiviUrl?: string;
  pin?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("RESEND_API_KEY manquante — emails non envoyés");
    return;
  }

  const supabase = createServiceClient();
  const { data: templates } = await supabase
    .from("email_templates")
    .select("*")
    .eq("organization_id", input.organization.id);

  const vars = {
    contact_name: input.quote.contact_name,
    contact_email: input.quote.contact_email,
    contact_company: input.quote.contact_company ?? "",
    score: String(input.quote.score ?? ""),
    score_label: input.quote.score_label ?? "",
    sales_name: input.organization.sales_name ?? "",
    answers_text: formatAnswers(input.answers),
    suggestion_name: input.suggestionName,
    price_range: formatPrice(input.priceMin, input.priceMax),
    suivi_url: input.suiviUrl ?? "",
    pin: input.pin ?? "",
  };

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "QuoteBuilder <devis@localhost>";
  const prospect = templates?.find((t) => t.kind === "prospect_confirm");
  const sales = templates?.find((t) => t.kind === "sales_brief");
  const attachments = input.pdf
    ? [{ filename: "recapitulatif.pdf", content: input.pdf }]
    : [];

  if (prospect) {
    await resend.emails.send({
      from,
      to: input.quote.contact_email,
      subject: fill(prospect.subject, vars),
      text: fill(prospect.body, vars),
      attachments,
    });
  }

  if (sales && input.organization.sales_email) {
    await resend.emails.send({
      from,
      to: input.organization.sales_email,
      subject: fill(sales.subject, vars),
      text: fill(sales.body, vars),
      attachments,
    });
  }

  if (prospect) {
    await supabase.from("quote_activities").insert({
      organization_id: input.organization.id,
      quote_id: input.quote.id,
      type: "email_sent",
      payload: { template_kind: "prospect_confirm" },
    });
  }
  if (sales && input.organization.sales_email) {
    await supabase.from("quote_activities").insert({
      organization_id: input.organization.id,
      quote_id: input.quote.id,
      type: "email_sent",
      payload: { template_kind: "sales_brief" },
    });
  }
}

export async function sendTemplateEmail(input: {
  to: string;
  subject: string;
  body: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("RESEND_API_KEY manquante — email non envoyé");
    return;
  }
  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "QuoteBuilder <devis@localhost>";
  await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.body,
    attachments: input.attachments,
  });
}

export { fill };
