import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EmailBuilder } from "@/components/emails/email-builder";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { getOrgContext } from "@/lib/auth/org";
import { recentlyContacted } from "@/lib/segments/match";
import { resolveSegment } from "@/lib/segments/resolve";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

export default async function CampaignEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const { id } = await params;
  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!campaign) notFound();

  const [{ data: segments }, { data: channels }] = await Promise.all([
    supabase.from("contact_segments").select("id, name, rules").eq("organization_id", ctx.organization.id).order("name"),
    supabase
      .from("comm_channels")
      .select("id, label, address, provider, status")
      .eq("organization_id", ctx.organization.id)
      .neq("status", "coming_soon"),
  ]);

  const selected = (segments ?? []).find((row) => row.id === campaign.segment_id);
  const contacts = await resolveSegment(supabase, ctx.organization.id, selected?.rules ?? { all: [] });
  const unique = new Set(
    contacts
      .filter((contact) => contact.contactEmail.includes("@") && !recentlyContacted(contact.lastCampaignAt, campaign.skip_recent_days))
      .map((contact) => contact.contactEmail.toLowerCase()),
  );

  const emailChannels = (channels ?? []).filter((channel) => ["gmail", "outlook", "imap"].includes(channel.provider));

  return (
    <ListPanel className="min-h-0">
      <ListToolbar>
        <Link href="/emails" className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
          Emails
        </Link>
        <p className="mr-auto truncate text-sm text-slate-500">{campaign.name}</p>
      </ListToolbar>
      <EmailBuilder
        campaign={campaign}
        segments={(segments ?? []).map((row) => ({ id: row.id, name: row.name }))}
        channels={emailChannels}
        recipientCount={unique.size}
      />
    </ListPanel>
  );
}
