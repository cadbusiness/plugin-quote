"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { computeAcompteDevis, type AcompteMode } from "@/lib/marketing/acompte-devis";

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

export function AcompteDevisCalculator() {
  const [ht, setHt] = useState(12000);
  const [tva, setTva] = useState(20);
  const [mode, setMode] = useState<AcompteMode>("pct");
  const [pct, setPct] = useState(30);
  const [fixe, setFixe] = useState(4000);
  const [jalons, setJalons] = useState(3);
  const [delai, setDelai] = useState(5);

  const result = useMemo(
    () => computeAcompteDevis({ ht, tva, mode, pct, fixe, jalons, delai }),
    [ht, tva, mode, pct, fixe, jalons, delai],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Montant du devis</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField label="Montant HT (€)" value={ht} min={0} step={1} onChange={setHt} />
            <NumberField label="TVA (%)" value={tva} min={0} max={100} step={0.1} onChange={setTva} />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Base habituelle B2B France : TVA 20 %. Ajustez si votre cas diffère. Le total TTC sert de
            base aux % d’acompte.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Acompte</legend>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Mode acompte">
            <ModeChip checked={mode === "pct"} onSelect={() => setMode("pct")} label="Pourcentage" />
            <ModeChip checked={mode === "fixe"} onSelect={() => setMode("fixe")} label="Montant fixe TTC" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {mode === "pct" ? (
              <NumberField
                label="% d’acompte"
                value={pct}
                min={0}
                max={100}
                step={0.1}
                onChange={setPct}
              />
            ) : (
              <NumberField
                label="Acompte fixe TTC (€)"
                value={fixe}
                min={0}
                step={1}
                onChange={setFixe}
              />
            )}
            <NumberField
              label="Nombre de jalons (échéancier)"
              value={jalons}
              min={1}
              max={4}
              step={1}
              onChange={setJalons}
            />
            <NumberField
              label="Délai avant démarrage si acompte OK (jours)"
              value={delai}
              min={0}
              max={365}
              step={1}
              onChange={setDelai}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            1 jalon = acompte + solde implicite. 2 à 4 jalons = répartition indicative (premier jalon
            = acompte, le reste réparti équitablement sauf ajustement du dernier centime).
          </p>
        </fieldset>
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6" aria-live="polite">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">Résultat</p>
        <p className="mt-3 text-4xl font-semibold tracking-tight text-emerald-300 sm:text-5xl">
          {money(result.acompte)}
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">Acompte TTC</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="Total TTC" value={money(result.ttc)} />
          <Row label="Reste dû TTC" value={money(result.reste)} />
          <Row label="Acompte en % du TTC" value={`${qty(result.pctReel, 1)} %`} />
          <Row label="Trésorerie engagée côté client à J0" value={money(result.acompte)} tone="ok" />
          <Row label="Démarrage indicatif après encaissement" value={result.demarrage} />
        </dl>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
          Répartition indicative des jalons
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {result.jalons.map((part) => (
            <li key={part.label} className="flex items-start justify-between gap-4 border-b border-white/10 pb-2">
              <span className="text-mk-on-dark/70">{part.label}</span>
              <span className="shrink-0 font-semibold tabular-nums">{money(part.amount)}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Ordre de grandeur pour cadrer une discussion d’équipe, pas un conseil juridique ni une
          promesse de résultat. Aucune donnée n’est envoyée.
        </p>

        <label className="mt-6 block text-xs text-mk-on-dark/55" htmlFor="acompte-recap">
          Texte récap
        </label>
        <textarea
          id="acompte-recap"
          readOnly
          value={result.recap}
          className="mt-2 h-40 w-full resize-y rounded-xl bg-white/5 px-3 py-2 text-xs leading-5 text-mk-on-dark ring-1 ring-white/10"
        />
        <div className="mt-3 flex justify-end">
          <CopyButton text={result.recap} label="Copier le récap" />
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
      <input type="radio" name="acompte-mode" checked={checked} onChange={onSelect} className="sr-only" />
      {label}
    </label>
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
  max?: number;
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
  tone?: "ok";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${tone === "ok" ? "font-semibold text-emerald-300" : "font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}
