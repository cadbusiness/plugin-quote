"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  REVISION_PRIX_DEFAULTS,
  computeRevisionPrix,
  fmtCoef,
  fmtEur,
  fmtEurSigne,
  fmtIdx,
  fmtNum,
  fmtVar,
  type RevisionIndice,
  type RevisionTone,
} from "@/lib/marketing/calculateur-revision-prix-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const NB = "\u00a0";

const HYPOTHESES =
  "Toutes les valeurs par défaut sont des hypothèses d'exemple, pas des moyennes de marché ni des valeurs réelles d'indices. Remplacez-les par vos propres chiffres.";

export function CalculateurRevisionPrixDevisCalculator() {
  const [prix, setPrix] = useState(String(REVISION_PRIX_DEFAULTS.prix));
  const [fixe, setFixe] = useState(String(REVISION_PRIX_DEFAULTS.fixe));
  const [marge, setMarge] = useState(String(REVISION_PRIX_DEFAULTS.marge));
  const [w1, setW1] = useState(String(REVISION_PRIX_DEFAULTS.w1));
  const [i01, setI01] = useState(String(REVISION_PRIX_DEFAULTS.i01));
  const [i11, setI11] = useState(String(REVISION_PRIX_DEFAULTS.i11));
  const [w2, setW2] = useState(String(REVISION_PRIX_DEFAULTS.w2));
  const [i02, setI02] = useState(String(REVISION_PRIX_DEFAULTS.i02));
  const [i12, setI12] = useState(String(REVISION_PRIX_DEFAULTS.i12));
  const [w3, setW3] = useState(String(REVISION_PRIX_DEFAULTS.w3));
  const [i03, setI03] = useState(String(REVISION_PRIX_DEFAULTS.i03));
  const [i13, setI13] = useState(String(REVISION_PRIX_DEFAULTS.i13));
  const [seuil, setSeuil] = useState(String(REVISION_PRIX_DEFAULTS.seuil));
  const [plafond, setPlafond] = useState(String(REVISION_PRIX_DEFAULTS.plafond));

  const result = useMemo(
    () =>
      computeRevisionPrix({
        prix,
        fixe,
        marge,
        w1,
        i01,
        i11,
        w2,
        i02,
        i12,
        w3,
        i03,
        i13,
        seuil,
        plafond,
      }),
    [prix, fixe, marge, w1, i01, i11, w2, i02, i12, w3, i03, i13, seuil, plafond],
  );

  const nonRep =
    result.nonRepercute === null
      ? "n/a"
      : result.dansSeuil || result.plafonne
        ? fmtEur(Math.abs(result.nonRepercute))
        : "Aucune";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form
        id="form"
        className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="text-base font-semibold">Le prix du devis</h2>
        <div className="mt-4">
          <Field
            id="prix"
            label="Prix initial du devis (€ HT)"
            hint="Le montant du devis aux conditions du mois de départ (le « mois zéro »)."
            value={prix}
            min={0}
            step={100}
            onChange={setPrix}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="fixe"
            label="Partie fixe, non révisée (%)"
            hint="Facultative. Mettez 0 si tout le prix suit les indices."
            value={fixe}
            min={0}
            max={100}
            step={1}
            onChange={setFixe}
          />
          <Field
            id="marge"
            label="Votre marge brute sur ce devis (%)"
            hint="Sert seulement à comparer votre marge avec et sans clause."
            value={marge}
            min={0}
            max={100}
            step={1}
            onChange={setMarge}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Les indices de la formule</h2>
        <p className="mt-3 text-[12px] leading-5 text-mk-faint">
          Le poids de chaque indice est sa part dans la partie variable. Les poids des indices utilisés doivent faire
          100 %. Laissez un poids à 0 pour ne pas utiliser l&apos;indice.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field id="w1" label="Indice 1 : poids (%)" value={w1} min={0} max={100} step={5} onChange={setW1} />
          <Field id="i01" label="Valeur de départ" value={i01} min={0} step={0.1} onChange={setI01} />
          <Field id="i11" label="Valeur d'arrivée" value={i11} min={0} step={0.1} onChange={setI11} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field id="w2" label="Indice 2 : poids (%)" value={w2} min={0} max={100} step={5} onChange={setW2} />
          <Field id="i02" label="Valeur de départ" value={i02} min={0} step={0.1} onChange={setI02} />
          <Field id="i12" label="Valeur d'arrivée" value={i12} min={0} step={0.1} onChange={setI12} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field id="w3" label="Indice 3 : poids (%)" value={w3} min={0} max={100} step={5} onChange={setW3} />
          <Field id="i03" label="Valeur de départ" value={i03} min={0} step={0.1} onChange={setI03} />
          <Field id="i13" label="Valeur d'arrivée" value={i13} min={0} step={0.1} onChange={setI13} />
        </div>
        <p className="mt-3 text-[12px] leading-5 text-mk-faint">
          Prenez les valeurs définitives publiées, aux mois que fixe votre clause : départ au mois du devis, arrivée au
          mois de la livraison, de la pose ou de la facture.
        </p>

        <h2 className="mt-6 text-base font-semibold">Les garde-fous de la clause</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="seuil"
            label="Seuil de déclenchement (%)"
            hint="Si l'écart est strictement inférieur à ce seuil, à la hausse comme à la baisse, le prix ne bouge pas. Dès que l'écart atteint le seuil, toute la variation s'applique. 0 = aucun seuil."
            value={seuil}
            min={0}
            max={100}
            step={0.5}
            onChange={setSeuil}
          />
          <Field
            id="plafond"
            label="Plafond de variation (%)"
            hint="Limite la variation dans les deux sens. 0 = aucun plafond."
            value={plafond}
            min={0}
            max={100}
            step={0.5}
            onChange={setPlafond}
          />
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">{HYPOTHESES}</p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le coefficient</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="indVar" label="Variation pondérée des indices" value={fmtVar(result.indVar)} />
          <Metric id="coef" label="Coefficient de révision" value={fmtCoef(result.coefBrut)} />
          <Metric id="varBrute" label="Variation du prix, avant seuil et plafond" value={fmtVar(result.varBrute)} />
        </dl>
        <p id="verdict" className={`mt-4 rounded-xl px-4 py-3 text-sm ${alertClass(result.verdict.tone)}`}>
          {result.verdict.text}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Le prix révisé</h2>
        <dl className="mt-4 space-y-3">
          <Metric
            id="prixRevise"
            label="Prix révisé"
            value={result.prixRevise === null ? "n/a" : fmtEur(result.prixRevise) + " HT"}
          />
          <Metric id="ecart" label="Écart avec le prix initial" value={fmtEurSigne(result.ecart)} />
          <Metric id="nonRep" label="Variation non répercutée (seuil ou plafond)" value={nonRep} />
          <Metric
            id="sansFixe"
            label="Prix révisé sans partie fixe"
            value={result.prixSansFixe === null ? "n/a" : fmtEur(result.prixSansFixe) + " HT"}
          />
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Détail par indice</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm tabular-nums">
            <thead>
              <tr className="text-mk-faint">
                <th className="py-2 pr-2 font-semibold">Terme</th>
                <th className="py-2 pr-2 font-semibold">Poids dans le prix</th>
                <th className="py-2 pr-2 font-semibold">Départ</th>
                <th className="py-2 pr-2 font-semibold">Arrivée</th>
                <th className="py-2 pr-2 font-semibold">Variation</th>
                <th className="py-2 font-semibold">Effet sur le prix</th>
              </tr>
            </thead>
            <tbody id="detail">
              <tr className="border-t border-mk-border">
                <td className="py-2 pr-2">Partie fixe</td>
                <td className="py-2 pr-2">{fmtNum(result.fixe) + NB + "%"}</td>
                <td className="py-2 pr-2" />
                <td className="py-2 pr-2" />
                <td className="py-2 pr-2" />
                <td className="py-2">{fmtEur(0)}</td>
              </tr>
              {result.indices.filter((indice) => indice.used).map((indice) => (
                <IndiceRow key={indice.k} indice={indice} heavy={result.top === indice.k} />
              ))}
              {result.ecartPoids ? (
                <tr className="border-t border-mk-border">
                  <td className="py-2 pr-2">{"Poids hors 100" + NB + "%"}</td>
                  <td className="py-2 pr-2" />
                  <td className="py-2 pr-2" />
                  <td className="py-2 pr-2" />
                  <td className="py-2 pr-2" />
                  <td className="py-2">{fmtEurSigne(result.ecartPoids)}</td>
                </tr>
              ) : null}
              <tr className="border-t border-mk-border">
                <td className="py-2 pr-2">Total, avant seuil et plafond</td>
                <td className="py-2 pr-2" />
                <td className="py-2 pr-2" />
                <td className="py-2 pr-2" />
                <td className="py-2 pr-2">{fmtVar(result.varBrute)}</td>
                <td className="py-2">
                  {result.coefBrut === null ? "n/a" : fmtEurSigne(result.prix * (result.coefBrut - 1))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          L&apos;effet de chaque indice est calculé avant seuil et plafond. La ligne « Poids hors 100 % » n&apos;apparaît
          que si les poids des indices ne font pas 100 % de la partie variable.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Votre marge, si vos coûts suivent les indices</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="m0" label="Marge prévue au devis" value={fmtNum(result.marge) + NB + "%"} />
          <Metric
            id="mFerme"
            label="Marge en prix ferme, sans clause"
            value={result.margeFerme === null ? "n/a" : fmtNum(result.margeFerme) + NB + "%"}
          />
          <Metric
            id="mClause"
            label="Marge avec la clause"
            value={result.margeClause === null ? "n/a" : fmtNum(result.margeClause) + NB + "%"}
          />
        </dl>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">
          Hypothèse simplifiée : vos coûts évoluent comme la moyenne pondérée des indices. Dans la réalité, vérifiez
          avec vos factures d&apos;achat.
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

function IndiceRow({ indice, heavy }: { indice: RevisionIndice; heavy: boolean }) {
  return (
    <tr className={`border-t border-mk-border ${heavy ? "bg-amber-50" : ""}`}>
      <td className="py-2 pr-2">{"Indice " + indice.k}</td>
      <td className="py-2 pr-2">{fmtNum(indice.poidsPrix) + NB + "%"}</td>
      <td className="py-2 pr-2">{indice.valide ? fmtIdx(indice.i0) : "n/a"}</td>
      <td className="py-2 pr-2">{indice.valide ? fmtIdx(indice.i1) : "n/a"}</td>
      <td className="py-2 pr-2">{fmtVar(indice.variation)}</td>
      <td className="py-2">{fmtEurSigne(indice.effet)}</td>
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
    <div className="border-t border-mk-border pt-3 first:border-t-0 first:pt-0" id={id + "Wrap"}>
      <dt className="text-sm text-mk-ink">{label}</dt>
      <dd id={id} className="mt-0.5 text-[1.35rem] font-semibold tabular-nums text-mk-accent">
        {value}
      </dd>
    </div>
  );
}

function alertClass(tone: RevisionTone) {
  if (tone === "ok") return "bg-emerald-50 font-semibold text-emerald-800";
  if (tone === "warn") return "bg-amber-50 font-semibold text-amber-900";
  if (tone === "bad") return "bg-rose-50 font-semibold text-rose-800";
  return "bg-mk-band font-medium text-mk-ink";
}
