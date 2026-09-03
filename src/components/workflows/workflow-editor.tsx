"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { saveWorkflowMeta, setWorkflowStatus } from "@/app/(app)/workflow-actions";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { ClickableRow } from "@/components/ui/clickable-row";
import { TRIGGER_LABELS, WORKFLOW_STATUS_LABELS, RUN_STATUS_LABELS } from "@/lib/workflows/labels";
import type { WorkflowDefinition, WorkflowStatus, WorkflowTriggerType } from "@/lib/workflows/types";

const WorkflowCanvas = dynamic(() => import("./canvas").then((mod) => mod.WorkflowCanvas), { ssr: false });

const STATUS_TONE: Record<WorkflowStatus, ChipTone> = {
  draft: "amber",
  active: "emerald",
  archived: "slate",
};

const RUN_TONE: Record<string, ChipTone> = {
  running: "sky",
  waiting: "amber",
  completed: "emerald",
  failed: "rose",
  exited: "slate",
};

export type EditorRun = {
  id: string;
  subjectType: string;
  subjectId: string;
  participant: string;
  status: string;
  hint: string;
  when: string;
  href: string | null;
};

export function WorkflowEditor({
  workflow,
  templates,
  statuses,
  members,
  stats,
  runs,
}: {
  workflow: {
    id: string;
    name: string;
    status: WorkflowStatus;
    triggerType: WorkflowTriggerType;
    configuratorIds: string[];
    abandonHours: number;
    statusSlug: string;
    definition: WorkflowDefinition;
  };
  templates: { kind: string; subject: string }[];
  statuses: { slug: string; label: string }[];
  members: { userId: string; label: string }[];
  stats: Record<string, { ok: number; waiting: number; failed: number }>;
  runs: EditorRun[];
}) {
  const [tab, setTab] = useState<"canvas" | "runs">("canvas");
  const [pending, startTransition] = useTransition();

  function activate() {
    startTransition(() => {
      void setWorkflowStatus(workflow.id, workflow.status === "active" ? "draft" : "active");
    });
  }

  return (
    <ListPanel className="min-h-0">
      <ListToolbar>
        <Link href="/automations" className="text-sm underline">
          Tous les parcours
        </Link>
        <form action={saveWorkflowMeta} className="mr-auto flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={workflow.id} />
          <input type="hidden" name="trigger_type" value={workflow.triggerType} />
          {workflow.configuratorIds.map((id) => (
            <input key={id} type="hidden" name="funnels" value={id} />
          ))}
          <input type="hidden" name="abandon_hours" value={workflow.abandonHours} />
          <input type="hidden" name="status_slug" value={workflow.statusSlug} />
          <input
            name="name"
            defaultValue={workflow.name}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          />
          <Chip tone={STATUS_TONE[workflow.status]}>{WORKFLOW_STATUS_LABELS[workflow.status]}</Chip>
          <Chip tone="slate">{TRIGGER_LABELS[workflow.triggerType]}</Chip>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">Renommer</button>
        </form>
        <button
          type="button"
          onClick={() => setTab("canvas")}
          className={`text-sm ${tab === "canvas" ? "font-medium text-[#E85D04]" : "underline"}`}
        >
          Parcours
        </button>
        <button
          type="button"
          onClick={() => setTab("runs")}
          className={`text-sm ${tab === "runs" ? "font-medium text-[#E85D04]" : "underline"}`}
        >
          Exécutions
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={activate}
          className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {workflow.status === "active" ? "Désactiver" : "Activer"}
        </button>
      </ListToolbar>

      {tab === "canvas" ? (
        <div className="flex min-h-[36rem] flex-1 flex-col lg:min-h-[calc(100dvh-10rem)]">
          <WorkflowCanvas
            workflowId={workflow.id}
            definition={workflow.definition}
            stats={stats}
            templates={templates}
            statuses={statuses}
            members={members}
          />
        </div>
      ) : (
        <>
          <DataTable headers={["Participant", "État", "Étape", "Quand"]}>
            {runs.map((run) => {
              const cells = (
                <>
                  <td className="px-4 py-3 lg:px-6">
                    <div className="font-medium text-slate-900">{run.participant}</div>
                    <div className="text-xs text-slate-500">
                      {run.subjectType === "quote" ? "Demande" : "Session"}
                    </div>
                  </td>
                  <td className="px-4 py-3 lg:px-6">
                    <Chip tone={RUN_TONE[run.status] ?? "slate"}>
                      {RUN_STATUS_LABELS[run.status as keyof typeof RUN_STATUS_LABELS] ?? run.status}
                    </Chip>
                  </td>
                  <td className="px-4 py-3 text-slate-600 lg:px-6">{run.hint}</td>
                  <td className="px-4 py-3 text-slate-400 lg:px-6">{run.when}</td>
                </>
              );
              return run.href ? (
                <ClickableRow key={run.id} href={run.href}>
                  {cells}
                </ClickableRow>
              ) : (
                <tr key={run.id} className="border-b border-slate-100">
                  {cells}
                </tr>
              );
            })}
          </DataTable>
          {runs.length === 0 ? (
            <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
              Aucune exécution pour l’instant. Le parcours se lance au prochain déclencheur.
            </p>
          ) : null}
        </>
      )}
    </ListPanel>
  );
}
