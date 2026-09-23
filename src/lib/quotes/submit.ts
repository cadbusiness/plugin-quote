import { createServiceClient } from "@/lib/supabase/service";
import { scoreQuote } from "@/lib/quotes/score";
import { evaluateSuggestions, mergeAnswers } from "@/lib/wizard/suggestions";
import { mapProductRow } from "@/lib/wizard/definition";
import { sendQuoteEmails } from "@/lib/email/send";
import { cancelSessionRuns, startWorkflows } from "@/lib/workflows/engine";
import { dispatchQuoteWebhooks } from "@/lib/webhooks/dispatch";
import { renderQuotePdf } from "@/lib/pdf/render";
import type { ContactPayload, Customization } from "@/lib/wizard/types";
import type { Json, Tables } from "@/lib/db/database.types";
import { createProspectAccess } from "@/lib/prospect/access";
import { publishedMemberSpaceUrl } from "@/lib/members/public";
import { hashEmailForAds } from "@/lib/integrations/started-quote";

export async function submitQuote(input: {
  sessionId: string;
  token: string;
  contact: ContactPayload;
  /** Completes a dossier already stored as Commencée. Does not insert a second row. */
  promoteQuoteId?: string;
  /** Hashed e-mail may go to Google Ads only when this is true. Never to Analytics. */
  consentAds?: boolean;
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
  const storedCustomization = (session.customization ?? {}) as Partial<Customization>;
  const customization: Customization = {
    quantities: storedCustomization.quantities ?? {},
    options: storedCustomization.options ?? {},
    notes: storedCustomization.notes,
    storefrontLines: storedCustomization.storefrontLines,
  };

  const { data: defaultStatus } = await supabase
    .from("quote_statuses")
    .select("*")
    .eq("organization_id", session.organization_id)
    .eq("is_default", true)
    .maybeSingle();

  const quoteFields = {
    contact_name: input.contact.name,
    contact_email: input.contact.email,
    contact_phone: input.contact.phone ?? null,
    contact_company: input.contact.company ?? null,
    consent_marketing: Boolean(input.contact.consentMarketing),
    answers,
    extracted_params: session.extracted_params,
    score,
    score_label: label,
    status: defaultStatus?.slug ?? "new",
    status_id: defaultStatus?.id ?? null,
    session_id: session.id,
  };
  let promoted = false;
  let quote: Tables<"quotes">;
  if (input.promoteQuoteId) {
    const { data: prior } = await supabase
      .from("quotes")
      .select("id, status")
      .eq("id", input.promoteQuoteId)
      .eq("organization_id", session.organization_id)
      .maybeSingle();
    if (!prior || prior.status !== "started") {
      throw new Error("La demande commencée est introuvable");
    }
    promoted = true;
    const { data: updated, error: updateError } = await supabase
      .from("quotes")
      .update(quoteFields)
      .eq("id", prior.id)
      .eq("status", "started")
      .select("*")
      .single();
    if (updateError || !updated) {
      throw new Error(updateError?.message ?? "Impossible de compléter la demande");
    }
    quote = updated;
  } else {
    const { data: inserted, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        organization_id: session.organization_id,
        configurator_id: session.configurator_id,
        ...quoteFields,
        utm_source: session.utm_source,
        utm_medium: session.utm_medium,
        utm_campaign: session.utm_campaign,
        utm_content: session.utm_content,
        utm_term: session.utm_term,
        referrer: session.referrer,
        gclid: session.gclid,
        gbraid: session.gbraid,
        wbraid: session.wbraid,
      })
      .select("*")
      .single();
    if (quoteError || !inserted) {
      throw new Error(quoteError?.message ?? "Impossible de créer le devis");
    }
    quote = inserted;
  }

  try {
  if (promoted) {
    await supabase.from("quote_items").delete().eq("quote_id", quote.id);
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

  try {
    const { reportAdsConversion } = await import("@/lib/ads/sync");
    await reportAdsConversion({
      supabase,
      organizationId: session.organization_id,
      quoteId: quote.id,
      kind: "quote",
      gclid: session.gclid,
      gbraid: session.gbraid,
      wbraid: session.wbraid,
      occurredAt: quote.created_at,
      hashedEmail: input.consentAds ? hashEmailForAds(input.contact.email) : undefined,
    });
  } catch (error) {
    console.error("Ads conversion upload failed", error);
  }

  const fromQuantities = products.filter((product) => (customization.quantities[product.id] ?? 0) > 0);
  const fromSuggestion = selected?.products ?? [];
  const seen = new Set<string>();
  const catalogItems = [...fromQuantities, ...fromSuggestion].filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
  const items = [
    ...catalogItems.map((product) => ({
      organization_id: session.organization_id,
      quote_id: quote.id,
      product_id: product.id,
      name: product.name,
      quantity: customization.quantities[product.id] ?? 1,
      options: customization.options[product.id] ?? {},
      price_min: product.priceMin,
      price_max: product.priceMax,
    })),
    ...(customization.storefrontLines ?? []).map((line) => ({
      organization_id: session.organization_id,
      quote_id: quote.id,
      product_id: null as string | null,
      name: line.variation ? `${line.name} (${line.variation})` : line.name,
      quantity: line.quantity,
      options: line.options ?? {},
      price_min: null as number | null,
      price_max: null as number | null,
    })),
  ];
  const need = String(answers.need ?? answers.besoin ?? "").trim();
  const requestName =
    selected?.headline ??
    selected?.name ??
    (catalogItems.length ? "Demande catalogue" : need ? need.slice(0, 80) : "Configuration");
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
      suggestionName: requestName,
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
  const membresUrl = (await publishedMemberSpaceUrl(supabase, session.organization_id)) ?? undefined;

  try {
    await cancelSessionRuns(session.organization_id, session.id);
    const started = await startWorkflows({
      triggerType: "quote.submitted",
      organizationId: session.organization_id,
      subjectType: "quote",
      subjectId: quote.id,
      suiviUrl: access?.url,
      pin: access?.pin,
      suggestionName: requestName,
      priceMin: selected?.priceMin ?? null,
      priceMax: selected?.priceMax ?? null,
      pdf: pdfBuffer,
    });
    if (started.started === 0) {
      await sendQuoteEmails({
        organization: org!,
        quote,
        answers,
        suggestionName: requestName,
        priceMin: selected?.priceMin ?? null,
        priceMax: selected?.priceMax ?? null,
        pdf: pdfBuffer,
        suiviUrl: access?.url,
        pin: access?.pin,
        membresUrl,
      });
    }
  } catch (error) {
    console.error("Workflow start failed", error);
    try {
      await sendQuoteEmails({
        organization: org!,
        quote,
        answers,
        suggestionName: requestName,
        priceMin: selected?.priceMin ?? null,
        priceMax: selected?.priceMax ?? null,
        pdf: pdfBuffer,
        suiviUrl: access?.url,
        pin: access?.pin,
        membresUrl,
      });
    } catch (emailError) {
      console.error("Email send failed", emailError);
    }
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
  } catch (error) {
    await supabase.from("quote_sessions").update({ submitted_quote_id: null }).eq("id", session.id);
    if (promoted) {
      const { data: startedStatus } = await supabase
        .from("quote_statuses")
        .select("id")
        .eq("organization_id", session.organization_id)
        .eq("slug", "started")
        .limit(1)
        .maybeSingle();
      const { error: restoreError } = await supabase
        .from("quotes")
        .update({ status: "started", status_id: startedStatus?.id ?? null })
        .eq("id", quote.id);
      if (restoreError) console.error("Quote rollback failed", restoreError);
    } else {
      const { error: deleteError } = await supabase.from("quotes").delete().eq("id", quote.id);
      if (deleteError) console.error("Quote rollback failed", deleteError);
    }
    throw error;
  }
}
