"use client";

import { useRef, useState, useTransition } from "react";
import { importProductRows, type CsvImportState } from "@/app/(app)/produits/actions";
import { GaugeBar } from "@/components/ui/gauge";
import { CSV_TEMPLATE, inspectProductCsv, type CsvInspection } from "@/lib/catalog/csv";

type Funnel = { id: string; name: string };
type Step = "file" | "review" | "run" | "done";

export function ImportProductsDialog({ funnels }: { funnels: Funnel[] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("file");
  const [fileName, setFileName] = useState("");
  const [inspection, setInspection] = useState<CsvInspection | null>(null);
  const [funnelId, setFunnelId] = useState(funnels[0]?.id ?? "");
  const [result, setResult] = useState<CsvImportState | null>(null);
  const [progress, setProgress] = useState(0);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("file");
    setFileName("");
    setInspection(null);
    setResult(null);
    setProgress(0);
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setProgress(0.2);
    file.text().then((text) => {
      const inspected = inspectProductCsv(text);
      setInspection(inspected);
      setProgress(0.45);
      setStep("review");
    });
  }

  function runImport() {
    if (!inspection?.rows.length) return;
    setStep("run");
    setProgress(0.55);
    start(async () => {
      const imported = await importProductRows(funnelId, inspection.rows);
      setResult(imported);
      setProgress(1);
      setStep("done");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        Importer
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/40" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-csv-title"
            className="relative z-10 flex max-h-[min(40rem,calc(100dvh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">
                Import CSV · {step === "file" ? "1" : step === "review" ? "2" : "3"} / 3
              </p>
              <h2 id="import-csv-title" className="mt-1 text-lg font-semibold text-slate-900">
                {step === "file"
                  ? "Votre fichier catalogue"
                  : step === "review"
                    ? "Contrôle du fichier"
                    : step === "run"
                      ? "Import en cours"
                      : "Import terminé"}
              </h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {step === "file" ? (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      onFile(event.dataTransfer.files[0]);
                    }}
                    className="flex w-full flex-col items-center rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center hover:border-[#E85D04] hover:bg-orange-50/50"
                  >
                    <span className="text-sm font-medium text-slate-900">Déposez un CSV ou cliquez pour le choisir</span>
                    <span className="mt-1 text-xs text-slate-500">Colonnes : nom, sku, catégorie, prix min/max, tags, description</span>
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(event) => onFile(event.target.files?.[0])}
                  />
                  <label className="block text-sm">
                    <span className="font-medium text-slate-900">Funnel qui reçoit les produits</span>
                    <select
                      value={funnelId}
                      onChange={(event) => setFunnelId(event.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    >
                      {funnels.map((funnel) => (
                        <option key={funnel.id} value={funnel.id}>
                          {funnel.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <a
                    href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`}
                    download="modele-catalogue.csv"
                    className="inline-block text-sm font-medium text-[#C2410C] underline"
                  >
                    Télécharger un modèle CSV
                  </a>
                </div>
              ) : null}

              {step === "review" && inspection ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-900">{fileName}</span>
                    {" · "}
                    {inspection.rows.length} produit{inspection.rows.length > 1 ? "s" : ""} prêt
                    {inspection.rows.length > 1 ? "s" : ""}
                    {inspection.skipped ? ` · ${inspection.skipped} ligne${inspection.skipped > 1 ? "s" : ""} ignorée${inspection.skipped > 1 ? "s" : ""}` : ""}
                  </p>
                  {inspection.missingNameColumn ? (
                    <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      Colonne nom introuvable. Renommez-la en <span className="font-medium">name</span> ou{" "}
                      <span className="font-medium">nom</span>.
                    </p>
                  ) : (
                    <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                      Fichier reconnu. Un SKU déjà présent met à jour la fiche, les autres sont créés.
                    </p>
                  )}
                  {inspection.unknownHeaders.length ? (
                    <p className="text-xs text-slate-500">
                      Colonnes ignorées : {inspection.unknownHeaders.join(", ")}
                    </p>
                  ) : null}
                  {inspection.issues.slice(0, 6).map((issue) => (
                    <p key={`${issue.line}-${issue.message}`} className="text-xs text-amber-800">
                      Ligne {issue.line} · {issue.message}
                    </p>
                  ))}
                  {inspection.rows[0] ? (
                    <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      Aperçu : {inspection.rows[0].name}
                      {inspection.rows[0].sku ? ` · SKU ${inspection.rows[0].sku}` : ""}
                      {inspection.rows[0].category ? ` · ${inspection.rows[0].category}` : ""}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === "run" || step === "done" ? (
                <div className="space-y-3">
                  <GaugeBar pct={pending && step === "run" ? 0.7 : progress} />
                  {step === "run" ? (
                    <p className="text-sm text-slate-600">Écriture dans le catalogue…</p>
                  ) : result?.error ? (
                    <p className="text-sm text-rose-700">{result.error}</p>
                  ) : (
                    <p className="text-sm text-slate-700">
                      {result?.created ?? 0} créé{(result?.created ?? 0) > 1 ? "s" : ""} · {result?.updated ?? 0} mis à
                      jour
                      {(result?.skipped ?? 0) ? ` · ${result?.skipped} ignoré${(result?.skipped ?? 0) > 1 ? "s" : ""}` : ""}
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500 hover:text-slate-900">
                {step === "done" ? "Fermer" : "Annuler"}
              </button>
              <div className="flex gap-2">
                {step === "review" ? (
                  <button
                    type="button"
                    onClick={() => setStep("file")}
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
                  >
                    Retour
                  </button>
                ) : null}
                {step === "file" ? null : step === "review" ? (
                  <button
                    type="button"
                    disabled={!inspection?.ok}
                    onClick={runImport}
                    className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-50"
                  >
                    Importer {inspection?.rows.length ?? 0} produit{(inspection?.rows.length ?? 0) > 1 ? "s" : ""}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
