/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/comparateur-forfait-regie-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"prestataire","modele":"forfait","hBasse":"60","hProbable":"80","hHaute":"100","taux":"85","coutRevient":"52","perimetre":"partiel","inconnues":"quelques","changements":"2","hParChangement":"10","reserve":"15","plafondPct":"20","avenant":"oral","suivi":"releve"};

export function ComparateurForfaitRegieDevisCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"La prestation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"prestataire"}>{"Je chiffre la prestation (prestataire)"}</option>
              <option value={"client"}>{"Je compare des offres (client)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Mode de facturation envisagé"}</span>
            <select id={"modele"} className={fieldClass} value={String(values["modele"] ?? "")} onChange={(event) => setValue("modele", event.target.value)}>
              <option value={"forfait"}>{"Forfait"}</option>
              <option value={"regie"}>{"Régie (temps passé)"}</option>
              <option value={"plafond"}>{"Régie plafonnée"}</option>
              <option value={"phases"}>{"Forfait par phase, puis régie"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Heures, estimation basse"}</span>
            <input id={"hBasse"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["hBasse"] ?? "")} onChange={(event) => setValue("hBasse", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Si tout se passe bien."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Heures, estimation probable"}</span>
            <input id={"hProbable"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["hProbable"] ?? "")} onChange={(event) => setValue("hProbable", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Heures, estimation haute"}</span>
            <input id={"hHaute"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["hHaute"] ?? "")} onChange={(event) => setValue("hHaute", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Si les inconnues tournent mal."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Taux horaire facturé (€)"}</span>
            <input id={"taux"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["taux"] ?? "")} onChange={(event) => setValue("taux", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Coût de revient horaire (€)"}</span>
            <input id={"coutRevient"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["coutRevient"] ?? "")} onChange={(event) => setValue("coutRevient", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Salaire chargé et frais, par heure productive."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Ce qui est connu"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Périmètre écrit"}</span>
            <select id={"perimetre"} className={fieldClass} value={String(values["perimetre"] ?? "")} onChange={(event) => setValue("perimetre", event.target.value)}>
              <option value={"ferme"}>{"Cahier des charges écrit et validé"}</option>
              <option value={"partiel"}>{"Besoin décrit, détails à préciser"}</option>
              <option value={"flou"}>{"Besoin flou"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Inconnues (existant, accès, tiers)"}</span>
            <select id={"inconnues"} className={fieldClass} value={String(values["inconnues"] ?? "")} onChange={(event) => setValue("inconnues", event.target.value)}>
              <option value={"aucune"}>{"Aucune ou presque"}</option>
              <option value={"quelques"}>{"Quelques-unes"}</option>
              <option value={"nombreuses"}>{"Nombreuses"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Changements de périmètre probables"}</span>
            <input id={"changements"} type="number" className={fieldClass} min={"0"} max={"50"} step={"1"} value={String(values["changements"] ?? "")} onChange={(event) => setValue("changements", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Heures par changement"}</span>
            <input id={"hParChangement"} type="number" className={fieldClass} min={"0"} max={"500"} step={"1"} value={String(values["hParChangement"] ?? "")} onChange={(event) => setValue("hParChangement", event.target.value)} />
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Ce qui est écrit"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Réserve de risque dans le forfait (%)"}</span>
            <input id={"reserve"} type="number" className={fieldClass} min={"0"} max={"100"} step={"1"} value={String(values["reserve"] ?? "")} onChange={(event) => setValue("reserve", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Plafond au-dessus de l'estimation probable (%)"}</span>
            <input id={"plafondPct"} type="number" className={fieldClass} min={"0"} max={"200"} step={"1"} value={String(values["plafondPct"] ?? "")} onChange={(event) => setValue("plafondPct", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Changement de périmètre"}</span>
            <select id={"avenant"} className={fieldClass} value={String(values["avenant"] ?? "")} onChange={(event) => setValue("avenant", event.target.value)}>
              <option value={"ecrit"}>{"Avenant écrit et chiffré avant exécution"}</option>
              <option value={"oral"}>{"Convenu à l'oral ou par e-mail"}</option>
              <option value={"aucun"}>{"Rien de prévu"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Suivi des heures"}</span>
            <select id={"suivi"} className={fieldClass} value={String(values["suivi"] ?? "")} onChange={(event) => setValue("suivi", event.target.value)}>
              <option value={"releve"}>{"Relevé d'heures partagé avec le client"}</option>
              <option value={"interne"}>{"Suivi interne seulement"}</option>
              <option value={"aucun"}>{"Aucun suivi"}</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Une petite agence chiffre l'intégration d'un site à un outil du client : 60 à 100 heures, 80 les plus probables, à 85 € l'heure, pour un coût de revient de 52 € l'heure, avec deux changements de périmètre probables de 10 heures chacun."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Régie, au probable"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["regieOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Régie, de la fourchette basse à la haute"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["fourchetteOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Forfait avec réserve"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["forfaitOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Plafond de la régie plafonnée"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["plafondOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Marge du forfait, au probable puis à la haute"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["margeOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Point mort du forfait"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["pointMortOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Perte si les changements restent sans avenant"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["changementOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Mode conseillé par les réponses"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["conseilOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Le mode conseillé vient d'un barème simple : périmètre, inconnues et écart entre les estimations. Ce n'est pas un calcul de risque, c'est un point de départ pour la discussion. Les montants sont en euros entiers."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La clause à mettre dans votre devis"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view["clause"]?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view["clause"]?.text || ""} />
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Point de départ à adapter. Les crochets sont à remplir."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Ce qu'il faut faire"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["actions"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le message à envoyer"}</h2>
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
