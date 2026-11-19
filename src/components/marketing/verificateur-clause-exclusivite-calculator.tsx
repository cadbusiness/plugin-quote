/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-clause-exclusivite";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {
  sens: "achat_exclusif",
  objet: "biens",
  typeDuree: "tacite",
  dureeMois: "144",
  dateDebut: "2027-01-04",
  finPremier: "",
  perimetre: "famille",
  partAchats: "100",
  postMois: "24",
  postCadre: "large",
  pdmFournisseur: "3",
  pdmAcheteur: "2",
  concurrents: "non",
  marque: "non",
  dip: "non_remis",
  contrepartie: "investissement",
  sortie: "aucune",
  penalite: "lourde",
};

export function VerificateurClauseExclusiviteCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"La clause"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-sm font-medium">{"Qui s'engage"}</span>
            <select id="sens" className={fieldClass} value={String(values.sens ?? "")} onChange={(event) => setValue("sens", event.target.value)}>
              <option value="achat_exclusif">{"Le client s'engage à n'acheter qu'à vous (achat exclusif)"}</option>
              <option value="fourniture_exclusive">{"Vous vous engagez à ne fournir que ce client (fourniture exclusive)"}</option>
              <option value="reciproque">{"Les deux s'engagent (exclusivité réciproque)"}</option>
            </select>
          </div>
          <div>
            <span className="text-sm font-medium">{"Sur quoi porte l'exclusivité"}</span>
            <select id="objet" className={fieldClass} value={String(values.objet ?? "")} onChange={(event) => setValue("objet", event.target.value)}>
              <option value="biens">{"Des biens (produits, pièces, matériel)"}</option>
              <option value="services">{"Des services seulement"}</option>
              <option value="mixte">{"Des biens et des services (fourniture et pose, maintenance)"}</option>
            </select>
          </div>
          <div>
            <span className="text-sm font-medium">{"Durée de l'exclusivité"}</span>
            <select id="typeDuree" className={fieldClass} value={String(values.typeDuree ?? "")} onChange={(event) => setValue("typeDuree", event.target.value)}>
              <option value="determinee">{"Durée fixe, sans reconduction"}</option>
              <option value="tacite">{"Durée fixe, reconduite tacitement"}</option>
              <option value="indeterminee">{"Sans terme (durée indéterminée)"}</option>
            </select>
          </div>
          <div>
            <span className="text-sm font-medium">{"Durée prévue (mois)"}</span>
            <input id="dureeMois" type="number" className={fieldClass} min="0" max="600" step="1" value={String(values.dureeMois ?? "")} onChange={(event) => setValue("dureeMois", event.target.value)} />
            <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">{"Durée initiale, hors reconductions. 0 si aucune durée n'est écrite."}</p>
          </div>
          <div>
            <span className="text-sm font-medium">{"Début de l'exclusivité"}</span>
            <input id="dateDebut" type="date" className={fieldClass} value={String(values.dateDebut ?? "")} onChange={(event) => setValue("dateDebut", event.target.value)} />
          </div>
          <div>
            <span className="text-sm font-medium">{"Fin d'une exclusivité antérieure sur les mêmes biens (facultatif)"}</span>
            <input id="finPremier" type="date" className={fieldClass} value={String(values.finPremier ?? "")} onChange={(event) => setValue("finPremier", event.target.value)} />
            <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">{"Si un premier contrat entre les mêmes parties prévoyait déjà une exclusivité sur le même genre de biens."}</p>
          </div>
          <div>
            <span className="text-sm font-medium">{"Ce que couvre l'exclusivité"}</span>
            <select id="perimetre" className={fieldClass} value={String(values.perimetre ?? "")} onChange={(event) => setValue("perimetre", event.target.value)}>
              <option value="liste">{"Des références listées"}</option>
              <option value="famille">{"Une famille de produits ou de services définie"}</option>
              <option value="similaires">{"« Produits identiques ou similaires », sans liste"}</option>
              <option value="tout">{"Toute l'activité"}</option>
            </select>
          </div>
          <div>
            <span className="text-sm font-medium">{"Part des besoins de l'acheteur couverte (%)"}</span>
            <input id="partAchats" type="number" className={fieldClass} min="0" max="100" step="1" value={String(values.partAchats ?? "")} onChange={(event) => setValue("partAchats", event.target.value)} />
            <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">{"Pour un achat exclusif : 100 % si tout doit être acheté chez vous."}</p>
          </div>
          <div>
            <span className="text-sm font-medium">{"Interdiction après la fin du contrat (mois)"}</span>
            <input id="postMois" type="number" className={fieldClass} min="0" max="120" step="1" value={String(values.postMois ?? "")} onChange={(event) => setValue("postMois", event.target.value)} />
          </div>
          <div>
            <span className="text-sm font-medium">{"Portée de cette interdiction"}</span>
            <select id="postCadre" className={fieldClass} value={String(values.postCadre ?? "")} onChange={(event) => setValue("postCadre", event.target.value)}>
              <option value="locaux_savoirfaire">{"Limitée aux locaux utilisés et nécessaire pour protéger un savoir-faire transmis"}</option>
              <option value="large">{"Large (tout achat ou toute vente de produits concurrents)"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le marché"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-sm font-medium">{"Part de marché du fournisseur (%)"}</span>
            <input id="pdmFournisseur" type="number" className={fieldClass} min="0" max="100" step="0.5" value={String(values.pdmFournisseur ?? "")} onChange={(event) => setValue("pdmFournisseur", event.target.value)} />
            <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">{"Sur le marché où il vend ces produits, l'année civile précédente. Une estimation suffit."}</p>
          </div>
          <div>
            <span className="text-sm font-medium">{"Part de marché de l'acheteur (%)"}</span>
            <input id="pdmAcheteur" type="number" className={fieldClass} min="0" max="100" step="0.5" value={String(values.pdmAcheteur ?? "")} onChange={(event) => setValue("pdmAcheteur", event.target.value)} />
            <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">{"Sur le marché où il achète ces produits."}</p>
          </div>
          <div>
            <span className="text-sm font-medium">{"Les deux entreprises sont-elles concurrentes ?"}</span>
            <select id="concurrents" className={fieldClass} value={String(values.concurrents ?? "")} onChange={(event) => setValue("concurrents", event.target.value)}>
              <option value="non">{"Non (fournisseur et client)"}</option>
              <option value="oui">{"Oui, sur ces produits"}</option>
            </select>
          </div>
          <div>
            <span className="text-sm font-medium">{"Une marque, une enseigne ou un nom commercial est-il mis à disposition ?"}</span>
            <select id="marque" className={fieldClass} value={String(values.marque ?? "")} onChange={(event) => setValue("marque", event.target.value)}>
              <option value="non">{"Non"}</option>
              <option value="oui">{"Oui, pour l'activité de l'autre partie"}</option>
            </select>
          </div>
          <div>
            <span className="text-sm font-medium">{"Document d'information précontractuelle"}</span>
            <select id="dip" className={fieldClass} value={String(values.dip ?? "")} onChange={(event) => setValue("dip", event.target.value)}>
              <option value="non_remis">{"Pas remis"}</option>
              <option value="tardif">{"Remis moins de vingt jours avant la signature"}</option>
              <option value="remis_20j">{"Remis vingt jours ou plus avant la signature"}</option>
            </select>
            <p className="mt-1.5 text-[13px] leading-5 text-mk-faint">{"Utile seulement si une marque ou une enseigne est mise à disposition."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les contreparties et la sortie"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-sm font-medium">{"Ce que la partie engagée obtient en échange"}</span>
            <select id="contrepartie" className={fieldClass} value={String(values.contrepartie ?? "")} onChange={(event) => setValue("contrepartie", event.target.value)}>
              <option value="aucune">{"Rien de précis"}</option>
              <option value="prix">{"Un prix ou une remise réservés"}</option>
              <option value="volume">{"Un volume de commandes garanti"}</option>
              <option value="investissement">{"Un investissement (matériel prêté, outillage, formation)"}</option>
            </select>
          </div>
          <div>
            <span className="text-sm font-medium">{"Sortie avant le terme"}</span>
            <select id="sortie" className={fieldClass} value={String(values.sortie ?? "")} onChange={(event) => setValue("sortie", event.target.value)}>
              <option value="aucune">{"Aucune"}</option>
              <option value="preavis">{"Résiliation avec préavis écrit"}</option>
              <option value="objectifs">{"Fin de l'exclusivité si les engagements ne sont pas tenus"}</option>
            </select>
          </div>
          <div>
            <span className="text-sm font-medium">{"Sanction en cas de rupture ou de manquement"}</span>
            <select id="penalite" className={fieldClass} value={String(values.penalite ?? "")} onChange={(event) => setValue("penalite", event.target.value)}>
              <option value="aucune">{"Aucune"}</option>
              <option value="chiffree">{"Somme chiffrée et liée à un coût réel (matériel non amorti, outillage)"}</option>
              <option value="lourde">{"Somme forfaitaire lourde (tous les achats restant à courir, par exemple)"}</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Une PME de Romans-sur-Isère qui fabrique des produits de nettoyage et de désinfection pour l'agroalimentaire prépare le lundi 16 novembre 2026 un devis pour une conserverie de Bourg-lès-Valence : six centrales de dosage prêtées, mises en service le lundi 4 janvier 2027, contre l'achat exclusif de tous les produits de nettoyage et de désinfection pendant douze ans, reconductible par périodes de trois ans, avec une interdiction d'acheter ailleurs pendant deux ans après la fin et une pénalité égale à tous les achats restant à courir. Les parts de marché de 3 % et 2 % sont des hypothèses."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Fin prévue de l'exclusivité"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view.finOut?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Durée prévue"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view.dureeOut?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Plafond de dix ans (article L330-1)"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view.limiteOut?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Seuil de cinq ans (règlement 2022/720)"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view.cinqOut?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Points bloquants / à revoir"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view.compteurs?.text || "n/a"}</dd>
          </div>
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.verdict?.className || "")}>{view.verdict?.text}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le contrôle point par point"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-left text-mk-muted">
                <th className="py-2 pr-2 font-semibold">{"Point"}</th>
                <th className="py-2 pr-2 font-semibold">{"Statut"}</th>
                <th className="py-2 pr-2 font-semibold">{"Ce que cela veut dire"}</th>
              </tr>
            </thead>
            <tbody>
              {(view.controles?.rows || []).map((row, index) => (
                <tr key={index} className={rowClass(row.className)}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-t border-mk-border py-2 pr-2 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Articles L330-1, L330-2, L330-3, L420-2, L442-1 et L464-6-1 du code de commerce, articles 1171, 1210, 1211 et 1231-5 du code civil, règlement (UE) 2022/720 (articles 1er, 2, 3 et 5) et communication de minimis de 2014, lus dans leur version en vigueur le 19 novembre 2026. Les dates sont calculées en mois civils, la fin tombant la veille du même quantième. Les seuils de parts de marché supposent des estimations honnêtes du marché en cause. L'outil ne traite ni la franchise en détail, ni les clauses d'exclusivité des salariés, ni les marchés publics, ni le droit étranger. Ce n'est pas un conseil juridique."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La clause à coller dans le devis"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view.clause?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view.clause?.text || ""} />
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Ce qu'il faut faire"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view.actions?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le message à envoyer à l'autre partie"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view.message?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view.message?.text || ""} />
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Récapitulatif"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view.recapOut?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view.recapOut?.text || ""} />
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
