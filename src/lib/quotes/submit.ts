import { createServiceClient } from "@/lib/supabase/service";
import { scoreQuote } from "@/lib/quotes/score";
import { evaluateSuggestions, mergeAnswers } from "@/lib/wizard/suggestions";
import { mapProductRow } from "@/lib/wizard/definition";
import { sendQuoteEmails } from "@/lib/email/send";
import { dispatchQuoteWebhooks } from "@/lib/webhooks/dispatch";
import { renderQuotePdf } from "@/lib/pdf/render";
import type { ContactPayload, Customization } from "@/lib/wizard/types";
import type { Json } from "@/lib/db/database.types";
import { createProspectAccess } from "@/lib/prospect/access";

export async function submitQuote(input: {
  sessionId: string;
  token: string;
  contact: ContactPayload;
}) {
  const supabase = createServiceClient();

  const { data: session, error: sessionError } = await supabase
    .from("quote_sessions")
    .select("*")
    .eq("id", input.sessionId)
    .eq("token", input.token)
    .maybeSingle();
  if (sessionError || !session) {
    throw new Error("Session introuvable");
  }
  if (session.submitted_quote_id) {
    return { quoteId: session.submitted_quote_id, alreadySubmitted: true };
  }

  const answers = mergeAnswers(
    (session.answers ?? {}) as Record<string, Json>,
    (session.extracted_params ?? {}) as Record<string, Json>,
  );
  const { score, label } = scoreQuote(answers);

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", session.organization_id)
    .single();
  const { data: configurator } = await supabase
    .from("configurators")
    .select("*")
    .eq("id", session.configurator_id)
    .single();
  const { data: productRows } = await supabase
    .from("products")
    .select("*")
    .eq("configurator_id", session.configurator_id);
  const { data: rules } = await supabase
    .from("suggestion_rules")
    .select("*")
    .eq("configurator_id", session.configurator_id);

  const products = (productRows ?? []).map(mapProductRow);
  const suggestions = evaluateSuggestions(answers, rules ?? [], products);
  const selected =
    suggestions.find((s) => s.id === session.selected_suggestion_id) ?? suggestions[0];
  const customization = (session.customization ?? {
    quantities: {},
    options: {},
  }) as Customization;

  const { data: defaultStatus } = await supabase
    .from("quote_statuses")
    .select("*")
    .eq("organization_id", session.organization_id)
    .eq("is_default", true)
    .maybeSingle();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      organization_id: session.organization_id,
      configurator_id: session.configurator_id,
      session_id: session.id,
      contact_name: input.contact.name,
      contact_email: input.contact.email,
      contact_phone: input.contact.phone ?? null,
      contact_company: input.contact.company ?? null,
      answers,
      extracted_params: session.extracted_params,
      score,
      score_label: label,
      status: defaultStatus?.slug ?? "new",
      status_id: defaultStatus?.id ?? null,
      utm_source: session.utm_source,
      utm_medium: session.utm_medium,
      utm_campaign: session.utm_campaign,
      utm_content: session.utm_content,
      utm_term: session.utm_term,
      referrer: session.referrer,
    })
    .select("*")
    .single();
  if (quoteError || !quote) {
    throw new Error(quoteError?.message ?? "Impossible de créer le devis");
  }

  await supabase.from("quote_activities").insert({
    organization_id: session.organization_id,
    quote_id: quote.id,
    type: "submitted",
    payload: { score, label },
  });
  await supabase.from("analytics_events").insert({
    organization_id: session.organization_id,
    configurator_id: session.configurator_id,
    session_id: session.id,
    event_type: "quotebuilder_submitted",
  });

  const items = (selected?.products ?? []).map((product) => ({
    organization_id: session.organization_id,
    quote_id: quote.id,
    product_id: product.id,
    name: product.name,
    quantity: customization.quantities[product.id] ?? 1,
    options: customization.options[product.id] ?? {},
    price_min: product.priceMin,
    price_max: product.priceMax,
  }));
  if (items.length) {
    await supabase.from("quote_items").insert(items);
  }

  await supabase
    .from("quote_files")
    .update({ quote_id: quote.id })
    .eq("session_id", session.id);

  await supabase
    .from("quote_sessions")
    .update({ submitted_quote_id: quote.id })
    .eq("id", session.id);

  const { data: files } = await supabase
    .from("quote_files")
    .select("*")
    .eq("quote_id", quote.id);

  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await renderQuotePdf({
      organization: org!,
      configurator: configurator!,
      quote,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        options: item.options as Record<string, string>,
        priceMin: item.price_min,
        priceMax: item.price_max,
      })),
      answers,
      suggestionName: selected?.headline ?? selected?.name ?? "Configuration",
      priceMin: selected?.priceMin ?? null,
      priceMax: selected?.priceMax ?? null,
    });
  } catch (error) {
    console.error("PDF generation failed", error);
  }

  let access: { url: string; pin: string } | null = null;
  try {
    access = await createProspectAccess({
      organizationId: session.organization_id,
      quoteId: quote.id,
    });
  } catch (error) {
    console.error("Prospect access failed", error);
  }

  try {
    await sendQuoteEmails({
      organization: org!,
      quote,
      answers,
      suggestionName: selected?.headline ?? selected?.name ?? "Configuration",
      priceMin: selected?.priceMin ?? null,
      priceMax: selected?.priceMax ?? null,
      pdf: pdfBuffer,
      suiviUrl: access?.url,
      pin: access?.pin,
    });
  } catch (error) {
    console.error("Email send failed", error);
  }

  try {
    await dispatchQuoteWebhooks({
      organizationId: session.organization_id,
      quote,
      answers,
      items,
      files: files ?? [],
      suggestion: selected
        ? { id: selected.id, name: selected.name, headline: selected.headline }
        : null,
    });
  } catch (error) {
    console.error("Webhook dispatch failed", error);
  }

  return { quoteId: quote.id, alreadySubmitted: false, score, label, suiviUrl: access?.url, pin: access?.pin };
}
