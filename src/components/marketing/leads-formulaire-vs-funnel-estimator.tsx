"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  LEADS_FORMULAIRE_DEFAULTS,
  computeLeadsFormulaireVsFunnel,
  type LeadsAlertTone,
  type LeadsScoreTone,
} from "@/lib/marketing/leads-formulaire-vs-funnel";

export function LeadsFormulaireVsFunnelEstimator() {
  const [demandes, setDemandes] = useState<number>(LEADS_FORMULAIRE_DEFAULTS.demandes);
  const [exploitPct, setExploitPct] = useState<number>(LEADS_FORMULAIRE_DEFAULTS.exploitPct);
  const [minutes, setMinutes] = useState<number>(LEADS_FORMULAIRE_DEFAULTS.minutes);
  const [tauxActuel, setTauxActuel] = useState<number>(LEADS_FORMULAIRE_DEFAULTS.tauxActuel);
  const [tauxCible, setTauxCible] = useState<number>(LEADS_FORMULAIRE_DEFAULTS.tauxCible);
  const [panier, setPanier] = useState<number>(LEADS_FORMULAIRE_DEFAULTS.panier);
  const [convPct, setConvPct] = useState<number>(LEADS_FORMULAIRE_DEFAULTS.convPct);
  const [recap, setRecap] = useState("");

  const result = useMemo(
    () =>
      computeLeadsFormulaireVsFunnel({
        demandes,
        exploitPct,
        minutes,
        tauxActuel,
        tauxCible,
        panier,
        convPct,
      }),
    [demandes, exploitPct, minutes, tauxActuel, tauxCible, panier, convPct],
  );

  useEffect(() => {
    setRecap(result.recap);
  }, [result.recap]);

  function reset() {
    setDemandes(LEADS_FORMULAIRE_DEFAULTS.demandes);
    setExploitPct(LEADS_FORMULAIRE_DEFAULTS.exploitPct);
    setMinutes(LEADS_FORMULAIRE_DEFAULTS.minutes);
    setTauxActuel(LEADS_FORMULAIRE_DEFAULTS.tauxActuel);
    setTauxCible(LEADS_FORMULAIRE_DEFAULTS.tauxCible);
    setPanier(LEADS_FORMULAIRE_DEFAULTS.panier);
    setConvPct(LEADS_FORMULAIRE_DEFAULTS.convPct);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et qualité actuelle</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Demandes / mois (formulaire contact WP)"
              value={demandes}
              min={0}
              max={100000}
              step={1}
              onChange={setDemandes}
            />
            <NumberField
              label="% exploitables sans rappel"
              value={exploitPct}
              min={0}
              max={100}
              step={1}
              onChange={setExploitPct}
            />
          </div>
          <div className="mt-4">
            <NumberField
              label="Minutes de ressaisie / demande"
              value={minutes}
              min={0}
              max={480}
              step={1}
              onChange={setMinutes}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Copier le mail, recréer le brief, chercher le SKU Woo, relancer pour une info manquante.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Réponse sous 24 h et panier</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Taux réponse < 24 h actuel (%)"
              value={tauxActuel}
              min={0}
              max={100}
              step={1}
              onChange={setTauxActuel}
            />
            <NumberField
              label="Taux réponse < 24 h cible (dossier auto) (%)"
              value={tauxCible}
              min={0}
              max={100}
              step={1}
              onChange={setTauxCible}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Panier moyen HT (€), optionnel"
              value={panier}
              min={0}
              step={1}
              onChange={setPanier}
            />
            <NumberField
              label="Taux conversion indicatif sur demandes récupérées (%)"
              value={convPct}
              min={0}
              max={100}
              step={0.5}
              onChange={setConvPct}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Laissez le panier à 0 pour ignorer le coût d’opportunité. Sinon l’outil applique le taux
            de conversion sur les demandes récupérées (écart de réponse sous 24 h).
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
        <p className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${scoreClass(result.scoreTone)}`}>
          {result.scoreLabel}
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">Score maturité pipeline (0–100)</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="Heures / mois perdues en ressaisie" value={result.heuresLabel} />
          <Row label="Demandes mortes estimées / mois" value={result.mortesLabel} tone="bad" />
          <Row label="Demandes potentiellement récupérées (écart 24 h)" value={result.recupLabel} />
          <Row label="Coût d’opportunité indicatif / mois" value={result.coutLabel} />
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

function scoreClass(tone: LeadsScoreTone) {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  return "text-rose-300";
}

function alertClass(tone: LeadsAlertTone) {
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
  onChange,
}: {
  label: string;
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
  tone?: "bad";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${tone === "bad" ? "font-semibold text-rose-300" : "font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}
