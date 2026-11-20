/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  LABEL_SETS,
  STATUT_LABELS,
  computeAgent,
} from "@/lib/marketing/calculateur-preavis-commission-agent-commercial";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = { ...DEFAULTS };

type Values = typeof INITIAL;

export function CalculateurPreavisCommissionAgentCommercialCalculator() {
  const [values, setValues] = useState<Values>(INITIAL);
  const view = useMemo(() => computeAgent(values), [values]);

  function setValue(id: keyof Values, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">La mission</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="mission"
            label="Ce que fait l'intermédiaire"
            hint="C'est la pratique qui compte, pas le titre du contrat."
            value={values.mission}
            options={LABEL_SETS.mission}
            onChange={setValue}
          />
          <SelectField
            id="independance"
            label="Son organisation"
            value={values.independance}
            options={LABEL_SETS.independance}
            onChange={setValue}
          />
          <SelectField
            id="ecrit"
            label="Contrat écrit"
            value={values.ecrit}
            options={LABEL_SETS.ecrit}
            onChange={setValue}
          />
          <SelectField
            id="secteurConfie"
            label="Secteur ou clientèle confiés"
            value={values.secteurConfie}
            options={LABEL_SETS.secteurConfie}
            onChange={setValue}
          />
        </div>
        <h2 className="mt-6 text-base font-semibold">Le contrat et sa fin</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="typeContrat"
            label="Type de contrat"
            value={values.typeContrat}
            options={LABEL_SETS.typeContrat}
            onChange={setValue}
          />
          <div>
            <label htmlFor="dateDebut" className="text-sm font-medium">Début du contrat</label>
            <input id="dateDebut" type="date" className={fieldClass} value={values.dateDebut} onChange={(event) => setValue("dateDebut", event.target.value)} />
            <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">Date de début, y compris une période à durée déterminée qui a continué.</p>
          </div>
          <div>
            <label htmlFor="dateNotif" className="text-sm font-medium">Date de la lettre de résiliation</label>
            <input id="dateNotif" type="date" className={fieldClass} value={values.dateNotif} onChange={(event) => setValue("dateNotif", event.target.value)} />
            <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">Pour un contrat à durée déterminée qui s'arrête, mettez la date du terme.</p>
          </div>
          <SelectField
            id="initiative"
            label="Qui met fin au contrat, et pourquoi"
            value={values.initiative}
            options={LABEL_SETS.initiative}
            onChange={setValue}
          />
          <div>
            <label htmlFor="preavisContrat" className="text-sm font-medium">Préavis écrit dans le contrat (mois)</label>
            <input id="preavisContrat" type="text" inputMode="numeric" className={fieldClass} value={values.preavisContrat} onChange={(event) => setValue("preavisContrat", event.target.value)} />
            <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">0 si le contrat ne dit rien.</p>
          </div>
          <SelectField
            id="finMois"
            label="Fin du préavis"
            value={values.finMois}
            options={LABEL_SETS.finMois}
            onChange={setValue}
          />
          <div>
            <label htmlFor="nonConcurrenceMois" className="text-sm font-medium">Non-concurrence après le contrat (mois)</label>
            <input id="nonConcurrenceMois" type="text" inputMode="numeric" className={fieldClass} value={values.nonConcurrenceMois} onChange={(event) => setValue("nonConcurrenceMois", event.target.value)} />
            <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">0 s'il n'y en a pas.</p>
          </div>
          <div>
            <label htmlFor="commissions24" className="text-sm font-medium">Commissions brutes des 24 derniers mois (€)</label>
            <input id="commissions24" type="text" inputMode="decimal" className={fieldClass} value={values.commissions24} onChange={(event) => setValue("commissions24", event.target.value)} />
            <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">Sert au repère d'indemnité.</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">Le devis</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="origine"
            label="Origine du devis"
            value={values.origine}
            options={LABEL_SETS.origine}
            onChange={setValue}
          />
          <div>
            <label htmlFor="montantDevis" className="text-sm font-medium">Montant du devis (€ HT)</label>
            <input id="montantDevis" type="text" inputMode="decimal" className={fieldClass} value={values.montantDevis} onChange={(event) => setValue("montantDevis", event.target.value)} />
          </div>
          <div>
            <label htmlFor="taux" className="text-sm font-medium">Taux de commission (%)</label>
            <input id="taux" type="text" inputMode="decimal" className={fieldClass} value={values.taux} onChange={(event) => setValue("taux", event.target.value)} />
          </div>
          <div>
            <label htmlFor="dateSignature" className="text-sm font-medium">Date de signature du devis</label>
            <input id="dateSignature" type="date" className={fieldClass} value={values.dateSignature} onChange={(event) => setValue("dateSignature", event.target.value)} />
          </div>
          <div>
            <label htmlFor="dateExecution" className="text-sm font-medium">Date d'exécution (livraison, pose, fin de prestation)</label>
            <input id="dateExecution" type="date" className={fieldClass} value={values.dateExecution} onChange={(event) => setValue("dateExecution", event.target.value)} />
            <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">La commission est acquise à cette date, au plus tard au paiement du client.</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Une PME près d'Angers qui fabrique des cloisons et du mobilier de laboratoire travaille depuis le 1er mars 2021 avec un agent commercial installé à Rennes, chargé de la Bretagne, à 5 % du montant hors taxes. Son contrat prévoit un préavis d'un mois et une non-concurrence de trois ans. Le dirigeant envoie la lettre de résiliation le lundi 16 novembre 2026. Un devis de 48 000 € HT préparé par l'agent pour un laboratoire de Vannes est signé le 10 décembre 2026 et livré le 15 février 2027. Commissions des vingt-quatre derniers mois : 86 400 €.</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le résultat</h2>
        <dl className="mt-4 space-y-3">
          <Metric label="Préavis" value={view.preavisLabel} />
          <Metric label="Fin du contrat" value={view.finLabel} />
          <Metric label="Repère d'indemnité de fin de contrat" value={view.indemniteLabel} />
          <Metric label="Commission sur le devis" value={view.commissionLabel} />
          <Metric label="Paiement et relevé au plus tard" value={view.limiteLabel} />
          <Metric label="Points bloquants / à revoir" value={`${view.nbBad} / ${view.nbWarn}`} />
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.etat)}>{view.verdict}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le contrôle point par point</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">Point</th>
                <th className="py-2 pr-2 font-semibold">Statut</th>
                <th className="py-2 pr-2 font-semibold">Ce que cela veut dire</th>
              </tr>
            </thead>
            <tbody>
              {view.controles.map((row) => (
                <tr key={row.id} className={rowClass(row.statut)}>
                  <td className="border-t border-mk-border py-2 pr-2 align-top">{row.point}</td>
                  <td className={"border-t border-mk-border py-2 pr-2 align-top font-medium " + statusClass(row.statut)}>{STATUT_LABELS[row.statut]}</td>
                  <td className="border-t border-mk-border py-2 pr-2 align-top">{row.texte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">Articles L134-1 à L134-16 et R134-3 du code de commerce, lus sur Légifrance le 20 novembre 2026 ; fiche « Devenir agent commercial indépendant » de Service Public Entreprendre (vérifiée le 6 février 2026) pour le repère de deux ou trois années de commissions ; Cass. com. 3 avril 2012 (n° 11-13.527), 16 novembre 2022 (n° 21-17.423) et 24 avril 2024 (n° 23-12.643). Lecture retenue pour le préavis : nombre de mois compté à partir de la lettre, puis fin repoussée au dernier jour du mois civil. Non traités : commerciaux salariés et VRP, agents soumis à des règles particulières (assurance, immobilier), droit étranger, délai raisonnable de l'article L134-7.</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">La clause à reprendre dans le contrat d'agence</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view.clause}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view.clause} />
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Ce qu'il faut faire</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {view.actions.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">La lettre à envoyer à l'agent</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view.message}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view.message} />
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Récapitulatif</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view.recap}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view.recap} />
        </div>
      </section>
    </div>
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
  id: keyof Values;
  label: string;
  hint?: string;
  value: string;
  options: Record<string, string>;
  onChange: (id: keyof Values, value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <select id={id} className={fieldClass} value={value} onChange={(event) => onChange(id, event.target.value)}>
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
      {hint ? <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">{hint}</p> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-mk-muted">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums text-mk-accent">{value}</dd>
    </div>
  );
}

function alertClass(etat: string) {
  if (etat === "ok") return "bg-emerald-50 font-semibold text-emerald-800";
  if (etat === "bad") return "bg-rose-50 font-semibold text-rose-800";
  if (etat === "warn") return "bg-amber-50 font-semibold text-amber-900";
  return "bg-mk-band font-medium text-mk-ink";
}

function rowClass(statut: string) {
  if (statut === "bad" || statut === "warn") return "bg-amber-50";
  return "";
}

function statusClass(statut: string) {
  if (statut === "ok") return "text-emerald-800";
  if (statut === "warn") return "text-amber-900";
  if (statut === "bad") return "text-rose-800";
  return "text-mk-muted";
}
