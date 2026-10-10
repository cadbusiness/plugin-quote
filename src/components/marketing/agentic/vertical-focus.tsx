import Link from "next/link";
import {
  FIT_CRITERIA,
  LEAD_VERTICAL,
  NEIGHBOR_VERTICALS,
} from "@/lib/marketing/verticals";
import { Reveal, Spotlight } from "./motion";

export function VerticalFocus() {
  return (
    <div className="space-y-4">
      <Reveal>
        <div className="grid overflow-hidden rounded-3xl bg-mk-dark text-mk-on-dark ring-1 ring-black/5 lg:grid-cols-[1.1fr_1fr]">
          <div className="p-6 sm:p-10">
            <p className="inline-flex items-center gap-2 rounded-full bg-mk-accent/15 px-3 py-1 text-[12px] font-semibold text-[#ff9a5a]">
              {LEAD_VERTICAL.label}
            </p>
            <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {LEAD_VERTICAL.headline}
            </h3>
            <p className="mt-4 text-[15px] leading-7 text-white/65">{LEAD_VERTICAL.text}</p>
            <p className="mt-6 flex items-center gap-2 text-sm text-white/80">
              <span className="qb-live-dot h-2 w-2 rounded-full bg-emerald-400" />
              {LEAD_VERTICAL.proof}
            </p>
            <Link
              href={LEAD_VERTICAL.href}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-mk-accent-hover"
            >
              Voir le funnel rayonnage →
            </Link>
          </div>

          <div className="relative border-t border-white/10 p-6 sm:p-10 lg:border-l lg:border-t-0">
            <div aria-hidden className="qb-dark-grid pointer-events-none absolute inset-0" />
            <div className="relative rounded-2xl border border-white/10 bg-[#0f1218] p-4 shadow-[0_30px_80px_-40px_rgba(232,93,4,0.5)]">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
                Brief reçu
              </p>
              <dl className="mt-3 divide-y divide-white/[0.06]">
                {LEAD_VERTICAL.config.map((row) => (
                  <div
                    key={row.k}
                    className="flex items-center justify-between gap-4 py-2.5 text-[13.5px]"
                  >
                    <dt className="text-white/45">{row.k}</dt>
                    <dd className="text-right font-medium text-white/90">{row.v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/[0.04] p-3">
                <span className="rounded bg-rose-400/15 px-1.5 py-0.5 text-[11px] font-semibold text-rose-300">
                  {LEAD_VERTICAL.result.score}
                </span>
                <span className="text-[13px] text-white/70">Budget estimé</span>
                <span className="ml-auto font-semibold tabular-nums text-white">
                  {LEAD_VERTICAL.result.budget}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {NEIGHBOR_VERTICALS.map((v, i) => {
          const body = (
            <Spotlight className="h-full rounded-2xl bg-mk-surface ring-1 ring-mk-border transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-30px_rgba(11,13,18,0.35)]">
              <div className="relative flex h-full flex-col p-5">
                <h3 className="text-[15px] font-semibold tracking-tight">{v.label}</h3>
                <p className="mt-1.5 text-[13px] leading-5 text-mk-muted">{v.examples}</p>
                <p className="mt-4 border-t border-mk-border pt-3 text-[12px] leading-5 text-mk-faint">
                  {v.brief}
                </p>
                {v.href ? (
                  <span className="mt-3 text-[12px] font-semibold text-mk-accent">Voir le funnel →</span>
                ) : null}
              </div>
            </Spotlight>
          );
          return (
            <Reveal key={v.id} delay={i * 70}>
              {v.href ? (
                <Link href={v.href} className="block h-full">
                  {body}
                </Link>
              ) : (
                body
              )}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export function FitChecklist({ dark = false }: { dark?: boolean }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {FIT_CRITERIA.map((c) => (
        <li
          key={c}
          className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-[14px] leading-6 ring-1 ${
            dark
              ? "bg-white/[0.04] text-white/80 ring-white/10"
              : "bg-mk-surface text-mk-ink ring-mk-border"
          }`}
        >
          <span className="mt-0.5 text-mk-accent">✓</span>
          {c}
        </li>
      ))}
    </ul>
  );
}
