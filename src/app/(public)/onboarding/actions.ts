"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createOrganizationForUser, joinOrganizationForUser } from "@/lib/org/onboarding";

export async function createSpace(
  _prev: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    await createOrganizationForUser(supabase, user.id, String(formData.get("name") ?? ""));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Création impossible" };
  }
  redirect("/devis");
}

export async function joinSpace(
  _prev: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    await joinOrganizationForUser(supabase, user.id, String(formData.get("slug") ?? ""));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Impossible de rejoindre" };
  }
  redirect("/devis");
}
