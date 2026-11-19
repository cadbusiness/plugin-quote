/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-accord-confidentialite-nda";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"divulgateur","sens":"unilateral","moment":"avant","dateSignature":"2026-11-05","brevet":"oui","echantillons":"oui","definition":"categories","oral":"silence","exclusions":"completes","finalite":"limitee","retro":"interdite","destinataires":"besoin","dureeAns":"5","vieAns":"8","survie":"oui","restitution":"silence","licence":"silence","sanction":"penale","penalite":"20000","etranger":"non","juridiction":"prevue"};

export function VerificateurAccordConfidentialiteNdaCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"La situation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"divulgateur"}>{"Je transmets mes informations pour obtenir un devis"}</option>
              <option value={"destinataire"}>{"Je reçois les informations et je dois chiffrer"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le contrôle est le même ; certains points pèsent plus d'un côté que de l'autre."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Sens de l'accord"}</span>
            <select id={"sens"} className={fieldClass} value={String(values["sens"] ?? "")} onChange={(event) => setValue("sens", event.target.value)}>
              <option value={"unilateral"}>{"Unilatéral : seules les informations du client sont protégées"}</option>
              <option value={"mutuel"}>{"Mutuel : les informations des deux parties sont protégées"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Quand l'accord est-il signé ?"}</span>
            <select id={"moment"} className={fieldClass} value={String(values["moment"] ?? "")} onChange={(event) => setValue("moment", event.target.value)}>
              <option value={"avant"}>{"Avant tout envoi de plans, fichiers ou échantillons"}</option>
              <option value={"apres"}>{"Après un premier envoi de fichiers"}</option>
              <option value={"nonSigne"}>{"Pas encore signé"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Avant la signature, seuls l'article 1112-2 du code civil et le secret des affaires protègent, et tout est à prouver."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de signature (ou prévue)"}</span>
            <input id={"dateSignature"} type="date" className={fieldClass} value={String(values["dateSignature"] ?? "")} onChange={(event) => setValue("dateSignature", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sert à calculer la fin de l'obligation de confidentialité."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Une invention non encore déposée est-elle en jeu ?"}</span>
            <select id={"brevet"} className={fieldClass} value={String(values["brevet"] ?? "")} onChange={(event) => setValue("brevet", event.target.value)}>
              <option value={"oui"}>{"Oui, un brevet est envisagé"}</option>
              <option value={"non"}>{"Non"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Une divulgation avant le dépôt peut détruire la nouveauté (INPI)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Un échantillon ou un prototype est-il confié ?"}</span>
            <select id={"echantillons"} className={fieldClass} value={String(values["echantillons"] ?? "")} onChange={(event) => setValue("echantillons", event.target.value)}>
              <option value={"oui"}>{"Oui"}</option>
              <option value={"non"}>{"Non, seulement des documents et des fichiers"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Démonter ou tester un objet détenu de façon licite est permis, sauf clause contraire (article L151-3 du code de commerce)."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Ce que l'accord protège"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Définition des informations confidentielles"}</span>
            <select id={"definition"} className={fieldClass} value={String(values["definition"] ?? "")} onChange={(event) => setValue("definition", event.target.value)}>
              <option value={"categories"}>{"Une liste de catégories, plus les documents marqués « Confidentiel »"}</option>
              <option value={"large"}>{"« Toute information échangée », sans autre précision"}</option>
              <option value={"aucune"}>{"Aucune définition"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Informations données à l'oral"}</span>
            <select id={"oral"} className={fieldClass} value={String(values["oral"] ?? "")} onChange={(event) => setValue("oral", event.target.value)}>
              <option value={"confirme"}>{"Confidentielles si identifiées et confirmées par écrit"}</option>
              <option value={"silence"}>{"L'accord n'en parle pas"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Exclusions"}</span>
            <select id={"exclusions"} className={fieldClass} value={String(values["exclusions"] ?? "")} onChange={(event) => setValue("exclusions", event.target.value)}>
              <option value={"completes"}>{"Les quatre : public, déjà connu, reçu d'un tiers, développé seul"}</option>
              <option value={"partielles"}>{"Une partie seulement"}</option>
              <option value={"aucune"}>{"Aucune exclusion"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sans elles, un fournisseur ne peut pas raisonnablement signer."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Finalité"}</span>
            <select id={"finalite"} className={fieldClass} value={String(values["finalite"] ?? "")} onChange={(event) => setValue("finalite", event.target.value)}>
              <option value={"limitee"}>{"Usage limité à l'étude de la demande et au devis"}</option>
              <option value={"absente"}>{"L'accord interdit seulement de divulguer"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"L'article L151-5 vise l'obligation de ne pas divulguer ou de limiter l'utilisation."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Rétro-ingénierie des échantillons"}</span>
            <select id={"retro"} className={fieldClass} value={String(values["retro"] ?? "")} onChange={(event) => setValue("retro", event.target.value)}>
              <option value={"interdite"}>{"Interdite, hors mesures utiles au devis"}</option>
              <option value={"silence"}>{"L'accord n'en parle pas"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui peut recevoir les informations"}</span>
            <select id={"destinataires"} className={fieldClass} value={String(values["destinataires"] ?? "")} onChange={(event) => setValue("destinataires", event.target.value)}>
              <option value={"besoin"}>{"Ceux qui en ont besoin pour le devis, sous-traitants acceptés par écrit"}</option>
              <option value={"libre"}>{"Toute personne de l'entreprise et ses partenaires"}</option>
              <option value={"silence"}>{"L'accord n'en parle pas"}</option>
            </select>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Durée, fin et sanction"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Durée de l'obligation (années)"}</span>
            <input id={"dureeAns"} type="number" className={fieldClass} min={"0"} max={"50"} step={"1"} value={String(values["dureeAns"] ?? "")} onChange={(event) => setValue("dureeAns", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si l'accord dit « sans limite de durée » ou ne dit rien."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Combien de temps l'information garde sa valeur (années)"}</span>
            <input id={"vieAns"} type="number" className={fieldClass} min={"1"} max={"50"} step={"1"} value={String(values["vieAns"] ?? "")} onChange={(event) => setValue("vieAns", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Votre estimation : un prix cible vieillit vite, un plan beaucoup moins."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Après la fin des discussions"}</span>
            <select id={"survie"} className={fieldClass} value={String(values["survie"] ?? "")} onChange={(event) => setValue("survie", event.target.value)}>
              <option value={"oui"}>{"L'obligation continue, quelle que soit l'issue"}</option>
              <option value={"non"}>{"L'accord prend fin avec les discussions"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Restitution ou destruction"}</span>
            <select id={"restitution"} className={fieldClass} value={String(values["restitution"] ?? "")} onChange={(event) => setValue("restitution", event.target.value)}>
              <option value={"prevue"}>{"Prévue, avec confirmation écrite"}</option>
              <option value={"silence"}>{"L'accord n'en parle pas"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Droits sur les informations"}</span>
            <select id={"licence"} className={fieldClass} value={String(values["licence"] ?? "")} onChange={(event) => setValue("licence", event.target.value)}>
              <option value={"exclue"}>{"Aucune licence, aucune obligation de contracter"}</option>
              <option value={"silence"}>{"L'accord n'en parle pas"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Sanction d'un manquement"}</span>
            <select id={"sanction"} className={fieldClass} value={String(values["sanction"] ?? "")} onChange={(event) => setValue("sanction", event.target.value)}>
              <option value={"penale"}>{"Une clause pénale, montant fixé à l'avance"}</option>
              <option value={"droitCommun"}>{"Le droit commun : préjudice à prouver"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le préjudice reste à prouver sans clause pénale (Cass. com., 7 mai 2019, n° 18-11.128)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Montant de la pénalité (€)"}</span>
            <input id={"penalite"} type="number" className={fieldClass} min={"0"} step={"1000"} value={String(values["penalite"] ?? "")} onChange={(event) => setValue("penalite", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Le juge peut la modérer si elle est manifestement excessive (article 1231-5 du code civil)."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"L'autre partie est-elle établie à l'étranger ?"}</span>
            <select id={"etranger"} className={fieldClass} value={String(values["etranger"] ?? "")} onChange={(event) => setValue("etranger", event.target.value)}>
              <option value={"non"}>{"Non, en France"}</option>
              <option value={"oui"}>{"Oui"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Droit applicable et tribunal"}</span>
            <select id={"juridiction"} className={fieldClass} value={String(values["juridiction"] ?? "")} onChange={(event) => setValue("juridiction", event.target.value)}>
              <option value={"prevue"}>{"Prévus dans l'accord"}</option>
              <option value={"silence"}>{"L'accord n'en parle pas"}</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le verdict"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Fin de l'obligation"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["fin"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Écart avec la vie de l'information"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["ecart"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Sanction prévue"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["sanctionOut"]?.text || "n/a"}</dd>
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
        <h2 className="text-base font-semibold">{"Les clauses rédigées"}</h2>
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
