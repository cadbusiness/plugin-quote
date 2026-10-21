"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  computeAnnulation,
  fmtEur,
  fmtJours,
  fmtPct,
  type AnnulationLigne,
  type AnnulationTone,
} from "@/lib/marketing/calculateur-frais-annulation-commande";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const HYPOTHESES =
  "Valeurs par défaut : hypothèses d'exemple, pas des barèmes de référence ni des usages d'une profession. Les arrhes suivent l'article 1590 du Code civil, la clause pénale l'article 1231-5. Le traitement de la TVA d'une indemnité d'annulation ou d'arrhes conservées se vérifie avec votre expert-comptable.";

export function CalculateurFraisAnnulationCommandeCalculator() {
  const [montantHT, setMontantHT] = useState(String(DEFAULTS.montantHT));
  const [dateDebut, setDateDebut] = useState<string>(DEFAULTS.dateDebut);
  const [regime, setRegime] = useState<string>(DEFAULTS.regime);
  const [verse, setVerse] = useState(String(DEFAULTS.verse));
  const [dateAnnulation, setDateAnnulation] = useState<string>(DEFAULTS.dateAnnulation);
  const [auteur, setAuteur] = useState<string>(DEFAULTS.auteur);
  const [s1, setS1] = useState(String(DEFAULTS.s1));
  const [p1, setP1] = useState(String(DEFAULTS.p1));
  const [s2, setS2] = useState(String(DEFAULTS.s2));
  const [p2, setP2] = useState(String(DEFAULTS.p2));
  const [s3, setS3] = useState(String(DEFAULTS.s3));
  const [p3, setP3] = useState(String(DEFAULTS.p3));
  const [p4, setP4] = useState(String(DEFAULTS.p4));
  const [fraisEngages, setFraisEngages] = useState(String(DEFAULTS.fraisEngages));
  const [marge, setMarge] = useState(String(DEFAULTS.marge));

  const result = useMemo(
    () =>
      computeAnnulation({
        montantHT,
        dateDebut,
        regime,
        verse,
        dateAnnulation,
        auteur,
        s1,
        s2,
        s3,
        p1,
        p2,
        p3,
        p4,
        fraisEngages,
        marge,
      }),
    [montantHT, dateDebut, regime, verse, dateAnnulation, auteur, s1, s2, s3, p1, p2, p3, p4, fraisEngages, marge],
  );

  const regimeTxt = result.regime === "acompte" ? "acompte" : result.regime === "arrhes" ? "arrhes" : "";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form
        id="form"
        className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="text-base font-semibold">La commande</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="montantHT"
            label="Montant de la commande (€ HT)"
            hint="Le montant total du devis signé ou du bon de commande, hors taxes. Saisissez tous les montants hors taxes."
            value={montantHT}
            min={0}
            step={100}
            onChange={setMontantHT}
          />
          <DateField
            id="dateDebut"
            label="Date de début de la prestation"
            hint="La date de référence de votre barème : le jour de l'événement, de la mise à disposition, de la livraison ou du démarrage."
            value={dateDebut}
            onChange={setDateDebut}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="regime"
            label="La somme versée à la commande est"
            hint="Ce que dit votre devis ou votre bon de commande, pas le mot employé à l'oral. Entre professionnels, c'est le contrat qui qualifie la somme."
            value={regime}
            onChange={setRegime}
            options={[
              { value: "acompte", label: "Un acompte (engagement ferme)" },
              { value: "arrhes", label: "Des arrhes (faculté de se dédire)" },
              { value: "aucun", label: "Rien n'a été versé" },
            ]}
          />
          <Field
            id="verse"
            label="Montant versé (€ HT)"
            hint="Ignoré si rien n'a été versé. Plafonné au montant de la commande."
            value={verse}
            min={0}
            step={100}
            onChange={setVerse}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">{"L'annulation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <DateField
            id="dateAnnulation"
            label="Date de l'annulation"
            hint="La date à laquelle vous avez reçu l'annulation écrite."
            value={dateAnnulation}
            onChange={setDateAnnulation}
          />
          <SelectField
            id="auteur"
            label="Qui annule ?"
            value={auteur}
            onChange={setAuteur}
            options={[
              { value: "client", label: "Le client" },
              { value: "prestataire", label: "Vous, le prestataire" },
            ]}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">{"Votre barème d'annulation"}</h2>
        <p className="mt-2 text-[12px] leading-5 text-mk-faint">
          Quatre paliers, du plus éloigné de la date de début au plus proche. Les seuils sont en jours calendaires avant
          la date de début.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="s1"
            label="Palier 1 : à partir de (jours avant)"
            value={s1}
            min={0}
            max={3650}
            step={1}
            onChange={setS1}
          />
          <Field
            id="p1"
            label="Palier 1 : indemnité (% de la commande)"
            value={p1}
            min={0}
            max={100}
            step={5}
            onChange={setP1}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="s2"
            label="Palier 2 : à partir de (jours avant)"
            value={s2}
            min={0}
            max={3650}
            step={1}
            onChange={setS2}
          />
          <Field id="p2" label="Palier 2 : indemnité (%)" value={p2} min={0} max={100} step={5} onChange={setP2} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="s3"
            label="Palier 3 : à partir de (jours avant)"
            value={s3}
            min={0}
            max={3650}
            step={1}
            onChange={setS3}
          />
          <Field id="p3" label="Palier 3 : indemnité (%)" value={p3} min={0} max={100} step={5} onChange={setP3} />
        </div>
        <div className="mt-4">
          <Field
            id="p4"
            label="Palier 4 : en dessous du palier 3, indemnité (%)"
            value={p4}
            min={0}
            max={100}
            step={5}
            onChange={setP4}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">{"Ce que l'annulation vous coûte"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="fraisEngages"
            label="Frais déjà engagés et non récupérables (€ HT)"
            hint="Ce que vous avez déjà dépensé pour cette commande et que vous ne récupérerez pas : achats, sous-traitance réservée, temps de préparation."
            value={fraisEngages}
            min={0}
            step={50}
            onChange={setFraisEngages}
          />
          <Field
            id="marge"
            label="Marge brute sur la commande (%)"
            hint="Ce que la commande vous aurait laissé une fois tous ses coûts payés, en % du montant HT."
            value={marge}
            min={0}
            max={100}
            step={1}
            onChange={setMarge}
          />
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">{HYPOTHESES}</p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le délai et le palier</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="joursAvant" label="Annulation, en jours avant le début" value={fmtJours(result.joursAvant)} />
          <Metric
            id="palier"
            label="Palier du barème"
            value={result.palier ? `${result.palier} (${result.palierLabel}), ${fmtPct(result.pct)}` : "n/a"}
          />
          <Metric id="indemnite" label="Indemnité selon le barème" value={fmtEur(result.indemnite)} />
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Ce que vous pouvez garder ou réclamer</h2>
        <dl className="mt-4 space-y-3">
          <Metric
            id="verseOut"
            label="Versé à la commande"
            value={result.regime === "aucun" ? "Rien" : `${fmtEur(result.verse)} (${regimeTxt})`}
          />
          <Metric id="solde" label={result.soldeLabel} value={fmtEur(result.solde)} />
          <Metric id="perte" label="Perte estimée (frais engagés et marge perdue)" value={fmtEur(result.perte)} />
          <Metric id="couverture" label="Part de la perte couverte" value={fmtPct(result.couverture)} />
        </dl>
        <p id="verdict" className={`mt-4 rounded-xl px-4 py-3 text-sm ${alertClass(result.etat)}`}>
          {result.verdict}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Le barème appliqué à cette commande</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">Palier</th>
                <th className="py-2 pr-2 font-semibold">Annulation</th>
                <th className="py-2 pr-2 font-semibold">Indemnité</th>
                <th className="py-2 pr-2 font-semibold">Montant</th>
                <th className="py-2 font-semibold">Après le versement</th>
              </tr>
            </thead>
            <tbody id="detail">
              {result.lignes.map((ligne) => (
                <LigneRow key={ligne.rang} ligne={ligne} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          {
            "La ligne surlignée est le palier de votre annulation. « Après le versement » : indemnité moins l'acompte ; un montant négatif est à rembourser au client. Avec des arrhes, le barème ne s'applique pas, sauf clause de votre contrat."
          }
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

function LigneRow({ ligne }: { ligne: AnnulationLigne }) {
  return (
    <tr className={ligne.courant ? "bg-orange-50 font-semibold" : "border-t border-mk-border"}>
      <td className="py-2 pr-2">{ligne.rang}</td>
      <td className="py-2 pr-2">{ligne.label}</td>
      <td className="py-2 pr-2">{fmtPct(ligne.pct)}</td>
      <td className="py-2 pr-2">{fmtEur(ligne.indemnite)}</td>
      <td className="py-2">{ligne.apres == null ? "arrhes : n/a" : fmtEur(ligne.apres)}</td>
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

function alertClass(tone: AnnulationTone) {
  if (tone === "ok") return "bg-emerald-50 font-semibold text-emerald-800";
  if (tone === "warn") return "bg-amber-50 font-semibold text-amber-900";
  if (tone === "bad") return "bg-rose-50 font-semibold text-rose-800";
  return "bg-mk-band font-medium text-mk-ink";
}
