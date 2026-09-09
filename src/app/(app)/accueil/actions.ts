"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import {
  HOME_MODULE_IDS,
  homeModulesCookieValue,
  parseHomeModules,
  type HomeModuleId,
} from "@/lib/crm/home";
import type { Json } from "@/lib/db/database.types";

export async function saveHomeModules(formData: FormData) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const isAdmin = isAdminRole(ctx.role);
  const selected = formData
    .getAll("module")
    .map(String)
    .filter((id): id is HomeModuleId => (HOME_MODULE_IDS as readonly string[]).includes(id));
  const ids = parseHomeModules(selected, isAdmin);
  const value = homeModulesCookieValue(ids);
  (await cookies()).set("qb-home-modules", value, { path: "/", maxAge: 31536000, sameSite: "lax" });

  const branding =
    ctx.organization.branding && typeof ctx.organization.branding === "object" && !Array.isArray(ctx.organization.branding)
      ? { ...(ctx.organization.branding as Record<string, Json | undefined>) }
      : {};
  branding.homeModules = ids;
  const supabase = await createClient();
  await supabase
    .from("organizations")
    .update({ branding: branding as Json })
    .eq("id", ctx.organization.id);

  revalidatePath("/accueil");
}
