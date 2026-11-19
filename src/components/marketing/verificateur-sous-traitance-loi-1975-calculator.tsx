/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-sous-traitance-loi-1975";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"sousTraitant","natureSousTraite":"travailSpecifique","contratPrincipal":"entreprisePrive","secteur":"btp","rang":"premier","moType":"entreprise","contratEtranger":"non","acceptation":"tacite","agrement":"tacite","garantie":"caution","moConnaissance":"oui","moMiseEnDemeure":"non","clauseRenonciation":"non","montantSousTraite":"14600","dejaPaye":"4380","resteDuMO":"19440","miseEnDemeure":"avecCopie","dateMiseEnDemeure":"2027-03-01"};

export function VerificateurSousTraitanceLoi1975Calculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"La situation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"sousTraitant"}>{"Je suis le sous-traitant, je veux être payé"}</option>
              <option value={"entreprisePrincipale"}>{"Je suis l'entreprise principale, je sous-traite"}</option>
              <option value={"maitreOuvrage"}>{"Je suis le maître de l'ouvrage (le client final)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ce que fait le sous-traitant"}</span>
            <select id={"natureSousTraite"} className={fieldClass} value={String(values["natureSousTraite"] ?? "")} onChange={(event) => setValue("natureSousTraite", event.target.value)}>
              <option value={"travailSpecifique"}>{"Un travail spécifique, fait pour ce chantier ou ce client"}</option>
              <option value={"fournitureSerie"}>{"Une fourniture de produits standard, sur catalogue"}</option>
              <option value={"incertain"}>{"Un peu des deux, à qualifier"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1er : sous-traiter, c'est confier l'exécution d'un contrat d'entreprise."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Contrat entre le maître de l'ouvrage et l'entreprise principale"}</span>
            <select id={"contratPrincipal"} className={fieldClass} value={String(values["contratPrincipal"] ?? "")} onChange={(event) => setValue("contratPrincipal", event.target.value)}>
              <option value={"entreprisePrive"}>{"Contrat d'entreprise privé (travaux, fabrication sur mesure, prestation)"}</option>
              <option value={"marchePublic"}>{"Marché public (acheteur soumis au code de la commande publique)"}</option>
              <option value={"ventePrincipale"}>{"Vente d'un produit fini"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Domaine"}</span>
            <select id={"secteur"} className={fieldClass} value={String(values["secteur"] ?? "")} onChange={(event) => setValue("secteur", event.target.value)}>
              <option value={"btp"}>{"Bâtiment ou travaux publics"}</option>
              <option value={"industriel"}>{"Sous-traitance industrielle"}</option>
              <option value={"services"}>{"Autre prestation de services"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"L'article 14-1 vise le BTP et la sous-traitance industrielle."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Rang du sous-traitant"}</span>
            <select id={"rang"} className={fieldClass} value={String(values["rang"] ?? "")} onChange={(event) => setValue("rang", event.target.value)}>
              <option value={"premier"}>{"Premier rang (contrat avec l'entreprise principale)"}</option>
              <option value={"second"}>{"Second rang ou plus"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le maître de l'ouvrage est"}</span>
            <select id={"moType"} className={fieldClass} value={String(values["moType"] ?? "")} onChange={(event) => setValue("moType", event.target.value)}>
              <option value={"entreprise"}>{"Une entreprise ou une autre personne morale"}</option>
              <option value={"particulierLogement"}>{"Un particulier qui construit son propre logement"}</option>
              <option value={"acheteurPublic"}>{"Un acheteur public"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Loi choisie dans les contrats"}</span>
            <select id={"contratEtranger"} className={fieldClass} value={String(values["contratEtranger"] ?? "")} onChange={(event) => setValue("contratEtranger", event.target.value)}>
              <option value={"non"}>{"Droit français"}</option>
              <option value={"oui"}>{"Une loi étrangère"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Acceptation et garantie"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Acceptation du sous-traitant par le maître de l'ouvrage"}</span>
            <select id={"acceptation"} className={fieldClass} value={String(values["acceptation"] ?? "")} onChange={(event) => setValue("acceptation", event.target.value)}>
              <option value={"expresse"}>{"Acceptation écrite (acte signé, DC4, courrier)"}</option>
              <option value={"tacite"}>{"Acceptation tacite (actes sans équivoque du maître de l'ouvrage)"}</option>
              <option value={"informe"}>{"Maître de l'ouvrage seulement informé, sans acte"}</option>
              <option value={"aucune"}>{"Jamais présenté au maître de l'ouvrage"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 3 : à la conclusion et pendant toute la durée du contrat."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Agrément des conditions de paiement"}</span>
            <select id={"agrement"} className={fieldClass} value={String(values["agrement"] ?? "")} onChange={(event) => setValue("agrement", event.target.value)}>
              <option value={"oui"}>{"Agréées par écrit"}</option>
              <option value={"tacite"}>{"Agrément tacite (paiements directs, validation des échéances)"}</option>
              <option value={"non"}>{"Jamais agréées"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Garantie de paiement (article 14)"}</span>
            <select id={"garantie"} className={fieldClass} value={String(values["garantie"] ?? "")} onChange={(event) => setValue("garantie", event.target.value)}>
              <option value={"caution"}>{"Caution bancaire remise avant le sous-traité (ou avant le début des travaux)"}</option>
              <option value={"cautionTardive"}>{"Caution remise après la signature ou le début des travaux"}</option>
              <option value={"delegation"}>{"Délégation de paiement signée par le maître de l'ouvrage"}</option>
              <option value={"delegationEP"}>{"Délégation qui désigne un autre payeur que le maître de l'ouvrage"}</option>
              <option value={"aucune"}>{"Ni caution ni délégation"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le maître de l'ouvrage connaît-il la présence du sous-traitant ?"}</span>
            <select id={"moConnaissance"} className={fieldClass} value={String(values["moConnaissance"] ?? "")} onChange={(event) => setValue("moConnaissance", event.target.value)}>
              <option value={"oui"}>{"Oui, il sait qu'il intervient"}</option>
              <option value={"non"}>{"Non, il l'ignore"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le maître de l'ouvrage a-t-il mis l'entreprise principale en demeure ?"}</span>
            <select id={"moMiseEnDemeure"} className={fieldClass} value={String(values["moMiseEnDemeure"] ?? "")} onChange={(event) => setValue("moMiseEnDemeure", event.target.value)}>
              <option value={"oui"}>{"Oui, par écrit"}</option>
              <option value={"non"}>{"Non"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 14-1, si un manquement est visible."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le sous-traité contient-il une renonciation ?"}</span>
            <select id={"clauseRenonciation"} className={fieldClass} value={String(values["clauseRenonciation"] ?? "")} onChange={(event) => setValue("clauseRenonciation", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui (action directe, caution ou paiement direct)"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"L'argent et la mise en demeure"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Montant du sous-traité (€)"}</span>
            <input id={"montantSousTraite"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["montantSousTraite"] ?? "")} onChange={(event) => setValue("montantSousTraite", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"En euros entiers, tel qu'il figure au sous-traité."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Déjà payé au sous-traitant (€)"}</span>
            <input id={"dejaPaye"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["dejaPaye"] ?? "")} onChange={(event) => setValue("dejaPaye", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ce que le maître de l'ouvrage doit encore à l'entreprise principale (€)"}</span>
            <input id={"resteDuMO"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["resteDuMO"] ?? "")} onChange={(event) => setValue("resteDuMO", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"À la date où il reçoit la copie de la mise en demeure (article 13)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Mise en demeure de l'entreprise principale"}</span>
            <select id={"miseEnDemeure"} className={fieldClass} value={String(values["miseEnDemeure"] ?? "")} onChange={(event) => setValue("miseEnDemeure", event.target.value)}>
              <option value={"avecCopie"}>{"Envoyée, copie au maître de l'ouvrage"}</option>
              <option value={"sansCopie"}>{"Envoyée, sans copie au maître de l'ouvrage"}</option>
              <option value={"declarationCreance"}>{"Entreprise principale en liquidation, créance déclarée"}</option>
              <option value={"non"}>{"Pas encore envoyée"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 12 : un mois après la mise en demeure restée sans paiement."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de la mise en demeure"}</span>
            <input id={"dateMiseEnDemeure"} type="date" className={fieldClass} value={String(values["dateMiseEnDemeure"] ?? "")} onChange={(event) => setValue("dateMiseEnDemeure", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Pour calculer la date d'ouverture de l'action directe."}</p>
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
            <dt className="text-sm text-mk-muted">{"Montant que l'action peut viser"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["montantOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Ouverture de l'action directe"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["ouvertureOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"La date d'ouverture est un repère de l'outil : un mois calendaire après la date de mise en demeure saisie, sans jours fériés ni prorogation. Par prudence, comptez à partir de la réception de la lettre. Les montants sont pris tels que vous les saisissez ; ce ne sont pas des seuils légaux, sauf le seuil de 600 euros du paiement direct, cité tel quel."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Les clauses rédigées"}</h2>
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
