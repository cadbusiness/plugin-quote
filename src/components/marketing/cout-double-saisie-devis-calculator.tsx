"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  COUT_DOUBLE_SAISIE_DEFAULTS,
  COUT_DOUBLE_SAISIE_LABELS,
  computeCoutDoubleSaisie,
  type CoutDoubleSaisieAlertTone,
  type CoutDoubleSaisieTone,
} from "@/lib/marketing/cout-double-saisie-devis";

export function CoutDoubleSaisieDevisCalculator() {
  const [demandes, setDemandes] = useState<number>(COUT_DOUBLE_SAISIE_DEFAULTS.demandes);
  const [minutes, setMinutes] = useState<number>(COUT_DOUBLE_SAISIE_DEFAULTS.minutes);
  const [pctPerte, setPctPerte] = useState<number>(COUT_DOUBLE_SAISIE_DEFAULTS.pctPerte);
  const [pctMort, setPctMort] = useState<number>(COUT_DOUBLE_SAISIE_DEFAULTS.pctMort);
  const [taux, setTaux] = useState<number>(COUT_DOUBLE_SAISIE_DEFAULTS.taux);
  const [panier, setPanier] = useState<number>(COUT_DOUBLE_SAISIE_DEFAULTS.panier);
  const [draft, setDraft] = useState<string | null>(null);

  const result = useMemo(
    () =>
      computeCoutDoubleSaisie({
        demandes,
        minutes,
        pctPerte,
        pctMort,
        taux,
        panier,
      }),
    [demandes, minutes, pctPerte, pctMort, taux, panier],
  );
  const recap = draft ?? result.recap;

  function reset() {
    setDraft(null);
    setDemandes(COUT_DOUBLE_SAISIE_DEFAULTS.demandes);
    setMinutes(COUT_DOUBLE_SAISIE_DEFAULTS.minutes);
    setPctPerte(COUT_DOUBLE_SAISIE_DEFAULTS.pctPerte);
    setPctMort(COUT_DOUBLE_SAISIE_DEFAULTS.pctMort);
    setTaux(COUT_DOUBLE_SAISIE_DEFAULTS.taux);
    setPanier(COUT_DOUBLE_SAISIE_DEFAULTS.panier);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et temps de resaisie</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_DOUBLE_SAISIE_LABELS.demandes}
              hint="Mail, formulaire pauvre ou Excel puis retape dans le logiciel / CRM."
              value={demandes}
              min={0}
              max={100000}
              step={1}
              onChange={setDemandes}
            />
            <NumberField
              label={COUT_DOUBLE_SAISIE_LABELS.minutes}
              hint="Retype + recherche pièces + reconstruction du brief."
              value={minutes}
              min={0}
              max={24 * 60}
              step={1}
              onChange={setMinutes}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_DOUBLE_SAISIE_LABELS.pctPerte}
              hint="Surface, accès, contraintes, photos oubliées, besoin raccourci."
              value={pctPerte}
              min={0}
              max={100}
              step={1}
              onChange={setPctPerte}
            />
            <NumberField
              label={COUT_DOUBLE_SAISIE_LABELS.pctMort}
              hint="Opportunité perdue ou cycle « il manque… »."
              value={pctMort}
              min={0}
              max={100}
              step={1}
              onChange={setPctMort}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Coûts et panier</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_DOUBLE_SAISIE_LABELS.taux}
              value={taux}
              min={0}
              max={10000}
              step={1}
              onChange={setTaux}
            />
            <NumberField
              label={COUT_DOUBLE_SAISIE_LABELS.panier}
              hint="Indicatif métier. Pas un calcul TVA / TTC."
              value={panier}
              min={0}
              step={1}
              onChange={setPanier}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Laissez le panier à 0 pour ignorer les opportunités en euros. Le coût temps (resaisie)
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
        <p className="mt-2 text-sm text-mk-on-dark/60">{COUT_DOUBLE_SAISIE_LABELS.total}</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label={COUT_DOUBLE_SAISIE_LABELS.heures} value={result.heuresLabel} />
          <Row label={COUT_DOUBLE_SAISIE_LABELS.coutTemps} value={result.coutTempsLabel} tone="bad" />
          <Row label={COUT_DOUBLE_SAISIE_LABELS.deformes} value={result.deformesLabel} tone={result.defTone} />
          <Row label={COUT_DOUBLE_SAISIE_LABELS.opp} value={result.oppLabel} tone={result.oppTone} />
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif pour une discussion d’équipe, pas une prévision financière. Aucune donnée
          n’est envoyée. QuoteBuilder n’a pas de saisie manuelle de devis ni d’écran d’import : le
          modèle sain, c’est funnel, API, plugins ou lien préfill, sans double saisie.
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

function toneClass(tone: CoutDoubleSaisieTone | "neutral") {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: CoutDoubleSaisieAlertTone) {
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
  tone?: CoutDoubleSaisieTone | "neutral";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: CoutDoubleSaisieTone | "neutral") {
  if (tone === "bad") return "font-semibold text-rose-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  return "font-medium";
}
