import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeSalesEmail(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > 200 || !EMAIL_RE.test(email)) return null;
  return email;
}

/** Merchant inbox: the column when it is a real address, otherwise the owner. */
export function resolveSalesEmail(
  salesEmail: string | null | undefined,
  ownerEmail: string | null | undefined,
): string | null {
  return normalizeSalesEmail(salesEmail) ?? normalizeSalesEmail(ownerEmail);
}

/** Signature line. An empty sales name prints the organization name. */
export function resolveSalesName(
  salesName: string | null | undefined,
  orgName: string | null | undefined,
): string {
  const name = typeof salesName === "string" ? salesName.replace(/\s+/g, " ").trim() : "";
  if (name) return name.slice(0, 120);
  const org = typeof orgName === "string" ? orgName.replace(/\s+/g, " ").trim() : "";
  return org.slice(0, 120);
}

export function confirmationRouting(input: {
  salesEmail: string | null | undefined;
  ownerEmail: string | null | undefined;
  salesName: string | null | undefined;
  orgName: string | null | undefined;
}): { replyTo: string | null; briefTo: string | null; signature: string } {
  const email = resolveSalesEmail(input.salesEmail, input.ownerEmail);
  return {
    replyTo: email,
    briefTo: email,
    signature: resolveSalesName(input.salesName, input.orgName),
  };
}

/** Prospect mail replies to the merchant. Team mail replies to the prospect. */
export function outboundReplyTo(input: {
  toProspect: boolean;
  contactEmail: string | null | undefined;
  salesEmail: string | null | undefined;
}): string | undefined {
  if (input.toProspect) return normalizeSalesEmail(input.salesEmail) ?? undefined;
  const contact = input.contactEmail?.trim();
  return contact || undefined;
}

type OwnerRow = {
  user_id: string | null;
  invited_email: string | null;
  status: string;
  created_at: string;
};

function rankOwners(owners: OwnerRow[]): OwnerRow[] {
  return [...owners].sort((a, b) => {
    const active = Number(a.status !== "active") - Number(b.status !== "active");
    if (active !== 0) return active;
    return a.created_at.localeCompare(b.created_at);
  });
}

export async function lookupOwnerEmail(
  supabase: SupabaseClient<Database>,
  organizationId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("memberships")
    .select("user_id, invited_email, status, created_at")
    .eq("organization_id", organizationId)
    .eq("role", "owner")
    .order("created_at", { ascending: true });

  const owners = rankOwners(data ?? []);
  const admin = hasServiceRoleKey() ? createServiceClient() : null;
  for (const owner of owners) {
    const invited = normalizeSalesEmail(owner.invited_email);
    if (invited) return invited;
    if (!admin || !owner.user_id) continue;
    try {
      const { data: user, error } = await admin.auth.admin.getUserById(owner.user_id);
      if (error) continue;
      const email = normalizeSalesEmail(user.user?.email);
      if (email) return email;
    } catch {
      continue;
    }
  }
  return null;
}

export async function loadSalesIdentity(
  supabase: SupabaseClient<Database>,
  organizationId: string,
): Promise<{ email: string | null; name: string; orgName: string }> {
  const { data: org } = await supabase
    .from("organizations")
    .select("name, sales_email, sales_name")
    .eq("id", organizationId)
    .maybeSingle();
  const ownerEmail = normalizeSalesEmail(org?.sales_email)
    ? null
    : await lookupOwnerEmail(supabase, organizationId);
  const route = confirmationRouting({
    salesEmail: org?.sales_email,
    ownerEmail,
    salesName: org?.sales_name,
    orgName: org?.name,
  });
  const orgName = typeof org?.name === "string" ? org.name.replace(/\s+/g, " ").trim() : "";
  return { email: route.briefTo, name: route.signature, orgName };
}
