"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { mergeFunnelTracking } from "@/lib/funnels/tracking";
import { parseTriggerConfig } from "@/lib/workflows/types";

async function requireAdmin() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  return ctx;
}

export async function renameFunnel(funnelId: string, name: string) {
  const ctx = await requireAdmin();
  const trimmed = name.trim();
  if (!funnelId || !trimmed) return;
  const supabase = await createClient();
  await supabase
    .from("configurators")
    .update({ name: trimmed })
    .eq("id", funnelId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/funnels");
  revalidatePath(`/funnels/${funnelId}`);
}

export async function setFunnelActive(funnelId: string, active: boolean) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("configurators")
    .update({ is_active: active })
    .eq("id", funnelId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/funnels");
  revalidatePath(`/funnels/${funnelId}`);
}

export async function setFunnelModes(funnelId: string, wizard: boolean, chat: boolean) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("configurators")
    .update({
      wizard_enabled: wizard || !chat,
      chat_enabled: chat,
    })
    .eq("id", funnelId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/funnels");
  revalidatePath(`/funnels/${funnelId}`);
}

export async function saveFunnelTracking(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("configurators")
    .select("theme")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!current) return;
  await supabase
    .from("configurators")
    .update({
      theme: mergeFunnelTracking(current.theme, {
        ga: String(formData.get("ga") ?? ""),
        metaPixel: String(formData.get("meta_pixel") ?? ""),
        gtm: String(formData.get("gtm") ?? ""),
      }),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath(`/funnels/${id}`);
}

export async function setWorkflowOnFunnel(workflowId: string, funnelId: string, mode: "all" | "only" | "add" | "remove") {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  const { data: workflow } = await supabase
    .from("workflows")
    .select("id, trigger_config")
    .eq("id", workflowId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!workflow) return;
  const config = parseTriggerConfig(workflow.trigger_config);
  let ids = config.configuratorIds ?? [];
  if (mode === "all") ids = [];
  if (mode === "only") ids = [funnelId];
  if (mode === "add" && !ids.includes(funnelId)) ids = [...ids, funnelId];
  if (mode === "remove") ids = ids.filter((id) => id !== funnelId);
  await supabase
    .from("workflows")
    .update({
      trigger_config: { ...config, configuratorIds: ids },
      updated_at: new Date().toISOString(),
    })
    .eq("id", workflowId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/automations");
  revalidatePath(`/automations/${workflowId}`);
  revalidatePath(`/funnels/${funnelId}`);
}
