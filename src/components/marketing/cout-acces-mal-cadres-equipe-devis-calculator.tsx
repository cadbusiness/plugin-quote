"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  ACCESS_COST_DEFAULTS,
  computeAccessCost,
  fmtEur,
  fmtNum,
  type AccessCostTone,
} from "@/lib/marketing/cout-acces-mal-cadres-equipe-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const NBSP_H = "\u00a0h";

export function CoutAccesMalCadresEquipeDevisCalculator() {
  const [membres, setMembres] = useState(String(ACCESS_COST_DEFAULTS.membres));
  const [adminsEnTrop, setAdminsEnTrop] = useState(String(ACCESS_COST_DEFAULTS.adminsEnTrop));
  const [incidentsParAdmin, setIncidentsParAdmin] = useState(String(ACCESS_COST_DEFAULTS.incidentsParAdmin));
  const [heuresParIncident, setHeuresParIncident] = useState(String(ACCESS_COST_DEFAULTS.heuresParIncident));
  const [blocagesParMois, setBlocagesParMois] = useState(String(ACCESS_COST_DEFAULTS.blocagesParMois));
  const [minutesParBlocage, setMinutesParBlocage] = useState(String(ACCESS_COST_DEFAULTS.minutesParBlocage));
  const [demandesRefroidies, setDemandesRefroidies] = useState(String(ACCESS_COST_DEFAULTS.demandesRefroidies));
  const [pointsSignaturePerdus, setPointsSignaturePerdus] = useState(String(ACCESS_COST_DEFAULTS.pointsSignaturePerdus));
  const [tauxHoraire, setTauxHoraire] = useState(String(ACCESS_COST_DEFAULTS.tauxHoraire));
  const [panierMoyen, setPanierMoyen] = useState(String(ACCESS_COST_DEFAULTS.panierMoyen));
  const [heuresMiseEnOrdre, setHeuresMiseEnOrdre] = useState(String(ACCESS_COST_DEFAULTS.heuresMiseEnOrdre));

  const result = useMemo(
    () =>
      computeAccessCost({
        membres,
        adminsEnTrop,
        incidentsParAdmin,
        heuresParIncident,
        blocagesParMois,
        minutesParBlocage,
        demandesRefroidies,
        pointsSignaturePerdus,
        tauxHoraire,
        panierMoyen,
        heuresMiseEnOrdre,
      }),
    [
      membres,
      adminsEnTrop,
      incidentsParAdmin,
      heuresParIncident,
      blocagesParMois,
      minutesParBlocage,
      demandesRefroidies,
      pointsSignaturePerdus,
      tauxHoraire,
      panierMoyen,
      heuresMiseEnOrdre,
    ],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Votre équipe</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="membres"
              label="Personnes qui utilisent l'outil"
              value={membres}
              min={0}
              step={1}
              onChange={setMembres}
            />
            <Field
              id="adminsEnTrop"
              label="Comptes Admin qui n'en ont pas besoin"
              hint="Personnes qui n'ont modifié ni funnel, ni catalogue, ni automatisation depuis trois mois. Un identifiant partagé compte pour autant de personnes qui l'utilisent."
              value={adminsEnTrop}
              min={0}
              step={1}
              onChange={setAdminsEnTrop}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Fuite 1 : réglages modifiés par erreur</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="incidentsParAdmin"
              label="Incidents par Admin en trop et par mois"
              hint="Question de funnel supprimée, prix d'option changé, règle Si/Alors modifiée pour un cas particulier. 0,5 = un incident tous les deux mois."
              value={incidentsParAdmin}
              min={0}
              step={0.1}
              onChange={setIncidentsParAdmin}
            />
            <Field
              id="heuresParIncident"
              label="Heures pour repérer et corriger un incident"
              value={heuresParIncident}
              min={0}
              step={0.5}
              onChange={setHeuresParIncident}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Fuite 2 : commerciaux bloqués</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="blocagesParMois"
              label="Blocages par mois"
              hint="Demande transférée par email faute de compte, réponse qui attend un Admin absent, dossier qu'on cherche dans une boîte partagée."
              value={blocagesParMois}
              min={0}
              step={1}
              onChange={setBlocagesParMois}
            />
            <Field
              id="minutesParBlocage"
              label="Minutes perdues par blocage"
              value={minutesParBlocage}
              min={0}
              step={1}
              onChange={setMinutesParBlocage}
            />
            <Field
              id="demandesRefroidies"
              label="Dont demandes où le prospect attend sa réponse"
              hint="Ne peut pas dépasser le nombre de blocages."
              value={demandesRefroidies}
              min={0}
              step={1}
              onChange={setDemandesRefroidies}
            />
            <Field
              id="pointsSignaturePerdus"
              label="Points de signature perdus par réponse retardée (%)"
              value={pointsSignaturePerdus}
              min={0}
              max={100}
              step={1}
              onChange={setPointsSignaturePerdus}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Vos coûts</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="tauxHoraire"
              label="Coût horaire chargé (€)"
              value={tauxHoraire}
              min={0}
              step={1}
              onChange={setTauxHoraire}
            />
            <Field
              id="panierMoyen"
              label="Panier moyen d'une affaire signée (€ HT)"
              value={panierMoyen}
              min={0}
              step={100}
              onChange={setPanierMoyen}
            />
            <Field
              id="heuresMiseEnOrdre"
              label="Heures pour remettre les rôles en ordre"
              hint="Une seule fois, amorties sur 12 mois : inviter chacun avec son adresse, passer les Admins inutiles en Commercial, nommer un Admin de secours."
              value={heuresMiseEnOrdre}
              min={0}
              max={40}
              step={0.5}
              onChange={setHeuresMiseEnOrdre}
            />
          </div>
          <p className="mt-4 text-[12px] leading-5 text-mk-faint">
            Toutes les valeurs par défaut sont des hypothèses d&apos;exemple, pas des moyennes de marché.
            Remplacez-les par vos propres chiffres.
          </p>
        </fieldset>
      </form>

      <div className="space-y-6">
        <section className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6" aria-live="polite">
          <h2 className="text-sm font-semibold">Ce que coûtent des accès mal cadrés</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Metric label="Incidents de configuration par mois" value={fmtNum(result.incidentsMois)} />
            <Metric label="Heures perdues en corrections par mois" value={fmtNum(result.heuresIncidents) + NBSP_H} />
            <Metric label="Heures perdues en blocages par mois" value={fmtNum(result.heuresBlocages) + NBSP_H} />
            <Metric label="Coût de ce temps par mois" value={fmtEur(result.coutTemps)} />
            <Metric label="Affaires refroidies par mois" value={fmtNum(result.dealsPerdus)} />
            <Metric label="Chiffre d'affaires manqué par mois" value={fmtEur(result.caManque)} />
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-sm font-semibold">Avec des rôles qui suivent l&apos;usage</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <MetricLight label="Mise en ordre amortie par mois" value={fmtEur(result.coutMiseEnOrdreMensuel)} />
            <MetricLight label="Heures nettes rendues par mois" value={fmtNum(result.heuresNettes) + NBSP_H} />
            <MetricLight
              label="Coût mensuel évité"
              value={fmtEur(result.coutNetMensuelEvite)}
              tone={result.coutNetMensuelEvite < 0 ? "bad" : "ok"}
            />
            <MetricLight label="Sur 12 mois" value={fmtEur(result.coutNetAnnuelEvite)} />
          </dl>
          <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.verdict.tone)}`}>
            {result.verdict.text}
          </p>
          <p className="mt-4 text-[13px] leading-5 text-mk-faint">
            Le calcul suppose qu&apos;une fois les rôles remis en ordre, les incidents venant des Admins en trop et
            les blocages disparaissent. C&apos;est une borne haute : une erreur de configuration reste possible chez
            un Admin légitime.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-sm font-semibold">Pour lire vos chiffres</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-muted">
            {result.conseils.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-sm font-semibold">Récapitulatif</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-mk-bg px-3 py-3 text-sm leading-6 text-mk-ink ring-1 ring-mk-border">
            {result.recap}
          </pre>
          <div className="mt-3 flex justify-end">
            <CopyButton text={result.recap} label="Copier" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  min: number;
  max?: number;
  step: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold">{label}</span>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
      />
      {hint ? <span className="mt-1 block text-[12px] leading-5 text-mk-faint">{hint}</span> : null}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
      <dt className="text-mk-on-dark/60">{label}</dt>
      <dd className="text-right text-base font-semibold tabular-nums text-mk-accent">{value}</dd>
    </div>
  );
}

function MetricLight({ label, value, tone }: { label: string; value: string; tone?: "ok" | "bad" }) {
  const toneClass = tone === "bad" ? "text-rose-700" : tone === "ok" ? "text-emerald-700" : "text-mk-accent";
  return (
    <div className="flex items-start justify-between gap-4 border-t border-mk-border pt-3 first:border-t-0 first:pt-0">
      <dt className="text-mk-muted">{label}</dt>
      <dd className={`text-right text-base font-semibold tabular-nums ${toneClass}`}>{value}</dd>
    </div>
  );
}

function alertClass(tone: AccessCostTone) {
  if (tone === "ok") return "bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "bg-amber-50 text-amber-900";
  if (tone === "bad") return "bg-rose-50 text-rose-800";
  return "bg-mk-band text-mk-ink";
}
