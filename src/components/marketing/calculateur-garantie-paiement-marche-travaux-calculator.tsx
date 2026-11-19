/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/calculateur-garantie-paiement-marche-travaux";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"titulaire","client":"pro","financement":"fonds","tauxTVA":"20","prixHT":"48600","avenantsHT":"3200","nonAcceptesHT":"2400","versesConclusionHT":"9720","payesDepuisHT":"14580","impayesHT":"8640","dateMiseEnDemeure":"2026-10-13","dateCalcul":"2026-10-28"};

export function CalculateurGarantiePaiementMarcheTravauxCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Le marché"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"titulaire"}>{"Je traite directement avec le client (maître de l'ouvrage)"}</option>
              <option value={"soustraitant"}>{"Je suis sous-traitant d'une autre entreprise"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le sous-traitant relève d'abord de la loi du 31 décembre 1975 : caution ou délégation de paiement."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le client qui commande les travaux"}</span>
            <select id={"client"} className={fieldClass} value={String(values["client"] ?? "")} onChange={(event) => setValue("client", event.target.value)}>
              <option value={"pro"}>{"Un professionnel ou une personne morale (société, SCI, association, commerçant, profession libérale pour son activité)"}</option>
              <option value={"particulier"}>{"Un particulier, pour ses besoins non professionnels"}</option>
              <option value={"bailleur"}>{"Un organisme HLM ou une SEM, pour des logements locatifs aidés par l'État"}</option>
              <option value={"public"}>{"Un acheteur public (État, collectivité, hôpital) : marché public"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"L'article 1799-1 vise les marchés de travaux privés. Le particulier échappe à la caution, pas au versement direct d'un crédit dédié."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Comment le client finance les travaux"}</span>
            <select id={"financement"} className={fieldClass} value={String(values["financement"] ?? "")} onChange={(event) => setValue("financement", event.target.value)}>
              <option value={"fonds"}>{"Sans crédit dédié (trésorerie, ou vous ne savez pas)"}</option>
              <option value={"partiel"}>{"Un crédit dédié aux travaux, pour une partie du prix"}</option>
              <option value={"total"}>{"Un crédit dédié aux travaux, pour la totalité du prix"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Crédit dédié : un prêt destiné exclusivement et en totalité au paiement des travaux (décret du 30 juillet 1999)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Taux de TVA (pour l'affichage TTC)"}</span>
            <select id={"tauxTVA"} className={fieldClass} value={String(values["tauxTVA"] ?? "")} onChange={(event) => setValue("tauxTVA", event.target.value)}>
              <option value={"20"}>{"20 %"}</option>
              <option value={"10"}>{"10 %"}</option>
              <option value={"5.5"}>{"5,5 %"}</option>
              <option value={"0"}>{"0 % (autoliquidation ou pas de TVA)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le seuil de 12 000 € se lit hors taxes ; la garantie couvre ce que le client doit payer."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les montants (HT)"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Prix convenu au devis accepté (€ HT)"}</span>
            <input id={"prixHT"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["prixHT"] ?? "")} onChange={(event) => setValue("prixHT", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le prix du marché signé. Plusieurs devis acceptés pour la même opération : additionnez-les."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Avenants et travaux supplémentaires acceptés (€ HT)"}</span>
            <input id={"avenantsHT"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["avenantsHT"] ?? "")} onChange={(event) => setValue("avenantsHT", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Commandés avant d'être faits, ou acceptés sans équivoque après : ils entrent dans la garantie."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Travaux supplémentaires non acceptés (€ HT)"}</span>
            <input id={"nonAcceptesHT"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["nonAcceptesHT"] ?? "")} onChange={(event) => setValue("nonAcceptesHT", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Faits sans devis accepté ni accord écrit : la garantie ne les couvre pas tant que le client ne les a pas acceptés."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Arrhes et acomptes versés à la signature (€ HT)"}</span>
            <input id={"versesConclusionHT"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["versesConclusionHT"] ?? "")} onChange={(event) => setValue("versesConclusionHT", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Déduits du prix pour calculer les sommes à garantir et le seuil."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Paiements reçus depuis (€ HT)"}</span>
            <input id={"payesDepuisHT"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["payesDepuisHT"] ?? "")} onChange={(event) => setValue("payesDepuisHT", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Situations de travaux et factures intermédiaires déjà réglées."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Travaux exécutés et facturés, restés impayés (€ HT)"}</span>
            <input id={"impayesHT"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["impayesHT"] ?? "")} onChange={(event) => setValue("impayesHT", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Condition pour suspendre le chantier : être impayé de travaux déjà exécutés."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les dates"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Mise en demeure de fournir la garantie, reçue le"}</span>
            <input id={"dateMiseEnDemeure"} type="date" className={fieldClass} value={String(values["dateMiseEnDemeure"] ?? "")} onChange={(event) => setValue("dateMiseEnDemeure", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Par lettre recommandée avec accusé de réception. Date de réception figurant sur l'avis. Vide si pas encore envoyée."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date du calcul"}</span>
            <input id={"dateCalcul"} type="date" className={fieldClass} value={String(values["dateCalcul"] ?? "")} onChange={(event) => setValue("dateCalcul", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Aujourd'hui, ou la date à laquelle vous pensez agir."}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La garantie"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Sommes à garantir (prix + avenants − versements à la signature)"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["sommesDues"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Garantie exigible"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["forme"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Solde encore dû, à couvrir aujourd'hui"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["solde"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Suspension du chantier possible à partir du"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["dateSursis"]?.text || "n/a"}</dd>
          </div>
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.verdict?.className || "")}>{view.verdict?.text}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le détail des montants"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Ligne"}</th>
              <th className="py-2 pr-2 font-semibold">{"HT"}</th>
              <th className="py-2 pr-2 font-semibold">{"TTC"}</th>
              <th className="py-2 pr-2 font-semibold">{"Garantie"}</th>
            </tr></thead>
            <tbody>
              {(view["detail"]?.rows || []).map((row, index) => (
                <tr key={index} className={rowClass(row.className)}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-t border-mk-border py-2 pr-2 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody></table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Le seuil de 12 000 € HT se compare aux sommes dues après déduction des arrhes et acomptes versés à la signature (article 1er du décret n° 99-658 du 30 juillet 1999). La garantie peut être demandée à tout moment, y compris en fin de chantier, tant que le prix n'est pas intégralement payé."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le calendrier"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Date"}</th>
              <th className="py-2 pr-2 font-semibold">{"Étape"}</th>
              <th className="py-2 pr-2 font-semibold">{"Effet"}</th>
            </tr></thead>
            <tbody>
              {(view["calendrier"]?.rows || []).map((row, index) => (
                <tr key={index} className={rowClass(row.className)}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-t border-mk-border py-2 pr-2 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody></table>
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Pour lire vos chiffres"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["conseils"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
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
