"use client";

import { useEffect, useRef, useState } from "react";

const ROWS = [
  {
    name: "Claire Martin",
    company: "Atelier Nord",
    product: "Rayonnage mi-lourd · 14 travées",
    score: "Hot",
    status: "Nouveau",
    focus: true,
  },
  {
    name: "Thomas Berger",
    company: "LogiSpace",
    product: "Cantilever simple",
    score: "Warm",
    status: "Contacté",
    focus: false,
  },
  {
    name: "Léa Moreau",
    company: "Hôtel Rivage",
    product: "Échelle palette × 8",
    score: "Hot",
    status: "En cours",
    focus: false,
  },
];

const STEPS = [
  { label: "Confirmation envoyée", when: "T+0", kind: "done" as const },
  { label: "Commercial notifié", when: "T+0", kind: "done" as const },
  { label: "Rappel si non traité", when: "T+4 h", kind: "plan" as const },
  { label: "Relance prospect", when: "T+3 j", kind: "wait" as const },
];

const CYCLE_MS = 4500;

export function AutopilotStage() {
  const [lit, setLit] = useState(0);
  const [status, setStatus] = useState("Nouveau");
  const [playing, setPlaying] = useState(true);
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
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || reducedRef.current) return;
    let cancelled = false;
    const timers: number[] = [];

    function clearTimers() {
      while (timers.length) clearTimeout(timers.pop());
    }

    function schedule(fn: () => void, ms: number) {
      timers.push(window.setTimeout(fn, ms));
    }

    function runCycle() {
      if (cancelled) return;
      if (!visibleRef.current) {
        schedule(runCycle, 700);
        return;
      }
      setLit(0);
      setStatus("Nouveau");
      schedule(() => setLit(1), 400);
      schedule(() => setLit(2), 1000);
      schedule(() => {
        setLit(3);
        setStatus("Contacté");
      }, 1800);
      schedule(() => setLit(4), 2600);
      schedule(runCycle, CYCLE_MS);
    }

    runCycle();
    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [playing]);

  return (
    <div ref={rootRef} className="mt-0">
      <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div>
          <p className="text-sm font-medium text-mk-accent">Après la soumission</p>
          <h2 className="mt-2 max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
            Les devis avancent tout seuls.
          </h2>
          <p className="mt-4 max-w-md text-[16px] leading-7 text-mk-on-dark/75 sm:text-[17px] sm:leading-8">
            Les formulaires s’arrêtent là. QuoteBuilder enchaîne score, assignation et relances.
            Les touches que 92 % des équipes n’atteignent jamais.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-mk-on-dark/70">
            <li className="flex gap-2">
              <span className="text-mk-accent">▸</span>
              Pipeline + score Hot / Warm / Cold
            </li>
            <li className="flex gap-2">
              <span className="text-mk-accent">▸</span>
              Assignation et notifications
            </li>
            <li className="flex gap-2">
              <span className="text-mk-accent">▸</span>
              Workflows T+0, T+4 h, T+3 j
            </li>
          </ul>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="mt-6 text-sm font-medium text-mk-on-dark/50 underline-offset-4 hover:text-mk-on-dark hover:underline"
          >
            {playing ? "Pause" : "Rejouer"}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_28px_70px_-32px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E8B4A2]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#F3D09A]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#C9D4C0]" />
            <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
              app.quotebuilder / devis
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="border-b border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900">
                Demandes
              </div>
              <ul className="divide-y divide-slate-100 text-sm">
                {ROWS.map((row) => {
                  const focus = row.focus;
                  const liveStatus = focus ? status : row.status;
                  return (
                    <li
                      key={row.name}
                      className={`px-4 py-3 transition-colors duration-500 ${
                        focus && lit > 0 ? "bg-amber-50/90" : "bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{row.name}</p>
                          <p className="truncate text-slate-500">{row.company}</p>
                          <p className="mt-0.5 truncate text-[12px] text-slate-400">{row.product}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              row.score === "Hot"
                                ? "bg-rose-50 text-rose-800"
                                : "bg-amber-50 text-amber-800"
                            } ${focus && lit > 0 ? "qb-cinema-pulse" : ""}`}
                          >
                            {row.score}
                          </span>
                          <p className="mt-1 text-[11px] text-slate-500">{liveStatus}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 lg:border-l lg:border-t-0">
              <div className="border-b border-slate-200 px-4 py-2.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-700">
                  Autopilote
                </p>
                <p className="text-sm font-medium text-slate-900">Claire · Atelier Nord</p>
              </div>
              <ul className="divide-y divide-slate-200/80 text-sm">
                {STEPS.map((step, i) => {
                  const on = i < lit;
                  return (
                    <li
                      key={step.label}
                      className={`flex items-center justify-between gap-2 px-4 py-3 transition-all duration-300 ${
                        on ? "bg-white" : "opacity-40"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-900">{step.label}</p>
                        <p className="text-[12px] text-slate-500">{step.when}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          !on
                            ? "bg-slate-200/70 text-slate-400"
                            : step.kind === "done"
                              ? "bg-emerald-50 text-emerald-800"
                              : step.kind === "plan"
                                ? "bg-amber-50 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {!on
                          ? "…"
                          : step.kind === "done"
                            ? "Fait"
                            : step.kind === "plan"
                              ? "Planifié"
                              : "En file"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
