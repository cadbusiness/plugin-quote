"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { computeGainTempsCatalogue } from "@/lib/marketing/gain-temps-catalogue";

const DEFAULTS = {
  nbDevis: 40,
  minManuel: 45,
  pctBiblio: 70,
  minGagnees: 18,
  taux: 55,
};

function money(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function qty(value: number, digits = 1) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function GainTempsCatalogueCalculator() {
  const [nbDevis, setNbDevis] = useState(DEFAULTS.nbDevis);
  const [minManuel, setMinManuel] = useState(DEFAULTS.minManuel);
  const [pctBiblio, setPctBiblio] = useState(DEFAULTS.pctBiblio);
  const [minGagnees, setMinGagnees] = useState(DEFAULTS.minGagnees);
  const [taux, setTaux] = useState(DEFAULTS.taux);

  const result = useMemo(
    () => computeGainTempsCatalogue({ nbDevis, minManuel, pctBiblio, minGagnees, taux }),
    [nbDevis, minManuel, pctBiblio, minGagnees, taux],
  );

  function reset() {
    setNbDevis(DEFAULTS.nbDevis);
    setMinManuel(DEFAULTS.minManuel);
    setPctBiblio(DEFAULTS.pctBiblio);
    setMinGagnees(DEFAULTS.minGagnees);
    setTaux(DEFAULTS.taux);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et temps actuel</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Nombre de devis / mois"
              value={nbDevis}
              min={0}
              max={100000}
              step={1}
              onChange={setNbDevis}
            />
            <NumberField
              label="Minutes par devis (saisie manuelle)"
              value={minManuel}
              min={0}
              max={24 * 60}
              step={1}
              onChange={setMinManuel}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Temps moyen aujourd’hui pour produire le premier devis (saisie Excel / copier-coller), hors
            visite technique.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Adoption catalogue / kits</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="% de lignes reprises depuis la biblio (0-100)"
              value={pctBiblio}
              min={0}
              max={100}
              step={1}
              onChange={setPctBiblio}
            />
            <NumberField
              label="Minutes gagnées / devis grâce au catalogue"
              value={minGagnees}
              min={0}
              max={24 * 60}
              step={1}
              onChange={setMinGagnees}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Si 70 % des lignes viennent de kits / articles, combien de minutes gagnez-vous en moyenne
            par devis ? Ajustez selon votre métier. Le % sert surtout au récap d’adoption.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Valorisation</legend>
          <div className="mt-4">
            <NumberField
              label="Taux horaire chargé (€ / h)"
              value={taux}
              min={0}
              max={10000}
              step={1}
              onChange={setTaux}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Coût chargé estimateur / commercial (salaire + charges + overhead simple). Ordre de grandeur
            PME, à adapter.
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
        <p
          className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${
            result.tone === "gain" ? "text-emerald-300" : "text-mk-on-dark"
          }`}
        >
          {qty(result.hMois, 1)} h
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">Heures gagnées / mois</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="Minutes totales gagnées / mois" value={`${qty(result.minMois, 0)} min`} />
          <Row label="Équivalent € / mois" value={money(result.euroMois)} tone="ok" />
          <Row label="Heures / an (×12)" value={`${qty(result.hAn, 0)} h`} />
          <Row label="Équivalent € / an" value={money(result.euroAn)} />
          <Row label="Temps moyen / devis après gain" value={`${qty(result.minApres, 0)} min`} />
        </dl>

        <p
          className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${
            result.tone === "gain" ? "bg-emerald-400/15 text-emerald-200" : "bg-white/5 text-mk-on-dark/70"
          }`}
        >
          {result.alert}
        </p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>

        <textarea
          readOnly
          value={result.recap}
          className="mt-6 h-40 w-full resize-y rounded-xl bg-white/5 px-3 py-2 text-xs leading-5 text-mk-on-dark ring-1 ring-white/10"
        />
        <div className="mt-3 flex justify-end">
          <CopyButton text={result.recap} label="Copier le récap" />
        </div>
      </div>
    </div>
  );
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
        onChange={(e) => onChange(Number(e.target.value) || 0)}
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
  tone?: "ok";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${tone === "ok" ? "font-semibold text-emerald-300" : "font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}
