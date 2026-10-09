"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  SIGNATURE_DEFAULT_BODY,
  SIGNATURE_DEFAULT_RECEIVED,
  SIGNATURE_DEFAULT_SECRET,
  SIGNATURE_HEADER,
  buildRecap,
  describe,
  formatBodySummary,
  hints,
  verifySignature,
  type SignatureResult,
} from "@/lib/marketing/verificateur-signature-webhook-devis";

const fieldClass =
  "mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";

const alertClass: Record<string, string> = {
  ok: "bg-emerald-50 text-emerald-900",
  bad: "bg-rose-50 text-rose-900",
  warn: "bg-amber-50 text-amber-950",
  neutral: "bg-mk-accent-soft text-mk-ink",
};

export function VerificateurSignatureWebhookDevisCalculator() {
  const [body, setBody] = useState(SIGNATURE_DEFAULT_BODY);
  const [secret, setSecret] = useState(SIGNATURE_DEFAULT_SECRET);
  const [received, setReceived] = useState(SIGNATURE_DEFAULT_RECEIVED);
  const [result, setResult] = useState<SignatureResult | null>(null);
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void verifySignature({ body, secret, received }).then((next) => {
      if (!cancelled) {
        setResult(next);
        setDraft(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [body, secret, received]);

  const status = result ? describe(result) : null;
  const tip = result ? hints(result) : [];
  const recap = result && status ? (draft ?? buildRecap(result, status.text)) : "";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-sm font-semibold">Requête reçue</h2>
        <label className="mt-4 block">
          <span className="text-sm font-semibold">Corps brut de la requête (JSON)</span>
          <textarea
            className={`${fieldClass} min-h-52 font-mono text-[13px]`}
            spellCheck={false}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
            L&apos;exemple est fictif et simplifié. Collez le corps tel que votre serveur l&apos;a reçu, octet pour
            octet, avant tout parsing : un JSON réindenté ne donne plus la même signature.
          </span>
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-semibold">Secret HMAC du webhook</span>
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            className={`${fieldClass} font-mono text-[13px]`}
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
          />
          <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
            Celui saisi dans « Secret HMAC » à l&apos;ajout du webhook (menu Support, puis « API &amp; webhooks »). Le
            récap ne le recopie jamais.
          </span>
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-semibold">En-tête {SIGNATURE_HEADER} reçu</span>
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            className={`${fieldClass} font-mono text-[13px]`}
            value={received}
            onChange={(event) => setReceived(event.target.value)}
          />
          <span className="mt-1 block text-[12px] leading-5 text-mk-faint">
            64 caractères hexadécimaux. Laissez vide pour seulement calculer la signature attendue.
          </span>
        </label>
      </form>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <h2 className="text-sm font-semibold">Résultat</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-mk-faint">Signature calculée (HMAC SHA-256, hexadécimal)</dt>
            <dd className="mt-1 break-all font-mono text-[13px] text-mk-accent">{result?.computed || "-"}</dd>
          </div>
          <div className="border-t border-mk-border pt-3">
            <dt className="text-mk-faint">Signature reçue (normalisée)</dt>
            <dd className="mt-1 break-all font-mono text-[13px] text-mk-accent">{result?.received || "-"}</dd>
          </div>
          <div className="border-t border-mk-border pt-3">
            <dt className="text-mk-faint">Corps analysé</dt>
            <dd className="mt-1 font-mono text-[13px] text-mk-accent">{result ? formatBodySummary(result) : "-"}</dd>
          </div>
        </dl>
        {status ? (
          <p className={`mt-4 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass[status.cls] ?? alertClass.neutral}`}>
            {status.text}
          </p>
        ) : null}
        {tip.length ? (
          <p className="mt-3 whitespace-pre-line rounded-xl bg-mk-accent-soft px-3 py-3 text-sm leading-6">{tip.join("\n")}</p>
        ) : null}
        <p className="mt-3 text-xs leading-5 text-mk-faint">
          Outil de diagnostic, calcul local dans votre navigateur (Web Crypto). Aucune donnée n&apos;est envoyée ni
          conservée. Aucune valeur n&apos;est inventée : tout vient de ce que vous collez. Le résultat dit seulement si
          ce corps, ce secret et cet en-tête correspondent ; il ne garantit pas la sécurité de votre récepteur. Côté
          QuoteBuilder, l&apos;événement envoyé est « quote.submitted », en POST, en JSON, avec une seule tentative par
          webhook actif : un envoi en échec n&apos;est pas renvoyé automatiquement.
        </p>
        <div className="mt-4">
          <CopyButton text={recap} label="Copier le récap" />
        </div>
        <label className="mt-4 block">
          <span className="text-[12px] leading-5 text-mk-faint">
            Texte récap / checklist (modifiable avant copie, sans le secret)
          </span>
          <textarea
            className={`${fieldClass} min-h-72 font-mono text-[13px]`}
            value={recap}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
      </section>
    </div>
  );
}
