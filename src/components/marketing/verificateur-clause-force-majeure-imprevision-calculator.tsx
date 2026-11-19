/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-clause-force-majeure-imprevision";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"prestataire","situation":"forceMajeure","evenement":"defaillanceFournisseur","dateContrat":"2026-11-18","dateEvenement":"2027-01-12","controle":"hors","previsibilite":"imprevisible","mesures":"insuffisantes","empechement":"total","dureeEmpechement":"temporaire","onerosite":"p100","onerositePct":"62","risqueAccepte":"non","clauseRedigee":"listeFermee","acceptation":"signee","notification":"ouiDate","delaiNotifJours":"1","reciproque":"non","continueExec":"oui"};

export function VerificateurClauseForceMajeureImprevisionCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Votre position et la situation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"prestataire"}>{"Je suis le prestataire, je rédige la clause"}</option>
              <option value={"client"}>{"Je suis le client, je relis la clause"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ce que vous analysez"}</span>
            <select id={"situation"} className={fieldClass} value={String(values["situation"] ?? "")} onChange={(event) => setValue("situation", event.target.value)}>
              <option value={"forceMajeure"}>{"Plutôt une force majeure (exécution empêchée)"}</option>
              <option value={"imprevision"}>{"Plutôt une imprévision (encore possible, trop chère)"}</option>
              <option value={"incertaine"}>{"Pas encore tranché"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Articles 1218 et 1195 du code civil."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Type d'événement"}</span>
            <select id={"evenement"} className={fieldClass} value={String(values["evenement"] ?? "")} onChange={(event) => setValue("evenement", event.target.value)}>
              <option value={"defaillanceFournisseur"}>{"Défaillance ou incendie chez un fournisseur"}</option>
              <option value={"catastrophe"}>{"Catastrophe naturelle, incendie, inondation"}</option>
              <option value={"epidemie"}>{"Épidémie ou mesures sanitaires"}</option>
              <option value={"greveTiers"}>{"Grève des transports ou chez un tiers"}</option>
              <option value={"haussePrix"}>{"Hausse brutale des prix ou des coûts"}</option>
              <option value={"reglementation"}>{"Interdiction ou norme nouvelle"}</option>
              <option value={"decisionInterne"}>{"Décision interne (réorganisation, perte de salarié)"}</option>
              <option value={"autre"}>{"Autre"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de conclusion du contrat"}</span>
            <input id={"dateContrat"} type="date" className={fieldClass} value={String(values["dateContrat"] ?? "")} onChange={(event) => setValue("dateContrat", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Point de vue pour l'imprévisibilité."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de l'événement (ou de sa connaissance)"}</span>
            <input id={"dateEvenement"} type="date" className={fieldClass} value={String(values["dateEvenement"] ?? "")} onChange={(event) => setValue("dateEvenement", event.target.value)} />
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les trois conditions de la force majeure"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"L'événement est-il hors de votre contrôle ?"}</span>
            <select id={"controle"} className={fieldClass} value={String(values["controle"] ?? "")} onChange={(event) => setValue("controle", event.target.value)}>
              <option value={"hors"}>{"Oui, hors de mon contrôle"}</option>
              <option value={"doute"}>{"Discutable"}</option>
              <option value={"sousControle"}>{"Non, sous mon contrôle"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Était-il prévisible à la signature ?"}</span>
            <select id={"previsibilite"} className={fieldClass} value={String(values["previsibilite"] ?? "")} onChange={(event) => setValue("previsibilite", event.target.value)}>
              <option value={"imprevisible"}>{"Non raisonnablement prévisible"}</option>
              <option value={"discute"}>{"Discutable"}</option>
              <option value={"previsible"}>{"Déjà prévisible à la signature"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Mesures appropriées pour en éviter les effets"}</span>
            <select id={"mesures"} className={fieldClass} value={String(values["mesures"] ?? "")} onChange={(event) => setValue("mesures", event.target.value)}>
              <option value={"insuffisantes"}>{"Tentées, sans alternative utile"}</option>
              <option value={"aucunePossible"}>{"Aucune mesure possible"}</option>
              <option value={"alternativesExistent"}>{"Des alternatives existent et n'ont pas été prises"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1218 : effets non évitables par des mesures appropriées."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"L'exécution est-elle empêchée ?"}</span>
            <select id={"empechement"} className={fieldClass} value={String(values["empechement"] ?? "")} onChange={(event) => setValue("empechement", event.target.value)}>
              <option value={"total"}>{"Empêchement total"}</option>
              <option value={"partiel"}>{"Empêchement partiel"}</option>
              <option value={"aucun"}>{"Aucun empêchement (coût seulement)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Durée de l'empêchement"}</span>
            <select id={"dureeEmpechement"} className={fieldClass} value={String(values["dureeEmpechement"] ?? "")} onChange={(event) => setValue("dureeEmpechement", event.target.value)}>
              <option value={"temporaire"}>{"Temporaire"}</option>
              <option value={"definitif"}>{"Définitif"}</option>
              <option value={"inconnu"}>{"Pas encore connu"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Suspension si temporaire, résolution de plein droit si définitif."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"L'imprévision (article 1195)"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Hausse de coût estimée"}</span>
            <select id={"onerosite"} className={fieldClass} value={String(values["onerosite"] ?? "")} onChange={(event) => setValue("onerosite", event.target.value)}>
              <option value={"none"}>{"Pas de hausse pertinente"}</option>
              <option value={"p30"}>{"Environ +30 %"}</option>
              <option value={"p50"}>{"Environ +50 %"}</option>
              <option value={"p100"}>{"Environ +100 % ou plus (ex. +62 % matière sur marge)"}</option>
              <option value={"custom"}>{"Autre pourcentage (champ à côté)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Repères de l'outil, pas des seuils légaux."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Pourcentage personnalisé"}</span>
            <input id={"onerositePct"} type="number" className={fieldClass} min={"0"} max={"500"} step={"1"} value={String(values["onerositePct"] ?? "")} onChange={(event) => setValue("onerositePct", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Utilisé seulement si « Autre pourcentage »."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le risque a-t-il été accepté ?"}</span>
            <select id={"risqueAccepte"} className={fieldClass} value={String(values["risqueAccepte"] ?? "")} onChange={(event) => setValue("risqueAccepte", event.target.value)}>
              <option value={"non"}>{"Non, aucune clause d'acceptation du risque"}</option>
              <option value={"ouiClause"}>{"Oui, clause claire d'exclusion de l'article 1195"}</option>
              <option value={"ouiSilence"}>{"Seulement « prix fermes », sans renvoi à 1195"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La clause et la notification"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Ce que dit la clause actuelle"}</span>
            <select id={"clauseRedigee"} className={fieldClass} value={String(values["clauseRedigee"] ?? "")} onChange={(event) => setValue("clauseRedigee", event.target.value)}>
              <option value={"listeFermee"}>{"Liste fermée (ex. pandémie, guerre, grève)"}</option>
              <option value={"listeOuverte"}>{"Liste ouverte + renvoi à l'article 1218"}</option>
              <option value={"renvoi1218"}>{"Renvoi à l'article 1218, sans liste"}</option>
              <option value={"exclusion1195"}>{"Exclusion claire de l'article 1195"}</option>
              <option value={"aucune"}>{"Aucune clause"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Acceptation des CGV"}</span>
            <select id={"acceptation"} className={fieldClass} value={String(values["acceptation"] ?? "")} onChange={(event) => setValue("acceptation", event.target.value)}>
              <option value={"signee"}>{"Jointes au devis signé, qui dit les accepter"}</option>
              <option value={"cgvSignees"}>{"CGV signées séparément"}</option>
              <option value={"lien"}>{"Lien seulement, sans mention d'acceptation"}</option>
              <option value={"aucune"}>{"Jamais transmises"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1119 du code civil."}</p>
          </div>
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
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Repère de l'outil : quinze jours."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"La clause est-elle réciproque ?"}</span>
            <select id={"reciproque"} className={fieldClass} value={String(values["reciproque"] ?? "")} onChange={(event) => setValue("reciproque", event.target.value)}>
              <option value={"non"}>{"Non, elle ne protège que le prestataire"}</option>
              <option value={"oui"}>{"Oui, elle joue pour les deux parties"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Contrat d'adhésion : article 1171."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Sous 1195, l'exécution continue-t-elle ?"}</span>
            <select id={"continueExec"} className={fieldClass} value={String(values["continueExec"] ?? "")} onChange={(event) => setValue("continueExec", event.target.value)}>
              <option value={"oui"}>{"Oui, on continue d'exécuter"}</option>
              <option value={"non"}>{"Non, on a arrêté"}</option>
              <option value={"na"}>{"Sans objet (pas une imprévision)"}</option>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Les pourcentages +30 %, +50 %, +100 % et le délai de quinze jours sont des repères de l'outil, pas des seuils légaux. Ce n'est pas un conseil juridique."}</p>
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
