import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { activityLabel } from "@/lib/crm/quote-detail";
import { formatDate } from "@/lib/format";
import {
  capabilitiesForRole,
  quoteIdsForUser,
  tallyMemberStats,
  type QuoteSlice,
  type TeamDirectory,
  type TeamMemberDetail,
  type TeamMemberRow,
} from "@/lib/crm/team";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

async function authEmailByUserId(userId: string): Promise<{ email: string | null; lastSignInAt: string | null }> {
  if (!hasServiceRoleKey()) return { email: null, lastSignInAt: null };
  try {
    const admin = createServiceClient();
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user) return { email: null, lastSignInAt: null };
    return userAuthMeta(data.user);
  } catch {
    return { email: null, lastSignInAt: null };
  }
}

function userAuthMeta(user: User) {
  return {
    email: user.email?.trim().toLowerCase() || null,
    lastSignInAt: user.last_sign_in_at ?? null,
  };
}

export async function loadTeamDirectory(
  supabase: SupabaseClient<Database>,
  orgId: string,
  currentUserId: string,
): Promise<TeamDirectory> {
  const [{ data: memberships }, { data: quotes }, { data: assignees }, { data: activities }] = await Promise.all([
    supabase.from("memberships").select("*").eq("organization_id", orgId).order("created_at"),
    supabase
      .from("quotes")
      .select("id, status, score_label, assigned_to, contact_name, contact_company, created_at")
      .eq("organization_id", orgId),
    supabase.from("quote_assignees").select("quote_id, user_id").eq("organization_id", orgId),
    supabase
      .from("quote_activities")
      .select("actor_id, created_at")
      .eq("organization_id", orgId)
      .not("actor_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(400),
  ]);

  const quoteRows = (quotes ?? []) as QuoteSlice[];
  const assigneeRows = assignees ?? [];
  const lastActivity = new Map<string, string>();
  for (const row of activities ?? []) {
    if (!row.actor_id || lastActivity.has(row.actor_id)) continue;
    lastActivity.set(row.actor_id, row.created_at);
  }

  const assignedIds = new Set(assigneeRows.map((row) => row.quote_id));
  const unassigned = quoteRows.filter((quote) => !quote.assigned_to && !assignedIds.has(quote.id)).length;

  const members = await Promise.all(
    (memberships ?? []).map(async (membership) => {
      const auth = membership.user_id ? await authEmailByUserId(membership.user_id) : { email: null, lastSignInAt: null };
      const email = membership.invited_email?.trim().toLowerCase() || auth.email;
      const ownedIds = membership.user_id ? quoteIdsForUser(membership.user_id, quoteRows, assigneeRows) : new Set<string>();
      const owned = quoteRows.filter((quote) => ownedIds.has(quote.id));
      return {
        id: membership.id,
        userId: membership.user_id,
        email,
        role: membership.role,
        status: membership.status,
        createdAt: membership.created_at,
        lastSignInAt: auth.lastSignInAt,
        lastActivityAt: membership.user_id ? lastActivity.get(membership.user_id) ?? null : null,
        stats: tallyMemberStats(owned),
        isYou: membership.user_id === currentUserId,
      } satisfies TeamMemberRow;
    }),
  );

  return { members, unassigned };
}

export async function loadTeamMember(
  supabase: SupabaseClient<Database>,
  orgId: string,
  memberId: string,
  currentUserId: string,
): Promise<TeamMemberDetail | null> {
  const [{ data: membership }, directory] = await Promise.all([
    supabase.from("memberships").select("id").eq("id", memberId).eq("organization_id", orgId).maybeSingle(),
    loadTeamDirectory(supabase, orgId, currentUserId),
  ]);
  if (!membership) return null;
  const member = directory.members.find((row) => row.id === memberId);
  if (!member) return null;

  const [{ data: quotes }, { data: assignees }, { data: logs }] = await Promise.all([
    supabase
      .from("quotes")
      .select("id, contact_name, contact_company, status, score_label, assigned_to, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase.from("quote_assignees").select("quote_id, user_id").eq("organization_id", orgId),
    member.userId
      ? supabase
          .from("quote_activities")
          .select("id, quote_id, type, created_at")
          .eq("organization_id", orgId)
          .eq("actor_id", member.userId)
          .order("created_at", { ascending: false })
          .limit(40)
      : Promise.resolve({ data: [] as { id: string; quote_id: string; type: string; created_at: string }[] }),
  ]);

  const ownedIds = member.userId ? quoteIdsForUser(member.userId, quotes ?? [], assignees ?? []) : new Set<string>();
  const ownedQuotes = (quotes ?? []).filter((quote) => ownedIds.has(quote.id)).slice(0, 40);
  const quoteNames = new Map((quotes ?? []).map((quote) => [quote.id, quote.contact_name]));

  return {
    ...member,
    capabilities: capabilitiesForRole(member.role),
    quotes: ownedQuotes.map((quote) => ({
      id: quote.id,
      contactName: quote.contact_name,
      company: quote.contact_company,
      status: quote.status,
      scoreLabel: quote.score_label,
      createdAt: quote.created_at,
    })),
    logs: (logs ?? []).map((row) => ({
      id: row.id,
      quoteId: row.quote_id,
      contactName: quoteNames.get(row.quote_id) ?? "Demande",
      label: activityLabel(row.type),
      when: formatDate(row.created_at),
      createdAt: row.created_at,
    })),
  };
}

export async function findMembershipByEmail(
  supabase: SupabaseClient<Database>,
  orgId: string,
  email: string,
) {
  const needle = email.trim().toLowerCase();
  const { data: memberships } = await supabase.from("memberships").select("*").eq("organization_id", orgId);
  for (const membership of memberships ?? []) {
    if (membership.invited_email?.trim().toLowerCase() === needle) return membership;
    if (membership.user_id) {
      const auth = await authEmailByUserId(membership.user_id);
      if (auth.email === needle) return membership;
    }
  }
  return null;
}
