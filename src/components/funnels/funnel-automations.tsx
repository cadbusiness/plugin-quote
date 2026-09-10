"use client";

import { useTransition, type ReactNode } from "react";
import Link from "next/link";
import { Globe, Minus, Pin, Plus } from "lucide-react";
import { setWorkflowOnFunnel } from "@/app/(app)/funnels/actions";
import { Chip } from "@/components/ui/chip";
import { HelpTip, IconHint } from "@/components/ui/help-tip";
import { CreateWorkflowDialog } from "@/components/workflows/create-workflow-dialog";
import { StepStrip } from "@/components/workflows/step-strip";
import { TriggerGlyph } from "@/components/workflows/trigger-icon";
import { TRIGGER_HELP, TRIGGER_ORDER, TRIGGER_WHEN, WORKFLOW_STATUS_LABELS } from "@/lib/workflows/labels";
import type { WorkflowNodeType, WorkflowStatus, WorkflowTriggerType } from "@/lib/workflows/types";

export type FunnelWorkflowRow = {
  id: string;
  name: string;
  status: WorkflowStatus;
  triggerType: WorkflowTriggerType;
  scope: "all" | "this" | "other";
  steps: { type: WorkflowNodeType; label: string }[];
};

export function FunnelAutomations({
  funnelId,
  workflows,
  funnels,
  statuses,
}: {
  funnelId: string;
  workflows: FunnelWorkflowRow[];
  funnels: { id: string; name: string }[];
  statuses: { slug: string; label: string }[];
}) {
  const groups = TRIGGER_ORDER.map((type) => ({
    type,
    assigned: workflows.filter((workflow) => workflow.triggerType === type && workflow.scope !== "other"),
    available: workflows.filter((workflow) => workflow.triggerType === type && workflow.scope === "other"),
  })).filter((group) => group.assigned.length || group.available.length);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {groups.map((group) => {
        const live = group.assigned.filter((workflow) => workflow.status === "active").length;
        return (
          <section key={group.type}>
            <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-2 lg:px-6">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{TRIGGER_WHEN[group.type]}</p>
              <HelpTip label={TRIGGER_WHEN[group.type]}>{TRIGGER_HELP[group.type]}</HelpTip>
              {live > 1 ? (
                <span className="ml-auto inline-flex items-center gap-1">
                  <Chip tone="amber">{live}</Chip>
                  <HelpTip label="Plusieurs parcours" align="right">
                    {live} parcours partent pour le même événement. Gardez-en un.
                  </HelpTip>
                </span>
              ) : null}
            </div>
            {group.assigned.map((workflow) => (
              <AutomationRow
                key={workflow.id}
                workflow={workflow}
                actions={
                  workflow.scope === "all" ? (
                    <>
                      <FunnelAction
                        label="Limiter à ce funnel"
                        help="Ne tourne plus que sur ce funnel."
                        workflowId={workflow.id}
                        funnelId={funnelId}
                        mode="only"
                      >
                        <Pin className="h-4 w-4" strokeWidth={1.75} />
                      </FunnelAction>
                      <FunnelAction
                        label="Retirer"
                        help="Ne lance plus ce parcours sur ce funnel."
                        workflowId={workflow.id}
                        funnelId={funnelId}
                        mode="remove"
                      >
                        <Minus className="h-4 w-4" strokeWidth={1.75} />
                      </FunnelAction>
                    </>
                  ) : (
                    <>
                      <FunnelAction
                        label="Tous les funnels"
                        help="Étend ce parcours à tous les funnels."
                        workflowId={workflow.id}
                        funnelId={funnelId}
                        mode="all"
                      >
                        <Globe className="h-4 w-4" strokeWidth={1.75} />
                      </FunnelAction>
                      <FunnelAction
                        label="Retirer"
                        help="Ne lance plus ce parcours sur ce funnel."
                        workflowId={workflow.id}
                        funnelId={funnelId}
                        mode="remove"
                      >
                        <Minus className="h-4 w-4" strokeWidth={1.75} />
                      </FunnelAction>
                    </>
                  )
                }
              />
            ))}
            {group.available.map((workflow) => (
              <AutomationRow
                key={workflow.id}
                workflow={workflow}
                muted
                actions={
                  <FunnelAction
                    label="Ajouter"
                    help="Lance aussi ce parcours sur ce funnel."
                    workflowId={workflow.id}
                    funnelId={funnelId}
                    mode="add"
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.75} />
                  </FunnelAction>
                }
              />
            ))}
          </section>
        );
      })}
      <CreateWorkflowDialog funnels={funnels} statuses={statuses} presetFunnelId={funnelId} addLabel="Ajouter un parcours" />
    </div>
  );
}

function AutomationRow({
  workflow,
  actions,
  muted,
}: {
  workflow: FunnelWorkflowRow;
  actions: React.ReactNode;
  muted?: boolean;
}) {
  const emails = workflow.steps.filter((step) => step.type === "send_email").length;
  return (
    <div className={`flex items-center gap-3 border-b border-slate-100 px-4 py-3 lg:px-6 ${muted ? "opacity-60" : ""}`}>
      <Link href={`/automations/${workflow.id}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
        <TriggerGlyph type={workflow.triggerType} size="sm" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-slate-900">{workflow.name}</span>
            {workflow.status === "active" ? (
              <Chip tone="emerald">{WORKFLOW_STATUS_LABELS.active}</Chip>
            ) : (
              <Chip tone="amber">{WORKFLOW_STATUS_LABELS[workflow.status]}</Chip>
            )}
          </div>
          <StepStrip steps={workflow.steps} />
          {emails ? (
            <p className="sr-only">
              {emails} email{emails > 1 ? "s" : ""}
            </p>
          ) : null}
        </div>
      </Link>
      <div className="flex shrink-0 items-center">
        {muted ? null : (
          <IconHint
            label={workflow.scope === "all" ? "Tous les funnels" : "Ce funnel"}
            help={workflow.scope === "all" ? "Tourne sur tous les funnels." : "Seulement ce funnel."}
            align="right"
          >
            {workflow.scope === "all" ? (
              <Globe className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Pin className="h-4 w-4" strokeWidth={1.75} />
            )}
          </IconHint>
        )}
        {actions}
      </div>
    </div>
  );
}

function FunnelAction({
  label,
  help,
  workflowId,
  funnelId,
  mode,
  children,
}: {
  label: string;
  help: string;
  workflowId: string;
  funnelId: string;
  mode: "all" | "only" | "add" | "remove";
  children: ReactNode;
}) {
  const [pending, start] = useTransition();
  return (
    <IconHint
      label={label}
      help={help}
      pending={pending}
      onClick={() => start(() => void setWorkflowOnFunnel(workflowId, funnelId, mode))}
    >
      {children}
    </IconHint>
  );
}
