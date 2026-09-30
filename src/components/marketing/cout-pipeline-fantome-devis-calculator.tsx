"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  COUT_PIPELINE_FANTOME_DEFAULTS,
  COUT_PIPELINE_FANTOME_LABELS,
  computeCoutPipelineFantome,
  type CoutPipelineFantomeAlertTone,
  type CoutPipelineFantomeTone,
} from "@/lib/marketing/cout-pipeline-fantome-devis";

export function CoutPipelineFantomeDevisCalculator() {
  const [ouverts, setOuverts] = useState<number>(COUT_PIPELINE_FANTOME_DEFAULTS.ouverts);
  const [pctFantome, setPctFantome] = useState<number>(COUT_PIPELINE_FANTOME_DEFAULTS.pctFantome);
  const [age, setAge] = useState<number>(COUT_PIPELINE_FANTOME_DEFAULTS.age);
  const [minutes, setMinutes] = useState<number>(COUT_PIPELINE_FANTOME_DEFAULTS.minutes);
  const [taux, setTaux] = useState<number>(COUT_PIPELINE_FANTOME_DEFAULTS.taux);
  const [panier, setPanier] = useState<number>(COUT_PIPELINE_FANTOME_DEFAULTS.panier);
  const [pctPerdu, setPctPerdu] = useState<number>(COUT_PIPELINE_FANTOME_DEFAULTS.pctPerdu);
  const [pctGagne, setPctGagne] = useState<number>(COUT_PIPELINE_FANTOME_DEFAULTS.pctGagne);
  const [draft, setDraft] = useState<string | null>(null);

  const result = useMemo(
    () =>
      computeCoutPipelineFantome({
        ouverts,
        pctFantome,
        age,
        minutes,
        taux,
        panier,
        pctPerdu,
        pctGagne,
      }),
    [ouverts, pctFantome, age, minutes, taux, panier, pctPerdu, pctGagne],
  );
  const recap = draft ?? result.recap;

  function reset() {
    setDraft(null);
    setOuverts(COUT_PIPELINE_FANTOME_DEFAULTS.ouverts);
    setPctFantome(COUT_PIPELINE_FANTOME_DEFAULTS.pctFantome);
    setAge(COUT_PIPELINE_FANTOME_DEFAULTS.age);
    setMinutes(COUT_PIPELINE_FANTOME_DEFAULTS.minutes);
    setTaux(COUT_PIPELINE_FANTOME_DEFAULTS.taux);
    setPanier(COUT_PIPELINE_FANTOME_DEFAULTS.panier);
    setPctPerdu(COUT_PIPELINE_FANTOME_DEFAULTS.pctPerdu);
    setPctGagne(COUT_PIPELINE_FANTOME_DEFAULTS.pctGagne);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Pipeline et fantômes</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_PIPELINE_FANTOME_LABELS.ouverts}
              value={ouverts}
              min={0}
              max={100000}
              step={1}
              onChange={setOuverts}
            />
            <NumberField
              label={COUT_PIPELINE_FANTOME_LABELS.pctFantome}
              hint="Parking En cours / En attente sans vraie prochaine action."
              value={pctFantome}
              min={0}
              max={100}
              step={1}
              onChange={setPctFantome}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_PIPELINE_FANTOME_LABELS.age}
              value={age}
              min={0}
              max={3650}
              step={1}
              onChange={setAge}
            />
            <NumberField
              label={COUT_PIPELINE_FANTOME_LABELS.minutes}
              hint="Relances floues, réunions, Excel, « on vérifie où ça en est »."
              value={minutes}
              min={0}
              max={24 * 60}
              step={1}
              onChange={setMinutes}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Coûts, panier et sorties manquées</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_PIPELINE_FANTOME_LABELS.taux}
              value={taux}
              min={0}
              max={10000}
              step={1}
              onChange={setTaux}
            />
            <NumberField
              label={COUT_PIPELINE_FANTOME_LABELS.panier}
              hint="Indicatif métier. Pas un calcul TVA / TTC."
              value={panier}
              min={0}
              step={1}
              onChange={setPanier}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_PIPELINE_FANTOME_LABELS.pctPerdu}
              hint="Faux espoir / capacité libérée si vous tranchiez."
              value={pctPerdu}
              min={0}
              max={100}
              step={1}
              onChange={setPctPerdu}
            />
            <NumberField
              label={COUT_PIPELINE_FANTOME_LABELS.pctGagne}
              hint="Deal clair côté client, statut CRM encore ouvert."
              value={pctGagne}
              min={0}
              max={100}
              step={1}
              onChange={setPctGagne}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Laissez le panier à 0 pour ignorer les opportunités en euros. Le coût temps (suivi flou)
            reste affiché. L’âge moyen figure dans le récap, il ne multiplie pas le montant.
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
        <p className="mt-2 text-sm text-mk-on-dark/60">{COUT_PIPELINE_FANTOME_LABELS.total}</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label={COUT_PIPELINE_FANTOME_LABELS.fantomes} value={result.fantomesLabel} />
          <Row label={COUT_PIPELINE_FANTOME_LABELS.heures} value={result.heuresLabel} />
          <Row label={COUT_PIPELINE_FANTOME_LABELS.coutTemps} value={result.coutTempsLabel} tone="bad" />
          <Row label={COUT_PIPELINE_FANTOME_LABELS.opp} value={result.oppLabel} tone={result.oppTone} />
          <Row label={COUT_PIPELINE_FANTOME_LABELS.gagne} value={result.gagneLabel} tone={result.gagneTone} />
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif pour une discussion d’équipe, pas une prévision financière. Aucune donnée
          n’est envoyée. Gagné / Perdu sont des décisions commerciales : l’outil ne signe pas et ne
          change aucun statut.
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

function toneClass(tone: CoutPipelineFantomeTone | "neutral") {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: CoutPipelineFantomeAlertTone) {
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
  tone?: CoutPipelineFantomeTone | "neutral";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: CoutPipelineFantomeTone | "neutral") {
  if (tone === "bad") return "font-semibold text-rose-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  return "font-medium";
}
