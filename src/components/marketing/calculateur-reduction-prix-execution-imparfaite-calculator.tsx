"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  LABEL_SETS,
  STATUT_LABELS,
  computeReduction,
} from "@/lib/marketing/calculateur-reduction-prix-execution-imparfaite";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL: Record<string, string> = { ...DEFAULTS };

const NOTE = "Code civil, articles 1170, 1171, 1217 à 1231-5, 1344 et 1792-6, lus le 24 novembre 2026, avec Cass. 1re civ., 18 décembre 2024, n° 24-14.750 (publié au Bulletin) et Cass. 3e civ., 17 octobre 2024, n° 23-10.288. Lectures retenues : la réduction suppose une exécution imparfaite, une mise en demeure et une notification dans les meilleurs délais ; décidée seule, elle ne joue que sur ce qui reste à payer et se fait aux risques du client ; elle doit être proportionnelle, et votre acceptation doit être écrite. La méthode de calcul (éléments touchés × perte de valeur) est un choix de méthode, pas une règle de la loi. « Bloquant » signale un point qui empêche la réduction annoncée telle quelle. Cas non traités : ventes aux consommateurs, marchés publics, droit étranger, vices cachés (article 1644) et garanties de la construction (décennale, biennale), procédure collective du client, traitement fiscal de l'avoir.";

export function CalculateurReductionPrixExecutionImparfaiteCalculator() {
  const [values, setValues] = useState<Record<string, string>>(INITIAL);
  const view = useMemo(() => computeReduction(values), [values]);

  function setValue(id: string, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">Le contrat et le prix</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="dateContrat" label="Date de conclusion du contrat" value={values.dateContrat} options={LABEL_SETS.dateContrat} onChange={setValue} />
          <SelectField id="clause" label="Ce que dit votre devis sur les défauts" value={values.clause} options={LABEL_SETS.clause} onChange={setValue} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField id="prix" label="Prix total de la prestation (€ HT)" value={values.prix} onChange={setValue} numeric />
          <TextField id="paye" label="Déjà payé par le client (€ HT)" hint="Acomptes et règlements reçus." value={values.paye} onChange={setValue} numeric />
          <TextField id="reprise" label="Coût d'une reprise pour vous (€ HT, 0 si inconnu)" value={values.reprise} onChange={setValue} numeric />
        </div>
        <h2 className="mt-6 text-base font-semibold">Le défaut</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField id="quantite" label="Éléments livrés (pièces, mètres, jours)" value={values.quantite} onChange={setValue} numeric />
          <TextField id="touches" label="Éléments touchés par le défaut" hint="Le nombre constaté, pas celui annoncé." value={values.touches} onChange={setValue} numeric />
          <TextField id="perte" label="Perte de valeur des éléments touchés (%)" hint="100 % si l'élément est perdu." value={values.perte} onChange={setValue} numeric />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="gravite" label="Gravité du défaut" value={values.gravite} options={LABEL_SETS.gravite} onChange={setValue} />
          <SelectField id="preuve" label="Preuve du défaut" value={values.preuve} options={LABEL_SETS.preuve} onChange={setValue} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="reception" label="Signalement du défaut" value={values.reception} options={LABEL_SETS.reception} onChange={setValue} />
          <SelectField id="repriseStatut" label="Reprise" value={values.repriseStatut} options={LABEL_SETS.repriseStatut} onChange={setValue} />
        </div>
        <h2 className="mt-6 text-base font-semibold">Ce que le client a fait, et votre réponse</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="miseEnDemeure" label="Mise en demeure de corriger" value={values.miseEnDemeure} options={LABEL_SETS.miseEnDemeure} onChange={setValue} />
          <SelectField id="notification" label="Notification de la réduction" value={values.notification} options={LABEL_SETS.notification} onChange={setValue} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField id="demande" label="Réduction annoncée par le client (€ HT, 0 si aucune)" value={values.demande} onChange={setValue} numeric />
          <SelectField id="accord" label="Votre réponse" value={values.accord} options={LABEL_SETS.accord} onChange={setValue} />
        </div>
        <h2 className="mt-6 text-base font-semibold">Pour la clause de vos prochains devis</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField id="delaiSignal" label="Délai de signalement des défauts (jours)" value={values.delaiSignal} onChange={setValue} numeric />
          <TextField id="delaiReprise" label="Délai de reprise après constat (jours ouvrés)" value={values.delaiReprise} onChange={setValue} numeric />
        </div>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le résultat</h2>
        <dl className="mt-4 space-y-3">
          <Metric label="Réduction proportionnelle" value={view.reductionLabel} />
          <Metric label="Part des éléments touchés" value={view.partLabel} />
          <Metric label="Écart avec la demande du client" value={view.ecartLabel} />
          <Metric label="Reste à payer après réduction" value={view.resteLabel} />
          <Metric label="Reprise ou réduction" value={view.repriseLabel} />
          <Metric label="Points bloquants / à revoir" value={view.nbBad + " / " + view.nbWarn} />
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
              {view.controles.map((row: { id: string; point: string; statut: string; texte: string }) => (
                <tr key={row.id} className={rowClass(row.statut)}>
                  <td className="border-t border-mk-border py-2 pr-2 align-top">{row.point}</td>
                  <td className={"border-t border-mk-border py-2 pr-2 align-top font-medium " + statusClass(row.statut)}>
                    {STATUT_LABELS[row.statut as keyof typeof STATUT_LABELS]}
                  </td>
                  <td className="border-t border-mk-border py-2 pr-2 align-top">{row.texte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{NOTE}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">La clause à écrire dans vos devis</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view.clause}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view.clause} />
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Ce qu'il faut faire"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {view.actions.map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le courrier au client</h2>
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
  id: string;
  label: string;
  hint?: string;
  value: string;
  options: Record<string, string>;
  onChange: (id: string, value: string) => void;
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

function TextField({
  id,
  label,
  hint,
  value,
  onChange,
  numeric,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (id: string, value: string) => void;
  numeric?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input
        id={id}
        type="text"
        inputMode={numeric ? "decimal" : "text"}
        className={fieldClass}
        value={value}
        onChange={(event) => onChange(id, event.target.value)}
      />
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
