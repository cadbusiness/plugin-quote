import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/db/database.types";

export type OrgContext = {
  userId: string;
  email: string | null;
  organization: Tables<"organizations">;
  role: string;
};

export async function getOrgContext(): Promise<OrgContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let { data: membership } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("slug", "quickly")
      .maybeSingle();
    if (org) {
      await supabase.from("memberships").insert({
        organization_id: org.id,
        user_id: user.id,
        role: "owner",
      });
      const retry = await supabase
        .from("memberships")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      membership = retry.data;
    }
  }
  if (!membership) return null;

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .single();
  if (!organization) return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    organization,
    role: membership.role,
  };
}
