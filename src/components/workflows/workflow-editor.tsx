"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft } from "lucide-react";
import { renameWorkflow, setWorkflowStatus } from "@/app/(app)/workflow-actions";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { ClickableRow } from "@/components/ui/clickable-row";
import { TRIGGER_LABELS, RUN_STATUS_LABELS } from "@/lib/workflows/labels";
import type { WorkflowDefinition, WorkflowStatus, WorkflowTriggerType } from "@/lib/workflows/types";

const WorkflowCanvas = dynamic(() => import("./canvas").then((mod) => mod.WorkflowCanvas), { ssr: false });

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

export type CanvasActions = {
  dirty: boolean;
  canUndo: boolean;
  saving: boolean;
  save: () => Promise<void>;
  undo: () => void;
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
  const [canvas, setCanvas] = useState<CanvasActions | null>(null);

  function activate() {
    startTransition(() => {
      void setWorkflowStatus(workflow.id, workflow.status === "active" ? "draft" : "active");
    });
  }

  function commitName(value: string) {
    const next = value.trim();
    if (!next || next === workflow.name) return;
    startTransition(() => {
      void renameWorkflow(workflow.id, next);
    });
  }

  const scope = workflow.configuratorIds.length ? `${workflow.configuratorIds.length} funnel${workflow.configuratorIds.length > 1 ? "s" : ""}` : "Tous les funnels";

  return (
    <ListPanel className="min-h-0">
      <div className="sticky top-0 z-20 bg-white">
        <ListToolbar>
          <Link
            href="/automations"
            className="-ml-1 inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-1.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Parcours
          </Link>
          <div className="mr-auto min-w-0">
            <input
              defaultValue={workflow.name}
              aria-label="Nom du parcours"
              onBlur={(event) => commitName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") (event.target as HTMLInputElement).blur();
              }}
              className="w-full min-w-[10rem] max-w-sm bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <Chip tone="slate">{TRIGGER_LABELS[workflow.triggerType]}</Chip>
              <span className="text-xs text-slate-400">{scope}</span>
            </div>
          </div>
          {tab === "canvas" && canvas?.dirty ? (
            <>
              <button
                type="button"
                onClick={canvas.undo}
                disabled={!canvas.canUndo}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void canvas.save()}
                disabled={canvas.saving}
                className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-50"
              >
                {canvas.saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </>
          ) : null}
          <button
            type="button"
            role="switch"
            aria-checked={workflow.status === "active"}
            disabled={pending}
            onClick={activate}
            className={`inline-flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 disabled:opacity-50 ${
              workflow.status === "active"
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <span className="text-left">
              <span
                className={`block text-sm font-medium leading-none ${
                  workflow.status === "active" ? "text-emerald-800" : "text-slate-700"
                }`}
              >
                {workflow.status === "active" ? "Actif" : "Inactif"}
              </span>
              <span className="mt-0.5 block text-[11px] leading-none text-slate-500">
                {workflow.status === "active" ? "Les emails partent" : "Aucun envoi"}
              </span>
            </span>
            <span
              aria-hidden
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                workflow.status === "active" ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-[left] ${
                  workflow.status === "active" ? "left-4" : "left-0.5"
                }`}
              />
            </span>
          </button>
        </ListToolbar>
        <nav className="flex items-end gap-6 border-b border-slate-200 px-4 lg:px-6">
          {(
            [
              ["canvas", "Parcours"],
              ["runs", "Exécutions"],
            ] as const
          ).map(([id, label]) => {
            const on = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`relative py-2.5 text-sm ${on ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
              >
                {label}
                {id === "runs" ? (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                      on ? "bg-orange-50 text-[#C2410C]" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {runs.length}
                  </span>
                ) : null}
                <span
                  aria-hidden
                  className={`absolute inset-x-0 -bottom-px h-0.5 ${on ? "bg-[#E85D04]" : "bg-transparent"}`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {tab === "canvas" ? (
        <div className="flex min-h-[36rem] flex-1 flex-col lg:min-h-[calc(100dvh-12rem)]">
          <WorkflowCanvas
            workflowId={workflow.id}
            definition={workflow.definition}
            stats={stats}
            templates={templates}
            statuses={statuses}
            members={members}
            onActionsChange={setCanvas}
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
