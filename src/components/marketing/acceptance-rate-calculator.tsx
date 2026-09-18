"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { computeAcceptanceRate } from "@/lib/marketing/acceptance-rate";

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

function qty(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function AcceptanceRateCalculator() {
  const [envoyes, setEnvoyes] = useState(35);
  const [tauxActuel, setTauxActuel] = useState(28);
  const [panier, setPanier] = useState(4200);
  const [delai, setDelai] = useState(18);
  const [tauxCible, setTauxCible] = useState(36);
  const [marge, setMarge] = useState(30);

  const result = useMemo(
    () =>
      computeAcceptanceRate({
        envoyes,
        tauxActuel,
        panier,
        delai,
        tauxCible,
        marge,
      }),
    [envoyes, tauxActuel, panier, delai, tauxCible, marge],
  );

  const summary = `${qty(result.acceptesActuel)} → ${qty(result.acceptesCible)} acceptés · ${signedMoney(result.caGagne)} CA · ${signedMoney(result.margeGagnee)} marge · attente ${money(result.coutAttente)} / mois`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Votre volume actuel</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Nombre de devis envoyés / mois"
              value={envoyes}
              min={0}
              max={10000}
              step={1}
              onChange={setEnvoyes}
            />
            <NumberField
              label="Taux d’acceptation actuel (%)"
              value={tauxActuel}
              min={0}
              max={100}
              step={0.1}
              onChange={setTauxActuel}
            />
            <NumberField
              label="Panier moyen HT d’un devis accepté (€)"
              value={panier}
              min={0}
              max={500000}
              step={50}
              onChange={setPanier}
            />
            <NumberField
              label="Délai moyen avant signature / acceptation (jours)"
              value={delai}
              min={0}
              max={365}
              step={1}
              onChange={setDelai}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Prenez un mois représentatif. Le panier est le montant moyen HT des devis réellement
            acceptés, pas le panier catalogue théorique.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Scénario cible</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Taux d’acceptation cible (%)"
              value={tauxCible}
              min={0}
              max={100}
              step={0.1}
              onChange={setTauxCible}
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
            La marge sert à estimer la marge additionnelle. Le coût d’attente utilise le CA
            potentiel encore en circulation (devis non tranchés × panier), multiplié par le délai
            moyen / 30.
          </p>
        </fieldset>
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
          Résultat mensuel estimé
        </p>
        <p
          className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${
            result.caGagne < 0 ? "text-rose-300" : "text-emerald-300"
          }`}
        >
          {signedMoney(result.caGagne)}
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">CA HT potentiel gagné / mois</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row
            label="Devis acceptés actuel / cible"
            value={`${qty(result.acceptesActuel)} / ${qty(result.acceptesCible)}`}
          />
          <Row
            label="Devis acceptés en plus"
            value={`${result.delta >= 0 ? "+" : ""}${qty(result.delta)} devis / mois`}
            tone={result.delta >= 0 ? "ok" : "bad"}
          />
          <Row
            label="Marge potentielle gagnée"
            value={`${signedMoney(result.margeGagnee)} / mois`}
            tone={result.margeGagnee >= 0 ? "ok" : "bad"}
          />
          <Row
            label="Coût d’attente (valeur coincée × délai)"
            value={`${money(result.coutAttente)} / mois`}
            tone={result.coutAttente > 0 ? "bad" : "ok"}
          />
          <Row label="CA encore en circulation (non acceptés)" value={money(result.pipeline)} />
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
