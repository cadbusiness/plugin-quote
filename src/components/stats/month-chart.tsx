import type { MonthPoint } from "@/lib/stats/dashboard";

const SERIES = [
  { key: "quotes" as const, label: "Demandes", color: "#E85D04" },
  { key: "won" as const, label: "Gagnées", color: "#16a34a" },
  { key: "abandons" as const, label: "Abandons", color: "#d97706" },
];

export function MonthChart({ months }: { months: MonthPoint[] }) {
  const width = 720;
  const height = 220;
  const pad = { top: 16, right: 12, bottom: 28, left: 28 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...months.flatMap((m) => [m.quotes, m.won, m.abandons]));
  const x = (i: number) => pad.left + (months.length <= 1 ? innerW / 2 : (i / (months.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  function path(key: (typeof SERIES)[number]["key"]) {
    return months
      .map((m, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(m[key]).toFixed(1)}`)
      .join(" ");
  }

  return (
    <div className="px-4 py-4 lg:px-6">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img" aria-label="Évolution sur 6 mois">
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={pad.left}
            x2={width - pad.right}
            y1={y(max * t)}
            y2={y(max * t)}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {SERIES.map((s) => (
          <g key={s.key}>
            <path d={path(s.key)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" />
            {months.map((m, i) => (
              <circle key={`${s.key}-${m.key}`} cx={x(i)} cy={y(m[s.key])} r="3.5" fill={s.color} />
            ))}
          </g>
        ))}
        {months.map((m, i) => (
          <text key={m.key} x={x(i)} y={height - 8} textAnchor="middle" fill="#94a3b8" fontSize="11">
            {m.label}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
