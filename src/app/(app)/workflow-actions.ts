"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import type { Json } from "@/lib/db/database.types";
import { emptyStarter, parseDefinition, type WorkflowStatus, type WorkflowTriggerType } from "@/lib/workflows/types";
import { defaultWorkflowName } from "@/lib/workflows/defaults";

async function requireAdmin() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  return ctx;
}

function readTrigger(value: FormDataEntryValue | null): WorkflowTriggerType {
  const raw = String(value ?? "quote.submitted");
  if (raw === "session.abandoned" || raw === "quote.status_changed") return raw;
  return "quote.submitted";
}

function readConfig(formData: FormData) {
  const funnels = formData.getAll("funnels").map(String).filter(Boolean);
  const abandonHours = Number(formData.get("abandon_hours") ?? 1);
  const statusSlug = String(formData.get("status_slug") ?? "").trim();
  return {
    configuratorIds: funnels,
    abandonHours: Number.isFinite(abandonHours) ? Math.max(0, abandonHours) : 1,
    statusSlug: statusSlug || undefined,
  };
}

export async function createWorkflow(formData: FormData) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  const triggerType = readTrigger(formData.get("trigger_type"));
  const name = String(formData.get("name") ?? "").trim() || defaultWorkflowName(triggerType);
  const { data, error } = await supabase
    .from("workflows")
    .insert({
      organization_id: ctx.organization.id,
      name,
      status: "draft",
      trigger_type: triggerType,
      trigger_config: readConfig(formData) as unknown as Json,
      definition: emptyStarter(triggerType) as unknown as Json,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Impossible de créer le parcours");
  revalidatePath("/automations");
  revalidatePath("/funnels");
  redirect(`/automations/${data.id}`);
}

export async function saveWorkflowDefinition(workflowId: string, definitionJson: string) {
  const ctx = await requireAdmin();
  const parsed = parseDefinition(JSON.parse(definitionJson) as Json);
  const supabase = await createClient();
  await supabase
    .from("workflows")
    .update({
      definition: parsed as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", workflowId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/automations");
  revalidatePath(`/automations/${workflowId}`);
}

export async function renameWorkflow(workflowId: string, name: string) {
  const ctx = await requireAdmin();
  const trimmed = name.trim();
  if (!workflowId || !trimmed) return;
  const supabase = await createClient();
  await supabase
    .from("workflows")
    .update({ name: trimmed, updated_at: new Date().toISOString() })
    .eq("id", workflowId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/automations");
  revalidatePath(`/automations/${workflowId}`);
}

export async function saveWorkflowMeta(formData: FormData) {
  const ctx = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;
  const supabase = await createClient();
  await supabase
    .from("workflows")
    .update({
      name,
      trigger_type: readTrigger(formData.get("trigger_type")),
      trigger_config: readConfig(formData) as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/automations");
  revalidatePath(`/automations/${id}`);
}

export async function setWorkflowStatus(workflowId: string, status: WorkflowStatus) {
  const ctx = await requireAdmin();
  if (!["draft", "active", "archived"].includes(status)) return;
  const supabase = await createClient();
  await supabase
    .from("workflows")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", workflowId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/automations");
  revalidatePath(`/automations/${workflowId}`);
}
