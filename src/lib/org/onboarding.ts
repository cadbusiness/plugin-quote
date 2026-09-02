import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import { uniqueSlug } from "@/lib/org/slug";

export async function createOrganizationForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  name: string,
) {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    throw new Error("Nom d’entreprise requis");
  }

  const slug = await uniqueSlug(async (candidate) => {
    const { data } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    return Boolean(data);
  }, trimmed);

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: trimmed, slug, plan: "pro" })
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
    name: "Configurateur principal",
    slug: "principal",
    sector: "general",
    wizard_enabled: true,
    chat_enabled: true,
  });

  return org;
}

export async function joinOrganizationForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  slug: string,
) {
  const clean = slugifyInput(slug);
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", clean)
    .maybeSingle();
  if (!org) {
    throw new Error("Espace introuvable");
  }

  const { count } = await supabase
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
  return org;
}

function slugifyInput(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "");
}
