"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { computeCoutDevisExpires } from "@/lib/marketing/cout-devis-expires";

function money(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function qty(value: number, digits = 1) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function CoutDevisExpiresCalculator() {
  const [ouverts, setOuverts] = useState(40);
  const [pctExpirent, setPctExpirent] = useState(25);
  const [panier, setPanier] = useState(4500);
  const [coutChiffrage, setCoutChiffrage] = useState(120);
  const [heuresChiffrage, setHeuresChiffrage] = useState(2.5);
  const [tauxReprise, setTauxReprise] = useState(15);
  const [coutRechiffrage, setCoutRechiffrage] = useState(80);
  const [pctSauves, setPctSauves] = useState(35);

  const result = useMemo(
    () =>
      computeCoutDevisExpires({
        ouverts,
        pctExpirent,
        panier,
        coutChiffrage,
        heuresChiffrage,
        tauxReprise,
        coutRechiffrage,
        pctSauves,
      }),
    [ouverts, pctExpirent, panier, coutChiffrage, heuresChiffrage, tauxReprise, coutRechiffrage, pctSauves],
  );

  const summary = `${qty(result.nbExpires)} devis expirés · ${money(result.caPerdu)} CA potentiel · ${qty(result.heuresPerdues)} h · ${money(result.cout1)} 1re passe · ${qty(result.nbReprises)} reprises · ${money(result.coutRechiffrageTotal)} re-chiffrage · +${money(result.gainCa)} CA évitable · +${money(result.gainCout)} coûts évités / mois`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Volume et panier</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Nombre de devis ouverts / mois"
              value={ouverts}
              min={0}
              max={10000}
              step={1}
              onChange={setOuverts}
            />
            <NumberField
              label="% qui expirent sans décision"
              value={pctExpirent}
              min={0}
              max={100}
              step={0.1}
              onChange={setPctExpirent}
            />
            <NumberField
              label="Panier moyen HT d’un devis (€)"
              value={panier}
              min={0}
              max={500000}
              step={50}
              onChange={setPanier}
            />
            <NumberField
              label="Coût moyen d’un chiffrage (€)"
              value={coutChiffrage}
              min={0}
              max={10000}
              step={1}
              onChange={setCoutChiffrage}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Le coût de chiffrage = temps estimateur × coût horaire chargé (ou forfait interne). Prenez
            un mois représentatif.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Reprise et scénario « avant expiration »</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Heures moyennes par chiffrage"
              value={heuresChiffrage}
              min={0}
              max={200}
              step={0.1}
              onChange={setHeuresChiffrage}
            />
            <NumberField
              label="Taux de reprise après expiration (%)"
              value={tauxReprise}
              min={0}
              max={100}
              step={0.1}
              onChange={setTauxReprise}
            />
            <NumberField
              label="Coût moyen d’un re-chiffrage (€)"
              value={coutRechiffrage}
              min={0}
              max={10000}
              step={1}
              onChange={setCoutRechiffrage}
            />
            <NumberField
              label="% d’expirations évitées si relance / prolongation J-5"
              value={pctSauves}
              min={0}
              max={100}
              step={0.1}
              onChange={setPctSauves}
            />
          </div>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Le taux de reprise = part des devis expirés qui reviennent plus tard (souvent avec un
            nouveau chiffrage). Le % évité simule une séquence relance avant date de fin.
          </p>
        </fieldset>
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">
          Résultat mensuel estimé
        </p>
        <p
          className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${
            result.caPerdu > 0 ? "text-rose-300" : "text-emerald-300"
          }`}
        >
          {money(result.caPerdu)}
        </p>
        <p className="mt-2 text-sm text-mk-on-dark/60">CA HT potentiel lié aux expirés / mois</p>

        <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
          <Row label="Devis qui expirent / mois" value={`${qty(result.nbExpires)} devis`} />
          <Row
            label="Heures de chiffrage « perdues » (1re passe)"
            value={`${qty(result.heuresPerdues)} h`}
            tone={result.heuresPerdues > 0 ? "bad" : "ok"}
          />
          <Row
            label="Coût de la 1re passe sur ces devis"
            value={money(result.cout1)}
            tone={result.cout1 > 0 ? "bad" : "ok"}
          />
          <Row label="Reprises après expiration (nb)" value={qty(result.nbReprises)} />
          <Row
            label="Coût de re-chiffrage estimé"
            value={money(result.coutRechiffrageTotal)}
            tone={result.coutRechiffrageTotal > 0 ? "bad" : "ok"}
          />
          <Row
            label="Gain si on évite X % d’expirations (CA potentiel)"
            value={`+${money(result.gainCa)}`}
            tone={result.gainCa > 0 ? "ok" : undefined}
          />
          <Row
            label="Coûts évités (1re passe non gâchée + moins de re-chiffrage)"
            value={`+${money(result.gainCout)}`}
            tone={result.gainCout > 0 ? "ok" : undefined}
          />
        </dl>

        <p className="mt-6 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-mk-on-dark/45">
            Ordre de grandeur pour décider, pas une promesse de résultat. Le « CA potentiel » n’est
            pas du CA garanti. Calcul local.
          </p>
          <CopyButton text={summary} label="Copier le résultat" />
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
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
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40"
      />
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
  tone?: "ok" | "bad";
}) {
  const color =
    tone === "ok" ? "font-semibold text-emerald-300" : tone === "bad" ? "font-semibold text-rose-300" : "font-medium";
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-mk-on-dark/55">{label}</dt>
      <dd className={`text-right tabular-nums ${color}`}>{value}</dd>
    </div>
  );
}
