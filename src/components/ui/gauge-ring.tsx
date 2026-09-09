const TONES = {
  slate: "#0f172a",
  orange: "#E85D04",
  amber: "#d97706",
  rose: "#e11d48",
  emerald: "#047857",
  sky: "#0369a1",
  violet: "#6d28d9",
} as const;

export type GaugeTone = keyof typeof TONES;

export function GaugeRing({
  value,
  max,
  tone,
  label,
}: {
  value: number;
  max: number;
  tone: GaugeTone;
  label: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(1, value / max);
  const r = 34;
  const c = 2 * Math.PI * r;
  const track = c * 0.75;
  const fill = track * pct;
  const display = Number.isInteger(value) ? String(value) : value.toFixed(0);
  return (
    <svg viewBox="0 0 92 92" className="h-20 w-20 shrink-0" role="img" aria-label={label}>
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
        {pct > 0 ? (
          <circle
            cx="46"
            cy="46"
            r={r}
            fill="none"
            stroke={TONES[tone]}
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
        fill={TONES[tone]}
        fontSize={display.length > 3 ? 16 : 24}
        fontWeight={600}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {display}
      </text>
    </svg>
  );
}
