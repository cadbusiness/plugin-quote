"use client";

import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import { Plus } from "lucide-react";
import { useWorkflowEdit } from "@/components/workflows/edit-context";

export function InsertEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
}: EdgeProps) {
  const edit = useWorkflowEdit();
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={path} style={{ stroke: "#94a3b8", strokeWidth: 1.75, ...style }} />
      <EdgeLabelRenderer>
        <button
          type="button"
          aria-label="Insérer une étape"
          className="nodrag nopan absolute flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-[#E85D04] hover:text-[#E85D04]"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          onClick={(event) => {
            event.stopPropagation();
            edit?.openPicker({ mode: "edge", edgeId: id }, event.clientX, event.clientY);
          }}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
