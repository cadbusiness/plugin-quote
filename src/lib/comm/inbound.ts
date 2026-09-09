import type { Json } from "@/lib/db/database.types";
import { createServiceClient } from "@/lib/supabase/service";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function ingestInboundEmail(input: {
  token: string;
  from: string;
  fromName?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  messageId?: string;
}) {
  const from = input.from.trim().toLowerCase();
  if (!from || !from.includes("@")) return { ok: false as const, error: "Expéditeur manquant" };

  const supabase = createServiceClient();
  const { data: channel } = await supabase
    .from("comm_channels")
    .select("*")
    .eq("inbound_token", input.token)
    .maybeSingle();
  if (!channel) return { ok: false as const, error: "Canal inconnu" };
  if (channel.status === "coming_soon") return { ok: false as const, error: "Canal pas encore actif" };

  if (input.messageId) {
    const { data: existing } = await supabase
      .from("comm_messages")
      .select("id")
      .eq("channel_id", channel.id)
      .eq("external_id", input.messageId)
      .maybeSingle();
    if (existing) return { ok: true as const, duplicate: true, id: existing.id };
  }

  const { data: quote } = await supabase
    .from("quotes")
    .select("id, assigned_to, contact_name")
    .eq("organization_id", channel.organization_id)
    .ilike("contact_email", from)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: message, error } = await supabase
    .from("comm_messages")
    .insert({
      organization_id: channel.organization_id,
      channel_id: channel.id,
      quote_id: quote?.id ?? null,
      direction: "inbound",
      from_address: from,
      from_name: input.fromName || quote?.contact_name || null,
      to_address: input.to || channel.address,
      subject: input.subject || null,
      body_text: input.text || null,
      body_html: input.html || null,
      external_id: input.messageId || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false as const, error: error.message };

  await supabase
    .from("comm_channels")
    .update({ last_sync_at: new Date().toISOString(), last_error: null, status: "connected", updated_at: new Date().toISOString() })
    .eq("id", channel.id);

  if (quote) {
    await supabase.from("quote_activities").insert({
      organization_id: channel.organization_id,
      quote_id: quote.id,
      type: "email_sent",
      payload: { template_kind: "inbound", subject: input.subject, channel_id: channel.id } as Json,
    });
    const notifyUserId = quote.assigned_to || channel.user_id;
    if (notifyUserId) {
      await supabase.from("notifications").insert({
        organization_id: channel.organization_id,
        user_id: notifyUserId,
        quote_id: quote.id,
        type: "inbound_email",
        body: `Email de ${input.fromName || from}${input.subject ? `, ${input.subject}` : ""}`,
      });
    }
  }

  return { ok: true as const, id: message.id, quoteId: quote?.id ?? null };
}

export function readInboundPayload(body: unknown) {
  const raw = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const data = (raw.data && typeof raw.data === "object" ? raw.data : raw) as Record<string, unknown>;
  return {
    from: asString(data.from) || asString((data.from as { email?: string } | undefined)?.email),
    fromName: asString(data.from_name) || asString((data.from as { name?: string } | undefined)?.name),
    to: asString(data.to) || asString((data.to as { email?: string } | undefined)?.email),
    subject: asString(data.subject),
    text: asString(data.text) || asString(data.body) || asString(data.body_text),
    html: asString(data.html) || asString(data.body_html),
    messageId: asString(data.message_id) || asString(data.messageId) || asString(data.id),
  };
}
