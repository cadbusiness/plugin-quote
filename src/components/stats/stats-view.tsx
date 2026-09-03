import Link from "next/link";
import { DataTable } from "@/components/ui/list-panel";
import { Chip } from "@/components/ui/chip";
import { MonthChart } from "@/components/stats/month-chart";
import { formatEur, formatPercent } from "@/lib/format";
import type { FunnelStep, Kpi, StatsDashboard } from "@/lib/stats/dashboard";

const DELTA = {
  good: "text-emerald-700",
  bad: "text-rose-700",
  muted: "text-slate-400",
} as const;

const SOURCE_CHIP: Record<string, "orange" | "emerald" | "sky" | "violet" | "slate"> = {
  "Google Ads": "orange",
  Organique: "emerald",
  Direct: "slate",
  "Réseaux sociaux": "violet",
};

function KpiCell({ kpi, bordered }: { kpi: Kpi; bordered?: boolean }) {
  return (
    <div className={`px-4 py-5 lg:px-6 ${bordered ? "border-r border-slate-200" : ""}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{kpi.label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{kpi.value}</p>
      <p className="mt-1 text-sm text-slate-500">{kpi.hint}</p>
      <p className={`mt-0.5 text-xs font-medium ${DELTA[kpi.deltaTone]}`}>{kpi.deltaLabel}</p>
    </div>
  );
}

function FunnelStrip({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(1, ...steps.map((s) => s.count));
  return (
    <div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4 xl:grid-cols-7">
      {steps.map((step, i) => {
        const width = Math.max(8, Math.round((step.count / max) * 100));
        const prev = steps[i - 1];
        const lost = prev ? Math.max(0, prev.count - step.count) : 0;
        return (
          <div key={step.key} className="bg-white px-3 py-4 lg:px-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{step.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{step.count}</p>
            {i === 0 ? (
              <p className="mt-1 text-xs text-slate-400">entrée</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                {formatPercent(step.rateFromPrevious)}
                {lost > 0 ? <span className="text-rose-600"> · −{lost}</span> : null}
              </p>
            )}
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-800"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StatsView({ stats }: { stats: StatsDashboard }) {
  return (
    <>
      <div className="grid grid-cols-2 border-b border-slate-200 lg:grid-cols-5">
        {stats.kpis.map((kpi, i) => (
          <KpiCell key={kpi.label} kpi={kpi} bordered={i < stats.kpis.length - 1} />
        ))}
      </div>

      <section className="border-b border-slate-200">
        <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tunnel de conversion</p>
          <p className="mt-0.5 text-sm text-slate-500">
            D’où viennent les visiteurs, où ils décrochent, combien deviennent des devis signés.
          </p>
        </div>
        <FunnelStrip steps={stats.funnel} />
      </section>

      <section className="border-b border-slate-200">
        <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sources</p>
          <p className="mt-0.5 text-sm text-slate-500">Quel canal amène des devis — et combien ça représente.</p>
        </div>
        {stats.sources.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-500 lg:px-6">
            Aucune source pour l’instant. Les UTM de vos liens pub rempliront ce tableau.
          </p>
        ) : (
          <DataTable headers={["Source", "Visites", "Devis", "Conversion", "CA potentiel"]}>
            {stats.sources.map((row) => (
              <tr key={row.source} className="border-b border-slate-100">
                <td className="px-4 py-2.5 lg:px-6">
                  <Chip tone={SOURCE_CHIP[row.source] ?? "sky"}>{row.source}</Chip>
                </td>
                <td className="px-4 py-2.5 tabular-nums lg:px-6">{row.visitors || "—"}</td>
                <td className="px-4 py-2.5 tabular-nums lg:px-6">{row.quotes}</td>
                <td className="px-4 py-2.5 tabular-nums lg:px-6">{formatPercent(row.conversion)}</td>
                <td className="px-4 py-2.5 font-medium tabular-nums lg:px-6">{formatEur(row.pipeline)}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>

      <section className="border-b border-slate-200">
        <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pipeline</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {formatEur(stats.pipelineTotal)} en cours · {formatEur(stats.wonValue)} signés ce mois ({stats.wonCount})
          </p>
        </div>
        <DataTable headers={["Statut", "Devis", "CA potentiel"]}>
          {stats.pipeline.map((row) => (
            <tr key={row.slug} className="border-b border-slate-100">
              <td className="px-4 py-2.5 lg:px-6">{row.label}</td>
              <td className="px-4 py-2.5 tabular-nums lg:px-6">{row.quotes}</td>
              <td className="px-4 py-2.5 font-medium tabular-nums lg:px-6">{formatEur(row.value)}</td>
            </tr>
          ))}
          <tr className="border-b border-slate-200 bg-slate-50 font-medium">
            <td className="px-4 py-2.5 lg:px-6">Total pipeline</td>
            <td className="px-4 py-2.5 lg:px-6" />
            <td className="px-4 py-2.5 tabular-nums lg:px-6">{formatEur(stats.pipelineTotal)}</td>
          </tr>
        </DataTable>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 lg:px-6">
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">{stats.abandons.total}</span> abandon
          {stats.abandons.total > 1 ? "s" : ""}
          {stats.abandons.withEmail > 0
            ? ` · ${stats.abandons.withEmail} avec email (${formatEur(stats.abandons.recoverable)} récupérable)`
            : ""}
        </p>
        {stats.abandons.total > 0 ? (
          <Link
            href="/sessions"
            className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D45203]"
          >
            Relancer
          </Link>
        ) : null}
      </section>

      <section>
        <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Évolution · 6 mois</p>
        </div>
        <MonthChart months={stats.months} />
      </section>
    </>
  );
}
