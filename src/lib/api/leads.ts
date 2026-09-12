import type { Json } from "@/lib/db/database.types";
import { createServiceClient } from "@/lib/supabase/service";
import { listQuotes, loadQuoteListExtras } from "@/lib/crm/quotes";
import { loadQuoteDetail } from "@/lib/crm/quote-detail";
import { logActivity } from "@/lib/crm/activity";
import { scoreQuote } from "@/lib/quotes/score";
import { exitActiveQuoteRuns, startWorkflows } from "@/lib/workflows/engine";
import type { Answers } from "@/lib/wizard/types";
import { shouldRunQuoteAutopilot, sliceQuoteStatus } from "@/lib/api/quote-status";

export type LeadStatusSlug = "new" | "contacted" | "in_progress" | "won" | "lost" | "waiting";
export type LeadScore = "hot" | "warm" | "cold";

export type GetLeadsInput = {
  status?: LeadStatusSlug;
  score?: LeadScore;
  days?: number;
  limit?: number;
};

export type CreateLeadInput = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  funnel_id: string;
  data?: Record<string, unknown>;
  /** When true, fire quote.submitted workflows / emails. Default false (no spam). */
  run_autopilot?: boolean;
};

export type UpdateLeadStatusInput = {
  lead_id: string;
  status: string;
  note?: string;
};

function daysFrom(days?: number) {
  if (!days || days <= 0) return undefined;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function resolveStatusId(organizationId: string, slug: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("quote_statuses")
    .select("id, slug, label, is_closed")
    .eq("organization_id", organizationId)
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function apiGetLeads(organizationId: string, input: GetLeadsInput) {
  const supabase = createServiceClient();
  let statusId: string | undefined;
  if (input.status) {
    const status = await resolveStatusId(organizationId, input.status);
    if (!status) return [];
    statusId = status.id;
  }

  const quotes = await listQuotes(supabase, organizationId, {
    status: statusId,
    score: input.score,
    from: daysFrom(input.days),
    limit: input.limit ?? 100,
  });
  const extras = await loadQuoteListExtras(supabase, quotes);

  return quotes.map((quote) => {
    const extra = extras.get(quote.id);
    return {
      id: quote.id,
      name: quote.contact_name,
      email: quote.contact_email,
      phone: quote.contact_phone,
      company: quote.contact_company,
      status: quote.status,
      score: quote.score,
      score_label: quote.score_label,
      assigned_to: quote.assigned_to,
      created_at: quote.created_at,
      pipeline_min: extra?.priceMin ?? null,
      pipeline_max: extra?.priceMax ?? null,
      item_count: extra?.itemCount ?? 0,
    };
  });
}

export async function apiGetLeadDetail(organizationId: string, leadId: string) {
  const supabase = createServiceClient();
  const detail = await loadQuoteDetail(supabase, organizationId, leadId);
  if (!detail) return null;

  return {
    id: detail.quote.id,
    name: detail.quote.contact_name,
    email: detail.quote.contact_email,
    phone: detail.quote.contact_phone,
    company: detail.quote.contact_company,
    status: detail.status?.slug ?? detail.quote.status,
    status_label: detail.status?.label ?? detail.quote.status,
    score: detail.quote.score,
    score_label: detail.quote.score_label,
    score_reasons: detail.scoreReasons,
    funnel: detail.funnel,
    answers: detail.answers,
    items: detail.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price_min: item.price_min,
      price_max: item.price_max,
    })),
    notes: detail.notes.map((note) => ({
      id: note.id,
      content: note.content,
      created_at: note.created_at,
    })),
    activities: detail.activities.slice(0, 20).map((activity) => ({
      id: activity.id,
      type: activity.type,
      label: activity.label,
      detail: activity.detail,
      created_at: activity.created_at,
    })),
    assignees: detail.assignees,
    assigned_to: detail.assignees.length
      ? detail.assignees.map((row) => ({ id: row.userId, label: row.label }))
      : null,
    suivi_url: detail.suiviUrl,
    totals: detail.totals,
    created_at: detail.quote.created_at,
  };
}

export async function apiGetQuoteStatus(organizationId: string, leadId: string) {
  const lead = await apiGetLeadDetail(organizationId, leadId);
  if (!lead) return null;
  return sliceQuoteStatus(lead);
}

export async function apiUpdateLeadStatus(organizationId: string, input: UpdateLeadStatusInput) {
  const supabase = createServiceClient();
  const status = await resolveStatusId(organizationId, input.status);
  if (!status) throw new Error(`Statut inconnu: ${input.status}`);

  const { data: current } = await supabase
    .from("quotes")
    .select("id, status_id, status, gclid, gbraid, wbraid")
    .eq("id", input.lead_id)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!current) throw new Error("Lead introuvable");

  if (current.status_id !== status.id) {
    let fromLabel = current.status;
    if (current.status_id) {
      const { data: previous } = await supabase
        .from("quote_statuses")
        .select("label")
        .eq("id", current.status_id)
        .maybeSingle();
      if (previous?.label) fromLabel = previous.label;
    }

    await supabase
      .from("quotes")
      .update({ status_id: status.id, status: status.slug })
      .eq("id", input.lead_id)
      .eq("organization_id", organizationId);

    await logActivity(supabase, {
      organizationId,
      quoteId: input.lead_id,
      type: "status_changed",
      payload: { from: fromLabel, status: status.slug, label: status.label, source: "api" },
    });

    try {
      if (status.is_closed) {
        await exitActiveQuoteRuns(organizationId, input.lead_id);
      }
      await startWorkflows({
        triggerType: "quote.status_changed",
        organizationId,
        subjectType: "quote",
        subjectId: input.lead_id,
        statusSlug: status.slug,
      });
    } catch (error) {
      console.error("Workflow status trigger failed", error);
    }

    if (status.slug === "won") {
      try {
        const { reportAdsConversion } = await import("@/lib/ads/sync");
        await reportAdsConversion({
          supabase,
          organizationId,
          quoteId: input.lead_id,
          kind: "won",
          gclid: current.gclid,
          gbraid: current.gbraid,
          wbraid: current.wbraid,
          occurredAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Ads won conversion failed", error);
      }
    }
  }

  const note = input.note?.trim();
  if (note) {
    await supabase.from("quote_notes").insert({
      organization_id: organizationId,
      quote_id: input.lead_id,
      author_id: null,
      content: note,
    });
    await logActivity(supabase, {
      organizationId,
      quoteId: input.lead_id,
      type: "note_added",
      payload: { source: "api" },
    });
  }

  return {
    id: input.lead_id,
    status: status.slug,
    status_label: status.label,
    note_added: Boolean(note),
  };
}

export async function apiCreateLead(organizationId: string, input: CreateLeadInput) {
  const supabase = createServiceClient();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || !email) throw new Error("name et email sont requis");
  if (!input.funnel_id) throw new Error("funnel_id est requis");

  const { data: funnel } = await supabase
    .from("configurators")
    .select("id, name, slug")
    .eq("id", input.funnel_id)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!funnel) throw new Error("Funnel introuvable");

  const { data: defaultStatus } = await supabase
    .from("quote_statuses")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_default", true)
    .maybeSingle();

  const answers = (input.data ?? {}) as Answers;
  const { score, label } = scoreQuote(answers);

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      organization_id: organizationId,
      configurator_id: funnel.id,
      contact_name: name,
      contact_email: email,
      contact_phone: input.phone?.trim() || null,
      contact_company: input.company?.trim() || null,
      answers: answers as Json,
      extracted_params: { source: "api" } as Json,
      score,
      score_label: label,
      status: defaultStatus?.slug ?? "new",
      status_id: defaultStatus?.id ?? null,
    })
    .select("id, status, score, score_label, created_at")
    .single();

  if (error || !quote) throw new Error(error?.message ?? "Création impossible");

  const runAutopilot = shouldRunQuoteAutopilot(input.run_autopilot);

  await logActivity(supabase, {
    organizationId,
    quoteId: quote.id,
    type: "submitted",
    payload: { source: "api", run_autopilot: runAutopilot },
  });

  if (runAutopilot) {
    try {
      await startWorkflows({
        triggerType: "quote.submitted",
        organizationId,
        subjectType: "quote",
        subjectId: quote.id,
      });
    } catch (err) {
      console.error("Workflow submit trigger failed", err);
    }
  }

  return {
    id: quote.id,
    name,
    email,
    funnel: { id: funnel.id, name: funnel.name, slug: funnel.slug },
    status: quote.status,
    score: quote.score,
    score_label: quote.score_label,
    created_at: quote.created_at,
  };
}
