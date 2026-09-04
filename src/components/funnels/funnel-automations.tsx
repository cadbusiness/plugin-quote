"use client";

import { useTransition } from "react";
import Link from "next/link";
import { setWorkflowOnFunnel } from "@/app/(app)/funnels/actions";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { CreateWorkflowDialog } from "@/components/workflows/create-workflow-dialog";
import { TRIGGER_LABELS, WORKFLOW_STATUS_LABELS } from "@/lib/workflows/labels";
import type { WorkflowStatus, WorkflowTriggerType } from "@/lib/workflows/types";

export type FunnelWorkflowRow = {
  id: string;
  name: string;
  status: WorkflowStatus;
  triggerType: WorkflowTriggerType;
  scope: "all" | "this" | "other";
  steps: string[];
};

const TRIGGER_TONE: Record<WorkflowTriggerType, ChipTone> = {
  "quote.submitted": "emerald",
  "session.abandoned": "amber",
  "quote.status_changed": "violet",
};

export function FunnelAutomations({
  funnelId,
  funnelName,
  workflows,
  funnels,
  statuses,
}: {
  funnelId: string;
  funnelName: string;
  workflows: FunnelWorkflowRow[];
  funnels: { id: string; name: string }[];
  statuses: { slug: string; label: string }[];
}) {
  const assigned = workflows.filter((workflow) => workflow.scope !== "other");
  const available = workflows.filter((workflow) => workflow.scope === "other");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="border-b border-slate-100 px-4 py-3 text-sm text-slate-500 lg:px-6">
        Ce qui part quand ce funnel reçoit une demande ou un abandon. Assignez, limitez ou retirez — le canvas
        reste dans Automatisations.
      </p>
      <Section
        title="Sur ce funnel"
        empty="Aucune automatisation ne tourne encore sur ce funnel."
        items={assigned.map((workflow) => (
          <AutomationRow
            key={workflow.id}
            workflow={workflow}
            actions={
              workflow.scope === "all" ? (
                <>
                  <Action
                    label="Limiter ici"
                    onClick={(start) => start(() => void setWorkflowOnFunnel(workflow.id, funnelId, "only"))}
                  />
                  <Action
                    label="Retirer"
                    muted
                    onClick={(start) => start(() => void setWorkflowOnFunnel(workflow.id, funnelId, "remove"))}
                  />
                </>
              ) : (
                <>
                  <Action
                    label="Tous les funnels"
                    muted
                    onClick={(start) => start(() => void setWorkflowOnFunnel(workflow.id, funnelId, "all"))}
                  />
                  <Action
                    label="Retirer"
                    muted
                    onClick={(start) => start(() => void setWorkflowOnFunnel(workflow.id, funnelId, "remove"))}
                  />
                </>
              )
            }
          />
        ))}
      />
      <Section
        title="Disponibles"
        empty="Tous vos parcours sont déjà liés à ce funnel."
        items={available.map((workflow) => (
          <AutomationRow
            key={workflow.id}
            workflow={workflow}
            actions={
              <Action
                label="Assigner"
                onClick={(start) => start(() => void setWorkflowOnFunnel(workflow.id, funnelId, "add"))}
              />
            }
          />
        ))}
      />
      <CreateWorkflowDialog
        funnels={funnels}
        statuses={statuses}
        presetFunnelId={funnelId}
        addLabel={`Ajouter une automatisation pour ${funnelName}`}
      />
    </div>
  );
}

function Section({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: React.ReactNode[];
}) {
  return (
    <section>
      <p className="border-b border-slate-100 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 lg:px-6">
        {title}
      </p>
      {items.length ? items : <p className="border-b border-slate-100 px-4 py-6 text-sm text-slate-500 lg:px-6">{empty}</p>}
    </section>
  );
}

function AutomationRow({
  workflow,
  actions,
}: {
  workflow: FunnelWorkflowRow;
  actions: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start gap-3 border-b border-slate-100 px-4 py-4 lg:px-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/automations/${workflow.id}`} className="font-medium text-slate-900 hover:text-[#C2410C]">
            {workflow.name}
          </Link>
          <Chip tone={workflow.status === "active" ? "emerald" : "amber"}>
            {WORKFLOW_STATUS_LABELS[workflow.status]}
          </Chip>
          <Chip tone={TRIGGER_TONE[workflow.triggerType]}>{TRIGGER_LABELS[workflow.triggerType]}</Chip>
          <Chip tone={workflow.scope === "all" ? "slate" : "orange"}>
            {workflow.scope === "all" ? "Tous les funnels" : workflow.scope === "this" ? "Ce funnel" : "Autres"}
          </Chip>
        </div>
        {workflow.steps.length ? (
          <p className="mt-1.5 text-sm text-slate-500">{workflow.steps.join(" → ")}</p>
        ) : (
          <p className="mt-1.5 text-sm text-slate-400">Canvas encore vide</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {actions}
        <Link href={`/automations/${workflow.id}`} className="text-sm text-slate-500 hover:text-slate-900">
          Canvas
        </Link>
      </div>
    </div>
  );
}

function Action({
  label,
  muted,
  onClick,
}: {
  label: string;
  muted?: boolean;
  onClick: (start: ReturnType<typeof useTransition>[1]) => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => onClick(startTransition)}
      className={`text-sm font-medium disabled:opacity-50 ${muted ? "text-slate-500 hover:text-slate-900" : "text-[#C2410C]"}`}
    >
      {pending ? "…" : label}
    </button>
  );
}
