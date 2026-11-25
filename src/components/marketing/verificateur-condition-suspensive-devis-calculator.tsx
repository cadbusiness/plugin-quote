"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  LABEL_SETS,
  STATUT_LABELS,
  verifierCondition,
} from "@/lib/marketing/verificateur-condition-suspensive-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL: Record<string, string> = { ...DEFAULTS };

const NOTE =
  "Code civil, articles 1103, 1104, 1113, 1118, 1120, 1186, 1188, 1190, 1217, 1231-2, 1304 à 1304-7 et 1353 ; code de commerce, article L110-3. Arrêts relus : Cass. 3e civ., 24 septembre 2026, n° 24-16.732, publié au Bulletin (condition réputée accomplie seulement contre le débiteur obligé sous la condition) ; Cass. 3e civ., 24 septembre 2026, n° 24-16.361 (renonciation non équivoque) ; Cass. com., 11 février 2026, n° 24-18.443, publié au Bulletin (potestativité appréciée chez le débiteur) ; Cass. com., 25 juin 2025, n° 22-17.090 (condition potestative, base légale) ; Cass. com., 18 juin 2025, n° 23-14.050 (condition non accomplie : contrat non formé, restitution) ; Cass. com., 22 septembre 2021, n° 19-23.958 (circonstances objectives). Textes lus le 25 novembre 2026. Lectures retenues : le client est débiteur du prix sous la condition ; une réserve ajoutée à la signature est une offre nouvelle ; l'acompte versé pendant l'attente est réclamable et se rend en cas de défaillance. Non traités : ventes et travaux pour des consommateurs (crédit affecté), promesses de vente immobilière, marchés publics, procédure collective du client, droit étranger. Ce n'est pas un conseil juridique.";

export function VerificateurConditionSuspensiveDevisCalculator() {
  const [values, setValues] = useState<Record<string, string>>(INITIAL);
  const view = useMemo(() => verifierCondition(values), [values]);

  function setValue(id: string, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">La condition</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="evenement" label="De quoi dépend la commande" value={values.evenement} options={LABEL_SETS.evenement} onChange={setValue} />
          <SelectField
            id="redaction"
            label="Comment la condition a été écrite"
            hint="Une réserve ajoutée par le client n'est pas une acceptation de votre devis (article 1118)."
            value={values.redaction}
            options={LABEL_SETS.redaction}
            onChange={setValue}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="delai" label="Date limite de réalisation" value={values.delai} options={LABEL_SETS.delai} onChange={setValue} />
          <SelectField id="demarches" label="Démarches que le client doit faire" value={values.demarches} options={LABEL_SETS.demarches} onChange={setValue} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="beneficiaire"
            label="Dans l'intérêt de qui la condition est stipulée"
            hint="Seule la partie dans l'intérêt exclusif de laquelle la condition est stipulée peut y renoncer seule (article 1304-4)."
            value={values.beneficiaire}
            options={LABEL_SETS.beneficiaire}
            onChange={setValue}
          />
          <SelectField id="acompteClause" label="Ce que dit le devis sur l'acompte" value={values.acompteClause} options={LABEL_SETS.acompteClause} onChange={setValue} />
        </div>
        <h2 className="mt-6 text-base font-semibold">Le suivi et vos engagements</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="engagements" label="Ce que vous avez engagé avant la réalisation" value={values.engagements} options={LABEL_SETS.engagements} onChange={setValue} />
          <SelectField id="suivi" label="Comment le dossier est suivi" value={values.suivi} options={LABEL_SETS.suivi} onChange={setValue} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="preuve" label="Ce que vous gardez dans le dossier" value={values.preuve} options={LABEL_SETS.preuve} onChange={setValue} />
          <SelectField id="situation" label="Où en êtes-vous" value={values.situation} options={LABEL_SETS.situation} onChange={setValue} />
        </div>
        <h2 className="mt-6 text-base font-semibold">Les montants</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField id="montantDevis" label="Montant du devis (€ HT)" value={values.montantDevis} onChange={setValue} numeric />
          <TextField id="acompte" label="Acompte encaissé (€)" hint="0 si rien n'a été versé." value={values.acompte} onChange={setValue} numeric />
          <TextField
            id="fraisEngages"
            label="Frais déjà engagés (€ HT)"
            hint="Matériel commandé, fabrication ou travaux lancés avant la réalisation."
            value={values.fraisEngages}
            onChange={setValue}
            numeric
          />
        </div>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le résultat</h2>
        <dl className="mt-4 space-y-3">
          <Metric label="Où en est la commande" value={view.etatLabel} />
          <Metric label="L'acompte" value={view.acompteLabel} />
          <Metric label="Frais engagés à votre risque" value={view.fraisLabel} />
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
              {view.controles.map((row: { point: string; statut: string; texte: string }) => (
                <tr key={row.point} className={rowClass(row.statut)}>
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
  if (statut === "ok") return "text-emerald-700";
  if (statut === "bad") return "text-rose-700";
  if (statut === "warn") return "text-amber-800";
  return "text-mk-muted";
}
