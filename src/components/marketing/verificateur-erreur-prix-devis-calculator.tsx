/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-erreur-prix-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"emetteur","stade":"accepte","typeErreur":"total","montantDevis":"20310","montantCorrect":"27030","dateAcceptation":"2026-11-20","dateDecouverte":"2026-11-25","dateSignalement":"2026-11-26","elementsCalcul":"visibles","evidence":"grossiere","confirmation":"non","clientPro":"autre","forfait":"non","clauseErreur":"aucune","tiers":"non"};

export function VerificateurErreurPrixDevisCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Votre position et le devis"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"emetteur"}>{"J'ai émis le devis"}</option>
              <option value={"client"}>{"J'ai reçu le devis (client)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Stade du devis"}</span>
            <select id={"stade"} className={fieldClass} value={String(values["stade"] ?? "")} onChange={(event) => setValue("stade", event.target.value)}>
              <option value={"brouillon"}>{"Pas encore envoyé"}</option>
              <option value={"envoye"}>{"Envoyé, pas encore accepté"}</option>
              <option value={"accepte"}>{"Accepté, pas encore exécuté"}</option>
              <option value={"execution"}>{"En cours d'exécution ou exécuté"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Nature de l'erreur"}</span>
            <select id={"typeErreur"} className={fieldClass} value={String(values["typeErreur"] ?? "")} onChange={(event) => setValue("typeErreur", event.target.value)}>
              <option value={"total"}>{"Total différent de la somme des lignes"}</option>
              <option value={"unitaire"}>{"Prix unitaire erroné (virgule, zéro, référence)"}</option>
              <option value={"quantite"}>{"Quantité erronée"}</option>
              <option value={"oubli"}>{"Ligne ou poste oublié"}</option>
              <option value={"estimation"}>{"Coût ou temps mal estimé"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant figurant sur le devis (€)"}</span>
            <input id={"montantDevis"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["montantDevis"] ?? "")} onChange={(event) => setValue("montantDevis", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"En euros entiers, le total tel qu'il a été envoyé ou accepté."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant correct (€)"}</span>
            <input id={"montantCorrect"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["montantCorrect"] ?? "")} onChange={(event) => setValue("montantCorrect", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le total recalculé sans l'erreur."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date d'acceptation"}</span>
            <input id={"dateAcceptation"} type="date" className={fieldClass} value={String(values["dateAcceptation"] ?? "")} onChange={(event) => setValue("dateAcceptation", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Laisser telle quelle si le devis n'est pas accepté."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de découverte de l'erreur"}</span>
            <input id={"dateDecouverte"} type="date" className={fieldClass} value={String(values["dateDecouverte"] ?? "")} onChange={(event) => setValue("dateDecouverte", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date du signalement écrit"}</span>
            <input id={"dateSignalement"} type="date" className={fieldClass} value={String(values["dateSignalement"] ?? "")} onChange={(event) => setValue("dateSignalement", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Envoyé ou prévu."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Ce que montre le devis"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Éléments de calcul sur le devis"}</span>
            <select id={"elementsCalcul"} className={fieldClass} value={String(values["elementsCalcul"] ?? "")} onChange={(event) => setValue("elementsCalcul", event.target.value)}>
              <option value={"visibles"}>{"Lignes, quantités et prix unitaires visibles"}</option>
              <option value={"partiels"}>{"Détail partiel"}</option>
              <option value={"absents"}>{"Prix global seul"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"L'erreur se voit-elle à la lecture ?"}</span>
            <select id={"evidence"} className={fieldClass} value={String(values["evidence"] ?? "")} onChange={(event) => setValue("evidence", event.target.value)}>
              <option value={"grossiere"}>{"Oui, écart évident pour un professionnel"}</option>
              <option value={"plausible"}>{"Non, le prix paraît plausible"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le prix a-t-il été confirmé par écrit après une question ?"}</span>
            <select id={"confirmation"} className={fieldClass} value={String(values["confirmation"] ?? "")} onChange={(event) => setValue("confirmation", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui, confirmé en termes clairs"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Contrat, clause et entourage"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Le client"}</span>
            <select id={"clientPro"} className={fieldClass} value={String(values["clientPro"] ?? "")} onChange={(event) => setValue("clientPro", event.target.value)}>
              <option value={"autre"}>{"Professionnel d'un autre domaine"}</option>
              <option value={"memeMetier"}>{"Professionnel du même métier"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Type de prix"}</span>
            <select id={"forfait"} className={fieldClass} value={String(values["forfait"] ?? "")} onChange={(event) => setValue("forfait", event.target.value)}>
              <option value={"non"}>{"Prix détaillé ou à l'unité"}</option>
              <option value={"global"}>{"Prix global et forfaitaire (hors construction)"}</option>
              <option value={"batiment"}>{"Marché à forfait de construction (article 1793)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Clause sur les erreurs matérielles"}</span>
            <select id={"clauseErreur"} className={fieldClass} value={String(values["clauseErreur"] ?? "")} onChange={(event) => setValue("clauseErreur", event.target.value)}>
              <option value={"aucune"}>{"Aucune clause"}</option>
              <option value={"presente"}>{"Clause acceptée par le client"}</option>
              <option value={"transmise"}>{"Clause transmise, acceptation discutable"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Un tiers devait-il vérifier le devis ?"}</span>
            <select id={"tiers"} className={fieldClass} value={String(values["tiers"] ?? "")} onChange={(event) => setValue("tiers", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui (maître d'œuvre, économiste, bureau d'études)"}</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le verdict"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Issue"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["issueOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Sens de l'erreur"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["sensOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Écart"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["ecartOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Prix de référence"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["retenuOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Délai pour agir"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["delaiOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Le délai de huit jours pour signaler une erreur et la date limite affichée sont des repères de l'outil, pas des délais légaux ni un calcul de prescription. Ce n'est pas un conseil juridique."}</p>
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
