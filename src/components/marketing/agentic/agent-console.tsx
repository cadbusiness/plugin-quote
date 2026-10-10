"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./motion";

type Step =
  | { kind: "user"; text: string }
  | { kind: "agent"; text: string }
  | { kind: "tool"; name: string; arg?: string; result: string; via?: "mcp" }
  | { kind: "event"; text: string; tone: "hot" | "ok" | "plan" };

type Phase = { label: string; steps: Step[] };

const PHASES: Phase[] = [
  {
    label: "Qualifie",
    steps: [
      {
        kind: "user",
        text: "Il nous faut du rayonnage palettes, ~40 m linéaires, 800 kg par niveau.",
      },
      { kind: "tool", name: "search_catalog", arg: "palettes · 800 kg", result: "6 références" },
      { kind: "tool", name: "match_configurations", result: "2 configurations compatibles" },
      { kind: "agent", text: "Deux options tiennent la charge. Quelle hauteur sous plafond ?" },
      { kind: "user", text: "6 m. Livraison avant fin novembre." },
      { kind: "tool", name: "update_brief", result: "Budget 4,8–6,2 k€ · délai 7 sem." },
    ],
  },
  {
    label: "Dossier",
    steps: [
      { kind: "tool", name: "collect_contact", result: "Claire Martin · Atelier Nord" },
      { kind: "tool", name: "handoff_quote", result: "Dossier Q-1042 créé" },
      { kind: "event", tone: "hot", text: "Score Hot · 5 400 € · assigné à Thomas" },
    ],
  },
  {
    label: "Autopilote",
    steps: [
      { kind: "event", tone: "ok", text: "Confirmation envoyée au prospect · T+0" },
      { kind: "event", tone: "plan", text: "Rappel commercial si non traité · T+4 h" },
      { kind: "event", tone: "plan", text: "Relance programmée · J+3" },
    ],
  },
  {
    label: "Votre IA",
    steps: [
      { kind: "tool", via: "mcp", name: "get_pending_followups", result: "3 devis à relancer" },
      {
        kind: "tool",
        via: "mcp",
        name: "trigger_followup",
        arg: "Q-1042 · nudge_3d",
        result: "Relance envoyée",
      },
    ],
  },
];

const FLAT = PHASES.flatMap((p, phase) => p.steps.map((step) => ({ step, phase })));

function stepDuration(step: Step) {
  if (step.kind === "user") return 700 + step.text.length * 24;
  if (step.kind === "agent") return 600 + step.text.length * 14;
  if (step.kind === "tool") return 1300;
  return 1000;
}

const VISIBLE = 7;

export function AgentConsole() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(true);
  const [cursor, setCursor] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    const done = cursor >= FLAT.length;
    const ms = done ? 3200 : stepDuration(FLAT[cursor].step);
    const t = setTimeout(() => {
      if (done) {
        setCursor(0);
        setCycle((c) => c + 1);
      } else {
        setCursor((c) => c + 1);
      }
    }, ms);
    return () => clearTimeout(t);
  }, [cursor, reduced, visible]);

  const shownCount = reduced ? FLAT.length : Math.min(cursor + 1, FLAT.length);
  const activeIndex = reduced || cursor >= FLAT.length ? -1 : cursor;
  const currentPhase = reduced
    ? PHASES.length - 1
    : FLAT[Math.min(cursor, FLAT.length - 1)].phase;
  const items = FLAT.slice(0, shownCount).map((it, i) => ({ ...it, i }));
  const tail = items.slice(-VISIBLE);

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1218]/90 shadow-[0_40px_120px_-40px_rgba(232,93,4,0.45)] backdrop-blur"
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="qb-live-dot h-2 w-2 rounded-full bg-emerald-400" />
          <p className="text-[13px] font-semibold text-white">Agent devis</p>
          <span className="hidden text-[12px] text-white/40 sm:inline">· session en direct</span>
        </div>
        <p className="font-mono text-[11px] text-white/35">quickly / rayonnage</p>
      </div>

      <div className="grid grid-cols-4 gap-1 border-b border-white/10 px-3 py-2.5">
        {PHASES.map((p, i) => {
          const state = i < currentPhase ? "done" : i === currentPhase ? "active" : "todo";
          return (
            <div key={p.label} className="min-w-0">
              <p
                className={`truncate text-[11px] font-medium transition-colors duration-500 ${
                  state === "todo" ? "text-white/30" : "text-white/85"
                }`}
              >
                {p.label}
              </p>
              <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ${
                    i === PHASES.length - 1 ? "bg-sky-400" : "bg-mk-accent"
                  }`}
                  style={{ width: state === "todo" ? "0%" : state === "done" ? "100%" : "55%" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="flex h-[320px] flex-col justify-end gap-2.5 overflow-hidden px-4 py-4 sm:h-[400px]"
        aria-live="off"
      >
        {tail.map(({ step, i }) => (
          <Row key={`${cycle}-${i}`} step={step} active={i === activeIndex} />
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[92px] h-16 bg-gradient-to-b from-[#0f1218] to-transparent"
      />
    </div>
  );
}

function Row({ step, active }: { step: Step; active: boolean }) {
  if (step.kind === "user") {
    return (
      <div className="qb-step-in flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-white/[0.08] px-3.5 py-2 text-[13px] leading-5 text-white/90">
          <Typed text={step.text} active={active} speed={24} />
        </p>
      </div>
    );
  }
  if (step.kind === "agent") {
    return (
      <div className="qb-step-in flex gap-2">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-mk-accent text-[10px] font-bold text-white">
          QB
        </span>
        <p className="max-w-[85%] text-[13px] leading-5 text-white/80">
          <Typed text={step.text} active={active} speed={14} />
        </p>
      </div>
    );
  }
  if (step.kind === "tool") {
    const mcp = step.via === "mcp";
    return (
      <div className="qb-step-in flex items-center gap-2 font-mono text-[12px]">
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            mcp ? "bg-sky-400/15 text-sky-300" : "bg-mk-accent/15 text-[#ff9a5a]"
          }`}
        >
          {mcp ? "mcp" : "outil"}
        </span>
        <span className="truncate text-white/75">
          {step.name}
          {step.arg ? <span className="text-white/35">({step.arg})</span> : null}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-2">
          {active ? (
            <span className="qb-spin h-3 w-3 rounded-full border-[1.5px] border-white/20 border-t-white/80" />
          ) : (
            <>
              <span className="text-emerald-400">✓</span>
              <span className="hidden text-white/50 sm:inline">{step.result}</span>
            </>
          )}
        </span>
      </div>
    );
  }
  const tone =
    step.tone === "hot"
      ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
      : step.tone === "ok"
        ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
        : "border-white/10 bg-white/[0.04] text-white/70";
  return (
    <div className={`qb-step-in rounded-lg border px-3 py-2 text-[12.5px] ${tone}`}>
      {step.text}
    </div>
  );
}

function Typed({ text, active, speed }: { text: string; active: boolean; speed: number }) {
  // Remount when the row stops being active so it renders the full text.
  return active ? <TypedLive text={text} speed={speed} /> : <span>{text}</span>;
}

function TypedLive({ text, speed }: { text: string; speed: number }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span>
      {text.slice(0, n)}
      {n < text.length ? <span aria-hidden className="qb-caret" /> : null}
      <span className="invisible">{text.slice(n)}</span>
    </span>
  );
}
