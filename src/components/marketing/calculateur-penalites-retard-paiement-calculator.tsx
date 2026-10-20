"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  computePenalites,
  fmtDate,
  fmtEur,
  fmtJours,
  fmtPct,
  type PenalitesSegment,
  type PenalitesTone,
} from "@/lib/marketing/calculateur-penalites-retard-paiement";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const HYPOTHESES =
  "Valeurs par défaut : hypothèses d'exemple, pas des moyennes de marché. Les taux du tableau sont les taux officiels publiés (BCE, arrêtés du taux de l'intérêt légal).";

export function CalculateurPenalitesRetardPaiementCalculator() {
  const [montant, setMontant] = useState(String(DEFAULTS.montant));
  const [nbFactures, setNbFactures] = useState(String(DEFAULTS.nbFactures));
  const [dateFacture, setDateFacture] = useState<string>(DEFAULTS.dateFacture);
  const [delaiType, setDelaiType] = useState<string>(DEFAULTS.delaiType);
  const [delaiJours, setDelaiJours] = useState(String(DEFAULTS.delaiJours));
  const [dateEcheance, setDateEcheance] = useState<string>(DEFAULTS.dateEcheance);
  const [datePaiement, setDatePaiement] = useState<string>(DEFAULTS.datePaiement);
  const [tauxMode, setTauxMode] = useState<string>(DEFAULTS.tauxMode);
  const [tauxContrat, setTauxContrat] = useState(String(DEFAULTS.tauxContrat));
  const [bceAutre, setBceAutre] = useState(String(DEFAULTS.bceAutre));

  const result = useMemo(
    () =>
      computePenalites({
        montant,
        nbFactures,
        dateFacture,
        delaiType,
        delaiJours,
        dateEcheance,
        datePaiement,
        tauxMode,
        tauxContrat,
        bceAutre,
      }),
    [montant, nbFactures, dateFacture, delaiType, delaiJours, dateEcheance, datePaiement, tauxMode, tauxContrat, bceAutre],
  );

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
            label="Montant restant dû (€ TTC)"
            hint="La somme due qui n'a pas été payée à l'échéance. L'indemnité de 40 € ne s'y ajoute pas pour le calcul des pénalités."
            value={montant}
            min={0}
            step={100}
            onChange={setMontant}
          />
          <Field
            id="nbFactures"
            label="Nombre de factures concernées"
            hint="L'indemnité forfaitaire est due une fois par facture payée en retard. Les factures doivent avoir les mêmes dates."
            value={nbFactures}
            min={1}
            max={1000}
            step={1}
            onChange={setNbFactures}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <DateField id="dateFacture" label="Date d'émission de la facture" value={dateFacture} onChange={setDateFacture} />
          <SelectField
            id="delaiType"
            label="Délai de paiement convenu"
            value={delaiType}
            onChange={setDelaiType}
            options={[
              { value: "nets", label: "Un nombre de jours après la facture" },
              { value: "fdm1", label: "45 jours fin de mois, fin du mois puis 45 jours" },
              { value: "fdm2", label: "45 jours fin de mois, 45 jours puis fin du mois" },
              { value: "date", label: "Je saisis l'échéance moi-même" },
            ]}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="delaiJours"
            label="Nombre de jours (si jours après la facture)"
            hint="Au plus 60 jours après la date d'émission de la facture, hors secteurs à délai spécifique."
            value={delaiJours}
            min={0}
            max={365}
            step={1}
            onChange={setDelaiJours}
          />
          <DateField
            id="dateEcheance"
            label="Échéance (si saisie à la main)"
            hint="La date de règlement écrite sur la facture."
            value={dateEcheance}
            onChange={setDateEcheance}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Le paiement</h2>
        <div className="mt-4">
          <DateField
            id="datePaiement"
            label="Date du paiement (ou date du jour si la facture n'est pas payée)"
            hint="Les pénalités courent à partir du lendemain de l'échéance, jusqu'au jour du paiement."
            value={datePaiement}
            onChange={setDatePaiement}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Le taux des pénalités</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="tauxMode"
            label="Taux appliqué"
            hint="Le taux légal s'applique si vos conditions ne prévoient pas d'autre taux."
            value={tauxMode}
            onChange={setTauxMode}
            options={[
              { value: "legal", label: "Taux légal : taux BCE + 10 points" },
              { value: "contrat", label: "Taux écrit dans mes CGV ou au contrat" },
            ]}
          />
          <Field
            id="tauxContrat"
            label="Taux contractuel (% par an)"
            hint="Utilisé seulement avec « Taux écrit dans mes CGV ». Il ne peut pas être inférieur à trois fois le taux de l'intérêt légal."
            value={tauxContrat}
            min={0}
            max={100}
            step={0.01}
            onChange={setTauxContrat}
          />
        </div>
        <div className="mt-4">
          <Field
            id="bceAutre"
            label="Taux BCE pour un semestre absent du tableau (%)"
            hint="L'outil connaît les taux du 1er semestre 2024 au 2nd semestre 2026. Pour un autre semestre, il prend cette valeur, à vérifier. 2,65 % est le taux de refinancement de la BCE en vigueur depuis le 16 septembre 2026 : il ne servira au 1er semestre 2027 que s'il est encore en vigueur au 1er janvier 2027."
            value={bceAutre}
            min={0}
            max={20}
            step={0.01}
            onChange={setBceAutre}
          />
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">{HYPOTHESES}</p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"L'échéance et le retard"}</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="echeance" label="Échéance de la facture" value={fmtDate(result.echeance)} />
          <Metric id="delaiTotal" label="Délai entre la facture et l'échéance" value={fmtJours(result.delaiTotal)} />
          <Metric id="joursRetard" label="Jours de retard" value={fmtJours(result.joursRetard)} />
        </dl>
        <p id="delaiMsg" className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-sm text-mk-ink">
          {result.delaiMsg}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Ce que vous pouvez réclamer</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="penalites" label="Pénalités de retard" value={fmtEur(result.penalites)} />
          <Metric id="indemnite" label="Indemnité forfaitaire pour frais de recouvrement" value={fmtEur(result.indemnite)} />
          <Metric id="total" label="Total à réclamer, en plus du montant dû" value={fmtEur(result.total)} />
          <Metric id="parJour" label="Pénalités pour chaque jour de retard en plus" value={fmtEur(result.parJour)} />
        </dl>
        <p id="verdict" className={`mt-4 rounded-xl px-4 py-3 text-sm ${alertClass(result.etat)}`}>
          {result.verdict}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Détail par semestre</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">Semestre</th>
                <th className="py-2 pr-2 font-semibold">Jours</th>
                <th className="py-2 pr-2 font-semibold">Taux BCE</th>
                <th className="py-2 pr-2 font-semibold">Taux appliqué</th>
                <th className="py-2 pr-2 font-semibold">Plancher légal</th>
                <th className="py-2 font-semibold">Pénalités</th>
              </tr>
            </thead>
            <tbody id="detail">
              {result.segments.length === 0 ? (
                <tr className="border-t border-mk-border">
                  <td colSpan={6} className="py-2">
                    Aucun jour de retard.
                  </td>
                </tr>
              ) : (
                result.segments.map((segment) => (
                  <SegmentRow key={segment.id} segment={segment} result={result} />
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          Le taux légal change au 1er janvier et au 1er juillet : l&apos;outil applique à chaque jour de retard le taux
          de son semestre. Calcul : montant dû × taux annuel × jours ÷ 365. Plancher légal : trois fois le taux de
          l&apos;intérêt légal du semestre (créanciers professionnels).
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

function SegmentRow({
  segment,
  result,
}: {
  segment: PenalitesSegment;
  result: { tauxMode: string; tauxContrat: number };
}) {
  const weak =
    segment.provisoire ||
    (result.tauxMode === "contrat" && segment.plancher != null && result.tauxContrat < segment.plancher);
  return (
    <tr className={`border-t border-mk-border ${weak ? "bg-amber-50" : ""}`}>
      <td className="py-2 pr-2">{segment.label + (segment.provisoire ? " (taux à vérifier)" : "")}</td>
      <td className="py-2 pr-2">{fmtJours(segment.jours)}</td>
      <td className="py-2 pr-2">{fmtPct(segment.bce)}</td>
      <td className="py-2 pr-2">{fmtPct(segment.taux)}</td>
      <td className="py-2 pr-2">{segment.plancher == null ? "n/a" : fmtPct(segment.plancher)}</td>
      <td className="py-2">{fmtEur(segment.penalite)}</td>
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
      <input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
      />
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

function alertClass(tone: PenalitesTone) {
  if (tone === "ok") return "bg-emerald-50 font-semibold text-emerald-800";
  if (tone === "warn") return "bg-amber-50 font-semibold text-amber-900";
  if (tone === "bad") return "bg-rose-50 font-semibold text-rose-800";
  return "bg-mk-band font-medium text-mk-ink";
}
