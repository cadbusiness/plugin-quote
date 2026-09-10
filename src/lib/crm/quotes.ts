import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { emptyQuoteExtras, type QuoteListExtras } from "@/components/crm/quote-list-cells";
import { labelAnswers } from "@/lib/crm/answers";
import { dossierWhy, funnelContext, quoteInboxCue } from "@/lib/crm/quote-next-action";
import { computeValidation } from "@/lib/prospect/collaborators";
import { scoreReasons } from "@/lib/quotes/score";
import { classifySource } from "@/lib/stats/attribution";
import type { Answers } from "@/lib/wizard/types";

export type QuoteFilters = {
  status?: string;
  assigned?: string;
  score?: string;
  q?: string;
  from?: string;
  to?: string;
  limit?: number;
};

export async function listQuotes(
  supabase: SupabaseClient<Database>,
  orgId: string,
  filters: QuoteFilters,
) {
  let query = supabase
    .from("quotes")
    .select(
      "id, contact_name, contact_email, contact_phone, contact_company, score, score_label, status_id, status, assigned_to, created_at, answers, utm_source, utm_medium, utm_campaign, referrer, gclid, gbraid, wbraid, extracted_params",
    )
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  if (filters.limit) query = query.limit(filters.limit);
  if (filters.status) query = query.eq("status_id", filters.status);
  if (filters.assigned === "none") {
    const { data: taken } = await supabase.from("quote_assignees").select("quote_id").eq("organization_id", orgId);
    const takenIds = [...new Set((taken ?? []).map((row) => row.quote_id))];
    query = query.is("assigned_to", null);
    if (takenIds.length) query = query.not("id", "in", `(${takenIds.join(",")})`);
  } else if (filters.assigned) {
    const { data: rows } = await supabase
      .from("quote_assignees")
      .select("quote_id")
      .eq("organization_id", orgId)
      .eq("user_id", filters.assigned);
    const ids = [...new Set((rows ?? []).map((row) => row.quote_id))];
    if (!ids.length) return [];
    query = query.in("id", ids);
  }
  if (filters.score) query = query.eq("score_label", filters.score);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59`);
  if (filters.q) {
    query = query.or(
      `contact_name.ilike.%${filters.q}%,contact_email.ilike.%${filters.q}%,contact_company.ilike.%${filters.q}%`,
    );
  }
  const { data } = await query;
  return data ?? [];
}

function viewedAt(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = (value as { viewed_at?: unknown }).viewed_at;
  return typeof raw === "string" ? raw : null;
}

function asAnswers(value: Json | null | undefined): Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Answers;
}

type QuoteListRow = {
  id: string;
  status: string;
  answers?: Json | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  referrer?: string | null;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  created_at?: string;
};

export async function loadQuoteListExtras(
  supabase: SupabaseClient<Database>,
  quotes: QuoteListRow[],
): Promise<Map<string, QuoteListExtras>> {
  const extras = new Map<string, QuoteListExtras>();
  for (const quote of quotes) {
    extras.set(quote.id, emptyQuoteExtras(quote.status !== "new"));
  }
  const ids = quotes.map((quote) => quote.id);
  if (!ids.length) return extras;

  const [{ data: items }, { data: rows }, collabResult, { data: messages }, { data: calls }] = await Promise.all([
    supabase.from("quote_items").select("quote_id, name, quantity, price_min, price_max").in("quote_id", ids),
    supabase.from("quotes").select("id, status, extracted_params").in("id", ids),
    supabase
      .from("quote_collaborators")
      .select("quote_id, status")
      .in("quote_id", ids)
      .then((result) => (result.error ? { data: [] as { quote_id: string; status: string }[] } : result)),
    supabase
      .from("prospect_messages")
      .select("quote_id, sender, content, sent_at")
      .in("quote_id", ids)
      .order("sent_at", { ascending: false }),
    supabase
      .from("quote_activities")
      .select("quote_id, type, created_at")
      .in("quote_id", ids)
      .in("type", ["call_logged", "message_sent"])
      .order("created_at", { ascending: false }),
  ]);

  const lastProspect = new Map<string, { content: string; sent_at: string }>();
  const lastTeamAt = new Map<string, string>();
  for (const row of messages ?? []) {
    if (row.sender === "prospect") {
      if (!lastProspect.has(row.quote_id)) lastProspect.set(row.quote_id, { content: row.content, sent_at: row.sent_at });
    } else if (!lastTeamAt.has(row.quote_id)) {
      lastTeamAt.set(row.quote_id, row.sent_at);
    }
  }
  for (const row of calls ?? []) {
    const current = lastTeamAt.get(row.quote_id);
    if (!current || row.created_at > current) lastTeamAt.set(row.quote_id, row.created_at);
  }

  for (const row of rows ?? []) {
    const current = extras.get(row.id);
    if (!current) continue;
    current.opened = row.status !== "new" || Boolean(viewedAt(row.extracted_params));
  }

  const byQuote = new Map<string, { status: string }[]>();
  for (const row of collabResult.data ?? []) {
    const list = byQuote.get(row.quote_id) ?? [];
    list.push({ status: row.status });
    byQuote.set(row.quote_id, list);
  }
  for (const [quoteId, list] of byQuote) {
    const current = extras.get(quoteId);
    if (!current) continue;
    const stats = computeValidation(list);
    current.validationStatus = stats.validation_status;
    current.validationApproved = stats.validation_approved_count;
    current.validationTotal = stats.validation_total_count;
  }

  for (const item of items ?? []) {
    const current = extras.get(item.quote_id);
    if (!current) continue;
    const qty = item.quantity || 1;
    current.itemCount += 1;
    if (!current.firstName) current.firstName = item.name;
    if (item.price_min != null) current.priceMin = (current.priceMin ?? 0) + item.price_min * qty;
    if (item.price_max != null) current.priceMax = (current.priceMax ?? 0) + item.price_max * qty;
    else if (item.price_min != null) current.priceMax = (current.priceMax ?? 0) + item.price_min * qty;
  }

  for (const quote of quotes) {
    const current = extras.get(quote.id);
    if (!current) continue;
    const answers = asAnswers(quote.answers);
    const labeled = labelAnswers(answers);
    current.source = classifySource({
      utmSource: quote.utm_source,
      utmMedium: quote.utm_medium,
      referrer: quote.referrer,
      gclid: quote.gclid,
      gbraid: quote.gbraid,
      wbraid: quote.wbraid,
    });
    current.reasons = dossierWhy(scoreReasons(answers), labeled);
    current.context = funnelContext(labeled);
    current.cue = quoteInboxCue({
      statusSlug: quote.status,
      createdAt: quote.created_at ?? new Date().toISOString(),
      firstItem: current.firstName,
      lastProspect: lastProspect.get(quote.id) ?? null,
      lastTeamAt: lastTeamAt.get(quote.id) ?? null,
    });
  }

  return extras;
}

export async function markQuoteViewed(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  quoteId: string,
  extracted: Json | null,
) {
  if (viewedAt(extracted)) return;
  const base =
    extracted && typeof extracted === "object" && !Array.isArray(extracted)
      ? { ...(extracted as Record<string, unknown>) }
      : {};
  await supabase
    .from("quotes")
    .update({
      extracted_params: { ...base, viewed_at: new Date().toISOString() } as Json,
    })
    .eq("id", quoteId)
    .eq("organization_id", organizationId);
}

export function csvQuery(filters: QuoteFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key === "limit" || value == null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `/devis.csv?${qs}` : "/devis.csv";
}
