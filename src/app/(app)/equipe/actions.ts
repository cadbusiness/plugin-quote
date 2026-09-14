"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { sendTemplateEmail } from "@/lib/email/send";
import { canManageMember, memberAccessEmail, memberPasswordEmail } from "@/lib/crm/team";
import { findMembershipByEmail } from "@/lib/crm/team-load";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/supabase/env";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

export type InviteMemberState = { error?: string };

function revalidateTeam(id?: string) {
  revalidatePath("/equipe");
  revalidatePath("/accueil");
  if (id) revalidatePath(`/equipe/${id}`);
}

async function requireAdmin() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  if (!isAdminRole(ctx.role)) redirect("/devis");
  return ctx;
}

async function loadMembership(id: string, orgId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("*")
    .eq("id", id)
    .eq("organization_id", orgId)
    .maybeSingle();
  return data;
}

async function membershipEmail(member: { invited_email: string | null; user_id: string | null }) {
  const stored = member.invited_email?.trim().toLowerCase();
  if (stored) return stored;
  if (!member.user_id || !hasServiceRoleKey()) return null;
  try {
    const { data } = await createServiceClient().auth.admin.getUserById(member.user_id);
    return data.user?.email?.trim().toLowerCase() || null;
  } catch {
    return null;
  }
}

async function sendAccess(orgName: string, email: string, role: string, token?: string | null) {
  const mail = memberAccessEmail({ orgName, role, token });
  await sendTemplateEmail({ to: email, subject: mail.subject, body: mail.body });
}

export async function inviteMember(_prev: InviteMemberState, formData: FormData): Promise<InviteMemberState> {
  const ctx = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "sales");
  if (!email.includes("@")) return { error: "Email invalide." };
  if (role !== "admin" && role !== "sales") return { error: "Rôle invalide." };

  const supabase = await createClient();
  const existing = await findMembershipByEmail(supabase, ctx.organization.id, email);
  const token = crypto.randomUUID();

  if (existing?.status === "active") {
    return { error: "Cet email est déjà membre de l’espace." };
  }
  if (existing?.status === "disabled") {
    return { error: "Ce compte est suspendu. Réactivez-le depuis sa fiche." };
  }
  if (existing?.status === "pending") {
    const { error } = await supabase
      .from("memberships")
      .update({ role, invite_token: token, invited_email: email })
      .eq("id", existing.id)
      .eq("organization_id", ctx.organization.id);
    if (error) {
      console.error("inviteMember update", error.message);
      return { error: "Impossible de renvoyer l’invitation." };
    }
    await sendAccess(ctx.organization.name, email, role, token);
    revalidateTeam(existing.id);
    redirect(`/equipe/${existing.id}?sent=access`);
  }

  const { data, error } = await supabase
    .from("memberships")
    .insert({
      organization_id: ctx.organization.id,
      role,
      status: "pending",
      invited_email: email,
      invite_token: token,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("inviteMember", error?.message);
    return { error: "Impossible de créer l’invitation." };
  }
  await sendAccess(ctx.organization.name, email, role, token);
  revalidateTeam(data.id);
  redirect(`/equipe/${data.id}?sent=access`);
}

export async function resendMemberAccess(id: string) {
  const ctx = await requireAdmin();
  const member = await loadMembership(id, ctx.organization.id);
  if (!member) redirect("/equipe");
  const email = await membershipEmail(member);
  if (!email) redirect(`/equipe/${id}?error=access`);
  if (member.status === "disabled") redirect(`/equipe/${id}?error=access`);

  const token = member.status === "pending" ? crypto.randomUUID() : null;
  if (member.status === "pending") {
    const supabase = await createClient();
    const { error } = await supabase
      .from("memberships")
      .update({ invite_token: token })
      .eq("id", id)
      .eq("organization_id", ctx.organization.id);
    if (error) {
      console.error("resendMemberAccess", error.message);
      redirect(`/equipe/${id}?error=access`);
    }
  }
  const mail = memberAccessEmail({ orgName: ctx.organization.name, role: member.role, token });
  await sendTemplateEmail({ to: email, subject: mail.subject, body: mail.body });
  revalidateTeam(id);
  redirect(`/equipe/${id}?sent=access`);
}

export async function sendMemberPassword(id: string) {
  const ctx = await requireAdmin();
  const member = await loadMembership(id, ctx.organization.id);
  if (!member) redirect("/equipe");
  const email = await membershipEmail(member);
  if (!email || member.status === "pending") redirect(`/equipe/${id}?error=password`);
  if (!hasServiceRoleKey()) redirect(`/equipe/${id}?error=password`);
  try {
    const admin = createServiceClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${getAppUrl()}/mot-de-passe` },
    });
    const actionLink = data?.properties?.action_link;
    if (error || !actionLink) {
      console.error("sendMemberPassword", error?.message);
      redirect(`/equipe/${id}?error=password`);
    }
    const mail = memberPasswordEmail(ctx.organization.name, actionLink);
    await sendTemplateEmail({ to: email, subject: mail.subject, body: mail.body });
  } catch (error) {
    console.error("sendMemberPassword", error);
    redirect(`/equipe/${id}?error=password`);
  }
  revalidateTeam(id);
  redirect(`/equipe/${id}?sent=password`);
}

export async function updateMemberRole(id: string, formData: FormData) {
  const ctx = await requireAdmin();
  const role = String(formData.get("role") ?? "");
  if (role !== "admin" && role !== "sales") return;
  const member = await loadMembership(id, ctx.organization.id);
  if (!member) redirect("/equipe");
  if (!canManageMember(ctx.role, { role: member.role, userId: member.user_id }, ctx.userId)) {
    redirect(`/equipe/${id}?error=role`);
  }
  const supabase = await createClient();
  await supabase.from("memberships").update({ role }).eq("id", id).eq("organization_id", ctx.organization.id);
  revalidateTeam(id);
  redirect(`/equipe/${id}?sent=role`);
}

export async function setMemberStatus(id: string, status: "active" | "disabled") {
  const ctx = await requireAdmin();
  const member = await loadMembership(id, ctx.organization.id);
  if (!member) redirect("/equipe");
  if (!canManageMember(ctx.role, { role: member.role, userId: member.user_id }, ctx.userId)) {
    redirect(`/equipe/${id}?error=status`);
  }
  if (member.status === "pending" && status === "active") redirect(`/equipe/${id}?error=status`);
  const supabase = await createClient();
  await supabase.from("memberships").update({ status }).eq("id", id).eq("organization_id", ctx.organization.id);
  revalidateTeam(id);
  redirect(`/equipe/${id}?sent=status`);
}

export async function revokeMemberInvite(id: string) {
  const ctx = await requireAdmin();
  const member = await loadMembership(id, ctx.organization.id);
  if (!member) redirect("/equipe");
  if (member.status !== "pending" || member.role === "owner") redirect(`/equipe/${id}?error=status`);
  const supabase = await createClient();
  await supabase.from("memberships").delete().eq("id", id).eq("organization_id", ctx.organization.id);
  revalidateTeam();
  redirect("/equipe?sent=revoked");
}
