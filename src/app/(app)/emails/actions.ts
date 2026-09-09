"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/auth/org";
import { designJson, parseDesign, starterDesign, type CampaignKind } from "@/lib/emails/blocks";
import { sendCampaign } from "@/lib/emails/send-campaign";
import { createClient } from "@/lib/supabase/server";

export type CampaignState = { error?: string; sent?: number; skipped?: number; failed?: number };

async function requireMember() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  return ctx;
}

export async function createCampaign(formData: FormData) {
  const ctx = await requireMember();
  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "relance") as CampaignKind;
  const sendMode = String(formData.get("send_mode") ?? "personal");
  const segmentId = String(formData.get("segment_id") ?? "") || null;
  const channelId = String(formData.get("channel_id") ?? "") || null;
  if (name.length < 2) return;
  const design = starterDesign(kind, ctx.organization.name);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({
      organization_id: ctx.organization.id,
      name,
      subject:
        kind === "offre"
          ? "{{contact_name}}, votre offre {{org_name}}"
          : kind === "nurturing"
            ? "Toujours d’actualité, {{contact_name}} ?"
            : kind === "perso"
              ? "Bonjour {{contact_name}}"
              : "{{contact_name}}, on reprend votre projet ?",
      design: designJson(design),
      segment_id: segmentId,
      channel_id: channelId,
      send_mode: sendMode === "group" ? "group" : "personal",
      skip_recent_days: Number(formData.get("skip_recent_days") ?? 30) || 0,
      created_by: ctx.userId,
    })
    .select("id")
    .single();
  if (error || !data) return;
  revalidatePath("/emails");
  redirect(`/emails/${data.id}`);
}

export async function saveCampaign(formData: FormData) {
  const ctx = await requireMember();
  const id = String(formData.get("id") ?? "");
  const designRaw = String(formData.get("design") ?? "");
  let design = parseDesign(null);
  try {
    design = parseDesign(JSON.parse(designRaw));
  } catch {
    /* keep empty */
  }
  const supabase = await createClient();
  await supabase
    .from("email_campaigns")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      preview_text: String(formData.get("preview_text") ?? "").trim() || null,
      design: designJson(design),
      segment_id: String(formData.get("segment_id") ?? "") || null,
      channel_id: String(formData.get("channel_id") ?? "") || null,
      send_mode: String(formData.get("send_mode") ?? "personal") === "group" ? "group" : "personal",
      skip_recent_days: Number(formData.get("skip_recent_days") ?? 30) || 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", ctx.organization.id);
  revalidatePath(`/emails/${id}`);
  revalidatePath("/emails");
}

export async function sendCampaignNow(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  const ctx = await requireMember();
  const id = String(formData.get("id") ?? "");
  await saveCampaign(formData);
  const supabase = await createClient();
  const { data: channel } = await supabase
    .from("comm_channels")
    .select("address")
    .eq("id", String(formData.get("channel_id") ?? ""))
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  try {
    const result = await sendCampaign(supabase, {
      organizationId: ctx.organization.id,
      campaignId: id,
      actorId: ctx.userId,
      orgName: ctx.organization.name,
      salesName: ctx.organization.sales_name ?? "",
      fromAddress: channel?.address ?? ctx.organization.sales_email,
      replyTo: channel?.address ?? ctx.organization.sales_email,
    });
    revalidatePath(`/emails/${id}`);
    revalidatePath("/emails");
    revalidatePath("/devis");
    return { sent: result.sent, skipped: result.skipped, failed: result.failed };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Envoi impossible" };
  }
}

export async function deleteCampaign(campaignId: string) {
  const ctx = await requireMember();
  const supabase = await createClient();
  await supabase.from("email_campaigns").delete().eq("id", campaignId).eq("organization_id", ctx.organization.id);
  revalidatePath("/emails");
  redirect("/emails");
}
