"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  COUT_DEMANDES_ORALES_DEFAULTS,
  COUT_DEMANDES_ORALES_LABELS,
  computeCoutDemandesOrales,
  type CoutDemandesOralesAlertTone,
  type CoutDemandesOralesTone,
} from "@/lib/marketing/cout-demandes-orales-non-capturees";

export function CoutDemandesOralesNonCaptureesEstimator() {
  const [orales, setOrales] = useState<number>(COUT_DEMANDES_ORALES_DEFAULTS.orales);
  const [pctNonCapturees, setPctNonCapturees] = useState<number>(COUT_DEMANDES_ORALES_DEFAULTS.pctNonCapturees);
  const [minutes, setMinutes] = useState<number>(COUT_DEMANDES_ORALES_DEFAULTS.minutes);
  const [pctFunnel, setPctFunnel] = useState<number>(COUT_DEMANDES_ORALES_DEFAULTS.pctFunnel);
  const [taux, setTaux] = useState<number>(COUT_DEMANDES_ORALES_DEFAULTS.taux);
  const [pctPerdus, setPctPerdus] = useState<number>(COUT_DEMANDES_ORALES_DEFAULTS.pctPerdus);
  const [panier, setPanier] = useState<number>(COUT_DEMANDES_ORALES_DEFAULTS.panier);
  const [draft, setDraft] = useState<string | null>(null);

  const result = useMemo(
    () =>
      computeCoutDemandesOrales({
        orales,
        pctNonCapturees,
        minutes,
        pctFunnel,
        taux,
        pctPerdus,
        panier,
      }),
    [orales, pctNonCapturees, minutes, pctFunnel, taux, pctPerdus, panier],
  );
  const recap = draft ?? result.recap;

  function reset() {
    setDraft(null);
    setOrales(COUT_DEMANDES_ORALES_DEFAULTS.orales);
    setPctNonCapturees(COUT_DEMANDES_ORALES_DEFAULTS.pctNonCapturees);
    setMinutes(COUT_DEMANDES_ORALES_DEFAULTS.minutes);
    setPctFunnel(COUT_DEMANDES_ORALES_DEFAULTS.pctFunnel);
    setTaux(COUT_DEMANDES_ORALES_DEFAULTS.taux);
    setPctPerdus(COUT_DEMANDES_ORALES_DEFAULTS.pctPerdus);
    setPanier(COUT_DEMANDES_ORALES_DEFAULTS.panier);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume oral et capture</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_DEMANDES_ORALES_LABELS.orales}
              value={orales}
              min={0}
              max={100000}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setOrales(value);
              }}
            />
            <NumberField
              label={COUT_DEMANDES_ORALES_LABELS.pctNonCapturees}
              hint="Pas de checklist, pas de dossier, brief « dans la tête »."
              value={pctNonCapturees}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPctNonCapturees(value);
              }}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_DEMANDES_ORALES_LABELS.minutes}
              hint="Re-qualification, rappel en double, recherche du fil WhatsApp."
              value={minutes}
              min={0}
              max={1440}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setMinutes(value);
              }}
            />
            <NumberField
              label={COUT_DEMANDES_ORALES_LABELS.pctFunnel}
              hint="Indication qualitative. N’entre pas dans le total en euros."
              value={pctFunnel}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPctFunnel(value);
              }}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Coûts, panier et opportunité</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_DEMANDES_ORALES_LABELS.taux}
              hint="Commercial / assistant qui requalifie."
              value={taux}
              min={0}
              max={10000}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setTaux(value);
              }}
            />
            <NumberField
              label={COUT_DEMANDES_ORALES_LABELS.pctPerdus}
              hint="Sur le volume de demandes orales / mois."
              value={pctPerdus}
              min={0}
              max={100}
              step={0.5}
              onChange={(value) => {
                setDraft(null);
                setPctPerdus(value);
              }}
            />
          </div>
          <div className="mt-4">
            <NumberField
              label={COUT_DEMANDES_ORALES_LABELS.panier}
              hint="Indicatif métier. Pas un calcul TVA / TTC."
              value={panier}
              min={0}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPanier(value);
              }}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Laissez le panier à 0 pour ignorer les opportunités en euros. Le coût temps de
            re-qualification reste affiché. Le pourcentage funnel est indicatif et n’entre pas dans
            le total.
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
        <p className="mt-2 text-sm text-mk-on-dark/60">{COUT_DEMANDES_ORALES_LABELS.total}</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label={COUT_DEMANDES_ORALES_LABELS.nonCap} value={result.nonCapLabel} />
          <Row label={COUT_DEMANDES_ORALES_LABELS.heures} value={result.heuresLabel} />
          <Row label={COUT_DEMANDES_ORALES_LABELS.cout} value={result.coutLabel} tone="bad" />
          <Row label={COUT_DEMANDES_ORALES_LABELS.opp} value={result.oppLabel} tone={result.oppTone} />
          <Row label={COUT_DEMANDES_ORALES_LABELS.versFunnel} value={result.versFunnelLabel} />
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif pour une discussion d’équipe, pas une prévision financière. Aucune donnée
          n’est envoyée. QuoteBuilder n’est pas un client WhatsApp ni un standard téléphonique :
          l’outil mesure le coût d’une capture orale trop faible avant brief ou funnel.
        </p>

        <label className="mt-6 block text-[12px] leading-5 text-mk-on-dark/50">
          Texte récap / checklist (modifiable avant copie)
          <textarea
            value={recap}
            onChange={(event) => setDraft(event.target.value)}
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

function toneClass(tone: CoutDemandesOralesTone | "neutral") {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: CoutDemandesOralesAlertTone) {
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
  tone?: CoutDemandesOralesTone | "neutral";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: CoutDemandesOralesTone | "neutral") {
  if (tone === "bad") return "font-semibold text-rose-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  return "font-medium";
}
