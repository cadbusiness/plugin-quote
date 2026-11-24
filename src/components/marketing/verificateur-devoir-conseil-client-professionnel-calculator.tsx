"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  LABEL_SETS,
  STATUT_LABELS,
  verifierConseil,
} from "@/lib/marketing/verificateur-devoir-conseil-client-professionnel";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL: Record<string, string> = { ...DEFAULTS };

const NOTE = "Code civil, articles 1104, 1112-1, 1137, 1170, 1190, 1231-1, 1231-3, 1353 et 1602 ; code de commerce, article L110-3. Arrêts relus : Cass. 1re civ., 28 octobre 2010, n° 09-16.913 ; Cass. com., 14 janvier 2014, n° 12-26.109 ; Cass. com., 22 mars 2017, n° 15-16.315 ; Cass. com., 11 mars 2020, n° 19-11.742 ; Cass. com., 21 janvier 2026, n° 24-13.471 ; Cass. com., 8 juillet 2026, n° 25-11.256 (publié au Bulletin). Textes lus le 24 novembre 2026. Lectures retenues : le devoir de conseil sur l'adaptation du matériel à l'usage n'existe envers un acheteur professionnel que si sa compétence ne lui permet pas d'apprécier les caractéristiques techniques ; quand il existe, c'est au fournisseur de prouver qu'il s'est renseigné et a informé ; la part discutable de la remise à niveau exclut ce que le client aurait payé de toute façon pour la bonne solution (arrêt du 11 mars 2020), c'est un plafond, pas une somme due. Non traités : ventes aux consommateurs, marchés publics, garanties légales (vices cachés, décennale), obligations propres aux machines et aux produits réglementés, droit étranger, procédure collective du client.";

export function VerificateurDevoirConseilClientProfessionnelCalculator() {
  const [values, setValues] = useState<Record<string, string>>(INITIAL);
  const view = useMemo(() => verifierConseil(values), [values]);

  function setValue(id: string, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">Le contrat et le client</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="relation" label="Ce que vous faites pour ce client" value={values.relation} options={LABEL_SETS.relation} onChange={setValue} />
          <SelectField
            id="competence"
            label="Ce que le client sait faire"
            hint="C'est la compétence réelle qui compte, pas le métier inscrit au registre (arrêt du 8 juillet 2026)."
            value={values.competence}
            options={LABEL_SETS.competence}
            onChange={setValue}
          />
        </div>
        <h2 className="mt-6 text-base font-semibold">Le besoin et le devis</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="besoin" label="Comment le client a exprimé son besoin" value={values.besoin} options={LABEL_SETS.besoin} onChange={setValue} />
          <SelectField id="usage" label="Le devis rappelle l'usage prévu (charges, cadence, environnement)" value={values.usage} options={LABEL_SETS.usage} onChange={setValue} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="visite" label="Visite ou relevé sur place" value={values.visite} options={LABEL_SETS.visite} onChange={setValue} />
          <SelectField id="limites" label="Limites d'emploi écrites dans le devis" value={values.limites} options={LABEL_SETS.limites} onChange={setValue} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="miseEnGarde" label="Le client impose un choix que vous déconseillez" value={values.miseEnGarde} options={LABEL_SETS.miseEnGarde} onChange={setValue} />
          <SelectField id="travaux" label="Préalables à la charge du client (alimentation, sol, accès, autorisation)" value={values.travaux} options={LABEL_SETS.travaux} onChange={setValue} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField id="clause" label="Clause du devis sur l'information du client" value={values.clause} options={LABEL_SETS.clause} onChange={setValue} />
          <SelectField id="preuve" label="Ce que vous gardez dans le dossier" value={values.preuve} options={LABEL_SETS.preuve} onChange={setValue} />
        </div>
        <h2 className="mt-6 text-base font-semibold">La situation et les montants</h2>
        <div className="mt-4">
          <SelectField id="incident" label="Où en êtes-vous" value={values.incident} options={LABEL_SETS.incident} onChange={setValue} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField id="montantDevis" label="Montant du devis (€ HT)" value={values.montantDevis} onChange={setValue} numeric />
          <TextField id="coutAdaptation" label="Coût de la remise à niveau (€ HT)" hint="0 si rien n'est demandé." value={values.coutAdaptation} onChange={setValue} numeric />
          <TextField
            id="surcoutInitial"
            label="Surcoût de la bonne solution au départ (€ HT)"
            hint="Ce que le client aurait payé en plus si elle avait été prévue dans le devis."
            value={values.surcoutInitial}
            onChange={setValue}
            numeric
          />
        </div>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le résultat</h2>
        <dl className="mt-4 space-y-3">
          <Metric label="Devoir de conseil envers ce client" value={view.devoirLabel} />
          <Metric label="Ce que vous devez prouver" value={view.preuveLabel} />
          <Metric label="Remise à niveau rapportée au devis" value={view.adaptLabel} />
          <Metric label="Part discutable de la remise à niveau (au plus)" value={view.ecartLabel} />
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
        <h2 className="text-base font-semibold">La mention à écrire dans vos devis</h2>
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
