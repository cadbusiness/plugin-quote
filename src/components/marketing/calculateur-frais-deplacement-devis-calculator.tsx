"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  FRAIS_DEPLACEMENT_DEFAULTS,
  computeFraisDeplacement,
  fmtDuree,
  fmtEur,
  fmtNum,
  type FraisDeplacementTone,
  type FraisDeplacementZone,
} from "@/lib/marketing/calculateur-frais-deplacement-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const NB = "\u00a0";

export function CalculateurFraisDeplacementDevisCalculator() {
  const [coutKm, setCoutKm] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.coutKm));
  const [vitesse, setVitesse] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.vitesse));
  const [personnes, setPersonnes] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.personnes));
  const [coutHoraire, setCoutHoraire] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.coutHoraire));
  const [allers, setAllers] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.allers));
  const [d1, setD1] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.d1));
  const [p1, setP1] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.p1));
  const [d2, setD2] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.d2));
  const [p2, setP2] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.p2));
  const [d3, setD3] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.d3));
  const [p3, setP3] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.p3));
  const [panier, setPanier] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.panier));
  const [marge, setMarge] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.marge));
  const [seuil, setSeuil] = useState(String(FRAIS_DEPLACEMENT_DEFAULTS.seuil));

  const result = useMemo(
    () =>
      computeFraisDeplacement({
        coutKm,
        vitesse,
        personnes,
        coutHoraire,
        allers,
        d1,
        p1,
        d2,
        p2,
        d3,
        p3,
        panier,
        marge,
        seuil,
      }),
    [coutKm, vitesse, personnes, coutHoraire, allers, d1, p1, d2, p2, d3, p3, panier, marge, seuil],
  );

  const rayons =
    (result.distanceSeuil === null ? "n/a" : fmtNum(result.distanceSeuil) + NB + "km") +
    " / " +
    (result.distanceTotale === null ? "n/a" : fmtNum(result.distanceTotale) + NB + "km");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form
        className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="text-base font-semibold">Le trajet</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="coutKm"
            label="Coût du véhicule par kilomètre (€)"
            hint="Carburant, entretien, usure, assurance, loyer ou amortissement, divisés par les kilomètres de l'année."
            value={coutKm}
            min={0}
            max={10}
            step={0.05}
            onChange={setCoutKm}
          />
          <Field
            id="vitesse"
            label="Vitesse moyenne porte à porte (km/h)"
            hint="Celle que vous constatez, ville et recherche de place comprises."
            value={vitesse}
            min={5}
            max={130}
            step={5}
            onChange={setVitesse}
          />
          <Field
            id="personnes"
            label="Personnes qui se déplacent"
            value={personnes}
            min={0}
            max={20}
            step={1}
            onChange={setPersonnes}
          />
          <Field
            id="coutHoraire"
            label="Coût horaire chargé par personne (€)"
            hint="Le temps de route est payé. C'est souvent le plus gros poste."
            value={coutHoraire}
            min={0}
            max={1000}
            step={1}
            onChange={setCoutHoraire}
          />
        </div>
        <div className="mt-4">
          <Field
            id="allers"
            label="Allers-retours par chantier"
            hint="Visite technique, pose, journée supplémentaire, réception."
            value={allers}
            min={0}
            max={20}
            step={1}
            onChange={setAllers}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Vos zones d&apos;intervention</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="d1"
            label="Zone 1 : distance aller maximale (km)"
            value={d1}
            min={0}
            max={1000}
            step={5}
            onChange={setD1}
          />
          <Field
            id="p1"
            label="Zone 1 : péages et parking par aller-retour (€)"
            value={p1}
            min={0}
            max={10000}
            step={5}
            onChange={setP1}
          />
          <Field
            id="d2"
            label="Zone 2 : distance aller maximale (km)"
            value={d2}
            min={0}
            max={1000}
            step={5}
            onChange={setD2}
          />
          <Field
            id="p2"
            label="Zone 2 : péages et parking par aller-retour (€)"
            value={p2}
            min={0}
            max={10000}
            step={5}
            onChange={setP2}
          />
          <Field
            id="d3"
            label="Zone 3 : distance aller maximale (km)"
            value={d3}
            min={0}
            max={1000}
            step={5}
            onChange={setD3}
          />
          <Field
            id="p3"
            label="Zone 3 : péages et parking par aller-retour (€)"
            value={p3}
            min={0}
            max={10000}
            step={5}
            onChange={setP3}
          />
        </div>
        <p className="mt-3 text-[12px] leading-5 text-mk-faint">
          Le calcul se fait au bord extérieur de chaque zone : un forfait calculé au milieu perd de l&apos;argent sur
          les chantiers les plus loin.
        </p>

        <h2 className="mt-6 text-base font-semibold">Un chantier type</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="panier"
            label="Montant d'un chantier type (€ HT)"
            value={panier}
            min={0}
            step={100}
            onChange={setPanier}
          />
          <Field
            id="marge"
            label="Marge brute sur ce chantier (%)"
            value={marge}
            min={0}
            max={100}
            step={1}
            onChange={setMarge}
          />
        </div>
        <div className="mt-4">
          <Field
            id="seuil"
            label="Part de la marge que vous acceptez de consacrer au trajet (%)"
            hint="Sous ce seuil, le trajet est absorbé dans vos prix. Au-dessus, le calcul propose un forfait pour le reste."
            value={seuil}
            min={0}
            max={100}
            step={1}
            onChange={setSeuil}
          />
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">
          Toutes les valeurs par défaut sont des hypothèses d&apos;exemple, pas des moyennes de marché. Remplacez-les
          par vos propres chiffres.
        </p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Repères</h2>
        <dl className="mt-4 space-y-3">
          <Metric
            id="kmAR"
            label="Coût d'un kilomètre de distance, par aller-retour"
            value={fmtEur(result.kmAR) + " (dont " + fmtEur(result.tempsKm) + " de temps d'équipe)"}
          />
          <Metric
            id="margeChantier"
            label="Marge d'un chantier type, puis part acceptée pour le trajet"
            value={fmtEur(result.margeChantier) + " / " + fmtEur(result.partAcceptee)}
          />
          <Metric
            id="rayons"
            label="Distance où le trajet atteint la part acceptée, puis toute la marge"
            value={rayons}
          />
        </dl>
        <p id="verdict" className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${alertClass(result.verdict.tone)}`}>
          {result.verdict.text}
        </p>
      </section>

      {result.zones.map((zone) => (
        <ZoneCard key={zone.zone} zone={zone} />
      ))}

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

function ZoneCard({ zone }: { zone: FraisDeplacementZone }) {
  const allerRetour =
    fmtEur(zone.parAR) +
    " (véhicule " +
    fmtEur(zone.vehicule) +
    ", temps " +
    fmtEur(zone.temps) +
    (zone.peages > 0 ? ", péages " + fmtEur(zone.peages) : "") +
    ")";
  const chantier =
    fmtEur(zone.chantier) + (zone.part === null ? "" : " (" + fmtNum(zone.part) + NB + "% de la marge)");
  const forfait =
    zone.part === null
      ? fmtEur(zone.forfaitComplet) + " en coût complet"
      : zone.tone === "ok"
        ? "Aucun, trajet absorbé (coût complet " + fmtEur(zone.forfaitComplet) + ")"
        : fmtEur(zone.forfaitAuDela) +
          " au-delà de la part absorbée, ou " +
          fmtEur(zone.forfaitComplet) +
          " en coût complet";
  const minimum = zone.panierMin === null ? "n/a" : fmtEur(zone.panierMin) + " HT";

  return (
    <section id={"zone" + zone.zone} className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
      <h2 id={"titre" + zone.zone} className="text-base font-semibold">
        {"Zone " + zone.zone + " : jusqu'à " + fmtNum(zone.distance) + NB + "km"}
      </h2>
      <dl className="mt-4 space-y-3">
        <Metric id={"duree" + zone.zone} label="Temps de route par aller-retour" value={fmtDuree(zone.heures)} />
        <Metric id={"ar" + zone.zone} label="Coût d'un aller-retour" value={allerRetour} />
        <Metric
          id={"chantier" + zone.zone}
          label="Coût du déplacement par chantier et part de la marge"
          value={chantier}
          tone={zone.tone}
        />
        <Metric id={"forfait" + zone.zone} label="Forfait à afficher" value={forfait} />
        <Metric id={"min" + zone.zone} label="Commande minimum pour rester sous la part acceptée" value={minimum} />
      </dl>
      {zone.zone === 3 ? (
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">
          Le forfait « au-delà de la part absorbée » facture seulement ce que la marge ne supporte pas. Le « coût
          complet » facture tout le trajet. Les montants sont arrondis à la dizaine d&apos;euros supérieure.
        </p>
      ) : null}
    </section>
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

function Metric({
  label,
  value,
  tone = "accent",
  id,
}: {
  label: string;
  value: string;
  tone?: FraisDeplacementTone | "accent";
  id?: string;
}) {
  const toneClass =
    tone === "bad"
      ? "text-rose-700"
      : tone === "ok"
        ? "text-emerald-700"
        : tone === "warn"
          ? "text-amber-800"
          : tone === "neutral"
            ? "text-mk-ink"
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

function alertClass(tone: FraisDeplacementTone) {
  if (tone === "ok") return "bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "bg-amber-50 text-amber-900";
  if (tone === "bad") return "bg-rose-50 text-rose-800";
  return "bg-[#fce8dc] font-medium text-mk-ink";
}
