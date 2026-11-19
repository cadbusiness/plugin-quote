/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-mention-dechets-devis-travaux";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"typeTravaux":"renovation","pemd":"non","statut":"morale","dateDevis":"2026-11-18","pointCollecte":"complet","affichageCout":"ligne","qPlatre":"3.2","qInertes":"0.8","qBois":"0.6","qMetal":"0.4","qMelange":"0.5","qDangereux":"0","prixTrie":"110","prixMelange":"190","prixDangereux":"0","forfaitTransport":"360","heuresTri":"6","tauxHoraire":"45"};

export function VerificateurMentionDechetsDevisTravauxCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Le chantier et le devis"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Type de travaux"}</span>
            <select id={"typeTravaux"} className={fieldClass} value={String(values["typeTravaux"] ?? "")} onChange={(event) => setValue("typeTravaux", event.target.value)}>
              <option value={"construction"}>{"Construction de bâtiment"}</option>
              <option value={"renovation"}>{"Rénovation de bâtiment"}</option>
              <option value={"demolition"}>{"Démolition de bâtiment"}</option>
              <option value={"jardinage"}>{"Jardinage, espaces verts"}</option>
              <option value={"travaux_publics"}>{"Travaux publics hors bâtiment (voirie, réseaux)"}</option>
              <option value={"fabrication"}>{"Fabrication ou fourniture sans pose sur un bâtiment"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Opération soumise au diagnostic PEMD"}</span>
            <select id={"pemd"} className={fieldClass} value={String(values["pemd"] ?? "")} onChange={(event) => setValue("pemd", event.target.value)}>
              <option value={"non"}>{"Non"}</option>
              <option value={"oui"}>{"Oui"}</option>
              <option value={"inconnu"}>{"Je ne sais pas"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Démolition ou rénovation significative de plus de 1 000 m² de plancher, ou bâtiment ayant accueilli des substances dangereuses (article R126-8 du code de la construction)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Votre entreprise"}</span>
            <select id={"statut"} className={fieldClass} value={String(values["statut"] ?? "")} onChange={(event) => setValue("statut", event.target.value)}>
              <option value={"morale"}>{"Personne morale (société)"}</option>
              <option value={"physique"}>{"Personne physique (entreprise individuelle)"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date du devis"}</span>
            <input id={"dateDevis"} type="date" className={fieldClass} value={String(values["dateDevis"] ?? "")} onChange={(event) => setValue("dateDevis", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Point de collecte écrit au devis"}</span>
            <select id={"pointCollecte"} className={fieldClass} value={String(values["pointCollecte"] ?? "")} onChange={(event) => setValue("pointCollecte", event.target.value)}>
              <option value={"complet"}>{"Raison sociale, adresse et type d'installation"}</option>
              <option value={"partiel"}>{"Nom seul ou incomplet"}</option>
              <option value={"aucun"}>{"Rien"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Coût des déchets dans le devis"}</span>
            <select id={"affichageCout"} className={fieldClass} value={String(values["affichageCout"] ?? "")} onChange={(event) => setValue("affichageCout", event.target.value)}>
              <option value={"ligne"}>{"Ligne chiffrée à part"}</option>
              <option value={"inclus_montant"}>{"Compris dans une ligne, montant écrit"}</option>
              <option value={"inclus"}>{"Compris dans le prix, sans montant"}</option>
              <option value={"absent"}>{"Rien sur les déchets"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les quantités estimées (tonnes)"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Plâtre (t)"}</span>
            <input id={"qPlatre"} type="number" className={fieldClass} min={"0"} step={"0.1"} value={String(values["qPlatre"] ?? "")} onChange={(event) => setValue("qPlatre", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Fraction minérale : béton, briques, tuiles, céramiques, pierres (t)"}</span>
            <input id={"qInertes"} type="number" className={fieldClass} min={"0"} step={"0.1"} value={String(values["qInertes"] ?? "")} onChange={(event) => setValue("qInertes", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Bois (t)"}</span>
            <input id={"qBois"} type="number" className={fieldClass} min={"0"} step={"0.1"} value={String(values["qBois"] ?? "")} onChange={(event) => setValue("qBois", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Jardinage : les déchets verts évacués peuvent se saisir ici ou en mélange."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Métal (t)"}</span>
            <input id={"qMetal"} type="number" className={fieldClass} min={"0"} step={"0.1"} value={String(values["qMetal"] ?? "")} onChange={(event) => setValue("qMetal", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Déchets en mélange (t)"}</span>
            <input id={"qMelange"} type="number" className={fieldClass} min={"0"} step={"0.1"} value={String(values["qMelange"] ?? "")} onChange={(event) => setValue("qMelange", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Déchets dangereux (t)"}</span>
            <input id={"qDangereux"} type="number" className={fieldClass} min={"0"} step={"0.1"} value={String(values["qDangereux"] ?? "")} onChange={(event) => setValue("qDangereux", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Peintures, solvants, bois traités dangereux. L'amiante suit une procédure à part."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Vos prix (hors taxes)"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Traitement des flux triés (€ par tonne)"}</span>
            <input id={"prixTrie"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["prixTrie"] ?? "")} onChange={(event) => setValue("prixTrie", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Traitement du mélange (€ par tonne)"}</span>
            <input id={"prixMelange"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["prixMelange"] ?? "")} onChange={(event) => setValue("prixMelange", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Traitement des déchets dangereux (€ par tonne)"}</span>
            <input id={"prixDangereux"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["prixDangereux"] ?? "")} onChange={(event) => setValue("prixDangereux", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Transport et contenants (€)"}</span>
            <input id={"forfaitTransport"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["forfaitTransport"] ?? "")} onChange={(event) => setValue("forfaitTransport", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Location de bennes ou de big bags, rotations, trajets."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Tri et chargement (heures)"}</span>
            <input id={"heuresTri"} type="number" className={fieldClass} min={"0"} step={"0.5"} value={String(values["heuresTri"] ?? "")} onChange={(event) => setValue("heuresTri", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Déboursé horaire (€ par heure)"}</span>
            <input id={"tauxHoraire"} type="number" className={fieldClass} min={"0"} step={"1"} value={String(values["tauxHoraire"] ?? "")} onChange={(event) => setValue("tauxHoraire", event.target.value)} />
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel. Une entreprise de plâtrerie près de Tours chiffre le mercredi 18 novembre 2026 le réaménagement d'un plateau de bureaux de 420 m² : dépose de cloisons, de faux plafonds et d'un carrelage. Les prix sont ceux de son collecteur, en hypothèse d'exemple : l'outil ne connaît aucun tarif."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Champ de l'obligation"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["champOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Quantité totale estimée"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["quantiteOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Coût estimé de la gestion des déchets"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["coutOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Traitement"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["traitementOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Transport et contenants"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["transportOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Tri et chargement"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["triOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Articles L541-2, L541-21-2, L541-21-2-3, D541-45-1, R541-45 et D543-281 du code de l'environnement et article R126-8 du code de la construction et de l'habitation, lus dans leur version en vigueur le 18 novembre 2026. Décret n° 2020-1817 du 29 décembre 2020, en vigueur depuis le 1er juillet 2021. L'outil ne dit pas si votre opération est soumise au diagnostic PEMD : il vous le demande. Il ne traite pas l'amiante au-delà d'un avertissement. Ce n'est pas un conseil juridique."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La ligne déchets à coller dans le devis"}</h2>
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
        <h2 className="text-base font-semibold">{"Le message à envoyer au client"}</h2>
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
