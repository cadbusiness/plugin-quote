import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";

export type SidebarSnapshot = {
  monthQuotes: number;
  monthHot: number;
  newQuotes: number;
  abandons: number;
};

export async function getSidebarSnapshot(
  supabase: SupabaseClient<Database>,
  orgId: string,
): Promise<SidebarSnapshot> {
  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);
  const iso = since.toISOString();

  const [{ data: quotes }, { data: sessions }] = await Promise.all([
    supabase
      .from("quotes")
      .select("id, score_label, status")
      .eq("organization_id", orgId)
      .gte("created_at", iso),
    supabase
      .from("quote_sessions")
      .select("id, contact_draft")
      .eq("organization_id", orgId)
      .is("submitted_quote_id", null)
      .limit(80),
  ]);

  const list = quotes ?? [];
  const abandons = (sessions ?? []).filter((s) => {
    const draft = (s.contact_draft ?? {}) as { email?: string };
    return Boolean(draft.email);
  }).length;

  return {
    monthQuotes: list.length,
    monthHot: list.filter((q) => q.score_label === "hot").length,
    newQuotes: list.filter((q) => q.status === "new").length,
    abandons,
  };
}
