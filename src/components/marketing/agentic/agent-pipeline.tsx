"use client";

import { useEffect, useState } from "react";
import { Reveal, Spotlight, usePrefersReducedMotion } from "./motion";

const STAGES = [
  {
    n: "01",
    title: "Qualifier",
    text: "Le prospect parle de son besoin. L’agent cherche dans votre catalogue, compare, pose la question qui manque.",
    chips: ["search_catalog", "match_configurations", "update_brief"],
    ticker: [
      "Cherche « palettes 800 kg »…",
      "Compare 2 configurations…",
      "Demande la hauteur sous plafond…",
    ],
  },
  {
    n: "02",
    title: "Monter le dossier",
    text: "Produits, budget, délai, contact. Le dossier arrive scoré et assigné. Vous rappelez pour conclure.",
    chips: ["collect_contact", "handoff_quote", "score hot / warm / cold"],
    ticker: ["Budget estimé 4,8–6,2 k€…", "Score : Hot…", "Assigné à Thomas…"],
  },
  {
    n: "03",
    title: "Relancer",
    text: "Confirmation tout de suite, rappel si personne ne traite, relances jusqu’à la réponse.",
    chips: ["T+0", "T+4 h", "J+3", "J+30"],
    ticker: ["Confirmation envoyée…", "Rappel commercial à 14 h…", "Relance J+3 programmée…"],
  },
] as const;

export function AgentPipeline() {
  return (
    <div className="relative">
      <svg
        aria-hidden
        className="pointer-events-none absolute left-[16%] right-[16%] top-[42px] hidden h-2 w-[68%] md:block"
        preserveAspectRatio="none"
        viewBox="0 0 100 2"
      >
        <line x1="0" y1="1" x2="100" y2="1" stroke="var(--color-mk-border)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <line
          className="qb-beam"
          x1="0"
          y1="1"
          x2="100"
          y2="1"
          stroke="var(--color-mk-accent)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="grid gap-4 md:grid-cols-3">
        {STAGES.map((s, i) => (
          <Reveal key={s.n} delay={i * 120}>
            <Spotlight className="h-full rounded-2xl bg-mk-surface ring-1 ring-mk-border transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-34px_rgba(11,13,18,0.35)]">
              <div className="relative p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-mk-dark font-mono text-[13px] font-semibold text-white">
                    {s.n}
                    <span className="qb-live-dot absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-mk-surface bg-emerald-400" />
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
                </div>
                <p className="mt-4 text-[15px] leading-7 text-mk-muted">{s.text}</p>
                <Ticker lines={s.ticker} offset={i * 700} />
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.chips.map((c) => (
                    <span
                      key={c}
                      className="rounded-md bg-mk-band px-2 py-1 font-mono text-[11px] text-mk-muted ring-1 ring-mk-border"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </Spotlight>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function Ticker({ lines, offset }: { lines: readonly string[]; offset: number }) {
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let id: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      id = setInterval(() => setI((v) => (v + 1) % lines.length), 2400);
    }, offset);
    return () => {
      clearTimeout(start);
      if (id) clearInterval(id);
    };
  }, [lines.length, offset, reduced]);

  return (
    <div className="mt-5 flex h-9 items-center gap-2 overflow-hidden rounded-lg bg-mk-dark px-3 font-mono text-[12px] text-white/80">
      <span className="text-mk-accent">›</span>
      <span key={i} className="qb-step-in truncate">
        {lines[i]}
      </span>
    </div>
  );
}
