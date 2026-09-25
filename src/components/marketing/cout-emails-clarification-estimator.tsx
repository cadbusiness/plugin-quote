"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  COUT_EMAILS_CLARIFICATION_DEFAULTS,
  computeCoutEmailsClarification,
  type CoutEmailsClarificationAlertTone,
  type CoutEmailsClarificationTone,
} from "@/lib/marketing/cout-emails-clarification";

export function CoutEmailsClarificationEstimator() {
  const [devis, setDevis] = useState<number>(COUT_EMAILS_CLARIFICATION_DEFAULTS.devis);
  const [pctClarif, setPctClarif] = useState<number>(COUT_EMAILS_CLARIFICATION_DEFAULTS.pctClarif);
  const [mails, setMails] = useState<number>(COUT_EMAILS_CLARIFICATION_DEFAULTS.mails);
  const [minutes, setMinutes] = useState<number>(COUT_EMAILS_CLARIFICATION_DEFAULTS.minutes);
  const [taux, setTaux] = useState<number>(COUT_EMAILS_CLARIFICATION_DEFAULTS.taux);
  const [pctPerdus, setPctPerdus] = useState<number>(COUT_EMAILS_CLARIFICATION_DEFAULTS.pctPerdus);
  const [panier, setPanier] = useState<number>(COUT_EMAILS_CLARIFICATION_DEFAULTS.panier);
  const [recap, setRecap] = useState("");

  const result = useMemo(
    () =>
      computeCoutEmailsClarification({
        devis,
        pctClarif,
        mails,
        minutes,
        taux,
        pctPerdus,
        panier,
      }),
    [devis, pctClarif, mails, minutes, taux, pctPerdus, panier],
  );

  useEffect(() => {
    setRecap(result.recap);
  }, [result.recap]);

  function reset() {
    setDevis(COUT_EMAILS_CLARIFICATION_DEFAULTS.devis);
    setPctClarif(COUT_EMAILS_CLARIFICATION_DEFAULTS.pctClarif);
    setMails(COUT_EMAILS_CLARIFICATION_DEFAULTS.mails);
    setMinutes(COUT_EMAILS_CLARIFICATION_DEFAULTS.minutes);
    setTaux(COUT_EMAILS_CLARIFICATION_DEFAULTS.taux);
    setPctPerdus(COUT_EMAILS_CLARIFICATION_DEFAULTS.pctPerdus);
    setPanier(COUT_EMAILS_CLARIFICATION_DEFAULTS.panier);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et clarification mail</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Devis envoyés / mois"
              value={devis}
              min={0}
              max={100000}
              step={1}
              onChange={setDevis}
            />
            <NumberField
              label="% avec clarification par mail"
              value={pctClarif}
              min={0}
              max={100}
              step={1}
              onChange={setPctClarif}
              hint="Devis qui génèrent au moins un fil RE: RE:."
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Mails moyens / clarification"
              value={mails}
              min={0}
              max={200}
              step={0.5}
              onChange={setMails}
              hint="Allers-retours comptés côté vous + prospect."
            />
            <NumberField
              label="Minutes / mail"
              value={minutes}
              min={0}
              max={240}
              step={1}
              onChange={setMinutes}
              hint="Lecture, rédaction, forward, recherche de version."
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Coûts et opportunités perdues</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Coût horaire chargé (€)"
              value={taux}
              min={0}
              max={10000}
              step={1}
              onChange={setTaux}
            />
            <NumberField
              label="% deals perdus faute de clarté"
              value={pctPerdus}
              min={0}
              max={100}
              step={0.5}
              onChange={setPctPerdus}
              hint="Sur les devis qui passent par clarification mail."
            />
          </div>
          <div className="mt-4">
            <NumberField label="Panier moyen HT (€)" value={panier} min={0} step={1} onChange={setPanier} />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Laissez le panier à 0 pour ignorer les opportunités perdues. Le pourcentage de deals
            perdus s’applique aux devis qui passent par clarification mail.
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
        <p className="mt-2 text-sm text-mk-on-dark/60">
          Coût total indicatif / mois (temps + opportunités)
        </p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="Devis / mois avec clarification mail" value={result.dossiersLabel} />
          <Row label="Mails de clarification / mois" value={result.mailsLabel} />
          <Row label="Heures / mois (temps clarification)" value={result.heuresLabel} />
          <Row label="Coût temps (chargé)" value={result.coutTempsLabel} tone="bad" />
          <Row label="Opportunités perdues estimées / mois" value={result.oppLabel} tone={result.oppTone} />
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

function toneClass(tone: CoutEmailsClarificationTone | "neutral") {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: CoutEmailsClarificationAlertTone) {
  if (tone === "ok") return "bg-emerald-400/15 text-emerald-200";
  if (tone === "warn") return "bg-amber-400/15 text-amber-100";
  if (tone === "bad") return "bg-rose-400/15 text-rose-200";
  return "bg-white/5 text-mk-on-dark/80";
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max?: number;
  step: number;
  hint?: string;
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
  tone?: CoutEmailsClarificationTone | "neutral";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: CoutEmailsClarificationTone | "neutral") {
  if (tone === "bad") return "font-semibold text-rose-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  return "font-medium";
}
