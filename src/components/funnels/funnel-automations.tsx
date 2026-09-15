"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import { setWorkflowAbandonWait, setWorkflowOnFunnel } from "@/app/(app)/funnels/actions";
import { CreateWorkflowDialog } from "@/components/workflows/create-workflow-dialog";
import { ClickableRow } from "@/components/ui/clickable-row";
import { Chip } from "@/components/ui/chip";
import { DataTable } from "@/components/ui/list-panel";
import {
  AUTOMATION_WINDOW_DAYS,
  formatHours,
  type FunnelAutomationAvailable,
  type FunnelAutomationBoard,
  type FunnelAutomationGap,
  type FunnelAutomationRow,
} from "@/lib/funnels/automations";
import type { WorkflowTriggerType } from "@/lib/workflows/types";

export function FunnelAutomations({
  funnelId,
  funnelName,
  board,
  funnels,
  statuses,
}: {
  funnelId: string;
  funnelName: string;
  board: FunnelAutomationBoard;
  funnels: { id: string; name: string }[];
  statuses: { slug: string; label: string }[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createTrigger, setCreateTrigger] = useState<WorkflowTriggerType | undefined>(undefined);
  const [createStatus, setCreateStatus] = useState<string | undefined>(undefined);

  function openCreate(trigger?: WorkflowTriggerType, statusSlug?: string) {
    setCreateTrigger(trigger);
    setCreateStatus(statusSlug);
    setCreateOpen(true);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2.5 lg:px-6">
        <div className="mr-auto min-w-0">
          <p className="text-sm font-semibold text-slate-900">Automatisations</p>
          <p className="text-sm text-slate-500">{board.summary || "Aucun parcours attaché"}</p>
        </div>
        <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
          {AUTOMATION_WINDOW_DAYS}j
        </span>
        <AttachMenu
          available={board.available}
          funnelId={funnelId}
          onCreate={() => openCreate()}
        />
      </div>

      <DataTable
        headers={["Parcours", "Déclencheur", "État", `${AUTOMATION_WINDOW_DAYS} j`, ""]}
        columnClassNames={["", "", "", "text-right", "w-10"]}
      >
        {board.rows.map((row) => (
          <WorkflowRow
            key={row.id}
            row={row}
            funnelId={funnelId}
            open={openId === row.id}
            onToggle={() => setOpenId((current) => (current === row.id ? null : row.id))}
          />
        ))}
        {board.gaps.map((gap) => (
          <GapRow
            key={gap.slotId}
            gap={gap}
            funnelId={funnelId}
            available={board.available}
            onCreate={() => openCreate(gap.triggerType, gap.statusSlug)}
          />
        ))}
      </DataTable>

      {board.rows.length === 0 && board.gaps.length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
          Aucun parcours n’est encore lié à {funnelName}.
        </p>
      ) : null}

      <CreateWorkflowDialog
        funnels={funnels}
        statuses={statuses}
        presetFunnelId={funnelId}
        hideAddRow
        open={createOpen}
        onOpenChange={setCreateOpen}
        presetTrigger={createTrigger}
        presetStatusSlug={createStatus}
      />
    </div>
  );
}

function WorkflowRow({
  row,
  funnelId,
  open,
  onToggle,
}: {
  row: FunnelAutomationRow;
  funnelId: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <ClickableRow
        onSelect={onToggle}
        className={open ? "bg-slate-50/80 hover:bg-slate-50/80" : undefined}
      >
        <td className="h-[52px] px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-medium text-slate-900">{row.name}</span>
            {row.scope === "all" ? (
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                Global
              </span>
            ) : null}
          </div>
        </td>
        <td className="h-[52px] px-4 text-slate-600 lg:px-6">{row.triggerLabel}</td>
        <td className="h-[52px] px-4 lg:px-6">
          <StateMark state={row.state} label={row.stateLabel} />
        </td>
        <td
          className={`h-[52px] px-4 text-right tabular-nums lg:px-6 ${
            row.volumeHot ? "bg-red-50 font-medium text-red-700" : "text-slate-600"
          }`}
        >
          {row.volume}
        </td>
        <td className="h-[52px] px-3 text-right">
          <ChevronDown
            className={`inline h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </td>
      </ClickableRow>
      {open ? (
        <tr className="border-b border-slate-100">
          <td colSpan={5} className="px-4 py-4 lg:px-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-start">
              <Timeline row={row} />
              <div className="space-y-3">
                {row.diagnostic ? (
                  <p className="rounded-lg bg-orange-50 px-3 py-2.5 text-sm text-orange-950">
                    {row.diagnostic.message}
                  </p>
                ) : null}
                <RowActions row={row} funnelId={funnelId} />
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function Timeline({ row }: { row: FunnelAutomationRow }) {
  if (!row.timeline.length) {
    return <p className="text-sm text-slate-400">Canvas encore vide</p>;
  }
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {row.timeline.length} étape{row.timeline.length > 1 ? "s" : ""} sur {formatHours(row.durationHours)}
      </p>
      <ol className="mt-2 space-y-1.5">
        {row.timeline.map((step) => (
          <li key={step.id} className="flex items-baseline gap-3 text-sm">
            <span className="w-12 shrink-0 tabular-nums text-slate-400">+{formatHours(step.offsetHours)}</span>
            <span className="w-[4.5rem] shrink-0">
              <Chip tone={step.kind === "wait" ? "amber" : "slate"}>{step.kindLabel}</Chip>
            </span>
            <span className="font-medium text-slate-900">{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RowActions({ row, funnelId }: { row: FunnelAutomationRow; funnelId: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {row.diagnostic ? (
        <Action
          label={row.diagnostic.actionLabel}
          primary
          onClick={(start) =>
            start(() => void setWorkflowAbandonWait(row.id, funnelId, row.diagnostic!.actionMinutes))
          }
        />
      ) : null}
      <Link
        href={`/automations/${row.id}`}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Canvas
      </Link>
      {row.scope === "all" ? (
        <Action
          label="Limiter ici"
          onClick={(start) => start(() => void setWorkflowOnFunnel(row.id, funnelId, "only"))}
        />
      ) : (
        <Action
          label="Tous les funnels"
          muted
          onClick={(start) => start(() => void setWorkflowOnFunnel(row.id, funnelId, "all"))}
        />
      )}
      <Action
        label="Détacher"
        muted
        onClick={(start) => start(() => void setWorkflowOnFunnel(row.id, funnelId, "remove"))}
      />
    </div>
  );
}

function GapRow({
  gap,
  funnelId,
  available,
  onCreate,
}: {
  gap: FunnelAutomationGap;
  funnelId: string;
  available: FunnelAutomationAvailable[];
  onCreate: () => void;
}) {
  const matches = available.filter(
    (item) => item.triggerType === gap.triggerType && (!gap.statusSlug || item.statusSlug === gap.statusSlug),
  );
  const [pending, startTransition] = useTransition();

  function attach() {
    if (matches[0]) {
      startTransition(() => void setWorkflowOnFunnel(matches[0].id, funnelId, "add"));
      return;
    }
    onCreate();
  }

  return (
    <ClickableRow onSelect={attach} className="text-slate-400 hover:bg-slate-50">
      <td className="h-[52px] px-4 lg:px-6">—</td>
      <td className="h-[52px] px-4 lg:px-6">{gap.triggerLabel}</td>
      <td className="h-[52px] px-4 lg:px-6">Non couvert</td>
      <td className="h-[52px] px-4 text-right lg:px-6">—</td>
      <td className="h-[52px] px-3 text-right">
        <button
          type="button"
          disabled={pending}
          aria-label={`Attacher un parcours pour ${gap.triggerLabel}`}
          onClick={(event) => {
            event.stopPropagation();
            attach();
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#E85D04] hover:bg-orange-50 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </td>
    </ClickableRow>
  );
}

function AttachMenu({
  available,
  funnelId,
  onCreate,
}: {
  available: FunnelAutomationAvailable[];
  funnelId: string;
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          if (!available.length) {
            onCreate();
            return;
          }
          setOpen((value) => !value);
        }}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        Attacher
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 min-w-56 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {available.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                startTransition(() => void setWorkflowOnFunnel(item.id, funnelId, "add"));
              }}
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-orange-50 hover:text-[#C2410C] disabled:opacity-50"
            >
              {item.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onCreate();
            }}
            className="block w-full border-t border-slate-100 px-3 py-2 text-left text-sm font-medium text-[#C2410C] hover:bg-orange-50"
          >
            Nouveau parcours
          </button>
        </div>
      ) : null}
    </div>
  );
}

function StateMark({ state, label }: { state: FunnelAutomationRow["state"]; label: string }) {
  const color =
    state === "running" ? "bg-emerald-500" : state === "stalled" ? "bg-red-500" : "bg-slate-300";
  const text = state === "running" ? "text-emerald-800" : state === "stalled" ? "text-red-700" : "text-slate-500";
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} aria-hidden />
      {label}
    </span>
  );
}

function Action({
  label,
  muted,
  primary,
  onClick,
}: {
  label: string;
  muted?: boolean;
  primary?: boolean;
  onClick: (start: ReturnType<typeof useTransition>[1]) => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => onClick(startTransition)}
      className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
        primary
          ? "bg-[#E85D04] text-white hover:bg-[#d35400]"
          : muted
            ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {pending ? "…" : label}
    </button>
  );
}
