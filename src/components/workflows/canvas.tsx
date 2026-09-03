"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
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
import { NodeInspector } from "@/components/workflows/inspector";
import { nodeTypes, type CanvasNodeData } from "@/components/workflows/nodes";
import { NODE_TYPE_LABELS } from "@/lib/workflows/labels";
import {
  parseDefinition,
  type WorkflowDefinition,
  type WorkflowNode,
  type WorkflowNodeType,
} from "@/lib/workflows/types";

const PALETTE: WorkflowNodeType[] = ["send_email", "wait", "branch", "assign", "set_status", "exit"];

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
}: {
  workflowId: string;
  definition: WorkflowDefinition;
  stats: Record<string, { ok: number; waiting: number; failed: number }>;
  templates: { kind: string; subject: string }[];
  statuses: { slug: string; label: string }[];
  members: { userId: string; label: string }[];
}) {
  const initial = useMemo(() => toFlow(definition, stats), [definition, stats]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
        const next = addEdge({ ...connection, id: `e-${crypto.randomUUID()}` }, current);
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
    setNodes((current) => {
      const next = current.filter((node) => node.id !== selectedId);
      setEdges((currentEdges) => {
        const nextEdges = currentEdges.filter((edge) => edge.source !== selectedId && edge.target !== selectedId);
        snapshot(next, nextEdges);
        return nextEdges;
      });
      return next;
    });
    setSelectedId(null);
  }

  function undo() {
    if (history.length < 2) return;
    const previous = history[history.length - 2];
    const flow = toFlow(previous, stats);
    setNodes(flow.nodes);
    setEdges(flow.edges);
    setHistory((current) => current.slice(0, -1));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      await saveWorkflowDefinition(workflowId, JSON.stringify(fromFlow(nodes, edges)));
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-52 shrink-0 flex-col border-r border-slate-200 bg-white">
        <p className="border-b border-slate-100 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
          Actions
        </p>
        <div className="space-y-2 p-3">
          {PALETTE.map((type) => (
            <div
              key={type}
              draggable
              onDragStart={(event) => event.dataTransfer.setData("application/qb-node", type)}
              className="cursor-grab rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:border-[#E85D04]"
            >
              {NODE_TYPE_LABELS[type]}
            </div>
          ))}
        </div>
        <div className="mt-auto space-y-2 border-t border-slate-100 p-3">
          <button type="button" onClick={undo} className="w-full text-left text-sm underline">
            Annuler
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !dirty}
            className="w-full rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : dirty ? "Enregistrer" : "Enregistré"}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-slate-50" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
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
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#cbd5e1" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable />
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
    </div>
  );
}
