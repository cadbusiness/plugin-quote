"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { DataTable } from "@/components/ui/list-panel";
import { CopyBlock } from "@/components/funnels/copy-block";
import { disconnectAds, pickAdsCustomer, refreshAdsStats } from "@/app/(app)/acquisition/actions";
import { CAMPAIGN_GUIDE } from "@/lib/ads/utm";
import { keywordsAsPaste, type KeywordPack } from "@/lib/ads/keywords";
import { formatEur, formatEurExact, formatPercent } from "@/lib/format";
import type { AdsConnectionView } from "@/lib/ads/sync";
import type { CampaignStatsRow, FunnelStatsRow, StatsDashboard } from "@/lib/stats/dashboard";

type PendingCustomer = { id: string; name: string };

const ERRORS: Record<string, string> = {
  env: "Google Ads n’est pas configuré sur l’instance (client ID, secret, developer token).",
  denied: "Connexion Google annulée.",
  oauth: "Impossible de terminer la connexion Google Ads.",
  state: "Session OAuth expirée. Recommencez.",
  refresh: "Google n’a pas renvoyé de refresh token. Reconnectez en acceptant tous les accès.",
  pick: "Impossible d’activer ce compte Ads.",
  noconnect: "Reconnectez d’abord Google Ads.",
  customers: "Impossible de lister les comptes Ads.",
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
  landingUrls: { funnelId: string; name: string; sector: string; url: string; campaign: string }[];
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

  return (
    <>
      {error && ERRORS[error] ? (
        <p className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800 lg:px-6">{ERRORS[error]}</p>
      ) : null}

      {pick && pendingCustomers.length > 0 ? (
        <CustomerPicker customers={pendingCustomers} />
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 lg:px-6">
        <Chip tone={connection?.status === "active" ? "emerald" : connection ? "amber" : "slate"}>
          {connection?.status === "active"
            ? connection.customerName || "Google Ads"
            : connection
              ? "Compte à choisir"
              : "Non connecté"}
        </Chip>
        {connection?.quoteAction ? <Chip tone="violet">Conversion devis</Chip> : null}
        {connection?.wonAction ? <Chip tone="emerald">Conversion gagné</Chip> : null}
        <p className="text-sm text-slate-500">
          QuoteBuilder mesure le ROI. Google Ads reste l’endroit où vous créez la campagne.
        </p>
      </div>

      <div className="grid grid-cols-2 border-b border-slate-200 lg:grid-cols-4">
        <Kpi label="Dépense" value={spend ? formatEur(spend) : "—"} hint="30 jours, si Ads est sync" />
        <Kpi label="Devis Ads" value={String(quotes)} hint="attribués Google Ads" />
        <Kpi label="Coût / devis" value={costQuote != null ? formatEurExact(costQuote) : "—"} hint="spend ÷ devis" />
        <Kpi
          label="Coût / client"
          value={costWon != null ? formatEurExact(costWon) : "—"}
          hint="spend ÷ gagnés"
          last
        />
      </div>

      {admin ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3 lg:px-6">
          {configured ? (
            <a
              href="/api/ads/google/start"
              className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D45203]"
            >
              {connection ? "Reconnecter Google Ads" : "Connecter mon compte"}
            </a>
          ) : (
            <span className="text-sm text-slate-500">
              Demandez à l’équipe QuoteBuilder d’activer GOOGLE_ADS_CLIENT_ID sur l’instance.
            </span>
          )}
          {connection?.status === "active" ? <SyncButton /> : null}
          {connection ? <DisconnectButton /> : null}
        </div>
      ) : null}

      <CampaignTable rows={adsCampaigns.length ? adsCampaigns : stats.campaigns} funnels={stats.funnels} />

      <Guide urls={landingUrls} />

      <KeywordSection packs={packs} />
    </>
  );
}

function Kpi({ label, value, hint, last }: { label: string; value: string; hint: string; last?: boolean }) {
  return (
    <div className={`px-4 py-4 lg:px-6 ${last ? "" : "border-b border-slate-200 lg:border-b-0 lg:border-r"}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
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
      className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
    >
      {pending ? "Sync…" : "Actualiser le spend"}
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
      className="rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
    >
      Déconnecter
    </button>
  );
}

function CustomerPicker({ customers }: { customers: PendingCustomer[] }) {
  const [pending, start] = useTransition();
  return (
    <div className="border-b border-slate-200 px-4 py-4 lg:px-6">
      <p className="text-sm font-medium text-slate-900">Quel compte Google Ads utiliser ?</p>
      <p className="mt-0.5 text-sm text-slate-500">Un seul compte par organisation. QuoteBuilder y enverra les conversions devis et gagné.</p>
      <div className="mt-3 flex flex-col gap-1">
        {customers.map((customer) => (
          <button
            key={customer.id}
            type="button"
            disabled={pending}
            onClick={() => start(() => void pickAdsCustomer(customer.id, customer.name))}
            className="flex items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-orange-50 disabled:opacity-50"
          >
            <span className="font-medium text-slate-900">{customer.name}</span>
            <span className="font-mono text-xs text-slate-500">{customer.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CampaignTable({ rows, funnels }: { rows: CampaignStatsRow[]; funnels: FunnelStatsRow[] }) {
  return (
    <section className="border-b border-slate-200">
      <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">ROI campagnes</p>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-sm text-slate-500 lg:px-6">
          Aucun trafic Ads pour l’instant. Collez l’URL UTM du funnel dans Google Ads, les devis apparaîtront ici.
        </p>
      ) : (
        <DataTable headers={["Campagne", "Funnel", "Devis", "Gagnés", "Conversion", "Coût / devis", "Coût / client"]}>
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
                  "-"
                )}
              </td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{row.quotes}</td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{row.won}</td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{formatPercent(row.conversion)}</td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">
                {row.costPerQuote != null ? formatEurExact(row.costPerQuote) : "—"}
              </td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">
                {row.costPerWon != null ? formatEurExact(row.costPerWon) : "—"}
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </section>
  );
}

function Guide({ urls }: { urls: { funnelId: string; name: string; url: string; campaign: string }[] }) {
  return (
    <section className="border-b border-slate-200">
      <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Première campagne</p>
        <p className="mt-0.5 text-sm text-slate-500">À faire dans Google Ads. QuoteBuilder fournit les mots-clés, l’URL et la conversion.</p>
      </div>
      <ol className="divide-y divide-slate-100">
        {CAMPAIGN_GUIDE.map((step, index) => (
          <li key={step.id} className="px-4 py-4 lg:px-6">
            <p className="text-sm font-medium text-slate-900">
              <span className="mr-2 tabular-nums text-[#E85D04]">{index + 1}.</span>
              {step.title}
            </p>
            <p className="mt-1 text-sm text-slate-600">{step.text}</p>
          </li>
        ))}
      </ol>
      {urls.map((item) => (
        <CopyBlock key={item.funnelId} label={`URL ${item.name} · ${item.campaign}`} value={item.url} />
      ))}
    </section>
  );
}

function KeywordSection({ packs }: { packs: KeywordPack[] }) {
  const [sector, setSector] = useState(packs[0]?.sector ?? "general");
  const pack = packs.find((item) => item.sector === sector) ?? packs[0];
  if (!pack) return null;
  return (
    <section>
      <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Mots-clés par secteur</p>
        <p className="mt-0.5 text-sm text-slate-500">À coller dans Google Ads. Nommez la campagne comme indiqué pour le matching UTM.</p>
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
      <div className="border-b border-slate-100 px-4 py-3 text-sm lg:px-6">
        <p>
          Nom de campagne recommandé :{" "}
          <span className="font-mono text-slate-900">{pack.campaignName}</span>
        </p>
      </div>
      <CopyBlock label="Mots-clés + négatifs" value={keywordsAsPaste(pack)} />
      <div className="grid gap-3 px-4 py-4 lg:grid-cols-2 lg:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Titres d’annonces</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {pack.headlines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Descriptions</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {pack.descriptions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
