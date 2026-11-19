/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-exception-inexecution";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"prestataire","voie":"1219","manquement":"impayeAcompte","gravite":"suffisante","inexecutionActuelle":"oui","caractereManifeste":"doute","consequencesGraves":"oui","obligationsReciproques":"oui","notification":"ouiDate","delaiNotifJours":"1","proportionSuspension":"partielle","dateEvenement":"2026-12-20","dateNotification":"2026-12-21","miseEnDemeure":"non","acceptationCgv":"signee","continueRelation":"non"};

export function VerificateurExceptionInexecutionCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Votre position et la voie"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"prestataire"}>{"Je suis le prestataire, je rédige la clause"}</option>
              <option value={"client"}>{"Je suis le client, je relis la clause"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Voie envisagée"}</span>
            <select id={"voie"} className={fieldClass} value={String(values["voie"] ?? "")} onChange={(event) => setValue("voie", event.target.value)}>
              <option value={"1219"}>{"Article 1219 (refus face à une inexécution actuelle)"}</option>
              <option value={"1220"}>{"Article 1220 (suspension anticipée)"}</option>
              <option value={"aucune"}>{"Pas encore tranché / aucune"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Articles 1219 et 1220 du code civil."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Type de manquement"}</span>
            <select id={"manquement"} className={fieldClass} value={String(values["manquement"] ?? "")} onChange={(event) => setValue("manquement", event.target.value)}>
              <option value={"impayeAcompte"}>{"Impayé d'acompte"}</option>
              <option value={"impayeSolde"}>{"Impayé de solde"}</option>
              <option value={"nonReception"}>{"Non-réception sans motif"}</option>
              <option value={"nonFourniture"}>{"Non-fourniture / non-pose"}</option>
              <option value={"retardsRepetes"}>{"Retards répétés"}</option>
              <option value={"annonceExpresse"}>{"Annonce expresse de non-exécution"}</option>
              <option value={"defaillanceConnue"}>{"Défaillance connue documentée"}</option>
              <option value={"autre"}>{"Autre"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Gravité et caractérisation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Gravité du manquement (ou des conséquences)"}</span>
            <select id={"gravite"} className={fieldClass} value={String(values["gravite"] ?? "")} onChange={(event) => setValue("gravite", event.target.value)}>
              <option value={"legere"}>{"Légère"}</option>
              <option value={"moyenne"}>{"Moyenne"}</option>
              <option value={"suffisante"}>{"Suffisamment grave"}</option>
              <option value={"tresGrave"}>{"Très grave"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Repères de l'outil, pas des seuils légaux."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Inexécution actuelle (1219)"}</span>
            <select id={"inexecutionActuelle"} className={fieldClass} value={String(values["inexecutionActuelle"] ?? "")} onChange={(event) => setValue("inexecutionActuelle", event.target.value)}>
              <option value={"oui"}>{"Oui, déjà constatée"}</option>
              <option value={"partielle"}>{"Partielle"}</option>
              <option value={"non"}>{"Non (pas encore)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Caractère manifeste (1220)"}</span>
            <select id={"caractereManifeste"} className={fieldClass} value={String(values["caractereManifeste"] ?? "")} onChange={(event) => setValue("caractereManifeste", event.target.value)}>
              <option value={"oui"}>{"Oui, manifeste"}</option>
              <option value={"doute"}>{"Discutable"}</option>
              <option value={"non"}>{"Non"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Conséquences suffisamment graves pour vous (1220)"}</span>
            <select id={"consequencesGraves"} className={fieldClass} value={String(values["consequencesGraves"] ?? "")} onChange={(event) => setValue("consequencesGraves", event.target.value)}>
              <option value={"oui"}>{"Oui"}</option>
              <option value={"non"}>{"Non"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Obligations réciproques (synallagmatique)"}</span>
            <select id={"obligationsReciproques"} className={fieldClass} value={String(values["obligationsReciproques"] ?? "")} onChange={(event) => setValue("obligationsReciproques", event.target.value)}>
              <option value={"oui"}>{"Oui, lien clair"}</option>
              <option value={"non"}>{"Non ou lien faible"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Notification, proportion et CGV"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Notification écrite"}</span>
            <select id={"notification"} className={fieldClass} value={String(values["notification"] ?? "")} onChange={(event) => setValue("notification", event.target.value)}>
              <option value={"ouiDate"}>{"Oui, avec date"}</option>
              <option value={"ouiSansDate"}>{"Oui, sans date claire"}</option>
              <option value={"non"}>{"Non"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Délai entre connaissance et notification (jours)"}</span>
            <input id={"delaiNotifJours"} type="number" className={fieldClass} min={"0"} max={"365"} step={"1"} value={String(values["delaiNotifJours"] ?? "")} onChange={(event) => setValue("delaiNotifJours", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Repère de l'outil : quinze jours (1220)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Étendue de la suspension"}</span>
            <select id={"proportionSuspension"} className={fieldClass} value={String(values["proportionSuspension"] ?? "")} onChange={(event) => setValue("proportionSuspension", event.target.value)}>
              <option value={"partielle"}>{"Partielle, liée au manquement"}</option>
              <option value={"totale"}>{"Totale"}</option>
              <option value={"excessive"}>{"Excessive au regard du manquement"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date du manquement ou de l'annonce"}</span>
            <input id={"dateEvenement"} type="date" className={fieldClass} value={String(values["dateEvenement"] ?? "")} onChange={(event) => setValue("dateEvenement", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de notification"}</span>
            <input id={"dateNotification"} type="date" className={fieldClass} value={String(values["dateNotification"] ?? "")} onChange={(event) => setValue("dateNotification", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Mise en demeure préalable"}</span>
            <select id={"miseEnDemeure"} className={fieldClass} value={String(values["miseEnDemeure"] ?? "")} onChange={(event) => setValue("miseEnDemeure", event.target.value)}>
              <option value={"oui"}>{"Oui"}</option>
              <option value={"non"}>{"Non"}</option>
              <option value={"inutile"}>{"Non, et jugée inutile (bonne pratique seulement)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sous 1219, pas toujours obligatoire (arrêt 2025)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Acceptation des CGV"}</span>
            <select id={"acceptationCgv"} className={fieldClass} value={String(values["acceptationCgv"] ?? "")} onChange={(event) => setValue("acceptationCgv", event.target.value)}>
              <option value={"signee"}>{"Jointes au devis signé, qui dit les accepter"}</option>
              <option value={"transmise"}>{"Transmises, acceptation discutable"}</option>
              <option value={"jamais"}>{"Jamais transmises"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1119 du code civil."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"La relation se poursuit-elle comme si de rien n'était ?"}</span>
            <select id={"continueRelation"} className={fieldClass} value={String(values["continueRelation"] ?? "")} onChange={(event) => setValue("continueRelation", event.target.value)}>
              <option value={"non"}>{"Non, suspension affichée"}</option>
              <option value={"oui"}>{"Oui, on continue sans réserve"}</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le verdict"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Régime probable"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["regimeOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Qualité de la clause"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["clauseOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Notification"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["notifOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Le délai de quinze jours et les libellés de gravité sont des repères de l'outil, pas des seuils légaux. Ce n'est pas un conseil juridique."}</p>
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
