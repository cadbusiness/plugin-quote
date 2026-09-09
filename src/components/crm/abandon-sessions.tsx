"use client";

import { useState } from "react";
import Link from "next/link";
import { DataTable, ListToolbar } from "@/components/ui/list-panel";
import { Chip } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { AbandonGauges, AbandonProgress } from "@/components/crm/abandon-gauges";
import { LocalPills, replaceClientUrl } from "@/components/ui/local-tabs";
import { formatRelative } from "@/lib/format";
import {
  filterAbandonRows,
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

function viewHref(view: AbandonView) {
  return view === "tous" ? "/sessions" : `/sessions?vue=${view}`;
}

export function AbandonSessionsView({
  snapshot,
  initialView,
}: {
  snapshot: AbandonSnapshot;
  initialView: AbandonView;
}) {
  const [view, setView] = useState(initialView);
  const rows = filterAbandonRows(snapshot.rows, view);

  return (
    <>
      <ListToolbar>
        <LocalPills
          items={VIEWS.map((item) => ({ ...item, count: viewCount(item.id, snapshot) }))}
          active={view}
          onSelect={(next) => {
            setView(next);
            replaceClientUrl(viewHref(next));
          }}
        />
        <Link href="/automations" prefetch className="text-sm text-slate-600 underline">
          Relances auto
        </Link>
      </ListToolbar>

      <AbandonGauges
        snapshot={snapshot}
        view={view}
        onSelect={(next) => {
          setView(next);
          replaceClientUrl(viewHref(next));
        }}
      />

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
    </>
  );
}
