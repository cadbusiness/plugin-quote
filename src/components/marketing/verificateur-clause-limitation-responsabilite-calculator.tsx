/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-clause-limitation-responsabilite";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"prestataire","client":"pro","prestation":"mixte","montant":"24000","plafondType":"pct","plafondPct":"100","plafondFixe":"10000","exclusions":"indirects","fauteLourde":"silence","obligationEssentielle":"preservee","personnes":"hors","acceptation":"cgvSignees","cgvClient":"non","negociation":"adhesion","assurance":"500000","delaiMois":"12","delaiDepart":"connaissance","dommageDirect":"18000","pertesExploitation":"42000","faute":"simple"};

export function VerificateurClauseLimitationResponsabiliteCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Le devis"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"prestataire"}>{"Je suis le prestataire, je rédige la clause"}</option>
              <option value={"client"}>{"Je suis le client, je relis la clause"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le contrôle est le même ; seul le message final change de sens."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui est le client ?"}</span>
            <select id={"client"} className={fieldClass} value={String(values["client"] ?? "")} onChange={(event) => setValue("client", event.target.value)}>
              <option value={"pro"}>{"Un professionnel, qui achète pour son activité"}</option>
              <option value={"consommateur"}>{"Un particulier, consommateur"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Avec un consommateur, la clause est présumée abusive sans discussion possible (article R. 212-1, 6° du code de la consommation)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Ce que couvre le devis"}</span>
            <select id={"prestation"} className={fieldClass} value={String(values["prestation"] ?? "")} onChange={(event) => setValue("prestation", event.target.value)}>
              <option value={"service"}>{"Une prestation de service seule"}</option>
              <option value={"mixte"}>{"Fourniture d'un produit et installation"}</option>
              <option value={"vente"}>{"Vente d'un produit seul"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Dès qu'un produit est fourni, l'article 1245-14 du code civil entre en jeu."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Prix du devis (€)"}</span>
            <input id={"montant"} type="number" className={fieldClass} min={"0"} step={"100"} value={String(values["montant"] ?? "")} onChange={(event) => setValue("montant", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"En euros entiers, le montant total accepté par le client."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La clause"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Plafond de responsabilité"}</span>
            <select id={"plafondType"} className={fieldClass} value={String(values["plafondType"] ?? "")} onChange={(event) => setValue("plafondType", event.target.value)}>
              <option value={"pct"}>{"Un pourcentage du prix du devis"}</option>
              <option value={"fixe"}>{"Un montant fixe"}</option>
              <option value={"assurance"}>{"Le montant garanti par l'assurance"}</option>
              <option value={"aucun"}>{"Pas de plafond chiffré"}</option>
              <option value={"exclusionTotale"}>{"Aucune responsabilité, quel que soit le manquement"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Pourcentage (%)"}</span>
            <input id={"plafondPct"} type="number" className={fieldClass} min={"0"} max={"1000"} step={"5"} value={String(values["plafondPct"] ?? "")} onChange={(event) => setValue("plafondPct", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Utilisé si le plafond est un pourcentage."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant fixe (€)"}</span>
            <input id={"plafondFixe"} type="number" className={fieldClass} min={"0"} step={"500"} value={String(values["plafondFixe"] ?? "")} onChange={(event) => setValue("plafondFixe", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Utilisé si le plafond est un montant fixe."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Préjudices exclus"}</span>
            <select id={"exclusions"} className={fieldClass} value={String(values["exclusions"] ?? "")} onChange={(event) => setValue("exclusions", event.target.value)}>
              <option value={"liste"}>{"Une liste nommée : perte d'exploitation, de production, de chiffre d'affaires, de données"}</option>
              <option value={"indirects"}>{"La seule formule « dommages indirects exclus »"}</option>
              <option value={"aucune"}>{"Aucune exclusion"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le mot « indirect » se discute ; une liste nommée se discute beaucoup moins."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Faute lourde ou dolosive"}</span>
            <select id={"fauteLourde"} className={fieldClass} value={String(values["fauteLourde"] ?? "")} onChange={(event) => setValue("fauteLourde", event.target.value)}>
              <option value={"reserve"}>{"La clause dit qu'elle ne s'applique pas dans ce cas"}</option>
              <option value={"silence"}>{"La clause n'en parle pas"}</option>
              <option value={"couverte"}>{"La clause dit s'appliquer même dans ce cas"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"L'engagement principal du devis"}</span>
            <select id={"obligationEssentielle"} className={fieldClass} value={String(values["obligationEssentielle"] ?? "")} onChange={(event) => setValue("obligationEssentielle", event.target.value)}>
              <option value={"preservee"}>{"Son manquement reste indemnisé, dans la limite du plafond"}</option>
              <option value={"videe"}>{"La clause en exclut ou en rend symbolique la réparation"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Exemple : un délai garanti dont le retard ne coûte rien au prestataire (article 1170)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Dommages aux personnes"}</span>
            <select id={"personnes"} className={fieldClass} value={String(values["personnes"] ?? "")} onChange={(event) => setValue("personnes", event.target.value)}>
              <option value={"hors"}>{"Laissés hors plafond"}</option>
              <option value={"inclus"}>{"Plafonnés comme le reste"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Comment la clause a été acceptée"}</span>
            <select id={"acceptation"} className={fieldClass} value={String(values["acceptation"] ?? "")} onChange={(event) => setValue("acceptation", event.target.value)}>
              <option value={"signe"}>{"Écrite dans le devis signé, en conditions particulières"}</option>
              <option value={"cgvSignees"}>{"Dans des CGV remises, que le devis signé dit accepter"}</option>
              <option value={"cgvVerso"}>{"Dans des CGV au verso ou en lien, sans mention d'acceptation"}</option>
              <option value={"aucune"}>{"CGV jamais transmises au client"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1119 du code civil : connaissance et acceptation."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Les conditions d'achat du client"}</span>
            <select id={"cgvClient"} className={fieldClass} value={String(values["cgvClient"] ?? "")} onChange={(event) => setValue("cgvClient", event.target.value)}>
              <option value={"non"}>{"Pas de clause contraire"}</option>
              <option value={"contraire"}>{"Elles contiennent une clause contraire"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Clauses incompatibles : sans effet de part et d'autre."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"La clause a-t-elle été négociée ?"}</span>
            <select id={"negociation"} className={fieldClass} value={String(values["negociation"] ?? "")} onChange={(event) => setValue("negociation", event.target.value)}>
              <option value={"negociee"}>{"Oui, discutée et ajustée avec le client"}</option>
              <option value={"adhesion"}>{"Non, CGV standard non négociables"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Contrat d'adhésion : articles 1110, 1171 et 1190."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Plafond de l'assurance RC professionnelle par sinistre (€)"}</span>
            <input id={"assurance"} type="number" className={fieldClass} min={"0"} step={"10000"} value={String(values["assurance"] ?? "")} onChange={(event) => setValue("assurance", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Lisez l'attestation : c'est ce que l'assureur paie au maximum."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Délai pour agir prévu par la clause (mois)"}</span>
            <input id={"delaiMois"} type="number" className={fieldClass} min={"0"} max={"240"} step={"1"} value={String(values["delaiMois"] ?? "")} onChange={(event) => setValue("delaiMois", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si la clause ne prévoit rien : cinq ans de droit commun (article 2224)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Point de départ de ce délai"}</span>
            <select id={"delaiDepart"} className={fieldClass} value={String(values["delaiDepart"] ?? "")} onChange={(event) => setValue("delaiDepart", event.target.value)}>
              <option value={"connaissance"}>{"Le jour où le client a connu ou aurait dû connaître les faits"}</option>
              <option value={"fait"}>{"Le fait générateur ou la livraison"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Un sinistre type"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Dommage matériel direct (€)"}</span>
            <input id={"dommageDirect"} type="number" className={fieldClass} min={"0"} step={"500"} value={String(values["dommageDirect"] ?? "")} onChange={(event) => setValue("dommageDirect", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Réparation, pièces, lot détruit."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Pertes d'exploitation (€)"}</span>
            <input id={"pertesExploitation"} type="number" className={fieldClass} min={"0"} step={"500"} value={String(values["pertesExploitation"] ?? "")} onChange={(event) => setValue("pertesExploitation", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Production perdue, marge, chiffre d'affaires."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Gravité de la faute"}</span>
            <select id={"faute"} className={fieldClass} value={String(values["faute"] ?? "")} onChange={(event) => setValue("faute", event.target.value)}>
              <option value={"simple"}>{"Erreur ordinaire"}</option>
              <option value={"lourde"}>{"Faute lourde ou dolosive établie"}</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le verdict"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Plafond"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["plafond"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"À payer avec la clause"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["indemnisation"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Exposition sans la clause"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["exposition"]?.text || "n/a"}</dd>
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
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le sinistre type, chiffré"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Étape"}</th>
              <th className="py-2 pr-2 font-semibold">{"Montant"}</th>
            </tr></thead>
            <tbody>
              {(view["sinistre"]?.rows || []).map((row, index) => (
                <tr key={index} className={rowClass(row.className)}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-t border-mk-border py-2 pr-2 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody></table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Montants réclamés, pas montants prouvés. Le juge ne retient que ce que le client démontre, et seulement les suites immédiates et directes du manquement (article 1231-4)."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La clause rédigée"}</h2>
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
