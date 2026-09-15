"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { applyTeamCapacityMix, computeTeamCapacity } from "@/lib/marketing/team-capacity";

function hours(value: number) {
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value || 0)}\u00a0h`;
}

function percent(value: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)}\u00a0%`;
}

export function TeamCapacityCalculator() {
  const [reps, setReps] = useState(3);
  const [hoursPerWeek, setHoursPerWeek] = useState(12);
  const [weeksPerMonth, setWeeksPerMonth] = useState(4.3);
  const [minHot, setMinHot] = useState(45);
  const [minWarm, setMinWarm] = useState(25);
  const [minCold, setMinCold] = useState(12);
  const [volHot, setVolHot] = useState(20);
  const [volWarm, setVolWarm] = useState(45);
  const [volCold, setVolCold] = useState(35);
  const [useMix, setUseMix] = useState(false);
  const [volTotal, setVolTotal] = useState(100);
  const [pctHot, setPctHot] = useState(20);
  const [pctWarm, setPctWarm] = useState(45);
  const [pctCold, setPctCold] = useState(35);
  const [mixApplyError, setMixApplyError] = useState("");

  const result = useMemo(
    () =>
      computeTeamCapacity({
        reps,
        hoursPerWeek,
        weeksPerMonth,
        minHot,
        minWarm,
        minCold,
        volHot,
        volWarm,
        volCold,
        mixOpen: useMix,
        pctHot,
        pctWarm,
        pctCold,
      }),
    [
      reps,
      hoursPerWeek,
      weeksPerMonth,
      minHot,
      minWarm,
      minCold,
      volHot,
      volWarm,
      volCold,
      useMix,
      pctHot,
      pctWarm,
      pctCold,
    ],
  );

  const overloaded = result.deltaHours < 0;
  const utilLabel =
    result.utilization >= 900 ? "n/a (capacité 0)" : percent(result.utilization);
  const summary = `${result.reps} commerciaux · ${hours(result.capacityHours)} dispo vs ${hours(result.chargeHours)} de charge · ${utilLabel}`;

  function applyMix() {
    const next = applyTeamCapacityMix(volTotal, pctHot, pctWarm, pctCold);
    if (!next) {
      setMixApplyError("Corrigez le mix à 100 % avant d’appliquer.");
      return;
    }
    setMixApplyError("");
    setVolHot(next.volHot);
    setVolWarm(next.volWarm);
    setVolCold(next.volCold);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Capacité équipe</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Nombre de commerciaux"
              value={reps}
              min={0}
              max={40}
              step={1}
              onChange={setReps}
            />
            <NumberField
              label="Heures dispo / commercial / semaine"
              value={hoursPerWeek}
              min={0}
              max={40}
              step={0.5}
              onChange={setHoursPerWeek}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Heures réellement dispo pour traiter les devis (pas le total du contrat). Ex. 12 h/semaine
            de traitement leads + chiffrage.
          </p>
          <div className="mt-4">
            <NumberField
              label="Semaines / mois (pour annualiser la capacité)"
              value={weeksPerMonth}
              min={1}
              max={5}
              step={0.1}
              onChange={setWeeksPerMonth}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Minutes moyennes par demande</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <NumberField label="Hot (min)" value={minHot} min={0} max={240} step={1} onChange={setMinHot} />
            <NumberField label="Warm (min)" value={minWarm} min={0} max={240} step={1} onChange={setMinWarm} />
            <NumberField label="Cold (min)" value={minCold} min={0} max={240} step={1} onChange={setMinCold} />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Incluez qualification + première réponse + chiffrage moyen. Ajustez selon votre métier.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume mensuel</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <NumberField label="Hot / mois" value={volHot} min={0} max={2000} step={1} onChange={setVolHot} />
            <NumberField label="Warm / mois" value={volWarm} min={0} max={2000} step={1} onChange={setVolWarm} />
            <NumberField label="Cold / mois" value={volCold} min={0} max={2000} step={1} onChange={setVolCold} />
          </div>

          <label className="mt-6 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={useMix}
              onChange={(e) => {
                setUseMix(e.target.checked);
                setMixApplyError("");
              }}
              className="mt-0.5 accent-[#E85D04]"
            />
            <span>
              <span className="font-semibold">Optionnel : saisir un total + mix %</span>
              <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
                Si vous connaissez surtout le volume total, répartissez en % (visez 100). Ça écrase les
                volumes ci-dessus.
              </span>
            </span>
          </label>

          {useMix ? (
            <div className="mt-4 space-y-4 rounded-xl bg-mk-bg p-4 ring-1 ring-mk-border">
              <NumberField
                label="Total demandes / mois"
                value={volTotal}
                min={0}
                max={5000}
                step={1}
                onChange={setVolTotal}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <NumberField label="% Hot" value={pctHot} min={0} max={100} step={1} onChange={setPctHot} />
                <NumberField label="% Warm" value={pctWarm} min={0} max={100} step={1} onChange={setPctWarm} />
                <NumberField label="% Cold" value={pctCold} min={0} max={100} step={1} onChange={setPctCold} />
              </div>
              {mixApplyError || (result.mixWarn && !result.mixOk) ? (
                <p className="text-[12px] leading-5 text-rose-800">{mixApplyError || result.mixWarn}</p>
              ) : result.mixWarn ? (
                <p className="text-[12px] leading-5 text-mk-faint">{result.mixWarn}</p>
              ) : null}
              <button
                type="button"
                onClick={applyMix}
                className="rounded-full bg-mk-accent px-4 py-2 text-sm font-semibold text-white"
              >
                Appliquer le mix aux volumes
              </button>
            </div>
          ) : null}
        </fieldset>
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
          Écart capacité − charge
        </p>
        <p
          className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${
            overloaded ? "text-rose-300" : "text-emerald-300"
          }`}
        >
          {result.deltaHours >= 0 ? "+" : ""}
          {hours(result.deltaHours)}
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">par mois, aux minutes et volumes indiqués</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="Capacité mensuelle" value={hours(result.capacityHours)} />
          <Row label="Charge mensuelle" value={hours(result.chargeHours)} />
          <Row
            label="Taux d’utilisation"
            value={utilLabel}
            accent={overloaded || result.utilization > 90}
          />
          <Row
            label="Détail Hot / Warm / Cold"
            value={`${hours(result.chargeHot)} · ${hours(result.chargeWarm)} · ${hours(result.chargeCold)}`}
          />
        </dl>

        <p className="mt-6 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-mk-on-dark/45">
            Ordre de grandeur pour piloter l’assignation et les SLA, pas un planning RH.
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
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40"
      />
    </label>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${accent ? "font-semibold text-mk-accent" : "font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}
