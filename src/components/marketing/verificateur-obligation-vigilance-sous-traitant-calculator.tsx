/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-obligation-vigilance-sous-traitant";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"prestataire","client":"entreprise","montant":"18600","etabli":"france","dateConclusion":"2026-11-16","dateFin":"2027-09-30","typeAttestation":"urssaf","dateAttestation":"2026-10-12","authenticite":"oui","piece":"rne","salaries":"oui","etrangers":"non","sousTraitant":"oui"};

export function VerificateurObligationVigilanceSousTraitantCalculator() {
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
              <option value={"prestataire"}>{"Je suis le prestataire ou le sous-traitant, je remets mes documents"}</option>
              <option value={"donneur"}>{"Je suis le donneur d'ordre, je vérifie les documents"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le contrôle est le même ; seul le message final change de sens."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui est le donneur d'ordre ?"}</span>
            <select id={"client"} className={fieldClass} value={String(values["client"] ?? "")} onChange={(event) => setValue("client", event.target.value)}>
              <option value={"entreprise"}>{"Un professionnel : entreprise, association, SCI"}</option>
              <option value={"public"}>{"Une personne morale de droit public"}</option>
              <option value={"particulier"}>{"Un particulier, pour son usage personnel ou familial"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le particulier n'a besoin que d'un seul document (article D. 8222-4)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant global du contrat (€ HT)"}</span>
            <input id={"montant"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["montant"] ?? "")} onChange={(event) => setValue("montant", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Seuil : 5 000 € HT (article R. 8222-1). Comptez le montant global, même s'il est facturé en plusieurs fois."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Où le prestataire est-il établi ?"}</span>
            <select id={"etabli"} className={fieldClass} value={String(values["etabli"] ?? "")} onChange={(event) => setValue("etabli", event.target.value)}>
              <option value={"france"}>{"En France"}</option>
              <option value={"etranger"}>{"À l'étranger"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de conclusion du contrat"}</span>
            <input id={"dateConclusion"} type="date" className={fieldClass} value={String(values["dateConclusion"] ?? "")} onChange={(event) => setValue("dateConclusion", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"La signature du contrat, ou l'acceptation du devis."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Fin d'exécution prévue"}</span>
            <input id={"dateFin"} type="date" className={fieldClass} value={String(values["dateFin"] ?? "")} onChange={(event) => setValue("dateFin", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Les remises se répètent tous les six mois jusqu'à cette date."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les pièces disponibles"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Pièce sociale"}</span>
            <select id={"typeAttestation"} className={fieldClass} value={String(values["typeAttestation"] ?? "")} onChange={(event) => setValue("typeAttestation", event.target.value)}>
              <option value={"urssaf"}>{"Attestation de vigilance téléchargée sur l'espace Urssaf ou MSA"}</option>
              <option value={"provisoire"}>{"Attestation provisoire de début d'activité"}</option>
              <option value={"honneur"}>{"Attestation sur l'honneur signée par le dirigeant"}</option>
              <option value={"aucune"}>{"Aucune"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de l'attestation"}</span>
            <input id={"dateAttestation"} type="date" className={fieldClass} value={String(values["dateAttestation"] ?? "")} onChange={(event) => setValue("dateAttestation", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Elle doit dater de moins de six mois à chaque remise."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Authenticité vérifiée avec le code de sécurité ?"}</span>
            <select id={"authenticite"} className={fieldClass} value={String(values["authenticite"] ?? "")} onChange={(event) => setValue("authenticite", event.target.value)}>
              <option value={"oui"}>{"Oui, vérifiée sur le site de l'organisme"}</option>
              <option value={"non"}>{"Non, pas encore"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Obligatoire pour le donneur d'ordre professionnel (article D. 8222-5)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Pièce d'immatriculation"}</span>
            <select id={"piece"} className={fieldClass} value={String(values["piece"] ?? "")} onChange={(event) => setValue("piece", event.target.value)}>
              <option value={"kbis"}>{"Extrait K ou Kbis"}</option>
              <option value={"rne"}>{"Extrait d'immatriculation au RNE (métiers et artisanat)"}</option>
              <option value={"devis"}>{"Devis ou courrier portant nom, adresse complète et numéro d'immatriculation"}</option>
              <option value={"accuse"}>{"Accusé de réception électronique (article R. 123-6 du code de commerce)"}</option>
              <option value={"aucune"}>{"Aucune pièce"}</option>
              <option value={"nonRequis"}>{"Immatriculation non obligatoire, profession non réglementée"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le prestataire emploie-t-il des salariés ?"}</span>
            <select id={"salaries"} className={fieldClass} value={String(values["salaries"] ?? "")} onChange={(event) => setValue("salaries", event.target.value)}>
              <option value={"oui"}>{"Oui"}</option>
              <option value={"non"}>{"Non"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"L'attestation mentionne alors le nombre de salariés et le total des rémunérations déclarées."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Salariés étrangers soumis à autorisation de travail ?"}</span>
            <select id={"etrangers"} className={fieldClass} value={String(values["etrangers"] ?? "")} onChange={(event) => setValue("etrangers", event.target.value)}>
              <option value={"oui"}>{"Oui"}</option>
              <option value={"non"}>{"Non"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Liste nominative à remettre (articles D. 8254-2 et D. 8254-4)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Contrat de sous-traitance accepté par le maître d'ouvrage ?"}</span>
            <select id={"sousTraitant"} className={fieldClass} value={String(values["sousTraitant"] ?? "")} onChange={(event) => setValue("sousTraitant", event.target.value)}>
              <option value={"oui"}>{"Oui"}</option>
              <option value={"non"}>{"Non, contrat direct"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Nouvel article L. 8222-1-1, pas encore en vigueur."}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le verdict"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Vérifications obligatoires"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["obligation"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Dossier à la conclusion"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["statut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Points bloquants / à compléter"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["compteurs"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Remises jusqu'à la fin d'exécution"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["remises"]?.text || "n/a"}</dd>
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
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"L'échéancier des remises"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Date"}</th>
              <th className="py-2 pr-2 font-semibold">{"Remise"}</th>
              <th className="py-2 pr-2 font-semibold">{"Pièces"}</th>
            </tr></thead>
            <tbody>
              {(view["echeances"]?.rows || []).map((row, index) => (
                <tr key={index} className={rowClass(row.className)}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-t border-mk-border py-2 pr-2 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody></table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Une échéance tous les six mois à partir de la conclusion, tant qu'elle tombe avant la fin d'exécution. Un 31 suivi d'un mois plus court est ramené au dernier jour du mois."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Les pièces à réunir"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["pieces"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
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
