"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { isFunnelFamilyId, mergeOrgFamily, type FunnelFamilyId } from "@/lib/funnels/families";

export async function saveOrgFamily(family: FunnelFamilyId) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  if (!isFunnelFamilyId(family)) return;

  const supabase = await createClient();
  await supabase
    .from("organizations")
    .update({ branding: mergeOrgFamily(ctx.organization.branding, family) })
    .eq("id", ctx.organization.id);

  revalidatePath("/parametres");
  revalidatePath("/funnels");
}
