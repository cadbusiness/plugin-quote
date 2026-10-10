"use client";

import { useEffect, useState } from "react";
import { useInView, usePrefersReducedMotion } from "./motion";

const CLIENTS = ["Claude", "ChatGPT", "Cursor", "Codex"] as const;

type Turn =
  | { kind: "user"; text: string }
  | { kind: "tool"; name: string; arg: string; result: string }
  | { kind: "table" }
  | { kind: "assistant"; text: string };

const SCRIPT: Turn[] = [
  { kind: "user", text: "Quels devis chauds attendent encore une relance ?" },
  { kind: "tool", name: "get_leads", arg: "score: hot · 7 jours", result: "5 demandes" },
  { kind: "tool", name: "get_pending_followups", arg: "", result: "3 à relancer" },
  { kind: "table" },
  { kind: "assistant", text: "Trois dossiers chauds sans réponse, 14 200 € au total. Je relance ?" },
  { kind: "user", text: "Oui, relance J+3 pour les trois." },
  { kind: "tool", name: "trigger_followup", arg: "×3 · nudge_3d", result: "3 relances envoyées" },
  { kind: "assistant", text: "C’est parti. Je vous préviens dès qu’un prospect répond." },
];

const ROWS = [
  { name: "Atelier Nord", amount: "5 400 €", age: "4 j" },
  { name: "LogiSpace", amount: "6 100 €", age: "3 j" },
  { name: "Hôtel Rivage", amount: "2 700 €", age: "5 j" },
];

const TURN_MS: Record<Turn["kind"], number> = {
  user: 1500,
  tool: 1250,
  table: 1100,
  assistant: 1900,
};

export function McpShowcase() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const reduced = usePrefersReducedMotion();
  const [client, setClient] = useState<(typeof CLIENTS)[number]>("Claude");
  const [cursor, setCursor] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!inView || reduced || cursor >= SCRIPT.length) return;
    const t = setTimeout(() => setCursor((c) => c + 1), TURN_MS[SCRIPT[cursor].kind]);
    return () => clearTimeout(t);
  }, [inView, reduced, cursor]);

  const shown = reduced ? SCRIPT.length : Math.min(cursor + 1, SCRIPT.length);
  const active = reduced || !inView || cursor >= SCRIPT.length ? -1 : cursor;
  const finished = reduced || cursor >= SCRIPT.length;

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1218] shadow-[0_40px_120px_-50px_rgba(56,189,248,0.45)]"
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-3 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <div className="flex gap-1" role="tablist" aria-label="Client IA">
          {CLIENTS.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={client === c}
              onClick={() => setClient(c)}
              className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
                client === c ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-sky-400/10 px-2 py-0.5 text-[11px] font-medium text-sky-300 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
          QuoteBuilder connecté
        </span>
      </div>

      <div className="flex min-h-[440px] flex-col gap-3 px-4 py-5 sm:px-5">
        {SCRIPT.slice(0, shown).map((turn, i) => (
          <TurnRow key={`${run}-${i}`} turn={turn} active={i === active} client={client} />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5">
        <p className="font-mono text-[11px] text-white/35">12 outils · OAuth 2.1 · Bearer qb_live_…</p>
        <button
          type="button"
          onClick={() => {
            setCursor(0);
            setRun((r) => r + 1);
          }}
          className={`text-[12px] font-medium text-white/60 transition hover:text-white ${
            finished ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          Rejouer ↺
        </button>
      </div>
    </div>
  );
}

function TurnRow({
  turn,
  active,
  client,
}: {
  turn: Turn;
  active: boolean;
  client: string;
}) {
  if (turn.kind === "user") {
    return (
      <div className="qb-step-in flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-white/[0.09] px-3.5 py-2 text-[13.5px] leading-5 text-white/90">
          {turn.text}
        </p>
      </div>
    );
  }
  if (turn.kind === "tool") {
    return (
      <div className="qb-step-in flex items-center gap-2 rounded-lg border border-sky-400/15 bg-sky-400/[0.05] px-3 py-2 font-mono text-[12px]">
        {active ? (
          <span className="qb-spin h-3 w-3 shrink-0 rounded-full border-[1.5px] border-sky-300/25 border-t-sky-300" />
        ) : (
          <span className="shrink-0 text-emerald-400">✓</span>
        )}
        <span className="truncate text-sky-200">
          quotebuilder.{turn.name}
          {turn.arg ? <span className="text-white/35"> ({turn.arg})</span> : null}
        </span>
        {!active ? (
          <span className="ml-auto hidden shrink-0 text-white/50 sm:inline">{turn.result}</span>
        ) : null}
      </div>
    );
  }
  if (turn.kind === "table") {
    return (
      <div className="qb-step-in overflow-hidden rounded-lg border border-white/10 text-[12.5px]">
        {ROWS.map((r, i) => (
          <div
            key={r.name}
            className={`flex items-center gap-3 px-3 py-2 ${i ? "border-t border-white/[0.06]" : ""}`}
            style={{ animation: `qb-cinema-row 420ms ${i * 110}ms cubic-bezier(0.22,1,0.36,1) both` }}
          >
            <span className="rounded bg-rose-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
              Hot
            </span>
            <span className="min-w-0 truncate text-white/85">{r.name}</span>
            <span className="ml-auto shrink-0 tabular-nums text-white/70">{r.amount}</span>
            <span className="w-10 shrink-0 text-right text-white/35">{r.age}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="qb-step-in flex gap-2.5">
      <span className="mt-0.5 flex h-6 shrink-0 items-center rounded-md bg-white/10 px-1.5 text-[10px] font-semibold text-white/80">
        {client}
      </span>
      <p className="text-[13.5px] leading-5 text-white/80">{turn.text}</p>
    </div>
  );
}
