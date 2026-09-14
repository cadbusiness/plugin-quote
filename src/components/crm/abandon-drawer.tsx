"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { AbandonProgress } from "@/components/crm/abandon-gauges";
import { formatDate, formatRelative } from "@/lib/format";
import { deviceLabel } from "@/lib/stats/visit";
import type { AbandonRow } from "@/lib/crm/abandons";

function statusChip(row: AbandonRow) {
  if (row.recoverable) {
    if (row.stale) {
      return <Chip tone={row.relanced ? "violet" : "amber"}>{row.relanced ? "Relancé" : "À relancer"}</Chip>;
    }
    return <Chip tone="orange">Récupérable</Chip>;
  }
  return <Chip tone="slate">Sans email</Chip>;
}

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-sm text-slate-900">{value || "—"}</p>
    </div>
  );
}

export function AbandonDrawer({ row, onClose }: { row: AbandonRow; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const pagesLabel = row.pageCount === 1 ? "1 page" : `${row.pageCount} pages`;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Fermer le détail" className="qb-overlay-in absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="abandon-title"
        className="qb-drawer-in absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 lg:px-5">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-700">Visite</p>
            <h2 id="abandon-title" className="mt-0.5 truncate text-base font-semibold text-slate-900">
              {row.name || row.email || "Visiteur"}
            </h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {[row.company, row.email || "Pas encore d’email"].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {statusChip(row)}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-orange-50 hover:text-[#E85D04]"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b border-slate-100 px-4 py-4 lg:px-5">
            <p className="text-sm font-medium text-slate-900">{row.funnel}</p>
            <div className="mt-2">
              <AbandonProgress progress={row.progress} step={row.step} stepCount={row.stepCount} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-slate-100 px-4 py-4 lg:px-5">
            <Fact label="Durée" value={row.durationLabel} />
            <Fact label="Pays" value={row.place} />
            <Fact label="Appareil" value={deviceLabel(row.device)} />
            <Fact label="Source" value={row.source} />
            <Fact label="Pages" value={pagesLabel} />
            <Fact label="Dernière activité" value={formatRelative(row.lastActivity)} />
            <Fact label="Arrivée" value={row.landingLabel} />
            <Fact label="Référent" value={row.referrerHost} />
          </div>

          {row.phone ? (
            <div className="border-b border-slate-100 px-4 py-3 lg:px-5">
              <Fact label="Téléphone" value={row.phone} />
            </div>
          ) : null}

          <div className="border-b border-slate-100 px-4 py-4 lg:px-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Parcours</p>
            {row.stops.length ? (
              <ol className="mt-3 space-y-3">
                {row.stops.map((stop, index) => (
                  <li key={`${stop.at}-${stop.label}-${index}`} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E85D04]" />
                    <span className="min-w-0">
                      <span className="block text-sm text-slate-900">{stop.label}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        {[stop.detail, formatDate(stop.at)].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Pas encore de pages enregistrées.</p>
            )}
          </div>

          {row.answers.length ? (
            <div className="border-b border-slate-100 px-4 py-4 lg:px-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Réponses</p>
              <dl className="mt-3 space-y-2">
                {row.answers.map((answer) => (
                  <div key={answer.key} className="flex justify-between gap-4 text-sm">
                    <dt className="text-slate-500">{answer.label}</dt>
                    <dd className="text-right text-slate-900">{answer.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {row.chatCount > 0 ? (
            <div className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600 lg:px-5">
              {row.chatCount === 1 ? "1 message dans le chat" : `${row.chatCount} messages dans le chat`}
            </div>
          ) : null}
        </div>

        <div className="border-t border-slate-200 px-4 py-3 lg:px-5">
          <Link
            href={`/reprendre/${row.token}`}
            className="inline-flex text-sm font-medium text-[#C2410C] hover:underline"
          >
            Voir le parcours
          </Link>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
