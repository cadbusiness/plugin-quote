/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-pouvoir-signataire-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"forme":"sas","qualite":"salarie_annonce","montant":"38600","plafond":"0","registre":"verifie","apparence":"moyenne","historique":"premier","confirmation":"envoyee","acompte":"prevu","dateDemande":"2026-11-20","delai":"10","dateDebut":"2026-12-07"};

export function VerificateurPouvoirSignataireDevisCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Le client et le signataire"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Forme du client"}</span>
            <select id={"forme"} className={fieldClass} value={String(values["forme"] ?? "")} onChange={(event) => setValue("forme", event.target.value)}>
              <option value={"sarl"}>{"SARL ou EURL"}</option>
              <option value={"sas"}>{"SAS ou SASU"}</option>
              <option value={"sa"}>{"SA"}</option>
              <option value={"association"}>{"Association"}</option>
              <option value={"ei"}>{"Entrepreneur individuel"}</option>
              <option value={"autre"}>{"Autre structure (société civile, GIE, coopérative, etc.)"}</option>
              <option value={"public"}>{"Acheteur public (collectivité, établissement public)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui signe le devis pour le client"}</span>
            <select id={"qualite"} className={fieldClass} value={String(values["qualite"] ?? "")} onChange={(event) => setValue("qualite", event.target.value)}>
              <option value={"dirigeant"}>{"Le représentant légal (gérant, président, directeur général, entrepreneur)"}</option>
              <option value={"dg_statutaire"}>{"Un directeur général ou directeur général délégué de SAS"}</option>
              <option value={"salarie_ecrite"}>{"Un salarié avec une délégation écrite reçue"}</option>
              <option value={"salarie_annonce"}>{"Un salarié qui dit avoir une délégation, pas encore montrée"}</option>
              <option value={"salarie_aucune"}>{"Un salarié sans délégation évoquée (acheteur, responsable de site)"}</option>
              <option value={"mandataire_ecrit"}>{"Un mandataire extérieur avec un mandat écrit reçu"}</option>
              <option value={"mandataire_sans"}>{"Un mandataire extérieur sans mandat écrit"}</option>
              <option value={"inconnu"}>{"Je ne sais pas qui signe"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant hors taxes du devis (€)"}</span>
            <input id={"montant"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["montant"] ?? "")} onChange={(event) => setValue("montant", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Plafond de la délégation ou du mandat (€)"}</span>
            <input id={"plafond"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["plafond"] ?? "")} onChange={(event) => setValue("plafond", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si aucun plafond n'est écrit. Ignoré pour le représentant légal."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le représentant légal du client au registre"}</span>
            <select id={"registre"} className={fieldClass} value={String(values["registre"] ?? "")} onChange={(event) => setValue("registre", event.target.value)}>
              <option value={"verifie"}>{"Vérifié (Annuaire des entreprises ou justificatif d'immatriculation), preuve gardée"}</option>
              <option value={"non_verifie"}>{"Pas vérifié"}</option>
              <option value={"discordant"}>{"Le nom ne correspond pas, ou c'est un ancien dirigeant"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les signes extérieurs"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Ce qui fait croire qu'il peut signer"}</span>
            <select id={"apparence"} className={fieldClass} value={String(values["apparence"] ?? "")} onChange={(event) => setValue("apparence", event.target.value)}>
              <option value={"forte"}>{"Fort : en-tête et cachet, adresse e-mail de la société, direction en copie"}</option>
              <option value={"moyenne"}>{"Moyen : adresse e-mail de la société et fonction indiquée"}</option>
              <option value={"faible"}>{"Faible : adresse personnelle, aucun signe de la société"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Vos relations passées"}</span>
            <select id={"historique"} className={fieldClass} value={String(values["historique"] ?? "")} onChange={(event) => setValue("historique", event.target.value)}>
              <option value={"precedent_paye"}>{"Il a déjà signé des devis que le client a payés"}</option>
              <option value={"premier"}>{"Première commande signée par cette personne"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La confirmation et le calendrier"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Confirmation du représentant légal"}</span>
            <select id={"confirmation"} className={fieldClass} value={String(values["confirmation"] ?? "")} onChange={(event) => setValue("confirmation", event.target.value)}>
              <option value={"confirme"}>{"Confirmation écrite reçue"}</option>
              <option value={"envoyee"}>{"Demande écrite envoyée, délai en cours"}</option>
              <option value={"aucune"}>{"Aucune demande"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Acompte"}</span>
            <select id={"acompte"} className={fieldClass} value={String(values["acompte"] ?? "")} onChange={(event) => setValue("acompte", event.target.value)}>
              <option value={"verse_societe"}>{"Payé depuis un compte au nom du client"}</option>
              <option value={"prevu"}>{"Prévu, pas encore payé"}</option>
              <option value={"aucun"}>{"Pas d'acompte"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date d'envoi de la demande"}</span>
            <input id={"dateDemande"} type="date" className={fieldClass} value={String(values["dateDemande"] ?? "")} onChange={(event) => setValue("dateDemande", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Délai de réponse fixé (jours)"}</span>
            <input id={"delai"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["delai"] ?? "")} onChange={(event) => setValue("delai", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Commande ou démarrage prévu"}</span>
            <input id={"dateDebut"} type="date" className={fieldClass} value={String(values["dateDebut"] ?? "")} onChange={(event) => setValue("dateDebut", event.target.value)} />
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Un fabricant et poseur de rayonnages près de Tours envoie le mardi 17 novembre 2026 un devis de 38 600 € hors taxes à une SAS de logistique d'Orléans. Le jeudi 19 novembre, le responsable d'entrepôt annonce qu'il va le signer et dit avoir une délégation qu'il n'a pas jointe. Avant de traiter le devis comme accepté, le fournisseur envoie le vendredi 20 novembre au président, vérifié sur l'Annuaire des entreprises, une demande de confirmation avec un délai de 10 jours. La commande des montants est prévue le lundi 7 décembre."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Pouvoir du signataire"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["niveauOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Qui est engagé"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["engageOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Fin du délai de confirmation"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["echeanceOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Articles 1153 à 1158 et 1998 du code civil, articles L223-18, L225-56, L227-6 et L123-9 du code de commerce, lus dans leur version en vigueur le 17 novembre 2026. L'outil ne traite ni les règles propres des acheteurs publics, ni les procédures collectives, ni le droit d'un pays étranger. Ce n'est pas un conseil juridique : pour un enjeu important, faites valider par votre avocat."}</p>
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
        <h2 className="text-base font-semibold">{"Le message à envoyer"}</h2>
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
