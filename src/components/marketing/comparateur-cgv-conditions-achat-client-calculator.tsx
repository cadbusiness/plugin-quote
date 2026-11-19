/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/comparateur-cgv-conditions-achat-client";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"cgvStatut":"jointes","cgaStatut":"commande","primaute":true,"cgv_paiement":"oui","cga_paiement":"contraire","cp_paiement":false,"cgv_penalites":"oui","cga_penalites":"absente","cp_penalites":false,"cgv_reserve":"oui","cga_reserve":"contraire","cp_reserve":false,"cgv_responsabilite":"oui","cga_responsabilite":"contraire","cp_responsabilite":false,"cgv_retard":"non","cga_retard":"compatible","cp_retard":false,"cgv_juridiction":"oui","cga_juridiction":"contraire","cp_juridiction":false,"cgv_annulation":"oui","cga_annulation":"absente","cp_annulation":false,"cgv_revision":"non","cga_revision":"absente","cp_revision":false,"montant":"28400","taux":"6","cgvDelai":"30","cgaDelai":"60","cgaFinDeMois":false};

export function ComparateurCgvConditionsAchatClientCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Comment les deux textes ont circulé"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Vos conditions générales de vente"}</span>
            <select id={"cgvStatut"} className={fieldClass} value={String(values["cgvStatut"] ?? "")} onChange={(event) => setValue("cgvStatut", event.target.value)}>
              <option value={"signees"}>{"Jointes au devis, et le client a signé le devis"}</option>
              <option value={"jointes"}>{"Jointes au devis, mais le client a commandé par son propre bon de commande"}</option>
              <option value={"facture"}>{"Seulement au dos des factures ou des bons de livraison"}</option>
              <option value={"aucune"}>{"Pas transmises"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Des conditions générales n'ont effet que si l'autre partie les a connues et acceptées (code civil, article 1119)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Les conditions générales d'achat du client"}</span>
            <select id={"cgaStatut"} className={fieldClass} value={String(values["cgaStatut"] ?? "")} onChange={(event) => setValue("cgaStatut", event.target.value)}>
              <option value={"commande"}>{"Au dos ou en annexe du bon de commande, et vous avez exécuté la commande"}</option>
              <option value={"portail"}>{"Acceptées sur un portail fournisseur ou dans un appel d'offres"}</option>
              <option value={"refus"}>{"Refusées par écrit avant d'exécuter, et le client a confirmé vos conditions"}</option>
              <option value={"aucune"}>{"Le client n'en a pas envoyé"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Un bon de commande qui modifie votre devis vaut nouvelle offre (article 1118) ; l'exécuter sans réserve peut valoir acceptation (article 1113)."}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["primaute"]} onChange={(event) => setValue("primaute", event.target.checked)} />
              <span>{"Vos CGV disent qu'elles « prévalent sur toute condition d'achat »"}</span>
            </label>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Clause par clause"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Clause"}</th>
              <th className="py-2 pr-2 font-semibold">{"Vos CGV"}</th>
              <th className="py-2 pr-2 font-semibold">{"Conditions d'achat"}</th>
              <th className="py-2 pr-2 font-semibold">{"Dans le devis signé"}</th>
            </tr></thead>
            <tbody>
              <tr>
                <td className="py-2 pr-2 align-top">{"Délai de paiement"}</td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cgv_paiement"} className={fieldClass} value={String(values["cgv_paiement"] ?? "")} onChange={(event) => setValue("cgv_paiement", event.target.value)}>
                    <option value={"oui"}>{"Prévue"}</option>
                    <option value={"non"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cga_paiement"} className={fieldClass} value={String(values["cga_paiement"] ?? "")} onChange={(event) => setValue("cga_paiement", event.target.value)}>
                    <option value={"contraire"}>{"Contraire"}</option>
                    <option value={"compatible"}>{"Prévue, sans conflit"}</option>
                    <option value={"absente"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <label className="flex items-start gap-2 text-sm leading-5">
                    <input type="checkbox" className="mt-1" checked={!!values["cp_paiement"]} onChange={(event) => setValue("cp_paiement", event.target.checked)} />
                    <span>{"cp_paiement"}</span>
                  </label>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-2 align-top">{"Pénalités de retard de paiement"}</td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cgv_penalites"} className={fieldClass} value={String(values["cgv_penalites"] ?? "")} onChange={(event) => setValue("cgv_penalites", event.target.value)}>
                    <option value={"oui"}>{"Prévue"}</option>
                    <option value={"non"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cga_penalites"} className={fieldClass} value={String(values["cga_penalites"] ?? "")} onChange={(event) => setValue("cga_penalites", event.target.value)}>
                    <option value={"contraire"}>{"Contraire"}</option>
                    <option value={"compatible"}>{"Prévue, sans conflit"}</option>
                    <option value={"absente"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <label className="flex items-start gap-2 text-sm leading-5">
                    <input type="checkbox" className="mt-1" checked={!!values["cp_penalites"]} onChange={(event) => setValue("cp_penalites", event.target.checked)} />
                    <span>{"cp_penalites"}</span>
                  </label>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-2 align-top">{"Réserve de propriété"}</td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cgv_reserve"} className={fieldClass} value={String(values["cgv_reserve"] ?? "")} onChange={(event) => setValue("cgv_reserve", event.target.value)}>
                    <option value={"oui"}>{"Prévue"}</option>
                    <option value={"non"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cga_reserve"} className={fieldClass} value={String(values["cga_reserve"] ?? "")} onChange={(event) => setValue("cga_reserve", event.target.value)}>
                    <option value={"contraire"}>{"Contraire"}</option>
                    <option value={"compatible"}>{"Prévue, sans conflit"}</option>
                    <option value={"absente"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <label className="flex items-start gap-2 text-sm leading-5">
                    <input type="checkbox" className="mt-1" checked={!!values["cp_reserve"]} onChange={(event) => setValue("cp_reserve", event.target.checked)} />
                    <span>{"cp_reserve"}</span>
                  </label>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-2 align-top">{"Limitation de responsabilité"}</td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cgv_responsabilite"} className={fieldClass} value={String(values["cgv_responsabilite"] ?? "")} onChange={(event) => setValue("cgv_responsabilite", event.target.value)}>
                    <option value={"oui"}>{"Prévue"}</option>
                    <option value={"non"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cga_responsabilite"} className={fieldClass} value={String(values["cga_responsabilite"] ?? "")} onChange={(event) => setValue("cga_responsabilite", event.target.value)}>
                    <option value={"contraire"}>{"Contraire"}</option>
                    <option value={"compatible"}>{"Prévue, sans conflit"}</option>
                    <option value={"absente"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <label className="flex items-start gap-2 text-sm leading-5">
                    <input type="checkbox" className="mt-1" checked={!!values["cp_responsabilite"]} onChange={(event) => setValue("cp_responsabilite", event.target.checked)} />
                    <span>{"cp_responsabilite"}</span>
                  </label>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-2 align-top">{"Pénalités de retard de livraison"}</td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cgv_retard"} className={fieldClass} value={String(values["cgv_retard"] ?? "")} onChange={(event) => setValue("cgv_retard", event.target.value)}>
                    <option value={"oui"}>{"Prévue"}</option>
                    <option value={"non"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cga_retard"} className={fieldClass} value={String(values["cga_retard"] ?? "")} onChange={(event) => setValue("cga_retard", event.target.value)}>
                    <option value={"contraire"}>{"Contraire"}</option>
                    <option value={"compatible"}>{"Prévue, sans conflit"}</option>
                    <option value={"absente"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <label className="flex items-start gap-2 text-sm leading-5">
                    <input type="checkbox" className="mt-1" checked={!!values["cp_retard"]} onChange={(event) => setValue("cp_retard", event.target.checked)} />
                    <span>{"cp_retard"}</span>
                  </label>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-2 align-top">{"Tribunal compétent"}</td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cgv_juridiction"} className={fieldClass} value={String(values["cgv_juridiction"] ?? "")} onChange={(event) => setValue("cgv_juridiction", event.target.value)}>
                    <option value={"oui"}>{"Prévue"}</option>
                    <option value={"non"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cga_juridiction"} className={fieldClass} value={String(values["cga_juridiction"] ?? "")} onChange={(event) => setValue("cga_juridiction", event.target.value)}>
                    <option value={"contraire"}>{"Contraire"}</option>
                    <option value={"compatible"}>{"Prévue, sans conflit"}</option>
                    <option value={"absente"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <label className="flex items-start gap-2 text-sm leading-5">
                    <input type="checkbox" className="mt-1" checked={!!values["cp_juridiction"]} onChange={(event) => setValue("cp_juridiction", event.target.checked)} />
                    <span>{"cp_juridiction"}</span>
                  </label>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-2 align-top">{"Frais d'annulation"}</td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cgv_annulation"} className={fieldClass} value={String(values["cgv_annulation"] ?? "")} onChange={(event) => setValue("cgv_annulation", event.target.value)}>
                    <option value={"oui"}>{"Prévue"}</option>
                    <option value={"non"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cga_annulation"} className={fieldClass} value={String(values["cga_annulation"] ?? "")} onChange={(event) => setValue("cga_annulation", event.target.value)}>
                    <option value={"contraire"}>{"Contraire"}</option>
                    <option value={"compatible"}>{"Prévue, sans conflit"}</option>
                    <option value={"absente"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <label className="flex items-start gap-2 text-sm leading-5">
                    <input type="checkbox" className="mt-1" checked={!!values["cp_annulation"]} onChange={(event) => setValue("cp_annulation", event.target.checked)} />
                    <span>{"cp_annulation"}</span>
                  </label>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-2 align-top">{"Révision du prix"}</td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cgv_revision"} className={fieldClass} value={String(values["cgv_revision"] ?? "")} onChange={(event) => setValue("cgv_revision", event.target.value)}>
                    <option value={"oui"}>{"Prévue"}</option>
                    <option value={"non"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <select id={"cga_revision"} className={fieldClass} value={String(values["cga_revision"] ?? "")} onChange={(event) => setValue("cga_revision", event.target.value)}>
                    <option value={"contraire"}>{"Contraire"}</option>
                    <option value={"compatible"}>{"Prévue, sans conflit"}</option>
                    <option value={"absente"}>{"Rien"}</option>
                  </select>
                </td>
                <td className="py-2 pr-2 align-top">
                  <label className="flex items-start gap-2 text-sm leading-5">
                    <input type="checkbox" className="mt-1" checked={!!values["cp_revision"]} onChange={(event) => setValue("cp_revision", event.target.checked)} />
                    <span>{"cp_revision"}</span>
                  </label>
                </td>
              </tr>
            </tbody></table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"« Contraire » : le client prévoit autre chose sur le même point. « Dans le devis signé » : la clause est écrite dans le devis lui-même, que le client a daté et signé ; c'est une condition particulière, elle l'emporte sur les deux conditions générales."}</p>
        <h2 className="mt-6 text-base font-semibold">{"Le paiement"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Montant du devis (€ HT)"}</span>
            <input id={"montant"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["montant"] ?? "")} onChange={(event) => setValue("montant", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Coût de votre trésorerie (% par an)"}</span>
            <input id={"taux"} type="number" className={fieldClass} min={"0"} max={"30"} step={"0.5"} value={String(values["taux"] ?? "")} onChange={(event) => setValue("taux", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Taux de votre découvert ou de votre affacturage, pour chiffrer un délai plus long."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Délai de paiement de vos CGV (jours)"}</span>
            <input id={"cgvDelai"} type="number" className={fieldClass} min={"0"} max={"120"} step={"1"} value={String(values["cgvDelai"] ?? "")} onChange={(event) => setValue("cgvDelai", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Délai de paiement des conditions d'achat (jours)"}</span>
            <input id={"cgaDelai"} type="number" className={fieldClass} min={"0"} max={"180"} step={"1"} value={String(values["cgaDelai"] ?? "")} onChange={(event) => setValue("cgaDelai", event.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["cgaFinDeMois"]} onChange={(event) => setValue("cgaFinDeMois", event.target.checked)} />
              <span>{"Le délai des conditions d'achat est compté « fin de mois »"}</span>
            </label>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Clauses à vos conditions"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["nbCgv"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Clauses du client"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["nbCga"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Clauses neutralisées ou perdues"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["nbPerdues"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Délai de paiement applicable / pratiqué par le client"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["delais"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Coût de trésorerie de l'écart"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["coutEcart"]?.text || "n/a"}</dd>
          </div>
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.verdict?.className || "")}>{view.verdict?.text}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Ce qui s'applique, clause par clause"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Clause"}</th>
              <th className="py-2 pr-2 font-semibold">{"Ce qui s'applique"}</th>
              <th className="py-2 pr-2 font-semibold">{"Pourquoi"}</th>
            </tr></thead>
            <tbody>
              {(view["resultats"]?.rows || []).map((row, index) => (
                <tr key={index} className={rowClass(row.className)}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-t border-mk-border py-2 pr-2 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody></table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Le juge interprète d'abord les clauses : deux clauses rédigées différemment ne sont pas toujours incompatibles. L'outil prend vos réponses telles quelles."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Points d'attention"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["alertes"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Ce qu'il faut faire"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["actions"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le message au client"}</h2>
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
