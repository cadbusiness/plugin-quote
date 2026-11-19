/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-reception-travaux-reserves";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"entreprise","nature":"batiment","montant":"64000","dateFin":"2026-12-04","dateControle":"2026-12-18","forme":"pv","convocation":"ecrite","dateReception":"2026-12-11","reserves":"mineures","nbReserves":"3","delaiLevee":"30","levee":"non","retenue":"5","garantieRetenue":"caution","clauseGaranties":"aucune"};

export function VerificateurReceptionTravauxReservesCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Le chantier"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"entreprise"}>{"Je suis l'entreprise qui a fait les travaux"}</option>
              <option value={"maitre"}>{"Je suis le client (maître de l'ouvrage)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Nature des travaux"}</span>
            <select id={"nature"} className={fieldClass} value={String(values["nature"] ?? "")} onChange={(event) => setValue("nature", event.target.value)}>
              <option value={"batiment"}>{"Ouvrage de bâtiment ou de génie civil"}</option>
              <option value={"equipement"}>{"Élément d'équipement d'un ouvrage"}</option>
              <option value={"pro"}>{"Équipement servant seulement à l'activité professionnelle"}</option>
              <option value={"hors"}>{"Prestation hors construction (installation, service)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant du marché (€)"}</span>
            <input id={"montant"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["montant"] ?? "")} onChange={(event) => setValue("montant", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"En euros entiers, tel qu'accepté au devis."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Fin des travaux annoncée"}</span>
            <input id={"dateFin"} type="date" className={fieldClass} value={String(values["dateFin"] ?? "")} onChange={(event) => setValue("dateFin", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date du contrôle"}</span>
            <input id={"dateControle"} type="date" className={fieldClass} value={String(values["dateControle"] ?? "")} onChange={(event) => setValue("dateControle", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"La date à laquelle vous faites le point, souvent aujourd'hui."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La réception"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Forme de la réception"}</span>
            <select id={"forme"} className={fieldClass} value={String(values["forme"] ?? "")} onChange={(event) => setValue("forme", event.target.value)}>
              <option value={"pv"}>{"Procès-verbal signé par les deux parties"}</option>
              <option value={"pvMaitre"}>{"Procès-verbal signé par le client seul"}</option>
              <option value={"tacite"}>{"Pas de procès-verbal, le client a pris possession"}</option>
              <option value={"judiciaire"}>{"Réception prononcée par le juge"}</option>
              <option value={"aucune"}>{"Pas encore de réception"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Convocation à la réception"}</span>
            <select id={"convocation"} className={fieldClass} value={String(values["convocation"] ?? "")} onChange={(event) => setValue("convocation", event.target.value)}>
              <option value={"ecrite"}>{"Par écrit, avec date et heure"}</option>
              <option value={"orale"}>{"Oralement ou par téléphone"}</option>
              <option value={"aucune"}>{"Aucune convocation"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de la réception"}</span>
            <input id={"dateReception"} type="date" className={fieldClass} value={String(values["dateReception"] ?? "")} onChange={(event) => setValue("dateReception", event.target.value)} />
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les réserves"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Réserves au procès-verbal"}</span>
            <select id={"reserves"} className={fieldClass} value={String(values["reserves"] ?? "")} onChange={(event) => setValue("reserves", event.target.value)}>
              <option value={"aucune"}>{"Aucune réserve"}</option>
              <option value={"mineures"}>{"Réserves mineures (finitions, reprises)"}</option>
              <option value={"majeures"}>{"Réserves importantes (usage limité)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Nombre de réserves listées"}</span>
            <input id={"nbReserves"} type="number" className={fieldClass} min={"0"} max={"500"} step={"1"} value={String(values["nbReserves"] ?? "")} onChange={(event) => setValue("nbReserves", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Délai de levée convenu (jours)"}</span>
            <input id={"delaiLevee"} type="number" className={fieldClass} min={"0"} max={"365"} step={"1"} value={String(values["delaiLevee"] ?? "")} onChange={(event) => setValue("delaiLevee", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si aucun délai n'a été écrit."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"État de la levée"}</span>
            <select id={"levee"} className={fieldClass} value={String(values["levee"] ?? "")} onChange={(event) => setValue("levee", event.target.value)}>
              <option value={"non"}>{"Pas encore levées"}</option>
              <option value={"partielle"}>{"Levées en partie"}</option>
              <option value={"levees"}>{"Toutes levées, constat écrit"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La retenue et le devis"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Retenue de garantie (%)"}</span>
            <input id={"retenue"} type="number" className={fieldClass} min={"0"} max={"100"} step={"0.1"} value={String(values["retenue"] ?? "")} onChange={(event) => setValue("retenue", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Sort de la retenue"}</span>
            <select id={"garantieRetenue"} className={fieldClass} value={String(values["garantieRetenue"] ?? "")} onChange={(event) => setValue("garantieRetenue", event.target.value)}>
              <option value={"caution"}>{"Remplacée par une caution bancaire"}</option>
              <option value={"consignation"}>{"Consignée chez un tiers"}</option>
              <option value={"nonConsignee"}>{"Gardée par le client, non consignée"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Clause sur les garanties"}</span>
            <select id={"clauseGaranties"} className={fieldClass} value={String(values["clauseGaranties"] ?? "")} onChange={(event) => setValue("clauseGaranties", event.target.value)}>
              <option value={"aucune"}>{"Aucune clause qui réduit les garanties"}</option>
              <option value={"limitative"}>{"Une clause exclut ou réduit les garanties"}</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Une mezzanine de stockage de 64 000 €, reçue le 11 décembre 2026 avec trois réserves mineures."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Date de réception"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["recOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Levée des réserves au plus tard"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["leveeOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Fin de la garantie de parfait achèvement"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["gpaOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Fin de la responsabilité décennale"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["decennaleOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Retenue de garantie"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["retenueOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Libération de la retenue"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["liberationOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Les dates sont calculées de quantième à quantième (un an après le 11 décembre, c'est le 11 décembre). La qualification des travaux (ouvrage, élément d'équipement, équipement professionnel) se discute au cas par cas, avec votre assureur. Ce n'est pas un conseil juridique."}</p>
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
