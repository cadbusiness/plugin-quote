"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { compareSemver, isSemver } from "@/lib/updates/semver";
import { UPDATES_SEEN_COOKIE } from "@/lib/updates/seed";

export async function markProductUpdatesSeen(version: string) {
  const ctx = await getOrgContext();
  if (!ctx || !isSemver(version)) return;

  const cookieStore = await cookies();
  cookieStore.set(UPDATES_SEEN_COOKIE, version, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const supabase = await createClient();
  const [{ data: entry }, { data: current }] = await Promise.all([
    supabase.from("product_updates").select("version").eq("version", version).maybeSingle(),
    supabase
      .from("product_update_reads")
      .select("last_seen_version")
      .eq("user_id", ctx.userId)
      .maybeSingle(),
  ]);
  if (!entry) {
    revalidatePath("/", "layout");
    return;
  }
  if (current?.last_seen_version && compareSemver(version, current.last_seen_version) <= 0) {
    revalidatePath("/", "layout");
    return;
  }

  await supabase.from("product_update_reads").upsert({
    user_id: ctx.userId,
    last_seen_version: version,
    seen_at: new Date().toISOString(),
  });
  revalidatePath("/", "layout");
}
