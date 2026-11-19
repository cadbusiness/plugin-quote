/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/calculateur-preavis-rupture-brutale";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"victime","typeRupture":"totale","baisseVolume":"40","dateDebut":"2018-03-01","dateNotification":"2026-11-16","dateFin":"2026-12-31","preavisEcrit":"oui","preavisContractuel":"3","usages":"0","partCA":"22","exclusivite":"non","investissements":"moyens","appelsOffres":"aucun","conditionsPreavis":"maintenues","motif":"aucun","caMensuel":"9600","tauxMarge":"45"};

export function CalculateurPreavisRuptureBrutaleCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"La relation et la rupture"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"victime"}>{"Je subis la rupture (fournisseur ou client quitté)"}</option>
              <option value={"auteur"}>{"Je veux rompre ou réduire la relation"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Type de rupture"}</span>
            <select id={"typeRupture"} className={fieldClass} value={String(values["typeRupture"] ?? "")} onChange={(event) => setValue("typeRupture", event.target.value)}>
              <option value={"totale"}>{"Rupture totale : plus aucune commande"}</option>
              <option value={"partielle"}>{"Rupture partielle : baisse forte des volumes"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Baisse des volumes en cas de rupture partielle (%)"}</span>
            <input id={"baisseVolume"} type="number" className={fieldClass} min={"0"} max={"100"} step={"1"} value={String(values["baisseVolume"] ?? "")} onChange={(event) => setValue("baisseVolume", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Ignoré pour une rupture totale."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Début de la relation"}</span>
            <input id={"dateDebut"} type="date" className={fieldClass} value={String(values["dateDebut"] ?? "")} onChange={(event) => setValue("dateDebut", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Premier devis signé ou première commande, même sous un autre contrat."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de l'annonce écrite de la rupture"}</span>
            <input id={"dateNotification"} type="date" className={fieldClass} value={String(values["dateNotification"] ?? "")} onChange={(event) => setValue("dateNotification", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de fin annoncée (ou de la baisse)"}</span>
            <input id={"dateFin"} type="date" className={fieldClass} value={String(values["dateFin"] ?? "")} onChange={(event) => setValue("dateFin", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"L'annonce a-t-elle été faite par écrit ?"}</span>
            <select id={"preavisEcrit"} className={fieldClass} value={String(values["preavisEcrit"] ?? "")} onChange={(event) => setValue("preavisEcrit", event.target.value)}>
              <option value={"oui"}>{"Oui, lettre ou e-mail daté"}</option>
              <option value={"non"}>{"Non, oralement ou sans annonce"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Préavis prévu au contrat (mois)"}</span>
            <input id={"preavisContractuel"} type="number" className={fieldClass} min={"0"} max={"36"} step={"1"} value={String(values["preavisContractuel"] ?? "")} onChange={(event) => setValue("preavisContractuel", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si le contrat ou le devis ne dit rien."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Préavis d'usage ou d'accord interprofessionnel (mois)"}</span>
            <input id={"usages"} type="number" className={fieldClass} min={"0"} max={"36"} step={"1"} value={String(values["usages"] ?? "")} onChange={(event) => setValue("usages", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si vous n'en connaissez pas."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Ce qui pèse sur la durée du préavis"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Part du partenaire dans le chiffre d'affaires de celui qui subit (%)"}</span>
            <input id={"partCA"} type="number" className={fieldClass} min={"0"} max={"100"} step={"1"} value={String(values["partCA"] ?? "")} onChange={(event) => setValue("partCA", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Exclusivité demandée ou de fait ?"}</span>
            <select id={"exclusivite"} className={fieldClass} value={String(values["exclusivite"] ?? "")} onChange={(event) => setValue("exclusivite", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Investissements faits pour cette relation"}</span>
            <select id={"investissements"} className={fieldClass} value={String(values["investissements"] ?? "")} onChange={(event) => setValue("investissements", event.target.value)}>
              <option value={"aucun"}>{"Aucun"}</option>
              <option value={"moyens"}>{"Moyens, en partie amortis"}</option>
              <option value={"lourds"}>{"Lourds, non amortis"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Mise en concurrence"}</span>
            <select id={"appelsOffres"} className={fieldClass} value={String(values["appelsOffres"] ?? "")} onChange={(event) => setValue("appelsOffres", event.target.value)}>
              <option value={"aucun"}>{"Aucun appel d'offres"}</option>
              <option value={"ponctuel"}>{"Un appel d'offres isolé"}</option>
              <option value={"annuel"}>{"Appels d'offres annuels réguliers"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Commandes pendant le préavis"}</span>
            <select id={"conditionsPreavis"} className={fieldClass} value={String(values["conditionsPreavis"] ?? "")} onChange={(event) => setValue("conditionsPreavis", event.target.value)}>
              <option value={"maintenues"}>{"Maintenues aux conditions habituelles"}</option>
              <option value={"baisseLegere"}>{"Baisse limitée"}</option>
              <option value={"baisseForte"}>{"Baisse substantielle"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Motif de la rupture"}</span>
            <select id={"motif"} className={fieldClass} value={String(values["motif"] ?? "")} onChange={(event) => setValue("motif", event.target.value)}>
              <option value={"aucun"}>{"Choix commercial ou réorganisation"}</option>
              <option value={"inexecutionGrave"}>{"Manquement grave de l'autre partie"}</option>
              <option value={"inexecutionMineure"}>{"Manquements ponctuels ou mineurs"}</option>
              <option value={"forceMajeure"}>{"Force majeure"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Pour estimer la perte de marge"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Chiffre d'affaires mensuel moyen avec ce partenaire (€)"}</span>
            <input id={"caMensuel"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["caMensuel"] ?? "")} onChange={(event) => setValue("caMensuel", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Moyenne des derniers exercices, en euros entiers."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Taux de marge sur coûts variables (%)"}</span>
            <input id={"tauxMarge"} type="number" className={fieldClass} min={"0"} max={"100"} step={"1"} value={String(values["tauxMarge"] ?? "")} onChange={(event) => setValue("tauxMarge", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Chiffre d'affaires moins les coûts que vous n'aurez plus à payer."}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le verdict"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Ancienneté à l'annonce"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["ancienneteOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Fourchette de l'outil"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["fourchetteOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Repère de préavis"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["repereOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Préavis accordé"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["accordeOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Préavis manquant"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["manquantOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Perte de marge estimée"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["perteOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Fin du préavis au repère"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["finRepereOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Points bloquants / à compléter"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["compteurs"]?.text || "n/a"}</dd>
          </div>
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.verdict?.className || "")}>{view.verdict?.text}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le contrôle point par point"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Point"}</th>
              <th className="py-2 pr-2 font-semibold">{"Statut"}</th>
              <th className="py-2 pr-2 font-semibold">{"Ce que cela veut dire"}</th>
            </tr></thead>
            <tbody>
              {(view["controles"]?.rows || []).map((row, index) => (
                <tr key={index} className={rowClass(row.className)}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-t border-mk-border py-2 pr-2 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody></table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Le repère et la fourchette sont un calibrage de l'outil (trois mois, plus un demi-mois par année, plus des majorations), comparé à quelques décisions publiées. Ce n'est pas un barème légal : le juge apprécie chaque dossier. Ce n'est pas un conseil juridique."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Quelques durées retenues par la Cour de cassation"}</h2>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La clause rédigée"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view["clause"]?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view["clause"]?.text || ""} />
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Point de départ à adapter avec votre conseil. Les crochets sont à remplir."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Ce qu'il faut faire"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["actions"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le courrier à envoyer"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view["message"]?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view["message"]?.text || ""} />
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
