import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** Public names for the document title. Anon can read active funnels; no service role. */
export async function loadMerchantNames(orgSlug: string, configuratorSlug: string) {
  const env = getSupabaseEnv();
  if (!env) return null;
  const supabase = createClient<Database>(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("slug", orgSlug)
    .maybeSingle();
  if (!org) return null;
  const { data: configurator } = await supabase
    .from("configurators")
    .select("name")
    .eq("organization_id", org.id)
    .eq("slug", configuratorSlug)
    .eq("is_active", true)
    .maybeSingle();
  if (!configurator) return null;
  return { orgName: org.name, funnelName: configurator.name };
}
