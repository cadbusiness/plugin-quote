import { Flag, Inbox, UserRoundX } from "lucide-react";
import type { WorkflowTriggerType } from "@/lib/workflows/types";

const META: Record<WorkflowTriggerType, { Icon: typeof Inbox; wrap: string }> = {
  "quote.submitted": { Icon: Inbox, wrap: "bg-emerald-50 text-emerald-700" },
  "session.abandoned": { Icon: UserRoundX, wrap: "bg-amber-50 text-amber-800" },
  "quote.status_changed": { Icon: Flag, wrap: "bg-violet-50 text-violet-800" },
};

export function TriggerGlyph({
  type,
  size = "md",
}: {
  type: WorkflowTriggerType;
  size?: "sm" | "md";
}) {
  const meta = META[type] ?? META["quote.submitted"];
  const Icon = meta.Icon;
  const box = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span className={`inline-flex ${box} shrink-0 items-center justify-center rounded-lg ${meta.wrap}`}>
      <Icon className={icon} strokeWidth={1.75} aria-hidden />
    </span>
  );
}
