"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  ROI_SALON_DEFAULTS,
  computeRoiSalon,
  fmtEur,
  fmtNum,
  type RoiSalonScenario,
  type RoiSalonTone,
} from "@/lib/marketing/calculateur-roi-salon-professionnel-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const NBSP_PCT = "\u00a0%";

export function CalculateurRoiSalonProfessionnelDevisCalculator() {
  const [stand, setStand] = useState(String(ROI_SALON_DEFAULTS.stand));
  const [deplacements, setDeplacements] = useState(String(ROI_SALON_DEFAULTS.deplacements));
  const [supports, setSupports] = useState(String(ROI_SALON_DEFAULTS.supports));
  const [coutJour, setCoutJour] = useState(String(ROI_SALON_DEFAULTS.coutJour));
  const [personnes, setPersonnes] = useState(String(ROI_SALON_DEFAULTS.personnes));
  const [jours, setJours] = useState(String(ROI_SALON_DEFAULTS.jours));
  const [contacts, setContacts] = useState(String(ROI_SALON_DEFAULTS.contacts));
  const [partAvant, setPartAvant] = useState(String(ROI_SALON_DEFAULTS.partAvant));
  const [partApres, setPartApres] = useState(String(ROI_SALON_DEFAULTS.partApres));
  const [tauxSignature, setTauxSignature] = useState(String(ROI_SALON_DEFAULTS.tauxSignature));
  const [panier, setPanier] = useState(String(ROI_SALON_DEFAULTS.panier));
  const [marge, setMarge] = useState(String(ROI_SALON_DEFAULTS.marge));

  const result = useMemo(
    () =>
      computeRoiSalon({
        stand,
        deplacements,
        supports,
        coutJour,
        personnes,
        jours,
        contacts,
        partAvant,
        partApres,
        tauxSignature,
        panier,
        marge,
      }),
    [
      stand,
      deplacements,
      supports,
      coutJour,
      personnes,
      jours,
      contacts,
      partAvant,
      partApres,
      tauxSignature,
      panier,
      marge,
    ],
  );

  const ecart =
    (result.ecartDemandes >= 0 ? "+" : "") +
    fmtNum(result.ecartDemandes) +
    " demandes, " +
    (result.ecartClients >= 0 ? "+" : "") +
    fmtNum(result.ecartClients) +
    " clients, " +
    (result.ecartMarge >= 0 ? "+" : "") +
    fmtEur(result.ecartMarge) +
    " de marge";

  const seuil =
    result.clientsEquilibre === null
      ? "n/a"
      : fmtNum(result.clientsEquilibre) +
        " clients" +
        (result.partEquilibre === null ? "" : " (" + fmtNum(result.partEquilibre) + NBSP_PCT + " des contacts)");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">Coûts du salon</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="stand"
            label="Stand : surface, aménagement, mobilier (€ HT)"
            value={stand}
            min={0}
            step={100}
            onChange={setStand}
          />
          <Field
            id="deplacements"
            label="Transport, hébergement, repas (€)"
            value={deplacements}
            min={0}
            step={100}
            onChange={setDeplacements}
          />
          <Field
            id="supports"
            label="Supports : imprimés, kakémono, échantillons (€)"
            value={supports}
            min={0}
            step={50}
            onChange={setSupports}
          />
          <Field
            id="coutJour"
            label="Coût chargé d'une journée par personne (€)"
            value={coutJour}
            min={0}
            step={10}
            onChange={setCoutJour}
          />
          <Field id="personnes" label="Personnes sur le stand" value={personnes} min={0} max={50} step={1} onChange={setPersonnes} />
          <Field
            id="jours"
            label="Jours de salon, montage compris"
            hint="Le temps de l'équipe est souvent la plus grosse ligne. Ne l'oubliez pas."
            value={jours}
            min={0}
            max={15}
            step={1}
            onChange={setJours}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Contacts et demandes</h2>
        <div className="mt-4">
          <Field
            id="contacts"
            label="Contacts recueillis (badges, cartes, emails)"
            value={contacts}
            min={0}
            step={1}
            onChange={setContacts}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="partAvant"
            label="Part des contacts qui deviennent une demande de devis aujourd'hui (%)"
            hint="Cartes de visite, notes, rappel la semaine suivante."
            value={partAvant}
            min={0}
            max={100}
            step={1}
            onChange={setPartAvant}
          />
          <Field
            id="partApres"
            label="Part visée avec une demande prise sur le stand (%)"
            hint="QR code vers un funnel, tablette, email le soir même."
            value={partApres}
            min={0}
            max={100}
            step={1}
            onChange={setPartApres}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Ce que rapporte une demande</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="tauxSignature"
            label="Part des demandes qui finissent signées (%)"
            value={tauxSignature}
            min={0}
            max={100}
            step={1}
            onChange={setTauxSignature}
          />
          <Field
            id="panier"
            label="Montant moyen d'une commande (€ HT)"
            value={panier}
            min={0}
            step={100}
            onChange={setPanier}
          />
        </div>
        <div className="mt-4">
          <Field
            id="marge"
            label="Marge brute sur une commande (%)"
            hint="Ce qui reste une fois les achats et la production payés. C'est elle qui rembourse le salon, pas le chiffre d'affaires."
            value={marge}
            min={0}
            max={100}
            step={1}
            onChange={setMarge}
          />
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">
          Toutes les valeurs par défaut sont des hypothèses d&apos;exemple, pas des moyennes de marché. Remplacez-les
          par vos propres chiffres. Le calcul porte sur tout le cycle de vente du salon, souvent plusieurs mois.
        </p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Ce que coûte le salon</h2>
        <dl className="mt-4 space-y-3">
          <Metric label="Coût total du salon" value={fmtEur(result.coutTotal)} />
          <Metric label="Dont temps de l'équipe" value={fmtEur(result.coutEquipe)} />
          <Metric label="Coût par contact recueilli" value={fmtEur(result.coutParContact)} />
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Aujourd&apos;hui</h2>
        <ScenarioBlock scenario={result.avant} verdictTone={result.verdict.tone} prefix="Avant" />
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Avec une demande prise sur le stand</h2>
        <ScenarioBlock scenario={result.apres} verdictTone={result.verdict.tone} prefix="Apres" />
        <dl className="mt-3 space-y-3">
          <Metric label="Écart avec aujourd'hui" value={ecart} />
          <Metric label="Seuil de rentabilité" value={seuil} />
        </dl>
        <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${alertClass(result.verdict.tone)}`}>
          {result.verdict.text}
        </p>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">
          Le résultat compare la marge brute des commandes signées au coût total du salon. Il ne compte ni les clients
          qui reviendront plus tard, ni la notoriété. Il dit seulement si les commandes de ce salon le remboursent.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Pour lire vos chiffres</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-muted">
          {result.conseils.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Récapitulatif</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] px-3 py-3 text-sm leading-6 text-mk-ink ring-1 ring-mk-border">
          {result.recap}
        </pre>
        <div className="mt-3">
          <CopyButton text={result.recap} label="Copier" />
        </div>
      </section>
    </div>
  );
}

function ScenarioBlock({
  scenario,
  verdictTone,
  prefix,
}: {
  scenario: RoiSalonScenario;
  verdictTone: RoiSalonTone;
  prefix: "Avant" | "Apres";
}) {
  const roiText = scenario.roi === null ? "n/a" : fmtNum(scenario.roi) + NBSP_PCT;
  return (
    <dl className="mt-4 space-y-3">
      <Metric label="Demandes de devis" value={fmtNum(scenario.demandes)} id={"demandes" + prefix} />
      <Metric label="Clients signés" value={fmtNum(scenario.clients)} id={"clients" + prefix} />
      <Metric
        label="Coût par demande, puis par client"
        value={fmtEur(scenario.coutParDemande) + " / " + fmtEur(scenario.coutParClient)}
        id={"couts" + prefix}
      />
      <Metric label="Marge brute des commandes" value={fmtEur(scenario.margeBrute)} id={"marge" + prefix} />
      <Metric
        label="Résultat du salon (marge moins coûts) et ROI"
        value={fmtEur(scenario.resultat) + " (" + roiText + ")"}
        id={"resultat" + prefix}
        tone={resultatTone(scenario.roi, verdictTone)}
      />
    </dl>
  );
}

function resultatTone(roi: number | null, verdictTone: RoiSalonTone): RoiSalonTone | "accent" {
  if (verdictTone === "neutral" || roi === null) return "accent";
  if (roi >= 20) return "ok";
  if (roi >= 0) return "warn";
  return "bad";
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

function Metric({
  label,
  value,
  tone = "accent",
  id,
}: {
  label: string;
  value: string;
  tone?: RoiSalonTone | "accent";
  id?: string;
}) {
  const toneClass =
    tone === "bad"
      ? "text-rose-700"
      : tone === "ok"
        ? "text-emerald-700"
        : tone === "warn"
          ? "text-amber-800"
          : "text-mk-accent";
  return (
    <div className="border-t border-mk-border pt-3 first:border-t-0 first:pt-0" id={id ? id + "Wrap" : undefined}>
      <dt className="text-sm text-mk-ink">{label}</dt>
      <dd id={id} className={`mt-0.5 text-[1.35rem] font-semibold tabular-nums ${toneClass}`}>
        {value}
      </dd>
    </div>
  );
}

function alertClass(tone: RoiSalonTone) {
  if (tone === "ok") return "bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "bg-amber-50 text-amber-900";
  if (tone === "bad") return "bg-rose-50 text-rose-800";
  return "bg-[#fce8dc] text-mk-ink";
}
