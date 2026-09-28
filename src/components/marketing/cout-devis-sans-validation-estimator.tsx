"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  COUT_DEVIS_SANS_VALIDATION_DEFAULTS,
  COUT_DEVIS_SANS_VALIDATION_LABELS,
  computeCoutDevisSansValidation,
  type CoutDevisSansValidationAlertTone,
  type CoutDevisSansValidationTone,
} from "@/lib/marketing/cout-devis-sans-validation";

export function CoutDevisSansValidationEstimator() {
  const [devis, setDevis] = useState<number>(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.devis);
  const [sansValidPct, setSansValidPct] = useState<number>(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.sansValidPct);
  const [tauxErreur, setTauxErreur] = useState<number>(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.tauxErreur);
  const [minutes, setMinutes] = useState<number>(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.minutes);
  const [remisePct, setRemisePct] = useState<number>(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.remisePct);
  const [ecartMarge, setEcartMarge] = useState<number>(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.ecartMarge);
  const [panier, setPanier] = useState<number>(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.panier);
  const [taux, setTaux] = useState<number>(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.taux);
  const [ecartConvPts, setEcartConvPts] = useState<number>(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.ecartConvPts);
  const [recap, setRecap] = useState("");

  const result = useMemo(
    () =>
      computeCoutDevisSansValidation({
        devis,
        sansValidPct,
        tauxErreur,
        minutes,
        remisePct,
        ecartMarge,
        panier,
        taux,
        ecartConvPts,
      }),
    [devis, sansValidPct, tauxErreur, minutes, remisePct, ecartMarge, panier, taux, ecartConvPts],
  );

  useEffect(() => {
    setRecap(result.recap);
  }, [result.recap]);

  function reset() {
    setDevis(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.devis);
    setSansValidPct(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.sansValidPct);
    setTauxErreur(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.tauxErreur);
    setMinutes(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.minutes);
    setRemisePct(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.remisePct);
    setEcartMarge(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.ecartMarge);
    setPanier(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.panier);
    setTaux(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.taux);
    setEcartConvPts(COUT_DEVIS_SANS_VALIDATION_DEFAULTS.ecartConvPts);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et gate manquant</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_DEVIS_SANS_VALIDATION_LABELS.devis}
              value={devis}
              min={0}
              max={100000}
              step={1}
              onChange={setDevis}
            />
            <NumberField
              label={COUT_DEVIS_SANS_VALIDATION_LABELS.sansValidPct}
              hint="Devis partis avant gate commercial / technique / marge."
              value={sansValidPct}
              min={0}
              max={100}
              step={1}
              onChange={setSansValidPct}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_DEVIS_SANS_VALIDATION_LABELS.tauxErreur}
              hint="V2, erreurs, mentions manquantes, quantités."
              value={tauxErreur}
              min={0}
              max={100}
              step={1}
              onChange={setTauxErreur}
            />
            <NumberField
              label={COUT_DEVIS_SANS_VALIDATION_LABELS.minutes}
              hint="Refonte, mails, validation tardive, renvoi."
              value={minutes}
              min={0}
              max={480}
              step={1}
              onChange={setMinutes}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Marge, panier et conversion</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_DEVIS_SANS_VALIDATION_LABELS.remisePct}
              hint="Sur les devis sans validation."
              value={remisePct}
              min={0}
              max={100}
              step={1}
              onChange={setRemisePct}
            />
            <NumberField
              label={COUT_DEVIS_SANS_VALIDATION_LABELS.ecartMarge}
              hint="Ex. 4 points de marge perdus ou remise non validée."
              value={ecartMarge}
              min={0}
              max={50}
              step={0.5}
              onChange={setEcartMarge}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_DEVIS_SANS_VALIDATION_LABELS.panier}
              value={panier}
              min={0}
              step={1}
              onChange={setPanier}
            />
            <NumberField
              label={COUT_DEVIS_SANS_VALIDATION_LABELS.taux}
              value={taux}
              min={0}
              max={10000}
              step={1}
              onChange={setTaux}
            />
          </div>
          <div className="mt-4">
            <NumberField
              label={COUT_DEVIS_SANS_VALIDATION_LABELS.ecartConvPts}
              hint="Ex. +3 points quand le prospect reçoit une V1 propre plutôt qu’une V2 corrective."
              value={ecartConvPts}
              min={0}
              max={50}
              step={0.5}
              onChange={setEcartConvPts}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Laissez le panier à 0 pour ignorer les opportunités manquées et le coût marge en euros.
            L’écart de conversion (en points) estime les deals récupérés si la V1 part déjà relue.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-mk-accent ring-1 ring-mk-accent"
          >
            Réinitialiser
          </button>
        </fieldset>
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6" aria-live="polite">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">Résultat</p>
        <p className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${toneClass(result.totalTone)}`}>
          {result.totalLabel}
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">{COUT_DEVIS_SANS_VALIDATION_LABELS.total}</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label={COUT_DEVIS_SANS_VALIDATION_LABELS.aRisque} value={result.aRisqueLabel} />
          <Row label={COUT_DEVIS_SANS_VALIDATION_LABELS.corrections} value={result.correctionsLabel} />
          <Row label={COUT_DEVIS_SANS_VALIDATION_LABELS.heures} value={result.heuresLabel} />
          <Row label={COUT_DEVIS_SANS_VALIDATION_LABELS.coutFriction} value={result.coutFrictionLabel} tone="bad" />
          <Row label={COUT_DEVIS_SANS_VALIDATION_LABELS.coutMarge} value={result.coutMargeLabel} tone="warn" />
          <Row label={COUT_DEVIS_SANS_VALIDATION_LABELS.opp} value={result.oppLabel} tone={result.oppTone} />
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif pour une discussion d’équipe, pas une prévision financière. Aucune donnée
          n’est envoyée.
        </p>

        <label className="mt-6 block text-[12px] leading-5 text-mk-on-dark/50">
          Texte récap / checklist (modifiable avant copie)
          <textarea
            value={recap}
            onChange={(event) => setRecap(event.target.value)}
            className="mt-2 h-44 w-full resize-y rounded-xl bg-white/5 px-3 py-2 text-xs leading-5 text-mk-on-dark ring-1 ring-white/10"
          />
        </label>
        <div className="mt-3 flex justify-end">
          <CopyButton text={recap} label="Copier le récap" />
        </div>
      </div>
    </div>
  );
}

function toneClass(tone: CoutDevisSansValidationTone | "neutral") {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: CoutDevisSansValidationAlertTone) {
  if (tone === "ok") return "bg-emerald-400/15 text-emerald-200";
  if (tone === "warn") return "bg-amber-400/15 text-amber-100";
  if (tone === "bad") return "bg-rose-400/15 text-rose-200";
  return "bg-white/5 text-mk-on-dark/80";
}

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint?: string;
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
      {hint ? <span className="mt-1 block text-[12px] leading-5 text-mk-faint">{hint}</span> : null}
    </label>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: CoutDevisSansValidationTone | "neutral";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: CoutDevisSansValidationTone | "neutral") {
  if (tone === "bad") return "font-semibold text-rose-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  return "font-medium";
}
