"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { compareSemver, isSemver } from "@/lib/updates/semver";

export async function markProductUpdatesSeen(version: string) {
  const ctx = await getOrgContext();
  if (!ctx || !isSemver(version)) return;

  const supabase = await createClient();
  const [{ data: entry }, { data: current }] = await Promise.all([
    supabase.from("product_updates").select("version").eq("version", version).maybeSingle(),
    supabase
      .from("product_update_reads")
      .select("last_seen_version")
      .eq("user_id", ctx.userId)
      .maybeSingle(),
  ]);
  if (!entry) return;
  if (current?.last_seen_version && compareSemver(version, current.last_seen_version) <= 0) {
    return;
  }

  await supabase.from("product_update_reads").upsert({
    user_id: ctx.userId,
    last_seen_version: version,
    seen_at: new Date().toISOString(),
  });
  revalidatePath("/", "layout");
}
