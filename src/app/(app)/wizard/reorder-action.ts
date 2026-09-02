"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";

export async function saveStepOrder(orderedIds: string[]) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("wizard_steps")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("organization_id", ctx.organization.id),
    ),
  );
  revalidatePath("/wizard");
}
