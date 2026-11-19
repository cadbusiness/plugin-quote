/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-clause-non-sollicitation-personnel";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"prestataire","relation":"client","dateDebut":"2026-12-01","dureeContratMois":"12","dureeApresMois":"24","interet":"silence","personnes":"tous","actes":"indirect","initiative":"silence","derogation":"prevue","reciprocite":"unilaterale","sanction":"indemnite","indemniteMois":"12","salaireMensuel":"3200","acceptation":"cgvSignees","negociation":"adhesion"};

export function VerificateurClauseNonSollicitationPersonnelCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Le contrat"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"prestataire"}>{"Je suis le prestataire, je rédige la clause"}</option>
              <option value={"client"}>{"Je suis le client, je relis la clause"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le contrôle est le même ; seul le message final change de sens."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Entre qui la clause est-elle signée ?"}</span>
            <select id={"relation"} className={fieldClass} value={String(values["relation"] ?? "")} onChange={(event) => setValue("relation", event.target.value)}>
              <option value={"client"}>{"Un client et son prestataire de services"}</option>
              <option value={"concurrents"}>{"Des entreprises concurrentes, ou membres d'un même réseau"}</option>
              <option value={"interim"}>{"Une agence d'intérim et une entreprise utilisatrice"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"En intérim, l'article L1251-44 du code du travail s'applique."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Début du contrat"}</span>
            <input id={"dateDebut"} type="date" className={fieldClass} value={String(values["dateDebut"] ?? "")} onChange={(event) => setValue("dateDebut", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Durée du contrat (mois)"}</span>
            <input id={"dureeContratMois"} type="number" className={fieldClass} min={"1"} max={"120"} step={"1"} value={String(values["dureeContratMois"] ?? "")} onChange={(event) => setValue("dureeContratMois", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Interdiction après la fin (mois)"}</span>
            <input id={"dureeApresMois"} type="number" className={fieldClass} min={"0"} max={"120"} step={"1"} value={String(values["dureeApresMois"] ?? "")} onChange={(event) => setValue("dureeApresMois", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si elle ne joue que pendant le contrat."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La clause"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"L'intérêt protégé"}</span>
            <select id={"interet"} className={fieldClass} value={String(values["interet"] ?? "")} onChange={(event) => setValue("interet", event.target.value)}>
              <option value={"documente"}>{"Expliqué dans la clause, avec des pièces (formations, embauches, rôle dans le contrat)"}</option>
              <option value={"silence"}>{"La clause n'explique pas pourquoi elle existe"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Celui qui invoque la clause doit en démontrer la proportionnalité (Cass. com., 23 septembre 2026, n° 24-21.805)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Personnes visées"}</span>
            <select id={"personnes"} className={fieldClass} value={String(values["personnes"] ?? "")} onChange={(event) => setValue("personnes", event.target.value)}>
              <option value={"intervenants"}>{"Les personnes qui ont travaillé sur le contrat"}</option>
              <option value={"metier"}>{"Un métier ou un service entier (« les techniciens »)"}</option>
              <option value={"tous"}>{"Tout le personnel du prestataire"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ce qui est interdit"}</span>
            <select id={"actes"} className={fieldClass} value={String(values["actes"] ?? "")} onChange={(event) => setValue("actes", event.target.value)}>
              <option value={"sollicitation"}>{"Seulement solliciter, démarcher, faire une offre"}</option>
              <option value={"embauche"}>{"Seulement embaucher directement"}</option>
              <option value={"indirect"}>{"Embaucher ou faire travailler, directement ou par personne interposée"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Si le salarié postule de lui-même"}</span>
            <select id={"initiative"} className={fieldClass} value={String(values["initiative"] ?? "")} onChange={(event) => setValue("initiative", event.target.value)}>
              <option value={"exclue"}>{"Exclu : réponse à une offre publique non ciblée"}</option>
              <option value={"silence"}>{"La clause n'en dit rien"}</option>
              <option value={"incluse"}>{"Interdit aussi, quelle que soit l'initiative"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Dérogation"}</span>
            <select id={"derogation"} className={fieldClass} value={String(values["derogation"] ?? "")} onChange={(event) => setValue("derogation", event.target.value)}>
              <option value={"prevue"}>{"Possible par accord écrit du prestataire"}</option>
              <option value={"silence"}>{"Rien de prévu"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Utile, mais ne suffit pas à rendre la clause proportionnée (Cass. com., 27 mai 2021)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Réciprocité"}</span>
            <select id={"reciprocite"} className={fieldClass} value={String(values["reciprocite"] ?? "")} onChange={(event) => setValue("reciprocite", event.target.value)}>
              <option value={"unilaterale"}>{"Seul le client s'engage"}</option>
              <option value={"reciproque"}>{"Chaque partie s'engage envers l'autre"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La sanction et l'acceptation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Sanction prévue"}</span>
            <select id={"sanction"} className={fieldClass} value={String(values["sanction"] ?? "")} onChange={(event) => setValue("sanction", event.target.value)}>
              <option value={"indemnite"}>{"Une indemnité en mois de salaire brut"}</option>
              <option value={"droitCommun"}>{"Rien : préjudice à prouver"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Une indemnité forfaitaire est une clause pénale (article 1231-5 du code civil)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Indemnité (mois de salaire)"}</span>
            <input id={"indemniteMois"} type="number" className={fieldClass} min={"0"} max={"60"} step={"1"} value={String(values["indemniteMois"] ?? "")} onChange={(event) => setValue("indemniteMois", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Salaire brut mensuel (€)"}</span>
            <input id={"salaireMensuel"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["salaireMensuel"] ?? "")} onChange={(event) => setValue("salaireMensuel", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"D'une personne visée, pour chiffrer."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Comment la clause a été acceptée"}</span>
            <select id={"acceptation"} className={fieldClass} value={String(values["acceptation"] ?? "")} onChange={(event) => setValue("acceptation", event.target.value)}>
              <option value={"signe"}>{"Écrite dans le devis signé"}</option>
              <option value={"cgvSignees"}>{"Dans des CGV jointes, que le devis signé dit accepter"}</option>
              <option value={"cgvVerso"}>{"Dans des CGV au verso ou en lien, sans mention d'acceptation"}</option>
              <option value={"aucune"}>{"CGV jamais transmises au client"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1119 du code civil : connaissance et acceptation."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"La clause a-t-elle été négociée ?"}</span>
            <select id={"negociation"} className={fieldClass} value={String(values["negociation"] ?? "")} onChange={(event) => setValue("negociation", event.target.value)}>
              <option value={"negociee"}>{"Oui, discutée et ajustée avec le client"}</option>
              <option value={"adhesion"}>{"Non, CGV standard non négociables"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Contrat d'adhésion : article 1171."}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le verdict"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Fin du contrat"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["finContrat"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Fin de l'interdiction"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["finInterdiction"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Indemnité prévue"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["indemniteOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Les repères de douze et vingt-quatre mois sont ceux de l'outil, pas des seuils légaux. Le juge apprécie la proportionnalité au cas par cas, au regard de l'objet du contrat."}</p>
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
