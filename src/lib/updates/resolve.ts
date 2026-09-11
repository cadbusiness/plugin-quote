import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { loadProductUpdates, type ProductUpdatesSnapshot } from "./load";
import { isSemver } from "./semver";
import { BUNDLED_UPDATES, snapshotFromEntries } from "./seed";

export function cookieLastSeen(value: string | null | undefined): string | null {
  if (!value || !isSemver(value)) return null;
  return value;
}

export async function resolveProductUpdates(
  supabase: SupabaseClient<Database>,
  userId: string,
  cookieVersion: string | null | undefined,
): Promise<ProductUpdatesSnapshot> {
  const snapshot = await loadProductUpdates(supabase, userId);
  if (snapshot.source === "db") return snapshot;
  return snapshotFromEntries(BUNDLED_UPDATES, cookieLastSeen(cookieVersion), "missing");
}

export async function countUnreadProductUpdates(
  supabase: SupabaseClient<Database>,
  userId: string,
  cookieVersion: string | null | undefined,
): Promise<number> {
  const snapshot = await resolveProductUpdates(supabase, userId, cookieVersion);
  return snapshot.unread;
}
