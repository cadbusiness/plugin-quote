/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-attestation-assurance-decennale";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"entreprise","relation":"direct","ouvrage":"batiment","forme":"modele","debut":"2026-01-01","fin":"2026-12-31","dateDevis":"2026-10-30","dateOuverture":"2027-01-11","activite":"partielle","montantNonCouvert":"9400","montantDevis":"86000","plafondMarche":"0","coutOperation":"420000","plafondCout":"1500000","zone":"oui","techniques":"couvertes","mDenomination":true,"mIdentifiant":true,"mAssureur":true,"mContrat":true,"mValidite":true,"mEtablissement":true,"mActivites":true,"mSignature":true};

export function VerificateurAttestationAssuranceDecennaleCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Le contexte"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"entreprise"}>{"J'établis le devis et je joins mon attestation"}</option>
              <option value={"client"}>{"Je reçois le devis et je vérifie l'attestation"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le contrôle est le même ; seul le message final change de destinataire."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Lien avec le maître d'ouvrage"}</span>
            <select id={"relation"} className={fieldClass} value={String(values["relation"] ?? "")} onChange={(event) => setValue("relation", event.target.value)}>
              <option value={"direct"}>{"Contrat direct avec le maître d'ouvrage (propriétaire, SCI, promoteur)"}</option>
              <option value={"soustraitant"}>{"Sous-traitance : le devis est adressé à une autre entreprise"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"L'obligation vise le constructeur lié au maître d'ouvrage par un contrat de louage d'ouvrage (code civil, article 1792-1)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Nature des travaux"}</span>
            <select id={"ouvrage"} className={fieldClass} value={String(values["ouvrage"] ?? "")} onChange={(event) => setValue("ouvrage", event.target.value)}>
              <option value={"batiment"}>{"Bâtiment : construction, extension, rénovation avec travaux de construction"}</option>
              <option value={"accessoire"}>{"Voirie, réseaux, parking ou ouvrage de la liste, accessoire à un bâtiment"}</option>
              <option value={"exclu"}>{"Ouvrage exclu et non accessoire : voirie, réseaux, ouvrages routiers, ferroviaires, portuaires, sportifs non couverts…"}</option>
              <option value={"entretien"}>{"Entretien, dépannage ou petite réparation, sans élément nouveau"}</option>
              <option value={"autre"}>{"Je ne sais pas"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Liste des ouvrages exclus : code des assurances, article L. 243-1-1."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Document fourni"}</span>
            <select id={"forme"} className={fieldClass} value={String(values["forme"] ?? "")} onChange={(event) => setValue("forme", event.target.value)}>
              <option value={"modele"}>{"Attestation titrée « Assurance de responsabilité décennale obligatoire »"}</option>
              <option value={"libre"}>{"Attestation au format libre, sans les formules du modèle"}</option>
              <option value={"rcSeule"}>{"Attestation de responsabilité civile seule, sans décennale"}</option>
              <option value={"aucune"}>{"Aucune attestation jointe au devis"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Modèle fixé par l'arrêté du 5 janvier 2016 (code des assurances, article A. 243-3)."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les dates"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Début de la période de validité"}</span>
            <input id={"debut"} type="date" className={fieldClass} value={String(values["debut"] ?? "")} onChange={(event) => setValue("debut", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Fin de la période de validité"}</span>
            <input id={"fin"} type="date" className={fieldClass} value={String(values["fin"] ?? "")} onChange={(event) => setValue("fin", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date du devis"}</span>
            <input id={"dateDevis"} type="date" className={fieldClass} value={String(values["dateDevis"] ?? "")} onChange={(event) => setValue("dateDevis", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date prévue d'ouverture du chantier"}</span>
            <input id={"dateOuverture"} type="date" className={fieldClass} value={String(values["dateOuverture"] ?? "")} onChange={(event) => setValue("dateOuverture", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Avec permis de construire : la déclaration d'ouverture de chantier. Sinon : le premier ordre de service ou, à défaut, le début effectif des travaux. Laissez vide si elle est inconnue."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les activités et les montants"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Les travaux du devis et les activités déclarées"}</span>
            <select id={"activite"} className={fieldClass} value={String(values["activite"] ?? "")} onChange={(event) => setValue("activite", event.target.value)}>
              <option value={"couverte"}>{"Toutes les lignes du devis entrent dans une activité nommée sur l'attestation"}</option>
              <option value={"partielle"}>{"Une partie du devis sort des activités déclarées"}</option>
              <option value={"absente"}>{"Aucune activité de l'attestation ne correspond au devis"}</option>
              <option value={"procede"}>{"L'activité est déclarée pour un procédé précis, le devis en prévoit un autre"}</option>
              <option value={"generique"}>{"L'attestation dit seulement « gros œuvre », « rénovation » ou « tous corps d'état »"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Seuls les travaux déclarés dans le contrat sont couverts."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant des lignes hors activités (€ HT)"}</span>
            <input id={"montantNonCouvert"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["montantNonCouvert"] ?? "")} onChange={(event) => setValue("montantNonCouvert", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Utilisé seulement si une partie du devis sort des activités."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant du devis (€ HT)"}</span>
            <input id={"montantDevis"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["montantDevis"] ?? "")} onChange={(event) => setValue("montantDevis", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Plafond de marché indiqué sur l'attestation (€)"}</span>
            <input id={"plafondMarche"} type="number" className={fieldClass} min={"0"} step={"1000"} value={String(values["plafondMarche"] ?? "")} onChange={(event) => setValue("plafondMarche", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si l'attestation n'en indique pas."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Coût total de l'opération, tous corps d'état (€ HT)"}</span>
            <input id={"coutOperation"} type="number" className={fieldClass} min={"0"} step={"1000"} value={String(values["coutOperation"] ?? "")} onChange={(event) => setValue("coutOperation", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le coût déclaré par le maître d'ouvrage pour toute l'opération, pas seulement votre lot. 0 si inconnu."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Plafond de coût de chantier sur l'attestation (€)"}</span>
            <input id={"plafondCout"} type="number" className={fieldClass} min={"0"} step={"1000"} value={String(values["plafondCout"] ?? "")} onChange={(event) => setValue("plafondCout", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"La somme de la formule « chantiers dont le coût total… n'est pas supérieur à ». 0 si absente."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le chantier est-il dans l'étendue géographique ?"}</span>
            <select id={"zone"} className={fieldClass} value={String(values["zone"] ?? "")} onChange={(event) => setValue("zone", event.target.value)}>
              <option value={"oui"}>{"Oui"}</option>
              <option value={"non"}>{"Non"}</option>
              <option value={"absente"}>{"L'attestation ne la précise pas"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Techniques et produits du devis"}</span>
            <select id={"techniques"} className={fieldClass} value={String(values["techniques"] ?? "")} onChange={(event) => setValue("techniques", event.target.value)}>
              <option value={"couvertes"}>{"Techniques courantes, ou listées sur l'attestation"}</option>
              <option value={"horsListe"}>{"Technique non courante, absente de l'attestation"}</option>
              <option value={"inconnu"}>{"Je ne sais pas"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les mentions présentes sur l'attestation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["mDenomination"]} onChange={(event) => setValue("mDenomination", event.target.checked)} />
              <span>{"Dénomination et adresse de l'assuré"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["mIdentifiant"]} onChange={(event) => setValue("mIdentifiant", event.target.checked)} />
              <span>{"Numéro SIREN ou numéro de TVA"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["mAssureur"]} onChange={(event) => setValue("mAssureur", event.target.checked)} />
              <span>{"Nom, siège et coordonnées de l'assureur"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["mContrat"]} onChange={(event) => setValue("mContrat", event.target.checked)} />
              <span>{"Numéro du contrat"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["mValidite"]} onChange={(event) => setValue("mValidite", event.target.checked)} />
              <span>{"Période de validité"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["mEtablissement"]} onChange={(event) => setValue("mEtablissement", event.target.checked)} />
              <span>{"Date d'établissement"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["mActivites"]} onChange={(event) => setValue("mActivites", event.target.checked)} />
              <span>{"Liste des activités ou missions"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["mSignature"]} onChange={(event) => setValue("mSignature", event.target.checked)} />
              <span>{"Signature de l'assureur ou de son mandataire"}</span>
            </label>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le verdict"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Obligation d'assurance décennale"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["obligation"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Attestation"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["statut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Points bloquants / à compléter"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["compteurs"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Part du devis dans les activités déclarées"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["partCouverte"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"L'attestation n'engage pas l'assureur au-delà du contrat auquel elle renvoie : en cas de doute, demandez les conditions particulières."}</p>
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
