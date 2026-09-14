import Link from "next/link";
import { GaugeBar } from "@/components/ui/gauge";
import { KPI_HREF, type Kpi } from "@/lib/stats/dashboard";

const DELTA: Record<Kpi["deltaTone"], string> = {
  good: "text-emerald-600",
  bad: "text-rose-600",
  muted: "text-slate-400",
};

function SparkBars({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="mt-3 flex h-7 items-end gap-[3px]" aria-hidden>
      {values.map((value, index) => {
        const last = index === values.length - 1;
        const height = Math.max(3, Math.round((value / max) * 28));
        return (
          <span
            key={index}
            className={`w-[5px] rounded-sm ${last ? "bg-[#E85D04]" : "bg-slate-200"}`}
            style={{ height }}
          />
        );
      })}
    </div>
  );
}

export function KpiStrip({
  items,
  compact,
}: {
  items: Kpi[];
  compact?: boolean;
}) {
  const cols =
    items.length >= 5 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-2 lg:grid-cols-4";
  return (
    <div className={`grid gap-px bg-slate-200 ${cols}`}>
      {items.map((kpi) => {
        const href = KPI_HREF[kpi.id];
        const inner = (
          <>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{kpi.label}</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p
                className={`font-semibold tabular-nums tracking-tight text-slate-900 ${
                  compact ? "text-3xl" : "text-2xl"
                }`}
              >
                {kpi.value}
              </p>
              <p className={`text-xs font-medium tabular-nums ${DELTA[kpi.deltaTone]}`}>{kpi.deltaLabel}</p>
            </div>
            {kpi.spark?.length ? <SparkBars values={kpi.spark} /> : null}
            {kpi.spark?.length || kpi.meter == null ? null : (
              <div className="mt-3 w-16">
                <GaugeBar pct={kpi.meter} tone="slate" />
              </div>
            )}
            {compact ? null : <p className="mt-0.5 truncate text-xs text-slate-400">{kpi.hint}</p>}
          </>
        );
        const className = `bg-white px-4 ${compact ? "py-5" : "py-3.5"} lg:px-5 ${href ? "hover:bg-orange-50/50" : ""}`;
        return href ? (
          <Link key={kpi.id} href={href} className={className}>
            {inner}
          </Link>
        ) : (
          <div key={kpi.id} className={className}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
