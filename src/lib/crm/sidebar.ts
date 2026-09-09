import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";

export type SidebarSnapshot = {
  monthQuotes: number;
  monthHot: number;
  newQuotes: number;
  abandons: number;
};

export const EMPTY_SIDEBAR_SNAPSHOT: SidebarSnapshot = {
  monthQuotes: 0,
  monthHot: 0,
  newQuotes: 0,
  abandons: 0,
};

export async function getSidebarSnapshot(
  supabase: SupabaseClient<Database>,
  orgId: string,
): Promise<SidebarSnapshot> {
  const [{ count: newQuotes }, { count: abandons }] = await Promise.all([
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "new"),
    supabase
      .from("quote_sessions")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .is("submitted_quote_id", null)
      .neq("contact_draft->>email", ""),
  ]);

  return {
    monthQuotes: 0,
    monthHot: 0,
    newQuotes: newQuotes ?? 0,
    abandons: abandons ?? 0,
  };
}
