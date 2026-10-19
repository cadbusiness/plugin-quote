"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEVIS_PERDUS_DEFAULTS,
  GROUPES,
  computeDevisPerdus,
  fmtEur,
  fmtNum,
  fmtPct,
  type DevisPerdusTone,
  type MotifKey,
} from "@/lib/marketing/analyseur-motifs-devis-perdus";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const NB = "\u00a0";

type FieldKey = keyof typeof DEVIS_PERDUS_DEFAULTS;

const INITIAL: Record<FieldKey, string> = {
  gagnes: String(DEVIS_PERDUS_DEFAULTS.gagnes),
  prix: String(DEVIS_PERDUS_DEFAULTS.prix),
  delai: String(DEVIS_PERDUS_DEFAULTS.delai),
  concurrent: String(DEVIS_PERDUS_DEFAULTS.concurrent),
  silence: String(DEVIS_PERDUS_DEFAULTS.silence),
  annule: String(DEVIS_PERDUS_DEFAULTS.annule),
  horsCible: String(DEVIS_PERDUS_DEFAULTS.horsCible),
  inconnu: String(DEVIS_PERDUS_DEFAULTS.inconnu),
  panier: String(DEVIS_PERDUS_DEFAULTS.panier),
  marge: String(DEVIS_PERDUS_DEFAULTS.marge),
  heures: String(DEVIS_PERDUS_DEFAULTS.heures),
  coutHoraire: String(DEVIS_PERDUS_DEFAULTS.coutHoraire),
  recup: String(DEVIS_PERDUS_DEFAULTS.recup),
};

const HYPOTHESES =
  "Toutes les valeurs par défaut sont des hypothèses d'exemple, pas des moyennes de marché. Remplacez-les par vos propres chiffres.";

const NOTE_PERTES =
  "Tous les devis perdus n'étaient pas gagnables. Ces montants mesurent ce qui est passé devant l'équipe, pas ce qu'elle aurait dû signer.";

export function AnalyseurMotifsDevisPerdusCalculator() {
  const [values, setValues] = useState(INITIAL);

  const result = useMemo(() => computeDevisPerdus(values), [values]);

  function setField(key: FieldKey, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const topText = result.top
    ? result.top.label + " (" + fmtNum(result.top.count) + ", " + fmtPct(result.top.part) + ")"
    : "n/a";

  const groupesText =
    "Vos leviers : " +
    fmtPct(result.groupes.leviers.part) +
    " · Choix du client : " +
    fmtPct(result.groupes.choix.part) +
    " · Qualification : " +
    fmtPct(result.groupes.qualification.part) +
    " · Sans motif : " +
    fmtPct(result.groupes.inconnu.part);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form
        id="form"
        className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="text-base font-semibold">Vos devis tranchés sur la période</h2>
        <div className="mt-4">
          <Field
            id="gagnes"
            label="Devis gagnés"
            hint="Sur la même période que les pertes, par exemple un trimestre. Les dossiers encore ouverts ne comptent pas."
            value={values.gagnes}
            min={0}
            step={1}
            onChange={(value) => setField("gagnes", value)}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Devis perdus, par motif principal</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="prix"
            label="Prix"
            hint="Trop cher, ou moins cher ailleurs à périmètre égal."
            value={values.prix}
            min={0}
            step={1}
            onChange={(value) => setField("prix", value)}
          />
          <Field
            id="delai"
            label="Délai"
            hint="Devis trop tardif, ou délai de réalisation qui ne convenait pas."
            value={values.delai}
            min={0}
            step={1}
            onChange={(value) => setField("delai", value)}
          />
          <Field
            id="concurrent"
            label="Concurrent préféré (hors prix)"
            hint="Relation, référence, solution technique."
            value={values.concurrent}
            min={0}
            step={1}
            onChange={(value) => setField("concurrent", value)}
          />
          <Field
            id="silence"
            label="Pas de réponse"
            hint="Plus de réponse après les relances prévues."
            value={values.silence}
            min={0}
            step={1}
            onChange={(value) => setField("silence", value)}
          />
          <Field
            id="annule"
            label="Projet annulé ou reporté"
            value={values.annule}
            min={0}
            step={1}
            onChange={(value) => setField("annule", value)}
          />
          <Field
            id="horsCible"
            label="Hors cible"
            hint="Hors zone, hors métier, trop petit."
            value={values.horsCible}
            min={0}
            step={1}
            onChange={(value) => setField("horsCible", value)}
          />
        </div>
        <div className="mt-4">
          <Field
            id="inconnu"
            label="Sans motif noté"
            value={values.inconnu}
            min={0}
            step={1}
            onChange={(value) => setField("inconnu", value)}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Ce que représente un devis</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="panier"
            label="Montant moyen d'une commande (€ HT)"
            value={values.panier}
            min={0}
            step={100}
            onChange={(value) => setField("panier", value)}
          />
          <Field
            id="marge"
            label="Marge brute sur une commande (%)"
            value={values.marge}
            min={0}
            max={100}
            step={1}
            onChange={(value) => setField("marge", value)}
          />
          <Field
            id="heures"
            label="Temps de chiffrage d'un devis (heures)"
            value={values.heures}
            min={0}
            max={200}
            step={0.5}
            onChange={(value) => setField("heures", value)}
          />
          <Field
            id="coutHoraire"
            label="Coût chargé d'une heure de chiffrage (€)"
            value={values.coutHoraire}
            min={0}
            max={1000}
            step={1}
            onChange={(value) => setField("coutHoraire", value)}
          />
        </div>
        <div className="mt-4">
          <Field
            id="recup"
            label="Part des pertes sur vos leviers (prix, délai, pas de réponse) que vous pensez récupérer (%)"
            hint="Une hypothèse, pas une promesse. Commencez bas."
            value={values.recup}
            min={0}
            max={100}
            step={1}
            onChange={(value) => setField("recup", value)}
          />
        </div>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">{HYPOTHESES}</p>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">Vos devis tranchés</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="decides" label="Devis tranchés (gagnés + perdus)" value={fmtNum(result.decides)} />
          <Metric id="tauxGain" label="Taux de gain" value={fmtPct(result.tauxGain)} />
          <Metric id="perdus" label="Devis perdus" value={fmtNum(result.perdus)} />
          <Metric id="topMotif" label="Premier motif" value={topText} />
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Répartition des pertes</h2>
        <table className="mt-4 w-full border-collapse text-sm tabular-nums">
          <thead>
            <tr>
              <th className="pb-2 text-left font-semibold text-mk-faint">Motif</th>
              <th className="pb-2 text-left font-semibold text-mk-faint">Devis</th>
              <th className="pb-2 text-left font-semibold text-mk-faint">Part</th>
              <th className="pb-2 text-left font-semibold text-mk-faint">Groupe</th>
            </tr>
          </thead>
          <tbody id="table">
            {result.lignes.map((ligne) => {
              const highlighted = result.top?.key === ligne.key;
              return (
                <tr key={ligne.key} className={highlighted ? "bg-amber-50" : undefined}>
                  <td className="border-t border-mk-border px-1 py-2">{ligne.label}</td>
                  <td className="border-t border-mk-border px-1 py-2">{fmtNum(ligne.count)}</td>
                  <td className="border-t border-mk-border px-1 py-2">{fmtPct(ligne.part)}</td>
                  <td className="border-t border-mk-border px-1 py-2">{GROUPES[ligne.groupe]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p id="groupes" className="mt-3 text-[13px] leading-5 text-mk-faint">
          {groupesText}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Ce que représentent les pertes</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="caPerdu" label="Commandes possibles passées devant vous (€ HT)" value={fmtEur(result.caPerdu)} />
          <Metric id="margePerdue" label="Marge correspondante" value={fmtEur(result.margePerdue)} />
          <Metric
            id="chiffrage"
            label="Temps de chiffrage passé sur des devis perdus"
            value={fmtNum(result.heuresPerdues) + NB + "h (" + fmtEur(result.coutChiffragePerdus) + ")"}
          />
          <Metric
            id="chiffrageHorsCible"
            label="Dont devis hors cible"
            value={fmtNum(result.heuresHorsCible) + NB + "h (" + fmtEur(result.coutHorsCible) + ")"}
          />
        </dl>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">{NOTE_PERTES}</p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-base font-semibold">Si vous récupérez une partie des pertes sur vos leviers</h2>
        <dl className="mt-4 space-y-3">
          <Metric id="recupClients" label="Affaires en plus" value={fmtNum(result.recupClients)} />
          <Metric id="recupCa" label="Commandes en plus (€ HT)" value={fmtEur(result.recupCa)} />
          <Metric id="recupMarge" label="Marge en plus" value={fmtEur(result.recupMarge)} />
          <Metric id="tauxApres" label="Taux de gain obtenu" value={fmtPct(result.tauxApres)} />
        </dl>
        <p id="verdict" className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${alertClass(result.verdict.tone)}`}>
          {result.verdict.text}
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
  id: MotifKey | "gagnes" | "panier" | "marge" | "heures" | "coutHoraire" | "recup";
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

function Metric({ id, label, value }: { id: string; label: string; value: string }) {
  return (
    <div className="border-t border-mk-border pt-3 first:border-t-0 first:pt-0" id={id + "Wrap"}>
      <dt className="text-sm text-mk-ink">{label}</dt>
      <dd id={id} className="mt-0.5 text-[1.35rem] font-semibold tabular-nums text-mk-accent">
        {value}
      </dd>
    </div>
  );
}

function alertClass(tone: DevisPerdusTone) {
  if (tone === "ok") return "bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "bg-amber-50 text-amber-900";
  if (tone === "bad") return "bg-rose-50 text-rose-800";
  return "bg-[#fce8dc] font-medium text-mk-ink";
}
