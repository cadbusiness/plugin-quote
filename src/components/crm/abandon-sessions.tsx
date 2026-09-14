"use client";

import { useState } from "react";
import Link from "next/link";
import { DataTable, ListToolbar } from "@/components/ui/list-panel";
import { Chip } from "@/components/ui/chip";
import { ClickableRow } from "@/components/ui/clickable-row";
import { AbandonDrawer } from "@/components/crm/abandon-drawer";
import { AbandonGauges, AbandonProgress } from "@/components/crm/abandon-gauges";
import { LocalPills, replaceClientUrl } from "@/components/ui/local-tabs";
import { formatRelative } from "@/lib/format";
import {
  filterAbandonRows,
  type AbandonRow,
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

function pagesLabel(count: number) {
  return count === 1 ? "1 page" : `${count} pages`;
}

function statusChip(row: AbandonRow) {
  if (row.recoverable) {
    if (row.stale) {
      return <Chip tone={row.relanced ? "violet" : "amber"}>{row.relanced ? "Relancé" : "À relancer"}</Chip>;
    }
    return <Chip tone="orange">Récupérable</Chip>;
  }
  return <Chip tone="slate">Sans email</Chip>;
}

export function AbandonSessionsView({
  snapshot,
  initialView,
}: {
  snapshot: AbandonSnapshot;
  initialView: AbandonView;
}) {
  const [view, setView] = useState(initialView);
  const [openId, setOpenId] = useState<string | null>(null);
  const rows = filterAbandonRows(snapshot.rows, view);
  const openRow = rows.find((row) => row.id === openId) ?? snapshot.rows.find((row) => row.id === openId) ?? null;

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
        <DataTable headers={["Prospect", "Funnel", "Avancement", "Visite", "Activité", "État"]}>
          {rows.map((row) => (
            <ClickableRow
              key={row.id}
              href={`/reprendre/${row.token}`}
              onSelect={() => setOpenId(row.id)}
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
              <td className="px-4 py-2.5 lg:px-6">
                <div className="font-medium tabular-nums text-slate-900">{row.durationLabel}</div>
                <div className="text-slate-500">
                  {[row.countryName, pagesLabel(row.pageCount)].filter(Boolean).join(" · ")}
                </div>
              </td>
              <td className="px-4 py-2.5 text-slate-900 lg:px-6">{formatRelative(row.lastActivity)}</td>
              <td className="px-4 py-2.5 lg:px-6">{statusChip(row)}</td>
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

      {openRow ? <AbandonDrawer row={openRow} onClose={() => setOpenId(null)} /> : null}
    </>
  );
}
