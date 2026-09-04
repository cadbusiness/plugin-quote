"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { saveWorkflowDefinition } from "@/app/(app)/workflow-actions";
import { WorkflowEditContext, type InsertTarget, type PaletteType } from "@/components/workflows/edit-context";
import { InsertEdge } from "@/components/workflows/insert-edge";
import { NodeInspector } from "@/components/workflows/inspector";
import { nodeTypes, type CanvasNodeData } from "@/components/workflows/nodes";
import { StepPicker } from "@/components/workflows/step-picker";
import { NODE_TYPE_LABELS } from "@/lib/workflows/labels";
import type { CanvasActions } from "@/components/workflows/workflow-editor";
import { StepIcon } from "@/components/workflows/step-icon";
import {
  parseDefinition,
  type WorkflowDefinition,
  type WorkflowNode,
  type WorkflowNodeType,
} from "@/lib/workflows/types";

const edgeTypes = { insert: InsertEdge };

const PALETTE: Exclude<WorkflowNodeType, "trigger">[] = ["send_email", "wait", "branch", "assign", "set_status", "exit"];

const DEFAULTS: Record<Exclude<WorkflowNodeType, "trigger">, WorkflowNode["data"]> = {
  send_email: { label: "Envoyer un email", templateKind: "prospect_confirm", recipient: "prospect" },
  wait: { label: "Attendre", waitHours: 24, waitFrom: "now" },
  branch: { label: "Condition", conditions: [{ id: "oui", field: "score_label", value: "hot" }] },
  assign: { label: "Assigner" },
  set_status: { label: "Changer le statut", statusSlug: "contacted" },
  exit: { label: "Fin" },
};

function toFlow(
  definition: WorkflowDefinition,
  stats: Record<string, { ok: number; waiting: number; failed: number }>,
): { nodes: Node<CanvasNodeData>[]; edges: Edge[] } {
  return {
    nodes: definition.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: { ...node.data, nodeType: node.type, stats: stats[node.id] },
      deletable: node.type !== "trigger",
    })),
    edges: definition.edges.map((edge) => ({
      id: edge.id,
      type: "insert",
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? undefined,
    })),
  };
}

function fromFlow(nodes: Node[], edges: Edge[]): WorkflowDefinition {
  return parseDefinition({
    nodes: nodes.map((node) => {
      const raw = { ...(node.data as CanvasNodeData) };
      const { nodeType: _type, stats: _stats, ...data } = raw;
      return {
        id: node.id,
        type: (node.type ?? "exit") as WorkflowNodeType,
        position: node.position,
        data,
      };
    }),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
    })),
  });
}

export function WorkflowCanvas(props: {
  workflowId: string;
  definition: WorkflowDefinition;
  stats: Record<string, { ok: number; waiting: number; failed: number }>;
  templates: { kind: string; subject: string }[];
  statuses: { slug: string; label: string }[];
  members: { userId: string; label: string }[];
  onActionsChange?: (actions: CanvasActions) => void;
}) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}

function CanvasInner({
  workflowId,
  definition,
  stats,
  templates,
  statuses,
  members,
  onActionsChange,
}: {
  workflowId: string;
  definition: WorkflowDefinition;
  stats: Record<string, { ok: number; waiting: number; failed: number }>;
  templates: { kind: string; subject: string }[];
  statuses: { slug: string; label: string }[];
  members: { userId: string; label: string }[];
  onActionsChange?: (actions: CanvasActions) => void;
}) {
  const initial = useMemo(() => toFlow(definition, stats), [definition, stats]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [picker, setPicker] = useState<{ target: InsertTarget; x: number; y: number } | null>(null);
  const [history, setHistory] = useState<WorkflowDefinition[]>([definition]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const instance = useRef<ReactFlowInstance<Node<CanvasNodeData>, Edge> | null>(null);

  const snapshot = useCallback((nextNodes: Node[], nextEdges: Edge[]) => {
    const next = fromFlow(nextNodes, nextEdges);
    setHistory((current) => [...current.slice(-29), next]);
    setDirty(true);
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) => {
        const next = addEdge({ ...connection, id: `e-${crypto.randomUUID()}`, type: "insert" }, current);
        snapshot(nodes, next);
        return next;
      });
    },
    [nodes, setEdges, snapshot],
  );

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/qb-node") as Exclude<WorkflowNodeType, "trigger">;
    if (!PALETTE.includes(type) || !instance.current) return;
    const position = instance.current.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const id = crypto.randomUUID();
    const node: Node<CanvasNodeData> = {
      id,
      type,
      position,
      data: { ...DEFAULTS[type], nodeType: type },
    };
    setNodes((current) => {
      const next = [...current, node];
      snapshot(next, edges);
      return next;
    });
    setSelectedId(id);
  }

  const selected = nodes.find((node) => node.id === selectedId);

  function updateSelected(data: WorkflowNode["data"]) {
    setNodes((current) => {
      const next = current.map((node) =>
        node.id === selectedId ? { ...node, data: { ...data, nodeType: node.type as WorkflowNodeType } } : node,
      );
      snapshot(next, edges);
      return next;
    });
  }

  function deleteSelected() {
    if (!selectedId || selected?.type === "trigger") return;
    const incoming = edges.filter((edge) => edge.target === selectedId);
    const outgoing = edges.filter((edge) => edge.source === selectedId);
    const rest = edges.filter((edge) => edge.source !== selectedId && edge.target !== selectedId);
    let nextEdges = rest;
    if (incoming.length === 1 && outgoing.length === 1) {
      nextEdges = [
        ...rest,
        {
          id: `e-${crypto.randomUUID()}`,
          type: "insert",
          source: incoming[0].source,
          target: outgoing[0].target,
          sourceHandle: incoming[0].sourceHandle,
        },
      ];
    } else if (incoming.length > 1 && outgoing.length === 1) {
      nextEdges = [
        ...rest,
        ...incoming.map((edge) => ({
          id: `e-${crypto.randomUUID()}`,
          type: "insert",
          source: edge.source,
          target: outgoing[0].target,
          sourceHandle: edge.sourceHandle,
        })),
      ];
    }
    const nextNodes = nodes.filter((node) => node.id !== selectedId);
    setNodes(nextNodes);
    setEdges(nextEdges);
    snapshot(nextNodes, nextEdges);
    setSelectedId(null);
  }

  function openPicker(target: InsertTarget, clientX: number, clientY: number) {
    setPicker({ target, x: clientX, y: clientY });
  }

  function insertNode(type: PaletteType, target: InsertTarget) {
    const id = crypto.randomUUID();
    let position = { x: 280, y: 180 };
    let nextEdges = [...edges];

    if (target.mode === "edge") {
      const edge = edges.find((item) => item.id === target.edgeId);
      const source = nodes.find((node) => node.id === edge?.source);
      const dest = nodes.find((node) => node.id === edge?.target);
      if (edge && source && dest) {
        position = {
          x: (source.position.x + dest.position.x) / 2,
          y: (source.position.y + dest.position.y) / 2,
        };
        nextEdges = [
          ...edges.filter((item) => item.id !== edge.id),
          {
            id: `e-${crypto.randomUUID()}`,
            type: "insert",
            source: edge.source,
            target: id,
            sourceHandle: edge.sourceHandle,
          },
          { id: `e-${crypto.randomUUID()}`, type: "insert", source: id, target: edge.target },
        ];
      }
    } else {
      const source = nodes.find((node) => node.id === target.nodeId);
      const outgoing = edges.filter(
        (edge) => edge.source === target.nodeId && (target.handle == null || edge.sourceHandle === target.handle),
      );
      if (source) {
        position = { x: source.position.x, y: source.position.y + 150 };
      }
      if (outgoing.length === 1) {
        const edge = outgoing[0];
        const dest = nodes.find((node) => node.id === edge.target);
        if (source && dest) {
          position = {
            x: (source.position.x + dest.position.x) / 2,
            y: (source.position.y + dest.position.y) / 2,
          };
        }
        nextEdges = [
          ...edges.filter((item) => item.id !== edge.id),
          {
            id: `e-${crypto.randomUUID()}`,
            type: "insert",
            source: edge.source,
            target: id,
            sourceHandle: edge.sourceHandle,
          },
          { id: `e-${crypto.randomUUID()}`, type: "insert", source: id, target: edge.target },
        ];
      } else {
        const offset = outgoing.length * 220;
        position = {
          x: (source?.position.x ?? 280) + offset,
          y: (source?.position.y ?? 0) + 150,
        };
        nextEdges = [
          ...edges,
          {
            id: `e-${crypto.randomUUID()}`,
            type: "insert",
            source: target.nodeId,
            target: id,
            sourceHandle: target.handle ?? undefined,
          },
        ];
      }
    }

    const node: Node<CanvasNodeData> = {
      id,
      type,
      position,
      data: { ...DEFAULTS[type], nodeType: type },
    };
    const nextNodes = [...nodes, node];
    setNodes(nextNodes);
    setEdges(nextEdges);
    snapshot(nextNodes, nextEdges);
    setSelectedId(id);
    setPicker(null);
  }

  const undo = useCallback(() => {
    if (history.length < 2) return;
    const previous = history[history.length - 2];
    const flow = toFlow(previous, stats);
    setNodes(flow.nodes);
    setEdges(flow.edges);
    setHistory((current) => current.slice(0, -1));
    setDirty(true);
  }, [history, setEdges, setNodes, stats]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await saveWorkflowDefinition(workflowId, JSON.stringify(fromFlow(nodes, edges)));
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [edges, nodes, workflowId]);

  useEffect(() => {
    onActionsChange?.({
      dirty,
      canUndo: history.length > 1,
      saving,
      save,
      undo,
    });
  }, [dirty, history.length, onActionsChange, save, saving, undo]);

  return (
    <WorkflowEditContext.Provider value={{ openPicker }}>
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">Étapes</p>
          <p className="mt-1 text-xs text-slate-400">Cliquez un + sur le parcours, ou glissez ici</p>
        </div>
        <div className="space-y-1 p-2">
          {PALETTE.map((type) => (
            <div
              key={type}
              draggable
              onDragStart={(event) => event.dataTransfer.setData("application/qb-node", type)}
              onClick={() => {
                const after = selectedId && selected?.type !== "exit" ? selectedId : "trigger";
                insertNode(type, { mode: "after", nodeId: after });
              }}
              className="flex cursor-grab items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-orange-50"
            >
              <StepIcon type={type} />
              {NODE_TYPE_LABELS[type]}
            </div>
          ))}
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-slate-50" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: "insert", interactionWidth: 28 }}
          onNodesChange={(changes) => {
            onNodesChange(changes);
            if (changes.some((change) => change.type === "position" && change.dragging === false)) setDirty(true);
          }}
          onEdgesChange={(changes) => {
            onEdgesChange(changes);
            if (changes.some((change) => change.type === "remove")) setDirty(true);
          }}
          onConnect={onConnect}
          onInit={(value) => {
            instance.current = value;
          }}
          onNodeClick={(_, node) => setSelectedId(node.id)}
          onPaneClick={() => setSelectedId(null)}
          onNodesDelete={(deleted) => {
            const ids = new Set(deleted.map((node) => node.id));
            setEdges((current) => current.filter((edge) => !ids.has(edge.source) && !ids.has(edge.target)));
            setDirty(true);
          }}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#e2e8f0" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {selected ? (
        <NodeInspector
          node={{
            id: selected.id,
            type: (selected.type ?? "exit") as WorkflowNodeType,
            position: selected.position,
            data: selected.data,
          }}
          templates={templates}
          statuses={statuses}
          members={members}
          onChange={updateSelected}
          onDelete={deleteSelected}
        />
      ) : null}
      {picker ? (
        <StepPicker
          x={picker.x}
          y={picker.y}
          onPick={(type) => insertNode(type, picker.target)}
          onClose={() => setPicker(null)}
        />
      ) : null}
    </div>
    </WorkflowEditContext.Provider>
  );
}
