import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/auth/org";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { CreateCampaignDialog } from "@/components/emails/create-campaign-dialog";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const STATUS: Record<string, { tone: ChipTone; label: string }> = {
  draft: { tone: "amber", label: "Brouillon" },
  sending: { tone: "sky", label: "Envoi" },
  sent: { tone: "emerald", label: "Envoyée" },
  scheduled: { tone: "violet", label: "Planifiée" },
};

export default async function EmailsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const [{ data: campaigns }, { data: segments }, { data: channels }] = await Promise.all([
    supabase
      .from("email_campaigns")
      .select("*")
      .eq("organization_id", ctx.organization.id)
      .order("created_at", { ascending: false }),
    supabase.from("contact_segments").select("id, name").eq("organization_id", ctx.organization.id).order("name"),
    supabase
      .from("comm_channels")
      .select("id, label, address, provider, status")
      .eq("organization_id", ctx.organization.id)
      .neq("status", "coming_soon"),
  ]);

  const segmentName = new Map((segments ?? []).map((row) => [row.id, row.name]));
  const rows = campaigns ?? [];
  const emailChannels = (channels ?? []).filter((channel) =>
    ["gmail", "outlook", "imap"].includes(channel.provider),
  );

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          Emails personnels ou de groupe, sur un segment. Le builder assemble de vrais emails.
        </p>
        <CreateCampaignDialog segments={segments ?? []} channels={emailChannels} />
      </ListToolbar>

      {rows.length ? (
        <DataTable headers={["Campagne", "Segment", "Mode", "Envoyés", "Statut"]}>
          {rows.map((campaign) => {
            const status = STATUS[campaign.status] ?? STATUS.draft;
            return (
              <ClickableRow key={campaign.id} href={`/emails/${campaign.id}`}>
                <td className="px-4 py-3 lg:px-6">
                  <span className="block font-medium text-slate-900">{campaign.name}</span>
                  <span className="block text-xs text-slate-500">{campaign.subject || "Sans objet"}</span>
                </td>
                <td className="px-4 py-3 lg:px-6">
                  <Chip tone="orange">{campaign.segment_id ? segmentName.get(campaign.segment_id) ?? "Segment" : "Tous"}</Chip>
                </td>
                <td className="px-4 py-3 lg:px-6">
                  <Chip tone={campaign.send_mode === "group" ? "violet" : "sky"}>
                    {campaign.send_mode === "group" ? "Groupe" : "Personnel"}
                  </Chip>
                </td>
                <td className="px-4 py-3 tabular-nums lg:px-6">{campaign.sent_count}</td>
                <td className="px-4 py-3 lg:px-6">
                  <Chip tone={status.tone}>{status.label}</Chip>
                  {campaign.sent_at ? (
                    <span className="mt-1 block text-xs text-slate-500">{formatDate(campaign.sent_at)}</span>
                  ) : null}
                </td>
              </ClickableRow>
            );
          })}
        </DataTable>
      ) : (
        <div className="px-4 py-16 text-center lg:px-6">
          <p className="text-sm font-medium text-slate-900">Aucune campagne</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Un segment (B2B, un funnel, des réponses), un email drag-and-drop, un envoi personnel ou de groupe.
          </p>
          <p className="mt-4">
            <a href="#nouveau" className="text-sm font-medium text-[#C2410C] underline">
              Nouvelle campagne
            </a>
          </p>
        </div>
      )}
    </ListPanel>
  );
}
