"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  DEMANDES_DEVIS_ABANDONNEES_DEFAULTS,
  DEMANDES_DEVIS_ABANDONNEES_LABELS,
  computeDemandesDevisAbandonnees,
  type DemandesDevisAbandonneesTone,
} from "@/lib/marketing/demandes-devis-abandonnees-funnel";

export function DemandesDevisAbandonneesFunnelCalculator() {
  const [sessions, setSessions] = useState<number>(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.sessions);
  const [pctAbandon, setPctAbandon] = useState<number>(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.pctAbandon);
  const [pctEmail, setPctEmail] = useState<number>(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.pctEmail);
  const [pctReprise, setPctReprise] = useState<number>(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.pctReprise);
  const [pctGagne, setPctGagne] = useState<number>(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.pctGagne);
  const [panier, setPanier] = useState<number>(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.panier);
  const [gainEmail, setGainEmail] = useState<number>(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.gainEmail);
  const [draft, setDraft] = useState<string | null>(null);

  const result = useMemo(
    () =>
      computeDemandesDevisAbandonnees({
        sessions,
        pctAbandon,
        pctEmail,
        pctReprise,
        pctGagne,
        panier,
        gainEmail,
      }),
    [sessions, pctAbandon, pctEmail, pctReprise, pctGagne, panier, gainEmail],
  );
  const recap = draft ?? result.recap;

  function reset() {
    setDraft(null);
    setSessions(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.sessions);
    setPctAbandon(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.pctAbandon);
    setPctEmail(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.pctEmail);
    setPctReprise(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.pctReprise);
    setPctGagne(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.pctGagne);
    setPanier(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.panier);
    setGainEmail(DEMANDES_DEVIS_ABANDONNEES_DEFAULTS.gainEmail);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Parcours commencés et abandons</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={DEMANDES_DEVIS_ABANDONNEES_LABELS.sessions}
              hint="Dans QuoteBuilder, la marche « Commencé » de l'entonnoir de la page Stats."
              value={sessions}
              min={0}
              max={1000000}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setSessions(value);
              }}
            />
            <NumberField
              label={DEMANDES_DEVIS_ABANDONNEES_LABELS.pctAbandon}
              hint="Écart entre « Commencé » et « Complété », rapporté à « Commencé »."
              value={pctAbandon}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPctAbandon(value);
              }}
            />
          </div>
          <div className="mt-4">
            <NumberField
              label={DEMANDES_DEVIS_ABANDONNEES_LABELS.pctEmail}
              hint="Sessions de l'onglet « Emails » de la page Sessions, rapportées à « Tous ». Sans email, pas de relance possible."
              value={pctEmail}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPctEmail(value);
              }}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Relance et signature (hypothèses)</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={DEMANDES_DEVIS_ABANDONNEES_LABELS.pctReprise}
              hint="Votre estimation. Testez plusieurs valeurs (par exemple 5, 15, 30), puis comparez avec vos chiffres réels après un mois."
              value={pctReprise}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPctReprise(value);
              }}
            />
            <NumberField
              label={DEMANDES_DEVIS_ABANDONNEES_LABELS.pctGagne}
              hint="Votre taux habituel, lu dans le pipeline (statut Gagné)."
              value={pctGagne}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPctGagne(value);
              }}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={DEMANDES_DEVIS_ABANDONNEES_LABELS.panier}
              hint="Montant moyen de vos devis signés."
              value={panier}
              min={0}
              max={100000000}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPanier(value);
              }}
            />
            <NumberField
              label={DEMANDES_DEVIS_ABANDONNEES_LABELS.gainEmail}
              hint="Par exemple en mettant en avant la sauvegarde de la configuration. Plafonné à 100 %."
              value={gainEmail}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setGainEmail(value);
              }}
            />
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-mk-accent ring-1 ring-mk-accent"
          >
            Réinitialiser
          </button>
        </fieldset>
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6" aria-live="polite">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">Résultat</p>
        <p className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${toneClass(result.caTone)}`}>
          {result.caLabel}
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">{DEMANDES_DEVIS_ABANDONNEES_LABELS.ca}</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label={DEMANDES_DEVIS_ABANDONNEES_LABELS.abandons} value={result.abandonsLabel} />
          <Row label={DEMANDES_DEVIS_ABANDONNEES_LABELS.relancables} value={result.relancablesLabel} />
          <Row label={DEMANDES_DEVIS_ABANDONNEES_LABELS.anonymes} value={result.anonymesLabel} />
          <Row label={DEMANDES_DEVIS_ABANDONNEES_LABELS.reprises} value={result.reprisesLabel} />
          <Row label={DEMANDES_DEVIS_ABANDONNEES_LABELS.gagnes} value={result.gagnesLabel} />
          <Row label={DEMANDES_DEVIS_ABANDONNEES_LABELS.an} value={result.anLabel} tone={result.caTone} />
          <Row label={DEMANDES_DEVIS_ABANDONNEES_LABELS.plafond} value={result.plafondLabel} />
          <Row label={DEMANDES_DEVIS_ABANDONNEES_LABELS.gain} value={result.gainLabel} tone={result.gainTone} />
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif pour une discussion d&apos;équipe, pas une prévision ni un conseil financier. Aucune donnée
          n&apos;est envoyée. Aucun chiffre de référence n&apos;est inventé : toutes les valeurs sont les vôtres. Le
          plafond suppose que chaque prospect relancé reprend et signe, ce qui n&apos;arrive jamais : lisez-le comme une
          borne haute. Côté QuoteBuilder : le bandeau de sauvegarde (prénom, email) apparaît à partir de la deuxième
          étape ; le parcours abandon par défaut relance après une heure puis vingt-quatre heures d&apos;inactivité,
          avec un lien de reprise ; la relance s&apos;arrête si la demande est envoyée ; une session abandonnée n&apos;a
          ni score ni statut.
        </p>

        <label className="mt-6 block text-[12px] leading-5 text-mk-on-dark/50">
          Texte récap / checklist (modifiable avant copie)
          <textarea
            value={recap}
            onChange={(event) => setDraft(event.target.value)}
            className="mt-2 h-44 w-full resize-y rounded-xl bg-white/5 px-3 py-2 text-xs leading-5 text-mk-on-dark ring-1 ring-white/10"
          />
        </label>
        <div className="mt-3 flex justify-end">
          <CopyButton text={recap} label="Copier le récap" />
        </div>
      </div>
    </div>
  );
}

function toneClass(tone: DemandesDevisAbandonneesTone) {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: DemandesDevisAbandonneesTone) {
  if (tone === "ok") return "bg-emerald-400/15 text-emerald-200";
  if (tone === "warn") return "bg-amber-400/15 text-amber-100";
  if (tone === "bad") return "bg-rose-400/15 text-rose-200";
  return "bg-white/5 text-mk-on-dark/80";
}

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max?: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40"
      />
      {hint ? <span className="mt-1 block text-[12px] leading-5 text-mk-faint">{hint}</span> : null}
    </label>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: DemandesDevisAbandonneesTone;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: DemandesDevisAbandonneesTone) {
  if (tone === "ok") return "font-semibold text-emerald-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  if (tone === "bad") return "font-semibold text-rose-300";
  return "font-medium";
}
