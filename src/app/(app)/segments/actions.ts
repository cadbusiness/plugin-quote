"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/auth/org";
import type { Json } from "@/lib/db/database.types";
import type { SegmentRule } from "@/lib/segments/types";
import { createClient } from "@/lib/supabase/server";

async function requireMember() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  return ctx;
}

function rulesFromForm(formData: FormData): SegmentRule[] {
  const fields = formData.getAll("rule_field").map(String);
  const ops = formData.getAll("rule_op").map(String);
  const values = formData.getAll("rule_value").map(String);
  const keys = formData.getAll("rule_answer_key").map(String);
  const all: SegmentRule[] = [];
  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    if (!field) continue;
    all.push({
      field: field as SegmentRule["field"],
      op: (ops[i] || "eq") as SegmentRule["op"],
      value: values[i] ?? "",
      answerKey: keys[i] || undefined,
    });
  }
  return all;
}

export async function createSegment(formData: FormData) {
  const ctx = await requireMember();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_segments")
    .insert({
      organization_id: ctx.organization.id,
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      rules: { all: rulesFromForm(formData) } as unknown as Json,
      created_by: ctx.userId,
    })
    .select("id")
    .single();
  if (error || !data) return;
  revalidatePath("/segments");
  redirect(`/segments/${data.id}`);
}

export async function saveSegment(formData: FormData) {
  const ctx = await requireMember();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase
    .from("contact_segments")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      rules: { all: rulesFromForm(formData) } as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/segments");
  revalidatePath(`/segments/${id}`);
  revalidatePath("/emails");
}

export async function deleteSegment(segmentId: string) {
  const ctx = await requireMember();
  const supabase = await createClient();
  await supabase.from("contact_segments").delete().eq("id", segmentId).eq("organization_id", ctx.organization.id);
  revalidatePath("/segments");
  redirect("/segments");
}
