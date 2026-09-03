import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";

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
  if (filters.assigned === "none") query = query.is("assigned_to", null);
  else if (filters.assigned) query = query.eq("assigned_to", filters.assigned);
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

export function csvQuery(filters: QuoteFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key === "limit" || value == null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `/devis.csv?${qs}` : "/devis.csv";
}
