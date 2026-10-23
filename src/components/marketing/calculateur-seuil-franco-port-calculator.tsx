"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  ARRONDIS,
  DEFAULTS,
  computeFranco,
  fmtEur,
  fmtHt,
  fmtPct,
  type FrancoLigne,
  type FrancoTone,
} from "@/lib/marketing/calculateur-seuil-franco-port";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const HYPOTHESES =
  "Valeurs par défaut : hypothèses d'exemple, pas des tarifs de transporteur ni des usages d'une profession. Le seuil se calcule sur la marge, pas sur le chiffre d'affaires.";

export function CalculateurSeuilFrancoPortCalculator() {
  const [coutTransport, setCoutTransport] = useState(String(DEFAULTS.coutTransport));
  const [tauxMarge, setTauxMarge] = useState(String(DEFAULTS.tauxMarge));
  const [partMax, setPartMax] = useState(String(DEFAULTS.partMax));
  const [panierMoyen, setPanierMoyen] = useState(String(DEFAULTS.panierMoyen));
  const [arrondi, setArrondi] = useState(String(DEFAULTS.arrondi));

  const result = useMemo(
    () =>
      computeFranco({
        coutTransport,
        tauxMarge,
        partMax,
        panierMoyen,
        arrondi,
      }),
    [coutTransport, tauxMarge, partMax, panierMoyen, arrondi],
  );

  const margeApres =
    result.margeApresPort == null
      ? "n/a"
      : fmtEur(result.margeApresPort) + " (" + fmtPct(result.tauxMargeApresPort) + " du panier)";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form
        id="form"
        className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="text-base font-semibold">Le transport</h2>
        <div className="mt-4">
          <Field
            id="coutTransport"
            label="Coût moyen d'une livraison (€ HT)"
            hint="Ce que vous paie en moyenne le transporteur par commande livrée, emballage compris si vous le comptez."
            value={coutTransport}
            min={0}
            step={1}
            onChange={setCoutTransport}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Votre marge</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="tauxMarge"
            label="Marge brute (% du prix de vente HT)"
            hint="Prix de vente HT moins coût d'achat ou de revient, rapporté au prix de vente."
            value={tauxMarge}
            min={0}
            max={100}
            step={0.5}
            onChange={setTauxMarge}
          />
          <Field
            id="partMax"
            label="Part de marge consacrée au transport (%)"
            hint="Le maximum de la marge d'une commande que vous acceptez de laisser au transport."
            value={partMax}
            min={0}
            max={100}
            step={1}
            onChange={setPartMax}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Vos commandes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="panierMoyen"
            label="Panier moyen (€ HT)"
            hint="Facultatif. 0 pour ne pas comparer."
            value={panierMoyen}
            min={0}
            step={10}
            onChange={setPanierMoyen}
          />
          <label className="block" htmlFor="arrondi">
            <span className="text-sm font-medium">Arrondir le seuil à</span>
            <select
              id="arrondi"
              value={arrondi}
              onChange={(event) => setArrondi(event.target.value)}
              className={fieldClass}
            >
              {ARRONDIS.map((pas) => (
                <option key={pas} value={String(pas)}>
                  {pas} €
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
              Arrondi au multiple supérieur, pour une mention lisible.
            </span>
          </label>
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">{HYPOTHESES}</p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le seuil franco</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="seuilExact" label="Seuil franco calculé" value={fmtHt(result.seuilExact)} />
          <Metric id="seuilArrondi" label="Seuil arrondi pour le devis" value={fmtHt(result.seuilArrondi)} />
          <Metric
            id="ventesPourUneLivraison"
            label="Ventes dont la marge paie une livraison"
            value={fmtHt(result.ventesPourUneLivraison)}
          />
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Votre panier moyen</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="margePanier" label="Marge brute du panier" value={fmtEur(result.margePanier)} />
          <Metric
            id="partTransport"
            label="Part de la marge prise par le transport"
            value={fmtPct(result.partTransport)}
          />
          <Metric id="margeApresPort" label="Marge après transport" value={margeApres} />
          <Metric
            id="participation"
            label="Participation suggérée sous le seuil"
            value={fmtHt(result.participation)}
          />
        </dl>
        <p id="verdict" className={`mt-4 rounded-xl px-4 py-3 text-sm ${alertClass(result.etat)}`}>
          {result.verdict}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Le seuil selon la part de marge</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">Part de marge</th>
                <th className="py-2 pr-2 font-semibold">Seuil franco</th>
                <th className="py-2 pr-2 font-semibold">Seuil arrondi</th>
                <th className="py-2 font-semibold">Transport en % du prix au seuil</th>
              </tr>
            </thead>
            <tbody id="detail">
              {result.lignes.map((ligne) => (
                <LigneRow key={ligne.part} ligne={ligne} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          La ligne surlignée est votre part de marge. Même coût de transport, même marge : seule la part acceptée change.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Pour lire vos chiffres</h2>
        <ul id="conseils" className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-muted">
          {result.conseils.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Mention pour le devis</h2>
        <pre
          id="mention"
          className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] px-3 py-3 text-sm leading-6 text-mk-ink ring-1 ring-mk-border"
        >
          {result.mention}
        </pre>
        <div className="mt-3">
          <CopyButton text={result.mention} label="Copier" />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Récapitulatif</h2>
        <pre
          id="recap"
          className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] px-3 py-3 text-sm leading-6 text-mk-ink ring-1 ring-mk-border"
        >
          {result.recap}
        </pre>
        <div className="mt-3">
          <CopyButton text={result.recap} label="Copier" />
        </div>
      </section>
    </div>
  );
}

function LigneRow({ ligne }: { ligne: FrancoLigne }) {
  const rowClass = ligne.courant ? "bg-orange-50 font-semibold" : "border-t border-mk-border";
  return (
    <tr className={rowClass}>
      <td className="py-2 pr-2">{fmtPct(ligne.part)}</td>
      <td className="py-2 pr-2">{fmtHt(ligne.seuil)}</td>
      <td className="py-2 pr-2">{fmtHt(ligne.arrondi)}</td>
      <td className="py-2">{fmtPct(ligne.partPrix)}</td>
    </tr>
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
      <span className="text-sm font-medium">{label}</span>
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

function Metric({ label, value, id }: { label: string; value: string; id: string }) {
  return (
    <div className="border-t border-mk-border pt-3 first:border-t-0 first:pt-0">
      <dt className="text-sm text-mk-ink">{label}</dt>
      <dd id={id} className="mt-0.5 text-[1.35rem] font-semibold tabular-nums text-mk-accent">
        {value}
      </dd>
    </div>
  );
}

function alertClass(tone: FrancoTone) {
  if (tone === "ok") return "bg-emerald-50 font-semibold text-emerald-800";
  if (tone === "warn") return "bg-amber-50 font-semibold text-amber-900";
  if (tone === "bad") return "bg-rose-50 font-semibold text-rose-800";
  return "bg-mk-band font-medium text-mk-ink";
}
