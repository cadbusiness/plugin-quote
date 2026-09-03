"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { logActivity, notifyUser } from "@/lib/crm/activity";
import { sendTemplateEmail } from "@/lib/email/send";
import { getAppUrl } from "@/lib/supabase/env";

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
  const { data: current } = await supabase
    .from("quotes")
    .select("status_id, status")
    .eq("id", quoteId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!current || current.status_id === status.id) return;
  let fromLabel = current.status;
  if (current.status_id) {
    const { data: previous } = await supabase
      .from("quote_statuses")
      .select("label")
      .eq("id", current.status_id)
      .maybeSingle();
    if (previous?.label) fromLabel = previous.label;
  }
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
    payload: { from: fromLabel, status: status.slug, label: status.label },
  });
  revalidatePath("/devis");
  revalidatePath(`/devis/${quoteId}`);
}

async function syncPrimaryAssignee(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
  quoteId: string,
) {
  const { data: rows } = await supabase
    .from("quote_assignees")
    .select("user_id")
    .eq("quote_id", quoteId)
    .order("created_at", { ascending: true });
  await supabase
    .from("quotes")
    .update({ assigned_to: rows?.[0]?.user_id ?? null })
    .eq("id", quoteId)
    .eq("organization_id", orgId);
  return rows ?? [];
}

export async function toggleQuoteAssignee(quoteId: string, userId: string, on: boolean) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!userId) return;
  const supabase = await createClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select("id, contact_name, organization_id")
    .eq("id", quoteId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!quote) return;
  if (on) {
    await supabase.from("quote_assignees").upsert({
      quote_id: quoteId,
      user_id: userId,
      organization_id: ctx.organization.id,
    });
    await notifyUser(supabase, {
      organizationId: ctx.organization.id,
      userId,
      quoteId,
      type: "assigned",
      body: `Demande assignée : ${quote.contact_name ?? "prospect"}`,
    });
    const { data: member } = await supabase
      .from("memberships")
      .select("invited_email")
      .eq("organization_id", ctx.organization.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (member?.invited_email) {
      await sendTemplateEmail({
        to: member.invited_email,
        subject: `Demande assignée — ${quote.contact_name ?? "prospect"}`,
        body: `Une demande vous a été assignée : ${quote.contact_name ?? "prospect"}.\n${getAppUrl()}/devis/${quoteId}`,
      });
    }
  } else {
    await supabase.from("quote_assignees").delete().eq("quote_id", quoteId).eq("user_id", userId);
  }
  const rows = await syncPrimaryAssignee(supabase, ctx.organization.id, quoteId);
  const { data: members } = await supabase
    .from("memberships")
    .select("user_id, invited_email, role")
    .eq("organization_id", ctx.organization.id)
    .eq("status", "active");
  const labels = rows.map((row) => {
    const member = (members ?? []).find((item) => item.user_id === row.user_id);
    return member?.invited_email || (member?.role === "owner" ? "Propriétaire" : member?.role === "admin" ? "Admin" : "Commercial");
  });
  await logActivity(supabase, {
    organizationId: ctx.organization.id,
    quoteId,
    actorId: ctx.userId,
    type: "assigned",
    payload: { assigned_to: rows[0]?.user_id ?? null, labels },
  });
  revalidatePath("/devis");
  revalidatePath(`/devis/${quoteId}`);
}

export async function logQuoteCall(quoteId: string, note: string) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select("id, contact_phone")
    .eq("id", quoteId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!quote) return;
  await logActivity(supabase, {
    organizationId: ctx.organization.id,
    quoteId,
    actorId: ctx.userId,
    type: "call_logged",
    payload: { note: note.trim(), phone: quote.contact_phone },
  });
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

export async function replyToProspect(quoteId: string, content: string) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const trimmed = content.trim();
  if (!trimmed) return;
  const supabase = await createClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select("id, contact_email, contact_name")
    .eq("id", quoteId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!quote) return;
  await supabase.from("prospect_messages").insert({
    organization_id: ctx.organization.id,
    quote_id: quoteId,
    sender: "team",
    content: trimmed,
  });
  await logActivity(supabase, {
    organizationId: ctx.organization.id,
    quoteId,
    actorId: ctx.userId,
    type: "message_sent",
  });
  if (quote.contact_email) {
    const { data: access } = await supabase
      .from("prospect_access")
      .select("token")
      .eq("quote_id", quoteId)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    const suivi = access ? `${getAppUrl()}/suivi/${access.token}` : "";
    await sendTemplateEmail({
      to: quote.contact_email,
      subject: `Message — ${ctx.organization.name}`,
      body: suivi ? `${trimmed}\n\nRépondre : ${suivi}` : trimmed,
    });
  }
  revalidatePath(`/devis/${quoteId}`);
}

export async function changeQuoteStatusForm(quoteId: string, formData: FormData) {
  await changeQuoteStatus(quoteId, String(formData.get("status_id") ?? ""));
}

export async function toggleQuoteAssigneeForm(quoteId: string, formData: FormData) {
  await toggleQuoteAssignee(quoteId, String(formData.get("user_id") ?? ""), formData.get("on") === "1");
}

export async function logQuoteCallForm(quoteId: string, formData: FormData) {
  await logQuoteCall(quoteId, String(formData.get("note") ?? ""));
}

export async function addQuoteNoteForm(quoteId: string, formData: FormData) {
  await addQuoteNote(quoteId, String(formData.get("content") ?? ""));
}

export async function replyToProspectForm(quoteId: string, formData: FormData) {
  await replyToProspect(quoteId, String(formData.get("content") ?? ""));
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
  await sendTemplateEmail({
    to: email,
    subject: `Invitation ${ctx.organization.name}`,
    body: `Vous êtes invité sur QuoteBuilder (${ctx.organization.name}).\n${getAppUrl()}/invite/${token}`,
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
