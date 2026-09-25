"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  COUT_ALLER_RETOURS_BRIEF_DEFAULTS,
  computeCoutAllerRetoursBrief,
  type CoutAllerRetoursAlertTone,
  type CoutAllerRetoursTone,
} from "@/lib/marketing/cout-aller-retours-brief-photos";

export function CoutAllerRetoursBriefPhotosEstimator() {
  const [demandes, setDemandes] = useState<number>(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.demandes);
  const [sansDocPct, setSansDocPct] = useState<number>(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.sansDocPct);
  const [minutes, setMinutes] = useState<number>(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.minutes);
  const [deplacPct, setDeplacPct] = useState<number>(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.deplacPct);
  const [coutTrajet, setCoutTrajet] = useState<number>(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.coutTrajet);
  const [taux, setTaux] = useState<number>(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.taux);
  const [panier, setPanier] = useState<number>(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.panier);
  const [ecartConvPts, setEcartConvPts] = useState<number>(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.ecartConvPts);
  const [recap, setRecap] = useState("");

  const result = useMemo(
    () =>
      computeCoutAllerRetoursBrief({
        demandes,
        sansDocPct,
        minutes,
        deplacPct,
        coutTrajet,
        taux,
        panier,
        ecartConvPts,
      }),
    [demandes, sansDocPct, minutes, deplacPct, coutTrajet, taux, panier, ecartConvPts],
  );

  useEffect(() => {
    setRecap(result.recap);
  }, [result.recap]);

  function reset() {
    setDemandes(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.demandes);
    setSansDocPct(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.sansDocPct);
    setMinutes(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.minutes);
    setDeplacPct(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.deplacPct);
    setCoutTrajet(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.coutTrajet);
    setTaux(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.taux);
    setPanier(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.panier);
    setEcartConvPts(COUT_ALLER_RETOURS_BRIEF_DEFAULTS.ecartConvPts);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et brief incomplet</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Demandes de devis / mois"
              value={demandes}
              min={0}
              max={100000}
              step={1}
              onChange={setDemandes}
            />
            <NumberField
              label="% sans photo ni plan"
              value={sansDocPct}
              min={0}
              max={100}
              step={1}
              onChange={setSansDocPct}
              hint="Briefs qui arrivent vides côté documents."
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Minutes perdues / demande sans doc"
              value={minutes}
              min={0}
              max={480}
              step={1}
              onChange={setMinutes}
              hint="Rappels, WhatsApp, reconstruction du brief."
            />
            <NumberField
              label="% de ces dossiers avec déplacement inutile"
              value={deplacPct}
              min={0}
              max={100}
              step={1}
              onChange={setDeplacPct}
              hint="Visite annulée ou « on ne peut pas chiffrer » sur place."
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Coûts et conversion</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Coût moyen d’un trajet / déplacement (€)"
              value={coutTrajet}
              min={0}
              max={100000}
              step={1}
              onChange={setCoutTrajet}
            />
            <NumberField label="Taux horaire chargé (€)" value={taux} min={0} max={10000} step={1} onChange={setTaux} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField label="Panier moyen HT (€)" value={panier} min={0} step={1} onChange={setPanier} />
            <NumberField
              label="Écart conversion si brief documenté (points %)"
              value={ecartConvPts}
              min={0}
              max={50}
              step={0.5}
              onChange={setEcartConvPts}
              hint="Ex. +4 points de conversion quand photos / plans sont présents dès le départ."
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Laissez le panier à 0 pour ignorer les opportunités manquées. L’écart s’applique aux
            dossiers sans photo ni plan.
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
          Coût total indicatif / mois (friction + trajets + opportunités)
        </p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="Demandes / mois sans photo ni plan" value={result.dossiersLabel} />
          <Row label="Heures / mois perdues (rappels + reconstruction)" value={result.heuresLabel} />
          <Row label="Coût chargé de cette friction" value={result.coutFrictionLabel} tone="bad" />
          <Row label="Déplacements inutiles / mois" value={result.deplacementsLabel} tone="warn" />
          <Row label="Coût trajets inutiles" value={result.coutTrajetsLabel} tone="warn" />
          <Row label="Opportunités manquées indicatives / mois" value={result.oppLabel} tone={result.oppTone} />
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

function toneClass(tone: CoutAllerRetoursTone | "neutral") {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: CoutAllerRetoursAlertTone) {
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
  tone?: CoutAllerRetoursTone | "neutral";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: CoutAllerRetoursTone | "neutral") {
  if (tone === "bad") return "font-semibold text-rose-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  return "font-medium";
}
