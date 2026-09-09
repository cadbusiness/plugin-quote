"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Banknote,
  CircleDollarSign,
  FileText,
  Plug,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { HelpTip, LabelHelp } from "@/components/ui/help-tip";
import { GaugeBar } from "@/components/ui/gauge";
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
  connectHref,
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
  connectHref: string;
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
        <p className="border-b border-rose-100 bg-rose-50 px-4 py-3.5 text-sm text-rose-800 lg:px-8">{ERRORS[error]}</p>
      ) : null}

      {pick && pendingCustomers.length > 0 ? <CustomerPicker customers={pendingCustomers} /> : null}

      {connected ? (
        <ConnectedStrip connection={connection} admin={admin} configured={configured} />
      ) : (
        <ConnectBanner
          admin={admin}
          configured={configured}
          connectHref={connectHref}
          hasTraffic={hasTraffic}
          connection={connection}
        />
      )}

      <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 border-b border-slate-200 lg:grid-cols-4 lg:divide-y-0">
        <Kpi
          icon={Banknote}
          label="Dépensé"
          help="Ce que Google Ads vous a facturé sur les 30 derniers jours. Apparaît une fois le compte branché et les pubs lancées."
          value={spend ? formatEur(spend) : null}
          empty={connected ? "Aucune dépense" : "Dès la connexion"}
          hint="30 derniers jours"
          muted={!spend}
          connected={connected}
        />
        <Kpi
          icon={FileText}
          label="Devis des pubs"
          help="Demandes de devis dont le visiteur est arrivé par une pub Google. Même sans compte branché, on les reconnaît déjà au lien."
          value={String(quotes)}
          hint={quotes ? "issus d’une pub Google" : "en attente de clics"}
          muted={quotes === 0}
          connected={connected}
        />
        <Kpi
          icon={CircleDollarSign}
          label="Un devis coûte"
          help="Budget ads divisé par le nombre de devis reçus. C’est le prix d’un dossier à rappeler."
          value={costQuote != null ? formatEurExact(costQuote) : null}
          empty={quotes ? "Coût encore inconnu" : "Dès le 1er devis"}
          hint="pour chaque demande reçue"
          muted={costQuote == null}
          connected={connected}
          connectHref={admin && !connected ? connectHref : undefined}
        />
        <Kpi
          icon={UserCheck}
          label="Un client coûte"
          help="Budget ads divisé par les dossiers passés Gagné. C’est le vrai coût d’acquisition, une fois le devis signé."
          value={costWon != null ? formatEurExact(costWon) : null}
          empty={won ? "Coût encore inconnu" : "Quand un devis est signé"}
          hint="pour chaque dossier signé"
          muted={costWon == null}
          connected={connected}
          connectHref={admin && !connected ? connectHref : undefined}
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

function ConnectBanner({
  admin,
  configured,
  connectHref,
  hasTraffic,
  connection,
}: {
  admin: boolean;
  configured: boolean;
  connectHref: string;
  hasTraffic: boolean;
  connection: AdsConnectionView | null;
}) {
  const pending = connection?.status === "pending";
  const errored = connection?.status === "error";
  return (
    <div
      className={`flex flex-wrap items-center gap-4 border-b px-4 py-5 lg:px-8 ${
        errored
          ? "border-rose-100 bg-rose-50"
          : pending
            ? "border-amber-100 bg-amber-50"
            : "border-orange-100 bg-orange-50"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white ${
            errored ? "text-rose-600" : pending ? "text-amber-700" : "text-[#E85D04]"
          }`}
        >
          <Plug className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-900">
            {errored
              ? "La connexion Google Ads a échoué"
              : pending
                ? "Choisissez le compte Google Ads"
                : "Connectez Google Ads pour voir le coût réel de chaque devis et client."}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {errored
              ? "Reconnectez le compte. Les devis restent suivis de votre côté."
              : pending
                ? "Google est autorisé. Indiquez lequel paie vos campagnes."
                : hasTraffic
                  ? "Des visiteurs arrivent déjà depuis une pub. Branchez le compte pour voir ce qu’ils coûtent."
                  : "Les clics sont déjà suivis. Une fois branché, les dépenses, le prix d’un devis et d’un client s’affichent ici."}
          </p>
          {errored && connection?.lastError ? (
            <p className="mt-1.5 text-xs text-rose-700">{connection.lastError}</p>
          ) : null}
        </div>
      </div>
      {admin ? (
        <div className="flex flex-wrap items-center gap-2">
          {pending ? <ReloadCustomersButton /> : null}
          {errored ? <ReloadCustomersButton /> : null}
          <ConnectCta href={connectHref} reconnect={Boolean(connection)} request={!configured} />
          {connection ? <DisconnectButton /> : null}
        </div>
      ) : null}
    </div>
  );
}

function ConnectedStrip({
  connection,
  admin,
  configured,
}: {
  connection: AdsConnectionView;
  admin: boolean;
  configured: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-emerald-100 bg-emerald-50/80 px-4 py-4 lg:px-8">
      <Chip tone="emerald">{connection.customerName || "Google Ads"}</Chip>
      <p className="min-w-0 flex-1 text-sm text-slate-600">
        Les devis et les dossiers gagnés sont renvoyés à Google. Les dépenses s’affichent ici.
      </p>
      {connection.quoteAction ? (
        <span className="inline-flex items-center gap-1">
          <Chip tone="violet">Devis renvoyé</Chip>
          <HelpTip label="Conversion devis">
            À chaque demande envoyée, QuoteBuilder prévient Google Ads. Google apprend quelles pubs amènent un devis.
          </HelpTip>
        </span>
      ) : null}
      {connection.wonAction ? (
        <span className="inline-flex items-center gap-1">
          <Chip tone="emerald">Gagné renvoyé</Chip>
          <HelpTip label="Conversion gagné">
            Quand vous passez un devis en Gagné, Google Ads le sait. C’est ce qui permet d’optimiser vers les vrais clients.
          </HelpTip>
        </span>
      ) : null}
      {connection.lastSyncAt ? (
        <p className="text-xs text-slate-500">Dépenses à jour {formatRelative(connection.lastSyncAt)}</p>
      ) : null}
      {admin && configured ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <SyncButton />
          <a
            href="/api/ads/google/start"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-white"
          >
            Reconnecter
          </a>
          <DisconnectButton />
        </div>
      ) : null}
    </div>
  );
}

function ConnectCta({
  href,
  reconnect,
  request,
}: {
  href: string;
  reconnect?: boolean;
  request?: boolean;
}) {
  const label = request ? "Demander l’activation" : reconnect ? "Reconnecter Google Ads" : "Connecter Google Ads";
  return (
    <a
      href={href}
      className="inline-flex shrink-0 flex-col items-start rounded-lg bg-[#E85D04] px-5 py-3 text-white hover:bg-[#D45203]"
    >
      <span className="inline-flex items-center gap-2 text-[15px] font-semibold">
        <Plug className="h-4 w-4" aria-hidden />
        {label}
      </span>
      <span className="mt-0.5 pl-6 text-xs font-normal text-orange-100">Gratuit · Activation en 2 minutes</span>
    </a>
  );
}

function Kpi({
  icon: Icon,
  label,
  help,
  value,
  empty,
  hint,
  muted,
  connected,
  connectHref,
}: {
  icon: LucideIcon;
  label: string;
  help: string;
  value: string | null;
  empty?: string;
  hint: string;
  muted?: boolean;
  connected: boolean;
  connectHref?: string;
}) {
  const emptyValue = value == null;
  const zero = value === "0" || value === "0 %";

  return (
    <div className={`flex gap-3.5 px-4 py-6 lg:px-7 ${connected ? "bg-white" : "bg-slate-50"}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200/80">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          <LabelHelp help={help}>{label}</LabelHelp>
        </p>
        {emptyValue ? (
          <p className="mt-1.5 text-lg italic text-slate-400">{empty ?? "Pas encore"}</p>
        ) : (
          <p
            className={`mt-1.5 text-2xl font-semibold tabular-nums ${
              muted || zero ? "text-slate-300" : "text-slate-900"
            }`}
          >
            {value}
          </p>
        )}
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p>
        {connectHref && emptyValue ? (
          <a href={connectHref} className="mt-2 inline-block text-sm font-medium text-[#E85D04] hover:underline">
            Branchez Google Ads
          </a>
        ) : null}
      </div>
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
      className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
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
    <div className="border-b border-amber-100 bg-amber-50 px-4 py-5 lg:px-8">
      <p className="text-base font-semibold text-slate-900">Quel compte Google Ads utilisez-vous ?</p>
      <p className="mt-1 text-sm text-slate-600">
        Un seul compte par organisation. C’est celui qui paie les pubs et qui recevra les devis et les dossiers gagnés.
      </p>
      <div className="mt-4 divide-y divide-amber-100 overflow-hidden rounded-lg bg-white ring-1 ring-amber-100">
        {customers.map((customer) => (
          <button
            key={customer.id}
            type="button"
            disabled={pending}
            onClick={() => start(() => void pickAdsCustomer(customer.id, customer.name))}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-orange-50 disabled:opacity-50"
          >
            <span className="font-medium text-slate-900">{customer.name}</span>
            <span className="font-mono text-xs text-slate-500">{customer.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GoogleAdsBadge() {
  return (
    <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-2 py-0.5 text-[11px] font-medium text-[#1967D2]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" aria-hidden />
      Google Ads
    </span>
  );
}

function mutedNum(value: number) {
  return value === 0 ? "text-slate-300" : "text-slate-900";
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
      <div className="px-4 py-5 lg:px-8">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          <LabelHelp help="Une ligne = une campagne Google (ou un nom de campagne collé dans le lien). Cliquez le funnel pour voir le détail.">
            Campagnes
          </LabelHelp>
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {adsOnly
            ? "Devis, signatures et coût pour chaque pub."
            : connected
              ? "Les campagnes apparaissent dès qu’un visiteur arrive depuis une pub."
              : "Les devis sont déjà rattachés à la campagne. Le coût s’affiche une fois Google Ads branché."}
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-12 text-sm text-slate-500 lg:px-8">
          Aucune pub n’a encore envoyé de visiteur. Copiez l’URL ci-dessous dans Google Ads : la campagne s’affichera ici
          dès le premier clic.
        </p>
      ) : (
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50/80 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
              <tr>
                {["Campagne", "Funnel", "Devis", "Gagnés", "Conversion", "Un devis", "Un client"].map((header) => (
                  <th key={header} className="px-4 py-3 font-medium lg:px-8">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.campaign}-${row.source}`}
                  className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-4 lg:px-8">
                    <div className="font-medium text-slate-900">{row.campaign}</div>
                    {row.source === "Google Ads" ? <GoogleAdsBadge /> : <Chip tone="slate">{row.source}</Chip>}
                  </td>
                  <td className="px-4 py-4 lg:px-8">
                    {row.funnelId ? (
                      <Link href={`/funnels/${row.funnelId}?tab=stats`} className="text-sm hover:text-[#C2410C]">
                        {row.funnelName ?? funnels.find((f) => f.id === row.funnelId)?.name ?? "Funnel"}
                      </Link>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className={`px-4 py-4 tabular-nums lg:px-8 ${mutedNum(row.quotes)}`}>{row.quotes}</td>
                  <td className="px-4 py-4 lg:px-8">
                    <Chip tone={row.won ? "emerald" : "slate"}>{row.won}</Chip>
                  </td>
                  <td className="px-4 py-4 lg:px-8">
                    <div className="min-w-[6rem]">
                      <GaugeBar pct={(row.conversion ?? 0) / 100} tone="orange" />
                      <p className={`mt-1.5 text-xs tabular-nums ${row.conversion ? "text-slate-500" : "text-slate-300"}`}>
                        {formatPercent(row.conversion)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 tabular-nums lg:px-8">
                    {row.costPerQuote != null ? (
                      formatEurExact(row.costPerQuote)
                    ) : (
                      <span className="text-slate-300">— €</span>
                    )}
                  </td>
                  <td className="px-4 py-4 tabular-nums lg:px-8">
                    {row.costPerWon != null ? formatEurExact(row.costPerWon) : <span className="text-slate-300">— €</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  const [keywordsOpen, setKeywordsOpen] = useState(false);
  const pack = packs.find((item) => item.sector === sector) ?? packs[0];

  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="px-4 py-8 lg:px-8">
        <p className="text-lg font-semibold text-slate-900">Lancer votre première campagne Google Ads</p>
        <p className="mt-1.5 text-sm text-slate-500">
          QuoteBuilder prépare le lien et les mots-clés. La campagne se crée dans Google Ads.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Objectif :{" "}
          <span className="font-medium text-slate-900">Search · Leads · 10–30 € / jour</span>
        </p>

        {landingUrls.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            Créez d’abord un funnel : c’est la page sur laquelle la pub doit atterrir.
          </p>
        ) : (
          <ol className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
            <li className="flex gap-4 px-4 py-5 lg:px-5">
              <StepIndex n={1} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">Funnel de destination</p>
                <p className="mt-0.5 text-sm text-slate-500">Le visiteur de la pub arrive ici, pas sur votre site.</p>
                {landingUrls.length > 1 ? (
                  <select
                    value={current?.funnelId ?? ""}
                    onChange={(event) => {
                      const next = event.target.value;
                      setFunnelId(next);
                      const landing = landingUrls.find((item) => item.funnelId === next);
                      if (landing) setSector(packSector(packs, landing.sector));
                    }}
                    className="mt-3 w-full max-w-md rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  >
                    {landingUrls.map((item) => (
                      <option key={item.funnelId} value={item.funnelId}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-3 text-sm font-medium text-slate-900">{current?.name}</p>
                )}
              </div>
            </li>
            <li className="flex gap-4 px-4 py-5 lg:px-5">
              <StepIndex n={2} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">URL à coller dans Google Ads</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Page de destination de l’annonce. Le suivi est déjà dans le lien, ne le modifiez pas.
                </p>
                {current ? <UrlCopy value={current.url} /> : null}
                {pack ? (
                  <p className="mt-3 text-sm text-slate-600">
                    Nommez la campagne{" "}
                    <span className="rounded bg-orange-50 px-1.5 py-0.5 font-mono text-[13px] font-medium text-[#C2410C]">
                      {pack.campaignName}
                    </span>
                  </p>
                ) : null}
              </div>
            </li>
            <li className="flex gap-4 px-4 py-5 lg:px-5">
              <StepIndex n={3} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">Mots-clés suggérés pour ce secteur</p>
                <p className="mt-0.5 text-sm text-slate-500">À coller dans le groupe d’annonces Google Ads.</p>
                <button
                  type="button"
                  onClick={() => setKeywordsOpen((open) => !open)}
                  className="mt-3 text-sm font-medium text-[#E85D04] hover:underline"
                >
                  {keywordsOpen ? "Masquer les mots-clés" : "Voir les mots-clés recommandés"}
                </button>
                {keywordsOpen && pack ? (
                  <div className="mt-4">
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {packs.map((item) => (
                        <button
                          key={item.sector}
                          type="button"
                          onClick={() => setSector(item.sector)}
                          className={`rounded-full px-2.5 py-1 text-sm ${
                            item.sector === sector
                              ? "bg-orange-50 font-medium text-[#C2410C]"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <CopyBlock
                      compact
                      label="Liste à coller"
                      hint="Une ligne = un mot-clé. « … » expression, [ … ] exact, − … à exclure."
                      value={keywordsAsPaste(pack)}
                    />
                    <div className="mt-4 grid gap-5 lg:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                          Titres d’annonce
                        </p>
                        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                          {pack.headlines.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                          Descriptions
                        </p>
                        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                          {pack.descriptions.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </li>
          </ol>
        )}
      </div>
    </section>
  );
}

function StepIndex({ n }: { n: number }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E85D04] text-sm font-semibold text-white">
      {n}
    </span>
  );
}

function UrlCopy({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mt-3 flex items-stretch gap-2">
      <p className="min-w-0 flex-1 truncate rounded-md bg-slate-50 px-3 py-2.5 font-mono text-[13px] text-slate-700 ring-1 ring-slate-200">
        {value}
      </p>
      <button
        type="button"
        onClick={() => void copy()}
        className="shrink-0 rounded-md bg-[#E85D04] px-3.5 text-sm font-medium text-white hover:bg-[#D45203]"
      >
        {copied ? "Copié" : "Copier"}
      </button>
    </div>
  );
}

function packSector(packs: KeywordPack[], sector: string) {
  return packs.some((item) => item.sector === sector) ? sector : packs[0]?.sector ?? "general";
}
