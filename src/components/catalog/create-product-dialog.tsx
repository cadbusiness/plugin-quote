"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { createProduct, type ProductFormState } from "@/app/(app)/produits/actions";

type Funnel = { id: string; name: string };

type PriceMode = "fixed" | "range" | "quote";

const PRICE_MODES: { id: PriceMode; label: string; hint: string }[] = [
  { id: "fixed", label: "Prix fixe", hint: "Un montant unique affiché au prospect" },
  { id: "range", label: "Fourchette", hint: "De … à …, quand ça dépend du projet" },
  { id: "quote", label: "Sur devis", hint: "Aucun montant affiché" },
];

export function CreateProductDialog({ funnels }: { funnels: Funnel[] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [priceMode, setPriceMode] = useState<PriceMode>("range");
  const [state, formAction] = useActionState<ProductFormState, FormData>(createProduct, {});

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

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStep(0);
        }}
        className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
      >
        Nouveau produit
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-product-title"
            className="relative z-10 flex max-h-[min(38rem,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">
                Nouveau produit · {step + 1} / 2
              </p>
              <h2 id="create-product-title" className="mt-1 text-lg font-semibold text-slate-900">
                {step === 0 ? "Qu’est-ce que vous vendez ?" : "Prix et présentation"}
              </h2>
            </div>

            <form action={formAction} className="flex min-h-0 flex-1 flex-col">
              <input type="hidden" name="price_mode" value={priceMode} />

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <div hidden={step !== 0} className="space-y-4">
                  <label className="block text-sm">
                    <span className="font-medium text-slate-900">Nom du produit</span>
                    <input
                      name="name"
                      placeholder="Rayonnage mi-lourd 2000×1000"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="font-medium text-slate-900">Catégorie</span>
                      <input
                        name="category"
                        placeholder="Rayonnage"
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="font-medium text-slate-900">Référence / SKU</span>
                      <input
                        name="sku"
                        placeholder="RAY-ML-2010"
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <label className="block text-sm">
                    <span className="font-medium text-slate-900">Funnel qui le propose</span>
                    <select
                      name="configurator_id"
                      defaultValue={funnels[0]?.id ?? ""}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    >
                      {funnels.map((funnel) => (
                        <option key={funnel.id} value={funnel.id}>
                          {funnel.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div hidden={step !== 1} className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Comment annoncer le prix ?</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {PRICE_MODES.map((mode) => {
                        const on = priceMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setPriceMode(mode.id)}
                            className={`rounded-lg px-3 py-2.5 text-left ring-1 ${
                              on
                                ? "bg-orange-50 text-slate-900 ring-orange-200"
                                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <span className="block text-sm font-medium">{mode.label}</span>
                            <span className="block text-xs text-slate-500">{mode.hint}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {priceMode !== "quote" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm">
                        <span className="font-medium text-slate-900">
                          {priceMode === "fixed" ? "Prix" : "À partir de"}
                        </span>
                        <input
                          name="price_min"
                          type="number"
                          step="0.01"
                          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                      {priceMode === "range" ? (
                        <label className="block text-sm">
                          <span className="font-medium text-slate-900">Jusqu’à</span>
                          <input
                            name="price_max"
                            type="number"
                            step="0.01"
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                      ) : null}
                    </div>
                  ) : null}

                  <label className="block text-sm">
                    <span className="font-medium text-slate-900">Description</span>
                    <textarea
                      name="description"
                      rows={4}
                      placeholder="Ce que le prospect doit comprendre en dix secondes."
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="font-medium text-slate-900">Photo</span>
                      <input
                        type="file"
                        name="image"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="mt-1 w-full text-sm"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="font-medium text-slate-900">Tags</span>
                      <input
                        name="tags"
                        placeholder="lourd, entrepôt"
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {state.error ? (
                <p className="border-t border-rose-100 bg-rose-50 px-5 py-2 text-sm text-rose-700">
                  {state.error}
                </p>
              ) : null}

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
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
                    <Submit />
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-50"
    >
      {pending ? "Création…" : "Créer le produit"}
    </button>
  );
}
