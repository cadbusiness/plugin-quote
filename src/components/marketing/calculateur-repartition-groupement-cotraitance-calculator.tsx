/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/calculateur-repartition-groupement-cotraitance";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"mandataire","forme":"mandataireSolidaire","formeEcrite":"devis","membresCommercants":"oui","pouvoir":"ecrit","relation":"cotraitance","montantTotal":"88000","repartitionDevis":"parMembre","partA":"48000","partB":"22000","partC":"18000","partD":"0","fraisCommuns":"2400","cleFrais":"prorata","remunMandataire":"2","paiement":"compteMandataire","convention":"projet","defaillant":"B","montantNonExecute":"9000"};

export function CalculateurRepartitionGroupementCotraitanceCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Le groupement"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"mandataire"}>{"Je suis le mandataire du groupement"}</option>
              <option value={"cotraitant"}>{"Je suis un autre membre (cotraitant)"}</option>
              <option value={"client"}>{"Je suis le client qui reçoit le devis"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Forme du groupement"}</span>
            <select id={"forme"} className={fieldClass} value={String(values["forme"] ?? "")} onChange={(event) => setValue("forme", event.target.value)}>
              <option value={"conjoint"}>{"Conjoint (chacun sa part)"}</option>
              <option value={"mandataireSolidaire"}>{"Conjoint, mandataire solidaire"}</option>
              <option value={"solidaire"}>{"Solidaire (chacun pour le tout)"}</option>
              <option value={"nonPrecise"}>{"Pas précisée"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Où la forme est écrite"}</span>
            <select id={"formeEcrite"} className={fieldClass} value={String(values["formeEcrite"] ?? "")} onChange={(event) => setValue("formeEcrite", event.target.value)}>
              <option value={"devis"}>{"Dans le devis accepté par le client"}</option>
              <option value={"convention"}>{"Seulement dans la convention entre membres"}</option>
              <option value={"non"}>{"Nulle part"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Les membres sont"}</span>
            <select id={"membresCommercants"} className={fieldClass} value={String(values["membresCommercants"] ?? "")} onChange={(event) => setValue("membresCommercants", event.target.value)}>
              <option value={"oui"}>{"Des sociétés commerciales ou des commerçants"}</option>
              <option value={"non"}>{"Des artisans ou des professions libérales"}</option>
              <option value={"mixte"}>{"Un mélange des deux"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Pouvoir du mandataire"}</span>
            <select id={"pouvoir"} className={fieldClass} value={String(values["pouvoir"] ?? "")} onChange={(event) => setValue("pouvoir", event.target.value)}>
              <option value={"ecrit"}>{"Pouvoir écrit de chaque membre"}</option>
              <option value={"oral"}>{"Accord oral seulement"}</option>
              <option value={"aucun"}>{"Aucun pouvoir"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Lien de chaque membre avec le client"}</span>
            <select id={"relation"} className={fieldClass} value={String(values["relation"] ?? "")} onChange={(event) => setValue("relation", event.target.value)}>
              <option value={"cotraitance"}>{"Chaque membre est partie au devis"}</option>
              <option value={"soustraitance"}>{"Un membre ne traite qu'avec le mandataire"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le devis et les parts"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Total du devis accepté (€)"}</span>
            <input id={"montantTotal"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["montantTotal"] ?? "")} onChange={(event) => setValue("montantTotal", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"En euros entiers, le total que le client a accepté."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ce que montre le devis"}</span>
            <select id={"repartitionDevis"} className={fieldClass} value={String(values["repartitionDevis"] ?? "")} onChange={(event) => setValue("repartitionDevis", event.target.value)}>
              <option value={"parMembre"}>{"Les prestations et le montant de chaque membre"}</option>
              <option value={"totalSeul"}>{"Un total, sans dire qui fait quoi"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Part du membre A, le mandataire (€)"}</span>
            <input id={"partA"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["partA"] ?? "")} onChange={(event) => setValue("partA", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Part du membre B (€)"}</span>
            <input id={"partB"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["partB"] ?? "")} onChange={(event) => setValue("partB", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Part du membre C (€)"}</span>
            <input id={"partC"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["partC"] ?? "")} onChange={(event) => setValue("partC", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Part du membre D (€)"}</span>
            <input id={"partD"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["partD"] ?? "")} onChange={(event) => setValue("partD", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si le groupement n'a que trois membres."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Entre les membres"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Frais communs (€)"}</span>
            <input id={"fraisCommuns"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["fraisCommuns"] ?? "")} onChange={(event) => setValue("fraisCommuns", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Plans, coordination, benne, nettoyage commun : ce que personne ne facture seul."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Clé des frais communs"}</span>
            <select id={"cleFrais"} className={fieldClass} value={String(values["cleFrais"] ?? "")} onChange={(event) => setValue("cleFrais", event.target.value)}>
              <option value={"prorata"}>{"Au prorata des parts"}</option>
              <option value={"egale"}>{"Parts égales"}</option>
              <option value={"nonPrevue"}>{"Rien de prévu"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Rémunération du mandataire (% des parts des autres)"}</span>
            <input id={"remunMandataire"} type="number" className={fieldClass} min={"0"} max={"20"} step={"0.1"} value={String(values["remunMandataire"] ?? "")} onChange={(event) => setValue("remunMandataire", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Circuit de paiement"}</span>
            <select id={"paiement"} className={fieldClass} value={String(values["paiement"] ?? "")} onChange={(event) => setValue("paiement", event.target.value)}>
              <option value={"separes"}>{"Le client paie chaque membre"}</option>
              <option value={"compteMandataire"}>{"Le client paie tout au mandataire"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Convention de groupement"}</span>
            <select id={"convention"} className={fieldClass} value={String(values["convention"] ?? "")} onChange={(event) => setValue("convention", event.target.value)}>
              <option value={"signee"}>{"Signée par tous"}</option>
              <option value={"projet"}>{"En projet"}</option>
              <option value={"aucune"}>{"Aucune"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Si un membre fait défaut"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Membre défaillant"}</span>
            <select id={"defaillant"} className={fieldClass} value={String(values["defaillant"] ?? "")} onChange={(event) => setValue("defaillant", event.target.value)}>
              <option value={"aucun"}>{"Aucun scénario"}</option>
              <option value={"A"}>{"Membre A (mandataire)"}</option>
              <option value={"B"}>{"Membre B"}</option>
              <option value={"C"}>{"Membre C"}</option>
              <option value={"D"}>{"Membre D"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Part non exécutée ou à reprendre (€)"}</span>
            <input id={"montantNonExecute"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["montantNonExecute"] ?? "")} onChange={(event) => setValue("montantNonExecute", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Plafonnée à la part du membre défaillant."}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Somme des parts"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["sommeOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Écart avec le total du devis"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["ecartOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Forme retenue face au client"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["formeOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Exposition maximale d'un autre membre"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["expoOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Rémunération du mandataire"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["remunOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Points bloquants / à compléter"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["compteurs"]?.text || "n/a"}</dd>
          </div>
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.verdict?.className || "")}>{view.verdict?.text}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La répartition par membre"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Membre"}</th>
              <th className="py-2 pr-2 font-semibold">{"Part"}</th>
              <th className="py-2 pr-2 font-semibold">{"%"}</th>
              <th className="py-2 pr-2 font-semibold">{"Frais communs"}</th>
              <th className="py-2 pr-2 font-semibold">{"Rémunération"}</th>
              <th className="py-2 pr-2 font-semibold">{"Net"}</th>
              <th className="py-2 pr-2 font-semibold">{"Exposition"}</th>
              <th className="py-2 pr-2 font-semibold">{"Perte repère"}</th>
            </tr></thead>
            <tbody>
              {(view["repartition"]?.rows || []).map((row, index) => (
                <tr key={index} className={rowClass(row.className)}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-t border-mk-border py-2 pr-2 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody></table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Exposition : ce que le client peut réclamer à ce membre pour la part non exécutée du membre défaillant. Perte repère : ce qui resterait à sa charge si le défaillant ne rembourse rien, réparti au prorata des parts des membres exposés. C'est une clé de l'outil, pas une règle légale : la convention de groupement peut en prévoir une autre."}</p>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Les articles du code de la commande publique servent ici de vocabulaire : ils s'appliquent aux marchés publics, pas aux devis entre entreprises privées. Ce n'est pas un conseil juridique."}</p>
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
