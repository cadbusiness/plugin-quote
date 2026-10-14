"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  SUIVI_CLIENTS_DEFAULTS,
  computeSuiviClients,
  fmtEur,
  fmtNum,
  type SuiviClientsTone,
} from "@/lib/marketing/temps-demandes-suivi-devis-clients";

const fieldClass =
  "mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const NBSP_H = "\u00a0h";
const NBSP_PCT = "\u00a0%";
const NBSP_MOIS = "\u00a0mois";

export function TempsDemandesSuiviDevisClientsCalculator() {
  const [clientsActifs, setClientsActifs] = useState(String(SUIVI_CLIENTS_DEFAULTS.clientsActifs));
  const [questionsParClient, setQuestionsParClient] = useState(String(SUIVI_CLIENTS_DEFAULTS.questionsParClient));
  const [minutesParQuestion, setMinutesParQuestion] = useState(String(SUIVI_CLIENTS_DEFAULTS.minutesParQuestion));
  const [partRecente, setPartRecente] = useState(String(SUIVI_CLIENTS_DEFAULTS.partRecente));
  const [partLibreService, setPartLibreService] = useState(String(SUIVI_CLIENTS_DEFAULTS.partLibreService));
  const [documentsRenvoyes, setDocumentsRenvoyes] = useState(String(SUIVI_CLIENTS_DEFAULTS.documentsRenvoyes));
  const [minutesParRenvoi, setMinutesParRenvoi] = useState(String(SUIVI_CLIENTS_DEFAULTS.minutesParRenvoi));
  const [tauxHoraire, setTauxHoraire] = useState(String(SUIVI_CLIENTS_DEFAULTS.tauxHoraire));
  const [heuresMiseEnPlace, setHeuresMiseEnPlace] = useState(String(SUIVI_CLIENTS_DEFAULTS.heuresMiseEnPlace));
  const [minutesEntretien, setMinutesEntretien] = useState(String(SUIVI_CLIENTS_DEFAULTS.minutesEntretien));

  const result = useMemo(
    () =>
      computeSuiviClients({
        clientsActifs,
        questionsParClient,
        minutesParQuestion,
        partRecente,
        partLibreService,
        documentsRenvoyes,
        minutesParRenvoi,
        tauxHoraire,
        heuresMiseEnPlace,
        minutesEntretien,
      }),
    [
      clientsActifs,
      questionsParClient,
      minutesParQuestion,
      partRecente,
      partLibreService,
      documentsRenvoyes,
      minutesParRenvoi,
      tauxHoraire,
      heuresMiseEnPlace,
      minutesEntretien,
    ],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Vos clients</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="clientsActifs"
              label="Clients avec au moins une demande en cours ou récente"
              hint="Clients qui reviennent vers vous pendant qu'une demande est ouverte, ou qui en ont plusieurs."
              value={clientsActifs}
              min={0}
              step={1}
              onChange={setClientsActifs}
            />
            <Field
              id="questionsParClient"
              label="Questions de suivi par client et par mois"
              hint="Statut d'une demande, lien perdu, « laquelle était pour quel chantier ? »."
              value={questionsParClient}
              min={0}
              max={30}
              step={0.5}
              onChange={setQuestionsParClient}
            />
            <Field
              id="minutesParQuestion"
              label="Minutes par question (retrouver le dossier, répondre)"
              value={minutesParQuestion}
              min={0}
              max={120}
              step={1}
              onChange={setMinutesParQuestion}
            />
            <Field
              id="partRecente"
              label="Part des questions sur une demande de moins de 30 jours (%)"
              hint="Dans l'espace membres, une demande de plus de 30 jours reste listée avec son statut, mais sans lien vers sa page de suivi."
              value={partRecente}
              min={0}
              max={100}
              step={1}
              onChange={setPartRecente}
            />
          </div>
          <div className="mt-4">
            <Field
              id="partLibreService"
              label="Part que le client réglerait seul dans l'espace (%)"
              hint="L'espace montre le statut et ouvre la page de suivi. Il ne répond ni sur un prix, ni sur un délai, ni sur une question technique. Ce taux s'applique aussi aux documents renvoyés."
              value={partLibreService}
              min={0}
              max={100}
              step={1}
              onChange={setPartLibreService}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Documents communs</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="documentsRenvoyes"
              label="Documents renvoyés par mois"
              hint="Notice, guide de prise de cotes, conditions de livraison : le même fichier pour tous les clients."
              value={documentsRenvoyes}
              min={0}
              step={1}
              onChange={setDocumentsRenvoyes}
            />
            <Field
              id="minutesParRenvoi"
              label="Minutes par renvoi"
              value={minutesParRenvoi}
              min={0}
              max={60}
              step={1}
              onChange={setMinutesParRenvoi}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Vos coûts</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="tauxHoraire"
              label="Coût horaire chargé (€)"
              value={tauxHoraire}
              min={0}
              step={1}
              onChange={setTauxHoraire}
            />
            <Field
              id="heuresMiseEnPlace"
              label="Heures pour créer et remplir l'espace"
              hint="Une seule fois, amorties sur 12 mois : pages, documents, liens, relecture des emails."
              value={heuresMiseEnPlace}
              min={0}
              max={40}
              step={0.5}
              onChange={setHeuresMiseEnPlace}
            />
          </div>
          <div className="mt-4">
            <Field
              id="minutesEntretien"
              label="Minutes d'entretien par mois"
              hint="Remplacer une notice périmée, vérifier que les liens s'ouvrent."
              value={minutesEntretien}
              min={0}
              max={600}
              step={5}
              onChange={setMinutesEntretien}
            />
          </div>
          <p className="mt-4 text-[12px] leading-5 text-mk-faint">
            Toutes les valeurs par défaut sont des hypothèses d&apos;exemple, pas des moyennes de marché.
            Remplacez-les par vos propres chiffres.
          </p>
        </fieldset>
      </form>

      <div className="space-y-6">
        <section className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6" aria-live="polite">
          <h2 className="text-sm font-semibold">Ce que le suivi vous prend aujourd&apos;hui</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Metric label="Questions de suivi par mois" value={fmtNum(result.questionsMois)} />
            <Metric label="Heures de réponse aux questions par mois" value={fmtNum(result.heuresQuestions) + NBSP_H} />
            <Metric label="Heures de renvoi de documents par mois" value={fmtNum(result.heuresDocuments) + NBSP_H} />
            <Metric label="Coût de ce temps par mois" value={fmtEur(result.coutActuel)} />
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-sm font-semibold">Avec un espace membres</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <MetricLight label="Questions évitées par mois" value={fmtNum(result.questionsEvitees)} />
            <MetricLight label="Heures rendues par mois" value={fmtNum(result.heuresEvitees) + NBSP_H} />
            <MetricLight label="Part du temps de suivi rendue" value={fmtNum(result.partTempsRendu) + NBSP_PCT} />
            <MetricLight
              label="Entretien et mise en place amortie par mois"
              value={fmtEur(result.coutEntretienEtMiseEnPlace)}
            />
            <MetricLight label="Heures nettes rendues par mois" value={fmtNum(result.heuresNettes) + NBSP_H} />
            <MetricLight
              label="Gain net par mois"
              value={fmtEur(result.gainNetMensuel)}
              tone={result.verdict.tone}
            />
            <MetricLight label="Sur 12 mois" value={fmtEur(result.gainNetAnnuel)} />
            <MetricLight
              label="Mise en place rendue en"
              value={result.moisRetour === null ? "n/a" : fmtNum(result.moisRetour) + NBSP_MOIS}
            />
          </dl>
          <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.verdict.tone)}`}>
            {result.verdict.text}
          </p>
          <p className="mt-4 text-[13px] leading-5 text-mk-faint">
            Le calcul ne compte que le temps. Il ne prête à l&apos;espace aucun effet sur le taux de signature, et
            suppose que vos clients reçoivent bien le lien de l&apos;espace dans leurs emails.
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

function MetricLight({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: SuiviClientsTone;
}) {
  const toneClass =
    tone === "bad" ? "text-rose-700" : tone === "ok" ? "text-emerald-700" : tone === "warn" ? "text-amber-800" : "text-mk-accent";
  return (
    <div className="flex items-start justify-between gap-4 border-t border-mk-border pt-3 first:border-t-0 first:pt-0">
      <dt className="text-mk-muted">{label}</dt>
      <dd className={`text-right text-base font-semibold tabular-nums ${toneClass}`}>{value}</dd>
    </div>
  );
}

function alertClass(tone: SuiviClientsTone) {
  if (tone === "ok") return "bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "bg-amber-50 text-amber-900";
  if (tone === "bad") return "bg-rose-50 text-rose-800";
  return "bg-mk-band text-mk-ink";
}
