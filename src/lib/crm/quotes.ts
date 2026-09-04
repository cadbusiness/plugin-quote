import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import type { QuoteListExtras } from "@/components/crm/quote-list-cells";

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
      "id, contact_name, contact_email, contact_phone, contact_company, score, score_label, status_id, status, assigned_to, created_at",
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

export async function loadQuoteListExtras(
  supabase: SupabaseClient<Database>,
  quotes: { id: string; status: string }[],
): Promise<Map<string, QuoteListExtras>> {
  const extras = new Map<string, QuoteListExtras>();
  for (const quote of quotes) {
    extras.set(quote.id, {
      itemCount: 0,
      firstName: null,
      priceMin: null,
      priceMax: null,
      opened: quote.status !== "new",
    });
  }
  const ids = quotes.map((quote) => quote.id);
  if (!ids.length) return extras;

  const [{ data: items }, { data: rows }] = await Promise.all([
    supabase.from("quote_items").select("quote_id, name, price_min, price_max").in("quote_id", ids),
    supabase.from("quotes").select("id, status, extracted_params").in("id", ids),
  ]);

  for (const row of rows ?? []) {
    const current = extras.get(row.id);
    if (!current) continue;
    current.opened = row.status !== "new" || Boolean(viewedAt(row.extracted_params));
  }

  for (const item of items ?? []) {
    const current = extras.get(item.quote_id);
    if (!current) continue;
    current.itemCount += 1;
    if (!current.firstName) current.firstName = item.name;
    if (item.price_min != null) current.priceMin = (current.priceMin ?? 0) + item.price_min;
    if (item.price_max != null) current.priceMax = (current.priceMax ?? 0) + item.price_max;
    else if (item.price_min != null) current.priceMax = (current.priceMax ?? 0) + item.price_min;
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
