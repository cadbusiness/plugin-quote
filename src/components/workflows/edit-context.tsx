"use client";

import { createContext, useContext } from "react";
import type { WorkflowNodeType } from "@/lib/workflows/types";

export type PaletteType = Exclude<WorkflowNodeType, "trigger">;

export type InsertTarget =
  | { mode: "edge"; edgeId: string }
  | { mode: "after"; nodeId: string; handle?: string | null };

type WorkflowEditContextValue = {
  openPicker: (target: InsertTarget, clientX: number, clientY: number) => void;
};

export const WorkflowEditContext = createContext<WorkflowEditContextValue | null>(null);

export function useWorkflowEdit() {
  return useContext(WorkflowEditContext);
}
