/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-plan-prevention-entreprise-exterieure";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"exterieure","nature":"site","heuresEE":"320","heuresST":"120","dureeMois":"2","dangereux":"aucun","inspection":"faite","dateInspection":"2026-11-30","dateDebut":"2026-12-07","plan":"ecrit","dateSignature":"2026-12-02","sousTraitants":"declares","amiante":"demande","information":"prevue","isolement":"non","heuresPrevention":"14","tauxHoraire":"55"};

export function VerificateurPlanPreventionEntrepriseExterieureCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"L'intervention"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"exterieure"}>{"J'interviens chez le client (entreprise extérieure)"}</option>
              <option value={"utilisatrice"}>{"J'accueille le prestataire (entreprise utilisatrice)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Situation"}</span>
            <select id={"nature"} className={fieldClass} value={String(values["nature"] ?? "")} onChange={(event) => setValue("nature", event.target.value)}>
              <option value={"site"}>{"Travaux ou prestation dans l'établissement du client"}</option>
              <option value={"chargement"}>{"Chargement ou déchargement par un transporteur"}</option>
              <option value={"chantier"}>{"Chantier clos et indépendant, ou chantier soumis à coordination SPS"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Heures prévues de vos équipes"}</span>
            <input id={"heuresEE"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["heuresEE"] ?? "")} onChange={(event) => setValue("heuresEE", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Heures de travail prévisibles, pas des jours."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Heures des sous-traitants"}</span>
            <input id={"heuresST"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["heuresST"] ?? "")} onChange={(event) => setValue("heuresST", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Durée de l'opération (mois)"}</span>
            <input id={"dureeMois"} type="number" className={fieldClass} min={"1"} max={"60"} step={"1"} value={String(values["dureeMois"] ?? "")} onChange={(event) => setValue("dureeMois", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Travaux de la liste de l'arrêté du 19 mars 1993"}</span>
            <select id={"dangereux"} className={fieldClass} value={String(values["dangereux"] ?? "")} onChange={(event) => setValue("dangereux", event.target.value)}>
              <option value={"aucun"}>{"Aucun, après relecture de la liste"}</option>
              <option value={"electrique"}>{"Contact avec des pièces nues sous tension au-delà de la très basse tension"}</option>
              <option value={"levage"}>{"Recours à des ponts roulants, des grues ou des transtockeurs"}</option>
              <option value={"hauteur"}>{"Travaux du BTP avec risque de chute de plus de 3 mètres"}</option>
              <option value={"confine"}>{"Travaux dans ou sur des cuves, ou en atmosphère confinée"}</option>
              <option value={"soudage"}>{"Soudage oxyacétylénique avec permis de feu"}</option>
              <option value={"temperature"}>{"Maintenance sur installations à très haute ou très basse température"}</option>
              <option value={"substances"}>{"Exposition à des substances dangereuses ou des agents biologiques"}</option>
              <option value={"autre"}>{"Autre catégorie de la liste"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Vingt et une catégories en tout : lisez la liste complète avant de choisir « Aucun »."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La préparation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Inspection commune préalable"}</span>
            <select id={"inspection"} className={fieldClass} value={String(values["inspection"] ?? "")} onChange={(event) => setValue("inspection", event.target.value)}>
              <option value={"faite"}>{"Faite"}</option>
              <option value={"prevue"}>{"Prévue, pas encore faite"}</option>
              <option value={"non"}>{"Pas prévue"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de l'inspection"}</span>
            <input id={"dateInspection"} type="date" className={fieldClass} value={String(values["dateInspection"] ?? "")} onChange={(event) => setValue("dateInspection", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Début des travaux"}</span>
            <input id={"dateDebut"} type="date" className={fieldClass} value={String(values["dateDebut"] ?? "")} onChange={(event) => setValue("dateDebut", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Plan de prévention ou protocole"}</span>
            <select id={"plan"} className={fieldClass} value={String(values["plan"] ?? "")} onChange={(event) => setValue("plan", event.target.value)}>
              <option value={"ecrit"}>{"Écrit et signé par les deux"}</option>
              <option value={"oral"}>{"Convenu oralement"}</option>
              <option value={"aucun"}>{"Rien de convenu"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de signature"}</span>
            <input id={"dateSignature"} type="date" className={fieldClass} value={String(values["dateSignature"] ?? "")} onChange={(event) => setValue("dateSignature", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Sous-traitants annoncés au client"}</span>
            <select id={"sousTraitants"} className={fieldClass} value={String(values["sousTraitants"] ?? "")} onChange={(event) => setValue("sousTraitants", event.target.value)}>
              <option value={"declares"}>{"Oui, par écrit, avec leurs travaux"}</option>
              <option value={"nonDeclares"}>{"Pas encore"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Documents amiante des zones d'intervention"}</span>
            <select id={"amiante"} className={fieldClass} value={String(values["amiante"] ?? "")} onChange={(event) => setValue("amiante", event.target.value)}>
              <option value={"fourni"}>{"Reçus"}</option>
              <option value={"demande"}>{"Demandés, pas encore reçus"}</option>
              <option value={"nonDemande"}>{"Pas demandés"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Information des salariés sur place"}</span>
            <select id={"information"} className={fieldClass} value={String(values["information"] ?? "")} onChange={(event) => setValue("information", event.target.value)}>
              <option value={"prevue"}>{"Prévue avant le début"}</option>
              <option value={"non"}>{"Pas prévue"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Nuit, lieu isolé ou site à l'arrêt"}</span>
            <select id={"isolement"} className={fieldClass} value={String(values["isolement"] ?? "")} onChange={(event) => setValue("isolement", event.target.value)}>
              <option value={"non"}>{"Non, travaux pendant l'activité"}</option>
              <option value={"ouiPrevu"}>{"Oui, avec mesures pour ne pas travailler seul"}</option>
              <option value={"ouiNonPrevu"}>{"Oui, rien de prévu"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le devis"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Heures de prévention chiffrées au devis"}</span>
            <input id={"heuresPrevention"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["heuresPrevention"] ?? "")} onChange={(event) => setValue("heuresPrevention", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Préparation, inspection commune, rédaction du plan, accueil sécurité."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Taux horaire (€)"}</span>
            <input id={"tauxHoraire"} type="number" className={fieldClass} min={"0"} step={"0.01"} value={String(values["tauxHoraire"] ?? "")} onChange={(event) => setValue("tauxHoraire", event.target.value)} />
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Un installateur remplace quatre portes sectionnelles et pose deux niveleurs dans un entrepôt en activité : 320 heures pour ses techniciens, 120 heures pour l'électricien sous-traitant."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Heures prévisibles de l'opération"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["totalOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Ramenées à douze mois"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["douzeOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Plan de prévention"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["planOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Motif"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["motifOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Temps de prévention à chiffrer"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["coutOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Le seuil de 400 heures se compte sur une période de douze mois au plus, sous-traitants compris. Pour une opération plus longue, l'outil fait une estimation au prorata, à vérifier sur la période la plus chargée. Ce n'est pas un conseil juridique."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La clause à mettre dans vos devis"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view["clause"]?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view["clause"]?.text || ""} />
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Point de départ à adapter. Les crochets sont à remplir."}</p>
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
