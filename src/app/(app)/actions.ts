"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { parseProductCsv } from "@/lib/catalog/csv";
import { parseConditions } from "@/lib/catalog/rules";

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

export async function saveProduct(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
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
      sku: String(formData.get("sku") ?? "") || null,
      category: String(formData.get("category") ?? "") || null,
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/produits");
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
  revalidatePath("/wizard");
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
  revalidatePath("/wizard");
}

export async function saveRule(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
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
      conditions: parseConditions(formData) as unknown as import("@/lib/db/database.types").Json,
      product_ids: formData.getAll("product_ids").map(String).filter(Boolean),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/produits");
}

export async function importProductsCsv(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) return;
  const { data: cfg } = await (await createClient())
    .from("configurators")
    .select("id")
    .eq("organization_id", ctx.organization.id)
    .limit(1)
    .maybeSingle();
  if (!cfg) return;
  const supabase = await createClient();
  const rows = parseProductCsv(await file.text());
  if (!rows.length) return;
  await supabase.from("products").insert(
    rows.map((row) => ({
      organization_id: ctx.organization.id,
      configurator_id: cfg.id,
      name: row.name,
      sku: row.sku,
      description: row.description,
      price_min: row.price_min,
      price_max: row.price_max,
      tags: row.tags,
      category: row.category,
    })),
  );
  await supabase.from("product_imports").insert({
    organization_id: ctx.organization.id,
    source: "csv",
    status: "done",
    row_count: rows.length,
  });
  revalidatePath("/produits");
}

export async function saveWooConnection(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const site_url = String(formData.get("site_url") ?? "").trim();
  const consumer_key = String(formData.get("consumer_key") ?? "").trim();
  const consumer_secret = String(formData.get("consumer_secret") ?? "").trim();
  if (!site_url || !consumer_key || !consumer_secret) return;
  const { data: existing } = await supabase
    .from("woo_connections")
    .select("id")
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (existing) {
    await supabase
      .from("woo_connections")
      .update({ site_url, consumer_key, consumer_secret })
      .eq("id", existing.id);
  } else {
    await supabase.from("woo_connections").insert({
      organization_id: ctx.organization.id,
      site_url,
      consumer_key,
      consumer_secret,
    });
  }
  revalidatePath("/woocommerce");
}
