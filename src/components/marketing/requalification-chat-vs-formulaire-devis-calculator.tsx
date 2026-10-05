"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS,
  REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS,
  computeRequalificationChatVsFormulaire,
  type RequalificationChatVsFormulaireTone,
} from "@/lib/marketing/requalification-chat-vs-formulaire-devis";

export function RequalificationChatVsFormulaireDevisCalculator() {
  const [demandes, setDemandes] = useState<number>(REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS.demandes);
  const [pctChat, setPctChat] = useState<number>(REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS.pctChat);
  const [reqChat, setReqChat] = useState<number>(REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS.reqChat);
  const [reqForm, setReqForm] = useState<number>(REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS.reqForm);
  const [minutes, setMinutes] = useState<number>(REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS.minutes);
  const [taux, setTaux] = useState<number>(REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS.taux);
  const [draft, setDraft] = useState<string | null>(null);

  const result = useMemo(
    () =>
      computeRequalificationChatVsFormulaire({
        demandes,
        pctChat,
        reqChat,
        reqForm,
        minutes,
        taux,
      }),
    [demandes, pctChat, reqChat, reqForm, minutes, taux],
  );
  const recap = draft ?? result.recap;

  function reset() {
    setDraft(null);
    setDemandes(REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS.demandes);
    setPctChat(REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS.pctChat);
    setReqChat(REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS.reqChat);
    setReqForm(REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS.reqForm);
    setMinutes(REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS.minutes);
    setTaux(REQUALIFICATION_CHAT_VS_FORMULAIRE_DEFAULTS.taux);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et canaux</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.demandes}
              hint="Tous canaux du funnel confondus."
              value={demandes}
              min={0}
              max={100000}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setDemandes(value);
              }}
            />
            <NumberField
              label={REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.pctChat}
              hint="Funnel Chat IA ou module de discussion. Le reste passe par le formulaire."
              value={pctChat}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPctChat(value);
              }}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Requalification</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.reqChat}
              hint="Votre constat : surface absente ou en texte, clé attendue vide, besoin trop court."
              value={reqChat}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setReqChat(value);
              }}
            />
            <NumberField
              label={REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.reqForm}
              hint="Même définition, sur les dossiers du formulaire par étapes."
              value={reqForm}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setReqForm(value);
              }}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.minutes}
              hint="Relire, rappeler ou écrire, mettre à jour le dossier."
              value={minutes}
              min={0}
              max={24 * 60}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setMinutes(value);
              }}
            />
            <NumberField
              label={REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.taux}
              hint="Commercial ou chargé d'affaires."
              value={taux}
              min={0}
              max={10000}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setTaux(value);
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
        <p className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${toneClass(result.totalTone)}`}>
          {result.totalLabel}
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">{REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.total}</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label={REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.dossiers} value={result.dossiersLabel} />
          <Row label={REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.req} value={result.reqLabel} />
          <Row label={REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.heures} value={result.heuresLabel} />
          <Row label={REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.cout} value={result.coutLabel} />
          <Row label={REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.an} value={result.anLabel} tone={result.totalTone} />
          <Row
            label={REQUALIFICATION_CHAT_VS_FORMULAIRE_LABELS.ecart}
            value={result.ecartLabel}
            tone={result.ecartTone}
          />
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif pour une discussion d&apos;équipe, pas une prévision ni un conseil financier.
          Aucune donnée n&apos;est envoyée. Aucun chiffre de référence n&apos;est inventé : toutes les
          valeurs sont les vôtres. Le score Hot / Warm / Cold suit la même formule fixe quel que soit
          le canal. Pour une même clé, la réponse de formulaire prime sur la valeur extraite du chat,
          et la conversation n&apos;est pas reprise sur la fiche devis. Prix en fourchette indicative
          min-max, sans TVA.
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

function toneClass(tone: RequalificationChatVsFormulaireTone) {
  if (tone === "ok") return "text-emerald-300";
  if (tone === "warn") return "text-amber-200";
  if (tone === "bad") return "text-rose-300";
  return "text-mk-on-dark";
}

function alertClass(tone: RequalificationChatVsFormulaireTone) {
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
  tone?: RequalificationChatVsFormulaireTone;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${rowClass(tone)}`}>{value}</dd>
    </div>
  );
}

function rowClass(tone?: RequalificationChatVsFormulaireTone) {
  if (tone === "ok") return "font-semibold text-emerald-300";
  if (tone === "warn") return "font-semibold text-amber-200";
  if (tone === "bad") return "font-semibold text-rose-300";
  return "font-medium";
}
