import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { ConnectChannelDialog } from "@/components/comm/connect-channel-dialog";
import { formatDate } from "@/lib/format";
import { PROVIDER_LABELS, providerKind, type CommProvider, type CommStatus } from "@/lib/comm/types";
import { createClient } from "@/lib/supabase/server";

const STATUS: Record<CommStatus, { tone: ChipTone; label: string }> = {
  connected: { tone: "emerald", label: "Connecté" },
  pending: { tone: "amber", label: "En attente" },
  error: { tone: "rose", label: "En erreur" },
  coming_soon: { tone: "violet", label: "Prêt · bientôt" },
};

export default async function CanauxPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const [{ data: channels }, { data: unread }] = await Promise.all([
    supabase
      .from("comm_channels")
      .select("*")
      .eq("organization_id", ctx.organization.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("comm_messages")
      .select("channel_id")
      .eq("organization_id", ctx.organization.id)
      .eq("direction", "inbound")
      .is("read_at", null),
  ]);

  const unreadByChannel = new Map<string, number>();
  for (const row of unread ?? []) {
    unreadByChannel.set(row.channel_id, (unreadByChannel.get(row.channel_id) ?? 0) + 1);
  }
  const rows = channels ?? [];

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          Boîtes mail de l’équipe et de chaque commercial. Instagram et Facebook se préparent ici.
        </p>
        <ConnectChannelDialog isAdmin={isAdminRole(ctx.role)} staffEmail={ctx.email} />
      </ListToolbar>

      {rows.length ? (
        <DataTable headers={["Canal", "Qui", "Adresse", "Messages", "Statut"]}>
          {rows.map((channel) => {
            const provider = channel.provider as CommProvider;
            const status = STATUS[channel.status as CommStatus] ?? STATUS.pending;
            const unreadCount = unreadByChannel.get(channel.id) ?? 0;
            const mine = channel.user_id === ctx.userId;
            return (
              <ClickableRow key={channel.id} href={`/canaux/${channel.id}`}>
                <td className="px-4 py-3 lg:px-6">
                  <span className="block font-medium text-slate-900">{channel.label}</span>
                  <Chip tone={providerKind(provider) === "email" ? "orange" : "violet"}>
                    {PROVIDER_LABELS[provider] ?? channel.provider}
                  </Chip>
                </td>
                <td className="px-4 py-3 lg:px-6">
                  <Chip tone={channel.scope === "org" ? "emerald" : "sky"}>
                    {channel.scope === "org" ? "Équipe" : mine ? "Moi" : "Staff"}
                  </Chip>
                </td>
                <td className="px-4 py-3 text-slate-600 lg:px-6">{channel.address}</td>
                <td className="px-4 py-3 tabular-nums lg:px-6">
                  {unreadCount ? (
                    <Chip tone="amber">{unreadCount} non lu{unreadCount > 1 ? "s" : ""}</Chip>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 lg:px-6">
                  <Chip tone={status.tone}>{status.label}</Chip>
                  {channel.last_sync_at ? (
                    <span className="mt-1 block text-xs text-slate-500">{formatDate(channel.last_sync_at)}</span>
                  ) : null}
                </td>
              </ClickableRow>
            );
          })}
        </DataTable>
      ) : (
        <div className="px-4 py-16 text-center lg:px-6">
          <p className="text-sm font-medium text-slate-900">Aucun canal connecté</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Branchez la boîte de Quickly, puis chaque commercial connecte la sienne. Les mails clients
            arrivent ici, et les campagnes partent depuis ces adresses.
          </p>
          <p className="mt-4">
            <a href="#nouveau" className="text-sm font-medium text-[#C2410C] underline">
              Connecter un canal
            </a>
          </p>
        </div>
      )}
    </ListPanel>
  );
}
