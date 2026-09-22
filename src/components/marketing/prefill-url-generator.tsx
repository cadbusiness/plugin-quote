"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import { buildPrefillUrl } from "@/lib/marketing/prefill-url";

export function PrefillUrlGenerator() {
  const [baseUrl, setBaseUrl] = useState("https://www.quotebuilder.co/c/quickly/rayonnage");
  const [besoin, setBesoin] = useState("");
  const [add, setAdd] = useState("");
  const [product, setProduct] = useState("");

  const result = useMemo(
    () => buildPrefillUrl({ baseUrl, besoin, add, product }),
    [baseUrl, besoin, add, product],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">URL de base</legend>
          <label className="mt-4 block">
            <span className="text-sm font-semibold">Funnel public ou embed</span>
            <input
              type="url"
              value={baseUrl}
              autoComplete="off"
              onChange={(event) => setBaseUrl(event.target.value)}
              className="mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40"
            />
          </label>
          <p className="mt-3 text-[12px] leading-5 text-mk-faint">
            Exemple : /c/:org/:slug ou /embed/:org/:slug. Une query déjà présente est retirée, puis
            reconstruite à partir des tokens ci-dessous.
          </p>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">Paramètres</legend>
          <TokenField
            label="Tokens besoin (chips, séparés par virgule)"
            hint="Value ou label de chip. Casse et accents ignorés côté funnel. Tokens inconnus ignorés."
            value={besoin}
            placeholder="rayonnages, cantilever"
            onChange={setBesoin}
            multiline
          />
          <TokenField
            label="Tokens add (chips ou SKU / id / nom exact)"
            hint="Chip si le token matche un choix. Sinon produit catalogue (quantité 1 + note). Le match chip gagne sur le produit."
            value={add}
            placeholder="SKU-RAY-200"
            onChange={setAdd}
            multiline
          />
          <TokenField
            label="Token product (optionnel, alias d’un add)"
            hint="Utile si vos liens boutique génèrent déjà ?product=."
            value={product}
            placeholder=""
            onChange={setProduct}
          />
        </fieldset>
      </form>

      <div className="rounded-2xl bg-mk-dark p-5 text-mk-on-dark sm:p-6" aria-live="polite">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent">Résultat</p>
        <OutputBlock label="URL complète" text={result.url} copyLabel="Copier l’URL" />
        <OutputBlock
          label="Query string seule"
          text={result.query || "(vide)"}
          copyLabel="Copier la query"
          copyText={result.query}
        />
        <OutputBlock label="Shortcode WordPress (exemple)" text={result.shortcode} copyLabel="Copier le shortcode" />
        <p className="mt-3 text-[12px] leading-5 text-mk-on-dark/50">
          Placez ce shortcode sur une page dont l’URL porte la query. Le widget recopie la query de
          la page hôte dans l’iframe.
        </p>
        <p className="mt-6 text-sm leading-6 text-mk-on-dark/75">{result.tip}</p>
        <p className="mt-3 text-xs leading-5 text-mk-on-dark/45">
          Union avec la session en cours, pas de remplacement. Session déjà soumise : inchangée.
          Aucune donnée n’est envoyée.
        </p>
      </div>
    </div>
  );
}

function TokenField({
  label,
  hint,
  value,
  placeholder,
  onChange,
  multiline,
}: {
  label: string;
  hint: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const className =
    "mt-2 w-full rounded-xl bg-mk-bg px-3 py-2.5 text-sm ring-1 ring-mk-border focus:outline-none focus:ring-2 focus:ring-mk-accent/40";
  return (
    <label className="mt-4 block first:mt-4">
      <span className="text-sm font-semibold">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          rows={2}
          onChange={(event) => onChange(event.target.value)}
          className={`${className} resize-y font-mono text-[13px] leading-5`}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
          className={className}
        />
      )}
      <p className="mt-2 text-[12px] leading-5 text-mk-faint">{hint}</p>
    </label>
  );
}

function OutputBlock({
  label,
  text,
  copyLabel,
  copyText,
}: {
  label: string;
  text: string;
  copyLabel: string;
  copyText?: string;
}) {
  const payload = copyText ?? text;
  return (
    <div className="mt-5 border-t border-white/10 pt-5 first:mt-4 first:border-0 first:pt-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mk-on-dark/50">{label}</p>
      <p className="mt-2 break-all font-mono text-[13px] leading-5 text-mk-on-dark">{text}</p>
      {payload ? (
        <div className="mt-3">
          <CopyButton text={payload} label={copyLabel} />
        </div>
      ) : null}
    </div>
  );
}
