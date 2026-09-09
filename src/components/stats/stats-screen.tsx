"use client";

import { useState } from "react";
import Link from "next/link";
import { FileDown } from "lucide-react";
import { ListToolbar } from "@/components/ui/list-panel";
import { LocalTabNav, replaceClientUrl } from "@/components/ui/local-tabs";
import { StatsView } from "@/components/stats/stats-view";
import { StatsTrackingPanel } from "@/components/stats/tracking-panel";
import type { StatsDashboard, StatsRange } from "@/lib/stats/dashboard";
import { statsHref, type StatsTab } from "@/lib/stats/tabs";

const RANGES: { id: StatsRange; label: string }[] = [
  { id: "day", label: "Aujourd’hui" },
  { id: "week", label: "7 jours" },
  { id: "month", label: "30 jours" },
];

export function StatsScreen({
  stats,
  initialTab,
  range,
  action,
  tabs,
  ga,
  gtm,
  error,
  funnelId,
  funnelFilter,
}: {
  stats: StatsDashboard;
  initialTab: StatsTab;
  range: StatsRange;
  action: { href: string; label: string } | null;
  tabs: { id: StatsTab; label: string }[];
  ga: string;
  gtm: string;
  error?: string;
  funnelId: string | null;
  funnelFilter: boolean;
}) {
  const [tab, setTab] = useState(initialTab);

  function selectTab(next: StatsTab) {
    setTab(next);
    replaceClientUrl(statsHref(next, range, funnelId));
  }

  return (
    <>
      <ListToolbar>
        <div className="mr-auto flex items-center gap-1">
          {RANGES.map((item) => {
            const active = item.id === range;
            return (
              <Link
                key={item.id}
                href={statsHref(tab, item.id, funnelId)}
                prefetch
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm ${
                  active ? "bg-orange-50 font-medium text-[#C2410C]" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        {action ? (
          <Link href={action.href} prefetch className="text-sm font-medium text-[#E85D04] hover:underline">
            {action.label}
          </Link>
        ) : null}
        <a
          href={`/stats/export?range=${range}${funnelId ? `&funnel=${funnelId}` : ""}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D45203]"
        >
          <FileDown className="h-4 w-4" strokeWidth={2} />
          Rapport PDF
        </a>
      </ListToolbar>

      <LocalTabNav items={tabs} active={tab} onSelect={selectTab} />

      {funnelFilter && tab !== "suivi" ? (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-4 py-2 lg:px-6">
          <Link
            href={statsHref(tab, range)}
            prefetch
            className={`rounded-full px-2.5 py-1 text-sm ${
              !funnelId ? "bg-orange-50 font-medium text-[#C2410C]" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Tous les funnels
          </Link>
          {stats.funnels.map((funnel) => (
            <Link
              key={funnel.id}
              href={statsHref(tab, range, funnel.id)}
              prefetch
              className={`rounded-full px-2.5 py-1 text-sm ${
                funnelId === funnel.id
                  ? "bg-orange-50 font-medium text-[#C2410C]"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {funnel.name}
            </Link>
          ))}
        </div>
      ) : null}

      {tab === "suivi" ? (
        <StatsTrackingPanel ga={ga} gtm={gtm} error={error} />
      ) : (
        <StatsView stats={stats} tab={tab} />
      )}
    </>
  );
}
