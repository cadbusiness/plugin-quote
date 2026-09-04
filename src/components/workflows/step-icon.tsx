import { Clock, Flag, GitBranch, LogOut, Mail, UserPlus, Zap } from "lucide-react";
import type { WorkflowNodeType } from "@/lib/workflows/types";

const ICONS: Record<WorkflowNodeType, typeof Mail> = {
  trigger: Zap,
  send_email: Mail,
  wait: Clock,
  branch: GitBranch,
  assign: UserPlus,
  set_status: Flag,
  exit: LogOut,
};

const COLORS: Record<WorkflowNodeType, string> = {
  trigger: "text-emerald-600",
  send_email: "text-sky-600",
  wait: "text-violet-600",
  branch: "text-[#E85D04]",
  assign: "text-indigo-600",
  set_status: "text-amber-600",
  exit: "text-slate-500",
};

export function StepIcon({
  type,
  className = "h-4 w-4",
}: {
  type: WorkflowNodeType;
  className?: string;
}) {
  const Icon = ICONS[type];
  return <Icon className={`shrink-0 ${COLORS[type]} ${className}`} strokeWidth={1.75} aria-hidden />;
}
