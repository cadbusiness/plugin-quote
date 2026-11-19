/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/calculateur-echeance-facturation-electronique";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"regime":"assujetti","assujettiUnique":"non","effectif":"14","ca":"1900000","bilan":"1100000","facturesMois":"35","b2c":"non","international":"non","encaissements":"oui","achatsEtranger":"non","plateforme":"encours","dateCalcul":"2026-10-28"};

export function CalculateurEcheanceFacturationElectroniqueCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Votre entreprise"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Situation de TVA"}</span>
            <select id={"regime"} className={fieldClass} value={String(values["regime"] ?? "")} onChange={(event) => setValue("regime", event.target.value)}>
              <option value={"assujetti"}>{"Je facture de la TVA (régime réel)"}</option>
              <option value={"franchise"}>{"Franchise en base (TVA non applicable, art. 293 B du CGI)"}</option>
              <option value={"exonere"}>{"Uniquement des opérations exonérées (articles 261 à 261 E du CGI)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Exemples d'opérations exonérées : soins médicaux, formation professionnelle sous conditions, certaines locations nues, opérations bancaires et d'assurance."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Membre d'un assujetti unique (groupe TVA)"}</span>
            <select id={"assujettiUnique"} className={fieldClass} value={String(values["assujettiUnique"] ?? "")} onChange={(event) => setValue("assujettiUnique", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Un membre d'un assujetti unique émet dès le 1er septembre 2026, quelle que soit sa taille."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Effectif (personnes)"}</span>
            <input id={"effectif"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["effectif"] ?? "")} onChange={(event) => setValue("effectif", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Effectif de l'unité légale (SIREN), sur le dernier exercice clos avant le 1er janvier 2025."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Chiffre d'affaires annuel (€)"}</span>
            <input id={"ca"} type="number" className={fieldClass} min={"0"} step={"10000"} value={String(values["ca"] ?? "")} onChange={(event) => setValue("ca", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Même exercice de référence."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Total de bilan (€)"}</span>
            <input id={"bilan"} type="number" className={fieldClass} min={"0"} step={"10000"} value={String(values["bilan"] ?? "")} onChange={(event) => setValue("bilan", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le chiffre d'affaires et le bilan jouent ensemble : il faut dépasser les deux seuils pour monter de catégorie."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Factures émises par mois à des clients professionnels en France"}</span>
            <input id={"facturesMois"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["facturesMois"] ?? "")} onChange={(event) => setValue("facturesMois", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sert seulement à chiffrer l'amende théorique de 50 € par facture."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Vos clients et vos achats"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Ventes à des particuliers"}</span>
            <select id={"b2c"} className={fieldClass} value={String(values["b2c"] ?? "")} onChange={(event) => setValue("b2c", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ventes à des clients établis hors de France"}</span>
            <select id={"international"} className={fieldClass} value={String(values["international"] ?? "")} onChange={(event) => setValue("international", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Prestations de services avec TVA sur les encaissements"}</span>
            <select id={"encaissements"} className={fieldClass} value={String(values["encaissements"] ?? "")} onChange={(event) => setValue("encaissements", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui, sans option pour les débits"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Cas courant des prestataires de services. Ne concerne pas les ventes de biens ni l'autoliquidation (sous-traitance du bâtiment)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Achats autoliquidés ou acquisitions intracommunautaires"}</span>
            <select id={"achatsEtranger"} className={fieldClass} value={String(values["achatsEtranger"] ?? "")} onChange={(event) => setValue("achatsEtranger", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Plateforme agréée de réception"}</span>
            <select id={"plateforme"} className={fieldClass} value={String(values["plateforme"] ?? "")} onChange={(event) => setValue("plateforme", event.target.value)}>
              <option value={"oui"}>{"Choisie, mon entreprise reçoit déjà"}</option>
              <option value={"encours"}>{"Démarche en cours"}</option>
              <option value={"non"}>{"Rien de fait"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le choix se fait auprès d'une plateforme agréée. Aucune démarche n'est à faire auprès de l'administration."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date du calcul"}</span>
            <input id={"dateCalcul"} type="date" className={fieldClass} value={String(values["dateCalcul"] ?? "")} onChange={(event) => setValue("dateCalcul", event.target.value)} />
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas une entreprise réelle (une PME de services de 14 personnes)."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Votre situation"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Catégorie retenue"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["categorie"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Réception des factures électroniques"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["reception"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Émission des factures électroniques"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["emission"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Jours restants avant l'émission obligatoire"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["joursEmission"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Amende théorique sur un an si vous émettez encore en papier ou PDF simple"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["amende"]?.text || "n/a"}</dd>
          </div>
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.verdict?.className || "")}>{view.verdict?.text}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le calendrier de votre entreprise"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Date"}</th>
              <th className="py-2 pr-2 font-semibold">{"Obligation"}</th>
              <th className="py-2 pr-2 font-semibold">{"État à la date du calcul"}</th>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Calendrier du décret n° 2022-1299 modifié par le décret n° 2024-266 et de l'article 91 de la loi n° 2023-1322. Les nouvelles mentions s'appliquent à la même date que l'émission."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Ce qui change sur vos factures"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["mentions"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
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
