import type { MonthPoint } from "@/lib/stats/dashboard";

const SERIES = [
  { key: "quotes" as const, label: "Devis", color: "#E85D04" },
  { key: "won" as const, label: "Signés", color: "#059669" },
  { key: "abandons" as const, label: "Abandons", color: "#d97706" },
];

export function MonthChart({
  months,
  headline,
  counts,
}: {
  months: MonthPoint[];
  headline?: string;
  counts?: boolean;
}) {
  const width = 720;
  const height = headline ? 148 : 168;
  const pad = { top: 8, right: 4, bottom: 24, left: 4 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...months.flatMap((m) => [m.quotes, m.won, m.abandons]));
  const group = innerW / months.length;
  const barW = Math.min(14, group / 5);
  const totals = {
    quotes: months.reduce((sum, month) => sum + month.quotes, 0),
    won: months.reduce((sum, month) => sum + month.won, 0),
    abandons: months.reduce((sum, month) => sum + month.abandons, 0),
  };

  return (
    <div className="px-4 py-4 lg:px-6">
      {headline ? (
        <p className="mb-3 max-w-lg text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
          {headline}
        </p>
      ) : null}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={headline ? "h-32 w-full" : "h-40 w-full"}
        role="img"
        aria-label={headline ?? "Évolution sur 6 mois"}
      >
        {months.map((m, i) => {
          const cx = pad.left + i * group + group / 2;
          return (
            <g key={m.key}>
              {SERIES.map((s, si) => {
                const value = m[s.key];
                if (!value) return null;
                const h = (value / max) * innerH;
                const x = cx + (si - 1) * (barW + 2) - barW / 2;
                const y = pad.top + innerH - h;
                return (
                  <rect
                    key={s.key}
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(h, 8)}
                    rx={2}
                    fill={s.color}
                  />
                );
              })}
              <text x={cx} y={height - 6} textAnchor="middle" fill="#94a3b8" fontSize="11">
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-500">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
            {s.label}
            {counts ? ` ${totals[s.key]}` : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
