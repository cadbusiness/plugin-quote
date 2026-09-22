import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { ensureDefaultEmailTemplates } from "@/lib/crm/email-templates";
import { defaultDefinition } from "@/lib/workflows/defaults";
import type { WorkflowTriggerType } from "@/lib/workflows/types";

/** Pitch org. Relances stay draft until someone activates them in the canvas. */
export const QUICKLY_ORG_SLUG = "quickly";

export const QUICKLY_ABANDON_NAME = "Relance abandon — Quickly";
export const QUICKLY_SUBMITTED_NAME = "Relance après demande — Quickly";

const DRAFTS: { name: string; triggerType: WorkflowTriggerType }[] = [
  { name: QUICKLY_ABANDON_NAME, triggerType: "session.abandoned" },
  { name: QUICKLY_SUBMITTED_NAME, triggerType: "quote.submitted" },
];

export function quicklyDraftRows(organizationId: string) {
  return DRAFTS.map((draft) => ({
    organization_id: organizationId,
    name: draft.name,
    status: "draft" as const,
    trigger_type: draft.triggerType,
    trigger_config: { silentDraft: true } as Json,
    definition: defaultDefinition(draft.triggerType) as unknown as Json,
  }));
}

/**
 * T+0 confirmation is the fallback when no active parcours starts.
 * Quickly stays silent: drafts do not send, and the fallback does not either.
 * Activating a parcours in the app is what starts email.
 */
export function shouldSendQuoteFallback(input: { orgSlug: string | null | undefined; workflowsStarted: number }) {
  if (input.workflowsStarted > 0) return false;
  if (input.orgSlug === QUICKLY_ORG_SLUG) return false;
  return true;
}

/** Auto-seeded parcours. Kept draft for Quickly so a quote submit cannot mail the org. */
const QUICKLY_AUTO_ACTIVE_NAMES = ["Parcours demande", "Parcours abandon"] as const;

export async function ensureQuicklyDraftWorkflows(
  supabase: SupabaseClient<Database>,
  organizationId: string,
) {
  await supabase
    .from("workflows")
    .update({ status: "draft" })
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .in("name", [...QUICKLY_AUTO_ACTIVE_NAMES]);

  const { data: existing } = await supabase
    .from("workflows")
    .select("name, status")
    .eq("organization_id", organizationId);
  const names = new Set((existing ?? []).map((row) => row.name));
  const missing = quicklyDraftRows(organizationId).filter((row) => !names.has(row.name));
  if (!missing.length) return { inserted: [] as string[] };

  const { error } = await supabase.from("workflows").insert(missing);
  if (error) {
    console.error("ensureQuicklyDraftWorkflows", error.message);
    return { inserted: [] as string[] };
  }
  return { inserted: missing.map((row) => row.name) };
}

/**
 * Inserts draft sequences and missing email templates. Never sets status to active.
 * `pauseActive` is a one-shot pitch guard: it moves currently active parcours to draft
 * so the engine cannot email Quickly contacts. Re-running without the flag leaves
 * a later manual activation alone.
 */
export async function seedQuicklySilentDrafts(
  supabase: SupabaseClient<Database>,
  opts?: { pauseActive?: boolean },
) {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, slug")
    .eq("slug", QUICKLY_ORG_SLUG)
    .maybeSingle();
  if (orgError) throw new Error(orgError.message);
  if (!org) return { ok: false as const, reason: "org-missing" };

  await ensureDefaultEmailTemplates(supabase, org.id);

  let paused: string[] = [];
  if (opts?.pauseActive) {
    const { data: active, error: activeError } = await supabase
      .from("workflows")
      .select("id, name")
      .eq("organization_id", org.id)
      .eq("status", "active");
    if (activeError) throw new Error(activeError.message);
    if (active?.length) {
      const { error } = await supabase
        .from("workflows")
        .update({ status: "draft" })
        .eq("organization_id", org.id)
        .eq("status", "active");
      if (error) throw new Error(error.message);
      paused = active.map((row) => row.name);
    }
  }

  const inserted = await ensureQuicklyDraftWorkflows(supabase, org.id);
  const { data: drafts, error: draftError } = await supabase
    .from("workflows")
    .select("name, status, trigger_type")
    .eq("organization_id", org.id)
    .in("name", [QUICKLY_ABANDON_NAME, QUICKLY_SUBMITTED_NAME]);
  if (draftError) throw new Error(draftError.message);

  const activeNamed = (drafts ?? []).filter((row) => row.status === "active");
  if (activeNamed.length) {
    throw new Error(`Parcours Quickly encore actifs: ${activeNamed.map((row) => row.name).join(", ")}`);
  }

  return {
    ok: true as const,
    inserted: inserted.inserted,
    paused,
    drafts: drafts ?? [],
  };
}
