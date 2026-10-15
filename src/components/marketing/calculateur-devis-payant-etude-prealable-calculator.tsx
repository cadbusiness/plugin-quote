"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEVIS_PAYANT_DEFAULTS,
  computeDevisPayant,
  fmtEur,
  fmtNum,
  type DevisPayantTone,
} from "@/lib/marketing/calculateur-devis-payant-etude-prealable";

const fieldClass =
  "mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const NBSP_H = "\u00a0h";
const NBSP_PCT = "\u00a0%";

export function CalculateurDevisPayantEtudePrealableCalculator() {
  const [demandes, setDemandes] = useState(String(DEVIS_PAYANT_DEFAULTS.demandes));
  const [heuresEtude, setHeuresEtude] = useState(String(DEVIS_PAYANT_DEFAULTS.heuresEtude));
  const [tauxHoraire, setTauxHoraire] = useState(String(DEVIS_PAYANT_DEFAULTS.tauxHoraire));
  const [signatureActuelle, setSignatureActuelle] = useState(String(DEVIS_PAYANT_DEFAULTS.signatureActuelle));
  const [margeContrat, setMargeContrat] = useState(String(DEVIS_PAYANT_DEFAULTS.margeContrat));
  const [prixEtude, setPrixEtude] = useState(String(DEVIS_PAYANT_DEFAULTS.prixEtude));
  const [partAcceptent, setPartAcceptent] = useState(String(DEVIS_PAYANT_DEFAULTS.partAcceptent));
  const [signatureApres, setSignatureApres] = useState(String(DEVIS_PAYANT_DEFAULTS.signatureApres));
  const [deduite, setDeduite] = useState<boolean>(DEVIS_PAYANT_DEFAULTS.deduite);

  const result = useMemo(
    () =>
      computeDevisPayant({
        demandes,
        heuresEtude,
        tauxHoraire,
        signatureActuelle,
        margeContrat,
        prixEtude,
        partAcceptent,
        signatureApres,
        deduite,
      }),
    [
      demandes,
      heuresEtude,
      tauxHoraire,
      signatureActuelle,
      margeContrat,
      prixEtude,
      partAcceptent,
      signatureApres,
      deduite,
    ],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Aujourd&apos;hui, étude gratuite</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="demandes"
              label="Demandes par mois qui demandent une étude"
              hint="Seulement celles qui demandent un vrai travail : visite, relevé, plan, note de calcul. Pas les prix simples."
              value={demandes}
              min={0}
              step={1}
              onChange={setDemandes}
            />
            <Field
              id="heuresEtude"
              label="Heures par étude (trajet, terrain, bureau)"
              value={heuresEtude}
              min={0}
              max={80}
              step={0.5}
              onChange={setHeuresEtude}
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
              id="signatureActuelle"
              label="Part de ces demandes signées aujourd'hui (%)"
              value={signatureActuelle}
              min={0}
              max={100}
              step={1}
              onChange={setSignatureActuelle}
            />
          </div>
          <div className="mt-4">
            <Field
              id="margeContrat"
              label="Marge brute par contrat signé (€)"
              hint="Ce qu'un contrat vous rapporte une fois les achats et la main-d'œuvre payés. C'est ce que vous perdez quand un client part."
              value={margeContrat}
              min={0}
              step={10}
              onChange={setMargeContrat}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Avec une étude payante</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id="prixEtude"
              label="Prix de l'étude (€ HT)"
              value={prixEtude}
              min={0}
              step={10}
              onChange={setPrixEtude}
            />
            <Field
              id="partAcceptent"
              label="Part des clients qui acceptent de la payer (%)"
              hint="Les autres partent, ou se contentent d'une estimation sans étude."
              value={partAcceptent}
              min={0}
              max={100}
              step={1}
              onChange={setPartAcceptent}
            />
          </div>
          <div className="mt-4">
            <Field
              id="signatureApres"
              label="Part des études payées qui finissent signées (%)"
              hint="Un client qui a payé l'étude est en général plus engagé. Restez prudent."
              value={signatureApres}
              min={0}
              max={100}
              step={1}
              onChange={setSignatureApres}
            />
          </div>
          <label className="mt-4 flex items-start gap-3 text-sm font-semibold" htmlFor="deduite">
            <input
              id="deduite"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[#E85D04]"
              checked={deduite}
              onChange={(event) => setDeduite(event.target.checked)}
            />
            <span>Étude déduite de la commande si le client signe</span>
          </label>
          <p className="mt-1 text-[12px] leading-5 text-mk-faint">
            Avec la déduction, seules les études des clients qui ne signent pas rapportent leur prix.
          </p>
          <p className="mt-4 text-[12px] leading-5 text-mk-faint">
            Toutes les valeurs par défaut sont des hypothèses d&apos;exemple, pas des moyennes de marché.
            Remplacez-les par vos propres chiffres.
          </p>
        </fieldset>
      </form>

      <div className="space-y-6">
        <section className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6" aria-live="polite">
          <h2 className="text-sm font-semibold">Aujourd&apos;hui</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Metric label="Heures d'étude par mois" value={fmtNum(result.heuresActuelles) + NBSP_H} />
            <Metric label="Coût de ce temps par mois" value={fmtEur(result.coutActuel)} />
            <Metric label="Dont temps passé sur des études non signées" value={fmtEur(result.coutEtudesPerdues)} />
            <Metric label="Contrats signés par mois" value={fmtNum(result.contratsActuels)} />
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <h2 className="text-sm font-semibold">Avec une étude payante</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <MetricLight label="Études payées par mois" value={fmtNum(result.etudesPayees)} />
            <MetricLight
              label="Heures récupérées par mois"
              value={fmtNum(result.heuresRecuperees) + NBSP_H + " (" + fmtEur(result.valeurTempsRecupere) + ")"}
            />
            <MetricLight label="Contrats signés par mois" value={fmtNum(result.contratsApres)} />
            <MetricLight label="Écart de marge sur les contrats" value={fmtEur(result.ecartMarge)} />
            <MetricLight label="Recettes des études facturées" value={fmtEur(result.recettesEtudes)} />
            <MetricLight
              label="Bilan mensuel sans le temps récupéré"
              value={fmtEur(result.bilanPrudent)}
              tone={result.verdict.tone}
            />
            <MetricLight label="Bilan mensuel avec le temps récupéré" value={fmtEur(result.bilanComplet)} />
            <MetricLight
              label="Sur 12 mois, sans et avec le temps récupéré"
              value={fmtEur(result.bilanPrudentAnnuel) + " / " + fmtEur(result.bilanCompletAnnuel)}
            />
            <MetricLight
              label="Taux d'acceptation d'équilibre"
              value={result.acceptationEquilibre === null ? "n/a" : fmtNum(result.acceptationEquilibre) + NBSP_PCT}
            />
          </dl>
          <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.verdict.tone)}`}>
            {result.verdict.text}
          </p>
          <p className="mt-4 text-[13px] leading-5 text-mk-faint">
            Le bilan « sans le temps récupéré » ne compte que l&apos;argent : études facturées et marge gagnée ou
            perdue. Le temps récupéré ne vaut quelque chose que s&apos;il sert vraiment à autre chose, d&apos;où les
            deux lignes.
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
  tone?: DevisPayantTone;
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

function alertClass(tone: DevisPayantTone) {
  if (tone === "ok") return "bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "bg-amber-50 text-amber-900";
  if (tone === "bad") return "bg-rose-50 text-rose-800";
  return "bg-mk-band text-mk-ink";
}
