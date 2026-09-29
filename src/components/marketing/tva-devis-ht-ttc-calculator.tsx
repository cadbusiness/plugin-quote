"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  TVA_DEVIS_DEFAULTS,
  TVA_DEVIS_LABELS,
  TVA_LINE_RATE_PRESETS,
  TVA_RATE_PRESETS,
  computeTvaDevisHtTtc,
  resolveTvaRatePct,
  type TvaAlertTone,
  type TvaDevisLine,
  type TvaDevisMode,
} from "@/lib/marketing/tva-devis-ht-ttc";

function money(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function pct(value: number) {
  return (
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(Number.isFinite(value) ? value : 0) + " %"
  );
}

export function TvaDevisHtTtcCalculator() {
  const [mode, setMode] = useState<TvaDevisMode>(TVA_DEVIS_DEFAULTS.mode);
  const [montant, setMontant] = useState(TVA_DEVIS_DEFAULTS.montant);
  const [preset, setPreset] = useState<string>(TVA_DEVIS_DEFAULTS.ratePreset);
  const [customRate, setCustomRate] = useState(TVA_DEVIS_DEFAULTS.customRate);
  const [lines, setLines] = useState<TvaDevisLine[]>(TVA_DEVIS_DEFAULTS.lines);

  const result = useMemo(
    () =>
      computeTvaDevisHtTtc({
        mode,
        montant,
        ratePct: resolveTvaRatePct(preset, customRate),
        lines,
      }),
    [mode, montant, preset, customRate, lines],
  );

  function updateLine(index: number, patch: Partial<TvaDevisLine>) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Mode de calcul</legend>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Mode">
            <ModeChip checked={mode === "ht"} onSelect={() => setMode("ht")} label={TVA_DEVIS_LABELS.modes.ht} />
            <ModeChip checked={mode === "ttc"} onSelect={() => setMode("ttc")} label={TVA_DEVIS_LABELS.modes.ttc} />
            <ModeChip
              checked={mode === "lines"}
              onSelect={() => setMode("lines")}
              label={TVA_DEVIS_LABELS.modes.lines}
            />
          </div>

          {mode === "lines" ? (
            <div className="mt-5 space-y-4">
              <p className="text-[12px] leading-5 text-mk-faint">{TVA_DEVIS_LABELS.linesHint}</p>
              {lines.map((line, index) => (
                <div key={index} className="border-t border-mk-border pt-4 first:border-t-0 first:pt-0">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-mk-faint">
                    Ligne {index + 1}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_0.9fr_0.9fr]">
                    <NumberField
                      label={TVA_DEVIS_LABELS.lineHt}
                      value={line.ht}
                      min={0}
                      step={0.01}
                      onChange={(ht) => updateLine(index, { ht })}
                    />
                    <label className="block">
                      <span className="text-sm font-semibold">{TVA_DEVIS_LABELS.lineRate}</span>
                      <select
                        value={String(line.ratePct)}
                        onChange={(event) => updateLine(index, { ratePct: Number.parseFloat(event.target.value) })}
                        className="mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40"
                      >
                        {TVA_LINE_RATE_PRESETS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold">{TVA_DEVIS_LABELS.lineTtc}</span>
                      <input
                        readOnly
                        value={result.lineTtc[index] == null ? "" : result.lineTtc[index].toFixed(2)}
                        className="mt-2 w-full rounded-xl bg-mk-band px-3 py-2.5 text-sm text-mk-muted ring-1 ring-mk-border"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <NumberField
                label={mode === "ttc" ? TVA_DEVIS_LABELS.montantTtc : TVA_DEVIS_LABELS.montantHt}
                value={montant}
                min={0}
                step={0.01}
                onChange={setMontant}
              />
              <label className="block">
                <span className="text-sm font-semibold">{TVA_DEVIS_LABELS.rate}</span>
                <select
                  value={preset}
                  onChange={(event) => setPreset(event.target.value)}
                  className="mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40"
                >
                  {TVA_RATE_PRESETS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {preset === "custom" ? (
                <div className="sm:col-span-2">
                  <NumberField
                    label={TVA_DEVIS_LABELS.customRate}
                    value={customRate}
                    min={0}
                    max={100}
                    step={0.1}
                    onChange={setCustomRate}
                  />
                  <p className="mt-2 text-[12px] leading-5 text-mk-faint">{TVA_DEVIS_LABELS.customHint}</p>
                </div>
              ) : null}
            </div>
          )}
        </fieldset>
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6" aria-live="polite">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">Résultat</p>
        <dl className="mt-4 space-y-4 text-sm">
          <Metric label={TVA_DEVIS_LABELS.totalHt} value={money(result.ht)} />
          <div className="border-t border-white/10 pt-4">
            <Metric label={TVA_DEVIS_LABELS.totalTva} value={money(result.tva)} />
            {result.showBreakdown ? (
              <ul className="mt-3 space-y-1.5 text-[13px] text-mk-on-dark/65">
                {result.breakdown.map((row) => (
                  <li key={row.ratePct} className="flex items-center justify-between gap-4 tabular-nums">
                    <span>TVA {pct(row.ratePct)}</span>
                    <span>{money(row.tva)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="border-t border-white/10 pt-4">
            <Metric label={TVA_DEVIS_LABELS.totalTtc} value={money(result.ttc)} />
          </div>
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">{TVA_DEVIS_LABELS.disclaimer}</p>

        <Link
          href="/signup?plan=free"
          className="mt-5 inline-flex rounded-full bg-mk-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover"
        >
          Essayer QuoteBuilder gratuitement
        </Link>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/55">
          Le compte sert à partager un dossier (lien, espace prospect, relecteurs, PDF). Ce calcul reste dans le navigateur.
        </p>
        <p className="mt-4 text-sm leading-6 text-mk-on-dark/70">
          Voir aussi :{" "}
          <Link href="/blog/tva-ht-ttc-devis-b2b-france" className="font-medium text-mk-accent hover:underline">
            HT, TTC et TVA sur un devis B2B
          </Link>
          {" · "}
          <Link href="/blog/mentions-obligatoires-devis-france" className="font-medium text-mk-accent hover:underline">
            mentions obligatoires
          </Link>
          {" · "}
          <Link href="/outils/checklist-mentions-devis-france" className="font-medium text-mk-accent hover:underline">
            checklist mentions
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent hover:underline">
            démo rayonnage
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-mk-on-dark/60">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-mk-accent tabular-nums sm:text-4xl">{value}</dd>
    </div>
  );
}

function alertClass(tone: TvaAlertTone) {
  if (tone === "ok") return "bg-emerald-400/15 text-emerald-200";
  if (tone === "warn") return "bg-amber-400/15 text-amber-100";
  return "bg-white/5 text-mk-on-dark/80";
}

function ModeChip({
  checked,
  onSelect,
  label,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
        checked ? "bg-mk-accent text-white ring-mk-accent" : "bg-mk-bg text-mk-ink ring-mk-border"
      }`}
    >
      <input type="radio" name="tva-mode" checked={checked} onChange={onSelect} className="sr-only" />
      {label}
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max?: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40"
      />
    </label>
  );
}
