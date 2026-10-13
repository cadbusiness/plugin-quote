import { createServiceClient } from "@/lib/supabase/service";
import { logActivity, notifyUser } from "@/lib/crm/activity";
import { loadQuoteDetail } from "@/lib/crm/quote-detail";
import { sendTemplateEmail } from "@/lib/email/send";
import { getAppUrl } from "@/lib/supabase/env";
import {
  buildTimeline,
  cleanNote,
  isUuid,
  nextAssignees,
  parseAssignMode,
  resolveTeamMember,
  truncate,
  type TeamMember,
  type TimelineEvent,
} from "@/lib/api/crm-core";

type Service = ReturnType<typeof createServiceClient>;

async function requireQuote(supabase: Service, organizationId: string, leadId: string) {
  if (!isUuid(leadId)) throw new Error("Lead introuvable");
  const { data } = await supabase
    .from("quotes")
    .select("id, contact_name")
    .eq("id", leadId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!data) throw new Error("Lead introuvable");
  return data;
}

async function loadActiveMembers(supabase: Service, organizationId: string): Promise<TeamMember[]> {
  const { data } = await supabase
    .from("memberships")
    .select("user_id, invited_email, role")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .not("user_id", "is", null);
  return (data ?? [])
    .filter((row): row is typeof row & { user_id: string } => Boolean(row.user_id))
    .map((row) => ({ user_id: row.user_id, email: row.invited_email, role: row.role }));
}

function memberLabel(member: TeamMember | undefined) {
  if (!member) return "Membre";
  return member.email || (member.role === "owner" ? "Propriétaire" : member.role === "admin" ? "Admin" : "Commercial");
}

/** Members a lead can be assigned to. */
export async function apiListTeam(organizationId: string) {
  const supabase = createServiceClient();
  const members = await loadActiveMembers(supabase, organizationId);
  return members.map((m) => ({ user_id: m.user_id, email: m.email, role: m.role, label: memberLabel(m) }));
}

export async function apiAddLeadNote(
  organizationId: string,
  input: { lead_id: string; content: string; author_id?: string | null; source?: string },
) {
  const content = cleanNote(input.content);
  const supabase = createServiceClient();
  await requireQuote(supabase, organizationId, input.lead_id);

  // Author only when the token belongs to a member of this org (OAuth consent); API keys stay anonymous.
  let authorId: string | null = null;
  if (input.author_id) {
    const members = await loadActiveMembers(supabase, organizationId);
    authorId = members.some((m) => m.user_id === input.author_id) ? input.author_id : null;
  }

  const { data, error } = await supabase
    .from("quote_notes")
    .insert({ organization_id: organizationId, quote_id: input.lead_id, author_id: authorId, content })
    .select("id, created_at")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Note impossible à enregistrer");

  await logActivity(supabase, {
    organizationId,
    quoteId: input.lead_id,
    actorId: authorId,
    type: "note_added",
    payload: { source: input.source ?? "api" },
  });

  return { id: data.id, lead_id: input.lead_id, created_at: data.created_at, content };
}

export async function apiAssignLead(
  organizationId: string,
  input: { lead_id: string; assignee: string; mode?: string; actor_id?: string | null; notify?: boolean },
) {
  const mode = parseAssignMode(input.mode);
  const supabase = createServiceClient();
  const quote = await requireQuote(supabase, organizationId, input.lead_id);
  const members = await loadActiveMembers(supabase, organizationId);
  const member = resolveTeamMember(members, input.assignee);

  const { data: rows } = await supabase
    .from("quote_assignees")
    .select("user_id")
    .eq("quote_id", input.lead_id)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });
  const current = (rows ?? []).map((row) => row.user_id);
  const next = nextAssignees(current, member.user_id, mode);

  const removed = current.filter((id) => !next.includes(id));
  const added = next.filter((id) => !current.includes(id));
  if (removed.length) {
    await supabase
      .from("quote_assignees")
      .delete()
      .eq("quote_id", input.lead_id)
      .eq("organization_id", organizationId)
      .in("user_id", removed);
  }
  for (const userId of added) {
    await supabase.from("quote_assignees").upsert({
      quote_id: input.lead_id,
      user_id: userId,
      organization_id: organizationId,
    });
  }
  await supabase
    .from("quotes")
    .update({ assigned_to: next[0] ?? null })
    .eq("id", input.lead_id)
    .eq("organization_id", organizationId);

  const changed = added.length > 0 || removed.length > 0;
  if (changed) {
    const actorId = input.actor_id && members.some((m) => m.user_id === input.actor_id) ? input.actor_id : null;
    await logActivity(supabase, {
      organizationId,
      quoteId: input.lead_id,
      actorId,
      type: "assigned",
      payload: {
        assigned_to: next[0] ?? null,
        labels: next.map((id) => memberLabel(members.find((m) => m.user_id === id))),
        source: "api",
      },
    });
  }

  if (added.length && input.notify !== false) {
    const name = quote.contact_name ?? "prospect";
    for (const userId of added) {
      await notifyUser(supabase, {
        organizationId,
        userId,
        quoteId: input.lead_id,
        type: "assigned",
        body: `Demande assignée : ${name}`,
      });
      const email = members.find((m) => m.user_id === userId)?.email;
      if (email) {
        try {
          await sendTemplateEmail({
            to: email,
            subject: `Demande assignée, ${name}`,
            body: `Une demande vous a été assignée : ${name}.\n${getAppUrl()}/devis/${input.lead_id}`,
          });
        } catch (error) {
          console.error("Assign email failed", error);
        }
      }
    }
  }

  return {
    lead_id: input.lead_id,
    mode,
    changed,
    assignees: next.map((id) => {
      const m = members.find((row) => row.user_id === id);
      return { user_id: id, email: m?.email ?? null, label: memberLabel(m) };
    }),
  };
}

export async function apiGetLeadTimeline(organizationId: string, leadId: string, limit = 100) {
  if (!isUuid(leadId)) return null;
  const supabase = createServiceClient();
  const detail = await loadQuoteDetail(supabase, organizationId, leadId);
  if (!detail) return null;
  const { data: uploads } = await supabase
    .from("ads_conversion_uploads")
    .select("kind, status, error, created_at, uploaded_at")
    .eq("organization_id", organizationId)
    .eq("quote_id", leadId);

  const events: TimelineEvent[] = [
    ...detail.activities.map((act) => ({
      at: act.created_at,
      kind: "activity" as const,
      type: act.type,
      label: act.label,
      detail: truncate(act.detail),
    })),
    ...detail.notes.map((note) => ({
      at: note.created_at,
      kind: "note" as const,
      type: "note",
      label: "Note interne",
      detail: truncate(note.content, 1000),
    })),
    ...detail.messages.map((message) => ({
      at: message.sent_at,
      kind: "message" as const,
      type: message.sender,
      label: message.sender === "prospect" ? "Message du prospect" : "Message envoyé",
      detail: truncate(message.content),
    })),
    ...(uploads ?? []).map((row) => ({
      at: row.uploaded_at ?? row.created_at,
      kind: "ads_conversion" as const,
      type: `${row.kind}:${row.status}`,
      label: `Conversion Google Ads « ${row.kind === "won" ? "gagné" : "devis"} » : ${row.status}`,
      detail: truncate(row.error),
    })),
  ];

  return {
    lead: {
      id: detail.quote.id,
      name: detail.quote.contact_name,
      company: detail.quote.contact_company,
      status: detail.status?.slug ?? detail.quote.status,
      created_at: detail.quote.created_at,
      source: detail.source,
    },
    ...buildTimeline(events, limit),
  };
}
