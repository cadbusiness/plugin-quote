"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { connectStore, type ConnectState } from "@/app/(app)/integrations/actions";
import type { CatalogProvider } from "@/lib/integrations/types";

type Funnel = { id: string; name: string };

const PROVIDERS: {
  id: CatalogProvider;
  label: string;
  blurb: string;
  tint: string;
}[] = [
  {
    id: "woocommerce",
    label: "WooCommerce",
    blurb: "Boutique WordPress. Produits, variations, images et prix via l'API REST.",
    tint: "bg-violet-50 text-violet-900 ring-violet-200",
  },
  {
    id: "shopify",
    label: "Shopify",
    blurb: "App personnalisée avec la portée read_products. Déclinaisons et médias inclus.",
    tint: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  },
];

export function ConnectStoreDialog({ funnels }: { funnels: Funnel[] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState<CatalogProvider>("woocommerce");
  const [state, formAction] = useActionState<ConnectState, FormData>(connectStore, {});

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

  const current = PROVIDERS.find((p) => p.id === provider)!;

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
        Connecter une boutique
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
            aria-labelledby="connect-store-title"
            className="relative z-10 flex max-h-[min(38rem,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">
                Connecter une boutique · {step + 1} / 3
              </p>
              <h2 id="connect-store-title" className="mt-1 text-lg font-semibold text-slate-900">
                {step === 0 && "Où est votre catalogue ?"}
                {step === 1 && `Accès ${current.label}`}
                {step === 2 && "Ce qu'on importe"}
              </h2>
            </div>

            <form action={formAction} className="flex min-h-0 flex-1 flex-col">
              <input type="hidden" name="provider" value={provider} />

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <div hidden={step !== 0} className="grid gap-2 sm:grid-cols-2">
                  {PROVIDERS.map((item) => {
                    const on = provider === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setProvider(item.id)}
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

                <div hidden={step !== 1} className="space-y-4">
                  {provider === "woocommerce" ? (
                    <>
                      <Field label="URL de la boutique" hint="https://ma-boutique.fr — HTTPS obligatoire">
                        <input
                          name="store"
                          placeholder="https://ma-boutique.fr"
                          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                      </Field>
                      <Field label="Consumer key" hint="WooCommerce → Réglages → Avancé → API REST → Créer une clé (lecture seule)">
                        <input
                          name="consumer_key"
                          placeholder="ck_..."
                          autoComplete="off"
                          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm"
                        />
                      </Field>
                      <Field label="Consumer secret">
                        <input
                          name="consumer_secret"
                          type="password"
                          placeholder="cs_..."
                          autoComplete="new-password"
                          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm"
                        />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="Domaine de la boutique" hint="Le domaine technique, du type ma-boutique.myshopify.com">
                        <input
                          name="store"
                          placeholder="ma-boutique.myshopify.com"
                          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                      </Field>
                      <Field
                        label="Jeton d'accès Admin API"
                        hint="Shopify admin → Paramètres → Applications et canaux de vente → Développer des applications → portée read_products"
                      >
                        <input
                          name="access_token"
                          type="password"
                          placeholder="shpat_..."
                          autoComplete="new-password"
                          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm"
                        />
                      </Field>
                      <Field
                        label="Clé secrète de l'app (facultatif)"
                        hint="Sert à vérifier les webhooks Shopify. Sans elle, la sync reste manuelle ou planifiée."
                      >
                        <input
                          name="webhook_secret"
                          type="password"
                          autoComplete="new-password"
                          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm"
                        />
                      </Field>
                    </>
                  )}
                </div>

                <div hidden={step !== 2} className="space-y-4">
                  <Field label="Funnel qui reçoit le catalogue">
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
                  </Field>

                  <Field label="Nom affiché dans QuoteBuilder" hint="Laissez vide pour reprendre le nom de la boutique">
                    <input
                      name="label"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </Field>

                  <div className="grid gap-2">
                    <Check name="archiveMissing" defaultChecked label="Retirer les produits supprimés de la boutique" />
                    <Check name="skipOutOfStock" label="Ignorer les produits en rupture" />
                    <Check name="importDrafts" label="Importer aussi les brouillons" />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Marge sur les prix importés" hint="En %, 0 = prix boutique">
                      <input
                        name="markupPercent"
                        type="number"
                        step="0.1"
                        defaultValue={0}
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </Field>
                    <Field label="Limiter à des catégories" hint="Séparées par des virgules, vide = tout le catalogue">
                      <input
                        name="categories"
                        placeholder="Cuisine, Rangement"
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {state.error ? (
                <p className="border-t border-rose-100 bg-rose-50 px-5 py-2 text-sm text-rose-700">
                  {state.error}{" "}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="underline underline-offset-2"
                  >
                    Revoir les accès
                  </button>
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
                      onClick={() => setStep((s) => s - 1)}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
                    >
                      Retour
                    </button>
                  ) : null}
                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s + 1)}
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
      {pending ? "Import en cours…" : "Connecter et importer"}
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-900">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}
