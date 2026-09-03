import Link from "next/link";
import { MonthChart } from "@/components/stats/month-chart";
import { formatEur } from "@/lib/format";
import type { BubbleTone, FunnelStep, Kpi, SourceRow, StatsDashboard } from "@/lib/stats/dashboard";

const BUBBLE: Record<BubbleTone, { ring: string; fill: string; text: string }> = {
  orange: { ring: "bg-orange-100", fill: "bg-[#E85D04]", text: "text-white" },
  emerald: { ring: "bg-emerald-100", fill: "bg-emerald-600", text: "text-white" },
  amber: { ring: "bg-amber-100", fill: "bg-amber-500", text: "text-white" },
  rose: { ring: "bg-rose-100", fill: "bg-rose-500", text: "text-white" },
  sky: { ring: "bg-sky-100", fill: "bg-sky-500", text: "text-white" },
  violet: { ring: "bg-violet-100", fill: "bg-violet-600", text: "text-white" },
  slate: { ring: "bg-slate-100", fill: "bg-slate-500", text: "text-white" },
};

const SOURCE_TONE: Record<string, BubbleTone> = {
  "Google Ads": "orange",
  Organique: "emerald",
  Direct: "slate",
  "Réseaux sociaux": "violet",
};

function people(n: number, one: string, many: string) {
  return `${n} ${n > 1 ? many : one}`;
}

function Bubble({
  value,
  tone,
  size = 72,
}: {
  value: string;
  tone: BubbleTone;
  size?: number;
}) {
  const skin = BUBBLE[tone];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${skin.ring}`}
      style={{ width: size + 10, height: size + 10 }}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full font-semibold tracking-tight ${skin.fill} ${skin.text}`}
        style={{ width: size, height: size, fontSize: size > 70 ? "1.5rem" : "1.125rem" }}
      >
        {value}
      </span>
    </span>
  );
}

function KpiBubble({ kpi }: { kpi: Kpi }) {
  return (
    <div className="flex flex-col items-center px-3 py-5 text-center">
      <Bubble value={kpi.value} tone={kpi.tone} size={84} />
      <p className="mt-3 text-sm font-semibold text-slate-900">{kpi.label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{kpi.hint}</p>
    </div>
  );
}

function FunnelBubbles({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(1, ...steps.map((s) => s.count));
  return (
    <div className="flex flex-wrap items-end justify-between gap-y-6">
      {steps.map((step, i) => {
        const size = step.count === 0 ? 40 : 56 + Math.round((step.count / max) * 40);
        const prev = steps[i - 1];
        const lost = prev ? Math.max(0, prev.count - step.count) : 0;
        return (
          <div key={step.key} className="flex min-w-[88px] flex-1 flex-col items-center text-center">
            {i > 0 ? (
              <p className={`mb-2 text-[11px] font-medium ${lost > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                {lost > 0 ? `${lost} de moins` : "tous"}
              </p>
            ) : (
              <p className="mb-2 text-[11px] text-slate-400">départ</p>
            )}
            <Bubble value={String(step.count)} tone={step.tone} size={size} />
            <p className="mt-2 text-sm font-semibold text-slate-900">{step.label}</p>
            <p className="text-[11px] text-slate-500">{step.help}</p>
          </div>
        );
      })}
    </div>
  );
}

function SourceBars({ rows }: { rows: SourceRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.visitors || r.quotes));
  return (
    <ul>
      {rows.map((row) => {
        const tone = SOURCE_TONE[row.source] ?? "sky";
        const width = Math.max(8, Math.round(((row.visitors || row.quotes) / max) * 100));
        const line =
          row.quotes === 0
            ? "des visites, aucun devis encore"
            : row.visitors
              ? `${people(row.quotes, "devis", "devis")} pour ${people(row.visitors, "visite", "visites")}`
              : people(row.quotes, "devis", "devis");
        return (
          <li key={row.source} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3.5 lg:px-6">
            <Bubble value={String(row.quotes)} tone={tone} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold text-slate-900">{row.source}</p>
                <p className="shrink-0 text-sm font-medium text-slate-700">{formatEur(row.pipeline)}</p>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{line}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${BUBBLE[tone].fill}`} style={{ width: `${width}%` }} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function StatsView({ stats }: { stats: StatsDashboard }) {
  const leak = stats.funnel.find((s, i) => i > 0 && (s.rateFromPrevious ?? 100) < 80);
  return (
    <>
      <section className="border-b border-orange-100 bg-[#FFF6EE] px-4 py-6 lg:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#C2410C]/70">En une phrase</p>
        <p className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-slate-900">{stats.story.headline}</p>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{stats.story.detail}</p>
        {stats.story.actionHref ? (
          <Link
            href={stats.story.actionHref}
            className="mt-4 inline-flex rounded-full bg-[#E85D04] px-4 py-2 text-sm font-medium text-white hover:bg-[#D45203]"
          >
            {stats.story.actionLabel}
          </Link>
        ) : null}
      </section>

      <section className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-3 lg:grid-cols-5">
        {stats.kpis.map((kpi) => (
          <KpiBubble key={kpi.label} kpi={kpi} />
        ))}
      </section>

      <section className="border-b border-slate-200 px-4 py-6 lg:px-6">
        <h2 className="text-lg font-semibold text-slate-900">Le parcours des gens</h2>
        <p className="mt-1 text-sm text-slate-500">
          Chaque bulle est une étape. Quand elle rétrécit, vous perdez du monde
          {leak ? ` — aujourd’hui surtout après « ${stats.funnel[stats.funnel.indexOf(leak) - 1]?.label} ».` : "."}
        </p>
        <div className="mt-6">
          <FunnelBubbles steps={stats.funnel} />
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="px-4 pt-6 lg:px-6">
          <h2 className="text-lg font-semibold text-slate-900">Qui vous amène des devis</h2>
          <p className="mt-1 text-sm text-slate-500">
            Pub, site, bouche-à-oreille : vous voyez ce qui ramène vraiment des devis.
          </p>
        </div>
        {stats.sources.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-500 lg:px-6">Pas encore de source — les premiers clics rempliront cette ligne.</p>
        ) : (
          <div className="mt-3">
            <SourceBars rows={stats.sources} />
          </div>
        )}
      </section>

      <section className="border-b border-slate-200 px-4 py-6 lg:px-6">
        <h2 className="text-lg font-semibold text-slate-900">Où est l’argent</h2>
        <p className="mt-1 text-sm text-slate-500">
          {stats.pipelineTotal > 0
            ? `${formatEur(stats.pipelineTotal)} en cours, ${formatEur(stats.wonValue)} déjà signés ce mois.`
            : "Mettez des prix sur le catalogue pour voir les montants."}
        </p>
        <div className="mt-5 flex flex-wrap gap-6">
          {stats.pipeline.map((row) => (
            <div key={row.slug} className="flex min-w-[120px] flex-col items-center text-center">
              <Bubble value={String(row.quotes)} tone={row.tone} size={72} />
              <p className="mt-2 text-sm font-semibold text-slate-900">{row.label}</p>
              <p className="text-xs text-slate-500">{formatEur(row.value)}</p>
            </div>
          ))}
          <div className="flex min-w-[120px] flex-col items-center text-center">
            <Bubble value={String(stats.wonCount)} tone="emerald" size={72} />
            <p className="mt-2 text-sm font-semibold text-emerald-800">Signé ce mois</p>
            <p className="text-xs text-emerald-700">{formatEur(stats.wonValue)}</p>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-4 py-6 lg:px-6">
        <div className="flex items-center gap-4">
          <Bubble value={String(stats.abandons.total)} tone={stats.abandons.total ? "rose" : "slate"} size={64} />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">À rattraper</h2>
            <p className="mt-1 text-sm text-slate-600">
              {stats.abandons.total === 0
                ? "Personne n’est parti en cours de route."
                : `${people(stats.abandons.withEmail, "email récupérable", "emails récupérables")}${
                    stats.abandons.recoverable > 0 ? ` · ${formatEur(stats.abandons.recoverable)}` : ""
                  }`}
            </p>
          </div>
        </div>
        <Link
          href="/sessions"
          className="rounded-full bg-[#E85D04] px-4 py-2 text-sm font-medium text-white hover:bg-[#D45203]"
        >
          Relancer maintenant
        </Link>
      </section>

      <section className="pb-8">
        <div className="px-4 pt-6 lg:px-6">
          <h2 className="text-lg font-semibold text-slate-900">Les 6 derniers mois</h2>
          <p className="mt-1 text-sm text-slate-500">Demandes reçues, affaires signées, gens partis.</p>
        </div>
        <MonthChart months={stats.months} />
      </section>
    </>
  );
}
