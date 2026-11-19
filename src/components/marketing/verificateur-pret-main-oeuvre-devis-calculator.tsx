/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-pret-main-oeuvre-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"cadre":"classique","objet":"assistance","livrable":"aucun","prix":"heure_personne","dureeMois":"6","nbPersonnes":"2","encadrement":"client","ordres":"client","horaires":"client","integration":"oui","materiel":"client","savoirFaire":"identique","choixPersonnes":"client","formalites":"aucun","salaireBrut":"2600","tauxCharges":"42","fraisMensuels":"150","prixMensuel":"5760"};

export function VerificateurPretMainOeuvreDevisCalculator() {
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
            <span className="text-sm font-medium">{"Votre entreprise"}</span>
            <select id={"cadre"} className={fieldClass} value={String(values["cadre"] ?? "")} onChange={(event) => setValue("cadre", event.target.value)}>
              <option value={"classique"}>{"Entreprise classique (ni intérim, ni portage)"}</option>
              <option value={"ett"}>{"Entreprise de travail temporaire, de temps partagé ou de portage"}</option>
              <option value={"l8241_3"}>{"Prêt dans le dispositif de l'article L8241-3 (grand groupe vers PME)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ce que vous vendez"}</span>
            <select id={"objet"} className={fieldClass} value={String(values["objet"] ?? "")} onChange={(event) => setValue("objet", event.target.value)}>
              <option value={"prestation"}>{"Une prestation ou des travaux définis"}</option>
              <option value={"assistance"}>{"De l'assistance technique ou de la régie"}</option>
              <option value={"mad"}>{"Une mise à disposition de personnel assumée"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Résultat ou livrable décrit dans le devis"}</span>
            <select id={"livrable"} className={fieldClass} value={String(values["livrable"] ?? "")} onChange={(event) => setValue("livrable", event.target.value)}>
              <option value={"defini"}>{"Oui, défini et vérifiable"}</option>
              <option value={"partiel"}>{"En partie (objet vague)"}</option>
              <option value={"aucun"}>{"Non, seulement des personnes et une durée"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Mode de prix"}</span>
            <select id={"prix"} className={fieldClass} value={String(values["prix"] ?? "")} onChange={(event) => setValue("prix", event.target.value)}>
              <option value={"forfait"}>{"Forfait pour un résultat"}</option>
              <option value={"unites"}>{"Unités d'œuvre (prix par intervention ou par livrable)"}</option>
              <option value={"temps_objet"}>{"Temps passé sur un objet défini"}</option>
              <option value={"heure_personne"}>{"Taux horaire ou journalier par personne présente"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Durée prévue (mois)"}</span>
            <input id={"dureeMois"} type="number" className={fieldClass} min={"0"} max={"120"} step={"1"} value={String(values["dureeMois"] ?? "")} onChange={(event) => setValue("dureeMois", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Nombre de personnes"}</span>
            <input id={"nbPersonnes"} type="number" className={fieldClass} min={"0"} max={"50"} step={"1"} value={String(values["nbPersonnes"] ?? "")} onChange={(event) => setValue("nbPersonnes", event.target.value)} />
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"L'organisation sur place"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Qui encadre vos salariés sur le site"}</span>
            <select id={"encadrement"} className={fieldClass} value={String(values["encadrement"] ?? "")} onChange={(event) => setValue("encadrement", event.target.value)}>
              <option value={"prestataire"}>{"Votre chef d'équipe ou référent"}</option>
              <option value={"mixte"}>{"Votre référent, avec une coordination du client"}</option>
              <option value={"client"}>{"Le personnel du client"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui donne les tâches au quotidien"}</span>
            <select id={"ordres"} className={fieldClass} value={String(values["ordres"] ?? "")} onChange={(event) => setValue("ordres", event.target.value)}>
              <option value={"prestataire"}>{"Vous (les demandes du client passent par vous)"}</option>
              <option value={"client"}>{"Le client, directement à vos salariés"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui fixe les horaires et valide les congés"}</span>
            <select id={"horaires"} className={fieldClass} value={String(values["horaires"] ?? "")} onChange={(event) => setValue("horaires", event.target.value)}>
              <option value={"prestataire"}>{"Vous"}</option>
              <option value={"client"}>{"Le client"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Vos salariés sont fondus dans une équipe du client"}</span>
            <select id={"integration"} className={fieldClass} value={String(values["integration"] ?? "")} onChange={(event) => setValue("integration", event.target.value)}>
              <option value={"non"}>{"Non, ils forment votre équipe"}</option>
              <option value={"oui"}>{"Oui, même poste et même planning que ses salariés"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui fournit l'outillage et les équipements"}</span>
            <select id={"materiel"} className={fieldClass} value={String(values["materiel"] ?? "")} onChange={(event) => setValue("materiel", event.target.value)}>
              <option value={"prestataire"}>{"Vous"}</option>
              <option value={"mixte"}>{"Partagé (le client fournit l'accès, le local, l'énergie)"}</option>
              <option value={"client"}>{"Le client"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Votre savoir-faire par rapport aux salariés du client"}</span>
            <select id={"savoirFaire"} className={fieldClass} value={String(values["savoirFaire"] ?? "")} onChange={(event) => setValue("savoirFaire", event.target.value)}>
              <option value={"specifique"}>{"Spécifique, le client ne l'a pas"}</option>
              <option value={"proche"}>{"Proche du sien, avec un apport propre (méthode, audit, dossier)"}</option>
              <option value={"identique"}>{"Identique, ils feront la même chose que ses salariés"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui choisit les personnes"}</span>
            <select id={"choixPersonnes"} className={fieldClass} value={String(values["choixPersonnes"] ?? "")} onChange={(event) => setValue("choixPersonnes", event.target.value)}>
              <option value={"prestataire"}>{"Vous, et vous pouvez les remplacer"}</option>
              <option value={"client"}>{"Le client les a désignées nommément"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Formalités d'une mise à disposition (accord, convention, avenant, CSE)"}</span>
            <select id={"formalites"} className={fieldClass} value={String(values["formalites"] ?? "")} onChange={(event) => setValue("formalites", event.target.value)}>
              <option value={"complet"}>{"Toutes faites"}</option>
              <option value={"partiel"}>{"En partie"}</option>
              <option value={"aucun"}>{"Aucune"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le coût par personne et par mois"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Salaire brut mensuel (€)"}</span>
            <input id={"salaireBrut"} type="number" className={fieldClass} min={"0"} step={"10"} value={String(values["salaireBrut"] ?? "")} onChange={(event) => setValue("salaireBrut", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Charges patronales (% du brut)"}</span>
            <input id={"tauxCharges"} type="number" className={fieldClass} min={"0"} max={"100"} step={"0.5"} value={String(values["tauxCharges"] ?? "")} onChange={(event) => setValue("tauxCharges", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Frais professionnels remboursés (€ par mois)"}</span>
            <input id={"fraisMensuels"} type="number" className={fieldClass} min={"0"} step={"10"} value={String(values["fraisMensuels"] ?? "")} onChange={(event) => setValue("fraisMensuels", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Prix facturé (€ HT par personne et par mois)"}</span>
            <input id={"prixMensuel"} type="number" className={fieldClass} min={"0"} step={"10"} value={String(values["prixMensuel"] ?? "")} onChange={(event) => setValue("prixMensuel", event.target.value)} />
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Une PME de maintenance électrique de Riom reçoit le lundi 16 novembre 2026 la demande d'une biscuiterie : deux électriciens du 4 janvier au 2 juillet 2027, en deux-huit avec l'équipe de l'usine, planning donné chaque matin par le responsable maintenance, environ 38 € de l'heure. Le taux de charges de 42 % est une hypothèse, pas un taux réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Niveau d'indices de fourniture de personnel"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["niveauOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Coût refacturable par personne et par mois"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["coutOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Prix facturé par personne et par mois"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["prixOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Écart prix moins coût, par personne et par mois"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["ecartOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Écart sur toute la durée"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["ecartTotalOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Points bloquants / à surveiller"}</dt>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Articles L8231-1, L8234-1, L8241-1, L8241-2, L8241-3 et L8243-1 du code du travail et article 131-38 du code pénal, lus dans leur version en vigueur le 19 novembre 2026. La grille d'indices (sur 18) est une construction de cet outil, tirée de décisions de la Cour de cassation : aucun barème officiel n'existe, aucun indice ne décide seul, et ce qui se passe sur le terrain compte plus que le devis. Ce n'est pas un conseil juridique."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La clause à coller dans le devis"}</h2>
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
