"use client";

import { useEffect, useState, useTransition } from "react";
import { createCampaign } from "@/app/(app)/emails/actions";

const KINDS = [
  { id: "relance", title: "Relance", blurb: "Recontacter ceux qui ont configuré un devis, sans relancer les mêmes.", tint: "bg-amber-50 text-amber-900 ring-amber-200" },
  { id: "offre", title: "Offre", blurb: "Une proposition soignée, avec le récap de leur configuration.", tint: "bg-orange-50 text-[#9a3412] ring-orange-200" },
  { id: "nurturing", title: "Nurturing", blurb: "Garder le fil avec un segment (B2B, hot, un funnel…).", tint: "bg-violet-50 text-violet-900 ring-violet-200" },
  { id: "perso", title: "Personnel", blurb: "Un email court, à votre nom, pour un échange one-to-one.", tint: "bg-sky-50 text-sky-900 ring-sky-200" },
] as const;

export function CreateCampaignDialog({
  segments,
  channels,
}: {
  segments: { id: string; name: string }[];
  channels: { id: string; label: string; address: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("relance");
  const [sendMode, setSendMode] = useState<"personal" | "group">("personal");
  const [name, setName] = useState("Relance configuration");
  const [pending, start] = useTransition();

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

  function submit() {
    const data = new FormData();
    data.set("name", name.trim());
    data.set("kind", kind);
    data.set("send_mode", sendMode);
    const form = document.getElementById("campaign-create-fields") as HTMLDivElement | null;
    if (form) {
      const segment = form.querySelector<HTMLSelectElement>("[name=segment_id]");
      const channel = form.querySelector<HTMLSelectElement>("[name=channel_id]");
      const skip = form.querySelector<HTMLInputElement>("[name=skip_recent_days]");
      if (segment?.value) data.set("segment_id", segment.value);
      if (channel?.value) data.set("channel_id", channel.value);
      if (skip?.value) data.set("skip_recent_days", skip.value);
    }
    start(() => {
      void createCampaign(data);
    });
  }

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
        Nouvelle campagne
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/40" onClick={() => !pending && setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-title"
            className="relative z-10 flex max-h-[min(40rem,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">Campagne · {step + 1} / 3</p>
              <h2 id="campaign-title" className="mt-1 text-lg font-semibold text-slate-900">
                {step === 0 && "Quel email ?"}
                {step === 1 && "À qui, et comment ?"}
                {step === 2 && "Nommer la campagne"}
              </h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div hidden={step !== 0} className="grid gap-2 sm:grid-cols-2">
                {KINDS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setKind(item.id);
                      setName(item.title);
                    }}
                    className={`rounded-lg px-3 py-3 text-left ring-1 ${
                      kind === item.id ? `${item.tint} ring-current` : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 opacity-80">{item.blurb}</span>
                  </button>
                ))}
              </div>

              <div hidden={step !== 1} id="campaign-create-fields" className="space-y-4">
                <label className="block text-sm">
                  <span className="font-medium text-slate-900">Segment</span>
                  <select name="segment_id" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                    <option value="">Tous les contacts avec un email</option>
                    {segments.map((segment) => (
                      <option key={segment.id} value={segment.id}>
                        {segment.name}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs text-slate-500">
                    B2B, B2C, réponses de funnel : créez-les dans Segmentation.
                  </span>
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSendMode("personal")}
                    className={`rounded-lg px-3 py-3 text-left ring-1 ${
                      sendMode === "personal" ? "bg-orange-50 text-[#9a3412] ring-orange-200" : "ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm font-medium">Personnel</span>
                    <span className="mt-1 block text-xs leading-5 opacity-80">
                      Prénom, société, récap de leurs réponses dans chaque email.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendMode("group")}
                    className={`rounded-lg px-3 py-3 text-left ring-1 ${
                      sendMode === "group" ? "bg-violet-50 text-violet-900 ring-violet-200" : "ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm font-medium">Groupe</span>
                    <span className="mt-1 block text-xs leading-5 opacity-80">
                      Le même email à tout le segment, sans fusion individuelle.
                    </span>
                  </button>
                </div>
                <label className="block text-sm">
                  <span className="font-medium text-slate-900">Envoyer depuis</span>
                  <select name="channel_id" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                    <option value="">Adresse QuoteBuilder</option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.label} · {channel.address}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-slate-900">Ne pas relancer si contacté depuis (jours)</span>
                  <input
                    name="skip_recent_days"
                    type="number"
                    min={0}
                    defaultValue={30}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <div hidden={step !== 2}>
                <label className="block text-sm">
                  <span className="font-medium text-slate-900">Nom interne</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500 hover:text-slate-900">
                Annuler
              </button>
              <div className="flex gap-2">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep((s) => s - 1)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">
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
                    {pending ? "Création…" : "Ouvrir le builder"}
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
