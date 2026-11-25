"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  LABEL_SETS,
  STATUT_LABELS,
  computeCession,
} from "@/lib/marketing/verificateur-cession-contrat-changement-client";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL: Record<string, string> = { ...DEFAULTS };

const NOTE =
  "Code civil, articles 1216 à 1216-3, 1844-5 ; code de commerce, articles L236-3 et L642-7, lus le 25 novembre 2026, avec Cass. com., 24 avril 2024, n° 22-15.958 (publié au Bulletin) et Cass. com., 9 juin 2022, n° 20-18.490 (publié au Bulletin). Lectures retenues : la libération du cédant ne vaut que pour l'avenir, donc le travail exécuté avant la date d'effet reste dû par le cédant ; l'acompte s'impute d'abord sur ce travail, sauf si vous choisissez qu'il suive le contrat. Cas non traités : contrats régis par un régime propre (bail commercial, travail, assurance), sous-traitance, cession de créance, fiscalité et TVA.";

export function VerificateurCessionContratChangementClientCalculator() {
  const [values, setValues] = useState<Record<string, string>>(INITIAL);
  const view = useMemo(() => computeCession(values), [values]);

  function setValue(id: string, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"L'opération"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="operation" label="Ce qui s'est passé" value={values.operation} options={LABEL_SETS.operation} onChange={setValue} />
          <SelectField id="sens" label="Qui change" value={values.sens} options={LABEL_SETS.sens} onChange={setValue} />
        </div>
        <h2 className="mt-6 text-base font-semibold">Ce que vous avez fait</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="accord" label="Votre accord" value={values.accord} options={LABEL_SETS.accord} onChange={setValue} />
          <SelectField id="liberation" label="Libération du cédant" value={values.liberation} options={LABEL_SETS.liberation} onChange={setValue} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="acte" label="Acte entre cédant et cessionnaire" value={values.acte} options={LABEL_SETS.acte} onChange={setValue} />
          <SelectField id="notification" label="Notification ou paiement du nouveau client" value={values.notification} options={LABEL_SETS.notification} onChange={setValue} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="nouveau" label="Vérifications sur le nouveau client" value={values.nouveau} options={LABEL_SETS.nouveau} onChange={setValue} />
          <SelectField id="suretes" label="Garanties et cautions" value={values.suretes} options={LABEL_SETS.suretes} onChange={setValue} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="avenant" label="Avenant à trois parties" value={values.avenant} options={LABEL_SETS.avenant} onChange={setValue} />
          <SelectField id="clause" label="Clause de votre devis sur la cession" value={values.clause} options={LABEL_SETS.clause} onChange={setValue} />
        </div>
        <h2 className="mt-6 text-base font-semibold">La commande</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField id="prix" label="Prix de la commande (€ HT)" value={values.prix} onChange={setValue} numeric />
          <TextField id="acompte" label="Acompte déjà reçu (€ HT)" value={values.acompte} onChange={setValue} numeric />
          <TextField
            id="avancement"
            label="Avancement à la date d'effet (%)"
            hint="Part du travail exécutée avant la cession."
            value={values.avancement}
            onChange={setValue}
            numeric
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="imputation" label="Imputation de l'acompte" value={values.imputation} options={LABEL_SETS.imputation} onChange={setValue} />
          <TextField id="delai" label="Délai d'information avant la cession, pour votre clause (jours)" value={values.delai} onChange={setValue} numeric />
        </div>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le résultat</h2>
        <dl className="mt-4 space-y-3">
          <Metric label="Travail exécuté" value={view.executeLabel} />
          <Metric label="Reste à exécuter" value={view.resteLabel} />
          <Metric label="Solde total" value={view.soldeLabel} />
          <Metric label="À payer par le cédant" value={view.cedantLabel} />
          <Metric label="À payer par le cessionnaire" value={view.cessionnaireLabel} />
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
  if (statut === "ok") return "text-emerald-700";
  if (statut === "bad") return "text-rose-700";
  if (statut === "warn") return "text-amber-800";
  return "text-mk-muted";
}
