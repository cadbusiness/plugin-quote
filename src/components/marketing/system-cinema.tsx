"use client";

import { useEffect, useRef, useState } from "react";

const SCENES = [
  {
    id: "offer",
    label: "1. Offre",
    title: "Votre catalogue",
    caption: "Produits réels, prix, gammes. Le socle.",
  },
  {
    id: "funnel",
    label: "2. Funnel",
    title: "Ils configurent",
    caption: "Parcours guidé sur votre offre. Dossier, pas un mail.",
  },
  {
    id: "dossier",
    label: "3. Dossier",
    title: "Vous recevez",
    caption: "Score, brief, budget. Prêt à conclure.",
  },
  {
    id: "autopilot",
    label: "4. Autopilote",
    title: "Ça avance seul",
    caption: "Confirmation, relances, rappel si non traité.",
  },
] as const;

type SceneId = (typeof SCENES)[number]["id"];

const SCENE_MS = 3200;

const PRODUCTS = [
  { name: "Rayonnage mi-lourd", meta: "400–800 kg", price: "420–680 €" },
  { name: "Cantilever simple", meta: "Longs · extérieur", price: "890–1 400 €" },
  { name: "Échelle palette", meta: "4 niveaux", price: "610–940 €", highlight: true },
];

const FUNNEL_OPTIONS = ["Palettes · allées", "Charges longues", "Mi-lourd 3–5 niveaux"];

const AUTOPILOT = [
  { label: "Confirmation prospect", when: "T+0", tone: "done" as const },
  { label: "Notif commercial", when: "T+0", tone: "done" as const },
  { label: "Rappel si non traité", when: "T+4 h", tone: "plan" as const },
  { label: "Relance nurturing", when: "T+3 j", tone: "wait" as const },
];

function Frame({
  url,
  dark,
  children,
}: {
  url: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl shadow-[0_28px_70px_-32px_rgba(60,30,8,0.55)] ring-1 ${
        dark ? "bg-slate-950 ring-white/10" : "bg-white ring-black/10"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-2 ${
          dark ? "bg-slate-900/80" : "border-b border-slate-200 bg-slate-50"
        }`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#E8B4A2]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#F3D09A]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#C9D4C0]" />
        <span
          className={`ml-2 truncate rounded-md px-2 py-0.5 text-[11px] ${
            dark ? "bg-white/10 text-white/65" : "bg-white text-slate-500 ring-1 ring-slate-200"
          }`}
        >
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

export function SystemCinema() {
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [funnelPick, setFunnelPick] = useState(0);
  const [autoLit, setAutoLit] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !reducedRef.current) setPlaying(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || reducedRef.current) return;
    const id = window.setInterval(() => {
      if (!visibleRef.current) return;
      setScene((s) => (s + 1) % SCENES.length);
    }, SCENE_MS);
    return () => window.clearInterval(id);
  }, [playing]);

  useEffect(() => {
    const id = SCENES[scene].id;
    if (id === "funnel") {
      setFunnelPick(0);
      const t1 = window.setTimeout(() => setFunnelPick(1), 700);
      const t2 = window.setTimeout(() => setFunnelPick(2), 1500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    if (id === "autopilot") {
      setAutoLit(0);
      const timers = [0, 1, 2, 3].map((i) =>
        window.setTimeout(() => setAutoLit(i + 1), 400 + i * 550),
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [scene]);

  const current = SCENES[scene];

  return (
    <div ref={rootRef} className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {SCENES.map((item, i) => {
            const on = i === scene;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setScene(i);
                  setPlaying(false);
                }}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  on
                    ? "bg-[#1A1510] text-white shadow-sm"
                    : "bg-white/80 text-[#1A1510]/65 ring-1 ring-black/10 hover:bg-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="text-sm font-medium text-[#1A1510]/55 underline-offset-4 hover:text-[#1A1510] hover:underline"
        >
          {playing ? "Pause" : "Rejouer"}
        </button>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-[28px] bg-gradient-to-b from-[#1A1510] to-[#2A2218] p-4 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#E85D04]/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 bottom-0 h-48 w-48 rounded-full bg-[#F3B184]/20 blur-3xl"
        />

        <div className="relative mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#F3B184]">
              Dans le produit
            </p>
            <h3 className="mt-1 text-xl font-semibold text-[#F6F0E8] sm:text-2xl">{current.title}</h3>
            <p className="mt-1 text-sm text-[#F6F0E8]/65">{current.caption}</p>
          </div>
          <p className="shrink-0 tabular-nums text-xs text-[#F6F0E8]/40">
            {scene + 1}/{SCENES.length}
          </p>
        </div>

        <div className="relative mb-4 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            key={`${scene}-${playing}`}
            className="h-full w-full origin-left rounded-full bg-[#E85D04] qb-cinema-bar"
            style={{
              animationDuration: playing ? `${SCENE_MS}ms` : "0ms",
              animationPlayState: playing ? "running" : "paused",
            }}
          />
        </div>

        <div className="relative min-h-[340px] sm:min-h-[380px]">
          {SCENES.map((item, i) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-all duration-500 ease-out ${
                i === scene
                  ? "z-10 translate-y-0 opacity-100"
                  : "pointer-events-none z-0 translate-y-3 opacity-0"
              }`}
              aria-hidden={i !== scene}
            >
              <ScenePanel
                id={item.id}
                funnelPick={funnelPick}
                autoLit={autoLit}
                active={i === scene}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScenePanel({
  id,
  funnelPick,
  autoLit,
  active,
}: {
  id: SceneId;
  funnelPick: number;
  autoLit: number;
  active: boolean;
}) {
  if (id === "offer") {
    return (
      <Frame url="app.quotebuilder / produits">
        <div className="border-b border-slate-200 px-4 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-700">Catalogue</p>
          <p className="text-sm font-medium text-slate-900">Ce que vous livrez vraiment</p>
        </div>
        <ul className="divide-y divide-slate-100 text-sm">
          {PRODUCTS.map((p, i) => (
            <li
              key={p.name}
              className={`flex items-start justify-between gap-3 px-4 py-3 ${
                active ? "qb-cinema-row" : ""
              } ${p.highlight ? "bg-amber-50/80" : ""}`}
              style={{ animationDelay: active ? `${120 + i * 140}ms` : "0ms" }}
            >
              <div>
                <p className="font-medium text-slate-900">{p.name}</p>
                <p className="text-slate-500">{p.meta}</p>
              </div>
              <p className="shrink-0 text-slate-500">{p.price}</p>
            </li>
          ))}
        </ul>
      </Frame>
    );
  }

  if (id === "funnel") {
    return (
      <Frame url="votre-site.com / devis" dark>
        <div className="bg-slate-950 px-4 pb-3 text-white">
          <p className="text-[11px] uppercase tracking-[0.16em] text-amber-400">Funnel</p>
          <p className="text-sm font-medium">De quoi avez-vous besoin ?</p>
          <div className="mt-3 flex gap-1.5">
            <div className="h-1 flex-1 rounded-full bg-amber-500" />
            <div className="h-1 flex-1 rounded-full bg-amber-500" />
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
              <div
                className={`h-1 rounded-full bg-amber-500 transition-all duration-700 ${
                  funnelPick >= 2 ? "w-full" : funnelPick >= 1 ? "w-1/2" : "w-0"
                }`}
              />
            </div>
            <div className="h-1 flex-1 rounded-full bg-white/20" />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Étape 2 / 4 · Type de projet</p>
        </div>
        <div className="bg-white p-4">
          <div className="grid gap-2">
            {FUNNEL_OPTIONS.map((label, i) => {
              const on = i === funnelPick;
              return (
                <div
                  key={label}
                  className={`rounded-xl border px-3 py-2.5 text-sm transition-all duration-300 ${
                    on
                      ? "scale-[1.02] border-slate-900 bg-slate-50 font-medium shadow-sm"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {label}
                </div>
              );
            })}
          </div>
          <div
            className={`mt-4 overflow-hidden rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 transition-all duration-500 ${
              funnelPick >= 2 ? "max-h-20 opacity-100" : "max-h-0 py-0 opacity-0"
            }`}
          >
            Brief : mi-lourd · 14 travées · budget 18–24 k€
          </div>
        </div>
      </Frame>
    );
  }

  if (id === "dossier") {
    return (
      <Frame url="app.quotebuilder / devis">
        <div className="border-b border-slate-200 px-4 py-2.5">
          <p className="text-sm font-medium text-slate-900">Dossier · Atelier Nord</p>
        </div>
        <div className={`grid gap-0 text-sm sm:grid-cols-2 ${active ? "qb-cinema-pop" : ""}`}>
          <div className="space-y-2 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Prospect</p>
            <p className="font-medium text-slate-900">Claire Martin</p>
            <p className="text-slate-500">Atelier Nord</p>
            <div className="flex gap-2 pt-1">
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 qb-cinema-pulse">
                Hot
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                Nouveau
              </span>
            </div>
          </div>
          <div className="space-y-1.5 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:border-l sm:border-t-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Brief</p>
            <p>Surface 1 200 m²</p>
            <p>Rayonnage mi-lourd · 14 travées</p>
            <p>Charge 800 kg / niveau</p>
            <p>Délai 6 semaines</p>
            <p className="font-medium text-slate-900">18 – 24 k€ indicatif</p>
          </div>
        </div>
      </Frame>
    );
  }

  return (
    <Frame url="app.quotebuilder / automations">
      <div className="border-b border-slate-200 px-4 py-2.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-700">Autopilote</p>
        <p className="text-sm font-medium text-slate-900">Parcours · demande reçue</p>
      </div>
      <ul className="divide-y divide-slate-100 text-sm">
        {AUTOPILOT.map((step, i) => {
          const lit = i < autoLit;
          return (
            <li
              key={step.label}
              className={`flex items-center justify-between gap-3 px-4 py-3 transition-all duration-300 ${
                lit ? "bg-emerald-50/40" : "opacity-45"
              }`}
            >
              <div>
                <p className="font-medium text-slate-900">{step.label}</p>
                <p className="text-slate-500">{step.when}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium transition ${
                  !lit
                    ? "bg-slate-100 text-slate-400"
                    : step.tone === "done"
                      ? "bg-emerald-50 text-emerald-800"
                      : step.tone === "plan"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                }`}
              >
                {lit
                  ? step.tone === "done"
                    ? "Fait"
                    : step.tone === "plan"
                      ? "Planifié"
                      : "En attente"
                  : "…"}
              </span>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}
