import type { MonthPoint } from "@/lib/stats/dashboard";

const SERIES = [
  { key: "quotes" as const, label: "Devis demandés", color: "#E85D04" },
  { key: "won" as const, label: "Signés", color: "#16a34a" },
  { key: "abandons" as const, label: "Partis", color: "#d97706" },
];

export function MonthChart({ months }: { months: MonthPoint[] }) {
  const width = 720;
  const height = 260;
  const pad = { top: 8, right: 4, bottom: 36, left: 4 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...months.flatMap((m) => [m.quotes, m.won, m.abandons]));
  const group = innerW / months.length;
  const barW = Math.min(22, group / 4);

  return (
    <div className="px-4 py-4 lg:px-6">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full" role="img" aria-label="Évolution sur 6 mois">
        {months.map((m, i) => {
          const cx = pad.left + i * group + group / 2;
          return (
            <g key={m.key}>
              {SERIES.map((s, si) => {
                const h = (m[s.key] / max) * innerH;
                const x = cx + (si - 1) * (barW + 3) - barW / 2;
                const y = pad.top + innerH - h;
                return (
                  <rect
                    key={s.key}
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(h, m[s.key] ? 6 : 0)}
                    rx={barW / 2}
                    fill={s.color}
                    opacity={m[s.key] ? 1 : 0.15}
                  />
                );
              })}
              <text x={cx} y={height - 8} textAnchor="middle" fill="#64748b" fontSize="12">
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-600">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
