"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { computeQuotingTime } from "@/lib/marketing/quoting-time";

function hours(value: number) {
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value || 0)}\u00a0h`;
}

function percent(value: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)}\u00a0%`;
}

export function QuotingTimeEstimator() {
  const [volTotal, setVolTotal] = useState(80);
  const [pctHot, setPctHot] = useState(20);
  const [pctWarm, setPctWarm] = useState(45);
  const [pctCold, setPctCold] = useState(35);
  const [volHot, setVolHot] = useState(16);
  const [volWarm, setVolWarm] = useState(36);
  const [volCold, setVolCold] = useState(28);
  const [useDirect, setUseDirect] = useState(false);
  const [minHot, setMinHot] = useState(50);
  const [minWarm, setMinWarm] = useState(30);
  const [minCold, setMinCold] = useState(15);
  const [minQual, setMinQual] = useState(8);
  const [minRev, setMinRev] = useState(12);
  const [people, setPeople] = useState(2);
  const [hoursPerMonth, setHoursPerMonth] = useState(40);

  const result = useMemo(
    () =>
      computeQuotingTime({
        volTotal,
        pctHot,
        pctWarm,
        pctCold,
        volHot,
        volWarm,
        volCold,
        useDirect,
        minHot,
        minWarm,
        minCold,
        minQual,
        minRev,
        people,
        hoursPerMonth,
      }),
    [
      volTotal,
      pctHot,
      pctWarm,
      pctCold,
      volHot,
      volWarm,
      volCold,
      useDirect,
      minHot,
      minWarm,
      minCold,
      minQual,
      minRev,
      people,
      hoursPerMonth,
    ],
  );

  const overloaded = result.deltaHours < 0;
  const utilLabel =
    result.utilization >= 900 ? "n/a (capacité 0)" : percent(result.utilization);
  const summary = `Hot ${result.volumes.hot} · Warm ${result.volumes.warm} · Cold ${result.volumes.cold} · ${hours(result.chargeHours)} de charge vs ${hours(result.capacityHours)} dispo · ${utilLabel}`;

  function applyDirect() {
    setUseDirect(true);
  }

  function applyMix() {
    setUseDirect(false);
    const next = computeQuotingTime({
      volTotal,
      pctHot,
      pctWarm,
      pctCold,
      volHot,
      volWarm,
      volCold,
      useDirect: false,
      minHot,
      minWarm,
      minCold,
      minQual,
      minRev,
      people,
      hoursPerMonth,
    }).volumes;
    setVolHot(next.hot);
    setVolWarm(next.warm);
    setVolCold(next.cold);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume mensuel</legend>
          <div className="mt-4">
            <NumberField
              label="Demandes / mois (total)"
              value={volTotal}
              min={0}
              max={5000}
              step={1}
              onChange={(n) => {
                setUseDirect(false);
                setVolTotal(n);
              }}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <NumberField
              label="% Hot"
              value={pctHot}
              min={0}
              max={100}
              step={1}
              onChange={(n) => {
                setUseDirect(false);
                setPctHot(n);
              }}
            />
            <NumberField
              label="% Warm"
              value={pctWarm}
              min={0}
              max={100}
              step={1}
              onChange={(n) => {
                setUseDirect(false);
                setPctWarm(n);
              }}
            />
            <NumberField
              label="% Cold"
              value={pctCold}
              min={0}
              max={100}
              step={1}
              onChange={(n) => {
                setUseDirect(false);
                setPctCold(n);
              }}
            />
          </div>
          {result.mixWarn && !result.mixOk && !useDirect ? (
            <p className="mt-3 text-[12px] leading-5 text-rose-800">{result.mixWarn}</p>
          ) : result.mixWarn ? (
            <p className="mt-3 text-[12px] leading-5 text-mk-faint">{result.mixWarn}</p>
          ) : null}

          <div className="mt-6 space-y-4 rounded-xl bg-mk-bg p-4 ring-1 ring-mk-border">
            <p className="text-sm font-semibold">Optionnel : volumes Hot / Warm / Cold directs</p>
            <p className="text-[12px] leading-5 text-mk-faint">
              Si vous connaissez déjà les volumes par seau, saisissez-les ici. Ça écrase le mix %.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField label="Hot / mois" value={volHot} min={0} max={2000} step={1} onChange={setVolHot} />
              <NumberField label="Warm / mois" value={volWarm} min={0} max={2000} step={1} onChange={setVolWarm} />
              <NumberField label="Cold / mois" value={volCold} min={0} max={2000} step={1} onChange={setVolCold} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyDirect}
                className="rounded-full bg-mk-accent px-4 py-2 text-sm font-semibold text-white"
              >
                Utiliser ces volumes (ignorer le mix)
              </button>
              <button
                type="button"
                onClick={applyMix}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-mk-accent ring-1 ring-mk-accent"
              >
                Recalculer depuis le mix %
              </button>
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Minutes moyennes de chiffrage par seau</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <NumberField label="Hot (min)" value={minHot} min={0} max={240} step={1} onChange={setMinHot} />
            <NumberField label="Warm (min)" value={minWarm} min={0} max={240} step={1} onChange={setMinWarm} />
            <NumberField label="Cold (min)" value={minCold} min={0} max={240} step={1} onChange={setMinCold} />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Temps pour produire le premier chiffrage (sans qualification ni revisions). Ajustez selon
            votre métier.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Optionnel : qualification et revisions</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Minutes qualification / demande"
              value={minQual}
              min={0}
              max={120}
              step={1}
              onChange={setMinQual}
            />
            <NumberField
              label="Minutes revisions / versions / demande"
              value={minRev}
              min={0}
              max={180}
              step={1}
              onChange={setMinRev}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Mettez 0 si vous ne voulez compter que le chiffrage pur. Les revisions couvrent v2 / v3,
            remises, scope creep.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Capacité des personnes qui chiffrent</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Nombre de personnes"
              value={people}
              min={0}
              max={40}
              step={1}
              onChange={setPeople}
            />
            <NumberField
              label="Heures dispo / personne / mois"
              value={hoursPerMonth}
              min={0}
              max={160}
              step={0.5}
              onChange={setHoursPerMonth}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Heures réellement dispo pour chiffrer (pas le total du contrat). Ex. 40 h/mois de
            chiffrage + revisions.
          </p>
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
          <Row
            label="Volumes Hot / Warm / Cold"
            value={`${result.volumes.hot} · ${result.volumes.warm} · ${result.volumes.cold}`}
          />
          <Row label="Charge mensuelle" value={hours(result.chargeHours)} />
          <Row
            label="Chiffrage / qualif / revisions"
            value={`${hours(result.chiffrageHours)} · ${hours(result.qualHours)} · ${hours(result.revHours)}`}
          />
          <Row label="Capacité mensuelle" value={hours(result.capacityHours)} />
          <Row
            label="Taux d’utilisation"
            value={utilLabel}
            accent={overloaded || result.utilization > 90}
          />
        </dl>

        <p className="mt-6 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-mk-on-dark/45">
            Ordre de grandeur pour piloter le temps de chiffrage et les versions, pas un planning RH.
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
