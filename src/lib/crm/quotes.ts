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

export function csvQuery(filters: QuoteFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key === "limit" || value == null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `/devis.csv?${qs}` : "/devis.csv";
}
