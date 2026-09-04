import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";

const OPEN_STATUSES = new Set(["new", "contacted", "in_progress", "waiting"]);
const STALE_MS = 60 * 60 * 1000;

export type AbandonDraft = {
  name?: string;
  email?: string;
  company?: string;
};

export type AbandonRow = {
  id: string;
  token: string;
  name: string | null;
  email: string | null;
  company: string | null;
  step: number;
  funnel: string;
  lastActivity: string;
  recoverable: boolean;
  stale: boolean;
};

export type AbandonSnapshot = {
  baskets: number;
  stale: number;
  anonymous: number;
  openQuotes: number;
  hotOpen: number;
  rows: AbandonRow[];
};

function draftOf(value: Json | null): AbandonDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const row = value as Record<string, unknown>;
  return {
    name: typeof row.name === "string" ? row.name : undefined,
    email: typeof row.email === "string" ? row.email : undefined,
    company: typeof row.company === "string" ? row.company : undefined,
  };
}

export async function loadAbandonSnapshot(
  supabase: SupabaseClient<Database>,
  orgId: string,
): Promise<AbandonSnapshot> {
  const [{ data: sessions }, { data: quotes }, { data: funnels }] = await Promise.all([
    supabase
      .from("quote_sessions")
      .select("id, token, contact_draft, current_step, last_activity_at, updated_at, configurator_id")
      .eq("organization_id", orgId)
      .is("submitted_quote_id", null)
      .order("last_activity_at", { ascending: false })
      .limit(150),
    supabase.from("quotes").select("id, status, score_label").eq("organization_id", orgId),
    supabase.from("configurators").select("id, name").eq("organization_id", orgId),
  ]);

  const funnelName = new Map((funnels ?? []).map((funnel) => [funnel.id, funnel.name]));
  const now = Date.now();
  const rows: AbandonRow[] = (sessions ?? []).map((session) => {
    const draft = draftOf(session.contact_draft);
    const lastActivity = session.last_activity_at ?? session.updated_at;
    const stale = now - new Date(lastActivity).getTime() >= STALE_MS;
    return {
      id: session.id,
      token: session.token,
      name: draft.name ?? null,
      email: draft.email ?? null,
      company: draft.company ?? null,
      step: session.current_step + 1,
      funnel: funnelName.get(session.configurator_id) ?? "Funnel",
      lastActivity,
      recoverable: Boolean(draft.email),
      stale,
    };
  });

  const open = (quotes ?? []).filter((quote) => OPEN_STATUSES.has(quote.status));

  return {
    baskets: rows.filter((row) => row.recoverable).length,
    stale: rows.filter((row) => row.recoverable && row.stale).length,
    anonymous: rows.filter((row) => !row.recoverable).length,
    openQuotes: open.length,
    hotOpen: open.filter((quote) => quote.score_label === "hot").length,
    rows,
  };
}
