"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { computeRoiLogicielDevis } from "@/lib/marketing/roi-logiciel-devis";

function money(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function signedMoney(value: number) {
  return `${value >= 0 ? "+" : ""}${money(value)}`;
}

function hours(value: number) {
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)}\u00a0h`;
}

function days(value: number) {
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value)} jours`;
}

export function RoiLogicielDevisCalculator() {
  const [demandes, setDemandes] = useState(40);
  const [tempsAvant, setTempsAvant] = useState(45);
  const [coutHoraire, setCoutHoraire] = useState(35);
  const [tauxAvant, setTauxAvant] = useState(28);
  const [panier, setPanier] = useState(3500);
  const [tempsApres, setTempsApres] = useState(15);
  const [tauxApres, setTauxApres] = useState<number | null>(null);
  const [abonnement, setAbonnement] = useState(79);
  const [marge, setMarge] = useState(30);

  const result = useMemo(
    () =>
      computeRoiLogicielDevis({
        demandes,
        tempsAvant,
        coutHoraire,
        tauxAvant,
        panier,
        tempsApres,
        tauxApres,
        abonnement,
        marge,
      }),
    [demandes, tempsAvant, coutHoraire, tauxAvant, panier, tempsApres, tauxApres, abonnement, marge],
  );

  const summary = `${hours(result.heuresAvant)} → ${hours(result.heuresApres)} · temps ${signedMoney(result.gainTemps)} · marge ${signedMoney(result.gainMarge)} · ROI ${signedMoney(result.roiNet)} / mois`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Votre activité actuelle</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Demandes de devis par mois"
              value={demandes}
              min={0}
              max={10000}
              step={1}
              onChange={setDemandes}
            />
            <NumberField
              label="Temps moyen de chiffrage actuel (minutes)"
              value={tempsAvant}
              min={0}
              max={600}
              step={1}
              onChange={setTempsAvant}
            />
            <NumberField
              label="Coût horaire chargé commercial ou technicien (€)"
              value={coutHoraire}
              min={0}
              max={500}
              step={0.5}
              onChange={setCoutHoraire}
            />
            <NumberField
              label="Taux d’acceptation actuel (%)"
              value={tauxAvant}
              min={0}
              max={100}
              step={0.1}
              onChange={setTauxAvant}
            />
            <NumberField
              label="Panier moyen d’un devis accepté (€ HT)"
              value={panier}
              min={0}
              max={500000}
              step={50}
              onChange={setPanier}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Utilisez des moyennes sur un mois représentatif. Le coût chargé inclut salaire, charges et
            temps réellement mobilisable.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Scénario avec un logiciel de devis</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Temps de chiffrage estimé après outil (minutes)"
              value={tempsApres}
              min={0}
              max={600}
              step={1}
              onChange={setTempsApres}
            />
            <OptionalNumberField
              label="Taux d’acceptation estimé après outil (%)"
              value={tauxApres}
              min={0}
              max={100}
              step={0.1}
              placeholder="Identique à l’actuel"
              onChange={setTauxApres}
            />
            <NumberField
              label="Coût d’abonnement mensuel (€)"
              value={abonnement}
              min={0}
              max={5000}
              step={1}
              onChange={setAbonnement}
            />
            <NumberField
              label="Marge approximative sur ventes (%)"
              value={marge}
              min={0}
              max={100}
              step={0.1}
              onChange={setMarge}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Le taux après outil est facultatif : s’il est vide, le calcul conserve votre taux actuel.
            La marge sert uniquement à estimer la marge additionnelle.
          </p>
        </fieldset>
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
          Résultat mensuel estimé
        </p>
        <p
          className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${
            result.roiNet < 0 ? "text-rose-300" : "text-emerald-300"
          }`}
        >
          {signedMoney(result.roiNet)}
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">ROI net / mois, après abonnement</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row
            label="Heures de chiffrage avant / après"
            value={`${hours(result.heuresAvant)} / ${hours(result.heuresApres)}`}
          />
          <Row
            label="Coût du temps avant / après"
            value={`${money(result.coutAvant)} / ${money(result.coutApres)}`}
          />
          <Row
            label="Gain de temps valorisé"
            value={`${signedMoney(result.gainTemps)} / mois`}
            tone={result.gainTemps >= 0 ? "ok" : "bad"}
          />
          <Row
            label="Gain de marge lié au taux d’acceptation"
            value={`${signedMoney(result.gainMarge)} / mois`}
            tone={result.gainMarge >= 0 ? "ok" : "bad"}
          />
          <Row
            label="Délai de retour estimé"
            value={result.paybackDays === null ? "Non applicable" : days(result.paybackDays)}
            tone={result.paybackDays !== null && result.paybackDays <= 30 ? "ok" : undefined}
          />
        </dl>

        <p className="mt-6 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-mk-on-dark/45">
            Ordre de grandeur pour décider, pas une promesse de résultat. Calcul local.
          </p>
          <CopyButton text={summary} label="Copier le résultat" />
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
  max: number;
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

function OptionalNumberField({
  label,
  value,
  min,
  max,
  step,
  placeholder,
  onChange,
}: {
  label: string;
  value: number | null;
  min: number;
  max: number;
  step: number;
  placeholder?: string;
  onChange: (n: number | null) => void;
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
        placeholder={placeholder}
        value={value === null ? "" : value}
        onChange={(e) => {
          const raw = e.target.value.trim();
          if (raw === "") {
            onChange(null);
            return;
          }
          const next = Number(e.target.value);
          onChange(Number.isFinite(next) ? next : null);
        }}
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
  tone?: "ok" | "bad";
}) {
  const color =
    tone === "ok" ? "font-semibold text-emerald-300" : tone === "bad" ? "font-semibold text-rose-300" : "font-medium";
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${color}`}>{value}</dd>
    </div>
  );
}
