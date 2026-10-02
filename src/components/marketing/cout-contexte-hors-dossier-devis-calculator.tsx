"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS,
  COUT_CONTEXTE_HORS_DOSSIER_LABELS,
  computeCoutContexteHorsDossier,
  type CoutContexteHorsDossierAlertTone,
  type CoutContexteHorsDossierTone,
} from "@/lib/marketing/cout-contexte-hors-dossier-devis";

export function CoutContexteHorsDossierDevisCalculator() {
  const [dossiers, setDossiers] = useState<number>(COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS.dossiers);
  const [pctSans, setPctSans] = useState<number>(COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS.pctSans);
  const [minutes, setMinutes] = useState<number>(COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS.minutes);
  const [pctMorts, setPctMorts] = useState<number>(COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS.pctMorts);
  const [taux, setTaux] = useState<number>(COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS.taux);
  const [panier, setPanier] = useState<number>(COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS.panier);
  const [draft, setDraft] = useState<string | null>(null);

  const result = useMemo(
    () =>
      computeCoutContexteHorsDossier({
        dossiers,
        pctSans,
        minutes,
        pctMorts,
        taux,
        panier,
      }),
    [dossiers, pctSans, minutes, pctMorts, taux, panier],
  );
  const recap = draft ?? result.recap;

  function reset() {
    setDraft(null);
    setDossiers(COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS.dossiers);
    setPctSans(COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS.pctSans);
    setMinutes(COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS.minutes);
    setPctMorts(COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS.pctMorts);
    setTaux(COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS.taux);
    setPanier(COUT_CONTEXTE_HORS_DOSSIER_DEFAULTS.panier);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et qualité du contexte</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_CONTEXTE_HORS_DOSSIER_LABELS.dossiers}
              hint="Volume traité par l'équipe (tous canaux)."
              value={dossiers}
              min={0}
              max={100000}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setDossiers(value);
              }}
            />
            <NumberField
              label={COUT_CONTEXTE_HORS_DOSSIER_LABELS.pctSans}
              hint="Contexte surtout dans Slack, oral ou têtes."
              value={pctSans}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPctSans(value);
              }}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_CONTEXTE_HORS_DOSSIER_LABELS.minutes}
              hint="Par dossier sans notes utiles (reprise + reconstruction)."
              value={minutes}
              min={0}
              max={24 * 60}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setMinutes(value);
              }}
            />
            <NumberField
              label={COUT_CONTEXTE_HORS_DOSSIER_LABELS.pctMorts}
              hint="Sur le volume de dossiers / mois."
              value={pctMorts}
              min={0}
              max={100}
              step={0.5}
              onChange={(value) => {
                setDraft(null);
                setPctMorts(value);
              }}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Coûts et panier</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_CONTEXTE_HORS_DOSSIER_LABELS.taux}
              hint="Commercial + technique qui rebriefent."
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
              label={COUT_CONTEXTE_HORS_DOSSIER_LABELS.panier}
              hint="Ordre de grandeur métier. Pas un calcul TVA / TTC."
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
            Laissez le panier à 0 pour ignorer les opportunités en euros. Le coût temps de re-brief
            reste affiché.
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
        <p className="mt-2 text-sm text-mk-on-dark/60">{COUT_CONTEXTE_HORS_DOSSIER_LABELS.total}</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label={COUT_CONTEXTE_HORS_DOSSIER_LABELS.fragiles} value={result.fragilesLabel} />
          <Row label={COUT_CONTEXTE_HORS_DOSSIER_LABELS.heures} value={result.heuresLabel} />
          <Row label={COUT_CONTEXTE_HORS_DOSSIER_LABELS.coutTemps} value={result.coutTempsLabel} tone="bad" />
          <Row label={COUT_CONTEXTE_HORS_DOSSIER_LABELS.opp} value={result.oppLabel} tone={result.oppTone} />
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif pour une discussion d’équipe, pas une comptabilité officielle ni un
          conseil financier. Aucune donnée n’est envoyée. Pas de TVA inventée. Les notes internes
          sont un champ / notes sur le dossier équipe : ce n’est pas un chat interne inventé, ni des
          commentaires ancrés aux lignes. Le fil prospect reste séparé (chat plat).
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

function toneClass(tone: CoutContexteHorsDossierTone | "neutral") {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: CoutContexteHorsDossierAlertTone) {
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
  tone?: CoutContexteHorsDossierTone | "neutral";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: CoutContexteHorsDossierTone | "neutral") {
  if (tone === "bad") return "font-semibold text-rose-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  return "font-medium";
}
