"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  COLUMN_ACCEPTED,
  CSV_TEMPLATE,
  EXEMPLE_EXCEL_FR,
  FINDING_LEVELS,
  IMPORT_KEYS,
  KEY_LABELS,
  checkCatalogCsv,
  convertToComma,
  type CatalogVerdictTone,
  type FindingLevel,
} from "@/lib/marketing/verificateur-csv-catalogue-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

export function VerificateurCsvCatalogueDevisCalculator() {
  const [csv, setCsv] = useState(EXEMPLE_EXCEL_FR);
  const result = useMemo(() => checkCatalogCsv(csv), [csv]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setCsv(await file.text());
  }

  function download() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "catalogue-quotebuilder.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const showConvert = !result.empty && result.delimiter !== ",";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-sm font-semibold">Votre fichier</h2>
        <label className="mt-4 block" htmlFor="csv-file">
          <span className="text-sm font-semibold">Choisir un fichier CSV</span>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv,text/plain"
            className="mt-2 block w-full text-sm text-mk-muted"
            onChange={(event) => {
              void onFile(event.target.files?.[0]);
            }}
          />
          <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
            Le fichier est lu par votre navigateur. Rien n&apos;est envoyé.
          </span>
        </label>
        <label className="mt-4 block" htmlFor="csv">
          <span className="text-sm font-semibold">Ou collez son contenu</span>
          <textarea
            id="csv"
            spellCheck={false}
            value={csv}
            onChange={(event) => setCsv(event.target.value)}
            className={`${fieldClass} min-h-72 font-mono text-[13px] leading-5`}
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setCsv(EXEMPLE_EXCEL_FR)} className={buttonClass}>
            Charger l&apos;exemple Excel
          </button>
          <button type="button" onClick={() => setCsv(CSV_TEMPLATE)} className={buttonClass}>
            Charger le modèle QuoteBuilder
          </button>
          {showConvert ? (
            <button type="button" onClick={() => setCsv(convertToComma(csv))} className={buttonClass}>
              Convertir en virgules
            </button>
          ) : null}
          <button type="button" onClick={download} className={buttonClass}>
            Télécharger ce CSV
          </button>
        </div>
        <p className="mt-3 text-[12px] leading-5 text-mk-faint">
          L&apos;exemple Excel est un faux tarif de location de matériel enregistré avec le point-virgule, tel
          qu&apos;Excel le fait souvent en français.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-sm font-semibold">Lecture du fichier</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Metric label="Séparateur détecté" value={result.empty ? "n/a" : result.delimiterLabel} />
          <Metric label="Lignes sous l'en-tête" value={String(result.stats.lignes)} />
          <Metric
            label="Produits prêts à importer"
            value={String(result.stats.prets)}
            tone={result.empty ? undefined : result.stats.prets ? "ok" : "bad"}
          />
          <Metric
            label="Lignes ignorées"
            value={String(result.stats.ignores)}
            tone={result.stats.ignores ? "warn" : undefined}
          />
          <Metric
            label="SKU : avec, sans, en double"
            value={`${result.stats.avecSku} · ${result.stats.sansSku} · ${result.stats.doublonsSku.length}`}
          />
          <Metric
            label="Prix : fixes, fourchettes, une seule borne, sur devis"
            value={`${result.stats.prixFixe} · ${result.stats.fourchette} · ${result.stats.unSeulPrix} · ${result.stats.surDevis}`}
          />
        </dl>
        <p className={`mt-6 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.verdict.tone)}`}>
          {result.verdict.text}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-sm font-semibold">Colonnes</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="text-mk-muted">
                <th className="py-2 pr-3 font-semibold">Champ QuoteBuilder</th>
                <th className="py-2 pr-3 font-semibold">Noms acceptés</th>
                <th className="py-2 font-semibold">Dans votre fichier</th>
              </tr>
            </thead>
            <tbody>
              {IMPORT_KEYS.map((key) => {
                const found = result.inspection.mapped[key];
                return (
                  <tr key={key} className="border-t border-mk-border align-top">
                    <td className="py-2 pr-3">{KEY_LABELS[key]}</td>
                    <td className="py-2 pr-3">{COLUMN_ACCEPTED[key]}</td>
                    <td className={`py-2 ${found ? "" : "text-mk-muted"}`}>{found ? `« ${found} »` : "absente"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] leading-5 text-mk-faint">
          Les en-têtes sont comparés sans majuscules, sans accents, espaces et tirets remplacés par un tiret bas :
          « Prix min » vaut prix_min, « Catégorie » vaut categorie.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-sm font-semibold">Points relevés</h2>
        <div className="mt-4 space-y-2">
          {result.findings.length === 0 ? (
            <p className="text-[13px] leading-5 text-mk-faint">
              {result.empty ? "Rien à vérifier pour l'instant." : "Aucun point relevé."}
            </p>
          ) : (
            result.findings.map((finding) => (
              <p key={`${finding.code}-${finding.text}`} className={`rounded-xl px-3 py-2 text-sm ${findingClass(finding.level)}`}>
                <b className="mr-2 inline-block min-w-28">{FINDING_LEVELS[finding.level]}</b>
                {finding.text}
              </p>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-sm font-semibold">Aperçu des 5 premiers produits</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm tabular-nums">
            <thead>
              <tr className="text-mk-muted">
                <th className="py-2 pr-3 font-semibold">Ligne</th>
                <th className="py-2 pr-3 font-semibold">Nom</th>
                <th className="py-2 pr-3 font-semibold">SKU</th>
                <th className="py-2 pr-3 font-semibold">Catégorie</th>
                <th className="py-2 font-semibold">Prix affiché</th>
              </tr>
            </thead>
            <tbody>
              {result.apercu.map((row) => (
                <tr key={`${row.ligne}-${row.nom}`} className="border-t border-mk-border align-top">
                  <td className="py-2 pr-3">{row.ligne}</td>
                  <td className="py-2 pr-3">{row.nom}</td>
                  <td className="py-2 pr-3">{row.sku || "sans"}</td>
                  <td className="py-2 pr-3">{row.categorie || "Autres"}</td>
                  <td className="py-2">{row.prix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] leading-5 text-mk-faint">
          « Prix affiché » reprend la façon dont QuoteBuilder écrit le prix dans le funnel, le PDF et l&apos;espace
          prospect : sans centimes dès 1 €, « Sur devis » sans prix.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-sm font-semibold">Signalements de l&apos;import</h2>
        <div className="mt-4 space-y-1 text-[13px] leading-5 text-mk-muted">
          {result.empty ? null : result.inspection.issues.length === 0 ? (
            <p>Aucun signalement.</p>
          ) : (
            result.inspection.issues.map((issue) => (
              <p key={`${issue.line}-${issue.message}`}>
                Ligne {issue.line} · {issue.message}
              </p>
            ))
          )}
        </div>
        <p className="mt-3 text-[12px] leading-5 text-mk-faint">
          Mêmes messages que la fenêtre d&apos;import. Les numéros de ligne comptent seulement les lignes non vides,
          en-tête compris.
        </p>
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

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-sm font-semibold">Ce que l&apos;outil ne vérifie pas</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-muted">
          <li>
            Si un SKU existe déjà dans votre funnel : il ne voit pas votre catalogue. C&apos;est pourtant ce qui décide
            entre création et mise à jour.
          </li>
          <li>
            Les photos, options, variantes et caractéristiques : le CSV ne les importe pas, elles se règlent sur la
            fiche produit.
          </li>
          <li>
            La justesse de vos prix et le choix HT ou TTC : le fichier n&apos;a pas de colonne TVA, le montant est pris
            tel quel.
          </li>
        </ul>
      </section>
    </div>
  );
}

const buttonClass =
  "rounded-full bg-white px-3 py-2 text-sm font-semibold text-mk-ink ring-1 ring-mk-border hover:bg-mk-band";

function Metric({ label, value, tone }: { label: string; value: string; tone?: "ok" | "bad" | "warn" }) {
  const toneClass =
    tone === "bad" ? "text-rose-700" : tone === "ok" ? "text-emerald-700" : tone === "warn" ? "text-amber-800" : "text-mk-accent";
  return (
    <div className="flex items-start justify-between gap-4 border-t border-mk-border pt-3 first:border-t-0 first:pt-0">
      <dt className="text-mk-muted">{label}</dt>
      <dd className={`text-right text-base font-semibold tabular-nums ${toneClass}`}>{value}</dd>
    </div>
  );
}

function alertClass(tone: CatalogVerdictTone) {
  if (tone === "ok") return "bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "bg-amber-50 text-amber-900";
  if (tone === "bad") return "bg-rose-50 text-rose-800";
  return "bg-mk-band text-mk-ink";
}

function findingClass(level: FindingLevel) {
  if (level === "bloquant") return "bg-rose-50 text-rose-800";
  if (level === "a_corriger") return "bg-amber-50 text-amber-900";
  return "bg-mk-band text-mk-ink";
}
