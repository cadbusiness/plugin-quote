/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/calculateur-remise-volume-contrat-cadre";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"prixBase":"48","mode":"global","s1":"1000","r1":"3","s2":"2500","r2":"5","s3":"5000","r3":"8","s4":"0","r4":"0","volEngage":"5000","volRealise":"3800","remiseAppliquee":"8","rappel":"oui","penalite":"0","dateCalcul":"2026-10-29","dateDebut":"2026-01-01","dateFin":"2026-12-31"};

export function CalculateurRemiseVolumeContratCadreCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Le prix et les paliers"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Prix unitaire de base (€ HT par unité)"}</span>
            <input id={"prixBase"} type="number" className={fieldClass} min={"0"} step={"0.5"} value={String(values["prixBase"] ?? "")} onChange={(event) => setValue("prixBase", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le prix du bordereau avant remise : par palette, par heure, par pièce, par tonne."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Mode de calcul de la remise"}</span>
            <select id={"mode"} className={fieldClass} value={String(values["mode"] ?? "")} onChange={(event) => setValue("mode", event.target.value)}>
              <option value={"global"}>{"Global : le palier atteint s'applique à tout le volume"}</option>
              <option value={"tranche"}>{"Par tranche : chaque tranche garde son taux"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le contrat doit le dire. Le mode global crée un effet de seuil, le mode par tranche non."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Palier 1 : à partir de (unités)"}</span>
            <input id={"s1"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["s1"] ?? "")} onChange={(event) => setValue("s1", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Palier 1 : remise (%)"}</span>
            <input id={"r1"} type="number" className={fieldClass} min={"0"} max={"100"} step={"0.5"} value={String(values["r1"] ?? "")} onChange={(event) => setValue("r1", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Palier 2 : à partir de (unités)"}</span>
            <input id={"s2"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["s2"] ?? "")} onChange={(event) => setValue("s2", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Palier 2 : remise (%)"}</span>
            <input id={"r2"} type="number" className={fieldClass} min={"0"} max={"100"} step={"0.5"} value={String(values["r2"] ?? "")} onChange={(event) => setValue("r2", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Palier 3 : à partir de (unités)"}</span>
            <input id={"s3"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["s3"] ?? "")} onChange={(event) => setValue("s3", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Palier 3 : remise (%)"}</span>
            <input id={"r3"} type="number" className={fieldClass} min={"0"} max={"100"} step={"0.5"} value={String(values["r3"] ?? "")} onChange={(event) => setValue("r3", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Palier 4 : à partir de (unités)"}</span>
            <input id={"s4"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["s4"] ?? "")} onChange={(event) => setValue("s4", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 : palier non utilisé."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Palier 4 : remise (%)"}</span>
            <input id={"r4"} type="number" className={fieldClass} min={"0"} max={"100"} step={"0.5"} value={String(values["r4"] ?? "")} onChange={(event) => setValue("r4", event.target.value)} />
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les volumes et la facturation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Volume engagé ou annoncé sur la période (unités)"}</span>
            <input id={"volEngage"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["volEngage"] ?? "")} onChange={(event) => setValue("volEngage", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le volume écrit au contrat. 0 si le client ne s'est engagé sur rien."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Volume réalisé à la date du calcul (unités)"}</span>
            <input id={"volRealise"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["volRealise"] ?? "")} onChange={(event) => setValue("volRealise", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Les quantités livrées ou exécutées, bons de commande cumulés."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Remise appliquée sur les factures de la période (%)"}</span>
            <input id={"remiseAppliquee"} type="number" className={fieldClass} min={"0"} max={"100"} step={"0.5"} value={String(values["remiseAppliquee"] ?? "")} onChange={(event) => setValue("remiseAppliquee", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Souvent le taux du palier engagé, accordé d'avance sur chaque facture."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le contrat prévoit un rappel de prix si le palier n'est pas atteint"}</span>
            <select id={"rappel"} className={fieldClass} value={String(values["rappel"] ?? "")} onChange={(event) => setValue("rappel", event.target.value)}>
              <option value={"oui"}>{"Oui, une clause de rappel est écrite"}</option>
              <option value={"non"}>{"Non, rien n'est prévu"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sans clause, réclamer la différence après coup est difficile."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Pénalité sur le volume manquant (% du prix de base)"}</span>
            <input id={"penalite"} type="number" className={fieldClass} min={"0"} max={"100"} step={"0.5"} value={String(values["penalite"] ?? "")} onChange={(event) => setValue("penalite", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 : aucune pénalité. Une pénalité forfaitaire est une clause pénale que le juge peut réduire (article 1231-5 du Code civil)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date du calcul"}</span>
            <input id={"dateCalcul"} type="date" className={fieldClass} value={String(values["dateCalcul"] ?? "")} onChange={(event) => setValue("dateCalcul", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Début de la période"}</span>
            <input id={"dateDebut"} type="date" className={fieldClass} value={String(values["dateDebut"] ?? "")} onChange={(event) => setValue("dateDebut", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Fin de la période"}</span>
            <input id={"dateFin"} type="date" className={fieldClass} value={String(values["dateFin"] ?? "")} onChange={(event) => setValue("dateFin", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sert à projeter le volume de fin de période au rythme actuel."}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le bilan de la période"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Palier réellement atteint"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["palier"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Montant dû au palier atteint"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["montantDu"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Montant facturé avec la remise appliquée"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["montantFacture"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Rappel de prix ou avoir"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["ecart"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Pénalité sur le volume manquant"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["penaliteMontant"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Taux d'atteinte de l'engagement"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["atteinte"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Prix moyen effectif par unité"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["prixMoyen"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Volume projeté en fin de période (rythme actuel)"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["projection"]?.text || "n/a"}</dd>
          </div>
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.verdict?.className || "")}>{view.verdict?.text}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La grille, palier par palier"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Palier"}</th>
              <th className="py-2 pr-2 font-semibold">{"À partir de"}</th>
              <th className="py-2 pr-2 font-semibold">{"Remise"}</th>
              <th className="py-2 pr-2 font-semibold">{"Montant si le volume réalisé y tombait"}</th>
            </tr></thead>
            <tbody>
              {(view["grille"]?.rows || []).map((row, index) => (
                <tr key={index} className={rowClass(row.className)}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-t border-mk-border py-2 pr-2 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody></table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"En mode global, le montant d'un palier est calculé sur le volume réalisé ou sur son seuil, le plus élevé des deux. En mode par tranche, chaque tranche garde son taux : passer un seuil ne change pas le prix des unités déjà comptées."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Pour lire vos chiffres"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["conseils"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Récapitulatif"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view["recap"]?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view["recap"]?.text || ""} />
        </div>
      </section>
    </div>
  );
}

function alertClass(className) {
  if (className.includes("ok")) return "bg-emerald-50 font-semibold text-emerald-800";
  if (className.includes("bad")) return "bg-rose-50 font-semibold text-rose-800";
  if (className.includes("warn")) return "bg-amber-50 font-semibold text-amber-900";
  return "bg-mk-band font-medium text-mk-ink";
}

function rowClass(className) {
  if (className === "weak" || className === "warn") return "bg-amber-50";
  if (className === "cur" || className === "bad") return "bg-rose-50";
  if (className === "ok") return "bg-emerald-50";
  return "";
}
