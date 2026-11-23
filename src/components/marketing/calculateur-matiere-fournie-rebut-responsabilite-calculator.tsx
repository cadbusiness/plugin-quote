"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  LABEL_SETS,
  STATUT_LABELS,
  computeMatiere,
} from "@/lib/marketing/calculateur-matiere-fournie-rebut-responsabilite";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL: Record<string, string> = { ...DEFAULTS };

const NOTE =
  "Code civil, articles 570 à 572, 1112-1, 1170, 1231-1, 1787 à 1790, 1797, 1915, 1927, 1928 et 1933, lus le 23 novembre 2026, avec Cass. 1re civ., 24 mars 1993, n° 91-16.019 et Cass. 1re civ., 20 décembre 1993, n° 92-11.385, tous deux publiés au Bulletin. Lectures retenues : quand le client fournit la matière, vous répondez de la perte ou de la détérioration sauf à prouver que vous n'avez commis aucune faute ; le taux de chute, la tolérance de rebut, le plafond et la durée de conservation sont des choix de contrat, pas des règles de la loi. Cas non traités : ventes aux consommateurs, matières dangereuses ou réglementées, métaux précieux, marchés publics, droit étranger, TVA du travail à façon, procédure collective du client.";

export function CalculateurMatiereFournieRebutResponsabiliteCalculator() {
  const [values, setValues] = useState<Record<string, string>>(INITIAL);
  const view = useMemo(() => computeMatiere(values), [values]);

  function setValue(id: string, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">Le contrat et la série</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="nature"
            label="Qui fournit la matière"
            value={values.nature}
            options={LABEL_SETS.nature}
            onChange={setValue}
          />
          <SelectField
            id="unite"
            label="Unité de la matière"
            value={values.unite}
            options={LABEL_SETS.unite}
            onChange={setValue}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField id="quantite" label="Pièces bonnes commandées" value={values.quantite} onChange={setValue} numeric />
          <TextField
            id="matPiece"
            label="Matière par pièce (dans l'unité choisie)"
            hint="Copeaux compris, chute de fin de barre exclue."
            value={values.matPiece}
            onChange={setValue}
            numeric
          />
          <TextField id="prixFacon" label="Prix de la façon (€ HT par pièce)" value={values.prixFacon} onChange={setValue} numeric />
        </div>
        <h2 className="mt-6 text-base font-semibold">Ce que dit le devis</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField id="chute" label="Chute de fin de barre et de réglage (%)" value={values.chute} onChange={setValue} numeric />
          <TextField id="rebutTol" label="Rebut toléré (% des pièces)" value={values.rebutTol} onChange={setValue} numeric />
          <TextField
            id="miseEnRoute"
            label="Matière de mise en route"
            hint="Réglage, premières pièces d'essai."
            value={values.miseEnRoute}
            onChange={setValue}
            numeric
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="chuteEcrite"
            label="Le taux de chute est écrit dans le devis accepté"
            value={values.chuteEcrite}
            options={LABEL_SETS.chuteEcrite}
            onChange={setValue}
          />
          <SelectField
            id="rebutEcrit"
            label="La tolérance de rebut est écrite dans le devis accepté"
            value={values.rebutEcrit}
            options={LABEL_SETS.rebutEcrit}
            onChange={setValue}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="reliquats"
            label="Chutes et reliquat en fin de commande"
            value={values.reliquats}
            options={LABEL_SETS.reliquats}
            onChange={setValue}
          />
          <TextField
            id="plafond"
            label="Plafond de responsabilité écrit (€ HT, 0 si aucun)"
            value={values.plafond}
            onChange={setValue}
            numeric
          />
        </div>
        <h2 className="mt-6 text-base font-semibold">La matière reçue et le rebut</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField id="fournie" label="Matière fournie par le client" value={values.fournie} onChange={setValue} numeric />
          <TextField id="valeur" label="Valeur de la matière (€ HT par unité)" value={values.valeur} onChange={setValue} numeric />
          <TextField
            id="assurance"
            label="Garantie biens confiés de votre assurance (€, 0 si aucune)"
            value={values.assurance}
            onChange={setValue}
            numeric
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="reception"
            label="Réception de la matière contrôlée et datée"
            value={values.reception}
            options={LABEL_SETS.reception}
            onChange={setValue}
          />
          <SelectField
            id="tracabilite"
            label="Lots et certificats matière conservés"
            value={values.tracabilite}
            options={LABEL_SETS.tracabilite}
            onChange={setValue}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField id="rebutObs" label="Pièces rebutées constatées" value={values.rebutObs} onChange={setValue} numeric />
          <SelectField
            id="cause"
            label="Cause du rebut au-dessus de la tolérance"
            value={values.cause}
            options={LABEL_SETS.cause}
            onChange={setValue}
          />
        </div>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le résultat</h2>
        <dl className="mt-4 space-y-3">
          <Metric label="Matière à demander au client" value={view.besoinLabel} />
          <Metric label="Écart avec la matière fournie" value={view.ecartLabel} />
          <Metric label="Rebut au-dessus de la tolérance" value={view.rebutLabel} />
          <Metric label="Qui le supporte" value={view.chargeLabel} />
          <Metric label="Valeur de la matière confiée" value={view.expoLabel} />
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
