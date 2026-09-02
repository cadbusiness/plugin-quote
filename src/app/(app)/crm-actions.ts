"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { logActivity, notifyUser } from "@/lib/crm/activity";
import { sendTemplateEmail } from "@/lib/email/send";

export async function changeQuoteStatus(quoteId: string, statusId: string) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const { data: status } = await supabase
    .from("quote_statuses")
    .select("*")
    .eq("id", statusId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!status) return;
  await supabase
    .from("quotes")
    .update({ status_id: status.id, status: status.slug })
    .eq("id", quoteId)
    .eq("organization_id", ctx.organization.id);
  await logActivity(supabase, {
    organizationId: ctx.organization.id,
    quoteId,
    actorId: ctx.userId,
    type: "status_changed",
    payload: { status: status.slug, label: status.label },
  });
  revalidatePath("/devis");
  revalidatePath(`/devis/${quoteId}`);
}

export async function assignQuote(quoteId: string, userId: string) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const assigned = userId || null;
  await supabase
    .from("quotes")
    .update({ assigned_to: assigned })
    .eq("id", quoteId)
    .eq("organization_id", ctx.organization.id);
  await logActivity(supabase, {
    organizationId: ctx.organization.id,
    quoteId,
    actorId: ctx.userId,
    type: "assigned",
    payload: { assigned_to: assigned },
  });
  if (assigned) {
    const { data: quote } = await supabase.from("quotes").select("contact_name").eq("id", quoteId).single();
    await notifyUser(supabase, {
      organizationId: ctx.organization.id,
      userId: assigned,
      quoteId,
      type: "assigned",
      body: `Demande assignée : ${quote?.contact_name ?? "prospect"}`,
    });
  }
  revalidatePath("/devis");
  revalidatePath(`/devis/${quoteId}`);
}

export async function addQuoteNote(quoteId: string, content: string) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const trimmed = content.trim();
  if (!trimmed) return;
  const supabase = await createClient();
  await supabase.from("quote_notes").insert({
    organization_id: ctx.organization.id,
    quote_id: quoteId,
    author_id: ctx.userId,
    content: trimmed,
  });
  await logActivity(supabase, {
    organizationId: ctx.organization.id,
    quoteId,
    actorId: ctx.userId,
    type: "note_added",
  });
  revalidatePath(`/devis/${quoteId}`);
}

export async function inviteMember(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "sales");
  if (!email || !["admin", "sales"].includes(role)) return;
  const supabase = await createClient();
  const token = crypto.randomUUID();
  await supabase.from("memberships").insert({
    organization_id: ctx.organization.id,
    role,
    status: "pending",
    invited_email: email,
    invite_token: token,
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await sendTemplateEmail({
    to: email,
    subject: `Invitation ${ctx.organization.name}`,
    body: `Vous êtes invité sur QuoteBuilder (${ctx.organization.name}).\n${appUrl}/invite/${token}`,
  });
  revalidatePath("/equipe");
}

export async function updateMemberRole(id: string, role: string) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  if (!["admin", "sales"].includes(role)) return;
  const supabase = await createClient();
  await supabase
    .from("memberships")
    .update({ role })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/equipe");
}

export async function toggleAutomation(id: string, active: boolean) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const supabase = await createClient();
  await supabase
    .from("automation_flows")
    .update({ active })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/automations");
}

export async function saveAutomationDelay(id: string, hours: number) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const supabase = await createClient();
  await supabase
    .from("automation_flows")
    .update({ delay_hours: Math.max(0, hours) })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/automations");
}

export async function saveGaMeasurementId(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  const supabase = await createClient();
  const value = String(formData.get("ga_measurement_id") ?? "").trim();
  await supabase
    .from("organizations")
    .update({ ga_measurement_id: value || null })
    .eq("id", ctx.organization.id);
  revalidatePath("/stats");
}

export async function markNotificationsRead() {
  const ctx = await getOrgContext();
  if (!ctx) return;
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", ctx.userId)
    .is("read_at", null);
  revalidatePath("/devis");
}
