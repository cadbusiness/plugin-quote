import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";

const STALE_MS = 60 * 60 * 1000;

export type AbandonDraft = {
  name?: string;
  email?: string;
  company?: string;
};

export type AbandonView = "relance" | "email" | "tous";

export type AbandonRow = {
  id: string;
  token: string;
  name: string | null;
  email: string | null;
  company: string | null;
  step: number;
  stepCount: number;
  progress: number;
  funnel: string;
  lastActivity: string;
  recoverable: boolean;
  stale: boolean;
  relanced: boolean;
};

export type AbandonSnapshot = {
  started: number;
  baskets: number;
  stale: number;
  anonymous: number;
  relanced: number;
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

function countBy(ids: string[]) {
  const map = new Map<string, number>();
  for (const id of ids) map.set(id, (map.get(id) ?? 0) + 1);
  return map;
}

export function resolveAbandonView(raw: string | undefined): AbandonView {
  if (raw === "relance" || raw === "email" || raw === "tous") return raw;
  return "tous";
}

export function filterAbandonRows(rows: AbandonRow[], view: AbandonView) {
  if (view === "relance") return rows.filter((row) => row.recoverable && row.stale);
  if (view === "email") return rows.filter((row) => row.recoverable);
  return rows;
}

export async function loadAbandonSnapshot(
  supabase: SupabaseClient<Database>,
  orgId: string,
): Promise<AbandonSnapshot> {
  const [{ data: sessions }, { data: funnels }, { data: steps }, { data: runs }] = await Promise.all([
    supabase
      .from("quote_sessions")
      .select("id, token, contact_draft, current_step, last_activity_at, updated_at, configurator_id")
      .eq("organization_id", orgId)
      .is("submitted_quote_id", null)
      .order("last_activity_at", { ascending: false })
      .limit(150),
    supabase.from("configurators").select("id, name").eq("organization_id", orgId),
    supabase.from("wizard_steps").select("configurator_id").eq("organization_id", orgId),
    supabase
      .from("workflow_runs")
      .select("subject_id")
      .eq("organization_id", orgId)
      .eq("subject_type", "session")
      .limit(500),
  ]);

  const funnelName = new Map((funnels ?? []).map((funnel) => [funnel.id, funnel.name]));
  const stepCounts = countBy((steps ?? []).map((step) => step.configurator_id));
  const relancedIds = new Set((runs ?? []).map((run) => run.subject_id));
  const now = Date.now();

  const rows: AbandonRow[] = (sessions ?? []).map((session) => {
    const draft = draftOf(session.contact_draft);
    const lastActivity = session.last_activity_at ?? session.updated_at;
    const stale = now - new Date(lastActivity).getTime() >= STALE_MS;
    const stepCount = Math.max(1, stepCounts.get(session.configurator_id) ?? 1);
    const step = session.current_step + 1;
    return {
      id: session.id,
      token: session.token,
      name: draft.name ?? null,
      email: draft.email ?? null,
      company: draft.company ?? null,
      step,
      stepCount,
      progress: Math.min(1, step / stepCount),
      funnel: funnelName.get(session.configurator_id) ?? "Funnel",
      lastActivity,
      recoverable: Boolean(draft.email),
      stale,
      relanced: relancedIds.has(session.id),
    };
  });

  rows.sort((a, b) => {
    const rank = (row: AbandonRow) => {
      if (row.recoverable && row.stale && !row.relanced) return 0;
      if (row.recoverable && row.stale) return 1;
      if (row.recoverable) return 2;
      return 3;
    };
    const delta = rank(a) - rank(b);
    if (delta !== 0) return delta;
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });

  const recoverable = rows.filter((row) => row.recoverable);

  return {
    started: rows.length,
    baskets: recoverable.length,
    stale: recoverable.filter((row) => row.stale).length,
    anonymous: rows.filter((row) => !row.recoverable).length,
    relanced: recoverable.filter((row) => row.relanced).length,
    rows,
  };
}
