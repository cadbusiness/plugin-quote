"use client";

import { useEffect, useState, useTransition } from "react";
import { saveHomeModules } from "@/app/(app)/accueil/actions";
import { ListAddRow } from "@/components/ui/list-panel";
import type { HomeModuleDef, HomeModuleId } from "@/lib/crm/home";

export function HomeModulesDialog({
  catalog,
  enabled,
}: {
  catalog: HomeModuleDef[];
  enabled: HomeModuleId[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const enabledSet = new Set(enabled);

  useEffect(() => {
    function fromHash() {
      if (window.location.hash === "#modules") {
        setOpen(true);
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  function submit(formData: FormData) {
    start(async () => {
      await saveHomeModules(formData);
      setOpen(false);
    });
  }

  return (
    <>
      <ListAddRow onClick={() => setOpen(true)}>Ajouter un module</ListAddRow>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => !pending && setOpen(false)}
          />
          <form
            action={submit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-modules-title"
            className="relative z-10 flex max-h-[min(40rem,calc(100dvh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p id="home-modules-title" className="text-base font-semibold text-slate-900">
                Modules du tableau de bord
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Demandes en pleine largeur, le reste en tuiles 1/2. On n’affiche que l’utile.
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
              <ul className="divide-y divide-slate-100">
                {catalog.map((item) => (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-start gap-3 py-3">
                      <input
                        type="checkbox"
                        name="module"
                        value={item.id}
                        defaultChecked={enabledSet.has(item.id)}
                        className="mt-1 accent-[#E85D04]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{item.label}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            {item.span === "full" ? "Pleine largeur" : "1/2"}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-sm text-slate-500">{item.hint}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={() => !pending && setOpen(false)}
                className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D45203] disabled:opacity-60"
              >
                {pending ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
