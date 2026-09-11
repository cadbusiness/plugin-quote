import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { latestVersion, sortByVersionDesc, unreadCount } from "./unread";

export type ProductUpdate = {
  id: string;
  version: string;
  title: string;
  items: string[];
  releasedAt: string | null;
  createdAt: string;
};

export type ProductUpdatesSnapshot = {
  entries: ProductUpdate[];
  lastSeenVersion: string | null;
  latest: string | null;
  unread: number;
};

export const EMPTY_UPDATES_SNAPSHOT: ProductUpdatesSnapshot = {
  entries: [],
  lastSeenVersion: null,
  latest: null,
  unread: 0,
};

export function parseItems(value: Json | null | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function formatReleaseDate(iso: string | null): string | null {
  if (!iso) return null;
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function loadProductUpdates(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ProductUpdatesSnapshot> {
  const [{ data: rows, error: rowsError }, { data: read, error: readError }] = await Promise.all([
    supabase
      .from("product_updates")
      .select("id, version, title, items, released_at, created_at"),
    supabase
      .from("product_update_reads")
      .select("last_seen_version")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (rowsError || readError) return EMPTY_UPDATES_SNAPSHOT;

  const entries = sortByVersionDesc(
    (rows ?? []).map((row) => ({
      id: row.id,
      version: row.version,
      title: row.title,
      items: parseItems(row.items),
      releasedAt: row.released_at,
      createdAt: row.created_at,
    })),
  );
  const lastSeenVersion = read?.last_seen_version ?? null;
  return {
    entries,
    lastSeenVersion,
    latest: latestVersion(entries),
    unread: unreadCount(entries, lastSeenVersion),
  };
}

export async function countUnreadProductUpdates(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const snapshot = await loadProductUpdates(supabase, userId);
  return snapshot.unread;
}
