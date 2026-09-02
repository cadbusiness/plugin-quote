import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/db/database.types";

export function hasServiceRoleKey() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante (opération serveur).");
  }
  const env = requireSupabaseEnv();
  return createSupabaseClient<Database>(env.url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
