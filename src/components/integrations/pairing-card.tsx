"use client";

import { useState, useTransition } from "react";
import { createPairingCode } from "@/app/(app)/integrations/actions";

export function PairingCard({
  configuratorId,
  pluginVersion,
}: {
  configuratorId: string | null;
  pluginVersion: string;
}) {
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState<string | null>(null);

  function generate() {
    startTransition(async () => {
      const result = await createPairingCode(configuratorId);
      setCode(result.code);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3 lg:px-6">
      <div className="mr-auto min-w-0">
        <p className="text-sm font-medium text-slate-900">Plugin boutique · v{pluginVersion}</p>
        <p className="text-xs text-slate-500">
          Dans WordPress, QuoteBuilder → J’ai déjà un compte. Le catalogue WooCommerce est importé
          automatiquement ; le parcours devis s’ouvre après « Demander un devis ».
        </p>
      </div>
      <a
        href={`/api/public/plugin/wordpress/download?v=${encodeURIComponent(pluginVersion)}`}
        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        Télécharger v{pluginVersion}
      </a>
      {code ? (
        <span className="rounded-md bg-white px-3 py-1.5 font-mono text-sm font-semibold tracking-widest text-[#C2410C] ring-1 ring-orange-200">
          {code}
        </span>
      ) : null}
      <button
        type="button"
        onClick={generate}
        disabled={pending}
        className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Génération…" : code ? "Nouveau code" : "Code manuel"}
      </button>
      {code ? (
        <p className="w-full text-xs text-slate-500">
          Collez ce code uniquement si la connexion en un clic n’est pas possible. Valable 30 minutes.
        </p>
      ) : null}
    </div>
  );
}
