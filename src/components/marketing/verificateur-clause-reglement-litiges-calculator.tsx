/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { renderView } from "@/lib/marketing/verificateur-clause-reglement-litiges";

const fieldClass =
  "mt-2 w-full rounded-xl bg-[#fffdf9] px-3 py-2.5 text-base ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const INITIAL = {"role":"prestataire","qualiteP":"societe","qualiteC":"societe","etranger":"non","arbitrage":"non","tribunal":"vague","presentation":"noyee","acceptation":"signee","amiable":"vague","tiers":"aucun","frais":"silence","delaiJours":"0","dateNotification":"2027-03-15","reciprocite":"reciproque","exclusionImpayes":"non","urgence":"non"};

export function VerificateurClauseReglementLitigesCalculator() {
  const [values, setValues] = useState(INITIAL);
  const view = useMemo(() => renderView(values), [values]);
  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-base font-semibold">{"Les parties"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Votre position"}</span>
            <select id={"role"} className={fieldClass} value={String(values["role"] ?? "")} onChange={(event) => setValue("role", event.target.value)}>
              <option value={"prestataire"}>{"Je suis le prestataire, je rédige la clause"}</option>
              <option value={"client"}>{"Je suis le client, je relis la clause"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le prestataire est"}</span>
            <select id={"qualiteP"} className={fieldClass} value={String(values["qualiteP"] ?? "")} onChange={(event) => setValue("qualiteP", event.target.value)}>
              <option value={"societe"}>{"Une société commerciale (SAS, SARL, SA, SNC)"}</option>
              <option value={"commercant"}>{"Un commerçant en entreprise individuelle"}</option>
              <option value={"artisan"}>{"Un artisan en entreprise individuelle"}</option>
              <option value={"liberal"}>{"Une profession libérale"}</option>
              <option value={"association"}>{"Une association"}</option>
              <option value={"civile"}>{"Une société civile"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article L210-1 du code de commerce pour les sociétés."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Le client est"}</span>
            <select id={"qualiteC"} className={fieldClass} value={String(values["qualiteC"] ?? "")} onChange={(event) => setValue("qualiteC", event.target.value)}>
              <option value={"societe"}>{"Une société commerciale (SAS, SARL, SA, SNC)"}</option>
              <option value={"commercant"}>{"Un commerçant en entreprise individuelle"}</option>
              <option value={"artisan"}>{"Un artisan en entreprise individuelle"}</option>
              <option value={"liberal"}>{"Une profession libérale"}</option>
              <option value={"association"}>{"Une association"}</option>
              <option value={"civile"}>{"Une société civile"}</option>
              <option value={"particulier"}>{"Un particulier, hors activité professionnelle"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Où est établi le client ?"}</span>
            <select id={"etranger"} className={fieldClass} value={String(values["etranger"] ?? "")} onChange={(event) => setValue("etranger", event.target.value)}>
              <option value={"non"}>{"En France"}</option>
              <option value={"ue"}>{"Dans un autre État de l'Union européenne"}</option>
              <option value={"horsUe"}>{"Hors de l'Union européenne"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Dans l'Union : règlement (UE) n° 1215/2012, article 25."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Une clause d'arbitrage est-elle prévue ?"}</span>
            <select id={"arbitrage"} className={fieldClass} value={String(values["arbitrage"] ?? "")} onChange={(event) => setValue("arbitrage", event.target.value)}>
              <option value={"non"}>{"Non, les litiges vont devant un tribunal"}</option>
              <option value={"oui"}>{"Oui, les litiges vont devant un arbitre"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 2061 du code civil et L721-3 du code de commerce."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"Le tribunal"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Le tribunal choisi"}</span>
            <select id={"tribunal"} className={fieldClass} value={String(values["tribunal"] ?? "")} onChange={(event) => setValue("tribunal", event.target.value)}>
              <option value={"precis"}>{"Un tribunal nommé (« tribunal de commerce de [ville] »)"}</option>
              <option value={"vague"}>{"Une formule vague (« tribunal du siège du prestataire »)"}</option>
              <option value={"aucun"}>{"Aucun tribunal choisi"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Sans clause : articles 42 et 46 du code de procédure civile."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Où figure la clause"}</span>
            <select id={"presentation"} className={fieldClass} value={String(values["presentation"] ?? "")} onChange={(event) => setValue("presentation", event.target.value)}>
              <option value={"signature"}>{"Rappelée sur le devis, près de la signature du client"}</option>
              <option value={"titre"}>{"Dans un article titré, en caractères distincts"}</option>
              <option value={"noyee"}>{"Dans les CGV, même police que le reste, sans titre"}</option>
              <option value={"facture"}>{"Seulement sur la facture"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Typographie et présentation : Cass. com., 20 avril 2017, n° 15-20.908."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Comment les CGV ont été acceptées"}</span>
            <select id={"acceptation"} className={fieldClass} value={String(values["acceptation"] ?? "")} onChange={(event) => setValue("acceptation", event.target.value)}>
              <option value={"signee"}>{"Jointes au devis signé, qui dit les accepter"}</option>
              <option value={"lien"}>{"Par un lien, sans mention d'acceptation"}</option>
              <option value={"aucune"}>{"Jamais transmises au client"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1119 du code civil."}</p>
          </div>
        </div>
        <h2 className="mt-6 text-base font-semibold">{"L'étape amiable"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="">
            <span className="text-sm font-medium">{"Ce que prévoit la clause"}</span>
            <select id={"amiable"} className={fieldClass} value={String(values["amiable"] ?? "")} onChange={(event) => setValue("amiable", event.target.value)}>
              <option value={"aucune"}>{"Rien : on peut aller directement au tribunal"}</option>
              <option value={"vague"}>{"Une formule vague (« les parties s'efforceront de régler à l'amiable »)"}</option>
              <option value={"precise"}>{"Une procédure écrite : notification, tiers, délai"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Cass. com., 29 avril 2014, n° 12-27.004 et 30 mai 2018, n° 16-26.403."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Avec quel tiers"}</span>
            <select id={"tiers"} className={fieldClass} value={String(values["tiers"] ?? "")} onChange={(event) => setValue("tiers", event.target.value)}>
              <option value={"mediateur"}>{"Un médiateur ou un centre de médiation"}</option>
              <option value={"conciliateur"}>{"Un conciliateur de justice"}</option>
              <option value={"dirigeants"}>{"Une réunion entre dirigeants, sans tiers"}</option>
              <option value={"aucun"}>{"Rien n'est précisé"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1530 : un processus avec l'aide d'un tiers."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Les frais du médiateur"}</span>
            <select id={"frais"} className={fieldClass} value={String(values["frais"] ?? "")} onChange={(event) => setValue("frais", event.target.value)}>
              <option value={"partages"}>{"Partagés, la clause le dit"}</option>
              <option value={"silence"}>{"La clause n'en dit rien"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Durée de l'étape amiable (jours)"}</span>
            <input id={"delaiJours"} type="number" className={fieldClass} min={"0"} max={"365"} step={"1"} value={String(values["delaiJours"] ?? "")} onChange={(event) => setValue("delaiJours", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"0 si la clause ne fixe aucune durée."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Date de la notification du différend"}</span>
            <input id={"dateNotification"} type="date" className={fieldClass} value={String(values["dateNotification"] ?? "")} onChange={(event) => setValue("dateNotification", event.target.value)} />
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Pour calculer la date de saisine possible."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Qui doit passer par l'étape amiable ?"}</span>
            <select id={"reciprocite"} className={fieldClass} value={String(values["reciprocite"] ?? "")} onChange={(event) => setValue("reciprocite", event.target.value)}>
              <option value={"reciproque"}>{"Les deux parties"}</option>
              <option value={"clientSeul"}>{"Le client seulement"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Contrat d'adhésion : article 1171 du code civil."}</p>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"Les factures non contestées sont-elles exclues ?"}</span>
            <select id={"exclusionImpayes"} className={fieldClass} value={String(values["exclusionImpayes"] ?? "")} onChange={(event) => setValue("exclusionImpayes", event.target.value)}>
              <option value={"oui"}>{"Oui, leur recouvrement ne passe pas par l'étape amiable"}</option>
              <option value={"non"}>{"Non, la clause vise tout différend"}</option>
            </select>
          </div>
          <div className="">
            <span className="text-sm font-medium">{"L'urgence est-elle réservée ?"}</span>
            <select id={"urgence"} className={fieldClass} value={String(values["urgence"] ?? "")} onChange={(event) => setValue("urgence", event.target.value)}>
              <option value={"oui"}>{"Oui, référés et mesures conservatoires restent possibles"}</option>
              <option value={"non"}>{"Non, la clause n'en dit rien"}</option>
            </select>
            <p className="mt-1 text-[12px] leading-5 text-mk-faint">{"Article 1537 du code de procédure civile, depuis le 1er septembre 2025."}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}</p>
      </form>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"Le verdict"}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-mk-muted">{"Clause de tribunal"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["tribunalOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Saisine du juge possible"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["saisineOut"]?.text || "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-mk-muted">{"Étape amiable"}</dt>
            <dd className="text-lg font-semibold tabular-nums text-mk-accent">{view["amiableOut"]?.text || "n/a"}</dd>
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
        <p className="mt-3 text-[13px] leading-5 text-mk-faint">{"Les repères de quinze et quatre-vingt-dix jours sont ceux de l'outil, pas des seuils légaux. La date de saisine est calculée en jours calendaires à partir de la notification, sans tenir compte des jours fériés ni d'une prorogation."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-base font-semibold">{"La clause rédigée"}</h2>
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
