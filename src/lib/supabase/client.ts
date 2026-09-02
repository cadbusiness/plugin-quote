import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/db/database.types";

export function createClient() {
  const env = requireSupabaseEnv();
  return createBrowserClient<Database>(env.url, env.anonKey);
}
