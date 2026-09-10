"use client";

import { useEffect, useState, useTransition } from "react";
import { createShop } from "@/app/(app)/integrations/shop-actions";
import { ListAddRow } from "@/components/ui/list-panel";
import { FUNNEL_FAMILIES, type FunnelFamilyId } from "@/lib/funnels/families";

type Funnel = { id: string; name: string };

const MODES = [
  {
    id: "template" as const,
    label: "Template sectoriel",
    blurb: "Boutique déjà structurée : accueil, catalogue, menus, pages légales, CTA devis.",
    tint: "bg-orange-50 text-orange-900 ring-orange-200",
  },
  {
    id: "chat" as const,
    label: "Chat IA",
    blurb: "Vous décrivez. L’IA pose les pages, les textes, les images et le référencement.",
    tint: "bg-violet-50 text-violet-900 ring-violet-200",
  },
];

export function CreateShopDialog({
  funnels,
  defaultFamily,
  orgName,
}: {
  funnels: Funnel[];
  defaultFamily?: FunnelFamilyId | null;
  orgName: string;
}) {
  const startFamily = defaultFamily ?? "custom";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"template" | "chat">("template");
  const [family, setFamily] = useState<FunnelFamilyId>(startFamily);
  const [name, setName] = useState(orgName);
  const [configuratorId, setConfiguratorId] = useState(funnels[0]?.id ?? "");
  const [createFunnel, setCreateFunnel] = useState(!funnels.length);
  const [city, setCity] = useState("");
  const [prompt, setPrompt] = useState("");
  const [pending, startTransition] = useTransition();

  function openDialog() {
    setStep(0);
    setMode("template");
    setFamily(startFamily);
    setName(orgName);
    setConfiguratorId(funnels[0]?.id ?? "");
    setCreateFunnel(!funnels.length);
    setCity("");
    setPrompt("");
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
    window.addEventListener("qb:create-shop", openFromEvent);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener("qb:create-shop", openFromEvent);
    };
  }, []);

  function close() {
    if (pending) return;
    setOpen(false);
  }

  function submit() {
    const data = new FormData();
    data.set("name", name.trim() || orgName);
    data.set("sector", family);
    if (configuratorId && !createFunnel) data.set("configurator_id", configuratorId);
    if (createFunnel || !configuratorId) data.set("create_funnel", "on");
    data.set("company", orgName);
    data.set("city", city);
    if (mode === "chat" && prompt.trim()) data.set("seed_prompt", prompt.trim());
    startTransition(() => {
      void createShop(data);
    });
  }

  const lastStep = mode === "chat" ? 3 : 2;

  return (
    <>
      <ListAddRow onClick={openDialog}>Créer une boutique QuoteBuilder</ListAddRow>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/40" onClick={close} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-shop-title"
            className="relative z-10 flex max-h-[min(40rem,calc(100dvh-2rem))] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">
                Nouvelle boutique · {step + 1} / {lastStep + 1}
              </p>
              <h2 id="create-shop-title" className="mt-1 text-lg font-semibold text-slate-900">
                {step === 0 && "Comment la créer"}
                {step === 1 && "Secteur"}
                {step === 2 && "Catalogue et identité"}
                {step === 3 && "Brief pour l’IA"}
              </h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {step === 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {MODES.map((item) => {
                    const on = mode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMode(item.id)}
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
              ) : null}

              {step === 1 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {FUNNEL_FAMILIES.map((item) => {
                    const on = family === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFamily(item.id)}
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
              ) : null}

              {step === 2 ? (
                <div className="space-y-4">
                  <label className="block text-sm">
                    <span className="font-medium text-slate-900">Nom de la boutique</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                    <span className="mt-1 block text-xs text-slate-500">
                      L’URL publique sera du type /b/votre-espace/nom-de-la-boutique
                    </span>
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-slate-900">Ville (GEO / SEO local)</span>
                    <input
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      placeholder="Lyon"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  {funnels.length ? (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200">
                        <input
                          type="checkbox"
                          checked={createFunnel}
                          onChange={(event) => setCreateFunnel(event.target.checked)}
                        />
                        Créer un funnel catalogue dédié (recommandé)
                      </label>
                      {!createFunnel ? (
                        <label className="block text-sm">
                          <span className="font-medium text-slate-900">Catalogue existant</span>
                          <select
                            value={configuratorId}
                            onChange={(event) => setConfiguratorId(event.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                          >
                            {funnels.map((funnel) => (
                              <option key={funnel.id} value={funnel.id}>
                                {funnel.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Un funnel catalogue sera créé avec la boutique, déjà branché sur « Demander un devis ».
                    </p>
                  )}
                </div>
              ) : null}

              {step === 3 ? (
                <label className="block text-sm">
                  <span className="font-medium text-slate-900">Décrivez la boutique</span>
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    rows={7}
                    placeholder="Ex. Cuisiniste à Lyon, ton chaleureux, mets en avant les îlots et le sur-mesure, photo d’une cuisine blanche, FAQ sur les délais…"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    L’éditeur s’ouvre avec le chat. Vous pourrez ensuite dire « rajoute cette image », « change le bandeau », etc.
                  </span>
                </label>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
              <button type="button" onClick={close} className="text-sm text-slate-500 hover:text-slate-900">
                Annuler
              </button>
              <div className="flex gap-2">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => current - 1)}
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
                  >
                    Retour
                  </button>
                ) : null}
                {step < lastStep ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => current + 1)}
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
                    {pending ? "Création…" : mode === "chat" ? "Créer et ouvrir le chat" : "Créer la boutique"}
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
