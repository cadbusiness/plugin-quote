import type { WorkflowTriggerConfig, WorkflowTriggerType } from "@/lib/workflows/types";

export const DEFAULT_ABANDON_HOURS = 1;
export const ACTIVE_RUN_STATUSES = ["running", "waiting"] as const;

export function isOneShotTrigger(type: WorkflowTriggerType): boolean {
  return type === "quote.submitted" || type === "session.abandoned";
}

export function isActiveRunStatus(status: string): boolean {
  return status === "running" || status === "waiting";
}

export function resolveAbandonHours(config: WorkflowTriggerConfig): number {
  if (typeof config.abandonHours === "number" && Number.isFinite(config.abandonHours)) {
    return Math.max(0, config.abandonHours);
  }
  return DEFAULT_ABANDON_HOURS;
}

export function isSessionAbandonedDue(
  lastActivityAt: string,
  abandonHours: number,
  nowMs = Date.now(),
): boolean {
  const last = Date.parse(lastActivityAt);
  if (!Number.isFinite(last)) return false;
  return nowMs - last >= abandonHours * 3600_000;
}

export function minAbandonHours(configs: WorkflowTriggerConfig[]): number {
  if (!configs.length) return DEFAULT_ABANDON_HOURS;
  return Math.min(...configs.map(resolveAbandonHours));
}

/**
 * Cron safety net after a quote is closed: keep only status-changed runs
 * that target this closed status. Generic (unfiltered) status-changed runs
 * stay — they may have just been started by the close itself.
 * Submitted nurture waits are always exited.
 */
export function shouldExitRunOnClosedQuote(
  triggerType: string,
  statusSlugFilter: string | undefined,
  currentStatusSlug: string,
): boolean {
  if (triggerType === "quote.submitted") return true;
  if (triggerType !== "quote.status_changed") return false;
  return Boolean(statusSlugFilter && statusSlugFilter !== currentStatusSlug);
}
