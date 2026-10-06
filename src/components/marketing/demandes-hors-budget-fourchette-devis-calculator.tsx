"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS,
  DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS,
  computeDemandesHorsBudgetFourchette,
  type DemandesHorsBudgetFourchetteTone,
} from "@/lib/marketing/demandes-hors-budget-fourchette-devis";

export function DemandesHorsBudgetFourchetteDevisCalculator() {
  const [demandes, setDemandes] = useState<number>(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.demandes);
  const [pctHB, setPctHB] = useState<number>(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.pctHB);
  const [minutes, setMinutes] = useState<number>(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.minutes);
  const [taux, setTaux] = useState<number>(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.taux);
  const [pctEvit, setPctEvit] = useState<number>(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.pctEvit);
  const [minutesApres, setMinutesApres] = useState<number>(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.minutesApres);
  const [pMin, setPMin] = useState<number>(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.pMin);
  const [pMax, setPMax] = useState<number | null>(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.pMax);
  const [qty, setQty] = useState<number>(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.qty);
  const [draft, setDraft] = useState<string | null>(null);

  const result = useMemo(
    () =>
      computeDemandesHorsBudgetFourchette({
        demandes,
        pctHB,
        minutes,
        taux,
        pctEvit,
        minutesApres,
        pMin,
        pMax,
        qty,
      }),
    [demandes, pctHB, minutes, taux, pctEvit, minutesApres, pMin, pMax, qty],
  );
  const recap = draft ?? result.recap;

  function reset() {
    setDraft(null);
    setDemandes(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.demandes);
    setPctHB(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.pctHB);
    setMinutes(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.minutes);
    setTaux(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.taux);
    setPctEvit(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.pctEvit);
    setMinutesApres(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.minutesApres);
    setPMin(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.pMin);
    setPMax(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.pMax);
    setQty(DEMANDES_HORS_BUDGET_FOURCHETTE_DEFAULTS.qty);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et demandes hors budget</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.demandes}
              hint="Toutes sources confondues : funnel, email, téléphone."
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
              label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.pctHB}
              hint="Votre constat : le prospect découvre l'ordre de grandeur et abandonne, ou son budget est très en dessous."
              value={pctHB}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPctHB(value);
              }}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.minutes}
              hint="Lecture, rappel, préqualification, parfois un premier chiffrage, avant que l'écart apparaisse."
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
              label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.taux}
              hint="Commercial, chargé d'affaires ou personne qui chiffre."
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
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Effet d&apos;une fourchette affichée plus tôt (hypothèse)</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.pctEvit}
              hint="Votre estimation : le prospect voit la fourchette et renonce, ou ajuste son besoin avant le rappel. Testez plusieurs valeurs (par exemple 20, 50, 80)."
              value={pctEvit}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPctEvit(value);
              }}
            />
            <NumberField
              label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.minutesApres}
              hint="Lecture rapide et passage en Perdu. Plafonné au temps saisi plus haut."
              value={minutesApres}
              min={0}
              max={24 * 60}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setMinutesApres(value);
              }}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Aperçu d&apos;une ligne (facultatif)</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.pMin}
              hint="Par exemple par convive, par m² ou par jour."
              value={pMin}
              min={0}
              max={10000000}
              step={0.01}
              onChange={(value) => {
                setDraft(null);
                setPMin(value);
              }}
            />
            <OptionalNumberField
              label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.pMax}
              hint="Vide = prix fixe (même montant que le min)."
              value={pMax}
              min={0}
              max={10000000}
              step={0.01}
              onChange={(value) => {
                setDraft(null);
                setPMax(value);
              }}
            />
          </div>
          <div className="mt-4">
            <NumberField
              label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.qty}
              hint="Nombre d'unités choisies par le prospect."
              value={qty}
              min={1}
              max={100000}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setQty(value);
              }}
            />
          </div>
          <p className="mt-4 text-sm font-semibold">{DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.ligne}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-mk-accent">{result.ligneLabel}</p>
          <p className="mt-2 text-[12px] leading-5 text-mk-faint">
            Même principe que le montant de ligne de QuoteBuilder (fiche devis, espace prospect, PDF) : prix min ×
            quantité, prix max × quantité. Sans fourchette de règle, la fourchette indicative du dossier est la somme de
            ces lignes. Les options d&apos;un produit ne changent pas le montant.
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
        <p className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${toneClass(result.coutTone)}`}>
          {result.coutLabel}
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">{DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.cout}</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.hb} value={result.hbLabel} />
          <Row label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.heures} value={result.heuresLabel} />
          <Row label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.an} value={result.anLabel} tone={result.coutTone} />
          <Row label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.evit} value={result.evitLabel} />
          <Row label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.rec} value={result.recLabel} tone={result.recTone} />
          <Row label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.anRec} value={result.anRecLabel} tone={result.recTone} />
          <Row label={DEMANDES_HORS_BUDGET_FOURCHETTE_LABELS.ligne} value={result.ligneLabel} />
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>{result.alert}</p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif pour une discussion d&apos;équipe, pas une prévision ni un conseil financier. Aucune donnée
          n&apos;est envoyée. Aucun chiffre de référence n&apos;est inventé : toutes les valeurs sont les vôtres. Une
          fourchette indicative n&apos;est pas un devis. Côté QuoteBuilder : chaque produit s&apos;annonce en Prix fixe,
          Fourchette ou Sur devis ; la fourchette d&apos;une règle de suggestion se saisit dans le formulaire
          d&apos;édition de la page Règles ; les montants sont affichés dans la devise du produit (l&apos;euro par
          défaut), sans gestion de TVA ni mention HT ou TTC ; le score Hot / Warm / Cold ne lit pas les prix.
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

function toneClass(tone: DemandesHorsBudgetFourchetteTone) {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: DemandesHorsBudgetFourchetteTone) {
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

function OptionalNumberField({
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
  value: number | null;
  min: number;
  max?: number;
  step: number;
  onChange: (n: number | null) => void;
}) {
  const shown = value == null || Number.isNaN(value) ? "" : value;
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        inputMode="decimal"
        value={shown}
        onChange={(event) => {
          const raw = event.target.value.trim();
          onChange(raw === "" ? null : Number(raw));
        }}
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
  tone?: DemandesHorsBudgetFourchetteTone;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: DemandesHorsBudgetFourchetteTone) {
  if (tone === "ok") return "font-semibold text-emerald-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  if (tone === "bad") return "font-semibold text-rose-300";
  return "font-medium";
}
