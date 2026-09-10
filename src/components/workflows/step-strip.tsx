import type { WorkflowNodeType } from "@/lib/workflows/types";
import { StepIcon } from "@/components/workflows/step-icon";

export function StepStrip({
  steps,
  max = 5,
}: {
  steps: { type: WorkflowNodeType; label: string }[];
  max?: number;
}) {
  if (!steps.length) return null;
  const shown = steps.slice(0, max);
  const rest = steps.length - shown.length;
  return (
    <span className="mt-1 flex items-center gap-1" title={steps.map((step) => step.label).join(" → ")}>
      {shown.map((step, i) => (
        <StepIcon key={`${step.type}-${i}`} type={step.type} className="h-3.5 w-3.5" />
      ))}
      {rest > 0 ? <span className="text-[11px] tabular-nums text-slate-400">+{rest}</span> : null}
    </span>
  );
}
