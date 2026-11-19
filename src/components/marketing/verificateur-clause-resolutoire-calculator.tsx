/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-clause-resolutoire";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"prestataire","typeClause":"resolutoirePleinDroit","manquement":"impaye","gravite":"grave","miseEnDemeure":"ouiDate","delaiRegulJours":"15","dateMiseEnDemeure":"2027-02-10","mentionClause":"oui","urgence":"non","precisionEngagements":"generale","presentation":"noyee","acceptation":"signee","reciprocite":"reciproque","exclusionForceMajeure":"non","bonneFoi":"non"};

export function VerificateurClauseResolutoireCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"La voie choisie"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"prestataire"}>{"Je suis le prestataire, je rédige la clause"}</option>
              <option value={"client"}>{"Je suis le client, je relis la clause"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Type de sortie du contrat"}</span>
            <select id={"typeClause"} className={fieldClass} value={String(values["typeClause"] ?? "")} onChange={(event) => setValue("typeClause", event.target.value)}>
              <option value={"resolutoirePleinDroit"}>{"Clause résolutoire de plein droit (article 1225)"}</option>
              <option value={"unilaterale"}>{"Résolution unilatérale par notification (article 1226)"}</option>
              <option value={"judiciaire"}>{"Résolution judiciaire seulement (articles 1227 et 1228)"}</option>
              <option value={"aucune"}>{"Aucune clause, rien n'est prévu"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1224 du code civil : trois voies."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Manquement en cause"}</span>
            <select id={"manquement"} className={fieldClass} value={String(values["manquement"] ?? "")} onChange={(event) => setValue("manquement", event.target.value)}>
              <option value={"impaye"}>{"Impayé (facture non réglée)"}</option>
              <option value={"retard"}>{"Retard de livraison ou d'exécution"}</option>
              <option value={"qualite"}>{"Défaut de qualité / non-conformité"}</option>
              <option value={"autre"}>{"Autre manquement"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Gravité du manquement"}</span>
            <select id={"gravite"} className={fieldClass} value={String(values["gravite"] ?? "")} onChange={(event) => setValue("gravite", event.target.value)}>
              <option value={"grave"}>{"Suffisamment grave (obligation essentielle, répétée)"}</option>
              <option value={"discutee"}>{"Discutable (un seul retard, obligation accessoire)"}</option>
              <option value={"legere"}>{"Légère (simple retard isolé, sans conséquence)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Hors clause résolutoire, l'article 1226 exige une inexécution suffisamment grave."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La mise en demeure"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Mise en demeure envoyée"}</span>
            <select id={"miseEnDemeure"} className={fieldClass} value={String(values["miseEnDemeure"] ?? "")} onChange={(event) => setValue("miseEnDemeure", event.target.value)}>
              <option value={"ouiDate"}>{"Oui, avec date connue"}</option>
              <option value={"ouiSansDate"}>{"Oui, sans date connue"}</option>
              <option value={"non"}>{"Non"}</option>
              <option value={"vaine"}>{"Non, jugée vaine (circonstances)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Articles 1225 et 1226 : sauf stipulation contraire ou urgence."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Délai de régularisation (jours)"}</span>
            <input id={"delaiRegulJours"} type="number" className={fieldClass} min={"0"} max={"365"} step={"1"} value={String(values["delaiRegulJours"] ?? "")} onChange={(event) => setValue("delaiRegulJours", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si aucun délai n'est fixé. Repères de l'outil, pas des seuils légaux."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de la mise en demeure"}</span>
            <input id={"dateMiseEnDemeure"} type="date" className={fieldClass} value={String(values["dateMiseEnDemeure"] ?? "")} onChange={(event) => setValue("dateMiseEnDemeure", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Pour calculer la date de fin du délai."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"La mise en demeure mentionne-t-elle la clause ?"}</span>
            <select id={"mentionClause"} className={fieldClass} value={String(values["mentionClause"] ?? "")} onChange={(event) => setValue("mentionClause", event.target.value)}>
              <option value={"oui"}>{"Oui, elle cite expressément la clause résolutoire"}</option>
              <option value={"non"}>{"Non, simple relance sans mention"}</option>
              <option value={"na"}>{"Sans objet (pas de clause résolutoire)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1225 : la mise en demeure ne produit effet que si elle mentionne expressément la clause."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Urgence ou dispense"}</span>
            <select id={"urgence"} className={fieldClass} value={String(values["urgence"] ?? "")} onChange={(event) => setValue("urgence", event.target.value)}>
              <option value={"non"}>{"Pas d'urgence particulière"}</option>
              <option value={"oui"}>{"Urgence caractérisée (article 1226)"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La clause et son acceptation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Précision des engagements visés"}</span>
            <select id={"precisionEngagements"} className={fieldClass} value={String(values["precisionEngagements"] ?? "")} onChange={(event) => setValue("precisionEngagements", event.target.value)}>
              <option value={"noms"}>{"Obligations nommément listées (paiement, délai, conformité)"}</option>
              <option value={"generale"}>{"Formule générale (« toute inexécution d'une obligation du contrat »)"}</option>
              <option value={"vague"}>{"Formule trop vague (« manquement grave » sans plus)"}</option>
              <option value={"aucune"}>{"Aucun engagement précisé"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1225 : préciser les engagements. Cass. com., 3 juin 2026, n° 24-19.612."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Où figure la clause"}</span>
            <select id={"presentation"} className={fieldClass} value={String(values["presentation"] ?? "")} onChange={(event) => setValue("presentation", event.target.value)}>
              <option value={"signature"}>{"Rappelée sur le devis, près de la signature"}</option>
              <option value={"titre"}>{"Dans un article titré, en caractères distincts"}</option>
              <option value={"noyee"}>{"Dans les CGV, même police, sans titre"}</option>
              <option value={"facture"}>{"Seulement sur la facture"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Comment les CGV ont été acceptées"}</span>
            <select id={"acceptation"} className={fieldClass} value={String(values["acceptation"] ?? "")} onChange={(event) => setValue("acceptation", event.target.value)}>
              <option value={"signee"}>{"Jointes au devis signé, qui dit les accepter"}</option>
              <option value={"lien"}>{"Par un lien, sans mention d'acceptation"}</option>
              <option value={"aucune"}>{"Jamais transmises au client"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1119 du code civil."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui peut invoquer la résolution ?"}</span>
            <select id={"reciprocite"} className={fieldClass} value={String(values["reciprocite"] ?? "")} onChange={(event) => setValue("reciprocite", event.target.value)}>
              <option value={"reciproque"}>{"Les deux parties"}</option>
              <option value={"prestataireSeul"}>{"Le prestataire seulement"}</option>
              <option value={"clientSeul"}>{"Le client seulement"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Contrat d'adhésion : article 1171."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Force majeure exclue de la clause ?"}</span>
            <select id={"exclusionForceMajeure"} className={fieldClass} value={String(values["exclusionForceMajeure"] ?? "")} onChange={(event) => setValue("exclusionForceMajeure", event.target.value)}>
              <option value={"oui"}>{"Oui, la force majeure (1218) reste hors clause résolutoire"}</option>
              <option value={"non"}>{"Non, la clause ne le dit pas"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Voir aussi le vérificateur force majeure / imprévision."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Tolérance antérieure du manquement"}</span>
            <select id={"bonneFoi"} className={fieldClass} value={String(values["bonneFoi"] ?? "")} onChange={(event) => setValue("bonneFoi", event.target.value)}>
              <option value={"non"}>{"Aucune tolérance prolongée"}</option>
              <option value={"oui"}>{"Le manquement a été toléré longtemps avant d'agir"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Cass. 1re civ., 31 janvier 1995, n° 92-20.654 ; article 1104."}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le verdict"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Voie retenue"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["voieOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Fin du délai de régularisation"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["delaiOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Qualité de la clause"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["clauseOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Les repères de quinze et trente jours sont ceux de l'outil, pas des seuils légaux. La date de fin de délai est calculée en jours calendaires à partir de la mise en demeure, sans tenir compte des jours fériés ni d'une prorogation."}</p>
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
