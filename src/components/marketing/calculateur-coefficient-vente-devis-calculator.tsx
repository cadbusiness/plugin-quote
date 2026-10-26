"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  ARRONDIS,
  DEFAULTS,
  computeCoefficient,
  fmtCoef,
  fmtEur,
  fmtHt,
  fmtPct,
  type CoefficientLigne,
  type CoefficientTone,
  type ConversionLigne,
} from "@/lib/marketing/calculateur-coefficient-vente-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const HYPOTHESES =
  "Valeurs par défaut : hypothèses d'exemple, pas des taux de frais généraux, des marges ou des coûts horaires d'une profession. Les pourcentages de frais généraux et de bénéfice sont exprimés sur le prix de vente HT.";

export function CalculateurCoefficientVenteDevisCalculator() {
  const [achats, setAchats] = useState(String(DEFAULTS.achats));
  const [autresFrais, setAutresFrais] = useState(String(DEFAULTS.autresFrais));
  const [heures, setHeures] = useState(String(DEFAULTS.heures));
  const [tauxHoraire, setTauxHoraire] = useState(String(DEFAULTS.tauxHoraire));
  const [fraisGeneraux, setFraisGeneraux] = useState(String(DEFAULTS.fraisGeneraux));
  const [benefice, setBenefice] = useState(String(DEFAULTS.benefice));
  const [prixEnvisage, setPrixEnvisage] = useState(String(DEFAULTS.prixEnvisage));
  const [arrondi, setArrondi] = useState(String(DEFAULTS.arrondi));

  const result = useMemo(
    () =>
      computeCoefficient({
        achats,
        autresFrais,
        heures,
        tauxHoraire,
        fraisGeneraux,
        benefice,
        prixEnvisage,
        arrondi,
      }),
    [achats, autresFrais, heures, tauxHoraire, fraisGeneraux, benefice, prixEnvisage, arrondi],
  );

  const repartition = result.valide
    ? fmtEur(result.fraisGenerauxEur) + " de frais généraux, " + fmtEur(result.beneficeEur) + " de bénéfice"
    : "n/a";
  const taux = result.valide
    ? fmtPct(result.tauxMarque) + " sur le prix, " + fmtPct(result.tauxMarge) + " sur le coût"
    : "n/a";
  const beneficeRestant =
    result.beneficeEnvisage == null
      ? "n/a"
      : fmtEur(result.beneficeEnvisage) + " (" + fmtPct(result.tauxBeneficeEnvisage) + " du prix)";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form
        id="form"
        className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="text-base font-semibold">Le déboursé sec</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="achats"
            label="Matériaux, fournitures, produits revendus (€ HT)"
            hint="Prix d'achat net, transport d'approvisionnement compris si vous le payez."
            value={achats}
            min={0}
            step={10}
            onChange={setAchats}
          />
          <Field
            id="autresFrais"
            label="Autres coûts directs (€ HT)"
            hint="Sous-traitance, location de matériel, déplacement, évacuation : ce qui ne sert qu'à ce devis."
            value={autresFrais}
            min={0}
            step={10}
            onChange={setAutresFrais}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="heures"
            label="Heures de main-d'œuvre"
            hint="Heures prévues sur ce devis, atelier et pose."
            value={heures}
            min={0}
            step={1}
            onChange={setHeures}
          />
          <Field
            id="tauxHoraire"
            label="Coût horaire chargé (€)"
            hint="Salaire et charges patronales divisés par les heures réellement productives, pas le taux facturé au client."
            value={tauxHoraire}
            min={0}
            step={0.5}
            onChange={setTauxHoraire}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Frais généraux et bénéfice</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="fraisGeneraux"
            label="Frais généraux (% du prix de vente HT)"
            hint="Frais généraux annuels divisés par le chiffre d'affaires annuel HT, sur votre dernier exercice."
            value={fraisGeneraux}
            min={0}
            max={95}
            step={0.5}
            onChange={setFraisGeneraux}
          />
          <Field
            id="benefice"
            label="Bénéfice visé (% du prix de vente HT)"
            hint="Ce qui doit rester une fois le déboursé sec et les frais généraux payés."
            value={benefice}
            min={0}
            max={95}
            step={0.5}
            onChange={setBenefice}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Votre devis</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="prixEnvisage"
            label="Prix que vous envisagez (€ HT)"
            hint="Facultatif. Le prix que vous aviez en tête, ou celui que le client propose. 0 pour ne pas comparer."
            value={prixEnvisage}
            min={0}
            step={10}
            onChange={setPrixEnvisage}
          />
          <label className="block" htmlFor="arrondi">
            <span className="text-sm font-medium">Arrondir le prix à</span>
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
            <span className="mt-1 block text-[12px] leading-5 text-mk-faint">Arrondi au multiple supérieur.</span>
          </label>
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">{HYPOTHESES}</p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le déboursé sec</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="mainOeuvre" label="Main-d'œuvre" value={fmtEur(result.mainOeuvre)} />
          <Metric id="deboursSec" label="Déboursé sec total" value={fmtHt(result.deboursSec)} />
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Le prix de vente</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="coefficient" label="Coefficient de vente" value={fmtCoef(result.coefficient)} />
          <Metric id="prixExact" label="Prix de vente HT calculé" value={fmtHt(result.prixExact)} />
          <Metric id="prixArrondi" label="Prix arrondi pour le devis" value={fmtHt(result.prixArrondi)} />
          <Metric id="repartition" label="Dont frais généraux et bénéfice" value={repartition} />
          <Metric id="taux" label="Taux de marque et taux de marge" value={taux} />
          <Metric
            id="plancher"
            label="Prix plancher (frais généraux couverts, bénéfice nul)"
            value={fmtHt(result.plancher)}
          />
          <Metric id="remiseMax" label="Remise possible avant le plancher" value={fmtPct(result.remiseMax)} />
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Le prix que vous envisagez</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="coefEnvisage" label="Coefficient appliqué" value={fmtCoef(result.coefEnvisage)} />
          <Metric id="marqueEnvisage" label="Taux de marque" value={fmtPct(result.marqueEnvisage)} />
          <Metric id="beneficeEnvisage" label="Bénéfice restant" value={beneficeRestant} />
        </dl>
        <p id="verdict" className={`mt-4 rounded-xl px-4 py-3 text-sm ${alertClass(result.etat)}`}>
          {result.verdict}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Le coefficient selon le bénéfice visé</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">Bénéfice visé</th>
                <th className="py-2 pr-2 font-semibold">Coefficient</th>
                <th className="py-2 pr-2 font-semibold">Prix de vente HT</th>
                <th className="py-2 pr-2 font-semibold">Taux de marque</th>
                <th className="py-2 font-semibold">Taux de marge</th>
              </tr>
            </thead>
            <tbody id="detail">
              {result.lignes.map((ligne) => (
                <LigneRow key={ligne.benefice} ligne={ligne} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          Même déboursé sec, mêmes frais généraux : seul le bénéfice visé change. La ligne surlignée est la vôtre.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Taux de marque, taux de marge : la correspondance</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">Taux de marque (sur le prix de vente)</th>
                <th className="py-2 pr-2 font-semibold">Taux de marge (sur le coût)</th>
                <th className="py-2 font-semibold">Coefficient</th>
              </tr>
            </thead>
            <tbody id="conversion">
              {result.conversion.map((ligne) => (
                <ConversionRow key={ligne.tauxMarque} ligne={ligne} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          Une même somme gagnée, deux pourcentages différents selon la base. Précisez toujours la base quand vous parlez
          de marge.
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

function LigneRow({ ligne }: { ligne: CoefficientLigne }) {
  const rowClass = ligne.courant ? "bg-orange-50 font-semibold" : "border-t border-mk-border";
  return (
    <tr className={rowClass}>
      <td className="py-2 pr-2">{fmtPct(ligne.benefice)}</td>
      <td className="py-2 pr-2">{fmtCoef(ligne.coefficient)}</td>
      <td className="py-2 pr-2">{fmtHt(ligne.prix)}</td>
      <td className="py-2 pr-2">{fmtPct(ligne.tauxMarque)}</td>
      <td className="py-2">{fmtPct(ligne.tauxMarge)}</td>
    </tr>
  );
}

function ConversionRow({ ligne }: { ligne: ConversionLigne }) {
  return (
    <tr className="border-t border-mk-border">
      <td className="py-2 pr-2">{fmtPct(ligne.tauxMarque)}</td>
      <td className="py-2 pr-2">{fmtPct(ligne.tauxMarge)}</td>
      <td className="py-2">{fmtCoef(ligne.coefficient)}</td>
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

function alertClass(tone: CoefficientTone) {
  if (tone === "ok") return "bg-emerald-50 font-semibold text-emerald-800";
  if (tone === "warn") return "bg-amber-50 font-semibold text-amber-900";
  if (tone === "bad") return "bg-rose-50 font-semibold text-rose-800";
  return "bg-mk-band font-medium text-mk-ink";
}
