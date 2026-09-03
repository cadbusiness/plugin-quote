"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { insertFunnelFromTemplate, parseCreateFunnelForm } from "@/lib/funnels/create";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateQuoteStatus(quoteId: string, status: string) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  await supabase
    .from("quotes")
    .update({ status })
    .eq("id", quoteId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/devis");
}

export async function saveWebhook(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const url = String(formData.get("url") ?? "");
  const secret = String(formData.get("secret") ?? "");
  if (!url || !secret) return;
  await supabase.from("webhooks").insert({
    organization_id: ctx.organization.id,
    url,
    secret,
  });
  revalidatePath("/webhooks");
}

export async function toggleWebhook(id: string, isActive: boolean) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  await supabase
    .from("webhooks")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/webhooks");
}

export async function saveEmailTemplate(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase
    .from("email_templates")
    .update({
      subject: String(formData.get("subject") ?? ""),
      body: String(formData.get("body") ?? ""),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/templates");
}

export async function savePdfTemplate(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase
    .from("pdf_templates")
    .update({
      title: String(formData.get("title") ?? ""),
      intro: String(formData.get("intro") ?? ""),
      footer: String(formData.get("footer") ?? ""),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/templates");
}

export async function reorderStep(stepId: string, direction: "up" | "down") {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const { data: steps } = await supabase
    .from("wizard_steps")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("sort_order", { ascending: true });
  if (!steps) return;
  const index = steps.findIndex((s) => s.id === stepId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= steps.length) return;
  const a = steps[index];
  const b = steps[swapWith];
  await supabase.from("wizard_steps").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("wizard_steps").update({ sort_order: a.sort_order }).eq("id", b.id);
  revalidatePath("/funnels");
}

export async function updateQuestion(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  await supabase
    .from("wizard_questions")
    .update({
      label: String(formData.get("label") ?? ""),
      help_text: String(formData.get("help_text") ?? ""),
      required: formData.get("required") === "on",
    })
    .eq("id", String(formData.get("id")))
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/funnels");
}

export async function createFunnel(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const input = parseCreateFunnelForm(formData);
  if (!input) return;
  const supabase = await createClient();
  const funnel = await insertFunnelFromTemplate(supabase, ctx.organization.id, input);
  if (!funnel) return;
  revalidatePath("/funnels");
  redirect(`/funnels/${funnel.id}`);
}

export async function saveFunnel(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase
    .from("configurators")
    .update({
      name: String(formData.get("name") ?? "").trim() || "Funnel",
      wizard_enabled: formData.get("wizard_enabled") === "on",
      chat_enabled: formData.get("chat_enabled") === "on",
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/funnels");
  revalidatePath(`/funnels/${id}`);
}

