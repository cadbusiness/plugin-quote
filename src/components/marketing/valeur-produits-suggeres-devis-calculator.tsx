"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  VALEUR_PRODUITS_SUGGERES_DEFAULTS,
  VALEUR_PRODUITS_SUGGERES_LABELS,
  computeValeurProduitsSuggeres,
  type ValeurProduitsSuggeresTone,
} from "@/lib/marketing/valeur-produits-suggeres-devis";

export function ValeurProduitsSuggeresDevisCalculator() {
  const [demandes, setDemandes] = useState<number>(VALEUR_PRODUITS_SUGGERES_DEFAULTS.demandes);
  const [pctActuel, setPctActuel] = useState<number>(VALEUR_PRODUITS_SUGGERES_DEFAULTS.pctActuel);
  const [pctCible, setPctCible] = useState<number>(VALEUR_PRODUITS_SUGGERES_DEFAULTS.pctCible);
  const [valeur, setValeur] = useState<number>(VALEUR_PRODUITS_SUGGERES_DEFAULTS.valeur);
  const [transfo, setTransfo] = useState<number>(VALEUR_PRODUITS_SUGGERES_DEFAULTS.transfo);
  const [minutes, setMinutes] = useState<number>(VALEUR_PRODUITS_SUGGERES_DEFAULTS.minutes);
  const [taux, setTaux] = useState<number>(VALEUR_PRODUITS_SUGGERES_DEFAULTS.taux);
  const [draft, setDraft] = useState<string | null>(null);

  const result = useMemo(
    () =>
      computeValeurProduitsSuggeres({
        demandes,
        pctActuel,
        pctCible,
        valeur,
        transfo,
        minutes,
        taux,
      }),
    [demandes, pctActuel, pctCible, valeur, transfo, minutes, taux],
  );
  const recap = draft ?? result.recap;

  function reset() {
    setDraft(null);
    setDemandes(VALEUR_PRODUITS_SUGGERES_DEFAULTS.demandes);
    setPctActuel(VALEUR_PRODUITS_SUGGERES_DEFAULTS.pctActuel);
    setPctCible(VALEUR_PRODUITS_SUGGERES_DEFAULTS.pctCible);
    setValeur(VALEUR_PRODUITS_SUGGERES_DEFAULTS.valeur);
    setTransfo(VALEUR_PRODUITS_SUGGERES_DEFAULTS.transfo);
    setMinutes(VALEUR_PRODUITS_SUGGERES_DEFAULTS.minutes);
    setTaux(VALEUR_PRODUITS_SUGGERES_DEFAULTS.taux);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et suggestions</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={VALEUR_PRODUITS_SUGGERES_LABELS.demandes}
              hint="Dossiers où le prospect passe par l'écran de suggestions."
              value={demandes}
              min={0}
              max={100000}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setDemandes(value);
              }}
            />
            <NumberField
              label={VALEUR_PRODUITS_SUGGERES_LABELS.valeur}
              hint="Ordre de grandeur de votre catalogue. Fourchette indicative, pas de TVA."
              value={valeur}
              min={0}
              step={10}
              onChange={(value) => {
                setDraft(null);
                setValeur(value);
              }}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={VALEUR_PRODUITS_SUGGERES_LABELS.pctActuel}
              hint="Votre constat, même approximatif."
              value={pctActuel}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPctActuel(value);
              }}
            />
            <NumberField
              label={VALEUR_PRODUITS_SUGGERES_LABELS.pctCible}
              hint="Hypothèse à tester, pas une promesse."
              value={pctCible}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPctCible(value);
              }}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Transformation et temps</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={VALEUR_PRODUITS_SUGGERES_LABELS.transfo}
              hint="Gagné / dossiers, sur votre historique."
              value={transfo}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setTransfo(value);
              }}
            />
            <NumberField
              label={VALEUR_PRODUITS_SUGGERES_LABELS.minutes}
              hint="Complément déjà choisi, pas à proposer au téléphone."
              value={minutes}
              min={0}
              max={24 * 60}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setMinutes(value);
              }}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={VALEUR_PRODUITS_SUGGERES_LABELS.taux}
              hint="Commercial ou chargé d'affaires."
              value={taux}
              min={0}
              max={10000}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setTaux(value);
              }}
            />
          </div>
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
        <p className="mt-2 text-sm text-mk-on-dark/60">{VALEUR_PRODUITS_SUGGERES_LABELS.total}</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label={VALEUR_PRODUITS_SUGGERES_LABELS.dossiers} value={result.dossiersLabel} />
          <Row label={VALEUR_PRODUITS_SUGGERES_LABELS.devis} value={result.devisLabel} />
          <Row label={VALEUR_PRODUITS_SUGGERES_LABELS.ecart} value={result.ecartLabel} />
          <Row label={VALEUR_PRODUITS_SUGGERES_LABELS.gagne} value={result.gagneLabel} tone="ok" />
          <Row label={VALEUR_PRODUITS_SUGGERES_LABELS.temps} value={result.tempsLabel} />
          <Row label={VALEUR_PRODUITS_SUGGERES_LABELS.an} value={result.anLabel} tone={result.totalTone} />
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif pour une discussion d&apos;équipe, pas une prévision commerciale ni un
          conseil financier. Aucune donnée n&apos;est envoyée. Aucun chiffre de référence n&apos;est
          inventé : toutes les valeurs sont les vôtres. Les règles Si/Alors choisissent seulement
          les produits proposés à l&apos;écran « Solutions recommandées » (3 blocs au maximum, par
          priorité). Elles ne font pas sauter d&apos;étape et ne calculent pas de prix. Pas de kits :
          options, variantes et produits liés. Prix en fourchette indicative min-max, sans TVA.
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

function toneClass(tone: ValeurProduitsSuggeresTone) {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  return "text-mk-on-dark";
}

function alertClass(tone: ValeurProduitsSuggeresTone) {
  if (tone === "ok") return "bg-emerald-400/15 text-emerald-200";
  if (tone === "warn") return "bg-amber-400/15 text-amber-100";
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
  tone?: ValeurProduitsSuggeresTone;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: ValeurProduitsSuggeresTone) {
  if (tone === "ok") return "font-semibold text-emerald-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  return "font-medium";
}
