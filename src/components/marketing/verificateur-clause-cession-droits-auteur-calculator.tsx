/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-clause-cession-droits-auteur";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"oeuvre":"photo","nbOeuvres":"40","auteur":"independant","garantieAgence":false,"artisteAuteur":true,"ecrit":"signe","repro":true,"repres":true,"adapt":false,"modifs":true,"futures":false,"sup_web":true,"sup_reseaux":true,"sup_print":true,"sup_salon":false,"sup_affichage":false,"sup_presse":false,"sup_packaging":false,"sup_tv":false,"tousSupports":false,"destination":"institutionnelle","territoire":"monde","dureeMode":"annees","duree":"5","dateDebut":"2026-10-30","montantPrestation":"1800","montantCession":"600","remuneration":"forfait","forfaitCas":"aucun","nom":"rien","exclusivite":"nonprecisee","souscession":"besoin","image":"nonautorisees"};

export function VerificateurClauseCessionDroitsAuteurCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Les œuvres et leur auteur"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Ce qui est livré"}</span>
            <select id={"oeuvre"} className={fieldClass} value={String(values["oeuvre"] ?? "")} onChange={(event) => setValue("oeuvre", event.target.value)}>
              <option value={"photo"}>{"Photographies"}</option>
              <option value={"video"}>{"Vidéos"}</option>
              <option value={"graphisme"}>{"Créations graphiques (logo, illustrations)"}</option>
              <option value={"texte"}>{"Textes"}</option>
              <option value={"logiciel"}>{"Logiciel"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Nombre de fichiers livrés"}</span>
            <input id={"nbOeuvres"} type="number" className={fieldClass} min={"1"} step={"1"} value={String(values["nbOeuvres"] ?? "")} onChange={(event) => setValue("nbOeuvres", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui les a créés"}</span>
            <select id={"auteur"} className={fieldClass} value={String(values["auteur"] ?? "")} onChange={(event) => setValue("auteur", event.target.value)}>
              <option value={"independant"}>{"Un indépendant (photographe, graphiste, vidéaste)"}</option>
              <option value={"agence"}>{"Une agence ou un studio (auteurs salariés ou pigistes)"}</option>
              <option value={"salarie"}>{"Un salarié de votre entreprise"}</option>
              <option value={"inconnu"}>{"On ne sait pas"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"La commande et le paiement ne transfèrent pas les droits (CPI, article L111-1, alinéa 3)."}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["garantieAgence"]} onChange={(event) => setValue("garantieAgence", event.target.checked)} />
              <span>{"L'agence garantit par écrit détenir les droits de ses auteurs"}</span>
            </label>
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["artisteAuteur"]} onChange={(event) => setValue("artisteAuteur", event.target.checked)} />
              <span>{"L'auteur est artiste-auteur, payé en droits d'auteur"}</span>
            </label>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Où la cession est écrite"}</span>
            <select id={"ecrit"} className={fieldClass} value={String(values["ecrit"] ?? "")} onChange={(event) => setValue("ecrit", event.target.value)}>
              <option value={"signe"}>{"Dans le devis ou le contrat signé"}</option>
              <option value={"cgv"}>{"Seulement dans des conditions générales jointes"}</option>
              <option value={"email"}>{"Dans des e-mails échangés"}</option>
              <option value={"oral"}>{"Rien d'écrit"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Les contrats qui transmettent des droits d'auteur doivent être constatés par écrit (article L131-2)."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Les droits et le domaine"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["repro"]} onChange={(event) => setValue("repro", event.target.checked)} />
              <span>{"Droit de reproduction (copier, imprimer)"}</span>
            </label>
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["repres"]} onChange={(event) => setValue("repres", event.target.checked)} />
              <span>{"Droit de représentation (diffuser, mettre en ligne)"}</span>
            </label>
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["adapt"]} onChange={(event) => setValue("adapt", event.target.checked)} />
              <span>{"Droit d'adaptation (recadrer, retoucher, modifier)"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["modifs"]} onChange={(event) => setValue("modifs", event.target.checked)} />
              <span>{"Le client prévoit de recadrer, retoucher ou ajouter du texte"}</span>
            </label>
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["futures"]} onChange={(event) => setValue("futures", event.target.checked)} />
              <span>{"La clause cède aussi les œuvres futures de l'auteur"}</span>
            </label>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Supports prévus"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["sup_web"]} onChange={(event) => setValue("sup_web", event.target.checked)} />
              <span>{"Site internet"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["sup_reseaux"]} onChange={(event) => setValue("sup_reseaux", event.target.checked)} />
              <span>{"Réseaux sociaux"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["sup_print"]} onChange={(event) => setValue("sup_print", event.target.checked)} />
              <span>{"Imprimés (catalogue, plaquette, fiche produit)"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["sup_salon"]} onChange={(event) => setValue("sup_salon", event.target.checked)} />
              <span>{"Stand et documents de salon"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["sup_affichage"]} onChange={(event) => setValue("sup_affichage", event.target.checked)} />
              <span>{"Affichage"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["sup_presse"]} onChange={(event) => setValue("sup_presse", event.target.checked)} />
              <span>{"Annonces presse"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["sup_packaging"]} onChange={(event) => setValue("sup_packaging", event.target.checked)} />
              <span>{"Emballages et étiquettes"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["sup_tv"]} onChange={(event) => setValue("sup_tv", event.target.checked)} />
              <span>{"Télévision et cinéma"}</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm leading-5">
              <input type="checkbox" className="mt-1" checked={!!values["tousSupports"]} onChange={(event) => setValue("tousSupports", event.target.checked)} />
              <span>{"La clause dit « tous supports, connus et inconnus »"}</span>
            </label>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Destination"}</span>
            <select id={"destination"} className={fieldClass} value={String(values["destination"] ?? "")} onChange={(event) => setValue("destination", event.target.value)}>
              <option value={"institutionnelle"}>{"Communication de l'entreprise (site, plaquette, réseaux), hors publicité achetée"}</option>
              <option value={"publicite"}>{"Campagne publicitaire (achat d'espace, affichage, annonces)"}</option>
              <option value={"edition"}>{"Édition d'un ouvrage ou d'un catalogue vendu"}</option>
              <option value={"interne"}>{"Usage interne seulement"}</option>
              <option value={"nonprecisee"}>{"Non précisée"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Territoire"}</span>
            <select id={"territoire"} className={fieldClass} value={String(values["territoire"] ?? "")} onChange={(event) => setValue("territoire", event.target.value)}>
              <option value={"france"}>{"France"}</option>
              <option value={"ue"}>{"Union européenne"}</option>
              <option value={"monde"}>{"Monde entier"}</option>
              <option value={"nonprecise"}>{"Non précisé"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Durée"}</span>
            <select id={"dureeMode"} className={fieldClass} value={String(values["dureeMode"] ?? "")} onChange={(event) => setValue("dureeMode", event.target.value)}>
              <option value={"annees"}>{"Un nombre d'années"}</option>
              <option value={"legale"}>{"Toute la durée légale des droits"}</option>
              <option value={"nonprecisee"}>{"Non précisée"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Nombre d'années"}</span>
            <input id={"duree"} type="number" className={fieldClass} min={"1"} max={"99"} step={"1"} value={String(values["duree"] ?? "")} onChange={(event) => setValue("duree", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Départ de la cession (livraison des fichiers)"}</span>
            <input id={"dateDebut"} type="date" className={fieldClass} value={String(values["dateDebut"] ?? "")} onChange={(event) => setValue("dateDebut", event.target.value)} />
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"La rémunération"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Prix de la prestation (prise de vue, montage, création), en €"}</span>
            <input id={"montantPrestation"} type="number" className={fieldClass} min={"0"} step={"50"} value={String(values["montantPrestation"] ?? "")} onChange={(event) => setValue("montantPrestation", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Prix de la cession des droits, en €"}</span>
            <input id={"montantCession"} type="number" className={fieldClass} min={"0"} step={"50"} value={String(values["montantCession"] ?? "")} onChange={(event) => setValue("montantCession", event.target.value)} />
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Forme de la rémunération"}</span>
            <select id={"remuneration"} className={fieldClass} value={String(values["remuneration"] ?? "")} onChange={(event) => setValue("remuneration", event.target.value)}>
              <option value={"forfait"}>{"Un forfait"}</option>
              <option value={"proportionnelle"}>{"Un pourcentage des recettes"}</option>
              <option value={"incluse"}>{"Comprise dans le prix, sans montant à part"}</option>
              <option value={"gratuite"}>{"Cession gratuite"}</option>
              <option value={"nonprecisee"}>{"Non précisée"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Motif du forfait écrit dans la clause"}</span>
            <select id={"forfaitCas"} className={fieldClass} value={String(values["forfaitCas"] ?? "")} onChange={(event) => setValue("forfaitCas", event.target.value)}>
              <option value={"aucun"}>{"Pas de motif écrit"}</option>
              <option value={"1"}>{"La base de calcul proportionnelle ne peut pas être déterminée (1°)"}</option>
              <option value={"2"}>{"Les moyens de contrôle font défaut (2°)"}</option>
              <option value={"3"}>{"Les frais de calcul seraient hors de proportion (3°)"}</option>
              <option value={"4"}>{"La contribution de l'auteur est accessoire (4°)"}</option>
              <option value={"5"}>{"Logiciel (5°)"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"L'article L131-4 pose la règle d'une rémunération proportionnelle et liste les cas où le forfait est permis."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Ce qu'on oublie souvent"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Nom de l'auteur"}</span>
            <select id={"nom"} className={fieldClass} value={String(values["nom"] ?? "")} onChange={(event) => setValue("nom", event.target.value)}>
              <option value={"rien"}>{"Rien de prévu"}</option>
              <option value={"oui"}>{"Crédit prévu (« Photo : Prénom Nom »)"}</option>
              <option value={"renonce"}>{"L'auteur accepte par écrit de ne pas être cité sur certains supports"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Exclusivité"}</span>
            <select id={"exclusivite"} className={fieldClass} value={String(values["exclusivite"] ?? "")} onChange={(event) => setValue("exclusivite", event.target.value)}>
              <option value={"nonprecisee"}>{"Non précisée"}</option>
              <option value={"exclusive"}>{"Exclusive"}</option>
              <option value={"nonexclusive"}>{"Non exclusive"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le client transmettra-t-il les fichiers à des tiers (distributeurs, filiales, agence) ?"}</span>
            <select id={"souscession"} className={fieldClass} value={String(values["souscession"] ?? "")} onChange={(event) => setValue("souscession", event.target.value)}>
              <option value={"besoin"}>{"Oui, mais la clause ne le prévoit pas"}</option>
              <option value={"prevue"}>{"Oui, et la clause le prévoit"}</option>
              <option value={"nonbesoin"}>{"Non"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Des personnes sont-elles reconnaissables ?"}</span>
            <select id={"image"} className={fieldClass} value={String(values["image"] ?? "")} onChange={(event) => setValue("image", event.target.value)}>
              <option value={"nonautorisees"}>{"Oui, autorisations pas encore signées"}</option>
              <option value={"autorisees"}>{"Oui, autorisations écrites signées"}</option>
              <option value={"aucune"}>{"Non, personne de reconnaissable"}</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le résultat"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Points conformes"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["nbOk"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"À compléter"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["nbWarn"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Bloquants"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["nbBad"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Cession · part du total"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["part"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Cession par an"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["parAn"]?.text || "n/a"}</dd>
          </div>
        </dl>
        <p className={"mt-4 rounded-xl px-4 py-3 text-sm " + alertClass(view.verdict?.className || "")}>{view.verdict?.text}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Point par point"}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead><tr className="text-left text-mk-muted">
              <th className="py-2 pr-2 font-semibold">{"Point"}</th>
              <th className="py-2 pr-2 font-semibold">{"Statut"}</th>
              <th className="py-2 pr-2 font-semibold">{"Pourquoi"}</th>
            </tr></thead>
            <tbody>
              {(view["resultats"]?.rows || []).map((row, index) => (
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
        <h2 className="text-base font-semibold">{"Points d'attention"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["alertes"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Ce qu'il faut faire"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-mk-ink">
          {(view["actions"]?.items || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La clause, avec les trous à combler"}</h2>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#fffdf9] p-3 text-sm leading-6 ring-1 ring-mk-border">{view["clause"]?.text}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={view["clause"]?.text || ""} />
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le message à l'autre partie"}</h2>
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
