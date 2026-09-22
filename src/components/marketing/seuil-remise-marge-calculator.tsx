"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { computeSeuilRemiseMarge, type SeuilRemiseMode } from "@/lib/marketing/seuil-remise-marge";

function money(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function qty(value: number, digits = 1) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function SeuilRemiseMargeCalculator() {
  const [prix, setPrix] = useState(10000);
  const [mode, setMode] = useState<SeuilRemiseMode>("cout");
  const [cout, setCout] = useState(7200);
  const [margeActuelle, setMargeActuelle] = useState(28);
  const [tva, setTva] = useState(20);
  const [plancher, setPlancher] = useState(22);
  const [remise, setRemise] = useState(12);
  const [recap, setRecap] = useState("");

  const result = useMemo(
    () => computeSeuilRemiseMarge({ prix, mode, cout, margeActuelle, tva, plancher, remise }),
    [prix, mode, cout, margeActuelle, tva, plancher, remise],
  );

  useEffect(() => {
    setRecap(result.recap);
  }, [result.recap]);

  const alertTone =
    result.alert === "ok" ? "text-emerald-300" : result.alert === "bad" ? "text-rose-300" : "text-mk-on-dark";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Prix et coût</legend>
          <div className="mt-4">
            <NumberField label="Prix catalogue HT (€)" value={prix} min={0} step={1} onChange={setPrix} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Mode coût">
            <ModeChip checked={mode === "cout"} onSelect={() => setMode("cout")} label="Coût de revient HT" />
            <ModeChip checked={mode === "marge"} onSelect={() => setMode("marge")} label="Marge actuelle %" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {mode === "cout" ? (
              <NumberField label="Coût de revient HT (€)" value={cout} min={0} step={1} onChange={setCout} />
            ) : (
              <NumberField
                label="Marge actuelle (%)"
                value={margeActuelle}
                min={0}
                max={99}
                step={0.1}
                onChange={setMargeActuelle}
              />
            )}
            <NumberField label="TVA (%)" value={tva} min={0} max={100} step={0.1} onChange={setTva} />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Base habituelle B2B France : TVA 20 %. Le coût de revient inclut matière, sous-traitance et heures
            atelier chargées (ordre de grandeur).
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Plancher et remise envisagée</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Marge minimale cible (%)"
              value={plancher}
              min={0}
              max={99}
              step={0.1}
              onChange={setPlancher}
            />
            <NumberField
              label="Remise déjà envisagée (%)"
              hint="Optionnel. 0 pour le seuil seul."
              value={remise}
              min={0}
              max={100}
              step={0.1}
              onChange={setRemise}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Laissez 0 en remise envisagée si vous voulez seulement le seuil max. Sinon l’outil compare votre geste
            au plancher.
          </p>
        </fieldset>
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6" aria-live="polite">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">Résultat</p>
        <p className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${result.alert === "bad" ? "text-rose-300" : "text-emerald-300"}`}>
          {qty(result.remiseMaxPct, 1)} %
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">Remise max autorisée · {money(result.remiseMaxEuro)}</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="Marge actuelle" value={`${money(result.margeEuro)} (${qty(result.margePct, 1)} %)`} />
          <Row label="Prix plancher HT" value={money(result.prixPlancher)} />
          <Row label="Prix plancher TTC" value={money(result.prixPlancherTtc)} />
          <Row
            label="Si remise saisie : marge restante"
            value={`${money(result.margeApresEuro)} (${qty(result.margeApresPct, 1)} %)`}
            tone={result.alert === "bad" ? "bad" : result.alert === "ok" ? "ok" : undefined}
          />
        </dl>

        <p className={`mt-6 rounded-xl bg-white/5 px-3 py-3 text-sm font-semibold leading-6 ${alertTone}`}>
          {result.alertText}
        </p>
        <p className="mt-4 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif, pas un conseil financier. Aucune donnée n’est envoyée.
        </p>

        <label className="mt-6 block text-xs text-mk-on-dark/55" htmlFor="seuil-remise-recap">
          Texte récap / checklist (modifiable avant copie)
        </label>
        <textarea
          id="seuil-remise-recap"
          value={recap}
          onChange={(event) => setRecap(event.target.value)}
          className="mt-2 h-44 w-full resize-y rounded-xl bg-white/5 px-3 py-2 text-xs leading-5 text-mk-on-dark ring-1 ring-white/10"
        />
        <div className="mt-3 flex justify-end">
          <CopyButton text={recap} label="Copier le récap" />
        </div>
      </div>
    </div>
  );
}

function ModeChip({
  checked,
  onSelect,
  label,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
        checked ? "bg-mk-accent text-white ring-mk-accent" : "bg-mk-bg text-mk-ink ring-mk-border"
      }`}
    >
      <input type="radio" name="seuil-remise-mode" checked={checked} onChange={onSelect} className="sr-only" />
      {label}
    </label>
  );
}

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max?: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {hint ? <span className="mt-0.5 block text-[12px] font-normal text-mk-faint">{hint}</span> : null}
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
  tone?: "ok" | "bad";
}) {
  const color = tone === "ok" ? "text-emerald-300" : tone === "bad" ? "text-rose-300" : "text-mk-on-dark";
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/65">{label}</dt>
      <dd className={`shrink-0 text-right font-semibold tabular-nums ${color}`}>{value}</dd>
    </div>
  );
}
