import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AbandonSnapshot, AbandonView } from "@/lib/crm/abandons";

const TONES = {
  slate: "#0f172a",
  orange: "#E85D04",
  amber: "#d97706",
} as const;

function Ring({
  value,
  max,
  tone,
  label,
}: {
  value: number;
  max: number;
  tone: keyof typeof TONES;
  label: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(1, value / max);
  const r = 34;
  const c = 2 * Math.PI * r;
  const track = c * 0.75;
  const fill = track * pct;
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
        fontSize={value > 99 ? 18 : 24}
        fontWeight={600}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {value}
      </text>
    </svg>
  );
}

function GaugeLink({
  href,
  active,
  last,
  children,
}: {
  href: string;
  active: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 px-4 py-5 hover:bg-orange-50/50 lg:gap-4 lg:px-6 ${
        last ? "" : "border-b border-slate-200 sm:border-b-0 sm:border-r"
      } ${active ? "bg-orange-50/70" : ""}`}
    >
      {children}
      {last ? null : (
        <ChevronRight
          className="pointer-events-none absolute top-1/2 right-0 hidden h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white p-0.5 text-slate-300 ring-1 ring-slate-200 sm:block"
          aria-hidden
        />
      )}
    </Link>
  );
}

export function AbandonGauges({
  snapshot,
  view,
}: {
  snapshot: AbandonSnapshot;
  view: AbandonView;
}) {
  const base = Math.max(snapshot.started, 1);
  return (
    <div className="grid grid-cols-1 border-b border-slate-200 sm:grid-cols-3">
      <GaugeLink href="/sessions" active={view === "tous"}>
        <Ring
          value={snapshot.started}
          max={base}
          tone="slate"
          label={`${snapshot.started} visites commencées`}
        />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Visites</p>
      </GaugeLink>
      <GaugeLink href="/sessions?vue=email" active={view === "email"}>
        <Ring
          value={snapshot.baskets}
          max={base}
          tone="orange"
          label={`${snapshot.baskets} emails sauvés sur ${snapshot.started}`}
        />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
      </GaugeLink>
      <GaugeLink href="/sessions?vue=relance" active={view === "relance"} last>
        <Ring
          value={snapshot.stale}
          max={base}
          tone="amber"
          label={`${snapshot.stale} paniers à relancer`}
        />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Relance</p>
      </GaugeLink>
    </div>
  );
}

export function AbandonProgress({ progress, step, stepCount }: { progress: number; step: number; stepCount: number }) {
  const width = Math.max(progress > 0 ? 8 : 0, Math.round(progress * 100));
  return (
    <div className="min-w-[7.5rem]">
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#E85D04]" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-1 text-xs tabular-nums text-slate-500">
        {step}/{stepCount}
      </p>
    </div>
  );
}
