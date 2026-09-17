"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { computeDiscountImpact } from "@/lib/marketing/discount-impact";

function money(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function percent(value: number) {
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value || 0)}\u00a0%`;
}

export function DiscountImpactCalculator() {
  const [ca, setCa] = useState(8500);
  const [cout, setCout] = useState(5200);
  const [remise, setRemise] = useState(8);
  const [volume, setVolume] = useState(40);
  const [txAvant, setTxAvant] = useState(28);
  const [txApres, setTxApres] = useState(34);

  const result = useMemo(
    () => computeDiscountImpact({ ca, cout, remise, volume, txAvant, txApres }),
    [ca, cout, remise, volume, txAvant, txApres],
  );

  const perteLabel =
    (result.perteUnite >= 0 ? "-" : "+") + money(Math.abs(result.perteUnite)) + " par devis";
  const acceptLine = result.acceptUseful
    ? `Sans remise ~${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(result.wonSans ?? 0)} deals gagnés → marge ${money(result.margeEspereeSans ?? 0)} · Avec remise ${result.volume} deals → marge ${money(result.margeEspereeAvec ?? 0)} · Écart ${money(result.impactNet)}`
    : "Non calculé (taux après = 0 ou non renseigné utilement).";
  const summary = `${money(result.ca)} HT · remise ${percent(result.remise)} · marge ${money(result.margeAvantE)} → ${money(result.margeApresE)} · annuel ${money(result.impactNet)}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Devis de référence (HT)</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField label="CA devis HT (€)" value={ca} min={0} max={500000} step={50} onChange={setCa} />
            <NumberField
              label="Coût matière + main-d’œuvre HT (€)"
              value={cout}
              min={0}
              max={500000}
              step={50}
              onChange={setCout}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Le coût reste hors remise commerciale. C’est votre plancher matière + pose / atelier.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Remise et volume</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField label="Remise (%)" value={remise} min={0} max={100} step={0.1} onChange={setRemise} />
            <NumberField
              label="Volume annuel de devis avec cette remise"
              value={volume}
              min={0}
              max={5000}
              step={1}
              onChange={setVolume}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Volume = nombre de devis (ou deals) où vous appliquez à peu près cette remise dans l’année.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Optionnel : taux d’acceptation</legend>
          <p className="mt-2 text-[12px] leading-5 text-mk-faint">
            Si la remise fait monter le taux de signature, vous pouvez estimer un gain de volume. Sinon
            laissez 0.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Taux d’acceptation avant remise (%)"
              value={txAvant}
              min={0}
              max={100}
              step={0.1}
              onChange={setTxAvant}
            />
            <NumberField
              label="Taux d’acceptation après remise (%)"
              value={txApres}
              min={0}
              max={100}
              step={0.1}
              onChange={setTxApres}
            />
          </div>
        </fieldset>
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
          Impact annuel estimé
        </p>
        <p
          className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${
            result.impactNet < 0 ? "text-rose-300" : "text-emerald-300"
          }`}
        >
          {money(result.impactNet)}
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">marge €, aux volumes et taux indiqués</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row
            label="Marge avant remise"
            value={`${money(result.margeAvantE)} (${percent(result.margeAvantP)})`}
          />
          <Row
            label="CA et marge après"
            value={`CA ${money(result.caApres)} · ${money(result.margeApresE)} (${percent(result.margeApresP)})`}
          />
          <Row
            label="Perte de marge par devis"
            value={perteLabel}
            accent={result.margeApresE < 0 || result.perteUnite > 0}
          />
          <Row label="Lecture acceptation" value={acceptLine} />
        </dl>

        <p className="mt-6 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-mk-on-dark/45">
            Ordre de grandeur pour décider une remise, pas une compta.
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
      <dt className="shrink-0 text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${accent ? "font-semibold text-mk-accent" : "font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}
