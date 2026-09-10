import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { HelpTip } from "@/components/ui/help-tip";
import { CreateWorkflowDialog } from "@/components/workflows/create-workflow-dialog";
import { StepStrip } from "@/components/workflows/step-strip";
import { TriggerGlyph } from "@/components/workflows/trigger-icon";
import { ensureDefaultWorkflows } from "@/lib/workflows/ensure";
import { TRIGGER_WHEN, WORKFLOW_STATUS_LABELS, workflowActionSteps } from "@/lib/workflows/labels";
import { parseDefinition, parseTriggerConfig, type WorkflowStatus, type WorkflowTriggerType } from "@/lib/workflows/types";

const STATUS_TONE: Record<WorkflowStatus, ChipTone> = {
  draft: "amber",
  active: "emerald",
  archived: "slate",
};

export default async function AutomationsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const supabase = await createClient();
  try {
    await ensureDefaultWorkflows(supabase, ctx.organization.id);
  } catch (error) {
    console.error("Workflow seed failed", error);
  }

  const [{ data: workflows }, { data: funnels }, { data: statuses }, { data: runs }] = await Promise.all([
    supabase
      .from("workflows")
      .select("*")
      .eq("organization_id", ctx.organization.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false }),
    supabase.from("configurators").select("id, name").eq("organization_id", ctx.organization.id).order("name"),
    supabase.from("quote_statuses").select("slug, label").eq("organization_id", ctx.organization.id).order("position"),
    supabase.from("workflow_runs").select("workflow_id, status").eq("organization_id", ctx.organization.id),
  ]);

  const funnelName = new Map((funnels ?? []).map((funnel) => [funnel.id, funnel.name]));
  const failed = new Map<string, number>();
  for (const run of runs ?? []) {
    if (run.status !== "failed") continue;
    failed.set(run.workflow_id, (failed.get(run.workflow_id) ?? 0) + 1);
  }

  const list = workflows ?? [];

  return (
    <ListPanel>
      <ListToolbar>
        <span className="mr-auto inline-flex items-center gap-1.5 text-sm text-slate-500">
          Parcours
          <HelpTip label="Parcours">
            Un parcours envoie les emails tout seul. Quand = le déclencheur. Portée = tous les funnels ou seulement certains.
          </HelpTip>
        </span>
      </ListToolbar>
      <DataTable headers={["Parcours", "Quand", "Portée"]}>
        {list.map((workflow) => {
          const trigger = workflow.trigger_type as WorkflowTriggerType;
          const status = workflow.status as WorkflowStatus;
          const config = parseTriggerConfig(workflow.trigger_config);
          const scope = !config.configuratorIds?.length
            ? "Tous"
            : config.configuratorIds.length === 1
              ? (funnelName.get(config.configuratorIds[0]) ?? "1 funnel")
              : `${config.configuratorIds.length} funnels`;
          const steps = workflowActionSteps(parseDefinition(workflow.definition).nodes);
          const errors = failed.get(workflow.id) ?? 0;
          return (
            <ClickableRow key={workflow.id} href={`/automations/${workflow.id}`}>
              <td className="px-4 py-3 lg:px-6">
                <div className="flex items-center gap-3">
                  <TriggerGlyph type={trigger} size="sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">{workflow.name}</span>
                      <Chip tone={STATUS_TONE[status]}>{WORKFLOW_STATUS_LABELS[status]}</Chip>
                      {errors ? <Chip tone="rose">{errors}</Chip> : null}
                    </div>
                    <StepStrip steps={steps} />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600 lg:px-6">{TRIGGER_WHEN[trigger] ?? workflow.trigger_type}</td>
              <td className="px-4 py-3 text-slate-600 lg:px-6">{scope}</td>
            </ClickableRow>
          );
        })}
      </DataTable>
      {list.length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">Pas encore de parcours.</p>
      ) : null}
      <CreateWorkflowDialog funnels={funnels ?? []} statuses={statuses ?? []} />
    </ListPanel>
  );
}
