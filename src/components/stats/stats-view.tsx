import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DataTable } from "@/components/ui/list-panel";
import { Chip } from "@/components/ui/chip";
import { GaugeBar, RingGauge, type GaugeTone } from "@/components/ui/gauge";
import { MonthChart } from "@/components/stats/month-chart";
import { formatEur, formatPercent } from "@/lib/format";
import type { PipelineRow, SourceRow, StatsDashboard, StatsPulse } from "@/lib/stats/dashboard";

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
  aria,
  last,
}: {
  href?: string;
  value: string | number;
  fill: number;
  tone: GaugeTone;
  label: string;
  aria: string;
  last?: boolean;
}) {
  const inner = (
    <>
      <RingGauge value={value} pct={fill} tone={tone} label={aria} />
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      {last ? null : (
        <ChevronRight
          className="pointer-events-none absolute top-1/2 right-0 hidden h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white p-0.5 text-slate-300 ring-1 ring-slate-200 sm:block"
          aria-hidden
        />
      )}
    </>
  );
  const className = `relative flex items-center gap-3 px-4 py-5 lg:gap-4 lg:px-6 ${
    last ? "" : "border-b border-slate-200 sm:border-b-0 sm:border-r"
  }${href ? " hover:bg-orange-50/50" : ""}`;
  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
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
        aria={`${pulse.visitors} visiteurs`}
      />
      <FlowCell
        href="/devis"
        value={pulse.submitted}
        fill={pct(pulse.submitted, base)}
        tone="orange"
        label="Devis"
        aria={`${pulse.submitted} devis reçus`}
      />
      <FlowCell
        href="/devis"
        value={`${Math.round(pulse.contactRate)}%`}
        fill={pulse.contactRate / 100}
        tone="emerald"
        label="Rappel"
        aria={`Taux de rappel ${Math.round(pulse.contactRate)}%`}
      />
      <FlowCell
        value={`${Math.round(pulse.winRate)}%`}
        fill={pulse.winRate / 100}
        tone="emerald"
        label="Signé"
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
      <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pipeline</p>
        <p className="text-sm tabular-nums text-slate-900">
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

export function StatsView({ stats }: { stats: StatsDashboard }) {
  const { pulse, abandons } = stats;
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
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">CA en cours</p>
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
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Délai</p>
        </div>
        <Link
          href="/sessions"
          className="flex items-center gap-3 px-4 py-4 hover:bg-orange-50/50 lg:px-6"
        >
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
      </div>

      <PipelineStrip
        rows={stats.pipeline}
        total={stats.pipelineTotal}
        wonValue={stats.wonValue}
        wonCount={stats.wonCount}
      />
      <SourceGauges rows={stats.sources} />

      <section>
        <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">6 mois</p>
        </div>
        <MonthChart months={stats.months} />
      </section>
    </>
  );
}
