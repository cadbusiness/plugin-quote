/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/calculateur-declaration-creance-procedure-collective";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"procedure":"redressement","administrateur":"oui","dateJugement":"2026-11-05","datePublication":"2026-11-17","domicile":"meme","surete":"aucune","dateAvertissement":"","etatDeclaration":"a_faire","dateCalcul":"2026-11-18","montantExecute":"28080","dejaPaye":"14040","tva":"20","penalites":"0","dateEcheance":"2026-11-14","posterieur":"0","pieces":"complet","signataire":"representant","contrat":"en_cours","dateMiseEnDemeure":"2026-11-19","reponse":"aucune","reserve":"aucune","demarche":"rien"};

export function CalculateurDeclarationCreanceProcedureCollectiveCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"La procédure"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Procédure ouverte contre le client"}</span>
            <select id={"procedure"} className={fieldClass} value={String(values["procedure"] ?? "")} onChange={(event) => setValue("procedure", event.target.value)}>
              <option value={"sauvegarde"}>{"Sauvegarde"}</option>
              <option value={"redressement"}>{"Redressement judiciaire"}</option>
              <option value={"liquidation"}>{"Liquidation judiciaire"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Administrateur judiciaire désigné"}</span>
            <select id={"administrateur"} className={fieldClass} value={String(values["administrateur"] ?? "")} onChange={(event) => setValue("administrateur", event.target.value)}>
              <option value={"oui"}>{"Oui, un administrateur est nommé dans le jugement"}</option>
              <option value={"non"}>{"Non, pas d'administrateur"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Ignoré en liquidation : c'est le liquidateur qui décide."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date du jugement d'ouverture"}</span>
            <input id={"dateJugement"} type="date" className={fieldClass} value={String(values["dateJugement"] ?? "")} onChange={(event) => setValue("dateJugement", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de publication au BODACC"}</span>
            <input id={"datePublication"} type="date" className={fieldClass} value={String(values["datePublication"] ?? "")} onChange={(event) => setValue("datePublication", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sur bodacc.fr ou dans les annonces de la fiche du client sur l'Annuaire des entreprises."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Où se trouve votre entreprise"}</span>
            <select id={"domicile"} className={fieldClass} value={String(values["domicile"] ?? "")} onChange={(event) => setValue("domicile", event.target.value)}>
              <option value={"meme"}>{"Sur le même territoire que le tribunal (France métropolitaine, ou le même département ou collectivité d'outre-mer)"}</option>
              <option value={"autre"}>{"Hors de ce territoire"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Sûreté ou contrat publié"}</span>
            <select id={"surete"} className={fieldClass} value={String(values["surete"] ?? "")} onChange={(event) => setValue("surete", event.target.value)}>
              <option value={"aucune"}>{"Aucune sûreté publiée, aucun contrat publié"}</option>
              <option value={"publiee"}>{"Oui (sûreté inscrite, contrat publié)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Réception de l'avertissement personnel du mandataire"}</span>
            <input id={"dateAvertissement"} type="date" className={fieldClass} value={String(values["dateAvertissement"] ?? "")} onChange={(event) => setValue("dateAvertissement", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Seulement si vous avez une sûreté ou un contrat publié. Sinon, laissez vide."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Votre déclaration"}</span>
            <select id={"etatDeclaration"} className={fieldClass} value={String(values["etatDeclaration"] ?? "")} onChange={(event) => setValue("etatDeclaration", event.target.value)}>
              <option value={"a_faire"}>{"Pas encore envoyée"}</option>
              <option value={"envoyee"}>{"Déjà envoyée"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date du jour, ou date d'envoi de la déclaration"}</span>
            <input id={"dateCalcul"} type="date" className={fieldClass} value={String(values["dateCalcul"] ?? "")} onChange={(event) => setValue("dateCalcul", event.target.value)} />
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Ce qui a été livré et payé"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Livré ou exécuté avant le jugement, hors taxes (€)"}</span>
            <input id={"montantExecute"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["montantExecute"] ?? "")} onChange={(event) => setValue("montantExecute", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Valeur au prix du devis de ce qui a été livré, posé ou réalisé avant la date du jugement, facturé ou non."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Déjà payé avant le jugement, hors taxes (€)"}</span>
            <input id={"dejaPaye"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["dejaPaye"] ?? "")} onChange={(event) => setValue("dejaPaye", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Acompte et paiements reçus."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Taux de TVA"}</span>
            <select id={"tva"} className={fieldClass} value={String(values["tva"] ?? "")} onChange={(event) => setValue("tva", event.target.value)}>
              <option value={"20"}>{"20 %"}</option>
              <option value={"10"}>{"10 %"}</option>
              <option value={"5.5"}>{"5,5 %"}</option>
              <option value={"0"}>{"0 % (autoliquidation, export, franchise)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Pénalités courues avant le jugement (€)"}</span>
            <input id={"penalites"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["penalites"] ?? "")} onChange={(event) => setValue("penalites", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Échéance de la facture"}</span>
            <input id={"dateEcheance"} type="date" className={fieldClass} value={String(values["dateEcheance"] ?? "")} onChange={(event) => setValue("dateEcheance", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Fourni après le jugement et impayé, hors taxes (€)"}</span>
            <input id={"posterieur"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["posterieur"] ?? "")} onChange={(event) => setValue("posterieur", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Pièces justificatives"}</span>
            <select id={"pieces"} className={fieldClass} value={String(values["pieces"] ?? "")} onChange={(event) => setValue("pieces", event.target.value)}>
              <option value={"complet"}>{"Devis accepté, factures, bons de livraison ou PV, relevé de compte"}</option>
              <option value={"partiel"}>{"Une partie seulement"}</option>
              <option value={"aucun"}>{"Rien de rassemblé"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui signe la déclaration"}</span>
            <select id={"signataire"} className={fieldClass} value={String(values["signataire"] ?? "")} onChange={(event) => setValue("signataire", event.target.value)}>
              <option value={"representant"}>{"Le représentant légal de votre entreprise"}</option>
              <option value={"prepose_pouvoir"}>{"Un salarié avec un pouvoir écrit pour déclarer"}</option>
              <option value={"mandataire_pouvoir"}>{"Un avocat ou un autre mandataire avec pouvoir"}</option>
              <option value={"sans_pouvoir"}>{"Un salarié sans pouvoir écrit"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le contrat et vos démarches"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"État du devis accepté"}</span>
            <select id={"contrat"} className={fieldClass} value={String(values["contrat"] ?? "")} onChange={(event) => setValue("contrat", event.target.value)}>
              <option value={"termine"}>{"Tout a été livré ou exécuté avant le jugement"}</option>
              <option value={"en_cours"}>{"Une partie reste à livrer ou à exécuter"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Réception de votre mise en demeure de prendre parti"}</span>
            <input id={"dateMiseEnDemeure"} type="date" className={fieldClass} value={String(values["dateMiseEnDemeure"] ?? "")} onChange={(event) => setValue("dateMiseEnDemeure", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Laissez vide si vous ne l'avez pas encore envoyée."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Réponse sur la poursuite du contrat"}</span>
            <select id={"reponse"} className={fieldClass} value={String(values["reponse"] ?? "")} onChange={(event) => setValue("reponse", event.target.value)}>
              <option value={"aucune"}>{"Pas de réponse"}</option>
              <option value={"poursuite"}>{"Poursuite demandée"}</option>
              <option value={"refus"}>{"Refus de poursuivre"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Réserve de propriété"}</span>
            <select id={"reserve"} className={fieldClass} value={String(values["reserve"] ?? "")} onChange={(event) => setValue("reserve", event.target.value)}>
              <option value={"aucune"}>{"Pas de clause, ou biens déjà payés"}</option>
              <option value={"reserve"}>{"Clause acceptée, biens livrés impayés"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ce que vous envisagez pour la facture antérieure"}</span>
            <select id={"demarche"} className={fieldClass} value={String(values["demarche"] ?? "")} onChange={(event) => setValue("demarche", event.target.value)}>
              <option value={"rien"}>{"Rien d'autre que la déclaration"}</option>
              <option value={"relance"}>{"Relancer le client ou accepter qu'il la paie"}</option>
              <option value={"injonction"}>{"Une injonction de payer ou une action en paiement"}</option>
              <option value={"compensation"}>{"La déduire d'une somme que vous lui devez"}</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Un atelier de chaudronnerie près de Saint-Étienne a accepté le vendredi 2 octobre 2026 un devis de 46 800 € hors taxes d'une SAS de machines spéciales de Lyon, en deux lots, avec un acompte de 30 %, soit 14 040 € HT. Le premier lot, 28 080 € HT, est livré le jeudi 15 octobre ; sa facture, 14 040 € HT après déduction de l'acompte, vient à échéance le samedi 14 novembre. Le client est placé en redressement judiciaire le jeudi 5 novembre, avec un administrateur ; le jugement est publié au BODACC le mardi 17 novembre 2026. L'atelier fait le point le mercredi 18 novembre, le jour même où sa mise en demeure de prendre parti sur le second lot part en recommandé ; l'administrateur la reçoit le jeudi 19."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Fin du délai de déclaration"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["finOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"À envoyer au plus tard"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["envoiOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Montant à déclarer"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["montantOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Articles L622-7, L622-13, L622-17, L622-21, L622-24 à L622-26, L622-28, L624-9, L627-2, L631-14, L641-3, L641-11-1 et L641-13, et articles R622-21, R622-23, R622-24 et R624-13 du code de commerce ; articles 641 et 642 du code de procédure civile ; lus dans leur version en vigueur le 18 novembre 2026. Les mois se comptent de date à date (article 641) ; si le dernier jour tombe un samedi, un dimanche ou un jour férié national, l'outil indique la prorogation de l'article 642 mais vous conseille d'envoyer la veille ouvrée. Les jours fériés propres à l'Alsace et à la Moselle ne sont pas pris en compte. L'outil ne traite ni la conciliation, ni le mandat ad hoc, ni les procédures ouvertes à l'étranger, ni les créances des salariés, du Trésor et des organismes sociaux. Ce n'est pas un conseil juridique : pour un enjeu important, faites valider par votre avocat."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La déclaration à envoyer"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view["declaration"]?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view["declaration"]?.text || ""} />
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Ce qu'il faut faire"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["actions"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le courrier suivant"}</h2>
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
