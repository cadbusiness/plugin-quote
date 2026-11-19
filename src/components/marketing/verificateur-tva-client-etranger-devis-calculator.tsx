/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-tva-client-etranger-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"operation":"biens","destination":"ue","montant":"14400","taux":"20","clientEtab":"ue","statut":"assujetti","numero":"communique","franchise":"non","transport":"vendeur","preuves":"partielles","recap":"nsp","dateFacture":"2027-01-08"};

export function VerificateurTvaClientEtrangerDevisCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"L'opération"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Ce que vous vendez"}</span>
            <select id={"operation"} className={fieldClass} value={String(values["operation"] ?? "")} onChange={(event) => setValue("operation", event.target.value)}>
              <option value={"biens"}>{"Des biens (pièces, matériel, marchandises)"}</option>
              <option value={"installation"}>{"Des biens que vous montez ou installez"}</option>
              <option value={"services"}>{"Une prestation de services (étude, conception, maintenance à distance, conseil)"}</option>
              <option value={"immeuble"}>{"Une prestation sur un bâtiment ou un terrain (travaux, expertise)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Où vont les biens, l'installation ou le bâtiment"}</span>
            <select id={"destination"} className={fieldClass} value={String(values["destination"] ?? "")} onChange={(event) => setValue("destination", event.target.value)}>
              <option value={"france"}>{"En France"}</option>
              <option value={"ue"}>{"Dans un autre pays de l'Union européenne"}</option>
              <option value={"hors_ue"}>{"Hors de l'Union européenne"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Ignoré pour une prestation de services."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant hors taxes du devis (€)"}</span>
            <input id={"montant"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["montant"] ?? "")} onChange={(event) => setValue("montant", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Taux de TVA française applicable (%)"}</span>
            <input id={"taux"} type="number" className={fieldClass} min={"0"} step={"0.1"} value={String(values["taux"] ?? "")} onChange={(event) => setValue("taux", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le taux de votre activité ; l'outil ne le choisit pas."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le client"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Où le client est établi"}</span>
            <select id={"clientEtab"} className={fieldClass} value={String(values["clientEtab"] ?? "")} onChange={(event) => setValue("clientEtab", event.target.value)}>
              <option value={"france"}>{"En France"}</option>
              <option value={"ue"}>{"Dans un autre pays de l'Union européenne"}</option>
              <option value={"hors_ue"}>{"Hors de l'Union européenne"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui est le client"}</span>
            <select id={"statut"} className={fieldClass} value={String(values["statut"] ?? "")} onChange={(event) => setValue("statut", event.target.value)}>
              <option value={"assujetti"}>{"Une entreprise assujettie à la TVA"}</option>
              <option value={"pm_identifiee"}>{"Une personne morale non assujettie mais identifiée à la TVA"}</option>
              <option value={"non_assujetti"}>{"Un client sans numéro de TVA (particulier, association non identifiée)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Son numéro de TVA"}</span>
            <select id={"numero"} className={fieldClass} value={String(values["numero"] ?? "")} onChange={(event) => setValue("numero", event.target.value)}>
              <option value={"verifie"}>{"Communiqué par écrit et vérifié, preuve conservée"}</option>
              <option value={"communique"}>{"Communiqué, pas encore vérifié"}</option>
              <option value={"absent"}>{"Pas communiqué"}</option>
              <option value={"francais"}>{"Un numéro français (FR)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Vous êtes en franchise en base de TVA"}</span>
            <select id={"franchise"} className={fieldClass} value={String(values["franchise"] ?? "")} onChange={(event) => setValue("franchise", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le transport et les preuves"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Qui transporte les biens"}</span>
            <select id={"transport"} className={fieldClass} value={String(values["transport"] ?? "")} onChange={(event) => setValue("transport", event.target.value)}>
              <option value={"vendeur"}>{"Vous, ou un transporteur que vous mandatez"}</option>
              <option value={"client"}>{"Le client ou son transporteur (enlèvement chez vous)"}</option>
              <option value={"aucun"}>{"Personne : les biens restent en France"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Preuves du transport ou de la sortie"}</span>
            <select id={"preuves"} className={fieldClass} value={String(values["preuves"] ?? "")} onChange={(event) => setValue("preuves", event.target.value)}>
              <option value={"completes"}>{"Réunies (documents de transport, réception, ou export)"}</option>
              <option value={"partielles"}>{"Partielles (bon de livraison seul, par exemple)"}</option>
              <option value={"aucune"}>{"Aucune"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"État récapitulatif des clients (ventes ou services dans l'UE)"}</span>
            <select id={"recap"} className={fieldClass} value={String(values["recap"] ?? "")} onChange={(event) => setValue("recap", event.target.value)}>
              <option value={"oui"}>{"Déposé chaque mois concerné"}</option>
              <option value={"nsp"}>{"Je ne sais pas"}</option>
              <option value={"non"}>{"Non déposé"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date prévue de la facture"}</span>
            <input id={"dateFacture"} type="date" className={fieldClass} value={String(values["dateFacture"] ?? "")} onChange={(event) => setValue("dateFacture", event.target.value)} />
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Un atelier de tôlerie fine établi en France chiffre le 16 novembre 2026 un lot de 120 carters en inox pour un client industriel établi en Belgique, 14 400 € hors taxes, livrés par un transporteur mandaté par l'atelier, facture prévue le 8 janvier 2027."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Régime qui ressort de vos réponses"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["regimeOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"TVA française à facturer"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["tvaOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"TVA en jeu si une condition manque"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["enJeuOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Mention clé de la facture"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["mentionOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Articles du code général des impôts (258, 259, 259-0, 259 A, 262, 262 ter, 289 B) et de son annexe II (242 nonies A) lus dans leur version en vigueur le 16 novembre 2026, avec les commentaires BOFiP cités dans l'article. Ces articles passent dans le code des impositions sur les biens et services au 1er janvier 2027. L'outil ne traite ni les ventes à distance à des particuliers, ni les ventes en chaîne, ni les règles du pays du client. Ce n'est pas un conseil fiscal : faites valider par votre expert-comptable."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La clause à mettre dans le devis"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view["clause"]?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view["clause"]?.text || ""} />
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Ce qu'il faut faire"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["actions"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le message à envoyer au client"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view["message"]?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view["message"]?.text || ""} />
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Récapitulatif"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view["recapOut"]?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view["recapOut"]?.text || ""} />
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
