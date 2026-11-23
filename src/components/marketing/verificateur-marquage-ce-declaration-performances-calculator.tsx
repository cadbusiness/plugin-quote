"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  LABEL_SETS,
  STATUT_LABELS,
  verifierMarquage,
} from "@/lib/marketing/verificateur-marquage-ce-declaration-performances";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL: Record<string, string> = { ...DEFAULTS };

export function VerificateurMarquageCeDeclarationPerformancesCalculator() {
  const [values, setValues] = useState<Record<string, string>>(INITIAL);
  const view = useMemo(() => verifierMarquage(values), [values]);

  function setValue(id: string, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">Votre rôle et le produit</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="role"
            label="Votre rôle pour ce produit"
            hint="Vendre sous son nom ou modifier le produit fait de vous le fabricant (article 15)."
            value={values.role}
            options={LABEL_SETS.role}
            onChange={setValue}
          />
          <SelectField
            id="produit"
            label="Type de produit"
            hint="Les normes citées servent d'exemple : vérifiez celle de votre produit."
            value={values.produit}
            options={LABEL_SETS.produit}
            onChange={setValue}
          />
          <SelectField
            id="couverture"
            label="Le produit est couvert par"
            value={values.couverture}
            options={LABEL_SETS.couverture}
            onChange={setValue}
          />
          <SelectField
            id="regime"
            label="Texte applicable à cette famille de produits"
            hint="Les deux règlements coexistent jusqu'en 2040, famille par famille."
            value={values.regime}
            options={LABEL_SETS.regime}
            onChange={setValue}
          />
        </div>
        <h2 className="mt-6 text-base font-semibold">La fabrication et la pose</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="procede"
            label="Comment le produit est fabriqué"
            hint="Des fenêtres faites sur mesure tous les jours restent une fabrication en série."
            value={values.procede}
            options={LABEL_SETS.procede}
            onChange={setValue}
          />
          <SelectField
            id="pose"
            label="Vous posez vous-même le produit dans un ouvrage identifié"
            value={values.pose}
            options={LABEL_SETS.pose}
            onChange={setValue}
          />
          <SelectField
            id="systeme"
            label="Système d'évaluation de la norme (annexe ZA)"
            hint="Par exemple, NF EN 1090-1 : système 2+ ; fenêtres NF EN 14351-1 : système 3 en général, 1 pour les portes d'issue de secours."
            value={values.systeme}
            options={LABEL_SETS.systeme}
            onChange={setValue}
          />
          <SelectField
            id="organisme"
            label="Un organisme notifié est intervenu"
            value={values.organisme}
            options={LABEL_SETS.organisme}
            onChange={setValue}
          />
          <SelectField
            id="micro"
            label="Microentreprise (moins de 10 personnes, chiffre d'affaires ou bilan jusqu'à 2 M€)"
            value={values.micro}
            options={LABEL_SETS.micro}
            onChange={setValue}
          />
          <DateField
            id="dateMiseMarche"
            label="Date de livraison du produit"
            hint="Sert à la durée de conservation."
            value={values.dateMiseMarche}
            onChange={setValue}
          />
        </div>
        <h2 className="mt-6 text-base font-semibold">Les documents et le devis</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="dop"
            label="Une déclaration des performances existe pour ce produit"
            hint="La vôtre, ou celle du fabricant si vous revendez ou posez."
            value={values.dop}
            options={LABEL_SETS.dop}
            onChange={setValue}
          />
          <SelectField
            id="ce"
            label="Le produit porte le marquage CE"
            value={values.ce}
            options={LABEL_SETS.ce}
            onChange={setValue}
          />
          <SelectField
            id="remise"
            label="La déclaration est remise au client"
            value={values.remise}
            options={LABEL_SETS.remise}
            onChange={setValue}
          />
          <SelectField
            id="langue"
            label="Langue de la déclaration"
            value={values.langue}
            options={LABEL_SETS.langue}
            onChange={setValue}
          />
        </div>
        <div className="mt-4">
          <SelectField
            id="perfDevis"
            label="Performances écrites sur le devis (thermique, acoustique, charge, résistance au vent...)"
            value={values.perfDevis}
            options={LABEL_SETS.perfDevis}
            onChange={setValue}
          />
        </div>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le résultat</h2>
        <dl className="mt-4 space-y-3">
          <Metric label="Déclaration des performances" value={view.dopLabel} />
          <Metric label="Marquage CE" value={view.ceLabel} />
          <Metric label="Organisme notifié" value={view.organismeLabel} />
          <Metric label="Conservation des documents jusqu'au" value={view.conservationLabel} />
          <Metric label="Points bloquants / à revoir" value={`${view.nbBad} / ${view.nbWarn}`} />
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.etat)}>{view.verdict}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le contrôle point par point</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">Point</th>
                <th className="py-2 pr-2 font-semibold">Statut</th>
                <th className="py-2 pr-2 font-semibold">Ce que cela veut dire</th>
              </tr>
            </thead>
            <tbody>
              {view.controles.map((row) => (
                <tr key={row.point} className={rowClass(row.statut)}>
                  <td className="border-t border-mk-border py-2 pr-2 align-top">{row.point}</td>
                  <td className={"border-t border-mk-border py-2 pr-2 align-top font-medium " + statusClass(row.statut)}>{STATUT_LABELS[row.statut]}</td>
                  <td className="border-t border-mk-border py-2 pr-2 align-top">{row.texte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Règlement (UE) n° 305/2011, articles 4 à 9, 11, 13 à 15, 37 et 38 ; règlement délégué (UE) n° 157/2014 (déclaration sur un site internet) ; règlement (UE) 2024/3110, article 95 ; guide pratique d'application du règlement 2024/3110 du ministère chargé de la construction (juillet 2026). Textes lus le 23 novembre 2026. Lectures retenues : la dérogation de l'article 5 suppose toutes ses conditions réunies et vaut seulement pour un produit couvert par une norme harmonisée ; un poseur qui ne modifie pas le produit est traité ici comme un distributeur, par prudence ; la durée de dix ans court de la date de livraison indiquée. Non traités : sanctions, règles nationales d'usage (DTU, réglementation thermique, incendie), marchés publics, passeport numérique du règlement 2024/3110, produits usagés, droit hors Union européenne."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">La mention à écrire dans le devis</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view.clause}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view.clause} />
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Ce qu'il faut faire"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {view.actions.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le courrier qui accompagne la déclaration</h2>
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
  options: { [key: string]: string };
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
      <dd className="text-lg font-semibold text-mk-accent">{value}</dd>
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
