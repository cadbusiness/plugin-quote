"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  ADS_COST_DEFAULTS,
  computeAdsCost,
  fmtEur,
  fmtNum,
  type AdsCostTone,
} from "@/lib/marketing/cout-par-client-google-ads-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

export function CoutParClientGoogleAdsDevisCalculator() {
  const [budget, setBudget] = useState(String(ADS_COST_DEFAULTS.budget));
  const [cpc, setCpc] = useState(String(ADS_COST_DEFAULTS.cpc));
  const [tauxDemande, setTauxDemande] = useState(String(ADS_COST_DEFAULTS.tauxDemande));
  const [tauxGagne, setTauxGagne] = useState(String(ADS_COST_DEFAULTS.tauxGagne));
  const [panier, setPanier] = useState(String(ADS_COST_DEFAULTS.panier));
  const [marge, setMarge] = useState(String(ADS_COST_DEFAULTS.marge));
  const [delai, setDelai] = useState(String(ADS_COST_DEFAULTS.delai));

  const result = useMemo(
    () => computeAdsCost({ budget, cpc, tauxDemande, tauxGagne, panier, marge, delai }),
    [budget, cpc, tauxDemande, tauxGagne, panier, marge, delai],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Vos campagnes</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="budget"
              label="Budget Google Ads du mois (€)"
              value={budget}
              min={0}
              step={50}
              onChange={setBudget}
            />
            <Field
              id="cpc"
              label="Coût moyen par clic (€)"
              hint="Dans Google Ads, colonne CPC moy."
              value={cpc}
              min={0}
              step={0.1}
              onChange={setCpc}
            />
            <Field
              id="tauxDemande"
              label="Clics qui deviennent une demande de devis (%)"
              value={tauxDemande}
              min={0}
              max={100}
              step={0.5}
              onChange={setTauxDemande}
            />
            <Field
              id="tauxGagne"
              label="Demandes qui passent Gagné (%)"
              value={tauxGagne}
              min={0}
              max={100}
              step={1}
              onChange={setTauxGagne}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Vos affaires</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="panier"
              label="Panier moyen d'une affaire signée (€ HT)"
              value={panier}
              min={0}
              step={100}
              onChange={setPanier}
            />
            <Field
              id="marge"
              label="Marge brute sur une affaire (%)"
              value={marge}
              min={0}
              max={100}
              step={1}
              onChange={setMarge}
            />
          </div>
          <div className="mt-4">
            <Field
              id="delai"
              label="Délai moyen entre le clic et la signature (jours)"
              hint="Sert à choisir la période de lecture et à vérifier la fenêtre de suivi de Google Ads."
              value={delai}
              min={0}
              max={730}
              step={5}
              onChange={setDelai}
            />
          </div>
        </fieldset>
      </form>

      <div className="space-y-6">
        <section className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6" aria-live="polite">
          <h2 className="text-sm font-semibold">Ce que coûtent vos campagnes</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Metric label="Clics par mois" value={fmtNum(result.clics)} />
            <Metric label="Demandes de devis par mois" value={fmtNum(result.demandes)} />
            <Metric label="Un devis coûte" value={fmtEur(result.coutDevis)} />
            <Metric label="Clients signés par mois" value={fmtNum(result.clients)} />
            <Metric label="Un client coûte" value={fmtEur(result.coutClient)} />
            <Metric label="Marge brute générée par mois" value={fmtEur(result.margeBrute)} />
            <Metric
              label="Marge après dépense publicitaire"
              value={fmtEur(result.resultat)}
              tone={result.resultat < 0 ? "bad" : "ok"}
            />
          </dl>
          <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.verdict.tone)}`}>
            {result.verdict.text}
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-sm font-semibold">Jusqu&apos;où vous pouvez payer</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <MetricLight label="Coût par client maximum (équilibre)" value={fmtEur(result.maxClient)} />
            <MetricLight label="Coût par devis maximum" value={fmtEur(result.maxDevis)} />
            <MetricLight label="Coût par clic maximum" value={fmtEur(result.maxCpc)} />
          </dl>
          <p className="mt-4 text-[13px] leading-5 text-mk-faint">
            À l&apos;équilibre, la marge de la première affaire paie juste la publicité. Gardez de la place pour le
            temps passé à chiffrer les demandes perdues.
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

function Metric({ label, value, tone }: { label: string; value: string; tone?: "ok" | "bad" }) {
  const toneClass = tone === "bad" ? "text-rose-300" : tone === "ok" ? "text-emerald-300" : "text-mk-accent";
  return (
    <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
      <dt className="text-mk-on-dark/60">{label}</dt>
      <dd className={`text-right text-base font-semibold tabular-nums ${toneClass}`}>{value}</dd>
    </div>
  );
}

function MetricLight({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-mk-border pt-3 first:border-t-0 first:pt-0">
      <dt className="text-mk-muted">{label}</dt>
      <dd className="text-right text-base font-semibold tabular-nums text-mk-accent">{value}</dd>
    </div>
  );
}

function alertClass(tone: AdsCostTone) {
  if (tone === "ok") return "bg-emerald-400/15 text-emerald-200";
  if (tone === "warn") return "bg-amber-400/15 text-amber-100";
  if (tone === "bad") return "bg-rose-400/15 text-rose-200";
  return "bg-white/5 text-mk-on-dark/80";
}
