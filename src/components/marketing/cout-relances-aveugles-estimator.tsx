"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  COUT_RELANCES_AVEUGLES_DEFAULTS,
  COUT_RELANCES_AVEUGLES_LABELS,
  computeCoutRelancesAveugles,
  type CoutRelancesAveuglesAlertTone,
  type CoutRelancesAveuglesTone,
} from "@/lib/marketing/cout-relances-aveugles";

export function CoutRelancesAveuglesEstimator() {
  const [devis, setDevis] = useState<number>(COUT_RELANCES_AVEUGLES_DEFAULTS.devis);
  const [sansSignalPct, setSansSignalPct] = useState<number>(COUT_RELANCES_AVEUGLES_DEFAULTS.sansSignalPct);
  const [relancesParDevis, setRelancesParDevis] = useState<number>(
    COUT_RELANCES_AVEUGLES_DEFAULTS.relancesParDevis,
  );
  const [minutes, setMinutes] = useState<number>(COUT_RELANCES_AVEUGLES_DEFAULTS.minutes);
  const [taux, setTaux] = useState<number>(COUT_RELANCES_AVEUGLES_DEFAULTS.taux);
  const [nuirePct, setNuirePct] = useState<number>(COUT_RELANCES_AVEUGLES_DEFAULTS.nuirePct);
  const [panier, setPanier] = useState<number>(COUT_RELANCES_AVEUGLES_DEFAULTS.panier);
  const [ecartConvPts, setEcartConvPts] = useState<number>(COUT_RELANCES_AVEUGLES_DEFAULTS.ecartConvPts);
  const [recap, setRecap] = useState("");

  const result = useMemo(
    () =>
      computeCoutRelancesAveugles({
        devis,
        sansSignalPct,
        relancesParDevis,
        minutes,
        taux,
        nuirePct,
        panier,
        ecartConvPts,
      }),
    [devis, sansSignalPct, relancesParDevis, minutes, taux, nuirePct, panier, ecartConvPts],
  );

  useEffect(() => {
    setRecap(result.recap);
  }, [result.recap]);

  function reset() {
    setDevis(COUT_RELANCES_AVEUGLES_DEFAULTS.devis);
    setSansSignalPct(COUT_RELANCES_AVEUGLES_DEFAULTS.sansSignalPct);
    setRelancesParDevis(COUT_RELANCES_AVEUGLES_DEFAULTS.relancesParDevis);
    setMinutes(COUT_RELANCES_AVEUGLES_DEFAULTS.minutes);
    setTaux(COUT_RELANCES_AVEUGLES_DEFAULTS.taux);
    setNuirePct(COUT_RELANCES_AVEUGLES_DEFAULTS.nuirePct);
    setPanier(COUT_RELANCES_AVEUGLES_DEFAULTS.panier);
    setEcartConvPts(COUT_RELANCES_AVEUGLES_DEFAULTS.ecartConvPts);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et absence de signal</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_RELANCES_AVEUGLES_LABELS.devis}
              value={devis}
              min={0}
              max={100000}
              step={1}
              onChange={setDevis}
            />
            <NumberField
              label={COUT_RELANCES_AVEUGLES_LABELS.sansSignalPct}
              hint="Part relancée sans regarder la dernière consultation, le statut des relecteurs, ni une validation ou une demande de modifications."
              value={sansSignalPct}
              min={0}
              max={100}
              step={1}
              onChange={setSansSignalPct}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_RELANCES_AVEUGLES_LABELS.relancesParDevis}
              hint="Mails ou appels envoyés sans ouvrir la fiche."
              value={relancesParDevis}
              min={0}
              max={50}
              step={0.5}
              onChange={setRelancesParDevis}
            />
            <NumberField
              label={COUT_RELANCES_AVEUGLES_LABELS.minutes}
              hint="Rédaction, appel, note CRM, relance manager."
              value={minutes}
              min={0}
              max={480}
              step={1}
              onChange={setMinutes}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Coût temps, timing et conversion</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_RELANCES_AVEUGLES_LABELS.taux}
              value={taux}
              min={0}
              max={10000}
              step={1}
              onChange={setTaux}
            />
            <NumberField
              label={COUT_RELANCES_AVEUGLES_LABELS.nuirePct}
              hint="Trop tôt ou trop tard, faute d’avoir regardé la fiche."
              value={nuirePct}
              min={0}
              max={100}
              step={1}
              onChange={setNuirePct}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_RELANCES_AVEUGLES_LABELS.panier}
              value={panier}
              min={0}
              step={1}
              onChange={setPanier}
            />
            <NumberField
              label={COUT_RELANCES_AVEUGLES_LABELS.ecartConvPts}
              hint="Ex. +4 points en appelant d’abord un dossier consulté récemment, validé, ou avec une demande de modifications."
              value={ecartConvPts}
              min={0}
              max={50}
              step={0.5}
              onChange={setEcartConvPts}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Laissez le panier à 0 pour ignorer les opportunités mal priorisées et l’impact timing en
            euros. L’écart de conversion (en points) estime les dossiers mieux priorisés si ceux qui
            ont un signal (consultation récente, validation, demande de modifications) passent devant.
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
        <p className="mt-2 text-sm text-mk-on-dark/60">{COUT_RELANCES_AVEUGLES_LABELS.total}</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label={COUT_RELANCES_AVEUGLES_LABELS.aveugles} value={result.aveuglesLabel} />
          <Row label={COUT_RELANCES_AVEUGLES_LABELS.relancesMois} value={result.relancesMoisLabel} />
          <Row label={COUT_RELANCES_AVEUGLES_LABELS.heures} value={result.heuresLabel} />
          <Row label={COUT_RELANCES_AVEUGLES_LABELS.coutTemps} value={result.coutTempsLabel} tone="bad" />
          <Row label={COUT_RELANCES_AVEUGLES_LABELS.opp} value={result.oppLabel} tone="warn" />
          <Row
            label={COUT_RELANCES_AVEUGLES_LABELS.coutNuire}
            value={result.coutNuireLabel}
            tone={result.nuireTone}
          />
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif pour une discussion d’équipe, pas une prévision financière. Aucune donnée
          n’est envoyée. Le pourcentage saisi n’est pas un taux de mails ouverts.
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

function toneClass(tone: CoutRelancesAveuglesTone | "neutral") {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: CoutRelancesAveuglesAlertTone) {
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
  tone?: CoutRelancesAveuglesTone | "neutral";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: CoutRelancesAveuglesTone | "neutral") {
  if (tone === "bad") return "font-semibold text-rose-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  if (tone === "ok") return "font-semibold text-emerald-300";
  return "font-medium";
}
