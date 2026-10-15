import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/db/database.types";
import { uniqueSlug } from "@/lib/org/slug";
import { seedOrgCrm } from "@/lib/crm/seed";
import { isFunnelFamilyId, mergeOrgFamily, type FunnelFamilyId } from "@/lib/funnels/families";
import { defaultTemplateForFamily } from "@/lib/funnels/templates";
import { normalizeSalesEmail, resolveSalesName } from "@/lib/org/sales-identity";

export async function createOrganizationForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  name: string,
  familyInput?: string | null,
  identity?: { userEmail?: string | null; salesEmail?: string | null; salesName?: string | null },
) {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    throw new Error("Nom d’entreprise requis");
  }

  const admin = createServiceClient();
  const slug = await uniqueSlug(async (candidate) => {
    const { data } = await admin
      .from("organizations")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    return Boolean(data);
  }, trimmed);

  const rawFamily = familyInput ?? "";
  const family: FunnelFamilyId = isFunnelFamilyId(rawFamily) ? rawFamily : "custom";
  const firstTemplate = defaultTemplateForFamily(family);
  const typedEmail = identity?.salesEmail?.trim() ?? "";
  if (typedEmail && !normalizeSalesEmail(typedEmail)) {
    throw new Error("Email commercial invalide");
  }
  const salesEmail = normalizeSalesEmail(typedEmail) ?? normalizeSalesEmail(identity?.userEmail);
  const salesName = resolveSalesName(identity?.salesName, trimmed);

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: trimmed,
      slug,
      plan: "pro",
      branding: mergeOrgFamily(null, family),
      sales_email: salesEmail,
      sales_name: salesName || null,
    })
    .select("*")
    .single();
  if (orgError || !org) {
    throw new Error(orgError?.message ?? "Impossible de créer l’espace");
  }

  const { error: memberError } = await supabase.from("memberships").insert({
    organization_id: org.id,
    user_id: userId,
    role: "owner",
  });
  if (memberError) {
    throw new Error(memberError.message);
  }

  await supabase.from("configurators").insert({
    organization_id: org.id,
    name: "Funnel principal",
    slug: "principal",
    sector: firstTemplate.id,
    wizard_enabled: true,
    chat_enabled: true,
  });

  await seedOrgCrm(supabase, org.id);

  return org;
}

export async function joinOrganizationForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  slug: string,
  identity?: { userEmail?: string | null },
) {
  const clean = slugifyInput(slug);
  const admin = createServiceClient();
  const { data: org } = await admin
    .from("organizations")
    .select("*")
    .eq("slug", clean)
    .maybeSingle();
  if (!org) {
    throw new Error("Espace introuvable");
  }

  const { count } = await admin
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", org.id);

  if ((count ?? 0) > 0) {
    throw new Error("Cet espace a déjà une équipe. Demandez une invitation.");
  }

  const { error } = await supabase.from("memberships").insert({
    organization_id: org.id,
    user_id: userId,
    role: "owner",
  });
  if (error) throw new Error(error.message);

  const patch: { sales_email?: string; sales_name?: string } = {};
  if (!org.sales_name?.trim()) patch.sales_name = org.name;
  if (!normalizeSalesEmail(org.sales_email)) {
    const email = normalizeSalesEmail(identity?.userEmail);
    if (email) patch.sales_email = email;
  }
  if (Object.keys(patch).length) {
    const { error: identityError } = await supabase.from("organizations").update(patch).eq("id", org.id);
    if (identityError) throw new Error(identityError.message);
  }
  return org;
}

function slugifyInput(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "");
}
