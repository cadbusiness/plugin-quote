"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  computeRetard,
  fmtEur,
  fmtJours,
  fmtNum,
  fmtPct,
  type RetardLigne,
  type RetardTone,
} from "@/lib/marketing/calculateur-penalites-retard-livraison";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const HYPOTHESES =
  "Valeurs par défaut : hypothèses d'exemple, pas des taux de référence ni des usages d'une profession. Une pénalité de retard prévue au contrat est une clause pénale (article 1231-5 du Code civil) : le juge peut la réduire si elle est manifestement excessive, ou l'augmenter si elle est dérisoire, et sauf inexécution définitive elle n'est encourue qu'après mise en demeure.";

export function CalculateurPenalitesRetardLivraisonCalculator() {
  const [montantHT, setMontantHT] = useState(String(DEFAULTS.montantHT));
  const [assiette, setAssiette] = useState<string>(DEFAULTS.assiette);
  const [montantRetard, setMontantRetard] = useState(String(DEFAULTS.montantRetard));
  const [datePrevue, setDatePrevue] = useState<string>(DEFAULTS.datePrevue);
  const [dateReelle, setDateReelle] = useState<string>(DEFAULTS.dateReelle);
  const [mode, setMode] = useState<string>(DEFAULTS.mode);
  const [franchise, setFranchise] = useState(String(DEFAULTS.franchise));
  const [taux, setTaux] = useState(String(DEFAULTS.taux));
  const [fraction, setFraction] = useState(String(DEFAULTS.fraction));
  const [forfait, setForfait] = useState(String(DEFAULTS.forfait));
  const [plafond, setPlafond] = useState(String(DEFAULTS.plafond));
  const [seuil, setSeuil] = useState(String(DEFAULTS.seuil));
  const [prejudice, setPrejudice] = useState(String(DEFAULTS.prejudice));

  const result = useMemo(
    () =>
      computeRetard({
        montantHT,
        assiette,
        montantRetard,
        datePrevue,
        dateReelle,
        mode,
        franchise,
        taux,
        fraction,
        forfait,
        plafond,
        seuil,
        prejudice,
      }),
    [
      montantHT,
      assiette,
      montantRetard,
      datePrevue,
      dateReelle,
      mode,
      franchise,
      taux,
      fraction,
      forfait,
      plafond,
      seuil,
      prejudice,
    ],
  );

  const joursRetardLabel =
    result.ecart != null && result.ecart < 0
      ? "0 jour (avance de " + fmtJours(-result.ecart) + ")"
      : fmtJours(result.joursRetard);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form
        id="form"
        className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="text-base font-semibold">La commande</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="montantHT"
            label="Montant de la commande (€ HT)"
            hint="Le montant total du devis signé ou du bon de commande, hors taxes. Le plafond se calcule sur ce montant."
            value={montantHT}
            min={0}
            step={100}
            onChange={setMontantHT}
          />
          <SelectField
            id="assiette"
            label="La pénalité se calcule sur"
            hint="Ce que dit votre clause. Sans précision, les deux lectures se défendent : écrivez-le."
            value={assiette}
            onChange={setAssiette}
            options={[
              { value: "commande", label: "Le montant total de la commande" },
              { value: "partie", label: "La seule partie livrée en retard" },
            ]}
          />
        </div>
        <div className="mt-4">
          <Field
            id="montantRetard"
            label="Valeur de la partie en retard (€ HT)"
            hint="Utilisé seulement si la pénalité porte sur la partie en retard. Plafonné au montant de la commande."
            value={montantRetard}
            min={0}
            step={100}
            onChange={setMontantRetard}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Les dates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <DateField
            id="datePrevue"
            label="Date de livraison ou de fin convenue"
            hint="La date écrite dans le devis signé, ou celle qui découle du délai convenu."
            value={datePrevue}
            onChange={setDatePrevue}
          />
          <DateField
            id="dateReelle"
            label="Date de livraison réelle (ou prévue)"
            hint="Les jours sont comptés en jours calendaires, à partir du lendemain de la date convenue."
            value={dateReelle}
            onChange={setDateReelle}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Votre clause de pénalités</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="mode"
            label="Mode de calcul"
            hint="1 ‰ par jour, c'est 1/1000 de l'assiette chaque jour. Le CCAG Travaux des marchés publics prévoit 1/3000 par jour."
            value={mode}
            onChange={setMode}
            options={[
              { value: "taux", label: "Un taux par jour, en pour mille (‰)" },
              { value: "fraction", label: "Une fraction par jour (1/N du montant)" },
              { value: "forfait", label: "Un montant fixe par jour (€ HT)" },
            ]}
          />
          <Field
            id="franchise"
            label="Franchise (jours sans pénalité)"
            hint="Les premiers jours de retard tolérés. 0 si la clause n'en prévoit pas."
            value={franchise}
            min={0}
            max={365}
            step={1}
            onChange={setFranchise}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="taux"
            label="Taux par jour (‰)"
            hint="Mode « taux » seulement."
            value={taux}
            min={0}
            max={100}
            step={0.1}
            onChange={setTaux}
          />
          <Field
            id="fraction"
            label="Fraction : 1 / N par jour, N ="
            hint="Mode « fraction » seulement."
            value={fraction}
            min={1}
            max={100000}
            step={100}
            onChange={setFraction}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="forfait"
            label="Montant fixe par jour (€ HT)"
            hint="Mode « montant fixe » seulement. L'assiette ne compte pas."
            value={forfait}
            min={0}
            step={10}
            onChange={setForfait}
          />
          <Field
            id="plafond"
            label="Plafond (% de la commande)"
            hint="0 si la clause ne prévoit pas de plafond."
            value={plafond}
            min={0}
            max={100}
            step={1}
            onChange={setPlafond}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="seuil"
            label="Seuil d'exonération (€ HT)"
            hint="Si le total des pénalités ne dépasse pas ce montant, rien n'est dû. 0 si la clause n'en prévoit pas."
            value={seuil}
            min={0}
            step={100}
            onChange={setSeuil}
          />
          <Field
            id="prejudice"
            label="Préjudice estimé du retard (€ HT)"
            hint="Ce que le retard coûte vraiment au client : arrêt, location de remplacement, heures perdues. 0 si vous ne savez pas."
            value={prejudice}
            min={0}
            step={100}
            onChange={setPrejudice}
          />
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">{HYPOTHESES}</p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le retard</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="joursRetard" label="Jours de retard" value={joursRetardLabel} />
          <Metric id="joursPenalises" label="Jours pénalisés (après la franchise)" value={fmtJours(result.joursPenalises)} />
          <Metric id="parJour" label="Pénalité par jour" value={fmtEur(result.parJour)} />
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">La pénalité due</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="brut" label="Pénalité avant plafond" value={fmtEur(result.brut)} />
          <Metric
            id="plafondOut"
            label="Plafond"
            value={result.plafondMontant == null ? "Aucun" : fmtEur(result.plafondMontant) + " (" + fmtPct(result.plafond) + ")"}
          />
          <Metric id="due" label="Pénalité due" value={fmtEur(result.due)} />
          <Metric id="pctCommande" label="Part de la commande" value={fmtPct(result.pctCommande)} />
          <Metric id="net" label="Reste à payer sur la commande" value={fmtEur(result.net)} />
          <Metric
            id="joursPlafond"
            label="Plafond atteint au"
            value={result.joursPlafond == null ? "n/a" : result.joursPlafond + "e jour de retard"}
          />
          <Metric id="ratio" label="Pénalité rapportée au préjudice estimé" value={fmtPct(result.ratio)} />
        </dl>
        <p id="verdict" className={`mt-4 rounded-xl px-4 py-3 text-sm ${alertClass(result.etat)}`}>
          {result.verdict}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">La pénalité selon la durée du retard</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">Retard</th>
                <th className="py-2 pr-2 font-semibold">Jours pénalisés</th>
                <th className="py-2 pr-2 font-semibold">Pénalité due</th>
                <th className="py-2 font-semibold">Part de la commande</th>
              </tr>
            </thead>
            <tbody id="detail">
              {result.lignes.map((ligne) => (
                <LigneRow key={ligne.jours} ligne={ligne} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          La ligne surlignée est votre retard. Même clause, même commande : seule la durée change. Au-delà du plafond, la
          pénalité ne bouge plus.
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

function LigneRow({ ligne }: { ligne: RetardLigne }) {
  const rowClass = ligne.courant
    ? "bg-orange-50 font-semibold"
    : ligne.plafonne
      ? "border-t border-mk-border bg-amber-50"
      : "border-t border-mk-border";
  return (
    <tr className={rowClass}>
      <td className="py-2 pr-2">{fmtJours(ligne.jours)}</td>
      <td className="py-2 pr-2">{fmtNum(ligne.joursPenalises)}</td>
      <td className="py-2 pr-2">
        {fmtEur(ligne.due)}
        {ligne.plafonne ? " (plafond)" : ""}
      </td>
      <td className="py-2">{fmtPct(ligne.pct)}</td>
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

function DateField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-medium">{label}</span>
      <input id={id} type="date" value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass} />
      {hint ? <span className="mt-1 block text-[12px] leading-5 text-mk-faint">{hint}</span> : null}
    </label>
  );
}

function SelectField({
  id,
  label,
  hint,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-medium">{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

function alertClass(tone: RetardTone) {
  if (tone === "ok") return "bg-emerald-50 font-semibold text-emerald-800";
  if (tone === "warn") return "bg-amber-50 font-semibold text-amber-900";
  if (tone === "bad") return "bg-rose-50 font-semibold text-rose-800";
  return "bg-mk-band font-medium text-mk-ink";
}
