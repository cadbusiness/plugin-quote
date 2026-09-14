"use client";

import { useEffect, useState, useTransition } from "react";
import { Chip } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { HelpTip, LabelHelp } from "@/components/ui/help-tip";
import { GaugeBar } from "@/components/ui/gauge";
import { DataTable, ListAddRow, ListToolbar } from "@/components/ui/list-panel";
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
import {
  adsBudgetInsight,
  adsCampaignStatus,
  adsConversionCaption,
  adsDisconnectedCopy,
  adsInsightCopy,
  rankAdsCampaigns,
} from "@/lib/ads/roi";
import { formatEur, formatPercent, formatRelative } from "@/lib/format";
import type { AdsConnectionView } from "@/lib/ads/sync";
import { deltaDisplay, type CampaignStatsRow, type FunnelStatsRow, type StatsDashboard } from "@/lib/stats/dashboard";

type PendingCustomer = { id: string; name: string };

const GOOGLE_ADS_URL = "https://ads.google.com";

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

const DELTA = {
  good: "text-emerald-600",
  bad: "text-rose-600",
  muted: "text-slate-400",
} as const;

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
  const winRate = quotes ? (won / quotes) * 100 : null;
  const connected = connection?.status === "active";
  const rows = rankAdsCampaigns(adsCampaigns, connected);
  const copy = adsDisconnectedCopy(adsCampaigns.length);
  const insight = connected ? adsBudgetInsight(rows) : null;
  const costDelta =
    connected && costWon != null && stats.ads.prevCostPerWon != null
      ? deltaDisplay(costWon, stats.ads.prevCostPerWon, "percent", true)
      : null;

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
      {error && ERRORS[error] ? (
        <p className="border-b border-rose-100 bg-rose-50 px-4 py-2.5 text-sm text-rose-800 lg:px-6">{ERRORS[error]}</p>
      ) : null}

      {connected ? null : (
        <DisconnectedBanner
          title={copy.title}
          detail={copy.detail}
          admin={admin}
          configured={configured}
          connectHref={connectHref}
          onConnect={() => setConnectOpen(true)}
        />
      )}

      {connected ? (
        <ConnectedKpis
          costWon={costWon}
          costQuote={costQuote}
          winRate={winRate}
          won={won}
          quotes={quotes}
          spend={spend}
          avgDeal={stats.ads.avgDeal}
          delta={costDelta}
        />
      ) : (
        <DisconnectedKpis quotes={quotes} won={won} campaigns={adsCampaigns.length} />
      )}

      {connected && admin ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-2 text-xs text-slate-500 lg:px-6">
          {connection.customerName ? <Chip tone="emerald">{connection.customerName}</Chip> : null}
          {connection.lastSyncAt ? <span>Dépenses {formatRelative(connection.lastSyncAt)}</span> : null}
          {connection.quoteAction ? (
            <span className="inline-flex items-center gap-1">
              <Chip tone="violet">Devis renvoyé</Chip>
              <HelpTip label="Conversion devis">Chaque demande envoyée est signalée à Google Ads.</HelpTip>
            </span>
          ) : null}
          {connection.wonAction ? (
            <span className="inline-flex items-center gap-1">
              <Chip tone="emerald">Gagné renvoyé</Chip>
              <HelpTip label="Conversion gagné">Quand un devis passe Gagné, Google Ads le sait.</HelpTip>
            </span>
          ) : null}
          {admin ? <SyncButton /> : null}
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

      <CampaignsBlock
        rows={rows}
        funnels={stats.funnels}
        connected={connected}
        insight={insight}
        onOpen={openLaunch}
      />

      {rows.length === 0 ? <ListAddRow onClick={() => openLaunch(null)}>Préparer une campagne</ListAddRow> : null}

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
        initialLandingId={activeLanding?.id}
        campaign={activeRow}
        adsConnected={connected}
      />
    </>
  );
}

function DisconnectedBanner({
  title,
  detail,
  admin,
  configured,
  connectHref,
  onConnect,
}: {
  title: string;
  detail: string;
  admin: boolean;
  configured: boolean;
  connectHref: string;
  onConnect: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 bg-slate-900 px-4 py-5 text-white lg:px-6">
      <div className="min-w-0 max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
          Google Ads · non connecté
        </p>
        <p className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">{title}</p>
        <p className="mt-1.5 text-sm text-slate-300">{detail}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {admin && configured ? (
          <a
            href={connectHref}
            className="rounded-md bg-[#E85D04] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#D45203]"
          >
            Connecter Google Ads
          </a>
        ) : admin ? (
          <button
            type="button"
            onClick={onConnect}
            className="rounded-md bg-[#E85D04] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#D45203]"
          >
            Connecter Google Ads
          </button>
        ) : null}
        <p className="text-[11px] text-slate-400">≈ 2 min, lecture seule</p>
      </div>
    </div>
  );
}

function DisconnectedKpis({
  quotes,
  won,
  campaigns,
}: {
  quotes: number;
  won: number;
  campaigns: number;
}) {
  const campaignHint =
    campaigns === 0
      ? "sur 30 jours"
      : campaigns === 1
        ? "sur 30 jours · 1 campagne active"
        : `sur 30 jours · ${campaigns} campagnes actives`;
  const wonHint =
    won > 0
      ? `${won} client${won > 1 ? "s" : ""} signé${won > 1 ? "s" : ""}`
      : quotes > 0
        ? quotes === 1
          ? "le devis est en attente de réponse"
          : "les devis sont en attente de réponse"
        : "aucun devis pour l’instant";

  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 border-b border-slate-200 lg:grid-cols-4 lg:divide-y-0">
      <KpiCell label="Devis issus des pubs" value={String(quotes)} hint={campaignHint} size="hero" />
      <KpiCell label="Clients signés" value={String(won)} hint={wonHint} size="hero" />
      <KpiCell label="Coût par devis" pending hint="disponible dès la connexion" />
      <KpiCell label="Coût par client" pending hint="disponible dès la connexion" />
    </div>
  );
}

function ConnectedKpis({
  costWon,
  costQuote,
  winRate,
  won,
  quotes,
  spend,
  avgDeal,
  delta,
}: {
  costWon: number | null;
  costQuote: number | null;
  winRate: number | null;
  won: number;
  quotes: number;
  spend: number;
  avgDeal: number;
  delta: ReturnType<typeof deltaDisplay> | null;
}) {
  const basket = avgDeal > 0 ? ` · votre panier moyen est de ${formatEur(avgDeal)}` : "";
  return (
    <div className="grid grid-cols-1 divide-y divide-slate-200 border-b border-slate-200 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
      <div className="px-4 py-5 lg:col-span-2 lg:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          <LabelHelp help="Budget Ads divisé par les dossiers Gagné. Plus le chiffre baisse, mieux c’est.">
            Coût par client signé
          </LabelHelp>
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className={`font-semibold tabular-nums tracking-tight ${costWon == null ? "text-slate-300" : "text-slate-900"} ${costWon == null ? "text-3xl" : "text-5xl"}`}>
            {costWon != null ? formatEur(costWon) : "—"}
          </p>
          {delta && costWon != null ? (
            <p className={`text-sm font-medium tabular-nums ${DELTA[delta.deltaTone]}`}>{delta.deltaLabel}</p>
          ) : null}
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          {costWon == null
            ? spend
              ? "dès un client signé"
              : "dès une dépense et un client signé"
            : `30 derniers jours${basket}`}
        </p>
      </div>
      <KpiCell
        label="Coût par devis"
        help="Budget Ads divisé par les devis issus des pubs."
        value={costQuote != null ? formatEur(costQuote) : null}
        pending={costQuote == null}
        hint={costQuote != null ? `${formatEur(spend)} dépensés · ${quotes} devis` : "dès un devis issu des pubs"}
        size="lg"
      />
      <KpiCell
        label="Devis → signature"
        help="Part des devis issus des pubs qui passent Gagné."
        value={winRate != null ? formatPercent(winRate) : null}
        pending={winRate == null}
        hint={quotes ? `${won} signé${won > 1 ? "s" : ""} sur ${quotes} devis` : "dès un devis"}
        size="lg"
      />
    </div>
  );
}

function KpiCell({
  label,
  help,
  value,
  hint,
  muted,
  pending,
  size,
}: {
  label: string;
  help?: string;
  value?: string | null;
  hint: string;
  muted?: boolean;
  pending?: boolean;
  size?: "lg" | "hero";
}) {
  return (
    <div className="px-4 py-4 lg:px-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
        {help ? <LabelHelp help={help}>{label}</LabelHelp> : label}
      </p>
      {pending ? (
        <div className="mt-1 h-9" aria-hidden />
      ) : (
        <p
          className={`mt-1 font-semibold tabular-nums tracking-tight ${
            size === "hero" ? "text-4xl" : size === "lg" ? "text-3xl" : "text-xl"
          } ${muted ? "text-slate-300" : "text-slate-900"}`}
        >
          {value}
        </p>
      )}
      <p className={`mt-1 text-xs ${pending ? "text-slate-400" : "text-slate-500"}`}>{hint}</p>
    </div>
  );
}

function CampaignsBlock({
  rows,
  funnels,
  connected,
  insight,
  onOpen,
}: {
  rows: CampaignStatsRow[];
  funnels: FunnelStatsRow[];
  connected: boolean;
  insight: ReturnType<typeof adsBudgetInsight>;
  onOpen: (row?: CampaignStatsRow | null) => void;
}) {
  const countLabel =
    rows.length === 0
      ? connected
        ? "Les campagnes apparaissent dès le premier clic pub."
        : "Les devis pub sont déjà rattachés. Le coût s’affiche une fois Google Ads branché."
      : connected
        ? "Classées par coût par client — le plus rentable en haut."
        : `${rows.length} campagne${rows.length > 1 ? "s" : ""} · cliquez pour l’URL et les mots-clés`;

  return (
    <section>
      <ListToolbar>
        <div className="mr-auto min-w-0">
          {connected ? (
            <>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Campagnes</p>
              <p className="mt-0.5 text-sm text-slate-500">{countLabel}</p>
            </>
          ) : (
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Campagnes</span>
              <span className="text-slate-400"> · {countLabel}</span>
            </p>
          )}
        </div>
        {connected ? <span className="text-xs text-slate-400">30 jours</span> : null}
        <button
          type="button"
          onClick={() => onOpen(null)}
          className={
            connected
              ? "rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D45203]"
              : "rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          }
        >
          Préparer une campagne
        </button>
      </ListToolbar>
      {rows.length === 0 ? (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
          Aucune pub pour l’instant. Préparez une campagne : l’URL à coller est dans le dialog.
        </p>
      ) : connected ? (
        <ConnectedCampaignList rows={rows} funnels={funnels} insight={insight} onOpen={onOpen} />
      ) : (
        <DisconnectedCampaignTable rows={rows} funnels={funnels} onOpen={onOpen} />
      )}
    </section>
  );
}

function funnelOf(row: CampaignStatsRow, funnels: FunnelStatsRow[]) {
  return row.funnelName ?? funnels.find((funnel) => funnel.id === row.funnelId)?.name ?? "—";
}

function DisconnectedCampaignTable({
  rows,
  funnels,
  onOpen,
}: {
  rows: CampaignStatsRow[];
  funnels: FunnelStatsRow[];
  onOpen: (row: CampaignStatsRow) => void;
}) {
  return (
    <DataTable headers={["Campagne", "Funnel", "Devis", "Signés", "Conversion"]}>
      {rows.map((row) => {
        const status = adsCampaignStatus(row.quotes, row.visitors);
        const visitors = Math.max(row.visitors, row.quotes);
        const pct = visitors ? row.quotes / visitors : 0;
        return (
          <ClickableRow key={`${row.campaign}-${row.source}`} onSelect={() => onOpen(row)}>
            <td className="px-4 py-3.5 lg:px-6">
              <div className="font-semibold text-slate-900">{row.campaign}</div>
              <span
                className={`mt-1 inline-flex items-center gap-1.5 text-xs ${
                  status.tone === "emerald" ? "text-emerald-700" : "text-slate-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${status.tone === "emerald" ? "bg-emerald-500" : "bg-slate-300"}`}
                  aria-hidden
                />
                {status.label}
              </span>
            </td>
            <td className="px-4 py-3.5 text-slate-600 lg:px-6">{funnelOf(row, funnels)}</td>
            <td className={`px-4 py-3.5 tabular-nums lg:px-6 ${row.quotes === 0 ? "text-slate-300" : "text-slate-900"}`}>
              {row.quotes}
            </td>
            <td className={`px-4 py-3.5 tabular-nums lg:px-6 ${row.won === 0 ? "text-slate-300" : "text-slate-900"}`}>
              {row.won}
            </td>
            <td className="px-4 py-3.5 lg:px-6">
              <div className="min-w-[8rem]">
                <GaugeBar pct={pct} tone="orange" />
                <p className={`mt-1 text-xs ${row.quotes && visitors ? "text-slate-500" : "text-slate-400"}`}>
                  {adsConversionCaption(row.quotes, visitors)}
                </p>
              </div>
            </td>
          </ClickableRow>
        );
      })}
    </DataTable>
  );
}

function ConnectedCampaignList({
  rows,
  funnels,
  insight,
  onOpen,
}: {
  rows: CampaignStatsRow[];
  funnels: FunnelStatsRow[];
  insight: ReturnType<typeof adsBudgetInsight>;
  onOpen: (row: CampaignStatsRow) => void;
}) {
  const maxSpend = Math.max(1, ...rows.map((row) => row.spend));
  return (
    <>
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <tbody>
            {rows.map((row) => {
              const costly = insight?.high === row.campaign;
              return (
                <ClickableRow key={`${row.campaign}-${row.source}`} onSelect={() => onOpen(row)}>
                  <td className="px-4 py-4 lg:px-6">
                    <div className="font-medium text-slate-900">{row.campaign}</div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Google Ads · {funnelOf(row, funnels)}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 lg:px-6">
                    <span className="tabular-nums">{formatEur(row.spend)} dépensés</span>
                    <span className="text-slate-300"> · </span>
                    <span className="tabular-nums">
                      {row.quotes} devis
                    </span>
                    <span className="text-slate-300"> · </span>
                    <span className={`tabular-nums ${row.won ? "font-medium text-[#E85D04]" : "text-slate-400"}`}>
                      {row.won} signé{row.won > 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="w-[28%] px-4 py-4 lg:px-6">
                    <GaugeBar pct={row.spend / maxSpend} tone={costly ? "rose" : "orange"} />
                  </td>
                  <td className="px-4 py-4 text-right lg:px-6">
                    {row.costPerWon != null ? (
                      <p
                        className={`text-2xl font-semibold tabular-nums tracking-tight ${
                          costly ? "text-rose-600" : "text-[#E85D04]"
                        }`}
                      >
                        {formatEur(row.costPerWon)}
                        <span className="ml-1 text-sm font-medium text-slate-400">par client</span>
                      </p>
                    ) : (
                      <p className="text-sm italic text-slate-300">dès un signé</p>
                    )}
                  </td>
                </ClickableRow>
              );
            })}
          </tbody>
        </table>
      </div>
      {insight ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 lg:px-6">
          <p className="text-sm text-slate-600">{adsInsightCopy(insight)}</p>
          <a
            href={GOOGLE_ADS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-[#C2410C] ring-1 ring-[#E85D04]/30 hover:bg-orange-50"
          >
            Réallouer le budget
          </a>
        </div>
      ) : null}
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
                className="inline-flex items-center rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D45203]"
              >
                {label}
              </a>
            </div>
          </div>
        )}
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
      className="text-slate-500 hover:text-slate-900 disabled:opacity-50"
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
