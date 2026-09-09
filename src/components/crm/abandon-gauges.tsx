"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { RingGauge } from "@/components/ui/gauge";
import type { AbandonSnapshot, AbandonView } from "@/lib/crm/abandons";

function GaugeHit({
  href,
  active,
  last,
  compact,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  last?: boolean;
  compact?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const className = `relative flex hover:bg-orange-50/50 ${
    compact
      ? "flex-col items-center justify-center gap-1 bg-white px-2 py-3"
      : `items-center gap-3 px-4 py-5 lg:gap-4 lg:px-6 ${
          last ? "" : "border-b border-slate-200 sm:border-b-0 sm:border-r"
        }`
  } ${active ? "bg-orange-50/70" : ""}`;
  const chevron =
    last || compact ? null : (
      <ChevronRight
        className="pointer-events-none absolute top-1/2 right-0 hidden h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white p-0.5 text-slate-300 ring-1 ring-slate-200 sm:block"
        aria-hidden
      />
    );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`w-full text-left ${className}`}>
        {children}
        {chevron}
      </button>
    );
  }
  return (
    <Link href={href} prefetch className={className}>
      {children}
      {chevron}
    </Link>
  );
}

export function AbandonGauges({
  snapshot,
  view,
  compact,
  onSelect,
}: {
  snapshot: AbandonSnapshot;
  view: AbandonView;
  compact?: boolean;
  onSelect?: (view: AbandonView) => void;
}) {
  const base = Math.max(snapshot.started, 1);
  return (
    <div
      className={`grid ${
        compact ? "grid-cols-3 gap-px bg-slate-200" : "grid-cols-1 border-b border-slate-200 sm:grid-cols-3"
      }`}
    >
      <GaugeHit href="/sessions" active={view === "tous"} compact={compact} onClick={onSelect ? () => onSelect("tous") : undefined}>
        <RingGauge
          value={snapshot.started}
          pct={snapshot.started / base}
          tone="slate"
          size={compact ? "sm" : "md"}
          label={`${snapshot.started} visites commencées`}
        />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Visites</p>
      </GaugeHit>
      <GaugeHit
        href="/sessions?vue=email"
        active={view === "email"}
        compact={compact}
        onClick={onSelect ? () => onSelect("email") : undefined}
      >
        <RingGauge
          value={snapshot.baskets}
          pct={snapshot.baskets / base}
          tone="orange"
          size={compact ? "sm" : "md"}
          label={`${snapshot.baskets} emails sauvés sur ${snapshot.started}`}
        />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
      </GaugeHit>
      <GaugeHit
        href="/sessions?vue=relance"
        active={view === "relance"}
        compact={compact}
        last
        onClick={onSelect ? () => onSelect("relance") : undefined}
      >
        <RingGauge
          value={snapshot.stale}
          pct={snapshot.stale / base}
          tone="amber"
          size={compact ? "sm" : "md"}
          label={`${snapshot.stale} paniers à relancer`}
        />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Relance</p>
      </GaugeHit>
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
