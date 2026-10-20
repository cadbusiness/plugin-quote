"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  computeRetenue,
  fmtDate,
  fmtEur,
  fmtMois,
  fmtNum,
  fmtPct,
  type RetenueLigne,
  type RetenueTone,
} from "@/lib/marketing/calculateur-retenue-garantie";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const HYPOTHESES =
  "Valeurs par défaut : hypothèses d'exemple, pas des moyennes de marché ni des taux bancaires réels. Le plafond de 5 % et le délai d'un an du marché privé viennent de la loi n° 71-584 du 16 juillet 1971 ; le plafond de 3 % et le remboursement sous 30 jours du marché public, des articles R2191-33 et R2191-35 du Code de la commande publique.";

export function CalculateurRetenueGarantieCalculator() {
  const [montantHT, setMontantHT] = useState(String(DEFAULTS.montantHT));
  const [tva, setTva] = useState(String(DEFAULTS.tva));
  const [cadre, setCadre] = useState<string>(DEFAULTS.cadre);
  const [base, setBase] = useState<string>(DEFAULTS.base);
  const [taux, setTaux] = useState(String(DEFAULTS.taux));
  const [nbVersements, setNbVersements] = useState(String(DEFAULTS.nbVersements));
  const [dureeMois, setDureeMois] = useState(String(DEFAULTS.dureeMois));
  const [dateReception, setDateReception] = useState<string>(DEFAULTS.dateReception);
  const [delaiGarantie, setDelaiGarantie] = useState(String(DEFAULTS.delaiGarantie));
  const [tauxTreso, setTauxTreso] = useState(String(DEFAULTS.tauxTreso));
  const [commission, setCommission] = useState(String(DEFAULTS.commission));
  const [fraisCaution, setFraisCaution] = useState(String(DEFAULTS.fraisCaution));

  const result = useMemo(
    () =>
      computeRetenue({
        montantHT,
        tva,
        cadre,
        base,
        taux,
        nbVersements,
        dureeMois,
        dateReception,
        delaiGarantie,
        tauxTreso,
        commission,
        fraisCaution,
      }),
    [
      montantHT,
      tva,
      cadre,
      base,
      taux,
      nbVersements,
      dureeMois,
      dateReception,
      delaiGarantie,
      tauxTreso,
      commission,
      fraisCaution,
    ],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form
        id="form"
        className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="text-base font-semibold">Le marché</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="montantHT"
            label="Montant du marché (€ HT)"
            hint="Le montant des travaux, hors taxes, tel qu'il figure au devis ou au marché."
            value={montantHT}
            min={0}
            step={1000}
            onChange={setMontantHT}
          />
          <Field
            id="tva"
            label="Taux de TVA (%)"
            hint="Mettez 0 si vous ne facturez pas de TVA sur ce marché."
            value={tva}
            min={0}
            max={100}
            step={0.1}
            onChange={setTva}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            id="cadre"
            label="Type de marché"
            hint="Plafond de 5 % sur un marché privé et sur un marché public. 3 % pour une PME face à l'État, à certains établissements publics de l'État et aux grandes collectivités (article R2191-33 du Code de la commande publique)."
            value={cadre}
            onChange={setCadre}
            options={[
              { value: "prive", label: "Marché de travaux privé (loi du 16 juillet 1971)" },
              { value: "public", label: "Marché public" },
              { value: "public_pme", label: "Marché public, PME, acheteur soumis au plafond de 3 %" },
            ]}
          />
          <SelectField
            id="base"
            label="La retenue se calcule sur"
            hint="La loi parle de 5 % du montant des acomptes, sans dire HT ou TTC : suivez ce qu'écrit votre contrat."
            value={base}
            onChange={setBase}
            options={[
              { value: "ttc", label: "Le montant TTC" },
              { value: "ht", label: "Le montant HT" },
            ]}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">La retenue et les versements</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="taux"
            label="Taux de la retenue (%)"
            hint="La retenue n'existe que si le contrat la prévoit. Le taux est un plafond : le contrat peut prévoir moins."
            value={taux}
            min={0}
            max={100}
            step={0.5}
            onChange={setTaux}
          />
          <Field
            id="nbVersements"
            label="Nombre de versements (acomptes et solde)"
            hint="La retenue est prise sur chaque versement. L'outil les suppose égaux et réguliers, le dernier à la réception."
            value={nbVersements}
            min={1}
            max={60}
            step={1}
            onChange={setNbVersements}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="dureeMois"
            label="Durée du chantier jusqu'à la réception (mois)"
            value={dureeMois}
            min={0}
            max={120}
            step={1}
            onChange={setDureeMois}
          />
          <DateField
            id="dateReception"
            label="Date de réception prévue"
            hint="La date du procès-verbal de réception, avec ou sans réserves."
            value={dateReception}
            onChange={setDateReception}
          />
        </div>
        <div className="mt-4">
          <Field
            id="delaiGarantie"
            label="Délai de garantie d'un marché public (mois)"
            hint="Utilisé seulement pour un marché public : c'est le marché qui le fixe (un an de garantie de parfait achèvement dans le CCAG Travaux). Sur un marché privé, la loi fixe un an après la réception."
            value={delaiGarantie}
            min={0}
            max={120}
            step={1}
            onChange={setDelaiGarantie}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">{"Ce que coûte l'argent retenu"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="tauxTreso"
            label="Coût de votre trésorerie (% par an)"
            hint="Le taux de votre découvert ou de votre financement court terme : ce que vous coûte l'argent que vous n'avez pas encore reçu."
            value={tauxTreso}
            min={0}
            max={100}
            step={0.1}
            onChange={setTauxTreso}
          />
          <Field
            id="commission"
            label="Commission de la caution bancaire (% par an)"
            hint="Demandez le taux à votre banque ou à votre société de caution mutuelle. La caution court du premier versement à la libération."
            value={commission}
            min={0}
            max={100}
            step={0.1}
            onChange={setCommission}
          />
        </div>
        <div className="mt-4">
          <Field
            id="fraisCaution"
            label="Frais fixes de mise en place de la caution (€)"
            value={fraisCaution}
            min={0}
            step={10}
            onChange={setFraisCaution}
          />
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">{HYPOTHESES}</p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">La retenue</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="retenue" label="Retenue de garantie totale" value={fmtEur(result.retenue)} />
          <Metric id="parVersement" label="Retenue sur chaque versement" value={fmtEur(result.parVersement)} />
          <Metric id="netTotal" label="Encaissé avant libération" value={fmtEur(result.netTotal)} />
          <Metric id="pctHT" label="Poids de la retenue dans le montant HT" value={fmtPct(result.pctHT)} />
        </dl>
        <p id="verdict" className={`mt-4 rounded-xl px-4 py-3 text-sm ${alertClass(result.etat)}`}>
          {result.verdict}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">La libération</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="finGarantie" label="Fin du délai de garantie" value={fmtDate(result.finGarantie)} />
          <Metric
            id="liberation"
            label={
              result.cadre === "prive" ? "Libération (un an après la réception)" : "Remboursement au plus tard"
            }
            value={fmtDate(result.liberation)}
          />
          <Metric
            id="immoMoyenne"
            label="Durée moyenne d'immobilisation de l'argent retenu"
            value={fmtMois(result.immoMoyenne)}
          />
        </dl>
        <p id="liberationMsg" className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-sm text-mk-ink">
          {result.liberationMsg}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Retenue ou caution bancaire</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="coutTreso" label="Coût de la trésorerie immobilisée" value={fmtEur(result.coutTreso)} />
          <Metric id="coutCaution" label="Coût d'une caution du même montant" value={fmtEur(result.coutCaution)} />
          <Metric id="ecart" label="Écart en faveur de la caution" value={fmtEur(result.ecart)} />
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Calendrier des versements</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">Versement</th>
                <th className="py-2 pr-2 font-semibold">Mois</th>
                <th className="py-2 pr-2 font-semibold">Montant</th>
                <th className="py-2 pr-2 font-semibold">Retenue</th>
                <th className="py-2 pr-2 font-semibold">Encaissé</th>
                <th className="py-2 pr-2 font-semibold">Immobilisé</th>
                <th className="py-2 font-semibold">Coût</th>
              </tr>
            </thead>
            <tbody id="detail">
              {result.lignes.map((ligne) => (
                <LigneRow key={ligne.rang} ligne={ligne} />
              ))}
              <tr className="border-t border-mk-border font-semibold">
                <td className="py-2 pr-2">Total</td>
                <td className="py-2 pr-2" />
                <td className="py-2 pr-2">{fmtEur(result.baseMontant)}</td>
                <td className="py-2 pr-2">{fmtEur(result.retenue)}</td>
                <td className="py-2 pr-2">{fmtEur(result.netTotal)}</td>
                <td className="py-2 pr-2">{fmtMois(result.immoMoyenne)} en moyenne</td>
                <td className="py-2">{fmtEur(result.coutTreso)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          {
            "Mois comptés depuis le début du chantier. L'argent retenu sur un versement reste immobilisé jusqu'à la libération. Coût = retenue du versement × taux de trésorerie × mois immobilisés ÷ 12. Sur un marché public, les 30 jours de remboursement après la fin du délai de garantie comptent pour un mois."
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

function LigneRow({ ligne }: { ligne: RetenueLigne }) {
  return (
    <tr className="border-t border-mk-border">
      <td className="py-2 pr-2">{ligne.rang}</td>
      <td className="py-2 pr-2">{fmtNum(ligne.mois)}</td>
      <td className="py-2 pr-2">{fmtEur(ligne.montant)}</td>
      <td className="py-2 pr-2">{fmtEur(ligne.retenue)}</td>
      <td className="py-2 pr-2">{fmtEur(ligne.encaisse)}</td>
      <td className="py-2 pr-2">{fmtMois(ligne.immo)}</td>
      <td className="py-2">{fmtEur(ligne.cout)}</td>
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

function alertClass(tone: RetenueTone) {
  if (tone === "ok") return "bg-emerald-50 font-semibold text-emerald-800";
  if (tone === "warn") return "bg-amber-50 font-semibold text-amber-900";
  if (tone === "bad") return "bg-rose-50 font-semibold text-rose-800";
  return "bg-mk-band font-medium text-mk-ink";
}
