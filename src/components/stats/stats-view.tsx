import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ClickableRow } from "@/components/ui/clickable-row";
import { DataTable } from "@/components/ui/list-panel";
import { Chip } from "@/components/ui/chip";
import { GaugeBar, RingGauge, type GaugeTone } from "@/components/ui/gauge";
import { HelpTip, LabelHelp } from "@/components/ui/help-tip";
import { MonthChart } from "@/components/stats/month-chart";
import { formatEur, formatEurExact, formatPercent } from "@/lib/format";
import type {
  CampaignStatsRow,
  FunnelStatsRow,
  PipelineRow,
  SourceRow,
  StatsDashboard,
  StatsPulse,
} from "@/lib/stats/dashboard";

const SOURCE_CHIP: Record<string, "orange" | "emerald" | "sky" | "violet" | "slate"> = {
  "Google Ads": "orange",
  Organique: "emerald",
  Direct: "slate",
  "Réseaux sociaux": "violet",
};

const PIPELINE_TONE: Record<string, GaugeTone> = {
  new: "sky",
  contacted: "amber",
  in_progress: "violet",
  waiting: "slate",
};

function compactEur(value: number) {
  if (value >= 10_000) return `${Math.round(value / 1000)}\u00a0k€`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(".", ",")}\u00a0k€`;
  return formatEur(value);
}

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return part / total;
}

function FlowCell({
  href,
  value,
  fill,
  tone,
  label,
  help,
  aria,
  last,
}: {
  href?: string;
  value: string | number;
  fill: number;
  tone: GaugeTone;
  label: string;
  help: string;
  aria: string;
  last?: boolean;
}) {
  const body = (
    <>
      <RingGauge value={value} pct={fill} tone={tone} label={aria} />
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
    </>
  );
  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-5 lg:gap-4 lg:px-6 ${
        last ? "" : "border-b border-slate-200 sm:border-b-0 sm:border-r"
      }${href ? " hover:bg-orange-50/40" : ""}`}
    >
      {href ? (
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4">
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4">{body}</div>
      )}
      <HelpTip label={label}>{help}</HelpTip>
      {last ? null : (
        <ChevronRight
          className="pointer-events-none absolute top-1/2 right-0 hidden h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white p-0.5 text-slate-300 ring-1 ring-slate-200 sm:block"
          aria-hidden
        />
      )}
    </div>
  );
}

function ConversionFlow({ pulse }: { pulse: StatsPulse }) {
  const base = Math.max(pulse.visitors, 1);
  return (
    <div className="grid grid-cols-1 border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4">
      <FlowCell
        value={pulse.visitors}
        fill={pct(pulse.visitors, base)}
        tone="slate"
        label="Visiteurs"
        help="Personnes qui ont ouvert le funnel, qu’elles viennent d’une pub, d’un lien ou en direct."
        aria={`${pulse.visitors} visiteurs`}
      />
      <FlowCell
        href="/devis"
        value={pulse.submitted}
        fill={pct(pulse.submitted, base)}
        tone="orange"
        label="Devis"
        help="Demandes envoyées. Un devis, c’est un dossier à rappeler, pas un simple formulaire."
        aria={`${pulse.submitted} devis reçus`}
      />
      <FlowCell
        href="/devis"
        value={`${Math.round(pulse.contactRate)}%`}
        fill={pulse.contactRate / 100}
        tone="emerald"
        label="Rappel"
        help="Part des devis déjà contactés par l’équipe. Plus c’est haut, moins il reste de dossiers en attente."
        aria={`Taux de rappel ${Math.round(pulse.contactRate)}%`}
      />
      <FlowCell
        value={`${Math.round(pulse.winRate)}%`}
        fill={pulse.winRate / 100}
        tone="emerald"
        label="Signé"
        help="Part des devis passés Gagné. C’est le taux de signature, pas le taux de clic."
        aria={`Taux de signature ${Math.round(pulse.winRate)}%`}
        last
      />
    </div>
  );
}

function PipelineStrip({
  rows,
  total,
  wonValue,
  wonCount,
}: {
  rows: PipelineRow[];
  total: number;
  wonValue: number;
  wonCount: number;
}) {
  const max = Math.max(1, total, ...rows.map((row) => row.value));
  return (
    <section className="border-b border-slate-200">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 lg:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pipeline</p>
          <p className="mt-0.5 text-sm text-slate-500">Valeur des devis selon l’étape.</p>
        </div>
        <p className="shrink-0 text-sm tabular-nums text-slate-900">
          {formatEur(total)}
          {wonCount ? <span className="text-slate-500"> · {formatEur(wonValue)} signés</span> : null}
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-sm text-slate-500 lg:px-6">Aucun dossier en cours.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {rows.map((row, i) => (
            <Link
              key={row.slug}
              href="/devis"
              className={`px-4 py-4 hover:bg-orange-50/40 lg:px-6 ${
                i < rows.length - 1 ? "border-b border-slate-200 lg:border-b-0 lg:border-r" : ""
              }`}
            >
              <Chip tone={row.tone}>{row.label}</Chip>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{row.quotes}</p>
              <div className="mt-3">
                <GaugeBar pct={pct(row.value, max)} tone={PIPELINE_TONE[row.slug] ?? "slate"} />
              </div>
              <p className="mt-1.5 text-xs tabular-nums text-slate-500">{formatEur(row.value)}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function SourceGauges({ rows }: { rows: SourceRow[] }) {
  const maxPipe = Math.max(1, ...rows.map((row) => row.pipeline));
  return (
    <section className="border-b border-slate-200">
      <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sources</p>
        <p className="mt-0.5 text-sm text-slate-500">D’où arrivent les visiteurs : pub, recherche, lien direct, réseaux.</p>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-sm text-slate-500 lg:px-6">Aucune source pour l’instant.</p>
      ) : (
        <DataTable headers={["Source", "Visites", "Devis", "Conversion", "CA"]}>
          {rows.map((row) => (
            <tr key={row.source} className="border-b border-slate-100">
              <td className="px-4 py-2.5 lg:px-6">
                <Chip tone={SOURCE_CHIP[row.source] ?? "sky"}>{row.source}</Chip>
              </td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{row.visitors || "-"}</td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{row.quotes}</td>
              <td className="px-4 py-2.5 lg:px-6">
                <div className="min-w-[6.5rem]">
                  <GaugeBar pct={(row.conversion ?? 0) / 100} tone="orange" />
                  <p className="mt-1 text-xs tabular-nums text-slate-500">{formatPercent(row.conversion)}</p>
                </div>
              </td>
              <td className="px-4 py-2.5 lg:px-6">
                <div className="min-w-[6.5rem]">
                  <GaugeBar pct={pct(row.pipeline, maxPipe)} tone="slate" />
                  <p className="mt-1 text-xs font-medium tabular-nums text-slate-900">{formatEur(row.pipeline)}</p>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </section>
  );
}

export function StatsView({
  stats,
  tab,
}: {
  stats: StatsDashboard;
  tab: "vue" | "pipeline" | "sources" | "funnels" | "campagnes";
}) {
  const { pulse, abandons } = stats;
  if (tab === "pipeline") {
    return (
      <PipelineStrip
        rows={stats.pipeline}
        total={stats.pipelineTotal}
        wonValue={stats.wonValue}
        wonCount={stats.wonCount}
      />
    );
  }
  if (tab === "sources") {
    return <SourceGauges rows={stats.sources} />;
  }
  if (tab === "funnels") {
    return <FunnelBreakdown rows={stats.funnels} />;
  }
  if (tab === "campagnes") {
    return <CampaignBreakdown rows={stats.campaigns} adsConnected={stats.ads.connected} />;
  }
  return (
    <>
      <ConversionFlow pulse={pulse} />

      <div className="grid grid-cols-1 border-b border-slate-200 sm:grid-cols-3">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:border-b-0 sm:border-r lg:px-6">
          <RingGauge
            value={compactEur(pulse.pipeline)}
            pct={pulse.pipeline > 0 ? 1 : 0}
            tone="sky"
            label={`${formatEur(pulse.pipeline)} en pipeline`}
          />
          <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            <LabelHelp help="Somme des devis encore ouverts, au milieu de leur fourchette de prix. Ce n’est pas du chiffre d’affaires signé.">
              CA en cours
            </LabelHelp>
          </p>
        </div>
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:border-b-0 sm:border-r lg:px-6">
          <RingGauge
            value={pulse.delayLabel}
            pct={
              pulse.delayHours == null ? 0 : Math.max(0.12, Math.min(1, 1 - pulse.delayHours / 8))
            }
            tone={pulse.delayHours != null && pulse.delayHours > 4 ? "amber" : "slate"}
            label={`Délai de réponse ${pulse.delayLabel}`}
          />
          <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            <LabelHelp help="Temps moyen entre la demande et le premier rappel. Au-delà de 4 h, les dossiers refroidissent.">
              Délai
            </LabelHelp>
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-4 lg:px-6">
          <Link href="/sessions" className="-mx-1 flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 hover:bg-orange-50/50">
            <RingGauge
              value={abandons.total}
              pct={pct(abandons.total, Math.max(pulse.visitors, abandons.total, 1))}
              tone={abandons.total ? "amber" : "slate"}
              label={`${abandons.total} abandons`}
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Abandons</p>
              {abandons.total > 0 ? (
                <p className="mt-0.5 text-sm font-medium text-[#E85D04]">Relancer</p>
              ) : null}
            </div>
          </Link>
          <HelpTip label="Abandons">
            Visiteurs partis sans envoyer la demande. Ceux qui ont laissé un e-mail peuvent être relancés.
          </HelpTip>
        </div>
      </div>

      {stats.ads.connected || stats.campaigns.some((row) => row.source === "Google Ads") ? (
        <AdsLoopStrip stats={stats} />
      ) : null}

      <section>
        <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">6 mois</p>
        </div>
        <MonthChart months={stats.months} />
      </section>
    </>
  );
}

function AdsLoopStrip({ stats }: { stats: StatsDashboard }) {
  const adsQuotes = stats.campaigns.filter((row) => row.source === "Google Ads");
  const quotes = adsQuotes.reduce((sum, row) => sum + row.quotes, 0);
  const won = adsQuotes.reduce((sum, row) => sum + row.won, 0);
  const spend = stats.ads.spend || adsQuotes.reduce((sum, row) => sum + row.spend, 0);
  const costQuote = quotes ? spend / quotes : null;
  const costWon = won ? spend / won : null;
  return (
    <section className="grid grid-cols-2 border-b border-slate-200 lg:grid-cols-4">
      <LoopCell
        label="Dépensé"
        help="Ce que Google Ads vous a facturé sur la période. Visible une fois le compte branché."
        value={spend ? formatEur(spend) : null}
        empty="Compte Ads"
        hint="période choisie"
      />
      <LoopCell
        label="Devis des pubs"
        help="Demandes dont le visiteur est arrivé par une pub Google."
        value={String(quotes)}
        hint="issus d’une pub"
      />
      <LoopCell
        label="Un devis coûte"
        help="Budget ads divisé par les devis reçus. C’est le prix d’un dossier à rappeler."
        value={costQuote != null ? formatEurExact(costQuote) : null}
        empty={quotes ? "Coût inconnu" : "Dès un devis"}
        hint={quotes ? `${quotes} devis` : "en attente"}
      />
      <LoopCell
        label="Un client coûte"
        help="Budget ads divisé par les dossiers Gagné. Le vrai coût d’acquisition."
        value={costWon != null ? formatEurExact(costWon) : null}
        empty={won ? "Coût inconnu" : "Quand c’est signé"}
        hint={won ? `${won} gagnés` : "statut Gagné"}
        last
      />
    </section>
  );
}

function LoopCell({
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

function FunnelBreakdown({ rows }: { rows: FunnelStatsRow[] }) {
  const maxQuotes = Math.max(1, ...rows.map((row) => row.quotes));
  return (
    <section>
      <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Par funnel</p>
        <p className="mt-0.5 text-sm text-slate-500">Chaque funnel a son volume, sa conversion et ses dossiers gagnés.</p>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-sm text-slate-500 lg:px-6">Aucun funnel pour l’instant.</p>
      ) : (
        <DataTable headers={["Funnel", "Visiteurs", "Devis", "Conversion", "Gagnés", "CA"]}>
          {rows.map((row) => (
            <ClickableRow key={row.id} href={`/funnels/${row.id}?tab=stats`}>
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium text-slate-900">{row.name}</div>
                <div className="mt-1 min-w-[6.5rem]">
                  <GaugeBar pct={pct(row.quotes, maxQuotes)} tone="orange" />
                </div>
              </td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{row.visitors || "-"}</td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{row.quotes}</td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{formatPercent(row.conversion)}</td>
              <td className="px-4 py-2.5 lg:px-6">
                <Chip tone={row.won ? "emerald" : "slate"}>{row.won}</Chip>
              </td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{formatEur(row.pipeline)}</td>
            </ClickableRow>
          ))}
        </DataTable>
      )}
    </section>
  );
}

function CampaignBreakdown({
  rows,
  adsConnected,
}: {
  rows: CampaignStatsRow[];
  adsConnected: boolean;
}) {
  return (
    <section>
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 lg:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Campagnes</p>
          <p className="mt-0.5 text-sm text-slate-500">
            D’où viennent les devis, et ce qu’ils coûtent si Google Ads est branché.
          </p>
        </div>
        <Link href="/acquisition" className="shrink-0 text-sm font-medium text-[#E85D04] hover:underline">
          {adsConnected ? "Ouvrir Ads" : "Connecter Google Ads"}
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-sm text-slate-500 lg:px-6">
          Aucune campagne pour l’instant. Dans Ads, copiez l’URL du funnel : dès le premier clic, la ligne apparaît ici.
        </p>
      ) : (
        <DataTable
          headers={["Campagne", "Source", "Funnel", "Devis", "Gagnés", "Un devis", "Un client"]}
        >
          {rows.map((row) => (
            <tr key={`${row.campaign}-${row.source}-${row.funnelId ?? ""}`} className="border-b border-slate-100">
              <td className="px-4 py-2.5 font-medium text-slate-900 lg:px-6">{row.campaign}</td>
              <td className="px-4 py-2.5 lg:px-6">
                <Chip tone={SOURCE_CHIP[row.source] ?? "sky"}>{row.source}</Chip>
              </td>
              <td className="px-4 py-2.5 text-slate-600 lg:px-6">
                {row.funnelId ? (
                  <Link href={`/funnels/${row.funnelId}?tab=stats`} className="hover:text-[#C2410C]">
                    {row.funnelName ?? "Funnel"}
                  </Link>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{row.quotes}</td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{row.won}</td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">
                {row.costPerQuote != null ? formatEurExact(row.costPerQuote) : adsConnected ? "—" : "—"}
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
