"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  computeEscompte,
  fmtEur,
  fmtJours,
  fmtPct,
  type EscompteLigne,
  type EscompteTone,
} from "@/lib/marketing/calculateur-escompte-paiement-anticipe";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const HYPOTHESES =
  "Valeurs par défaut : hypothèses d'exemple, pas des taux de référence ni des usages d'une profession. Le taux annuel équivalent est calculé sur le montant net payé, sur la base de 365 jours.";

export function CalculateurEscomptePaiementAnticipeCalculator() {
  const [montant, setMontant] = useState(String(DEFAULTS.montant));
  const [escompte, setEscompte] = useState(String(DEFAULTS.escompte));
  const [delaiNormal, setDelaiNormal] = useState(String(DEFAULTS.delaiNormal));
  const [delaiEscompte, setDelaiEscompte] = useState(String(DEFAULTS.delaiEscompte));
  const [tauxFinancement, setTauxFinancement] = useState(String(DEFAULTS.tauxFinancement));

  const result = useMemo(
    () =>
      computeEscompte({
        montant,
        escompte,
        delaiNormal,
        delaiEscompte,
        tauxFinancement,
      }),
    [montant, escompte, delaiNormal, delaiEscompte, tauxFinancement],
  );

  const ecartLabel =
    result.ecart == null
      ? "n/a"
      : result.ecart > 0
        ? "L'escompte coûte " + fmtEur(result.ecart) + " de plus"
        : "L'escompte coûte " + fmtEur(-result.ecart) + " de moins";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form
        id="form"
        className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="text-base font-semibold">La facture</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="montant"
            label="Montant de la facture (€)"
            hint="Le montant sur lequel porte l'escompte, tel que vos conditions le prévoient."
            value={montant}
            min={0}
            step={100}
            onChange={setMontant}
          />
          <Field
            id="escompte"
            label="Escompte proposé (%)"
            hint="La réduction accordée si le client paie dans le délai d'escompte."
            value={escompte}
            min={0}
            max={50}
            step={0.1}
            onChange={setEscompte}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="delaiNormal"
            label="Délai de paiement normal (jours)"
            hint="L'échéance prévue par vos conditions de paiement, à compter de la facture."
            value={delaiNormal}
            min={0}
            max={365}
            step={1}
            onChange={setDelaiNormal}
          />
          <Field
            id="delaiEscompte"
            label="Délai pour bénéficier de l'escompte (jours)"
            hint="0 pour un paiement comptant à la facture."
            value={delaiEscompte}
            min={0}
            max={365}
            step={1}
            onChange={setDelaiEscompte}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Votre coût de financement</h2>
        <div className="mt-4">
          <Field
            id="tauxFinancement"
            label="Taux annuel de votre financement (%)"
            hint="Ce que vous coûte l'argent pendant l'attente : découvert, ligne de crédit, affacturage. Côté client, mettez ce que lui rapporte ou lui coûte sa trésorerie."
            value={tauxFinancement}
            min={0}
            max={100}
            step={0.1}
            onChange={setTauxFinancement}
          />
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">{HYPOTHESES}</p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"L'escompte"}</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="montantEscompte" label="Montant de l'escompte" value={fmtEur(result.montantEscompte)} />
          <Metric id="net" label="Montant payé avec l'escompte" value={fmtEur(result.net)} />
          <Metric id="jours" label="Jours d'avance sur l'échéance" value={fmtJours(result.jours)} />
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Le coût réel</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="tauxSimple" label="Taux annuel équivalent (simple)" value={fmtPct(result.tauxSimple)} />
          <Metric id="tauxCompose" label="Taux annuel équivalent (composé)" value={fmtPct(result.tauxCompose)} />
          <Metric
            id="coutFinancement"
            label="Coût d'un financement sur la même durée"
            value={fmtEur(result.coutFinancement)}
          />
          <Metric id="ecart" label="Écart pour le fournisseur" value={ecartLabel} />
          <Metric
            id="escompteMax"
            label="Escompte maximum à votre taux de financement"
            value={fmtPct(result.escompteMax)}
          />
        </dl>
        <p id="verdict" className={`mt-4 rounded-xl px-4 py-3 text-sm ${alertClass(result.etat)}`}>
          {result.verdict}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">{"Le taux annuel selon l'escompte"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">Escompte</th>
                <th className="py-2 pr-2 font-semibold">Montant</th>
                <th className="py-2 pr-2 font-semibold">Taux annuel simple</th>
                <th className="py-2 font-semibold">Taux annuel composé</th>
              </tr>
            </thead>
            <tbody id="detail">
              {result.lignes.map((ligne) => (
                <LigneRow key={ligne.escompte} ligne={ligne} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          La ligne surlignée est votre escompte. Mêmes délais, même facture : seul le pourcentage change.
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
        <h2 className="text-base font-semibold">Mention pour la facture</h2>
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

function LigneRow({ ligne }: { ligne: EscompteLigne }) {
  const rowClass = ligne.courant ? "bg-orange-50 font-semibold" : "border-t border-mk-border";
  return (
    <tr className={rowClass}>
      <td className="py-2 pr-2">{fmtPct(ligne.escompte)}</td>
      <td className="py-2 pr-2">{fmtEur(ligne.montant)}</td>
      <td className="py-2 pr-2">{fmtPct(ligne.simple)}</td>
      <td className="py-2">{fmtPct(ligne.compose)}</td>
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

function alertClass(tone: EscompteTone) {
  if (tone === "ok") return "bg-emerald-50 font-semibold text-emerald-800";
  if (tone === "warn") return "bg-amber-50 font-semibold text-amber-900";
  if (tone === "bad") return "bg-rose-50 font-semibold text-rose-800";
  return "bg-mk-band font-medium text-mk-ink";
}
