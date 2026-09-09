"use client";

import { useEffect, useState, useTransition } from "react";
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
import { ListAddRow, ListToolbar } from "@/components/ui/list-panel";
import {
  disconnectAds,
  pickAdsCustomer,
  refreshAdsStats,
  reloadAdsCustomers,
} from "@/app/(app)/acquisition/actions";
import {
  campaignLanding,
  LaunchCampaignDialog,
  type LandingUrl,
} from "@/components/ads/launch-campaign-dialog";
import type { KeywordPack } from "@/lib/ads/keywords";
import { formatEur, formatEurExact, formatPercent, formatRelative } from "@/lib/format";
import type { AdsConnectionView } from "@/lib/ads/sync";
import type { CampaignStatsRow, FunnelStatsRow, StatsDashboard } from "@/lib/stats/dashboard";

type PendingCustomer = { id: string; name: string };

const ERRORS: Record<string, string> = {
  env: "La connexion Google Ads n’est pas encore ouverte sur votre espace.",
  denied: "Connexion Google annulée. Vous pouvez réessayer.",
  oauth: "Google n’a pas pu terminer la connexion. Réessayez.",
  state: "La session a expiré. Relancez la connexion.",
  refresh: "Google n’a pas donné l’autorisation complète. Reconnectez et acceptez les accès.",
  pick: "Ce compte Google Ads n’a pas pu être activé.",
  noconnect: "Connectez d’abord Google Ads.",
  customers: "Impossible de lister vos comptes Google Ads.",
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
  const connected = connection?.status === "active";
  const rows = adsCampaigns.length ? adsCampaigns : stats.campaigns;

  const [connectOpen, setConnectOpen] = useState(pick && pendingCustomers.length > 0);
  const [launchOpen, setLaunchOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<CampaignStatsRow | null>(null);

  useEffect(() => {
    function fromHash() {
      if (window.location.hash === "#nouveau") {
        setActiveRow(null);
        setLaunchOpen(true);
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  function openLaunch(row?: CampaignStatsRow | null) {
    setActiveRow(row ?? null);
    setLaunchOpen(true);
  }

  const activeLanding = activeRow ? campaignLanding(activeRow, landingUrls) : null;

  return (
    <>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">Coût d’un devis Google Ads, puis d’un client signé.</p>
        {connected ? (
          <Chip tone="emerald">{connection.customerName || "Google Ads"}</Chip>
        ) : (
          <Chip tone="slate">Non branché</Chip>
        )}
        {admin && !connected ? (
          <button
            type="button"
            onClick={() => setConnectOpen(true)}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Activer
          </button>
        ) : null}
        {admin && connected ? <SyncButton /> : null}
        <button
          type="button"
          onClick={() => openLaunch(null)}
          className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D45203]"
        >
          Préparer une campagne
        </button>
      </ListToolbar>

      {error && ERRORS[error] ? (
        <p className="border-b border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-800 lg:px-6">{ERRORS[error]}</p>
      ) : null}

      {connected && admin ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-2 text-xs text-slate-500 lg:px-6">
          {connection.lastSyncAt ? <span>Dépenses {formatRelative(connection.lastSyncAt)}</span> : null}
          {connection.quoteAction ? (
            <span className="inline-flex items-center gap-1">
              <Chip tone="violet">Devis renvoyé</Chip>
              <HelpTip label="Conversion devis">
                Chaque demande envoyée est signalée à Google Ads.
              </HelpTip>
            </span>
          ) : null}
          {connection.wonAction ? (
            <span className="inline-flex items-center gap-1">
              <Chip tone="emerald">Gagné renvoyé</Chip>
              <HelpTip label="Conversion gagné">Quand un devis passe Gagné, Google Ads le sait.</HelpTip>
            </span>
          ) : null}
          {configured ? (
            <>
              <a href="/api/ads/google/start" className="text-slate-500 hover:text-slate-900">
                Reconnecter
              </a>
              <DisconnectButton />
            </>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 border-b border-slate-200 lg:grid-cols-4 lg:divide-y-0">
        <Kpi
          icon={Banknote}
          label="Dépensé"
          help="Ce que Google Ads vous a facturé sur 30 jours."
          value={spend ? formatEur(spend) : null}
          empty={connected ? "Aucune dépense" : "Après connexion"}
          hint="30 jours"
          muted={!spend}
        />
        <Kpi
          icon={FileText}
          label="Devis des pubs"
          help="Demandes dont le visiteur est arrivé par une pub Google."
          value={String(quotes)}
          hint={quotes ? "issus d’une pub" : "en attente"}
          muted={quotes === 0}
        />
        <Kpi
          icon={CircleDollarSign}
          label="Un devis"
          help="Budget ads divisé par les devis reçus."
          value={costQuote != null ? formatEurExact(costQuote) : null}
          empty="Dès un devis"
          hint="par demande"
          muted={costQuote == null}
        />
        <Kpi
          icon={UserCheck}
          label="Un client"
          help="Budget ads divisé par les dossiers Gagné."
          value={costWon != null ? formatEurExact(costWon) : null}
          empty="Dès un gagné"
          hint="par signature"
          muted={costWon == null}
        />
      </div>

      <CampaignTable
        rows={rows}
        funnels={stats.funnels}
        connected={connected}
        onOpen={openLaunch}
      />

      <ListAddRow onClick={() => openLaunch(null)}>Préparer une campagne</ListAddRow>

      {connectOpen ? (
        <ConnectAdsDialog
          configured={configured}
          connectHref={connectHref}
          connection={connection}
          pendingCustomers={pendingCustomers}
          onClose={() => setConnectOpen(false)}
        />
      ) : null}

      <LaunchCampaignDialog
        open={launchOpen}
        onClose={() => {
          setLaunchOpen(false);
          setActiveRow(null);
        }}
        packs={packs}
        landingUrls={landingUrls}
        initialFunnelId={activeLanding?.funnelId ?? activeRow?.funnelId}
        campaign={activeRow}
      />
    </>
  );
}

function ConnectAdsDialog({
  configured,
  connectHref,
  connection,
  pendingCustomers,
  onClose,
}: {
  configured: boolean;
  connectHref: string;
  connection: AdsConnectionView | null;
  pendingCustomers: PendingCustomer[];
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const pending = connection?.status === "pending" && pendingCustomers.length > 0;
  const errored = connection?.status === "error";
  const label = configured
    ? connection
      ? "Reconnecter Google Ads"
      : "Connecter Google Ads"
    : "Demander l’activation";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ads-connect-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">Google Ads</p>
          <h2 id="ads-connect-title" className="mt-1 text-lg font-semibold text-slate-900">
            {pending ? "Quel compte utiliser ?" : "Voir le coût réel d’un devis"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {pending
              ? "Un seul compte par organisation. C’est lui qui paie les pubs et qui reçoit les conversions devis et gagné."
              : errored
                ? "La connexion a échoué. Reconnectez le compte : les devis restent suivis ici."
                : "Branchez le compte pour afficher la dépense, le prix d’un devis et d’un client. Gratuit, environ 2 minutes."}
          </p>
        </div>
        {errored && connection?.lastError ? (
          <p className="border-b border-rose-100 bg-rose-50 px-5 py-2 text-xs text-rose-700">{connection.lastError}</p>
        ) : null}
        {pending ? (
          <>
            <CustomerPicker customers={pendingCustomers} />
            <div className="border-t border-slate-100 px-5 py-3">
              <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-900">
                Plus tard
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-2 px-5 py-3">
            <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-900">
              Plus tard
            </button>
            <div className="flex items-center gap-2">
              {errored ? <ReloadCustomersButton /> : null}
              <a
                href={connectHref}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D45203]"
              >
                <Plug className="h-4 w-4" aria-hidden />
                {label}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
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
}: {
  icon: LucideIcon;
  label: string;
  help: string;
  value: string | null;
  empty?: string;
  hint: string;
  muted?: boolean;
}) {
  const emptyValue = value == null;
  const zero = value === "0";

  return (
    <div className="px-4 py-3.5 lg:px-6">
      <p className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
        <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden />
        <LabelHelp help={help}>{label}</LabelHelp>
      </p>
      {emptyValue ? (
        <p className="mt-1 text-base italic text-slate-400">{empty}</p>
      ) : (
        <p className={`mt-1 text-xl font-semibold tabular-nums ${muted || zero ? "text-slate-300" : "text-slate-900"}`}>
          {value}
        </p>
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
      className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
    >
      {pending ? "Mise à jour…" : "Actualiser"}
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
      className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
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
      className="text-slate-400 hover:text-slate-700 disabled:opacity-50"
    >
      Déconnecter
    </button>
  );
}

function CustomerPicker({ customers }: { customers: PendingCustomer[] }) {
  const [pending, start] = useTransition();
  return (
    <div className="divide-y divide-slate-100">
      {customers.map((customer) => (
        <button
          key={customer.id}
          type="button"
          disabled={pending}
          onClick={() => start(() => void pickAdsCustomer(customer.id, customer.name))}
          className="flex w-full items-center justify-between px-5 py-3 text-left text-sm hover:bg-orange-50 disabled:opacity-50"
        >
          <span className="font-medium text-slate-900">{customer.name}</span>
          <span className="font-mono text-xs text-slate-500">{customer.id}</span>
        </button>
      ))}
    </div>
  );
}

function GoogleAdsBadge() {
  return (
    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-2 py-0.5 text-[11px] font-medium text-[#1967D2]">
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
  onOpen,
}: {
  rows: CampaignStatsRow[];
  funnels: FunnelStatsRow[];
  connected: boolean;
  onOpen: (row: CampaignStatsRow) => void;
}) {
  return (
    <section>
      <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          <LabelHelp help="Une ligne = une pub. Cliquez pour copier l’URL et les mots-clés, sans quitter Ads.">
            Campagnes
          </LabelHelp>
        </p>
        <p className="mt-0.5 text-sm text-slate-500">
          {rows.length
            ? "Cliquez une pub pour l’URL et les mots-clés."
            : connected
              ? "Les campagnes apparaissent dès le premier clic pub."
              : "Les devis sont déjà rattachés. Le coût s’affiche une fois Google Ads branché."}
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
          Aucune pub pour l’instant. Préparez une campagne : l’URL à coller est dans le dialog.
        </p>
      ) : (
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
              <tr>
                {["Campagne", "Funnel", "Devis", "Gagnés", "Conversion", "Un devis", "Un client"].map((header) => (
                  <th key={header} className="px-4 py-2.5 font-medium lg:px-6">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.campaign}-${row.source}`}
                  tabIndex={0}
                  className="cursor-pointer border-b border-slate-200 last:border-b-0 hover:bg-orange-50/70"
                  onClick={() => onOpen(row)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onOpen(row);
                    }
                  }}
                >
                  <td className="px-4 py-3 lg:px-6">
                    <div className="font-medium text-slate-900">{row.campaign}</div>
                    {row.source === "Google Ads" ? <GoogleAdsBadge /> : <Chip tone="slate">{row.source}</Chip>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 lg:px-6">
                    {row.funnelName ?? funnels.find((f) => f.id === row.funnelId)?.name ?? "—"}
                  </td>
                  <td className={`px-4 py-3 tabular-nums lg:px-6 ${mutedNum(row.quotes)}`}>{row.quotes}</td>
                  <td className="px-4 py-3 lg:px-6">
                    <Chip tone={row.won ? "emerald" : "slate"}>{row.won}</Chip>
                  </td>
                  <td className="px-4 py-3 lg:px-6">
                    <div className="min-w-[5.5rem]">
                      <GaugeBar pct={(row.conversion ?? 0) / 100} tone="orange" />
                      <p className={`mt-1 text-xs tabular-nums ${row.conversion ? "text-slate-500" : "text-slate-300"}`}>
                        {formatPercent(row.conversion)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums lg:px-6">
                    {row.costPerQuote != null ? formatEurExact(row.costPerQuote) : <span className="text-slate-300">— €</span>}
                  </td>
                  <td className="px-4 py-3 tabular-nums lg:px-6">
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
