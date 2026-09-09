"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import type { Json } from "@/lib/db/database.types";
import {
  EMAIL_PRESETS,
  isEmailProvider,
  parseChannelSettings,
  type CommProvider,
  type CommScope,
} from "@/lib/comm/types";
import { encryptCredentials, maskHint } from "@/lib/integrations/secrets";
import { sendTemplateEmail } from "@/lib/email/send";
import { createClient } from "@/lib/supabase/server";

export type ChannelState = { error?: string };

async function requireMember() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  return ctx;
}

export async function connectChannel(
  _prev: ChannelState,
  formData: FormData,
): Promise<ChannelState> {
  const ctx = await requireMember();
  const provider = String(formData.get("provider") ?? "") as CommProvider;
  const scope = String(formData.get("scope") ?? "org") as CommScope;
  const address = String(formData.get("address") ?? "").trim().toLowerCase();
  const label = String(formData.get("label") ?? "").trim();

  if (!provider) return { error: "Choisissez un canal." };
  if (!address) return { error: "Indiquez l’adresse ou le compte." };
  if (scope === "org" && !isAdminRole(ctx.role)) {
    return { error: "Seul un admin peut connecter la boîte de l’organisation." };
  }
  if (scope === "staff" && isEmailProvider(provider) && !address.includes("@")) {
    return { error: "Email invalide." };
  }

  const supabase = await createClient();
  const email = isEmailProvider(provider);
  const preset = email ? EMAIL_PRESETS[provider] : null;
  const settings = email
    ? parseChannelSettings({
        imapHost: String(formData.get("imap_host") ?? preset?.imapHost ?? ""),
        imapPort: Number(formData.get("imap_port") ?? preset?.imapPort ?? 993),
        smtpHost: String(formData.get("smtp_host") ?? preset?.smtpHost ?? ""),
        smtpPort: Number(formData.get("smtp_port") ?? preset?.smtpPort ?? 587),
      })
    : {};

  const password = String(formData.get("password") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim() || address;
  const credentials = email && password ? encryptCredentials({ username, password }) : {};

  const { data, error } = await supabase
    .from("comm_channels")
    .insert({
      organization_id: ctx.organization.id,
      user_id: scope === "staff" ? ctx.userId : null,
      provider,
      scope,
      label: label || address,
      address,
      status: email ? "connected" : "coming_soon",
      credentials: credentials as unknown as Json,
      credentials_hint: password ? maskHint(username) : null,
      settings: settings as unknown as Json,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/canaux");
  redirect(`/canaux/${data.id}`);
}

export async function disconnectChannel(channelId: string) {
  const ctx = await requireMember();
  const supabase = await createClient();
  await supabase
    .from("comm_channels")
    .delete()
    .eq("id", channelId)
    .eq("organization_id", ctx.organization.id);
  revalidatePath("/canaux");
  redirect("/canaux");
}

export async function markMessageRead(messageId: string) {
  const ctx = await requireMember();
  const supabase = await createClient();
  await supabase
    .from("comm_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("organization_id", ctx.organization.id)
    .is("read_at", null);
  revalidatePath("/canaux");
}

export async function replyOnChannel(formData: FormData) {
  const ctx = await requireMember();
  const channelId = String(formData.get("channel_id") ?? "");
  const messageId = String(formData.get("message_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const supabase = await createClient();
  const { data: original } = await supabase
    .from("comm_messages")
    .select("*")
    .eq("id", messageId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!original) return;
  const { data: channel } = await supabase
    .from("comm_channels")
    .select("id, address, label")
    .eq("id", channelId)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!channel) return;

  await sendTemplateEmail({
    to: original.from_address,
    subject: original.subject?.startsWith("Re:") ? original.subject : `Re: ${original.subject ?? ctx.organization.name}`,
    body,
  });

  await supabase.from("comm_messages").insert({
    organization_id: ctx.organization.id,
    channel_id: channelId,
    quote_id: original.quote_id,
    direction: "outbound",
    from_address: channel.address,
    from_name: ctx.email,
    to_address: original.from_address,
    subject: original.subject,
    body_text: body,
  });
  if (original.quote_id) {
    await supabase.from("quote_activities").insert({
      organization_id: ctx.organization.id,
      quote_id: original.quote_id,
      actor_id: ctx.userId,
      type: "message_sent",
      payload: { channel_id: channelId, via: "inbox" } as Json,
    });
  }
  revalidatePath(`/canaux/${channelId}`);
}
