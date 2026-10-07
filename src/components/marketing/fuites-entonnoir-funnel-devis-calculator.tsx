"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  FUITES_ENTONNOIR_DEFAULTS,
  FUITES_ENTONNOIR_HINTS,
  FUITES_ENTONNOIR_TRANSITIONS,
  computeFuitesEntonnoir,
  type FuitesEntonnoirTone,
} from "@/lib/marketing/fuites-entonnoir-funnel-devis";

const COUNT_FIELDS = [
  { key: "visiteurs", label: "Visiteurs", hint: FUITES_ENTONNOIR_HINTS.visiteurs },
  { key: "commences", label: "Commencé", hint: FUITES_ENTONNOIR_HINTS.commences },
  { key: "emails", label: "Email", hint: FUITES_ENTONNOIR_HINTS.emails },
  { key: "completes", label: "Complété", hint: FUITES_ENTONNOIR_HINTS.completes },
  { key: "devis", label: "Devis", hint: FUITES_ENTONNOIR_HINTS.devis },
  { key: "rappeles", label: "Rappelé", hint: FUITES_ENTONNOIR_HINTS.rappeles },
  { key: "gagnes", label: "Gagné", hint: FUITES_ENTONNOIR_HINTS.gagnes },
] as const;

type CountKey = (typeof COUNT_FIELDS)[number]["key"];

export function FuitesEntonnoirFunnelDevisCalculator() {
  const [counts, setCounts] = useState<Record<CountKey, number>>({
    visiteurs: FUITES_ENTONNOIR_DEFAULTS.visiteurs,
    commences: FUITES_ENTONNOIR_DEFAULTS.commences,
    emails: FUITES_ENTONNOIR_DEFAULTS.emails,
    completes: FUITES_ENTONNOIR_DEFAULTS.completes,
    devis: FUITES_ENTONNOIR_DEFAULTS.devis,
    rappeles: FUITES_ENTONNOIR_DEFAULTS.rappeles,
    gagnes: FUITES_ENTONNOIR_DEFAULTS.gagnes,
  });
  const [panier, setPanier] = useState<number>(FUITES_ENTONNOIR_DEFAULTS.panier);
  const [etape, setEtape] = useState<number>(FUITES_ENTONNOIR_DEFAULTS.etape);
  const [gainPoints, setGainPoints] = useState<number>(FUITES_ENTONNOIR_DEFAULTS.gainPoints);
  const [draft, setDraft] = useState<string | null>(null);

  const result = useMemo(
    () =>
      computeFuitesEntonnoir({
        ...counts,
        panier,
        etape,
        gainPoints,
      }),
    [counts, panier, etape, gainPoints],
  );
  const recap = draft ?? result.recap;

  function reset() {
    setDraft(null);
    setCounts({
      visiteurs: FUITES_ENTONNOIR_DEFAULTS.visiteurs,
      commences: FUITES_ENTONNOIR_DEFAULTS.commences,
      emails: FUITES_ENTONNOIR_DEFAULTS.emails,
      completes: FUITES_ENTONNOIR_DEFAULTS.completes,
      devis: FUITES_ENTONNOIR_DEFAULTS.devis,
      rappeles: FUITES_ENTONNOIR_DEFAULTS.rappeles,
      gagnes: FUITES_ENTONNOIR_DEFAULTS.gagnes,
    });
    setPanier(FUITES_ENTONNOIR_DEFAULTS.panier);
    setEtape(FUITES_ENTONNOIR_DEFAULTS.etape);
    setGainPoints(FUITES_ENTONNOIR_DEFAULTS.gainPoints);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Votre entonnoir sur une période</legend>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Dans QuoteBuilder, ces sept marches figurent dans le « Tunnel de conversion » du rapport PDF de la page
            Statistiques (bouton « Rapport PDF »), sur 24 h, 7 jours ou 30 jours.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {COUNT_FIELDS.map((field) => (
              <NumberField
                key={field.key}
                label={field.label}
                hint={field.hint}
                value={counts[field.key]}
                min={0}
                max={10000000}
                step={1}
                onChange={(value) => {
                  setDraft(null);
                  setCounts((current) => ({ ...current, [field.key]: value }));
                }}
              />
            ))}
            <NumberField
              label="Montant moyen d'une affaire gagnée (€)"
              hint={FUITES_ENTONNOIR_HINTS.panier}
              value={panier}
              min={0}
              max={100000000}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setPanier(value);
              }}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Hypothèse d&apos;amélioration</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold">Marche à améliorer</span>
              <select
                value={etape}
                onChange={(event) => {
                  setDraft(null);
                  setEtape(Number(event.target.value));
                }}
                className="mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40"
              >
                {FUITES_ENTONNOIR_TRANSITIONS.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[12px] leading-5 text-mk-faint">{FUITES_ENTONNOIR_HINTS.etape}</span>
            </label>
            <NumberField
              label="Gain testé (points de taux de passage)"
              hint={FUITES_ENTONNOIR_HINTS.gainPoints}
              value={gainPoints}
              min={0}
              max={100}
              step={1}
              onChange={(value) => {
                setDraft(null);
                setGainPoints(value);
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
        <table className="mt-4 w-full border-collapse text-sm tabular-nums">
          <thead>
            <tr className="text-left text-mk-on-dark/55">
              <th className="pb-2 font-semibold">Marche</th>
              <th className="pb-2 font-semibold">Passage</th>
              <th className="pb-2 text-right font-semibold">Perdus</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.label} className={row.weak ? "bg-amber-400/15" : undefined}>
                <td className="border-t border-white/10 py-2 pr-2">{row.label}</td>
                <td className="border-t border-white/10 py-2 pr-2">{row.passLabel}</td>
                <td className="border-t border-white/10 py-2 text-right">{row.lostLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="Demandes envoyées / visiteurs" value={result.conversionLabel} />
          <Row label="Affaires gagnées / visiteurs" value={result.globalLabel} />
          <Row label="Marche la plus faible (taux de passage)" value={result.weakLabel} />
          <Row label="Marche qui perd le plus de monde" value={result.lossLabel} />
          <Row label="Chiffre d'affaires de la période (gagnés × montant moyen)" value={result.caLabel} />
          <Row label="Effet de l'hypothèse sur la période" value={result.gainLabel} tone={result.gainTone} />
          <Row label="Rapporté à 12 périodes (indicatif)" value={result.gainAnLabel} />
        </dl>

        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Calcul indicatif pour une discussion d&apos;équipe, pas une prévision ni un conseil financier. Aucune donnée
          n&apos;est envoyée. Aucun chiffre de référence n&apos;est inventé : toutes les valeurs sont les vôtres.
          L&apos;hypothèse suppose que les marches suivantes gardent leur taux, ce qui n&apos;est pas garanti : plus de
          parcours commencés peut aussi faire entrer des demandes moins qualifiées. Une marche saisie au-dessus de la
          précédente est ramenée à la valeur précédente. Côté QuoteBuilder : « Rappelé » ne compte pas les demandes
          passées directement Perdu, et le chiffre d&apos;affaires de la page Statistiques est une estimation à partir
          des prix du catalogue, pas un montant signé.
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

function alertClass(tone: FuitesEntonnoirTone) {
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
  tone?: FuitesEntonnoirTone;
}) {
  const toneClass =
    tone === "ok" ? "font-semibold text-emerald-300" : tone === "warn" ? "font-semibold text-amber-200" : "font-medium";
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${toneClass}`}>{value}</dd>
    </div>
  );
}
