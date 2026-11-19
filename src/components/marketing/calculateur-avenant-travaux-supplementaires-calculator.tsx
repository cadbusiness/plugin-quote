/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/calculateur-avenant-travaux-supplementaires";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"typeMarche":"forfait","ref":"D-2026-118","montantInitial":"48000","seuilSignal":"20","l1":"Renfort de dalle sous rayonnage","m1":"3200","a1":"ecritPrix","e1":"fait","l2":"Six prises supplémentaires au bureau","m2":"1450","a2":"oral","e2":"fait","l3":"Cloison vitrée supplémentaire","m3":"6800","a3":"ecritSansPrix","e3":"afaire","l4":"Reprise d'enduit découverte au démontage","m4":"2100","a4":"aucun","e4":"fait","l5":"","m5":"0","a5":"ecritPrix","e5":"afaire"};

export function CalculateurAvenantTravauxSupplementairesCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Le marché de départ"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Type de prix du devis initial"}</span>
            <select id={"typeMarche"} className={fieldClass} value={String(values["typeMarche"] ?? "")} onChange={(event) => setValue("typeMarche", event.target.value)}>
              <option value={"forfait"}>{"Forfait de construction d'un bâtiment (article 1793 du Code civil)"}</option>
              <option value={"forfaitAutre"}>{"Prix global hors construction de bâtiment (rénovation, aménagement, équipement)"}</option>
              <option value={"unitaires"}>{"Prix unitaires, métré ou régie"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"L'article 1793 vise la construction à forfait d'un bâtiment d'après un plan arrêté. Hors de ce cadre, c'est le contrat et la preuve de la commande qui comptent."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Référence du devis initial"}</span>
            <input id={"ref"} type="text" className={fieldClass} value={String(values["ref"] ?? "")} onChange={(event) => setValue("ref", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant du devis initial (€ HT)"}</span>
            <input id={"montantInitial"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["montantInitial"] ?? "")} onChange={(event) => setValue("montantInitial", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Seuil d'alerte interne sur l'écart (%)"}</span>
            <input id={"seuilSignal"} type="number" className={fieldClass} min={"0"} max={"1000"} step={"1"} value={String(values["seuilSignal"] ?? "")} onChange={(event) => setValue("seuilSignal", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Votre règle maison, pas un seuil légal : aucun texte ne fixe de pourcentage pour le marché privé."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les travaux supplémentaires"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Ligne 1 : travaux"}</span>
            <input id={"l1"} type="text" className={fieldClass} value={String(values["l1"] ?? "")} onChange={(event) => setValue("l1", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 1 : montant (€ HT)"}</span>
            <input id={"m1"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["m1"] ?? "")} onChange={(event) => setValue("m1", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 1 : accord du client"}</span>
            <select id={"a1"} className={fieldClass} value={String(values["a1"] ?? "")} onChange={(event) => setValue("a1", event.target.value)}>
              <option value={"ecritPrix"}>{"Accord écrit avec le prix, avant les travaux"}</option>
              <option value={"apres"}>{"Accepté par écrit, de façon expresse, après exécution"}</option>
              <option value={"ecritSansPrix"}>{"Accord écrit, mais sans prix"}</option>
              <option value={"oral"}>{"Accord oral seulement"}</option>
              <option value={"aucun"}>{"Aucun accord du client"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 1 : état"}</span>
            <select id={"e1"} className={fieldClass} value={String(values["e1"] ?? "")} onChange={(event) => setValue("e1", event.target.value)}>
              <option value={"fait"}>{"Déjà réalisés"}</option>
              <option value={"afaire"}>{"Pas encore commencés"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 2 : travaux"}</span>
            <input id={"l2"} type="text" className={fieldClass} value={String(values["l2"] ?? "")} onChange={(event) => setValue("l2", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 2 : montant (€ HT)"}</span>
            <input id={"m2"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["m2"] ?? "")} onChange={(event) => setValue("m2", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 2 : accord du client"}</span>
            <select id={"a2"} className={fieldClass} value={String(values["a2"] ?? "")} onChange={(event) => setValue("a2", event.target.value)}>
              <option value={"ecritPrix"}>{"Accord écrit avec le prix, avant les travaux"}</option>
              <option value={"apres"}>{"Accepté par écrit, de façon expresse, après exécution"}</option>
              <option value={"ecritSansPrix"}>{"Accord écrit, mais sans prix"}</option>
              <option value={"oral"}>{"Accord oral seulement"}</option>
              <option value={"aucun"}>{"Aucun accord du client"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 2 : état"}</span>
            <select id={"e2"} className={fieldClass} value={String(values["e2"] ?? "")} onChange={(event) => setValue("e2", event.target.value)}>
              <option value={"fait"}>{"Déjà réalisés"}</option>
              <option value={"afaire"}>{"Pas encore commencés"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 3 : travaux"}</span>
            <input id={"l3"} type="text" className={fieldClass} value={String(values["l3"] ?? "")} onChange={(event) => setValue("l3", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 3 : montant (€ HT)"}</span>
            <input id={"m3"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["m3"] ?? "")} onChange={(event) => setValue("m3", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 3 : accord du client"}</span>
            <select id={"a3"} className={fieldClass} value={String(values["a3"] ?? "")} onChange={(event) => setValue("a3", event.target.value)}>
              <option value={"ecritPrix"}>{"Accord écrit avec le prix, avant les travaux"}</option>
              <option value={"apres"}>{"Accepté par écrit, de façon expresse, après exécution"}</option>
              <option value={"ecritSansPrix"}>{"Accord écrit, mais sans prix"}</option>
              <option value={"oral"}>{"Accord oral seulement"}</option>
              <option value={"aucun"}>{"Aucun accord du client"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 3 : état"}</span>
            <select id={"e3"} className={fieldClass} value={String(values["e3"] ?? "")} onChange={(event) => setValue("e3", event.target.value)}>
              <option value={"fait"}>{"Déjà réalisés"}</option>
              <option value={"afaire"}>{"Pas encore commencés"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 4 : travaux"}</span>
            <input id={"l4"} type="text" className={fieldClass} value={String(values["l4"] ?? "")} onChange={(event) => setValue("l4", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 4 : montant (€ HT)"}</span>
            <input id={"m4"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["m4"] ?? "")} onChange={(event) => setValue("m4", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 4 : accord du client"}</span>
            <select id={"a4"} className={fieldClass} value={String(values["a4"] ?? "")} onChange={(event) => setValue("a4", event.target.value)}>
              <option value={"ecritPrix"}>{"Accord écrit avec le prix, avant les travaux"}</option>
              <option value={"apres"}>{"Accepté par écrit, de façon expresse, après exécution"}</option>
              <option value={"ecritSansPrix"}>{"Accord écrit, mais sans prix"}</option>
              <option value={"oral"}>{"Accord oral seulement"}</option>
              <option value={"aucun"}>{"Aucun accord du client"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 4 : état"}</span>
            <select id={"e4"} className={fieldClass} value={String(values["e4"] ?? "")} onChange={(event) => setValue("e4", event.target.value)}>
              <option value={"fait"}>{"Déjà réalisés"}</option>
              <option value={"afaire"}>{"Pas encore commencés"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 5 : travaux"}</span>
            <input id={"l5"} type="text" className={fieldClass} value={String(values["l5"] ?? "")} onChange={(event) => setValue("l5", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 5 : montant (€ HT)"}</span>
            <input id={"m5"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["m5"] ?? "")} onChange={(event) => setValue("m5", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 5 : accord du client"}</span>
            <select id={"a5"} className={fieldClass} value={String(values["a5"] ?? "")} onChange={(event) => setValue("a5", event.target.value)}>
              <option value={"ecritPrix"}>{"Accord écrit avec le prix, avant les travaux"}</option>
              <option value={"apres"}>{"Accepté par écrit, de façon expresse, après exécution"}</option>
              <option value={"ecritSansPrix"}>{"Accord écrit, mais sans prix"}</option>
              <option value={"oral"}>{"Accord oral seulement"}</option>
              <option value={"aucun"}>{"Aucun accord du client"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ligne 5 : état"}</span>
            <select id={"e5"} className={fieldClass} value={String(values["e5"] ?? "")} onChange={(event) => setValue("e5", event.target.value)}>
              <option value={"fait"}>{"Déjà réalisés"}</option>
              <option value={"afaire"}>{"Pas encore commencés"}</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Une ligne sans libellé et à 0 € est ignorée. « Accepté après exécution » veut dire une acceptation écrite, expresse et sans ambiguïté, donnée une fois les travaux faits. Le silence ou l'absence de protestation ne compte pas."}</p>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le bilan"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Total des travaux supplémentaires"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["totalSupp"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Sécurisé (accord écrit et prix, ou acceptation expresse)"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["totalOk"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"À régulariser (avant de commencer ou avant de facturer)"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["totalWarn"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"À risque (travaux faits sans accord exploitable)"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["totalBad"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Montant du marché si tout est accepté"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["nouveau"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Montant sécurisé aujourd'hui"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["securise"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Écart par rapport au devis initial"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["ecart"]?.text || "n/a"}</dd>
          </div>
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.verdict?.className || "")}>{view.verdict?.text}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Ligne par ligne"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Travaux"}</th>
              <th className="py-2 pr-2 font-semibold">{"Montant"}</th>
              <th className="py-2 pr-2 font-semibold">{"Statut"}</th>
              <th className="py-2 pr-2 font-semibold">{"Que faire"}</th>
            </tr></thead>
            <tbody>
              {(view["lignes"]?.rows || []).map((row, index) => (
                <tr key={index} className={rowClass(row.className)}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-t border-mk-border py-2 pr-2 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody></table>
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Pour lire vos chiffres"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["conseils"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Projet d'avenant à faire signer"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view["avenant"]?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view["avenant"]?.text || ""} />
        </div>
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
