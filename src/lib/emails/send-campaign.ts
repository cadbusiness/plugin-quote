import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import { sendHtmlEmail } from "@/lib/email/send";
import { parseDesign } from "@/lib/emails/blocks";
import { renderEmailHtml, renderEmailText } from "@/lib/emails/render";
import { applyPersonalization, campaignVars } from "@/lib/emails/vars";
import { recentlyContacted } from "@/lib/segments/match";
import { resolveSegment } from "@/lib/segments/resolve";
import type { SegmentContact } from "@/lib/segments/types";

type Client = SupabaseClient<Database>;

export async function sendCampaign(
  supabase: Client,
  input: {
    organizationId: string;
    campaignId: string;
    actorId: string | null;
    orgName: string;
    salesName: string;
    fromAddress?: string | null;
    replyTo?: string | null;
  },
) {
  const { data: campaign } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", input.campaignId)
    .eq("organization_id", input.organizationId)
    .maybeSingle();
  if (!campaign) throw new Error("Campagne introuvable");
  if (campaign.status === "sending") throw new Error("Envoi déjà en cours");

  const design = parseDesign(campaign.design);
  if (!design.blocks.length) throw new Error("L’email est vide — ajoutez des blocs.");
  if (!campaign.subject.trim()) throw new Error("Ajoutez un objet.");

  const rules = campaign.segment_id
    ? (
        await supabase
          .from("contact_segments")
          .select("rules")
          .eq("id", campaign.segment_id)
          .eq("organization_id", input.organizationId)
          .maybeSingle()
      ).data?.rules
    : { all: [] };

  const contacts = await resolveSegment(supabase, input.organizationId, rules ?? { all: [] });
  const unique = new Map<string, SegmentContact>();
  for (const contact of contacts) {
    const email = contact.contactEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) continue;
    if (!unique.has(email)) unique.set(email, contact);
  }

  await supabase
    .from("email_campaigns")
    .update({ status: "sending", updated_at: new Date().toISOString() })
    .eq("id", campaign.id);

  const from = input.fromAddress
    ? `${input.orgName} <${input.fromAddress}>`
    : undefined;
  const mode = campaign.send_mode === "group" ? "group" : "personal";
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const contact of unique.values()) {
    const skip = recentlyContacted(contact.lastCampaignAt, campaign.skip_recent_days);
    if (skip) {
      await supabase.from("email_campaign_sends").insert({
        organization_id: input.organizationId,
        campaign_id: campaign.id,
        quote_id: contact.id,
        contact_email: contact.contactEmail,
        contact_name: contact.contactName,
        status: "skipped",
        skip_reason: "recently_contacted",
      });
      skipped += 1;
      continue;
    }

    const vars = campaignVars(contact, {
      orgName: input.orgName,
      salesName: input.salesName,
    });
    const merge = mode === "group" ? { ...vars, contact_name: "vous", answers_text: "" } : vars;
    const subject = applyPersonalization(campaign.subject, merge, mode);
    const html = renderEmailHtml(design, merge);
    const text = renderEmailText(design, merge);

    try {
      await sendHtmlEmail({
        to: contact.contactEmail,
        subject,
        html,
        text,
        from,
        replyTo: input.replyTo ?? undefined,
      });
      await supabase.from("email_campaign_sends").insert({
        organization_id: input.organizationId,
        campaign_id: campaign.id,
        quote_id: contact.id,
        contact_email: contact.contactEmail,
        contact_name: contact.contactName,
        status: "sent",
        sent_at: new Date().toISOString(),
      });
      await supabase.from("quote_activities").insert({
        organization_id: input.organizationId,
        quote_id: contact.id,
        actor_id: input.actorId,
        type: "campaign_sent",
        payload: { campaign_id: campaign.id, subject, mode } as Json,
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      await supabase.from("email_campaign_sends").insert({
        organization_id: input.organizationId,
        campaign_id: campaign.id,
        quote_id: contact.id,
        contact_email: contact.contactEmail,
        contact_name: contact.contactName,
        status: "failed",
        skip_reason: error instanceof Error ? error.message : "send_failed",
      });
    }
  }

  await supabase
    .from("email_campaigns")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_count: sent,
      html: renderEmailHtml(design, { contact_name: "{{contact_name}}" }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaign.id);

  return { sent, skipped, failed, total: unique.size };
}
