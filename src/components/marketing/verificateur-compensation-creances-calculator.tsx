/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-compensation-creances";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"fournisseur","voie":"legale","natureCreance":"penalites","montantFacture":"32200","montantOppose":"2070","dateFacture":"2027-02-26","dateOpposee":"2027-02-10","reciprocite":"oui","fongibilite":"argent","certitude":"contestee","liquidite":"chiffree","exigibilite":"echue","connexite":"memeContrat","clauseCompensation":"aucune","distributeur":"non","procedure":"non","cession":"non"};

export function VerificateurCompensationCreancesCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Votre position et la somme opposée"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"fournisseur"}>{"Fournisseur : le client a déduit une somme de ma facture"}</option>
              <option value={"client"}>{"Client : je veux déduire une somme de la facture du fournisseur"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Voie invoquée"}</span>
            <select id={"voie"} className={fieldClass} value={String(values["voie"] ?? "")} onChange={(event) => setValue("voie", event.target.value)}>
              <option value={"legale"}>{"Compensation légale (articles 1347 et 1347-1)"}</option>
              <option value={"conventionnelle"}>{"Compensation convenue (article 1348-2)"}</option>
              <option value={"judiciaire"}>{"Demande au juge (articles 1348 et 1348-1)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Nature de la somme opposée"}</span>
            <select id={"natureCreance"} className={fieldClass} value={String(values["natureCreance"] ?? "")} onChange={(event) => setValue("natureCreance", event.target.value)}>
              <option value={"penalites"}>{"Pénalités de retard (clause pénale)"}</option>
              <option value={"dommages"}>{"Dommages et intérêts (préjudice réclamé)"}</option>
              <option value={"remise"}>{"Remise ou ristourne"}</option>
              <option value={"avoir"}>{"Avoir émis par l'autre partie"}</option>
              <option value={"facture"}>{"Facture ou note de débit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant de la facture visée (€)"}</span>
            <input id={"montantFacture"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["montantFacture"] ?? "")} onChange={(event) => setValue("montantFacture", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"En euros entiers, tel qu'il figure sur la facture."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Somme opposée en compensation (€)"}</span>
            <input id={"montantOppose"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["montantOppose"] ?? "")} onChange={(event) => setValue("montantOppose", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"La somme que le client déduit, ou veut déduire."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Échéance de la facture"}</span>
            <input id={"dateFacture"} type="date" className={fieldClass} value={String(values["dateFacture"] ?? "")} onChange={(event) => setValue("dateFacture", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Échéance de la somme opposée"}</span>
            <input id={"dateOpposee"} type="date" className={fieldClass} value={String(values["dateOpposee"] ?? "")} onChange={(event) => setValue("dateOpposee", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Date à laquelle elle est réclamée comme due."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les quatre conditions de la compensation légale"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Les deux dettes sont-elles entre les mêmes personnes ?"}</span>
            <select id={"reciprocite"} className={fieldClass} value={String(values["reciprocite"] ?? "")} onChange={(event) => setValue("reciprocite", event.target.value)}>
              <option value={"oui"}>{"Oui, mêmes sociétés, dans les deux sens"}</option>
              <option value={"groupe"}>{"Non, une autre société du même groupe"}</option>
              <option value={"tiers"}>{"Non, un tiers"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1347 : obligations réciproques."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Objet des deux dettes"}</span>
            <select id={"fongibilite"} className={fieldClass} value={String(values["fongibilite"] ?? "")} onChange={(event) => setValue("fongibilite", event.target.value)}>
              <option value={"argent"}>{"Deux sommes d'argent"}</option>
              <option value={"nature"}>{"Une somme contre une prestation ou une chose"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1347-1 : obligations fongibles."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"La somme opposée est-elle reconnue ?"}</span>
            <select id={"certitude"} className={fieldClass} value={String(values["certitude"] ?? "")} onChange={(event) => setValue("certitude", event.target.value)}>
              <option value={"reconnue"}>{"Oui, reconnue par écrit par l'autre partie"}</option>
              <option value={"contestee"}>{"Non, elle est contestée"}</option>
              <option value={"eventuelle"}>{"Elle n'existe pas encore (éventuelle)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Son montant est-il fixé ?"}</span>
            <select id={"liquidite"} className={fieldClass} value={String(values["liquidite"] ?? "")} onChange={(event) => setValue("liquidite", event.target.value)}>
              <option value={"chiffree"}>{"Oui, chiffré au contrat ou par accord"}</option>
              <option value={"aChiffrer"}>{"Non, reste à évaluer"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Est-elle échue ?"}</span>
            <select id={"exigibilite"} className={fieldClass} value={String(values["exigibilite"] ?? "")} onChange={(event) => setValue("exigibilite", event.target.value)}>
              <option value={"echue"}>{"Oui, exigible aujourd'hui"}</option>
              <option value={"aTerme"}>{"Non, payable plus tard"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Contrat, clause et situation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"D'où viennent les deux dettes ?"}</span>
            <select id={"connexite"} className={fieldClass} value={String(values["connexite"] ?? "")} onChange={(event) => setValue("connexite", event.target.value)}>
              <option value={"memeContrat"}>{"Du même devis ou contrat"}</option>
              <option value={"cadre"}>{"D'un accord-cadre commun (ensemble contractuel unique)"}</option>
              <option value={"distincts"}>{"De contrats distincts"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Clause de compensation dans le contrat"}</span>
            <select id={"clauseCompensation"} className={fieldClass} value={String(values["clauseCompensation"] ?? "")} onChange={(event) => setValue("clauseCompensation", event.target.value)}>
              <option value={"aucune"}>{"Aucune clause"}</option>
              <option value={"acceptee"}>{"Clause acceptée par les deux parties"}</option>
              <option value={"transmise"}>{"Clause transmise, acceptation discutable"}</option>
              <option value={"interdiction"}>{"Clause qui écarte toute compensation"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Relation fournisseur / distributeur (article L441-17) ?"}</span>
            <select id={"distributeur"} className={fieldClass} value={String(values["distributeur"] ?? "")} onChange={(event) => setValue("distributeur", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui, le client revend les produits (distributeur)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Hors grossistes au sens du II de l'article L441-4."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"L'autre partie est-elle en procédure collective ?"}</span>
            <select id={"procedure"} className={fieldClass} value={String(values["procedure"] ?? "")} onChange={(event) => setValue("procedure", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui (sauvegarde, redressement ou liquidation)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"La facture a-t-elle été cédée (affacturage) ?"}</span>
            <select id={"cession"} className={fieldClass} value={String(values["cession"] ?? "")} onChange={(event) => setValue("cession", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"avant"}>{"Oui, la somme opposée est née avant la notification de la cession"}</option>
              <option value={"apres"}>{"Oui, la somme opposée est née après la notification"}</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le verdict"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Voie"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["voieOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Compensation"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["compensationOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Montant compensé"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["compenseOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Reste exigible sur la facture"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["resteOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Date d'effet"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["effetOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"La date d'effet est un repère de l'outil, calculé à partir des échéances saisies. Le délai de quinze jours de la clause est un repère de rédaction, pas un délai légal. Ce n'est pas un conseil juridique."}</p>
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
