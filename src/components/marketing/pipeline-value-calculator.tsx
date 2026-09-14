"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { computePipelineValue, type PipelineMix } from "@/lib/marketing/pipeline-value";

const DEFAULT_MIX: PipelineMix = {
  hot: { mix: 20, win: 35 },
  warm: { mix: 50, win: 15 },
  cold: { mix: 30, win: 5 },
};

function money(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function PipelineValueCalculator() {
  const [openQuotes, setOpenQuotes] = useState(40);
  const [basket, setBasket] = useState(3500);
  const [currentRate, setCurrentRate] = useState(12);
  const [targetRate, setTargetRate] = useState(22);
  const [useMix, setUseMix] = useState(false);
  const [mix, setMix] = useState<PipelineMix>(DEFAULT_MIX);

  const result = useMemo(
    () =>
      computePipelineValue({
        openQuotes,
        basket,
        currentRate,
        targetRate,
        mix: useMix ? mix : undefined,
      }),
    [openQuotes, basket, currentRate, targetRate, useMix, mix],
  );

  const summary = useMix
    ? `${result.openQuotes} devis ouverts × ${money(result.basket)} · mix Hot/Warm/Cold = ${money(result.weighted ?? 0)} pondéré`
    : `${result.openQuotes} devis ouverts × ${money(result.basket)} · ${result.currentRate} % → ${result.targetRate} % = ${money(result.annual)} / an`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <Field
          label="Devis ouverts"
          hint="Dossiers encore dans le pipeline, pas encore gagnés ni perdus."
          value={openQuotes}
          min={1}
          max={2000}
          step={1}
          suffix="devis"
          onChange={setOpenQuotes}
        />
        <Field
          label="Panier moyen"
          hint="Montant typique d’un devis gagné, hors taxes."
          value={basket}
          min={100}
          max={250000}
          step={50}
          suffix="€"
          onChange={setBasket}
        />
        <Field
          label="Taux de conversion actuel"
          hint="Part des devis ouverts qui deviennent une commande, aujourd’hui."
          value={currentRate}
          min={0}
          max={100}
          step={1}
          suffix="%"
          onChange={setCurrentRate}
        />
        <Field
          label="Taux cible"
          hint="Ce qu’un meilleur scoring et des relances tenues rendent réaliste."
          value={targetRate}
          min={0}
          max={100}
          step={1}
          suffix="%"
          onChange={setTargetRate}
        />

        <label className="mt-6 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={useMix}
            onChange={(e) => setUseMix(e.target.checked)}
            className="mt-0.5 accent-[#E85D04]"
          />
          <span>
            <span className="font-semibold">Affiner avec le mix Hot / Warm / Cold</span>
            <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
              Optionnel. Pondère le CA selon la part et le taux de close de chaque seau.
            </span>
          </span>
        </label>

        {useMix ? (
          <div className="mt-4 space-y-4 rounded-xl bg-mk-bg p-4 ring-1 ring-mk-border">
            <BucketFields
              label="Hot"
              mix={mix.hot.mix}
              win={mix.hot.win}
              onMix={(value) => setMix((prev) => ({ ...prev, hot: { ...prev.hot, mix: value } }))}
              onWin={(value) => setMix((prev) => ({ ...prev, hot: { ...prev.hot, win: value } }))}
            />
            <BucketFields
              label="Warm"
              mix={mix.warm.mix}
              win={mix.warm.win}
              onMix={(value) => setMix((prev) => ({ ...prev, warm: { ...prev.warm, mix: value } }))}
              onWin={(value) => setMix((prev) => ({ ...prev, warm: { ...prev.warm, win: value } }))}
            />
            <BucketFields
              label="Cold"
              mix={mix.cold.mix}
              win={mix.cold.win}
              onMix={(value) => setMix((prev) => ({ ...prev, cold: { ...prev.cold, mix: value } }))}
              onWin={(value) => setMix((prev) => ({ ...prev, cold: { ...prev.cold, win: value } }))}
            />
            {result.mixTotal !== null && result.mixTotal !== 100 ? (
              <p className="text-[12px] leading-5 text-mk-faint">
                Le mix fait {result.mixTotal} %, pas 100 %. Le CA pondéré reflète la part saisie, pas tout le
                pipeline.
              </p>
            ) : null}
          </div>
        ) : null}
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
          Valeur du pipeline
        </p>
        <p className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{money(result.brut)}</p>
        <p className="mt-2 text-sm text-mk-on-dark/60">pipeline brut (ouverts × panier)</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="CA attendu actuel" value={money(result.caActuel)} />
          <Row label="CA cible" value={money(result.caCible)} />
          <Row label="Écart" value={money(result.gap)} accent />
          <Row label="Écart × 12" value={money(result.annual)} />
          {useMix && result.weighted !== null ? (
            <Row label="CA pondéré Hot/Warm/Cold" value={money(result.weighted)} accent />
          ) : null}
        </dl>

        {useMix && result.tip ? (
          <p className="mt-6 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-mk-on-dark/45">Hypothèse linéaire, hors saisonnalité.</p>
          <CopyButton text={summary} label="Copier le résultat" />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="mt-5 block first:mt-0">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-sm tabular-nums text-mk-accent">
          {suffix === "€" ? `${value.toLocaleString("fr-FR")} €` : `${value} ${suffix}`}
        </span>
      </span>
      <p className="mt-1 text-[12px] leading-5 text-mk-faint">{hint}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[#E85D04]"
      />
    </label>
  );
}

function BucketFields({
  label,
  mix,
  win,
  onMix,
  onWin,
}: {
  label: string;
  mix: number;
  win: number;
  onMix: (n: number) => void;
  onWin: (n: number) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <label className="mt-2 block">
        <span className="flex items-baseline justify-between gap-3 text-[12px]">
          <span className="text-mk-faint">Part du pipeline</span>
          <span className="tabular-nums text-mk-accent">{mix} %</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={mix}
          onChange={(e) => onMix(Number(e.target.value))}
          className="mt-2 w-full accent-[#E85D04]"
        />
      </label>
      <label className="mt-2 block">
        <span className="flex items-baseline justify-between gap-3 text-[12px]">
          <span className="text-mk-faint">Taux de close</span>
          <span className="tabular-nums text-mk-accent">{win} %</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={win}
          onChange={(e) => onWin(Number(e.target.value))}
          className="mt-2 w-full accent-[#E85D04]"
        />
      </label>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={accent ? "font-semibold text-mk-accent" : "font-medium"}>{value}</dd>
    </div>
  );
}
