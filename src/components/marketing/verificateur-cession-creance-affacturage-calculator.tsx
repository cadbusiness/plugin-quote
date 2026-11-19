/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-cession-creance-affacturage";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"cedant","mode":"affacturage","recours":"avec","montant":"18000","execution":"executee","dateFacture":"2026-11-12","dateEcheance":"2027-01-11","dateCession":"2026-11-16","clauseIncessibilite":"presente","debiteurPro":"pro","ecrit":"oui","notification":"aucune","litige":"avoir","commission":"0.8","tauxFinancement":"5.5","retenueGarantie":"10","fraisFixes":"15"};

export function VerificateurCessionCreanceAffacturageCalculator() {
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
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"cedant"}>{"Je suis le fournisseur et je cède ma facture"}</option>
              <option value={"debiteur"}>{"Je suis le client qui doit payer"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Type d'opération"}</span>
            <select id={"mode"} className={fieldClass} value={String(values["mode"] ?? "")} onChange={(event) => setValue("mode", event.target.value)}>
              <option value={"affacturage"}>{"Affacturage (le factor paie et devient créancier)"}</option>
              <option value={"dailly"}>{"Cession Dailly à une banque (bordereau)"}</option>
              <option value={"civile"}>{"Cession de créance simple (code civil)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Risque d'impayé"}</span>
            <select id={"recours"} className={fieldClass} value={String(values["recours"] ?? "")} onChange={(event) => setValue("recours", event.target.value)}>
              <option value={"avec"}>{"Avec recours contre le fournisseur"}</option>
              <option value={"sans"}>{"Sans recours (garantie d'impayé)"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La facture"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Montant de la facture (€)"}</span>
            <input id={"montant"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["montant"] ?? "")} onChange={(event) => setValue("montant", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"En euros entiers, le montant que le client doit payer."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"État de la prestation"}</span>
            <select id={"execution"} className={fieldClass} value={String(values["execution"] ?? "")} onChange={(event) => setValue("execution", event.target.value)}>
              <option value={"executee"}>{"Livrée ou exécutée, facture émise"}</option>
              <option value={"partielle"}>{"Exécutée en partie"}</option>
              <option value={"future"}>{"Pas encore exécutée"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de la facture"}</span>
            <input id={"dateFacture"} type="date" className={fieldClass} value={String(values["dateFacture"] ?? "")} onChange={(event) => setValue("dateFacture", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date d'échéance"}</span>
            <input id={"dateEcheance"} type="date" className={fieldClass} value={String(values["dateEcheance"] ?? "")} onChange={(event) => setValue("dateEcheance", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de la cession ou du financement"}</span>
            <input id={"dateCession"} type="date" className={fieldClass} value={String(values["dateCession"] ?? "")} onChange={(event) => setValue("dateCession", event.target.value)} />
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le contrat et le client"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Clause qui interdit de céder"}</span>
            <select id={"clauseIncessibilite"} className={fieldClass} value={String(values["clauseIncessibilite"] ?? "")} onChange={(event) => setValue("clauseIncessibilite", event.target.value)}>
              <option value={"aucune"}>{"Aucune"}</option>
              <option value={"presente"}>{"Oui, dans le contrat ou les conditions d'achat du client"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le client"}</span>
            <select id={"debiteurPro"} className={fieldClass} value={String(values["debiteurPro"] ?? "")} onChange={(event) => setValue("debiteurPro", event.target.value)}>
              <option value={"pro"}>{"Entreprise (production, distribution ou services)"}</option>
              <option value={"autre"}>{"Autre cas (à vérifier)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Acte écrit"}</span>
            <select id={"ecrit"} className={fieldClass} value={String(values["ecrit"] ?? "")} onChange={(event) => setValue("ecrit", event.target.value)}>
              <option value={"oui"}>{"Acte, bordereau ou quittance complet"}</option>
              <option value={"incomplet"}>{"Acte incomplet"}</option>
              <option value={"non"}>{"Pas d'acte écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le client est-il informé ?"}</span>
            <select id={"notification"} className={fieldClass} value={String(values["notification"] ?? "")} onChange={(event) => setValue("notification", event.target.value)}>
              <option value={"aucune"}>{"Pas encore"}</option>
              <option value={"notifiee"}>{"Oui, notification écrite"}</option>
              <option value={"acceptee"}>{"Oui, il a pris acte ou accepté par écrit"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Réserves ou avoir"}</span>
            <select id={"litige"} className={fieldClass} value={String(values["litige"] ?? "")} onChange={(event) => setValue("litige", event.target.value)}>
              <option value={"aucun"}>{"Aucun"}</option>
              <option value={"avoir"}>{"Un avoir ou une somme à déduire"}</option>
              <option value={"reserves"}>{"Réserves ou réclamation du client"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le coût du financement"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Commission ou décote (% de la facture)"}</span>
            <input id={"commission"} type="number" className={fieldClass} min={"0"} max={"20"} step={"0.01"} value={String(values["commission"] ?? "")} onChange={(event) => setValue("commission", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Taux de financement (% par an)"}</span>
            <input id={"tauxFinancement"} type="number" className={fieldClass} min={"0"} max={"50"} step={"0.01"} value={String(values["tauxFinancement"] ?? "")} onChange={(event) => setValue("tauxFinancement", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Retenue de garantie (% de la facture)"}</span>
            <input id={"retenueGarantie"} type="number" className={fieldClass} min={"0"} max={"100"} step={"0.1"} value={String(values["retenueGarantie"] ?? "")} onChange={(event) => setValue("retenueGarantie", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Part non avancée, versée après paiement du client selon le contrat."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Frais fixes par facture (€)"}</span>
            <input id={"fraisFixes"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["fraisFixes"] ?? "")} onChange={(event) => setValue("fraisFixes", event.target.value)} />
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Les taux et commissions sont à reprendre de votre offre de financement."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Net versé à la cession"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["netOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Coût total"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["coutOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Coût ramené à l'année"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["tauxOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Durée financée"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["joursOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Retenue versée plus tard"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["retenueOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Le repère de 20 % par an est un seuil de l'outil pour signaler un financement cher, pas un taux légal. Le coût est une estimation à partir de vos chiffres, pas une offre. Ce n'est pas un conseil juridique."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La clause à mettre dans vos devis"}</h2>
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
