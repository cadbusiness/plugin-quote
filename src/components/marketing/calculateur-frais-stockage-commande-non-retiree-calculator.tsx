"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  LABEL_SETS,
  STATUT_LABELS,
  computeStockage,
} from "@/lib/marketing/calculateur-frais-stockage-commande-non-retiree";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL: Record<string, string> = { ...DEFAULTS };

export function CalculateurFraisStockageCommandeNonRetireeCalculator() {
  const [values, setValues] = useState<Record<string, string>>(INITIAL);
  const view = useMemo(() => computeStockage(values), [values]);

  function setValue(id: string, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">La commande</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="nature"
            label="Ce que vous avez fait"
            hint="Le régime des risques et la sortie du contrat en dépendent."
            value={values.nature}
            options={LABEL_SETS.nature}
            onChange={setValue}
          />
          <TextField id="montantHT" label="Montant de la commande (€ HT)" value={values.montantHT} onChange={setValue} numeric />
          <TextField
            id="soldeDu"
            label="Reste dû par le client (€ HT)"
            hint="0 si tout est payé."
            value={values.soldeDu}
            onChange={setValue}
            numeric
          />
          <DateField
            id="dateDispo"
            label="Date de mise à disposition"
            hint="Le jour où la commande était prête à partir."
            value={values.dateDispo}
            onChange={setValue}
          />
          <SelectField
            id="avisEcrit"
            label="Le client a été prévenu par écrit"
            value={values.avisEcrit}
            options={LABEL_SETS.avisEcrit}
            onChange={setValue}
          />
          <TextField
            id="termeJours"
            label="Délai de retrait écrit dans le devis (jours)"
            hint="0 si le devis ne dit rien."
            value={values.termeJours}
            onChange={setValue}
            numeric
          />
        </div>
        <h2 className="mt-6 text-base font-semibold">Le devis et le stockage</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="clauseStockage"
            label="Frais de stockage écrits dans le devis accepté"
            value={values.clauseStockage}
            options={LABEL_SETS.clauseStockage}
            onChange={setValue}
          />
          <TextField
            id="tarif"
            label="Tarif de stockage (€ HT par période et par emplacement)"
            hint={"Sans clause, mettez votre coût réel : il sert d'estimation."}
            value={values.tarif}
            onChange={setValue}
            numeric
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <SelectField
            id="periode"
            label="Période de facturation"
            value={values.periode}
            options={LABEL_SETS.periode}
            onChange={setValue}
          />
          <TextField
            id="unites"
            label="Emplacements occupés"
            hint="Palettes, racks, m²."
            value={values.unites}
            onChange={setValue}
            numeric
          />
          <TextField id="franchiseJours" label="Jours gratuits" value={values.franchiseJours} onChange={setValue} numeric />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="exigibilite"
            label="Solde exigible à la mise à disposition"
            value={values.exigibilite}
            options={LABEL_SETS.exigibilite}
            onChange={setValue}
          />
          <SelectField
            id="risquesClause"
            label="Risques transférés au client à la mise à disposition"
            value={values.risquesClause}
            options={LABEL_SETS.risquesClause}
            onChange={setValue}
          />
          <SelectField
            id="reserve"
            label="Clause de réserve de propriété"
            hint="Compte surtout pour une vente."
            value={values.reserve}
            options={LABEL_SETS.reserve}
            onChange={setValue}
          />
          <SelectField
            id="clauseResolutoire"
            label="Clause résolutoire en cas de non-retrait"
            value={values.clauseResolutoire}
            options={LABEL_SETS.clauseResolutoire}
            onChange={setValue}
          />
        </div>
        <h2 className="mt-6 text-base font-semibold">La relance</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <DateField
            id="dateMED"
            label="Réception de la mise en demeure"
            hint={"Vide si elle n'est pas encore envoyée."}
            value={values.dateMED}
            onChange={setValue}
          />
          <TextField id="delaiMED" label="Délai donné (jours)" value={values.delaiMED} onChange={setValue} numeric />
          <DateField id="dateCalcul" label="Date du calcul" value={values.dateCalcul} onChange={setValue} />
        </div>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le résultat</h2>
        <dl className="mt-4 space-y-3">
          <Metric label="Retrait convenu au plus tard" value={view.termeLabel} />
          <Metric label="Frais de stockage à la date du calcul" value={view.fraisLabel} />
          <Metric label="Risques de la commande" value={view.risquesLabel} />
          <Metric label="Séquestre ou vente autorisée" value={view.sequestreLabel} />
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
                  <td className={"border-t border-mk-border py-2 pr-2 align-top font-medium " + statusClass(row.statut)}>{STATUT_LABELS[row.statut as keyof typeof STATUT_LABELS]}</td>
                  <td className="border-t border-mk-border py-2 pr-2 align-top">{row.texte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Code civil, articles 1196, 1221, 1225, 1226, 1229, 1231, 1231-1, 1231-2, 1231-5, 1344, 1344-2, 1345 à 1345-3, 1612, 1651, 1657, 1787 à 1790 et 2286, et loi du 31 décembre 1903 relative à la vente de certains objets abandonnés, lus le 20 novembre 2026 ; Cass. 1re civ., 24 octobre 2000, n° 98-17.663 (article 1657). Lectures retenues : délais en jours comptés à partir du lendemain de l'avis ; deux mois de l'article 1345-1 comptés de la réception de la mise en demeure, de quantième à quantième ; un an de la loi de 1903 compté de l'avis de mise à disposition ; mois de facturation de 30 jours. Non traités : ventes aux consommateurs, véhicules (délai de trois mois), bateaux, marchés publics, droit étranger, TVA des frais de stockage."}</p>
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
          {view.actions.map((item: string) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">La mise en demeure à envoyer au client</h2>
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
  onChange: (id: string, value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} type="date" className={fieldClass} value={value} onChange={(event) => onChange(id, event.target.value)} />
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
