export const GAUGE_TONES = {
  slate: "#0f172a",
  orange: "#E85D04",
  amber: "#d97706",
  emerald: "#059669",
  rose: "#e11d48",
  violet: "#7c3aed",
  sky: "#0284c7",
} as const;

export type GaugeTone = keyof typeof GAUGE_TONES;

export function RingGauge({
  value,
  pct,
  tone,
  label,
  size = "md",
}: {
  value: string | number;
  pct: number;
  tone: GaugeTone;
  label: string;
  size?: "sm" | "md";
}) {
  const fillPct = Math.max(0, Math.min(1, pct));
  const r = 34;
  const c = 2 * Math.PI * r;
  const track = c * 0.75;
  const fill = track * fillPct;
  const text = String(value);
  const fontSize = text.length > 5 ? 12 : text.length > 3 ? 16 : 24;
  return (
    <svg
      viewBox="0 0 92 92"
      className={`shrink-0 ${size === "sm" ? "h-14 w-14" : "h-20 w-20"}`}
      role="img"
      aria-label={label}
    >
      <g transform="rotate(135 46 46)">
        <circle
          cx="46"
          cy="46"
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${track} ${c}`}
        />
        {fillPct > 0 ? (
          <circle
            cx="46"
            cy="46"
            r={r}
            fill="none"
            stroke={GAUGE_TONES[tone]}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${fill} ${c}`}
          />
        ) : null}
      </g>
      <text
        x="46"
        y="50"
        textAnchor="middle"
        fill={GAUGE_TONES[tone]}
        fontSize={fontSize}
        fontWeight={600}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {text}
      </text>
    </svg>
  );
}

export function GaugeBar({
  pct,
  tone = "orange",
}: {
  pct: number;
  tone?: GaugeTone;
}) {
  const width = Math.max(pct > 0 ? 6 : 0, Math.round(Math.max(0, Math.min(1, pct)) * 100));
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full" style={{ width: `${width}%`, background: GAUGE_TONES[tone] }} />
    </div>
  );
}
