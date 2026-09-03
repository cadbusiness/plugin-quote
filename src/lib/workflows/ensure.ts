import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { defaultDefinition, defaultWorkflowName } from "@/lib/workflows/defaults";
import type { WorkflowTriggerType } from "@/lib/workflows/types";

const SEEDED: WorkflowTriggerType[] = ["quote.submitted", "session.abandoned"];

export async function ensureDefaultWorkflows(
  supabase: SupabaseClient<Database>,
  organizationId: string,
) {
  const { count } = await supabase
    .from("workflows")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);
  if ((count ?? 0) > 0) return;

  await supabase.from("workflows").insert(
    SEEDED.map((triggerType) => ({
      organization_id: organizationId,
      name: defaultWorkflowName(triggerType),
      status: "active" as const,
      trigger_type: triggerType,
      trigger_config: {} as Json,
      definition: defaultDefinition(triggerType) as unknown as Json,
    })),
  );
}
