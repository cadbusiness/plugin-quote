/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-autoliquidation-tva-sous-traitance-btp";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"soustraitant","preneur":"assujetti","regime":"reel","document":"devis","nature":"travaux","fourniture":"non","location":"aucune","dateOperation":"2026-10-29","montantHT":"40000","tauxTVA":"20"};

export function VerificateurAutoliquidationTvaSousTraitanceBtpCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Les parties"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"soustraitant"}>{"Je suis sous-traitant : je facture l'entreprise qui m'a confié les travaux"}</option>
              <option value={"principale"}>{"Je suis l'entreprise principale : je reçois la facture du sous-traitant"}</option>
              <option value={"direct"}>{"Je facture directement le maître d'ouvrage (propriétaire, client final)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sous-traitance au sens de l'article 1er de la loi du 31 décembre 1975, à n'importe quel rang de la chaîne."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le client qui reçoit la facture"}</span>
            <select id={"preneur"} className={fieldClass} value={String(values["preneur"] ?? "")} onChange={(event) => setValue("preneur", event.target.value)}>
              <option value={"assujetti"}>{"Une entreprise assujettie à la TVA (entreprise principale ou sous-traitant de rang supérieur)"}</option>
              <option value={"nonAssujetti"}>{"Un particulier, ou un client non assujetti à la TVA"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le preneur doit être assujetti à la TVA."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Régime de TVA du sous-traitant"}</span>
            <select id={"regime"} className={fieldClass} value={String(values["regime"] ?? "")} onChange={(event) => setValue("regime", event.target.value)}>
              <option value={"reel"}>{"Redevable de la TVA (régime réel, simplifié ou normal)"}</option>
              <option value={"franchise"}>{"Franchise en base de TVA (micro-entreprise sans option)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"En franchise en base, il n'y a pas de TVA à autoliquider."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Document qui lie les deux entreprises"}</span>
            <select id={"document"} className={fieldClass} value={String(values["document"] ?? "")} onChange={(event) => setValue("document", event.target.value)}>
              <option value={"devis"}>{"Devis accepté ou bon de commande signé"}</option>
              <option value={"contrat"}>{"Contrat de sous-traitance signé"}</option>
              <option value={"aucun"}>{"Rien d'écrit pour l'instant (accord oral)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sans contrat formel, un devis, un bon de commande signé ou tout document qui établit l'accord sur les travaux et leur prix en tient lieu."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La prestation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Nature de la prestation"}</span>
            <select id={"nature"} className={fieldClass} value={String(values["nature"] ?? "")} onChange={(event) => setValue("nature", event.target.value)}>
              <option value={"travaux"}>{"Travaux de construction, réparation, rénovation, démolition, travaux publics, équipement incorporé au bâti"}</option>
              <option value={"nettoyageLie"}>{"Nettoyage ou maintenance compris dans le même contrat que des travaux"}</option>
              <option value={"maintenancePieces"}>{"Maintenance d'une installation immobilière avec remplacement de pièces au-delà des menues fournitures"}</option>
              <option value={"nettoyageSepare"}>{"Nettoyage de chantier confié par un contrat distinct, sans travaux"}</option>
              <option value={"interventionSeule"}>{"Uniquement réglages, mise en service, contrôle ou maintenance sans pièces"}</option>
              <option value={"intellectuelle"}>{"Prestation intellectuelle seule : études, ingénierie, économiste de la construction"}</option>
              <option value={"atelier"}>{"Travaux en atelier sur des biens meubles, fabrication sur mesure"}</option>
              <option value={"autre"}>{"Autre, ou je ne sais pas"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Travaux en relation avec un bien immobilier, au sens du BOFiP (BOI-TVA-DECLA-10-10-20, § 534)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Fourniture de matériaux sans pose ?"}</span>
            <select id={"fourniture"} className={fieldClass} value={String(values["fourniture"] ?? "")} onChange={(event) => setValue("fourniture", event.target.value)}>
              <option value={"non"}>{"Non : je fournis et je pose, ou je pose seulement"}</option>
              <option value={"oui"}>{"Oui : fourniture ou livraison seule, sans pose"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"La livraison de biens, même pour un chantier précis, est hors du dispositif."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Location de matériel ou d'engins"}</span>
            <select id={"location"} className={fieldClass} value={String(values["location"] ?? "")} onChange={(event) => setValue("location", event.target.value)}>
              <option value={"aucune"}>{"Aucune location"}</option>
              <option value={"seuleSans"}>{"Location seule, sans opérateur (montage et démontage compris)"}</option>
              <option value={"seuleAvec"}>{"Location seule, avec chauffeur ou opérateur"}</option>
              <option value={"incluse"}>{"Location incluse dans un contrat unique qui comprend aussi des travaux immobiliers"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Location seule : hors dispositif, même avec montage, démontage ou chauffeur. Dans un contrat unique avec des travaux : tout est autoliquidé."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de la facture ou du devis"}</span>
            <input id={"dateOperation"} type="date" className={fieldClass} value={String(values["dateOperation"] ?? "")} onChange={(event) => setValue("dateOperation", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sert à choisir la référence légale à citer (CGI ou CIBS à partir du 1er janvier 2027)."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le montant"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Montant des travaux (€ HT)"}</span>
            <input id={"montantHT"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["montantHT"] ?? "")} onChange={(event) => setValue("montantHT", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le montant hors taxes du devis ou de la facture du sous-traitant."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Taux de TVA applicable aux travaux"}</span>
            <select id={"tauxTVA"} className={fieldClass} value={String(values["tauxTVA"] ?? "")} onChange={(event) => setValue("tauxTVA", event.target.value)}>
              <option value={"20"}>{"20 %"}</option>
              <option value={"10"}>{"10 %"}</option>
              <option value={"5.5"}>{"5,5 %"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le taux qui s'appliquerait sans autoliquidation. En cas de doute entre deux taux, voyez votre expert-comptable."}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le verdict"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Autoliquidation"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["reponse"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Montant facturé par le sous-traitant"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["facture"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"TVA à autoliquider par l'entreprise principale"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["tvaAuto"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Amende si la TVA autoliquidée n'est pas déclarée (5 %)"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["amende"]?.text || "n/a"}</dd>
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
              <th className="py-2 pr-2 font-semibold">{"Montant"}</th>
              <th className="py-2 pr-2 font-semibold">{"Qui"}</th>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Pour une entreprise principale qui a un droit à déduction complet, la TVA autoliquidée et la TVA déduite se compensent sur la même déclaration. L'amende du 4 de l'article 1788 A du CGI vise l'entreprise principale qui omet de déclarer cette TVA."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Les mentions à porter"}</h2>
        <h2 className="text-base font-semibold">{"Les lignes de déclaration"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["mentions"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["declarations"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Pour lire le résultat"}</h2>
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
