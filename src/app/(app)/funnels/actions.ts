"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import {
  defaultQuestion,
  defaultStepCopy,
  isQuestionType,
  isScreenType,
} from "@/lib/funnels/builder";
import { mergeFunnelTracking } from "@/lib/funnels/tracking";
import type { QuestionOptions, QuestionType, ScreenType } from "@/lib/wizard/types";
import { parseTriggerConfig } from "@/lib/workflows/types";
import type { Json } from "@/lib/db/database.types";

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
  if (mode === "remove") {
    if (!ids.length) {
      const { data: others } = await supabase
        .from("configurators")
        .select("id")
        .eq("organization_id", ctx.organization.id)
        .neq("id", funnelId);
      ids = (others ?? []).map((row) => row.id);
    } else {
      ids = ids.filter((id) => id !== funnelId);
    }
  }
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

function touchFunnel(funnelId: string) {
  revalidatePath("/funnels");
  revalidatePath(`/funnels/${funnelId}`);
}

async function loadFunnelSteps(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
  funnelId: string,
) {
  const { data } = await supabase
    .from("wizard_steps")
    .select("*")
    .eq("organization_id", orgId)
    .eq("configurator_id", funnelId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function saveFunnelStepOrder(funnelId: string, orderedIds: string[]) {
  const ctx = await requireAdmin();
  if (!funnelId || !orderedIds.length) return;
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("wizard_steps")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("organization_id", ctx.organization.id)
        .eq("configurator_id", funnelId),
    ),
  );
  touchFunnel(funnelId);
}

export async function addFunnelStep(funnelId: string, screenType: ScreenType, afterId: string | null) {
  const ctx = await requireAdmin();
  if (!funnelId || !isScreenType(screenType)) return null;
  const supabase = await createClient();
  const steps = await loadFunnelSteps(supabase, ctx.organization.id, funnelId);
  const afterIndex = afterId ? steps.findIndex((step) => step.id === afterId) : -1;
  const insertAt = afterId ? (afterIndex >= 0 ? afterIndex + 1 : steps.length) : 0;
  for (let index = steps.length - 1; index >= insertAt; index -= 1) {
    await supabase
      .from("wizard_steps")
      .update({ sort_order: index + 1 })
      .eq("id", steps[index].id)
      .eq("organization_id", ctx.organization.id);
  }
  const copy = defaultStepCopy(screenType);
  const { data: created } = await supabase
    .from("wizard_steps")
    .insert({
      organization_id: ctx.organization.id,
      configurator_id: funnelId,
      sort_order: insertAt,
      title: copy.title,
      subtitle: copy.subtitle,
      screen_type: screenType,
    })
    .select("id")
    .single();
  if (created && screenType === "questions") {
    const question = defaultQuestion("visual_choice", 0);
    await supabase.from("wizard_questions").insert({
      organization_id: ctx.organization.id,
      step_id: created.id,
      ...question,
      options: question.options as unknown as Json,
    });
  }
  touchFunnel(funnelId);
  return created?.id ?? null;
}

export async function ensureCatalogSteps(funnelId: string) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  const steps = await loadFunnelSteps(supabase, ctx.organization.id, funnelId);
  if (!steps.some((step) => step.screen_type === "suggestions")) {
    const contactIndex = steps.findIndex((step) => step.screen_type === "contact");
    const afterId =
      contactIndex > 0 ? steps[contactIndex - 1].id : contactIndex === 0 ? null : (steps.at(-1)?.id ?? null);
    await addFunnelStep(funnelId, "suggestions", afterId);
  }
  const latest = await loadFunnelSteps(supabase, ctx.organization.id, funnelId);
  if (!latest.some((step) => step.screen_type === "customize")) {
    const suggestions = latest.find((step) => step.screen_type === "suggestions");
    await addFunnelStep(funnelId, "customize", suggestions?.id ?? latest.at(-1)?.id ?? null);
  }
  const next = await loadFunnelSteps(supabase, ctx.organization.id, funnelId);
  return next.find((step) => step.screen_type === "suggestions")?.id ?? null;
}

export async function deleteFunnelStep(funnelId: string, stepId: string) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  const steps = await loadFunnelSteps(supabase, ctx.organization.id, funnelId);
  if (steps.length <= 1) return;
  await supabase
    .from("wizard_questions")
    .delete()
    .eq("step_id", stepId)
    .eq("organization_id", ctx.organization.id);
  await supabase
    .from("wizard_steps")
    .delete()
    .eq("id", stepId)
    .eq("organization_id", ctx.organization.id)
    .eq("configurator_id", funnelId);
  touchFunnel(funnelId);
}

export async function updateFunnelStep(
  funnelId: string,
  stepId: string,
  patch: { title?: string; subtitle?: string | null },
) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  const next: { title?: string; subtitle?: string | null } = {};
  if (patch.title !== undefined) {
    const title = patch.title.trim();
    if (!title) return;
    next.title = title;
  }
  if (patch.subtitle !== undefined) next.subtitle = patch.subtitle?.trim() || null;
  if (!Object.keys(next).length) return;
  await supabase
    .from("wizard_steps")
    .update(next)
    .eq("id", stepId)
    .eq("organization_id", ctx.organization.id)
    .eq("configurator_id", funnelId);
  touchFunnel(funnelId);
}

export async function addFunnelQuestion(funnelId: string, stepId: string, type: QuestionType) {
  const ctx = await requireAdmin();
  if (!isQuestionType(type)) return null;
  const supabase = await createClient();
  const { data: step } = await supabase
    .from("wizard_steps")
    .select("id, screen_type")
    .eq("id", stepId)
    .eq("organization_id", ctx.organization.id)
    .eq("configurator_id", funnelId)
    .maybeSingle();
  if (!step || step.screen_type !== "questions") return null;
  const { count } = await supabase
    .from("wizard_questions")
    .select("id", { count: "exact", head: true })
    .eq("step_id", stepId)
    .eq("organization_id", ctx.organization.id);
  const question = defaultQuestion(type, count ?? 0);
  const { data: created } = await supabase
    .from("wizard_questions")
    .insert({
      organization_id: ctx.organization.id,
      step_id: stepId,
      ...question,
      options: question.options as unknown as Json,
    })
    .select("id")
    .single();
  touchFunnel(funnelId);
  return created?.id ?? null;
}

export async function deleteFunnelQuestion(funnelId: string, questionId: string) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("wizard_questions")
    .delete()
    .eq("id", questionId)
    .eq("organization_id", ctx.organization.id);
  touchFunnel(funnelId);
}

export async function updateFunnelQuestion(
  funnelId: string,
  questionId: string,
  patch: {
    label?: string;
    helpText?: string | null;
    required?: boolean;
    type?: QuestionType;
    options?: QuestionOptions;
  },
) {
  const ctx = await requireAdmin();
  const supabase = await createClient();
  const next: {
    label?: string;
    help_text?: string | null;
    required?: boolean;
    type?: string;
    options?: Json;
  } = {};
  if (patch.label !== undefined) {
    const label = patch.label.trim();
    if (!label) return;
    next.label = label;
  }
  if (patch.helpText !== undefined) next.help_text = patch.helpText?.trim() || null;
  if (patch.required !== undefined) next.required = patch.required;
  if (patch.type !== undefined && isQuestionType(patch.type)) next.type = patch.type;
  if (patch.options !== undefined) next.options = patch.options as unknown as Json;
  if (!Object.keys(next).length) return;
  await supabase
    .from("wizard_questions")
    .update(next)
    .eq("id", questionId)
    .eq("organization_id", ctx.organization.id);
  touchFunnel(funnelId);
}
