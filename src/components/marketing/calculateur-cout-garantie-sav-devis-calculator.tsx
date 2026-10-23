"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEFAULTS,
  computeGarantie,
  fmtEur,
  fmtMois,
  fmtNum,
  fmtPct,
  type GarantieLigne,
  type GarantieTone,
} from "@/lib/marketing/calculateur-cout-garantie-sav-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const HYPOTHESES =
  "Valeurs par défaut : hypothèses d'exemple, pas des taux de référence ni des usages d'une profession. Le calcul est une moyenne sur un ensemble de ventes : sur un dossier donné, il y aura zéro intervention, ou plusieurs.";

export function CalculateurCoutGarantieSavDevisCalculator() {
  const [prix, setPrix] = useState(String(DEFAULTS.prix));
  const [marge, setMarge] = useState(String(DEFAULTS.marge));
  const [duree, setDuree] = useState(String(DEFAULTS.duree));
  const [taux, setTaux] = useState(String(DEFAULTS.taux));
  const [parDossier, setParDossier] = useState(String(DEFAULTS.parDossier));
  const [heures, setHeures] = useState(String(DEFAULTS.heures));
  const [tauxHoraire, setTauxHoraire] = useState(String(DEFAULTS.tauxHoraire));
  const [deplacement, setDeplacement] = useState(String(DEFAULTS.deplacement));
  const [pieces, setPieces] = useState(String(DEFAULTS.pieces));
  const [couvrePieces, setCouvrePieces] = useState<boolean>(DEFAULTS.couvrePieces);
  const [couvreMO, setCouvreMO] = useState<boolean>(DEFAULTS.couvreMO);
  const [couvreDeplacement, setCouvreDeplacement] = useState<boolean>(DEFAULTS.couvreDeplacement);

  const result = useMemo(
    () =>
      computeGarantie({
        prix,
        marge,
        duree,
        taux,
        parDossier,
        heures,
        tauxHoraire,
        deplacement,
        pieces,
        couvrePieces,
        couvreMO,
        couvreDeplacement,
      }),
    [
      prix,
      marge,
      duree,
      taux,
      parDossier,
      heures,
      tauxHoraire,
      deplacement,
      pieces,
      couvrePieces,
      couvreMO,
      couvreDeplacement,
    ],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form
        id="form"
        className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="text-base font-semibold">La vente</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="prix"
            label="Prix de vente HT (€)"
            hint="Le prix de l'équipement ou du lot vendu, hors extension de garantie."
            value={prix}
            min={0}
            step={100}
            onChange={setPrix}
          />
          <Field
            id="marge"
            label="Marge brute (%)"
            hint="Ce qui reste du prix une fois le coût d'achat ou de production payé."
            value={marge}
            min={0}
            max={95}
            step={1}
            onChange={setMarge}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">La garantie</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="duree"
            label="Durée de garantie (mois)"
            hint="À compter de la livraison ou de la mise en service, selon votre devis."
            value={duree}
            min={0}
            max={120}
            step={1}
            onChange={setDuree}
          />
          <Field
            id="taux"
            label="Taux d'intervention (% des ventes par an)"
            hint="Sur 100 équipements vendus, combien demandent une intervention dans l'année. Prenez votre historique."
            value={taux}
            min={0}
            max={100}
            step={0.5}
            onChange={setTaux}
          />
        </div>
        <div className="mt-4">
          <Field
            id="parDossier"
            label="Interventions par dossier concerné"
            hint="Une panne demande parfois un diagnostic puis un retour avec la pièce."
            value={parDossier}
            min={0}
            max={20}
            step={0.1}
            onChange={setParDossier}
          />
        </div>
        <div className="mt-4 space-y-2">
          <Check id="couvrePieces" label="Pièces couvertes" checked={couvrePieces} onChange={setCouvrePieces} />
          <Check id="couvreMO" label="Main-d'œuvre couverte" checked={couvreMO} onChange={setCouvreMO} />
          <Check
            id="couvreDeplacement"
            label="Déplacement couvert"
            checked={couvreDeplacement}
            onChange={setCouvreDeplacement}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Une intervention</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="heures"
            label="Heures par intervention"
            hint="Diagnostic, réparation, compte rendu."
            value={heures}
            min={0}
            max={100}
            step={0.5}
            onChange={setHeures}
          />
          <Field
            id="tauxHoraire"
            label="Coût horaire (€)"
            hint="Ce que vous coûte une heure de technicien, pas son prix de vente."
            value={tauxHoraire}
            min={0}
            max={1000}
            step={1}
            onChange={setTauxHoraire}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="deplacement"
            label="Déplacement (€)"
            hint="Trajet et frais par intervention."
            value={deplacement}
            min={0}
            max={10000}
            step={5}
            onChange={setDeplacement}
          />
          <Field
            id="pieces"
            label="Pièces (€)"
            hint="Coût moyen des pièces remplacées par intervention."
            value={pieces}
            min={0}
            max={1000000}
            step={10}
            onChange={setPieces}
          />
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">{HYPOTHESES}</p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Le coût de la garantie</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="coutIntervention" label="Coût couvert par intervention" value={fmtEur(result.coutIntervention)} />
          <Metric id="attendues" label="Interventions attendues par vente" value={fmtNum(result.attendues)} />
          <Metric id="provision" label="Provision par vente" value={fmtEur(result.provision)} />
          <Metric id="partPrix" label="Part du prix de vente" value={fmtPct(result.partPrix)} />
          <Metric id="partMarge" label="Part de la marge brute" value={fmtPct(result.partMarge)} />
        </dl>
        <p id="verdict" className={`mt-4 rounded-xl px-4 py-3 text-sm ${alertClass(result.etat)}`}>
          {result.verdict}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Selon la durée</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">Durée</th>
                <th className="py-2 pr-2 font-semibold">Provision</th>
                <th className="py-2 pr-2 font-semibold">Part du prix</th>
                <th className="py-2 font-semibold">Part de la marge</th>
              </tr>
            </thead>
            <tbody id="detail">
              {result.lignes.map((ligne) => (
                <LigneRow key={ligne.mois} ligne={ligne} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          {"La ligne surlignée est votre durée. Même taux, même coût d'intervention : seule la durée change."}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Une année de plus</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="coutAnnee" label="Coût d'une année de garantie supplémentaire" value={fmtEur(result.coutAnnee)} />
          <Metric
            id="prixAnnee"
            label="Prix pour garder votre marge sur cette année"
            value={fmtEur(result.prixAnnee)}
          />
        </dl>
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
        <h2 className="text-base font-semibold">Ligne de garantie pour le devis</h2>
        <pre
          id="ligne"
          className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] px-3 py-3 text-sm leading-6 text-mk-ink ring-1 ring-mk-border"
        >
          {result.ligne}
        </pre>
        <div className="mt-3">
          <CopyButton text={result.ligne} label="Copier" />
        </div>
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

function LigneRow({ ligne }: { ligne: GarantieLigne }) {
  const rowClass = ligne.courant ? "bg-orange-50 font-semibold" : "border-t border-mk-border";
  return (
    <tr className={rowClass}>
      <td className="py-2 pr-2">{fmtMois(ligne.mois)}</td>
      <td className="py-2 pr-2">{fmtEur(ligne.provision)}</td>
      <td className="py-2 pr-2">{fmtPct(ligne.partPrix)}</td>
      <td className="py-2">{fmtPct(ligne.partMarge)}</td>
    </tr>
  );
}

function Check({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#E85D04]"
      />
      {label}
    </label>
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

function alertClass(tone: GarantieTone) {
  if (tone === "ok") return "bg-emerald-50 font-semibold text-emerald-800";
  if (tone === "warn") return "bg-amber-50 font-semibold text-amber-900";
  if (tone === "bad") return "bg-rose-50 font-semibold text-rose-800";
  return "bg-mk-band font-medium text-mk-ink";
}
