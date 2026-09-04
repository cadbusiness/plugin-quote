"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { StepIcon } from "@/components/workflows/step-icon";
import { nodeTitle } from "@/lib/workflows/labels";
import type { WorkflowNodeData, WorkflowNodeType } from "@/lib/workflows/types";

const TONES: Record<WorkflowNodeType, string> = {
  trigger: "border-slate-200 bg-white",
  send_email: "border-slate-200 bg-white",
  wait: "border-slate-200 bg-white",
  branch: "border-slate-200 bg-white",
  assign: "border-slate-200 bg-white",
  set_status: "border-slate-200 bg-white",
  exit: "border-slate-200 bg-white",
};

export type CanvasNodeData = WorkflowNodeData & {
  nodeType: WorkflowNodeType;
  stats?: { ok: number; waiting: number; failed: number };
};

function Card({
  type,
  selected,
  children,
  source = true,
  target = true,
  handles,
}: {
  type: WorkflowNodeType;
  selected?: boolean;
  children: React.ReactNode;
  source?: boolean;
  target?: boolean;
  handles?: { id: string; label: string }[];
}) {
  return (
    <div
      className={`w-56 rounded-lg border bg-white shadow-sm ${TONES[type]} ${
        selected ? "ring-2 ring-[#E85D04]" : ""
      }`}
    >
      {target ? <Handle type="target" position={Position.Top} className="!h-2.5 !w-2.5 !bg-slate-400" /> : null}
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <StepIcon type={type} className="mt-0.5 h-4 w-4" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {handles?.length ? (
        <div className="flex justify-around border-t border-white/60 px-2 pb-1 pt-1">
          {handles.map((handle) => (
            <div key={handle.id} className="relative px-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              {handle.label}
              <Handle
                type="source"
                position={Position.Bottom}
                id={handle.id}
                className="!h-2.5 !w-2.5 !bg-slate-400"
              />
            </div>
          ))}
        </div>
      ) : source ? (
        <Handle type="source" position={Position.Bottom} className="!h-2.5 !w-2.5 !bg-slate-400" />
      ) : null}
    </div>
  );
}

function Stats({ stats }: { stats?: { ok: number; waiting: number; failed: number } }) {
  if (!stats || (!stats.ok && !stats.waiting && !stats.failed)) return null;
  return (
    <div className="mt-1 flex gap-2 text-[10px] text-slate-500">
      {stats.ok ? <span>{stats.ok} ok</span> : null}
      {stats.waiting ? <span>{stats.waiting} attente</span> : null}
      {stats.failed ? <span className="text-rose-600">{stats.failed} erreur</span> : null}
    </div>
  );
}

export function TriggerNode({ data, selected }: NodeProps) {
  const node = data as CanvasNodeData;
  return (
    <Card type="trigger" selected={selected} target={false}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">Déclencheur</p>
      <p className="text-sm font-semibold text-slate-900">{node.label ?? "Démarrage"}</p>
      <Stats stats={node.stats} />
    </Card>
  );
}

export function ActionNode({ data, selected, type }: NodeProps) {
  const nodeType = (type as WorkflowNodeType) ?? "send_email";
  const node = { ...(data as CanvasNodeData), type: nodeType };
  return (
    <Card type={nodeType} selected={selected} source={nodeType !== "exit"} target={nodeType !== "trigger"}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {nodeType === "send_email"
          ? "Email"
          : nodeType === "wait"
            ? "Attente"
            : nodeType === "assign"
              ? "Assignation"
              : nodeType === "set_status"
                ? "Statut"
                : "Fin"}
      </p>
      <p className="text-sm font-semibold text-slate-900">{nodeTitle({ id: "", type: nodeType, position: { x: 0, y: 0 }, data: node })}</p>
      <Stats stats={node.stats} />
    </Card>
  );
}

export function BranchNode({ data, selected }: NodeProps) {
  const node = data as CanvasNodeData;
  const handles = [
    ...(node.conditions ?? []).map((condition) => ({ id: condition.id, label: condition.id })),
    { id: "else", label: "sinon" },
  ];
  return (
    <Card type="branch" selected={selected} source={false} handles={handles}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-orange-700">Condition</p>
      <p className="text-sm font-semibold text-slate-900">{node.label ?? "Branche"}</p>
      <Stats stats={node.stats} />
    </Card>
  );
}

export const nodeTypes = {
  trigger: TriggerNode,
  send_email: ActionNode,
  wait: ActionNode,
  assign: ActionNode,
  set_status: ActionNode,
  exit: ActionNode,
  branch: BranchNode,
};
