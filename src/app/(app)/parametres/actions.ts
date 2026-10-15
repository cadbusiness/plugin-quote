"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { isFunnelFamilyId, mergeOrgFamily, type FunnelFamilyId } from "@/lib/funnels/families";
import { normalizeSalesEmail } from "@/lib/org/sales-identity";

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

export async function saveSalesIdentity(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");

  const emailRaw = String(formData.get("sales_email") ?? "").trim();
  const nameRaw = String(formData.get("sales_name") ?? "").replace(/\s+/g, " ").trim();
  let salesEmail: string | null = null;
  if (emailRaw) {
    salesEmail = normalizeSalesEmail(emailRaw);
    if (!salesEmail) redirect("/parametres?sales=invalid");
  }
  const salesName = nameRaw ? nameRaw.slice(0, 120) : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .update({ sales_email: salesEmail, sales_name: salesName })
    .eq("id", ctx.organization.id)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    console.error("saveSalesIdentity", error?.message ?? "aucune ligne");
    redirect("/parametres?sales=error");
  }

  revalidatePath("/parametres");
  redirect("/parametres?sales=ok");
}
