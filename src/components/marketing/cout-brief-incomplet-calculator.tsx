"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { computeCoutBriefIncomplet } from "@/lib/marketing/cout-brief-incomplet";

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

export function CoutBriefIncompletCalculator() {
  const [demandes, setDemandes] = useState(40);
  const [pctIncomplets, setPctIncomplets] = useState(45);
  const [minutes, setMinutes] = useState(35);
  const [coutHoraire, setCoutHoraire] = useState(45);
  const [pctMorts, setPctMorts] = useState(12);
  const [panier, setPanier] = useState(3800);

  const result = useMemo(
    () =>
      computeCoutBriefIncomplet({
        demandes,
        pctIncomplets,
        minutes,
        coutHoraire,
        pctMorts,
        panier,
      }),
    [demandes, pctIncomplets, minutes, coutHoraire, pctMorts, panier],
  );

  const caLabel = result.caEstime ? money(result.caPerdu) : "non estimé (mettez % morts + panier)";
  const summary = `${qty(result.briefs)} briefs incomplets · ${qty(result.heures)} h perdues · ${money(result.coutTemps)} temps · ${caLabel} CA · total ${money(result.total)} / mois`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et friction</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Demandes de devis / mois"
              value={demandes}
              min={0}
              max={10000}
              step={1}
              onChange={setDemandes}
            />
            <NumberField
              label="Part de briefs incomplets (%)"
              value={pctIncomplets}
              min={0}
              max={100}
              step={0.1}
              onChange={setPctIncomplets}
            />
            <NumberField
              label="Minutes perdues par brief incomplet (aller-retour)"
              value={minutes}
              min={0}
              max={600}
              step={1}
              onChange={setMinutes}
            />
            <NumberField
              label="Coût horaire chargé (€)"
              value={coutHoraire}
              min={0}
              max={500}
              step={1}
              onChange={setCoutHoraire}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Comptez mails, rappels et reprises de chiffrage liés à un brief flou (dimensions
            manquantes, budget absent, photos oubliées). Pas le temps de chiffrage « normal ».
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Pertes optionnelles (dossiers morts)</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Part des incomplets qui meurent faute de brief (%)"
              value={pctMorts}
              min={0}
              max={100}
              step={0.1}
              onChange={setPctMorts}
            />
            <NumberField
              label="Panier moyen HT perdu (€)"
              value={panier}
              min={0}
              max={500000}
              step={50}
              onChange={setPanier}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Laissez 0 sur le % de morts si vous voulez seulement le coût temps. Le panier sert
            uniquement au CA potentiel perdu.
          </p>
        </fieldset>
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
          Résultat mensuel estimé
        </p>
        <p
          className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${
            result.total > 0 ? "text-rose-300" : "text-emerald-300"
          }`}
        >
          {money(result.total)}
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">Coût total approximatif (temps + CA) / mois</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="Briefs incomplets / mois" value={qty(result.briefs)} />
          <Row
            label="Heures perdues / mois"
            value={`${qty(result.heures)} h`}
            tone={result.heures > 0 ? "bad" : "ok"}
          />
          <Row
            label="Coût temps"
            value={`${money(result.coutTemps)} / mois`}
            tone={result.coutTemps > 0 ? "bad" : "ok"}
          />
          <Row
            label="CA potentiel perdu"
            value={result.caEstime ? `${money(result.caPerdu)} / mois` : "non estimé"}
            tone={result.caPerdu > 0 ? "bad" : "ok"}
          />
        </dl>

        <p className="mt-6 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-mk-on-dark/45">
            Ordre de grandeur pour prioriser la qualification du brief, pas une comptabilité exacte.
            Calcul local.
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
