"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { computeLostQuote } from "@/lib/marketing/lost-quote";

function money(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)));
}

export function LostQuoteCalculator() {
  const [quotesPerMonth, setQuotesPerMonth] = useState(40);
  const [basket, setBasket] = useState(3500);
  const [currentRate, setCurrentRate] = useState(12);
  const [targetRate, setTargetRate] = useState(22);

  const result = useMemo(
    () => computeLostQuote({ quotesPerMonth, basket, currentRate, targetRate }),
    [quotesPerMonth, basket, currentRate, targetRate],
  );

  const summary = `${result.quotes} devis/mois × ${money(result.cart)} · ${Math.round(result.current * 100)} % → ${Math.round(result.target * 100)} % = ${money(result.annualGap)} / an`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="rounded-[22px] bg-white p-5 ring-1 ring-black/6 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <Field
          label="Devis envoyés par mois"
          hint="PDF, e-mail ou configurateur : le volume que vous produisez."
          value={quotesPerMonth}
          min={1}
          max={2000}
          step={1}
          suffix="devis"
          onChange={setQuotesPerMonth}
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
          label="Taux de closing actuel"
          hint="Part des devis qui deviennent une commande, aujourd’hui."
          value={currentRate}
          min={0}
          max={100}
          step={1}
          suffix="%"
          onChange={setCurrentRate}
        />
        <Field
          label="Taux cible avec relances"
          hint="Ce que 5 touches réellement envoyées rendent réaliste."
          value={targetRate}
          min={0}
          max={100}
          step={1}
          suffix="%"
          onChange={setTargetRate}
        />
      </form>

      <div className="rounded-[22px] bg-[#1A1510] p-5 text-[#F6F0E8] sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F3B184]">
          CA laissé sur la table
        </p>
        <p className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {money(result.annualGap)}
        </p>
        <p className="mt-2 text-sm text-[#F6F0E8]/60">par an, si le taux cible est tenu</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="CA actuel / mois" value={money(result.monthlyCurrent)} />
          <Row label="CA cible / mois" value={money(result.monthlyTarget)} />
          <Row label="Écart mensuel" value={money(result.monthlyGap)} accent />
          <Row
            label="Devis gagnés en plus / mois"
            value={result.extraWins.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}
          />
        </dl>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-[#F6F0E8]/45">Hypothèse linéaire, hors saisonnalité.</p>
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
        <span className="text-sm tabular-nums text-[#E85D04]">
          {suffix === "€" ? `${value.toLocaleString("fr-FR")} €` : `${value} ${suffix}`}
        </span>
      </span>
      <p className="mt-1 text-[12px] leading-5 text-[#1A1510]/45">{hint}</p>
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

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[#F6F0E8]/55">{label}</dt>
      <dd className={accent ? "font-semibold text-[#F3B184]" : "font-medium"}>{value}</dd>
    </div>
  );
}
