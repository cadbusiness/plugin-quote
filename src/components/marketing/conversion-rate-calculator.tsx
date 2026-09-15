"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { computeConversionRate, type ConversionMix } from "@/lib/marketing/conversion-rate";

const DEFAULT_MIX: ConversionMix = {
  hot: { mix: 20, win: 45 },
  warm: { mix: 45, win: 20 },
  cold: { mix: 35, win: 6 },
};

function money(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)));
}

export function ConversionRateCalculator() {
  const [quotesSent, setQuotesSent] = useState(40);
  const [basket, setBasket] = useState(5500);
  const [currentRate, setCurrentRate] = useState(18);
  const [targetRate, setTargetRate] = useState(25);
  const [useMix, setUseMix] = useState(false);
  const [mix, setMix] = useState<ConversionMix>(DEFAULT_MIX);

  const result = useMemo(
    () =>
      computeConversionRate({
        quotesSent,
        basket,
        currentRate,
        targetRate,
        mix: useMix ? mix : undefined,
      }),
    [quotesSent, basket, currentRate, targetRate, useMix, mix],
  );

  const summary = useMix
    ? `${result.quotesSent} devis/mois × ${money(result.basket)} · mix Hot/Warm/Cold = ${money(result.weighted ?? 0)} pondéré`
    : `${result.quotesSent} devis/mois × ${money(result.basket)} · ${result.currentRate} % → ${result.targetRate} % = ${money(result.annualGain)} / an`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <Field
          label="Devis envoyés par mois"
          hint="PDF, e-mail ou configurateur : le volume que vous produisez."
          value={quotesSent}
          min={0}
          max={2000}
          step={1}
          suffix="devis"
          onChange={setQuotesSent}
        />
        <Field
          label="Panier moyen"
          hint="Montant typique d’un devis gagné, hors taxes."
          value={basket}
          min={0}
          max={250000}
          step={50}
          suffix="€"
          onChange={setBasket}
        />
        <Field
          label="Taux de conversion actuel"
          hint="Part des devis envoyés qui deviennent une commande, aujourd’hui."
          value={currentRate}
          min={1}
          max={80}
          step={1}
          suffix="%"
          onChange={setCurrentRate}
        />
        <Field
          label="Taux de conversion cible"
          hint="Ce qu’un meilleur brief, score et relances rendent réaliste."
          value={targetRate}
          min={1}
          max={90}
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
            <span className="font-semibold">Optionnel : mix Hot / Warm / Cold</span>
            <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
              Répartissez vos devis envoyés (total 100 %). Les taux de close par seau peaufinent une lecture pondérée.
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
            {result.mixTotal !== null && !result.mixOk ? (
              <p className="text-[12px] leading-5 text-rose-800">
                Le mix fait {result.mixTotal} % (visez 100 %).
              </p>
            ) : null}
          </div>
        ) : null}
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
          Gain de conversion
        </p>
        <p className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{money(result.monthlyGain)}</p>
        <p className="mt-2 text-sm text-mk-on-dark/60">par mois, si le taux cible est tenu</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="CA actuel / mois" value={money(result.monthlyCurrent)} />
          <Row label="CA cible / mois" value={money(result.monthlyTarget)} />
          <Row label="Gain mensuel" value={money(result.monthlyGain)} accent />
          <Row label="Gain annualisé (×12)" value={money(result.annualGain)} />
          {useMix && result.weighted !== null ? (
            <Row label="CA mensuel pondéré Hot/Warm/Cold" value={money(result.weighted)} accent />
          ) : null}
        </dl>

        <p className="mt-6 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-mk-on-dark/45">Ordre de grandeur, pas une prévision.</p>
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
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="flex items-baseline justify-between gap-3 text-[12px]">
            <span className="text-mk-muted">Part du mix</span>
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
        <label className="block">
          <span className="flex items-baseline justify-between gap-3 text-[12px]">
            <span className="text-mk-muted">Close</span>
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
