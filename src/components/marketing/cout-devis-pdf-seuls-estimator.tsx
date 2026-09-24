"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  COUT_DEVIS_PDF_SEULS_DEFAULTS,
  computeCoutDevisPdfSeuls,
  type CoutDevisPdfAlertTone,
  type CoutDevisPdfTone,
} from "@/lib/marketing/cout-devis-pdf-seuls";

export function CoutDevisPdfSeulsEstimator() {
  const [devis, setDevis] = useState<number>(COUT_DEVIS_PDF_SEULS_DEFAULTS.devis);
  const [jamaisPct, setJamaisPct] = useState<number>(COUT_DEVIS_PDF_SEULS_DEFAULTS.jamaisPct);
  const [obsoletesPct, setObsoletesPct] = useState<number>(COUT_DEVIS_PDF_SEULS_DEFAULTS.obsoletesPct);
  const [minutes, setMinutes] = useState<number>(COUT_DEVIS_PDF_SEULS_DEFAULTS.minutes);
  const [taux, setTaux] = useState<number>(COUT_DEVIS_PDF_SEULS_DEFAULTS.taux);
  const [panier, setPanier] = useState<number>(COUT_DEVIS_PDF_SEULS_DEFAULTS.panier);
  const [convPdf, setConvPdf] = useState<number>(COUT_DEVIS_PDF_SEULS_DEFAULTS.convPdf);
  const [convLien, setConvLien] = useState<number>(COUT_DEVIS_PDF_SEULS_DEFAULTS.convLien);
  const [recap, setRecap] = useState("");

  const result = useMemo(
    () =>
      computeCoutDevisPdfSeuls({
        devis,
        jamaisPct,
        obsoletesPct,
        minutes,
        taux,
        panier,
        convPdf,
        convLien,
      }),
    [devis, jamaisPct, obsoletesPct, minutes, taux, panier, convPdf, convLien],
  );

  useEffect(() => {
    setRecap(result.recap);
  }, [result.recap]);

  function reset() {
    setDevis(COUT_DEVIS_PDF_SEULS_DEFAULTS.devis);
    setJamaisPct(COUT_DEVIS_PDF_SEULS_DEFAULTS.jamaisPct);
    setObsoletesPct(COUT_DEVIS_PDF_SEULS_DEFAULTS.obsoletesPct);
    setMinutes(COUT_DEVIS_PDF_SEULS_DEFAULTS.minutes);
    setTaux(COUT_DEVIS_PDF_SEULS_DEFAULTS.taux);
    setPanier(COUT_DEVIS_PDF_SEULS_DEFAULTS.panier);
    setConvPdf(COUT_DEVIS_PDF_SEULS_DEFAULTS.convPdf);
    setConvLien(COUT_DEVIS_PDF_SEULS_DEFAULTS.convLien);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et friction PDF</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Devis / mois envoyés en PDF"
              value={devis}
              min={0}
              max={100000}
              step={1}
              onChange={setDevis}
            />
            <NumberField
              label="% jamais ouverts (estimé)"
              value={jamaisPct}
              min={0}
              max={100}
              step={1}
              onChange={setJamaisPct}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="% versions obsolètes / mauvaises PJ"
              value={obsoletesPct}
              min={0}
              max={100}
              step={1}
              onChange={setObsoletesPct}
            />
            <NumberField
              label="Minutes ressaisie / relance / devis"
              value={minutes}
              min={0}
              max={480}
              step={1}
              onChange={setMinutes}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Renvois, mauvais fichier, total divergent après forward. Chercher la version, renvoyer
            la PJ, clarifier sur WhatsApp.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Coût et conversion</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField label="Taux horaire chargé (€)" value={taux} min={0} max={10000} step={1} onChange={setTaux} />
            <NumberField label="Panier moyen HT (€)" value={panier} min={0} step={1} onChange={setPanier} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Taux conversion PDF actuel (%)"
              value={convPdf}
              min={0}
              max={100}
              step={0.5}
              onChange={setConvPdf}
            />
            <NumberField
              label="Taux conversion avec lien (%)"
              value={convLien}
              min={0}
              max={100}
              step={0.5}
              onChange={setConvLien}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Laissez le panier à 0 pour ignorer les opportunités manquées. L’écart de conversion
            (lien moins PDF) estime les deals récupérés. Hypothèse liée au suivi d’ouverture, aux
            versions uniques et aux relances contextuelles.
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
        <p className="mt-2 text-sm text-mk-on-dark/60">Coût total indicatif / mois (friction + opportunités)</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="Heures / mois perdues (ressaisie + relances PDF)" value={result.heuresLabel} />
          <Row label="Coût chargé de cette friction" value={result.coutFrictionLabel} tone="bad" />
          <Row label="Devis fantômes (jamais ouverts + versions foireuses)" value={result.fantomesLabel} tone="warn" />
          <Row label="Deals potentiellement récupérés / mois" value={result.dealsLabel} />
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

function toneClass(tone: CoutDevisPdfTone | "neutral") {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: CoutDevisPdfAlertTone) {
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
  tone?: CoutDevisPdfTone | "neutral";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: CoutDevisPdfTone | "neutral") {
  if (tone === "bad") return "font-semibold text-rose-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  return "font-medium";
}
