/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/calculateur-delai-retractation-hors-etablissement";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"lieu":"hors","effectif":"0_5","objet":"hors_activite","type":"service","exception":"aucune","conclusion":"2026-10-28","reception":"","info":"oui","dateInfo":"","montant":"1200","paiementMontant":"0","paiementDate":"","execution":"non","pct":"0"};

export function CalculateurDelaiRetractationHorsEtablissementCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Les trois conditions"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Où le contrat a-t-il été signé ?"}</span>
            <select id={"lieu"} className={fieldClass} value={String(values["lieu"] ?? "")} onChange={(event) => setValue("lieu", event.target.value)}>
              <option value={"hors"}>{"Chez le client ou ailleurs que dans vos locaux, en sa présence"}</option>
              <option value={"apres_sollicitation"}>{"Par e-mail ou dans vos locaux, juste après une rencontre hors de vos locaux"}</option>
              <option value={"distance"}>{"À distance, sans rencontre (site, téléphone, e-mail)"}</option>
              <option value={"locaux"}>{"Dans vos locaux, le client est venu de lui-même"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article L221-1 du Code de la consommation : signature hors de vos locaux en présence des deux parties, ou juste après une sollicitation personnelle faite hors de vos locaux."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Salariés du client"}</span>
            <select id={"effectif"} className={fieldClass} value={String(values["effectif"] ?? "")} onChange={(event) => setValue("effectif", event.target.value)}>
              <option value={"0_5"}>{"Cinq au plus"}</option>
              <option value={"plus_5"}>{"Plus de cinq"}</option>
              <option value={"inconnu"}>{"Je ne sais pas"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le texte dit « inférieur ou égal à cinq »."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le contrat et le métier du client"}</span>
            <select id={"objet"} className={fieldClass} value={String(values["objet"] ?? "")} onChange={(event) => setValue("objet", event.target.value)}>
              <option value={"hors_activite"}>{"Hors de son activité principale"}</option>
              <option value={"activite"}>{"Dans son activité principale"}</option>
              <option value={"doute"}>{"Je ne sais pas"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Exemple : une alarme pour une boulangerie sort de son activité. Les juges apprécient au cas par cas."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le contrat"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Nature du contrat"}</span>
            <select id={"type"} className={fieldClass} value={String(values["type"] ?? "")} onChange={(event) => setValue("type", event.target.value)}>
              <option value={"service"}>{"Prestation de services"}</option>
              <option value={"vente"}>{"Vente de biens, ou biens avec pose"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Un contrat qui mêle fourniture d'un bien et service est assimilé à une vente (L221-1 II)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Exception possible"}</span>
            <select id={"exception"} className={fieldClass} value={String(values["exception"] ?? "")} onChange={(event) => setValue("exception", event.target.value)}>
              <option value={"aucune"}>{"Aucune"}</option>
              <option value={"sur_mesure"}>{"Bien fabriqué selon les spécifications du client ou nettement personnalisé"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article L221-28, 3°. À apprécier : un matériel standard paramétré n'est pas forcément du sur-mesure."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de signature"}</span>
            <input id={"conclusion"} type="date" className={fieldClass} value={String(values["conclusion"] ?? "")} onChange={(event) => setValue("conclusion", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de réception du bien (vente)"}</span>
            <input id={"reception"} type="date" className={fieldClass} value={String(values["reception"] ?? "")} onChange={(event) => setValue("reception", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Livraison ou pose. Ignorée pour une prestation de services."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Information sur la rétractation"}</span>
            <select id={"info"} className={fieldClass} value={String(values["info"] ?? "")} onChange={(event) => setValue("info", event.target.value)}>
              <option value={"oui"}>{"Donnée à la signature, avec le formulaire"}</option>
              <option value={"non"}>{"Jamais donnée"}</option>
              <option value={"tard"}>{"Donnée plus tard"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de l'information tardive"}</span>
            <input id={"dateInfo"} type="date" className={fieldClass} value={String(values["dateInfo"] ?? "")} onChange={(event) => setValue("dateInfo", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Seulement si l'information a été donnée après la signature."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"L'argent"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Prix total du contrat (€ HT)"}</span>
            <input id={"montant"} type="number" className={fieldClass} min={"0"} step={"10"} value={String(values["montant"] ?? "")} onChange={(event) => setValue("montant", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Somme déjà encaissée (€)"}</span>
            <input id={"paiementMontant"} type="number" className={fieldClass} min={"0"} step={"10"} value={String(values["paiementMontant"] ?? "")} onChange={(event) => setValue("paiementMontant", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Acompte, chèque, prélèvement, 0 si rien."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de l'encaissement"}</span>
            <input id={"paiementDate"} type="date" className={fieldClass} value={String(values["paiementDate"] ?? "")} onChange={(event) => setValue("paiementDate", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Service commencé avant la fin du délai"}</span>
            <select id={"execution"} className={fieldClass} value={String(values["execution"] ?? "")} onChange={(event) => setValue("execution", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui, à la demande écrite du client"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Part du service déjà exécutée (%)"}</span>
            <input id={"pct"} type="number" className={fieldClass} min={"0"} max={"100"} step={"5"} value={String(values["pct"] ?? "")} onChange={(event) => setValue("pct", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sert à estimer la somme proportionnelle due si le client se rétracte (L221-25)."}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple (un contrat de maintenance et de télésurveillance signé dans une boulangerie de trois salariés), pas un cas réel. Jours fériés pris en compte : les onze jours fériés nationaux, sans les jours propres à l'Alsace-Moselle ni les jours chômés locaux."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le droit de rétractation"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Conditions de l'article L221-3"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["statut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Le délai part du"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["debut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Fin du délai de 14 jours"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["finInitiale"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Fin effective, information comprise"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["fin"]?.text || "n/a"}</dd>
          </div>
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.verdict?.className || "")}>{view.verdict?.text}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"L'argent pendant le délai"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Aucun paiement jusqu'au"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["finSept"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Premier encaissement possible le"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["paiementDes"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Somme due pour la part exécutée, si le client se rétracte"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["du"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Somme à rendre, si le client se rétracte"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["solde"]?.text || "n/a"}</dd>
          </div>
        </dl>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le calendrier"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Date"}</th>
              <th className="py-2 pr-2 font-semibold">{"Ce qui se passe"}</th>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Le jour de la signature ou de la réception ne compte pas. Si le dernier jour tombe un samedi, un dimanche ou un jour férié, le délai va jusqu'au premier jour ouvrable suivant (L221-19)."}</p>
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
