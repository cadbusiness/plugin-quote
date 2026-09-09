import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { DataTable, ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { Chip } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { AbandonGauges, AbandonProgress } from "@/components/crm/abandon-gauges";
import { formatRelative } from "@/lib/format";
import {
  filterAbandonRows,
  loadAbandonSnapshot,
  resolveAbandonView,
  type AbandonSnapshot,
  type AbandonView,
} from "@/lib/crm/abandons";

const VIEWS: { id: AbandonView; label: string }[] = [
  { id: "relance", label: "À relancer" },
  { id: "email", label: "Emails" },
  { id: "tous", label: "Tous" },
];

function viewCount(view: AbandonView, snapshot: AbandonSnapshot) {
  if (view === "relance") return snapshot.stale;
  if (view === "email") return snapshot.baskets;
  return snapshot.started;
}

export default async function AbandonedSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const { vue } = await searchParams;
  const view = resolveAbandonView(vue);
  const supabase = await createClient();
  const snapshot = await loadAbandonSnapshot(supabase, ctx.organization.id);
  const rows = filterAbandonRows(snapshot.rows, view);

  return (
    <ListPanel>
      <ListToolbar>
        <div className="mr-auto flex items-center gap-1">
          {VIEWS.map((item) => {
            const active = item.id === view;
            return (
              <Link
                key={item.id}
                href={item.id === "tous" ? "/sessions" : `/sessions?vue=${item.id}`}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm ${
                  active
                    ? "bg-orange-50 font-medium text-[#C2410C]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
                <span className={`tabular-nums ${active ? "text-[#E85D04]" : "text-slate-400"}`}>
                  {viewCount(item.id, snapshot)}
                </span>
              </Link>
            );
          })}
        </div>
        <Link href="/automations" className="text-sm text-slate-600 underline">
          Relances auto
        </Link>
      </ListToolbar>

      <AbandonGauges snapshot={snapshot} view={view} />

      {rows.length ? (
        <DataTable headers={["Prospect", "Funnel", "Avancement", "Activité", "État"]}>
          {rows.map((row) => (
            <ClickableRow
              key={row.id}
              href={`/reprendre/${row.token}`}
              className={row.recoverable && row.stale && !row.relanced ? "bg-amber-50/40" : ""}
            >
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium text-slate-900">{row.name || row.email || "Visiteur"}</div>
                <div className="text-slate-500">{row.email ?? "Pas encore d’email"}</div>
              </td>
              <td className="px-4 py-2.5 text-slate-600 lg:px-6">{row.funnel}</td>
              <td className="px-4 py-2.5 lg:px-6">
                <AbandonProgress progress={row.progress} step={row.step} stepCount={row.stepCount} />
              </td>
              <td className="px-4 py-2.5 text-slate-900 lg:px-6">{formatRelative(row.lastActivity)}</td>
              <td className="px-4 py-2.5 lg:px-6">
                {row.recoverable ? (
                  row.stale ? (
                    <Chip tone={row.relanced ? "violet" : "amber"}>
                      {row.relanced ? "Relancé" : "À relancer"}
                    </Chip>
                  ) : (
                    <Chip tone="orange">Récupérable</Chip>
                  )
                ) : (
                  <Chip tone="slate">Sans email</Chip>
                )}
              </td>
            </ClickableRow>
          ))}
        </DataTable>
      ) : (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">
          {view === "relance"
            ? "Rien à relancer. Les paniers inactifs avec email arriveront ici."
            : view === "email"
              ? "Aucun email capturé pour l’instant."
              : "Aucun abandon pour le moment."}
        </p>
      )}
    </ListPanel>
  );
}
