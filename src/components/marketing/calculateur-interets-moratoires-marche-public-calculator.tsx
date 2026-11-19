/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/calculateur-interets-moratoires-marche-public";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"acheteur":"collectivite","nature":"travaux","montantMarcheHT":"18000","dureeMois":"1","delaiMarche":"30","depot":"chorus","montantTTC":"21600","retenue":"0","dateServiceFait":"2026-09-11","dateReception":"2026-09-14","interruption":"non","datePaiement":"2026-11-13","dateNotif":"","datePieces":"","tauxBce":"","frais":"0"};

export function CalculateurInteretsMoratoiresMarchePublicCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"L'acheteur et le marché"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Qui est l'acheteur"}</span>
            <select id={"acheteur"} className={fieldClass} value={String(values["acheteur"] ?? "")} onChange={(event) => setValue("acheteur", event.target.value)}>
              <option value={"collectivite"}>{"État, collectivité, établissement public ou autre pouvoir adjudicateur"}</option>
              <option value={"sante"}>{"Établissement public de santé (hôpital)"}</option>
              <option value={"entreprise_publique"}>{"Entreprise publique (SEM, SPL, SA d'HLM)"}</option>
              <option value={"prive"}>{"Client privé"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Nature du marché"}</span>
            <select id={"nature"} className={fieldClass} value={String(values["nature"] ?? "")} onChange={(event) => setValue("nature", event.target.value)}>
              <option value={"fournitures_services"}>{"Fournitures ou services"}</option>
              <option value={"travaux"}>{"Travaux"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant du marché hors taxes (€)"}</span>
            <input id={"montantMarcheHT"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["montantMarcheHT"] ?? "")} onChange={(event) => setValue("montantMarcheHT", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le montant de la commande, pas celui de la facture."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Durée d'exécution (mois)"}</span>
            <input id={"dureeMois"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["dureeMois"] ?? "")} onChange={(event) => setValue("dureeMois", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Délai de paiement écrit dans le marché (jours)"}</span>
            <input id={"delaiMarche"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["delaiMarche"] ?? "")} onChange={(event) => setValue("delaiMarche", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si le marché ou le bon de commande ne dit rien."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Comment la facture a été transmise"}</span>
            <select id={"depot"} className={fieldClass} value={String(values["depot"] ?? "")} onChange={(event) => setValue("depot", event.target.value)}>
              <option value={"chorus"}>{"Déposée sur Chorus Pro"}</option>
              <option value={"plateforme"}>{"Envoyée par une plateforme agréée"}</option>
              <option value={"email"}>{"Par e-mail ou par courrier"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La facture"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Montant de la facture toutes taxes comprises (€)"}</span>
            <input id={"montantTTC"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["montantTTC"] ?? "")} onChange={(event) => setValue("montantTTC", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Retenue de garantie déduite (€)"}</span>
            <input id={"retenue"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["retenue"] ?? "")} onChange={(event) => setValue("retenue", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Fin des prestations ou des travaux"}</span>
            <input id={"dateServiceFait"} type="date" className={fieldClass} value={String(values["dateServiceFait"] ?? "")} onChange={(event) => setValue("dateServiceFait", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Réception de la facture par l'acheteur"}</span>
            <input id={"dateReception"} type="date" className={fieldClass} value={String(values["dateReception"] ?? "")} onChange={(event) => setValue("dateReception", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"La date de dépôt affichée par Chorus Pro."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le paiement"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"L'acheteur a-t-il interrompu le délai ?"}</span>
            <select id={"interruption"} className={fieldClass} value={String(values["interruption"] ?? "")} onChange={(event) => setValue("interruption", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"une"}>{"Oui, une fois (pièce manquante ou erreur)"}</option>
              <option value={"plusieurs"}>{"Oui, plusieurs fois"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de mise en paiement"}</span>
            <input id={"datePaiement"} type="date" className={fieldClass} value={String(values["datePaiement"] ?? "")} onChange={(event) => setValue("datePaiement", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Si vous attendez encore, mettez la date du jour."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Réception de la notification d'interruption"}</span>
            <input id={"dateNotif"} type="date" className={fieldClass} value={String(values["dateNotif"] ?? "")} onChange={(event) => setValue("dateNotif", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Seulement si le délai a été interrompu."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Réception par l'acheteur des pièces demandées"}</span>
            <input id={"datePieces"} type="date" className={fieldClass} value={String(values["datePieces"] ?? "")} onChange={(event) => setValue("datePieces", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Taux de la BCE à retenir (%)"}</span>
            <input id={"tauxBce"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["tauxBce"] ?? "")} onChange={(event) => setValue("tauxBce", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Laissez vide : l'outil prend le taux des opérations principales de refinancement en vigueur au premier jour du semestre, de 2024 à 2026."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Frais de recouvrement réellement engagés (€)"}</span>
            <input id={"frais"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["frais"] ?? "")} onChange={(event) => setValue("frais", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Avocat, société de recouvrement, sur justificatifs."}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Une entreprise de sols industriels termine le vendredi 11 septembre 2026 la rénovation du sol d'un atelier municipal, 18 000 € hors taxes, soit 21 600 € TTC. La facture est déposée sur Chorus Pro le lundi 14 septembre 2026 et mise en paiement le vendredi 13 novembre 2026."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Échéance du paiement"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["echeanceOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Jours de retard"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["retardOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Taux des intérêts moratoires"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["tauxOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Intérêts moratoires"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["interetsOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Indemnité forfaitaire et complémentaire"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["indemniteOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Total à réclamer"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["totalOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Articles du code de la commande publique (L2192-1, L2192-10, L2192-13, R2112-1, R2122-8, R2191-3, R2192-10 à R2192-13, R2192-27 à R2192-29, R2192-31 à R2192-36, D2192-35) lus dans leur version en vigueur le 17 novembre 2026. Taux de la BCE repris du tableau de la Banque de France. Formule : montant × taux × jours de retard / 365. Le dernier jour du délai qui tombe un samedi ou un dimanche est reporté au lundi ; les jours fériés ne sont pas gérés. L'outil ne traite ni la sous-traitance avec paiement direct, ni l'intervention d'un maître d'œuvre, ni les marchés de défense. Ce n'est pas un conseil juridique."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La clause à mettre dans le prochain devis"}</h2>
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
        <h2 className="text-base font-semibold">{"Le message à envoyer à l'acheteur"}</h2>
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
