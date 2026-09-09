import type { ConnectionSettings } from "@/lib/integrations/types";

export type SyncGuard = {
  updated_at?: string | null;
  synced_at?: string | null;
  sync_lock?: boolean | null;
};

export function wasEditedLocally(row: SyncGuard, graceMs = 1500) {
  if (!row.updated_at || !row.synced_at) return false;
  return new Date(row.updated_at).getTime() > new Date(row.synced_at).getTime() + graceMs;
}

/** Une fiche boutique ne doit pas écraser le catalogue QuoteBuilder. */
export function shouldSkipOverwrite(previous: SyncGuard | undefined, settings: ConnectionSettings) {
  if (!previous) return false;
  if (!settings.pullFromStore) return true;
  if (previous.sync_lock) return true;
  if (!settings.protectLocalEdits) return false;
  return wasEditedLocally(previous);
}

export function shouldPushLocal(row: SyncGuard, settings: ConnectionSettings) {
  return Boolean(settings.pushToStore && (row.sync_lock || wasEditedLocally(row)));
}
