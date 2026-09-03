import Link from "next/link";
import { DataTable } from "@/components/ui/list-panel";
import { Chip } from "@/components/ui/chip";
import { MonthChart } from "@/components/stats/month-chart";
import { formatEur, formatPercent } from "@/lib/format";
import type { Kpi, StatsDashboard } from "@/lib/stats/dashboard";

const FUNNEL_RATES = ["", "conv.", "rét.", "comp.", "sub.", "cont.", "gain"];

const DELTA_TONE = {
  good: "text-emerald-700",
  bad: "text-rose-700",
  muted: "text-slate-400",
} as const;

function Delta({ kpi }: { kpi: Kpi }) {
  return <span className={`text-xs font-medium ${DELTA_TONE[kpi.deltaTone]}`}>{kpi.deltaLabel}</span>;
}

export function StatsView({ stats }: { stats: StatsDashboard }) {
  return (
    <>
      <div className="grid grid-cols-2 border-b border-slate-200 lg:grid-cols-5">
        {stats.kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`px-4 py-5 lg:px-6 ${i < stats.kpis.length - 1 ? "border-b border-slate-200 lg:border-b-0 lg:border-r" : ""}`}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{kpi.value}</p>
            <p className="mt-1 text-xs text-slate-500">{kpi.hint}</p>
            <div className="mt-1">
              <Delta kpi={kpi} />
            </div>
          </div>
        ))}
      </div>

      <section className="border-b border-slate-200 px-4 py-6 lg:px-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Performance funnel</h2>
        <p className="mt-1 text-sm text-slate-500">Où les visiteurs se perdent — et où le budget pub convertit.</p>
        <div className="mt-4 grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4 xl:grid-cols-7">
          {stats.funnel.map((step, i) => (
            <div key={step.key} className="bg-white px-3 py-4">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">{step.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{step.count}</p>
              {i > 0 ? (
                <p className="mt-1 text-xs text-slate-500">
                  {formatPercent(step.rateFromPrevious)} {FUNNEL_RATES[i]}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">entrée</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="px-4 pt-6 lg:px-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Sources de trafic</h2>
          <p className="mt-1 text-sm text-slate-500">
            UTM captés sur le funnel. Un lien Ads <code className="text-slate-700">?utm_source=google&utm_medium=cpc</code>{" "}
            alimente cette table tout seul.
          </p>
        </div>
        {stats.sources.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-500 lg:px-6">
            Pas encore de source. Ajoutez des UTM sur vos campagnes pour voir le ROI par canal.
          </p>
        ) : (
          <DataTable headers={["Source", "Demandes", "Taux conv.", "CA potentiel"]}>
            {stats.sources.map((row) => (
              <tr key={row.source} className="border-b border-slate-100">
                <td className="px-4 py-2.5 lg:px-6">
                  <Chip tone={row.source === "Google Ads" ? "orange" : row.source === "Direct" ? "slate" : "sky"}>
                    {row.source}
                  </Chip>
                </td>
                <td className="px-4 py-2.5 lg:px-6">{row.quotes}</td>
                <td className="px-4 py-2.5 lg:px-6">{formatPercent(row.conversion)}</td>
                <td className="px-4 py-2.5 font-medium lg:px-6">{formatEur(row.pipeline)}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>

      <section className="border-b border-slate-200">
        <div className="px-4 pt-6 lg:px-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Pipeline financier</h2>
        </div>
        <DataTable headers={["Statut", "Demandes", "CA potentiel"]}>
          {stats.pipeline.map((row) => (
            <tr key={row.slug} className="border-b border-slate-100">
              <td className="px-4 py-2.5 lg:px-6">{row.label}</td>
              <td className="px-4 py-2.5 lg:px-6">{row.quotes}</td>
              <td className="px-4 py-2.5 font-medium lg:px-6">{formatEur(row.value)}</td>
            </tr>
          ))}
          <tr className="border-b border-slate-200 bg-slate-50 font-medium">
            <td className="px-4 py-2.5 lg:px-6">Total pipeline</td>
            <td className="px-4 py-2.5 lg:px-6" />
            <td className="px-4 py-2.5 lg:px-6">{formatEur(stats.pipelineTotal)}</td>
          </tr>
          <tr>
            <td className="px-4 py-2.5 text-emerald-800 lg:px-6">Gagné ce mois</td>
            <td className="px-4 py-2.5 text-emerald-800 lg:px-6">{stats.wonCount} projet{stats.wonCount > 1 ? "s" : ""}</td>
            <td className="px-4 py-2.5 font-medium text-emerald-800 lg:px-6">{formatEur(stats.wonValue)}</td>
          </tr>
        </DataTable>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-5 lg:px-6">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Abandons récupérables</h2>
          <p className="mt-2 text-sm text-slate-700">
            Sessions abandonnées : <strong>{stats.abandons.total}</strong>
            {" · "}
            email saisi : <strong>{stats.abandons.withEmail}</strong>
            {" · "}
            CA récupérable : <strong>{formatEur(stats.abandons.recoverable)}</strong>
          </p>
        </div>
        <Link
          href="/sessions"
          className="rounded-md bg-[#E85D04] px-3 py-2 text-sm font-medium text-white hover:bg-[#D45203]"
        >
          Relancer maintenant
        </Link>
      </section>

      <section className="pb-8">
        <div className="px-4 pt-6 lg:px-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Évolution mensuelle</h2>
          <p className="mt-1 text-sm text-slate-500">Demandes reçues, gagnées et abandons — 6 derniers mois.</p>
        </div>
        <MonthChart months={stats.months} />
      </section>
    </>
  );
}
