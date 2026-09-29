"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS,
  COUT_ATTENTE_MULTI_DECIDEURS_LABELS,
  computeCoutAttenteMultiDecideurs,
  type CoutAttenteMultiDecideursAlertTone,
  type CoutAttenteMultiDecideursTone,
} from "@/lib/marketing/cout-attente-multi-decideurs-devis";

export function CoutAttenteMultiDecideursEstimator() {
  const [devis, setDevis] = useState<number>(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.devis);
  const [pctMulti, setPctMulti] = useState<number>(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.pctMulti);
  const [decideurs, setDecideurs] = useState<number>(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.decideurs);
  const [jours, setJours] = useState<number>(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.jours);
  const [minutes, setMinutes] = useState<number>(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.minutes);
  const [taux, setTaux] = useState<number>(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.taux);
  const [panier, setPanier] = useState<number>(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.panier);
  const [pctPerdus, setPctPerdus] = useState<number>(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.pctPerdus);
  const [recap, setRecap] = useState("");

  const result = useMemo(
    () =>
      computeCoutAttenteMultiDecideurs({
        devis,
        pctMulti,
        decideurs,
        jours,
        minutes,
        taux,
        panier,
        pctPerdus,
      }),
    [devis, pctMulti, decideurs, jours, minutes, taux, panier, pctPerdus],
  );

  useEffect(() => {
    setRecap(result.recap);
  }, [result.recap]);

  function reset() {
    setDevis(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.devis);
    setPctMulti(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.pctMulti);
    setDecideurs(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.decideurs);
    setJours(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.jours);
    setMinutes(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.minutes);
    setTaux(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.taux);
    setPanier(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.panier);
    setPctPerdus(COUT_ATTENTE_MULTI_DECIDEURS_DEFAULTS.pctPerdus);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et circuit client</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.devis}
              value={devis}
              min={0}
              max={100000}
              step={1}
              onChange={setDevis}
            />
            <NumberField
              label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.pctMulti}
              hint="Achats + technique + finance / direction, syndic, etc."
              value={pctMulti}
              min={0}
              max={100}
              step={1}
              onChange={setPctMulti}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.decideurs}
              hint="Contexte du circuit. Il figure dans le récap, il ne multiplie pas le montant."
              value={decideurs}
              min={1}
              max={20}
              step={0.5}
              onChange={setDecideurs}
            />
            <NumberField
              label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.jours}
              hint="Cycle allongé faute de circuit clair (invitations, badges, un seul lien)."
              value={jours}
              min={0}
              max={365}
              step={0.5}
              onChange={setJours}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Relances, panier et conversion</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.minutes}
              hint="Appels, mails « qui a validé ? », renvois de PDF."
              value={minutes}
              min={0}
              max={480}
              step={1}
              onChange={setMinutes}
            />
            <NumberField
              label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.taux}
              value={taux}
              min={0}
              max={10000}
              step={1}
              onChange={setTaux}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.panier}
              value={panier}
              min={0}
              step={1}
              onChange={setPanier}
            />
            <NumberField
              label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.pctPerdus}
              hint="Sur les devis multi-décideurs concernés."
              value={pctPerdus}
              min={0}
              max={100}
              step={0.5}
              onChange={setPctPerdus}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Laissez le panier à 0 pour ignorer les opportunités en euros. Le coût temps (relances
            chargées) reste affiché.
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
        <p className="mt-2 text-sm text-mk-on-dark/60">{COUT_ATTENTE_MULTI_DECIDEURS_LABELS.total}</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.concernes} value={result.concernesLabel} />
          <Row label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.jh} value={result.jhLabel} />
          <Row label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.heures} value={result.heuresLabel} />
          <Row label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.coutTemps} value={result.coutTempsLabel} tone="bad" />
          <Row label={COUT_ATTENTE_MULTI_DECIDEURS_LABELS.opp} value={result.oppLabel} tone={result.oppTone} />
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif pour une discussion d’équipe, pas une prévision financière. Aucune donnée
          n’est envoyée. Les jours-homme d’attente représentent le stock de cycle immobilisé (devis
          × jours / 20 j ouvrés), pas des heures facturables.
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

function toneClass(tone: CoutAttenteMultiDecideursTone | "neutral") {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: CoutAttenteMultiDecideursAlertTone) {
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
  tone?: CoutAttenteMultiDecideursTone | "neutral";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: CoutAttenteMultiDecideursTone | "neutral") {
  if (tone === "bad") return "font-semibold text-rose-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  return "font-medium";
}
