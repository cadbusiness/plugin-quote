"use client";

import { useEffect, useState, useTransition } from "react";
import { createWorkflow } from "@/app/(app)/workflow-actions";
import { ListAddRow } from "@/components/ui/list-panel";
import { HelpTip } from "@/components/ui/help-tip";
import { TRIGGER_HELP, TRIGGER_ORDER, TRIGGER_WHEN } from "@/lib/workflows/labels";
import { TriggerGlyph } from "@/components/workflows/trigger-icon";
import { defaultWorkflowName } from "@/lib/workflows/defaults";
import type { WorkflowTriggerType } from "@/lib/workflows/types";

export function CreateWorkflowDialog({
  funnels,
  statuses,
  presetFunnelId,
  addLabel = "Ajouter un parcours",
}: {
  funnels: { id: string; name: string }[];
  statuses: { slug: string; label: string }[];
  presetFunnelId?: string;
  addLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [trigger, setTrigger] = useState<WorkflowTriggerType>("quote.submitted");
  const [name, setName] = useState(defaultWorkflowName("quote.submitted"));
  const [allFunnels, setAllFunnels] = useState(!presetFunnelId);
  const [funnelIds, setFunnelIds] = useState<string[]>(presetFunnelId ? [presetFunnelId] : []);
  const [abandonHours, setAbandonHours] = useState(1);
  const [statusSlug, setStatusSlug] = useState(statuses[0]?.slug ?? "");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#nouveau") {
        setOpen(true);
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  function pickTrigger(id: WorkflowTriggerType) {
    setTrigger(id);
    setName(defaultWorkflowName(id));
  }

  function close() {
    if (pending) return;
    setOpen(false);
    setStep(0);
  }

  function submit() {
    const data = new FormData();
    data.set("trigger_type", trigger);
    data.set("name", name.trim());
    data.set("abandon_hours", String(abandonHours));
    if (statusSlug) data.set("status_slug", statusSlug);
    if (!allFunnels) {
      for (const id of funnelIds) data.append("funnels", id);
    }
    startTransition(() => {
      void createWorkflow(data);
    });
  }

  return (
    <>
      <ListAddRow onClick={() => setOpen(true)}>{addLabel}</ListAddRow>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/40" onClick={close} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-workflow-title"
            className="relative z-10 flex max-h-[min(36rem,calc(100dvh-2rem))] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">
                Nouveau parcours · {step + 1} / 3
              </p>
              <h2 id="create-workflow-title" className="mt-1 text-lg font-semibold text-slate-900">
                {step === 0 && "Quand ?"}
                {step === 1 && "Où ?"}
                {step === 2 && "Nom"}
              </h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {step === 0 ? (
                <div className="grid gap-2">
                  {TRIGGER_ORDER.map((id) => {
                    const on = trigger === id;
                    return (
                      <div
                        key={id}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${
                          on ? "border-[#E85D04] bg-orange-50" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => pickTrigger(id)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <TriggerGlyph type={id} size="sm" />
                          <span className="font-medium text-slate-900">{TRIGGER_WHEN[id]}</span>
                        </button>
                        <HelpTip label={TRIGGER_WHEN[id]} align="right">
                          {TRIGGER_HELP[id]}
                        </HelpTip>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={allFunnels} onChange={(e) => setAllFunnels(e.target.checked)} />
                    Tous les funnels
                  </label>
                  {!allFunnels ? (
                    <div className="grid gap-2">
                      {funnels.map((funnel) => {
                        const on = funnelIds.includes(funnel.id);
                        return (
                          <button
                            key={funnel.id}
                            type="button"
                            onClick={() =>
                              setFunnelIds((current) =>
                                on ? current.filter((id) => id !== funnel.id) : [...current, funnel.id],
                              )
                            }
                            className={`rounded-lg border px-3 py-2 text-left text-sm ${
                              on ? "border-[#E85D04] bg-orange-50" : "border-slate-200"
                            }`}
                          >
                            {funnel.name}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                  {trigger === "session.abandoned" ? (
                    <label className="block text-sm">
                      <span className="text-slate-600">Seuil d’inactivité (heures)</span>
                      <input
                        type="number"
                        min={0}
                        value={abandonHours}
                        onChange={(e) => setAbandonHours(Number(e.target.value))}
                        className="mt-1 w-28 border border-slate-200 px-2 py-1.5"
                      />
                    </label>
                  ) : null}
                  {trigger === "quote.status_changed" ? (
                    <label className="block text-sm">
                      <span className="text-slate-600">Statut déclencheur</span>
                      <select
                        value={statusSlug}
                        onChange={(e) => setStatusSlug(e.target.value)}
                        className="mt-1 w-full border border-slate-200 px-2 py-1.5"
                      >
                        <option value="">Tous les statuts</option>
                        {statuses.map((status) => (
                          <option key={status.slug} value={status.slug}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </div>
              ) : null}

              {step === 2 ? (
                <label className="block text-sm">
                  <span className="text-slate-600">Nom</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full border border-slate-200 px-3 py-2"
                  />
                </label>
              ) : null}
            </div>

            <div className="flex justify-between border-t border-slate-100 px-5 py-3">
              <button type="button" onClick={step === 0 ? close : () => setStep((s) => s - 1)} className="text-sm underline">
                {step === 0 ? "Annuler" : "Retour"}
              </button>
              {step < 2 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white"
                >
                  Continuer
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pending || !name.trim()}
                  onClick={submit}
                  className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {pending ? "Création…" : "Créer le parcours"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
