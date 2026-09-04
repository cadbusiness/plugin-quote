import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { CreateWorkflowDialog } from "@/components/workflows/create-workflow-dialog";
import { ensureDefaultWorkflows } from "@/lib/workflows/ensure";
import { TRIGGER_LABELS, WORKFLOW_STATUS_LABELS } from "@/lib/workflows/labels";
import { parseTriggerConfig, type WorkflowStatus, type WorkflowTriggerType } from "@/lib/workflows/types";

const STATUS_TONE: Record<WorkflowStatus, ChipTone> = {
  draft: "amber",
  active: "emerald",
  archived: "slate",
};

const TRIGGER_TONE: Record<WorkflowTriggerType, ChipTone> = {
  "quote.submitted": "emerald",
  "session.abandoned": "amber",
  "quote.status_changed": "violet",
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
  const counts = new Map<string, { running: number; waiting: number; failed: number }>();
  for (const run of runs ?? []) {
    const current = counts.get(run.workflow_id) ?? { running: 0, waiting: 0, failed: 0 };
    if (run.status === "running") current.running += 1;
    if (run.status === "waiting") current.waiting += 1;
    if (run.status === "failed") current.failed += 1;
    counts.set(run.workflow_id, current);
  }

  const list = workflows ?? [];

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          {list.length} parcours
        </p>
      </ListToolbar>
      <DataTable headers={["Parcours", "Déclencheur", "Funnels", "En cours", "En attente", "Échecs"]}>
        {list.map((workflow) => {
          const trigger = workflow.trigger_type as WorkflowTriggerType;
          const status = workflow.status as WorkflowStatus;
          const config = parseTriggerConfig(workflow.trigger_config);
          const scope = !config.configuratorIds?.length
            ? "Tous"
            : config.configuratorIds.map((id) => funnelName.get(id) ?? "Funnel").join(", ");
          const tally = counts.get(workflow.id) ?? { running: 0, waiting: 0, failed: 0 };
          return (
            <ClickableRow key={workflow.id} href={`/automations/${workflow.id}`}>
              <td className="px-4 py-3 lg:px-6">
                <div className="font-medium text-slate-900">{workflow.name}</div>
                <Chip tone={STATUS_TONE[status]}>{WORKFLOW_STATUS_LABELS[status]}</Chip>
              </td>
              <td className="px-4 py-3 lg:px-6">
                <Chip tone={TRIGGER_TONE[trigger] ?? "slate"}>{TRIGGER_LABELS[trigger] ?? workflow.trigger_type}</Chip>
              </td>
              <td className="px-4 py-3 text-slate-600 lg:px-6">{scope}</td>
              <td className="px-4 py-3 tabular-nums lg:px-6">{tally.running}</td>
              <td className="px-4 py-3 tabular-nums lg:px-6">{tally.waiting}</td>
              <td className="px-4 py-3 tabular-nums lg:px-6">{tally.failed}</td>
            </ClickableRow>
          );
        })}
      </DataTable>
      {list.length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
          Créez un parcours : un déclencheur, puis les emails, délais et branches sur le canvas.
        </p>
      ) : null}
      <CreateWorkflowDialog funnels={funnels ?? []} statuses={statuses ?? []} />
    </ListPanel>
  );
}
