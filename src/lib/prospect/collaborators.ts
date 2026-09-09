import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/db/database.types";
import { createServiceClient } from "@/lib/supabase/service";
import { appUrl } from "@/lib/prospect/access";
import { logActivity, notifyUser } from "@/lib/crm/activity";
import { sendTemplateEmail } from "@/lib/email/send";

export type CollaboratorRole = "finance" | "technical" | "buyer" | "other";
export type CollaboratorStatus = "pending" | "viewed" | "approved" | "changes_requested";
export type ValidationStatus = "none" | "pending" | "partial" | "approved" | "changes_requested";

export const COLLABORATOR_ROLE_LABELS: Record<CollaboratorRole, string> = {
  finance: "Directeur financier",
  technical: "Responsable technique",
  buyer: "Acheteur",
  other: "Décideur",
};

export const COLLABORATOR_STATUS_LABELS: Record<CollaboratorStatus, string> = {
  pending: "En attente",
  viewed: "Consulté",
  approved: "Validé",
  changes_requested: "Modifications",
};

export function collaboratorUrl(token: string) {
  return `${appUrl()}/suivi/${token}`;
}

export function computeValidation(
  rows: Pick<Tables<"quote_collaborators">, "status">[],
): {
  validation_status: ValidationStatus;
  validation_approved_count: number;
  validation_total_count: number;
} {
  const total = rows.length;
  if (!total) {
    return { validation_status: "none", validation_approved_count: 0, validation_total_count: 0 };
  }
  const approved = rows.filter((row) => row.status === "approved").length;
  const changes = rows.some((row) => row.status === "changes_requested");
  if (changes) {
    return {
      validation_status: "changes_requested",
      validation_approved_count: approved,
      validation_total_count: total,
    };
  }
  if (approved === total) {
    return {
      validation_status: "approved",
      validation_approved_count: approved,
      validation_total_count: total,
    };
  }
  if (approved > 0) {
    return {
      validation_status: "partial",
      validation_approved_count: approved,
      validation_total_count: total,
    };
  }
  return {
    validation_status: "pending",
    validation_approved_count: 0,
    validation_total_count: total,
  };
}

async function syncQuoteValidation(
  supabase: SupabaseClient<Database>,
  quoteId: string,
  organizationId: string,
) {
  const { data: rows } = await supabase
    .from("quote_collaborators")
    .select("status")
    .eq("quote_id", quoteId);
  const stats = computeValidation(rows ?? []);
  await supabase
    .from("quotes")
    .update({
      validation_status: stats.validation_status,
      validation_approved_count: stats.validation_approved_count,
      validation_total_count: stats.validation_total_count,
    })
    .eq("id", quoteId)
    .eq("organization_id", organizationId);
  return stats;
}

export async function inviteCollaborator(input: {
  organizationId: string;
  quoteId: string;
  email: string;
  name: string;
  role?: CollaboratorRole;
  invitedBy: "prospect" | "sales";
  invitedByUserId?: string | null;
  contactName?: string;
  contactCompany?: string | null;
  notifyAssignees?: boolean;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email || !name || !email.includes("@")) {
    throw new Error("Nom et email requis");
  }
  const role: CollaboratorRole = input.role ?? "finance";
  const supabase = createServiceClient();
  const token = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: existing } = await supabase
    .from("quote_collaborators")
    .select("id, token, status")
    .eq("quote_id", input.quoteId)
    .eq("email", email)
    .maybeSingle();

  let collaborator: Tables<"quote_collaborators"> | null = null;
  if (existing) {
    const { data, error } = await supabase
      .from("quote_collaborators")
      .update({
        name,
        role,
        token,
        status: "pending",
        budget_max: null,
        comment: null,
        decided_at: null,
        invited_by: input.invitedBy,
        invited_by_user_id: input.invitedByUserId ?? null,
        expires_at: expires,
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    collaborator = data;
  } else {
    const { data, error } = await supabase
      .from("quote_collaborators")
      .insert({
        organization_id: input.organizationId,
        quote_id: input.quoteId,
        email,
        name,
        role,
        token,
        invited_by: input.invitedBy,
        invited_by_user_id: input.invitedByUserId ?? null,
        expires_at: expires,
      })
      .select("*")
      .single();
    if (error) throw error;
    collaborator = data;
  }

  const stats = await syncQuoteValidation(supabase, input.quoteId, input.organizationId);
  const url = collaboratorUrl(token);
  const roleLabel = COLLABORATOR_ROLE_LABELS[role];
  const company = input.contactCompany ? ` (${input.contactCompany})` : "";
  const who = input.contactName ? `${input.contactName}${company}` : "Votre équipe";

  await sendTemplateEmail({
    to: email,
    subject: `${who} vous demande de valider un devis`,
    body: [
      `Bonjour ${name},`,
      "",
      `${who} vous partage un dossier de devis pour validation (${roleLabel}).`,
      "Ouvrez le lien pour voir la configuration, ajouter une contrainte budgétaire, puis valider ou demander des modifications.",
      "",
      url,
      "",
      "Ce lien expire dans 30 jours.",
    ].join("\n"),
  });

  await logActivity(supabase, {
    organizationId: input.organizationId,
    quoteId: input.quoteId,
    actorId: input.invitedByUserId ?? null,
    type: "collaborator_invited",
    payload: {
      name,
      email,
      role,
      role_label: roleLabel,
      invited_by: input.invitedBy,
    },
  });

  if (input.notifyAssignees) {
    await notifyAssignees(supabase, {
      organizationId: input.organizationId,
      quoteId: input.quoteId,
      type: "collaborator_invited",
      body: `${name} (${roleLabel}) invité à valider le dossier`,
    });
  }

  return { collaborator, url, stats };
}

export async function revokeCollaborator(input: {
  organizationId: string;
  quoteId: string;
  collaboratorId: string;
}) {
  const supabase = createServiceClient();
  await supabase
    .from("quote_collaborators")
    .delete()
    .eq("id", input.collaboratorId)
    .eq("quote_id", input.quoteId)
    .eq("organization_id", input.organizationId);
  return syncQuoteValidation(supabase, input.quoteId, input.organizationId);
}

export async function decideAsCollaborator(input: {
  collaboratorId: string;
  organizationId: string;
  quoteId: string;
  decision: "approved" | "changes_requested";
  budgetMax?: number | null;
  comment?: string | null;
  contactName?: string;
  contactCompany?: string | null;
}) {
  const supabase = createServiceClient();
  const now = new Date().toISOString();
  const { data: row, error } = await supabase
    .from("quote_collaborators")
    .update({
      status: input.decision,
      budget_max: input.budgetMax ?? null,
      comment: input.comment?.trim() || null,
      decided_at: now,
    })
    .eq("id", input.collaboratorId)
    .eq("quote_id", input.quoteId)
    .select("*")
    .single();
  if (error) throw error;

  const stats = await syncQuoteValidation(supabase, input.quoteId, input.organizationId);
  const roleLabel = COLLABORATOR_ROLE_LABELS[row.role as CollaboratorRole] ?? "Décideur";
  const companyLabel = input.contactCompany || input.contactName || "le dossier";

  if (input.decision === "approved") {
    await logActivity(supabase, {
      organizationId: input.organizationId,
      quoteId: input.quoteId,
      type: "collaborator_approved",
      payload: {
        name: row.name,
        email: row.email,
        role: row.role,
        budget_max: row.budget_max,
        comment: row.comment,
        approved_count: stats.validation_approved_count,
        total_count: stats.validation_total_count,
      },
    });
    await notifyAssignees(supabase, {
      organizationId: input.organizationId,
      quoteId: input.quoteId,
      type: "collaborator_approved",
      body: `${row.name} (${roleLabel}) a validé ${companyLabel}`,
    });
  } else {
    await logActivity(supabase, {
      organizationId: input.organizationId,
      quoteId: input.quoteId,
      type: "collaborator_changes_requested",
      payload: {
        name: row.name,
        email: row.email,
        role: row.role,
        budget_max: row.budget_max,
        comment: row.comment,
      },
    });
    await notifyAssignees(supabase, {
      organizationId: input.organizationId,
      quoteId: input.quoteId,
      type: "collaborator_changes_requested",
      body: `${row.name} (${roleLabel}) demande des modifications sur ${companyLabel}`,
    });
  }

  if (stats.validation_status === "approved" && stats.validation_total_count > 0) {
    const body = `Le dossier ${companyLabel} a été validé par ${stats.validation_approved_count} décideur${
      stats.validation_approved_count > 1 ? "s" : ""
    }.`;
    await logActivity(supabase, {
      organizationId: input.organizationId,
      quoteId: input.quoteId,
      type: "validation_complete",
      payload: {
        approved_count: stats.validation_approved_count,
        total_count: stats.validation_total_count,
      },
    });
    await notifyAssignees(supabase, {
      organizationId: input.organizationId,
      quoteId: input.quoteId,
      type: "validation_complete",
      body,
    });

    const { data: org } = await supabase
      .from("organizations")
      .select("sales_email, name")
      .eq("id", input.organizationId)
      .maybeSingle();
    if (org?.sales_email) {
      await sendTemplateEmail({
        to: org.sales_email,
        subject: body,
        body: [
          body,
          "",
          `Ouvrir la demande : ${appUrl()}/devis/${input.quoteId}`,
        ].join("\n"),
      });
    }
  }

  return { collaborator: row, stats };
}

async function notifyAssignees(
  supabase: SupabaseClient<Database>,
  input: {
    organizationId: string;
    quoteId: string;
    type: string;
    body: string;
  },
) {
  const [{ data: assignees }, { data: quote }] = await Promise.all([
    supabase.from("quote_assignees").select("user_id").eq("quote_id", input.quoteId),
    supabase.from("quotes").select("assigned_to").eq("id", input.quoteId).maybeSingle(),
  ]);
  const userIds = new Set<string>();
  for (const row of assignees ?? []) userIds.add(row.user_id);
  if (quote?.assigned_to) userIds.add(quote.assigned_to);
  if (!userIds.size) {
    const { data: owners } = await supabase
      .from("memberships")
      .select("user_id")
      .eq("organization_id", input.organizationId)
      .eq("status", "active")
      .in("role", ["owner", "admin"]);
    for (const row of owners ?? []) {
      if (row.user_id) userIds.add(row.user_id);
    }
  }
  for (const userId of userIds) {
    await notifyUser(supabase, {
      organizationId: input.organizationId,
      userId,
      quoteId: input.quoteId,
      type: input.type,
      body: input.body,
    });
  }
}

export async function markCollaboratorViewed(collaboratorId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("quote_collaborators")
    .select("id, status")
    .eq("id", collaboratorId)
    .maybeSingle();
  if (!data) return;
  if (data.status === "pending") {
    await supabase
      .from("quote_collaborators")
      .update({ status: "viewed", last_accessed: new Date().toISOString() })
      .eq("id", collaboratorId);
    return;
  }
  await supabase
    .from("quote_collaborators")
    .update({ last_accessed: new Date().toISOString() })
    .eq("id", collaboratorId);
}
