"use client";

import { useEffect, useState, useTransition } from "react";
import { createMemberSpace } from "@/app/(app)/membres/actions";
import { ListAddRow } from "@/components/ui/list-panel";

const MODULES = [
  {
    id: "documents" as const,
    label: "Documents",
    blurb: "Guides, notices, PDF à consulter une fois connecté.",
    tint: "bg-amber-50 text-amber-900 ring-amber-200",
  },
  {
    id: "plugins" as const,
    label: "Plugins et liens",
    blurb: "Plugin WordPress, notices, outils que vos clients doivent voir.",
    tint: "bg-violet-50 text-violet-900 ring-violet-200",
  },
];

export function CreateMemberSpaceDialog({ orgName }: { orgName: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [documents, setDocuments] = useState(true);
  const [plugins, setPlugins] = useState(true);
  const [name, setName] = useState(`Espace devis ${orgName}`);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openDialog() {
    setStep(0);
    setDocuments(true);
    setPlugins(true);
    setName(`Espace devis ${orgName}`);
    setError(null);
    setOpen(true);
  }

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#nouveau") {
        openDialog();
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    function openFromEvent() {
      openDialog();
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    window.addEventListener("qb:create-member-space", openFromEvent);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener("qb:create-member-space", openFromEvent);
    };
  }, [orgName]);

  function close() {
    if (pending) return;
    setOpen(false);
  }

  function submit() {
    const data = new FormData();
    data.set("name", name.trim() || `Espace devis ${orgName}`);
    if (documents) data.set("documents", "on");
    if (plugins) data.set("plugins", "on");
    setError(null);
    startTransition(() => {
      void (async () => {
        const result = await createMemberSpace(data);
        if (result?.error) setError(result.error);
      })();
    });
  }

  return (
    <>
      <ListAddRow onClick={openDialog}>Créer un espace membres</ListAddRow>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/40" onClick={close} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-member-space-title"
            className="relative z-10 flex max-h-[min(36rem,calc(100dvh-2rem))] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">
                Nouvel espace membres · {step + 1} / 2
              </p>
              <h2 id="create-member-space-title" className="mt-1 text-lg font-semibold text-slate-900">
                {step === 0 ? "Que voient vos clients" : "Nom et lien public"}
              </h2>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {step === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-slate-600">
                    La liste des devis est toujours là. Ajoutez des documents et des plugins que vos clients ouvrent après
                    connexion.
                  </p>
                  <div className="grid gap-2">
                    {MODULES.map((item) => {
                      const on = item.id === "documents" ? documents : plugins;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => (item.id === "documents" ? setDocuments(!documents) : setPlugins(!plugins))}
                          className={`rounded-lg px-3 py-3 text-left ring-1 transition-colors ${
                            on ? `${item.tint} ring-current` : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span className="block text-sm font-medium">{item.label}</span>
                          <span className="mt-1 block text-xs leading-5 opacity-80">{item.blurb}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <label className="block text-sm">
                  <span className="font-medium text-slate-900">Nom de l’espace</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    L’URL publique sera du type /m/votre-espace/espace-devis
                  </span>
                </label>
              )}
            </div>
            {error ? <p className="border-t border-rose-100 bg-rose-50 px-5 py-2 text-sm text-rose-700">{error}</p> : null}
            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
              <button type="button" onClick={close} className="text-sm text-slate-500 hover:text-slate-900">
                Annuler
              </button>
              <div className="flex gap-2">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
                  >
                    Retour
                  </button>
                ) : null}
                {step === 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
                  >
                    Continuer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={pending}
                    className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-50"
                  >
                    {pending ? "Création…" : "Créer l’espace"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
