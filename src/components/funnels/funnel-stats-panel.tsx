import Link from "next/link";
import { StatsView } from "@/components/stats/stats-view";
import { formatEur } from "@/lib/format";
import type { StatsDashboard } from "@/lib/stats/dashboard";

export function FunnelStatsPanel({
  funnelId,
  stats,
}: {
  funnelId: string;
  stats: StatsDashboard;
}) {
  const row = stats.funnels.find((item) => item.id === funnelId);
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="text-sm text-slate-500">
          Visiteurs, devis et pubs de ce funnel. Vue d’ensemble dans{" "}
          <Link href={`/stats?funnel=${funnelId}`} className="font-medium text-[#E85D04] hover:underline">
            Statistiques
          </Link>
          .
        </p>
        {row?.spend ? (
          <p className="text-sm tabular-nums text-slate-900">Dépense Ads {formatEur(row.spend)}</p>
        ) : null}
      </div>
      <StatsView stats={stats} tab="vue" />
      <StatsView stats={stats} tab="campagnes" />
    </>
  );
}
