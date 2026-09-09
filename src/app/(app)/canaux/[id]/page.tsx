import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { disconnectChannel, replyOnChannel } from "@/app/(app)/canaux/actions";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { getOrgContext } from "@/lib/auth/org";
import { PROVIDER_LABELS, type CommProvider, type CommStatus } from "@/lib/comm/types";
import { formatDate } from "@/lib/format";
import { getAppUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const STATUS: Record<CommStatus, { tone: ChipTone; label: string }> = {
  connected: { tone: "emerald", label: "Connecté" },
  pending: { tone: "amber", label: "En attente" },
  error: { tone: "rose", label: "En erreur" },
  coming_soon: { tone: "violet", label: "Prêt · bientôt" },
};

export default async function ChannelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ m?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const { id } = await params;
  const { m } = await searchParams;
  const supabase = await createClient();
  const { data: channel } = await supabase
    .from("comm_channels")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!channel) notFound();

  const { data: messages } = await supabase
    .from("comm_messages")
    .select("*")
    .eq("channel_id", channel.id)
    .order("received_at", { ascending: false })
    .limit(80);

  const selected = (messages ?? []).find((row) => row.id === m) ?? null;
  if (selected && !selected.read_at) {
    await supabase
      .from("comm_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", selected.id)
      .eq("organization_id", ctx.organization.id)
      .is("read_at", null);
  }

  const status = STATUS[channel.status as CommStatus] ?? STATUS.pending;
  const inboundUrl = `${getAppUrl()}/api/comm/inbound/${channel.inbound_token}`;
  const remove = disconnectChannel.bind(null, channel.id);

  return (
    <ListPanel>
      <ListToolbar>
        <Link href="/canaux" className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
          Canaux
        </Link>
        <div className="mr-auto min-w-0">
          <span className="text-sm font-medium text-slate-900">{channel.label}</span>
          <span className="ml-2 text-xs text-slate-500">{channel.address}</span>
        </div>
        <Chip tone={status.tone}>{status.label}</Chip>
        <form action={remove}>
          <button className="text-sm text-rose-700">Déconnecter</button>
        </form>
      </ListToolbar>

      {channel.status === "coming_soon" ? (
        <div className="border-b border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-900 lg:px-6">
          Canal {PROVIDER_LABELS[channel.provider as CommProvider]} enregistré. L’OAuth se brancherà ici, sans
          recréer le canal.
        </div>
      ) : (
        <div className="border-b border-slate-100 px-4 py-3 text-xs text-slate-500 lg:px-6">
          Transfert / webhook inbound :{" "}
          <code className="break-all font-mono text-[11px] text-slate-700">{inboundUrl}</code>
        </div>
      )}

      {selected ? (
        <div className="border-b border-slate-200 px-4 py-5 lg:px-6">
          <Link href={`/canaux/${channel.id}`} className="text-sm text-[#C2410C]">
            Retour à la boîte
          </Link>
          <p className="mt-3 text-sm font-medium text-slate-900">{selected.subject || "(sans objet)"}</p>
          <p className="mt-1 text-xs text-slate-500">
            {selected.from_name || selected.from_address} · {formatDate(selected.received_at)}
            {selected.quote_id ? (
              <>
                {" · "}
                <Link href={`/devis/${selected.quote_id}`} className="text-[#C2410C]">
                  Demande liée
                </Link>
              </>
            ) : null}
          </p>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-800">
            {selected.body_text || selected.body_html?.replace(/<[^>]+>/g, " ") || "—"}
          </div>
          {selected.direction === "inbound" ? (
            <form action={replyOnChannel} className="mt-6 space-y-2">
              <input type="hidden" name="channel_id" value={channel.id} />
              <input type="hidden" name="message_id" value={selected.id} />
              <textarea
                name="body"
                required
                rows={5}
                placeholder="Répondre au client…"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
              <button className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]">
                Envoyer
              </button>
            </form>
          ) : null}
        </div>
      ) : (messages ?? []).length ? (
        <DataTable headers={["De", "Objet", "Sens", "Quand"]}>
          {(messages ?? []).map((message) => (
            <ClickableRow key={message.id} href={`/canaux/${channel.id}?m=${message.id}`}>
              <td className="px-4 py-3 lg:px-6">
                <span className="block font-medium text-slate-900">{message.from_name || message.from_address}</span>
                <span className="block text-xs text-slate-500">{message.from_address}</span>
              </td>
              <td className="px-4 py-3 lg:px-6">
                <span className={!message.read_at && message.direction === "inbound" ? "font-medium text-slate-900" : "text-slate-700"}>
                  {message.subject || "(sans objet)"}
                </span>
              </td>
              <td className="px-4 py-3 lg:px-6">
                <Chip tone={message.direction === "inbound" ? "amber" : "emerald"}>
                  {message.direction === "inbound" ? "Reçu" : "Envoyé"}
                </Chip>
              </td>
              <td className="px-4 py-3 text-slate-500 lg:px-6">{formatDate(message.received_at)}</td>
            </ClickableRow>
          ))}
        </DataTable>
      ) : (
        <div className="px-4 py-16 text-center lg:px-6">
          <p className="text-sm font-medium text-slate-900">Aucun message</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Pointez le transfert de cette boîte vers le webhook inbound, ou répondez depuis une campagne.
          </p>
        </div>
      )}
    </ListPanel>
  );
}
