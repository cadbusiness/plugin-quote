import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { RingGauge } from "@/components/ui/gauge";
import type { AbandonSnapshot, AbandonView } from "@/lib/crm/abandons";

function GaugeLink({
  href,
  active,
  last,
  compact,
  children,
}: {
  href: string;
  active: boolean;
  last?: boolean;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex hover:bg-orange-50/50 ${
        compact
          ? "flex-col items-center justify-center gap-1 bg-white px-2 py-3"
          : `items-center gap-3 px-4 py-5 lg:gap-4 lg:px-6 ${
              last ? "" : "border-b border-slate-200 sm:border-b-0 sm:border-r"
            }`
      } ${active ? "bg-orange-50/70" : ""}`}
    >
      {children}
      {last || compact ? null : (
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
  compact,
}: {
  snapshot: AbandonSnapshot;
  view: AbandonView;
  compact?: boolean;
}) {
  const base = Math.max(snapshot.started, 1);
  return (
    <div
      className={`grid ${
        compact ? "grid-cols-3 gap-px bg-slate-200" : "grid-cols-1 border-b border-slate-200 sm:grid-cols-3"
      }`}
    >
      <GaugeLink href="/sessions" active={view === "tous"} compact={compact}>
        <RingGauge
          value={snapshot.started}
          pct={snapshot.started / base}
          tone="slate"
          size={compact ? "sm" : "md"}
          label={`${snapshot.started} visites commencées`}
        />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Visites</p>
      </GaugeLink>
      <GaugeLink href="/sessions?vue=email" active={view === "email"} compact={compact}>
        <RingGauge
          value={snapshot.baskets}
          pct={snapshot.baskets / base}
          tone="orange"
          size={compact ? "sm" : "md"}
          label={`${snapshot.baskets} emails sauvés sur ${snapshot.started}`}
        />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
      </GaugeLink>
      <GaugeLink href="/sessions?vue=relance" active={view === "relance"} compact={compact} last>
        <RingGauge
          value={snapshot.stale}
          pct={snapshot.stale / base}
          tone="amber"
          size={compact ? "sm" : "md"}
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
