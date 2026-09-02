"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateQuoteStatus(quoteId: string, status: string) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");
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
  if (!ctx) redirect("/login");
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
  if (!ctx) redirect("/login");
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
  if (!ctx) redirect("/login");
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
  if (!ctx) redirect("/login");
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

export async function saveProduct(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase
    .from("products")
    .update({
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      price_min: Number(formData.get("price_min") || 0) || null,
      price_max: Number(formData.get("price_max") || 0) || null,
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/produits");
}

export async function reorderStep(stepId: string, direction: "up" | "down") {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");
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
  revalidatePath("/wizard");
}

export async function updateQuestion(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");
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
  revalidatePath("/wizard");
}

export async function saveRule(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase
    .from("suggestion_rules")
    .update({
      name: String(formData.get("name") ?? ""),
      headline: String(formData.get("headline") ?? ""),
      description: String(formData.get("description") ?? ""),
      price_min: Number(formData.get("price_min") || 0) || null,
      price_max: Number(formData.get("price_max") || 0) || null,
      priority: Number(formData.get("priority") || 0),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/produits");
}
