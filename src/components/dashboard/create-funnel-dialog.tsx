"use client";

import { useEffect, useState, useTransition } from "react";
import { createFunnel } from "@/app/(app)/actions";
import { ListAddRow } from "@/components/ui/list-panel";
import { FUNNEL_TEMPLATES, getFunnelTemplate } from "@/lib/funnels/templates";
import type { ScreenType } from "@/lib/wizard/types";

type ExistingFunnel = { id: string; name: string };

const SCREENS: { id: ScreenType; label: string; hint: string }[] = [
  { id: "questions", label: "Questions de cadrage", hint: "Le prospect qualifie son projet" },
  { id: "suggestions", label: "Catalogue", hint: "On lui propose vos produits" },
  { id: "customize", label: "Personnalisation", hint: "Quantités, options, précisions" },
  { id: "contact", label: "Formulaire de contact", hint: "Nom, email, téléphone, société" },
];

export function CreateFunnelDialog({ existingFunnels }: { existingFunnels: ExistingFunnel[] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [sector, setSector] = useState("kitchen");
  const [name, setName] = useState(getFunnelTemplate("kitchen").defaultName);
  const [wizardEnabled, setWizardEnabled] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(false);
  const [screens, setScreens] = useState<ScreenType[]>(["questions", "suggestions", "customize", "contact"]);
  const [catalogFrom, setCatalogFrom] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#nouveau") {
        setOpen(true);
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    function openFromEvent() {
      setOpen(true);
      setStep(0);
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    window.addEventListener("qb:create-funnel", openFromEvent);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener("qb:create-funnel", openFromEvent);
    };
  }, []);

  function pickSector(id: string) {
    setSector(id);
    const template = getFunnelTemplate(id);
    setName(template.defaultName);
  }

  function toggleScreen(id: ScreenType) {
    setScreens((current) => {
      if (current.includes(id)) {
        if (id === "contact") return current;
        return current.filter((s) => s !== id);
      }
      return [...current, id];
    });
  }

  function close() {
    if (pending) return;
    setOpen(false);
    setStep(0);
  }

  function submit() {
    const data = new FormData();
    data.set("name", name.trim());
    data.set("sector", sector);
    if (wizardEnabled) data.set("wizard_enabled", "on");
    if (chatEnabled) data.set("chat_enabled", "on");
    for (const screen of screens) data.append("screens", screen);
    if (catalogFrom) data.set("catalog_from", catalogFrom);
    startTransition(() => {
      void createFunnel(data);
    });
  }

  return (
    <>
      <ListAddRow onClick={() => setOpen(true)}>Ajouter un funnel</ListAddRow>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/40" onClick={close} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-funnel-title"
            className="relative z-10 flex max-h-[min(36rem,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">
                Nouveau funnel · {step + 1} / 3
              </p>
              <h2 id="create-funnel-title" className="mt-1 text-lg font-semibold text-slate-900">
                {step === 0 && "Pour quel secteur ?"}
                {step === 1 && "Parcours et écrans"}
                {step === 2 && "Catalogue"}
              </h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {step === 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {FUNNEL_TEMPLATES.map((template) => {
                    const on = sector === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => pickSector(template.id)}
                        className={`rounded-lg px-3 py-3 text-left ring-1 transition-colors ${
                          on ? `${template.tint} ring-current` : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="block text-sm font-medium">{template.label}</span>
                        <span className="mt-1 block text-xs leading-5 opacity-80">{template.blurb}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-5">
                  <label className="block text-sm">
                    Nom du funnel
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Modes</p>
                    <p className="mt-0.5 text-xs text-slate-500">Le prospect avance en funnel guidé, en chat, ou les deux.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <ToggleChip
                        on={wizardEnabled}
                        tone="orange"
                        label="Funnel guidé"
                        onClick={() => setWizardEnabled((v) => !v || !chatEnabled)}
                      />
                      <ToggleChip
                        on={chatEnabled}
                        tone="violet"
                        label="Chat IA"
                        onClick={() => setChatEnabled((v) => !v || !wizardEnabled)}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Écrans</p>
                    <p className="mt-0.5 text-xs text-slate-500">Le contact reste obligatoire pour recevoir un dossier.</p>
                    <div className="mt-2 grid gap-2">
                      {SCREENS.map((screen) => {
                        const on = screens.includes(screen.id);
                        const locked = screen.id === "contact";
                        return (
                          <button
                            key={screen.id}
                            type="button"
                            disabled={locked}
                            onClick={() => toggleScreen(screen.id)}
                            className={`flex items-start justify-between rounded-lg px-3 py-2.5 text-left ring-1 ${
                              on
                                ? "bg-orange-50 text-slate-900 ring-orange-200"
                                : "bg-white text-slate-600 ring-slate-200"
                            }`}
                          >
                            <span>
                              <span className="block text-sm font-medium">{screen.label}</span>
                              <span className="block text-xs text-slate-500">{screen.hint}</span>
                            </span>
                            <span className={`mt-0.5 text-xs font-medium ${on ? "text-[#E85D04]" : "text-slate-400"}`}>
                              {on ? "Inclus" : "Off"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Le catalogue est branché sur ce funnel. Vous pourrez l’importer en CSV ou via WooCommerce ensuite.
                  </p>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3 ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200">
                    <input
                      type="radio"
                      name="catalog"
                      checked={catalogFrom === ""}
                      onChange={() => setCatalogFrom("")}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium">Je le remplirai après</span>
                      <span className="block text-xs text-slate-500">Funnel prêt, catalogue vide.</span>
                    </span>
                  </label>
                  {existingFunnels.length ? (
                    <label className="block rounded-lg px-3 py-3 ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200">
                      <span className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="catalog"
                          checked={catalogFrom !== ""}
                          onChange={() => setCatalogFrom(existingFunnels[0]?.id ?? "")}
                          className="mt-1"
                        />
                        <span>
                          <span className="block text-sm font-medium">Reprendre un catalogue existant</span>
                          <span className="block text-xs text-slate-500">Copie les produits d’un autre funnel.</span>
                        </span>
                      </span>
                      {catalogFrom !== "" ? (
                        <select
                          value={catalogFrom}
                          onChange={(e) => setCatalogFrom(e.target.value)}
                          className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        >
                          {existingFunnels.map((funnel) => (
                            <option key={funnel.id} value={funnel.id}>
                              {funnel.name}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </label>
                  ) : null}
                </div>
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
                  <button
                    type="button"
                    disabled={pending || name.trim().length < 2}
                    onClick={submit}
                    className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-50"
                  >
                    {pending ? "Création…" : "Créer le funnel"}
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

function ToggleChip({
  on,
  tone,
  label,
  onClick,
}: {
  on: boolean;
  tone: "orange" | "violet";
  label: string;
  onClick: () => void;
}) {
  const active =
    tone === "orange"
      ? "bg-orange-50 text-orange-800 ring-orange-200"
      : "bg-violet-50 text-violet-800 ring-violet-200";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ring-1 ${on ? active : "bg-white text-slate-500 ring-slate-200"}`}
    >
      {label}
    </button>
  );
}
