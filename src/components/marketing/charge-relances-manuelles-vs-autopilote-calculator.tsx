"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  AUTOPILOT_LOAD_DEFAULTS,
  computeAutopilotLoad,
  fmtEur,
  fmtNum,
  type AutopilotLoadTone,
} from "@/lib/marketing/charge-relances-manuelles-vs-autopilote";

const fieldClass =
  "mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const NBSP_H = "\u00a0h";

export function ChargeRelancesManuellesVsAutopiloteCalculator() {
  const [demandesParMois, setDemandesParMois] = useState(String(AUTOPILOT_LOAD_DEFAULTS.demandesParMois));
  const [touchesManuellesParDemande, setTouchesManuellesParDemande] = useState(
    String(AUTOPILOT_LOAD_DEFAULTS.touchesManuellesParDemande),
  );
  const [minutesParTouche, setMinutesParTouche] = useState(String(AUTOPILOT_LOAD_DEFAULTS.minutesParTouche));
  const [tauxHoraire, setTauxHoraire] = useState(String(AUTOPILOT_LOAD_DEFAULTS.tauxHoraire));
  const [pctSansSuiteManuelle, setPctSansSuiteManuelle] = useState(
    String(AUTOPILOT_LOAD_DEFAULTS.pctSansSuiteManuelle),
  );
  const [panierMoyen, setPanierMoyen] = useState(String(AUTOPILOT_LOAD_DEFAULTS.panierMoyen));
  const [tauxCloseAvecSuite, setTauxCloseAvecSuite] = useState(String(AUTOPILOT_LOAD_DEFAULTS.tauxCloseAvecSuite));
  const [tauxCloseSansSuite, setTauxCloseSansSuite] = useState(String(AUTOPILOT_LOAD_DEFAULTS.tauxCloseSansSuite));
  const [heuresSetupAutopilote, setHeuresSetupAutopilote] = useState(
    String(AUTOPILOT_LOAD_DEFAULTS.heuresSetupAutopilote),
  );

  const result = useMemo(
    () =>
      computeAutopilotLoad({
        demandesParMois,
        touchesManuellesParDemande,
        minutesParTouche,
        tauxHoraire,
        pctSansSuiteManuelle,
        panierMoyen,
        tauxCloseAvecSuite,
        tauxCloseSansSuite,
        heuresSetupAutopilote,
      }),
    [
      demandesParMois,
      touchesManuellesParDemande,
      minutesParTouche,
      tauxHoraire,
      pctSansSuiteManuelle,
      panierMoyen,
      tauxCloseAvecSuite,
      tauxCloseSansSuite,
      heuresSetupAutopilote,
    ],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Votre suivi aujourd&apos;hui</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="demandesParMois"
              label="Demandes de devis par mois"
              value={demandesParMois}
              min={0}
              step={1}
              onChange={setDemandesParMois}
            />
            <Field
              id="touchesManuellesParDemande"
              label="Touches faites à la main par demande"
              hint="Par exemple : confirmation, rappel interne, deux messages de suivi."
              value={touchesManuellesParDemande}
              min={0}
              step={1}
              onChange={setTouchesManuellesParDemande}
            />
            <Field
              id="minutesParTouche"
              label="Minutes par touche"
              hint="Retrouver le dossier, écrire, envoyer, noter."
              value={minutesParTouche}
              min={0}
              step={1}
              onChange={setMinutesParTouche}
            />
            <Field
              id="tauxHoraire"
              label="Coût horaire chargé (€)"
              value={tauxHoraire}
              min={0}
              step={1}
              onChange={setTauxHoraire}
            />
          </div>
          <div className="mt-4">
            <Field
              id="pctSansSuiteManuelle"
              label="Demandes où au moins une touche prévue saute (%)"
              hint="Rendez-vous, congés, pic d'activité : la confirmation part le soir, la relance du troisième jour est oubliée."
              value={pctSansSuiteManuelle}
              min={0}
              max={100}
              step={1}
              onChange={setPctSansSuiteManuelle}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Vos affaires</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="panierMoyen"
              label="Panier moyen d'une affaire signée (€ HT)"
              value={panierMoyen}
              min={0}
              step={100}
              onChange={setPanierMoyen}
            />
            <Field
              id="heuresSetupAutopilote"
              label="Heures de mise en place du parcours"
              hint="Une seule fois, amorties sur 12 mois."
              value={heuresSetupAutopilote}
              min={0}
              max={40}
              step={0.5}
              onChange={setHeuresSetupAutopilote}
            />
            <Field
              id="tauxCloseAvecSuite"
              label="Signature quand la suite est complète (%)"
              value={tauxCloseAvecSuite}
              min={0}
              max={100}
              step={1}
              onChange={setTauxCloseAvecSuite}
            />
            <Field
              id="tauxCloseSansSuite"
              label="Signature quand une touche a sauté (%)"
              value={tauxCloseSansSuite}
              min={0}
              max={100}
              step={1}
              onChange={setTauxCloseSansSuite}
            />
          </div>
          <p className="mt-4 text-[12px] leading-5 text-mk-faint">
            Les taux de signature par défaut sont des hypothèses d&apos;exemple, pas des moyennes de marché. Mettez ceux
            de votre historique.
          </p>
        </fieldset>
      </form>

      <div className="space-y-6">
        <section className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6" aria-live="polite">
          <h2 className="text-sm font-semibold">Ce que coûte le suivi à la main</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Metric label="Touches à faire par mois" value={fmtNum(result.touchesMois)} />
            <Metric label="Heures passées par mois" value={fmtNum(result.heuresManuelles) + NBSP_H} />
            <Metric label="Coût de ce temps par mois" value={fmtEur(result.coutTemps)} />
            <Metric label="Demandes sans suite complète par mois" value={fmtNum(result.demandesSansSuite)} />
            <Metric label="Affaires perdues par mois" value={fmtNum(result.dealsPerdus)} />
            <Metric label="Chiffre d'affaires manqué par mois" value={fmtEur(result.caManque)} />
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-sm font-semibold">Avec un parcours automatique</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <MetricLight label="Mise en place amortie par mois" value={fmtEur(result.coutSetupMensuel)} />
            <MetricLight label="Heures nettes rendues par mois" value={fmtNum(result.heuresNettesGagnees) + NBSP_H} />
            <MetricLight
              label="Coût mensuel évité"
              value={fmtEur(result.coutNetMensuelEvite)}
              tone={result.coutNetMensuelEvite < 0 ? "bad" : "ok"}
            />
            <MetricLight label="Sur 12 mois" value={fmtEur(result.coutNetAnnuelEvite)} />
          </dl>
          <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.verdict.tone)}`}>
            {result.verdict.text}
          </p>
          <p className="mt-4 text-[13px] leading-5 text-mk-faint">
            Le calcul suppose que le parcours remplace les touches écrites une fois en place, et qu&apos;il les envoie
            toutes. Les appels et les visites restent à compter à part.
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

function alertClass(tone: AutopilotLoadTone) {
  if (tone === "ok") return "bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "bg-amber-50 text-amber-900";
  if (tone === "bad") return "bg-rose-50 text-rose-800";
  return "bg-mk-band text-mk-ink";
}
