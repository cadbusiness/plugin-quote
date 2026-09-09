import Link from "next/link";
import { KPI_HREF, type Kpi } from "@/lib/stats/dashboard";

const DELTA: Record<Kpi["deltaTone"], string> = {
  good: "text-emerald-700",
  bad: "text-rose-700",
  muted: "text-slate-400",
};

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
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{kpi.label}</p>
            <p
              className={`mt-1 font-semibold tabular-nums text-slate-900 ${
                compact ? "text-xl" : "text-2xl"
              }`}
            >
              {kpi.value}
            </p>
            <p className={`mt-1 text-xs tabular-nums ${DELTA[kpi.deltaTone]}`}>{kpi.deltaLabel}</p>
            {compact ? null : <p className="mt-0.5 truncate text-xs text-slate-400">{kpi.hint}</p>}
          </>
        );
        const className = `bg-white px-4 py-3.5 lg:px-5 ${href ? "hover:bg-orange-50/50" : ""}`;
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
