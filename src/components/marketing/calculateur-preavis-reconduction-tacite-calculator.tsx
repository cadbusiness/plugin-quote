"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  computePreavis,
  fmtDate,
  fmtHt,
  type PreavisLigne,
  type PreavisMode,
  type PreavisTone,
  type PreavisUnite,
} from "@/lib/marketing/calculateur-preavis-reconduction-tacite";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40 disabled:bg-mk-band disabled:text-mk-faint";

const HYPOTHESES =
  "Valeurs par défaut : hypothèses d'exemple, pas des usages d'une profession ni des durées imposées par la loi. Le préavis se compte à rebours depuis la fin de la période : relisez votre clause pour savoir s'il court depuis l'envoi ou depuis la réception.";

const MODE_OPTIONS: { value: PreavisMode; label: string }[] = [
  { value: "periode", label: "Reconduction par périodes de même type" },
  { value: "indeterminee", label: "Poursuite à durée indéterminée" },
  { value: "aucune", label: "Fin sans reconduction" },
];

const UNITE_OPTIONS: { value: PreavisUnite; label: string }[] = [
  { value: "mois", label: "mois" },
  { value: "jours", label: "jours" },
];

export function CalculateurPreavisReconductionTaciteCalculator() {
  const [dateDebut, setDateDebut] = useState<string>(DEFAULTS.dateDebut);
  const [dureeInitiale, setDureeInitiale] = useState(String(DEFAULTS.dureeInitiale));
  const [mode, setMode] = useState<PreavisMode>(DEFAULTS.mode);
  const [dureeReconduction, setDureeReconduction] = useState(String(DEFAULTS.dureeReconduction));
  const [preavis, setPreavis] = useState(String(DEFAULTS.preavis));
  const [unite, setUnite] = useState<PreavisUnite>(DEFAULTS.unite);
  const [dateCourrier, setDateCourrier] = useState<string>(DEFAULTS.dateCourrier);
  const [mensuel, setMensuel] = useState(String(DEFAULTS.mensuel));

  const result = useMemo(
    () =>
      computePreavis({
        dateDebut,
        dureeInitiale,
        mode,
        dureeReconduction,
        preavis,
        unite,
        dateCourrier,
        mensuel,
      }),
    [dateDebut, dureeInitiale, mode, dureeReconduction, preavis, unite, dateCourrier, mensuel],
  );

  const periodeCourante = result.valide
    ? result.periodeLibelle +
      (result.periodeFin
        ? ", du " + fmtDate(result.periodeDebut) + " au " + fmtDate(result.periodeFin)
        : ", depuis le " + fmtDate(result.periodeDebut))
    : "n/a";
  const montant =
    result.montantEngage == null ? "n/a" : fmtHt(result.montantEngage) + " (" + result.joursEngages + " jours)";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form
        id="form"
        className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="text-base font-semibold">Le contrat</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <DateField
            id="dateDebut"
            label="Date de début du contrat"
            hint="La date de prise d'effet écrite au contrat."
            value={dateDebut}
            onChange={setDateDebut}
          />
          <Field
            id="dureeInitiale"
            label="Durée initiale (mois)"
            hint="La première période ferme, avant toute reconduction."
            value={dureeInitiale}
            min={1}
            max={120}
            step={1}
            onChange={setDureeInitiale}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block" htmlFor="mode">
            <span className="text-sm font-medium">À la fin de la durée initiale</span>
            <select
              id="mode"
              value={mode}
              onChange={(event) => setMode(event.target.value as PreavisMode)}
              className={fieldClass}
            >
              {MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
              Ce que dit la clause de durée du contrat.
            </span>
          </label>
          <Field
            id="dureeReconduction"
            label="Durée de chaque reconduction (mois)"
            hint="Utilisé seulement pour une reconduction par périodes."
            value={dureeReconduction}
            min={1}
            max={120}
            step={1}
            disabled={result.mode !== "periode"}
            onChange={setDureeReconduction}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Le préavis</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="preavis"
            label="Préavis prévu au contrat"
            hint="0 si le contrat n'en prévoit pas."
            value={preavis}
            min={0}
            step={1}
            onChange={setPreavis}
          />
          <label className="block" htmlFor="unite">
            <span className="text-sm font-medium">Unité</span>
            <select
              id="unite"
              value={unite}
              onChange={(event) => setUnite(event.target.value as PreavisUnite)}
              className={fieldClass}
            >
              {UNITE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h2 className="mt-6 text-base font-semibold">Votre situation</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <DateField
            id="dateCourrier"
            label="Date de réception du courrier de résiliation"
            hint="La date à laquelle l'autre partie reçoit le courrier, ou la date d'envoi si votre contrat compte à partir de l'envoi."
            value={dateCourrier}
            onChange={setDateCourrier}
          />
          <Field
            id="mensuel"
            label="Montant mensuel (€ HT)"
            hint="Facultatif. 0 pour ne pas calculer le montant engagé."
            value={mensuel}
            min={0}
            step={10}
            onChange={setMensuel}
          />
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">{HYPOTHESES}</p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Les dates</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="periodeCourante" label="Période en cours à la date du courrier" value={periodeCourante} />
          <Metric id="dateLimite" label="Date limite pour dénoncer cette période" value={result.limiteTexte} />
          <Metric id="finEffective" label="Fin effective du contrat" value={fmtDate(result.finEffective)} />
          <Metric id="montantEngage" label="Montant encore engagé jusqu'à la fin" value={montant} />
          <Metric id="dureeRelation" label="Durée totale de la relation" value={result.dureeRelation} />
        </dl>
        <p id="verdict" className={`mt-4 rounded-xl px-4 py-3 text-sm ${alertClass(result.etat)}`}>
          {result.verdict}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Le calendrier des périodes</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">Période</th>
                <th className="py-2 pr-2 font-semibold">Du</th>
                <th className="py-2 pr-2 font-semibold">Au</th>
                <th className="py-2 pr-2 font-semibold">Dénoncer au plus tard le</th>
                <th className="py-2 font-semibold">État</th>
              </tr>
            </thead>
            <tbody id="detail">
              {result.lignes.map((ligne) => (
                <LigneRow key={`${ligne.periode}-${ligne.du}`} ligne={ligne} mode={result.mode} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          La ligne surlignée est la période en cours à la date du courrier. Les dates sont calculées mois par mois
          depuis la date de début, sans tenir compte des jours fériés.
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
        <h2 className="text-base font-semibold">Clause de durée pour le devis (à adapter)</h2>
        <pre
          id="clause"
          className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] px-3 py-3 text-sm leading-6 text-mk-ink ring-1 ring-mk-border"
        >
          {result.clause}
        </pre>
        <div className="mt-3">
          <CopyButton text={result.clause} label="Copier" />
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

function LigneRow({ ligne, mode }: { ligne: PreavisLigne; mode: PreavisMode }) {
  const rowClass = ligne.courant ? "bg-orange-50 font-semibold" : "border-t border-mk-border";
  const limite = ligne.limite ? fmtDate(ligne.limite) : mode === "aucune" ? "sans objet" : "préavis à tout moment";
  return (
    <tr className={rowClass}>
      <td className="py-2 pr-2">{ligne.periode}</td>
      <td className="py-2 pr-2">{fmtDate(ligne.du)}</td>
      <td className="py-2 pr-2">{ligne.au ? fmtDate(ligne.au) : "sans terme"}</td>
      <td className="py-2 pr-2">{limite}</td>
      <td className="py-2">
        {ligne.etatPeriode}
        {ligne.fin ? " · fin" : ""}
      </td>
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
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  min: number;
  max?: number;
  step: number;
  disabled?: boolean;
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
        disabled={disabled}
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

function alertClass(tone: PreavisTone) {
  if (tone === "ok") return "bg-emerald-50 font-semibold text-emerald-800";
  if (tone === "warn") return "bg-amber-50 font-semibold text-amber-900";
  if (tone === "bad") return "bg-rose-50 font-semibold text-rose-800";
  return "bg-mk-band font-medium text-mk-ink";
}
