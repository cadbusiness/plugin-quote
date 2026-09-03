import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/db/database.types";

export type OrgContext = {
  userId: string;
  email: string | null;
  organization: Tables<"organizations">;
  role: string;
};

export function isAdminRole(role: string) {
  return role === "owner" || role === "admin";
}

export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getOrgContext = cache(async (): Promise<OrgContext | null> => {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
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
});
