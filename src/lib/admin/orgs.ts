import { createServiceClient } from "@/lib/supabase/service";

export async function listPlatformOrgs() {
  const supabase = createServiceClient();
  const [{ data: orgs }, { data: members }, { data: quotes }] = await Promise.all([
    supabase.from("organizations").select("id, name, slug, plan, created_at").order("created_at", { ascending: false }),
    supabase.from("memberships").select("organization_id, role, status, user_id, invited_email"),
    supabase.from("quotes").select("organization_id"),
  ]);

  const memberCount = new Map<string, number>();
  const quoteCount = new Map<string, number>();
  for (const row of members ?? []) {
    memberCount.set(row.organization_id, (memberCount.get(row.organization_id) ?? 0) + 1);
  }
  for (const row of quotes ?? []) {
    quoteCount.set(row.organization_id, (quoteCount.get(row.organization_id) ?? 0) + 1);
  }

  return (orgs ?? []).map((org) => ({
    ...org,
    members: memberCount.get(org.id) ?? 0,
    quotes: quoteCount.get(org.id) ?? 0,
  }));
}

export async function getPlatformOrg(id: string) {
  const supabase = createServiceClient();
  const { data: org } = await supabase.from("organizations").select("*").eq("id", id).maybeSingle();
  if (!org) return null;
  const [{ data: members }, { data: quotes }, { data: configurators }] = await Promise.all([
    supabase.from("memberships").select("id, role, status, user_id, invited_email, created_at").eq("organization_id", id),
    supabase
      .from("quotes")
      .select("id, contact_name, contact_company, score_label, created_at")
      .eq("organization_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("configurators").select("id, name, slug, is_active").eq("organization_id", id),
  ]);
  return { org, members: members ?? [], quotes: quotes ?? [], configurators: configurators ?? [] };
}
