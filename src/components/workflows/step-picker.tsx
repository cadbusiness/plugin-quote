"use client";

import { NODE_TYPE_LABELS } from "@/lib/workflows/labels";
import { StepIcon } from "@/components/workflows/step-icon";
import type { PaletteType } from "@/components/workflows/edit-context";

const OPTIONS: PaletteType[] = ["send_email", "wait", "branch", "assign", "set_status", "exit"];

export function StepPicker({
  x,
  y,
  onPick,
  onClose,
}: {
  x: number;
  y: number;
  onPick: (type: PaletteType) => void;
  onClose: () => void;
}) {
  const left = Math.min(x, window.innerWidth - 240);
  const top = Math.min(y, window.innerHeight - 320);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        role="menu"
        className="absolute w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        style={{ left, top }}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="border-b border-slate-100 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
          Ajouter une étape
        </p>
        <div className="p-1">
          {OPTIONS.map((type) => (
            <button
              key={type}
              type="button"
              role="menuitem"
              onClick={() => onPick(type)}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-orange-50"
            >
              <StepIcon type={type} />
              {NODE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
