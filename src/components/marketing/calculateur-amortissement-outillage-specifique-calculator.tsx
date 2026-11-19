/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/calculateur-amortissement-outillage-specifique";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"fournisseur","coutOutillage":"18000","mode":"mixte","participation":"6000","quantiteAmortissement":"20000","prixPiece":"2.4","quantiteLivree":"8000","propriete":"client","transfert":"paiement","marquage":"oui","garde":"gratuite","dureeConservation":"36","assurance":"rien","entretien":"partage","restitution":"ecrite","retention":"rien","arret":"solde","plans":"rien"};

export function CalculateurAmortissementOutillageSpecifiqueCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"L'outillage et son prix"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"fournisseur"}>{"Je suis le fabricant qui chiffre l'outillage"}</option>
              <option value={"client"}>{"Je suis le client qui commande les pièces"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Coût de l'outillage (€)"}</span>
            <input id={"coutOutillage"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["coutOutillage"] ?? "")} onChange={(event) => setValue("coutOutillage", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"En euros entiers, le prix de l'outillage pour le client."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Comment l'outillage est payé"}</span>
            <select id={"mode"} className={fieldClass} value={String(values["mode"] ?? "")} onChange={(event) => setValue("mode", event.target.value)}>
              <option value={"separe"}>{"Facturé à part"}</option>
              <option value={"amorti"}>{"Amorti dans le prix des pièces"}</option>
              <option value={"mixte"}>{"Une participation à part, le reste amorti"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Participation facturée à part (€)"}</span>
            <input id={"participation"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["participation"] ?? "")} onChange={(event) => setValue("participation", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Utilisée seulement si le paiement est mixte."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Quantité d'amortissement (pièces)"}</span>
            <input id={"quantiteAmortissement"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["quantiteAmortissement"] ?? "")} onChange={(event) => setValue("quantiteAmortissement", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le nombre de pièces sur lequel la part amortie est répartie."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Prix de la pièce hors outillage (€)"}</span>
            <input id={"prixPiece"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["prixPiece"] ?? "")} onChange={(event) => setValue("prixPiece", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Matière, temps machine, marge : sans l'outillage."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Pièces livrées si les commandes s'arrêtent"}</span>
            <input id={"quantiteLivree"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["quantiteLivree"] ?? "")} onChange={(event) => setValue("quantiteLivree", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le scénario d'arrêt à tester."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"À qui il appartient"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Propriétaire écrit dans le devis"}</span>
            <select id={"propriete"} className={fieldClass} value={String(values["propriete"] ?? "")} onChange={(event) => setValue("propriete", event.target.value)}>
              <option value={"client"}>{"Le client"}</option>
              <option value={"fournisseur"}>{"Le fabricant"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le client devient propriétaire"}</span>
            <select id={"transfert"} className={fieldClass} value={String(values["transfert"] ?? "")} onChange={(event) => setValue("transfert", event.target.value)}>
              <option value={"commande"}>{"Dès l'acceptation du devis"}</option>
              <option value={"paiement"}>{"Quand l'outillage est entièrement payé"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Marquage de l'outillage"}</span>
            <select id={"marquage"} className={fieldClass} value={String(values["marquage"] ?? "")} onChange={(event) => setValue("marquage", event.target.value)}>
              <option value={"oui"}>{"Plaque ou gravure au nom du propriétaire"}</option>
              <option value={"non"}>{"Aucun marquage"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Chez le fabricant"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Garde de l'outillage"}</span>
            <select id={"garde"} className={fieldClass} value={String(values["garde"] ?? "")} onChange={(event) => setValue("garde", event.target.value)}>
              <option value={"gratuite"}>{"Garde écrite, sans frais"}</option>
              <option value={"payante"}>{"Garde écrite, avec frais de stockage"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Durée de conservation après la dernière commande (mois)"}</span>
            <input id={"dureeConservation"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["dureeConservation"] ?? "")} onChange={(event) => setValue("dureeConservation", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si aucune durée n'est écrite."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Assurance de l'outillage"}</span>
            <select id={"assurance"} className={fieldClass} value={String(values["assurance"] ?? "")} onChange={(event) => setValue("assurance", event.target.value)}>
              <option value={"fabricant"}>{"Assuré par le fabricant"}</option>
              <option value={"client"}>{"Assuré par le client"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Entretien et usure"}</span>
            <select id={"entretien"} className={fieldClass} value={String(values["entretien"] ?? "")} onChange={(event) => setValue("entretien", event.target.value)}>
              <option value={"partage"}>{"Entretien courant par le fabricant, remise en état au client"}</option>
              <option value={"fabricant"}>{"Tout à la charge du fabricant"}</option>
              <option value={"client"}>{"Tout à la charge du client"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"À la fin"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Restitution"}</span>
            <select id={"restitution"} className={fieldClass} value={String(values["restitution"] ?? "")} onChange={(event) => setValue("restitution", event.target.value)}>
              <option value={"ecrite"}>{"Délai, lieu et frais écrits"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Rétention en cas d'impayé"}</span>
            <select id={"retention"} className={fieldClass} value={String(values["retention"] ?? "")} onChange={(event) => setValue("retention", event.target.value)}>
              <option value={"clause"}>{"Clause de rétention jusqu'au paiement"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Si les commandes s'arrêtent avant la quantité prévue"}</span>
            <select id={"arret"} className={fieldClass} value={String(values["arret"] ?? "")} onChange={(event) => setValue("arret", event.target.value)}>
              <option value={"solde"}>{"Le client paie le reste non amorti"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Plans et fichiers de l'outillage"}</span>
            <select id={"plans"} className={fieldClass} value={String(values["plans"] ?? "")} onChange={(event) => setValue("plans", event.target.value)}>
              <option value={"client"}>{"Remis au client"}</option>
              <option value={"fabricant"}>{"Gardés par le fabricant"}</option>
              <option value={"rien"}>{"Rien d'écrit"}</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Prix par pièce, amortissement compris"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["prixOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Amortissement par pièce"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["amortOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Facturé à part / amorti dans les pièces"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["partOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Reste à amortir au moment de l'arrêt"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["resteOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Payé par le client pour l'outillage à ce stade"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["payeOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Points bloquants / à compléter"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["compteurs"]?.text || "n/a"}</dd>
          </div>
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.verdict?.className || "")}>{view.verdict?.text}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"L'amortissement pas à pas"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Pièces livrées"}</th>
              <th className="py-2 pr-2 font-semibold">{"Récupéré dans les pièces"}</th>
              <th className="py-2 pr-2 font-semibold">{"Reste à amortir"}</th>
              <th className="py-2 pr-2 font-semibold">{"Payé par le client"}</th>
              <th className="py-2 pr-2 font-semibold">{"Part du coût"}</th>
            </tr></thead>
            <tbody>
              {(view["paliers"]?.rows || []).map((row, index) => (
                <tr key={index} className={rowClass(row.className)}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-t border-mk-border py-2 pr-2 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody></table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"La ligne surlignée correspond au scénario d'arrêt saisi. L'amortissement par pièce est arrondi au centime supérieur, et le montant récupéré est plafonné à la part amortie. C'est un amortissement commercial, inscrit dans le prix : pas une règle comptable ni une règle légale."}</p>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Les articles cités sont ceux du code civil, lus dans leur version en vigueur. Leur application à votre outillage dépend du contrat et des faits : ce n'est pas un conseil juridique."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La clause à mettre dans le devis"}</h2>
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
