/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-bon-a-tirer-validation-production";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"fabricant","type":"bat_fichier","valideur":"nomme","canal":"email_simple","delaiReponse":"2","silence":"suspendu","perimetre":"partiel","tolerance":"rien","responsabilite":"rien","versions":"oui","prixTour":"45","toursInclus":"2","toursReels":"4","delaiDepart":"bat","delaiProd":"5","dateValidation":"2026-11-16","datePromise":"2026-11-20"};

export function VerificateurBonATirerValidationProductionCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"La validation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"fabricant"}>{"Je fabrique et je fais valider"}</option>
              <option value={"client"}>{"Je suis le client et je valide"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ce qui est soumis"}</span>
            <select id={"type"} className={fieldClass} value={String(values["type"] ?? "")} onChange={(event) => setValue("type", event.target.value)}>
              <option value={"bat_fichier"}>{"BAT fichier (PDF, maquette)"}</option>
              <option value={"epreuve"}>{"Épreuve ou BAT physique"}</option>
              <option value={"echantillon"}>{"Échantillon (matière, teinte, finition)"}</option>
              <option value={"prototype"}>{"Prototype"}</option>
              <option value={"preserie"}>{"Présérie"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui valide chez le client"}</span>
            <select id={"valideur"} className={fieldClass} value={String(values["valideur"] ?? "")} onChange={(event) => setValue("valideur", event.target.value)}>
              <option value={"nomme"}>{"Une personne désignée par écrit (nom et fonction)"}</option>
              <option value={"service"}>{"Un service, sans nom"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Comment la validation est donnée"}</span>
            <select id={"canal"} className={fieldClass} value={String(values["canal"] ?? "")} onChange={(event) => setValue("canal", event.target.value)}>
              <option value={"ecrit_version"}>{"Écrit qui cite le numéro de version"}</option>
              <option value={"email_simple"}>{"E-mail sans numéro de version (« OK pour moi »)"}</option>
              <option value={"oral"}>{"Oralement"}</option>
              <option value={"rien"}>{"Rien de prévu"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Délai de réponse du client (jours ouvrés)"}</span>
            <input id={"delaiReponse"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["delaiReponse"] ?? "")} onChange={(event) => setValue("delaiReponse", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si aucun délai n'est écrit."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Si le client ne répond pas"}</span>
            <select id={"silence"} className={fieldClass} value={String(values["silence"] ?? "")} onChange={(event) => setValue("silence", event.target.value)}>
              <option value={"suspendu"}>{"Production suspendue jusqu'à validation écrite"}</option>
              <option value={"tacite"}>{"BAT réputé accepté après le délai"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Ce que la validation engage"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Ce que la validation fige"}</span>
            <select id={"perimetre"} className={fieldClass} value={String(values["perimetre"] ?? "")} onChange={(event) => setValue("perimetre", event.target.value)}>
              <option value={"liste"}>{"Liste écrite (textes, numéros, visuels, cotes, quantités)"}</option>
              <option value={"partiel"}>{"Quelques éléments seulement"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Tolérances (couleur, cotes, quantité livrée)"}</span>
            <select id={"tolerance"} className={fieldClass} value={String(values["tolerance"] ?? "")} onChange={(event) => setValue("tolerance", event.target.value)}>
              <option value={"ecrite"}>{"Écrites dans le devis"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
              <option value={"sans_objet"}>{"Sans objet pour cette fabrication"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Erreur présente dans la version validée"}</span>
            <select id={"responsabilite"} className={fieldClass} value={String(values["responsabilite"] ?? "")} onChange={(event) => setValue("responsabilite", event.target.value)}>
              <option value={"ecrite"}>{"Le devis dit qui la supporte"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Versions numérotées et conservées"}</span>
            <select id={"versions"} className={fieldClass} value={String(values["versions"] ?? "")} onChange={(event) => setValue("versions", event.target.value)}>
              <option value={"oui"}>{"Oui"}</option>
              <option value={"non"}>{"Non"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les corrections"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Prix d'un tour supplémentaire (€)"}</span>
            <input id={"prixTour"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["prixTour"] ?? "")} onChange={(event) => setValue("prixTour", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si aucun prix n'est écrit."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Tours inclus"}</span>
            <input id={"toursInclus"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["toursInclus"] ?? "")} onChange={(event) => setValue("toursInclus", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Tours réalisés"}</span>
            <input id={"toursReels"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["toursReels"] ?? "")} onChange={(event) => setValue("toursReels", event.target.value)} />
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les dates"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Le délai de fabrication court"}</span>
            <select id={"delaiDepart"} className={fieldClass} value={String(values["delaiDepart"] ?? "")} onChange={(event) => setValue("delaiDepart", event.target.value)}>
              <option value={"bat"}>{"À partir de la validation écrite (écrit dans le devis)"}</option>
              <option value={"commande"}>{"À partir de la commande"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Délai de fabrication (jours ouvrés)"}</span>
            <input id={"delaiProd"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["delaiProd"] ?? "")} onChange={(event) => setValue("delaiProd", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de validation (réelle ou prévue)"}</span>
            <input id={"dateValidation"} type="date" className={fieldClass} value={String(values["dateValidation"] ?? "")} onChange={(event) => setValue("dateValidation", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de livraison promise"}</span>
            <input id={"datePromise"} type="date" className={fieldClass} value={String(values["datePromise"] ?? "")} onChange={(event) => setValue("datePromise", event.target.value)} />
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Un atelier de signalétique fabrique 40 panneaux pour un nouveau site logistique ; la quatrième version du BAT est validée le lundi 16 novembre 2026 pour une livraison promise le vendredi 20."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Livraison calculée"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["livraisonOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Écart avec la date promise"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["ecartOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Validation au plus tard pour tenir la date promise"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["limiteOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Tours supplémentaires"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["toursOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Jours ouvrés comptés du lundi au vendredi, sans les jours fériés : retirez-les vous-même si la période en contient. Le silence ne vaut pas acceptation par principe (article 1120 du code civil). Ce n'est pas un conseil juridique."}</p>
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
