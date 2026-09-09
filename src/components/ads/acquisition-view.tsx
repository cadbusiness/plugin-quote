"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { HelpTip, LabelHelp } from "@/components/ui/help-tip";
import { GaugeBar } from "@/components/ui/gauge";
import { DataTable } from "@/components/ui/list-panel";
import { CopyBlock } from "@/components/funnels/copy-block";
import {
  disconnectAds,
  pickAdsCustomer,
  refreshAdsStats,
  reloadAdsCustomers,
} from "@/app/(app)/acquisition/actions";
import { keywordsAsPaste, type KeywordPack } from "@/lib/ads/keywords";
import { formatEur, formatEurExact, formatPercent, formatRelative } from "@/lib/format";
import type { AdsConnectionView } from "@/lib/ads/sync";
import type { CampaignStatsRow, FunnelStatsRow, StatsDashboard } from "@/lib/stats/dashboard";

type PendingCustomer = { id: string; name: string };
type LandingUrl = { funnelId: string; name: string; sector: string; url: string; campaign: string };

const ERRORS: Record<string, string> = {
  env: "La connexion Google Ads n’est pas encore ouverte sur votre espace. Écrivez au support, on l’active.",
  denied: "Connexion Google annulée. Vous pouvez réessayer quand vous voulez.",
  oauth: "Google n’a pas pu terminer la connexion. Réessayez, ou écrivez au support.",
  state: "La session a expiré. Relancez la connexion.",
  refresh: "Google n’a pas donné l’autorisation complète. Reconnectez et acceptez les accès proposés.",
  pick: "Ce compte Google Ads n’a pas pu être activé. Réessayez ou choisissez un autre compte.",
  noconnect: "Connectez d’abord Google Ads.",
  customers: "Impossible de lister vos comptes Google Ads. Reconnectez le compte.",
};

export function AcquisitionView({
  stats,
  connection,
  configured,
  packs,
  landingUrls,
  pendingCustomers,
  pick,
  error,
  admin,
}: {
  stats: StatsDashboard;
  connection: AdsConnectionView | null;
  configured: boolean;
  packs: KeywordPack[];
  landingUrls: LandingUrl[];
  pendingCustomers: PendingCustomer[];
  pick: boolean;
  error?: string;
  admin: boolean;
}) {
  const adsCampaigns = stats.campaigns.filter((row) => row.source === "Google Ads");
  const quotes = adsCampaigns.reduce((sum, row) => sum + row.quotes, 0);
  const won = adsCampaigns.reduce((sum, row) => sum + row.won, 0);
  const spend = stats.ads.spend;
  const costQuote = quotes && spend ? spend / quotes : null;
  const costWon = won && spend ? spend / won : null;
  const hasTraffic = adsCampaigns.length > 0 || stats.campaigns.length > 0;
  const connected = connection?.status === "active";

  return (
    <>
      {error && ERRORS[error] ? (
        <p className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800 lg:px-6">{ERRORS[error]}</p>
      ) : null}

      {pick && pendingCustomers.length > 0 ? <CustomerPicker customers={pendingCustomers} /> : null}

      <StatusStrip connection={connection} configured={configured} admin={admin} hasTraffic={hasTraffic} />

      <div className="grid grid-cols-2 border-b border-slate-200 lg:grid-cols-4">
        <Kpi
          label="Dépensé"
          help="Ce que Google Ads vous a facturé sur les 30 derniers jours. Apparaît une fois le compte branché et les pubs lancées."
          value={spend ? formatEur(spend) : null}
          empty={connected ? "Aucune dépense" : "Compte non branché"}
          hint="30 derniers jours"
        />
        <Kpi
          label="Devis des pubs"
          help="Demandes de devis dont le visiteur est arrivé par une pub Google. Même sans compte branché, on les reconnaît déjà au lien."
          value={String(quotes)}
          hint={quotes ? "issus d’une pub Google" : "en attente de clics"}
        />
        <Kpi
          label="Un devis coûte"
          help="Budget ads divisé par le nombre de devis reçus. C’est le prix d’un dossier à rappeler."
          value={costQuote != null ? formatEurExact(costQuote) : null}
          empty={quotes ? "Coût encore inconnu" : "Dès le premier devis"}
          hint="pour chaque demande reçue"
        />
        <Kpi
          label="Un client coûte"
          help="Budget ads divisé par les dossiers passés Gagné. C’est le vrai coût d’acquisition, une fois le devis signé."
          value={costWon != null ? formatEurExact(costWon) : null}
          empty={won ? "Coût encore inconnu" : "Quand un devis est signé"}
          hint="pour chaque dossier signé"
          last
        />
      </div>

      <CampaignTable
        rows={adsCampaigns.length ? adsCampaigns : stats.campaigns}
        funnels={stats.funnels}
        connected={connected}
        adsOnly={adsCampaigns.length > 0}
      />

      <PrepareCampaign packs={packs} landingUrls={landingUrls} />
    </>
  );
}

function StatusStrip({
  connection,
  configured,
  admin,
  hasTraffic,
}: {
  connection: AdsConnectionView | null;
  configured: boolean;
  admin: boolean;
  hasTraffic: boolean;
}) {
  const status = connectionStatus(connection);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3 lg:px-6">
      <Chip tone={status.tone}>{status.label}</Chip>
      <p className="min-w-0 flex-1 text-sm text-slate-600">{status.detail}</p>
      {connection?.quoteAction ? (
        <span className="inline-flex items-center gap-1">
          <Chip tone="violet">Devis renvoyé</Chip>
          <HelpTip label="Conversion devis">
            À chaque demande envoyée, QuoteBuilder prévient Google Ads. Google apprend quelles pubs amènent un devis.
          </HelpTip>
        </span>
      ) : null}
      {connection?.wonAction ? (
        <span className="inline-flex items-center gap-1">
          <Chip tone="emerald">Gagné renvoyé</Chip>
          <HelpTip label="Conversion gagné">
            Quand vous passez un devis en Gagné, Google Ads le sait. C’est ce qui permet d’optimiser vers les vrais clients.
          </HelpTip>
        </span>
      ) : null}
      {connection?.lastSyncAt ? (
        <p className="text-xs text-slate-500">Dépenses à jour {formatRelative(connection.lastSyncAt)}</p>
      ) : null}
      {admin ? <ConnectionActions connection={connection} configured={configured} /> : null}
      {!connection && hasTraffic ? (
        <p className="w-full text-xs text-slate-500">
          Des visiteurs arrivent déjà depuis une pub. Branchez le compte pour voir ce qu’ils vous coûtent.
        </p>
      ) : null}
      {connection?.status === "error" && connection.lastError ? (
        <p className="w-full text-xs text-rose-700">{connection.lastError}</p>
      ) : null}
    </div>
  );
}

function connectionStatus(connection: AdsConnectionView | null) {
  if (!connection) {
    return {
      tone: "slate" as const,
      label: "Pas encore branché",
      detail: "Les clics sur vos pubs sont déjà suivis. Branchez Google Ads pour voir le coût d’un devis.",
    };
  }
  if (connection.status === "active") {
    return {
      tone: "emerald" as const,
      label: connection.customerName || "Google Ads",
      detail: "Les devis et les dossiers gagnés sont renvoyés à Google. Les dépenses s’affichent ici.",
    };
  }
  if (connection.status === "pending") {
    return {
      tone: "amber" as const,
      label: "Compte à choisir",
      detail: "Google est autorisé. Choisissez le compte qui paie vos campagnes.",
    };
  }
  if (connection.status === "error") {
    return {
      tone: "rose" as const,
      label: "Connexion en erreur",
      detail: "Reconnectez le compte. Les devis restent suivis de votre côté.",
    };
  }
  return {
    tone: "slate" as const,
    label: "En pause",
    detail: "Le compte Google Ads n’envoie plus les dépenses. Reconnectez-le pour reprendre.",
  };
}

function ConnectionActions({
  connection,
  configured,
}: {
  connection: AdsConnectionView | null;
  configured: boolean;
}) {
  if (!configured || !connection) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {connection.status === "active" ? <SyncButton /> : null}
      {connection.status === "pending" || connection.status === "error" ? <ReloadCustomersButton /> : null}
      <DisconnectButton />
    </div>
  );
}

function Kpi({
  label,
  help,
  value,
  empty,
  hint,
  last,
}: {
  label: string;
  help: string;
  value: string | null;
  empty?: string;
  hint: string;
  last?: boolean;
}) {
  return (
    <div className={`px-4 py-4 lg:px-6 ${last ? "" : "border-b border-slate-200 lg:border-b-0 lg:border-r"}`}>
      <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        <LabelHelp help={help}>{label}</LabelHelp>
      </p>
      {value ? (
        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      ) : (
        <p className="mt-1 text-lg font-medium text-slate-400">{empty ?? "Pas encore"}</p>
      )}
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function SyncButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => void refreshAdsStats())}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-white disabled:opacity-50"
    >
      {pending ? "Mise à jour…" : "Actualiser les dépenses"}
    </button>
  );
}

function ReloadCustomersButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => void reloadAdsCustomers())}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-white disabled:opacity-50"
    >
      {pending ? "Comptes…" : "Choisir un compte"}
    </button>
  );
}

function DisconnectButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => void disconnectAds())}
      className="rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-50"
    >
      Déconnecter
    </button>
  );
}

function CustomerPicker({ customers }: { customers: PendingCustomer[] }) {
  const [pending, start] = useTransition();
  return (
    <div className="border-b border-amber-100 bg-amber-50/70 px-4 py-4 lg:px-6">
      <p className="text-sm font-medium text-slate-900">Quel compte Google Ads utilisez-vous ?</p>
      <p className="mt-0.5 text-sm text-slate-600">
        Un seul compte par organisation. C’est celui qui paie les pubs et qui recevra les devis et les dossiers gagnés.
      </p>
      <div className="mt-3 divide-y divide-amber-100 overflow-hidden rounded-md bg-white ring-1 ring-amber-100">
        {customers.map((customer) => (
          <button
            key={customer.id}
            type="button"
            disabled={pending}
            onClick={() => start(() => void pickAdsCustomer(customer.id, customer.name))}
            className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-orange-50 disabled:opacity-50"
          >
            <span className="font-medium text-slate-900">{customer.name}</span>
            <span className="font-mono text-xs text-slate-500">{customer.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CampaignTable({
  rows,
  funnels,
  connected,
  adsOnly,
}: {
  rows: CampaignStatsRow[];
  funnels: FunnelStatsRow[];
  connected: boolean;
  adsOnly: boolean;
}) {
  return (
    <section className="border-b border-slate-200">
      <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
          <LabelHelp help="Une ligne = une campagne Google (ou un nom de campagne collé dans le lien). Cliquez le funnel pour voir le détail.">
            Campagnes
          </LabelHelp>
        </p>
        <p className="mt-0.5 text-sm text-slate-500">
          {adsOnly
            ? "Devis, signatures et coût pour chaque pub."
            : connected
              ? "Les campagnes apparaissent dès qu’un visiteur arrive depuis une pub."
              : "Les devis sont déjà rattachés à la campagne. Le coût s’affiche une fois Google Ads branché."}
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
          Aucune pub n’a encore envoyé de visiteur. Copiez l’URL ci-dessous dans Google Ads : la campagne s’affichera ici
          dès le premier clic.
        </p>
      ) : (
        <DataTable headers={["Campagne", "Funnel", "Devis", "Gagnés", "Conversion", "Un devis", "Un client"]}>
          {rows.map((row) => (
            <tr key={`${row.campaign}-${row.source}`} className="border-b border-slate-100">
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium text-slate-900">{row.campaign}</div>
                <Chip tone={row.source === "Google Ads" ? "orange" : "slate"}>{row.source}</Chip>
              </td>
              <td className="px-4 py-2.5 lg:px-6">
                {row.funnelId ? (
                  <Link href={`/funnels/${row.funnelId}?tab=stats`} className="text-sm hover:text-[#C2410C]">
                    {row.funnelName ?? funnels.find((f) => f.id === row.funnelId)?.name ?? "Funnel"}
                  </Link>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{row.quotes}</td>
              <td className="px-4 py-2.5 lg:px-6">
                <Chip tone={row.won ? "emerald" : "slate"}>{row.won}</Chip>
              </td>
              <td className="px-4 py-2.5 lg:px-6">
                <div className="min-w-[5.5rem]">
                  <GaugeBar pct={(row.conversion ?? 0) / 100} tone="orange" />
                  <p className="mt-1 text-xs tabular-nums text-slate-500">{formatPercent(row.conversion)}</p>
                </div>
              </td>
              <td className="px-4 py-2.5 tabular-nums text-slate-700 lg:px-6">
                {row.costPerQuote != null ? formatEurExact(row.costPerQuote) : connected ? "—" : "À brancher"}
              </td>
              <td className="px-4 py-2.5 tabular-nums text-slate-700 lg:px-6">
                {row.costPerWon != null ? formatEurExact(row.costPerWon) : "—"}
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </section>
  );
}

function PrepareCampaign({ packs, landingUrls }: { packs: KeywordPack[]; landingUrls: LandingUrl[] }) {
  const defaultId = landingUrls[0]?.funnelId ?? "";
  const [funnelId, setFunnelId] = useState(defaultId);
  const current = landingUrls.find((item) => item.funnelId === funnelId) ?? landingUrls[0];
  const defaultSector = current ? packSector(packs, current.sector) : packs[0]?.sector ?? "general";
  const [sector, setSector] = useState(defaultSector);
  const pack = packs.find((item) => item.sector === sector) ?? packs[0];

  return (
    <section>
      <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
          <LabelHelp help="QuoteBuilder ne crée pas la campagne. Vous la lancez dans Google Ads, avec l’URL et les mots-clés préparés ici.">
            Lancer une campagne
          </LabelHelp>
        </p>
        <p className="mt-0.5 text-sm text-slate-500">
          Dans Google Ads : campagne Search, objectif Leads, 10 à 30 € par jour. Collez l’URL et les mots-clés.
        </p>
      </div>

      {landingUrls.length === 0 ? (
        <p className="px-4 py-8 text-sm text-slate-500 lg:px-6">
          Créez d’abord un funnel : c’est la page sur laquelle la pub doit atterrir.
        </p>
      ) : (
        <div className="border-b border-slate-100 px-4 py-4 lg:px-6">
          {landingUrls.length > 1 ? (
            <label className="mb-3 block text-sm">
              <span className="font-medium text-slate-900">Funnel de destination</span>
              <span className="mt-0.5 block text-xs text-slate-500">Le visiteur de la pub arrive ici, pas sur votre site.</span>
              <select
                value={current?.funnelId ?? ""}
                onChange={(event) => {
                  const next = event.target.value;
                  setFunnelId(next);
                  const landing = landingUrls.find((item) => item.funnelId === next);
                  if (landing) setSector(packSector(packs, landing.sector));
                }}
                className="mt-2 w-full max-w-md rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {landingUrls.map((item) => (
                  <option key={item.funnelId} value={item.funnelId}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="mb-3 text-sm text-slate-600">
              Destination : <span className="font-medium text-slate-900">{current?.name}</span>
            </p>
          )}
          {current ? (
            <CopyBlock
              compact
              label="URL à coller dans l’annonce"
              hint="Page de destination Google Ads. Le suivi est déjà dans le lien, ne le modifiez pas."
              value={current.url}
            />
          ) : null}
          {pack ? (
            <p className="mt-3 text-sm text-slate-600">
              Nommez la campagne{" "}
              <span className="rounded bg-orange-50 px-1.5 py-0.5 font-mono text-[13px] font-medium text-[#C2410C]">
                {pack.campaignName}
              </span>{" "}
              pour que QuoteBuilder la reconnaisse.
            </p>
          ) : null}
        </div>
      )}

      {pack ? (
        <>
          <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <LabelHelp help="Liste à coller dans le groupe d’annonces Google Ads. Large, expression, exact, puis les mots à exclure (emploi, occasion…).">
                Mots-clés du métier
              </LabelHelp>
            </p>
            <p className="mt-0.5 text-sm text-slate-500">Choisissez le métier, copiez, collez dans Google Ads.</p>
          </div>
          <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-4 py-2 lg:px-6">
            {packs.map((item) => (
              <button
                key={item.sector}
                type="button"
                onClick={() => setSector(item.sector)}
                className={`rounded-full px-2.5 py-1 text-sm ${
                  item.sector === sector ? "bg-orange-50 font-medium text-[#C2410C]" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <CopyBlock
            label="Liste à coller"
            hint="Une ligne = un mot-clé. Les lignes en « … » sont une expression, [ … ] l’exact, − … un mot à exclure."
            value={keywordsAsPaste(pack)}
          />
          <div className="grid gap-6 px-4 py-4 lg:grid-cols-2 lg:px-6">
            <div>
              <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                <LabelHelp help="Titres d’annonce Google, 30 caractères max. Vous pouvez les coller tels quels ou les adapter.">
                  Titres d’annonce
                </LabelHelp>
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                {pack.headlines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                <LabelHelp help="Descriptions d’annonce, 90 caractères. Elles expliquent que le prospect configure avant d’être rappelé.">
                  Descriptions
                </LabelHelp>
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                {pack.descriptions.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function packSector(packs: KeywordPack[], sector: string) {
  return packs.some((item) => item.sector === sector) ? sector : packs[0]?.sector ?? "general";
}
