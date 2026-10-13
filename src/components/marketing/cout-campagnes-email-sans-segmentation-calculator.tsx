"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  CAMPAIGN_WASTE_DEFAULTS,
  computeCampaignWaste,
  fmtEur,
  fmtNum,
  type CampaignWasteTone,
} from "@/lib/marketing/cout-campagnes-email-sans-segmentation";

const fieldClass =
  "mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const NBSP_H = "\u00a0h";

export function CoutCampagnesEmailSansSegmentationCalculator() {
  const [campagnesParMois, setCampagnesParMois] = useState(String(CAMPAIGN_WASTE_DEFAULTS.campagnesParMois));
  const [tailleListe, setTailleListe] = useState(String(CAMPAIGN_WASTE_DEFAULTS.tailleListe));
  const [pctSansSegment, setPctSansSegment] = useState(String(CAMPAIGN_WASTE_DEFAULTS.pctSansSegment));
  const [minutesPreparation, setMinutesPreparation] = useState(String(CAMPAIGN_WASTE_DEFAULTS.minutesPreparation));
  const [pctPlaintes, setPctPlaintes] = useState(String(CAMPAIGN_WASTE_DEFAULTS.pctPlaintes));
  const [minutesParPlainte, setMinutesParPlainte] = useState(String(CAMPAIGN_WASTE_DEFAULTS.minutesParPlainte));
  const [pctDejaAutopilote, setPctDejaAutopilote] = useState(String(CAMPAIGN_WASTE_DEFAULTS.pctDejaAutopilote));
  const [tauxHoraire, setTauxHoraire] = useState(String(CAMPAIGN_WASTE_DEFAULTS.tauxHoraire));
  const [panierMoyen, setPanierMoyen] = useState(String(CAMPAIGN_WASTE_DEFAULTS.panierMoyen));
  const [pctDealsFroids, setPctDealsFroids] = useState(String(CAMPAIGN_WASTE_DEFAULTS.pctDealsFroids));

  const result = useMemo(
    () =>
      computeCampaignWaste({
        campagnesParMois,
        tailleListe,
        pctSansSegment,
        minutesPreparation,
        pctPlaintes,
        minutesParPlainte,
        pctDejaAutopilote,
        tauxHoraire,
        panierMoyen,
        pctDealsFroids,
      }),
    [
      campagnesParMois,
      tailleListe,
      pctSansSegment,
      minutesPreparation,
      pctPlaintes,
      minutesParPlainte,
      pctDejaAutopilote,
      tauxHoraire,
      panierMoyen,
      pctDealsFroids,
    ],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">La liste</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="campagnesParMois"
              label="Campagnes par mois"
              hint="Chaque envoi compte, même s'il part vers la même liste."
              value={campagnesParMois}
              min={0}
              step={1}
              onChange={setCampagnesParMois}
            />
            <Field
              id="tailleListe"
              label="Contacts par campagne"
              hint="Taille de la liste brute. Contacts touchés = campagnes × cette taille."
              value={tailleListe}
              min={0}
              step={1}
              onChange={setTailleListe}
            />
            <Field
              id="pctSansSegment"
              label="Part sans segment (%)"
              hint="Ceux qui reçoivent le message alors qu'aucune règle ne les vise."
              value={pctSansSegment}
              min={0}
              max={100}
              step={1}
              onChange={setPctSansSegment}
            />
            <Field
              id="pctDejaAutopilote"
              label="Déjà dans un parcours Autopilote (%)"
              hint="Informatif. Ces contacts ne sont pas additionnés aux mal ciblés."
              value={pctDejaAutopilote}
              min={0}
              max={100}
              step={1}
              onChange={setPctDejaAutopilote}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Le temps et les suites</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="minutesPreparation"
              label="Minutes de préparation par campagne"
              hint="Écrire, relire, choisir la liste, envoyer."
              value={minutesPreparation}
              min={0}
              step={1}
              onChange={setMinutesPreparation}
            />
            <Field
              id="pctPlaintes"
              label="Plaintes ou désabonnements (%)"
              value={pctPlaintes}
              min={0}
              max={100}
              step={0.1}
              onChange={setPctPlaintes}
            />
            <Field
              id="minutesParPlainte"
              label="Minutes pour traiter une plainte"
              value={minutesParPlainte}
              min={0}
              step={1}
              onChange={setMinutesParPlainte}
            />
            <Field
              id="tauxHoraire"
              label="Coût horaire chargé (€)"
              value={tauxHoraire}
              min={0}
              step={1}
              onChange={setTauxHoraire}
            />
            <Field
              id="panierMoyen"
              label="Panier moyen d'une affaire (€)"
              value={panierMoyen}
              min={0}
              step={1}
              onChange={setPanierMoyen}
            />
            <Field
              id="pctDealsFroids"
              label="Affaires qui refroidissent (%)"
              hint="Part des contacts mal ciblés qui étaient une affaire ouverte."
              value={pctDealsFroids}
              min={0}
              max={100}
              step={0.1}
              onChange={setPctDealsFroids}
            />
          </div>
          <p className="mt-4 text-[12px] leading-5 text-mk-faint">
            Les pourcentages par défaut sont des hypothèses d&apos;exemple, pas des moyennes de marché. Mettez les
            vôtres.
          </p>
        </fieldset>
      </form>

      <div className="space-y-6">
        <section className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6" aria-live="polite">
          <h2 className="text-sm font-semibold">Ce que coûte la liste brute</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Metric label="Contacts touchés par mois" value={fmtNum(result.contactsEnvoyes)} />
            <Metric label="Contacts mal ciblés" value={fmtNum(result.contactsMalCibles)} />
            <Metric label="Déjà en parcours Autopilote" value={fmtNum(result.contactsDejaAutopilote)} />
            <Metric label="Heures perdues par mois" value={fmtNum(result.heuresPerdues) + NBSP_H} />
            <Metric label="Coût de ce temps" value={fmtEur(result.coutTemps)} />
            <Metric label="Opportunités (affaires refroidies)" value={fmtEur(result.opportunites)} />
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-sm font-semibold">Lecture</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <MetricLight label="Plaintes ou désabonnements" value={fmtNum(result.plaintes)} />
            <MetricLight label="Affaires refroidies" value={fmtNum(result.dealsFroids)} />
            <MetricLight
              label="Coût mensuel (temps + opportunités)"
              value={fmtEur(result.coutMensuel)}
              tone={result.coutMensuel < 0 ? "bad" : "ok"}
            />
          </dl>
          <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.verdict.tone)}`}>
            {result.verdict.text}
          </p>
          <p className="mt-4 text-[13px] leading-5 text-mk-faint">
            Les contacts déjà en parcours ne sont pas recomptés dans les mal ciblés. Le calcul ne sait pas si votre
            segment est juste : il applique le pourcentage que vous indiquez.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-sm font-semibold">Pour lire vos chiffres</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-muted">
            {result.conseils.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-sm font-semibold">Récapitulatif</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-mk-bg px-3 py-3 text-sm leading-6 text-mk-ink ring-1 ring-mk-border">
            {result.recap}
          </pre>
          <div className="mt-3 flex justify-end">
            <CopyButton text={result.recap} label="Copier" />
          </div>
        </section>
      </div>
    </div>
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
      <span className="text-sm font-semibold">{label}</span>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
      <dt className="text-mk-on-dark/60">{label}</dt>
      <dd className="text-right text-base font-semibold tabular-nums text-mk-accent">{value}</dd>
    </div>
  );
}

function MetricLight({ label, value, tone }: { label: string; value: string; tone?: "ok" | "bad" }) {
  const toneClass = tone === "bad" ? "text-rose-700" : tone === "ok" ? "text-emerald-700" : "text-mk-accent";
  return (
    <div className="flex items-start justify-between gap-4 border-t border-mk-border pt-3 first:border-t-0 first:pt-0">
      <dt className="text-mk-muted">{label}</dt>
      <dd className={`text-right text-base font-semibold tabular-nums ${toneClass}`}>{value}</dd>
    </div>
  );
}

function alertClass(tone: CampaignWasteTone) {
  if (tone === "ok") return "bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "bg-amber-50 text-amber-900";
  if (tone === "bad") return "bg-rose-50 text-rose-800";
  return "bg-mk-band text-mk-ink";
}
