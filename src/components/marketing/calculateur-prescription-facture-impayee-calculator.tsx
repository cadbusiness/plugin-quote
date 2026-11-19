/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/calculateur-prescription-facture-impayee";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"debiteur":"pro","clause":"0","dateExecution":"2021-11-30","dateEcheance":"2022-01-14","montant":"3840","dateCalcul":"2026-10-27","ev1Type":"relance","ev1Date":"2022-02-10","ev1Fin":"","ev2Type":"relance","ev2Date":"2026-09-15","ev2Fin":"","ev3Type":"aucun","ev3Date":"","ev3Fin":""};

export function CalculateurPrescriptionFactureImpayeeCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"La créance"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Le client qui doit payer"}</span>
            <select id={"debiteur"} className={fieldClass} value={String(values["debiteur"] ?? "")} onChange={(event) => setValue("debiteur", event.target.value)}>
              <option value={"pro"}>{"Un professionnel (entreprise, artisan, profession libérale, association)"}</option>
              <option value={"conso"}>{"Un consommateur (particulier)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Entre professionnels : cinq ans (L110-4 du Code de commerce, 2224 du Code civil). Contre un consommateur : deux ans (L218-2 du Code de la consommation)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Durée prévue au contrat (années)"}</span>
            <input id={"clause"} type="number" className={fieldClass} min={"0"} max={"10"} step={"1"} value={String(values["clause"] ?? "")} onChange={(event) => setValue("clause", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si vos conditions ne disent rien. Entre professionnels, de 1 à 10 ans (article 2254 du Code civil). Ignorée contre un consommateur."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Prestation exécutée ou livraison faite le"}</span>
            <input id={"dateExecution"} type="date" className={fieldClass} value={String(values["dateExecution"] ?? "")} onChange={(event) => setValue("dateExecution", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Fin des travaux, livraison, dernière intervention facturée."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Échéance de paiement de la facture"}</span>
            <input id={"dateEcheance"} type="date" className={fieldClass} value={String(values["dateEcheance"] ?? "")} onChange={(event) => setValue("dateEcheance", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"La date limite de paiement écrite sur la facture. Laissez vide si elle n'existe pas."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant restant dû (€)"}</span>
            <input id={"montant"} type="number" className={fieldClass} min={"0"} step={"10"} value={String(values["montant"] ?? "")} onChange={(event) => setValue("montant", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sert seulement à indiquer les procédures possibles."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date du calcul"}</span>
            <input id={"dateCalcul"} type="date" className={fieldClass} value={String(values["dateCalcul"] ?? "")} onChange={(event) => setValue("dateCalcul", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Aujourd'hui, ou la date à laquelle vous pensez agir."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Ce qui s'est passé depuis"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Événement 1"}</span>
            <select id={"ev1Type"} className={fieldClass} value={String(values["ev1Type"] ?? "")} onChange={(event) => setValue("ev1Type", event.target.value)}>
              <option value={"aucun"}>{"Aucun"}</option>
              <option value={"relance"}>{"Relance ou mise en demeure (même en recommandé)"}</option>
              <option value={"reconnaissance"}>{"Reconnaissance de la dette (paiement partiel, échéancier accepté, écrit)"}</option>
              <option value={"mediation"}>{"Médiation ou conciliation convenue après le litige"}</option>
              <option value={"justice"}>{"Demande en justice (assignation, même en référé)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date"}</span>
            <input id={"ev1Date"} type="date" className={fieldClass} value={String(values["ev1Date"] ?? "")} onChange={(event) => setValue("ev1Date", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Fin (médiation)"}</span>
            <input id={"ev1Fin"} type="date" className={fieldClass} value={String(values["ev1Fin"] ?? "")} onChange={(event) => setValue("ev1Fin", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Événement 2"}</span>
            <select id={"ev2Type"} className={fieldClass} value={String(values["ev2Type"] ?? "")} onChange={(event) => setValue("ev2Type", event.target.value)}>
              <option value={"aucun"}>{"Aucun"}</option>
              <option value={"relance"}>{"Relance ou mise en demeure (même en recommandé)"}</option>
              <option value={"reconnaissance"}>{"Reconnaissance de la dette (paiement partiel, échéancier accepté, écrit)"}</option>
              <option value={"mediation"}>{"Médiation ou conciliation convenue après le litige"}</option>
              <option value={"justice"}>{"Demande en justice (assignation, même en référé)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date"}</span>
            <input id={"ev2Date"} type="date" className={fieldClass} value={String(values["ev2Date"] ?? "")} onChange={(event) => setValue("ev2Date", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Fin (médiation)"}</span>
            <input id={"ev2Fin"} type="date" className={fieldClass} value={String(values["ev2Fin"] ?? "")} onChange={(event) => setValue("ev2Fin", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Événement 3"}</span>
            <select id={"ev3Type"} className={fieldClass} value={String(values["ev3Type"] ?? "")} onChange={(event) => setValue("ev3Type", event.target.value)}>
              <option value={"aucun"}>{"Aucun"}</option>
              <option value={"relance"}>{"Relance ou mise en demeure (même en recommandé)"}</option>
              <option value={"reconnaissance"}>{"Reconnaissance de la dette (paiement partiel, échéancier accepté, écrit)"}</option>
              <option value={"mediation"}>{"Médiation ou conciliation convenue après le litige"}</option>
              <option value={"justice"}>{"Demande en justice (assignation, même en référé)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date"}</span>
            <input id={"ev3Date"} type="date" className={fieldClass} value={String(values["ev3Date"] ?? "")} onChange={(event) => setValue("ev3Date", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Fin (médiation)"}</span>
            <input id={"ev3Fin"} type="date" className={fieldClass} value={String(values["ev3Fin"] ?? "")} onChange={(event) => setValue("ev3Fin", event.target.value)} />
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. La date de fin ne sert que pour une médiation ou une conciliation ; vide, la médiation est considérée comme en cours."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La date limite pour agir"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Délai applicable"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["duree"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Fin du délai, point de départ à l'échéance"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["finEcheance"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Fin du délai par prudence, point de départ à l'exécution"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["finExecution"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Jours restants avant la date la plus proche"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["joursRestants"]?.text || "n/a"}</dd>
          </div>
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.verdict?.className || "")}>{view.verdict?.text}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le calendrier"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Date"}</th>
              <th className="py-2 pr-2 font-semibold">{"Événement"}</th>
              <th className="py-2 pr-2 font-semibold">{"Effet sur la prescription"}</th>
              <th className="py-2 pr-2 font-semibold">{"Fin du délai après"}</th>
            </tr></thead>
            <tbody>
              {(view["calendrier"]?.rows || []).map((row, index) => (
                <tr key={index} className={rowClass(row.className)}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-t border-mk-border py-2 pr-2 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody></table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Calendrier lu avec le point de départ à l'échéance. Une relance ou une mise en demeure ne change rien au délai. Une reconnaissance le fait repartir en entier. Une médiation le suspend."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Les procédures possibles"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["procedures"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
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
